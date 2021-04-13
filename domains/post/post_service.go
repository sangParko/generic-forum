package post

import "gorm.io/gorm"

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