// --- Глобальные переменные и конфигурация ---
let currentScreen = 'home';
let currentPage = 1; // Для пагинации истории
const itemsPerPage = 5;
let currentWorkout = null; // Активная тренировка
let activeProgram = null; // Активная программа
let editingWorkoutId = null; // ID тренировки, которую редактируем

// --- Состояния приложения (имитация базы данных в localStorage) ---
let appState = {
    workouts: [],
    templates: [],
    programs: [],
    exercises: [],
    tracker: {
        calories: {}, // { 'YYYY-MM-DD': [{ amount, desc, time, id }, ...] }
        water: {}     // { 'YYYY-MM-DD': [{ amount, time, id }, ...] }
    },
    schedule: {
        days: [],
        time: '09:00',
        enabled: false
    },
    profile: {
        name: 'Спортсмен',
        level: 'intermediate',
        avatar: '',
        goals: { calories: 2000, water: 2.0 }
    },
    settings: {
        theme: 'dark',
        interfaceMode: 'standard', // 'simple', 'standard', 'advanced'
        accentColor: 'indigo'
    },
    notifications: [],
    knowledge: {
        articles: []
    }
};

// --- Вспомогательные функции ---
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// --- Инициализация приложения ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('FitApp v2.0 запускается...');
    initializeApp();
});

function initializeApp() {
    loadAppState(); // Загрузить данные из localStorage
    updateInterfaceForState(); // Применить тему и т.д.
    setupEventListeners(); // Установить обработчики событий
    renderInitialScreens(); // Отрендерить начальные данные
    console.log('FitApp v2.0 инициализирован.');
}

function loadAppState() {
    const stored = localStorage.getItem('fitapp_state_v2');
    if (stored) {
        try {
            appState = { ...appState, ...JSON.parse(stored) };
            console.log('Состояние приложения загружено из localStorage.');
        } catch (e) {
            console.error('Ошибка загрузки состояния из localStorage:', e);
            // Используем дефолтное состояние
        }
    } else {
        // Инициализация начальными данными для демонстрации
        initializeDefaultData();
    }
}

function initializeDefaultData() {
    appState.exercises = [
        { id: 1, name: 'Жим лежа', muscleGroup: 'chest', subgroup: 'pectoralis_major', description: 'Базовое упражнение на грудь.' },
        { id: 2, name: 'Подтягивания', muscleGroup: 'back', subgroup: 'latissimus_dorsi', description: 'Упражнение для спины и бицепсов.' },
        { id: 3, name: 'Приседания', muscleGroup: 'legs', subgroup: 'quadriceps', description: 'Классическое упражнение для ног.' },
        { id: 4, name: 'Жим штанги стоя', muscleGroup: 'shoulders', subgroup: 'deltoids', description: 'Упражнение для плечевого пояса.' },
        { id: 5, name: 'Отжимания', muscleGroup: 'chest', subgroup: 'triceps', description: 'Упражнение без снаряжения.' }
    ];

    appState.programs = [
        { id: 1, name: 'Базовая 4-дневка', level: 'beginner', type: 'fullbody', description: 'Подходит для новичков.', days: [{title: 'День 1: Грудь и Трицепс', exercises: [{name: 'Жим лежа', sets: 4, reps: '8-10'}, {name: 'Отжимания', sets: 3, reps: '10-15'}]}] },
        { id: 2, name: 'Программа на массу', level: 'intermediate', type: 'hypertrophy', description: 'Для набора мышечной массы.', days: [{title: 'День 1: Спина и Бицепс', exercises: [{name: 'Подтягивания', sets: 4, reps: '8-12'}]}] }
    ];

    appState.templates = [
        { id: 1, name: 'Шаблон: Грудь+Трицепс', exercises: [{ name: 'Жим лежа', setsCount: 4 }, { name: 'Французский жим', setsCount: 3 }] }
    ];

    appState.workouts = [
        { id: 1, name: 'Тренировка груди', date: new Date(Date.now() - 86400000).toISOString(), exercises: [{ name: 'Жим лежа', sets: [{weight: 80, reps: 8, completed: true}, {weight: 85, reps: 6, completed: true}] }], notes: 'Хорошая тренировка!' },
        { id: 2, name: 'Тренировка ног', date: new Date().toISOString(), exercises: [{ name: 'Приседания', sets: [{weight: 100, reps: 10, completed: false}] }], notes: '' }
    ];

    appState.knowledge.articles = [
        { id: 1, title: 'Как составить программу тренировок', category: 'principles', content: 'Содержимое статьи...' },
        { id: 2, title: 'Правила питания для набора массы', category: 'nutrition', content: 'Содержимое статьи...' }
    ];
}

function saveAppState() {
    try {
        localStorage.setItem('fitapp_state_v2', JSON.stringify(appState));
        console.log('Состояние приложения сохранено в localStorage.');
    } catch (e) {
        console.error('Ошибка сохранения состояния в localStorage:', e);
        alert('Не удалось сохранить данные. Возможно, закончилось место.');
    }
}

function updateInterfaceForState() {
    document.body.className = `theme-${appState.settings.theme}`;
    applyAccentColor(appState.settings.accentColor);
    renderNotificationsBadge();
}

function applyAccentColor(colorName) {
    const colors = {
        indigo: '#4F46E5',
        emerald: '#10B981',
        violet: '#8B5CF6',
        coral: '#F97316',
        ocean: '#3B82F6'
    };
    document.documentElement.style.setProperty('--accent-color', colors[colorName] || colors.indigo);
}

function renderNotificationsBadge() {
    const count = appState.notifications.filter(n => !n.read).length;
    const badge = $('#notification-count-badge');
    if (badge) {
        badge.textContent = count;
        badge.classList.toggle('hidden', count === 0);
    }
}

