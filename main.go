package main

import (
	"./common/setup"
	"./common/util"
	"./domains/account"
	"./domains/auth"
	"./domains/image"
	"./domains/post"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/jwtauth"
	"github.com/swaggo/http-swagger"
	"golang.org/x/time/rate"
	"gorm.io/gorm"
	"log"
	"net"
	"net/http"
	"os"
	"path"
	"sync"
	"time"
)

// @title Project Starter
// @version 1.0
// @description Swagger API Document
// @description
// @description `** Note **`
// @description -------- mysql database must be running locally for this document to work.
// @description -------- the full string of the value to register is `Bearer token-string`

// @contact.name Sang Parko Support
// @contact.url https://sangparko.com/support
// @contact.email sangparko@sangparko.com

// @BasePath /api

// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name Authorization

// @x-extension-openapi {"example": "value on a json format"}

var tokenAuth *jwtauth.JWTAuth

//@todo this should probably be changed.
var signKey = "veryDifficultSecretKeyNoOneCanImagine"

func init() {
	tokenAuth = jwtauth.New("HS256", []byte(signKey), nil)
	go cleanupVisitors()
}

func main() {
	env := setup.NewEnv(setup.PromptApplicationMode())
	env.LoadEnvVariablesFromCMDLine()

	logger := util.NewApiLoggerImpl(env.LogLevel)
	env.PrintEnvVars(logger)
	//portString := fmt.Sprintf(":%d", env.APIHttpPort)
	router := router(logger, env.GetDB(), env)
	err := http.ListenAndServe(":1001", limit(router))
	//err := http.ListenAndServeTLS(
	//	":443",
	//	"/etc/letsencrypt/live/randomvoicelive.xyz/fullchain.pem",
	//	"/etc/letsencrypt/live/randomvoicelive.xyz/privkey.pem",
	//	router)
	if err != nil {
		panic(err)
	}
}

