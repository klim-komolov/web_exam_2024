
// Константы для API
const API_ADDRESS = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru';
const API_KEY = "f9aa6e2e-feb2-4094-ad8c-bc346a11d342";


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

document.getElementById('sendForm').addEventListener("click", createOrder);

// Запускает загрузку маршрутов при загрузке страницы
window.onload = getRoutes;
