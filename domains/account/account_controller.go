package account

import (
	"../../common/util"
	"encoding/json"
	"errors"
	"github.com/go-chi/chi"
	"github.com/go-chi/jwtauth"
	"net/http"
	"strconv"
)

type accountController struct {
	resUtil util.ResponseUtil
	serv    *AccountService
}

func NewAccountController(u util.ResponseUtil, serv *AccountService) *accountController {
	return &accountController{
		resUtil: u,
		serv:    serv,
	}
}

// @Security ApiKeyAuth
// @Summary Gets an account details
// @Tags UserAccounts
// @Description Gets an account details
// @Accept  json
// @Produce  json
// @Param id path int true "id"
// @Success 200
// @Failure 400
// @Router /accounts/{id} [get]
func (c *accountController) GetAccount(w http.ResponseWriter, r *http.Request) {
	accID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}

	acc, err := c.serv.GetAccountByID(uint(accID))
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}

	c.resUtil.RespondOKWithData(w, r, acc)
}


// @Security ApiKeyAuth
// @Summary Deletes an account
// @Tags UserAccounts
// @Description Deletes an account
// @Accept  json
// @Produce  json
// @Param id path int true "id"
// @Success 200
// @Failure 400
// @Router /accounts/{id} [delete]
func (c *accountController) DeleteAccount(w http.ResponseWriter, r *http.Request) {
	accID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}

	err = c.serv.DeleteAccountByID(uint(accID))
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}

	c.resUtil.RespondOKWithData(w, r, "account was deleted")
}

// @Security ApiKeyAuth
// @Summary Gets all account details
// @Tags UserAccounts
// @Description Gets all account details
// @Accept  json
// @Produce  json
// @Success 200
// @Failure 400
// @Router /accounts [get]
func (c *accountController) GetAllAccounts(w http.ResponseWriter, r *http.Request) {
	accounts, err := c.serv.GetAllAccounts()
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}

	c.resUtil.RespondOKWithData(w, r, accounts)
}

// @Security ApiKeyAuth
// @Summary Updates all account details. Note that this end point does not change password
// @Tags UserAccounts
// @Description Updates all account details. Note that this end point does not change password
// @Accept  json
// @Produce  json
// @Param account body AccountArrayReq AccountArrayReq "AccountArrayReq"
// @Success 200
// @Failure 400
// @Router /accounts [put]
func (c *accountController) UpdateAllAccounts(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var req AccountArrayReq
	err := decoder.Decode(&req)
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}

	accounts, err := c.serv.UpdateUsers(req.Accounts)
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}

	c.resUtil.RespondOKWithData(w, r, accounts)
}


// @Security ApiKeyAuth
// @Summary Updates account's password. Identifies user by the auth token.
// @Tags UserAccounts
// @Description Updates account's password. Identifies user by the auth token.
// @Accept  json
// @Produce  json
// @Param account body AccountChangePasswordReq AccountChangePasswordReq "AccountChangePasswordReq"
// @Success 200
// @Failure 400
// @Router /accounts/password [put]
func (c *accountController) ChangePassword(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var req AccountChangePasswordReq
	err := decoder.Decode(&req)
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}

	_, claims, _ := jwtauth.FromContext(r.Context())
	if claims["id"] == nil {
		c.resUtil.RespondBadRequest(w, r, errors.New("invalid auth token. failed to identify user"))
		return
	}

	acc, err := c.serv.GetAccountByUserIDIncludingPassword(claims["id"].(string))
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}

	if !util.ComparePwdHashWithPwd(acc.PWD, req.OldPassword) {
		c.resUtil.RespondBadRequest(w, r, errors.New("invalid old password"))
		return
	}

	acc.PWD, err = util.GetEncryptedPassword(req.NewPassword)
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}

	err = c.serv.UpdateUserIncludingPassword(acc)
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}

	c.resUtil.RespondOKWithData(w, r, "user was updated")
}

// @Summary Create a new user account with UserID and Password
// @Tags UserAccounts
// @Description Create a new user account with UserID and Password
// @Accept  json
// @Produce  json
// @Param account body AccountCredentials AccountCredentials "AccountCredentials"
// @Success 200
// @Failure 400
// @Router /accounts [post]
func (c *accountController) CreateAccount(w http.ResponseWriter, r *http.Request) {
	decoder := json.NewDecoder(r.Body)
	var req AccountCredentials
	err := decoder.Decode(&req)
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}

	if req.UserID == "" {
		c.resUtil.RespondBadRequest(w, r, errors.New("user id cannot be blank"))
		return
	}
	if req.PWD == "" {
		c.resUtil.RespondBadRequest(w, r, errors.New("password cannot be blank"))
		return
	}

	acc, err := c.serv.CreateAccount(req.UserID, req.PWD)
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}

	c.resUtil.RespondOKWithData(w, r, acc)
}

// @Security ApiKeyAuth
// @Summary Update an account details. Note that this end point does not change password
// @Tags UserAccounts
// @Description Update an account details. Note that this end point does not change password
// @Accept  json
// @Produce  json
// @Param account body Account Account "Account"
// @Success 200
// @Failure 400
// @Router /accounts/{id} [put]
func (c *accountController) UpdateAccount(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}

	decoder := json.NewDecoder(r.Body)
	var req Account
	err = decoder.Decode(&req)
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}

	account, err := c.serv.UpdateUser(req, id)
	if err != nil {
		c.resUtil.RespondBadRequest(w, r, err)
		return
	}

	c.resUtil.RespondOKWithData(w, r, account)
}