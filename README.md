Бекенд и клиентская часть для синхронизации данных в приложении lampa.

Как начать? Скачиваем из вкладки releases бэкенд под нужную платформу.
Копирует `.env.example` в `.env`
```
cp .env.example .env
```
Заполняем необходимые параметры
```
USE_TELEGRAM_BOT: включить/отключить использование Telegram-бота (по умолчанию: true)
TELEGRAM_BOT_TOKEN: токен доступа Telegram-бота (по умолчанию: 123, брать у `@BotFather` в телеграмме)
PORT: порт, на котором запускается приложение (по умолчанию: 8080)
DISABLE_CORS: включить/отключить CORS (по умолчанию: true)
USE_STATIC_SERVER: включить/отключить статический сервер (по умолчанию: false)
```
и запускаем приложение: lampacbot &, можно завернуть в systemd сервис

При первом запуске в папке с приложением создастся файл data.db, в котором будут хранится все связанные с пользователями данные, в случае переноса достаточно перекинуть этот файл в новое место.
Параметр USE_STATIC_SERVER позволяет отвязать клиентский плагин от wwwroot lampac'а, в там случае путь до файла будет http://IP:PORT/tg.js.
Если нет желания использовать статику, то просто кидаем в wwwroot/plugins и в lampainit-invc.my.js прописываем
```
Lampa.Utils.putScriptAsync(["{localhost}/plugins/tg.js"]); 
```
В случае если у вас не закрыто reverse proxy и есть проблемы с CORS, то можно отключить выставив параметр DISABLE_CORS в true (на свой страх и риск)
При желании можно также отвязатся от telegram бота и создавать новых юзеров дёрнув руками пустой POST запрос на http://IP:PORT/user, в ответе придёт сегенерированный токен, либо добавляя новую забись любым редактором sqlite баз данных.

Важно! Если уже имеются локальные сохранённые данные, то во избежании их потери стоит перед включением синхронизации жмакнуть "Первичная синхронизация". В любом случае автор не несёт ответственность за потерянные данные просмотров, увы.

Также важно, что синхронизация работает по принципу, кто последний тот и батя, никаких CRDT и прочих фишек для разрешения конфликтов не реализовано и скорее всего не будет реализовано.