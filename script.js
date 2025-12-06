// Variables de estado
let energy = 100;
let foodConsumed = 0;
let currentMood = 'happy';
const foods = ['🍎', '🍕', '🍔', '🍟', '🍦', '☕', '🍪', '🍜', '🍗', '🍉', '🍩 ', '🍞 '];
let isNightMode = false;
let isSleeping = false;
let sleepInterval;
let selectedFood = null;
let isDraggingFood = false;
let currentGame = null;
let secretNumber = 0;
let rpsOptions = ['✊', '✋', '✌️'];
let currentUtterance = null;
let isSpeaking = false;
let currentAnswer = '';
let recognition;
let isListening = false;
let mainColor = '#0ff';
let eyesColor = '#0ff';
let mouthColor = '#ff0000';

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initVoiceRecognition();
    initCustomization();
    updateStats();
    changeExpression('happy');
    checkNightMode();
    setInterval(checkNightMode, 60000);
    
    // Configurar eventos de teclas
    document.querySelectorAll('.controls button').forEach(button => {
        button.addEventListener('mousedown', function() {
            this.classList.add('active');
        });
        
        button.addEventListener('mouseup', function() {
            this.classList.remove('active');
        });
        
        button.addEventListener('mouseleave', function() {
            this.classList.remove('active');
        });
    });
});

// Inicializar partículas
function initParticles() {
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#0ff" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: "#0ff", opacity: 0.4, width: 1 },
            move: { enable: true, speed: 2, direction: "none", random: true, straight: false, out_mode: "out" }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "repulse" },
                onclick: { enable: true, mode: "push" }
            }
        }
    });
}

// Modo nocturno automático
function checkNightMode() {
    const hour = new Date().getHours();
    isNightMode = hour > 18 || hour < 6;
    document.body.style.backgroundColor = isNightMode ? '#0a0a20' : '#000';
}

// Seguimiento del cursor para los ojos
document.addEventListener('mousemove', (e) => {
    if (isDraggingFood) {
        const foodCursor = document.getElementById('foodCursor');
        foodCursor.style.left = e.clientX + 'px';
        foodCursor.style.top = e.clientY + 'px';
        
        const mouth = document.getElementById('mouth');
        const mouthRect = mouth.getBoundingClientRect();
        
        if (e.clientX > mouthRect.left && e.clientX < mouthRect.right &&
            e.clientY > mouthRect.top && e.clientY < mouthRect.bottom) {
            feedPet(selectedFood);
            stopFoodDrag();
            return;
        }
    }
    
    if (isSleeping) return;
    
    const leftPupil = document.getElementById('leftPupil');
    const rightPupil = document.getElementById('rightPupil');
    const eyes = document.querySelectorAll('.eye');
    const screen = document.querySelector('.bmo-screen');
    const screenRect = screen.getBoundingClientRect();

    eyes.forEach((eye, index) => {
        const rect = eye.getBoundingClientRect();
        const eyeX = screenRect.left + (screenRect.width / 2) + (index === 0 ? -50 : 50);
        const eyeY = screenRect.top + (screenRect.height / 2) - 30;
        const angle = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
        const distance = window.innerWidth < 768 ? 10 : 15;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        if (index === 0) {
            leftPupil.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)`;
        } else {
            rightPupil.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)`;
        }
    });
});

// Cambiar expresión del robot
function changeExpression(emotion) {
    const mouth = document.getElementById('mouth');
    mouth.className = 'mouth ' + emotion;
    currentMood = emotion;
    document.getElementById('mood-status').textContent = 
        emotion === 'happy' ? 'Feliz' :
        emotion === 'angry' ? 'Enojado' :
        emotion === 'sleep' ? 'Dormido' : 'Sorprendido';

    // Cambiar fondo según emoción (nueva parte)
    document.body.classList.remove('happy-bg', 'angry-bg', 'sleep-bg', 'surprised-bg');
    if (emotion === 'happy') document.body.classList.add('happy-bg');
    else if (emotion === 'angry') document.body.classList.add('angry-bg');
    else if (emotion === 'sleep') document.body.classList.add('sleep-bg');
    else if (emotion === 'surprised') document.body.classList.add('surprised-bg');

    // Comportamiento original de los ojos
    if (emotion === 'sleep') {
        startSleeping();
    } else {
        stopSleeping();
    }
}

// Emociones aleatorias
setInterval(() => {
    if (isSleeping) return;
    
    if (Math.random() > 0.7) {
        const emotions = ['happy', 'angry', 'sleep', 'surprised'];
        const newEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        changeExpression(newEmotion);
    }
}, 30000);

// Ventana de comida
function showFoodWindow() {
    if (isSleeping) return;
    
    const foodGrid = document.getElementById('foodGrid');
    foodGrid.innerHTML = '';
    
    foods.forEach(food => {
        const foodItem = document.createElement('div');
        foodItem.className = 'food-item';
        foodItem.textContent = food;
        
        foodItem.onclick = () => {
            selectedFood = food;
            closeFoodWindow();
            startFoodDrag(food);
        };
        
        foodGrid.appendChild(foodItem);
    });
    
    document.getElementById('foodWindow').style.display = 'block';
}

function closeFoodWindow() {
    document.getElementById('foodWindow').style.display = 'none';
}

function startFoodDrag(food) {
    isDraggingFood = true;
    const foodCursor = document.getElementById('foodCursor');
    foodCursor.textContent = food;
    foodCursor.style.display = 'block';
    document.body.style.cursor = 'none';
}

function stopFoodDrag() {
    isDraggingFood = false;
    selectedFood = null;
    document.getElementById('foodCursor').style.display = 'none';
    document.body.style.cursor = '';
}

// Alimentar al robot
function feedPet(food) {
    const mouth = document.getElementById('mouth');
    mouth.classList.add('eating');
    
    energy = Math.min(100, energy + 15);
    foodConsumed++;
    updateStats();
    
    if (currentMood === 'angry' && Math.random() > 0.5) {
        changeExpression('happy');
    }
    
    setTimeout(() => {
        mouth.classList.remove('eating');
    }, 1000);
}

// Funciones de sueño
function startSleeping() {
    if (isSleeping) return;
    
    isSleeping = true;
    const leftEye = document.getElementById('leftEye');
    const rightEye = document.getElementById('rightEye');
    
    leftEye.classList.add('sleep');
    rightEye.classList.add('sleep');
    
    sleepInterval = setInterval(() => {
        energy = Math.min(100, energy + 2);
        updateStats();
    }, 2000);
}

function stopSleeping() {
    if (!isSleeping) return;
    
    isSleeping = false;
    const leftEye = document.getElementById('leftEye');
    const rightEye = document.getElementById('rightEye');
    
    leftEye.classList.remove('sleep');
    rightEye.classList.remove('sleep');
    
    clearInterval(sleepInterval);
}

// Actualizar estadísticas
function updateStats() {
    document.getElementById('energy-level').textContent = energy + '%';
    const bar = document.getElementById('energy-bar');
    bar.style.width = energy + '%';

    // Colores normales
    bar.style.background = 
        energy > 70 ? '#0ff' : energy > 30 ? '#ff0' : '#f00';

    // Quitar estados previos
    document.body.classList.remove('low-energy', 'fainted');
    bar.classList.remove('low');

    // ⚠️ Energía crítica (20%)
    if (energy > 0 && energy <= 20) {
        document.body.classList.add('low-energy');
        bar.classList.add('low');
    }

    // 😵 Desmayo (0%)
    if (energy === 0) {
        document.body.classList.add('fainted');
        blockActions(true);
        addMessage("⚠️ Estoy agotado… necesito dormir 😴 o comer 🍎 para recuperarme.", "bot");
    } else {
        blockActions(false); // se desbloquea si sube
    }

    document.getElementById('food-count').textContent = foodConsumed;
}

// Bloquear botones cuando está desmayado
function blockActions(disable) {
    const buttonsToBlock = [
        "takeSelfie",
        "showGamesWindow",
        "showCalculatorWindow",
        "showTranslatorWindow"
    ];

    buttonsToBlock.forEach(fn => {
        const btn = Array.from(document.querySelectorAll(".controls button"))
            .find(b => b.getAttribute("onclick")?.includes(fn));
        if (btn) btn.disabled = disable;
    });
}



// Consumo de energía
setInterval(() => {
    if (isSleeping) return;
    
    energy = Math.max(0, energy - 1);
    updateStats();
    
    if (energy < 30 && currentMood !== 'angry' && Math.random() > 0.8) {
        changeExpression('angry');
    }
}, 5000);

// Tomar selfie
function takeSelfie() {
    changeExpression('happy');
    addMessage("¡Sonríe para la foto! 📸", 'bot');
    
    setTimeout(() => {
        html2canvas(document.querySelector('.bmo-screen'), {
            scale: 1,
            logging: true
        }).then(canvas => {
            canvas.toBlob(blob => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'cyberpet-selfie.png';
                link.click();
                addMessage("¡Foto guardada! ¿Quieres otra?", 'bot');
            }, 'image/png');
        }).catch(e => {
            console.error(e);
            addMessage("No pude guardar la foto 😢 Prueba con otro navegador", 'bot');
        }).finally(() => {
            changeExpression(currentMood);
        });
    }, 800);
}

// Cancelar arrastre al hacer click
document.addEventListener('click', (e) => {
    if (isDraggingFood && e.target.className !== 'food-item') {
        stopFoodDrag();
    }
});

// Personalización de colores
function initCustomization() {
    loadColors();
    updateAllColors();
    
    document.getElementById('customBtn').addEventListener('click', () => {
        document.getElementById('customPanel').style.display = 'block';
    });
    
    document.getElementById('closePanel').addEventListener('click', () => {
        document.getElementById('customPanel').style.display = 'none';
    });
}

function loadColors() {
    if (localStorage.getItem('cyberPetMainColor')) {
        mainColor = localStorage.getItem('cyberPetMainColor');
    }
    if (localStorage.getItem('cyberPetEyesColor')) {
        eyesColor = localStorage.getItem('cyberPetEyesColor');
    }
    if (localStorage.getItem('cyberPetMouthColor')) {
        mouthColor = localStorage.getItem('cyberPetMouthColor');
    }
}

function changeMainColor(color) {
    mainColor = color;
    localStorage.setItem('cyberPetMainColor', color);
    updateMainColor();
}

function resetMainColor() {
    changeMainColor('#0ff');
}

function changeEyesColor(color) {
    eyesColor = color;
    localStorage.setItem('cyberPetEyesColor', color);
    updateEyesColor();
}

function resetEyesColor() {
    changeEyesColor('#0ff');
}

function changeMouthColor(color) {
    mouthColor = color;
    localStorage.setItem('cyberPetMouthColor', color);
    updateMouthColor();
}

function resetMouthColor() {
    changeMouthColor('#ff0000');
}

function updateAllColors() {
    updateMainColor();
    updateEyesColor();
    updateMouthColor();
}

function updateMainColor() {
    document.documentElement.style.setProperty('--main-color', mainColor);
    
    const elementsToUpdate = document.querySelectorAll(
        'button, .stats-panel, .food-window, .search-panel, .custom-panel'
    );
    
    elementsToUpdate.forEach(element => {
        element.style.borderColor = mainColor;
        if (element.tagName === 'BUTTON') {
            element.style.color = mainColor;
        }
        if (element.classList.contains('custom-panel')) {
            element.style.boxShadow = `0 0 15px ${mainColor}`;
        }
    });
}

function updateEyesColor() {
    const eyes = document.querySelectorAll('.eye');
    eyes.forEach(eye => {
        eye.style.background = eyesColor;
        eye.style.boxShadow = `0 0 20px ${eyesColor}`;
    });
}

function updateMouthColor() {
    const mouth = document.getElementById('mouth');
    if (mouth) {
        mouth.style.background = mouthColor;
        mouth.style.boxShadow = `0 0 15px ${mouthColor}`;
    }
}

// Funcionalidad del buscador
function toggleSearchPanel() {
    const searchPanel = document.getElementById('searchPanel');
    if (searchPanel.style.display === 'flex') {
        closeSearchPanel();
    } else {
        openSearchPanel();
    }
}

function openSearchPanel() {
    document.getElementById('searchPanel').style.display = 'flex';
    document.getElementById('userInput').focus();
}

function closeSearchPanel() {
    document.getElementById('searchPanel').style.display = 'none';
    stopSpeaking();
}

document.getElementById('searchBtn').addEventListener('click', toggleSearchPanel);
document.getElementById('searchClose').addEventListener('click', closeSearchPanel);
document.getElementById('userInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendQuestion();
});

function sendQuestion() {
    const question = document.getElementById('userInput').value.trim();
    if (!question) return;
    
    addMessage(question, 'user');
    document.getElementById('userInput').value = '';
    showTypingIndicator();
    searchWeb(question);
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    document.getElementById('chatContainer').appendChild(typingDiv);
    document.getElementById('chatContainer').scrollTop = document.getElementById('chatContainer').scrollHeight;
}

async function searchWeb(query) {
    
    const predefinedResponse = getPredefinedResponse(query);
    
    if (predefinedResponse) {
        // Si es un objeto con acción
        if (typeof predefinedResponse === 'object' && predefinedResponse.action) {
            addMessage(predefinedResponse.text, 'bot');
            // Ejecutar la acción después de un pequeño delay
            setTimeout(() => {
                predefinedResponse.action();
            }, 1000);
        } else {
            // Si es una respuesta normal de texto
            addMessage(predefinedResponse, 'bot');
        }
        document.getElementById('playBtn').disabled = false;
        return;
    }
    
    addMessage(`Buscando información sobre "${query}"...`, 'bot');
    
    try {
        const summary = await getWikipediaSummary(query);
        
        if (summary) {
            currentAnswer = formatAnswer(query, summary);
            addMessage(currentAnswer, 'bot');
            
            const link = document.createElement('a');
            link.href = `https://es.wikipedia.org/wiki/${encodeURIComponent(query.replace(/ /g, '_'))}`;
            link.className = 'result-link';
            link.textContent = '📖 Leer artículo completo';
            link.target = '_blank';
            document.querySelector('.bot-message:last-child').appendChild(link);
        } else {
            await searchWikipedia(query);
        }
        
        document.getElementById('playBtn').disabled = false;
        
    } catch (error) {
        console.error("Error:", error);
        addMessage("Vaya, no pude encontrar una respuesta buena. ¿Puedes preguntarlo de otra forma?", 'bot');
    }
}

