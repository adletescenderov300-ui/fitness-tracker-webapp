// --- Глобальные переменные и состояния ---
let currentScreen = 'home';
let currentPage = 1; // Для пагинации в истории
const itemsPerPage = 5; // Элементов на странице истории

// --- Состояния данных (имитация LocalStorage) ---
// Эти переменные будут хранить данные в памяти до тех пор, пока не будет реализовано сохранение.
let appState = {
    workouts: [],
    templates: [],
    programs: [],
    exercises: [],
    tracker: {
        calories: {},
        water: {}
    },
    schedule: {
        days: [],
        time: '',
        enabled: false
    },
    profile: {
        name: 'Спортсмен',
        level: 'beginner',
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
        articles: [],
        exercisesInfo: {},
        programsInfo: {}
    }
};

// --- Вспомогательные функции ---
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// --- Инициализация приложения ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('FitApp v2.0 загружено');
    initializeApp();
});

function initializeApp() {
    // Загрузка данных из LocalStorage (заглушка)
    loadAppState();

    // Установка начальных значений интерфейса
    updateInterfaceForState();

    // Настройка обработчиков событий
    setupGlobalEventListeners();
    setupHomeScreenEvents();
    setupWorkoutScreenEvents();
    setupProgressScreenEvents();
    setupHistoryScreenEvents();
    setupScheduleScreenEvents();
    setupTrackerScreenEvents();
    setupProgramsScreenEvents();
    setupExercisesScreenEvents();
    setupKnowledgeScreenEvents();
    setupCoachScreenEvents();
    setupInfoScreenEvents();
    setupModalEvents();

    // Рендер начального состояния
    renderHomeScreen();
    renderNotificationsBadge();
}

function loadAppState() {
    // Заглушка для загрузки из LocalStorage
    // const storedState = localStorage.getItem('fitapp_state');
    // if (storedState) {
    //     appState = JSON.parse(storedState);
    // }
    // Для демонстрации, добавим немного данных
    if (appState.workouts.length === 0) {
        appState.workouts = [
            { id: 1, name: 'Тренировка груди', date: '2024-05-20T18:00', exercises: [{name: 'Жим лежа', sets: [{weight: 80, reps: 8}, {weight: 85, reps: 6}]}], notes: 'Хорошая тренировка!' },
            { id: 2, name: 'Тренировка ног', date: '2024-05-22T19:30', exercises: [{name: 'Приседания', sets: [{weight: 100, reps: 10}, {weight: 110, reps: 8}]}] }
        ];
    }
    if (appState.exercises.length === 0) {
        appState.exercises = [
            { id: 1, name: 'Жим лежа', muscleGroup: 'chest', subgroup: 'pectoralis_major', description: 'Базовое упражнение для груди.' },
            { id: 2, name: 'Подтягивания', muscleGroup: 'back', subgroup: 'latissimus_dorsi', description: 'Упражнение для спины и бицепсов.' }
        ];
    }
    if (appState.programs.length === 0) {
        appState.programs = [
            { id: 1, name: 'Базовая 4-дневка', level: 'beginner', type: 'fullbody', description: 'Подходит для новичков.', days: [{title: 'День 1', exercises: [{name: 'Жим лежа', sets: 3, reps: '8-12'}]}, {title: 'День 2', exercises: [{name: 'Приседания', sets: 3, reps: '8-12'}]}] }
        ];
    }
    if (appState.knowledge.articles.length === 0) {
        appState.knowledge.articles = [
            { id: 1, title: 'Как составить программу', category: 'principles', content: 'Содержимое статьи...' }
        ];
    }
}

function saveAppState() {
    // Заглушка для сохранения в LocalStorage
    // localStorage.setItem('fitapp_state', JSON.stringify(appState));
    console.log('Состояние приложения сохранено (виртуально).');
}

function updateInterfaceForState() {
    // Применить текущую тему
    document.body.className = `theme-${appState.settings.theme}`;
    // Применить акцентный цвет
    applyAccentColor(appState.settings.accentColor);
    // Обновить бейдж уведомлений
    renderNotificationsBadge();
}

function applyAccentColor(colorName) {
    const colors = {
        indigo: '#4F46E5',
        emerald: '#10B981',
        violet: '#8B5CF6',
        orange: '#F97316',
        blue: '#3B82F6'
    };
    document.documentElement.style.setProperty('--accent-color', colors[colorName] || colors.indigo);
}

