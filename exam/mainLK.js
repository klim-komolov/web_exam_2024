// Константы для API
const API_ADDRESS = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru';
const API_KEY = "f9aa6e2e-feb2-4094-ad8c-bc346a11d342";

// Переменные для управления страницей и данными
let ACTIVE_PAGE = 1;
let ROUTES_DATA = [];
let ORDERS_DATA = [];

// Переменные для хранения информации о выбранном маршруте и гиде
let currentPricePerHour = 0;
let currentRouteId = 0;
let currentGuideId = 0;
let currentOrderId = 0;

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

// Отправка запроса на сервер для удаления заявки
function deleteOrder() {
    const deleteModal = document.getElementById('deleteModal');
    url = new URL(API_ADDRESS + `/api/orders/${currentOrderId}`);
    url.searchParams.set('api_key', API_KEY);
    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", url);
    xhr.responseType = 'json';
    xhr.send();
    xhr.onload = function () {
        if (xhr.status != 200) {
            showAlert(
                'Ошибка при удалении заявки', 'danger'
            );
        } else {
            bootstrap.Modal.getInstance(deleteModal).hide();
            showAlert('Заявка успешно удалена', 'success');
            // eslint-disable-next-line no-use-before-define
            getOrders();
        }
    };
}

// Отправка GET-запроса на сервер для получения данных о маршрутах
function getRoutes(callback) {
    url = new URL(API_ADDRESS + '/api/routes');
    url.searchParams.set('api_key', API_KEY);
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = 'json';
    xhr.send();
    xhr.onload = function () {
        if (xhr.status != 200) {
            showAlert(
                'Произошла ошибка при получении списка маршрутов', 'danger'
            );
        } else {
            xhr.response.forEach(route => {
                ROUTES_DATA[route.id] = route.name;
            });
            callback();
        }
    };
}

// Формирование URL для получения данных о гиде по его идентификатору
function getGuideInfo(guideId, callback) {
    url = new URL(API_ADDRESS + `/api/guides/${guideId}`);
    url.searchParams.set('api_key', API_KEY);
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = 'json';
    xhr.send();
    xhr.onload = function () {
        if (xhr.status != 200) {
            showAlert(
                'Произошла ошибка при получении имени гида', 'danger'
            );
        } else {
            callback(xhr.response);
        }
    };
}

// Получение данных из data-атрибутов строки таблицы
function setupModalViewEdit(rowElement, onlyForView) {
    let table = document.getElementById("exampleModal");
    const orderId = rowElement.dataset.orderId;
    const routeId = rowElement.dataset.routeId;
    const guideId = rowElement.dataset.guideId;
    const date = rowElement.dataset.date;
    const time = rowElement.dataset.time;
    const duration = rowElement.dataset.duration;
    const persons = rowElement.dataset.persons;
    const price = rowElement.dataset.price;
    const optionFirst = rowElement.dataset.optionFirst === 'true';
    const optionSecond = rowElement.dataset.optionSecond === 'true';

    currentOrderId = orderId;
    currentGuideId = guideId;
    currentRouteId = routeId;

    // Получение имени гида и обновление поля
    getGuideInfo(guideId, function (response) {
        document.getElementById('guideName').value = response.name;
        currentPricePerHour = response.pricePerHour;
    });

    // Заполнение данных модального окна
    document.getElementById('routeName').value = ROUTES_DATA[routeId];
    document.getElementById('dateInput').value = date;
    document.getElementById('timeInput').value = time;
    document.getElementById('durationSelect').value = duration;
    document.getElementById('peopleInput').value = persons;
    document.getElementById('option1').checked = optionFirst;
    document.getElementById('option2').checked = optionSecond;
    document.getElementById('totalCost').value = `${price}руб`;

    if (onlyForView) {
        document.getElementById('exampleModalLabel')
            .textContent = `Заявка номер ${orderId}`;
        document.getElementById('dateInput').readOnly = true;
        document.getElementById('timeInput').readOnly = true;
        document.getElementById('durationSelect').disabled = true;
        document.getElementById('peopleInput').readOnly = true;
        document.getElementById('option1').disabled = true;
        document.getElementById('option2').disabled = true;
        document.getElementById('sendForm').classList.add('d-none');
    } else {
        document.getElementById('exampleModalLabel')
            .textContent = `Изменение заявки`;
        document.getElementById('dateInput').readOnly = false;
        document.getElementById('timeInput').readOnly = false;
        document.getElementById('durationSelect').disabled = false;
        document.getElementById('peopleInput').readOnly = false;
        document.getElementById('option1').disabled = false;
        document.getElementById('option2').disabled = false;
        document.getElementById('sendForm').classList.remove('d-none');
    }

    table.dataset.orderId = orderId;
    table.dataset.routeId = routeId;
    table.dataset.guideId = guideId;
}

