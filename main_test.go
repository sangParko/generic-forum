package main
//
//import (
//	"./common/util"
//	"./common/vars"
//	"./domains/account"
//	"bytes"
//	"encoding/json"
//	"errors"
//	"fmt"
//	"github.com/jinzhu/gorm"
//	"io"
//	"io/ioutil"
//	"net/http"
//	"net/http/httptest"
//	"testing"
//)
//
//func getTestServer() *httptest.Server {
//	env := vars.NewEnv(vars.BuildTestMode)
//	dbCredentials := fmt.Sprintf("%s:%s@/%s?charset=utf8&parseTime=True&loc=Local", env.DBUser, env.DBPwd, env.DBName)
//	db, err := gorm.Open("mysql", dbCredentials)
//	if err != nil {
//		panic(err)
//	}
//
//	//defer db.Close() @todo move to a method that is run after all test cases are executed
//	logger := util.NewApiLoggerImpl(util.LogDebug)
//	return httptest.NewServer(router(logger, db, env))
//}
//
//func TestAuthTokenRequestFailsWithoutCredentials(t *testing.T) {
//	ts := getTestServer()
//	defer ts.Close()
//
//	if _, body := testHTTPReq(t, ts, "POST", "/api/auth/token", nil); body != "." {
//		var req util.ResponseObj
//		err := json.Unmarshal([]byte(body), &req)
//		if err != nil {
//			t.Error(err)
//			return
//		}
//
//		if req.Success == true {
//			t.Error(errors.New("auth request without account credentials must fail"))
//			return
//		}
//	}
//}
//
//func TestAuthTokenRequestSucceeds(t *testing.T) {
//	ts := getTestServer()
//	defer ts.Close()
//
//	credentials := account.AccountCredentials{
//		UserID: "admin",
//		PWD:    "pwd",
//	}
//	credentialsJsonStr, err := json.Marshal(credentials)
//	if err != nil {
//		t.Error(err)
//	}
//
//	reqBody := ioutil.NopCloser(bytes.NewBuffer(credentialsJsonStr))
//
//	if _, body := testHTTPReq(t, ts, "POST", "/api/auth/token", reqBody); body != "." {
//		var req util.ResponseObj
//		err := json.Unmarshal([]byte(body), &req)
//		if err != nil {
//			t.Error(err)
//			return
//		}
//
//		if req.Success == false {
//			t.Error(errors.New("auth request with correct credentials must succeed"))
//			return
//		}
//	}
//}
//
//func testHTTPReq(t *testing.T, ts *httptest.Server, method, path string, body io.Reader) (*http.Response, string) {
//	req, err := http.NewRequest(method, ts.URL+path, body)
//	if err != nil {
//		t.Fatal(err)
//		return nil, ""
//	}
//
//	resp, err := http.DefaultClient.Do(req)
//	if err != nil {
//		t.Fatal(err)
//		return nil, ""
//	}
//
//	respBody, err := ioutil.ReadAll(resp.Body)
//	if err != nil {
//		t.Fatal(err)
//		return nil, ""
//	}
//	defer resp.Body.Close()
//
//	return resp, string(respBody)
//}
