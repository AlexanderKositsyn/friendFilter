// Импортим js библиотеки
import Handlebars from "handlebars";
import Widget from "./Widget";

export default class FriendFilter extends Widget {
  constructor(options = {}) {
    super();
    console.log(options);
    // корневой элемент для друго фильтра
    this.friendFilter = document.getElementById(options.idFriendFilter);
    // надем все необходимые элементы
    // для не фильтрованных
    this.unfilteredInput = document.getElementById(options.idUnfilteredInput);
    this.unfilteredList = document.getElementById(options.idUnfilteredList);
    // для фильтрованных
    this.filteredInput = document.getElementById(options.idFilteredInput);
    this.filteredList = document.getElementById(options.idFilteredList);
    // для кнопки сохранить в сессии
    this.saveButton = document.getElementById(options.idSaveButton);
    // класс для кнопок переключения между списками
    this.buttonToggleClass = options.buttonToggleClass;
  }

  // 6362352
  // подключаемся к приложению ВК
  vkInit(apiId) {
    return new Promise(function(res, rej) {
      window.vkAsyncInit = function() {
        VK.init({
          apiId
        });

        VK.Auth.login(session => {
          // проверим статус ответа
          if (session.status === "connected") {
            console.log("подключились");
            res();
            return;
          }

          rej(new Error("не удалось подключиться"));
        }, 6);
      };

      setTimeout(function() {
        var el = document.createElement("script");
        el.type = "text/javascript";
        el.src = "https://vk.com/js/api/openapi.js?152";
        el.async = true;
        document.getElementById("vk_api_transport").appendChild(el);
      }, 0);
    });
  }

  // запрос на Vk
  vkMethod(method, param) {
    return new Promise(function(res, rej) {
      VK.Api.call(method, param, function(response) {
        res(response.response);
      });
    });
  }

  // функция рендер
  render(idTemplate, data, listId) {
    // возьмем шаблоны из html
    let source = document.getElementById(idTemplate).innerHTML;
    // откомпилируем его
    let template = Handlebars.compile(source);

    // передадим response(с друзьями) в этот шаблон и получим html текст, который вставим в ul
    let html = template(data);
    // найдем список в html для вставки туда списка друзей
    let list = document.getElementById(listId);
    // вставляем
    list.innerHTML = html;
  }

  dragAndDrop() {
    ////////////
    //сделаем элементы перетаскиваемыми
    ////////////////
    let dragged;
    function dragStart(ev) {
      // ставим какой элемнеты мы перетаскиваем
      // closest вернет либо сам элемент либо его родителя с тегом li
      dragged = ev.target.closest("li");
    }
    function dragOver(ev) {
      ev.preventDefault();
      // чисто визульная подсказка что будет перемещение
      ev.dataTransfer.dropEffect = "move";
    }
    function drop(ev) {
      ev.preventDefault();
      // ищем в какой контейнер мы навели
      let containerToDrop = ev.target.closest("ul");
      // вставляем в конец
      containerToDrop.appendChild(dragged);
    }

    // // ставим обработчики на перемещение
    // let allFriendsList = document.querySelector("#allFriendsList");
    // let sortedFriendsList = document.querySelector("#sortedFriendsList");
    // let friendFilter = document.querySelector(".friend-filter");

    // обработчики для списков
    this.unfilteredList.addEventListener("dragover", dragOver);
    this.filteredList.addEventListener("dragover", dragOver);
    this.unfilteredList.addEventListener("drop", drop);
    this.filteredList.addEventListener("drop", drop);
    // обработчки для корневого элемента
    this.friendFilter.addEventListener("dragstart", dragStart);
  }

  saveDataToStorage() {
    //////////
    /// Сохраним по нажатию клика sessionStorage
    /////////

    saveButton.addEventListener("click", () => {
      // формируем json чтобы ее сохранить в sessionStorage
      // найдем все item в этих списках
      let allFriendsListItem = this.unfilteredList.querySelectorAll("li");
      let sortedFriendsListItem = this.filteredList.querySelectorAll("li");
      // массивы из строк для разных списков
      let allFriendsArray = [];
      let sortedFriendsArray = [];
      // найдем все НЕ отсортированные друзья
      allFriendsListItem.forEach(item => {
        allFriendsArray.push(
          `${item.innerText.trim()} ${item.querySelector("img").src}`
        );
      });
      console.log(allFriendsArray);
      // найдем все отсортированные друзья
      sortedFriendsListItem.forEach(item => {
        sortedFriendsArray.push(
          `${item.innerText.trim()} ${item.querySelector("img").src}`
        );
      });
      console.log(sortedFriendsArray);
      // перегоним массивы в json
      let jsonAllFriends = JSON.stringify(allFriendsArray);
      let jsonSortedFriends = JSON.stringify(sortedFriendsArray);
      console.log(jsonAllFriends);
      console.log(jsonSortedFriends);
      // сохраняем данные в sessionStorage
      sessionStorage.setItem("allFriend", jsonAllFriends);
      sessionStorage.setItem("sortedFriend", jsonSortedFriends);
    });
  }