// Заполняет таблицы данными о заявках
function populateOrdersTable(orders, currentPageNumber) {
    const ordersTable = document.getElementById("routes-table-body");
    ordersTable.innerHTML = '';

    const startIndex = (currentPageNumber - 1) * 5;
    const endIndex = Math.min(startIndex + 5, orders.length);

    for (let index = startIndex; index < endIndex; index++) {
        const currentOrder = orders[index];
        const orderDetails = ROUTES_DATA[currentOrder.route_id];

        const rowHtml = `
<tr data-order-id="${currentOrder.id}" data-route-id="${currentOrder.route_id}"
data-guide-id="${currentOrder.guide_id}" data-date="${currentOrder.date}"
data-time="${currentOrder.time}" data-persons="${currentOrder.persons}"
data-duration="${currentOrder.duration}" data-price="${currentOrder.price}"
data-option-first="${currentOrder.optionFirst}" 
data-option-second="${currentOrder.optionSecond}">
<td>${index + 1}</td>
<td>${orderDetails}</td>
<td>${currentOrder.date}</td>
<td>${currentOrder.price}</td>
<td>
    <button type="button" class="btn btn-sm"
        onclick="setupModalViewEdit(this.closest('tr'), true)"
        data-bs-toggle="modal" data-bs-target="#exampleModal">
        <span class="bi bi-eye-fill"></span>
    </button>
    <button type="button" class="btn btn-sm"
        onclick="setupModalViewEdit(this.closest('tr'), false)"
        data-bs-toggle="modal" data-bs-target="#exampleModal">
        <span class="bi bi-pencil-fill"></span>
    </button>
    <button type="button" class="btn btn-sm " 
        onclick="triggerDeleteConfirmation(${currentOrder.id})"
        data-bs-toggle="modal" data-bs-target="#deleteModal">
        <span class="bi bi-trash-fill"></span>
    </button>
</td>
</tr>
`;
        ordersTable.innerHTML += rowHtml;
    }
}


