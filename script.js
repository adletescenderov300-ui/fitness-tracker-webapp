// --- Глобальные переменные ---
let currentScreen = 'home';
let currentWorkout = null; // Активная тренировка (временно, для UI)
let isWorkoutActive = false; // Флаг активной тренировки
let activeProgram = null; // Активная программа
let templates = loadData('templates') || [];
let workouts = loadData('workouts') || [];
let programs = loadData('programs') || [];
let schedule = loadData('schedule') || { days: [], reminderTime: '', enabled: false };
let trackerData = loadData('trackerData') || { calories: {}, water: {} }; // Данные по дням
let userGoals = loadData('userGoals') || { calories: 2000, water: 2.0 }; // Цели
let userSettings = loadData('userSettings') || { interfaceMode: 'standard' }; // Доп. настройки
let exercisesLibrary = loadData('exercisesLibrary') || [
    { id: 'bench_press', name: 'Жим лежа', muscleGroup: 'chest', subgroup: 'pectoralis_major', description: 'Базовое упражнение для развития грудных мышц.', image: '' },
    { id: 'squat', name: 'Приседания', muscleGroup: 'legs', subgroup: 'quadriceps', description: 'Классическое упражнение для ног и ягодиц.', image: '' },
    { id: 'deadlift', name: 'Становая тяга', muscleGroup: 'back', subgroup: 'erector_spinae', description: 'Многосуставное упражнение для спины, ног и ягодиц.', image: '' },
    { id: 'pull_up', name: 'Подтягивания', muscleGroup: 'back', subgroup: 'latissimus_dorsi', description: 'Упражнение для развития спины и бицепсов.', image: '' },
    { id: 'push_up', name: 'Отжимания', muscleGroup: 'chest', subgroup: 'pectorals', description: 'Упражнение для груди, плеч и трицепсов без снаряжения.', image: '' },
    { id: 'plank', name: 'Планка', muscleGroup: 'core', subgroup: 'rectus_abdominis', description: 'Изометрическое упражнение для пресса.', image: '' },
    { id: 'barbell_row', name: 'Тяга штанги в наклоне', muscleGroup: 'back', subgroup: 'rhomboids', description: 'Упражнение для средней части спины.', image: '' },
    { id: 'overhead_press', name: 'Жим стоя', muscleGroup: 'shoulders', subgroup: 'deltoids', description: 'Упражнение для развития плечевого пояса.', image: '' },
    { id: 'bicep_curl', name: 'Сгибание рук со штангой', muscleGroup: 'arms', subgroup: 'biceps', description: 'Изолирующее упражнение для бицепсов.', image: '' },
    { id: 'tricep_extension', name: 'Французский жим', muscleGroup: 'arms', subgroup: 'triceps', description: 'Упражнение для развития трицепсов.', image: '' },
];
let knowledgeArticles = loadData('knowledgeArticles') || [
    { id: 'article1', title: 'Как составить эффективную программу тренировок?', category: 'principles', tags: ['программа', 'мышцы'], content: 'Содержимое статьи...' },
    { id: 'article2', title: 'Правила питания для набора мышечной массы', category: 'nutrition', tags: ['питание', 'масса'], content: 'Содержимое статьи...' },
    { id: 'article3', title: 'Техника выполнения жима лежа', category: 'technique', tags: ['техника', 'грудь'], content: 'Содержимое статьи...' },
    { id: 'article4', title: 'Как избежать травм в зале', category: 'safety', tags: ['безопасность', 'травмы'], content: 'Содержимое статьи...' },
];

// --- Инициализация при загрузке ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('FitApp v2.0 загружено');
    initializeApp();
});

function initializeApp() {
    loadSettings();
    setupEventListeners();
    renderInitialScreens();
    updateStats();
}