  replaceClickButton() {
    //////////////
    // перенос по кнопкам
    /////////////
    // ставим обработчик на весь friendFilter
    this.friendFilter.addEventListener(
      "click",
      function(e) {
        if (e.target.classList.contains(this.buttonToggleClass)) {
          // найдем item
          let selectedElement = e.target.closest("li");
          // найдем в каком списке находится item и отправим в противоположный
          if (selectedElement.closest(`#${this.filteredList.id}`) !== null) {
            this.unfilteredList.appendChild(selectedElement);
            return;
          }
          if (selectedElement.closest(`#${this.unfilteredList.id}`) !== null) {
            this.filteredList.appendChild(selectedElement);
          }
        }
      }.bind(this)
    );
  }

  sortFriends() {
    ////////////
    // сортировка по инпутам
    //////////

    // обработчик для инпутов
    let inputFilterHandler = function(list, input) {
      // найдем все элементы в списке
      let listItems = list.querySelectorAll("li");
      // сделаем фильтр по инпуту
      listItems.forEach(item => {
        // сбросим сначала значение display, чтобы все было видно
        item.style.display = "";
        // Возьмем имя друга
        let name = item.querySelector(".friend-filter__name").textContent;
        // если нет совпадений то ставим display none
        if (name.indexOf(input.value) < 0) {
          item.style.display = "none";
        }
      });
    };
    // обработчик на инпут для всех друзей
    // делаем из новую функцию из общей функции inputFilterHandler
    // bind создаст новую функцию с привязанными агрументами
    this.unfilteredInput.addEventListener(
      "input",
      inputFilterHandler.bind(null, this.unfilteredList, this.unfilteredInput)
    );
    // обработчик на инпут для сортированных друзей
    this.filteredInput.addEventListener(
      "input",
      inputFilterHandler.bind(null, this.filteredList, this.filteredInput)
    );
  }

  initFriendFilter() {
    console.log(this);
    // проверим сразу сессию
    if (sessionStorage.length !== 0) {
      console.log("сессия не пуста");

      // возьмем данные из сессии
      // и подгоним из под шаблон
      let allFriend = {
        people: JSON.parse(sessionStorage.getItem("allFriend"))
      };
      let sortedFriend = {
        people: JSON.parse(sessionStorage.getItem("sortedFriend"))
      };
      allFriend.people = allFriend.people.map(item => {
        item = item.split(" ");
        return {
          first_name: item[0],
          last_name: item[1],
          photo_100: item[2]
        };
      });
      sortedFriend.people = sortedFriend.people.map(item => {
        item = item.split(" ");
        return {
          first_name: item[0],
          last_name: item[1],
          photo_100: item[2]
        };
      });

      // рендерим шаблон при помощи нашей функции
      this.render("friend-template", allFriend, "allFriendsList");
      this.render("friend-template", sortedFriend, "sortedFriendsList");

      // включаем весь интерфейс
      this.dragAndDrop();
      this.saveDataToStorage();
      this.replaceClickButton();
      this.sortFriends();
    }

    // проверим пуст ли sessionStorage
    // vkInit одна строчка
    if (sessionStorage.length === 0)
      this.vkInit(6362352)
        .then(
          function() {
            return this.vkMethod("friends.get", {
              fields: "photo_100,nickname"
            });
          }.bind(this)
        )
        .then(
          function(response) {
            // подготовим данные к компиляции в html
            response = { people: response };
            // рендерим друзей
            this.render("friend-template", response, "allFriendsList");

            // включаем весь интерфейс
            this.dragAndDrop();
            this.saveDataToStorage();
            this.replaceClickButton();
            this.sortFriends();
          }.bind(this)
        )
        .catch(err => {
          console.error(err);
        });
  }
}
