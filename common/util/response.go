package util

import (
	"bytes"
	"encoding/json"
	"github.com/go-chi/render"
	"net/http"
	"runtime/debug"
	"strings"
)

type ResponseUtil interface {
	RespondOK(w http.ResponseWriter, r *http.Request, msg string)
	RespondOKWithData(w http.ResponseWriter, r *http.Request, v interface{})
	RespondBadRequest(w http.ResponseWriter, r *http.Request, err error)
	RespondBadRequestWithoutLogging(w http.ResponseWriter, r *http.Request, err error)
}

type ResponseObj struct {
	Success bool
	Msg    string
	Data   interface{}
}

type ResponseUtilImpl struct {
	logger ApiLogger
}

func NewResponseUtilImpl(l ApiLogger) *ResponseUtilImpl {
	return &ResponseUtilImpl{
		logger: l,
	}
}

func (u *ResponseUtilImpl) RespondOK(w http.ResponseWriter, r *http.Request, msg string) {
	u.logger.Debug(msg)
	render.JSON(w, r, msg)
}

func (u *ResponseUtilImpl) RespondOKWithData(w http.ResponseWriter, r *http.Request, v interface{}) {
	u.logger.Debug(SerializedData(v))
	render.JSON(w, r, v)
}

func (u *ResponseUtilImpl) RespondBadRequest(w http.ResponseWriter, r *http.Request, err error) {
	statusCode := 400
	if strings.Contains(err.Error(), "record not found") {
		statusCode = 404
	}

	u.logger.Errorf(err)
	w.WriteHeader(statusCode)
	errMsg := err.Error()
	if u.logger.LogLevel() <= LogDebug || r.FormValue("debug") == "1" {
		errMsg += "/n" + string(debug.Stack())
	}
	render.JSON(w, r, errMsg)
}

func (u *ResponseUtilImpl) RespondBadRequestWithoutLogging(w http.ResponseWriter, r *http.Request, err error) {
	statusCode := 400
	if strings.Contains(err.Error(), "record not found") {
		statusCode = 404
	}

	w.WriteHeader(statusCode)
	errMsg := err.Error()
	if u.logger.LogLevel() <= LogDebug || r.FormValue("debug") == "1" {
		errMsg += "/n" + string(debug.Stack())
	}
	render.JSON(w, r, errMsg)
}

func SerializedData(v interface{}) string {
	buf := &bytes.Buffer{}
	enc := json.NewEncoder(buf)
	enc.SetEscapeHTML(true)
	if err := enc.Encode(v); err != nil {
		return "SerializedData(): Error serializing"
	}
	return string(buf.Bytes())
}
