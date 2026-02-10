// --- Глобальные переменные ---
let currentScreen = 'home';
let currentWorkout = null; // Активная тренировка
let isWorkoutActive = false; // Флаг активной тренировки
let activeProgram = null; // Активная программа
let templates = loadData('templates') || [];
let workouts = loadData('workouts') || [];
let programs = loadData('programs') || [];
let schedule = loadData('schedule') || { days: [], reminderTime: '', enabled: false };
let trackerData = loadData('trackerData') || { calories: {}, water: {} }; // Данные по дням
let userGoals = loadData('userGoals') || { calories: 2000, water: 2.0 }; // Цели
let exercisesLibrary = loadData('exercisesLibrary') || [
    { id: 'bench_press', name: 'Жим лежа', muscleGroup: 'chest', description: '...', image: '' },
    { id: 'squat', name: 'Приседания', muscleGroup: 'legs', description: '...', image: '' },
    { id: 'deadlift', name: 'Становая тяга', muscleGroup: 'back', description: '...', image: '' },
    { id: 'pull_up', name: 'Подтягивания', muscleGroup: 'back', description: '...', image: '' },
    { id: 'push_up', name: 'Отжимания', muscleGroup: 'chest', description: '...', image: '' },
    { id: 'plank', name: 'Планка', muscleGroup: 'core', description: '...', image: '' },
];
// Пример структуры тренировки
// let exampleWorkout = {
//     id: 'w1',
//     name: 'Тренировка груди',
//     date: new Date().toISOString(),
//     exercises: [
//         { name: 'Жим лежа', sets: [{ weight: 0, reps: 0, completed: false }, { weight: 0, reps: 0, completed: false }] }
//     ],
//     notes: '...',
//     templateId: null // Если была создана из шаблона
// };

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
    document.getElementById('finish-workout-btn').addEventListener('click', finishWorkout);
    document.getElementById('create-custom-workout-btn').addEventListener('click', startCustomWorkout);
    document.getElementById('use-template-btn').addEventListener('click', showTemplatesForSelection);
    document.getElementById('use-program-day-btn').addEventListener('click', showProgramDaysForSelection);

    // Работа с упражнениями в тренировке
    document.getElementById('add-exercise-to-workout-btn').addEventListener('click', addExerciseToWorkoutForm);
    document.getElementById('save-workout-btn').addEventListener('click', saveWorkout);

    // Работа с шаблонами
    document.getElementById('save-as-template-btn').addEventListener('click', saveCurrentWorkoutAsTemplate);
    document.getElementById('confirm-finish-workout-btn').addEventListener('click', closeFinishWorkoutForm);

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

    // Кнопки "Добавить упражнение"
    document.getElementById('add-exercise-modal').querySelectorAll('.modal-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#add-exercise-modal .modal-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('#add-exercise-modal .modal-tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const tabId = btn.dataset.tab + '-tab';
            document.getElementById(tabId).classList.add('active');
        });
    });
    document.getElementById('add-custom-exercise-btn').addEventListener('click', addCustomExerciseToLibrary);

    // Расписание
    document.getElementById('save-schedule-btn').addEventListener('click', saveSchedule);

    // Программы
    document.getElementById('add-program-btn').addEventListener('click', () => showModal('add-program-modal'));

    // Фильтры
    setupFilterButtons('.filter-btn', '.exercises-list-full', 'exercise');
    setupFilterButtons('.program-filters .filter-btn', '#programs-list', 'program');
    setupFilterButtons('.filter-buttons .filter-btn', '#history-list', 'history');

    // Прогресс
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateProgressStats(); // Перерисовать статистику за новый период
        });
    });
}

function loadSettings() {
    const savedTheme = localStorage.getItem('fitapp_theme');
    if (savedTheme) {
        document.body.className = savedTheme;
    }
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
    }
}

function renderInitialScreens() {
    updateTrackerDisplay();
    loadSchedule();
    renderPrograms();
    renderExercisesLibrary();
}

// --- Тренировка ---
function startCustomWorkout() {
    resetWorkoutForm();
    document.getElementById('custom-workout-form').classList.remove('hidden');
    document.getElementById('new-workout-view').scrollIntoView({ behavior: 'smooth' });
}

function resetWorkoutForm() {
    document.getElementById('workout-name-input').value = '';
    document.getElementById('workout-notes').value = '';
    document.getElementById('workout-exercises-container').innerHTML = '';
    addExerciseToWorkoutForm(); // Добавить первое пустое упражнение
}

