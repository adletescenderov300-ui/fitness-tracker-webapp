// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И КОНСТАНТЫ ==========
const tg = window.Telegram?.WebApp;
let db;
let currentHistoryPage = 1;
let currentHistoryFilter = 'all';
const itemsPerPage = 5;
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();
let editingExerciseId = null;
let currentModalTab = 'library';
let currentStatsTab = 'overall';
let notifications = [];
let scheduleDays = [1, 3, 5];
let editingWorkoutId = null;
let tapCount = 0;
let lastTapTime = 0;

// Настройки темы
let themeSettings = {
    mode: 'dark', // 'dark', 'light', 'auto'
    colorScheme: 'indigo', // 'indigo', 'emerald', 'amethyst', 'coral', 'ocean'
    minimalTheme: false, // Минималистичная чёрно-белая тема
    highContrast: false, // Высокая контрастность
    savedAt: new Date().toISOString()
};

// Простой режим
let simpleMode = false;

// Графики
let charts = {
    workoutsChart: null,
    volumeChart: null,
    weightsChart: null
};

// Расширенная библиотека упражнений с фото
let exerciseLibrary = [
    // Грудь
    { 
        id: 1,
        name: "Жим штанги лежа", 
        muscle: "Грудь", 
        subMuscle: "Большая грудная", 
        description: "Базовое упражнение для развития грудных мышц. Лягте на скамью, возьмитесь за штангу шире плеч, опустите на грудь и выжмите вверх.", 
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
        isCustom: false 
    },
    { 
        id: 2,
        name: "Жим штанги на наклонной", 
        muscle: "Грудь", 
        subMuscle: "Верх грудных", 
        description: "Упражнение для верхней части грудных мышц. Угол наклона 30-45 градусов.", 
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
        isCustom: false 
    },
    // Спина
    { 
        id: 3,
        name: "Подтягивания", 
        muscle: "Спина", 
        subMuscle: "Широчайшие", 
        description: "Базовое упражнение для развития спины. Возьмитесь за перекладину шире плеч, подтянитесь до подбородка.", 
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
        isCustom: false 
    },
    // Ноги
    { 
        id: 4,
        name: "Приседания со штангой", 
        muscle: "Ноги", 
        subMuscle: "Квадрицепсы", 
        description: "Король упражнений для ног. Поставьте штангу на трапеции, опуститесь до параллели бедер с полом.", 
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
        isCustom: false 
    },
    // Плечи
    { 
        id: 5,
        name: "Жим штанги стоя", 
        muscle: "Плечи", 
        subMuscle: "Передняя дельта", 
        description: "Базовое упражнение для плеч. Поднимите штангу с груди над головой.", 
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
        isCustom: false 
    },
    // Руки
    { 
        id: 6,
        name: "Подъем штанги на бицепс", 
        muscle: "Руки", 
        subMuscle: "Бицепс", 
        description: "Базовое упражнение для бицепса. Согните руки в локтях, поднимите штангу к груди.", 
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
        isCustom: false 
    },
    // Пресс
    { 
        id: 7,
        name: "Скручивания", 
        muscle: "Пресс", 
        subMuscle: "Прямая мышца", 
        description: "Базовое упражнение для пресса. Лягте на пол, поднимите корпус к коленям.", 
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
        isCustom: false 
    },
    // Кардио
    { 
        id: 8,
        name: "Беговая дорожка", 
        muscle: "Кардио", 
        subMuscle: "Общее кардио", 
        description: "Кардиотренировка для улучшения выносливости и сжигания калорий.", 
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
        isCustom: false 
    },
    // Другое
    { 
        id: 9,
        name: "Планка", 
        muscle: "Другое", 
        subMuscle: "Стабилизация", 
        description: "Упражнение для укрепления мышц кора и улучшения осанки.", 
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
        isCustom: false 
    }
];

// Цели по умолчанию
let trackerGoals = {
    calories: 2000,
    water: 2.0
};