// Изменяет активную страницу
function changeOrdersPage(newPage) {
    const elems_per_page = 5;
    ACTIVE_PAGE = newPage;
    populateOrdersTable(ORDERS_DATA, newPage);
    // eslint-disable-next-line no-use-before-define
    renderOrdersPaginationElement(ORDERS_DATA.length, elems_per_page);
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
            onclick="changeOrdersPage(${page})">${text}</a>
        </li>`;
}

// Отрисовывает пагинацию
function renderOrdersPaginationElement(elementsCount, elems_per_page) {
    const maxPage = Math.ceil(elementsCount / elems_per_page);
    console.log(maxPage);
    if (ACTIVE_PAGE === 1) {
        prevPage = createPageItem(1, false, true, 'Предыдущая');
    } else {
        prevPage = createPageItem(ACTIVE_PAGE - 1, false, false, 'Предыдущая');
    }
    let nextPage = '';
    if (ACTIVE_PAGE === maxPage) {
        nextPage = createPageItem(maxPage, false, true, 'Следующая');
    } else {
        nextPage = createPageItem(ACTIVE_PAGE + 1, false, false, 'Следующая');
    }
    let pagesHTML = '';
    const start = Math.max(ACTIVE_PAGE - 2, 1);
    const end = Math.min(ACTIVE_PAGE + 2, maxPage);
    for (let i = start; i <= end; i++) {
        pagesHTML += createPageItem(i, i === ACTIVE_PAGE);
    }

    const paginationHTML = `<ul class="pagination">
        ${prevPage}${pagesHTML}${nextPage}
    </ul>`;
    document.getElementById('pagination').innerHTML = paginationHTML;
}

// Формирование URL для получения списка заявок
function getOrders(event) {
    url = new URL(API_ADDRESS + `/api/orders`);
    url.searchParams.set('api_key', API_KEY);
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = 'json';
    xhr.send();
    xhr.onload = function () {
        if (xhr.status != 200) {
            showAlert('Произошла ошибка при получении списка заявок', 'danger');
        } else {
            ORDERS_DATA = xhr.response;
            console.log(xhr.response);
            changeOrdersPage(1);

        }
    };
}

// Проверяет, находится ли число в пределах интервала
function isBetween(lower, number, upper) {
    return number >= lower && number <= upper;
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

    document.getElementById('totalCost').value = `${Math.round(totalPrice)}руб`;
}

// Отправка запроса на сервер для изменения данных заявки
function changeOrder(event) {
    const xhr = new XMLHttpRequest();
    const FD = new FormData();
    url = new URL(API_ADDRESS + `/api/orders/${currentOrderId}`);
    url.searchParams.set('api_key', API_KEY);

    let modalElement = document.getElementById('exampleModal');
    FD.append("guide_id", currentGuideId);
    FD.append("route_id", currentRouteId);
    FD.append("date", document.getElementById('dateInput').value);
    FD.append("time", document.getElementById('timeInput').value);
    FD.append("duration", parseInt(
        document.getElementById('durationSelect').value, 10)
    );
    FD.append("persons", parseInt(
        document.getElementById('peopleInput').value, 10)
    );
    FD.append("price", parseInt(
        document.getElementById('totalCost').value, 10)
    );
    FD.append("time", document.getElementById('timeInput').value);
    FD.append("optionFirst", Number(
        document.getElementById('option1').checked)
    );
    FD.append("optionSecond", Number(
        document.getElementById('option1').checked)
    );


    xhr.open('PUT', url);
    xhr.responseType = 'json';
    xhr.send(FD);
    xhr.onload = function () {
        if (xhr.status != 200) {
            showAlert('Произошла ошибка при изменении заявки', 'danger');
        } else {
            bootstrap.Modal.getInstance(modalElement).hide();
            showAlert('Заявка успешно изменена', 'success');
            getOrders();
        }
    };

}

// Установка текущего идентификатора заявки перед подтверждением удаления
function triggerDeleteConfirmation(orderId) {
    const deleteModal = document.getElementById('deleteModal');
    currentOrderId = orderId;
}


document.getElementById('deleteModal').querySelector('.btn-primary')
    .addEventListener('click', deleteOrder);

// Добавляет обработчики событий на элементы формы
document.getElementById('durationSelect')
    .addEventListener('change', calculatePrice);
document.getElementById('peopleInput')
    .addEventListener('change', option2CheckPeopleCount);
document.getElementById('peopleInput')
    .addEventListener('change', calculatePrice);
document.getElementById('timeInput').addEventListener('change', calculatePrice);
document.getElementById('option1').addEventListener('change', calculatePrice);
document.getElementById('option2').addEventListener('change', calculatePrice);
document.getElementById('sendForm').addEventListener("click", changeOrder);

// Загрузка списка маршрутов и заявок при загрузке страницы
window.onload = function () {
    getRoutes(getOrders);
};