// --- Управление экранами ---
function showScreen(screenName) {
    if (!$(`#screen-${screenName}`)) {
        console.error(`Экран с именем "${screenName}" не найден.`);
        return;
    }

    $(`#screen-${currentScreen}`).classList.remove('active');
    $(`#screen-${screenName}`).classList.add('active');
    currentScreen = screenName;

    $$('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.screen === screenName);
        btn.setAttribute('aria-current', btn.dataset.screen === screenName ? 'page' : 'false');
    });

    // Вызвать функцию рендеринга для конкретного экрана
    switch (screenName) {
        case 'home':
            renderHomeScreen();
            break;
        case 'workout':
            renderWorkoutScreen();
            break;
        case 'progress':
            renderProgressScreen();
            break;
        case 'history':
            currentPage = 1; // Сброс на 1 при входе
            renderHistoryScreen();
            break;
        case 'schedule':
            renderScheduleScreen();
            break;
        case 'tracker':
            renderTrackerScreen();
            break;
        case 'programs':
            renderProgramsScreen();
            break;
        case 'exercises':
            renderExercisesScreen();
            break;
        case 'knowledge':
            renderKnowledgeScreen();
            break;
        case 'coach':
            renderCoachScreen();
            break;
        case 'info':
            renderInfoScreen();
            break;
    }
}

// --- Рендеринг экранов ---
function renderHomeScreen() {
    $('.welcome-text').textContent = `👋 Привет, ${appState.profile.name}!`;
    $('#stat-total-workouts').textContent = appState.workouts.length;
    // Заглушка для других статистик
    $('#stat-streak').textContent = '0';
    $('#stat-total-tonnage').textContent = '0';
    $('#stat-avg-weight').textContent = '0';

    const recentList = $('#recent-workouts-list');
    recentList.innerHTML = '';
    appState.workouts.slice(0, 3).forEach(w => {
        const template = $('#workout-item-template').content.cloneNode(true);
        const item = template.querySelector('.history-item');
        item.querySelector('.workout-name').textContent = w.name;
        item.querySelector('.workout-date').textContent = new Date(w.date).toLocaleDateString('ru-RU');
        item.setAttribute('data-workout-id', w.id);
        recentList.appendChild(template);
    });
}

function renderWorkoutScreen() {
    // Сброс формы
    $('#workout-name-input').value = '';
    $('#workout-date').value = new Date().toISOString().slice(0, 16);
    $('#workout-notes').value = '';
    const container = $('#workout-exercises-container');
    container.innerHTML = '';
    // Добавить одно пустое упражнение
    addExerciseToWorkoutForm();
}

function renderProgressScreen() {
    // Заглушка: просто обновим на +/-0%
    $('#progress-workouts-change').textContent = '+0%';
    $('#progress-tonnage-change').textContent = '+0%';
    $('#progress-avg-weight-change').textContent = '+0%';
}

function renderHistoryScreen() {
    const filter = $('.filter-btn.active').dataset.filter;
    let items = appState.workouts;

    const now = new Date();
    switch (filter) {
        case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            items = items.filter(w => new Date(w.date) >= weekAgo);
            break;
        case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            items = items.filter(w => new Date(w.date) >= monthAgo);
            break;
        case '3months':
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            items = items.filter(w => new Date(w.date) >= threeMonthsAgo);
            break;
    }

    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageItems = items.slice(startIndex, startIndex + itemsPerPage);

    const list = $('#history-list');
    list.innerHTML = '';
    if (pageItems.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'history-item placeholder';
        placeholder.innerHTML = '<span class="placeholder-text">Нет тренировок в истории</span>';
        list.appendChild(placeholder);
    } else {
        pageItems.forEach(w => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `<strong class="workout-name">${w.name}</strong><small class="workout-date">${new Date(w.date).toLocaleDateString('ru-RU')}</small>`;
            div.setAttribute('data-workout-id', w.id);
            div.addEventListener('click', () => {
                editingWorkoutId = w.id;
                loadWorkoutForEditing(w);
                showModal('edit-workout-modal');
            });
            list.appendChild(div);
        });
    }

    $('#page-info').textContent = `Страница ${currentPage} из ${totalPages || 1}`;
    $('#prev-page-btn').disabled = currentPage === 1;
    $('#next-page-btn').disabled = currentPage >= totalPages;
}

function renderScheduleScreen() {
    appState.schedule.days.forEach(day => {
        $(`#day-${day}`).checked = true;
    });
    $('#reminder-time').value = appState.schedule.time;
    $('#enable-notifications').checked = appState.schedule.enabled;

    const upcomingList = $('#upcoming-list');
    upcomingList.innerHTML = '';
    if (appState.schedule.days.length > 0) {
        appState.schedule.days.forEach(day => {
            const li = document.createElement('li');
            li.className = 'upcoming-item';
            li.textContent = `Тренировка (${day.toUpperCase()}) в ${appState.schedule.time}`;
            upcomingList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.className = 'upcoming-item placeholder';
        li.innerHTML = '<span class="placeholder-text">Нет предстоящих тренировок</span>';
        upcomingList.appendChild(li);
    }
}

function renderTrackerScreen() {
    const today = new Date().toISOString().split('T')[0];

    // Калории
    const caloriesToday = appState.tracker.calories[today] ? appState.tracker.calories[today].reduce((sum, e) => sum + e.amount, 0) : 0;
    const calorieGoal = appState.profile.goals.calories;
    $('#calories-today').textContent = caloriesToday;
    $('#calories-goal').textContent = calorieGoal;
    const caloriePercent = Math.min(100, (caloriesToday / calorieGoal) * 100);
    $('#calories-progress-bar .progress-fill').style.width = `${caloriePercent}%`;
    $('#calories-progress-text').textContent = `${caloriesToday} / ${calorieGoal} ккал`;

    // Вода
    const waterToday = appState.tracker.water[today] ? appState.tracker.water[today].reduce((sum, e) => sum + e.amount, 0.0) : 0.0;
    const waterGoal = appState.profile.goals.water;
    $('#water-today').textContent = waterToday.toFixed(2);
    $('#water-goal').textContent = waterGoal.toFixed(2);
    const waterPercent = Math.min(100, (waterToday / waterGoal) * 100);
    $('#water-progress-bar .progress-fill').style.width = `${waterPercent}%`;
    $('#water-progress-text').textContent = `${waterToday.toFixed(2)} / ${waterGoal.toFixed(2)} л`;

    // Обновить списки записей
    updateCaloriesEntriesList(today);
    updateWaterEntriesList(today);
}

function updateCaloriesEntriesList(date) {
    const list = $('#calories-entries-list');
    list.innerHTML = '';
    const entries = appState.tracker.calories[date] || [];
    if (entries.length === 0) {
        const item = document.createElement('div');
        item.className = 'entry-item placeholder';
        item.innerHTML = '<span class="placeholder-text">Нет записей</span>';
        list.appendChild(item);
    } else {
        entries.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'entry-item';
            item.innerHTML = `<span class="entry-amount">${entry.amount} ккал</span> <span class="entry-desc">${entry.desc || 'Без описания'}</span> <span class="entry-time">${entry.time}</span>`;
            list.appendChild(item);
        });
    }
}