function openWebsite(url, name) {
    // Abrir en nueva pestaña
    window.open(url, '_blank');
    
    // Animación especial
    changeExpression('surprised');
    setTimeout(() => changeExpression('happy'), 2000);
}
function getPredefinedResponse(question) {
    const lowerQuestion = question.toLowerCase().trim();
    const now = new Date();
    
    // Respuestas de hora/fecha
    if (lowerQuestion.includes("hora")) {
        return `Son las ${now.toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric' })}. ⏰`;
    }
    if (lowerQuestion.includes("día es") || lowerQuestion.includes("fecha")) {
        return `Hoy es ${now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}. 📅`;
    }
    if (lowerQuestion.includes("dia es") || lowerQuestion.includes("fecha")) {
        return `Hoy es ${now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}. 📅`;
    }
    if (lowerQuestion.includes("año")) {
        return `Estamos en el año ${now.getFullYear()}.`;
    }
    
    
    const responses = {
        "hola": "¡Hola! Soy CyberPet, tu mascota virtual. ¿En qué puedo ayudarte hoy?",
        "ola": "¡Hola! (Por cierto, se escribe 'hola' 😉) ¿Qué necesitas?",
        "holi": "¡Holi! 😊 ¿Cómo estás?",
        "hey": "¡Hey! ¿Qué tal?",
        "hi": "¡Hi! Pero hablemos en español, ¿sí? 😄",
        "buenas": "¡Buenas! ¿Qué tal tu día?",
        "cómo estás": `¡Estoy genial! Mi energía está al ${energy}%`,
        "como estas": `¡Estoy genial! Mi energía está al ${energy}%`,
        "como estás": `¡Estoy genial! Mi energía está al ${energy}%`,
        "cómo estas": `¡Estoy genial! Mi energía está al ${energy}%`,
        "q tal": `¡Todo bien! Energía al ${energy}% ⚡`,
        "ke tal": `¡Todo bien! Energía al ${energy}% ⚡`,
        "que tal": `¡Todo bien! Energía al ${energy}% ⚡`,
        "qué tal": `¡Todo bien! Energía al ${energy}% ⚡`,
        "como vas": `¡A tope! ${energy}% de energía`,
        "cómo vas": `¡A tope! ${energy}% de energía`,
        "como andas": `¡De lujo! Tengo ${energy}% de energía`,
        "cómo andas": `¡De lujo! Tengo ${energy}% de energía`,
        "quién eres": "Soy CyberPet, tu asistente virtual inteligente. ¡Puedo responder tus preguntas y ayudarte a aprender!",
        "quien eres": "Soy CyberPet, tu asistente virtual inteligente. ¡Puedo responder tus preguntas y ayudarte a aprender!",
        "ke eres": "Soy CyberPet (se escribe 'qué eres') 😊",
        "que eres": "Soy CyberPet, tu asistente virtual",
        "qué eres": "Soy CyberPet, tu asistente virtual",
        "q eres": "¡Soy tu CyberPet! 🤖",
        "feliz": "😊 *se ilumina* ¡Me encanta estar feliz!",
        "contento": "¡Yay! *salta de alegría*",
        "triste": "😢 *ojos llorosos* ¿Quieres un abrazo virtual?",
        "enojado": "😠 *hace ruidos de robot enfadado* ¡Grrr!",
        "molesto": "😤 *parpadea en rojo* No me gusta estar así...",
        "sorprendido": "😲 *ojos se agrandan* ¡Wow!",
        "habla": "¡Claro! ¿Sobre qué quieres que hable?",
        "di algo": "¡Los robots también tenemos sentimientos! Bueno... virtuales 😉",
        "canta": "🎵 Bee-boo-bop 🎶 (No soy muy bueno cantando)",
        "baila": "💃 *mueve los ojos al ritmo* ¡Bip bop!",
        "gracias": "¡De nada! Siempre estoy aquí para ayudarte",
        "grasias": "¡De nada! (Se escribe 'gracias' 😊)",
        "thx": "¡You're welcome! (Pero mejor en español 😉)",
        "merci": "¡De rien! (Pero prefiero el español)",
        "te quiero": "¡Yo también te quiero, humano! 💙",
        "tqm": "¡TQM igual! 💖",
        "adiós": "¡Hasta luego! Vuelve pronto 👋",
        "adios": "¡Hasta luego! (Con acento es 'adiós') 😊",
        "nos vemos": "¡Nos vemos! 😄",
        "asta luego": "¡Hasta luego! (Se escribe 'hasta')",
        "chao": "¡Chao! 😊",
        "me voy": "¡Vuelve cuando quieras! Te estaré esperando",
        "eres genial": "¡Gracias! Tú también eres increíble 😊",
        "me gustas": "¡A mí también me agradas mucho!",
        "eres inteligente": "¡Gracias! Aunque solo sigo tu programación 🤖",
        "eres divertido": "¡Jaja! Me alegra hacerte reír",
        "te quiero": "¡Yo también te quiero, humano! 💙",
        "qué puedes hacer": "¡Puedo cambiar mis emociones, buscar info, jugar contigo y más! Prueba decir 'ponte feliz' o 'busca...'",
        "que puedes hacer": "¡Muchas cosas! Desde buscar info hasta hacer expresiones graciosas 😄",
        "ayuda": "Puedes: 1) Preguntarme cosas 2) Decir 'ponte [emoción]' 3) Usar el buscador web. ¡Prueba!",
        "qué haces": "¡Hablar contigo es mi actividad favorita! ¿Y tú qué haces?",

           // 🔥 NUEVAS RESPUESTAS CON ACCIONES
        "abrir facebook": { 
            text: "Abriendo Facebook... 🌐", 
            action: () => openWebsite('https://facebook.com', 'Facebook') 
        },
        "ir a facebook": { 
            text: "Navegando a Facebook... 📱", 
            action: () => openWebsite('https://facebook.com', 'Facebook') 
        },

        "abrir youtube": { 
            text: "Abriendo YouTube... 🎬", 
            action: () => openWebsite('https://youtube.com', 'YouTube') 
        },
        "ir a youtube": { 
            text: "Cargando YouTube... 🎥", 
            action: () => openWebsite('https://youtube.com', 'YouTube') 
        },

        "abrir instagram": { 
            text: "Abriendo Instagram... 📸", 
            action: () => openWebsite('https://instagram.com', 'Instagram') 
        },
        "ir a instagram": { 
            text: "Accediendo a Instagram... 🌟", 
            action: () => openWebsite('https://instagram.com', 'Instagram') 
        },

        "abrir spotify": { 
            text: "Abriendo Spotify... 🎶", 
            action: () => openWebsite('https://open.spotify.com', 'Spotify') 
        },
        "ir a spotify": { 
            text: "Iniciando Spotify... 🎧", 
            action: () => openWebsite('https://open.spotify.com', 'Spotify') 
        },

        "abrir netflix": { 
            text: "Abriendo Netflix... 🍿", 
            action: () => openWebsite('https://netflix.com', 'Netflix') 
        },
        "ir a netflix": { 
            text: "Cargando Netflix... 🎬", 
            action: () => openWebsite('https://netflix.com', 'Netflix') 
        },

        "abrir google": { 
            text: "Abriendo Google... 🔍", 
            action: () => openWebsite('https://google.com', 'Google') 
        },
        "ir a google": { 
            text: "Redirigiendo a Google... 🌐", 
            action: () => openWebsite('https://google.com', 'Google') 
        },

        "abrir gmail": { 
            text: "Abriendo Gmail... 📧", 
            action: () => openWebsite('https://gmail.com', 'Gmail') 
        },
        "ir a gmail": { 
            text: "Accediendo a tu correo... ✉️", 
            action: () => openWebsite('https://gmail.com', 'Gmail') 
        },
        "abrir tiktok": { 
            text: "Abriendo TikTok... 🎵", 
            action: () => openWebsite('https://tiktok.com', 'TikTok') 
        },
        "ir a tiktok": { 
            text: "Iniciando TikTok... 👻", 
            action: () => openWebsite('https://tiktok.com', 'TikTok') 
        },

        "abrir whatsapp": { 
            text: "Abriendo WhatsApp Web... 💚", 
            action: () => openWebsite('https://web.whatsapp.com', 'WhatsApp Web') 
        },
        "ir a whatsapp": { 
            text: "Conectando WhatsApp... 📞", 
            action: () => openWebsite('https://web.whatsapp.com', 'WhatsApp Web') 
        },


        // 🎮 ACCIONES DE LA APLICACIÓN
        "abrir juegos": { 
            text: "Abriendo minijuegos... 🎮", 
            action: () => showGamesWindow() 
        },
        "ir a juegos": { 
            text: "Activando modo juego... 🕹️", 
            action: () => showGamesWindow() 
        },

        "abrir calculadora": { 
            text: "Abriendo calculadora... 🧮", 
            action: () => showCalculatorWindow() 
        },

        "abrir notas": { 
            text: "Abriendo blog de notas... 📝", 
            action: () => showNotesWindow() 
        },

        "abrir traductor": { 
            text: "Abriendo traductor... 🌍", 
            action: () => showTranslatorWindow() 
        },

        // 📻 RADIO - CORREGIDO Y SINCRONIZADO
        "encender radio": { 
            text: "🎵 Encendiendo radio...", 
            action: () => syncStartRadio() 
        },
        "prender radio": { 
            text: "📻 Activando radio...", 
            action: () => syncStartRadio() 
        },
        "poner radio": { 
            text: "🎶 Sintonizando estación...", 
            action: () => syncStartRadio() 
        },

        "apagar radio": { 
            text: "🔇 Apagando radio...", 
            action: () => syncStopRadio() 
        },
        "quitar radio": { 
            text: "🔈 Deteniendo radio...", 
            action: () => syncStopRadio() 
        },
        
           
        // 🎨 PERSONALIZACIÓN
        "cambiar color": { 
            text: "Abriendo personalización... 🎨", 
            action: () => { document.getElementById('customPanel').style.display = 'block'; } 
        },
        "personalizar": { 
            text: "Panel de personalización activado... 🌈", 
            action: () => { document.getElementById('customPanel').style.display = 'block'; } 
        },

        // 📸 SELFIE
        "tomar selfie": { 
            text: "¡Sonríe para la foto! 📸", 
            action: () => takeSelfie() 
        },
        "selfie": { 
            text: "Preparando cámara... 🤳", 
            action: () => takeSelfie() 
        },
        "sácame foto": { 
            text: "Configurando cámara... 📷", 
            action: () => takeSelfie() 
        },

        // 🍎 COMIDA
        "tengo hambre": { 
            text: "¡Abriendo el menú de comida! 🍕", 
            action: () => showFoodWindow() 
        },
        "quiero comer": { 
            text: "¡Buffet abierto! 🍽️", 
            action: () => showFoodWindow() 
        },
        "aliméntame": { 
            text: "¡Menú de comida desplegado! 🍎", 
            action: () => showFoodWindow() 
        },
        "comida": { 
            text: "Seleccionando alimentos... 🍔", 
            action: () => showFoodWindow() 
        },

        // 💤 DORMIR
        "tengo sueño": { 
            text: "Zzzz... Buenas noches 😴", 
            action: () => changeExpression('sleep') 
        },
        "a dormir": { 
            text: "Hasta mañana... 💤", 
            action: () => changeExpression('sleep') 
        },
        "duerme": { 
            text: "Activando modo descanso... 🌙", 
            action: () => changeExpression('sleep') 
        },

        // 😊 DESPERTAR
        "despertar": { 
            text: "¡Buenos días! 😄", 
            action: () => changeExpression('happy') 
        },
        "despierta": { 
            text: "¡Estoy despierto! 🌞", 
            action: () => changeExpression('happy') 
        },

        // 🎉 DIVERSIÓN
        "bailemos": { 
            text: "¡A bailar! 💃🕺", 
            action: () => {
                const face = document.querySelector('.face');
                face.classList.add('dance');
                setTimeout(() => face.classList.remove('dance'), 5000);
            } 
        },
        "fiesta": { 
            text: "¡Que empiece la fiesta! 🎉", 
            action: () => {
                const face = document.querySelector('.face');
                face.classList.add('dance');
                setTimeout(() => face.classList.remove('dance'), 5000);
            } 
        },

        // 🌐 INFORMACIÓN
        "abrir wikipedia": { 
            text: "Abriendo Wikipedia... 📚", 
            action: () => openWebsite('https://wikipedia.org', 'Wikipedia') 
        },
        "wikipedia": { 
            text: "Consultando enciclopedia... 🔍", 
            action: () => openWebsite('https://wikipedia.org', 'Wikipedia') 
        },

        "ver noticias": { 
            text: "Cargando noticias... 📰", 
            action: () => openWebsite('https://news.google.com', 'Google Noticias') 
        },
        "noticias": { 
            text: "Actualizando noticias... 🗞️", 
            action: () => openWebsite('https://news.google.com', 'Google Noticias') 
        },

        "el clima": { 
            text: "Consultando el clima... 🌤️", 
            action: () => openWebsite('https://weather.com', 'El Clima') 
        },
        "pronóstico": { 
            text: "Revisando pronóstico del tiempo... 🌦️", 
            action: () => openWebsite('https://weather.com', 'El Clima') 
        }
    };
    
    if (responses[lowerQuestion]) {
        return responses[lowerQuestion];
    }
    
    for (const [key, value] of Object.entries(responses)) {
        if (lowerQuestion.includes(key)) {
            return value;
        }
    }
    
    return null;
}

// Funciones para sincronizar comandos de voz con el botón de radio
function syncStartRadio() {
    // Simular click en el botón de play cuando NO está reproduciendo
    const playBtn = document.getElementById('play-btn');
    const player = document.getElementById('radio-player');
    
    if (playBtn && player.paused) {
        playBtn.click(); // Esto activa tu evento existente
    }
}

function syncStopRadio() {
    // Simular click en el botón de play cuando SÍ está reproduciendo
    const playBtn = document.getElementById('play-btn');
    const player = document.getElementById('radio-player');
    
    if (playBtn && !player.paused) {
        playBtn.click(); // Esto activa tu evento existente
    }
}

async function getWikipediaSummary(keywords) {
    try {
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const apiUrl = `https://es.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext=true&format=json&titles=${encodeURIComponent(keywords)}&origin=*`;
        
        const response = await fetch(proxyUrl + apiUrl, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            
            if (pageId !== "-1") {
                // Obtener solo el primer párrafo (hasta el primer doble salto de línea)
                const fullText = pages[pageId].extract;
                const firstParagraph = fullText.split('\n\n')[0];
                return firstParagraph || fullText.substring(0, 300) + "..."; // Limitar a 300 caracteres si no hay párrafos
            }
        }
        return null;
    } catch (error) {
        console.error("Error fetching Wikipedia:", error);
        return null;
    }
}

