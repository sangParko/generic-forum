package post

import (
	"../../common/util"
	"../../domains/auth"
	"encoding/json"
	"github.com/go-chi/chi"
	"github.com/pkg/errors"
	"net/http"
	"strconv"
)

type postController struct {
	resUtil  util.ResponseUtil
	serv     *PostService
	authServ *auth.AuthService
}

func NewPostController(
	u util.ResponseUtil,
	serv *PostService,
	authServ *auth.AuthService,) *postController {
	return &postController{
		serv:     serv,
		authServ: authServ,
		resUtil:  u,
	}
}

// @Security ApiKeyAuth
// @Summary Creates a post
// @Tags File
// @Description Uploads an image
// @Param Post Post file true "Post"
// @Accept  json
// @Produce  json
// @Success 200
// @Failure 400
// @Router /posts [post]
func (c *postController) CreatePost(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var req Post
	err := decoder.Decode(&req)
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}

	user, err := c.authServ.User(r)
	req.Owner = user
	post, err := c.serv.CreatePost(req)
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}

	c.resUtil.RespondOKWithData(w, r, post)
}



// @Security ApiKeyAuth
// @Summary Gets posts
// @Tags UserAccounts
// @Description Gets posts
// @Accept  json
// @Produce  json
// @Param page path int true "page"
// @Success 200
// @Failure 400
// @Router /posts/page/{page} [get]
func (c *postController) GetPosts(w http.ResponseWriter, r *http.Request) {
	page, err := strconv.Atoi(chi.URLParam(r, "page"))
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}
	if page < 1 {
		c.resUtil.RespondBadRequest(w, r, errors.New("page must be a positive number"))
		return
	}

	posts, err := c.serv.GetPosts(uint(page))
	c.resUtil.RespondOKWithData(w, r, posts)
}


// @Security ApiKeyAuth
// @Summary Gets posts
// @Tags UserAccounts
// @Description Gets posts
// @Accept  json
// @Produce  json
// @Param id path int true "id"
// @Success 200
// @Failure 400
// @Router /posts/{id} [get]
func (c *postController) GetPost(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}
	if id < 1 {
		c.resUtil.RespondBadRequest(w, r, errors.New("id must be a positive number"))
		return
	}

	posts, err := c.serv.GetPost(uint(id))
	c.resUtil.RespondOKWithData(w, r, posts)
}