function setupEventListeners() {
    // Навигация
    document.querySelectorAll('.nav-btn[data-screen]').forEach(btn => {
        btn.addEventListener('click', () => showScreen(btn.dataset.screen));
    });

    // Кнопки быстрого действия
    document.getElementById('start-workout-btn').addEventListener('click', () => showScreen('workout'));
    document.getElementById('quick-calories-btn').addEventListener('click', () => showModal('add-calories-modal'));
    document.getElementById('add-exercise-to-workout-btn').addEventListener('click', () => showModal('add-exercise-modal'));
    document.getElementById('save-workout-btn').addEventListener('click', saveWorkout);
    document.getElementById('save-template-btn').addEventListener('click', saveCurrentWorkoutAsTemplate);

    // Работа с упражнениями в тренировке (динамические обработчики)
    document.getElementById('workout-exercises-container').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-exercise-btn')) {
            e.target.closest('.exercise-item').remove();
        }
        if (e.target.classList.contains('add-set-btn')) {
            const setsContainer = e.target.previousElementSibling; // .sets-container
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

    // Работа с шаблонами
    // (Функция saveCurrentWorkoutAsTemplate уже привязана выше)

    // Трекер
    document.getElementById('add-calories-btn').addEventListener('click', addCaloriesManually);
    document.querySelectorAll('.quick-add-cal').forEach(btn => {
        btn.addEventListener('click', () => addCalories(parseInt(btn.dataset.amount)));
    });
    document.getElementById('add-water-btn').addEventListener('click', addWaterManually);
    document.querySelectorAll('.quick-add-water').forEach(btn => {
        btn.addEventListener('click', () => addWater(parseFloat(btn.dataset.amount)));
    });

    // Переключение вкладок трекера
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const tabId = btn.dataset.tab + '-tab';
            document.getElementById(tabId).classList.add('active');
            // После переключения вкладки, обновить отображение
            updateTrackerDisplay();
        });
    });

    // Переключение темы
    document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);

    // Модальные окна
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'modal-overlay') closeModal();
    });

    // Кнопки "Добавить упражнение" (в модальном окне)
    document.querySelectorAll('#add-exercise-modal .modal-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#add-exercise-modal .modal-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('#add-exercise-modal .modal-tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const tabId = btn.dataset.tab + '-tab';
            document.getElementById(tabId).classList.add('active');
        });
    });
    document.getElementById('add-custom-exercise-btn').addEventListener('click', addCustomExerciseToLibrary);
    // Добавление упражнения из библиотеки (динамический обработчик)
    document.getElementById('library-tab').addEventListener('click', function(e) {
        if (e.target.classList.contains('exercise-item-full')) {
             // Получаем имя упражнения из элемента
             const exerciseName = e.target.querySelector('strong').textContent;
             addExerciseToWorkoutForm(exerciseName);
             closeModal();
        }
    });

    // Расписание
    document.getElementById('save-schedule-btn').addEventListener('click', saveSchedule);

    // Программы
    document.getElementById('add-program-btn').addEventListener('click', () => showModal('add-program-modal'));
    document.getElementById('save-program-from-modal-btn').addEventListener('click', saveProgramFromModal);

    // Фильтры (динамические обработчики)
    setupFilterButtons('.program-filters .filter-btn', '#programs-list', 'program');
    setupFilterButtons('.exercise-filters .filter-btn', '#exercises-list-full', 'exercise');
    setupFilterButtons('.filter-buttons .filter-btn', '#history-list', 'history');

    // Прогресс
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateProgressStats(); // Перерисовать статистику за новый период
        });
    });

    // Цели трекера
    document.getElementById('save-calorie-goal-btn').addEventListener('click', saveCalorieGoal);
    document.getElementById('save-water-goal-btn').addEventListener('click', saveWaterGoal);

    // Настройки темы
    document.querySelectorAll('.theme-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.theme-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Сохранение выбранного режима в настройках
            userSettings.themeMode = btn.dataset.mode;
            saveData('userSettings', userSettings);
            applyTheme(userSettings.themeMode);
        });
    });
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            const colorName = option.dataset.color;
            // Сохранение выбранной схемы в настройках
            userSettings.accentColor = colorName;
            saveData('userSettings', userSettings);
            applyAccentColor(colorName);
        });
    });
    document.getElementById('save-theme-settings-btn').addEventListener('click', closeModal);

    // Калькулятор 1ПМ
    document.getElementById('calculate-1rm-btn').addEventListener('click', calculate1RM);
    document.querySelectorAll('.open-calculator-btn').forEach(btn => {
        btn.addEventListener('click', () => showModal('calculator-modal'));
    });

    // Уведомления
    document.getElementById('notifications-btn').addEventListener('click', () => showModal('notifications-modal'));

    // Другие кнопки настроек
    document.getElementById('profile-settings-btn').addEventListener('click', () => showModal('profile-modal'));
    document.getElementById('theme-settings-btn').addEventListener('click', () => showModal('theme-settings-modal'));
    // И т.д. для остальных кнопок в разделе "Инфо"

    // Быстрое добавление из модальных окон
    document.getElementById('add-calories-modal-btn').addEventListener('click', addCaloriesFromModal);
    document.getElementById('add-water-modal-btn').addEventListener('click', addWaterFromModal);

    // Админ-панель (временно)
    // document.getElementById('admin-panel-btn').addEventListener('click', () => showModal('admin-panel-modal')); // Предположим, есть такая кнопка
}

