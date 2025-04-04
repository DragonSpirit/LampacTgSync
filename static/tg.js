(function () {
  "use strict";

  Lampa.Platform.tv();
  (function () {
    "use strict";
    
    // Секция конфигурации **********
    
    var botLink = window.botLink || "https://t.me/lampac_sync_bot"
    var syncUrl = window.syncUrl || "http://192.168.1.133:8080"

    // ******************************

    var accountInfoBlock = $("<div class=\"myBot\" style=\"line-height: 1;color: currentColor;font-family: 'Segoe UI', sans-serif;font-size: 1em;box-sizing: border-box;outline: none;user-select: none;display: flex;flex-direction: row;align-items: center;position: relative;background-color: rgba(255, 255, 255, 0.1);border-radius: 0.3em;margin: 1.5em 2em;padding: 1em;\">"+
    "<div style=\"flex: 1;\">"+
        "<div class=\"ad-server__text\" style=\"padding: unset; padding-bottom: 0.5em;\">Для получения токена перейдите в Telegram бот</div>"+
        "<div style=\"background-color: #E0C3FC;padding: 0.5em;color: #000;border-radius: 0.3em;margin-top: 0.5em;\">"+
            "<a href=\"" + botLink + "\" style=\"color: #000;text-decoration: none;\">" + botLink + "</a>"+
        "</div>"+
    "</div>"+
    "<div id=\"qrcode\" style=\"width: 100px; height: 100px; margin-left: 1em; border-radius: 0.3em;\">"+
    "</div>");

    var qrcode;


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
            var element = document.querySelector("#app > div.settings > div.settings__content.layer--height > div.settings__body > div > div > div > div > div:nth-child(5)");
            Lampa.Controller.focus(element);
            Lampa.Controller.toggle("settings_component");
          } else {
            $("div[data-name=\"acc_auth\"]").before(accountInfoBlock);
            if (qrcode) {
              qrcode.clear();
              qrcode.makeCode(botLink)
            } else {
              qrcode = new QRCode(document.getElementById("qrcode"), botLink);
            }
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
          return this.makeHttpRequest("POST", syncUrl + "/sync?token=" + encodeURIComponent(token), data).then(function (response) {
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
          return this.makeHttpRequest("GET", syncUrl + "/sync?token=" + encodeURIComponent(token)).then(function (response) {
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
        makeHttpRequest: function (type, url, data) {
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
            var token = localStorage.getItem("token");
            if (!token) {
              Lampa.Noty.show("Вы не зашли в аккаунт");
              return
            }
            plugInfo.startSync(token, function () {
              Lampa.Noty.show("Первичная синхронизация завершена");
            })
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


  // просто локальная генерация QR кода без привязки на левые ресурсы
  // @link https://github.com/davidshimjs/qrcodejs/blob/master/qrcode.min.js
  var QRCode;!function(){function a(a){this.mode=c.MODE_8BIT_BYTE,this.data=a,this.parsedData=[];for(var b=[],d=0,e=this.data.length;e>d;d++){var f=this.data.charCodeAt(d);f>65536?(b[0]=240|(1835008&f)>>>18,b[1]=128|(258048&f)>>>12,b[2]=128|(4032&f)>>>6,b[3]=128|63&f):f>2048?(b[0]=224|(61440&f)>>>12,b[1]=128|(4032&f)>>>6,b[2]=128|63&f):f>128?(b[0]=192|(1984&f)>>>6,b[1]=128|63&f):b[0]=f,this.parsedData=this.parsedData.concat(b)}this.parsedData.length!=this.data.length&&(this.parsedData.unshift(191),this.parsedData.unshift(187),this.parsedData.unshift(239))}function b(a,b){this.typeNumber=a,this.errorCorrectLevel=b,this.modules=null,this.moduleCount=0,this.dataCache=null,this.dataList=[]}function i(a,b){if(void 0==a.length)throw new Error(a.length+"/"+b);for(var c=0;c<a.length&&0==a[c];)c++;this.num=new Array(a.length-c+b);for(var d=0;d<a.length-c;d++)this.num[d]=a[d+c]}function j(a,b){this.totalCount=a,this.dataCount=b}function k(){this.buffer=[],this.length=0}function m(){return"undefined"!=typeof CanvasRenderingContext2D}function n(){var a=!1,b=navigator.userAgent;return/android/i.test(b)&&(a=!0,aMat=b.toString().match(/android ([0-9]\.[0-9])/i),aMat&&aMat[1]&&(a=parseFloat(aMat[1]))),a}function r(a,b){for(var c=1,e=s(a),f=0,g=l.length;g>=f;f++){var h=0;switch(b){case d.L:h=l[f][0];break;case d.M:h=l[f][1];break;case d.Q:h=l[f][2];break;case d.H:h=l[f][3]}if(h>=e)break;c++}if(c>l.length)throw new Error("Too long data");return c}function s(a){var b=encodeURI(a).toString().replace(/\%[0-9a-fA-F]{2}/g,"a");return b.length+(b.length!=a?3:0)}a.prototype={getLength:function(){return this.parsedData.length},write:function(a){for(var b=0,c=this.parsedData.length;c>b;b++)a.put(this.parsedData[b],8)}},b.prototype={addData:function(b){var c=new a(b);this.dataList.push(c),this.dataCache=null},isDark:function(a,b){if(0>a||this.moduleCount<=a||0>b||this.moduleCount<=b)throw new Error(a+","+b);return this.modules[a][b]},getModuleCount:function(){return this.moduleCount},make:function(){this.makeImpl(!1,this.getBestMaskPattern())},makeImpl:function(a,c){this.moduleCount=4*this.typeNumber+17,this.modules=new Array(this.moduleCount);for(var d=0;d<this.moduleCount;d++){this.modules[d]=new Array(this.moduleCount);for(var e=0;e<this.moduleCount;e++)this.modules[d][e]=null}this.setupPositionProbePattern(0,0),this.setupPositionProbePattern(this.moduleCount-7,0),this.setupPositionProbePattern(0,this.moduleCount-7),this.setupPositionAdjustPattern(),this.setupTimingPattern(),this.setupTypeInfo(a,c),this.typeNumber>=7&&this.setupTypeNumber(a),null==this.dataCache&&(this.dataCache=b.createData(this.typeNumber,this.errorCorrectLevel,this.dataList)),this.mapData(this.dataCache,c)},setupPositionProbePattern:function(a,b){for(var c=-1;7>=c;c++)if(!(-1>=a+c||this.moduleCount<=a+c))for(var d=-1;7>=d;d++)-1>=b+d||this.moduleCount<=b+d||(this.modules[a+c][b+d]=c>=0&&6>=c&&(0==d||6==d)||d>=0&&6>=d&&(0==c||6==c)||c>=2&&4>=c&&d>=2&&4>=d?!0:!1)},getBestMaskPattern:function(){for(var a=0,b=0,c=0;8>c;c++){this.makeImpl(!0,c);var d=f.getLostPoint(this);(0==c||a>d)&&(a=d,b=c)}return b},createMovieClip:function(a,b,c){var d=a.createEmptyMovieClip(b,c),e=1;this.make();for(var f=0;f<this.modules.length;f++)for(var g=f*e,h=0;h<this.modules[f].length;h++){var i=h*e,j=this.modules[f][h];j&&(d.beginFill(0,100),d.moveTo(i,g),d.lineTo(i+e,g),d.lineTo(i+e,g+e),d.lineTo(i,g+e),d.endFill())}return d},setupTimingPattern:function(){for(var a=8;a<this.moduleCount-8;a++)null==this.modules[a][6]&&(this.modules[a][6]=0==a%2);for(var b=8;b<this.moduleCount-8;b++)null==this.modules[6][b]&&(this.modules[6][b]=0==b%2)},setupPositionAdjustPattern:function(){for(var a=f.getPatternPosition(this.typeNumber),b=0;b<a.length;b++)for(var c=0;c<a.length;c++){var d=a[b],e=a[c];if(null==this.modules[d][e])for(var g=-2;2>=g;g++)for(var h=-2;2>=h;h++)this.modules[d+g][e+h]=-2==g||2==g||-2==h||2==h||0==g&&0==h?!0:!1}},setupTypeNumber:function(a){for(var b=f.getBCHTypeNumber(this.typeNumber),c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[Math.floor(c/3)][c%3+this.moduleCount-8-3]=d}for(var c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[c%3+this.moduleCount-8-3][Math.floor(c/3)]=d}},setupTypeInfo:function(a,b){for(var c=this.errorCorrectLevel<<3|b,d=f.getBCHTypeInfo(c),e=0;15>e;e++){var g=!a&&1==(1&d>>e);6>e?this.modules[e][8]=g:8>e?this.modules[e+1][8]=g:this.modules[this.moduleCount-15+e][8]=g}for(var e=0;15>e;e++){var g=!a&&1==(1&d>>e);8>e?this.modules[8][this.moduleCount-e-1]=g:9>e?this.modules[8][15-e-1+1]=g:this.modules[8][15-e-1]=g}this.modules[this.moduleCount-8][8]=!a},mapData:function(a,b){for(var c=-1,d=this.moduleCount-1,e=7,g=0,h=this.moduleCount-1;h>0;h-=2)for(6==h&&h--;;){for(var i=0;2>i;i++)if(null==this.modules[d][h-i]){var j=!1;g<a.length&&(j=1==(1&a[g]>>>e));var k=f.getMask(b,d,h-i);k&&(j=!j),this.modules[d][h-i]=j,e--,-1==e&&(g++,e=7)}if(d+=c,0>d||this.moduleCount<=d){d-=c,c=-c;break}}}},b.PAD0=236,b.PAD1=17,b.createData=function(a,c,d){for(var e=j.getRSBlocks(a,c),g=new k,h=0;h<d.length;h++){var i=d[h];g.put(i.mode,4),g.put(i.getLength(),f.getLengthInBits(i.mode,a)),i.write(g)}for(var l=0,h=0;h<e.length;h++)l+=e[h].dataCount;if(g.getLengthInBits()>8*l)throw new Error("code length overflow. ("+g.getLengthInBits()+">"+8*l+")");for(g.getLengthInBits()+4<=8*l&&g.put(0,4);0!=g.getLengthInBits()%8;)g.putBit(!1);for(;;){if(g.getLengthInBits()>=8*l)break;if(g.put(b.PAD0,8),g.getLengthInBits()>=8*l)break;g.put(b.PAD1,8)}return b.createBytes(g,e)},b.createBytes=function(a,b){for(var c=0,d=0,e=0,g=new Array(b.length),h=new Array(b.length),j=0;j<b.length;j++){var k=b[j].dataCount,l=b[j].totalCount-k;d=Math.max(d,k),e=Math.max(e,l),g[j]=new Array(k);for(var m=0;m<g[j].length;m++)g[j][m]=255&a.buffer[m+c];c+=k;var n=f.getErrorCorrectPolynomial(l),o=new i(g[j],n.getLength()-1),p=o.mod(n);h[j]=new Array(n.getLength()-1);for(var m=0;m<h[j].length;m++){var q=m+p.getLength()-h[j].length;h[j][m]=q>=0?p.get(q):0}}for(var r=0,m=0;m<b.length;m++)r+=b[m].totalCount;for(var s=new Array(r),t=0,m=0;d>m;m++)for(var j=0;j<b.length;j++)m<g[j].length&&(s[t++]=g[j][m]);for(var m=0;e>m;m++)for(var j=0;j<b.length;j++)m<h[j].length&&(s[t++]=h[j][m]);return s};for(var c={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},d={L:1,M:0,Q:3,H:2},e={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},f={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:1335,G18:7973,G15_MASK:21522,getBCHTypeInfo:function(a){for(var b=a<<10;f.getBCHDigit(b)-f.getBCHDigit(f.G15)>=0;)b^=f.G15<<f.getBCHDigit(b)-f.getBCHDigit(f.G15);return(a<<10|b)^f.G15_MASK},getBCHTypeNumber:function(a){for(var b=a<<12;f.getBCHDigit(b)-f.getBCHDigit(f.G18)>=0;)b^=f.G18<<f.getBCHDigit(b)-f.getBCHDigit(f.G18);return a<<12|b},getBCHDigit:function(a){for(var b=0;0!=a;)b++,a>>>=1;return b},getPatternPosition:function(a){return f.PATTERN_POSITION_TABLE[a-1]},getMask:function(a,b,c){switch(a){case e.PATTERN000:return 0==(b+c)%2;case e.PATTERN001:return 0==b%2;case e.PATTERN010:return 0==c%3;case e.PATTERN011:return 0==(b+c)%3;case e.PATTERN100:return 0==(Math.floor(b/2)+Math.floor(c/3))%2;case e.PATTERN101:return 0==b*c%2+b*c%3;case e.PATTERN110:return 0==(b*c%2+b*c%3)%2;case e.PATTERN111:return 0==(b*c%3+(b+c)%2)%2;default:throw new Error("bad maskPattern:"+a)}},getErrorCorrectPolynomial:function(a){for(var b=new i([1],0),c=0;a>c;c++)b=b.multiply(new i([1,g.gexp(c)],0));return b},getLengthInBits:function(a,b){if(b>=1&&10>b)switch(a){case c.MODE_NUMBER:return 10;case c.MODE_ALPHA_NUM:return 9;case c.MODE_8BIT_BYTE:return 8;case c.MODE_KANJI:return 8;default:throw new Error("mode:"+a)}else if(27>b)switch(a){case c.MODE_NUMBER:return 12;case c.MODE_ALPHA_NUM:return 11;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 10;default:throw new Error("mode:"+a)}else{if(!(41>b))throw new Error("type:"+b);switch(a){case c.MODE_NUMBER:return 14;case c.MODE_ALPHA_NUM:return 13;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 12;default:throw new Error("mode:"+a)}}},getLostPoint:function(a){for(var b=a.getModuleCount(),c=0,d=0;b>d;d++)for(var e=0;b>e;e++){for(var f=0,g=a.isDark(d,e),h=-1;1>=h;h++)if(!(0>d+h||d+h>=b))for(var i=-1;1>=i;i++)0>e+i||e+i>=b||(0!=h||0!=i)&&g==a.isDark(d+h,e+i)&&f++;f>5&&(c+=3+f-5)}for(var d=0;b-1>d;d++)for(var e=0;b-1>e;e++){var j=0;a.isDark(d,e)&&j++,a.isDark(d+1,e)&&j++,a.isDark(d,e+1)&&j++,a.isDark(d+1,e+1)&&j++,(0==j||4==j)&&(c+=3)}for(var d=0;b>d;d++)for(var e=0;b-6>e;e++)a.isDark(d,e)&&!a.isDark(d,e+1)&&a.isDark(d,e+2)&&a.isDark(d,e+3)&&a.isDark(d,e+4)&&!a.isDark(d,e+5)&&a.isDark(d,e+6)&&(c+=40);for(var e=0;b>e;e++)for(var d=0;b-6>d;d++)a.isDark(d,e)&&!a.isDark(d+1,e)&&a.isDark(d+2,e)&&a.isDark(d+3,e)&&a.isDark(d+4,e)&&!a.isDark(d+5,e)&&a.isDark(d+6,e)&&(c+=40);for(var k=0,e=0;b>e;e++)for(var d=0;b>d;d++)a.isDark(d,e)&&k++;var l=Math.abs(100*k/b/b-50)/5;return c+=10*l}},g={glog:function(a){if(1>a)throw new Error("glog("+a+")");return g.LOG_TABLE[a]},gexp:function(a){for(;0>a;)a+=255;for(;a>=256;)a-=255;return g.EXP_TABLE[a]},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)},h=0;8>h;h++)g.EXP_TABLE[h]=1<<h;for(var h=8;256>h;h++)g.EXP_TABLE[h]=g.EXP_TABLE[h-4]^g.EXP_TABLE[h-5]^g.EXP_TABLE[h-6]^g.EXP_TABLE[h-8];for(var h=0;255>h;h++)g.LOG_TABLE[g.EXP_TABLE[h]]=h;i.prototype={get:function(a){return this.num[a]},getLength:function(){return this.num.length},multiply:function(a){for(var b=new Array(this.getLength()+a.getLength()-1),c=0;c<this.getLength();c++)for(var d=0;d<a.getLength();d++)b[c+d]^=g.gexp(g.glog(this.get(c))+g.glog(a.get(d)));return new i(b,0)},mod:function(a){if(this.getLength()-a.getLength()<0)return this;for(var b=g.glog(this.get(0))-g.glog(a.get(0)),c=new Array(this.getLength()),d=0;d<this.getLength();d++)c[d]=this.get(d);for(var d=0;d<a.getLength();d++)c[d]^=g.gexp(g.glog(a.get(d))+b);return new i(c,0).mod(a)}},j.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],j.getRSBlocks=function(a,b){var c=j.getRsBlockTable(a,b);if(void 0==c)throw new Error("bad rs block @ typeNumber:"+a+"/errorCorrectLevel:"+b);for(var d=c.length/3,e=[],f=0;d>f;f++)for(var g=c[3*f+0],h=c[3*f+1],i=c[3*f+2],k=0;g>k;k++)e.push(new j(h,i));return e},j.getRsBlockTable=function(a,b){switch(b){case d.L:return j.RS_BLOCK_TABLE[4*(a-1)+0];case d.M:return j.RS_BLOCK_TABLE[4*(a-1)+1];case d.Q:return j.RS_BLOCK_TABLE[4*(a-1)+2];case d.H:return j.RS_BLOCK_TABLE[4*(a-1)+3];default:return void 0}},k.prototype={get:function(a){var b=Math.floor(a/8);return 1==(1&this.buffer[b]>>>7-a%8)},put:function(a,b){for(var c=0;b>c;c++)this.putBit(1==(1&a>>>b-c-1))},getLengthInBits:function(){return this.length},putBit:function(a){var b=Math.floor(this.length/8);this.buffer.length<=b&&this.buffer.push(0),a&&(this.buffer[b]|=128>>>this.length%8),this.length++}};var l=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]],o=function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){function g(a,b){var c=document.createElementNS("http://www.w3.org/2000/svg",a);for(var d in b)b.hasOwnProperty(d)&&c.setAttribute(d,b[d]);return c}var b=this._htOption,c=this._el,d=a.getModuleCount();Math.floor(b.width/d),Math.floor(b.height/d),this.clear();var h=g("svg",{viewBox:"0 0 "+String(d)+" "+String(d),width:"100%",height:"100%",fill:b.colorLight});h.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xlink","http://www.w3.org/1999/xlink"),c.appendChild(h),h.appendChild(g("rect",{fill:b.colorDark,width:"1",height:"1",id:"template"}));for(var i=0;d>i;i++)for(var j=0;d>j;j++)if(a.isDark(i,j)){var k=g("use",{x:String(i),y:String(j)});k.setAttributeNS("http://www.w3.org/1999/xlink","href","#template"),h.appendChild(k)}},a.prototype.clear=function(){for(;this._el.hasChildNodes();)this._el.removeChild(this._el.lastChild)},a}(),p="svg"===document.documentElement.tagName.toLowerCase(),q=p?o:m()?function(){function a(){this._elImage.src=this._elCanvas.toDataURL("image/png"),this._elImage.style.display="block",this._elCanvas.style.display="none"}function d(a,b){var c=this;if(c._fFail=b,c._fSuccess=a,null===c._bSupportDataURI){var d=document.createElement("img"),e=function(){c._bSupportDataURI=!1,c._fFail&&_fFail.call(c)},f=function(){c._bSupportDataURI=!0,c._fSuccess&&c._fSuccess.call(c)};return d.onabort=e,d.onerror=e,d.onload=f,d.src="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",void 0}c._bSupportDataURI===!0&&c._fSuccess?c._fSuccess.call(c):c._bSupportDataURI===!1&&c._fFail&&c._fFail.call(c)}if(this&&this._android&&this._android<=2.1){var b=1/window.devicePixelRatio,c=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(a,d,e,f,g,h,i,j){if("nodeName"in a&&/img/i.test(a.nodeName))for(var l=arguments.length-1;l>=1;l--)arguments[l]=arguments[l]*b;else"undefined"==typeof j&&(arguments[1]*=b,arguments[2]*=b,arguments[3]*=b,arguments[4]*=b);c.apply(this,arguments)}}var e=function(a,b){this._bIsPainted=!1,this._android=n(),this._htOption=b,this._elCanvas=document.createElement("canvas"),this._elCanvas.width=b.width,this._elCanvas.height=b.height,a.appendChild(this._elCanvas),this._el=a,this._oContext=this._elCanvas.getContext("2d"),this._bIsPainted=!1,this._elImage=document.createElement("img"),this._elImage.style.display="none",this._el.appendChild(this._elImage),this._bSupportDataURI=null};return e.prototype.draw=function(a){var b=this._elImage,c=this._oContext,d=this._htOption,e=a.getModuleCount(),f=d.width/e,g=d.height/e,h=Math.round(f),i=Math.round(g);b.style.display="none",this.clear();for(var j=0;e>j;j++)for(var k=0;e>k;k++){var l=a.isDark(j,k),m=k*f,n=j*g;c.strokeStyle=l?d.colorDark:d.colorLight,c.lineWidth=1,c.fillStyle=l?d.colorDark:d.colorLight,c.fillRect(m,n,f,g),c.strokeRect(Math.floor(m)+.5,Math.floor(n)+.5,h,i),c.strokeRect(Math.ceil(m)-.5,Math.ceil(n)-.5,h,i)}this._bIsPainted=!0},e.prototype.makeImage=function(){this._bIsPainted&&d.call(this,a)},e.prototype.isPainted=function(){return this._bIsPainted},e.prototype.clear=function(){this._oContext.clearRect(0,0,this._elCanvas.width,this._elCanvas.height),this._bIsPainted=!1},e.prototype.round=function(a){return a?Math.floor(1e3*a)/1e3:a},e}():function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){for(var b=this._htOption,c=this._el,d=a.getModuleCount(),e=Math.floor(b.width/d),f=Math.floor(b.height/d),g=['<table style="border:0;border-collapse:collapse;">'],h=0;d>h;h++){g.push("<tr>");for(var i=0;d>i;i++)g.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:'+e+"px;height:"+f+"px;background-color:"+(a.isDark(h,i)?b.colorDark:b.colorLight)+';"></td>');g.push("</tr>")}g.push("</table>"),c.innerHTML=g.join("");var j=c.childNodes[0],k=(b.width-j.offsetWidth)/2,l=(b.height-j.offsetHeight)/2;k>0&&l>0&&(j.style.margin=l+"px "+k+"px")},a.prototype.clear=function(){this._el.innerHTML=""},a}();QRCode=function(a,b){if(this._htOption={width:256,height:256,typeNumber:4,colorDark:"#000000",colorLight:"#ffffff",correctLevel:d.H},"string"==typeof b&&(b={text:b}),b)for(var c in b)this._htOption[c]=b[c];"string"==typeof a&&(a=document.getElementById(a)),this._android=n(),this._el=a,this._oQRCode=null,this._oDrawing=new q(this._el,this._htOption),this._htOption.text&&this.makeCode(this._htOption.text)},QRCode.prototype.makeCode=function(a){this._oQRCode=new b(r(a,this._htOption.correctLevel),this._htOption.correctLevel),this._oQRCode.addData(a),this._oQRCode.make(),this._el.title=a,this._oDrawing.draw(this._oQRCode),this.makeImage()},QRCode.prototype.makeImage=function(){"function"==typeof this._oDrawing.makeImage&&(!this._android||this._android>=3)&&this._oDrawing.makeImage()},QRCode.prototype.clear=function(){this._oDrawing.clear()},QRCode.CorrectLevel=d}();

  })();
})();