function updateWaterEntriesList(date) {
    const list = $('#water-entries-list');
    list.innerHTML = '';
    const entries = appState.tracker.water[date] || [];
    if (entries.length === 0) {
        const item = document.createElement('div');
        item.className = 'entry-item placeholder';
        item.innerHTML = '<span class="placeholder-text">Нет записей</span>';
        list.appendChild(item);
    } else {
        entries.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'entry-item';
            item.innerHTML = `<span class="entry-amount">${entry.amount} л</span> <span class="entry-time">${entry.time}</span>`;
            list.appendChild(item);
        });
    }
}

function renderProgramsScreen() {
    const container = $('#programs-list');
    container.innerHTML = '';
    if (appState.programs.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'program-item placeholder';
        placeholder.innerHTML = '<span class="placeholder-text">Нет доступных программ</span>';
        container.appendChild(placeholder);
    } else {
        appState.programs.forEach(p => {
            const div = document.createElement('div');
            div.className = 'program-item';
            div.innerHTML = `<strong class="program-name">${p.name}</strong><small class="program-desc">${p.description}</small>`;
            div.addEventListener('click', () => {
                activeProgram = p;
                localStorage.setItem('fitapp_active_program', JSON.stringify(activeProgram));
                alert(`Программа "${p.name}" активирована!`);
            });
            container.appendChild(div);
        });
    }
}

function renderExercisesScreen() {
    const filter = $('.exercise-filters .filter-btn.active').dataset.filter;
    const container = $('#exercises-list-full');
    container.innerHTML = '';
    const filtered = filter === 'all' ? appState.exercises : appState.exercises.filter(e => e.muscleGroup === filter);

    if (filtered.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'exercise-item-full placeholder';
        placeholder.innerHTML = '<span class="placeholder-text">Нет упражнений в библиотеке</span>';
        container.appendChild(placeholder);
    } else {
        filtered.forEach(e => {
            const div = document.createElement('div');
            div.className = 'exercise-item-full';
            div.innerHTML = `<strong class="exercise-name">${e.name}</strong><small class="exercise-group">Группа: ${e.muscleGroup}, Подгруппа: ${e.subgroup}</small>`;
            container.appendChild(div);
        });
    }
}

function renderKnowledgeScreen() {
    const container = $('.knowledge-content');
    container.innerHTML = '';
    if (appState.knowledge.articles.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'article-preview placeholder';
        placeholder.innerHTML = '<span class="placeholder-text">Нет статей в базе знаний</span>';
        container.appendChild(placeholder);
    } else {
        appState.knowledge.articles.forEach(article => {
            const articleDiv = document.createElement('div');
            articleDiv.className = 'article-preview';
            articleDiv.innerHTML = `<h3>${article.title}</h3><p>${article.content.substring(0, 100)}...</p><button class="btn btn-outline read-more-btn">Читать далее</button>`;
            container.appendChild(articleDiv);
        });
    }
}

function renderCoachScreen() {
    // Статичный контент, но можно добавить динамику
    $$('.open-calculator-btn').forEach(btn => {
        btn.onclick = () => showModal('calculator-modal');
    });
}

function renderInfoScreen() {
    // Статичный список кнопок, обработчики уже повешены глобально
}

// --- Управление тренировками ---
function addExerciseToWorkoutForm(name = '') {
    const container = $('#workout-exercises-container');
    const template = $('#exercise-item-template').content.cloneNode(true);
    const item = template.querySelector('.exercise-item');
    item.querySelector('.exercise-name-input').value = name;

    // Обработчики для нового упражнения
    item.querySelector('.remove-exercise-btn').onclick = function() {
        if (container.children.length > 1) { // Не удалять последнее
            this.closest('.exercise-item').remove();
        }
    };

    item.querySelector('.add-set-btn').onclick = function() {
        const setsContainer = this.previousElementSibling; // .sets-container
        const setRow = document.createElement('div');
        setRow.className = 'set-row';
        setRow.innerHTML = `
            <input type="number" class="set-input" placeholder="Вес" aria-label="Вес в кг">
            <input type="number" class="set-input" placeholder="Повт." aria-label="Количество повторений">
            <input type="number" class="set-input" placeholder="Отдых (с)" aria-label="Отдых между подходами в секундах">
        `;
        setsContainer.appendChild(setRow);
    };

    container.appendChild(template);
}

function saveWorkout() {
    const name = $('#workout-name-input').value.trim();
    const date = $('#workout-date').value || new Date().toISOString();
    const notes = $('#workout-notes').value;

    if (!name) {
        alert('Пожалуйста, введите название тренировки.');
        return;
    }

    const exercises = [];
    $$('#workout-exercises-container .exercise-item').forEach(item => {
        const exName = item.querySelector('.exercise-name-input').value.trim();
        if (!exName) return;

        const sets = [];
        item.querySelectorAll('.set-row').forEach(row => {
            const inputs = row.querySelectorAll('.set-input');
            sets.push({
                weight: parseFloat(inputs[0].value) || 0,
                reps: parseInt(inputs[1].value) || 0,
                rest: parseInt(inputs[2].value) || 0,
                completed: false
            });
        });
        exercises.push({ name: exName, sets: sets });
    });

    if (exercises.length === 0) {
        alert('Добавьте хотя бы одно упражнение.');
        return;
    }

    const newWorkout = {
        id: Date.now(), // Простой ID
        name: name,
        date: date,
        exercises: exercises,
        notes: notes,
        templateId: null
    };

    appState.workouts.unshift(newWorkout);
    saveAppState();
    alert('Тренировка сохранена!');
    showScreen('home');
    renderHomeScreen(); // Обновить статистику
}