function loadSettings() {
    const savedTheme = localStorage.getItem('fitapp_theme');
    if (savedTheme) {
        document.body.className = savedTheme;
    }
    // Загрузка пользовательских настроек
    if (userSettings.themeMode) {
        applyTheme(userSettings.themeMode);
    }
    if (userSettings.accentColor) {
        applyAccentColor(userSettings.accentColor);
    }
    // Загрузка активной программы
    const savedActiveProgram = localStorage.getItem('fitapp_active_program');
    if (savedActiveProgram) {
        activeProgram = JSON.parse(savedActiveProgram);
    }
}

function applyTheme(mode) {
    document.body.classList.remove('theme-dark', 'theme-light');
    if (mode === 'dark' || mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('theme-dark');
    } else {
        document.body.classList.add('theme-light');
    }
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

function showScreen(screenName) {
    // Скрыть текущий экран
    document.getElementById(`screen-${currentScreen}`).classList.remove('active');
    // Показать новый экран
    document.getElementById(`screen-${screenName}`).classList.add('active');
    currentScreen = screenName;

    // Обновить активную кнопку навигации
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.screen === screenName);
    });

    // Обновить данные на экране, если нужно
    switch (screenName) {
        case 'home':
            updateStats();
            break;
        case 'history':
            renderHistory();
            break;
        case 'tracker':
            updateTrackerDisplay();
            break;
        case 'schedule':
            loadSchedule();
            break;
        case 'programs':
            renderPrograms();
            break;
        case 'exercises':
            renderExercisesLibrary();
            break;
        case 'knowledge':
            renderKnowledgeBase();
            break;
        case 'workout':
            // Сброс формы при входе на экран тренировки
            resetWorkoutForm();
            break;
    }
}

function renderInitialScreens() {
    updateTrackerDisplay();
    loadSchedule();
    renderPrograms();
    renderExercisesLibrary();
    renderKnowledgeBase();
}

// --- Тренировка ---
function resetWorkoutForm() {
    document.getElementById('workout-name-input').value = '';
    document.getElementById('workout-date').value = new Date().toISOString().slice(0, 16); // Текущая дата и время
    document.getElementById('workout-notes').value = '';
    document.getElementById('workout-exercises-container').innerHTML = '';
    // Добавить первое пустое упражнение по умолчанию
    addExerciseToWorkoutForm();
}