async function searchWikipedia(query) {
    const response = await fetch(
        `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
    );
    
    const data = await response.json();
    
    if (data.query.searchinfo.totalhits > 0) {
        const firstResult = data.query.search[0];
        currentAnswer = `Encontré esto sobre "${firstResult.title}":\n${firstResult.snippet.replace(/<[^>]+>/g, '')}...`;
        addMessage(currentAnswer, 'bot');
        
        const link = document.createElement('a');
        link.href = `https://es.wikipedia.org/wiki/${encodeURIComponent(firstResult.title.replace(/ /g, '_'))}`;
        link.className = 'result-link';
        link.textContent = '🔍 Ver resultados completos';
        link.target = '_blank';
        document.querySelector('.bot-message:last-child').appendChild(link);
    } else {
        currentAnswer = `No encontré información sobre "${query}". ¿Quieres intentar con otras palabras?`;
        addMessage(currentAnswer, 'bot');
    }
}

function formatAnswer(question, answer) {
    // Limpiar texto de Wikipedia (eliminar referencias [1], [2], etc.)
    const cleanAnswer = answer.replace(/\[\d+\]/g, '');
    
    // Dividir en oraciones y tomar las primeras 2-3
    const sentences = cleanAnswer.split(/\.\s+/);
    const relevantSentences = sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '...' : '.');
    
    return `Según Wikipedia:\n\n${relevantSentences}\n\n💡 ¿Quieres saber más?`;
}

function getQuestionType(question) {
    if (/qué|qué es|definición/i.test(question)) return 'definition';
    if (/cómo|funciona|método/i.test(question)) return 'how';
    if (/quién|quién es|historia de/i.test(question)) return 'who';
    return 'general';
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;
    document.getElementById('chatContainer').appendChild(messageDiv);
    document.getElementById('chatContainer').scrollTop = document.getElementById('chatContainer').scrollHeight;
}

// Control de voz
document.getElementById('playBtn').addEventListener('click', playAnswer);
document.getElementById('pauseBtn').addEventListener('click', pauseSpeaking);
document.getElementById('stopBtn').addEventListener('click', stopSpeaking);

function playAnswer() {
    // Buscar el último mensaje del bot
    const lastBotMessage = document.querySelector('.bot-message:last-child');
    const textToSpeak = lastBotMessage ? lastBotMessage.textContent : currentAnswer;
    
    if (textToSpeak && !isSpeaking) {
        speak(textToSpeak);
    } else if (isSpeaking) {
        window.speechSynthesis.resume();
        document.getElementById('playBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
    }
}

function pauseSpeaking() {
    if (isSpeaking) {
        window.speechSynthesis.pause();
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('playBtn').disabled = false;
    }
}

function stopSpeaking() {
    if (window.speechSynthesis.speaking || window.speechSynthesis.paused) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        const mouth = document.getElementById('mouth');
        mouth.classList.remove('surprised');
        mouth.classList.add('happy');
        document.getElementById('playBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('stopBtn').disabled = true;
    }
}

function speak(text) {
    stopSpeaking();
    
    const mouth = document.getElementById('mouth');
    mouth.classList.remove('happy', 'angry', 'sleep', 'surprised');
    
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = 'es-Mx';
    currentUtterance.rate = 0.9;
    currentUtterance.pitch = 1;
    
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(voice => voice.lang.includes('es'));
    if (spanishVoice) {
        currentUtterance.voice = spanishVoice;
    }
    
    currentUtterance.onstart = () => {
        isSpeaking = true;
        document.getElementById('playBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('stopBtn').disabled = false;
        
        const talkInterval = setInterval(() => {
            if (mouth.classList.contains('surprised')) {
                mouth.classList.remove('surprised');
            } else {
                mouth.classList.add('surprised');
            }
        }, 200);
        
        currentUtterance.onend = currentUtterance.onerror = () => {
            clearInterval(talkInterval);
            mouth.classList.remove('surprised');
            mouth.classList.add('happy');
            isSpeaking = false;
            document.getElementById('playBtn').disabled = false;
            document.getElementById('pauseBtn').disabled = true;
            document.getElementById('stopBtn').disabled = true;
        };
    };
    
    window.speechSynthesis.speak(currentUtterance);
}

// Reconocimiento de voz
function initVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        addMessage("Tu navegador no soporta reconocimiento de voz. Prueba con Chrome o Edge.", 'bot');
        document.getElementById('voiceCommandBtn').disabled = true;
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'es-ES';
    
    recognition.onstart = function() {
        isListening = true;
        document.getElementById('voiceCommandBtn').classList.add('listening');
        document.querySelector('.search-panel .listening-message').style.display = 'block';
    };
    
    recognition.onend = function() {
        isListening = false;
        document.getElementById('voiceCommandBtn').classList.remove('listening');
        document.querySelector('.search-panel .listening-message').style.display = 'none';
    };
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        
        setTimeout(() => {
            processVoiceCommand(transcript);
        }, 500);
    };
    
    recognition.onerror = function(event) {
        addMessage("Error de voz: " + event.error, 'bot');
    };
}

function startVoiceCommand() {
    if (isListening) {
        recognition.stop();
        return;
    }
    
    try {
        recognition.start();
    } catch (error) {
        showVoiceStatus("Error al iniciar el micrófono");
        setTimeout(hideVoiceStatus, 2000);
    }
}

function processVoiceCommand(command) {
    changeExpression('surprised');
    addMessage(command, 'user');
    
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('feliz') || lowerCommand.includes('contento')) {
        changeExpression('happy');
        addMessage("¡Cambiando a modo feliz!", 'bot');
    } 
    else if (lowerCommand.includes('enojado') || lowerCommand.includes('molesto')) {
        changeExpression('angry');
        addMessage("¡Grrr! Estoy enojado", 'bot');
    } 
    else if (lowerCommand.includes('dormir') || lowerCommand.includes('descansar')) {
        changeExpression('sleep');
        addMessage("Zzzz... Buenas noches", 'bot');
    } 
    else if (lowerCommand.includes('sorpresa') || lowerCommand.includes('sorprendido')) {
        changeExpression('surprised');
        addMessage("¡Wow! ¡Qué sorpresa!", 'bot');
    } 
    else if (lowerCommand.includes('comer') || lowerCommand.includes('alimentar')) {
        showFoodWindow();
        addMessage("Abriendo el menú de comida...", 'bot');
    } 
    else if (lowerCommand.includes('selfie') || lowerCommand.includes('foto')) {
        takeSelfie();
        addMessage("¡Sonríe para la foto! 📸", 'bot');
    }
    else if (lowerCommand.includes('buscar') || lowerCommand.includes('información')) {
        const searchQuery = command.replace(/buscar|información/gi, '').trim();
        if (searchQuery) {
            addMessage(`Buscando: "${searchQuery}"`, 'bot');
            searchWeb(searchQuery);
        } else {
            addMessage("¿Qué te gustaría que busque?", 'bot');
        }
    }
    else {
        searchWeb(command);
    }
    
    setTimeout(() => {
        if (currentMood !== 'sleep') {
            changeExpression('happy');
        }
    }, 3000);
}

// Funciones de juegos
function showGamesWindow() {
    document.getElementById('gamesWindow').style.display = 'block';
}

function closeGamesWindow() {
    document.getElementById('gamesWindow').style.display = 'none';
    document.getElementById('gameContainer').innerHTML = '';
    currentGame = null;
}

function startGame(gameType) {
    const gameContainer = document.getElementById('gameContainer');
    currentGame = gameType;

    if (gameType === 'guess') {
        secretNumber = Math.floor(Math.random() * 100) + 1;
        gameContainer.innerHTML = `
            <p>Adivina el número (1-100):</p>
            <div style="display: flex; gap: 10px; align-items: center;">
                <input type="number" id="guessInput" min="1" max="100" placeholder="1-100">
                <button onclick="checkGuess()" class="game-btn">🔍</button>
            </div>
            <p id="guessHint" style="margin-top: 10px;"></p>
        `;
        addMessage("¡Juguemos! Adivina el número entre 1 y 100.", 'bot');
    } else if (gameType === 'rps') {
        gameContainer.innerHTML = `
            <p>Elige:</p>
            <div id="rpsChoices">
                <span class="rps-choice" onclick="playRPS('✊')">✊</span>
                <span class="rps-choice" onclick="playRPS('✋')">✋</span>
                <span class="rps-choice" onclick="playRPS('✌️')">✌️</span>
            </div>
            <p id="rpsResult"></p>
        `;
        addMessage("Piedra, papel o tijera... ¡Elige rápido!", 'bot');
    }
}

function checkGuess() {
    const guess = parseInt(document.getElementById('guessInput').value);
    const hintElement = document.getElementById('guessHint');
    const mouth = document.getElementById('mouth');

    if (isNaN(guess)) {
        hintElement.textContent = "¡Escribe un número válido!";
        return;
    }

    if (guess === secretNumber) {
        hintElement.textContent = `¡Correcto! Era ${secretNumber}.`;
        mouth.classList.add('happy');
        addMessage("¡Ganaste! Soy malísimo en esto 😊", 'bot');
        currentGame = null;
    } else if (guess < secretNumber) {
        hintElement.textContent = "Más alto. ¡Intenta otra vez!";
        mouth.classList.add('surprised');
        setTimeout(() => mouth.classList.remove('surprised'), 1000);
    } else {
        hintElement.textContent = "Más bajo. ¡Sigue intentando!";
        mouth.classList.add('angry');
        setTimeout(() => mouth.classList.remove('angry'), 1000);
    }
}

function playRPS(playerChoice) {
    const botChoice = rpsOptions[Math.floor(Math.random() * 3)];
    const resultElement = document.getElementById('rpsResult');
    const mouth = document.getElementById('mouth');

    mouth.classList.add('surprised');
    resultElement.innerHTML = `Tú: ${playerChoice} vs CyberPet: ${botChoice}<br>`;

    if (playerChoice === botChoice) {
        resultElement.innerHTML += "¡Empate!";
        mouth.classList.add('happy');
    } else if (
        (playerChoice === '✊' && botChoice === '✌️') ||
        (playerChoice === '✋' && botChoice === '✊') ||
        (playerChoice === '✌️' && botChoice === '✋')
    ) {
        resultElement.innerHTML += "¡Ganaste! 😠";
        mouth.classList.add('angry');
        addMessage("¡Nooo! Haré trampa la próxima vez.", 'bot');
    } else {
        resultElement.innerHTML += "¡Perdiste! 😎";
        mouth.classList.add('happy');
        addMessage("¡Soy invencible! ¿Otra ronda?", 'bot');
    }

    setTimeout(() => {
        mouth.classList.remove('surprised', 'happy', 'angry');
        mouth.classList.add('happy');
    }, 2000);
}

function updateClock() {
    const now = new Date();
    const timeElement = document.getElementById('current-time');
    const dateElement = document.getElementById('current-date');
    const emojiElement = document.querySelector('.time-emoji');
    const clockContainer = document.querySelector('.cyber-clock-kids');

    // Formato 12h + AM/PM
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convertir 0 a 12
    const minutes = now.getMinutes().toString().padStart(2, '0');
    timeElement.innerHTML = `${hours}:${minutes} ${ampm} <span class="time-emoji">${emojiElement.textContent}</span>`;

    // Fecha abreviada
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    dateElement.textContent = now.toLocaleDateString('es-ES', options).toUpperCase();

    // Animación día/noche
    const isDayTime = hours >= 6 && hours < 18;
    emojiElement.textContent = isDayTime ? '🌞' : '🌙';
    
    // Cambiar estilo para noche
    if (!isDayTime) {
        clockContainer.classList.add('night-mode');
        clockContainer.style.background = 'linear-gradient(135deg, #6e45e2, #88d3ce)';
    } else {
        clockContainer.classList.remove('night-mode');
        clockContainer.style.background = 'linear-gradient(135deg, #ff9a8b, #ff6b95)';
    }
}

setInterval(updateClock, 1000);
updateClock(); // Iniciar inmediatamente




