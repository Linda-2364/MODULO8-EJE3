// ===============================================
// JUEGO DE MEMORIA - MEJORADO
// ===============================================

// ------------ VARIABLES ------------
const board = document.getElementById("gameBoard");
const timerEl = document.getElementById("timer");
const movesEl = document.getElementById("moves");
const scoreEl = document.getElementById("score");
const resetBtn = document.getElementById("resetBtn");
const hintBtn = document.getElementById("hintBtn");
const winModal = document.getElementById("winModal");
const closeModal = document.querySelector(".close-modal");
const playAgainBtn = document.getElementById("playAgainBtn");
const finalTime = document.getElementById("final-time");
const finalMoves = document.getElementById("final-moves");
const finalScore = document.getElementById("final-score");
const ratingStars = document.querySelectorAll(".rating i");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");

let icons = ["🍎", "🍌", "🍇", "🍓", "🍉", "🍒", "🍑", "🍍", "🥝", "🥭", "🍊", "🍋"];
let cards = [];
let firstCard = null;
let secondCard = null;
let lock = false;
let matches = 0;

let moves = 0;
let score = 0;
let time = 0;
let timer = null;
let difficulty = "easy";
let totalPairs = 8;

// ------------ INICIALIZAR JUEGO ------------
function startGame() {
  // Reiniciar variables
  moves = 0;
  score = 0;
  time = 0;
  matches = 0;
  firstCard = null;
  secondCard = null;
  lock = false;

  movesEl.textContent = moves;
  scoreEl.textContent = score;
  timerEl.textContent = "00:00";

  clearInterval(timer);
  startTimer();

  // Seleccionar iconos según dificultad
  let selectedIcons = [];
  switch(difficulty) {
    case "easy":
      selectedIcons = icons.slice(0, 8);
      totalPairs = 8;
      break;
    case "medium":
      selectedIcons = icons.slice(0, 10);
      totalPairs = 10;
      break;
    case "hard":
      selectedIcons = icons.slice(0, 12);
      totalPairs = 12;
      break;
  }

  // Duplicar iconos y mezclarlos
  cards = [...selectedIcons, ...selectedIcons];
  shuffle(cards);

  // Renderizar tablero
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${difficulty === "hard" ? 6 : 4}, 1fr)`;
  board.style.maxWidth = difficulty === "hard" ? "750px" : "500px";
  
  cards.forEach((icon, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.icon = icon;
    card.dataset.index = index;
    
    const front = document.createElement("div");
    front.classList.add("front");
    front.textContent = icon;
    
    const back = document.createElement("div");
    back.classList.add("back");
    back.innerHTML = "<i class='fas fa-question'></i>";
    
    card.appendChild(front);
    card.appendChild(back);
    
    board.appendChild(card);
  });
}

// ------------ MEZCLAR CARTAS ------------
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ------------ TEMPORIZADOR ------------
function startTimer() {
  timer = setInterval(() => {
    time++;
    const min = String(Math.floor(time / 60)).padStart(2, "0");
    const sec = String(time % 60).padStart(2, "0");
    timerEl.textContent = `${min}:${sec}`;
  }, 1000);
}

// ------------ MANEJAR CLICK EN CARTA ------------
board.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;
  if (lock) return;
  if (card.classList.contains("revealed")) return;
  if (card.classList.contains("matched")) return;

  revealCard(card);

  if (!firstCard) {
    firstCard = card;
  } else {
    secondCard = card;
    lock = true;
    moves++;
    movesEl.textContent = moves;
    
    setTimeout(() => {
      checkMatch();
    }, 500);
  }
});

// ------------ REVELAR CARTA ------------
function revealCard(card) {
  card.classList.add("revealed");
}

// ------------ OCULTAR CARTA ------------
function hideCard(card) {
  card.classList.remove("revealed");
}

// ------------ VERIFICAR PAREJA ------------
function checkMatch() {
  const isMatch = firstCard.dataset.icon === secondCard.dataset.icon;

  if (isMatch) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    matches++;
    
    score += 10;
    if (time < 30) score += 5; // Bonus por velocidad
    if (moves <= totalPairs * 2) score += 10; // Bonus por eficiencia
    
    scoreEl.textContent = score;
    
    // Efecto de partículas
    createParticles(firstCard);
    createParticles(secondCard);
    
    resetSelection();
    checkWin();
  } else {
    setTimeout(() => {
      hideCard(firstCard);
      hideCard(secondCard);
      resetSelection();
    }, 900);
  }
}

// ------------ EFECTO DE PARTÍCULAS ------------
function createParticles(card) {
  const rect = card.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  
  for (let i = 0; i < 10; i++) {
    const particle = document.createElement("div");
    particle.style.position = "fixed";
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.width = "10px";
    particle.style.height = "10px";
    particle.style.background = "radial-gradient(circle, #00b09b, #96c93d)";
    particle.style.borderRadius = "50%";
    particle.style.pointerEvents = "none";
    particle.style.zIndex = "1000";
    
    document.body.appendChild(particle);
    
    // Animación
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 3;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    
    let opacity = 1;
    const animate = () => {
      opacity -= 0.02;
      particle.style.opacity = opacity;
      particle.style.left = `${parseFloat(particle.style.left) + vx}px`;
      particle.style.top = `${parseFloat(particle.style.top) + vy}px`;
      
      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        document.body.removeChild(particle);
      }
    };
    
    animate();
  }
}

function resetSelection() {
  firstCard = null;
  secondCard = null;
  lock = false;
}

// ------------ VERIFICAR SI GANÓ ------------
function checkWin() {
  if (matches === totalPairs) {
    clearInterval(timer);
    
    // Calificar según rendimiento
    const maxRating = 5;
    let rating = maxRating;
    
    if (time > 120) rating--;
    if (moves > totalPairs * 2.5) rating--;
    if (time > 180) rating--;
    
    // Mostrar estrellas
    ratingStars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add("active");
      } else {
        star.classList.remove("active");
      }
    });
    
    // Actualizar estadísticas finales
    finalTime.textContent = timerEl.textContent;
    finalMoves.textContent = moves;
    finalScore.textContent = score;
    
    // Mostrar modal después de un breve retraso
    setTimeout(() => {
      winModal.style.display = "flex";
    }, 800);
  }
}

// ------------ BOTÓN DE AYUDA ------------
hintBtn.addEventListener("click", () => {
  if (lock) return;
  
  // Encontrar todas las cartas no reveladas
  const unrevealedCards = Array.from(document.querySelectorAll(".card:not(.revealed):not(.matched)"));
  if (unrevealedCards.length < 2) return;
  
  // Elegir dos cartas al azar para mostrar brevemente
  const randomCards = [];
  for (let i = 0; i < 2; i++) {
    const randomIndex = Math.floor(Math.random() * unrevealedCards.length);
    randomCards.push(unrevealedCards[randomIndex]);
    unrevealedCards.splice(randomIndex, 1);
  }
  
  // Mostrar las cartas brevemente
  randomCards.forEach(card => revealCard(card));
  
  setTimeout(() => {
    randomCards.forEach(card => {
      if (!card.classList.contains("matched")) {
        hideCard(card);
      }
    });
  }, 1000);
  
  // Penalización por usar ayuda
  score = Math.max(0, score - 5);
  scoreEl.textContent = score;
});

// ------------ CAMBIAR DIFICULTAD ------------
difficultyButtons.forEach(button => {
  button.addEventListener("click", () => {
    difficultyButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    difficulty = button.dataset.level;
    startGame();
  });
});

// ------------ REINICIAR ------------
resetBtn.addEventListener("click", startGame);

// ------------ MODAL ------------
closeModal.addEventListener("click", () => {
  winModal.style.display = "none";
});

playAgainBtn.addEventListener("click", () => {
  winModal.style.display = "none";
  startGame();
});

// Cerrar modal al hacer clic fuera
window.addEventListener("click", (e) => {
  if (e.target === winModal) {
    winModal.style.display = "none";
  }
});

// ------------ INICIO AUTOMÁTICO ------------
startGame();

// ------------ MENSAJE DE BIENVENIDA ------------
console.log("🎮 Juego de Memoria mejorado iniciado");
console.log("💡 Características:");
console.log("  • Diseño moderno con efectos visuales");
console.log("  • Tres niveles de dificultad");
console.log("  • Sistema de puntuación con bonificaciones");
console.log("  • Efectos de partículas al encontrar parejas");
console.log("  • Modal de victoria con calificación por estrellas");