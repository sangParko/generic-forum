package post

import (
	"../account"
	"gorm.io/gorm"
	"sort"
)

type PostService struct {
	db *gorm.DB
}

func NewPostService(
	db *gorm.DB) *PostService {
	return &PostService{
		db: db,
	}
}


func (s *PostService) CreatePost(post Post) (Post, error) {
	if err := s.db.Create(&post).Error; err != nil {
		return Post{}, err
	}
	return post, nil
}

func (s *PostService) UpdatePost(post Post) (Post, error) {
	if err := s.db.Save(&post).Error; err != nil {
		return Post{}, err
	}
	return post, nil
}

func (s *PostService) AddReplyToPost(postID uint, reply Reply) (Post, error) {
	post, err := s.GetPost(postID)
	if err != nil {
		return Post{}, err
	}

	post.Replies = append(post.Replies, reply)
	return s.UpdatePost(post)
}

//
//func (s *PostService) GetPostByID(id uint) (Post, error) {
//}


func (s *PostService) GetPosts(page uint) ([]Post, error) {
	var posts []Post
	if err := s.db.Find(&posts).Error; err != nil {
		return nil, err
	}
	for ind, p := range posts {
		var lists []HTMLPost
		if err := s.db.Model(&p).Association("HTMLList").Find(&lists); err != nil {
			return nil, err
		}
		p.HTMLList = lists
		posts[ind] = p
	}
	return posts, nil
}


func (s *PostService) GetPost(id uint) (Post, error) {
	var post Post
	if err := s.db.First(&post, "id = ?", id).Error; err != nil {
		return Post{}, err
	}
	var lists []HTMLPost
	if err := s.db.Model(&post).Association("HTMLList").Find(&lists); err != nil {
		return Post{}, err
	}
	sort.Slice(lists, func(i, j int) bool {
		return lists[i].CreatedAt.After(lists[j].CreatedAt)
	})
	post.HTMLList = lists

	var replies []Reply
	if err := s.db.Model(&post).Association("Replies").Find(&replies); err != nil {
		return Post{}, err
	}
	sort.Slice(lists, func(i, j int) bool {
		return lists[i].CreatedAt.After(lists[j].CreatedAt)
	})
	post.Replies = replies

	var owner account.Account
	if err := s.db.Model(&post).Association("Owner").Find(&owner); err != nil {
		return Post{}, err
	}
	post.Owner = owner

	return post, nil
}

func (s *PostService) DeletePost(id uint) error {
	var post Post
	if err := s.db.Delete(&post, "id = ?", id).Error; err != nil {
		return err
	}

	return nil
}