function renderNotificationsBadge() {
    const count = appState.notifications.filter(n => !n.read).length;
    const badge = $('#app-container header .notification-badge');
    if (badge) {
        badge.textContent = count;
        badge.classList.toggle('hidden', count === 0);
    }
}

// --- Обработчики событий ---
function setupGlobalEventListeners() {
    // Навигация по экранам
    $$('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const screen = btn.dataset.screen;
            if (screen) {
                showScreen(screen);
            }
        });
    });

    // Кнопка смены темы
    $('#theme-toggle-btn')?.addEventListener('click', toggleTheme);
}

function setupHomeScreenEvents() {
    $('#start-workout-btn')?.addEventListener('click', () => showScreen('workout'));
    $('#quick-calories-btn')?.addEventListener('click', () => showModal('add-calories-modal'));
}

function setupWorkoutScreenEvents() {
    $('#add-exercise-to-workout-btn')?.addEventListener('click', () => showModal('add-exercise-modal'));
    $('#save-workout-btn')?.addEventListener('click', saveCurrentWorkout);
    $('#save-template-btn')?.addEventListener('click', saveCurrentWorkoutAsTemplate);
}

function setupProgressScreenEvents() {
    // Обработчики для кнопок периода
    $$('.period-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Перерисовать прогресс для нового периода
            renderProgressScreen();
        });
    });
}

function setupHistoryScreenEvents() {
    // Обработчики для фильтров
    $$('.filter-btn').forEach(btn => {
        if (btn.closest('#screen-history')) { // Убедимся, что это фильтр истории
            btn.addEventListener('click', () => {
                $$('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentPage = 1; // Сбросить на первую страницу при фильтрации
                renderHistoryScreen();
            });
        }
    });

    // Обработчики для пагинации
    $('#prev-page-btn')?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderHistoryScreen();
        }
    });
    $('#next-page-btn')?.addEventListener('click', () => {
        const totalItems = getFilteredHistoryItems().length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderHistoryScreen();
        }
    });
}

function setupScheduleScreenEvents() {
    $('#save-schedule-btn')?.addEventListener('click', saveSchedule);
}

function setupTrackerScreenEvents() {
    // Переключение вкладок
    $$('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tabId = btn.dataset.tab + '-tab';
            $$('.tab-content').forEach(c => c.classList.remove('active'));
            $(`#${tabId}`).classList.add('active');
            // Обновить отображение трекера после смены вкладки
            renderTrackerScreen();
        });
    });

    // Быстрое добавление калорий
    $$('.quick-add-cal').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseInt(btn.dataset.amount);
            addCalories(amount, `Быстрое добавление (+${amount})`);
        });
    });

    // Быстрое добавление воды
    $$('.quick-add-water').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseFloat(btn.dataset.amount);
            addWater(amount);
        });
    });

    // Ручное добавление
    $('#add-calories-btn')?.addEventListener('click', () => {
        const input = $('#calories-input');
        const descInput = $('#calories-desc');
        const amount = parseInt(input.value);
        if (amount && amount > 0) {
            addCalories(amount, descInput.value);
            input.value = '';
            descInput.value = '';
        }
    });
    $('#add-water-btn')?.addEventListener('click', () => {
        const input = $('#water-input');
        const amount = parseFloat(input.value);
        if (amount && amount > 0) {
            addWater(amount);
            input.value = '';
        }
    });

    // Сохранение целей
    $('#save-calorie-goal-btn')?.addEventListener('click', () => {
        const newGoal = parseInt($('#daily-calorie-goal').value);
        if (newGoal && newGoal > 0) {
            appState.profile.goals.calories = newGoal;
            saveAppState();
            renderTrackerScreen(); // Обновить отображение
        }
    });
    $('#save-water-goal-btn')?.addEventListener('click', () => {
        const newGoal = parseFloat($('#daily-water-goal').value);
        if (newGoal && newGoal > 0) {
            appState.profile.goals.water = newGoal;
            saveAppState();
            renderTrackerScreen(); // Обновить отображение
        }
    });
}

function setupProgramsScreenEvents() {
    $('#add-program-btn')?.addEventListener('click', () => {
        // Очистить форму перед открытием
        $('#program-name-input').value = '';
        $('#program-description').value = '';
        $('#program-exercises-json').value = '[{"name": "Пример упражнения", "sets": 3, "reps": "8-12"}]';
        showModal('add-program-modal');
    });
    $('#save-program-from-modal-btn')?.addEventListener('click', saveProgramFromModal);
}

