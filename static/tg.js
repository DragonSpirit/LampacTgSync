(function () {
  "use strict";

  Lampa.Platform.tv();
  (function () {
    "use strict";
    
    // Секция конфигурации **********
    
    var syncUrl = window.syncUrl || "http://192.168.1.133:8080"

    // ******************************

    var botLink;

    function makeHttpRequest(type, url, data) {
      return new Promise(function (onSuccess, onError) {
        var xhr = new XMLHttpRequest();
        xhr.open(type, url, true);
        if (type === "POST") {
          xhr.send(data);
        } else {
          xhr.send();
        }
        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            onSuccess(xhr);
          } else {
            onError(xhr);
          }
        };
        xhr.onerror = function () {
          onError(xhr);
        };
      });
    }

    (function loadPluginInfo() {
      makeHttpRequest("GET", syncUrl + "/info")
        .then(function (response) {
          if (response.status === 200) {
            var info = JSON.parse(response.responseText);
            botLink = info.botLink;
          } else {
            console.log("Ошибка при загрузке информации о плагине: " + response.status + " - " + response.statusText);
            Lampa.Noty.show("Ошибка при загрузке информации о плагине");
          }
        })
        .catch(function (error) {
          console.error(error);
          Lampa.Noty.show("Ошибка при загрузке информации о плагине");
      })
    })()

    function initializeAccountSettings() {
      Lampa.SettingsApi.addComponent({
        component: "acc",
        name: "Аккаунт",
        icon: "<svg fill=\"#ffffff\" width=\"256px\" height=\"256px\" viewBox=\"0 0 32 32\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\"><g id=\"SVGRepo_bgCarrier\" stroke-width=\"0\"></g><g id=\"SVGRepo_tracerCarrier\" stroke-linecap=\"round\" stroke-linejoin=\"round\"></g><g id=\"SVGRepo_iconCarrier\"> <title>user</title> <path d=\"M16 17.25c4.556 0 8.25-3.694 8.25-8.25s-3.694-8.25-8.25-8.25c-4.556 0-8.25 3.694-8.25 8.25v0c0.005 4.554 3.696 8.245 8.249 8.25h0.001zM16 3.25c3.176 0 5.75 2.574 5.75 5.75s-2.574 5.75-5.75 5.75c-3.176 0-5.75-2.574-5.75-5.75v0c0.004-3.174 2.576-5.746 5.75-5.75h0zM30.898 29.734c-1.554-6.904-7.633-11.984-14.899-11.984s-13.345 5.080-14.88 11.882l-0.019 0.102c-0.018 0.080-0.029 0.172-0.029 0.266 0 0.69 0.56 1.25 1.25 1.25 0.596 0 1.095-0.418 1.22-0.976l0.002-0.008c1.301-5.77 6.383-10.016 12.457-10.016s11.155 4.245 12.44 9.93l0.016 0.085c0.126 0.566 0.623 0.984 1.219 0.984h0c0 0 0 0 0 0 0.095 0 0.187-0.011 0.276-0.031l-0.008 0.002c0.567-0.125 0.984-0.623 0.984-1.219 0-0.095-0.011-0.187-0.031-0.276l0.002 0.008z\"></path> </g></svg>"
      });
      Lampa.Settings.listener.follow("open", function (event) {
        setTimeout(function () {
          $("div[data-component=interface]").before($("div[data-component=acc]"));
        }, 30);
        if (event.name == "acc") {
          if (localStorage.getItem("token") !== null) {
            $("div[data-name=\"acc_auth\"]").hide();
            var element = document.querySelector("#app > div.settings > div.settings__content.layer--height > div.settings__body > div > div > div > div > div:nth-child(4)");
            Lampa.Controller.focus(element);
            Lampa.Controller.toggle("settings_component");
          } else {
            var accountInfoBlock = $("<div class=\"myBot\" style=\"line-height: 1;color: currentColor;font-family: 'Segoe UI', sans-serif;font-size: 1em;box-sizing: border-box;outline: none;user-select: none;display: flex;flex-direction: row;align-items: center;position: relative;background-color: rgba(255, 255, 255, 0.1);border-radius: 0.3em;margin: 1.5em 2em;padding: 1em;\">"+
            "<div style=\"flex: 1;\">"+
                "<div class=\"ad-server__text\" style=\"padding: unset; padding-bottom: 0.5em;\">Для получения токена перейдите в Telegram бот</div>"+
                "<div style=\"background-color: #E0C3FC;padding: 0.5em;color: #000;border-radius: 0.3em;margin-top: 0.5em;\">"+
                    "<a href=\"" + botLink + "\" style=\"color: #000;text-decoration: none;\">" + botLink + "</a>"+
                "</div>"+
            "</div>"+
              "<img src=\"" + syncUrl + "/qr\" alt=\"QR Code\" style=\"width: 100px; height: 100px; margin-left: 1em; border-radius: 0.3em;\">"+
            "</div>");
            $("div[data-name=\"acc_auth\"]").before(accountInfoBlock);
            $("div > span:contains(\"Аккаунт\")").hide();
            $("div[data-name=\"acc_sync\"]").hide();
            $("div[data-name=\"sync_init\"]").hide();
            $("div[data-name=\"sync_reset\"]").hide();
            $("#app > div.settings > div.settings__content.layer--height > div.settings__body > div > div > div > div > div:nth-child(6)").hide();
            $(".settings-param > div:contains(\"Выйти\")").parent().hide();
          }
        }
      });
      Lampa.SettingsApi.addParam({
        component: "acc",
        param: {
          name: "acc_title_auth",
          type: "title"
        },
        field: {
          name: "Авторизация",
          description: ""
        }
      });
      Lampa.SettingsApi.addParam({
        component: "acc",
        param: {
          name: "acc_auth",
          type: "input",
          values: "",
          placeholder: "Нужно будет ввести токен",
          default: ""
        },
        field: {
          name: "Выполнить вход",
          description: ""
        },
        onChange: function (tokenValue) {
          console.log("Введенный токен:", tokenValue);
          var request = new XMLHttpRequest();
          request.open("GET", syncUrl + "/checkToken?token=" + tokenValue, true);
          request.setRequestHeader("Content-Type", "application/json");
          request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
              var response = JSON.parse(request.responseText);
              console.log("Ответ сервера:", response);
              if (response.result) {
                console.log("Токен действителен");
                localStorage.setItem("token", tokenValue);
                Lampa.Noty.show("Токен действителен");
                Lampa.Settings.update();
              } else {
                console.log("Токен недействителен");
                localStorage.removeItem("token");
                Lampa.Noty.show("Токен недействителен");
              }
            } else {
              Lampa.Noty.show("Ошибка запроса");
            }
          };
          request.send(JSON.stringify({
            token: tokenValue
          }));
        }
      });
      Lampa.SettingsApi.addParam({
        component: "acc",
        param: {
          name: "acc_status",
          type: "title"
        },
        field: {
          name: "<div class=\"settings-folder\" style=\"padding:0!important\"><div style=\"width:1.3em;height:1.3em;padding-right:.1em\"><!-- icon666.com - MILLIONS vector ICONS FREE --><svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 512 512\" style=\"enable-background:new 0 0 512 512;\" xml:space=\"preserve\"><path style=\"fill:#1E0478;\" d=\"M334.975,0c95.414,0,173.046,77.632,173.046,173.046c0,95.426-77.632,173.046-173.046,173.046 c-21.224,0-41.843-3.771-61.415-11.224l-40.128,40.128c-2.358,2.358-5.574,3.695-8.916,3.695h-27.139v27.126 c0,6.974-5.65,12.611-12.611,12.611h-12.359v12.359c0,6.974-5.65,12.611-12.611,12.611h-30.833v30.884 c0,3.342-1.337,6.558-3.708,8.916l-25.146,25.108C97.753,510.676,94.55,512,91.208,512H16.59c-6.961,0-12.611-5.65-12.611-12.611 v-90.546c0-3.342,1.337-6.558,3.695-8.916l165.467-165.479c-7.44-19.572-11.211-40.191-11.211-61.402 C161.929,77.632,239.549,0,334.975,0z M482.8,173.046c0-81.504-66.32-147.824-147.824-147.824 c-81.516,0-147.824,66.32-147.824,147.824c0,20.644,4.162,40.607,12.371,59.334c2.131,4.843,0.958,10.303-2.522,13.872 c-0.038,0.038-0.063,0.076-0.101,0.113L29.2,414.064v22.788l138.089-138.089c4.439-4.426,11.615-4.426,16.054,0 c4.426,4.439,4.426,11.615,0,16.054L29.2,468.959v17.819h56.787l17.756-17.731v-38.261c0-6.961,5.65-12.611,12.611-12.611h30.833 v-12.359c0-6.961,5.65-12.611,12.611-12.611h12.359V366.08c0-6.974,5.65-12.611,12.611-12.611h34.528l42.347-42.36 c0.038-0.038,0.076-0.063,0.113-0.101c3.581-3.481,9.029-4.653,13.872-2.522c18.74,8.222,38.703,12.384,59.347,12.384 C416.479,320.87,482.8,254.562,482.8,173.046z\"/><path style=\"fill:#9B8CCC;\" d=\"M334.975,25.222c81.504,0,147.824,66.32,147.824,147.824c0,81.516-66.32,147.824-147.824,147.824 c-20.644,0-40.607-4.162-59.347-12.384c-4.843-2.131-10.29-0.958-13.872,2.522c-0.038,0.038-0.076,0.063-0.113,0.101l-42.347,42.36 h-34.528c-6.961,0-12.611,5.637-12.611,12.611v27.126h-12.359c-6.961,0-12.611,5.65-12.611,12.611v12.359h-30.833 c-6.961,0-12.611,5.65-12.611,12.611v38.261l-17.756,17.731H29.2v-17.819l154.142-154.142c4.426-4.439,4.426-11.615,0-16.054 c-4.439-4.426-11.615-4.426-16.054,0L29.2,436.852v-22.788l167.699-167.699c0.038-0.038,0.063-0.076,0.101-0.113 c3.481-3.569,4.653-9.029,2.522-13.872c-8.21-18.727-12.371-38.69-12.371-59.334C187.151,91.542,253.459,25.222,334.975,25.222z M434.866,120.383c0-26.041-21.186-47.24-47.228-47.24c-26.054,0-47.24,21.199-47.24,47.24s21.186,47.24,47.24,47.24 C413.68,167.623,434.866,146.424,434.866,120.383z\"/><path style=\"fill:#1E0478;\" d=\"M387.638,73.143c26.041,0,47.228,21.199,47.228,47.24s-21.186,47.24-47.228,47.24 c-26.054,0-47.24-21.199-47.24-47.24S361.584,73.143,387.638,73.143z M409.644,120.383c0-12.144-9.874-22.019-22.006-22.019 c-12.144,0-22.018,9.874-22.018,22.019s9.874,22.019,22.018,22.019C399.77,142.402,409.644,132.527,409.644,120.383z\"/><path style=\"fill:#FFFFFF;\" d=\"M387.638,98.365c12.132,0,22.006,9.874,22.006,22.019s-9.874,22.019-22.006,22.019 c-12.144,0-22.019-9.874-22.019-22.019S375.494,98.365,387.638,98.365z\"/></svg></div><div style=\"font-size:1.1em\"><div style=\"padding: 0.3em 0.3em; padding-top: 0;\"><div style=\"background: #d99821; padding: 0.5em; border-radius: 0.4em;color: white;\"><div style=\"line-height: 0.3;\">Аккаунт подключен</div></div></div></div></div>",
          description: ""
        }
      });
      Lampa.SettingsApi.addParam({
        component: "acc",
        param: {
          name: "acc_exit",
          type: "static"
        },
        field: {
          name: "Выйти из аккаунта",
        },
        onRender: function (item) {
          item.on("hover:enter", function () {
            localStorage.removeItem("token");
            Lampa.Storage.set("acc_sync", false);
            Lampa.Settings.update();
          });
        }
      });
      Lampa.SettingsApi.addParam({
        component: "acc",
        param: {
          name: "acc_title_sync",
          type: "title"
        },
        field: {
          name: "Синхронизация",
        }
      });
      Lampa.SettingsApi.addParam({
        component: "acc",
        param: {
          name: "acc_sync",
          type: "trigger",
          default: false
        },
        field: {
          name: "Синхронизация данных",
          description: "Синхронизация ваших закладок, плагинов, таймкодов, историй просмотров и поиска между устройствами"
        },
        onChange: function (value) {
          if (value === "true") {
            var token = localStorage.getItem("token");
            if (token) {
              plugInfo.loadDataFromServer(token).then(function (result) {
                if (result) {
                  plugInfo.updateLocalStorage(result);
                  Lampa.Noty.show("Приложение будет перезапущено ...");
                  setTimeout(function () {
                    window.location.reload();
                  }, 300);
                } else {
                  console.log("Не удалось загрузить данные для синхронизации");
                }
              })["catch"](function (error) {
                console.log("Ошибка при загрузке данных:", error);
              });
            } else {
              Lampa.Noty.show("Вы не зашли в аккаунт");
              if (Lampa.Storage.field("acc_sync")) {
                Lampa.Storage.set("acc_sync", false);
                Lampa.Settings.update();
              }
            }
          }
        }
      });
      var syncedItems = ["torrents_view", "favorite", "file_view", "search_history"];
      var plugInfo = {
        timer: null,
        needsSync: false,
        isSyncSuccessful: false,
        handleStorageChange: function (storage) {
          var key = storage.name;
          if (syncedItems.indexOf(key) !== -1) {
            console.log("Изменен ключ в локальном хранилище: " + key);
            this.needsSync = true;
            if (this.timer) {
              clearTimeout(this.timer);
            }
            this.timer = setTimeout(function () {
              if (this.needsSync && !intervalId) {
                var token = localStorage.getItem("token");
                if (token) {
                  this.startSync(token);
                }
                this.needsSync = false;
              }
              intervalId = null;
            }.bind(this), 500);
          }
        },
        startSync: function (token, onSuccess) {
          console.log("Запуск синхронизации...");
          this.isSyncSuccessful = false;
          this.sendDataToServer(token).then(function () {
            if (this.isSyncSuccessful) {
              console.log("Синхронизация успешно завершена");
              onSuccess && onSuccess();
            } else {
              console.log("Ошибка: Данные для синхронизации отсутствуют");
            }
            this.needsSync = false;
          }.bind(this))["catch"](function (error) {
            console.log("Ошибка синхронизации:", error);
            this.needsSync = true;
          }.bind(this));
        },
        sendDataToServer: function (token) {
          var syncedData = this.getSyncedData();
          var data = new FormData();
          data.append("syncedData", JSON.stringify(syncedData))
          return makeHttpRequest("POST", syncUrl + "/sync?token=" + encodeURIComponent(token), data).then(function (response) {
            if (response.status === 200) {
              this.isSyncSuccessful = true;
              return response.responseText;
            } else {
              this.isSyncSuccessful = false;
              console.log("Ошибка при синхронизации: " + response.status + " - " + response.statusText);
            }
          }.bind(this));
        },
        getSyncedData: function () {
          return {
            torrents_view: Lampa.Storage.get("torrents_view", "[]"),
            favorite: Lampa.Storage.get("favorite", "{}"),
            file_view: Lampa.Storage.get("file_view", "{}"),
            search_history: Lampa.Storage.get("search_history", "[]")
          };
        },
        loadDataFromServer: function (token) {
          return makeHttpRequest("GET", syncUrl + "/sync?token=" + encodeURIComponent(token)).then(function (response) {
            if (response.status === 200) {
              return JSON.parse(response.responseText);
            } else {
              console.log("Ошибка при загрузке данных: " + response.status + " - " + response.statusText);
            }
          }).then(function (res) {
              console.log(['loadDataFromServer', res])
              return res ? res : (console.log("Ошибка: Данные для синхронизации отсутствуют"), null);
          });
        },
        updateLocalStorage: function (data) {
          if (typeof data === "undefined") {
            return;
          }
          if (typeof data !== "object" || data === null) {
            console.log("Ошибка: Данные для синхронизации некорректны или отсутствуют");
            return;
          }
          var items = ["torrents_view", "favorite", "file_view", "search_history"];
          for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (data.hasOwnProperty(item) && (Array.isArray(data[item]) || typeof data[item] === "object")) {
              if (item === "favorite") {
                Lampa.Storage.set("favorite", data[item]);
                Lampa.Favorite.init();
              } else {
                Lampa.Storage.set(item, data[item]);
              }
            } else {
              console.log("Ошибка: Данные для ключа \"" + item + "\" некорректны");
            }
          }
        }
      };
      Lampa.Storage.listener.follow("change", function (storage) {
        if (Lampa.Storage.field("acc_sync")) {
          plugInfo.handleStorageChange(storage);
        }
      });
      var intervalId = setInterval(function () {
        if (typeof Lampa !== "undefined") {
          clearInterval(intervalId);
          var token = localStorage.getItem("token");
          var isAccSync = Lampa.Storage.get("acc_sync", false);
          if (token && isAccSync) {
            plugInfo.loadDataFromServer(token).then(function (data) {
              if (data) {
                console.log("updateLocalStorage")
                plugInfo.updateLocalStorage(data);
                intervalId = true;
              } else {
                console.log("Не удалось загрузить данные для синхронизации");
              }
            })["catch"](function (error) {
              console.log("Ошибка при загрузке данных:", error);
            });
          } else {
            console.log("Вы не зашли в аккаунт или синхронизация отключена");
          }
        }
      }, 200);
      Lampa.SettingsApi.addParam({
        component: "acc",
        param: {
          name: "sync_init",
          type: "button"
        },
        field: {
          name: "Первичная синхронизация",
          description: "Внимание !!! Используется для первичной синхронизации, если данных о пользователе нет в базе"
        },
        onRender: function (item) {
          item.on("hover:enter", function () {
            Lampa.Modal.open({
              title: "",
              align: 'center',
              html: $('<div class="about">Данные действие перезатрёт существующую историю. Вы уверены?</div>'),
              onBack: function onBack() {
                Lampa.Modal.close();
              },
              buttons: [{
                name: "Нет",
                onSelect: function onSelect() {
                  Lampa.Modal.close();
                }
              }, {
                name: "Да",
                onSelect: function onSelect() {
                  var token = localStorage.getItem("token");
                  if (!token) {
                    Lampa.Noty.show("Вы не зашли в аккаунт");
                    Lampa.Modal.close();
                    return
                  }
                  plugInfo.startSync(token, function () {
                    Lampa.Noty.show("Первичная синхронизация завершена");
                  });
                  Lampa.Modal.close();
                }
              }]
            });
          });
        }
      });
      Lampa.SettingsApi.addParam({
        component: "acc",
        param: {
          name: "sync_reset",
          type: "button"
        },
        field: {
          name: "Сброс данных синхронизации",
          description: "Внимание !!! После нажатия ваши синхронизированные данные будут удалены"
        },
        onRender: function (item) {
          item.on("hover:enter", function () {
            var token = localStorage.getItem("token");
            if (!token) {
              Lampa.Noty.show("Вы не зашли в аккаунт");
              return
            }
            var url = syncUrl + "/sync?token=" + encodeURIComponent(token);
            var request = new XMLHttpRequest();
            request.open("DELETE", url);
            request.onload = function () {
              if (request.status === 200) {
                Lampa.Noty.show("Данные синхронизации удалены, приложение будет перезапущено ");
                  setTimeout(function () {
                    window.location.reload();
                  }, 300);
              } else {
                console.error("Ошибка при удалении данных синхронизации:", request.status, request.statusText);
                Lampa.Noty.show("Ошибка при удалении или данные отсутствуют");
              }
            };
            request.onerror = function () {
              console.error("Ошибка при удалении данных синхронизации:", request.status, request.statusText);
              Lampa.Noty.show("Ошибка при удалении или данные отсутствуют");
            };
            request.send();
          });
        }
      });
    }
    if (window.appready) {
      initializeAccountSettings();
    } else {
      Lampa.Listener.follow("app", function (item) {
        if (item.type == "ready") {
          initializeAccountSettings();
        }
      });
    }
  })();
})();
