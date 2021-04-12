package util

import (
	"github.com/google/logger"
	"os"
	"runtime/debug"
)

type ApiLogger interface {
	Debug(msg string)
	Debugf(err error)
	Info(msg string)
	Infof(err error)
	Warning(msg string)
	Warningf(err error)
	Error(msg string)
	Errorf(err error)
	Fatal(msg string)
	Fatalf(err error)
	LogLevel() int
}

const (
	logPath    = "/var/log/sang-project/sang-project.log"
	LogDebug   = 0
	LogInfo    = 1
	LogWarning = 2
	LogError   = 3
	LogFatal   = 4
	LogNone    = 5
)

type ApiLoggerImpl struct {
	lf       *os.File
	logger   *logger.Logger
	logLevel int
}

func NewApiLoggerImpl(logLevel int) ApiLoggerImpl {
	lf, _ := os.OpenFile(logPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0660)
	var loggerInstance *logger.Logger
	loggerInstance = logger.Init("logger", true, false, lf)
	return ApiLoggerImpl{
		lf:       lf,
		logger:   loggerInstance,
		logLevel: logLevel,
	}
}

func (l ApiLoggerImpl) LogLevel() int {
	return l.logLevel
}

func (l ApiLoggerImpl) Debug(msg string) {
	if l.logLevel > LogDebug {
		return
	}
	l.logger.Info(msg)
}

func (l ApiLoggerImpl) Debugf(err error) {
	if l.logLevel > LogDebug {
		return
	}
	l.logger.Infof(err.Error())
}

func (l ApiLoggerImpl) Info(msg string) {
	if l.logLevel > LogInfo {
		return
	}
	l.logger.Info(msg)
}

func (l ApiLoggerImpl) Infof(err error) {
	if l.logLevel > LogInfo {
		return
	}
	l.logger.Infof(err.Error())
}

func (l ApiLoggerImpl) Warning(msg string) {
	if l.logLevel > LogWarning {
		return
	}
	l.logger.Warning("%v", msg)
}

func (l ApiLoggerImpl) Warningf(err error) {
	if l.logLevel > LogWarning {
		return
	}
	l.logger.Warningf("%v", err)
}

func (l ApiLoggerImpl) Error(msg string) {
	if l.logLevel > LogError {
		return
	}
	l.logger.Error(string(debug.Stack()))
	l.logger.Error("%v", msg)
}

func (l ApiLoggerImpl) Errorf(err error) {
	if l.logLevel > LogError {
		return
	}
	l.logger.Error(string(debug.Stack()))
	l.logger.Errorf("%v", err)
}

func (l ApiLoggerImpl) Fatal(msg string) {
	if l.logLevel > LogFatal {
		return
	}
	l.logger.Error(string(debug.Stack()))
	l.logger.Fatal("%v", msg)
}

func (l ApiLoggerImpl) Fatalf(err error) {
	if l.logLevel > LogFatal {
		return
	}
	l.logger.Error(string(debug.Stack()))
	l.logger.Fatalf("%v", err)
}
