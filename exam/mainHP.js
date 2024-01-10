// Константы для API
const API_ADDRESS = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru';
const API_KEY = "f9aa6e2e-feb2-4094-ad8c-bc346a11d342";

// Переменные для управления страницей и данными
let ACTIVE_PAGE = 1;
let ROUTES_DATA = [];

// Переменные для хранения информации о выбранном маршруте и гиде
let currentPricePerHour = 0;
let currentRouteId = 0;
let currentGuideId = 0;

// Обрезает текст до указанного количества слов
function shortenText(text) {
    let firstPeriodIndex = text.indexOf('.');
    if (firstPeriodIndex !== -1) {
        firstSentence = text.substring(0, firstPeriodIndex + 1);
    } else {
        firstSentence = text;
    }

    let words = firstSentence.split(/\s+/);

    if (words.length > 10) {
        return words.slice(0, 10).join(' ') + '...';
    }

    return firstSentence;
}

function showAlert(message, type) {
    // Создание HTML-кода предупреждения с использованием шаблонной строки
    const alertHtml = `
        <div class="alert alert-${type} 
        alert-dismissible fade show" role="alert">
            ${message} 
            <button type="button" class="btn-close" 
            data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;

    const alertContainer = document.getElementById('alert-container');
    alertContainer.innerHTML += alertHtml;//Добавление предупреждения вконтейнер

    // Установка таймера для автоматического удаления предупреждения
    setTimeout(() => {
        const alert = alertContainer.querySelector('.alert');
        if (alert) alert.remove();
    }, 5000);
}

// Создает HTML элемент для страницы
function createPageItem(page, isActive = false, 
    isDisabled = false, text = page) {
    if (isActive) {
        activeClass = 'active';
    } else {
        activeClass = '';
    }
    if (isDisabled) {
        disabledClass = 'disabled';
    } else {
        disabledClass = '';
    }
    return `
        <li class="page-item ${activeClass} ${disabledClass}">
            <a class="page-link" href="#routes-list" 
            onclick="changeRoutesPage(${page})">${text}</a>
        </li>`;
}

// Отрисовывает пагинацию
function renderRoutesPaginationElement(elementsCount) {
    const maxPage = Math.ceil(elementsCount / 10);
    if (ACTIVE_PAGE === 1) {
        prevPage = createPageItem(1, false, true, '&laquo;');
    } else {
        prevPage = createPageItem(ACTIVE_PAGE - 1, false, false, '&laquo;');
    }
    let nextPage = '';
    if (ACTIVE_PAGE === maxPage) {
        nextPage = createPageItem(maxPage, false, true, '&raquo;');
    } else {
        nextPage = createPageItem(ACTIVE_PAGE + 1, false, false, '&raquo;');
    }
    let pagesHTML = '';
    const start = Math.max(ACTIVE_PAGE - 2, 1);
    const end = Math.min(ACTIVE_PAGE + 2, maxPage);
    for (let i = start; i <= end; i++) {
        pagesHTML += createPageItem(i, i === ACTIVE_PAGE);
    }

    const paginationHTML = `<ul class="pagination">
    ${prevPage}${pagesHTML}${nextPage}</ul>`;
    document.getElementById('pagination').innerHTML = paginationHTML;
}

// Отрисовывает таблицу маршрутов
function renderRoutes(data) {
    let table = '';
    const page = ACTIVE_PAGE - 1;
    const start = page * 10;
    if (start + 10 < data.length) {
        end = start + 10;
    } else {
        end = data.length;
    }

    for (let i = start; i < end; i++) {
        const shortDescription = shortenText(data[i].description);
        const shortMainObject = shortenText(data[i].mainObject);
        table +=
            `<tr>
            <th scope="row">${data[i].name}</th>
            <td><span data-bs-toggle="tooltip" data-bs-placement="top" 
            title="${data[i].description}">${shortDescription}</span></td>
            <td><span data-bs-toggle="tooltip" data-bs-placement="top" 
            title="${data[i].mainObject}">${shortMainObject}</span></td>
            <td><button type="button" class="btn btn-info btn-sm" 
            onclick="getGuides(${data[i].id}, '${data[i].name}')">
            Выбрать</button></td>
        </tr>`;
    }

    document.getElementById("routes-table-body").innerHTML = table;

    // Активация tooltip
    const tooltipTriggerList = 
    document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => 
        new bootstrap.Tooltip(tooltipTriggerEl));
}

// Изменяет активную страницу
function changeRoutesPage(newPage) {
    ACTIVE_PAGE = newPage;
    renderRoutes(ROUTES_DATA);
    renderRoutesPaginationElement(ROUTES_DATA.length);
}

// Запрашивает данные о маршрутах с сервера
function getRoutes() {
    const url = new URL(API_ADDRESS + '/api/routes');
    url.searchParams.set('api_key', API_KEY);

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = 'json';
    xhr.send();

    xhr.onload = function () {
        if (xhr.status != 200) {
            alert(`Ошибка ${xhr.status}: ${xhr.statusText}`);
        } else {
            ROUTES_DATA = xhr.response;
            changeRoutesPage(1);
        }
    };
}

// Форматирует информацию о стаже гида
function pluralizeYears(n) {
    const forms = ['год', 'года', 'лет'];
    const n_last2 = n % 100;
    const n_last1 = n % 10;

    let res;
    if (n_last2 > 10 && n_last2 < 15) res = forms[2];
    else if (n_last1 == 1) res = forms[0];
    else if (n_last1 > 1 && n_last1 < 5) res = forms[1];
    else res = forms[2];

    return `${n} ${res}`;
}

// Отрисовывает таблицу доступных гидов
function renderGuides(data, routeId, routeName) {
    let table = '';
    for (let i = 0; i < data.length; i++) {
        table +=
            `<tr>
          <td> <img src="gid.jpg" 
          class=" img mx-auto d-block" width="40" > </td>
          <td>${data[i].name}</td>
          <td>${data[i].language}</td>
          <td>${pluralizeYears(data[i].workExperience)}</td>
          <td>${data[i].pricePerHour}₽/час</td>
          <td><button type="button" class="btn btn-info btn-sm" 
          onclick="renderBuyButton(${routeId}, '${routeName}', ${data[i].id}, 
          '${data[i].name}', ${data[i].pricePerHour})">Выбрать</button></td>
          </tr>`;
    }

    document.getElementById("guides-table-body").innerHTML = table;
    let guidesList = document.getElementById('guides-list');
    if (guidesList.classList.contains('d-none')) {
        guidesList.classList.remove('d-none');
    }
}

// Запрашивает данные о доступных гидах по выбранному маршруту
function getGuides(routeId, routeName) {
    let text = `Доступные гиды по маршруту «${routeName}»`;
    document.getElementById("guides-text").innerHTML = text;

    const url = new URL(API_ADDRESS + `/api/routes/${routeId}/guides`);
    url.searchParams.set('api_key', API_KEY);

    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = 'json';
    xhr.send();

    xhr.onload = function () {
        if (xhr.status != 200) {
            alert(`Ошибка ${xhr.status}: ${xhr.statusText}`);
        } else {
            renderGuides(xhr.response, routeId, routeName);
        }
    };
}

// Отрисовывает кнопку для оформления заявки
function renderBuyButton(routeId, routeName, guideId, guideName, pricePerHour) {
    currentPricePerHour = pricePerHour;
    let buttonHTML = `<button type="button" class="btn btn-success" 
    onclick=
    "prepareForm(${routeId}, '${routeName}', ${guideId}, '${guideName}')"
    data-bs-toggle="modal" data-bs-target="#exampleModal">
    Оформить заявку</button>`;
    let container = document.getElementById("buyContainer");
    container.innerHTML = buttonHTML;
}

// Подготавливает форму для оформления заявки с выбранным маршрутом и гидом
function prepareForm(routeId, routeName, guideId, guideName) {
    let dateInput = document.getElementById('dateInput');
    let today = new Date();
    let tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dd = String(tomorrow.getDate()).padStart(2, '0');
    let mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    let yyyy = tomorrow.getFullYear();
    tomorrow = `${yyyy}-${mm}-${dd}`;
    dateInput.value = tomorrow;

    document.getElementById("guideName").value = guideName;
    document.getElementById("routeName").value = routeName;
    currentGuideId = guideId;
    currentRouteId = routeId;
}

// Проверяет, находится ли число между двумя значениями
function isBetween(lowerBound, number, upperBound) {
    return number >= lowerBound && number <= upperBound;
}

// Подсчитывает итоговую стоимость маршрута с учетом выбранных опций
function calculatePrice() {
    let duration = parseInt(
        document.getElementById('durationSelect').value, 10);
    let peopleCount = parseInt(
        document.getElementById('peopleInput').value, 10);
    let dateValue = document.getElementById('dateInput').value;
    let timeValue = document.getElementById('timeInput').value;
    let dateTime = new Date(dateValue + 'T' + timeValue);

    let option1 = document.getElementById('option1').checked;
    let option2 = document.getElementById('option2').checked;

    if (option1) {
        option1Multiplier = 1.5;
    } else {
        option1Multiplier = 1;
    }
    if (option2) {
        if (isBetween(1, peopleCount, 4)) option2Multiplier = 1.15;
        if (isBetween(5, peopleCount, 10)) option2Multiplier = 1.25;
    } else {
        option2Multiplier = 1;
    }


    let dayOfWeek = dateTime.getDay();
    let hour = dateTime.getHours();

    if (dayOfWeek == 0 || dayOfWeek == 6) {
        isThisDayOff = 1.5;
    } else {
        isThisDayOff = 1;
    }
    if (isBetween(9, hour, 13)) {
        isItMorning = 400;
    } else {
        isItMorning = 0;
    }
    if (isBetween(20, hour, 23)) {
        isItEvening = 1000;
    } else {
        isItEvening = 0;
    }

    let numberOfVisitors;
    if (isBetween(10, peopleCount, 20)) numberOfVisitors = 1500;
    else if (isBetween(5, peopleCount, 9)) numberOfVisitors = 1000;
    else if (isBetween(1, peopleCount, 4)) numberOfVisitors = 0;

    let totalPrice = (currentPricePerHour * duration * isThisDayOff) 
    + isItMorning + isItEvening + numberOfVisitors;
    totalPrice *= option1Multiplier * option2Multiplier;

    document.getElementById('totalCost').value = `${Math.round(totalPrice)}₽`;
}

// Проверяет количество людей для второй опции
function option2CheckPeopleCount(event) {
    const option2CheckBox = document.getElementById("option2");
    if (event.target.value > 10) {
        option2CheckBox.checked = false;
    } else {
        option2CheckBox.checked = option2CheckBox.checked;
    }
    option2CheckBox.disabled = event.target.value > 10;
}
//Отправляет заявку на сервер
function createOrder(event) {
    const xhr = new XMLHttpRequest();
    const FD = new FormData();
    url = new URL(API_ADDRESS + '/api/orders');
    url.searchParams.set('api_key', API_KEY);

    let modalElement = document.getElementById('exampleModal');
    FD.append("guide_id", currentGuideId);
    FD.append("route_id", currentRouteId);
    FD.append("date", document.getElementById('dateInput').value);
    FD.append("time", document.getElementById('timeInput').value);
    FD.append("duration", parseInt(
        document.getElementById('durationSelect').value, 10));
    FD.append("persons", parseInt(
        document.getElementById('peopleInput').value, 10));
    FD.append("price", parseInt(
        document.getElementById('totalCost').value, 10));
    FD.append("time", document.getElementById('timeInput').value);
    FD.append("optionFirst", Number(
        document.getElementById('option1').checked));
    FD.append("optionSecond", Number(
        document.getElementById('option1').checked));


    xhr.open("POST", url);
    xhr.responseType = 'json';
    xhr.send(FD);
    xhr.onload = function () {
        if (xhr.status != 200) {
            //alert(`Ошибка ${xhr.status}: ${xhr.statusText}`);
            showAlert('Произошла ошибка при создании заявки', 'danger');
        } else {
            console.log(xhr.response);
            new bootstrap.Modal(modalElement).hide();
            showAlert('Заявка успешно создана', 'success');
        }
    };

}

// Добавляет обработчики событий на элементы формы
document.getElementById('durationSelect')
    .addEventListener('change', calculatePrice);
document.getElementById('peopleInput')
    .addEventListener('change', option2CheckPeopleCount);
document.getElementById('peopleInput')
    .addEventListener('change', calculatePrice);
document.getElementById('option1').addEventListener('change', calculatePrice);
document.getElementById('option2').addEventListener('change', calculatePrice);
document.getElementById('sendForm').addEventListener("click", createOrder);
// Запускает загрузку маршрутов при загрузке страницы
window.onload = getRoutes;