function setupExercisesScreenEvents() {
    $('#add-exercise-btn')?.addEventListener('click', () => {
        // Очистить форму
        $('#custom-exercise-name').value = '';
        $('#custom-exercise-description').value = '';
        showModal('add-exercise-modal');
        // Показать вкладку "Свое упражнение"
        $$('#add-exercise-modal .modal-tab-btn').forEach((btn, i) => {
            btn.classList.toggle('active', i === 1);
        });
        $$('#add-exercise-modal .modal-tab-content').forEach((content, i) => {
            content.classList.toggle('active', i === 1);
        });
    });
    // Фильтры упражнений
    $$('.exercise-filters .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.exercise-filters .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderExercisesScreen();
        });
    });
}

function setupKnowledgeScreenEvents() {
    // События для базы знаний (если есть интерактивные элементы)
}

function setupCoachScreenEvents() {
    $$('.open-calculator-btn').forEach(btn => {
        btn.addEventListener('click', () => showModal('calculator-modal'));
    });
}

function setupInfoScreenEvents() {
    // Профиль
    $('#profile-settings-btn')?.addEventListener('click', () => {
        $('#profile-name').value = appState.profile.name;
        $('#profile-level').value = appState.profile.level;
        $('#profile-avatar').value = appState.profile.avatar;
        $('#profile-goals').value = JSON.stringify(appState.profile.goals);
        showModal('profile-modal');
    });
    $('#save-profile-btn')?.addEventListener('click', saveProfile);

    // Тема и цвета
    $('#theme-settings-btn')?.addEventListener('click', () => {
        $$('.theme-mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === appState.settings.theme);
        });
        $$('.color-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.color === appState.settings.accentColor);
        });
        showModal('theme-settings-modal');
    });
    // Сохранение темы
    $$('.theme-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.theme-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.settings.theme = btn.dataset.mode;
            updateInterfaceForState();
        });
    });
    $$('.color-option').forEach(opt => {
        opt.addEventListener('click', () => {
            $$('.color-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            appState.settings.accentColor = opt.dataset.color;
            updateInterfaceForState();
        });
    });
    $('#save-theme-settings-btn')?.addEventListener('click', () => {
        saveAppState();
        closeModal();
    });

    // Справочные материалы
    $('#help-guides-btn')?.addEventListener('click', () => showModal('help-guides-modal'));
    $('#feedback-btn')?.addEventListener('click', () => showModal('feedback-modal'));
    $('#contact-dev-btn')?.addEventListener('click', () => showModal('contact-dev-modal'));
    $('#about-app-btn')?.addEventListener('click', () => showModal('about-app-modal'));

    // Экспорт/Импорт (заглушка)
    $('#export-word-btn')?.addEventListener('click', () => alert('Функция экспорта в разработке.'));
    $('#import-word-btn')?.addEventListener('click', () => alert('Функция импорта в разработке.'));
}

function setupModalEvents() {
    // Закрытие модальных окон
    $$('.close-btn').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    $('#modal-overlay')?.addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') closeModal();
    });

    // Вкладки в модальных окнах (например, добавление упражнения)
    $$('#add-exercise-modal .modal-tab-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            $$('#add-exercise-modal .modal-tab-btn').forEach(b => b.classList.remove('active'));
            $$('#add-exercise-modal .modal-tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            $$('#add-exercise-modal .modal-tab-content')[index].classList.add('active');
        });
    });

    // Добавление упражнения из библиотеки (в модальном окне)
    // Это требует рендеринга списка, который зависит от данных.
    // Пока просто добавим обработчик, который будет вызывать функцию выбора.
    $('#exercises-library-modal-list')?.parentElement?.addEventListener('click', function(e) {
        if (e.target.closest('.exercise-item-full')) {
             const exerciseName = e.target.closest('.exercise-item-full').querySelector('strong').textContent;
             addExerciseToCurrentWorkoutForm(exerciseName);
             closeModal();
        }
    });

    // Добавление своего упражнения
    $('#add-custom-exercise-btn')?.addEventListener('click', addCustomExerciseToLibrary);

    // Добавление калорий/воды из модального окна
    $('#add-calories-modal-btn')?.addEventListener('click', () => {
        const input = $('#calories-modal-input');
        const descInput = $('#calories-modal-desc');
        const timeInput = $('#calories-modal-time');
        const amount = parseInt(input.value);
        if (amount && amount > 0) {
            addCalories(amount, descInput.value, timeInput.value || undefined);
            input.value = '';
            descInput.value = '';
            timeInput.value = '';
            closeModal();
        }
    });
    $('#add-water-modal-btn')?.addEventListener('click', () => {
        const input = $('#water-modal-input');
        const timeInput = $('#water-modal-time');
        const amount = parseFloat(input.value);
        if (amount && amount > 0) {
            addWater(amount, timeInput.value || undefined);
            input.value = '';
            timeInput.value = '';
            closeModal();
        }
    });

    // Калькулятор 1ПМ
    $('#calculate-1rm-btn')?.addEventListener('click', calculateOneRepMax);

    // Отправка обратной связи
    $('#send-feedback-btn')?.addEventListener('click', () => {
        const type = $('#feedback-type').value;
        const message = $('#feedback-message').value;
        if (message.trim()) {
            // В реальном приложении здесь был бы API-вызов
            appState.notifications.push({ id: Date.now(), type: 'feedback', message: `Получено сообщение: ${type}`, read: false, timestamp: new Date().toISOString() });
            saveAppState();
            renderNotificationsBadge();
            alert('Спасибо за обратную связь!');
            $('#feedback-message').value = '';
            closeModal();
        }
    });

    // Админ-панель (заглушка)
    // $('#admin-panel-btn')?.addEventListener('click', () => showModal('admin-panel-modal')); // Предположим, есть такая кнопка
    // Управление упражнениями в админке
    $('#admin-add-exercise-btn')?.addEventListener('click', addCustomExerciseToLibraryAdmin);
    // Фильтры в админке
    $('#admin-exercise-filter')?.addEventListener('change', renderAdminExercisesList);
    $('#admin-exercise-search')?.addEventListener('input', renderAdminExercisesList);
    // Добавление статьи
    $('#admin-add-article-btn')?.addEventListener('click', addArticleToKnowledgeBase);
}