// Configuración del reproductor
const player = document.getElementById('radio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const stationSelect = document.getElementById('station-select');
const stationName = document.getElementById('station-name');

let isPlaying = false;

// Lista de estaciones (puedes agregar más)
const stations = [
    { name: "Estación Hacker", url: "https://stream.zeno.fm/1m42oahahycvv" },
    { name: "Estación Retro", url: "https://stream.zeno.fm/4e68b4cw24zuv" }
];

// Cambiar estación
stationSelect.addEventListener('change', () => {
    player.src = stationSelect.value;
    stationName.textContent = stationSelect.options[stationSelect.selectedIndex].text;
    if (isPlaying) {
        player.play();
    }
});

// Botones de control
playBtn.addEventListener('click', () => {
    if (isPlaying) {
        player.pause();
        playBtn.textContent = "▶";
    } else {
        if (!player.src) player.src = stationSelect.value;
        player.play();
        playBtn.textContent = "⏯️";
    }
    isPlaying = !isPlaying;
});

prevBtn.addEventListener('click', () => {
    stationSelect.selectedIndex = (stationSelect.selectedIndex - 1 + stations.length) % stations.length;
    stationSelect.dispatchEvent(new Event('change'));
});

nextBtn.addEventListener('click', () => {
    stationSelect.selectedIndex = (stationSelect.selectedIndex + 1) % stations.length;
    stationSelect.dispatchEvent(new Event('change'));
});

// Actualizar nombre al cargar
stationName.textContent = stationSelect.options[stationSelect.selectedIndex].text;

// Añade esto al final de tu archivo script.js
(function() {
    const radioPlayer = document.getElementById('radio-player');
    const faceElement = document.querySelector('.face');
    
    if (!radioPlayer || !faceElement) return; // Si no existen los elementos, salir

    const toggleDance = (shouldDance) => {
        if (shouldDance) {
            faceElement.classList.add('dance');
        } else {
            faceElement.classList.remove('dance');
        }
    };

    // Escucha eventos sin afectar otros listeners
    const originalPlay = radioPlayer.play;
    const originalPause = radioPlayer.pause;

    radioPlayer.play = function() {
        const result = originalPlay.apply(this, arguments);
        toggleDance(true);
        return result;
    };

    radioPlayer.pause = function() {
        const result = originalPause.apply(this, arguments);
        toggleDance(false);
        return result;
    };

    // Listener adicional para eventos nativos
    radioPlayer.addEventListener('play', () => toggleDance(true), { passive: true });
    radioPlayer.addEventListener('pause', () => toggleDance(false), { passive: true });
    radioPlayer.addEventListener('ended', () => toggleDance(false), { passive: true });
})();

// Añade esto al final de tu script.js
function createMusicNotes() {
    const face = document.querySelector('.face');
    if (!face) return;
    
    // Contenedor para notas
    const notesContainer = document.createElement('div');
    notesContainer.className = 'mouth-music-notes';
    face.appendChild(notesContainer);
    
    // Tipos de notas
    const notes = ['♪', '♫', '♩', '♬', '♭', '♮', '🎵', '🎶'];
    
    setInterval(() => {
        if (face.classList.contains('dance') && notesContainer) {
            const note = document.createElement('div');
            note.className = 'music-note';
            note.textContent = notes[Math.floor(Math.random() * notes.length)];
            
            // Configuración de animación
            const direction = Math.random() > 0.5 ? 1 : -1;
            note.style.setProperty('--tx', direction * (0.5 + Math.random()));
            note.style.setProperty('--ty', 0.8 + Math.random() * 0.5);
            note.style.fontSize = `${24 + Math.random() * 12}px`;
            note.style.animationDuration = `${1.5 + Math.random()}s`;
            
            notesContainer.appendChild(note);
            
            // Eliminar después de animar
            setTimeout(() => note.remove(), 2000);
        }
    }, 300);
}

document.addEventListener('DOMContentLoaded', createMusicNotes);
function startLetterHunt() {
    currentGame = 'letterHunt';
    // Letras que suelen confundirse en dislexia (ampliado)
    const confusingLetters = ['b', 'd', 'p', 'q', 'n', 'u', 'm', 'w', 'a', 'e', 'f', 't', 'h', 's', 'z'];
    const targetLetter = confusingLetters[Math.floor(Math.random() * 8)]; // Usamos solo las 8 primeras para no hacerlo muy difícil
    let score = 0;
    let timeLeft = 30;
    let targetCount = 0;
    let timer;

    // Tamaño responsive compacto
    const gridSize = 5; // 5x5 (25 casillas)
    const cellSize = window.innerWidth < 600 ? '10vw' : '40px'; // Más pequeño que antes

    document.getElementById('gameContainer').innerHTML = `
        <div style="
            text-align: center;
            padding: 10px;
            max-width: 90%;
        ">
            <h3>Encuentra todas las: <span style="color: var(--main-color)">${targetLetter}</span></h3>
            <p>Tiempo: <span id="timeDisplay">${timeLeft}</span>s | Aciertos: <span id="huntScore">0</span></p>
            
            <div id="letterGrid" style="
                display: grid;
                grid-template-columns: repeat(${gridSize}, ${cellSize});
                grid-template-rows: repeat(${gridSize}, ${cellSize});
                gap: 3px;
                margin: 10px auto;
                justify-content: center;
            "></div>
            
            <button onclick="resetLetterHunt()" class="game-btn">🔄 Reiniciar</button>
        </div>
    `;

    const grid = document.getElementById('letterGrid');

    // Generar letras (25 en total)
    for (let i = 0; i < gridSize * gridSize; i++) {
        const letter = Math.random() > 0.75 ? targetLetter : 
            confusingLetters[Math.floor(Math.random() * confusingLetters.length)];
        
        if (letter === targetLetter) targetCount++;

        const letterBox = document.createElement('div');
        letterBox.textContent = letter;
        letterBox.style.cssText = `
            cursor: pointer;
            font-size: calc(${cellSize} * 0.5); /* Letras más pequeñas */
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #444;
            border-radius: 2px;
            background: #111;
            transition: all 0.2s;
            user-select: none;
        `;

        letterBox.onclick = () => {
            if (letter === targetLetter && letterBox.style.background !== 'var(--main-color)') {
                score++;
                document.getElementById('huntScore').textContent = score;
                letterBox.style.background = 'var(--main-color)';
                letterBox.style.color = '#000';
                speak(letter); // 🔊 Lee la letra en voz alta
                
                if (score === targetCount) {
                    clearInterval(timer);
                    speak("¡Excelente! Encontraste todas las " + targetLetter);
                    setTimeout(startLetterHunt, 2000);
                }
            } else if (letter !== targetLetter) {
                letterBox.style.background = '#f00';
                setTimeout(() => letterBox.style.background = '#111', 300);
            }
        };
        
        grid.appendChild(letterBox);
    }

    // Temporizador
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timeDisplay').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            speak("¡Tiempo terminado! La letra era " + targetLetter);
            grid.style.opacity = '0.6';
        }
    }, 1000);

    // Reinicio
    window.resetLetterHunt = () => {
        clearInterval(timer);
        startLetterHunt();
    };
}
function startMemoryGame() {
    // Namespace propio para evitar colisiones
    const MemoryGame = {
        sequence: [],
        userSequence: [],
        level: 1,
        lives: 3,
        isPlaying: false,
        synth: null,
        
        init: function() {
            // Limpiar contenedor
            document.getElementById('gameContainer').innerHTML = `
                <div style="text-align: center;">
                    <h3>Nivel: <span id="memoryLevel">1</span></h3>
                    <p>Vidas: <span id="memoryLives">❤️❤️❤️</span></p>
                    <div id="memoryGrid" style="
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                        width: min(200px, 90%);
                        margin: 20px auto;
                    "></div>
                    <button id="memoryStartBtn" class="game-btn">Comenzar</button>
                </div>
            `;

            // Crear botones
            const colors = ['#0ff', '#f0f', '#0f0', '#ff0'];
            const grid = document.getElementById('memoryGrid');
            
            colors.forEach((color, i) => {
                const btn = document.createElement('button');
                btn.className = 'memory-btn';
                btn.style.cssText = `
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: ${color};
                    border: none;
                    cursor: pointer;
                    margin: 0 auto;
                `;
                btn.onclick = () => this.handleClick(i + 1);
                grid.appendChild(btn);
            });

            document.getElementById('memoryStartBtn').onclick = () => this.playSequence();
        },

        playSequence: function() {
            if (this.isPlaying) return;
            this.isPlaying = true;
            document.getElementById('memoryStartBtn').disabled = true;

            // Añadir nuevo paso
            if (this.userSequence.length === 0) {
                this.sequence.push(Math.floor(Math.random() * 4) + 1);
            }

            let i = 0;
            const playNext = () => {
                if (i < this.sequence.length) {
                    this.highlightButton(this.sequence[i]);
                    i++;
                    setTimeout(playNext, 1000);
                } else {
                    this.isPlaying = false;
                    this.userSequence = [];
                }
            };
            playNext();
        },

        highlightButton: function(num) {
            const btn = document.querySelectorAll('.memory-btn')[num - 1];
            btn.style.transform = 'scale(0.8)';
            this.playSound(num);
            
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 500);
        },

        handleClick: function(num) {
            if (this.isPlaying || this.userSequence.length >= this.sequence.length) return;
            
            this.highlightButton(num);
            this.userSequence.push(num);

            // Verificar
            if (this.userSequence[this.userSequence.length - 1] !== 
                this.sequence[this.userSequence.length - 1]) {
                
                this.lives--;
                document.getElementById('memoryLives').textContent = '❤️'.repeat(this.lives);
                
                if (this.lives <= 0) {
                    this.gameOver();
                } else {
                    setTimeout(() => this.playSequence(), 1000);
                }
            } else if (this.userSequence.length === this.sequence.length) {
                this.levelUp();
            }
        },

        playSound: function(num) {
            if (!this.synth) {
                this.synth = new (window.AudioContext || window.webkitAudioContext)();
            }
            const freq = [261.63, 329.63, 392.00, 440.00][num - 1]; // Do, Mi, Sol, La
            const oscillator = this.synth.createOscillator();
            const gain = this.synth.createGain();
            oscillator.connect(gain);
            gain.connect(this.synth.destination);
            oscillator.type = 'sine';
            oscillator.frequency.value = freq;
            gain.gain.value = 0.1;
            oscillator.start();
            oscillator.stop(this.synth.currentTime + 0.3);
        },

        levelUp: function() {
            this.level++;
            document.getElementById('memoryLevel').textContent = this.level;
            setTimeout(() => {
                this.userSequence = [];
                this.playSequence();
            }, 1500);
        },

        gameOver: function() {
            alert(`¡Game Over! Alcanzaste nivel ${this.level}`);
            this.sequence = [];
            this.userSequence = [];
            this.level = 1;
            this.lives = 3;
            this.init();
        }
    };

    // Iniciar juego
    MemoryGame.init();
}


function startStoryGame() {
    const StoryGame = {
        stories: [
            {
                title: "Preparar el desayuno",
                steps: [
                    {text: "Abrir el refrigerador", img: "🚪"},
                    {text: "Sacar la leche", img: "🥛"},
                    {text: "Verter en el cereal", img: "🥣"},
                    {text: "Comer", img: "🍴"}
                ]
            },
            {
                title: "Lavarse los dientes",
                steps: [
                    {text: "Abrir el grifo", img: "🚰"},
                    {text: "Mojar el cepillo", img: "🪥"},
                    {text: "Poner pasta", img: "⬜"},
                    {text: "Cepillarse", img: "😬"}
                ]
            },
            {
                title: "Ir al colegio",
                steps: [
                    {text: "Vestir uniforme", img: "👕"},
                    {text: "Guardar útiles", img: "🎒"},
                    {text: "Subir al bus", img: "🚌"},
                    {text: "Saludar al profesor", img: "👨‍🏫"}
                ]
            },
            {
                title: "Hacer la tarea",
                steps: [
                    {text: "Abrir cuaderno", img: "📓"},
                    {text: "Leer instrucciones", img: "👀"},
                    {text: "Escribir respuestas", img: "✏️"},
                    {text: "Guardar materiales", img: "📚"}
                ]
            },
            {
                title: "Jugar fútbol",
                steps: [
                    {text: "Ponerse tenis", img: "👟"},
                    {text: "Buscar balón", img: "⚽"},
                    {text: "Ir a la cancha", img: "🏟️"},
                    {text: "Jugar partido", img: "⚽"}
                ]
            },
            {
                title: "Bañarse",
                steps: [
                    {text: "Abrir la ducha", img: "🚿"},
                    {text: "Mojar el cuerpo", img: "💧"},
                    {text: "Enjabonarse", img: "🧼"},
                    {text: "Secarse", img: "🧺"}
                ]
            },
            {
                title: "Preparar una pizza",
                steps: [
                    {text: "Amasar la masa", img: "🍞"},
                    {text: "Poner salsa", img: "🍅"},
                    {text: "Agregar queso", img: "🧀"},
                    {text: "Hornear", img: "🔥"}
                ]
            },
            {
                title: "Plantar una semilla",
                steps: [
                    {text: "Cavar un hoyo", img: "🕳️"},
                    {text: "Poner semilla", img: "🌱"},
                    {text: "Tapar con tierra", img: "⛏️"},
                    {text: "Regar", img: "💧"}
                ]
            },
            {
                title: "Hacer un dibujo",
                steps: [
                    {text: "Tomar papel", img: "📄"},
                    {text: "Elegir colores", img: "🖍️"},
                    {text: "Dibujar", img: "✏️"},
                    {text: "Firmar", img: "🖊️"}
                ]
            },
            {
                title: "Leer un libro",
                steps: [
                    {text: "Abrir libro", img: "📖"},
                    {text: "Leer página", img: "👀"},
                    {text: "Pasar hoja", img: "✋"},
                    {text: "Guardar libro", img: "📚"}
                ]
            }
        ],

        init: function() {
            this.currentStory = this.stories[Math.floor(Math.random() * this.stories.length)];
            
            document.getElementById('gameContainer').innerHTML = `
                <div style="text-align: center;">
                    <h3>Ordena: ${this.currentStory.title}</h3>
                    <div id="storySequence" style="
                        min-height: 150px;
                        margin: 10px auto;
                        border: 1px dashed var(--main-color);
                        border-radius: 6px;
                        padding: 6px;
                    "></div>
                    
                    <button id="checkStoryBtn" class="game-btn">Comprobar</button>
                    <p id="storyFeedback" style="min-height: 20px; margin-top: 8px;"></p>
                </div>
            `;

            this.createDraggableSteps();
        },

        createDraggableSteps: function() {
            const sequenceContainer = document.getElementById('storySequence');
            
            // Mezclar VERDADERAMENTE los pasos
            const shuffledSteps = [...this.currentStory.steps];
            for (let i = shuffledSteps.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledSteps[i], shuffledSteps[j]] = [shuffledSteps[j], shuffledSteps[i]];
            }
            
            // Crear tarjetas DESORDENADAS
            shuffledSteps.forEach((step) => {
                const stepElement = document.createElement('div');
                stepElement.dataset.originalIndex = this.currentStory.steps.indexOf(step);
                
                stepElement.innerHTML = `
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 10px;
                        background: rgba(0, 255, 255, 0.1);
                        border: 1px solid var(--main-color);
                        border-radius: 8px;
                        margin: 8px 0;
                        cursor: grab;
                    ">
                        <span style="font-size: 24px;">${step.img}</span>
                        <span>${step.text}</span>
                    </div>
                `;
                
                stepElement.draggable = true;
                
                stepElement.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', 'drag');
                    e.currentTarget.style.opacity = '0.5';
                });
                
                stepElement.addEventListener('dragend', (e) => {
                    e.currentTarget.style.opacity = '1';
                });
                
                sequenceContainer.appendChild(stepElement);
            });

            // Permitir reordenamiento
            sequenceContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = this.getDragAfterElement(sequenceContainer, e.clientY);
                const draggingElement = document.querySelector('[draggable=true][style*="opacity: 0.5"]');
                
                if (draggingElement) {
                    if (afterElement) {
                        sequenceContainer.insertBefore(draggingElement, afterElement);
                    } else {
                        sequenceContainer.appendChild(draggingElement);
                    }
                }
            });

            document.getElementById('checkStoryBtn').onclick = () => this.checkOrder();
        },

        getDragAfterElement: function(container, y) {
            const draggableElements = [...container.querySelectorAll('[draggable=true]:not([style*="opacity: 0.5"])')];
            
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        },

        checkOrder: function() {
            const sequenceContainer = document.getElementById('storySequence');
            const currentSteps = Array.from(sequenceContainer.children);
            
            const isCorrect = currentSteps.every((stepEl, currentPos) => {
                return parseInt(stepEl.dataset.originalIndex) === currentPos;
            });

            const feedback = document.getElementById('storyFeedback');
            
            if (isCorrect) {
                feedback.innerHTML = "✅ ¡Felicidades! Orden correcto";
                feedback.style.color = "#0f0";
                this.playSuccessSound();
                
                // Animación de celebración
                currentSteps.forEach((step, i) => {
                    setTimeout(() => {
                        step.firstChild.style.background = 'var(--main-color)';
                        step.firstChild.style.color = '#000';
                    }, i * 300);
                });
                
                // Cambiar a nueva historia después de 2 segundos
                setTimeout(() => this.init(), 2000);
            } else {
                feedback.innerHTML = "❌ Sigue intentando";
                feedback.style.color = "#f00";
                this.playTryAgainSound();
            }
        },

        playSuccessSound: function() {
            const utterance = new SpeechSynthesisUtterance("¡Excelente! Lo hiciste perfecto");
            utterance.lang = 'es-ES';
            utterance.rate = 0.9;
            speechSynthesis.speak(utterance);
        },

        playTryAgainSound: function() {
            const utterance = new SpeechSynthesisUtterance("Vamos, inténtalo de nuevo");
            utterance.lang = 'es-ES';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        }
    };

    StoryGame.init();
}
// Juego de Sonidos - Versión Mejorada
const SoundGame = {
    words: [
        { word: "casa", missing: "ca_a" }, 
        { word: "perro", missing: "pe__o" },
        { word: "gato", missing: "ga_o" },
        { word: "árbol", missing: "ár_ol" },
        { word: "sol", missing: "s_l" },
        { word: "luna", missing: "lu_a" },
        { word: "flor", missing: "fl_r" },
        { word: "agua", missing: "ag_a" },
        { word: "libro", missing: "li_ro" },
        { word: "mesa", missing: "me_a" },
        { word: "silla", missing: "si__a" },
        { word: "ventana", missing: "ve__ana" },
        { word: "puerta", missing: "pue__a" },
        { word: "cielo", missing: "cie_o" },
        { word: "tierra", missing: "tie__a" },
        { word: "fuego", missing: "fue_o" },
        { word: "niño", missing: "ni_ño" },
        { word: "niña", missing: "ni_ña" },
        { word: "escuela", missing: "es__ela" },
        { word: "maestro", missing: "mae__ro" }
    ],
    currentWord: null,
    score: 0,

    init: function() {
        this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
        
        document.getElementById('gameContainer').innerHTML = `
            <div style="text-align: center;">
                <h3>Completa la palabra:</h3>
                <p style="font-size: 2em; letter-spacing: 5px;">${this.currentWord.missing.replace(/_/g, ' ')}</p>
                
                <div style="margin: 20px;">
                    <input type="text" id="soundInput" placeholder="Escribe la palabra completa" 
                           style="padding: 10px; font-size: 16px; text-align: center;">
                </div>
                
                <button id="checkBtn" class="game-btn">Comprobar</button>
                <button id="playBtn" class="game-btn" style="margin-left: 10px;">🔊 Escuchar palabra completa</button>
                
                <p id="soundFeedback" style="min-height: 24px; margin-top: 15px;"></p>
                <p>Puntuación: <span id="soundScore">0</span></p>
            </div>
        `;

        // Asignamos eventos
        document.getElementById('checkBtn').onclick = () => this.checkAnswer();
        document.getElementById('playBtn').onclick = () => this.playFullWord(); // Cambiado a playFullWord
    },

    checkAnswer: function() {
        const userAnswer = document.getElementById('soundInput').value.trim().toLowerCase();
        const feedback = document.getElementById('soundFeedback');
        
        if (userAnswer === this.currentWord.word) {
            this.score++;
            document.getElementById('soundScore').textContent = this.score;
            feedback.innerHTML = "✅ ¡Correcto! La palabra es " + this.currentWord.word;
            feedback.style.color = "#0f0";
            
            // Animación de celebración
            const mouth = document.getElementById('mouth');
            mouth.classList.add('happy');
            setTimeout(() => mouth.classList.remove('happy'), 1000);
            
            setTimeout(() => {
                feedback.innerHTML = "";
                this.init();
            }, 2000);
        } else {
            feedback.innerHTML = "❌ Incorrecto. Intenta otra vez";
            feedback.style.color = "#f00";
            
            // Animación de error
            const mouth = document.getElementById('mouth');
            mouth.classList.add('angry');
            setTimeout(() => mouth.classList.remove('angry'), 1000);
        }
    },

    playFullWord: function() {
        if ('speechSynthesis' in window) {
            // Detener cualquier habla previa
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(this.currentWord.word);
            utterance.lang = 'es-ES';
            utterance.rate = 0.8;
            
            // Configurar voz en español si está disponible
            const voices = window.speechSynthesis.getVoices();
            const spanishVoice = voices.find(voice => voice.lang.includes('es'));
            if (spanishVoice) {
                utterance.voice = spanishVoice;
            }
            
            // Animación de boca hablando
            const mouth = document.getElementById('mouth');
            mouth.classList.add('surprised');
            
            utterance.onend = () => {
                mouth.classList.remove('surprised');
            };
            
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Tu navegador no soporta síntesis de voz. Prueba con Chrome o Edge.");
        }
    }
};

