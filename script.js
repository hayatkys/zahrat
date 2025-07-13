/*********************  PARAMÈTRES GÉNÉRAUX  *********************/
const canvas           = document.getElementById('gameCanvas');
const ctx              = canvas.getContext('2d');
const gameGrid         = document.querySelector('.game-grid');
const scoreDiv         = document.getElementById('score');
const successMessageDiv= document.getElementById('successMessage');
const backToMenuBtn    = document.getElementById('backToMenuBtn');

const successMessages = [
  'Well done Zahrat 😇',
  'U’re a GG 😁',
  'yayyy !!',
  'u too cool bro',
  'too much aura',
  'farming boss aura',
  'that’s my girl yeah'
];

/*********************  OUTILS COMMUNS  *********************/
// Affiche un message aléatoire pendant 3 s
function showSuccessMessage() {
  const msg = successMessages[Math.floor(Math.random() * successMessages.length)];
  successMessageDiv.textContent = msg;
  successMessageDiv.style.display = 'block';
  setTimeout(() => successMessageDiv.style.display = 'none', 5000);
}

// MAJ score
let score = 0;
function updateScore() { scoreDiv.textContent = `Score : ${score}`; }

/*********************  GESTION DU MENU  *********************/
// Lance le jeu sélectionné (cartes du menu)
let currentGame = null;
function startGame(choice) {
  currentGame = choice;
  score = 0;
  updateScore();

  // UI
  gameGrid.style.display          = 'none';
  canvas.style.display            = 'block';
  scoreDiv.style.display          = 'block';
  backToMenuBtn.style.display     = 'block';
  successMessageDiv.style.display = 'none';

  if (choice === 'eren') {
    canvas.style.backgroundImage = "url('snkfond.jpg')";
    startErenGame();
  } else {
    canvas.style.backgroundImage = "url('gwen.jpg')";
    startSpidermanGame();
  }
}

// Bouton « Retour Menu »
backToMenuBtn.addEventListener('click', resetGame);

// Retour au menu / fin de partie
function resetGame() {
  cancelAnimationFrame(animationId);           // stop l’anim en cours
  window.removeEventListener('keydown', erenControls);
  window.removeEventListener('keydown', spidermanControls);

  canvas.style.display            = 'none';
  scoreDiv.style.display          = 'none';
  successMessageDiv.style.display = 'none';
  backToMenuBtn.style.display     = 'none';
  gameGrid.style.display          = 'grid';

  score = 0;
  updateScore();
  currentGame = null;
}

/*********************  JEU 1 : EREN  *********************/
const erenImg   = new Image(); erenImg.src   = 'youngeren.jpg';
const titanImg  = new Image(); titanImg.src  = 'titan.jpg';

let erenPlayer, erenObstacles, erenFrame, erenGameOver;

function startErenGame() {
  erenPlayer = { x:50, y:300, width:50, height:50, dy:0, jumping:false, img:erenImg };
  erenObstacles = [];
  erenFrame     = 0;
  erenGameOver  = false;

  window.addEventListener('keydown', erenControls);
  gameLoopEren();
}

function erenControls(e) {
  if (e.code === 'Space' && !erenPlayer.jumping) {
    erenPlayer.dy = -20;
    erenPlayer.jumping = true;
  }
}

function updateErenObstacles() {
  if (erenFrame % 90 === 0) {
    erenObstacles.push({ x:canvas.width, y:330, width:50, height:70, img:titanImg, passed:false });
  }
  erenObstacles.forEach(ob => ob.x -= 6);
  erenObstacles = erenObstacles.filter(ob => ob.x + ob.width > 0);
}

function detectErenCollision() {
  return erenObstacles.some(ob =>
    erenPlayer.x < ob.x + ob.width &&
    erenPlayer.x + erenPlayer.width > ob.x &&
    erenPlayer.y < ob.y + ob.height &&
    erenPlayer.y + erenPlayer.height > ob.y
  );
}

function drawErenPlayer()      { ctx.drawImage(erenPlayer.img, erenPlayer.x, erenPlayer.y, erenPlayer.width, erenPlayer.height); }
function drawErenObstacles()   { erenObstacles.forEach(ob => ctx.drawImage(ob.img, ob.x, ob.y, ob.width, ob.height)); }

