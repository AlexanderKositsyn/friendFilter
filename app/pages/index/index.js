/*---images---*/
import "../../img/avatar_my.jpg";
import "../../img/feeds_avatar1.png";
import "../../img/feeds_avatar2.png";

/*---styles---*/
import "normalize.css";
import "../../sass/base.scss";

/*---js---*/
import svg4everybody from "../../../node_modules/svg4everybody/dist/svg4everybody";
import Handlebars from "handlebars";

/*---js modules---*/

function vkInit() {
  return new Promise((res, rej) => {
    window.vkAsyncInit = function() {
      VK.init({
        apiId: 6362352
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

function vkMethod(method, param) {
  return new Promise((res, rej) => {
    VK.Api.call(method, param, function(response) {
      res(response.response);
    });
  });
}

// проверим пуст ли sessionStorage
// vkInit одна строчка
if (sessionStorage.length === 0)
  vkInit()
    .then(() => {
      return vkMethod("friends.get", { fields: "photo_100,nickname" });
    })
    .then(response => {
      // возьмем шаблоны из html
      let source = document.getElementById("friend-template").innerHTML;
      // откомпилируем его
      let template = Handlebars.compile(source);
      // подготовим данные к компиляции в html
      response = { people: response };

      // передадим response(с друзьями) в этот шаблон и получим html текст, который вставим в ul
      let html = template(response);
      // найдем список в html для вставки туда списка друзей
      let list = document.getElementById("allFriendsList");
      // вставляем
      list.innerHTML = html;

      //////////////
      // перенос по кнопкам
      /////////////
      // ставим обработчик на весь friendFilter
      let friendFilter = document.querySelector(".friend-filter");
      friendFilter.addEventListener("click", e => {
        if (
          e.target.classList.contains("friend-filter__button") ||
          e.target.classList.contains("friend-filter__add") ||
          e.target.classList.contains("friend-filter__remove")
        ) {
          let allFriendsList = document.querySelector("#allFriendsList");
          let sortedFriendsList = document.querySelector("#sortedFriendsList");
          // найдем item
          let selectedElement = e.target.closest(".friend-filter__main-item");
          // найдем в каком списке находится item и отправим в противоположный
          // и также нужно изменить класс у кнопки
          if (selectedElement.closest("#sortedFriendsList") !== null) {
            allFriendsList.appendChild(selectedElement);
            selectedElement
              .querySelector(".friend-filter__remove")
              .classList.add("friend-filter__add");
            selectedElement
              .querySelector(".friend-filter__remove")
              .classList.remove("friend-filter__remove");

            return;
          }

          if (selectedElement.closest("#allFriendsList") !== null) {
            sortedFriendsList.appendChild(selectedElement);
            selectedElement
              .querySelector(".friend-filter__add")
              .classList.add("friend-filter__remove");
            selectedElement
              .querySelector(".friend-filter__add")
              .classList.remove("friend-filter__add");
          }
        }
      });

      ////////////
      //сделаем элементы перетаскиваемыми
      ////////////////
      let dragged;
      function dragStart(ev) {
        // ставим какой элемнеты мы перетаскиваем
        // closest вернет либо сам элемент либо его родителя с таким классом
        dragged = ev.target.closest(".friend-filter__main-item");
      }
      function dragOver(ev) {
        ev.preventDefault();
        // чисто визульная подсказка что будет перемещение
        ev.dataTransfer.dropEffect = "move";
      }
      function drop(ev) {
        ev.preventDefault();
        // ищем в какой контейнер мы навели
        let containerToDrop = ev.target.closest(".friend-filter__main-list");
        // вставляем в конец
        containerToDrop.appendChild(dragged);

        // и также нужно изменить класс у кнопки
        if (dragged.closest("#sortedFriendsList") !== null) {
          console.log(dragged);
          dragged
            .querySelector(".friend-filter__add")
            .classList.add("friend-filter__remove");
          dragged
            .querySelector(".friend-filter__add")
            .classList.remove("friend-filter__add");

          return;
        }
        if (dragged.closest("#allFriendsList") !== null) {
          dragged
            .querySelector(".friend-filter__remove")
            .classList.add("friend-filter__add");
          dragged
            .querySelector(".friend-filter__remove")
            .classList.remove("friend-filter__remove");
        }
      }

      // ставим обработчики на перемещение
      let allFriendsList = document.querySelector("#allFriendsList");
      let sortedFriendsList = document.querySelector("#sortedFriendsList");

      allFriendsList.addEventListener("dragover", dragOver);
      sortedFriendsList.addEventListener("dragover", dragOver);
      allFriendsList.addEventListener("drop", drop);
      sortedFriendsList.addEventListener("drop", drop);
      friendFilter.addEventListener("dragstart", dragStart);

      ////////////
      // сортировка по инпутам
      //////////
      let inputAllFriendsList = document.querySelector("#inputAllFriendsList");
      let inputSortedFriendsList = document.querySelector(
        "#inputSortedFriendsList"
      );

      // обработчик для инпутов
      let inputFilterHandler = function(list, input) {
        // найдем все элементы в списке
        let listItems = list.querySelectorAll(".friend-filter__main-item");
        // сделаем фильтр по инпуту
        console.log(list);
        listItems.forEach(item => {
          // сбросим сначала значение display, чтобы все было видно
          item.style.display = "flex";
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
      inputAllFriendsList.addEventListener(
        "input",
        inputFilterHandler.bind(null, allFriendsList, inputAllFriendsList)
      );
      // обработчик на инпут для сортированных друзей
      inputSortedFriendsList.addEventListener(
        "input",
        inputFilterHandler.bind(null, sortedFriendsList, inputSortedFriendsList)
      );

      //////////
      /// Сохраним по нажатию клика sessionStorage
      /////////

      let saveButton = document.querySelector(".friend-filter__footer-save");

      saveButton.addEventListener("click", () => {
        // формируем json чтобы ее сохранить в sessionStorage
        // найдем спискт
        let allFriendsList = document.getElementById("allFriendsList");
        let sortedFriendsList = document.getElementById("sortedFriendsList");
        // найдем все item в этих списках
        let allFriendsListItem = allFriendsList.querySelectorAll(
          ".friend-filter__main-item"
        );
        let sortedFriendsListItem = sortedFriendsList.querySelectorAll(
          ".friend-filter__main-item"
        );
        // массивы из строк для разных списков
        let allFriendsArray = [];
        let sortedFriendsArray = [];
        // найдем все НЕ отсортированные друзья
        allFriendsListItem.forEach(item => {
          allFriendsArray.push(
            `${item.innerText.trim()} ${
              item.querySelector(".friend-filter__avatar-img").src
            }`
          );
        });
        console.log(allFriendsArray);
        // найдем все отсортированные друзья
        sortedFriendsListItem.forEach(item => {
          sortedFriendsArray.push(
            `${item.innerText.trim()} ${
              item.querySelector(".friend-filter__avatar-img").src
            }`
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
    })
    .catch(err => {
      console.error(err);
    });

if (sessionStorage.length !== 0) {
  console.log("сессия не пуста");
}
