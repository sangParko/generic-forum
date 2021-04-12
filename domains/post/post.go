package post

import (
	"../account"
	"gorm.io/gorm"
)

type Post struct {
	gorm.Model
	Owner         account.Account
	Type          int // 0. Anything,  1. Q&A  2. Promotion: books, lectures, agencies
	Title         string
	HTMLList      []HTMLPost // keep track of changes
	Replies       []Reply
	LikedUsers    []account.Account
	DislikedUsers []account.Account
}

type HTMLPost struct {
	gorm.Model
	HTML string
}

type Reply struct {
	gorm.Model
	Owner         account.Account
	HTML          string
	NestedReplies []NestedReply
	LikedUsers    []account.Account
	DislikedUsers []account.Account
}

type NestedReply struct {
	gorm.Model
	Owner         account.Account
	HTML          string
	LikedUsers    []account.Account
	DislikedUsers []account.Account
}
