package main

import (
	"./common/setup"
	"./common/socket"
	"./common/util"
	"./domains"
	"./domains/account"
	"./domains/auth"
	"./domains/image"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/jwtauth"
	"github.com/swaggo/http-swagger"
	"gorm.io/gorm"
	"net/http"
	"os"
	"path"
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
}

func main() {
	env := setup.NewEnv(setup.PromptApplicationMode())
	env.LoadEnvVariablesFromCMDLine()

	logger := util.NewApiLoggerImpl(env.LogLevel)
	env.PrintEnvVars(logger)
	//portString := fmt.Sprintf(":%d", env.APIHttpPort)
	router := router(logger, env.GetDB(), env)
	err := http.ListenAndServe(":1001", router)
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

	authC := auth.NewAuthController(resUtil, tokenAuth, authServ, accServ)
	accC := account.NewAccountController(resUtil, accServ)
	imgC := image.NewImageController(env, resUtil)
	router := chi.NewRouter()
	setup.AllowCORS(router)
	currentDir, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	webSocketRouter := socket.NewWebSocketRouter()
	peerC := domains.NewAuthController()
	webSocketRouter.RegisterRoute("peer-connect", peerC.ConnectPeers)


	router.Get("/ws", webSocketRouter.WebSocketEndpoint)
	router.Post("/ws", webSocketRouter.WebSocketEndpoint)

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

			//note create accounts is in public route.
			protectedR.Get("/accounts/{id}", accC.GetAccount)
			protectedR.Put("/accounts/password", accC.ChangePassword)

			protectedR.Post("/images", imgC.UploadImage)

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

			publicR.Post("/accounts", accC.CreateAccount)
			publicR.Get("/", func(w http.ResponseWriter, r *http.Request) {
				_, _ = w.Write([]byte("welcome anonymous"))
			})
		})
	})
	return router
}