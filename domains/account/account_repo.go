package account

import (
	"../../common/util"
	"gorm.io/gorm"
)

type AccountRepo struct {
	db     *gorm.DB
	logger util.ApiLogger
}

func NewAccountRepo(db *gorm.DB, logger util.ApiLogger) *AccountRepo {
	return &AccountRepo{
		db:     db,
		logger: logger,
	}
}

func (r *AccountRepo) GetFullAccountDetailsForAuthentication(userID string) (Account, error) {
	var acc Account
	if err := r.db.Where("user_id = ?", userID).First(&acc).Error; err != nil {
		return Account{}, util.ErrWithMsg("Retrieving account by id", err)
	}

	return acc, nil
}

func (r *AccountRepo) GetAccountByIDIncludingPassword(id uint) (Account, error) {
	var acc Account
	if err := r.db.Where("id = ?", id).First(&acc).Error; err != nil {
		return Account{}, util.ErrWithMsg("Retrieving account by id", err)
	}
	return acc, nil
}

func (r *AccountRepo) GetAccountByID(id uint) (Account, error) {
	var acc Account
	if err := r.db.Where("id = ?", id).First(&acc).Error; err != nil {
		return Account{}, util.ErrWithMsg("Retrieving account by id", err)
	}
	acc.PWD = "NOT-SHOWN"
	return acc, nil
}

func (r *AccountRepo) GetAccountByUserID(userID string) (Account, error) {
	var acc Account
	if err := r.db.Where("user_id = ?", userID).First(&acc).Error; err != nil {
		return Account{}, util.ErrWithMsg("Retrieving account by userID", err)
	}
	acc.PWD = "NOT-SHOWN"
	return acc, nil
}

func (r *AccountRepo) GetAccountByUserIncludingPassword(userID string) (Account, error) {
	var acc Account
	if err := r.db.Where("user_id = ?", userID).First(&acc).Error; err != nil {
		return Account{}, util.ErrWithMsg("Retrieving account by userID", err)
	}
	return acc, nil
}

func (r *AccountRepo) GetAll() ([]Account, error) {
	var accs []Account
	if err := r.db.Find(&accs).Error; err != nil {
		return accs, util.ErrWithMsg("Retrieving all accounts", err)
	}

	var retAccs []Account
	for _, acc := range accs {
		acc.PWD = "NOT-SHOWN"
		retAccs = append(retAccs, acc)
	}
	return retAccs, nil
}

func (r *AccountRepo) Create(userID string, pwd string) (Account, error) {
	//check if same name exists.
	var acc Account
	if err := r.db.Where("user_id = ?", userID).First(&acc).Error; err != nil && err.Error() != "record not found" {
		return Account{}, err
	}
	acc = Account{
		UserID: userID,
		PWD:    pwd,
		PrivilegeTitle: "monitor", //create with the lowest privilege and only allow admins to elevate privilege
	}
	err := r.db.Create(&acc).Error
	acc.PWD = "NOT-SHOWN"
	return acc, err
}

func (r *AccountRepo) Delete(id uint) error {
	var acc Account
	if err := r.db.Where("id = ?", id).First(&acc).Unscoped().Delete(&acc).Error; err != nil {
		return err
	}
	return nil
}

func (r *AccountRepo) Save(acc *Account) error {
	if err := r.db.Save(&acc).Error; err != nil {
		return err
	}
	return nil
}