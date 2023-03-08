"use strict";

let elForm = document.querySelector(".search-form");
let elBooks = document.querySelector(".books");
let elPaginationList = document.querySelector(".pagination__btns");
let elBookmark = document.querySelector(".bookmark__list");
let elCardBtns = document.querySelector(".books__btn");
let elCard = document.querySelector(".books__card");
let elCardNull = document.querySelector(".cards-default");
let elNewest = document.querySelector(".main__orderbtn");
let elCanvas = document.querySelector(".canvas");

let inputValue = "search+terms";
let page = 1;
let startIndex = (page - 1) * 15 + 1;
let bookmarkBooks =
  JSON.parse(window.localStorage.getItem("localBookmark")) || [];
let bookmarkId = null;
let infoId;
let data;
let orderByNewest = "&";

//LOGIN TOKEN
if (window.localStorage.getItem("token") == null) {
  window.location.replace("login.html");
}

// SAVING OR NOT SAVING TOKEN IN LOCAL STORAGE
logout.addEventListener("click", () => {
  let localToken = window.localStorage.getItem("token");
  if (localToken) {
    window.localStorage.removeItem("token");
  }
  window.location.replace("login.html");
});

//FETCH API IN RENDER BOOKS
const renderData = async function () {
  startIndex = (page - 1) * 15 + 1;
  try {
    let request = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${inputValue}&maxResults=15&startIndex=${startIndex}${orderByNewest}`
    );
    data = await request.json();
    renderCards(data, elBooks);
    renderBtn(data, elPaginationList);
  } catch {
    errorRender();
  }
};
renderData();

// RENDER BOOKS IN CREATE CARDS
function renderCards(data, element) {
  element.innerHTML = null;
  let books = data.items;
  let bookmarkId = 0;
  let author;
  let year;
  if (books === undefined) {
    elCardNull.classList.remove("visually-hidden");
    pagination.classList.add("visually-hidden");
  } else {
    books.forEach((book) => {
      if (book.volumeInfo.authors == undefined) {
        author = "Muallif keltirilmagan !";
      } else {
        author = book.volumeInfo.authors;
      }

      if (book.volumeInfo.publishedDate == undefined) {
        year = "Yil keltirilmagan !";
      } else {
        year = book.volumeInfo.publishedDate;
      }

      const htmlBook = `<div class="books__card col-3  ">
                <div class="books__card-img">
                  <img
                    class="books__img"
                    src=${book.volumeInfo.imageLinks?.thumbnail}
                    alt="book image"
                  />
                </div>

                <div class="books__card-body">
                  <h2 class="books__name" >${book.volumeInfo.title.slice(' ', 20) + '...'}</h2>
                  <p class="books__author" >${author[0].slice(' ', 20) + '...'}</p>
                  <p class="books__year" >${year}</p>
                </div>
                <div
                    class="books__btn d-flex flex-wrap justify-content-between "
                  >
                    <button class="books__bookmark-btn" data-bookmark="${bookmarkId}">Bookmark</button>
                    <button class="books__info-btn" data-infoBtn="${bookmarkId}" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">More Info</button>
                    <a href="${book.volumeInfo.previewLink}" class="books__read-btn" data-readBtn="${bookmarkId}">Read</a>
                  </div>
              </div>`;
      element.insertAdjacentHTML("beforeend", htmlBook);
      bookmarkId++;
    });
  }
}

// SEARCH
elForm.addEventListener("input", function (evt) {
  evt.preventDefault();
  inputValue = searchInput.value.trim();
  if(inputValue == 0){
    window.location.reload();
  }
  renderData();
});

//ORDER BY NEWEST
elNewest.addEventListener("click", function () {
  orderByNewest = "&";
  orderByNewest += "orderBy=newest";
  renderData();
});

//ERROR API
function errorRender() {
  let error = `API BILAN BOG'LIQ MUAMMO YUZAGA KELDI !!!`;
  elBooks.insertAdjacentHTML("beforeend", error);
  pagination.classList.add("visually-hidden");
}

//BOOKMARK
elBooks.addEventListener("click", function (evt) {
  if (evt.target.matches(".books__bookmark-btn")) {
    bookmarkId = evt.target.dataset.bookmark;
    bookMarkPush(data);
  }
});

function renderBookmark(books, element) {
  if (books.length > 0 || bookmarkBooks != null) {
    element.innerHTML = null;
    let author;
    let counter = 0;
    books.forEach((book) => {
      if (book.volumeInfo.authors == undefined) {
        author = "Muallif keltirilmagan !";
      } else {
        author = book.volumeInfo.authors;
      }

      const htmlBook = `<li class="bookmark__item">
      <div class="bookmark__item-right">
        <p class="bookmark__item-name">${book.volumeInfo.title.slice(' ', 15) + '...'}</p>
        <p class="bookmark__item-author">${author[0].slice(' ', 20) + '...'}</p>
      </div>
      <div class="bookmark__item-left">
        <a class="bookmark__read" href="${book.volumeInfo.previewLink}" >
          <img data-bookmarkRead="${counter}" src="./img/book-open.svg" alt="book icon" />
        </a>
        <button class="bookmark__delete" >
          <img  data-bookmarkDeleted="${counter}" class="bookmark__delete-icon" src="./img/delete.svg" alt="delete-icon" />
        </button>
      </div>
    </li>`;
      counter++;
      element.insertAdjacentHTML("beforeend", htmlBook);
    });
  }
}

//DELETE BOOKMARK
elBookmark.addEventListener("click", function (evt) {
  if (evt.target.matches(".bookmark__delete-icon")) {
    let bookmarkBooksId = evt.target.dataset.bookmarkDeleted;
    bookmarkBooks.splice(bookmarkBooksId, 1);
    window.localStorage.setItem("localBookmark", JSON.stringify(bookmarkBooks));
    renderBookmark(bookmarkBooks, elBookmark);
  }
});

// SAVE LOCAL STORAGE BOOKMARK
function bookMarkPush(data) {
  let books = data.items;
  if (bookmarkId) {
    if (!bookmarkBooks.find((book) => book.id == books[bookmarkId].id)) {
      bookmarkBooks.push(books[bookmarkId]);
      window.localStorage.setItem(
        "localBookmark",
        JSON.stringify(bookmarkBooks)
      );
    }
  }
  bookmarkBooks =
    JSON.parse(window.localStorage.getItem("localBookmark")) || [];
  renderBookmark(bookmarkBooks, elBookmark);
}
renderBookmark(bookmarkBooks, elBookmark);

//PAGINATION
function moveToCenter(page) {
  let a = document.createElement("a");
  a.href = `#z${page}`;
  a.innerHTML = "";
  a.click();
}

function renderBtn(data, element) {
  if (data.totalItems != 0 && data.items != undefined) {
    pagination.classList.remove("visually-hidden");
    elCardNull.classList.add("visually-hidden");
    showResult.textContent = data.totalItems;
  } else {
    showResult.textContent = 0;
  }

  element.innerHTML = null;
  let btnNumber = Math.ceil(data.totalItems / 15);
  for (let i = 1; i <= btnNumber; i++) {
    let htmlBtn = `<button id="z${i}" class="books-btn">${i}</button> `;

    if (page == i) {
      htmlBtn = `<button id="z${i}" class="activeBtn books-btn ">${i}</button> `;
    }
    element.insertAdjacentHTML("beforeend", htmlBtn);
  }

  if (page == 1) {
    prevBtn.disabled = true;
    prevBtn.classList.add("prev-bg");
  } else {
    prevBtn.disabled = false;
    prevBtn.classList.remove("prev-bg");
  }

  if (page == btnNumber) {
    nextBtn.disabled = true;
    nextBtn.classList.add("prev-bg");
  } else {
    nextBtn.disabled = false;
    nextBtn.classList.remove("prev-bg");
  }
}

elPaginationList.addEventListener("click", function (evt) {
  page = Number(evt.target.textContent);
  renderData();
});

prevBtn.addEventListener("click", function () {
  page--;
  moveToCenter(page)
  renderData();
});
nextBtn.addEventListener("click", function () {
  page++;
  moveToCenter(page)
  renderData();
});

//MODAL
elBooks.addEventListener("click", function (evt) {
  if (evt.target.matches(".books__info-btn")) {
    infoId = evt.target.dataset.infobtn;
    renderCanvas(data, elCanvas);
  }
});

function renderCanvas(data, element) {
  element.innerHTML = null;
  let bookInfo = data.items[infoId];
  let description;
  let author;
  let year;
  let publisher;
  let categories;
  let pageCount;

  if (bookInfo.volumeInfo.description == undefined) {
    description = "Ma'lumot keltirilmagan !";
  } else {
    description = bookInfo.volumeInfo.description;
  }

  if (bookInfo.volumeInfo.publishedDate == undefined) {
    year = "Yil keltirilmagan !";
  } else {
    year = bookInfo.volumeInfo.publishedDate;
  }

  if (bookInfo.volumeInfo.authors == undefined) {
    author = "Ma'lumot yo'q";
  } else {
    author = bookInfo.volumeInfo.authors[0];
  }

  if (bookInfo.volumeInfo.publisher == undefined) {
    publisher = "Ma'lumot yo'q";
  } else {
    publisher = bookInfo.volumeInfo.publisher;
  }

  if (bookInfo.volumeInfo.categories == undefined) {
    categories = "Ma'lumot yo'q";
  } else {
    categories = bookInfo.volumeInfo.categories[0];
  }

  if (bookInfo.volumeInfo.pageCount == undefined) {
    pageCount = "Ma'lumot yo'q";
  } else {
    pageCount = bookInfo.volumeInfo.pageCount;
  }

  let htmlInfoCard = `<div class="offcanvas-header">
    <h5 class="canvas__name" id="offcanvasRightLabel">${bookInfo.volumeInfo.title}</h5>
    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
  </div>
  <div class="offcanvas-body">
    <img class="canvas__img" src="${bookInfo.volumeInfo.imageLinks?.smallThumbnail}" alt="photo" >
    <p class="canvas__desc">${description}</p>
  </div>
  <ul class="canvas__list">
    <li class="canvas__item">Author : <p class="canvas__item-book">${author}</p></li>
     <li class="canvas__item">Published : <p class="canvas__item-book">${year}</p></li>
    <li class="canvas__item">Publishers: <p class="canvas__item-book">${publisher}</p></li>
    <li class="canvas__item">categories:<p class="canvas__item-book">${categories}</p></li>
    <li class="canvas__item">Pages Count:<p class="canvas__item-book">${pageCount}</p></li>
  </ul>
  <div class="canvas__footer"><a href="${bookInfo.volumeInfo.previewLink}" class="canvas__read-btn">Read</a></div>`;
  element.insertAdjacentHTML("beforeend", htmlInfoCard);
}