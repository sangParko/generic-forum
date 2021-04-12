package setup

import (
	"../migration"
	"../util"
	"fmt"
	"github.com/google/logger"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"log"
	"strconv"
)

const (
	ProductionMode  = "production"
	DevelopmentMode = "development"
	BuildTestMode   = "test"
	ServerPort      = 1001
)

type Env struct {
	//Different modes will set different default environment variable values.
	Mode string

	//Logger will decide whether or not to log depending on the level.
	//Look into logger.go for more detail.
	LogLevel int

	//The main port the api server is running on.
	APIHttpPort int

	//Database credentials
	UseDB  bool
	DBUser string
	DBPwd  string
	DBName string
	DBHost string

	//Setting this to false will allow unauthorized api calls.
	RejectUnauthorizedAPICalls bool
}

var prodEnv = &Env{
	Mode:                       ProductionMode,
	LogLevel:                   util.LogInfo,
	APIHttpPort:                ServerPort,
	UseDB:                      true,
	DBUser:                     "sang",
	DBPwd:                      "sangpwd",
	DBName:                     "sang_db",
	DBHost:                     "localhost",
	RejectUnauthorizedAPICalls: true,
}

var devEnv = &Env{
	Mode:                       DevelopmentMode,
	LogLevel:                   util.LogInfo,
	APIHttpPort:                ServerPort,
	UseDB:                      true,
	DBUser:                     "sang",
	DBPwd:                      "sangpwd",
	DBName:                     "sang_db",
	DBHost:                     "localhost",
	RejectUnauthorizedAPICalls: true,
}

var testEnv = &Env{
	Mode:                       BuildTestMode,
	LogLevel:                   util.LogDebug,
	APIHttpPort:                ServerPort,
	UseDB:                      true,
	DBUser:                     "sang",
	DBPwd:                      "sangpwd",
	DBName:                     "sang_db",
	DBHost:                     "localhost",
	RejectUnauthorizedAPICalls: true,
}

func (env *Env) GetDB() *gorm.DB {
	if !env.UseDB {
		return nil
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s?charset=utf8mb4&parseTime=True&loc=Local", env.DBUser, env.DBPwd, env.DBHost, env.DBName)
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		log.Fatal("Fatal error, main(): database connection cannot be established." + err.Error())
	}
	migration.MigrateDatabase(db)
	return db
}

func NewEnv(mode string) *Env {
	if mode == ProductionMode {
		return prodEnv
	}

	if mode == DevelopmentMode {
		return devEnv
	}

	if mode == BuildTestMode {
		return testEnv
	}

	return prodEnv
}

func (e *Env) PrintEnvVars(logger util.ApiLoggerImpl) {
	logger.Info(fmt.Sprintf("[INFO] Operation Mode has been set to : %s \n", e.Mode))
	logger.Info(fmt.Sprintf("[INFO] DB UserID has been set to      : %s \n", e.DBName))
	logger.Info(fmt.Sprintf("[INFO] DB Host has been set to        : %s \n", e.DBHost))
	logger.Info(fmt.Sprintf("[INFO] Log Level has been set to      : %d \n", e.LogLevel))
}

func PromptApplicationMode() string {
	var mode string
	_, modeStr := util.GetArg("-mode")
	switch modeStr {
	case "dev":
		mode = DevelopmentMode
	case "test":
		mode = BuildTestMode
	case "prod":
		mode = ProductionMode
	default:
		mode = ProductionMode
	}
	return mode
}

func (e *Env) LoadEnvVariablesFromCMDLine() {
	hasArg, arg := util.GetArg("-dhost")
	if hasArg {
		e.DBHost = arg
	}

	hasArg, arg = util.GetArg("-duser")
	if hasArg {
		e.DBUser = arg
	}

	hasArg, arg = util.GetArg("-dpwd")
	if hasArg {
		e.DBPwd = arg
	}

	hasArg, arg = util.GetArg("-unprotect")
	if hasArg && arg == "yes" {
		e.RejectUnauthorizedAPICalls = false
	}

	hasArg, arg = util.GetArg("-port")
	if hasArg {
		port, err := strconv.Atoi(arg)
		if err != nil {
			logger.Fatalf("%v", err)
		}
		e.APIHttpPort = port
	}

	hasArg, arg = util.GetArg("-loglevel")
	if hasArg {
		logLevel, err := strconv.Atoi(arg)
		if err != nil {
			logger.Fatalf("%v", err)
		}
		switch logLevel {
		case util.LogDebug:
			e.LogLevel = util.LogDebug
			break
		case util.LogInfo:
			e.LogLevel = util.LogInfo
			break
		case util.LogWarning:
			e.LogLevel = util.LogWarning
			break
		case util.LogError:
			e.LogLevel = util.LogError
			break
		case util.LogNone:
			e.LogLevel = util.LogNone
			break
		default:
			e.LogLevel = util.LogInfo
			break
		}
	}
}
