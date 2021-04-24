package image

import (
	"../../common/setup"
	"../../common/util"
	"fmt"
	"github.com/go-chi/chi"
	"net/http"
	"path/filepath"
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
	err = util.UploadFile(w, r, "C:\\backup\\images", "image")
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}

	c.resUtil.RespondOKWithData(w, r, handler.Filename)
}


// @Security ApiKeyAuth
// @Summary gets an image
// @Tags File
// @Description gets an image
// @Param fileName path string true "fileName"
// @Produce  json
// @Success 200
// @Failure 400
// @Router /images/{fileName} [get]
func (c *imageController) GetImage(w http.ResponseWriter, r *http.Request) {
	fileName := chi.URLParam(r, "fileName")
	fullFilePath := filepath.Join("C:\\backup", fileName)
	http.ServeFile(w, r, fullFilePath)
}