function saveCurrentWorkoutAsTemplate() {
    const name = prompt('Введите название для шаблона:');
    if (!name || !name.trim()) {
        alert('Название шаблона не может быть пустым.');
        return;
    }

    const exercises = [];
    $$('#workout-exercises-container .exercise-item').forEach(item => {
        const exName = item.querySelector('.exercise-name-input').value.trim();
        if (!exName) return;

        const setsCount = item.querySelectorAll('.set-row').length;
        exercises.push({ name: exName, setsCount: setsCount });
    });

    if (exercises.length === 0) {
        alert('Нет упражнений для сохранения как шаблона.');
        return;
    }

    const newTemplate = {
        id: Date.now(),
        name: name,
        exercises: exercises
    };

    appState.templates.push(newTemplate);
    saveAppState();
    alert(`Шаблон "${name}" создан!`);
}

function loadWorkoutForEditing(workout) {
    // Заполняем форму данными тренировки
    $('#workout-name-input').value = workout.name;
    $('#workout-date').value = workout.date.slice(0, 16); // YYYY-MM-DDTHH:mm
    $('#workout-notes').value = workout.notes;

    const container = $('#workout-exercises-container');
    container.innerHTML = '';
    workout.exercises.forEach(ex => {
        addExerciseToWorkoutForm(ex.name);
        const newItem = container.lastElementChild;
        newItem.querySelector('.exercise-name-input').value = ex.name;
        const setsContainer = newItem.querySelector('.sets-container');
        setsContainer.innerHTML = ''; // Очищаем дефолтный подход
        ex.sets.forEach(set => {
            const setRow = document.createElement('div');
            setRow.className = 'set-row';
            setRow.innerHTML = `
                <input type="number" class="set-input" value="${set.weight}" placeholder="Вес">
                <input type="number" class="set-input" value="${set.reps}" placeholder="Повт.">
                <input type="number" class="set-input" value="${set.rest}" placeholder="Отдых (с)">
            `;
            setsContainer.appendChild(setRow);
        });
    });
}

function finishEditingWorkout() {
    // Логика сохранения отредактированной тренировки
    const id = editingWorkoutId;
    const updatedWorkout = {
        id: id,
        name: $('#workout-name-input').value,
        date: $('#workout-date').value,
        notes: $('#workout-notes').value,
        exercises: []
    };

    $$('#workout-exercises-container .exercise-item').forEach(item => {
        const exName = item.querySelector('.exercise-name-input').value;
        if (!exName) return;

        const sets = [];
        item.querySelectorAll('.set-row').forEach(row => {
            const inputs = row.querySelectorAll('.set-input');
            sets.push({
                weight: parseFloat(inputs[0].value) || 0,
                reps: parseInt(inputs[1].value) || 0,
                rest: parseInt(inputs[2].value) || 0,
                completed: false
            });
        });
        updatedWorkout.exercises.push({ name: exName, sets: sets });
    });

    appState.workouts = appState.workouts.map(w => w.id === id ? updatedWorkout : w);
    saveAppState();
    closeModal();
    if (currentScreen === 'history') {
        renderHistoryScreen(); // Обновить список
    }
    editingWorkoutId = null;
}

// --- Управление шаблонами ---
function loadTemplateIntoWorkout(templateId) {
    const template = appState.templates.find(t => t.id == templateId);
    if (!template) {
        alert('Шаблон не найден.');
        return;
    }

    $('#workout-name-input').value = template.name + ' (Шаблон)';
    $('#workout-date').value = new Date().toISOString().slice(0, 16);
    $('#workout-notes').value = '';

    const container = $('#workout-exercises-container');
    container.innerHTML = '';
    template.exercises.forEach(ex => {
        addExerciseToWorkoutForm(ex.name);
        const newItem = container.lastElementChild;
        newItem.querySelector('.exercise-name-input').value = ex.name;
        const setsContainer = newItem.querySelector('.sets-container');
        setsContainer.innerHTML = ''; // Очищаем дефолтный подход
        for (let i = 0; i < ex.setsCount; i++) {
            const setRow = document.createElement('div');
            setRow.className = 'set-row';
            setRow.innerHTML = `
                <input type="number" class="set-input" placeholder="Вес">
                <input type="number" class="set-input" placeholder="Повт.">
                <input type="number" class="set-input" placeholder="Отдых (с)">
            `;
            setsContainer.appendChild(setRow);
        }
    });
}

function showTemplatesForSelection() {
    const modalBody = $('#add-exercise-modal .modal-body');
    modalBody.innerHTML = '<h3>Выберите шаблон</h3>';

    if (appState.templates.length === 0) {
        modalBody.innerHTML += '<p>Шаблонов пока нет.</p>';
        return;
    }

    appState.templates.forEach(template => {
        const div = document.createElement('div');
        div.className = 'exercise-item-full'; // Используем существующий стиль
        div.innerHTML = `<strong>${template.name}</strong>`;
        div.onclick = () => {
            loadTemplateIntoWorkout(template.id);
            closeModal();
        };
        modalBody.appendChild(div);
    });
    showModal('add-exercise-modal');
}

// --- Управление программами ---
function loadProgramDayIntoWorkout(program, dayIndex) {
    const day = program.days[dayIndex];
    if (!day) return;

    $('#workout-name-input').value = `[${program.name}] ${day.title}`;
    $('#workout-date').value = new Date().toISOString().slice(0, 16);
    $('#workout-notes').value = day.notes || '';

    const container = $('#workout-exercises-container');
    container.innerHTML = '';
    day.exercises.forEach(ex => {
        addExerciseToWorkoutForm(ex.name);
        const newItem = container.lastElementChild;
        newItem.querySelector('.exercise-name-input').value = ex.name;
        const setsContainer = newItem.querySelector('.sets-container');
        setsContainer.innerHTML = ''; // Очищаем дефолтный подход
        for (let i = 0; i < ex.sets; i++) {
            const setRow = document.createElement('div');
            setRow.className = 'set-row';
            setRow.innerHTML = `
                <input type="number" class="set-input" placeholder="Вес">
                <input type="number" class="set-input" placeholder="Повт.">
                <input type="number" class="set-input" placeholder="Отдых (с)">
            `;
            setsContainer.appendChild(setRow);
        }
    });
}

