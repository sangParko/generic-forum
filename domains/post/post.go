package post

import (
	"../account"
	"gorm.io/gorm"
)

type Post struct {
	gorm.Model
	Owner         account.Account
	OwnerID       uint
	Type          int        // 0. Anything,  1. Q&A  2. Promotion: books, lectures, agencies
	HTMLList      []HTMLPost // keep track of changes
	Replies       []Reply
	LikedUsers    []account.Account `gorm:"many2many:post_like_mapping;"`
	DislikedUsers []account.Account `gorm:"many2many:post_dislike_mapping;"`
}

type HTMLPost struct {
	gorm.Model
	PostID uint
	HTML   string
	Title  string
}

type Reply struct {
	gorm.Model
	PostID        uint
	OwnerID       uint
	Owner         account.Account
	HTML          string
	NestedReplies []NestedReply
	LikedUsers    []account.Account `gorm:"many2many:reply_like_mapping;"`
	DislikedUsers []account.Account `gorm:"many2many:reply_dislike_mapping;"`
}

type NestedReply struct {
	gorm.Model
	ReplyID       uint
	OwnerID       uint
	Owner         account.Account
	HTML          string
	LikedUsers    []account.Account `gorm:"many2many:nested_like_mapping;"`
	DislikedUsers []account.Account `gorm:"many2many:nested_dislike_mapping;"`
}