function gameLoopEren() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // gravité + saut
  erenPlayer.dy += 1.5;
  erenPlayer.y  += erenPlayer.dy;
  if (erenPlayer.y > 300) { erenPlayer.y = 300; erenPlayer.jumping = false; erenPlayer.dy = 0; }

  updateErenObstacles();
  if (detectErenCollision()) {
    alert(`Perdu ! Ton score : ${score}`);
    return resetGame();
  }

  drawErenPlayer();
  drawErenObstacles();

  // passage d’obstacle = +1 pt
  erenObstacles.forEach(ob => {
    if (!ob.passed && ob.x + ob.width < erenPlayer.x) {
      ob.passed = true;
      score++; updateScore();
      showSuccessMessage();
    }
  });

  erenFrame++;
  animationId = requestAnimationFrame(gameLoopEren);
}

/*********************  JEU 2 : SPIDERMAN  *********************/
const spidermanImg = new Image(); spidermanImg.src = 'milesmorales.jpg';

let spiderPlayer, webX, webY, webActive, items, spidermanFrame;

function startSpidermanGame() {
  spiderPlayer = { x:canvas.width/2-25, y:350, width:50, height:50, img:spidermanImg };
  webX = spiderPlayer.x + spiderPlayer.width/2;
  webY = spiderPlayer.y;
  webActive = false;
  items = [];
  spidermanFrame = 0;

  window.addEventListener('keydown', spidermanControls);
  gameLoopSpiderman();
}

function spidermanControls(e) {
  if (e.code === 'ArrowLeft') {
    spiderPlayer.x = Math.max(0, spiderPlayer.x - 20);
    if (!webActive) webX = spiderPlayer.x + spiderPlayer.width/2;
  }
  if (e.code === 'ArrowRight') {
    spiderPlayer.x = Math.min(canvas.width-spiderPlayer.width, spiderPlayer.x + 20);
    if (!webActive) webX = spiderPlayer.x + spiderPlayer.width/2;
  }
  if (e.code === 'Space' && !webActive) {
    webActive = true;
    webY = spiderPlayer.y;
  }
}

function drawSpidermanPlayer() { ctx.drawImage(spiderPlayer.img, spiderPlayer.x, spiderPlayer.y, spiderPlayer.width, spiderPlayer.height); }
function drawWeb() {
  if (!webActive) return;
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth   = 4;
  ctx.beginPath();
  ctx.moveTo(spiderPlayer.x + spiderPlayer.width/2, spiderPlayer.y);
  ctx.lineTo(webX, webY);
  ctx.stroke();
}
function updateWeb() {
  if (!webActive) return;
  webY -= 15;
  if (webY < 0) { webActive = false; webY = spiderPlayer.y; }
}
function drawItems() {
  ctx.fillStyle = 'yellow';
  items.forEach(it => { ctx.beginPath(); ctx.arc(it.x,it.y,it.radius,0,Math.PI*2); ctx.fill(); });
}
function updateItems() {
  spidermanFrame++;
  if (spidermanFrame % 60 === 0) {
    items.push({ x:Math.random()*(canvas.width-30)+15, y:0, radius:15, caught:false });
  }
  items.forEach(it => it.y += 4);
  items = items.filter(it => it.y-it.radius < canvas.height && !it.caught);
}
function checkCatch() {
  if (!webActive) return;
  for (let it of items) {
    let dx = webX - it.x, dy = webY - it.y;
    if (Math.hypot(dx,dy) < it.radius + 2) {
      it.caught = true; webActive = false; score += 10; updateScore(); showSuccessMessage(); break;
    }
  }
}

function gameLoopSpiderman() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  drawSpidermanPlayer();
  drawWeb();
  drawItems();

  updateWeb();
  updateItems();
  checkCatch();

  // Trop d’items ratés ?
  if (items.filter(it => it.y - it.radius >= canvas.height).length > 3) {
    alert('Perdu ! Essaie encore.');
    return resetGame();
  }

  animationId = requestAnimationFrame(gameLoopSpiderman);
}

/*********************  TEST : Appuyer sur Entrée = réussite  *********************/
document.addEventListener('keydown', e => { if (e.key === 'Enter') showSuccessMessage(); });

/*********************  VARIABLE D’ANIMATION  *********************/
let animationId = null;