// Система профилей
let userProfile = {
    id: 'user_profile',
    name: 'Спортсмен',
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    avatar: '👤',
    goals: {
        weeklyWorkouts: 3,
        targetWeight: null,
        targetDate: null
    },
    stats: {
        totalWorkouts: 0,
        totalVolume: 0,
        longestStreak: 0
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

// Аватары на выбор
const availableAvatars = [
    '👤', '💪', '🏋️', '🔥', '⚡', '🌟', '🦸', '🦸‍♂️', '🦸‍♀️',
    '🔴', '🔵', '🟢', '🟡', '🟠', '🟣', '⚫', '⚪'
];

// База знаний
let knowledgeBase = [
    {
        id: 1,
        title: "Как правильно делать разминку",
        category: "Техника",
        content: `1. Общая разминка (5-7 минут):
   • Легкий бег или ходьба на месте
   • Вращения суставами (шея, плечи, локти, кисти, таз, колени, голеностоп)
   
2. Динамическая растяжка (5 минут):
   • Махи ногами вперед-назад и в стороны
   • Выпады с поворотом корпуса
   • Круговые движения руками
   
3. Специальная разминка (3-5 минут):
   • Легкие подходы с малыми весами перед основными упражнениями
   • Имитация движений без веса`,
        tags: ["разминка", "техника", "безопасность", "подготовка"]
    },
    {
        id: 2,
        title: "Питание перед тренировкой",
        category: "Питание",
        content: `За 2-3 часа до тренировки:
• Сложные углеводы (гречка, рис, овсянка, макароны из твердых сортов)
• Белки (курица, индейка, рыба, творог, яйца)
• Овощи (салат, овощи на пару)

За 30-60 минут до тренировки:
• Легкий перекус (банан, йогурт, протеиновый коктейль)
• Кофе или зеленый чай для энергии

Избегайте:
• Жирной и тяжелой пищи
• Сладостей и быстрых углеводов
• Переедания`,
        tags: ["питание", "энергия", "рекомендации", "диета"]
    },
    {
        id: 3,
        title: "Восстановление после тренировки",
        category: "Восстановление",
        content: `1. Питание после тренировки (в течение 30-60 минут):
   • Белки: 20-30 г (протеин, курица, рыба, творог)
   • Углеводы: 40-60 г (рис, гречка, картофель, фрукты)
   
2. Водный баланс:
   • Выпивайте 500-1000 мл воды после тренировки
   
3. Растяжка и заминка:
   • 5-10 минут легкой растяжки основных групп мышц
   
4. Сон:
   • 7-9 часов качественного сна
   • Сиеста 20-30 минут днем
   
5. Активное восстановление:
   • Легкая активность в дни отдыха (ходьба, плавание, йога)`,
        tags: ["восстановление", "сон", "питание", "отдых"]
    },
    {
        id: 4,
        title: "Техника безопасности в зале",
        category: "Безопасность",
        content: `1. Всегда используйте замки на штанге
2. Не тренируйтесь в одиночку с большими весами
3. Следите за правильной техникой выполнения
4. Используйте пояс при работе с большими весами
5. Не торопитесь - контролируйте каждое движение
6. Слушайте свое тело - боль это сигнал остановиться
7. Всегда делайте разминку и заминку
8. Пейте воду во время тренировки
9. Используйте соответствующую экипировку
10. Соблюдайте правила тренажерного зала`,
        tags: ["безопасность", "техника", "правила", "экипировка"]
    }
];

// Тренировочные программы
let trainingPrograms = [
    {
        id: 1,
        name: "Базовая для начинающих",
        difficulty: "beginner",
        type: "fullbody",
        weeks: 8,
        frequency: "3 раза в неделю",
        description: "Идеальная программа для тех, кто только начинает свой путь в силовом тренинге. Фокус на освоении базовых упражнений и правильной технике.",
        exercises: [
            { name: "Приседания со штангой", sets: 3, reps: "8-12", rest: "90 сек" },
            { name: "Жим штанги лежа", sets: 3, reps: "8-12", rest: "90 сек" },
            { name: "Тяга штанги в наклоне", sets: 3, reps: "8-12", rest: "90 сек" },
            { name: "Жим штанги стоя", sets: 3, reps: "8-12", rest: "90 сек" },
            { name: "Подъем штанги на бицепс", sets: 3, reps: "10-12", rest: "60 сек" },
            { name: "Французский жим", sets: 3, reps: "10-12", rest: "60 сек" },
            { name: "Скручивания", sets: 3, reps: "15-20", rest: "45 сек" }
        ],
        notes: "Отдых между тренировками не менее 48 часов. Увеличивайте вес постепенно."
    },
    {
        id: 2,
        name: "Программа на силу",
        difficulty: "intermediate",
        type: "strength",
        weeks: 12,
        frequency: "3-4 раза в неделю",
        description: "Фокусируется на развитии максимальной силы в базовых упражнениях. Используются низкие повторения и высокие веса.",
        exercises: [
            { name: "Приседания со штангой", sets: "5x5", reps: 5, rest: "3 мин" },
            { name: "Жим штанги лежа", sets: "5x5", reps: 5, rest: "3 мин" },
            { name: "Становая тяга", sets: "1x5", reps: 5, rest: "3 мин" },
            { name: "Жим штанги стоя", sets: "3x5", reps: 5, rest: "2 мин" },
            { name: "Подтягивания", sets: "3xAMRAP", reps: "до отказа", rest: "2 мин" },
            { name: "Тяга штанги к подбородку", sets: "3x8", reps: 8, rest: "90 сек" }
        ],
        notes: "Работайте с 80-90% от 1ПМ. Отдых между тренировками 72 часа."
    },
    {
        id: 3,
        name: "Набор мышечной массы",
        difficulty: "intermediate",
        type: "mass",
        weeks: 10,
        frequency: "4 раза в неделю (сплит)",
        description: "Программа для максимального мышечного роста. Высокий объем тренировок, умеренные веса, акцент на пампинг.",
        exercises: [
            { name: "Жим штанги лежа", sets: 4, reps: "8-12", rest: "90 сек" },
            { name: "Разводка гантелей лежа", sets: 3, reps: "12-15", rest: "60 сек" },
            { name: "Отжимания на брусьях", sets: 3, reps: "10-15", rest: "60 сек" },
            { name: "Подтягивания широким хватом", sets: 4, reps: "8-12", rest: "90 сек" },
            { name: "Тяга гантели в наклоне", sets: 3, reps: "10-12", rest: "60 сек" },
            { name: "Гиперэкстензия", sets: 3, reps: "15-20", rest: "60 сек" },
            { name: "Приседания со штангой", sets: 4, reps: "8-12", rest: "90 сек" },
            { name: "Жим ногами", sets: 3, reps: "10-15", rest: "60 сек" },
            { name: "Сгибания ног лежа", sets: 3, reps: "12-15", rest: "60 сек" }
        ],
        notes: "Сплит: грудь/трицепс, спина/бицепс, ноги, плечи. Калорийный профицит +500 ккал."
    },
    {
        id: 4,
        name: "Сушка и рельеф",
        difficulty: "advanced",
        type: "cutting",
        weeks: 8,
        frequency: "5-6 раз в неделю",
        description: "Программа для сжигания жира и прорисовки мышц. Высокая интенсивность, суперсеты, кардио.",
        exercises: [
            { name: "Жим штанги лежа", sets: 4, reps: "10-15", rest: "60 сек" },
            { name: "Разводка гантелей (суперсет)", sets: 3, reps: "15-20", rest: "30 сек" },
            { name: "Подтягивания", sets: 4, reps: "до отказа", rest: "60 сек" },
            { name: "Тяга верхнего блока (суперсет)", sets: 3, reps: "12-15", rest: "30 сек" },
            { name: "Приседания со штангой", sets: 4, reps: "12-20", rest: "60 сек" },
            { name: "Выпады (суперсет)", sets: 3, reps: "15-20", rest: "30 сек" },
            { name: "Кардио (после тренировки)", sets: 1, reps: "30-45 мин", rest: "-" }
        ],
        notes: "Дефицит калорий 300-500 ккал. Высокобелковая диета. Кардио 4-5 раз в неделю."
    }
];

// ========== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ==========
window.addEventListener('load', async () => {
    console.log("FitApp v2.0 - Инициализация приложения");
    
    // Инициализация Telegram Web App
    if (tg) {
        try {
            tg.ready();
            tg.expand();
            tg.enableClosingConfirmation();
            tg.setHeaderColor('#6366f1');
            tg.setBackgroundColor('#0f172a');
            
            // Проверяем, есть ли поддержка уведомлений
            if (tg.showAlert) {
                console.log("Telegram Web App уведомления доступны");
            }
            
            // Получаем данные пользователя
            if (tg.initDataUnsafe?.user) {
                const user = tg.initDataUnsafe.user;
                userProfile.name = user.first_name || 'Спортсмен';
                if (user.last_name) userProfile.name += ' ' + user.last_name;
                
                // Используем первую букву имени как аватар
                if (user.first_name) {
                    userProfile.avatar = user.first_name[0].toUpperCase();
                }
            }
        } catch (error) {
            console.warn("Telegram Web App не инициализирован:", error);
        }
    }
    
    // Установка текущей даты
    updateCurrentDate();
    
    // Установка приветствия по времени
    updateGreeting();
    
    // Инициализация базы данных
    await initDB();
    
    // Загрузка сохраненных данных
    await loadUserProfile();
    await loadSavedExercises();
    await loadSchedule();
    await loadNotifications();
    await loadTrackerGoals();
    await loadTrackerEntries();
    await loadThemeSettings();
    await loadSimpleMode();
    await loadKnowledgeBaseFromDB();
    await loadProgramsFromDB();
    
    // Инициализация интерфейса
    loadExerciseLibrary();
    updateAllStats();
    loadRecentWorkouts();
    updateTrackerStats();
    generateCalendar();
    
    // Обновление профиля в шапке
    updateHeaderProfile();
    
    // Добавляем первое поле упражнения
    addEmptyExerciseField();
    
    // Показываем утреннее приветствие
    showMorningGreeting();
    
    // Проверяем уведомления
    checkScheduleNotifications();
    
    // Инициализация простого режима
    initSimpleMode();
    
    // Загрузка программ
    loadTrainingPrograms();
    
    // Загрузка базы знаний
    loadKnowledgeBase();
    
    // Инициализация админ-доступа
    initAdminAccess();
    
    // Устанавливаем обработчик для тапов на логотип
    document.querySelector('.app-title').addEventListener('click', checkAdminAccess);
    
    // Обновляем переключатель уведомлений
    updateNotificationToggle();
    
    // Устанавливаем цветовую схему
    applyColorScheme(themeSettings.colorScheme);
    
    // Применяем тему
    applyThemeMode(themeSettings.mode);
    
    // Применяем минималистичную тему если включена
    if (themeSettings.minimalTheme) {
        document.body.classList.add('minimal-theme');
    }
    
    // Применяем высокую контрастность если включена
    if (themeSettings.highContrast) {
        document.body.classList.add('high-contrast');
    }
    
    console.log("FitApp v2.0 успешно загружен!");
    
    // Показываем приветственное сообщение
    setTimeout(() => {
        showMessage(`Добро пожаловать в FitApp v2.0, ${userProfile.name}! 🎉`, 'success');
    }, 1000);
});

// ========== БАЗА ДАННЫХ ==========
async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('FitAppDB_v2', 11);
        
        request.onerror = () => {
            console.error("Ошибка открытия базы данных:", request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            db = request.result;
            console.log("База данных успешно открыта, версия:", db.version);
            
            // Обработчик ошибок базы данных
            db.onerror = (event) => {
                console.error("Ошибка базы данных:", event.target.error);
            };
            
            resolve();
        };
        
        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            console.log("Обновление базы данных до версии:", event.newVersion);
            
            // Workouts store
            if (!database.objectStoreNames.contains('workouts')) {
                const workoutsStore = database.createObjectStore('workouts', { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                workoutsStore.createIndex('date', 'date');
                workoutsStore.createIndex('month', 'month');
                workoutsStore.createIndex('name', 'name');
            }
            
            // Exercises store
            if (!database.objectStoreNames.contains('exercises')) {
                const exercisesStore = database.createObjectStore('exercises', { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                exercisesStore.createIndex('muscle', 'muscle');
                exercisesStore.createIndex('isCustom', 'isCustom');
                exercisesStore.createIndex('name', 'name');
            }
            
            // Programs store
            if (!database.objectStoreNames.contains('programs')) {
                const programsStore = database.createObjectStore('programs', { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                programsStore.createIndex('difficulty', 'difficulty');
                programsStore.createIndex('type', 'type');
            }
            
            // Schedule store
            if (!database.objectStoreNames.contains('schedule')) {
                database.createObjectStore('schedule', { 
                    keyPath: 'id' 
                });
            }
            
            // Notifications store
            if (!database.objectStoreNames.contains('notifications')) {
                const notificationsStore = database.createObjectStore('notifications', { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                notificationsStore.createIndex('date', 'date');
                notificationsStore.createIndex('read', 'read');
                notificationsStore.createIndex('type', 'type');
            }
            
            // Tracker store
            if (!database.objectStoreNames.contains('tracker')) {
                const trackerStore = database.createObjectStore('tracker', { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                trackerStore.createIndex('date', 'date');
                trackerStore.createIndex('type', 'type');
                trackerStore.createIndex('day', 'day');
            }
            
            // Goals store
            if (!database.objectStoreNames.contains('goals')) {
                database.createObjectStore('goals', { 
                    keyPath: 'id' 
                });
            }
            
            // Feedback store
            if (!database.objectStoreNames.contains('feedback')) {
                database.createObjectStore('feedback', { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
            }
            
            // Профиль пользователя
            if (!database.objectStoreNames.contains('user_profile')) {
                database.createObjectStore('user_profile', { 
                    keyPath: 'id' 
                });
            }
            
            // Настройки темы
            if (!database.objectStoreNames.contains('theme_settings')) {
                database.createObjectStore('theme_settings', { 
                    keyPath: 'id' 
                });
            }
            
            // Настройки простого режима
            if (!database.objectStoreNames.contains('simple_mode')) {
                database.createObjectStore('simple_mode', { 
                    keyPath: 'id' 
                });
            }
            
            // База знаний
            if (!database.objectStoreNames.contains('knowledge')) {
                database.createObjectStore('knowledge', { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
            }
            
            // Шаблоны тренировок
            if (!database.objectStoreNames.contains('templates')) {
                database.createObjectStore('templates', { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
            }
            
            // Статистика
            if (!database.objectStoreNames.contains('statistics')) {
                database.createObjectStore('statistics', { 
                    keyPath: 'id' 
                });
            }
            
            console.log("Все хранилища созданы успешно");
        };
    });
}

// Универсальная функция для транзакций с базой данных
async function dbTransaction(storeName, mode = 'readonly', callback) {
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction([storeName], mode);
            const store = transaction.objectStore(storeName);
            
            transaction.onerror = () => {
                reject(transaction.error);
            };
            
            transaction.oncomplete = () => {
                resolve();
            };
            
            callback(store, transaction);
        } catch (error) {
            reject(error);
        }
    });
}

async function loadSavedExercises() {
    try {
        await dbTransaction('exercises', 'readonly', (store) => {
            const request = store.getAll();
            
            request.onsuccess = () => {
                const customExercises = request.result || [];
                customExercises.forEach(ex => {
                    // Проверяем, есть ли уже такое упражнение в библиотеке
                    const exists = exerciseLibrary.some(e => 
                        e.name.toLowerCase() === ex.name.toLowerCase() || 
                        e.id === ex.id
                    );
                    
                    if (!exists) {
                        exerciseLibrary.push({
                            id: ex.id || Date.now(),
                            name: ex.name,
                            muscle: ex.muscle || 'Другое',
                            subMuscle: ex.subMuscle || ex.muscle || 'Общее',
                            description: ex.description || '',
                            image: ex.image || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
                            isCustom: true,
                            createdAt: ex.createdAt || new Date().toISOString()
                        });
                    }
                });
                console.log("Загружено пользовательских упражнений:", customExercises.length);
            };
            
            request.onerror = () => {
                console.error('Ошибка загрузки упражнений:', request.error);
            };
        });
    } catch (error) {
        console.error('Ошибка загрузки упражнений:', error);
    }
}

async function saveExerciseToDB(exercise) {
    try {
        await dbTransaction('exercises', 'readwrite', (store) => {
            const exerciseData = {
                ...exercise,
                createdAt: exercise.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            if (exercise.id) {
                store.put(exerciseData);
            } else {
                store.add(exerciseData);
            }
        });
        
        console.log("Упражнение сохранено в БД:", exercise.name);
        return true;
    } catch (error) {
        console.error('Ошибка сохранения упражнения:', error);
        return false;
    }
}

async function deleteExerciseFromDB(exerciseId) {
    try {
        await dbTransaction('exercises', 'readwrite', (store) => {
            store.delete(exerciseId);
        });
        
        console.log("Упражнение удалено из БД:", exerciseId);
        return true;
    } catch (error) {
        console.error('Ошибка удаления упражнения:', error);
        return false;
    }
}

async function loadSchedule() {
    try {
        await dbTransaction('schedule', 'readonly', (store) => {
            const request = store.get('schedule');
            
            request.onsuccess = () => {
                const schedule = request.result;
                if (schedule) {
                    scheduleDays = schedule.days || [1, 3, 5];
                    document.getElementById('reminderTime').value = schedule.time || '19:00';
                    document.getElementById('notificationsToggle').checked = schedule.enabled !== false;
                    
                    // Обновляем UI
                    updateScheduleUI();
                }
            };
            
            request.onerror = () => {
                console.error('Ошибка загрузки расписания:', request.error);
            };
        });
    } catch (error) {
        console.error('Ошибка загрузки расписания:', error);
    }
}

async function saveScheduleToDB() {
    try {
        const time = document.getElementById('reminderTime').value;
        const enabled = document.getElementById('notificationsToggle').checked;
        
        const scheduleData = {
            id: 'schedule',
            days: scheduleDays,
            time: time,
            enabled: enabled,
            updatedAt: new Date().toISOString()
        };
        
        await dbTransaction('schedule', 'readwrite', (store) => {
            store.put(scheduleData);
        });
        
        console.log("Расписание сохранено в БД");
        return true;
    } catch (error) {
        console.error('Ошибка сохранения расписания:', error);
        return false;
    }
}

async function loadNotifications() {
    try {
        await dbTransaction('notifications', 'readonly', (store) => {
            const request = store.getAll();
            
            request.onsuccess = () => {
                notifications = request.result || [];
                updateNotificationBadge();
            };
            
            request.onerror = () => {
                console.error('Ошибка загрузки уведомлений:', request.error);
            };
        });
    } catch (error) {
        console.error('Ошибка загрузки уведомлений:', error);
    }
}

async function saveNotificationToDB(notification) {
    try {
        await dbTransaction('notifications', 'readwrite', (store) => {
            const notificationData = {
                ...notification,
                createdAt: notification.createdAt || new Date().toISOString()
            };
            
            store.add(notificationData);
        });
        
        console.log("Уведомление сохранено в БД:", notification.text);
        return true;
    } catch (error) {
        console.error('Ошибка сохранения уведомления:', error);
        return false;
    }
}

async function updateNotificationInDB(notificationId, updates) {
    try {
        await dbTransaction('notifications', 'readwrite', (store) => {
            const request = store.get(notificationId);
            
            request.onsuccess = () => {
                const notification = request.result;
                if (notification) {
                    const updatedNotification = {
                        ...notification,
                        ...updates,
                        updatedAt: new Date().toISOString()
                    };
                    store.put(updatedNotification);
                }
            };
            
            request.onerror = () => {
                console.error('Ошибка обновления уведомления:', request.error);
            };
        });
        
        console.log("Уведомление обновлено в БД:", notificationId);
        return true;
    } catch (error) {
        console.error('Ошибка обновления уведомления:', error);
        return false;
    }
}

async function loadTrackerGoals() {
    try {
        await dbTransaction('goals', 'readonly', (store) => {
            const request = store.get('tracker');
            
            request.onsuccess = () => {
                const goals = request.result;
                if (goals) {
                    trackerGoals = goals;
                    document.getElementById('caloriesGoalInput').value = trackerGoals.calories;
                    document.getElementById('waterGoalInput').value = trackerGoals.water;
                    updateTrackerGoalsDisplay();
                }
            };
            
            request.onerror = () => {
                console.error('Ошибка загрузки целей:', request.error);
            };
        });
    } catch (error) {
        console.error('Ошибка загрузки целей:', error);
    }
}

async function saveTrackerGoalsToDB() {
    try {
        const goalsData = {
            id: 'tracker',
            ...trackerGoals,
            updatedAt: new Date().toISOString()
        };
        
        await dbTransaction('goals', 'readwrite', (store) => {
            store.put(goalsData);
        });
        
        console.log("Цели сохранены в БД");
        return true;
    } catch (error) {
        console.error('Ошибка сохранения целей:', error);
        return false;
    }
}

async function loadTrackerEntries() {
    try {
        await dbTransaction('tracker', 'readonly', (store) => {
            const request = store.getAll();
            
            request.onsuccess = () => {
                const entries = request.result || [];
                updateTrackerDisplay(entries);
            };
            
            request.onerror = () => {
                console.error('Ошибка загрузки записей трекера:', request.error);
            };
        });
    } catch (error) {
        console.error('Ошибка загрузки записей трекера:', error);
    }
}

async function saveTrackerEntryToDB(entry) {
    try {
        await dbTransaction('tracker', 'readwrite', (store) => {
            const entryData = {
                ...entry,
                day: new Date(entry.date).toDateString(),
                createdAt: entry.createdAt || new Date().toISOString()
            };
            
            store.add(entryData);
        });
        
        console.log("Запись трекера сохранена в БД");
        return true;
    } catch (error) {
        console.error('Ошибка сохранения записи трекера:', error);
        return false;
    }
}

async function deleteTrackerEntryFromDB(entryId) {
    try {
        await dbTransaction('tracker', 'readwrite', (store) => {
            store.delete(entryId);
        });
        
        console.log("Запись трекера удалена из БД:", entryId);
        return true;
    } catch (error) {
        console.error('Ошибка удаления записи трекера:', error);
        return false;
    }
}

async function loadUserProfile() {
    try {
        await dbTransaction('user_profile', 'readonly', (store) => {
            const request = store.get('user_profile');
            
            request.onsuccess = () => {
                const profile = request.result;
                if (profile) {
                    userProfile = profile;
                    updateHeaderProfile();
                }
            };
            
            request.onerror = () => {
                console.error('Ошибка загрузки профиля:', request.error);
            };
        });
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
    }
}

async function saveUserProfileToDB() {
    try {
        userProfile.updatedAt = new Date().toISOString();
        
        await dbTransaction('user_profile', 'readwrite', (store) => {
            store.put(userProfile);
        });
        
        console.log("Профиль сохранен в БД");
        return true;
    } catch (error) {
        console.error('Ошибка сохранения профиля:', error);
        return false;
    }
}

async function loadThemeSettings() {
    try {
        await dbTransaction('theme_settings', 'readonly', (store) => {
            const request = store.get('theme_settings');
            
            request.onsuccess = () => {
                const settings = request.result;
                if (settings) {
                    themeSettings = settings;
                    applyThemeMode(themeSettings.mode);
                    applyColorScheme(themeSettings.colorScheme);
                    updateThemeUI();
                    
                    // Применяем дополнительные настройки темы
                    if (themeSettings.minimalTheme) {
                        document.body.classList.add('minimal-theme');
                    }
                    
                    if (themeSettings.highContrast) {
                        document.body.classList.add('high-contrast');
                    }
                }
            };
            
            request.onerror = () => {
                console.error('Ошибка загрузки настроек темы:', request.error);
            };
        });
    } catch (error) {
        console.error('Ошибка загрузки настроек темы:', error);
    }
}

async function saveThemeSettingsToDB() {
    try {
        themeSettings.updatedAt = new Date().toISOString();
        
        await dbTransaction('theme_settings', 'readwrite', (store) => {
            store.put(themeSettings);
        });
        
        console.log("Настройки темы сохранены в БД");
        return true;
    } catch (error) {
        console.error('Ошибка сохранения настроек темы:', error);
        return false;
    }
}

async function loadSimpleMode() {
    try {
        await dbTransaction('simple_mode', 'readonly', (store) => {
            const request = store.get('simple_mode');
            
            request.onsuccess = () => {
                const settings = request.result;
                if (settings) {
                    simpleMode = settings.enabled || false;
                    updateSimpleModeToggle();
                    applySimpleMode();
                }
            };
            
            request.onerror = () => {
                console.error('Ошибка загрузки простого режима:', request.error);
            };
        });
    } catch (error) {
        console.error('Ошибка загрузки простого режима:', error);
    }
}

async function saveSimpleModeToDB() {
    try {
        const settings = {
            id: 'simple_mode',
            enabled: simpleMode,
            updatedAt: new Date().toISOString()
        };
        
        await dbTransaction('simple_mode', 'readwrite', (store) => {
            store.put(settings);
        });
        
        console.log("Настройки простого режима сохранены в БД");
        return true;
    } catch (error) {
        console.error('Ошибка сохранения простого режима:', error);
        return false;
    }
}

async function loadKnowledgeBaseFromDB() {
    try {
        await dbTransaction('knowledge', 'readonly', (store) => {
            const request = store.getAll();
            
            request.onsuccess = () => {
                const articles = request.result || [];
                if (articles.length > 0) {
                    // Объединяем с базовыми статьями, избегая дубликатов
                    articles.forEach(article => {
                        const exists = knowledgeBase.some(a => a.id === article.id);
                        if (!exists) {
                            knowledgeBase.push(article);
                        }
                    });
                }
                console.log("Загружено статей из БД:", articles.length);
            };
            
            request.onerror = () => {
                console.error('Ошибка загрузки базы знаний:', request.error);
            };
        });
    } catch (error) {
        console.error('Ошибка загрузки базы знаний:', error);
    }
}

async function saveArticleToDB(article) {
    try {
        await dbTransaction('knowledge', 'readwrite', (store) => {
            const articleData = {
                ...article,
                createdAt: article.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            if (article.id) {
                store.put(articleData);
            } else {
                store.add(articleData);
            }
        });
        
        console.log("Статья сохранена в БД:", article.title);
        return true;
    } catch (error) {
        console.error('Ошибка сохранения статьи:', error);
        return false;
    }
}

async function loadProgramsFromDB() {
    try {
        await dbTransaction('programs', 'readonly', (store) => {
            const request = store.getAll();
            
            request.onsuccess = () => {
                const programs = request.result || [];
                if (programs.length > 0) {
                    // Объединяем с базовыми программами, избегая дубликатов
                    programs.forEach(program => {
                        const exists = trainingPrograms.some(p => p.id === program.id);
                        if (!exists) {
                            trainingPrograms.push(program);
                        }
                    });
                }
                console.log("Загружено программ из БД:", programs.length);
            };
            
            request.onerror = () => {
                console.error('Ошибка загрузки программ:', request.error);
            };
        });
    } catch (error) {
        console.error('Ошибка загрузки программ:', error);
    }
}

async function saveProgramToDB(program) {
    try {
        await dbTransaction('programs', 'readwrite', (store) => {
            const programData = {
                ...program,
                createdAt: program.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            if (program.id) {
                store.put(programData);
            } else {
                store.add(programData);
            }
        });
        
        console.log("Программа сохранена в БД:", program.name);
        return true;
    } catch (error) {
        console.error('Ошибка сохранения программы:', error);
        return false;
    }
}

async function getAllWorkouts() {
    return new Promise((resolve) => {
        try {
            dbTransaction('workouts', 'readonly', (store) => {
                const request = store.getAll();
                
                request.onsuccess = () => {
                    resolve(request.result || []);
                };
                
                request.onerror = () => {
                    console.error('Ошибка загрузки тренировок:', request.error);
                    resolve([]);
                };
            }).catch(() => {
                resolve([]);
            });
        } catch (error) {
            console.error('Ошибка в getAllWorkouts:', error);
            resolve([]);
        }
    });
}

async function saveWorkoutToDB(workoutData) {
    return new Promise((resolve, reject) => {
        try {
            dbTransaction('workouts', 'readwrite', (store) => {
                const request = store.add(workoutData);
                
                request.onsuccess = () => {
                    console.log("Тренировка сохранена в БД, ID:", request.result);
                    resolve(request.result);
                };
                
                request.onerror = () => {
                    console.error('Ошибка сохранения тренировки:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Ошибка в saveWorkoutToDB:', error);
            reject(error);
        }
    });
}

async function updateWorkoutInDB(workoutId, workoutData) {
    return new Promise((resolve, reject) => {
        try {
            dbTransaction('workouts', 'readwrite', (store) => {
                const request = store.put({ ...workoutData, id: workoutId });
                
                request.onsuccess = () => {
                    console.log("Тренировка обновлена в БД, ID:", workoutId);
                    resolve();
                };
                
                request.onerror = () => {
                    console.error('Ошибка обновления тренировки:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Ошибка в updateWorkoutInDB:', error);
            reject(error);
        }
    });
}

async function deleteWorkoutFromDB(workoutId) {
    return new Promise((resolve, reject) => {
        try {
            dbTransaction('workouts', 'readwrite', (store) => {
                const request = store.delete(workoutId);
                
                request.onsuccess = () => {
                    console.log("Тренировка удалена из БД, ID:", workoutId);
                    resolve();
                };
                
                request.onerror = () => {
                    console.error('Ошибка удаления тренировки:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Ошибка в deleteWorkoutFromDB:', error);
            reject(error);
        }
    });
}

async function saveFeedbackToDB(feedback) {
    try {
        await dbTransaction('feedback', 'readwrite', (store) => {
            const feedbackData = {
                ...feedback,
                createdAt: new Date().toISOString()
            };
            
            store.add(feedbackData);
        });
        
        console.log("Отзыв сохранен в БД");
        return true;
    } catch (error) {
        console.error('Ошибка сохранения отзыва:', error);
        return false;
    }
}

// ========== ИНТЕРФЕЙС И НАВИГАЦИЯ ==========
function showSection(sectionId) {
    // Скрываем все секции
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Показываем нужную секцию
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Обновляем активную вкладку
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Загружаем данные для секции
    switch (sectionId) {
        case 'history':
            loadWorkoutHistory();
            break;
        case 'tracker':
            updateTrackerStats();
            break;
        case 'schedule':
            loadUpcomingWorkouts();
            break;
        case 'library':
            filterExercises();
            break;
        case 'progress':
            loadProgressData();
            updateComparison();
            break;
        case 'programs':
            loadTrainingPrograms();
            break;
        case 'knowledge':
            loadKnowledgeBase();
            break;
        case 'home':
            updateAllStats();
            loadRecentWorkouts();
            updateCurrentDate();
            updateGreeting();
            break;
        case 'workout':
            // Убедимся, что есть хотя бы одно поле упражнения
            const container = document.getElementById('exercisesContainer');
            if (container && container.children.length === 0) {
                addEmptyExerciseField();
            }
            break;
    }
    
    // Прокручиваем вверх
    document.querySelector('.main-content').scrollTop = 0;
    
    // Закрываем все открытые автокомплиты
    closeAllAutocompletes();
}

function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('ru-RU', options);
    }
}

function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = '';
    let emoji = '';
    
    if (hour < 5) {
        greeting = 'Доброй ночи';
        emoji = '🌙';
    } else if (hour < 12) {
        greeting = 'Доброе утро';
        emoji = '☀️';
    } else if (hour < 18) {
        greeting = 'Добрый день';
        emoji = '🌤️';
    } else {
        greeting = 'Добрый вечер';
        emoji = '🌙';
    }
    
    const greetingElement = document.getElementById('greetingText');
    if (greetingElement) {
        greetingElement.innerHTML = `<span>${emoji}</span><span>${greeting}, ${userProfile.name}!</span>`;
    }
}

function updateHeaderProfile() {
    const headerAvatar = document.getElementById('headerAvatar');
    if (headerAvatar) {
        headerAvatar.textContent = userProfile.avatar;
        headerAvatar.title = userProfile.name;
    }
}

// ========== СООБЩЕНИЯ И УВЕДОМЛЕНИЯ ==========
function showMessage(text, type = 'success', duration = 3000) {
    // Удаляем старые сообщения
    document.querySelectorAll('.message').forEach(msg => {
        if (msg.parentNode) {
            msg.parentNode.removeChild(msg);
        }
    });
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type} animate-slide-in-up`;
    
    let icon = '✅';
    switch (type) {
        case 'error': icon = '❌'; break;
        case 'info': icon = 'ℹ️'; break;
        case 'warning': icon = '⚠️'; break;
    }
    
    messageDiv.innerHTML = `
        <span>${icon}</span>
        <span>${text}</span>
    `;
    
    const content = document.querySelector('.main-content');
    if (content) {
        // Добавляем сообщение после навигационных табов
        const navTabs = content.querySelector('.nav-tabs');
        if (navTabs && navTabs.nextSibling) {
            content.insertBefore(messageDiv, navTabs.nextSibling);
        } else {
            content.prepend(messageDiv);
        }
        
        // Автоматическое скрытие
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.opacity = '0';
                messageDiv.style.transform = 'translateX(-20px)';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.remove();
                    }
                }, 300);
            }
        }, duration);
    }
    
    // Показываем уведомление в Telegram, если доступно
    if (tg && tg.showAlert) {
        try {
            tg.showAlert(text);
        } catch (error) {
            console.warn("Не удалось показать уведомление в Telegram:", error);
        }
    }
    
    // Вибрация на мобильных устройствах
    if (type === 'error' && navigator.vibrate) {
        navigator.vibrate(200);
    }
    
    return messageDiv;
}

function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationCount');
    
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

function updateNotificationToggle() {
    const toggle = document.getElementById('notificationsToggle');
    if (toggle) {
        // Удаляем старые обработчики
        toggle.removeEventListener('change', handleNotificationToggle);
        
        // Добавляем новый обработчик
        toggle.addEventListener('change', handleNotificationToggle);
    }
}

function handleNotificationToggle() {
    saveSchedule();
    showMessage(`Уведомления ${this.checked ? 'включены' : 'выключены'}`, 'info');
}

// ========== МОДАЛЬНЫЕ ОКНА ==========
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Добавляем анимацию
        modal.style.animation = 'fadeIn 0.2s ease';
        
        // Фокусируемся на первом инпуте в модальном окне
        setTimeout(() => {
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.animation = 'fadeOut 0.2s ease';
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 200);
    }
}

function setModalTab(tabName) {
    currentModalTab = tabName;
    
    const modal = document.getElementById('addExerciseModal');
    if (modal) {
        // Обновляем активные вкладки
        const tabs = modal.querySelectorAll('.modal-tab');
        tabs.forEach(tab => tab.classList.remove('active'));
        
        const activeTab = modal.querySelector(`[onclick="setModalTab('${tabName}')"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        // Показываем соответствующий контент
        const contents = modal.querySelectorAll('.modal-tab-content');
        contents.forEach(content => content.style.display = 'none');
        
        const activeContent = document.getElementById(`${tabName}Tab`);
        if (activeContent) {
            activeContent.style.display = 'block';
        }
        
        // Загружаем данные для вкладки
        if (tabName === 'library') {
            filterModalExercises();
        }
    }
}

function showAddExerciseModal(context = 'global') {
    showModal('addExerciseModal');
    setModalTab('library');
    filterModalExercises();
    
    window.exerciseModalContext = context;
}

function showNotifications() {
    showModal('notificationsModal');
    displayNotifications();
}

function showAddCaloriesModal() {
    showModal('addCaloriesModal');
    // Устанавливаем текущее время
    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    document.getElementById('caloriesTime').value = timeString;
}

function showAddWaterModal() {
    showModal('addWaterModal');
    // Устанавливаем текущее время
    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    document.getElementById('waterTime').value = timeString;
}

function showEditWorkoutModal(workoutId) {
    editingWorkoutId = workoutId;
    loadWorkoutForEditing(workoutId);
    showModal('editWorkoutModal');
}

function showProfileModal() {
    showModal('profileModal');
    displayProfileContent();
}

function showThemeSettings() {
    showModal('themeModal');
    updateThemeModalUI();
}

// ========== ТЕМЫ И ЦВЕТОВЫЕ СХЕМЫ ==========
function toggleThemeMode() {
    const newMode = themeSettings.mode === 'dark' ? 'light' : 
                   themeSettings.mode === 'light' ? 'auto' : 'dark';
    setThemeMode(newMode);
}

function setThemeMode(mode) {
    themeSettings.mode = mode;
    applyThemeMode(mode);
    saveThemeSettingsToDB();
    updateThemeUI();
    showMessage(`Тема изменена: ${getThemeModeName(mode)}`, 'info');
}

function applyThemeMode(mode) {
    const isDark = mode === 'dark' || (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    // Устанавливаем класс темы
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(isDark ? 'theme-dark' : 'theme-light');
    
    // Обновляем CSS переменные
    if (isDark) {
        document.documentElement.style.setProperty('--bg', '#0f172a');
        document.documentElement.style.setProperty('--surface', '#1e293b');
        document.documentElement.style.setProperty('--surface-dark', '#334155');
        document.documentElement.style.setProperty('--text', '#f8fafc');
        document.documentElement.style.setProperty('--text-secondary', '#cbd5e1');
        document.documentElement.style.colorScheme = 'dark';
    } else {
        document.documentElement.style.setProperty('--bg', '#ffffff');
        document.documentElement.style.setProperty('--surface', '#f8fafc');
        document.documentElement.style.setProperty('--surface-dark', '#f1f5f9');
        document.documentElement.style.setProperty('--text', '#1e293b');
        document.documentElement.style.setProperty('--text-secondary', '#475569');
        document.documentElement.style.colorScheme = 'light';
    }
    
    // Обновляем иконку
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.textContent = isDark ? '🌙' : '☀️';
    }
}

function setColorScheme(scheme) {
    themeSettings.colorScheme = scheme;
    applyColorScheme(scheme);
    saveThemeSettingsToDB();
    
    // Обновляем активную схему в модальном окне
    document.querySelectorAll('.color-scheme-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeItem = document.querySelector(`.color-scheme-${scheme}`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
    
    showMessage(`Цветовая схема изменена на: ${getColorSchemeName(scheme)}`, 'info');
}

function applyColorScheme(scheme) {
    document.body.classList.remove('theme-indigo', 'theme-emerald', 'theme-amethyst', 'theme-coral', 'theme-ocean');
    document.body.classList.add(`theme-${scheme}`);
}

function toggleMinimalTheme() {
    themeSettings.minimalTheme = !themeSettings.minimalTheme;
    
    if (themeSettings.minimalTheme) {
        document.body.classList.add('minimal-theme');
    } else {
        document.body.classList.remove('minimal-theme');
    }
    
    saveThemeSettingsToDB();
    showMessage(`Минималистичная тема ${themeSettings.minimalTheme ? 'включена' : 'выключена'}`, 'info');
}

function toggleHighContrast() {
    themeSettings.highContrast = !themeSettings.highContrast;
    
    if (themeSettings.highContrast) {
        document.body.classList.add('high-contrast');
    } else {
        document.body.classList.remove('high-contrast');
    }
    
    saveThemeSettingsToDB();
    showMessage(`Высокая контрастность ${themeSettings.highContrast ? 'включена' : 'выключена'}`, 'info');
}

function updateThemeUI() {
    const themeToggle = document.getElementById('themeToggle');
    const currentThemeText = document.getElementById('currentThemeText');
    
    if (themeToggle) {
        themeToggle.classList.toggle('active', themeSettings.mode === 'dark');
    }
    
    if (currentThemeText) {
        currentThemeText.textContent = getThemeModeName(themeSettings.mode);
    }
}

function updateThemeModalUI() {
    // Обновляем активные кнопки режима темы
    ['dark', 'light', 'auto'].forEach(mode => {
        const btn = document.getElementById(`theme${capitalizeFirst(mode)}Btn`);
        if (btn) {
            btn.classList.toggle('active', themeSettings.mode === mode);
        }
    });
    
    // Обновляем активную цветовую схему
    document.querySelectorAll('.color-scheme-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeSchemeItem = document.querySelector(`.color-scheme-${themeSettings.colorScheme}`);
    if (activeSchemeItem) {
        activeSchemeItem.classList.add('active');
    }
}

function getThemeModeName(mode) {
    switch (mode) {
        case 'dark': return 'Тёмная';
        case 'light': return 'Светлая';
        case 'auto': return 'Авто';
        default: return 'Авто';
    }
}

function getColorSchemeName(scheme) {
    switch (scheme) {
        case 'indigo': return 'Индиго';
        case 'emerald': return 'Изумрудный';
        case 'amethyst': return 'Аметистовый';
        case 'coral': return 'Коралловый';
        case 'ocean': return 'Океанский';
        default: return 'Индиго';
    }
}

function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// ========== ТРЕНИРОВКИ ==========
function addEmptyExerciseField() {
    const container = document.getElementById('exercisesContainer');
    if (container && container.children.length === 0) {
        addExerciseFieldToContainer(container);
    }
}

function addExerciseFieldToContainer(container, exerciseData = null) {
    const exerciseId = `exercise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-item';
    exerciseDiv.id = exerciseId;
    exerciseDiv.innerHTML = `
        <div class="exercise-info">
            <div class="autocomplete-container">
                <input type="text" class="form-input exercise-name-input" 
                       placeholder="Название упражнения" 
                       value="${exerciseData ? exerciseData.name : ''}"
                       onfocus="showExerciseSuggestions(this)"
                       oninput="handleExerciseInput(this, '${exerciseId}')"
                       autocomplete="off"
                       data-exercise-id="${exerciseId}">
                <div class="autocomplete-dropdown" id="autocomplete_${exerciseId}" style="display: none;"></div>
            </div>
            <div class="exercise-details" id="details_${exerciseId}">
                ${generateExerciseDetailsHTML(exerciseData)}
            </div>
        </div>
        <div class="exercise-actions">
            <button class="btn btn-sm btn-icon btn-info" 
                    onclick="editExerciseSettings('${exerciseId}')" title="Настройки">
                ⚙️
            </button>
            <button class="btn btn-sm btn-icon btn-danger" 
                    onclick="removeExercise('${exerciseId}')" title="Удалить">
                🗑️
            </button>
        </div>
    `;
    
    // Сохраняем данные упражнения в data-атрибуты
    if (exerciseData) {
        exerciseDiv.dataset.sets = exerciseData.sets || 3;
        exerciseDiv.dataset.reps = exerciseData.reps || 10;
        exerciseDiv.dataset.weight = exerciseData.weight || 0;
        exerciseDiv.dataset.rest = exerciseData.rest || 90;
        exerciseDiv.dataset.note = exerciseData.note || '';
    } else {
        exerciseDiv.dataset.sets = 3;
        exerciseDiv.dataset.reps = 10;
        exerciseDiv.dataset.weight = 0;
        exerciseDiv.dataset.rest = 90;
        exerciseDiv.dataset.note = '';
    }
    
    container.appendChild(exerciseDiv);
    
    // Фокусируемся на поле ввода
    setTimeout(() => {
        const input = exerciseDiv.querySelector('.exercise-name-input');
        if (input) input.focus();
    }, 100);
}

function generateExerciseDetailsHTML(exerciseData) {
    const sets = exerciseData ? exerciseData.sets || 3 : 3;
    const reps = exerciseData ? exerciseData.reps || 10 : 10;
    const weight = exerciseData ? exerciseData.weight || 0 : 0;
    const note = exerciseData ? exerciseData.note || '' : '';
    
    let detailsHTML = `
        <div class="exercise-detail">
            <span>${sets}×</span>
            <span>подходы</span>
        </div>
        <div class="exercise-detail">
            <span>${reps}</span>
            <span>повторения</span>
        </div>
    `;
    
    if (weight > 0) {
        detailsHTML += `
            <div class="exercise-detail">
                <span>${weight}кг</span>
                <span>вес</span>
            </div>
        `;
    }
    
    if (note) {
        detailsHTML += `
            <div class="exercise-detail">
                <span>${note}</span>
            </div>
        `;
    }
    
    return detailsHTML;
}

function handleExerciseInput(input, exerciseId) {
    const searchTerm = input.value.toLowerCase().trim();
    if (searchTerm.length < 1) {
        hideAutocomplete(exerciseId);
        return;
    }
    
    const filtered = exerciseLibrary.filter(ex => 
        ex.name.toLowerCase().includes(searchTerm) ||
        ex.muscle.toLowerCase().includes(searchTerm) ||
        ex.subMuscle.toLowerCase().includes(searchTerm) ||
        (ex.description && ex.description.toLowerCase().includes(searchTerm))
    ).slice(0, 8);
    
    showAutocomplete(exerciseId, filtered);
}

function showAutocomplete(exerciseId, exercises) {
    const dropdown = document.getElementById(`autocomplete_${exerciseId}`);
    if (!dropdown) return;
    
    if (exercises.length === 0) {
        dropdown.innerHTML = `
            <div class="autocomplete-item" style="color: var(--text-tertiary);">
                Упражнение не найдено
            </div>
        `;
        dropdown.style.display = 'block';
        return;
    }
    
    dropdown.innerHTML = exercises.map(ex => `
        <div class="autocomplete-item" 
             onclick="selectAutocomplete('${exerciseId}', '${ex.name.replace(/'/g, "\\'")}')">
            <div style="font-weight: 600; margin-bottom: 4px;">${ex.name}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">
                ${ex.muscle} • ${ex.subMuscle}
            </div>
        </div>
    `).join('');
    
    dropdown.style.display = 'block';
}

function hideAutocomplete(exerciseId) {
    const dropdown = document.getElementById(`autocomplete_${exerciseId}`);
    if (dropdown) {
        dropdown.style.display = 'none';
    }
}

function closeAllAutocompletes() {
    document.querySelectorAll('.autocomplete-dropdown').forEach(dropdown => {
        dropdown.style.display = 'none';
    });
}

function selectAutocomplete(exerciseId, exerciseName) {
    const input = document.querySelector(`#${exerciseId} .exercise-name-input`);
    if (input) {
        input.value = exerciseName;
        input.blur();
        
        // Находим упражнение в библиотеке для заполнения деталей
        const exercise = exerciseLibrary.find(ex => ex.name === exerciseName);
        if (exercise) {
            const exerciseDiv = document.getElementById(exerciseId);
            if (exerciseDiv) {
                // Можно автоматически заполнить группу мышц или другие данные
                // Пока что просто скрываем автокомплит
            }
        }
    }
    hideAutocomplete(exerciseId);
    
    // Фокусируемся на следующем поле или добавляем новое
    setTimeout(() => {
        const container = document.getElementById('exercisesContainer');
        const currentIndex = Array.from(container.children).findIndex(child => child.id === exerciseId);
        if (currentIndex === container.children.length - 1) {
            addEmptyExerciseField();
        }
    }, 100);
}

function editExerciseSettings(exerciseId) {
    const exerciseDiv = document.getElementById(exerciseId);
    if (!exerciseDiv) return;
    
    editingExerciseId = exerciseId;
    
    // Показываем простое модальное окно для редактирования
    const modalHTML = `
        <div class="modal-overlay" id="editExerciseModal">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">⚙️ Настройки упражнения</h3>
                    <button class="modal-close" onclick="closeEditExerciseModal()">✕</button>
                </div>
                <div class="form-group">
                    <div class="input-row">
                        <div style="flex: 1;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Подходы</label>
                            <input type="number" class="form-input" id="editSetsModal" 
                                   min="1" max="20" value="${exerciseDiv.dataset.sets || 3}">
                        </div>
                        <div style="flex: 1;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Повторения</label>
                            <input type="number" class="form-input" id="editRepsModal" 
                                   min="1" max="100" value="${exerciseDiv.dataset.reps || 10}">
                        </div>
                    </div>
                    <div class="input-row">
                        <div style="flex: 1;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Вес (кг)</label>
                            <input type="number" class="form-input" id="editWeightModal" 
                                   min="0" max="500" step="0.5" value="${exerciseDiv.dataset.weight || 0}">
                        </div>
                        <div style="flex: 1;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Отдых (сек)</label>
                            <input type="number" class="form-input" id="editRestModal" 
                                   min="30" max="300" value="${exerciseDiv.dataset.rest || 90}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Примечание</label>
                        <input type="text" class="form-input" id="editNoteModal" 
                               value="${exerciseDiv.dataset.note || ''}"
                               placeholder="Легко/Тяжело/Отказ">
                    </div>
                </div>
                <button class="btn btn-success" onclick="saveExerciseSettingsModal()">
                    <span>💾</span>
                    <span>Сохранить</span>
                </button>
            </div>
        </div>
    `;
    
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHTML;
    document.body.appendChild(modalDiv.firstElementChild);
    
    // Фокусируемся на первом поле
    setTimeout(() => {
        const firstInput = document.getElementById('editSetsModal');
        if (firstInput) firstInput.focus();
    }, 100);
}

function closeEditExerciseModal() {
    const modal = document.getElementById('editExerciseModal');
    if (modal) {
        modal.remove();
    }
}

function saveExerciseSettingsModal() {
    const exerciseDiv = document.getElementById(editingExerciseId);
    if (exerciseDiv) {
        exerciseDiv.dataset.sets = document.getElementById('editSetsModal').value;
        exerciseDiv.dataset.reps = document.getElementById('editRepsModal').value;
        exerciseDiv.dataset.weight = document.getElementById('editWeightModal').value;
        exerciseDiv.dataset.rest = document.getElementById('editRestModal').value;
        exerciseDiv.dataset.note = document.getElementById('editNoteModal').value;
        
        updateExerciseDisplay(exerciseDiv);
    }
    
    closeEditExerciseModal();
    showMessage('Настройки сохранены', 'success');
}

function updateExerciseDisplay(exerciseDiv) {
    const detailsDiv = exerciseDiv.querySelector('.exercise-details');
    if (!detailsDiv) return;
    
    const sets = exerciseDiv.dataset.sets || 3;
    const reps = exerciseDiv.dataset.reps || 10;
    const weight = exerciseDiv.dataset.weight || 0;
    const note = exerciseDiv.dataset.note || '';
    
    detailsDiv.innerHTML = generateExerciseDetailsHTML({
        sets: sets,
        reps: reps,
        weight: weight,
        note: note
    });
}

function removeExercise(exerciseId) {
    const element = document.getElementById(exerciseId);
    if (element) {
        element.style.transform = 'translateX(-100%)';
        element.style.opacity = '0';
        setTimeout(() => {
            if (element.parentNode) {
                element.remove();
                showMessage('Упражнение удалено', 'success');
            }
        }, 200);
    }
}

function clearWorkoutForm() {
    if (confirm('Очистить форму тренировки? Все несохраненные данные будут потеряны.')) {
        document.getElementById('workoutName').value = '';
        document.getElementById('workoutDateTime').value = new Date().toISOString().slice(0, 16);
        document.getElementById('workoutNotes').value = '';
        const container = document.getElementById('exercisesContainer');
        if (container) {
            container.innerHTML = '';
        }
        addEmptyExerciseField();
        showMessage('Форма очищена', 'info');
    }
}

async function saveWorkout() {
    const name = document.getElementById('workoutName').value.trim();
    const dateTime = document.getElementById('workoutDateTime').value;
    const notes = document.getElementById('workoutNotes').value.trim();
    
    // Валидация
    if (!name) {
        showMessage('Введите название тренировки', 'error');
        document.getElementById('workoutName').focus();
        return;
    }
    
    if (name.length > 50) {
        showMessage('Название не должно превышать 50 символов', 'error');
        document.getElementById('workoutName').focus();
        return;
    }
    
    // Собираем упражнения
    const exercises = [];
    const exerciseItems = document.querySelectorAll('#exercisesContainer .exercise-item');
    
    if (exerciseItems.length === 0) {
        showMessage('Добавьте хотя бы одно упражнение', 'error');
        return;
    }
    
    let hasErrors = false;
    let totalVolume = 0;
    let exerciseCount = 0;
    
    for (const item of exerciseItems) {
        exerciseCount++;
        const nameInput = item.querySelector('.exercise-name-input');
        const exerciseName = nameInput ? nameInput.value.trim() : '';
        
        if (!exerciseName) {
            showMessage(`Введите название для упражнения ${exerciseCount}`, 'error');
            nameInput.focus();
            hasErrors = true;
            break;
        }
        
        if (exerciseName.length > 100) {
            showMessage(`Название упражнения ${exerciseCount} слишком длинное`, 'error');
            nameInput.focus();
            hasErrors = true;
            break;
        }
        
        const sets = parseInt(item.dataset.sets) || 3;
        const reps = parseInt(item.dataset.reps) || 10;
        const weight = parseFloat(item.dataset.weight) || 0;
        const rest = parseInt(item.dataset.rest) || 90;
        const note = item.dataset.note || '';
        
        if (isNaN(sets) || sets < 1 || sets > 50) {
            showMessage(`Некорректное количество подходов в упражнении ${exerciseCount}`, 'error');
            hasErrors = true;
            break;
        }
        
        if (isNaN(reps) || reps < 1 || reps > 1000) {
            showMessage(`Некорректное количество повторений в упражнении ${exerciseCount}`, 'error');
            hasErrors = true;
            break;
        }
        
        if (isNaN(weight) || weight < 0 || weight > 1000) {
            showMessage(`Некорректный вес в упражнении ${exerciseCount}`, 'error');
            hasErrors = true;
            break;
        }
        
        if (isNaN(rest) || rest < 10 || rest > 600) {
            showMessage(`Некорректное время отдыха в упражнении ${exerciseCount}`, 'error');
            hasErrors = true;
            break;
        }
        
        // Рассчитываем тоннаж
        const exerciseVolume = sets * reps * weight;
        totalVolume += exerciseVolume;
        
        exercises.push({
            name: exerciseName,
            sets: sets,
            reps: reps,
            weight: weight,
            rest: rest,
            note: note,
            volume: exerciseVolume,
            order: exerciseCount
        });
    }
    
    if (hasErrors) return;
    
    // Подготовка данных тренировки
    const workoutDate = new Date(dateTime);
    const workoutData = {
        name: name,
        date: workoutDate.toISOString(),
        dateDisplay: workoutDate.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        month: `${workoutDate.getFullYear()}-${(workoutDate.getMonth() + 1).toString().padStart(2, '0')}`,
        day: workoutDate.toDateString(),
        exercises: exercises,
        notes: notes,
        volume: totalVolume,
        exerciseCount: exercises.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    try {
        // Показываем индикатор загрузки
        const saveBtn = document.querySelector('[onclick="saveWorkout()"]');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<span>⏳</span><span>Сохранение...</span>';
        saveBtn.disabled = true;
        
        // Сохраняем в базу данных
        const workoutId = await saveWorkoutToDB(workoutData);
        
        // Добавляем опыт за тренировку
        await addExperience(15);
        
        // Создаем уведомление
        await addNotification(`Тренировка "${name}" сохранена! 🎉`, 'workout_saved');
        
        // Показываем сообщение об успехе
        showMessage(`✅ Тренировка сохранена! (+15 опыта, ${totalVolume}кг)`, 'success');
        
        // Обновляем статистику пользователя
        userProfile.stats.totalWorkouts = (userProfile.stats.totalWorkouts || 0) + 1;
        userProfile.stats.totalVolume = (userProfile.stats.totalVolume || 0) + totalVolume;
        await saveUserProfileToDB();
        
        // Очищаем форму
        setTimeout(() => {
            clearWorkoutForm();
            
            // Восстанавливаем кнопку
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
            
            // Возвращаемся на главную
            setTimeout(() => {
                showSection('home');
                updateAllStats();
                loadRecentWorkouts();
                generateCalendar();
                updateProgressCharts();
                updateComparison();
            }, 500);
        }, 1000);
        
    } catch (error) {
        console.error('Ошибка при сохранении тренировки:', error);
        showMessage('Ошибка при сохранении тренировки', 'error');
        
        // Восстанавливаем кнопку
        const saveBtn = document.querySelector('[onclick="saveWorkout()"]');
        saveBtn.innerHTML = '<span>💾</span><span>Сохранить тренировку</span>';
        saveBtn.disabled = false;
    }
}

// ========== ИСТОРИЯ ТРЕНИРОВОК ==========
async function loadWorkoutHistory() {
    try {
        const workouts = await getAllWorkouts();
        const filter = document.getElementById('historyFilter').value;
        const search = document.getElementById('historySearch').value.toLowerCase();
        
        // Фильтрация
        let filtered = workouts;
        
        // Фильтр по времени
        if (filter !== 'all') {
            const now = new Date();
            let startDate = new Date();
            
            switch (filter) {
                case 'week':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case '3months':
                    startDate.setMonth(now.getMonth() - 3);
                    break;
            }
            
            filtered = filtered.filter(w => new Date(w.date) >= startDate);
        }
        
        // Поиск
        if (search) {
            filtered = filtered.filter(w => 
                w.name.toLowerCase().includes(search) ||
                (w.notes && w.notes.toLowerCase().includes(search)) ||
                w.exercises.some(e => e.name.toLowerCase().includes(search))
            );
        }
        
        // Сортировка по дате (сначала новые)
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Пагинация
        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        const startIndex = (currentHistoryPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginated = filtered.slice(startIndex, endIndex);
        
        // Отображение
        const container = document.getElementById('historyList');
        const pagination = document.getElementById('historyPagination');
        const pageInfo = document.getElementById('historyPageInfo');
        
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <div class="empty-state-title">Тренировки не найдены</div>
                    <p class="empty-state-text">${search ? 'Попробуйте другой запрос' : 'Создайте первую тренировку!'}</p>
                    <button class="btn btn-primary mt-3" onclick="showSection('workout')">
                        <span>➕</span>
                        <span>Создать тренировку</span>
                    </button>
                </div>
            `;
            if (pagination) pagination.style.display = 'none';
            return;
        }
        
        container.innerHTML = paginated.map(workout => `
            <div class="exercise-item" onclick="showWorkoutDetails(${workout.id})">
                <div class="exercise-info">
                    <div class="exercise-name">${workout.name}</div>
                    <div class="exercise-details">
                        <div class="exercise-detail">
                            <span>${formatWorkoutDate(workout.date)}</span>
                        </div>
                        <div class="exercise-detail">
                            <span>${workout.exercises.length}</span>
                            <span>упражнений</span>
                        </div>
                        <div class="exercise-detail">
                            <span>${workout.volume || 0}</span>
                            <span>кг</span>
                        </div>
                        ${workout.notes ? `
                            <div class="exercise-detail" title="${workout.notes}">
                                <span>📝</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="exercise-actions">
                    <button class="btn btn-sm btn-icon btn-info" 
                            onclick="event.stopPropagation(); showEditWorkoutModal(${workout.id})"
                            title="Редактировать">
                        ✏️
                    </button>
                    <button class="btn btn-sm btn-icon btn-danger" 
                            onclick="event.stopPropagation(); deleteWorkout(${workout.id})"
                            title="Удалить">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
        
        // Пагинация
        if (totalPages > 1) {
            if (pageInfo) {
                pageInfo.textContent = `Страница ${currentHistoryPage} из ${totalPages}`;
                pageInfo.title = `Всего тренировок: ${filtered.length}`;
            }
            if (pagination) {
                pagination.style.display = 'flex';
                
                // Обновляем состояние кнопок
                const prevBtn = pagination.querySelector('button:first-child');
                const nextBtn = pagination.querySelector('button:last-child');
                
                if (prevBtn) {
                    prevBtn.disabled = currentHistoryPage === 1;
                    prevBtn.title = currentHistoryPage === 1 ? 'Вы на первой странице' : 'Предыдущая страница';
                }
                
                if (nextBtn) {
                    nextBtn.disabled = currentHistoryPage === totalPages;
                    nextBtn.title = currentHistoryPage === totalPages ? 'Вы на последней странице' : 'Следующая страница';
                }
            }
        } else {
            if (pagination) pagination.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Ошибка загрузки истории:', error);
        showMessage('Ошибка загрузки истории тренировок', 'error');
    }
}

function formatWorkoutDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Сегодня';
    } else if (diffDays === 1) {
        return 'Вчера';
    } else if (diffDays < 7) {
        return `${diffDays} дня назад`;
    } else {
        return date.toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'short',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }
}

function changeHistoryPage(delta) {
    const newPage = currentHistoryPage + delta;
    if (newPage < 1) return;
    
    // Получаем общее количество страниц
    const pageInfo = document.getElementById('historyPageInfo');
    if (pageInfo && pageInfo.textContent.includes('из')) {
        const totalPages = parseInt(pageInfo.textContent.split('из')[1]);
        if (newPage > totalPages) return;
    }
    
    currentHistoryPage = newPage;
    loadWorkoutHistory();
    
    // Прокручиваем к началу списка
    const container = document.getElementById('historyList');
    if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ========== РАСПИСАНИЕ ==========
function toggleScheduleDay(element) {
    const day = parseInt(element.dataset.day);
    const index = scheduleDays.indexOf(day);
    
    if (index === -1) {
        scheduleDays.push(day);
        element.classList.add('active');
    } else {
        scheduleDays.splice(index, 1);
        element.classList.remove('active');
    }
    
    // Сортируем дни для удобства
    scheduleDays.sort((a, b) => a - b);
}

function updateScheduleUI() {
    document.querySelectorAll('.schedule-day').forEach(day => {
        const dayNum = parseInt(day.dataset.day);
        if (scheduleDays.includes(dayNum)) {
            day.classList.add('active');
        } else {
            day.classList.remove('active');
        }
    });
}

async function saveSchedule() {
    const time = document.getElementById('reminderTime').value;
    const enabled = document.getElementById('notificationsToggle').checked;
    
    // Валидация времени
    if (!time) {
        showMessage('Укажите время напоминания', 'error');
        return;
    }
    
    try {
        await saveScheduleToDB();
        
        showMessage('Расписание сохранено', 'success');
        
        // Обновляем уведомления
        scheduleNotification();
        
        // Обновляем UI
        updateScheduleUI();
        
        // Показываем информацию о выбранных днях
        const dayNames = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
        const selectedDays = scheduleDays.map(day => dayNames[day]).join(', ');
        if (selectedDays) {
            showMessage(`Тренировки запланированы на: ${selectedDays} в ${time}`, 'info', 5000);
        }
        
    } catch (error) {
        console.error('Ошибка сохранения расписания:', error);
        showMessage('Ошибка сохранения расписания', 'error');
    }
}

function scheduleNotification() {
    if (!isTrainingDayToday()) return;
    
    const time = document.getElementById('reminderTime').value;
    const [hours, minutes] = time.split(':').map(Number);
    
    const now = new Date();
    const notificationTime = new Date();
    notificationTime.setHours(hours, minutes, 0, 0);
    
    // Если время уже прошло сегодня, планируем на завтра
    if (notificationTime <= now) {
        notificationTime.setDate(notificationTime.getDate() + 1);
    }
    
    const timeUntilNotification = notificationTime - now;
    
    // Для демонстрации показываем сразу
    setTimeout(() => {
        if (document.getElementById('notificationsToggle').checked) {
            addNotification('Пора на тренировку! 💪', 'schedule');
            showMessage('⏰ Напоминание: Пора на тренировку! 💪', 'info');
        }
    }, 3000); // 3 секунды для демонстрации
}

function checkScheduleNotifications() {
    const today = new Date().toDateString();
    const lastNotification = localStorage.getItem('lastScheduleNotification');
    
    if (lastNotification !== today && isTrainingDayToday()) {
        setTimeout(() => {
            if (document.getElementById('notificationsToggle').checked) {
                addNotification('Не забудьте про тренировку сегодня! 🏋️', 'schedule');
                localStorage.setItem('lastScheduleNotification', today);
            }
        }, 5000); // 5 секунд после загрузки
    }
}

function isTrainingDayToday() {
    const today = new Date().getDay(); // 0 = ВС, 1 = ПН, ..., 6 = СБ
    return scheduleDays.includes(today);
}

function showMorningGreeting() {
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 12) {
        greeting = 'Доброе утро! Пора на тренировку! 💪';
    } else if (hour < 18) {
        greeting = 'Добрый день! Как насчет тренировки? 🏋️';
    } else {
        greeting = 'Добрый вечер! Завершите день тренировкой! 🔥';
    }
    
    // Показываем только если сегодня день тренировки по расписанию
    if (isTrainingDayToday()) {
        setTimeout(() => {
            showMessage(greeting, 'info', 5000);
        }, 2000);
    }
}

// ========== УВЕДОМЛЕНИЯ ==========
async function addNotification(text, type = 'info') {
    const notification = {
        text: text,
        type: type,
        date: new Date().toISOString(),
        read: false,
        important: type === 'schedule' || type === 'achievement'
    };
    
    notifications.unshift(notification);
    
    try {
        await saveNotificationToDB(notification);
        
        updateNotificationBadge();
        
        // Вибрация для важных уведомлений
        if (notification.important && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
        
    } catch (error) {
        console.error('Ошибка сохранения уведомления:', error);
    }
}

function displayNotifications() {
    const container = document.getElementById('notificationsList');
    
    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 40px 20px;">
                <div class="empty-state-icon">🔔</div>
                <div class="empty-state-title">Нет уведомлений</div>
                <p class="empty-state-text">Здесь будут появляться напоминания о тренировках и достижениях</p>
            </div>
        `;
        return;
    }
    
    // Группируем уведомления по дням
    const grouped = {};
    notifications.forEach(notification => {
        const date = new Date(notification.date);
        const dateKey = date.toLocaleDateString('ru-RU');
        
        if (!grouped[dateKey]) {
            grouped[dateKey] = [];
        }
        grouped[dateKey].push(notification);
    });
    
    let html = '';
    Object.keys(grouped).forEach(dateKey => {
        html += `
            <div style="margin-bottom: 20px;">
                <div style="font-weight: 600; color: var(--text-tertiary); margin-bottom: 10px; padding-left: 10px;">
                    ${dateKey}
                </div>
                ${grouped[dateKey].map((notification, index) => `
                    <div class="message message-${notification.type === 'schedule' ? 'info' : notification.type}" 
                         style="margin-bottom: 12px; ${notification.read ? 'opacity: 0.7;' : ''}">
                        <span>${getNotificationIcon(notification.type)}</span>
                        <div style="flex: 1;">
                            <div>${notification.text}</div>
                            <div style="font-size: 0.85rem; color: var(--text-tertiary); margin-top: 4px;">
                                ${new Date(notification.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <button class="btn btn-sm btn-icon" 
                                onclick="markNotificationRead(${notifications.indexOf(notification)})" 
                                style="background: transparent; color: var(--text-tertiary);"
                                title="${notification.read ? 'Прочитано' : 'Отметить как прочитанное'}">
                            ${notification.read ? '✓' : '○'}
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Добавляем кнопку очистки
    const unreadCount = notifications.filter(n => !n.read).length;
    if (notifications.length > 0) {
        container.innerHTML += `
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button class="btn btn-sm btn-secondary" onclick="markAllNotificationsRead()" style="flex: 1;">
                    <span>✓</span>
                    <span>Прочитать все (${unreadCount})</span>
                </button>
                <button class="btn btn-sm btn-danger" onclick="clearAllNotifications()" style="flex: 1;">
                    <span>🗑️</span>
                    <span>Очистить все</span>
                </button>
            </div>
        `;
    }
}

function getNotificationIcon(type) {
    switch (type) {
        case 'schedule': return '⏰';
        case 'achievement': return '🏆';
        case 'workout_saved': return '✅';
        case 'program': return '📋';
        case 'error': return '❌';
        case 'info': return 'ℹ️';
        default: return '🔔';
    }
}

async function markNotificationRead(index) {
    if (index >= 0 && index < notifications.length) {
        notifications[index].read = true;
        
        try {
            await updateNotificationInDB(notifications[index].id, { read: true });
            
            updateNotificationBadge();
            displayNotifications();
            
        } catch (error) {
            console.error('Ошибка обновления уведомления:', error);
        }
    }
}

async function markAllNotificationsRead() {
    try {
        const updates = notifications.filter(n => !n.read).map(n => 
            updateNotificationInDB(n.id, { read: true })
        );
        
        await Promise.all(updates);
        
        notifications.forEach(n => n.read = true);
        updateNotificationBadge();
        displayNotifications();
        
        showMessage('Все уведомления отмечены как прочитанные', 'success');
        
    } catch (error) {
        console.error('Ошибка отметки всех уведомлений:', error);
        showMessage('Ошибка при отметке уведомлений', 'error');
    }
}

async function clearAllNotifications() {
    if (!confirm('Удалить все уведомления?')) return;
    
    try {
        await dbTransaction('notifications', 'readwrite', (store) => {
            store.clear();
        });
        
        notifications = [];
        updateNotificationBadge();
        displayNotifications();
        
        showMessage('Все уведомления удалены', 'success');
        
    } catch (error) {
        console.error('Ошибка очистки уведомлений:', error);
        showMessage('Ошибка при удалении уведомлений', 'error');
    }
}

// ========== ТРЕКЕР КАЛОРИЙ И ВОДЫ ==========
async function updateTrackerStats() {
    try {
        const today = new Date().toDateString();
        let totalCalories = 0;
        let totalWater = 0;
        const todayEntries = [];
        
        await dbTransaction('tracker', 'readonly', (store) => {
            const request = store.getAll();
            
            request.onsuccess = () => {
                const entries = request.result || [];
                
                entries.forEach(entry => {
                    if (new Date(entry.date).toDateString() === today) {
                        if (entry.type === 'calories') {
                            totalCalories += entry.amount;
                            todayEntries.push(entry);
                        } else if (entry.type === 'water') {
                            totalWater += entry.amount;
                            todayEntries.push(entry);
                        }
                    }
                });
                
                // Обновляем отображение
                document.getElementById('todayCalories').textContent = totalCalories;
                document.getElementById('todayWater').textContent = totalWater.toFixed(1);
                
                // Обновляем цели
                updateTrackerGoalsDisplay();
                
                // Обновляем прогресс
                updateProgressBars(totalCalories, totalWater);
                
                // Обновляем список записей
                updateTrackerEntriesDisplay(todayEntries);
            };
            
            request.onerror = () => {
                console.error('Ошибка загрузки записей трекера:', request.error);
            };
        });
        
    } catch (error) {
        console.error('Ошибка обновления статистики трекера:', error);
    }
}

function updateTrackerGoalsDisplay() {
    document.getElementById('caloriesGoal').textContent = trackerGoals.calories;
    document.getElementById('waterGoal').textContent = trackerGoals.water.toFixed(1);
}

function updateProgressBars(calories, water) {
    const caloriesProgress = (calories / trackerGoals.calories) * 100;
    const waterProgress = (water / trackerGoals.water) * 100;
    
    const caloriesBar = document.getElementById('caloriesProgress');
    const waterBar = document.getElementById('waterProgress');
    
    if (caloriesBar) {
        caloriesBar.style.width = Math.min(caloriesProgress, 100) + '%';
        // Меняем цвет при превышении цели
        caloriesBar.style.background = caloriesProgress > 100 ? 'var(--danger)' : 'var(--primary)';
    }
    
    if (waterBar) {
        waterBar.style.width = Math.min(waterProgress, 100) + '%';
        waterBar.style.background = waterProgress > 100 ? 'var(--danger)' : 'var(--info)';
    }
    
    document.getElementById('caloriesProgressText').textContent = 
        `${calories} / ${trackerGoals.calories} ккал`;
    document.getElementById('waterProgressText').textContent = 
        `${water.toFixed(1)} / ${trackerGoals.water.toFixed(1)} л`;
}

function updateTrackerDisplay(entries) {
    const today = new Date().toDateString();
    const todayEntries = entries.filter(entry => 
        new Date(entry.date).toDateString() === today
    );
    
    updateTrackerEntriesDisplay(todayEntries);
}

function updateTrackerEntriesDisplay(entries) {
    const container = document.getElementById('trackerEntries');
    
    if (entries.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 40px 20px;">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-title">Нет записей за сегодня</div>
                <p class="empty-state-text">Добавьте первую запись!</p>
            </div>
        `;
        return;
    }
    
    // Группируем по типу
    const caloriesEntries = entries.filter(e => e.type === 'calories');
    const waterEntries = entries.filter(e => e.type === 'water');
    
    let html = '';
    
    if (caloriesEntries.length > 0) {
        html += `
            <div style="margin-bottom: 20px;">
                <div style="font-weight: 600; color: var(--text-secondary); margin-bottom: 10px;">
                    🔥 Калории
                </div>
                ${caloriesEntries.sort((a, b) => new Date(b.date) - new Date(a.date)).map(entry => `
                    <div class="exercise-item">
                        <div class="exercise-info">
                            <div class="exercise-name">
                                ${entry.description || 'Прием пищи'}
                            </div>
                            <div class="exercise-details">
                                <div class="exercise-detail">
                                    <span>${entry.amount} ккал</span>
                                </div>
                                <div class="exercise-detail">
                                    <span>${new Date(entry.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        </div>
                        <div class="exercise-actions">
                            <button class="btn btn-sm btn-icon btn-danger" 
                                    onclick="deleteTrackerEntry(${entry.id})"
                                    title="Удалить запись">
                                🗑️
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    if (waterEntries.length > 0) {
        html += `
            <div>
                <div style="font-weight: 600; color: var(--text-secondary); margin-bottom: 10px;">
                    💧 Вода
                </div>
                ${waterEntries.sort((a, b) => new Date(b.date) - new Date(a.date)).map(entry => `
                    <div class="exercise-item">
                        <div class="exercise-info">
                            <div class="exercise-name">
                                ${entry.description || 'Потребление воды'}
                            </div>
                            <div class="exercise-details">
                                <div class="exercise-detail">
                                    <span>${entry.amount} л</span>
                                </div>
                                <div class="exercise-detail">
                                    <span>${new Date(entry.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        </div>
                        <div class="exercise-actions">
                            <button class="btn btn-sm btn-icon btn-danger" 
                                    onclick="deleteTrackerEntry(${entry.id})"
                                    title="Удалить запись">
                                🗑️
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    container.innerHTML = html;
}

async function addCaloriesEntry() {
    const amount = parseInt(document.getElementById('caloriesAmount').value);
    const description = document.getElementById('caloriesDescription').value.trim() || 'Прием пищи';
    const time = document.getElementById('caloriesTime').value;
    
    if (!amount || amount < 1 || amount > 10000) {
        showMessage('Введите корректное количество калорий (1-10000)', 'error');
        return;
    }
    
    if (description.length > 100) {
        showMessage('Описание слишком длинное (макс. 100 символов)', 'error');
        return;
    }
    
    const [hours, minutes] = time.split(':').map(Number);
    const entryDate = new Date();
    entryDate.setHours(hours, minutes, 0, 0);
    
    const entry = {
        type: 'calories',
        amount: amount,
        description: description,
        date: entryDate.toISOString(),
        createdAt: new Date().toISOString()
    };
    
    try {
        await saveTrackerEntryToDB(entry);
        
        showMessage(`${amount} ккал добавлено`, 'success');
        closeModal('addCaloriesModal');
        updateTrackerStats();
        
        // Очищаем форму
        document.getElementById('caloriesDescription').value = '';
        
    } catch (error) {
        console.error('Ошибка при добавлении калорий:', error);
        showMessage('Ошибка при добавлении калорий', 'error');
    }
}

async function addWaterEntry() {
    const amount = parseFloat(document.getElementById('waterAmount').value);
    const time = document.getElementById('waterTime').value;
    
    if (!amount || amount < 0.1 || amount > 10) {
        showMessage('Введите корректное количество воды (0.1-10 л)', 'error');
        return;
    }
    
    const [hours, minutes] = time.split(':').map(Number);
    const entryDate = new Date();
    entryDate.setHours(hours, minutes, 0, 0);
    
    const entry = {
        type: 'water',
        amount: amount,
        description: 'Потребление воды',
        date: entryDate.toISOString(),
        createdAt: new Date().toISOString()
    };
    
    try {
        await saveTrackerEntryToDB(entry);
        
        showMessage(`${amount} л воды добавлено`, 'success');
        closeModal('addWaterModal');
        updateTrackerStats();
        
    } catch (error) {
        console.error('Ошибка при добавлении воды:', error);
        showMessage('Ошибка при добавлении воды', 'error');
    }
}

async function quickAddCalories(amount) {
    if (amount < 1 || amount > 10000) {
        showMessage('Некорректное количество калорий', 'error');
        return;
    }
    
    const entry = {
        type: 'calories',
        amount: amount,
        description: 'Быстрое добавление',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
    };
    
    try {
        await saveTrackerEntryToDB(entry);
        
        showMessage(`+${amount} ккал`, 'success');
        updateTrackerStats();
        
        // Анимация добавления
        const caloriesElement = document.getElementById('todayCalories');
        if (caloriesElement) {
            caloriesElement.classList.add('glow');
            setTimeout(() => {
                caloriesElement.classList.remove('glow');
            }, 1000);
        }
        
    } catch (error) {
        console.error('Ошибка при добавлении калорий:', error);
        showMessage('Ошибка при добавлении калорий', 'error');
    }
}

async function quickAddWater(amount) {
    if (amount < 0.1 || amount > 10) {
        showMessage('Некорректное количество воды', 'error');
        return;
    }
    
    const entry = {
        type: 'water',
        amount: amount,
        description: 'Быстрое добавление',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
    };
    
    try {
        await saveTrackerEntryToDB(entry);
        
        showMessage(`+${amount} л воды`, 'success');
        updateTrackerStats();
        
        // Анимация добавления
        const waterElement = document.getElementById('todayWater');
        if (waterElement) {
            waterElement.classList.add('glow');
            setTimeout(() => {
                waterElement.classList.remove('glow');
            }, 1000);
        }
        
    } catch (error) {
        console.error('Ошибка при добавлении воды:', error);
        showMessage('Ошибка при добавлении воды', 'error');
    }
}

async function deleteTrackerEntry(entryId) {
    if (!confirm('Удалить эту запись?')) return;
    
    try {
        await deleteTrackerEntryFromDB(entryId);
        
        showMessage('Запись удалена', 'success');
        updateTrackerStats();
        
    } catch (error) {
        console.error('Ошибка при удалении записи:', error);
        showMessage('Ошибка при удалении записи', 'error');
    }
}

async function saveTrackerGoals() {
    const calories = parseInt(document.getElementById('caloriesGoalInput').value);
    const water = parseFloat(document.getElementById('waterGoalInput').value);
    
    if (!calories || calories < 500 || calories > 10000) {
        showMessage('Некорректная цель по калориям (500-10000)', 'error');
        return;
    }
    
    if (!water || water < 0.5 || water > 10) {
        showMessage('Некорректная цель по воде (0.5-10 л)', 'error');
        return;
    }
    
    trackerGoals = {
        calories: calories,
        water: water
    };
    
    try {
        await saveTrackerGoalsToDB();
        
        showMessage('Цели сохранены', 'success');
        updateTrackerStats();
        
    } catch (error) {
        console.error('Ошибка сохранения целей:', error);
        showMessage('Ошибка сохранения целей', 'error');
    }
}

// ========== БИБЛИОТЕКА УПРАЖНЕНИЙ ==========
function loadExerciseLibrary() {
    displayExercises(exerciseLibrary);
}

function displayExercises(exercises) {
    const container = document.getElementById('exerciseLibrary');
    
    if (exercises.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-title">Упражнения не найдены</div>
                <p class="empty-state-text">Добавьте первое упражнение!</p>
                <button class="btn btn-primary mt-3" onclick="showAddExerciseModal()">
                    <span>➕</span>
                    <span>Добавить упражнение</span>
                </button>
            </div>
        `;
        return;
    }
    
    // Группируем по мышцам
    const grouped = {};
    exercises.forEach(ex => {
        if (!grouped[ex.muscle]) {
            grouped[ex.muscle] = [];
        }
        grouped[ex.muscle].push(ex);
    });
    
    let html = '';
    Object.keys(grouped).sort().forEach(muscle => {
        html += `
            <div class="library-category">
                <div style="font-weight: 700; color: var(--primary); margin-bottom: 14px; padding-bottom: 10px; border-bottom: 2px solid var(--border);">
                    ${muscle} (${grouped[muscle].length})
                </div>
                ${grouped[muscle].map(ex => `
                    <div class="library-item" onclick="showExerciseDetails('${ex.name.replace(/'/g, "\\'")}')">
                        <div class="library-item-image">
                            ${ex.image ? `<img src="${ex.image}" alt="${ex.name}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='💪';">` : '💪'}
                        </div>
                        <div class="library-item-content">
                            <div class="library-item-title">${ex.name}</div>
                            <div class="library-item-muscle">${ex.subMuscle}</div>
                            <div class="library-item-description">
                                ${ex.description ? ex.description.substring(0, 100) + (ex.description.length > 100 ? '...' : '') : ''}
                            </div>
                        </div>
                        ${ex.isCustom ? `
                            <div class="exercise-actions" style="flex-direction: row;">
                                <button class="btn btn-sm btn-icon btn-info" 
                                        onclick="event.stopPropagation(); showEditExerciseModal('${ex.name.replace(/'/g, "\\'")}')"
                                        title="Редактировать">
                                    ✏️
                                </button>
                                <button class="btn btn-sm btn-icon btn-danger" 
                                        onclick="event.stopPropagation(); deleteCustomExercise('${ex.name.replace(/'/g, "\\'")}')"
                                        title="Удалить">
                                    🗑️
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function filterExercises() {
    const searchTerm = document.getElementById('exerciseSearch').value.toLowerCase().trim();
    const muscleFilter = document.getElementById('muscleFilter').value;
    
    let filtered = exerciseLibrary;
    
    if (searchTerm) {
        filtered = filtered.filter(ex => 
            ex.name.toLowerCase().includes(searchTerm) ||
            ex.muscle.toLowerCase().includes(searchTerm) ||
            ex.subMuscle.toLowerCase().includes(searchTerm) ||
            (ex.description && ex.description.toLowerCase().includes(searchTerm))
        );
    }
    
    if (muscleFilter) {
        filtered = filtered.filter(ex => ex.muscle === muscleFilter);
    }
    
    displayExercises(filtered);
    
    // Показываем количество результатов
    showMessage(`Найдено упражнений: ${filtered.length}`, 'info', 2000);
}

function filterModalExercises() {
    const searchTerm = document.getElementById('modalExerciseSearch').value.toLowerCase().trim();
    const container = document.getElementById('modalExerciseLibrary');
    
    if (!container) return;
    
    let filtered = exerciseLibrary;
    
    if (searchTerm) {
        filtered = filtered.filter(ex => 
            ex.name.toLowerCase().includes(searchTerm) ||
            ex.muscle.toLowerCase().includes(searchTerm) ||
            ex.subMuscle.toLowerCase().includes(searchTerm) ||
            (ex.description && ex.description.toLowerCase().includes(searchTerm))
        );
    }
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 40px 20px;">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-title">Упражнения не найдены</div>
                <p class="empty-state-text">Попробуйте изменить запрос</p>
            </div>
        `;
        return;
    }
    
    // Группируем по мышцам для модального окна
    const grouped = {};
    filtered.forEach(ex => {
        if (!grouped[ex.muscle]) {
            grouped[ex.muscle] = [];
        }
        grouped[ex.muscle].push(ex);
    });
    
    let html = '';
    Object.keys(grouped).sort().forEach(muscle => {
        html += `
            <div style="margin-bottom: 20px;">
                <div style="font-weight: 600; color: var(--primary); margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid var(--border);">
                    ${muscle}
                </div>
                ${grouped[muscle].map(ex => `
                    <div class="autocomplete-item" 
                         onclick="selectModalExercise('${ex.name.replace(/'/g, "\\'")}')">
                        <div style="font-weight: 600; margin-bottom: 4px;">${ex.name}</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">
                            ${ex.subMuscle}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function selectModalExercise(exerciseName) {
    const context = window.exerciseModalContext || 'global';
    
    if (context === 'workout') {
        const container = document.getElementById('exercisesContainer');
        addExerciseFieldToContainer(container, { name: exerciseName });
        closeModal('addExerciseModal');
        showMessage(`Упражнение "${exerciseName}" добавлено`, 'success');
    }
}

function showExerciseDetails(exerciseName) {
    const exercise = exerciseLibrary.find(ex => ex.name === exerciseName);
    if (!exercise) return;
    
    const modalHTML = `
        <div class="modal-overlay" id="exerciseDetailsModal">
            <div class="modal" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 class="modal-title">${exercise.name}</h3>
                    <button class="modal-close" onclick="closeExerciseDetailsModal()">✕</button>
                </div>
                
                ${exercise.image ? `
                    <div style="margin-bottom: 20px; border-radius: var(--radius); overflow: hidden; max-height: 200px;">
                        <img src="${exercise.image}" alt="${exercise.name}" 
                             style="width: 100%; height: auto; object-fit: cover;"
                             loading="lazy"
                             onerror="this.style.display='none';">
                    </div>
                ` : ''}
                
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <span style="display: inline-block; padding: 6px 12px; background: var(--primary-light); 
                              color: var(--primary); border-radius: 12px; font-size: 0.85rem; font-weight: 600;">
                            ${exercise.muscle}
                        </span>
                        <span style="display: inline-block; padding: 6px 12px; background: var(--surface-dark); 
                              color: var(--text-secondary); border-radius: 12px; font-size: 0.85rem;">
                            ${exercise.subMuscle}
                        </span>
                        ${exercise.isCustom ? `
                            <span style="display: inline-block; padding: 6px 12px; background: var(--info-light); 
                                  color: var(--info); border-radius: 12px; font-size: 0.85rem;">
                                ✏️ Пользовательское
                            </span>
                        ` : ''}
                    </div>
                    
                    <div style="line-height: 1.6; color: var(--text); background: var(--surface-dark); padding: 20px; border-radius: var(--radius);">
                        ${exercise.description ? exercise.description.split('\n').map(p => `<p style="margin-bottom: 15px;">${p}</p>`).join('') : 'Описание отсутствует'}
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-primary" onclick="addToWorkout('${exercise.name.replace(/'/g, "\\'")}'); closeExerciseDetailsModal();" style="flex: 2;">
                        <span>➕</span>
                        <span>Добавить в тренировку</span>
                    </button>
                    <button class="btn btn-secondary" onclick="closeExerciseDetailsModal()" style="flex: 1;">
                        <span>Закрыть</span>
                    </button>
                </div>
                
                ${exercise.isCustom ? `
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border);">
                        <button class="btn btn-danger" onclick="deleteCustomExercise('${exercise.name.replace(/'/g, "\\'")}'); closeExerciseDetailsModal();">
                            <span>🗑️</span>
                            <span>Удалить упражнение</span>
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHTML;
    document.body.appendChild(modalDiv.firstElementChild);
}

function closeExerciseDetailsModal() {
    const modal = document.getElementById('exerciseDetailsModal');
    if (modal) {
        modal.remove();
    }
}

function addToWorkout(exerciseName) {
    showSection('workout');
    const container = document.getElementById('exercisesContainer');
    addExerciseFieldToContainer(container, { name: exerciseName });
    showMessage(`Упражнение "${exerciseName}" добавлено в тренировку`, 'success');
}

function showEditExerciseModal(exerciseName) {
    const exercise = exerciseLibrary.find(ex => ex.name === exerciseName);
    if (!exercise || !exercise.isCustom) return;
    
    // TODO: Реализовать редактирование пользовательского упражнения
    showMessage('Редактирование упражнений скоро будет доступно', 'info');
}

async function addCustomExercise() {
    const name = document.getElementById('customExerciseName').value.trim();
    const muscle = document.getElementById('customExerciseMuscle').value;
    const subMuscle = document.getElementById('customExerciseSubMuscle').value.trim() || muscle;
    const description = document.getElementById('customExerciseDescription').value.trim();
    
    // Валидация
    if (!name) {
        showMessage('Введите название упражнения', 'error');
        return;
    }
    
    if (name.length > 100) {
        showMessage('Название слишком длинное (макс. 100 символов)', 'error');
        return;
    }
    
    if (description.length > 1000) {
        showMessage('Описание слишком длинное (макс. 1000 символов)', 'error');
        return;
    }
    
    // Проверка на дубликаты
    const existingExercise = exerciseLibrary.find(ex => 
        ex.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingExercise) {
        if (existingExercise.isCustom) {
            showMessage('Упражнение с таким названием уже существует', 'error');
        } else {
            showMessage('Такое упражнение уже есть в системной библиотеке', 'error');
        }
        return;
    }
    
    const exerciseData = {
        id: Date.now(),
        name: name,
        muscle: muscle,
        subMuscle: subMuscle,
        description: description || 'Пользовательское упражнение',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        isCustom: true,
        createdAt: new Date().toISOString()
    };
    
    // Добавляем в локальную библиотеку
    exerciseLibrary.push(exerciseData);
    
    // Сохраняем в базу данных
    const saved = await saveExerciseToDB(exerciseData);
    
    if (saved) {
        showMessage(`Упражнение "${name}" добавлено`, 'success');
        
        // Очищаем форму
        document.getElementById('customExerciseName').value = '';
        document.getElementById('customExerciseSubMuscle').value = '';
        document.getElementById('customExerciseDescription').value = '';
        
        // Обновляем отображение
        filterExercises();
        filterModalExercises();
        
        // Переключаемся на вкладку библиотеки
        setModalTab('library');
        
        // Добавляем опыт
        await addExperience(5);
    } else {
        // Удаляем из локальной библиотеки, если сохранение не удалось
        exerciseLibrary.pop();
        showMessage('Ошибка при сохранении упражнения', 'error');
    }
}

async function deleteCustomExercise(exerciseName) {
    const exercise = exerciseLibrary.find(ex => ex.name === exerciseName);
    if (!exercise || !exercise.isCustom) {
        showMessage('Нельзя удалить системное упражнение', 'error');
        return;
    }
    
    if (!confirm(`Удалить упражнение "${exerciseName}"?`)) return;
    
    try {
        // Удаляем из базы данных
        const deleted = await deleteExerciseFromDB(exercise.id);
        
        if (deleted) {
            // Удаляем из локальной библиотеки
            const index = exerciseLibrary.findIndex(ex => ex.name === exerciseName);
            if (index !== -1) {
                exerciseLibrary.splice(index, 1);
            }
            
            showMessage(`Упражнение "${exerciseName}" удалено`, 'success');
            filterExercises();
            filterModalExercises();
        } else {
            showMessage('Ошибка при удалении упражнения', 'error');
        }
        
    } catch (error) {
        console.error('Ошибка при удалении упражнения:', error);
        showMessage('Ошибка при удалении упражнения', 'error');
    }
}

// ========== ПРОГРАММЫ ТРЕНИРОВОК ==========
function loadTrainingPrograms() {
    const container = document.getElementById('programsList');
    
    if (trainingPrograms.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 40px 20px;">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-title">Программы не найдены</div>
                <p class="empty-state-text">Добавьте первую программу тренировок</p>
                <button class="btn btn-primary mt-3" onclick="showAddProgramModal()">
                    <span>➕</span>
                    <span>Создать программу</span>
                </button>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    trainingPrograms.forEach(program => {
        let difficultyClass = '';
        let difficultyText = '';
        
        switch (program.difficulty) {
            case 'beginner':
                difficultyClass = 'beginner';
                difficultyText = 'Для начинающих';
                break;
            case 'intermediate':
                difficultyClass = 'intermediate';
                difficultyText = 'Средний уровень';
                break;
            case 'advanced':
                difficultyClass = 'advanced';
                difficultyText = 'Продвинутый уровень';
                break;
        }
        
        html += `
            <div class="program-card" onclick="showProgramDetails(${program.id})">
                <div class="program-difficulty ${difficultyClass}">
                    ${difficultyText}
                </div>
                <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--text);">
                    ${program.name}
                </h3>
                <p style="color: var(--text-secondary); margin-bottom: 15px; line-height: 1.5;">
                    ${program.description}
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                    <div style="display: flex; gap: 15px; font-size: 0.9rem; color: var(--text-tertiary);">
                        <span title="Длительность">📅 ${program.weeks} недель</span>
                        <span title="Частота">🔄 ${program.frequency || '3-4 раза/нед'}</span>
                        <span title="Упражнений">💪 ${program.exercises.length}</span>
                    </div>
                    <button class="btn btn-sm btn-success" onclick="event.stopPropagation(); activateProgram(${program.id})">
                        <span>▶️</span>
                        <span>Активировать</span>
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function filterPrograms(category) {
    // Обновляем активный чип
    const chips = document.querySelectorAll('#programs .chip');
    chips.forEach(chip => {
        chip.classList.remove('active');
    });
    
    const activeChip = Array.from(chips).find(chip => 
        chip.textContent.includes(category === 'all' ? 'Все' : 
        category === 'beginner' ? 'начинающих' :
        category === 'strength' ? 'силу' :
        category === 'mass' ? 'массу' :
        category === 'cutting' ? 'рельеф' : 'Свои')
    );
    
    if (activeChip) {
        activeChip.classList.add('active');
    }
    
    let filtered;
    
    if (category === 'all') {
        filtered = trainingPrograms;
    } else if (category === 'custom') {
        // Фильтруем пользовательские программы
        filtered = trainingPrograms.filter(program => program.isCustom);
    } else {
        filtered = trainingPrograms.filter(program => program.type === category);
    }
    
    // Обновляем отображение
    const container = document.getElementById('programsList');
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 40px 20px;">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-title">Программы не найдены</div>
                <p class="empty-state-text">Нет программ в выбранной категории</p>
            </div>
        `;
        return;
    }
    
    // Временно заменяем тренировочные программы на отфильтрованные
    const originalPrograms = [...trainingPrograms];
    trainingPrograms = filtered;
    loadTrainingPrograms();
    trainingPrograms = originalPrograms;
}

function showProgramDetails(programId) {
    const program = trainingPrograms.find(p => p.id === programId);
    if (!program) return;
    
    let difficultyClass = '';
    let difficultyText = '';
    
    switch (program.difficulty) {
        case 'beginner':
            difficultyClass = 'beginner';
            difficultyText = 'Для начинающих';
            break;
        case 'intermediate':
            difficultyClass = 'intermediate';
            difficultyText = 'Средний уровень';
            break;
        case 'advanced':
            difficultyClass = 'advanced';
            difficultyText = 'Продвинутый уровень';
            break;
    }
    
    const modalHTML = `
        <div class="modal-overlay" id="programDetailsModal">
            <div class="modal" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 class="modal-title">${program.name}</h3>
                    <button class="modal-close" onclick="closeProgramDetailsModal()">✕</button>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <span class="program-difficulty ${difficultyClass}">
                            ${difficultyText}
                        </span>
                        <span style="display: inline-block; padding: 6px 12px; background: var(--surface-dark); 
                              color: var(--text-secondary); border-radius: 12px; font-size: 0.85rem;">
                            ${program.weeks} недель
                        </span>
                        <span style="display: inline-block; padding: 6px 12px; background: var(--surface-dark); 
                              color: var(--text-secondary); border-radius: 12px; font-size: 0.85rem;">
                            ${program.frequency || '3-4 раза/нед'}
                        </span>
                    </div>
                    
                    <p style="color: var(--text-secondary); line-height: 1.6; background: var(--surface-dark); padding: 20px; border-radius: var(--radius);">
                        ${program.description}
                    </p>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h4 style="font-size: 1rem; margin-bottom: 15px; color: var(--text);">
                        💪 Упражнения программы
                    </h4>
                    <div style="background: var(--surface-dark); border-radius: var(--radius); overflow: hidden;">
                        ${program.exercises.map((exercise, index) => `
                            <div style="padding: 15px; border-bottom: 1px solid var(--border); 
                                 ${index === program.exercises.length - 1 ? 'border-bottom: none;' : ''}">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <span style="font-weight: 600;">${index + 1}. ${exercise.name}</span>
                                        <div style="font-size: 0.85rem; color: var(--text-tertiary); margin-top: 4px;">
                                            Отдых: ${exercise.rest || '90 сек'}
                                        </div>
                                    </div>
                                    <span style="font-size: 0.9rem; color: var(--text-secondary); background: var(--surface); padding: 6px 12px; border-radius: 12px;">
                                        ${exercise.sets} × ${exercise.reps}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                ${program.notes ? `
                    <div style="margin-bottom: 25px; padding: 15px; background: var(--surface-dark); border-radius: var(--radius);">
                        <div style="font-weight: 600; margin-bottom: 8px; color: var(--text);">📝 Примечания</div>
                        <div style="color: var(--text-secondary); font-size: 0.95rem;">
                            ${program.notes}
                        </div>
                    </div>
                ` : ''}
                
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="btn btn-success" onclick="activateProgram(${program.id}); closeProgramDetailsModal();" style="flex: 2;">
                        <span>▶️</span>
                        <span>Активировать программу</span>
                    </button>
                    <button class="btn btn-secondary" onclick="closeProgramDetailsModal()" style="flex: 1;">
                        <span>Закрыть</span>
                    </button>
                </div>
                
                ${program.isCustom ? `
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border);">
                        <button class="btn btn-danger" onclick="deleteProgram(${program.id}); closeProgramDetailsModal();">
                            <span>🗑️</span>
                            <span>Удалить программу</span>
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHTML;
    document.body.appendChild(modalDiv.firstElementChild);
}

function closeProgramDetailsModal() {
    const modal = document.getElementById('programDetailsModal');
    if (modal) {
        modal.remove();
    }
}

function showAddProgramModal() {
    // TODO: Реализовать модальное окно добавления программы
    showMessage('Добавление программ тренировок скоро будет доступно', 'info');
}

function activateProgram(programId) {
    const program = trainingPrograms.find(p => p.id === programId);
    if (!program) return;
    
    // Сохраняем активную программу
    localStorage.setItem('active_program', JSON.stringify(program));
    localStorage.setItem('active_program_date', new Date().toISOString());
    
    showMessage(`✅ Программа "${program.name}" активирована!`, 'success');
    addNotification(`Активирована программа: ${program.name}. Удачи в тренировках! 💪`, 'program');
    
    // Предлагаем создать тренировку по программе
    setTimeout(() => {
        if (confirm('Хотите создать первую тренировку по этой программе?')) {
            createWorkoutFromProgram(program);
        }
    }, 2000);
}

function createWorkoutFromProgram(program) {
    showSection('workout');
    clearWorkoutForm();
    
    document.getElementById('workoutName').value = `${program.name} - Тренировка 1`;
    
    // Добавляем упражнения из программы
    const container = document.getElementById('exercisesContainer');
    container.innerHTML = '';
    
    program.exercises.forEach(exercise => {
        let sets = exercise.sets;
        let reps = exercise.reps;
        let weight = 0;
        let rest = exercise.rest ? parseInt(exercise.rest) : 90;
        
        // Обрабатываем формат "5x5"
        if (typeof exercise.sets === 'string' && exercise.sets.includes('x')) {
            const [setCount, repCount] = exercise.sets.split('x');
            sets = parseInt(setCount);
            reps = repCount === 'AMRAP' ? 'до отказа' : parseInt(repCount);
        }
        
        // Обрабатываем строковые значения
        if (typeof reps === 'string' && !reps.includes('AMRAP')) {
            const range = reps.split('-');
            if (range.length === 2) {
                reps = parseInt(range[1]); // Используем максимальное значение
            }
        }
        
        addExerciseFieldToContainer(container, {
            name: exercise.name,
            sets: sets,
            reps: typeof reps === 'number' ? reps : 10,
            weight: weight,
            rest: rest
        });
    });
    
    showMessage(`Тренировка создана по программе "${program.name}"`, 'success');
}

async function deleteProgram(programId) {
    const program = trainingPrograms.find(p => p.id === programId);
    if (!program || !program.isCustom) {
        showMessage('Нельзя удалить системную программу', 'error');
        return;
    }
    
    if (!confirm(`Удалить программу "${program.name}"?`)) return;
    
    try {
        // Удаляем из базы данных
        await dbTransaction('programs', 'readwrite', (store) => {
            store.delete(programId);
        });
        
        // Удаляем из локального массива
        const index = trainingPrograms.findIndex(p => p.id === programId);
        if (index !== -1) {
            trainingPrograms.splice(index, 1);
        }
        
        showMessage(`Программа "${program.name}" удалена`, 'success');
        loadTrainingPrograms();
        
    } catch (error) {
        console.error('Ошибка при удалении программы:', error);
        showMessage('Ошибка при удалении программы', 'error');
    }
}

// ========== БАЗА ЗНАНИЙ ==========
function loadKnowledgeBase() {
    const container = document.getElementById('knowledgeCategories');
    
    if (!container) return;
    
    // Группировка по категориям
    const categories = {};
    knowledgeBase.forEach(article => {
        if (!categories[article.category]) {
            categories[article.category] = [];
        }
        categories[article.category].push(article);
    });
    
    let html = '';
    Object.keys(categories).sort().forEach(category => {
        html += `
            <div class="knowledge-category">
                <h3 style="font-size: 1.1rem; margin-bottom: 15px; color: var(--text);">
                    ${category}
                </h3>
                ${categories[category].map(article => `
                    <div class="knowledge-item" onclick="showKnowledgeArticle(${article.id})">
                        <div class="knowledge-item-title">${article.title}</div>
                        <div class="knowledge-item-content">
                            ${article.content.substring(0, 120)}${article.content.length > 120 ? '...' : ''}
                        </div>
                        <div style="margin-top: 12px;">
                            ${article.tags.slice(0, 3).map(tag => `
                                <span style="display: inline-block; padding: 3px 10px; background: var(--surface-dark); 
                                      border-radius: 12px; font-size: 0.75rem; margin-right: 6px; color: var(--text-tertiary);">
                                    #${tag}
                                </span>
                            `).join('')}
                            ${article.tags.length > 3 ? `<span style="font-size: 0.75rem; color: var(--text-tertiary);">+${article.tags.length - 3}</span>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function filterKnowledge() {
    const searchTerm = document.getElementById('knowledgeSearch').value.toLowerCase().trim();
    const container = document.getElementById('knowledgeCategories');
    
    if (!searchTerm) {
        loadKnowledgeBase();
        return;
    }
    
    const filtered = knowledgeBase.filter(article => 
        article.title.toLowerCase().includes(searchTerm) ||
        article.content.toLowerCase().includes(searchTerm) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        article.category.toLowerCase().includes(searchTerm)
    );
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 40px 20px;">
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-title">Статьи не найдены</div>
                <p class="empty-state-text">Попробуйте другой запрос</p>
            </div>
        `;
        return;
    }
    
    let html = '<h3 style="font-size: 1.1rem; margin-bottom: 20px; color: var(--text);">🔍 Результаты поиска</h3>';
    
    filtered.forEach(article => {
        // Подсвечиваем совпадения
        let highlightedTitle = article.title;
        let highlightedContent = article.content.substring(0, 200);
        
        if (searchTerm) {
            const regex = new RegExp(searchTerm, 'gi');
            highlightedTitle = highlightedTitle.replace(regex, match => `<mark style="background: var(--primary-light); color: var(--primary); padding: 0 2px;">${match}</mark>`);
            highlightedContent = highlightedContent.replace(regex, match => `<mark style="background: var(--primary-light); color: var(--primary); padding: 0 2px;">${match}</mark>`);
        }
        
        html += `
            <div class="knowledge-item" onclick="showKnowledgeArticle(${article.id})">
                <div class="knowledge-item-title">${highlightedTitle}</div>
                <div style="font-size: 0.85rem; color: var(--text-tertiary); margin-bottom: 8px;">
                    ${article.category}
                </div>
                <div class="knowledge-item-content">
                    ${highlightedContent}${article.content.length > 200 ? '...' : ''}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    showMessage(`Найдено статей: ${filtered.length}`, 'info', 2000);
}

function showKnowledgeArticle(articleId) {
    const article = knowledgeBase.find(a => a.id === articleId);
    if (!article) return;
    
    const modalHTML = `
        <div class="modal-overlay" id="knowledgeArticleModal">
            <div class="modal" style="max-width: 600px;">
                <div class="modal-header">
                    <h3 class="modal-title">${article.title}</h3>
                    <button class="modal-close" onclick="closeKnowledgeArticleModal()">✕</button>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                        <span style="display: inline-block; padding: 6px 12px; background: var(--primary-light); 
                              color: var(--primary); border-radius: 12px; font-size: 0.85rem; font-weight: 600;">
                            ${article.category}
                        </span>
                    </div>
                    
                    <div style="line-height: 1.7; color: var(--text); background: var(--surface-dark); padding: 25px; border-radius: var(--radius);">
                        ${article.content.split('\n').map(paragraph => {
                            if (paragraph.trim().startsWith('•')) {
                                return `<ul style="margin-bottom: 15px; padding-left: 20px;"><li style="margin-bottom: 8px;">${paragraph.substring(1)}</li></ul>`;
                            } else if (paragraph.trim().startsWith('1.')) {
                                return `<ol style="margin-bottom: 15px; padding-left: 20px;"><li style="margin-bottom: 8px;">${paragraph.substring(2)}</li></ol>`;
                            } else if (paragraph.trim()) {
                                return `<p style="margin-bottom: 15px;">${paragraph}</p>`;
                            }
                            return '';
                        }).join('')}
                    </div>
                </div>
                
                ${article.tags.length > 0 ? `
                    <div style="margin-bottom: 20px; padding: 15px; background: var(--surface); border-radius: var(--radius); border: 1px solid var(--border);">
                        <div style="font-weight: 600; margin-bottom: 10px; color: var(--text);">🏷️ Теги</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${article.tags.map(tag => `
                                <span style="display: inline-block; padding: 5px 12px; background: var(--surface-dark); 
                                      border-radius: 20px; font-size: 0.85rem; color: var(--text-secondary);">
                                    #${tag}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="btn btn-primary" onclick="showSection('workout'); closeKnowledgeArticleModal();" style="flex: 2;">
                        <span>🏋️</span>
                        <span>К тренировкам</span>
                    </button>
                    <button class="btn btn-secondary" onclick="closeKnowledgeArticleModal()" style="flex: 1;">
                        <span>Закрыть</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHTML;
    document.body.appendChild(modalDiv.firstElementChild);
}

function closeKnowledgeArticleModal() {
    const modal = document.getElementById('knowledgeArticleModal');
    if (modal) {
        modal.remove();
    }
}

// ========== ГРАФИКИ И ПРОГРЕСС ==========
async function loadProgressData() {
    try {
        const workouts = await getAllWorkouts();
        if (workouts.length === 0) {
            showMessage('Нет данных для отображения графиков', 'info');
            return;
        }
        
        // Сортировка по дате
        workouts.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Подготовка данных для графиков
        const filter = document.getElementById('progressFilter').value;
        const now = new Date();
        let startDate = new Date();
        
        switch (filter) {
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case '3months':
                startDate.setMonth(now.getMonth() - 3);
                break;
            case '6months':
                startDate.setMonth(now.getMonth() - 6);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
        }
        
        const filteredWorkouts = workouts.filter(w => new Date(w.date) >= startDate);
        
        if (filteredWorkouts.length === 0) {
            showMessage('Нет данных за выбранный период', 'info');
            return;
        }
        
        // Группировка по неделям/месяцам
        const groupedData = groupWorkoutsByPeriod(filteredWorkouts, filter);
        
        // Создание графиков
        createWorkoutsChart(groupedData);
        createVolumeChart(groupedData);
        createWeightsChart(filteredWorkouts);
        
    } catch (error) {
        console.error('Ошибка загрузки данных прогресса:', error);
        showMessage('Ошибка при загрузке графиков', 'error');
    }
}

function groupWorkoutsByPeriod(workouts, period) {
    const groups = {};
    
    workouts.forEach(workout => {
        const date = new Date(workout.date);
        let key;
        
        if (period === 'month' || period === 'week') {
            // По дням
            key = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        } else {
            // По неделям
            const weekStart = getWeekStart(new Date(date));
            key = weekStart.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        }
        
        if (!groups[key]) {
            groups[key] = {
                count: 0,
                volume: 0,
                dates: []
            };
        }
        
        groups[key].count++;
        groups[key].volume += workout.volume || 0;
        groups[key].dates.push(date);
    });
    
    return groups;
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function createWorkoutsChart(data) {
    const canvas = document.getElementById('workoutsChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Уничтожаем старый график, если есть
    if (charts.workoutsChart) {
        charts.workoutsChart.destroy();
    }
    
    const labels = Object.keys(data);
    const counts = Object.values(data).map(d => d.count);
    
    charts.workoutsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Количество тренировок',
                data: counts,
                borderColor: 'var(--primary)',
                backgroundColor: 'var(--primary-light)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'var(--primary)',
                pointBorderColor: 'var(--surface)',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'var(--surface)',
                    titleColor: 'var(--text)',
                    bodyColor: 'var(--text-secondary)',
                    borderColor: 'var(--border)',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: 'var(--text-secondary)'
                    },
                    grid: {
                        color: 'var(--border)'
                    }
                },
                x: {
                    grid: {
                        color: 'var(--border)'
                    },
                    ticks: {
                        color: 'var(--text-secondary)',
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

function createVolumeChart(data) {
    const canvas = document.getElementById('volumeChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (charts.volumeChart) {
        charts.volumeChart.destroy();
    }
    
    const labels = Object.keys(data);
    const volumes = Object.values(data).map(d => d.volume);
    
    charts.volumeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Тоннаж (кг)',
                data: volumes,
                backgroundColor: 'var(--success)',
                borderColor: 'var(--success-dark)',
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: 0.7,
                categoryPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'var(--surface)',
                    titleColor: 'var(--text)',
                    bodyColor: 'var(--text-secondary)',
                    borderColor: 'var(--border)',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'var(--text-secondary)'
                    },
                    grid: {
                        color: 'var(--border)'
                    }
                },
                x: {
                    grid: {
                        color: 'var(--border)'
                    },
                    ticks: {
                        color: 'var(--text-secondary)',
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

function createWeightsChart(workouts) {
    const canvas = document.getElementById('weightsChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (charts.weightsChart) {
        charts.weightsChart.destroy();
    }
    
    // Собираем веса по упражнениям
    const weightData = {};
    
    workouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
            if (exercise.weight > 0) {
                if (!weightData[exercise.name]) {
                    weightData[exercise.name] = [];
                }
                weightData[exercise.name].push({
                    date: new Date(workout.date),
                    weight: exercise.weight
                });
            }
        });
    });
    
    // Берем 3 самых популярных упражнения
    const topExercises = Object.keys(weightData)
        .sort((a, b) => weightData[b].length - weightData[a].length)
        .slice(0, 3);
    
    if (topExercises.length === 0) {
        // Нет данных о весах
        const parent = canvas.parentElement;
        parent.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">Нет данных о прогрессе весов</div>';
        return;
    }
    
    const colors = ['var(--warning)', 'var(--danger)', 'var(--info)'];
    const datasets = topExercises.map((exercise, index) => {
        const data = weightData[exercise].map(d => ({
            x: d.date,
            y: d.weight
        }));
        
        // Сортируем по дате
        data.sort((a, b) => a.x - b.x);
        
        return {
            label: exercise,
            data: data,
            borderColor: colors[index],
            backgroundColor: colors[index] + '20',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointBackgroundColor: colors[index],
            pointBorderColor: 'var(--surface)',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
        };
    });
    
    charts.weightsChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    backgroundColor: 'var(--surface)',
                    titleColor: 'var(--text)',
                    bodyColor: 'var(--text-secondary)',
                    borderColor: 'var(--border)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'dd.MM'
                        }
                    },
                    grid: {
                        color: 'var(--border)'
                    },
                    ticks: {
                        color: 'var(--text-secondary)'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Вес (кг)',
                        color: 'var(--text-secondary)'
                    },
                    grid: {
                        color: 'var(--border)'
                    },
                    ticks: {
                        color: 'var(--text-secondary)'
                    }
                }
            }
        }
    });
}

async function updateComparison() {
    try {
        const workouts = await getAllWorkouts();
        if (workouts.length < 2) {
            const container = document.getElementById('comparisonContainer');
            if (container) {
                container.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-secondary);">Недостаточно данных для сравнения</div>';
            }
            return;
        }
        
        // Сортируем по дате
        workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const latestWorkout = workouts[0];
        const previousWorkout = workouts[1];
        
        let comparisonHTML = '';
        
        // Сравнение по общему тоннажу
        const volumeDiff = latestWorkout.volume - previousWorkout.volume;
        comparisonHTML += createComparisonItem(
            'Общий тоннаж',
            `${latestWorkout.volume} кг`,
            `${previousWorkout.volume} кг`,
            volumeDiff,
            'кг'
        );
        
        // Сравнение по количеству упражнений
        const exercisesDiff = latestWorkout.exercises.length - previousWorkout.exercises.length;
        comparisonHTML += createComparisonItem(
            'Количество упражнений',
            latestWorkout.exercises.length,
            previousWorkout.exercises.length,
            exercisesDiff,
            ''
        );
        
        // Сравнение по среднему весу
        const latestAvg = calculateAverageWeight(latestWorkout);
        const previousAvg = calculateAverageWeight(previousWorkout);
        const avgDiff = latestAvg - previousAvg;
        
        comparisonHTML += createComparisonItem(
            'Средний вес',
            `${latestAvg.toFixed(1)} кг`,
            `${previousAvg.toFixed(1)} кг`,
            avgDiff,
            'кг'
        );
        
        // Сравнение по времени тренировки
        const latestDuration = calculateWorkoutDuration(latestWorkout);
        const previousDuration = calculateWorkoutDuration(previousWorkout);
        if (latestDuration && previousDuration) {
            const durationDiff = latestDuration - previousDuration;
            comparisonHTML += createComparisonItem(
                'Длительность',
                `${formatDuration(latestDuration)}`,
                `${formatDuration(previousDuration)}`,
                durationDiff,
                ' мин'
            );
        }
        
        const container = document.getElementById('comparisonContainer');
        if (container) {
            container.innerHTML = comparisonHTML;
        }
        
    } catch (error) {
        console.error('Ошибка обновления сравнения:', error);
    }
}

function calculateAverageWeight(workout) {
    const exercisesWithWeight = workout.exercises.filter(ex => ex.weight > 0);
    if (exercisesWithWeight.length === 0) return 0;
    
    const totalWeight = exercisesWithWeight.reduce((sum, ex) => sum + ex.weight, 0);
    return totalWeight / exercisesWithWeight.length;
}

function calculateWorkoutDuration(workout) {
    // Приблизительная длительность: (подходы * (повторения * 3с + отдых))
    let totalSeconds = 0;
    
    workout.exercises.forEach(ex => {
        const sets = parseInt(ex.sets) || 3;
        const reps = parseInt(ex.reps) || 10;
        const rest = parseInt(ex.rest) || 90;
        
        totalSeconds += sets * (reps * 3 + rest);
    });
    
    return Math.round(totalSeconds / 60); // Минуты
}

function formatDuration(minutes) {
    if (minutes < 60) {
        return `${minutes} мин`;
    } else {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours} ч ${mins} мин`;
    }
}

function createComparisonItem(label, current, previous, diff, unit) {
    let badgeClass = 'comparison-neutral';
    let diffText = '';
    let diffSign = '';
    
    if (diff > 0) {
        badgeClass = 'comparison-positive';
        diffSign = '+';
        diffText = `${diffSign}${diff}${unit}`;
    } else if (diff < 0) {
        badgeClass = 'comparison-negative';
        diffText = `${diff}${unit}`;
    } else {
        diffText = `±0${unit}`;
    }
    
    // Процентное изменение
    let percentChange = '';
    if (diff !== 0) {
        const base = parseFloat(previous) || 1;
        const percent = (diff / base) * 100;
        percentChange = ` (${percent > 0 ? '+' : ''}${percent.toFixed(1)}%)`;
    }
    
    return `
        <div class="comparison-item">
            <div>
                <div style="font-weight: 600; margin-bottom: 5px;">${label}</div>
                <div style="font-size: 0.9rem; color: var(--text-secondary);">
                    Текущая: ${current} • Прошлая: ${previous}
                </div>
            </div>
            <div class="comparison-badge ${badgeClass}">
                ${diffText}${percentChange}
            </div>
        </div>
    `;
}

function updateProgressCharts() {
    loadProgressData();
}

// ========== СТАТИСТИКА ==========
async function updateAllStats() {
    try {
        const workouts = await getAllWorkouts();
        
        const totalWorkouts = workouts.length;
        document.getElementById('totalWorkouts').textContent = totalWorkouts;
        
        const streak = calculateStreak(workouts);
        document.getElementById('workoutStreak').textContent = streak;
        
        const totalVolume = workouts.reduce((sum, w) => sum + (w.volume || 0), 0);
        document.getElementById('totalVolume').textContent = totalVolume.toFixed(0);
        
        let avgWeight = 0;
        if (workouts.length > 0) {
            const allWeights = workouts.flatMap(w => 
                w.exercises.filter(ex => ex.weight > 0).map(ex => ex.weight)
            );
            if (allWeights.length > 0) {
                avgWeight = Math.round(allWeights.reduce((a, b) => a + b, 0) / allWeights.length);
            }
        }
        document.getElementById('avgWeight').textContent = avgWeight;
        
        // Обновляем профиль пользователя
        userProfile.stats.totalWorkouts = totalWorkouts;
        userProfile.stats.totalVolume = totalVolume;
        userProfile.stats.longestStreak = Math.max(userProfile.stats.longestStreak || 0, streak);
        
    } catch (error) {
        console.error('Ошибка обновления статистики:', error);
    }
}

function calculateStreak(workouts) {
    if (workouts.length === 0) return 0;
    
    const sortedDates = workouts
        .map(w => new Date(w.date))
        .sort((a, b) => b - a);
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let checkDate = new Date(today);
    let foundToday = false;
    
    // Проверяем, есть ли тренировка сегодня
    const todayWorkout = sortedDates.find(date => {
        date.setHours(0, 0, 0, 0);
        return date.getTime() === today.getTime();
    });
    
    if (todayWorkout) {
        streak = 1;
        foundToday = true;
        checkDate = new Date(today);
    } else {
        // Проверяем вчера
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const yesterdayWorkout = sortedDates.find(date => {
            date.setHours(0, 0, 0, 0);
            return date.getTime() === yesterday.getTime();
        });
        
        if (yesterdayWorkout) {
            streak = 1;
            checkDate = new Date(yesterday);
        } else {
            return 0;
        }
    }
    
    // Считаем непрерывную серию
    for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        currentDate.setHours(0, 0, 0, 0);
        
        checkDate.setDate(checkDate.getDate() - 1);
        
        if (currentDate.getTime() === checkDate.getTime()) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

function showStreakInfo() {
    showMessage('🔥 Дни подряд: это количество тренировок без перерыва в календарные дни', 'info', 5000);
}

function showVolumeInfo() {
    showMessage('🏋️ Общий тоннаж = сумма весов во всех подходах (количество подходов × повторения × вес)', 'info', 5000);
}

function showWeightInfo() {
    showMessage('⚖️ Средний вес = среднее арифметическое значение весов во всех упражнениях', 'info', 5000);
}

// ========== ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ ==========
function displayProfileContent() {
    const container = document.getElementById('profileContent');
    
    const levelPercentage = (userProfile.experience / userProfile.experienceToNextLevel) * 100;
    const nextLevelExp = userProfile.experienceToNextLevel - userProfile.experience;
    
    container.innerHTML = `
        <div class="form-group">
            <label class="form-label">👤 Имя</label>
            <input type="text" class="form-input" id="profileName" 
                   value="${userProfile.name}" maxlength="30" placeholder="Ваше имя">
        </div>
        
        <div class="card" style="margin-bottom: 20px;">
            <h3 style="font-size: 1.1rem; margin-bottom: 15px; color: var(--text);">🏆 Уровень и опыт</h3>
            <div style="text-align: center; margin-bottom: 15px;">
                <div class="profile-avatar" style="width: 80px; height: 80px; font-size: 2.5rem; margin: 0 auto 15px;">
                    ${userProfile.avatar}
                </div>
                <div style="font-size: 1.8rem; font-weight: 800; color: var(--primary);">
                    Уровень ${userProfile.level}
                </div>
                <div style="color: var(--text-secondary); margin-top: 5px;">
                    ${userProfile.experience} / ${userProfile.experienceToNextLevel} опыта
                </div>
            </div>
            
            <div class="level-bar">
                <div class="level-fill" style="width: ${levelPercentage}%"></div>
            </div>
            
            <div style="text-align: center; margin-top: 15px; font-size: 0.9rem; color: var(--text-tertiary);">
                До следующего уровня: ${nextLevelExp} опыта
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">🎯 Выбор аватара</label>
            <div class="avatar-grid">
                ${availableAvatars.map(avatar => `
                    <div class="avatar-option ${avatar === userProfile.avatar ? 'selected' : ''}" 
                         onclick="selectAvatar('${avatar}')">
                        ${avatar}
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="card" style="margin-bottom: 20px;">
            <h3 style="font-size: 1.1rem; margin-bottom: 15px; color: var(--text);">📊 Статистика</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                <div style="background: var(--surface-dark); padding: 12px; border-radius: var(--radius);">
                    <div style="font-size: 0.85rem; color: var(--text-tertiary);">Всего тренировок</div>
                    <div style="font-size: 1.3rem; font-weight: 700; color: var(--primary);">
                        ${userProfile.stats.totalWorkouts || 0}
                    </div>
                </div>
                <div style="background: var(--surface-dark); padding: 12px; border-radius: var(--radius);">
                    <div style="font-size: 0.85rem; color: var(--text-tertiary);">Общий тоннаж</div>
                    <div style="font-size: 1.3rem; font-weight: 700; color: var(--success);">
                        ${(userProfile.stats.totalVolume || 0).toFixed(0)} кг
                    </div>
                </div>
                <div style="background: var(--surface-dark); padding: 12px; border-radius: var(--radius);">
                    <div style="font-size: 0.85rem; color: var(--text-tertiary);">Макс. серия</div>
                    <div style="font-size: 1.3rem; font-weight: 700; color: var(--warning);">
                        ${userProfile.stats.longestStreak || 0} дней
                    </div>
                </div>
                <div style="background: var(--surface-dark); padding: 12px; border-radius: var(--radius);">
                    <div style="font-size: 0.85rem; color: var(--text-tertiary);">Дата регистрации</div>
                    <div style="font-size: 0.9rem; font-weight: 600; color: var(--text);">
                        ${userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('ru-RU') : 'Н/Д'}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">🎯 Цели тренировок</label>
            <div class="input-row">
                <input type="number" class="form-input" id="weeklyGoal" 
                       placeholder="Тренировок в неделю" 
                       value="${userProfile.goals.weeklyWorkouts || ''}"
                       min="1" max="7">
            </div>
            <div class="input-row">
                <input type="number" class="form-input" id="targetWeight" 
                       placeholder="Целевой вес (кг)" 
                       value="${userProfile.goals.targetWeight || ''}"
                       min="1" max="200" step="0.5">
                <input type="date" class="form-input" id="targetDate" 
                       value="${userProfile.goals.targetDate || ''}">
            </div>
        </div>
        
        <button class="btn btn-success" onclick="saveProfileChanges()">
            <span>💾</span>
            <span>Сохранить изменения</span>
        </button>
        
        <button class="btn btn-info" onclick="resetProfile()" style="margin-top: 10px;">
            <span>🔄</span>
            <span>Сбросить прогресс</span>
        </button>
    `;
}

function selectAvatar(avatar) {
    userProfile.avatar = avatar;
    
    // Обновляем отображение
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    if (event && event.target) {
        event.target.classList.add('selected');
    }
    
    updateHeaderProfile();
}

async function saveProfileChanges() {
    const name = document.getElementById('profileName').value.trim();
    const weeklyGoal = parseInt(document.getElementById('weeklyGoal').value) || 3;
    const targetWeight = document.getElementById('targetWeight').value;
    const targetDate = document.getElementById('targetDate').value;
    
    if (!name) {
        showMessage('Введите имя', 'error');
        return;
    }
    
    userProfile.name = name;
    userProfile.goals = {
        weeklyWorkouts: Math.min(Math.max(weeklyGoal, 1), 7),
        targetWeight: targetWeight ? parseFloat(targetWeight) : null,
        targetDate: targetDate || null
    };
    
    const saved = await saveUserProfileToDB();
    
    if (saved) {
        closeModal('profileModal');
        updateHeaderProfile();
        updateGreeting();
        showMessage('Профиль сохранен', 'success');
    } else {
        showMessage('Ошибка сохранения профиля', 'error');
    }
}

async function addExperience(amount) {
    userProfile.experience += amount;
    let leveledUp = false;
    
    // Проверка уровня
    while (userProfile.experience >= userProfile.experienceToNextLevel) {
        userProfile.experience -= userProfile.experienceToNextLevel;
        userProfile.level++;
        userProfile.experienceToNextLevel = Math.round(userProfile.experienceToNextLevel * 1.3);
        leveledUp = true;
    }
    
    await saveUserProfileToDB();
    
    // Показываем уведомление о новом уровне
    if (leveledUp) {
        showMessage(`🎉 Поздравляем! Вы достигли ${userProfile.level} уровня!`, 'success', 7000);
        await addNotification(`🎉 Достигнут ${userProfile.level} уровень! Продолжайте в том же духе!`, 'achievement');
        
        // Вибрация для достижения
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
    }
}

function resetProfile() {
    if (confirm('Сбросить прогресс и опыт? Это действие нельзя отменить.')) {
        userProfile.level = 1;
        userProfile.experience = 0;
        userProfile.experienceToNextLevel = 100;
        userProfile.stats = {
            totalWorkouts: 0,
            totalVolume: 0,
            longestStreak: 0
        };
        
        saveUserProfileToDB();
        showMessage('Прогресс сброшен', 'success');
        displayProfileContent();
        updateAllStats();
    }
}

// ========== РЕЖИМ ДЛЯ НОВИЧКОВ ==========
function initSimpleMode() {
    updateSimpleModeToggle();
    applySimpleMode();
}

function toggleSimpleMode() {
    simpleMode = !simpleMode;
    saveSimpleModeToDB();
    applySimpleMode();
    updateSimpleModeToggle();
    
    showMessage(`Простой режим ${simpleMode ? 'включен' : 'выключен'}`, 'success', 3000);
}

function updateSimpleModeToggle() {
    const toggle = document.getElementById('simpleModeToggle');
    if (toggle) {
        toggle.checked = simpleMode;
    }
}

function applySimpleMode() {
    if (simpleMode) {
        document.body.classList.add('simple-mode');
        
        // Скрываем сложные табы
        const complexTabs = ['progress', 'programs', 'trainer', 'library', 'knowledge'];
        complexTabs.forEach(tabId => {
            const tabElement = document.querySelector(`[onclick="showSection('${tabId}')"]`);
            if (tabElement) {
                tabElement.style.display = 'none';
            }
        });
        
        // Скрываем сложные элементы
        document.querySelectorAll('.complex-feature, .chart-container, .calendar, .trainer-tool').forEach(el => {
            el.style.display = 'none';
        });
        
        // Упрощаем текст
        document.querySelectorAll('.card p, .exercise-detail, .stat-label').forEach(el => {
            el.style.fontSize = '0.9rem';
        });
        
    } else {
        document.body.classList.remove('simple-mode');
        
        // Показываем все табы
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.style.display = 'flex';
        });
        
        // Показываем все элементы
        document.querySelectorAll('.chart-container, .calendar, .trainer-tool').forEach(el => {
            el.style.display = '';
        });
        
        // Восстанавливаем размеры
        document.querySelectorAll('.card p, .exercise-detail, .stat-label').forEach(el => {
            el.style.fontSize = '';
        });
    }
}

// ========== АДМИН ПАНЕЛЬ ==========
function initAdminAccess() {
    tapCount = 0;
    lastTapTime = 0;
}

function checkAdminAccess() {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastTapTime;
    
    if (timeDiff > 1000) {
        tapCount = 1;
    } else {
        tapCount++;
    }
    
    lastTapTime = currentTime;
    
    if (tapCount === 5) {
        showAdminPanel();
        tapCount = 0;
        
        // Вибрация для подтверждения
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
    }
}

function showAdminPanel() {
    showModal('adminPanel');
    showAdminTab('exercises');
}

function showAdminTab(tabName) {
    // Скрываем все табы
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Убираем активный класс со всех кнопок
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Показываем выбранный таб
    const tabElement = document.getElementById(`admin${capitalizeFirst(tabName)}`);
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    // Активируем кнопку
    const button = document.querySelector(`[onclick="showAdminTab('${tabName}')"]`);
    if (button) {
        button.classList.add('active');
    }
    
    // Загружаем данные для таба
    switch (tabName) {
        case 'exercises':
            loadAdminExercises();
            break;
        case 'programs':
            loadAdminPrograms();
            break;
        case 'knowledge':
            loadAdminKnowledge();
            break;
    }
}

function loadAdminExercises() {
    const container = document.getElementById('adminExercisesList');
    container.innerHTML = exerciseLibrary.map((ex, index) => `
        <div class="exercise-item" style="margin-bottom: 10px;">
            <div class="exercise-info">
                <div class="exercise-name">${ex.name}</div>
                <div class="exercise-details">
                    <div class="exercise-detail">${ex.muscle}</div>
                    <div class="exercise-detail">${ex.subMuscle}</div>
                    <div class="exercise-detail">${ex.isCustom ? '👤 Пользовательское' : '⚙️ Системное'}</div>
                </div>
            </div>
            <div class="exercise-actions">
                ${ex.isCustom ? `
                    <button class="btn btn-sm btn-icon btn-danger" 
                            onclick="adminDeleteExercise(${ex.id}, '${ex.name.replace(/'/g, "\\'")}')"
                            title="Удалить">
                        🗑️
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function loadAdminPrograms() {
    const container = document.getElementById('adminPrograms');
    // TODO: Реализовать загрузку программ в админ-панели
    container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">Управление программами тренировок в разработке</div>';
}

function loadAdminKnowledge() {
    const container = document.getElementById('adminKnowledge');
    // TODO: Реализовать загрузку статей в админ-панели
    container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">Управление базой знаний в разработке</div>';
}

async function adminAddExercise() {
    const name = document.getElementById('adminExerciseName').value.trim();
    const muscle = document.getElementById('adminExerciseMuscle').value;
    const subMuscle = document.getElementById('adminExerciseSubMuscle').value.trim() || muscle;
    const description = document.getElementById('adminExerciseDescription').value.trim();
    const image = document.getElementById('adminExerciseImage').value.trim() || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop';
    
    if (!name) {
        showMessage('Введите название упражнения', 'error');
        return;
    }
    
    // Проверка на дубликаты
    if (exerciseLibrary.some(ex => ex.name.toLowerCase() === name.toLowerCase())) {
        showMessage('Упражнение с таким названием уже существует', 'error');
        return;
    }
    
    const exerciseData = {
        id: Date.now(),
        name: name,
        muscle: muscle,
        subMuscle: subMuscle,
        description: description || 'Добавлено через админ-панель',
        image: image,
        isCustom: true,
        createdAt: new Date().toISOString()
    };
    
    // Добавляем в локальную библиотеку
    exerciseLibrary.push(exerciseData);
    
    // Сохраняем в базу данных
    const saved = await saveExerciseToDB(exerciseData);
    
    if (saved) {
        showMessage(`Упражнение "${name}" добавлено`, 'success');
        
        // Очищаем форму
        document.getElementById('adminExerciseName').value = '';
        document.getElementById('adminExerciseSubMuscle').value = '';
        document.getElementById('adminExerciseDescription').value = '';
        document.getElementById('adminExerciseImage').value = '';
        
        // Обновляем список
        loadAdminExercises();
        
    } else {
        // Удаляем из локальной библиотеки, если сохранение не удалось
        exerciseLibrary.pop();
        showMessage('Ошибка при добавлении упражнения', 'error');
    }
}

async function adminDeleteExercise(exerciseId, exerciseName) {
    if (!confirm(`Удалить упражнение "${exerciseName}"?`)) return;
    
    const exercise = exerciseLibrary.find(ex => ex.id === exerciseId);
    if (!exercise || !exercise.isCustom) {
        showMessage('Нельзя удалить системное упражнение', 'error');
        return;
    }
    
    const deleted = await deleteExerciseFromDB(exerciseId);
    
    if (deleted) {
        // Удаляем из локальной библиотеки
        const index = exerciseLibrary.findIndex(ex => ex.id === exerciseId);
        if (index !== -1) {
            exerciseLibrary.splice(index, 1);
        }
        
        loadAdminExercises();
        showMessage(`Упражнение "${exerciseName}" удалено`, 'success');
        
    } else {
        showMessage('Ошибка при удалении упражнения', 'error');
    }
}

function adminAddProgram() {
    showMessage('Добавление программ через админ-панель в разработке', 'info');
}

function adminAddArticle() {
    showMessage('Добавление статей через админ-панель в разработке', 'info');
}

async function adminExportData() {
    try {
        showMessage('Подготовка данных для экспорта...', 'info');
        
        // Собираем все данные
        const workouts = await getAllWorkouts();
        
        const data = {
            appInfo: {
                name: 'FitApp v2.0',
                exportDate: new Date().toISOString(),
                version: '2.0.0',
                user: userProfile.name
            },
            profile: userProfile,
            workouts: workouts,
            exercises: exerciseLibrary,
            programs: trainingPrograms,
            knowledge: knowledgeBase,
            settings: {
                theme: themeSettings,
                schedule: scheduleDays,
                trackerGoals: trackerGoals,
                simpleMode: simpleMode
            },
            statistics: {
                totalWorkouts: workouts.length,
                totalVolume: workouts.reduce((sum, w) => sum + (w.volume || 0), 0),
                totalExercises: exerciseLibrary.length,
                totalPrograms: trainingPrograms.length,
                totalArticles: knowledgeBase.length
            }
        };
        
        // Экспорт в JSON
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `fitapp_export_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showMessage('Данные экспортированы в JSON', 'success');
        
    } catch (error) {
        console.error('Ошибка экспорта данных:', error);
        showMessage('Ошибка при экспорте данных', 'error');
    }
}

function adminExportJSON() {
    adminExportData();
}

function adminImportData() {
    showMessage('Импорт данных в разработке', 'info');
}

// ========== WORD ЭКСПОРТ/ИМПОРТ ==========
function exportDataToWord() {
    showMessage('Экспорт в Word будет доступен в следующем обновлении', 'info');
}

function importDataFromWord() {
    showMessage('Импорт из Word будет доступен в следующем обновлении', 'info');
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function showExerciseSuggestions(input) {
    // Автокомплит уже реализован в handleExerciseInput
    const exerciseId = input.dataset.exerciseId;
    if (exerciseId) {
        handleExerciseInput(input, exerciseId);
    }
}

function quickAddWorkout() {
    showSection('workout');
    clearWorkoutForm();
    
    const popularExercises = [
        { name: "Жим штанги лежа", sets: 3, reps: 8, weight: 0 },
        { name: "Приседания со штангой", sets: 3, reps: 8, weight: 0 },
        { name: "Тяга штанги в наклоне", sets: 3, reps: 8, weight: 0 }
    ];
    
    popularExercises.forEach(ex => {
        const container = document.getElementById('exercisesContainer');
        addExerciseFieldToContainer(container, ex);
    });
    
    document.getElementById('workoutName').value = 'Быстрая тренировка';
    showMessage('⚡ Быстрая тренировка создана', 'success');
}

function loadFromTemplate() {
    // TODO: Загрузка из шаблонов
    showMessage('Шаблоны тренировок скоро будут добавлены', 'info');
}

function saveAsTemplate() {
    // TODO: Сохранение как шаблон
    showMessage('Сохранение шаблонов скоро будет добавлено', 'info');
}

function toggleInfoContent(type) {
    const content = document.getElementById(`${type}Content`);
    if (content) {
        if (content.style.display === 'none' || !content.style.display) {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    }
}

async function sendFeedback() {
    const type = document.getElementById('feedbackType').value;
    const message = document.getElementById('feedbackMessage').value.trim();
    
    if (!message) {
        showMessage('Введите сообщение', 'error');
        document.getElementById('feedbackMessage').focus();
        return;
    }
    
    if (message.length > 5000) {
        showMessage('Сообщение слишком длинное (макс. 5000 символов)', 'error');
        return;
    }
    
    const feedback = {
        type: type,
        message: message,
        date: new Date().toISOString(),
        userAgent: navigator.userAgent,
        appVersion: 'FitApp v2.0'
    };
    
    try {
        await saveFeedbackToDB(feedback);
        
        showMessage('✅ Спасибо за обратную связь!', 'success');
        document.getElementById('feedbackMessage').value = '';
        
        // Добавляем уведомление
        await addNotification('Ваш отзыв получен. Спасибо! 🙏', 'feedback');
        
        console.log('Feedback saved:', feedback);
        
    } catch (error) {
        console.error('Ошибка при отправке отзыва:', error);
        showMessage('Ошибка при отправке отзыва', 'error');
    }
}

function showWorkoutDetails(workoutId) {
    showEditWorkoutModal(workoutId);
}

async function loadWorkoutForEditing(workoutId) {
    try {
        await dbTransaction('workouts', 'readonly', (store) => {
            const request = store.get(workoutId);
            
            request.onsuccess = () => {
                const workout = request.result;
                if (workout) {
                    displayWorkoutForEditing(workout);
                } else {
                    showMessage('Тренировка не найдена', 'error');
                    closeModal('editWorkoutModal');
                }
            };
            
            request.onerror = () => {
                console.error('Ошибка загрузки тренировки:', request.error);
                showMessage('Ошибка загрузки тренировки', 'error');
                closeModal('editWorkoutModal');
            };
        });
    } catch (error) {
        console.error('Ошибка загрузки тренировки:', error);
        showMessage('Ошибка загрузки тренировки', 'error');
        closeModal('editWorkoutModal');
    }
}

function displayWorkoutForEditing(workout) {
    const container = document.getElementById('editWorkoutContent');
    const date = new Date(workout.date);
    
    container.innerHTML = `
        <div class="form-group">
            <label class="form-label">🏷️ Название тренировки</label>
            <input type="text" class="form-input" id="editWorkoutName" 
                   value="${workout.name.replace(/"/g, '&quot;')}" maxlength="50">
        </div>
        
        <div class="form-group">
            <label class="form-label">📅 Дата и время</label>
            <input type="datetime-local" class="form-input" id="editWorkoutDateTime" 
                   value="${date.toISOString().slice(0, 16)}">
        </div>
        
        <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <label class="form-label">💪 Упражнения</label>
                <button class="btn btn-sm btn-success" onclick="addExerciseToEdit()">
                    <span>➕</span>
                    <span>Добавить</span>
                </button>
            </div>
            <div id="editExercisesContainer">
                ${workout.exercises.map((exercise, index) => `
                    <div class="exercise-item" id="edit_exercise_${index}">
                        <div class="exercise-info">
                            <input type="text" class="form-input" 
                                   value="${exercise.name.replace(/"/g, '&quot;')}"
                                   oninput="updateEditExercise(${index}, 'name', this.value)"
                                   placeholder="Название упражнения">
                            <div class="exercise-details" style="margin-top: 15px;">
                                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                    <input type="number" class="form-input" style="width: 90px;" 
                                           value="${exercise.sets}" min="1" max="20"
                                           oninput="updateEditExercise(${index}, 'sets', this.value)"
                                           placeholder="Подходы">
                                    <span style="display: flex; align-items: center;">×</span>
                                    <input type="number" class="form-input" style="width: 90px;" 
                                           value="${exercise.reps}" min="1" max="100"
                                           oninput="updateEditExercise(${index}, 'reps', this.value)"
                                           placeholder="Повторы">
                                    <input type="number" class="form-input" style="width: 100px;" 
                                           value="${exercise.weight}" min="0" max="500" step="0.5"
                                           oninput="updateEditExercise(${index}, 'weight', this.value)"
                                           placeholder="Вес">
                                    <span style="display: flex; align-items: center;">кг</span>
                                </div>
                                <input type="text" class="form-input" style="margin-top: 10px;"
                                       value="${exercise.note || ''}"
                                       oninput="updateEditExercise(${index}, 'note', this.value)"
                                       placeholder="Примечание (опционально)">
                            </div>
                        </div>
                        <div class="exercise-actions">
                            <button class="btn btn-sm btn-icon btn-danger" 
                                    onclick="removeEditExercise(${index})"
                                    title="Удалить">
                                🗑️
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="form-group">
            <label class="form-label">📝 Заметки</label>
            <textarea class="form-input" id="editWorkoutNotes" 
                      rows="3" style="resize: vertical;">${workout.notes || ''}</textarea>
        </div>
        
        <button class="btn btn-success" onclick="updateWorkout()">
            <span>💾</span>
            <span>Сохранить изменения</span>
        </button>
        
        <button class="btn btn-danger" onclick="deleteWorkout(${workout.id})" style="margin-top: 10px;">
            <span>🗑️</span>
            <span>Удалить тренировку</span>
        </button>
    `;
    
    // Сохраняем данные для редактирования
    window.editWorkoutData = workout;
    window.editExercises = workout.exercises.map(ex => ({ ...ex }));
}

async function updateWorkout() {
    const name = document.getElementById('editWorkoutName').value.trim();
    const dateTime = document.getElementById('editWorkoutDateTime').value;
    const notes = document.getElementById('editWorkoutNotes').value.trim();
    
    if (!name) {
        showMessage('Введите название тренировки', 'error');
        return;
    }
    
    if (!window.editExercises || window.editExercises.length === 0) {
        showMessage('Добавьте хотя бы одно упражнение', 'error');
        return;
    }
    
    // Валидация упражнений
    let hasErrors = false;
    window.editExercises.forEach((ex, index) => {
        if (!ex.name || ex.name.trim() === '') {
            showMessage(`Введите название упражнения ${index + 1}`, 'error');
            hasErrors = true;
        }
    });
    
    if (hasErrors) return;
    
    const workoutDate = new Date(dateTime);
    const totalVolume = window.editExercises.reduce((sum, ex) => {
        const sets = parseInt(ex.sets) || 3;
        const reps = parseInt(ex.reps) || 10;
        const weight = parseFloat(ex.weight) || 0;
        return sum + (sets * reps * weight);
    }, 0);
    
    const workoutData = {
        ...window.editWorkoutData,
        name: name,
        date: workoutDate.toISOString(),
        dateDisplay: workoutDate.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        month: `${workoutDate.getFullYear()}-${(workoutDate.getMonth() + 1).toString().padStart(2, '0')}`,
        day: workoutDate.toDateString(),
        exercises: window.editExercises,
        notes: notes,
        volume: totalVolume,
        updatedAt: new Date().toISOString()
    };
    
    try {
        await updateWorkoutInDB(window.editWorkoutData.id, workoutData);
        
        showMessage('✅ Тренировка обновлена', 'success');
        closeModal('editWorkoutModal');
        loadWorkoutHistory();
        updateAllStats();
        loadRecentWorkouts();
        updateProgressCharts();
        updateComparison();
        
    } catch (error) {
        console.error('Ошибка при обновлении тренировки:', error);
        showMessage('Ошибка при обновлении тренировки', 'error');
    }
}

async function deleteWorkout(workoutId) {
    if (!confirm('Удалить эту тренировку?')) return;
    
    try {
        await deleteWorkoutFromDB(workoutId);
        
        showMessage('✅ Тренировка удалена', 'success');
        
        if (editingWorkoutId === workoutId) {
            closeModal('editWorkoutModal');
        }
        
        loadWorkoutHistory();
        updateAllStats();
        loadRecentWorkouts();
        updateProgressCharts();
        updateComparison();
        
    } catch (error) {
        console.error('Ошибка при удалении тренировки:', error);
        showMessage('Ошибка при удалении тренировки', 'error');
    }
}

async function loadRecentWorkouts() {
    try {
        const workouts = await getAllWorkouts();
        const recent = workouts
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);
        
        const container = document.getElementById('recentWorkouts');
        
        if (recent.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <div class="empty-state-title">Нет тренировок</div>
                    <p class="empty-state-text">Начните свою первую тренировку!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = recent.map(workout => `
            <div class="exercise-item" onclick="showWorkoutDetails(${workout.id})">
                <div class="exercise-info">
                    <div class="exercise-name">${workout.name}</div>
                    <div class="exercise-details">
                        <div class="exercise-detail">
                            <span>${formatWorkoutDate(workout.date)}</span>
                        </div>
                        <div class="exercise-detail">
                            <span>${workout.exercises.length}</span>
                            <span>упражнений</span>
                        </div>
                        <div class="exercise-detail">
                            <span>${workout.volume || 0}</span>
                            <span>кг</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Ошибка загрузки последних тренировок:', error);
    }
}

async function loadUpcomingWorkouts() {
    try {
        const workouts = await getAllWorkouts();
        const now = new Date();
        
        // Сортируем по дате (сначала будущие)
        const upcoming = workouts
            .filter(w => new Date(w.date) > now)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5);
        
        const container = document.getElementById('upcomingWorkouts');
        
        if (upcoming.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 40px 20px;">
                    <div class="empty-state-icon">📅</div>
                    <div class="empty-state-title">Нет предстоящих тренировок</div>
                    <p class="empty-state-text">Запланируйте следующую тренировку</p>
                    <button class="btn btn-primary mt-3" onclick="showSection('workout')">
                        <span>➕</span>
                        <span>Создать тренировку</span>
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = upcoming.map(workout => `
            <div class="exercise-item" onclick="showWorkoutDetails(${workout.id})">
                <div class="exercise-info">
                    <div class="exercise-name">${workout.name}</div>
                    <div class="exercise-details">
                        <div class="exercise-detail">
                            <span>${new Date(workout.date).toLocaleDateString('ru-RU', { 
                                day: 'numeric', 
                                month: 'short',
                                year: 'numeric'
                            })}</span>
                        </div>
                        <div class="exercise-detail">
                            <span>${new Date(workout.date).toLocaleTimeString('ru-RU', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}</span>
                        </div>
                        <div class="exercise-detail">
                            <span>${workout.exercises.length}</span>
                            <span>упражнений</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Ошибка загрузки предстоящих тренировок:', error);
    }
}

function generateCalendar() {
    // Упрощенная версия календаря
    console.log("Календарь в разработке");
}

// ========== РАЗДЕЛ ДЛЯ ТРЕНЕРОВ ==========
function showOneRepMaxCalculator() {
    const modalHTML = `
        <div class="modal-overlay" id="oneRepMaxModal">
            <div class="modal" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 class="modal-title">🧮 Калькулятор 1ПМ</h3>
                    <button class="modal-close" onclick="closeOneRepMaxModal()">✕</button>
                </div>
                
                <p style="color: var(--text-secondary); margin-bottom: 20px; line-height: 1.6;">
                    Рассчитайте ваш одноповторный максимум (1ПМ) на основе веса и количества повторений.
                    Результат поможет определить рабочие веса для разных целей.
                </p>
                
                <div class="form-group">
                    <label class="form-label">⚖️ Вес на штанге (кг)</label>
                    <input type="number" class="form-input" id="rmWeight" 
                           min="1" max="500" step="0.5" value="100" placeholder="Например: 80">
                </div>
                
                <div class="form-group">
                    <label class="form-label">🔢 Количество повторений</label>
                    <input type="number" class="form-input" id="rmReps" 
                           min="2" max="20" value="5" placeholder="Например: 5">
                    <div style="font-size: 0.85rem; color: var(--text-tertiary); margin-top: 5px;">
                        Минимум 2 повторения для точности расчета
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">📊 Формула расчета</label>
                    <select class="form-input" id="rmFormula">
                        <option value="brzycki">Бжицкого (наиболее точная)</option>
                        <option value="epley">Эйпли (для опытных)</option>
                        <option value="lander">Лэндера</option>
                        <option value="lombardi">Ломбарди</option>
                    </select>
                </div>
                
                <button class="btn btn-primary" onclick="calculateOneRepMax()" style="margin-bottom: 20px;">
                    <span>🧮</span>
                    <span>Рассчитать 1ПМ</span>
                </button>
                
                <div id="rmResult" style="display: none;">
                    <div class="card" style="background: var(--success-light); border-color: var(--success);">
                        <h4 style="font-size: 1.1rem; margin-bottom: 10px; color: var(--text);">Результат расчета</h4>
                        <div style="font-size: 2rem; font-weight: 800; color: var(--success); margin-bottom: 10px;">
                            <span id="rmValue">0</span> кг
                        </div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">
                            Ваш предполагаемый одноповторный максимум
                        </div>
                    </div>
                    
                    <div style="margin-top: 25px;">
                        <h4 style="font-size: 1rem; margin-bottom: 15px; color: var(--text);">📈 Проценты от 1ПМ для тренировок</h4>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                            <div style="background: var(--surface-dark); padding: 15px; border-radius: var(--radius);">
                                <div style="font-size: 0.85rem; color: var(--text-tertiary);">Максимальная сила</div>
                                <div style="font-size: 1.3rem; font-weight: 700; color: var(--danger);" id="rm100">0 кг</div>
                                <div style="font-size: 0.8rem; color: var(--text-tertiary);">100% 1ПМ</div>
                            </div>
                            <div style="background: var(--surface-dark); padding: 15px; border-radius: var(--radius);">
                                <div style="font-size: 0.85rem; color: var(--text-tertiary);">Силовая работа</div>
                                <div style="font-size: 1.3rem; font-weight: 700; color: var(--warning);" id="rm90">0 кг</div>
                                <div style="font-size: 0.8rem; color: var(--text-tertiary);">90% 1ПМ (3-5 повт)</div>
                            </div>
                            <div style="background: var(--surface-dark); padding: 15px; border-radius: var(--radius);">
                                <div style="font-size: 0.85rem; color: var(--text-tertiary);">Гипертрофия</div>
                                <div style="font-size: 1.3rem; font-weight: 700; color: var(--success);" id="rm80">0 кг</div>
                                <div style="font-size: 0.8rem; color: var(--text-tertiary);">80% 1ПМ (8-12 повт)</div>
                            </div>
                            <div style="background: var(--surface-dark); padding: 15px; border-radius: var(--radius);">
                                <div style="font-size: 0.85rem; color: var(--text-tertiary);">Выносливость</div>
                                <div style="font-size: 1.3rem; font-weight: 700; color: var(--info);" id="rm70">0 кг</div>
                                <div style="font-size: 0.8rem; color: var(--text-tertiary);">70% 1ПМ (15+ повт)</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background: var(--surface-dark); border-radius: var(--radius);">
                        <h5 style="font-size: 0.95rem; margin-bottom: 8px; color: var(--text);">💡 Рекомендации:</h5>
                        <ul style="color: var(--text-secondary); font-size: 0.9rem; padding-left: 20px;">
                            <li style="margin-bottom: 5px;">• Никогда не тренируйтесь с весом 100% от 1ПМ без страховки</li>
                            <li style="margin-bottom: 5px;">• Периодически пересчитывайте 1ПМ для отслеживания прогресса</li>
                            <li>• Используйте разные проценты от 1ПМ для разных целей</li>
                        </ul>
                    </div>
                </div>
                
                <button class="btn btn-secondary" onclick="closeOneRepMaxModal()" style="margin-top: 20px;">
                    <span>Закрыть</span>
                </button>
            </div>
        </div>
    `;
    
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHTML;
    document.body.appendChild(modalDiv.firstElementChild);
}

function closeOneRepMaxModal() {
    const modal = document.getElementById('oneRepMaxModal');
    if (modal) {
        modal.remove();
    }
}

function calculateOneRepMax() {
    const weight = parseFloat(document.getElementById('rmWeight').value);
    const reps = parseInt(document.getElementById('rmReps').value);
    const formula = document.getElementById('rmFormula').value;
    
    if (!weight || weight <= 0) {
        showMessage('Введите корректный вес', 'error');
        return;
    }
    
    if (!reps || reps < 2 || reps > 20) {
        showMessage('Количество повторений должно быть от 2 до 20', 'error');
        return;
    }
    
    let oneRM;
    
    switch (formula) {
        case 'brzycki':
            oneRM = weight * (36 / (37 - reps));
            break;
        case 'epley':
            oneRM = weight * (1 + 0.0333 * reps);
            break;
        case 'lander':
            oneRM = (100 * weight) / (101.3 - 2.67123 * reps);
            break;
        case 'lombardi':
            oneRM = weight * Math.pow(reps, 0.1);
            break;
        default:
            oneRM = weight * (1 + 0.0333 * reps);
    }
    
    oneRM = Math.round(oneRM * 2) / 2;
    
    document.getElementById('rmResult').style.display = 'block';
    document.getElementById('rmValue').textContent = oneRM.toFixed(1);
    document.getElementById('rm100').textContent = oneRM.toFixed(1) + ' кг';
    document.getElementById('rm90').textContent = (oneRM * 0.9).toFixed(1) + ' кг';
    document.getElementById('rm80').textContent = (oneRM * 0.8).toFixed(1) + ' кг';
    document.getElementById('rm70').textContent = (oneRM * 0.7).toFixed(1) + ' кг';
    
    showMessage(`1ПМ рассчитан: ${oneRM.toFixed(1)} кг`, 'success', 3000);
}

function showLoadPlanner() {
    showMessage('Планировщик нагрузок скоро будет доступен', 'info');
}

function showProgramTemplates() {
    showSection('programs');
    
    // Закрываем все открытые модальные окна
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    showMessage('Выберите программу тренировок', 'info', 2000);
}

function showClientReports() {
    showMessage('Генерация отчетов для клиентов скоро будет доступна', 'info');
}

// ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========
// Закрытие автокомплита при клике вне его
document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete-container')) {
        closeAllAutocompletes();
    }
});

// Обработка клавиши Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            if (modal.style.display === 'flex') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
        
        closeAllAutocompletes();
    }
});

// Инициализация всех раскрывающихся элементов информации
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.info-card-content').forEach(content => {
        if (content.id) {
            content.style.display = 'none';
        }
    });
});

// Обработка изменения темы в системе
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (themeSettings.mode === 'auto') {
        applyThemeMode('auto');
    }
});

// Обработка событий видимости страницы
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Страница стала видимой - обновляем данные
        updateAllStats();
        loadRecentWorkouts();
        updateTrackerStats();
        
        // Проверяем уведомления
        checkScheduleNotifications();
    }
});

// ========== ОСТАЛЬНЫЕ ПУСТЫЕ ФУНКЦИИ (СОХРАНЕНЫ) ==========
function addExerciseToEdit() {
    if (!window.editExercises) {
        window.editExercises = [];
    }
    
    window.editExercises.push({
        name: '',
        sets: 3,
        reps: 10,
        weight: 0,
        note: ''
    });
    
    // Перезагружаем форму редактирования
    if (window.editWorkoutData) {
        displayWorkoutForEditing(window.editWorkoutData);
    }
}

function updateEditExercise(index, field, value) {
    if (window.editExercises && window.editExercises[index]) {
        window.editExercises[index][field] = value;
    }
}

function removeEditExercise(index) {
    if (window.editExercises) {
        window.editExercises.splice(index, 1);
        
        if (window.editWorkoutData) {
            displayWorkoutForEditing(window.editWorkoutData);
        }
    }
}

function showAddProgramModal() {
    // TODO: Реализовать позже
    console.log("showAddProgramModal вызвана");
}

function adminExportJSON() {
    // TODO: Реализовать позже
    console.log("adminExportJSON вызвана");
}

function adminImportData() {
    // TODO: Реализовать позже
    console.log("adminImportData вызвана");
}

function exportDataToWord() {
    // TODO: Реализовать позже
    console.log("exportDataToWord вызвана");
}

function importDataFromWord() {
    // TODO: Реализовать позже
    console.log("importDataFromWord вызвана");
}

function loadFromTemplate() {
    // TODO: Реализовать позже
    console.log("loadFromTemplate вызвана");
}

function saveAsTemplate() {
    // TODO: Реализовать позже
    console.log("saveAsTemplate вызвана");
}

function generateCalendar() {
    // TODO: Реализовать позже
    console.log("generateCalendar вызвана");
}

function showLoadPlanner() {
    // TODO: Реализовать позже
    console.log("showLoadPlanner вызвана");
}

function showClientReports() {
    // TODO: Реализовать позже
    console.log("showClientReports вызвана");
}

function showProgramTemplates() {
    // TODO: Реализовать позже
    console.log("showProgramTemplates вызвана");
}

function loadAdminPrograms() {
    // TODO: Реализовать позже
    console.log("loadAdminPrograms вызвана");
}

function loadAdminKnowledge() {
    // TODO: Реализовать позже
    console.log("loadAdminKnowledge вызвана");
}

function adminAddProgram() {
    // TODO: Реализовать позже
    console.log("adminAddProgram вызвана");
}

function adminAddArticle() {
    // TODO: Реализовать позже
    console.log("adminAddArticle вызвана");
}

function showEditExerciseModal() {
    // TODO: Реализовать позже
    console.log("showEditExerciseModal вызвана");
}

// ========== ЗАВЕРШЕНИЕ ИНИЦИАЛИЗАЦИИ ==========
console.log("FitApp v2.0 JavaScript модуль загружен и готов к работе!");
