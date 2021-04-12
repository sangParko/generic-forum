package util

import (
	"strconv"
	"strings"
)

func GetLinesWithoutComments(lines []string, comment string) []string {
	var newLines []string
	for _, line := range lines {
		if line[0:len(comment)] != comment {
			newLines = append(newLines, line)
		}
	}
	return newLines
}

func ContainsToken(lines []string, token string) bool {
	res := false
	for _, line := range lines {
		if strings.Contains(line, token) {
			res = true
		}
	}
	return res
}

func SliceContainsInteger(s []int, e int) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

func GetUniqueIntList(ints []int) []int {
	uniqueList := []int{}
	keys := make(map[int]bool)
	for _, entry := range ints {
		if _, value := keys[entry]; !value {
			keys[entry] = true
			uniqueList = append(uniqueList, entry)
		}
	}
	return uniqueList
}

func GetIntsFromUints(nums []uint) []int {
	newList := []int{}
	for _, num := range nums {
		newList = append(newList, int(num))
	}
	return newList
}

func GetCommaSeparatedStringFromIntegers(nums []int) string {
	res := ""
	for ind, num := range nums {
		res += strconv.Itoa(num)
		if ind != len(nums) - 1 {
			res += ","
		}
	}
	return res
}


func GetIntegersFromCommaSeparatedString(commaString string) []int {
	var res []int
	tokens := strings.Split(commaString, ",")
	for _, token := range tokens {
		num, _ := strconv.Atoi(token)
		res = append(res, num)
	}
	return res
}

func AddIntegerToCommaSeparatedIntegersString(commaString string, newInteger int) string {
	var res []int
	tokens := strings.Split(commaString, ",")
	for _, token := range tokens {
		num, _ := strconv.Atoi(token)
		res = append(res, num)
	}
	res = append(res, newInteger)
	return GetCommaSeparatedStringFromIntegers(res)
}

func RemoveIntegerFromCommaSeparatedIntegersString(commaString string, oldInteger int) string {
	var res []int
	tokens := strings.Split(commaString, ",")
	for _, token := range tokens {
		num, _ := strconv.Atoi(token)
		if num != oldInteger {
			res = append(res, num)
		}
	}
	return GetCommaSeparatedStringFromIntegers(res)
}
