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
var movingLeft = false;

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
    bullets.push(new Bullet(1, player.x+20, player.y, 2));
  }
  if(currentInput.left) {
    player.x -= 0.1 * elapsedTime;
  }
  if(currentInput.right) {
    player.x += 0.1 * elapsedTime;
  }
  
	aliens.forEach(function(alien){
		alien.update(elapsedTime);				
		//generate alien fire
		  var rand = Math.random();
		  //console.log(rand);
		  if (rand > 0.999) {
			  console.log('enemy fire');
			  enemyFire.push(new Bullet(2, alien.x + (alien.width / 2), alien.y, 2));
		  }
		  if (detectCollision(alien,player)) {
			 setTimeout(function() {console.log('life lost')}, 2000);
		 }
		  if (alien.x < 1 || alien.x >= WIDTH-30) {
			  alien.drop(ctx);
			  movingLeft = 1 - movingLeft;
		  }
	});
	
	bullets.forEach(function(bullet, index){
		bullet.update(elapsedTime);
		if(bullet.y < bullet.r) bullets.splice(index, 1);
		aliens.forEach(function(alien){
			//alien.update(elapsedTime);
			if (detectCollision(bullet, alien)) {
				// add score
				if (alien.type == 1) {
					score += 10;
				} else if (alien.type == 2) {
					score += 20;
				} else if (alien.type == 3) {
					score += 30;
				}			
				delete bullet.x;
				delete bullet.y;
				delete alien.x;
				delete alien.y;
			}
		});
		
	});	  
	enemyFire.forEach(function(bullet, index) {
	  bullet.update(elapsedTime)
	  // check to see if bullet hit player
	  if (detectCollision(bullet, player)) {
		setTimeout(function() {console.log('life lost')}, 2000);
		return;
	  }
	  // check to see if bullet is off-screen
	  if(bullet.y >= HEIGHT-50) enemyFire.splice(index, 1);
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
	displayInfo();
	player.load('sprites/ship.jpg');
	player.render(ctx);
  
    aliens.forEach(function(alien){
		alien.load();
		alien.render(ctx); 	
	});
	bullets.forEach(function(bullet){
		bullet.render(ctx);
	});
	enemyFire.forEach(function(bullet){
		bullet.render(ctx);		
	});
}

function detectCollision(a, b) {
	if ((a.x >= b.x && a.x < b.x + b.width) && (a.y >= b.y && a.y < b.y + b.height)) {
		console.log('collision detected');
		console.log(a.constructor.name);
		console.log(b.constructor.name);
		if (b.constructor.name == "Player") {
			life -= 1;
		}
		return true;
	} else {
		return false;
	}
}

function createAliens() {
	for (var i = 0; i < NUM_COLS; i++) {
		aliens.push(new Alien(3, 75 + (45*i), 30));
	}
	for (var i = 0; i < NUM_COLS; i++) {
		aliens.push(new Alien(2, 75 + (45*i), 60));
	}
	for (var i = 0; i < NUM_COLS; i++) {
		aliens.push(new Alien(1, 75 + (45*i), 90));
	}
	for (var i = 0; i < NUM_COLS; i++) {
		aliens.push(new Alien(1, 75 + (45*i), 120));
	}
}

/**
  *
  */
function displayInfo() {
	ctx.fillStyle = '#FFFFFF';
	ctx.font = '16px Times New Roman';
	ctx.fillText("Lives: " + life, 10, 425);
	ctx.fillText("Level: " + level, 400, 425);
	ctx.fillText("Score: " + score, 500, 425);
	return;
}
// Render the aliens for the first time
createAliens();
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
	player.width = 40;
	player.height = 30;
}

Player.prototype.render = function(context) {
	context.drawImage(playerImg, this.x, this.y);
}

// Bullet class
function Bullet(type, x, y, r) {
	this.type = type;
  this.x = x;
  this.y = y;
  this.r = r;
}

Bullet.prototype.update = function(deltaT) {
	if (this.type == 1) {
		this.y -= deltaT * 0.4;
	} else {
		this.y += deltaT * 0.3;
	}
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

var alienImg;

Alien.prototype.load = function() {
	alienImg = new Image();
	alienImg.src = 'sprites/alien' + this.type + '.jpg';
	this.width = alienImg.width;
	this.height = alienImg.height;
}

Alien.prototype.update = function(deltaT) {
	if (movingLeft) {
		this.x -= deltaT * 0.02;
	} else {
		this.x += deltaT * 0.02;
	}
}

Alien.prototype.render = function(context) {
	context.drawImage(alienImg, this.x, this.y);
}

Alien.prototype.drop = function(context) {
	 aliens.forEach(function(alien){
		 alien.y += 20;
	 });
}