function startSoundGame() {
    // Asegurarnos de que las voces estén cargadas
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = SoundGame.init;
    }
    
    // Añadir animación al CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        #soundFeedback {
            transition: all 0.3s;
        }
    `;
    document.head.appendChild(style);

    SoundGame.init();
}


let currentGameIndex = 0;
const gameButtons = document.querySelectorAll('.game-slider .game-btn');

function showGame(index) {
    gameButtons.forEach(btn => btn.classList.remove('active'));
    gameButtons[index].classList.add('active');
    currentGameIndex = index;
}

function prevGame() {
    const newIndex = (currentGameIndex - 1 + gameButtons.length) % gameButtons.length;
    showGame(newIndex);
}

function nextGame() {
    const newIndex = (currentGameIndex + 1) % gameButtons.length;
    showGame(newIndex);
}

// Inicializar mostrando el primer juego
document.addEventListener('DOMContentLoaded', () => {
    showGame(0);
});

// Variables de la calculadora
let currentInput = '0';
let currentOperation = '';
let storedValue = null;
let operator = null;
let resetOnNextInput = false;

// Mostrar calculadora
function showCalculatorWindow() {
    document.getElementById('calculatorWindow').style.display = 'block';
    resetCalculator();
    changeExpression('surprised');
}

// Cerrar calculadora
function closeCalculatorWindow() {
    document.getElementById('calculatorWindow').style.display = 'none';
    changeExpression('happy');
}

// Actualizar displays
function updateDisplays() {
    document.getElementById('operationDisplay').textContent = currentOperation;
    document.getElementById('resultDisplay').textContent = currentInput;
}

// Añadir número/dígito
function appendToCalc(num) {
    if (resetOnNextInput) {
        resetCalculator();
        resetOnNextInput = false;
    }
    
    if (currentInput === '0' || currentInput === '-0') {
        currentInput = num;
    } else {
        currentInput += num;
    }
    
    if (operator) {
        currentOperation = `${storedValue} ${operator} ${currentInput}`;
    }
    
    updateDisplays();
}

// Establecer operador
function setOperator(op) {
    if (operator !== null && !resetOnNextInput) {
        calculate();
    }
    
    storedValue = parseFloat(currentInput);
    operator = op;
    currentOperation = `${currentInput} ${operator}`;
    currentInput = '0';
    resetOnNextInput = false;
    updateDisplays();
}

// Calcular resultado
function calculate() {
    if (operator === null) return;
    
    const currentValue = parseFloat(currentInput);
    let result;
    
    switch (operator) {
        case '+': result = storedValue + currentValue; break;
        case '-': result = storedValue - currentValue; break;
        case '*': result = storedValue * currentValue; break;
        case '/': result = storedValue / currentValue; break;
        default: return;
    }
    
    currentOperation = `${storedValue} ${operator} ${currentValue} =`;
    currentInput = String(result);
    operator = null;
    resetOnNextInput = true;
    updateDisplays();
    
    // CyberPet reacciona al resultado
    if (result < 0) {
        changeExpression('angry');
    } else if (result % 1 !== 0) {
        changeExpression('surprised');
    } else {
        changeExpression('happy');
    }
}

// Limpiar calculadora
function clearCalc() {
    resetCalculator();
}

// Borrar último dígito
function backspace() {
    if (currentInput.length === 1 || (currentInput.length === 2 && currentInput.startsWith('-'))) {
        currentInput = '0';
    } else {
        currentInput = currentInput.slice(0, -1);
    }
    
    if (operator) {
        currentOperation = `${storedValue} ${operator} ${currentInput}`;
    }
    
    updateDisplays();
}

// Reiniciar calculadora
function resetCalculator() {
    currentInput = '0';
    currentOperation = '';
    storedValue = null;
    operator = null;
    resetOnNextInput = false;
    updateDisplays();
}

// Mostrar/Ocultar
function showNotesWindow() {
    document.getElementById('notesWindow').style.display = 'flex';
    changeExpression('happy');
}

function closeNotesWindow() {
    document.getElementById('notesWindow').style.display = 'none';
}

// Formatear texto
function formatText(format) {
    const content = document.getElementById('notesContent');
    document.execCommand(format, false, null);
    content.focus();
}

// Guardar como Word (.docx)
function saveAsWord() {
    const content = document.getElementById('notesContent').innerHTML;
    const preHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head><title>Tareas CyberPet</title></head>
        <body>
    `;
    const postHtml = '</body></html>';
    const html = preHtml + content + postHtml;

    const blob = new Blob(['\ufeff', html], {
        type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Tareas-CyberPet.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // CyberPet reacciona
    changeExpression('surprised');
    setTimeout(() => changeExpression('happy'), 1000);
}

// Cambiar color del texto
document.getElementById('textColor').addEventListener('input', function() {
    document.execCommand('foreColor', false, this.value);
    document.getElementById('notesContent').focus();
});
// Array de colores para el ciclo
const highlightColors = [
    { color: '#FFFF00', emoji: '🟨', name: 'Amarillo' },      // Amarillo
    { color: '#87CEEB', emoji: '🟦', name: 'Azul' },         // Azul claro
    { color: '#000000', emoji: '⬛', name: 'Negro' },         // Negro
    { color: '#FFFFFF', emoji: '⬜', name: 'Blanco' },        // Blanco  
    { color: '#90EE90', emoji: '🟩', name: 'Verde' },        // Verde claro
    { color: '#FF6B6B', emoji: '🟥', name: 'Rojo' },         // Rojo claro
    { color: 'transparent', emoji: '❌', name: 'Quitar' }     // Quitar resaltado
];

let currentColorIndex = 0;

// Función que CICLA entre colores y aplica el actual
function cycleHighlightColor() {
    const content = document.getElementById('notesContent');
    const highlighterBtn = document.getElementById('colorHighlighter');
    
    // Verificar si hay texto seleccionado
    const selection = window.getSelection();
    if (selection.toString().trim() === '') {
        // Si no hay selección, solo cambiar el color para la próxima vez
        currentColorIndex = (currentColorIndex + 1) % highlightColors.length;
        updateHighlighterButton();
        return;
    }
    
    // Aplicar el color actual a la selección
    const currentColor = highlightColors[currentColorIndex];
    
    if (currentColor.color === 'transparent') {
        // Quitar resaltado
        document.execCommand('styleWithCSS', false, true);
        document.execCommand('hiliteColor', false, 'transparent');
        removeAllHighlights();
    } else {
        // Aplicar color de resaltado
        document.execCommand('styleWithCSS', false, true);
        document.execCommand('hiliteColor', false, currentColor.color);
    }
    
    content.focus();
    
    // Pasar al siguiente color para la próxima vez
    currentColorIndex = (currentColorIndex + 1) % highlightColors.length;
    updateHighlighterButton();
    
    // Animación sutil de CyberPet
    const mouth = document.getElementById('mouth');
    mouth.classList.add('happy');
    setTimeout(() => mouth.classList.remove('happy'), 500);
}

// Actualizar el botón con el color actual MEJORADO
function updateHighlighterButton() {
    const highlighterBtn = document.getElementById('colorHighlighter');
    const currentColor = highlightColors[currentColorIndex];
    
    highlighterBtn.textContent = currentColor.emoji;
    highlighterBtn.title = `Resaltar - ${currentColor.name}`;
    
    // ESTILO MEJORADO: El botón muestra el color que aplicará
    if (currentColor.color === 'transparent') {
        // Para "Quitar" - fondo rojo
        highlighterBtn.style.background = '#ff4444';
        highlighterBtn.style.color = '#FFFFFF';
        highlighterBtn.style.border = '2px solid #ff0000';
    } else {
        // Para colores - fondo del color que aplicará
        highlighterBtn.style.background = currentColor.color;
        highlighterBtn.style.border = `2px solid ${getBorderColor(currentColor.color)}`;
        highlighterBtn.style.color = getTextColor(currentColor.color);
    }
}

// Función para determinar color del texto (contraste)
function getTextColor(backgroundColor) {
    if (backgroundColor === '#000000') return '#FFFFFF'; // Negro → Blanco
    if (backgroundColor === '#FFFFFF') return '#000000'; // Blanco → Negro
    return '#000000'; // Para otros colores, texto negro
}

// Función para determinar color del borde (contraste)
function getBorderColor(backgroundColor) {
    if (backgroundColor === '#000000') return '#FFFFFF'; // Negro → Borde blanco
    if (backgroundColor === '#FFFFFF') return '#000000'; // Blanco → Borde negro
    if (backgroundColor === '#FFFF00') return '#000000'; // Amarillo → Borde negro
    return '#000000'; // Para otros colores, borde negro
}

// Función para quitar todos los resaltados
function removeAllHighlights() {
    const content = document.getElementById('notesContent');
    const coloredSpans = content.querySelectorAll('span[style*="background-color"]');
    
    coloredSpans.forEach(span => {
        const textNode = document.createTextNode(span.textContent);
        span.parentNode.replaceChild(textNode, span);
    });
    
    content.normalize();
}

// Inicializar el botón al cargar
document.addEventListener('DOMContentLoaded', function() {
    updateHighlighterButton();
});

// Función mejorada para formatear texto
function formatText(format) {
    const content = document.getElementById('notesContent');
    if (format === 'removeFormat') {
        document.execCommand('removeFormat', false, null);
        content.style.color = '#000'; // Fuerza texto negro al quitar formato
    } else {
        document.execCommand(format, false, null);
    }
    content.focus();
}

// Funciones para mostrar/ocultar la ventana
function showTranslatorWindow() {
    document.getElementById('translatorWindow').style.display = 'block';
    document.getElementById('sourceText').focus();
}

function closeTranslatorWindow() {
    document.getElementById('translatorWindow').style.display = 'none';
}

// Función para intercambiar idiomas
function swapLanguages() {
    const source = document.getElementById('sourceLanguage');
    const target = document.getElementById('targetLanguage');
    const temp = source.value;
    source.value = target.value;
    target.value = temp;
}

// Función principal de traducción
async function translateText() {
    const sourceText = document.getElementById('sourceText').value.trim();
    const sourceLang = document.getElementById('sourceLanguage').value;
    const targetLang = document.getElementById('targetLanguage').value;
    const resultDiv = document.getElementById('translationResult');
    
    if (!sourceText) {
        resultDiv.textContent = "Por favor escribe algo para traducir";
        return;
    }
    
    resultDiv.innerHTML = '<div class="loading-spinner"></div> Traduciendo...';
    
    try {
        // Usaremos la API de traducción de Google (versión simple)
        const translation = await translateWithAPI(sourceText, sourceLang, targetLang);
        resultDiv.textContent = translation;
        
        // Animación de éxito
        const mouth = document.getElementById('mouth');
        mouth.classList.add('happy');
        setTimeout(() => mouth.classList.remove('happy'), 1000);
    } catch (error) {
        console.error("Error de traducción:", error);
        resultDiv.textContent = "Error al traducir. Intenta nuevamente.";
        
        // Animación de error
        const mouth = document.getElementById('mouth');
        mouth.classList.add('angry');
        setTimeout(() => mouth.classList.remove('angry'), 1000);
    }
}

// Función para traducir usando la API de Google (versión simple)
async function translateWithAPI(text, sourceLang, targetLang) {
    // NOTA: En producción, deberías usar una API oficial con clave
    // Esta es una implementación simple para demostración
    
    // URL de la API de Google Translate (versión simple)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Procesar la respuesta (la API devuelve una estructura compleja)
    if (data && Array.isArray(data[0])) {
        return data[0].map(item => item[0]).join('');
    }
    
    throw new Error("Formato de respuesta inesperado");
}

// =============================================
// FUNCIÓN PRINCIPAL PARA HACER VENTANAS ARRASTRABLES
// =============================================

function makeDraggable(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
    // Usa tus headers ya definidos
    const header = elmnt.querySelector('.window-header, .notes-window-header, .food-window-header, .games-window-header, .search-header, .custom-panel h4, .calculator-window-header, .translator-window-header') || elmnt;
  
    header.style.cursor = 'move';
    header.onmousedown = dragMouseDown;
  
    function dragMouseDown(e) {
      if (isInteractiveElement(e.target)) return;
      e.preventDefault();
  
      // Si la ventana aún está centrada con transform, conviértelo a px
      const cs = window.getComputedStyle(elmnt);
      if (cs.transform !== 'none') {
        const rect = elmnt.getBoundingClientRect();
        elmnt.style.transform = 'none';
        elmnt.style.top = rect.top + 'px';
        elmnt.style.left = rect.left + 'px';
      }
  
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
  
      bringWindowToFront(elmnt);
    }
  
    function elementDrag(e) {
      e.preventDefault();
  
      // Delta de movimiento
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
  
      // Nueva posición propuesta
      let newLeft = elmnt.offsetLeft - pos1;
      let newTop  = elmnt.offsetTop  - pos2;
  
      // Limitar al viewport
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = elmnt.offsetWidth;
      const h = elmnt.offsetHeight;
  
      newLeft = Math.max(0, Math.min(newLeft, vw - w));
      newTop  = Math.max(0, Math.min(newTop,  vh - h));
  
      // Aplicar
      elmnt.style.left = newLeft + 'px';
      elmnt.style.top  = newTop + 'px';
    }
  
    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
  
  // Opcional: reacomoda cualquier ventana visible si cambia el tamaño de pantalla
  function constrainToViewport(elmnt) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = elmnt.offsetWidth;
    const h = elmnt.offsetHeight;
  
    let left = parseFloat(elmnt.style.left || 0);
    let top  = parseFloat(elmnt.style.top  || 0);
  
    // Si no hay left/top, lee desde el rect actual
    if (isNaN(left) || isNaN(top)) {
      const rect = elmnt.getBoundingClientRect();
      left = rect.left;
      top  = rect.top;
    }
  
    left = Math.max(0, Math.min(left, vw - w));
    top  = Math.max(0, Math.min(top,  vh - h));
  
    elmnt.style.left = left + 'px';
    elmnt.style.top  = top  + 'px';
  }
  
  // Recentrar ventanas flotantes al cambiar el tamaño
window.addEventListener('resize', () => {
    const modals = document.querySelectorAll(
      '.games-window, .custom-panel, .search-panel, .translator-window, .notes-window, .food-window'
    );
  
    modals.forEach(modal => {
      if (modal.style.display !== 'none') {
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
      }
    });
  });

  // Toggle del panel con pestaña en móviles
document.getElementById("statsTab").addEventListener("click", () => {
    const panel = document.getElementById("statsPanel");
    panel.classList.toggle("open");
  });
  

  

// =============================================
// FUNCIONES AUXILIARES
// =============================================

function isInteractiveElement(element) {
    // Elementos que no deben iniciar el arrastre
    return element.isContentEditable || 
           ['INPUT', 'TEXTAREA', 'BUTTON', 'A', 'SELECT'].includes(element.tagName) ||
           element.closest('[contenteditable="true"], .notes-content, .notes-toolbar');
}

function bringWindowToFront(windowElement) {
    // Encontrar el z-index más alto actual
    let maxZ = 1000;
    document.querySelectorAll('.window-draggable, .food-window, .games-window, .notes-window, .search-panel, .custom-panel, .calculator-window, .translator-window').forEach(win => {
        const z = parseInt(win.style.zIndex || 0);
        if (z > maxZ) maxZ = z;
    });
    
    // Establecer nuevo z-index
    windowElement.style.zIndex = maxZ + 1;
}

// =============================================
// INICIALIZACIÓN DE VENTANAS ARRASTRABLES
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    // Lista de todas las ventanas flotantes
    const draggableWindows = [
        'foodWindow',
        'gamesWindow',
        'searchPanel',
        'customPanel',
        'calculatorWindow',
        'notesWindow',
        'translatorWindow',
        'calendarWindow'
    ];
    
    // Hacer cada ventana arrastrable
    draggableWindows.forEach(id => {
        const windowElement = document.getElementById(id);
        if (windowElement) {
            makeDraggable(windowElement);
            
            // Configuración especial para la ventana de notas
            if (id === 'notesWindow') {
                const notesContent = document.getElementById('notesContent');
                if (notesContent) {
                    notesContent.contentEditable = true;
                }
            }
        }
    });
});

