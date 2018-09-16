// Screen dimensions
const WIDTH = 600
const HEIGHT = 450

// Create the canvas and context
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
canvas.height = HEIGHT;
canvas.width = WIDTH;
document.body.appendChild(canvas);

/* Game state variables */
var start = null;
var currentInput = {
  space: false,
  left: false,
  right: false,
  up: false,
  down: false
}
var priorInput = {
  space: false,
  left: false,
  right: false,
  up: false,
  down: false
}
var x = WIDTH/2;
var y = HEIGHT-80;
var bullets = [];
var aliens = [];
var enemyFire = [];

const NUM_COLS = 10;
const NUM_ROWS = 4;
var numAliens = NUM_COLS * NUM_ROWS;

var life = 3;
var score = 0;
var level = 1;
var player = new Player(WIDTH/2, HEIGHT-80);
var playerImg;
/** @function handleKeydown
  * Event handler for keydown events
  * @param {KeyEvent} event - the keydown event
  */
function handleKeydown(event) {
  switch(event.key) {
    case ' ':
    console.log('fire?', currentInput, priorInput)
      currentInput.space = true;
      break;
    case 'ArrowLeft':
      currentInput.left = true;
      break;
    case 'ArrowRight':
      currentInput.right = true;
      break;
  }
}
// Attach keyup event handler to the window
window.addEventListener('keydown', handleKeydown);

/** @function handleKeyup
  * Event handler for keyup events
  * @param {KeyEvent} event - the keyup event
  */
function handleKeyup(event) {
  switch(event.key) {
    case ' ':
    console.log('no fire?', currentInput, priorInput)
      currentInput.space = false;
      break;
    case 'ArrowLeft':
      currentInput.left = false;
      break;
    case 'ArrowRight':
      currentInput.right = false;
      break;
  }
}
// Attach keyup event handler to the window
window.addEventListener('keyup', handleKeyup);

/** @function loop
  * The main game loop
  * @param {DomHighResTimestamp} timestamp - the current system time,
  * in milliseconds, expressed as a double.
  */
function loop(timestamp) {
  if(!start) start = timestamp;
  var elapsedTime = timestamp - start;
  start = timestamp;
  update(elapsedTime);
  render(elapsedTime);
  copyInput();
  window.requestAnimationFrame(loop);
}

/** @function copyInput
  * Copies the current input into the previous input
  */
function copyInput() {
  priorInput = JSON.parse(JSON.stringify(currentInput));
}

/** @function update
  * Updates the game's state
  * @param {double} elapsedTime - the amount of time
  * elapsed between frames
  */
function update(elapsedTime) {
  // move the ship when the space bar is down
  if(currentInput.space && !priorInput.space) {
    // TODO: Fire bullet
	console.log("x: " + x + "y: " + y);
    bullets.push(new Bullet(player.x+20, player.y, 2));
  }
  if(currentInput.left) {
    player.x -= 0.1 * elapsedTime;
  }
  if(currentInput.right) {
    player.x += 0.1 * elapsedTime;
  }
  bullets.forEach(function(bullet, index){
    bullet.update(elapsedTime);
    // check to see if bullet is off-screen
    if(bullet.y < bullet.r) bullets.splice(index, 1);
  });
}

/** @function render
  * Renders the game into the canvas
  * @param {double} elapsedTime - the amount of time
  * elapsed between frames
  */
function render(elapsedTime) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0,0,WIDTH,HEIGHT);
  player.load('sprites/ship.jpg');
  player.render(ctx);
  bullets.forEach(function(bullet){
    bullet.render(ctx);
  });
}

function detectCollision(a, b) {
	if ((a.x >= b.x && a.x < b.x + b.height) && (a.y >= b.y && a.y < b.y + b.height)) {
		console.log('collision detected');
		return true;
	} else {
		return false;
	}
}
// Start the game loop
window.requestAnimationFrame(loop);

// Player class
function Player(x, y) {
	this.x = x;
	this.y = y;
}

Player.prototype.load = function(pathname) {
	playerImg = new Image();
	playerImg.src = 'sprites/ship.jpg';
}

Player.prototype.render = function(context) {
	context.drawImage(playerImg, this.x, this.y);
}

// Bullet class
function Bullet(x, y, r) {
  this.x = x;
  this.y = y;
  this.r = r;
}

Bullet.prototype.update = function(deltaT) {
  this.y -= deltaT * 0.4;
}

Bullet.prototype.render = function(context) {
  context.beginPath();
  context.fillStyle = "#FFFFFF";
  context.arc(this.x - this.r, this.y - this.r, 2*this.r, 2*this.r, 0, 2 * Math.pi);
  context.fill();
}

// Alien class
function Alien(type, x, y) {
	this.type = type;
	this.x = x;
	this.y = y;
}

var movingLeft = false;

Alien.prototype.load = function(deltaT) {
	
}

Alien.prototype.update = function(deltaT) {
	if (movingLeft) {
		this.x -= deltaT * 0.02;
	} else {
		this.x += deltaT * 0.02;
	}
}

Alien.prototype.render = function(context) {
	
}