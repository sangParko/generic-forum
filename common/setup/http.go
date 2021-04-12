package setup

import (
	"github.com/go-chi/chi"
	"github.com/go-chi/cors"
	"net/http"
)

func AllowCORS(m *chi.Mux) {
	corsOptions := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"},
		AllowedHeaders: []string{
			"X-PINGOTHER",
			"Accept",
			"Origin",
			"X-Auth-Token",
			"Authorization",
			"Content-Type",
			"X-CSRF-Token",
			"Cache-Control",
			"Pragma",
		},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	})
	m.Use(corsOptions.Handler)
}

func ServeFrontEndPages(router *chi.Mux, buildPath string) {
	/**
	Page Views
	*/
	router.NotFound(func(w http.ResponseWriter, r *http.Request) {
		//Front-end can deal with not found pages.
		http.ServeFile(w, r, buildPath+"/index.html")
	})
	router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, buildPath+"/index.html")
	})
}