function showProgramDaysForSelection() {
    if (!activeProgram) {
        alert('Нет активной программы. Выберите программу в разделе "Программы".');
        showScreen('programs');
        return;
    }
    const modalBody = $('#add-exercise-modal .modal-body');
    modalBody.innerHTML = `<h3>Выберите день из программы "${activeProgram.name}"</h3>`;

    activeProgram.days.forEach((day, index) => {
        const div = document.createElement('div');
        div.className = 'exercise-item-full';
        div.innerHTML = `<strong>${day.title}</strong><small>${day.exercises.length} упр.</small>`;
        div.onclick = () => {
            loadProgramDayIntoWorkout(activeProgram, index);
            closeModal();
        };
        modalBody.appendChild(div);
    });
    showModal('add-exercise-modal');
}

// --- Управление упражнениями ---
function addCustomExerciseToLibrary() {
    const name = $('#custom-exercise-name').value.trim();
    const group = $('#custom-exercise-muscle-group').value;
    const subgroup = $('#custom-exercise-subgroup').value;
    const desc = $('#custom-exercise-description').value;

    if (!name) {
        alert('Введите название упражнения.');
        return;
    }

    const newExercise = {
        id: Date.now(),
        name: name,
        muscleGroup: group,
        subgroup: subgroup,
        description: desc,
        image: ''
    };

    appState.exercises.push(newExercise);
    saveAppState();
    alert('Упражнение добавлено в библиотеку!');
    closeModal();
    if (currentScreen === 'exercises') {
        renderExercisesScreen();
    }
    // Обновить список в модальном окне добавления в тренировку
    renderExercisesLibraryModalList();
}

function renderExercisesLibraryModalList() {
    const list = $('#exercises-library-modal-list');
    list.innerHTML = '';
    appState.exercises.forEach(ex => {
        const item = document.createElement('div');
        item.className = 'exercise-item-full';
        item.innerHTML = `<strong class="exercise-name">${ex.name}</strong><small class="exercise-group">Группа: ${ex.muscleGroup}</small>`;
        item.onclick = () => {
            addExerciseToWorkoutForm(ex.name);
            closeModal();
        };
        list.appendChild(item);
    });
}

// --- Управление трекером ---
function addCalories(amount, description = '', time = null) {
    const today = new Date().toISOString().split('T')[0];
    if (!appState.tracker.calories[today]) appState.tracker.calories[today] = [];
    appState.tracker.calories[today].push({
        id: Date.now(),
        amount: amount,
        desc: description,
        time: time || new Date().toTimeString().substring(0, 5)
    });
    saveAppState();
    if (currentScreen === 'tracker') {
        renderTrackerScreen();
    }
}

function addWater(amount, time = null) {
    const today = new Date().toISOString().split('T')[0];
    if (!appState.tracker.water[today]) appState.tracker.water[today] = [];
    appState.tracker.water[today].push({
        id: Date.now(),
        amount: amount,
        time: time || new Date().toTimeString().substring(0, 5)
    });
    saveAppState();
    if (currentScreen === 'tracker') {
        renderTrackerScreen();
    }
}

// --- Управление расписанием ---
function saveSchedule() {
    const days = [];
    if ($('#day-mon').checked) days.push('mon');
    if ($('#day-tue').checked) days.push('tue');
    if ($('#day-wed').checked) days.push('wed');
    if ($('#day-thu').checked) days.push('thu');
    if ($('#day-fri').checked) days.push('fri');
    if ($('#day-sat').checked) days.push('sat');
    if ($('#day-sun').checked) days.push('sun');

    appState.schedule = {
        days: days,
        time: $('#reminder-time').value,
        enabled: $('#enable-notifications').checked
    };
    saveAppState();
    alert('Расписание сохранено!');
}

// --- Управление настройками ---
function saveProfile() {
    appState.profile.name = $('#profile-name').value;
    appState.profile.level = $('#profile-level').value;
    appState.profile.avatar = $('#profile-avatar').value;
    try {
        const goalsObj = JSON.parse($('#profile-goals').value);
        if (typeof goalsObj.calories === 'number' && typeof goalsObj.water === 'number') {
            appState.profile.goals = goalsObj;
        }
    } catch (e) {
        alert('Ошибка в формате JSON целей.');
        return;
    }
    saveAppState();
    alert('Профиль сохранён!');
    closeModal();
    if (currentScreen === 'home') renderHomeScreen();
    if (currentScreen === 'tracker') renderTrackerScreen();
}

function saveCalorieGoal() {
    const newGoal = parseInt($('#daily-calorie-goal').value);
    if (newGoal && newGoal > 0) {
        appState.profile.goals.calories = newGoal;
        saveAppState();
        renderTrackerScreen();
        alert('Цель по калориям обновлена!');
    }
}

function saveWaterGoal() {
    const newGoal = parseFloat($('#daily-water-goal').value);
    if (newGoal && newGoal > 0) {
        appState.profile.goals.water = newGoal;
        saveAppState();
        renderTrackerScreen();
        alert('Цель по воде обновлена!');
    }
}

function changeTheme(newTheme) {
    appState.settings.theme = newTheme;
    updateInterfaceForState();
    saveAppState();
}

function changeAccentColor(color) {
    appState.settings.accentColor = color;
    applyAccentColor(color);
    saveAppState();
}

// --- Управление модальными окнами ---
function showModal(modalId) {
    $('#modal-overlay').classList.remove('hidden');
    $(`#${modalId}`).classList.remove('hidden');
    $('#modal-overlay').setAttribute('aria-hidden', 'false');
    $(`#${modalId}`).setAttribute('aria-hidden', 'false');
}

function closeModal() {
    $('#modal-overlay').classList.add('hidden');
    $$('.modal').forEach(m => m.classList.add('hidden'));
    $('#modal-overlay').setAttribute('aria-hidden', 'true');
    $$('.modal').forEach(m => m.setAttribute('aria-hidden', 'true'));
}

