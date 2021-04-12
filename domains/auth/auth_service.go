package auth

import (
	"../account"
	"errors"
	"github.com/go-chi/jwtauth"
	"net/http"
	"time"
)

//map[string]interface{}

func authTokenExpireTime() time.Time {
	return time.Now().Add(time.Hour * 12)
}
func refreshTokenExpireTime() time.Time {
	return time.Now().Add(time.Hour * 48)
}

type AuthService struct {
	tokenAuth   *jwtauth.JWTAuth
	accountServ *account.AccountService
}

func NewAuthService(tAuth *jwtauth.JWTAuth, accountServ *account.AccountService) *AuthService {
	return &AuthService{
		tokenAuth:   tAuth,
		accountServ: accountServ,
	}
}

func (a *AuthService) AuthenticateByUserIDAndPWD(id string, pwd string) (bool, error) {
	return a.accountServ.AuthenticateByUserIDAndPWD(id, pwd)
}

func (a *AuthService) BasicAuthenticator(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		err := a.authenticateBasicLevel(w, r)
		if err != nil {
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (a *AuthService) LimitHTTPMethodsForMonitor(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		isMonitor, err := a.isMonitor(r)
		if err != nil {
			http.Error(w, err.Error(), 401)
			return
		}

		if isMonitor && r.Method != "GET"{
			http.Error(w, "only GET methods are allowed for users with monitor privilege", 401)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (a *AuthService) AdminAuthenticator(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		err := a.authenticateAdminLevel(w, r)
		if err != nil {
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (a *AuthService) authenticateBasicLevel(w http.ResponseWriter, r *http.Request) error {
	token, _, err := jwtauth.FromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), 401)
		return err
	}

	if token == nil {
		http.Error(w, http.StatusText(401)+" invalid auth token", 401)
		return err
	}

	_, claims, _ := jwtauth.FromContext(r.Context())

	//Refresh token is not allowed for authentication
	if claims["token_type"] != "auth" {
		http.Error(w, http.StatusText(401)+" not an auth token", 401)
		return errors.New("not an auth token")
	}

	return nil
}

func (a *AuthService) authenticateAdminLevel(w http.ResponseWriter, r *http.Request) error {
	_, claims, _ := jwtauth.FromContext(r.Context())
	if claims["privilege_title"] != "admin" {
		http.Error(w, http.StatusText(401)+" user privilege is not admin", 401)
		return errors.New("user privilege is not admin")
	}
	return nil
}

func (a *AuthService) isMonitor(r *http.Request) (bool, error) {
	_, claims, err := jwtauth.FromContext(r.Context())
	if err != nil {
		return false, err
	}

	if claims["privilege_title"] == "monitor" {
		return true, nil
	}

	return false, nil
}

func (a *AuthService) User(r *http.Request) (account.Account, error) {
	_, claims, err := jwtauth.FromContext(r.Context())
	if err != nil {
		return account.Account{}, err
	}

	acc, err := a.accountServ.GetAccountByUserID(claims["id"].(string))
	if err != nil {
		return account.Account{}, err
	}

	return acc, nil
}

func (a *AuthService) GetTokensForUser(userID string) (bool, string, string, string, string, error) {
	acc, err := a.accountServ.GetAccountByUserID(userID)
	if err != nil {
		return false, "", "", "", "", err
	}

	authToken, authExpireTime := a.getAuthToken(userID, acc.PrivilegeTitle)
	refToken, refTokenExpireTime := a.getRefreshToken(userID, acc.PrivilegeTitle)
	return true, authToken, authExpireTime, refToken, refTokenExpireTime, nil
}

//User id is embedded in
func (a *AuthService) getAuthToken(id string, privilegeTitle string) (string, string) {
	aTokenClaims := map[string]interface{}{"id": id, "token_type": "auth", "privilege_title": privilegeTitle}
	jwtauth.SetExpiry(aTokenClaims, authTokenExpireTime())
	_, authToken, _ := a.tokenAuth.Encode(aTokenClaims)
	return authToken, authTokenExpireTime().String()
}

func (a *AuthService) getRefreshToken(id string, privilegeTitle string) (string, string) {
	rTokenClaims := map[string]interface{}{"id": id, "token_type": "refresh", "privilege_title": privilegeTitle}
	jwtauth.SetExpiry(rTokenClaims, refreshTokenExpireTime())
	_, refreshToken, _ := a.tokenAuth.Encode(rTokenClaims)
	return refreshToken, refreshTokenExpireTime().String()
}

func (a *AuthService) ExchangeRefreshToken(tokenString string) (bool, string, string) {
	token, err := a.tokenAuth.Decode(tokenString)
	if err != nil {
		return false, err.Error(), ""
	}

	claims := token.PrivateClaims()

	if claims["token_type"] != "refresh" {
		return false, "This is not a refresh token", ""
	}

	rToken, expirationTime := a.getRefreshToken(claims["id"].(string), claims["privilege_title"].(string))

	return true, rToken, expirationTime
}

