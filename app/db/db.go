package db

import (
	"database/sql"
	"log"
	"math/rand"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

var rng = rand.New(rand.NewSource(time.Now().UnixNano()))

// Генерация 8-значного кода
func generateCode() string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

	code := make([]byte, 8)
	for i := range code {
		code[i] = charset[rng.Intn(len(charset))]
	}
	return string(code)
}

var db *sql.DB

func CheckTokenExists(token string) bool {
	// Проверяем, существует ли код
	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM records WHERE code = ?)", token).Scan(&exists)
	if err != nil || !exists {
		return false
	}
	return true
}

func GenerateAndSaveCodeIntoDb() (string, error) {
	code := generateCode()
	// Сохраняем код в БД
	_, err := db.Exec("INSERT INTO records (code, data) VALUES (?, '')", code)
	return code, err
}

func HasCodeInDb(code string) (bool, error) {
	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM records WHERE code = ?)", code).Scan(&exists)
	return exists, err
}

func WriteJsonIntoDb(code string, data string) error {
	// Записываем данные
	_, err := db.Exec("UPDATE records SET data = ? WHERE code = ?", data, code)
	return err
}

func RemoveUserFromDb(code string) error {
	// Удаляем пользователя из БД
	_, err := db.Exec("DELETE FROM records WHERE code = ?", code)
	return err
}

func ReadJsonFromDb(code string) (string, error) {
	var data string
	err := db.QueryRow("SELECT data FROM records WHERE code = ?", code).Scan(&data)
	return data, err
}

func BootstrapDb() {
	// Инициализация базы данных
	var err error
	db, err = sql.Open("sqlite3", "data.db")
	if err != nil {
		log.Fatal(err)
	}

	// Создание таблицы, если ее нет
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS records (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		code TEXT UNIQUE,
		data TEXT
	)`)

	if err != nil {
		log.Fatal(err)
	}
}

func CloseDb() error {
	return db.Close()
}
