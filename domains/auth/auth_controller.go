package auth

import (
	"../../common/util"
	"../account"
	"encoding/json"
	"errors"
	"github.com/go-chi/jwtauth"
	"net/http"
)

type AuthControllerImpl struct {
	resUtil   util.ResponseUtil
	tokenAuth *jwtauth.JWTAuth
	serv      *AuthService
	accServ   *account.AccountService
}

func NewAuthController(u util.ResponseUtil, tokenAuth *jwtauth.JWTAuth, hAuth *AuthService, accServ *account.AccountService) *AuthControllerImpl {
	return &AuthControllerImpl{
		resUtil:   u,
		tokenAuth: tokenAuth,
		serv:      hAuth,
		accServ:   accServ,
	}
}

// @Summary Exchange password and userID with security token.
// @Tags Auth
// @Description get token by userID and password
// @Accept  json
// @Produce  json
// @Param account body account.AccountCredentials true "AccountCredentials"
// @Success 200
// @Failure 400
// @Router /auth/token [post]
func (c *AuthControllerImpl) GetAuthToken(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var req account.AccountCredentials
	err := decoder.Decode(&req)
	if err != nil || req.UserID == "" {
		c.resUtil.RespondBadRequest(w, r, errors.New("name and password must be passed in"))
		return
	}

	authenticated, err := c.serv.AuthenticateByUserIDAndPWD(req.UserID, req.PWD)
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}

	if authenticated == false {
		c.resUtil.RespondBadRequest(w, r, errors.New("wrong password or UserID"))
		return
	}

	user, err := c.accServ.GetAccountByUserID(req.UserID)
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}

	success, authToken, authTokenExpireTime, refreshToken, refreshTokenExpireTime, err := c.serv.GetTokensForUser(req.UserID)
	rToken := RefreshToken{RefreshToken: refreshToken, Expiration: refreshTokenExpireTime}
	if success {
		authToken := Token{AuthToken: authToken, Expiration: authTokenExpireTime, RefreshToken: rToken}
		resp := TokenWithPrivilegeTitleExposed{
			Token:          authToken,
			PrivilegeTitle: user.PrivilegeTitle,
		}
		c.resUtil.RespondOKWithData(w, r, resp)
		return
	}

	c.resUtil.RespondBadRequest(w, r, nil)
}

//@Summary Refresh tokens with refresh token
//@Tags Auth
//@Description Refresh tokens with refresh token
//@Accept  json
//@Produce  json
//@Param RefreshTokenRequest body RefreshTokenRequest true "RefreshTokenRequest"
//@Success 200
//@Failure 400
//@Router /auth/refresh [post]
func (c *AuthControllerImpl) RefreshWithRefreshToken(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var req RefreshToken
	err := decoder.Decode(&req)
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}

	_, refreshToken, refreshTokenExpiration := c.serv.ExchangeRefreshToken(req.RefreshToken)
	rToken := RefreshToken{
		RefreshToken: refreshToken,
		Expiration:   refreshTokenExpiration,
	}
	c.resUtil.RespondOKWithData(w, r, rToken)
}