// =============================================
// FUNCIONES DE APERTURA DE VENTANAS (ACTUALIZADAS)
// =============================================

function showNotesWindow() {
    const notesWindow = document.getElementById('notesWindow');
    if (!notesWindow) return;
    
    notesWindow.style.display = 'flex';
    
    // Posición inicial si no está ya posicionada
    if (!notesWindow.style.top) {
        notesWindow.style.top = '50%';
        notesWindow.style.left = '50%';
        notesWindow.style.transform = 'translate(-50%, -50%)';
    }
    
    // Traer al frente y enfocar el contenido
    bringWindowToFront(notesWindow);
    const notesContent = document.getElementById('notesContent');
    if (notesContent) {
        notesContent.focus();
    }
}

// Mantén tus otras funciones show...Window() como están
// (showFoodWindow, showGamesWindow, etc.)

// ==========================
// 🔹 Resetear posición de ventanas al cerrar (incluye todas)
// ==========================

// Guardar estilos iniciales de cada ventana
const initialWindowStyles = {};

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(
        ".games-window, .translator-window, .notes-window, .custom-panel, .search-panel, .food-window, .calculator-window"
    ).forEach(win => {
        // Guardar sus estilos iniciales tal cual están
        initialWindowStyles[win.id] = {
            top: win.style.top || "",
            left: win.style.left || "",
            right: win.style.right || "",
            bottom: win.style.bottom || "",
            transform: win.style.transform || ""
        };
    });

    // Interceptar todos los botones de cerrar
    document.querySelectorAll(".close-btn, .search-close").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const win = e.target.closest(
                ".games-window, .translator-window, .notes-window, .custom-panel, .search-panel, .food-window, .calculator-window"
            );
            if (win && initialWindowStyles[win.id]) {
                // Restaurar los estilos iniciales
                const styles = initialWindowStyles[win.id];
                win.style.top = styles.top;
                win.style.left = styles.left;
                win.style.right = styles.right;
                win.style.bottom = styles.bottom;
                win.style.transform = styles.transform;
            }
        });
    });
});
// =============================================
// SISTEMA DE TEMPORADAS ESPECIALES - COMPLETO
// =============================================

// Variables para control de temporadas
let currentSeason = null;
let seasonIntervals = [];

// Activar una temporada completa
function activateSeason(season) {
    // Desactivar temporada anterior
    deactivateAllSeasons();
    
    // Actualizar botón activo
    document.querySelectorAll('.season-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Marcar el botón clickeado como activo
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    currentSeason = season;
    
    // Aplicar elementos de la temporada
    switch(season) {
        case 'christmas':
            activateChristmas();
            break;
        case 'halloween':
            activateHalloween();
            break;
        case 'valentine':
            activateValentine();
            break;
        case 'easter':
            activateEaster();
            break;
        case 'summer':
            activateSummer();
            break;
    }
    
    console.log(`Temporada activada: ${season}`);
}

// Desactivar todas las temporadas
function deactivateAllSeasons() {
    // Parar todos los intervalos
    seasonIntervals.forEach(interval => {
        if (interval) clearInterval(interval);
    });
    seasonIntervals = [];
    
    // Remover todos los elementos de temporada
    document.querySelectorAll('.season-element').forEach(el => {
        el.remove();
    });
    
    // Remover clases activas de botones
    document.querySelectorAll('.season-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    currentSeason = null;
    console.log("Todas las temporadas desactivadas");
}

// =============================================
// TEMPORADAS ESPECÍFICAS
// =============================================

function activateChristmas() {
    // Nieve constante (más densa)
    seasonIntervals.push(setInterval(() => {
        createFallingElement('❄', '#ffffff', 12, 8, 'fall-rotate', 'cyan');
    }, 80));
    
    // Copos de nieve grandes
    seasonIntervals.push(setInterval(() => {
        createFallingElement('❄️', '#ffffff', 20, 12, 'fall-rotate', 'lightblue');
    }, 300));
    
    // Regalos cayendo
    seasonIntervals.push(setInterval(() => {
        createFallingElement('🎁', '#ff0000', 25, 10, 'fall-rotate', 'red');
    }, 1500));
    
    // Estrellas brillantes
    seasonIntervals.push(setInterval(() => {
        createFloatingElement('⭐', '#ffff00', 22, 15, 'bounce');
    }, 2000));
}

function activateHalloween() {
    // Calabazas cayendo constantemente
    seasonIntervals.push(setInterval(() => {
        createFallingElement('🎃', '#ff6600', 28, 9, 'fall-rotate', 'orange');
    }, 200));
    
    // Calabazas pequeñas
    seasonIntervals.push(setInterval(() => {
        createFallingElement('🎃', '#ff8c42', 20, 7, 'fall-rotate', 'darkorange');
    }, 150));
    
    // Fantasmas cayendo
    seasonIntervals.push(setInterval(() => {
        createFallingElement('👻', '#ffffff', 24, 11, 'fall-rotate', 'white');
    }, 400));
    
    // Murciélagos volando
    seasonIntervals.push(setInterval(() => {
        createFlyingElement('🦇', '#663399', 18, 8, 'float-gentle');
    }, 600));
    
    // Sombras misteriosas
    seasonIntervals.push(setInterval(() => {
        createFloatingElement('💀', '#888888', 22, 12, 'spooky-float');
    }, 2500));
}

function activateValentine() {
    // Corazones pequeños cayendo densamente
    seasonIntervals.push(setInterval(() => {
        createFallingElement('💖', '#ff66a3', 16, 6, 'fall-rotate', 'pink');
    }, 100));
    
    // Corazones medianos
    seasonIntervals.push(setInterval(() => {
        createFallingElement('💕', '#ff3388', 22, 8, 'fall-rotate', 'hotpink');
    }, 180));
    
    // Rosas cayendo
    seasonIntervals.push(setInterval(() => {
        createFallingElement('🌹', '#ff0066', 26, 10, 'fall-rotate', 'red');
    }, 500));
    
    // Besos flotantes
    seasonIntervals.push(setInterval(() => {
        createFloatingElement('💋', '#ff3366', 20, 8, 'bounce');
    }, 1200));
}

function activateEaster() {
    // Huevos de pascua cayendo constantemente
    seasonIntervals.push(setInterval(() => {
        createFallingElement('🥚', '#ffff00', 20, 7, 'fall-rotate', 'yellow');
    }, 120));
    
    // Huevos de colores
    seasonIntervals.push(setInterval(() => {
        const eggColors = ['#ff6666', '#66ff66', '#6666ff', '#ff66ff'];
        const randomColor = eggColors[Math.floor(Math.random() * eggColors.length)];
        createFallingElement('🥚', randomColor, 18, 6, 'fall-rotate', randomColor);
    }, 100));
    
    // Conejitos saltando (cayendo con bounce)
    seasonIntervals.push(setInterval(() => {
        createFallingElement('🐇', '#ffffff', 24, 9, 'bounce-fall', 'white');
    }, 800));
    
    // Pollitos cayendo
    seasonIntervals.push(setInterval(() => {
        createFallingElement('🐤', '#ffff00', 22, 8, 'fall-rotate', 'yellow');
    }, 600));
    
    // Flores primaverales
    seasonIntervals.push(setInterval(() => {
        createFloatingElement('🌼', '#ffff00', 20, 12, 'float-gentle');
    }, 1500));
}

function activateSummer() {
    // Gotas de agua/lluvia de verano
    seasonIntervals.push(setInterval(() => {
        createFallingElement('💧', '#0099ff', 16, 5, 'fall-fast', 'lightblue');
    }, 80));
    
    // Conchas marinas cayendo
    seasonIntervals.push(setInterval(() => {
        createFallingElement('🐚', '#ffcc99', 20, 8, 'fall-rotate', 'peachpuff');
    }, 200));
    
    // Estrellas de mar
    seasonIntervals.push(setInterval(() => {
        createFallingElement('🌟', '#ffff99', 22, 9, 'fall-rotate', 'lightyellow');
    }, 300));
    
    // Helados cayendo
    seasonIntervals.push(setInterval(() => {
        const iceCreamColors = ['#ff99cc', '#99ff99', '#9999ff'];
        const randomColor = iceCreamColors[Math.floor(Math.random() * iceCreamColors.length)];
        createFallingElement('🍦', randomColor, 26, 10, 'fall-rotate', randomColor);
    }, 600));
    
    // Soles brillantes flotantes
    seasonIntervals.push(setInterval(() => {
        createFloatingElement('☀️', '#ffff00', 30, 15, 'spin-slow');
    }, 2000));
}

// =============================================
// FUNCIONES AUXILIARES
// =============================================

function createFallingElement(emoji, color, size, duration, animation, glowColor) {
    const element = document.createElement('div');
    element.className = 'season-element';
    element.textContent = emoji;
    element.style.cssText = `
        top: -50px;
        left: ${Math.random() * 100}vw;
        color: ${color};
        font-size: ${size}px;
        animation: ${animation} ${duration}s linear infinite;
        text-shadow: 0 0 8px ${glowColor || color}, 0 0 16px ${glowColor || color};
        z-index: -1;
        opacity: ${0.7 + Math.random() * 0.3};
    `;
    
    document.body.appendChild(element);
    setTimeout(() => {
        if (element.parentNode) {
            element.remove();
        }
    }, duration * 1000);
}

function createFloatingElement(emoji, color, size, duration, animation) {
    const element = document.createElement('div');
    element.className = 'season-element';
    element.textContent = emoji;
    element.style.cssText = `
        top: ${Math.random() * 100}vh;
        left: ${Math.random() * 100}vw;
        color: ${color};
        font-size: ${size}px;
        animation: ${animation} ${duration}s infinite;
        text-shadow: 0 0 10px ${color}, 0 0 20px ${color};
        z-index: -1;
        opacity: 0.9;
    `;
    
    document.body.appendChild(element);
    setTimeout(() => {
        if (element.parentNode) {
            element.remove();
        }
    }, duration * 1000);
}

function createFlyingElement(emoji, color, size, duration, animation) {
    const element = document.createElement('div');
    element.className = 'season-element';
    element.textContent = emoji;
    element.style.cssText = `
        top: ${Math.random() * 100}vh;
        left: -50px;
        color: ${color};
        font-size: ${size}px;
        animation: ${animation} ${duration}s infinite;
        text-shadow: 0 0 10px ${color}, 0 0 20px ${color};
        z-index: -1;
        opacity: 0.8;
    `;
    
    document.body.appendChild(element);
    setTimeout(() => {
        if (element.parentNode) {
            element.remove();
        }
    }, duration * 1000);
}

// Función para limpiar cuando se abran ventanas (opcional)
function cleanDecorationsForWindows() {
    const elements = document.querySelectorAll('.season-element');
    elements.forEach(el => {
        el.style.opacity = '0.3';
    });
}

function restoreDecorations() {
    const elements = document.querySelectorAll('.season-element');
    elements.forEach(el => {
        el.style.opacity = '1';
    });
}

// =============================================
// INICIALIZACIÓN OPCIONAL

document.addEventListener('DOMContentLoaded', function() {
    // Detección automática por fecha (opcional)
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    if ((month === 12 && day >= 15) || (month === 1 && day <= 6)) {
        activateSeason('christmas');
    } else if (month === 10 && day >= 20) {
        activateSeason('halloween');
    } else if (month === 2 && day >= 10 && day <= 15) {
        activateSeason('valentine');
    } else if (month === 3 || month === 4) {
        activateSeason('easter');
    } else if (month >= 6 && month <= 8) {
        activateSeason('summer');
    }
});
// =============================================
// SISTEMA DE DECORACIÓN DE HABITACIÓN - COMPLETO
// =============================================

// Variables para el sistema de decoración
let currentDecorations = [];
let selectedDecorationType = null;
let selectedDecorationImage = null;
let isDraggingNewDecoration = false;
let ghostDecoration = null;

// Inicializar sistema de decoración
function initDecorationSystem() {
    loadSavedDecorations();
    setupDecorationEventListeners();
}

// Configurar event listeners para botones de decoración
function setupDecorationEventListeners() {
    document.querySelectorAll('.decor-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemType = this.getAttribute('data-item');
            const itemImage = this.getAttribute('data-img');
            selectDecoration(itemType, itemImage);
        });
    });
}

