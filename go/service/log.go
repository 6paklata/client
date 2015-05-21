package service

import (
	"fmt"

	keybase1 "github.com/keybase/client/protocol/go"
)

type LogUI struct {
	sessionId int
	cli       *keybase1.LogUiClient
}

func (l *LogUI) log(level keybase1.LogLevel, format string, args []interface{}) {
	msg := fmt.Sprintf(format, args...)
	l.cli.Log(keybase1.LogArg{
		SessionID: l.sessionId,
		Level:     keybase1.LogLevel(level),
		Text: keybase1.Text{
			Markup: false,
			Data:   msg,
		},
	})
}

func (l *LogUI) Debug(format string, args ...interface{}) {
	l.log(keybase1.LogLevel_DEBUG, format, args)
}
func (l *LogUI) Info(format string, args ...interface{}) {
	l.log(keybase1.LogLevel_INFO, format, args)
}
func (l *LogUI) Critical(format string, args ...interface{}) {
	l.log(keybase1.LogLevel_CRITICAL, format, args)
}
func (l *LogUI) Warning(format string, args ...interface{}) {
	l.log(keybase1.LogLevel_WARN, format, args)
}
func (l *LogUI) Errorf(format string, args ...interface{}) {
	l.log(keybase1.LogLevel_ERROR, format, args)
}
func (l *LogUI) Notice(format string, args ...interface{}) {
	l.log(keybase1.LogLevel_NOTICE, format, args)
}
