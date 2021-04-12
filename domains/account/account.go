package account

import (
	"github.com/jinzhu/gorm"
)

type Account struct {
	gorm.Model
	UserID         string `gorm:"unique;not null;type:varchar(100);"` // set member number to unique and not null
	PWD            string
	PrivilegeTitle string `example:"monitor, manager, admin"`
}

type AccountChangePasswordReq struct {
	OldPassword string
	NewPassword string
}

type AccountArrayReq struct {
	Accounts []Account
}

type AccountCredentials struct {
	UserID string `json:"userID" example:"admin"`
	PWD    string `json:"pwd" example:"admin"`
}