// --- Управление админ-панелью ---
function populateAdminExercisesList() {
    const list = $('#admin-exercises-list');
    list.innerHTML = '';
    appState.exercises.forEach(ex => {
        const item = document.createElement('div');
        item.className = 'admin-exercise-item';
        item.innerHTML = `
            <div>
                <strong class="exercise-name">${ex.name}</strong><br>
                <small>Группа: ${ex.muscleGroup}, Подгруппа: ${ex.subgroup}</small>
            </div>
            <div>
                <button class="btn btn-outline btn-sm edit-ex-btn" data-id="${ex.id}">✏️</button>
                <button class="btn btn-outline btn-sm delete-ex-btn" data-id="${ex.id}">🗑️</button>
            </div>
        `;
        list.appendChild(item);
    });

    // Добавить обработчики для кнопок удаления
    $$('.admin-exercises-list .delete-ex-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            if (confirm('Удалить упражнение?')) {
                appState.exercises = appState.exercises.filter(ex => ex.id !== id);
                saveAppState();
                populateAdminExercisesList();
                if (currentScreen === 'exercises') renderExercisesScreen();
                renderExercisesLibraryModalList();
            }
        });
    });
}

function populateAdminProgramsList() {
    const list = $('#admin-programs-list');
    list.innerHTML = '';
    appState.programs.forEach(prog => {
        const item = document.createElement('div');
        item.className = 'admin-program-item';
        item.innerHTML = `
            <div>
                <strong class="program-name">${prog.name}</strong><br>
                <small>${prog.description}</small>
            </div>
            <div>
                <button class="btn btn-outline btn-sm delete-prog-btn" data-id="${prog.id}">🗑️</button>
            </div>
        `;
        list.appendChild(item);
    });

    $$('.admin-programs-list .delete-prog-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            if (confirm('Удалить программу?')) {
                appState.programs = appState.programs.filter(p => p.id !== id);
                saveAppState();
                populateAdminProgramsList();
                if (currentScreen === 'programs') renderProgramsScreen();
            }
        });
    });
}

function populateAdminArticlesList() {
    const list = $('#admin-articles-list');
    list.innerHTML = '';
    appState.knowledge.articles.forEach(article => {
        const item = document.createElement('div');
        item.className = 'admin-article-item';
        item.innerHTML = `
            <div>
                <strong class="article-title">${article.title}</strong><br>
                <small>Категория: ${article.category}</small>
            </div>
            <div>
                <button class="btn btn-outline btn-sm delete-art-btn" data-id="${article.id}">🗑️</button>
            </div>
        `;
        list.appendChild(item);
    });

    $$('.admin-articles-list .delete-art-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            if (confirm('Удалить статью?')) {
                appState.knowledge.articles = appState.knowledge.articles.filter(a => a.id !== id);
                saveAppState();
                populateAdminArticlesList();
                if (currentScreen === 'knowledge') renderKnowledgeScreen();
            }
        });
    });
}

// --- Калькулятор 1ПМ ---
function calculateOneRepMax() {
    const weight = parseFloat($('#calc-weight').value);
    const reps = parseInt($('#calc-reps').value);

    if (isNaN(weight) || isNaN(reps) || weight <= 0 || reps <= 0) {
        $('#result-1rm').textContent = 'Ошибка ввода.';
        return;
    }

    // Формула Бжицкого
    const oneRepMax = weight * (1 + reps / 30);
    $('#result-1rm').textContent = `1ПМ (Бжицкий): ${oneRepMax.toFixed(2)} кг`;
}

