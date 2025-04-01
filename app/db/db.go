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

func GenerateAndSaveCodeIntoDb(chat_id int64) (string, error) {
	var code string

	// Проверяем, есть ли уже токен для данного chat_id
	err := db.QueryRow("SELECT code FROM records WHERE chat_id = ?", chat_id).Scan(&code)
	if err == sql.ErrNoRows {
		// Если токена нет, создаем новый
		code = generateCode()
		_, err = db.Exec("INSERT INTO records (chat_id, code, data) VALUES (?, ?, '')", chat_id, code)
		if err != nil {
			log.Println("Ошибка сохранения кода:", err)
			return "", err
		}
	} else if err != nil {
		log.Println("Ошибка запроса в БД:", err)
		return "", err
	}
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

func migrateDB() {
	// Проверяем, есть ли столбец chat_id в таблице records
	rows, err := db.Query("PRAGMA table_info(records)")
	if err != nil {
		log.Fatal("Ошибка при запросе структуры таблицы:", err)
	}
	defer rows.Close()

	columnExists := false
	for rows.Next() {
		var (
			cid        int
			name       string
			ctype      string
			notnull    int
			dflt_value sql.NullString
			pk         int
		)
		if err := rows.Scan(&cid, &name, &ctype, &notnull, &dflt_value, &pk); err != nil {
			log.Fatal("Ошибка при чтении структуры таблицы:", err)
		}

		// Проверяем, есть ли колонка "chat_id"
		if name == "chat_id" {
			columnExists = true
			break
		}
	}

	if !columnExists {
		log.Println("Обновление схемы базы данных: добавление chat_id...")
		_, err := db.Exec("ALTER TABLE records ADD COLUMN chat_id INTEGER DEFAULT 0")
		if err != nil {
			log.Fatal("Ошибка при добавлении chat_id:", err)
		}
		log.Println("Миграция завершена: поле chat_id добавлено.")
	} else {
		log.Println("Миграция не требуется: поле chat_id уже существует.")
	}
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
		chat_id INTEGER NOT NULL,
		code TEXT UNIQUE,
		data TEXT
	)`)

	if err != nil {
		log.Fatal(err)
	}

	migrateDB()

}

func CloseDb() error {
	return db.Close()
}
