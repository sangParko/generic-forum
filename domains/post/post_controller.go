package post

import (
	"../../common/setup"
	"../../common/util"
	"net/http"
)

type postController struct {
	env     *setup.Env
	resUtil util.ResponseUtil
}

func NewPostController(
	env *setup.Env,
	u util.ResponseUtil) *postController {
	return &postController{
		env:     env,
		resUtil: u,
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
	c.resUtil.RespondOKWithData(w, r, "")
}
