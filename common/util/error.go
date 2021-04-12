package util

import "errors"

func ErrWithMsg(additionalMsg string, e error) error {
	return errors.New(additionalMsg + ": " + e.Error())
}
