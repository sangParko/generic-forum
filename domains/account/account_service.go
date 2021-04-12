package account

import (
	"../../common/util"
)

type AccountService struct {
	repo *AccountRepo
}

func NewAccountService(repo *AccountRepo) *AccountService {
	return &AccountService{
		repo: repo,
	}
}

func (s *AccountService) GetAccountByID(id uint) (Account, error) {
	return s.repo.GetAccountByID(id)
}

func (s *AccountService) GetAccountByUserID(userID string) (Account, error) {
	return s.repo.GetAccountByUserID(userID)
}

func (s *AccountService) GetAccountByUserIDIncludingPassword(userID string) (Account, error) {
	return s.repo.GetAccountByUserIncludingPassword(userID)
}

func (s *AccountService) GetAllAccounts() ([]Account, error) {
	return s.repo.GetAll()
}

/**
Note that this does not change password
*/
func (s *AccountService) UpdateUsers(accounts []Account) ([]Account, error) {
	for _, acc := range accounts {
		accOld, err := s.repo.GetAccountByIDIncludingPassword(acc.ID)
		if err != nil {
			return nil, err
		}
		acc.PWD = accOld.PWD
		err = s.repo.Save(&acc)
		if err != nil {
			return nil, err
		}
	}

	return accounts, nil
}

/**
Note that this does not change password
*/
func (s *AccountService) UpdateUser(acc Account, id int) (Account, error) {
	accOld, err := s.repo.GetAccountByIDIncludingPassword(acc.ID)
	if err != nil {
		return Account{}, err
	}
	acc.PWD = accOld.PWD
	err = s.repo.Save(&acc)
	if err != nil {
		return Account{}, err
	}

	return acc, nil
}

func (s *AccountService) UpdateUserIncludingPassword(acc Account) error {
	err := s.repo.Save(&acc)
	if err != nil {
		return err
	}

	return nil
}

func (s *AccountService) AuthenticateByUserIDAndPWD(ID string, PWD string) (bool, error) {
	acc, err := s.repo.GetFullAccountDetailsForAuthentication(ID)
	if err != nil {
		return false, err
	}

	if util.ComparePwdHashWithPwd(acc.PWD, PWD) {
		return true, nil
	}

	return false, nil
}

func (s *AccountService) CreateAccount(userID string, pwd string) (Account, error) {
	encPwd, err := util.GetEncryptedPassword(pwd)
	if err != nil {
		return Account{}, err
	}
	return s.repo.Create(userID, encPwd)
}

func (s *AccountService) DeleteAccountByID(id uint) error {
	return s.repo.Delete(id)
}
