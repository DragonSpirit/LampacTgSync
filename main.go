package main

import (
	"context"
	"fmt"
	"lampacbot/app"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/dragonspirit/db"
	"github.com/joho/godotenv"
)

func main() {
	appContext := &app.AppContext{}
	// Загружаем переменные окружения из .env
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Ошибка загрузки .env файла")
	}

	_, cancel := context.WithCancel(context.Background())
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT)

	db.BootstrapDb()

	go func() {
		app.BootstrapHTTPServer(appContext)
	}()

	useTelegramBot := os.Getenv("USE_TELEGRAM_BOT")

	if useTelegramBot == "true" {
		go func() {
			app.BootstrapBot(appContext)
		}()
	}

	defer func() {
		if err := db.CloseDb(); err != nil {
			fmt.Println("Error closing database: ", err)
		}
	}()

	sig := <-sigs
	fmt.Println(sig)

	cancel()

	fmt.Println("service has shutdown")
}