function addExerciseToWorkoutForm(name = '') {
    const container = document.getElementById('workout-exercises-container');
    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-item';
    exerciseDiv.innerHTML = `
        <div class="exercise-header">
            <input type="text" class="input-field exercise-name-input" placeholder="Название упражнения" value="${name}" required>
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
}

function saveWorkout() {
    const nameInput = document.getElementById('workout-name-input');
    if (!nameInput.value.trim()) {
        alert('Пожалуйста, введите название тренировки.');
        return;
    }

    const newWorkout = {
        id: 'w_' + Date.now(), // Генерация уникального ID
        name: nameInput.value,
        date: document.getElementById('workout-date').value || new Date().toISOString(),
        exercises: [],
        notes: document.getElementById('workout-notes').value,
        templateId: null
    };

    document.querySelectorAll('#workout-exercises-container .exercise-item').forEach(item => {
        const name = item.querySelector('.exercise-name-input').value;
        if (!name) return; // Пропустить пустые

        const exerciseObj = { name: name, sets: [] };
        item.querySelectorAll('.set-row').forEach(row => {
            const inputs = row.querySelectorAll('.set-input');
            exerciseObj.sets.push({
                weight: parseFloat(inputs[0].value) || 0,
                reps: parseInt(inputs[1].value) || 0,
                rest: parseInt(inputs[2].value) || 0,
                completed: false // По умолчанию не выполнено
            });
        });
        newWorkout.exercises.push(exerciseObj);
    });

    workouts.unshift(newWorkout); // Добавить в начало списка
    saveData('workouts', workouts);
    alert('Тренировка сохранена!');
    // После сохранения, сбросить форму и вернуться на главную
    resetWorkoutForm();
    showScreen('home');
    updateStats(); // Обновить статистику на главной
}

// --- Шаблоны ---
function saveCurrentWorkoutAsTemplate() {
    const name = prompt('Введите название для шаблона:');
    if (!name || !name.trim()) {
        alert('Название шаблона не может быть пустым.');
        return;
    }

    // Получаем данные из текущей формы тренировки
    const nameInput = document.getElementById('workout-name-input');
    if (!nameInput.value.trim()) {
        alert('Пожалуйста, сначала создайте тренировку.');
        return;
    }

    const newTemplate = {
        id: 't_' + Date.now(),
        name: name,
        exercises: []
    };

    document.querySelectorAll('#workout-exercises-container .exercise-item').forEach(item => {
        const name = item.querySelector('.exercise-name-input').value;
        if (!name) return;

        // Сохраняем только упражнение и количество подходов
        const setsCount = item.querySelectorAll('.set-row').length;
        newTemplate.exercises.push({
            name: name,
            setsCount: setsCount
        });
    });

    templates.push(newTemplate);
    saveData('templates', templates);
    alert('Шаблон сохранён!');
}

// --- Программы ---
function saveProgramFromModal() {
    const name = document.getElementById('program-name-input').value;
    const level = document.getElementById('program-level').value;
    const type = document.getElementById('program-type').value;
    const duration = parseInt(document.getElementById('program-duration').value);
    const description = document.getElementById('program-description').value;
    let exercisesJson = document.getElementById('program-exercises-json').value;

    if (!name) {
        alert('Введите название программы.');
        return;
    }

    try {
        // Попробуем распарсить JSON упражнений
        const parsedExercises = JSON.parse(exercisesJson);
        if (!Array.isArray(parsedExercises)) throw new Error('Упражнения должны быть массивом.');

        const newProgram = {
            id: 'p_' + Date.now(),
            name: name,
            level: level,
            type: type,
            durationWeeks: duration,
            description: description,
            exercises: parsedExercises // Сохраняем структуру как есть
        };

        programs.push(newProgram);
        saveData('programs', programs);
        alert('Программа добавлена!');
        closeModal();
        renderPrograms(); // Обновить список
    } catch (e) {
        alert('Ошибка в формате JSON упражнений. Проверьте синтаксис.');
        console.error(e);
    }
}

function renderPrograms() {
    const container = document.getElementById('programs-list');
    container.innerHTML = '';
    programs.forEach(prog => {
        const div = document.createElement('div');
        div.className = 'program-item';
        div.innerHTML = `<strong>${prog.name}</strong><br><small>${prog.description || 'Нет описания'}</small>`;
        div.addEventListener('click', () => {
            // Сделать программу активной
            activeProgram = prog;
            localStorage.setItem('fitapp_active_program', JSON.stringify(activeProgram));
            alert(`Программа "${prog.name}" активирована!`);
        });
        container.appendChild(div);
    });
}

// --- Упражнения ---
function renderExercisesLibrary() {
    const container = document.getElementById('exercises-list-full');
    container.innerHTML = '';
    exercisesLibrary.forEach(ex => {
        const div = document.createElement('div');
        div.className = 'exercise-item-full';
        div.innerHTML = `<strong>${ex.name}</strong><br><small>Группа: ${ex.muscleGroup}, Подгруппа: ${ex.subgroup}</small>`;
        container.appendChild(div);
    });
}

function addCustomExerciseToLibrary() {
    const name = document.getElementById('custom-exercise-name').value;
    const group = document.getElementById('custom-exercise-muscle-group').value;
    const subgroup = document.getElementById('custom-exercise-subgroup').value;
    const desc = document.getElementById('custom-exercise-description').value;

    if (!name) {
        alert('Введите название упражнения.');
        return;
    }

    const newExercise = {
        id: 'e_' + Date.now(),
        name: name,
        muscleGroup: group,
        subgroup: subgroup,
        description: desc,
        image: '' // Пока без изображения
    };

    exercisesLibrary.push(newExercise);
    saveData('exercisesLibrary', exercisesLibrary);
    alert('Упражнение добавлено в библиотеку!');
    closeModal();
    renderExercisesLibrary(); // Обновить список
}

// --- Трекер ---
function addCalories(amount, description = '', time = null) {
    const today = new Date().toISOString().split('T')[0];
    if (!trackerData.calories[today]) {
        trackerData.calories[today] = [];
    }
    trackerData.calories[today].push({
        id: 'c_' + Date.now(),
        amount: amount,
        description: description,
        time: time || new Date().toTimeString().substring(0, 5)
    });
    saveData('trackerData', trackerData);
    updateTrackerDisplay();
}

function addCaloriesManually() {
    const input = document.getElementById('calories-input');
    const descInput = document.getElementById('calories-desc');
    const amount = parseInt(input.value);
    if (isNaN(amount) || amount <= 0) {
        alert('Введите корректное количество калорий.');
        return;
    }
    addCalories(amount, descInput.value);
    input.value = '';
    descInput.value = '';
}

function addCaloriesFromModal() {
    const input = document.getElementById('calories-modal-input');
    const descInput = document.getElementById('calories-modal-desc');
    const timeInput = document.getElementById('calories-modal-time');
    const amount = parseInt(input.value);
    if (isNaN(amount) || amount <= 0) {
        alert('Введите корректное количество калорий.');
        return;
    }
    addCalories(amount, descInput.value, timeInput.value || null);
    input.value = '';
    descInput.value = '';
    timeInput.value = '';
    closeModal();
}

function addWater(amount, time = null) {
    const today = new Date().toISOString().split('T')[0];
    if (!trackerData.water[today]) {
        trackerData.water[today] = [];
    }
    trackerData.water[today].push({
        id: 'w_' + Date.now(),
        amount: amount,
        time: time || new Date().toTimeString().substring(0, 5)
    });
    saveData('trackerData', trackerData);
    updateTrackerDisplay();
}

function addWaterManually() {
    const input = document.getElementById('water-input');
    const amount = parseFloat(input.value);
    if (isNaN(amount) || amount <= 0) {
        alert('Введите корректное количество воды.');
        return;
    }
    addWater(amount);
    input.value = '';
}

function addWaterFromModal() {
    const input = document.getElementById('water-modal-input');
    const timeInput = document.getElementById('water-modal-time');
    const amount = parseFloat(input.value);
    if (isNaN(amount) || amount <= 0) {
        alert('Введите корректное количество воды.');
        return;
    }
    addWater(amount, timeInput.value || null);
    input.value = '';
    timeInput.value = '';
    closeModal();
}

function updateTrackerDisplay() {
    const today = new Date().toISOString().split('T')[0];

    // Калории
    const caloriesToday = trackerData.calories[today] ? trackerData.calories[today].reduce((sum, entry) => sum + entry.amount, 0) : 0;
    document.getElementById('calories-today').textContent = caloriesToday;
    const calorieGoal = userGoals.calories;
    document.getElementById('calories-goal').textContent = calorieGoal;
    const caloriePercentage = Math.min(100, (caloriesToday / calorieGoal) * 100);
    document.getElementById('calories-progress-bar').querySelector('.progress-fill').style.width = caloriePercentage + '%';
    document.getElementById('calories-progress-text').textContent = `${caloriesToday} / ${calorieGoal} ккал`;

    // Вода
    const waterToday = trackerData.water[today] ? trackerData.water[today].reduce((sum, entry) => sum + entry.amount, 0) : 0.0;
    document.getElementById('water-today').textContent = waterToday.toFixed(2);
    const waterGoal = userGoals.water;
    document.getElementById('water-goal').textContent = waterGoal.toFixed(2);
    const waterPercentage = Math.min(100, (waterToday / waterGoal) * 100);
    document.getElementById('water-progress-bar').querySelector('.progress-fill').style.width = waterPercentage + '%';
    document.getElementById('water-progress-text').textContent = `${waterToday.toFixed(2)} / ${waterGoal.toFixed(2)} л`;
}

function saveCalorieGoal() {
    const newGoal = parseInt(document.getElementById('daily-calorie-goal').value);
    if (!isNaN(newGoal) && newGoal > 0) {
        userGoals.calories = newGoal;
        saveData('userGoals', userGoals);
        updateTrackerDisplay();
        alert('Цель по калориям обновлена!');
    } else {
        alert('Введите корректное значение цели.');
    }
}

function saveWaterGoal() {
    const newGoal = parseFloat(document.getElementById('daily-water-goal').value);
    if (!isNaN(newGoal) && newGoal > 0) {
        userGoals.water = newGoal;
        saveData('userGoals', userGoals);
        updateTrackerDisplay();
        alert('Цель по воде обновлена!');
    } else {
        alert('Введите корректное значение цели.');
    }
}

// --- История ---
function renderHistory() {
    const container = document.getElementById('history-list');
    container.innerHTML = '';
    workouts.forEach(workout => { // Показать все
        const div = document.createElement('div');
        div.className = 'history-item';
        const date = new Date(workout.date).toLocaleDateString('ru-RU');
        div.innerHTML = `<strong>${workout.name}</strong><br><small>${date}</small>`;
        container.appendChild(div);
    });
}

// --- Расписание ---
function loadSchedule() {
    document.getElementById('day-mon').checked = schedule.days.includes('mon');
    document.getElementById('day-tue').checked = schedule.days.includes('tue');
    document.getElementById('day-wed').checked = schedule.days.includes('wed');
    document.getElementById('day-thu').checked = schedule.days.includes('thu');
    document.getElementById('day-fri').checked = schedule.days.includes('fri');
    document.getElementById('day-sat').checked = schedule.days.includes('sat');
    document.getElementById('day-sun').checked = schedule.days.includes('sun');
    document.getElementById('reminder-time').value = schedule.reminderTime;
    document.getElementById('enable-notifications').checked = schedule.enabled;
}

function saveSchedule() {
    const selectedDays = [];
    if (document.getElementById('day-mon').checked) selectedDays.push('mon');
    if (document.getElementById('day-tue').checked) selectedDays.push('tue');
    if (document.getElementById('day-wed').checked) selectedDays.push('wed');
    if (document.getElementById('day-thu').checked) selectedDays.push('thu');
    if (document.getElementById('day-fri').checked) selectedDays.push('fri');
    if (document.getElementById('day-sat').checked) selectedDays.push('sat');
    if (document.getElementById('day-sun').checked) selectedDays.push('sun');

    schedule = {
        days: selectedDays,
        reminderTime: document.getElementById('reminder-time').value,
        enabled: document.getElementById('enable-notifications').checked
    };

    saveData('schedule', schedule);
    alert('Расписание сохранено!');
}

// --- Прогресс ---
function updateProgressStats() {
    // Заглушка: просто обновляем на +/-0%
    document.getElementById('progress-tonnage-change').textContent = '+0%';
    document.getElementById('progress-avg-weight-change').textContent = '+0%';
    document.getElementById('progress-workouts-change').textContent = '+0%';
}

// --- Статистика на главной ---
function updateStats() {
    document.getElementById('stat-total-workouts').textContent = workouts.length;
    // Заглушка для других статистик
    document.getElementById('stat-streak').textContent = '0';
    document.getElementById('stat-total-tonnage').textContent = '0';
    document.getElementById('stat-avg-weight').textContent = '0';

    // Обновить последние тренировки
    const recentContainer = document.getElementById('recent-workouts-list');
    recentContainer.innerHTML = '';
    workouts.slice(0, 3).forEach(workout => {
        const div = document.createElement('div');
        div.className = 'history-item';
        const date = new Date(workout.date).toLocaleDateString('ru-RU');
        div.innerHTML = `<strong>${workout.name}</strong><br><small>${date}</small>`;
        recentContainer.appendChild(div);
    });
}

// --- База знаний ---
function renderKnowledgeBase() {
    const container = document.getElementById('knowledge-content');
    container.innerHTML = '';
    knowledgeArticles.forEach(article => {
        const articleDiv = document.createElement('div');
        articleDiv.className = 'article-preview';
        articleDiv.innerHTML = `<h3>${article.title}</h3><p>${article.content.substring(0, 100)}...</p><button class="btn btn-outline read-more-btn">Читать далее</button>`;
        container.appendChild(articleDiv);
    });
}

// --- Модальные окна ---
function showModal(modalId) {
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

// --- Калькулятор 1ПМ ---
function calculate1RM() {
    const weight = parseFloat(document.getElementById('calc-weight').value);
    const reps = parseInt(document.getElementById('calc-reps').value);

    if (isNaN(weight) || isNaN(reps) || weight <= 0 || reps <= 0) {
        document.getElementById('result-1rm').textContent = 'Ошибка ввода.';
        return;
    }

    // Формула Бжицкого: 1RM = w * (1 + r / 30)
    const oneRepMax = weight * (1 + reps / 30);
    document.getElementById('result-1rm').textContent = `Результат: ${oneRepMax.toFixed(2)} кг`;
}

// --- Тема ---
function toggleTheme() {
    document.body.classList.toggle('theme-dark');
    document.body.classList.toggle('theme-light');
    const newTheme = document.body.classList.contains('theme-dark') ? 'theme-dark' : 'theme-light';
    localStorage.setItem('fitapp_theme', newTheme);
}

// --- Утилиты для LocalStorage ---
function saveData(key, data) {
    try {
        localStorage.setItem('fitapp_' + key, JSON.stringify(data));
    } catch (e) {
        console.error('Ошибка сохранения в LocalStorage:', e);
        alert('Не удалось сохранить данные. Возможно, закончилось место.');
    }
}

function loadData(key) {
    try {
        const item = localStorage.getItem('fitapp_' + key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error('Ошибка загрузки из LocalStorage:', e);
        return null;
    }
}

// --- Утилиты для фильтров ---
function setupFilterButtons(selector, listSelector, itemType) {
    // Используем делегирование событий для динамических элементов
    document.querySelector(listSelector)?.parentElement?.addEventListener('click', function(e) {
        if (e.target.matches(`${selector}`)) {
            document.querySelectorAll(selector).forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            // Здесь должна быть логика фильтрации списка
            // Пока заглушка
            console.log(`Фильтр ${itemType} изменён на:`, e.target.dataset.filter);
            // Пример фильтрации (нужно адаптировать под каждый тип)
            // filterList(listSelector, itemType, e.target.dataset.filter);
        }
    });
}

// --- Вспомогательные функции для фильтрации (заглушка) ---
/*
function filterList(listSelector, itemType, filterValue) {
    const items = document.querySelectorAll(`${listSelector} .${itemType}-item`);
    items.forEach(item => {
        // Пример логики для упражнений
        if (itemType === 'exercise') {
            const muscleGroup = item.dataset.muscleGroup;
            if (filterValue === 'all' || muscleGroup === filterValue) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        }
        // Добавить логику для программ, истории и т.д.
    });
}
*/