func router(loggger util.ApiLogger, db *gorm.DB, env *setup.Env) http.Handler {
	//miscellaneous utility structures
	resUtil := util.NewResponseUtilImpl(loggger)

	//Repositories offer CRUD operations with the database.
	//Controller will generally have no direct access to repositories.
	//Although this is not a hard and fast rule, please keep it as layered as possible for maximal consistency.
	accRepo := account.NewAccountRepo(db, loggger)
	accServ := account.NewAccountService(accRepo)
	authServ := auth.NewAuthService(tokenAuth, accServ)
	postServ := post.NewPostService(db)

	authC := auth.NewAuthController(resUtil, tokenAuth, authServ, accServ)
	accC := account.NewAccountController(resUtil, accServ)
	imgC := image.NewImageController(env, resUtil)
	postC := post.NewPostController(resUtil, postServ, authServ)
	router := chi.NewRouter()
	setup.AllowCORS(router)
	currentDir, err := os.Getwd()
	if err != nil {
		panic(err)
	}

	var buildPath = path.Join(currentDir, "/frontend/build")
	setup.ServeFrontEndPages(router, buildPath)

	router.Get("/favicon.ico", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, buildPath+"/favicon.ico")
	})
	router.Route("/static", func(r chi.Router) {
		r.Get("/*", func(w http.ResponseWriter, r *http.Request) {
			fullFilePath := buildPath + r.URL.Path
			http.ServeFile(w, r, fullFilePath)
		})
	})

	// http://host:{port}/apidoc/index.html renders documentation for api end points.
	router.Get("/apidoc/*", httpSwagger.Handler(
		httpSwagger.URL("/apidoc/doc.json"),
	))

	router.Route("/api", func(apiRoute chi.Router) {
		// Protected routes
		apiRoute.Group(func(protectedR chi.Router) {
			//Account for slow connection.
			protectedR.Use(middleware.Timeout(60 * time.Second))

			protectedR.NotFound(func(writer http.ResponseWriter, request *http.Request) {
				writer.WriteHeader(404)
				_, _ = writer.Write([]byte("api route is not found"))
			})

			protectedR.MethodNotAllowed(func(writer http.ResponseWriter, request *http.Request) {
				writer.WriteHeader(405)
				_, _ = writer.Write([]byte("api route does not define the requested method"))
			})

			// Seek, verify and validate JWT tokens and reject api calls if invalid
			if env.RejectUnauthorizedAPICalls {
				protectedR.Use(jwtauth.Verifier(tokenAuth))
				protectedR.Use(authServ.BasicAuthenticator)
				protectedR.Use(authServ.LimitHTTPMethodsForMonitor)
			}

			//note that create accounts is in public route.
			protectedR.Get("/accounts/{id}", accC.GetAccount)
			protectedR.Put("/accounts/password", accC.ChangePassword)

			protectedR.Post("/images", imgC.UploadImage)
			protectedR.Post("/posts", postC.CreatePost)
			protectedR.Put("/posts", postC.UpdatePost)
			protectedR.Post("/posts/{id}/reply", postC.AddReply)
			protectedR.Delete("/posts/{id}", postC.DeletePost)

			//routes that require admin privilege
			protectedR.Group(func(adminProtectedRoute chi.Router) {
				if env.RejectUnauthorizedAPICalls {
					adminProtectedRoute.Use(authServ.AdminAuthenticator)
				}
				adminProtectedRoute.Get("/accounts", accC.GetAllAccounts)
				adminProtectedRoute.Put("/accounts", accC.UpdateAllAccounts)
				adminProtectedRoute.Put("/accounts/{id}", accC.UpdateAccount)
				adminProtectedRoute.Delete("/accounts/{id}", accC.DeleteAccount)
			})
		})

		// Public routes that do not require auth token.
		apiRoute.Group(func(publicR chi.Router) {
			publicR.Route("/auth", func(authRoute chi.Router) {
				authRoute.Post("/token", authC.GetAuthToken)
				authRoute.Post("/refresh", authC.RefreshWithRefreshToken)
			})

			publicR.Get("/images/{fileName}", imgC.GetImage)
			publicR.Get("/posts/page/{page}", postC.GetPosts)
			publicR.Get("/posts/count", postC.GetPostsCount)
			publicR.Get("/posts/{id}", postC.GetPost)

			publicR.Post("/accounts", accC.CreateAccount)
			publicR.Get("/", func(w http.ResponseWriter, r *http.Request) {
				_, _ = w.Write([]byte("welcome anonymous"))
			})
		})
	})
	return router
}


// Create a custom visitor struct which holds the rate limiter for each
// visitor and the last time that the visitor was seen.
type visitor struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// Change the the map to hold values of the type visitor.
var visitors = make(map[string]*visitor)
var mu sync.Mutex

func getVisitor(ip string) *rate.Limiter {
	mu.Lock()
	defer mu.Unlock()

	v, exists := visitors[ip]
	if !exists {
		limiter := rate.NewLimiter(5, 15)
		// Include the current time when creating a new visitor.
		visitors[ip] = &visitor{limiter, time.Now()}
		return limiter
	}

	// Update the last seen time for the visitor.
	v.lastSeen = time.Now()
	return v.limiter
}

// Every minute check the map for visitors that haven't been seen for
// more than 3 minutes and delete the entries.
func cleanupVisitors() {
	for {
		time.Sleep(time.Minute)

		mu.Lock()
		for ip, v := range visitors {
			if time.Since(v.lastSeen) > 3*time.Minute {
				delete(visitors, ip)
			}
		}
		mu.Unlock()
	}
}

func limit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		identifier := r.Header.Get("Authorization")
		if identifier == "" {
			ip, _, err := net.SplitHostPort(r.RemoteAddr)
			if err != nil {
				log.Println(err.Error())
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}
			identifier = ip
		}

		limiter := getVisitor(identifier)
		if limiter.Allow() == false {
			http.Error(w, http.StatusText(429), http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}