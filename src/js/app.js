// Подключение основного файла стилей
import "../scss/style.scss";

// Получаем данные с сервера
async function fetchContributions() {
    try {
        const response = await fetch('https://dpg.gg/test/calendar.json');
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error('Failed to fetch contributions:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Failed to fetch contributions:', error);
        return null;
    }
}

// После получения данных
fetchContributions().then(
    data => setDatasOnTable(reverseObject(data))
)

// Разворачиваем объект, чтобы получить сначала последние данные
function reverseObject(obj) {
    const reversedObj = {};
    const keys = Object.keys(obj);

    for (let i = keys.length - 1; i >= 0; i--) {
        const key = keys[i];
        reversedObj[key] = obj[key];
    }
    return reversedObj;
}

// Получаем текущую дату
const currentDate = new Date();
const formattedDate = new Date(formattingDate(currentDate));
// Вычисляем дату последнего дня (сегодняшнего дня минус 51 неделя)
const startDate = new Date(formattedDate.getTime() - (51 * 7 * 24 * 60 * 60 * 1000));
// Создаем таблицу
const table = document.createElement('table');

let firstMonth = null;
let previousMonth = null;
const headerRow = document.createElement('tr');
for (let i = 0; i <= 51; i++) {
    const headerCell = document.createElement('th');
    const date = new Date(startDate.getTime() + (i * 7 * 24 * 60 * 60 * 1000));
    const month = date.toLocaleDateString('ru-RU', { month: 'short' })

    if (i == 0) { firstMonth = month }

    if (i == 51 && firstMonth == month) {
        headerRow.appendChild(headerCell);
        continue
    }

    if (i == 50 && firstMonth == month) {
        headerRow.querySelector(`[data-month=${month}]`).textContent = ''
    }

    if (month !== previousMonth) {
        headerCell.textContent = month;
        headerCell.setAttribute('data-month', month)
        previousMonth = month;
    }

    headerRow.appendChild(headerCell);
}
table.appendChild(headerRow);

// Создаем строки таблицы
for (let row = 0; row < 7; row++) {
    const tableRow = document.createElement('tr');
    const firstTableCell = document.createElement('td');
    tableRow.appendChild(firstTableCell);

    for (let col = 1; col <= 51; col++) {
        const tableCell = document.createElement('td');
        tableRow.appendChild(tableCell);
    }

    table.appendChild(tableRow);
}

// Добавляем таблицу на страницу
const squares = document.querySelector('.squares')
const infoBlock = document.querySelector('.info')
squares.insertBefore(table, infoBlock)
// Устанавливаем даты во все ячейки
setDatasOnTable(getDatesOneYearAgo())

// Функция для закрашивания клетки по заданной дате
function highlightCellByDate(dateString, level) {
    const targetDate = new Date(dateString);
    const diffInDays = Math.floor((targetDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    let column = Math.floor(diffInDays / 7);
    let row = targetDate.getDay();
    let currentDay = formattedDate.getDay()
    
    if (row === 0) {
        row = 7
    }
    if (currentDay === 0) {
        currentDay = 7
    }

    if (row < currentDay) {
        column += 1
    }

    // Находим нужную клетку
    const tableCell = document.querySelector('table tr:nth-child(' + (row + 1) + ') td:nth-child(' + (column + 1) + ')');
    // Закрашиваем клетку
    if (!tableCell) {
        return
    }
    if (tableCell.querySelector('.tooltip')) {
        tableCell.querySelector('.tooltip').remove()
    }
    const tippy = document.createElement('div')
    tippy.classList.add('tooltip')
    tippy.innerHTML = `<div class='tooltip__text'>${level === 0 ? 'No' : level} contributions</div><div class='tooltip__date'>${formatDate(dateString)}</div>`
    tableCell.appendChild(tippy)
    tableCell.setAttribute('data-level', setLevel(level));
}
// Выводим и заполняем данные в таблице из полученных данных 
function setDatasOnTable(data) {
    for (let key in data) {
        highlightCellByDate(key, data[key]);
    }
}
// Задаем уровень для дата аттрибута и выбора цвета заливки
function setLevel(level) {
    switch (true) {
        case level == 0:
            return '0';
        case level >= 1 && level <= 9:
            return '1';
        case level >= 10 && level <= 19:
            return '2';
        case level >= 20 && level <= 29:
            return '3';
        case level >= 30:
            return '4';
        default:
            return '0';
    }
}
// Форматируем даты для вывода нужного формата в тултип
function formatDate(dateString) {
    const date = new Date(dateString);

    // Определение дней недели
    const daysOfWeek = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    const dayOfWeek = daysOfWeek[date.getDay()];

    // Определение месяца
    const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    const month = months[date.getMonth()];

    // Получение дня месяца
    const day = date.getDate();

    // Получение года
    const year = date.getFullYear();

    // Составление итоговой строки
    const formattedDate = `${dayOfWeek}, ${month} ${day}, ${year}`;

    return formattedDate;
}
// Получаем все даты на год назад
function getDatesOneYearAgo(currentDay = 0) {
    const oneYearAgo = new Date(formattedDate.getFullYear() - 1, formattedDate.getMonth(), formattedDate.getDate());
    const dates = {};
    for (let i = 0; i <= 365; i++) {
        const date = new Date(oneYearAgo.getTime() + (i * 24 * 60 * 60 * 1000));
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        dates[formattedDate] = 0;
    }

    return dates;
}

function formattingDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }