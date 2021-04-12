package util

import (
	"os"
	"os/exec"
)

func GetArg(argName string) (bool, string) {
	if len(os.Args) > 1 {
		for index, arg := range os.Args {
			if arg == argName && len(os.Args) > index + 1 {
				return true, os.Args[index+1]
			}
		}
	}

	return false, ""
}

func ExecSh(cmd string) (string, error) {
	var out []byte
	out, err := exec.Command("sh", "-c", cmd).Output()
	return string(out), err
}