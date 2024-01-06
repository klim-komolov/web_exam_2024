const API_URL = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru';
const API_TOKEN = "f9aa6e2e-feb2-4094-ad8c-bc346a11d342";

const truncateText = text => {
    const WORDS = text.split(" ");
    if (WORDS.length > 10) {
        return WORDS.slice(0, 10).join(' ') + '...';
    }
    const firstDotIndex = text.indexOf('.');
    if (firstDotIndex !== -1 && firstDotIndex < text.length) {
        return text.substring(0, firstDotIndex + 1);
    }
    return text;
};

const render_routes = (data, page = 1) => {
    let table = '';
    page = page - 1;
    const start = page * 10;
    const end = (start + 10 < data.length) ? start + 10 : data.length;

    for (let i = start; i < end; i++) {
        const shortDesc = truncateText(data[i].description);
        const shortObj = truncateText(data[i].mainObject);

        table +=
            `<tr>
            <th scope="row">${data[i].name}</th>
            <td><span data-bs-toggle="tooltip" data-bs-placement="top" 
            title="${data[i].description}">${shortDesc}</span></td>
            <td><span data-bs-toggle="tooltip" data-bs-placement="top" 
            title="${data[i].mainObject}">${shortObj}</span></td>
            <td><button>Выбрать</button></td>
        </tr>`;
    }
    document.getElementById("routes-table-body").innerHTML = table;


    const tooltipTriggerList = 
    document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl =>
        new bootstrap.Tooltip(tooltipTriggerEl));
};


const get_routes = () => {
    const url = new URL(API_URL + '/api/routes');
    url.searchParams.set('api_key', API_TOKEN);
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = 'json';
    xhr.send();
    xhr.onload = () => {
        if (xhr.status != 200) {
            alert(`Ошибка ${xhr.status}: ${xhr.statusText}`);
        }
        render_routes(xhr.response);
    };
};

const onLoad = () => get_routes();

window.onload = onLoad;
