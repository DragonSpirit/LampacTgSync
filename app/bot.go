package app

import (
	"fmt"
	"log"
	"os"

	"github.com/dragonspirit/db"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

func BootstrapBot() {
	// Получаем токен из переменных окружения
	botToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	if botToken == "" {
		log.Fatal("TELEGRAM_BOT_TOKEN не найден в .env")
	}

	bot, err := tgbotapi.NewBotAPI(botToken)
	if err != nil {
		log.Fatal(err)
	}

	bot.Debug = true
	log.Printf("Бот %s запущен\n", bot.Self.UserName)

	u := tgbotapi.NewUpdate(0)
	u.Timeout = 60
	updates := bot.GetUpdatesChan(u)

	for update := range updates {
		if update.Message == nil {
			continue
		}

		switch update.Message.Command() {
		case "start":
			handleStart(bot, update.Message)
		}
	}
}

// Обработка команды /start
func handleStart(bot *tgbotapi.BotAPI, msg *tgbotapi.Message) {
	// Сохраняем код в БД
	code, err := db.GenerateAndSaveCodeIntoDb(msg.Chat.ID)
	if err != nil {
		log.Println("Ошибка сохранения кода:", err)
		_, err := bot.Send(tgbotapi.NewMessage(msg.Chat.ID, "Ошибка при генерации кода"))
		if err != nil {
			log.Printf("Ошибка при отправке сообщения")
		}
		return
	}

	reply := fmt.Sprintf("Ваш уникальный код: %s\n", code)
	bot.Send(tgbotapi.NewMessage(msg.Chat.ID, reply))
}
