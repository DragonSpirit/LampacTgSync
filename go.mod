module lampacbot

go 1.24.1

require (
	github.com/go-telegram-bot-api/telegram-bot-api/v5 v5.5.1
	github.com/joho/godotenv v1.5.1
	github.com/mattn/go-sqlite3 v1.14.24 // indirect
)

require (
	github.com/dragonspirit/db v0.0.0-00010101000000-000000000000
	github.com/rs/cors v1.11.1
	github.com/skip2/go-qrcode v0.0.0-20200617195104-da1b6568686e
)

replace github.com/dragonspirit/db => ./app/db
