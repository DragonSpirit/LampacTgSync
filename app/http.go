package app

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/rs/cors"

	"github.com/dragonspirit/db"
)

type TokenCheckResponse struct {
	Result bool `json:"result"`
}

type InfoResponse struct {
	TorrentsView  []string `json:"torrents_view"`
	Favorite      string   `json:"favorite"`
	FileView      string   `json:"file_view"`
	SearchHistory []string `json:"search_history"`
}

func checkToken(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")

	if token == "" || !db.CheckTokenExists(token) {
		response, _ := json.Marshal(TokenCheckResponse{Result: false})
		w.Write(response)
		w.WriteHeader(http.StatusNotFound)
		return
	}

	response, _ := json.Marshal(TokenCheckResponse{Result: true})
	w.Write(response)
}

func updateJsonInfo(w http.ResponseWriter, token, data string) {
	// Записываем данные
	err := db.WriteJsonIntoDb(token, data)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Write([]byte("Данные успешно обновлены\n"))
}

func getUserInfo(w http.ResponseWriter, token string) {
	data, err := db.ReadJsonFromDb(token)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if data == "" { // новый юзер
		json, _ := json.Marshal(InfoResponse{
			TorrentsView:  []string{},
			Favorite:      "{}",
			FileView:      "{}",
			SearchHistory: []string{},
		})
		data = string(json)
	}

	w.Write([]byte(data))
}

func getUserData(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")

	exists, err := db.HasCodeInDb(token)

	if err != nil || !exists {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodGet:
		getUserInfo(w, token)
	case http.MethodPost:
		updateJsonInfo(w, token, r.FormValue("syncedData"))
	case http.MethodDelete:
		updateJsonInfo(w, token, "")
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
}

func createUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	token, err := db.GenerateAndSaveCodeIntoDb()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Write([]byte(token))
}

func BootstrapHTTPServer() {
	port := os.Getenv("PORT")
	disableCors := os.Getenv("DISABLE_CORS")
	useStaticServer := os.Getenv("USE_STATIC_SERVER")

	if port == "" {
		log.Fatal("PORT не найден в .env")
		return
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/checkToken", checkToken)
	mux.HandleFunc("/sync", getUserData)
	mux.HandleFunc("/user", createUser)

	var handler http.Handler = http.Handler(mux)

	if disableCors == "true" {
		log.Printf("CORS отключен")
		handler = cors.AllowAll().Handler(mux)
	}

	if useStaticServer == "true" {
		log.Printf("Используется статический сервер")
		mux.Handle("/", http.FileServer(http.Dir("./static")))
	}

	log.Printf("HTTP-сервер запущен\n")

	http.ListenAndServe(":"+port, handler)
}