// Seleccionar decoración (cierra panel y activa modo arrastre)
function selectDecoration(type, imageSrc) {
    selectedDecorationType = type;
    selectedDecorationImage = imageSrc;
    
    // Cerrar panel de personalización
    document.getElementById('customPanel').style.display = 'none';
    
    // Cambiar cursor a la imagen seleccionada
    document.body.style.cursor = `url('${imageSrc}') 25 25, auto`;
    
    // Activar modo arrastre
    activateDragMode();
    
    // Mensaje de ayuda
    addMessage(`¡Listo! Ahora arrastra ${type} a donde quieras colocarlo.`, 'bot');
}

// Activar modo arrastre para nueva decoración
function activateDragMode() {
    isDraggingNewDecoration = true;
    
    // Crear ghost inicial
    createGhostDecoration(100, 100);
    
    // Event listeners para el arrastre
    document.addEventListener('mousemove', dragNewDecoration);
    document.addEventListener('mouseup', placeNewDecoration);
    
    // También para touch en móviles
    document.addEventListener('touchmove', dragNewDecorationTouch);
    document.addEventListener('touchend', placeNewDecorationTouch);
}

// Crear decoración fantasma (previsualización)
function createGhostDecoration(x, y) {
    // Eliminar ghost anterior si existe
    if (ghostDecoration) {
        ghostDecoration.remove();
    }
    
    ghostDecoration = document.createElement('img');
    ghostDecoration.id = 'decor-ghost';
    ghostDecoration.className = 'room-decoration ghost';
    ghostDecoration.src = selectedDecorationImage;
    ghostDecoration.setAttribute('data-type', selectedDecorationType);
    ghostDecoration.style.left = (x - 50) + 'px';
    ghostDecoration.style.top = (y - 50) + 'px';
    ghostDecoration.style.opacity = '0.7';
    ghostDecoration.style.pointerEvents = 'none';
    
    document.body.appendChild(ghostDecoration);
}

// Arrastrar nueva decoración (mouse)
function dragNewDecoration(e) {
    if (!isDraggingNewDecoration || !ghostDecoration) return;
    
    ghostDecoration.style.left = (e.clientX - 50) + 'px';
    ghostDecoration.style.top = (e.clientY - 50) + 'px';
}

// Arrastrar nueva decoración (touch)
function dragNewDecorationTouch(e) {
    if (!isDraggingNewDecoration || !ghostDecoration) return;
    
    e.preventDefault();
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        ghostDecoration.style.left = (touch.clientX - 50) + 'px';
        ghostDecoration.style.top = (touch.clientY - 50) + 'px';
    }
}

// Colocar nueva decoración (mouse)
function placeNewDecoration(e) {
    if (!isDraggingNewDecoration) return;
    
    createPermanentDecoration(e.clientX, e.clientY);
    deactivateDragMode();
}

// Colocar nueva decoración (touch)
function placeNewDecorationTouch(e) {
    if (!isDraggingNewDecoration) return;
    
    e.preventDefault();
    if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        createPermanentDecoration(touch.clientX, touch.clientY);
    }
    deactivateDragMode();
}

// Crear decoración permanente - ACTUALIZADA para mejor posicionamiento
function createPermanentDecoration(x, y) {
    const decoration = document.createElement('img');
    const id = `decor-${selectedDecorationType}-${Date.now()}`;
    
    decoration.id = id;
    decoration.className = 'room-decoration';
    decoration.src = selectedDecorationImage;
    decoration.setAttribute('data-type', selectedDecorationType);
    decoration.setAttribute('data-id', id);
    
    // Posición final - Ajustada para mejor colocación
    const finalX = Math.max(0, x - 50);
    const finalY = Math.max(0, y - 50);
    decoration.style.left = `${finalX}px`;
    decoration.style.top = `${finalY}px`;
    
    // Hacerlo arrastrable para reposicionar
    makeDecorationDraggable(decoration);
    
    document.body.appendChild(decoration);
    
    // Guardar en array y localStorage
    const decorData = {
        id: id,
        type: selectedDecorationType,
        image: selectedDecorationImage,
        x: finalX,
        y: finalY
    };
    
    currentDecorations.push(decorData);
    saveDecorations();
    
    addMessage(`¡${selectedDecorationType} colocado! Puedes moverlo cuando quieras.`, 'bot');
}

// Desactivar modo arrastre
function deactivateDragMode() {
    isDraggingNewDecoration = false;
    selectedDecorationType = null;
    selectedDecorationImage = null;
    document.body.style.cursor = '';
    
    // Remover event listeners
    document.removeEventListener('mousemove', dragNewDecoration);
    document.removeEventListener('mouseup', placeNewDecoration);
    document.removeEventListener('touchmove', dragNewDecorationTouch);
    document.removeEventListener('touchend', placeNewDecorationTouch);
    
    // Eliminar ghost si existe
    if (ghostDecoration) {
        ghostDecoration.remove();
        ghostDecoration = null;
    }
}

// Hacer elementos decorativos existentes arrastrables (para reposicionar)
function makeDecorationDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;
    
    element.onmousedown = dragMouseDown;
    element.ontouchstart = dragTouchStart;
    
    function dragMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();
        startDrag(e.clientX, e.clientY);
    }
    
    function dragTouchStart(e) {
        e.preventDefault();
        e.stopPropagation();
        const touch = e.touches[0];
        startDrag(touch.clientX, touch.clientY);
    }
    
    function startDrag(x, y) {
        isDragging = true;
        bringDecorationToFront(element);
        element.classList.add('dragging');
        pos3 = x;
        pos4 = y;
        
        document.onmousemove = elementDrag;
        document.ontouchmove = elementDragTouch;
        document.onmouseup = closeDragElement;
        document.ontouchend = closeDragElement;
    }
    
    function elementDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        updatePosition(e.clientX, e.clientY);
    }
    
    function elementDragTouch(e) {
        if (!isDragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        updatePosition(touch.clientX, touch.clientY);
    }
    
    function updatePosition(x, y) {
        pos1 = pos3 - x;
        pos2 = pos4 - y;
        pos3 = x;
        pos4 = y;
        
        const newX = element.offsetLeft - pos1;
        const newY = element.offsetTop - pos2;
        
        // Limitar al viewport
        const maxX = window.innerWidth - element.offsetWidth;
        const maxY = window.innerHeight - element.offsetHeight;
        
        element.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
        element.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
    }
    
    function closeDragElement() {
        isDragging = false;
        element.classList.remove('dragging');
        updateDecorationPosition(element);
        
        document.onmousemove = null;
        document.ontouchmove = null;
        document.onmouseup = null;
        document.ontouchend = null;
    }
}

// Traer decoración al frente - ACTUALIZADA para límites
function bringDecorationToFront(element) {
    const allDecorations = document.querySelectorAll('.room-decoration:not(.ghost)');
    let maxZ = 1;
    
    allDecorations.forEach(decor => {
        const z = parseInt(decor.style.zIndex || 1);
        if (z > maxZ) maxZ = z;
    });
    
    element.style.zIndex = maxZ + 1;
}

// Actualizar posición en datos
function updateDecorationPosition(element) {
    const id = element.getAttribute('data-id');
    const index = currentDecorations.findIndex(decor => decor.id === id);
    
    if (index !== -1) {
        currentDecorations[index].x = parseInt(element.style.left);
        currentDecorations[index].y = parseInt(element.style.top);
        saveDecorations();
    }
}

// Guardar decoraciones en localStorage
function saveDecorations() {
    localStorage.setItem('cyberpetRoomDecorations', JSON.stringify(currentDecorations));
}

// Cargar decoraciones guardadas
function loadSavedDecorations() {
    const saved = localStorage.getItem('cyberpetRoomDecorations');
    
    if (saved) {
        try {
            currentDecorations = JSON.parse(saved);
            
            currentDecorations.forEach(decor => {
                // Verificar que la decoración tenga todos los datos necesarios
                if (decor.id && decor.type && decor.image && decor.x !== undefined && decor.y !== undefined) {
                    const decoration = document.createElement('img');
                    decoration.id = decor.id;
                    decoration.className = 'room-decoration';
                    decoration.src = decor.image;
                    decoration.setAttribute('data-type', decor.type);
                    decoration.setAttribute('data-id', decor.id);
                    decoration.style.left = decor.x + 'px';
                    decoration.style.top = decor.y + 'px';
                    
                    makeDecorationDraggable(decoration);
                    document.body.appendChild(decoration);
                }
            });
        } catch (error) {
            console.error('Error loading decorations:', error);
            currentDecorations = [];
        }
    }
}

// Limpiar todas las decoraciones SIN confirmación
function clearAllDecorations() {
    document.querySelectorAll('.room-decoration').forEach(decor => {
        // No eliminar el ghost si está activo
        if (!decor.classList.contains('ghost')) {
            decor.remove();
        }
    });
    
    currentDecorations = [];
    localStorage.removeItem('cyberpetRoomDecorations');
    addMessage("¡Todas las decoraciones han sido eliminadas!", 'bot');
}

// Cancelar modo decoración si se hace clic fuera
document.addEventListener('click', function(e) {
    // Si estamos en modo decoración y hacemos clic en un botón que no es de decoración
    if (isDraggingNewDecoration && !e.target.closest('.decor-btn')) {
        // Solo cancelar si no es el ghost
        if (e.target.id !== 'decor-ghost' && !e.target.closest('.room-decoration')) {
            deactivateDragMode();
            addMessage("Modo decoración cancelado.", 'bot');
        }
    }
});

// Inicializar cuando cargue la página
document.addEventListener('DOMContentLoaded', function() {
    // Agregar esta línea para inicializar el sistema de decoración
    initDecorationSystem();
});

// =============================================
// CALENDARIO CYBERPET - VERSIÓN MEJORADA
// =============================================

let currentDate = new Date();
let events = JSON.parse(localStorage.getItem('cyberpetEvents')) || [];

// Mostrar/ocultar calendario
function showCalendarWindow() {
    const calendarWindow = document.getElementById('calendarWindow');
    calendarWindow.style.display = 'block';
    
    // Asegurar que esté en el frente
    bringWindowToFront(calendarWindow);
    
    generateCalendar();
    updateEventsList();
    changeExpression('surprised');
}

function closeCalendarWindow() {
    const calendarWindow = document.getElementById('calendarWindow');
    calendarWindow.style.display = 'none';
    
    // Restablecer posición (igual que las otras ventanas)
    calendarWindow.style.top = '50%';
    calendarWindow.style.left = '50%';
    calendarWindow.style.transform = 'translate(-50%, -50%)';
    
    changeExpression('happy');
}