// --- Управление событиями (глобальные обработчики) ---
function setupEventListeners() {
    // Навигация
    $$('.nav-btn[data-screen]').forEach(btn => {
        btn.addEventListener('click', () => showScreen(btn.dataset.screen));
    });

    // Кнопки быстрого действия
    $('#start-workout-btn').addEventListener('click', () => showScreen('workout'));
    $('#quick-workout-btn').addEventListener('click', () => showScreen('workout'));
    $('#quick-calories-btn').addEventListener('click', () => showModal('add-calories-modal'));

    // Работа с тренировкой
    $('#add-exercise-to-workout-btn').addEventListener('click', () => showModal('add-exercise-modal'));
    $('#load-template-btn').addEventListener('click', showTemplatesForSelection);
    $('#save-workout-btn').addEventListener('click', saveWorkout);
    $('#save-template-btn').addEventListener('click', saveCurrentWorkoutAsTemplate);

    // Работа с упражнениями (в модальном окне)
    $('#add-custom-exercise-btn').addEventListener('click', addCustomExerciseToLibrary);
    // Делегирование клика по списку упражнений в модальном окне
    $('#exercises-library-modal-list').addEventListener('click', function(e) {
        const item = e.target.closest('.exercise-item-full');
        if (item) {
            const name = item.querySelector('.exercise-name').textContent;
            addExerciseToWorkoutForm(name);
            closeModal();
        }
    });

    // Работа с трекером
    $$('.quick-add-cal').forEach(btn => {
        btn.addEventListener('click', () => {
            addCalories(parseInt(btn.dataset.amount));
        });
    });
    $$('.quick-add-water').forEach(btn => {
        btn.addEventListener('click', () => {
            addWater(parseFloat(btn.dataset.amount));
        });
    });
    $('#add-calories-modal-btn').addEventListener('click', () => {
        const amount = parseInt($('#calories-modal-input').value);
        const desc = $('#calories-modal-desc').value;
        const time = $('#calories-modal-time').value;
        if (amount && amount > 0) {
            addCalories(amount, desc, time);
            $('#calories-modal-input').value = '';
            $('#calories-modal-desc').value = '';
            $('#calories-modal-time').value = '';
            closeModal();
        }
    });
    $('#add-water-modal-btn').addEventListener('click', () => {
        const amount = parseFloat($('#water-modal-input').value);
        const time = $('#water-modal-time').value;
        if (amount && amount > 0) {
            addWater(amount, time);
            $('#water-modal-input').value = '';
            $('#water-modal-time').value = '';
            closeModal();
        }
    });

    // Цели трекера
    $('#save-calorie-goal-btn').addEventListener('click', saveCalorieGoal);
    $('#save-water-goal-btn').addEventListener('click', saveWaterGoal);

    // Расписание
    $('#save-schedule-btn').addEventListener('click', saveSchedule);

    // Программы
    $('#add-program-btn').addEventListener('click', () => showModal('add-program-modal'));
    $('#save-program-from-modal-btn').addEventListener('click', function() {
        const name = $('#program-name-input').value;
        const level = $('#program-level').value;
        const type = $('#program-type').value;
        const duration = $('#program-duration').value;
        const description = $('#program-description').value;
        let exercisesJson = $('#program-exercises-json').value;

        if (!name || !exercisesJson) {
            alert('Заполните обязательные поля.');
            return;
        }

        try {
            const parsedExercises = JSON.parse(exercisesJson);
            if (!Array.isArray(parsedExercises)) throw new Error();

            const newProgram = {
                id: Date.now(),
                name: name,
                level: level,
                type: type,
                durationWeeks: parseInt(duration),
                description: description,
                exercises: parsedExercises
            };

            appState.programs.push(newProgram);
            saveAppState();
            alert('Программа добавлена!');
            closeModal();
            if (currentScreen === 'programs') renderProgramsScreen();
        } catch (e) {
            alert('Ошибка в формате JSON упражнений.');
        }
    });

    // Упражнения
    $('#add-exercise-btn').addEventListener('click', () => {
        $('#custom-exercise-name').value = '';
        $('#custom-exercise-description').value = '';
        showModal('add-exercise-modal');
        // Переключить на вкладку "Свое упражнение"
        $$('.modal-tab-btn[data-tab="custom"]').forEach(btn => btn.click());
    });

    // Настройки
    $('#profile-settings-btn').addEventListener('click', () => {
        $('#profile-name').value = appState.profile.name;
        $('#profile-level').value = appState.profile.level;
        $('#profile-avatar').value = appState.profile.avatar;
        $('#profile-goals').value = JSON.stringify(appState.profile.goals);
        showModal('profile-modal');
    });
    $('#save-profile-btn').addEventListener('click', saveProfile);

    $('#theme-settings-btn').addEventListener('click', () => {
        // Установить активную тему
        $$('.theme-mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === appState.settings.theme);
        });
        // Установить активный цвет
        $$('.color-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.color === appState.settings.accentColor);
        });
        showModal('theme-settings-modal');
    });
    $$('.theme-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.theme-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            changeTheme(btn.dataset.mode);
        });
    });
    $$('.color-option').forEach(opt => {
        opt.addEventListener('click', () => {
            $$('.color-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            changeAccentColor(opt.dataset.color);
        });
    });
    $('#save-theme-settings-btn').addEventListener('click', closeModal);

    // Калькулятор
    $('#calculate-1rm-btn').addEventListener('click', calculateOneRepMax);

    // Фильтры
    // История
    $$('.filter-btn[data-filter]').forEach(btn => {
        if (btn.closest('#screen-history')) {
            btn.addEventListener('click', () => {
                $$('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentPage = 1; // Сброс при фильтрации
                renderHistoryScreen();
            });
        }
    });
    // Программы
    $$('.program-filters .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.program-filters .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Логика фильтрации программ
            const filter = btn.dataset.filter;
            const items = document.querySelectorAll('#programs-list .program-item');
            items.forEach(item => {
                if (filter === 'all') {
                    item.style.display = 'block';
                } else {
                    // Предположим, что у программы есть data-type или она входит в категорию
                    // В реальности нужно хранить тип в объекте программы
                    item.style.display = 'block'; // Заглушка
                }
            });
        });
    });
    // Упражнения
    $$('.exercise-filters .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.exercise-filters .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderExercisesScreen();
        });
    });

    // Пагинация истории
    $('#prev-page-btn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderHistoryScreen();
        }
    });
    $('#next-page-btn').addEventListener('click', () => {
        const filter = $('.filter-btn.active').dataset.filter;
        let items = appState.workouts;
        const now = new Date();
        switch (filter) {
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                items = items.filter(w => new Date(w.date) >= weekAgo);
                break;
            case 'month':
                const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                items = items.filter(w => new Date(w.date) >= monthAgo);
                break;
            case '3months':
                const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                items = items.filter(w => new Date(w.date) >= threeMonthsAgo);
                break;
        }
        const totalPages = Math.ceil(items.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderHistoryScreen();
        }
    });

    // Кнопки "Назад/Вперед" в тренеру
    $$('.open-calculator-btn').forEach(btn => {
        btn.addEventListener('click', () => showModal('calculator-modal'));
    });

    // Смена вкладок в трекере
    $$('.tab-btn[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.tab-btn[data-tab]').forEach(b => {
                b.classList.toggle('active', b.dataset.tab === btn.dataset.tab);
                b.setAttribute('aria-selected', b.dataset.tab === btn.dataset.tab);
            });
            $$('.tab-content').forEach(c => {
                c.classList.toggle('active', c.id === btn.dataset.tab + '-tab');
                c.setAttribute('aria-hidden', c.id !== btn.dataset.tab + '-tab');
            });
            // Обновить отображение данных для новой вкладки
            if (currentScreen === 'tracker') {
                renderTrackerScreen();
            }
        });
    });

    // Смена периода в прогрессе
    $$('.period-btn[data-period]').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.period-btn[data-period]').forEach(b => {
                b.classList.toggle('active', b.dataset.period === btn.dataset.period);
                b.setAttribute('aria-checked', b.dataset.period === btn.dataset.period);
            });
            // Перерисовать график/статистику для нового периода
            renderProgressScreen(); // Пока заглушка
        });
    });

    // Кнопки в разделе "Инфо"
    $('#help-guides-btn').addEventListener('click', () => showModal('help-guides-modal'));
    $('#feedback-btn').addEventListener('click', () => showModal('feedback-modal'));
    $('#contact-dev-btn').addEventListener('click', () => showModal('contact-dev-modal'));
    $('#about-app-btn').addEventListener('click', () => showModal('about-app-modal'));
    $('#export-word-btn').addEventListener('click', function() {
        alert('Функция экспорта в Word находится в разработке.');
        // Здесь будет логика генерации .docx
    });
    $('#import-word-btn').addEventListener('click', function() {
        alert('Функция импорта из Word находится в разработке.');
        // Здесь будет логика парсинга .docx
    });

    // Админ-панель
    $$('.admin-tab-btn[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.admin-tab-btn[data-tab]').forEach(b => {
                b.classList.toggle('active', b.dataset.tab === btn.dataset.tab);
                b.setAttribute('aria-selected', b.dataset.tab === btn.dataset.tab);
            });
            $$('.admin-tab-content').forEach(c => {
                c.classList.toggle('active', c.id === btn.dataset.tab + '-admin-tab');
                c.setAttribute('aria-hidden', c.id !== btn.dataset.tab + '-admin-tab');
            });
            // Заполнить контент при переключении
            if (btn.dataset.tab === 'exercises') populateAdminExercisesList();
            if (btn.dataset.tab === 'programs') populateAdminProgramsList();
            if (btn.dataset.tab === 'articles') populateAdminArticlesList();
        });
    });

    $('#admin-add-exercise-btn').addEventListener('click', function() {
        const name = $('#admin-exercise-name').value;
        const group = $('#admin-exercise-muscle-group').value;
        const subgroup = $('#admin-exercise-subgroup').value;
        const desc = $('#admin-exercise-description').value;
        const img = $('#admin-exercise-image-url').value;

        if (!name) {
            alert('Введите название упражнения.');
            return;
        }

        const newExercise = {
            id: Date.now(),
            name: name,
            muscleGroup: group,
            subgroup: subgroup,
            description: desc,
            image: img
        };

        appState.exercises.push(newExercise);
        saveAppState();
        alert('Упражнение добавлено (админка)!');
        populateAdminExercisesList(); // Обновить список в админке
        if (currentScreen === 'exercises') renderExercisesScreen(); // Обновить основной экран
        renderExercisesLibraryModalList(); // Обновить модальное окно
    });

    $('#admin-add-program-btn').addEventListener('click', function() {
        const name = $('#admin-program-name').value;
        const desc = $('#admin-program-description').value;
        let json = $('#admin-program-json').value;

        if (!name || !json) {
            alert('Заполните название и JSON.');
            return;
        }

        try {
            const parsed = JSON.parse(json);
            const newProg = {
                id: Date.now(),
                name: name,
                description: desc,
                days: Array.isArray(parsed) ? [{ title: 'День 1', exercises: parsed }] : parsed // Адаптируем формат
            };
            appState.programs.push(newProg);
            saveAppState();
            alert('Программа добавлена (админка)!');
            populateAdminProgramsList();
            if (currentScreen === 'programs') renderProgramsScreen();
        } catch (e) {
            alert('Ошибка в формате JSON программы.');
        }
    });

    $('#admin-add-article-btn').addEventListener('click', function() {
        const title = $('#admin-article-title').value;
        const cat = $('#admin-article-category').value;
        const cont = $('#admin-article-content').value;
        const tags = $('#admin-article-tags').value;

        if (!title || !cat || !cont) {
            alert('Заполните обязательные поля статьи.');
            return;
        }

        const newArticle = {
            id: Date.now(),
            title: title,
            category: cat,
            content: cont,
            tags: tags.split(',').map(t => t.trim()).filter(t => t)
        };

        appState.knowledge.articles.push(newArticle);
        saveAppState();
        alert('Статья добавлена (админка)!');
        populateAdminArticlesList();
        if (currentScreen === 'knowledge') renderKnowledgeScreen();
    });

    // Кнопка "Сохранить" в модальном окне редактирования тренировки
    $('#edit-workout-modal').addEventListener('click', function(e) {
        if (e.target.id === 'save-edited-workout-btn') {
            finishEditingWorkout();
        }
    });

    // Кнопки закрытия модальных окон
    $$('.close-btn, .modal-overlay').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target === btn || btn.classList.contains('close-btn')) {
                closeModal();
            }
        });
    });

    // Уведомления
    $('#notifications-btn').addEventListener('click', () => showModal('notifications-modal'));

    // Админ-панель (отображается при двойном клике на логотип или по команде)
    let adminClickCount = 0;
    $('.logo-section').addEventListener('click', () => {
        adminClickCount++;
        if (adminClickCount >= 5) {
            $('#admin-panel-btn').style.display = 'flex';
            appState.settings.debugMode = true;
            saveAppState();
            alert('Админ-панель разблокирована.');
            adminClickCount = 0;
        }
        setTimeout(() => { adminClickCount = 0; }, 3000);
    });
    $('#admin-panel-btn').addEventListener('click', () => showModal('admin-panel-modal'));

    // Отправка обратной связи
    $('#send-feedback-btn').addEventListener('click', () => {
        const type = $('#feedback-type').value;
        const msg = $('#feedback-message').value;
        if (!msg.trim()) {
            alert('Введите сообщение.');
            return;
        }
        // В реальном приложении: API-вызов
        appState.notifications.push({
            id: Date.now(),
            type: 'feedback',
            message: `(${type}) ${msg}`,
            timestamp: new Date().toISOString(),
            read: false
        });
        saveAppState();
        renderNotificationsBadge();
        alert('Спасибо за отзыв!');
        $('#feedback-message').value = '';
        closeModal();
    });

    // Связь с разработчиком
    $('#contact-email-btn').addEventListener('click', () => {
        window.location.href = 'mailto:fitapp@example.com?subject=FitApp%20v2.0%20Feedback';
    });
    $('#contact-telegram-btn').addEventListener('click', () => {
        window.open('https://t.me/your_fitapp_bot', '_blank');
    });

    // Смена темы (глобальная кнопка)
    $('#theme-toggle-btn').addEventListener('click', () => {
        const newTheme = appState.settings.theme === 'dark' ? 'light' : 'dark';
        changeTheme(newTheme);
    });

    // Поиск в библиотеке упражнений (в модальном окне)
    const searchInput = $('#exercise-search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = searchInput.value.toLowerCase();
                const items = $$('#exercises-library-modal-list .exercise-item-full');
                items.forEach(item => {
                    const name = item.querySelector('.exercise-name').textContent.toLowerCase();
                    item.style.display = name.includes(query) ? 'block' : 'none';
                });
            }, 300);
        });
    }
}

// --- Завершение инициализации ---
function renderInitialScreens() {
    renderHomeScreen();
    renderHistoryScreen();
    renderTrackerScreen();
    renderProgramsScreen();
    renderExercisesScreen();
    renderKnowledgeScreen();
    // Загрузить активную программу из LS
    const savedActiveProgram = localStorage.getItem('fitapp_active_program');
    if (savedActiveProgram) {
        try {
            activeProgram = JSON.parse(savedActiveProgram);
        } catch (e) {
            console.error('Ошибка загрузки активной программы:', e);
        }
    }
}
