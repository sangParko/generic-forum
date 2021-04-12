package util

import "golang.org/x/crypto/bcrypt"

func GetEncryptedPassword(str string) (string, error) {
	res, err := bcrypt.GenerateFromPassword([]byte(str), 8)
	if err != nil {
		return "", err
	}

	return string(res), nil
}

func ComparePwdHashWithPwd(hashedStr string, str string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedStr), []byte(str))
	if err == nil {
		return true
	}

	return false
}