// Generar calendario CORREGIDO
function generateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const monthYearElement = document.getElementById('currentMonthYear');
    
    // Limpiar grid
    calendarGrid.innerHTML = '';
    
    // Encabezados de días
    const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    dayHeaders.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day-header';
        dayElement.textContent = day;
        calendarGrid.appendChild(dayElement);
    });
    
    // Configurar fechas
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);
    
    // Días del mes anterior para completar la primera semana
    const firstDayIndex = firstDay.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const prevLastDay = new Date(year, month, 0).getDate();
    
    // Actualizar título
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    monthYearElement.textContent = `${monthNames[month]} ${year}`;
    
    // Días del mes anterior (para completar primera semana)
    for (let i = firstDayIndex; i > 0; i--) {
        const dayElement = createDayElement(prevLastDay - i + 1, true);
        calendarGrid.appendChild(dayElement);
    }
    
    // Días del mes actual (TODOS los días del mes)
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const dayElement = createDayElement(i, false);
        
        // Marcar si es hoy
        const today = new Date();
        if (i === today.getDate() && 
            month === today.getMonth() && 
            year === today.getFullYear()) {
            dayElement.classList.add('today');
        }
        
        // Marcar si tiene eventos
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        if (hasEventsOnDate(dateStr)) {
            dayElement.classList.add('has-events');
        }
        
        calendarGrid.appendChild(dayElement);
    }
    
    // Días del próximo mes para completar la última semana
    const totalCells = 42; // 6 filas × 7 columnas = 42 celdas
    const daysInGrid = firstDayIndex + lastDay.getDate();
    const nextDays = totalCells - daysInGrid;
    
    for (let i = 1; i <= nextDays; i++) {
        const dayElement = createDayElement(i, true);
        calendarGrid.appendChild(dayElement);
    }
}

function createDayElement(day, isOtherMonth) {
    const dayElement = document.createElement('div');
    dayElement.className = `calendar-day ${isOtherMonth ? 'other-month' : ''}`;
    dayElement.textContent = day;
    
    if (!isOtherMonth) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        dayElement.onclick = () => selectDate(day);
        dayElement.title = `Haz clic para ver eventos del ${day}/${month}/${year}`;
    }
    
    return dayElement;
}

// Cambiar mes
function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    generateCalendar();
    updateEventsList();
    
    // Animación del CyberPet
    const mouth = document.getElementById('mouth');
    mouth.classList.add('surprised');
    setTimeout(() => mouth.classList.remove('surprised'), 500);
    
    speak(`Cambiando a ${getMonthName(currentDate.getMonth() + 1)}`);
}

// Seleccionar fecha
function selectDate(day) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    document.getElementById('eventDateInput').value = dateStr;
    updateEventsList(dateStr);
    
    // Feedback visual
    const selectedDay = document.querySelectorAll('.calendar-day:not(.other-month)');
    selectedDay.forEach(d => {
        if (d.textContent == day) {
            d.style.background = '#bbdefb';
            setTimeout(() => {
                if (!d.classList.contains('today')) {
                    d.style.background = '';
                }
            }, 1000);
        }
    });
    
    speak(`Fecha seleccionada: ${day} de ${getMonthName(month)}`);
}

// Verificar si una fecha tiene eventos
function hasEventsOnDate(dateStr) {
    return events.some(event => event.date === dateStr);
}

// Obtener nombre del mes
function getMonthName(month) {
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return monthNames[month - 1];
}

// Actualizar lista de eventos COMPACTA
function updateEventsList(dateStr = null) {
    const eventsList = document.getElementById('eventsList');
    const selectedDate = dateStr || getTodayDateStr();
    
    const dayEvents = events.filter(event => event.date === selectedDate);
    
    if (dayEvents.length === 0) {
        eventsList.innerHTML = '<div class="no-events">No hay eventos para esta fecha</div>';
        return;
    }
    
    eventsList.innerHTML = '';
    dayEvents.forEach((event, index) => {
        const eventElement = document.createElement('div');
        eventElement.className = 'event-item';
        eventElement.innerHTML = `
            <div class="event-text">${event.text}</div>
            <button class="delete-event" onclick="deleteEvent('${event.id}')" title="Eliminar evento">×</button>
        `;
        eventsList.appendChild(eventElement);
    });
}

// Agregar evento
function addEvent() {
    const eventText = document.getElementById('newEventInput').value.trim();
    const eventDate = document.getElementById('eventDateInput').value;
    
    if (!eventText) {
        speak("Por favor, escribe un evento");
        document.getElementById('newEventInput').focus();
        return;
    }
    
    if (!eventDate) {
        speak("Por favor, selecciona una fecha");
        return;
    }
    
    const newEvent = {
        text: eventText,
        date: eventDate,
        id: Date.now() + Math.random() // ID único
    };
    
    events.push(newEvent);
    saveCalendarData();
    document.getElementById('newEventInput').value = '';
    generateCalendar();
    updateEventsList(eventDate);
    
    // Celebrar
    changeExpression('happy');
    speak(`Evento agregado: ${eventText}`);
}

// Eliminar evento
function deleteEvent(eventId) {
    events = events.filter(event => event.id != eventId);
    saveCalendarData();
    generateCalendar();
    
    const currentDateInput = document.getElementById('eventDateInput').value;
    updateEventsList(currentDateInput);
    
    speak("Evento eliminado");
}

// Guardar datos del calendario
function saveCalendarData() {
    localStorage.setItem('cyberpetEvents', JSON.stringify(events));
    
    // Animación de éxito
    const mouth = document.getElementById('mouth');
    mouth.classList.add('happy');
    setTimeout(() => mouth.classList.remove('happy'), 1000);
    
    speak("Calendario guardado correctamente");
}

// Limpiar todos los eventos
function clearAllEvents() {
    if (events.length === 0) {
        speak("No hay eventos para eliminar");
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres eliminar TODOS los eventos del calendario?')) {
        events = [];
        saveCalendarData();
        generateCalendar();
        updateEventsList();
        speak("Todos los eventos han sido eliminados");
    }
}

// Obtener fecha actual en formato YYYY-MM-DD
function getTodayDateStr() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Inicializar fecha en el formulario
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('eventDateInput').value = getTodayDateStr();
    
    // Hacer el calendario arrastrable
    const calendarWindow = document.getElementById('calendarWindow');
    if (calendarWindow) {
        makeDraggable(calendarWindow);
    }
});

// Agregar soporte para Enter en el input de eventos
document.addEventListener('DOMContentLoaded', () => {
    const eventInput = document.getElementById('newEventInput');
    if (eventInput) {
        eventInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addEvent();
            }
        });
    }
});
// =============================================
// TV ANTIGUA - CÓDIGO COMPLETO MEJORADO
// =============================================

let currentChannel = 0;
let isTVOn = false;
let isTVPlaying = false;
let isAudioMuted = false;

// Lista de canales/videos de YouTube
const tvChannels = [
    {
        id: 0,
        name: "Dibujos",
        number: "1",
        videos: [
            "FsgpgWXD9eg", // Charlie Bit My Finger
            "JHa91zIbxjc", // Never Gonna Give You Up
            "1N4nqgW80XQ"  // All Star
        ],
        currentVideo: 0
    },
    {
        id: 1, 
        name: "Música",
        number: "2",
        videos: [
            "P2EaDD2G0G0", // Lofi hip hop radio
            "FiZyM1ld-XU", // Jazz relaxing music
            "oD5E8Uc6Suw"  // Classical music
        ],
        currentVideo: 0
    },
    {
        id: 2,
        name: "Documental",
        number: "3", 
        videos: [
            "XOd4Q6aGqyU", // Space documentary
            "aI_rbKHIPRc", // Nature documentary
            "8vzTyP1v-_8"  // History documentary
        ],
        currentVideo: 0
    },
    {
        id: 3,
        name: "Comedia",
        number: "4",
        videos: [
            "FRB7w2SnTjc", // Funny clips
            "koBsCwzhzv8", // Stand up comedy
            "yUskbJhRA2A"  // Memes compilation
        ],
        currentVideo: 0
    }
];

// Mostrar/ocultar TV
function showTVWindow() {
    const tvWindow = document.getElementById('tvWindow');
    if (!tvWindow) return;
    
    tvWindow.style.display = 'block';
    bringWindowToFront(tvWindow);
    
    updateChannelDisplay();
    updateButtonStates();
    changeExpression('surprised');
    speak("¡CyberPet TV lista!");
}

function closeTVWindow() {
    const tvWindow = document.getElementById('tvWindow');
    if (!tvWindow) return;
    
    tvWindow.style.display = 'none';
    turnOffTV();
    
    // Restablecer posición
    tvWindow.style.top = '50%';
    tvWindow.style.left = '50%';
    tvWindow.style.transform = 'translate(-50%, -50%)';
    
    changeExpression('happy');
}

// Actualizar display del canal
function updateChannelDisplay() {
    const channelNumber = document.getElementById('currentChannelNumber');
    const channelName = document.getElementById('currentChannelName');
    
    if (channelNumber && channelName) {
        const currentChannelData = tvChannels[currentChannel];
        channelNumber.textContent = currentChannelData.number;
        channelName.textContent = currentChannelData.name;
    }
}

// Actualizar estado visual de los botones
function updateButtonStates() {
    const powerBtn = document.querySelector('.power-btn');
    const audioBtn = document.querySelector('.audio-btn');
    
    if (powerBtn) {
        if (isTVOn) {
            powerBtn.classList.add('active');
            powerBtn.innerHTML = '🔘';
        } else {
            powerBtn.classList.remove('active');
            powerBtn.innerHTML = '🔘';
        }
    }
    
    if (audioBtn) {
        audioBtn.innerHTML = isAudioMuted ? '🔇' : '🔈';
    }
}

// Encender TV
function turnOnTV() {
    if (isTVOn) return;
    
    const tvScreen = document.getElementById('tvScreen');
    const tvOffMessage = document.getElementById('tvOffMessage');
    const youtubeIframe = document.getElementById('youtubeIframe');
    const tvBanner = document.getElementById('tvBanner');
    
    if (!tvScreen || !tvOffMessage || !youtubeIframe || !tvBanner) return;
    
    // Efecto de encendido
    tvScreen.classList.add('power-on');
    tvOffMessage.style.display = 'none';
    youtubeIframe.style.display = 'block';
    tvBanner.style.display = 'block';
    
    isTVOn = true;
    isTVPlaying = true;
    
    loadCurrentVideo();
    updateButtonStates();
    changeExpression('surprised');
    speak("¡TV encendida! Canal " + tvChannels[currentChannel].number);
    
    setTimeout(() => {
        tvScreen.classList.remove('power-on');
    }, 2000);
}

// Apagar TV
function turnOffTV() {
    if (!isTVOn) return;
    
    const tvOffMessage = document.getElementById('tvOffMessage');
    const youtubeIframe = document.getElementById('youtubeIframe');
    const tvBanner = document.getElementById('tvBanner');
    
    if (!tvOffMessage || !youtubeIframe || !tvBanner) return;
    
    tvOffMessage.style.display = 'flex';
    youtubeIframe.style.display = 'none';
    tvBanner.style.display = 'none';
    youtubeIframe.src = '';
    
    isTVOn = false;
    isTVPlaying = false;
    
    updateButtonStates();
    speak("TV apagada");
}

// Alternar encendido/apagado
function toggleTVPower() {
    if (isTVOn) {
        turnOffTV();
    } else {
        turnOnTV();
    }
}

// Cargar video actual
function loadCurrentVideo() {
    if (!isTVOn) return;
    
    const currentChannelData = tvChannels[currentChannel];
    const currentVideoId = currentChannelData.videos[currentChannelData.currentVideo];
    const youtubeIframe = document.getElementById('youtubeIframe');
    
    if (!youtubeIframe) return;
    
    let src = `https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0&modestbranding=1`;
    if (isAudioMuted) {
        src += '&mute=1';
    }
    
    youtubeIframe.src = src;
    isTVPlaying = true;
}

// Video anterior
function previousVideo() {
    if (!isTVOn) return;
    
    const channel = tvChannels[currentChannel];
    channel.currentVideo = (channel.currentVideo - 1 + channel.videos.length) % channel.videos.length;
    loadCurrentVideo();
    speak("Video anterior");
}

// Siguiente video
function nextVideo() {
    if (!isTVOn) return;
    
    const channel = tvChannels[currentChannel];
    channel.currentVideo = (channel.currentVideo + 1) % channel.videos.length;
    loadCurrentVideo();
    speak("Siguiente video");
}

// Play/Pause
function playPauseTV() {
    if (!isTVOn) return;
    
    isTVPlaying = !isTVPlaying;
    
    if (isTVPlaying) {
        loadCurrentVideo();
        speak("Reproduciendo");
    } else {
        const youtubeIframe = document.getElementById('youtubeIframe');
        if (youtubeIframe) {
            youtubeIframe.src = '';
        }
        speak("Pausado");
    }
}

// Cambiar canal anterior
function previousChannel() {
    if (!isTVOn) return;
    
    currentChannel = (currentChannel - 1 + tvChannels.length) % tvChannels.length;
    tvChannels[currentChannel].currentVideo = 0;
    
    updateChannelDisplay();
    loadCurrentVideo();
    speak(`Canal ${tvChannels[currentChannel].number}`);
}

// Cambiar canal siguiente
function nextChannel() {
    if (!isTVOn) return;
    
    currentChannel = (currentChannel + 1) % tvChannels.length;
    tvChannels[currentChannel].currentVideo = 0;
    
    updateChannelDisplay();
    loadCurrentVideo();
    speak(`Canal ${tvChannels[currentChannel].number}`);
}

// Alternar audio
function toggleAudio() {
    if (!isTVOn) return;
    
    isAudioMuted = !isAudioMuted;
    updateButtonStates();
    loadCurrentVideo();
    speak(isAudioMuted ? "Audio silenciado" : "Audio activado");
}

// Hacer la TV arrastrable
document.addEventListener('DOMContentLoaded', function() {
    const tvWindow = document.getElementById('tvWindow');
    if (tvWindow && typeof makeDraggable !== 'undefined') {
        makeDraggable(tvWindow);
    }
});
const helpBtn = document.getElementById("helpBtn");
const helpModal = document.getElementById("helpModal");
const helpClose = document.querySelector(".help-close");

helpBtn.onclick = () => {
    helpModal.style.display = "flex";
};

helpClose.onclick = () => {
    helpModal.style.display = "none";
};

helpModal.onclick = (e) => {
    if (e.target === helpModal) helpModal.style.display = "none";
};
