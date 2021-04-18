package migration

import (
	"../../domains/account"
	"../../domains/post"
	"../util"
	"fmt"
	"gorm.io/gorm"
)

func MigrateDatabase(db *gorm.DB) {
	migrateTables(db)
	insertInitialData(db)
	insertTestData(db)
}

func migrateTables(db *gorm.DB) {
	fmt.Println("[INFO] table schemas migrating...")
	fmt.Println("[INFO] existing columns may not be updated.")
	if err := db.AutoMigrate(&account.Account{}); err != nil {
		fmt.Println(err)
	}
	if err := db.AutoMigrate(&post.Post{}); err != nil {
		fmt.Println(err)
	}
	if err := db.AutoMigrate(&post.HTMLPost{}); err != nil {
		fmt.Println(err)
	}
	if err := db.AutoMigrate(&post.Reply{}); err != nil {
		fmt.Println(err)
	}
	fmt.Println("[INFO] table schemas migration done.")
}

func insertInitialData(db *gorm.DB) {
	fmt.Println("[INFO] inserting initial data...")
	pwd, _ := util.GetEncryptedPassword("admin")

	var cnt int64
	db.Table("accounts").Count(&cnt)
	if cnt == 0 {
		db.Create(&account.Account{UserID: "admin", PWD: pwd, PrivilegeTitle: "admin"})
	}
	fmt.Println("[INFO] inserting initial data done.")
}

func insertTestData(db *gorm.DB) {
	fmt.Println("[INFO] inserting test data...")
	fmt.Println("[INFO] inserting test data done.")
}