// --- Логика экранов ---

function showScreen(screenName) {
    // Скрыть текущий экран
    $(`#screen-${currentScreen}`).classList.remove('active');
    // Показать новый экран
    $(`#screen-${screenName}`).classList.add('active');
    currentScreen = screenName;

    // Обновить активную кнопку навигации
    $$('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.screen === screenName);
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
            currentPage = 1; // Сброс на первую страницу при входе
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

function renderHomeScreen() {
    // Обновить приветствие
    $('.welcome-text').textContent = `👋 Привет, ${appState.profile.name}!`;

    // Обновить статистику
    $('#stat-total-workouts').textContent = appState.workouts.length;
    // Заглушка для других статистик
    $('#stat-streak').textContent = '0'; // Нужно рассчитать
    $('#stat-total-tonnage').textContent = '0'; // Нужно рассчитать
    $('#stat-avg-weight').textContent = '0'; // Нужно рассчитать

    // Обновить последние тренировки
    const recentList = $('#recent-workouts-list');
    recentList.innerHTML = '';
    appState.workouts.slice(0, 3).forEach(w => {
        const item = document.createElement('div');
        item.className = 'history-item';
        const date = new Date(w.date).toLocaleDateString('ru-RU');
        item.innerHTML = `<strong>${w.name}</strong><br><small>${date}</small>`;
        recentList.appendChild(item);
    });
}

function renderWorkoutScreen() {
    // Сброс формы при рендере экрана тренировки (если не редактируем)
    // Пока просто очистим контейнер упражнений
    $('#workout-exercises-container').innerHTML = '';
    // Добавим одно пустое упражнение по умолчанию
    addExerciseToCurrentWorkoutForm();
}

function renderProgressScreen() {
    // Заглушка: просто обновим значения на +/-0%
    $('#progress-workouts-change').textContent = '+0%';
    $('#progress-tonnage-change').textContent = '+0%';
    $('#progress-avg-weight-change').textContent = '+0%';
}

function getFilteredHistoryItems() {
    const filter = $('.filter-btn.active')?.dataset.filter || 'all';
    let filtered = appState.workouts;

    const now = new Date();
    switch (filter) {
        case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(w => new Date(w.date) >= weekAgo);
            break;
        case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            filtered = filtered.filter(w => new Date(w.date) >= monthAgo);
            break;
        case '3months':
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            filtered = filtered.filter(w => new Date(w.date) >= threeMonthsAgo);
            break;
        // 'all' case does nothing, returns all
    }
    return filtered.reverse(); // Новые первыми
}

function renderHistoryScreen() {
    const filteredItems = getFilteredHistoryItems();
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = filteredItems.slice(startIndex, endIndex);

    const historyList = $('#history-list');
    historyList.innerHTML = '';
    pageItems.forEach(w => {
        const item = document.createElement('div');
        item.className = 'history-item';
        const date = new Date(w.date).toLocaleDateString('ru-RU');
        item.innerHTML = `<strong>${w.name}</strong><br><small>${date}</small>`;
        historyList.appendChild(item);
    });

    // Обновить пагинацию
    $('#page-info').textContent = `Страница ${currentPage} из ${totalPages || 1}`;
    $('#prev-page-btn').disabled = currentPage === 1;
    $('#next-page-btn').disabled = currentPage >= totalPages;
}

function renderScheduleScreen() {
    // Загрузить состояние расписания в интерфейс
    appState.schedule.days.forEach(day => {
        $(`#day-${day}`).checked = true;
    });
    $('#reminder-time').value = appState.schedule.time;
    $('#enable-notifications').checked = appState.schedule.enabled;

    // Обновить список предстоящих тренировок (заглушка)
    const upcomingList = $('#upcoming-list');
    upcomingList.innerHTML = '<li>Тренировка "Базовая 4-дневка - День 1" (Пн)</li><li>Тренировка "Базовая 4-дневка - День 2" (Ср)</li>';
}

function renderTrackerScreen() {
    const today = new Date().toISOString().split('T')[0];
    const currentTab = $('#calories-tab').classList.contains('active') ? 'calories' : 'water';

    if (currentTab === 'calories') {
        const todayCals = appState.tracker.calories[today] ? appState.tracker.calories[today].reduce((sum, e) => sum + e.amount, 0) : 0;
        const goalCals = appState.profile.goals.calories;
        $('#calories-today').textContent = todayCals;
        $('#calories-goal').textContent = goalCals;
        const calPercent = Math.min(100, (todayCals / goalCals) * 100);
        $('#calories-progress-bar .progress-fill').style.width = `${calPercent}%`;
        $('#calories-progress-text').textContent = `${todayCals} / ${goalCals} ккал`;

    } else { // water
        const todayWat = appState.tracker.water[today] ? appState.tracker.water[today].reduce((sum, e) => sum + e.amount, 0) : 0.0;
        const goalWat = appState.profile.goals.water;
        $('#water-today').textContent = todayWat.toFixed(2);
        $('#water-goal').textContent = goalWat.toFixed(2);
        const watPercent = Math.min(100, (todayWat / goalWat) * 100);
        $('#water-progress-bar .progress-fill').style.width = `${watPercent}%`;
        $('#water-progress-text').textContent = `${todayWat.toFixed(2)} / ${goalWat.toFixed(2)} л`;
    }
}

function renderProgramsScreen() {
    const list = $('#programs-list');
    list.innerHTML = '';
    appState.programs.forEach(p => {
        const item = document.createElement('div');
        item.className = 'program-item';
        item.innerHTML = `<strong>${p.name}</strong><br><small>${p.description}</small>`;
        item.addEventListener('click', () => {
            // Сделать программу активной (например, сохранить ID)
            // Это влияет на другие функции, например, на создание тренировки из программы
            alert(`Программа "${p.name}" выбрана. Теперь можно начать тренировку по ней.`);
        });
        list.appendChild(item);
    });
}

function renderExercisesScreen() {
    const filter = $('.exercise-filters .filter-btn.active')?.dataset.filter || 'all';
    const list = $('#exercises-list-full');
    list.innerHTML = '';
    const filteredExercises = filter === 'all' ? appState.exercises : appState.exercises.filter(e => e.muscleGroup === filter);
    filteredExercises.forEach(e => {
        const item = document.createElement('div');
        item.className = 'exercise-item-full';
        item.innerHTML = `<strong>${e.name}</strong><br><small>Группа: ${e.muscleGroup}, Подгруппа: ${e.subgroup}</small>`;
        list.appendChild(item);
    });
}

function renderKnowledgeScreen() {
    // Рендер статей
    const container = $('.knowledge-content');
    container.innerHTML = '';
    appState.knowledge.articles.forEach(a => {
        const articleDiv = document.createElement('div');
        articleDiv.className = 'article-preview';
        articleDiv.innerHTML = `<h3>${a.title}</h3><p>${a.content.substring(0, 100)}...</p><button class="btn btn-outline read-more-btn">Читать далее</button>`;
        container.appendChild(articleDiv);
    });
}

function renderCoachScreen() {
    // Рендер инструментов (в основном статичный HTML, но можно обновлять состояния)
}

function renderInfoScreen() {
    // Рендер настроек (в основном статичный HTML, но можно обновлять значения)
    // Например, обновить описание темы
    const themeDesc = $('.setting-item:has(#theme-settings-btn) .setting-desc');
    if (themeDesc) {
        themeDesc.textContent = `Текущая тема: ${appState.settings.theme.charAt(0).toUpperCase() + appState.settings.theme.slice(1)}. Нажмите для смены цветовой схемы`;
    }
}

// --- Логика модальных окон ---

function showModal(modalId) {
    $('#modal-overlay').classList.remove('hidden');
    $(`#${modalId}`).classList.remove('hidden');
    // Для модальных окон с формами, возможно, нужно очистить или заполнить начальными значениями
    if (modalId === 'add-exercise-modal') {
        renderExercisesLibraryModalList(); // Заполнить список при открытии
    }
    if (modalId === 'admin-panel-modal') {
        renderAdminExercisesList(); // Заполнить при открытии
        renderAdminProgramsList();
        renderAdminArticlesList();
    }
}

function closeModal() {
    $('#modal-overlay').classList.add('hidden');
    $$('.modal').forEach(m => m.classList.add('hidden'));
}

function renderExercisesLibraryModalList() {
    const list = $('#exercises-library-modal-list');
    list.innerHTML = '';
    appState.exercises.forEach(e => {
        const item = document.createElement('div');
        item.className = 'exercise-item-full';
        item.innerHTML = `<strong>${e.name}</strong><br><small>Группа: ${e.muscleGroup}</small>`;
        list.appendChild(item);
    });
}

// --- Основная логика приложения ---

function toggleTheme() {
    appState.settings.theme = appState.settings.theme === 'dark' ? 'light' : 'dark';
    updateInterfaceForState();
    saveAppState();
}

function addExerciseToCurrentWorkoutForm(name = '') {
    const container = $('#workout-exercises-container');
    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-item';
    exerciseDiv.innerHTML = `
        <div class="exercise-header">
            <input type="text" class="input-field exercise-name-input" value="${name}" placeholder="Название упражнения" required>
            <button class="btn btn-outline remove-exercise-btn">🗑️</button>
        </div>
        <div class="sets-container">
            <div class="set-row">
                <input type="number" class="set-input" placeholder="Вес">
                <input type="number" class="set-input" placeholder="Повт.">
                <input type="number" class="set-input" placeholder="Отдых (с)">
            </div>
        </div>
        <button class="btn btn-outline add-set-btn">+ Подход</button>
    `;
    container.appendChild(exerciseDiv);

    // Добавить обработчик для удаления
    exerciseDiv.querySelector('.remove-exercise-btn').addEventListener('click', () => {
        if (container.children.length > 1) { // Не удалять последнее
            exerciseDiv.remove();
        }
    });

    // Добавить обработчик для добавления подхода
    exerciseDiv.querySelector('.add-set-btn').addEventListener('click', () => {
        const setsContainer = exerciseDiv.querySelector('.sets-container');
        const setRow = document.createElement('div');
        setRow.className = 'set-row';
        setRow.innerHTML = `
            <input type="number" class="set-input" placeholder="Вес">
            <input type="number" class="set-input" placeholder="Повт.">
            <input type="number" class="set-input" placeholder="Отдых (с)">
        `;
        setsContainer.appendChild(setRow);
    });
}

function saveCurrentWorkout() {
    const name = $('#workout-name-input').value;
    const date = $('#workout-date').value || new Date().toISOString();
    const notes = $('#workout-notes').value;

    if (!name.trim()) {
        alert('Пожалуйста, введите название тренировки.');
        return;
    }

    const exercises = [];
    $$('#workout-exercises-container .exercise-item').forEach(item => {
        const exName = item.querySelector('.exercise-name-input').value;
        if (!exName.trim()) return; // Пропустить пустые

        const sets = [];
        item.querySelectorAll('.set-row').forEach(row => {
            const inputs = row.querySelectorAll('.set-input');
            sets.push({
                weight: parseFloat(inputs[0].value) || 0,
                reps: parseInt(inputs[1].value) || 0,
                rest: parseInt(inputs[2].value) || 0
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
        notes: notes
    };

    appState.workouts.unshift(newWorkout); // Добавить в начало
    saveAppState();
    alert('Тренировка сохранена!');
    showScreen('home'); // Вернуться на главную
}

function saveCurrentWorkoutAsTemplate() {
    // Логика сохранения текущей формы тренировки как шаблона
    const name = prompt('Введите название для шаблона:');
    if (!name || !name.trim()) return;

    const exercises = [];
    $$('#workout-exercises-container .exercise-item').forEach(item => {
        const exName = item.querySelector('.exercise-name-input').value;
        if (!exName.trim()) return;

        // Сохраняем только имя упражнения и количество подходов (структуру)
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

function addCalories(amount, description = '', time) {
    const today = new Date().toISOString().split('T')[0];
    if (!appState.tracker.calories[today]) appState.tracker.calories[today] = [];
    appState.tracker.calories[today].push({
        id: Date.now(),
        amount: amount,
        description: description,
        time: time || new Date().toTimeString().substr(0, 5)
    });
    saveAppState();
    // Обновить интерфейс трекера, если он активен
    if (currentScreen === 'tracker') {
        renderTrackerScreen();
    }
}

function addWater(amount, time) {
    const today = new Date().toISOString().split('T')[0];
    if (!appState.tracker.water[today]) appState.tracker.water[today] = [];
    appState.tracker.water[today].push({
        id: Date.now(),
        amount: amount,
        time: time || new Date().toTimeString().substr(0, 5)
    });
    saveAppState();
    // Обновить интерфейс трекера, если он активен
    if (currentScreen === 'tracker') {
        renderTrackerScreen();
    }
}

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

function saveProgramFromModal() {
    const name = $('#program-name-input').value;
    const description = $('#program-description').value;
    let exercisesJsonStr = $('#program-exercises-json').value;

    if (!name || !exercisesJsonStr) {
        alert('Заполните обязательные поля: Название и Упражнения (JSON).');
        return;
    }

    let exercisesParsed;
    try {
        exercisesParsed = JSON.parse(exercisesJsonStr);
    } catch (e) {
        alert('Ошибка в формате JSON упражнений.');
        return;
    }

    const newProgram = {
        id: Date.now(),
        name: name,
        description: description,
        // В реальном приложении тут будет больше полей (уровень, тип, дни и т.д.)
        days: [{ title: 'День 1', exercises: exercisesParsed }] // Пример
    };

    appState.programs.push(newProgram);
    saveAppState();
    alert('Программа добавлена!');
    closeModal();
    if (currentScreen === 'programs') {
        renderProgramsScreen();
    }
}

function addCustomExerciseToLibrary() {
    const name = $('#custom-exercise-name').value;
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
        description: desc
    };

    appState.exercises.push(newExercise);
    saveAppState();
    alert('Упражнение добавлено в библиотеку!');
    closeModal();
    if (currentScreen === 'exercises') {
        renderExercisesScreen();
    }
    // Также обновить список в модальном окне
    renderExercisesLibraryModalList();
}

function addCustomExerciseToLibraryAdmin() {
    // Та же логика, что и addCustomExerciseToLibrary, но для админ-панели
    // Использует поля из #admin-exercises-tab
    const name = $('#admin-exercise-name').value;
    const group = $('#admin-exercise-muscle-group').value;
    const subgroup = $('#admin-exercise-subgroup').value;
    const desc = $('#admin-exercise-description').value;
    // const imageUrl = $('#admin-exercise-image-url').value; // Не используется в основной библиотеке

    if (!name) {
        alert('Введите название упражнения.');
        return;
    }

    const newExercise = {
        id: Date.now(),
        name: name,
        muscleGroup: group,
        subgroup: subgroup,
        description: desc
    };

    appState.exercises.push(newExercise);
    saveAppState();
    alert('Упражнение добавлено в библиотеку (админка)!');
    // Закрытие модального окна не нужно, так как это внутри админ-панели
    renderAdminExercisesList(); // Обновить список в админке
    renderExercisesScreen(); // Обновить основной список
    renderExercisesLibraryModalList(); // Обновить список в модальном окне добавления
}

function renderAdminExercisesList() {
    // Используется для админ-панели
    const list = $('#admin-exercises-list');
    if (!list) return;
    list.innerHTML = '';

    const searchTerm = ($('#admin-exercise-search').value || '').toLowerCase();
    const filter = $('#admin-exercise-filter').value;

    const filteredExercises = appState.exercises.filter(e => {
        const matchesSearch = e.name.toLowerCase().includes(searchTerm);
        const matchesFilter = filter === 'all' || e.muscleGroup === filter;
        return matchesSearch && matchesFilter;
    });

    filteredExercises.forEach(e => {
        const item = document.createElement('div');
        item.className = 'admin-exercise-item';
        item.innerHTML = `
            <div>
                <strong>${e.name}</strong><br>
                <small>Группа: ${e.muscleGroup}, Подгруппа: ${e.subgroup}</small>
            </div>
            <div>
                <button class="btn btn-outline btn-sm edit-ex-btn">✏️</button>
                <button class="btn btn-outline btn-sm delete-ex-btn" data-id="${e.id}">🗑️</button>
            </div>
        `;
        // Обработчик удаления
        item.querySelector('.delete-ex-btn').addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            if (confirm('Удалить упражнение?')) {
                appState.exercises = appState.exercises.filter(ex => ex.id !== id);
                saveAppState();
                renderAdminExercisesList();
                renderExercisesScreen();
                renderExercisesLibraryModalList();
            }
        });
        list.appendChild(item);
    });
}

function renderAdminProgramsList() {
    const list = $('#admin-programs-list');
    if (!list) return;
    list.innerHTML = '';
    appState.programs.forEach(p => {
        const item = document.createElement('div');
        item.className = 'admin-program-item';
        item.innerHTML = `
            <div>
                <strong>${p.name}</strong><br>
                <small>${p.description}</small>
            </div>
            <div>
                <button class="btn btn-outline btn-sm delete-prog-btn" data-id="${p.id}">🗑️</button>
            </div>
        `;
        item.querySelector('.delete-prog-btn').addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            if (confirm('Удалить программу?')) {
                appState.programs = appState.programs.filter(pr => pr.id !== id);
                saveAppState();
                renderAdminProgramsList();
                renderProgramsScreen();
            }
        });
        list.appendChild(item);
    });
}

function renderAdminArticlesList() {
    const list = $('#admin-articles-list');
    if (!list) return;
    list.innerHTML = '';
    appState.knowledge.articles.forEach(a => {
        const item = document.createElement('div');
        item.className = 'admin-article-item';
        item.innerHTML = `
            <div>
                <strong>${a.title}</strong><br>
                <small>Категория: ${a.category}</small>
            </div>
            <div>
                <button class="btn btn-outline btn-sm delete-art-btn" data-id="${a.id}">🗑️</button>
            </div>
        `;
        item.querySelector('.delete-art-btn').addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            if (confirm('Удалить статью?')) {
                appState.knowledge.articles = appState.knowledge.articles.filter(ar => ar.id !== id);
                saveAppState();
                renderAdminArticlesList();
                renderKnowledgeScreen();
            }
        });
        list.appendChild(item);
    });
}

function addArticleToKnowledgeBase() {
    const title = $('#admin-article-title').value;
    const category = $('#admin-article-category').value;
    const content = $('#admin-article-content').value;
    const tagsString = $('#admin-article-tags').value;

    if (!title || !category || !content) {
        alert('Заполните обязательные поля: Заголовок, Категория, Содержимое.');
        return;
    }

    const newArticle = {
        id: Date.now(),
        title: title,
        category: category,
        content: content,
        tags: tagsString.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    appState.knowledge.articles.push(newArticle);
    saveAppState();
    alert('Статья добавлена!');
    // Очистить форму
    $('#admin-article-title').value = '';
    $('#admin-article-content').value = '';
    $('#admin-article-tags').value = '';
    renderAdminArticlesList(); // Обновить список в админке
    renderKnowledgeScreen(); // Обновить основной экран
}

function saveProfile() {
    appState.profile.name = $('#profile-name').value;
    appState.profile.level = $('#profile-level').value;
    appState.profile.avatar = $('#profile-avatar').value;
    try {
        // Попробуем обновить цели из JSON строки
        const newGoals = JSON.parse($('#profile-goals').value);
        if (typeof newGoals.calories === 'number' && typeof newGoals.water === 'number') {
            appState.profile.goals = newGoals;
        }
    } catch (e) {
        alert('Ошибка в формате JSON целей. Цели не изменены.');
        return;
    }
    saveAppState();
    alert('Профиль сохранён!');
    closeModal();
    // Обновить интерфейс, зависящий от профиля
    if (currentScreen === 'home') {
        renderHomeScreen();
    }
    if (currentScreen === 'tracker') {
        renderTrackerScreen();
    }
}

function calculateOneRepMax() {
    const weight = parseFloat($('#calc-weight').value);
    const reps = parseInt($('#calc-reps').value);

    if (isNaN(weight) || isNaN(reps) || weight <= 0 || reps <= 0) {
        $('#result-1rm').textContent = 'Ошибка ввода.';
        return;
    }

    // Формула Epley: 1RM = w * (1 + r / 30)
    const oneRepMax = weight * (1 + reps / 30);
    $('#result-1rm').textContent = `1ПМ ≈ ${oneRepMax.toFixed(2)} кг`;
}

// --- Завершение ---
console.log("FitApp v2.0 Script Loaded.");
