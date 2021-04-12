package image

import (
	"../../common/setup"
	"../../common/util"
	"fmt"
	"net/http"
)

type imageController struct {
	env     *setup.Env
	resUtil util.ResponseUtil
}

func NewImageController(
	env *setup.Env,
	u util.ResponseUtil) *imageController {
	return &imageController{
		env:     env,
		resUtil: u,
	}
}

// @Security ApiKeyAuth
// @Summary Uploads an image
// @Tags File
// @Description Uploads an image
// @Accept  multipart/form-data
// @Param image formData file true "image"
// @Produce  json
// @Success 200
// @Failure 400
// @Router /images [post]
func (c *imageController) UploadImage(w http.ResponseWriter, r *http.Request) {
	_ = r.ParseMultipartForm(32 << 20)
	file, handler, err := r.FormFile("image")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer file.Close()
	err = util.UploadFile(w, r, "C:\\backup", "image")
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}

	c.resUtil.RespondOKWithData(w, r, handler.Filename)
}