function addExerciseToWorkoutForm() {
    const container = document.getElementById('workout-exercises-container');
    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-item';
    exerciseDiv.innerHTML = `
        <div class="exercise-header">
            <input type="text" class="input-field exercise-name-input" placeholder="Название упражнения" required>
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

    exerciseDiv.querySelector('.remove-exercise-btn').addEventListener('click', () => {
        if (container.children.length > 1) { // Не удалять последнее
            exerciseDiv.remove();
        }
    });

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

function saveWorkout() {
    const nameInput = document.getElementById('workout-name-input');
    if (!nameInput.value.trim()) {
        alert('Пожалуйста, введите название тренировки.');
        return;
    }

    const newWorkout = {
        id: 'w_' + Date.now(), // Генерация уникального ID
        name: nameInput.value,
        date: new Date().toISOString(),
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
    resetWorkoutForm();
    document.getElementById('custom-workout-form').classList.add('hidden');
    updateStats(); // Обновить статистику на главной
}

// --- Шаблоны ---
function showTemplatesForSelection() {
    // Показать список шаблонов и позволить выбрать
    const modal = document.getElementById('add-exercise-modal'); // Переиспользуем модальное окно
    const body = modal.querySelector('.modal-body');
    body.innerHTML = '<h3>Выберите шаблон</h3>';
    
    if (templates.length === 0) {
        body.innerHTML += '<p>Шаблонов пока нет.</p>';
        return;
    }

    templates.forEach(template => {
        const div = document.createElement('div');
        div.className = 'exercise-item-full'; // Используем существующий стиль
        div.innerHTML = `<strong>${template.name}</strong>`;
        div.addEventListener('click', () => {
            loadTemplateIntoWorkout(template.id);
            closeModal();
        });
        body.appendChild(div);
    });
    showModal('add-exercise-modal');
}

function loadTemplateIntoWorkout(templateId) {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    document.getElementById('workout-name-input').value = template.name + ' (Шаблон)';
    document.getElementById('workout-notes').value = '';
    const container = document.getElementById('workout-exercises-container');
    container.innerHTML = '';

    template.exercises.forEach(exercise => {
        const exerciseDiv = document.createElement('div');
        exerciseDiv.className = 'exercise-item';
        let setsHtml = '';
        for (let i = 0; i < exercise.setsCount; i++) {
            setsHtml += `
                <div class="set-row">
                    <input type="number" class="set-input" placeholder="Вес">
                    <input type="number" class="set-input" placeholder="Повт.">
                    <input type="number" class="set-input" placeholder="Отдых (с)">
                </div>
            `;
        }
        exerciseDiv.innerHTML = `
            <div class="exercise-header">
                <input type="text" class="input-field exercise-name-input" value="${exercise.name}" readonly>
                <button class="btn btn-outline remove-exercise-btn">🗑️</button>
            </div>
            <div class="sets-container">
                ${setsHtml}
            </div>
            <button class="btn btn-outline add-set-btn">+ Подход</button>
        `;
        container.appendChild(exerciseDiv);

        // Добавить обработчики для новых кнопок
        exerciseDiv.querySelector('.remove-exercise-btn').addEventListener('click', () => {
            if (container.children.length > 1) {
                exerciseDiv.remove();
            }
        });
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
    });

    document.getElementById('custom-workout-form').classList.remove('hidden');
    document.getElementById('new-workout-view').scrollIntoView({ behavior: 'smooth' });
}

function saveCurrentWorkoutAsTemplate() {
    const nameInput = document.getElementById('template-name-input');
    if (!nameInput.value.trim()) {
        alert('Пожалуйста, введите название шаблона.');
        return;
    }

    if (!currentWorkout) {
        alert('Нет активной тренировки для сохранения как шаблона.');
        return;
    }

    const newTemplate = {
        id: 't_' + Date.now(),
        name: nameInput.value,
        exercises: []
    };

    // Сохраняем только упражнения и количество подходов
    currentWorkout.exercises.forEach(ex => {
        newTemplate.exercises.push({
            name: ex.name,
            setsCount: ex.sets.length // Только количество
        });
    });

    templates.push(newTemplate);
    saveData('templates', templates);
    alert('Шаблон сохранён!');
    nameInput.value = ''; // Очистить поле
    closeFinishWorkoutForm();
}

function closeFinishWorkoutForm() {
    document.getElementById('finish-workout-form').classList.add('hidden');
    document.getElementById('active-workout-view').classList.add('hidden');
    document.getElementById('new-workout-view').classList.remove('hidden');
    isWorkoutActive = false;
    currentWorkout = null;
}

function finishWorkout() {
    document.getElementById('active-workout-view').classList.add('hidden');
    document.getElementById('finish-workout-form').classList.remove('hidden');
}

// --- Программы ---
function showProgramDaysForSelection() {
    if (!activeProgram) {
        alert('Нет активной программы. Сначала выберите программу в разделе "Программы".');
        showScreen('programs');
        return;
    }
    document.getElementById('select-program-day-section').classList.remove('hidden');
    renderProgramDays(activeProgram);
}

function renderProgramDays(program) {
    const container = document.getElementById('program-days-list');
    container.innerHTML = '';
    program.days.forEach(day => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline';
        btn.textContent = `${day.title} (${day.exercises.length} упр.)`;
        btn.addEventListener('click', () => {
            loadProgramDayIntoWorkout(program, day);
        });
        container.appendChild(btn);
    });
}

function loadProgramDayIntoWorkout(program, day) {
    document.getElementById('workout-name-input').value = `[${program.name}] ${day.title}`;
    document.getElementById('workout-notes').value = day.notes || '';
    const container = document.getElementById('workout-exercises-container');
    container.innerHTML = '';

    day.exercises.forEach(exercise => {
        const exerciseDiv = document.createElement('div');
        exerciseDiv.className = 'exercise-item';
        let setsHtml = '';
        // Предполагаем, что в программе указано количество подходов
        for (let i = 0; i < exercise.setsCount || 3; i++) { // По умолчанию 3 подхода
            setsHtml += `
                <div class="set-row">
                    <input type="number" class="set-input" placeholder="Вес">
                    <input type="number" class="set-input" placeholder="Повт.">
                    <input type="number" class="set-input" placeholder="Отдых (с)">
                </div>
            `;
        }
        exerciseDiv.innerHTML = `
            <div class="exercise-header">
                <input type="text" class="input-field exercise-name-input" value="${exercise.name}" readonly>
                <button class="btn btn-outline remove-exercise-btn">🗑️</button>
            </div>
            <div class="sets-container">
                ${setsHtml}
            </div>
            <button class="btn btn-outline add-set-btn">+ Подход</button>
        `;
        container.appendChild(exerciseDiv);

        exerciseDiv.querySelector('.remove-exercise-btn').addEventListener('click', () => {
            if (container.children.length > 1) {
                exerciseDiv.remove();
            }
        });
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
    });

    document.getElementById('custom-workout-form').classList.remove('hidden');
    document.getElementById('select-program-day-section').classList.add('hidden');
    document.getElementById('new-workout-view').scrollIntoView({ behavior: 'smooth' });
}

function renderPrograms() {
    const container = document.getElementById('programs-list');
    container.innerHTML = '';
    programs.forEach(prog => {
        const div = document.createElement('div');
        div.className = 'program-item';
        div.innerHTML = `<strong>${prog.name}</strong><br><small>${prog.description}</small>`;
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
        div.innerHTML = `<strong>${ex.name}</strong><br><small>Группа: ${ex.muscleGroup}</small>`;
        container.appendChild(div);
    });
}

function addCustomExerciseToLibrary() {
    const name = document.getElementById('custom-exercise-name').value;
    const group = document.getElementById('custom-exercise-muscle-group').value;
    const desc = document.getElementById('custom-exercise-description').value;

    if (!name) {
        alert('Введите название упражнения.');
        return;
    }

    const newExercise = {
        id: 'e_' + Date.now(),
        name: name,
        muscleGroup: group,
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

function addWater(amount, time = null) {
    const today = new Date().toISOString().split('T')[0];
    if (!trackerData.water[today]) {
        trackerData.water[today] = [];
    }
    trackerData.water[today].push({
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

function updateTrackerDisplay() {
    const today = new Date().toISOString().split('T')[0];

    // Калории
    const caloriesToday = trackerData.calories[today] ? trackerData.calories[today].reduce((sum, entry) => sum + entry.amount, 0) : 0;
    document.getElementById('calories-today').textContent = caloriesToday;
    const calorieGoal = userGoals.calories;
    document.getElementById('calories-goal').textContent = calorieGoal;
    const caloriePercentage = Math.min(100, (caloriesToday / calorieGoal) * 100);
    document.getElementById('calories-progress-bar').querySelector('.progress-fill').style.width = caloriePercentage + '%';

    // Вода
    const waterToday = trackerData.water[today] ? trackerData.water[today].reduce((sum, entry) => sum + entry.amount, 0) : 0.0;
    document.getElementById('water-today').textContent = waterToday.toFixed(2);
    const waterGoal = userGoals.water;
    document.getElementById('water-goal').textContent = waterGoal.toFixed(2);
    const waterPercentage = Math.min(100, (waterToday / waterGoal) * 100);
    document.getElementById('water-progress-bar').querySelector('.progress-fill').style.width = waterPercentage + '%';
}

// --- История ---
function renderHistory() {
    const container = document.getElementById('history-list');
    container.innerHTML = '';
    workouts.slice(0, 20).forEach(workout => { // Показать последние 20
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

// --- Модальные окна ---
function showModal(modalId) {
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
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
    document.querySelectorAll(selector).forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll(selector).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Здесь должна быть логика фильтрации списка
            // Пока заглушка
            console.log(`Фильтр ${itemType} изменён на:`, btn.dataset.filter);
        });
    });
}
