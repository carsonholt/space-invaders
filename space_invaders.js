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
var numFired = 0;
var flag = false;
var speed = 0.02;

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
  if (life < 1) 
	{ 
		gameOver(); 
		return;
	}
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
	numFired++;
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
		  if (rand > 0.9996) {
			  console.log('enemy fire');
			  enemyFire.push(new Bullet(2, alien.x + (alien.width / 2), alien.y + alien.height, 2));
		  }
		  if (detectCollision(alien,player)) {
			  life = 0;
			 gameOver();
			 return;
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
				numAliens--;
				bullets.splice(index, 1);
				delete alien.x;
				delete alien.y;
			}
		});
		
	});	  
	enemyFire.forEach(function(bullet, index) {
	  bullet.update(elapsedTime);	  
	  // check to see if bullet is off-screen
	  if(bullet.y >= HEIGHT-50) enemyFire.splice(index, 1);
	  // check to see if bullet hit player
	  if (detectCollision(bullet, player)) {		  
		  enemyFire.splice(index, 1);
		  life--;
		  player.x = WIDTH/2;
		  player.y = HEIGHT - 80;
		  return false;
	  }
	});	
	if (numAliens < 1) {
		//setTimeout(advanceLevel, 2000);
		advanceLevel();
	}
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
	//draw line
	ctx.fillStyle = "#FFFFFF";
	ctx.beginPath();
	ctx.moveTo(0,HEIGHT-50);
	ctx.lineTo(WIDTH,HEIGHT-50);
	ctx.stroke();
	player.load('sprites/ship.jpg');
	player.render(ctx);
	displayInfo(ctx);
  
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

/** @function detectCollision
  * takes two objects and checks for overlap
  * @param a and b - two objects
  */
function detectCollision(a, b) {
	if ((a.x >= b.x && a.x < b.x + b.width) && (a.y >= b.y && a.y < b.y + b.height)) {
		console.log('collision detected');
		console.log(a.constructor.name);
		console.log(b.constructor.name);
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

/** function advanceLevel
  * resets the player and aliens, increases speed by 10%
  */
function advanceLevel() {
	// calculate bonus
	bonus = calculateBonus();
		
	/*ctx.fillStyle = '#FFFFFF';
	ctx.font = '20px Times New Roman';
	ctx.textAlign="center";
	ctx.fillText("Level " + level + " complete", WIDTH/2,150);
	ctx.textAlign="center";
	ctx.fillText("Score: " + score, WIDTH/2,175);
	ctx.textAlign="center";
	ctx.fillText("Bonus: " + bonus, WIDTH/2,200);*/

	level++;
	numFired = 0;
	speed *= 1.1;
	
	for (var i = 0; i < NUM_COLS; i++) {
		//aliens.push(new Alien(3, 75 + (45*i), 30));
		aliens[i].x = 75 + (45*i);
		aliens[i].y = 30;
		numAliens++;
	}
	for (var i = 0; i < NUM_COLS; i++) {
		//aliens.push(new Alien(2, 75 + (45*i), 60));
		aliens[numAliens].x = 75 + (45*i);
		aliens[numAliens].y = 60;
		numAliens++;
	}
	for (var i = 0; i < NUM_COLS; i++) {
		//aliens.push(new Alien(1, 75 + (45*i), 90));
		aliens[numAliens].x = 75 + (45*i);
		aliens[numAliens].y = 90;
		numAliens++;
	}
	for (var i = 0; i < NUM_COLS; i++) {
		//aliens.push(new Alien(1, 75 + (45*i), 120));
		aliens[numAliens].x = 75 + (45*i);
		aliens[numAliens].y = 120;
		numAliens++;
	}
	return;
}

/** calculateBonus
  * calculates the accuracy bonus after each level 
  * (from 0 to 100 pts, based on # shots fired)
  * return bonus
  */
function calculateBonus() {
	var bonus = Math.round(((NUM_ROWS * NUM_COLS) / numFired) * 100);
	score += bonus;
	return bonus;
}

/** gameOver
  * draws red 'Game Over' text, deletes aliens and player
  */
function gameOver() {
	ctx.fillStyle = 'red';
	ctx.font = '24px Times New Roman';
	ctx.alignText="center";
	ctx.fillText("Game Over", WIDTH/2, HEIGHT/2);
}

/** displayInfo
  *	draws each life, displays current level, displays score
  * param context - the context being drawn on
  */
function displayInfo(context) {
	ctx.fillStyle = '#FFFFFF';
	ctx.font = '16px Times New Roman';
	ctx.fillText("Lives: ", 10, 425);
	for (var i = 0; i < life; i++) {
		context.drawImage(playerImg, 60 + (i*30), 417, 20, 15);
	}
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
		this.x -= deltaT * speed;
	} else {
		this.x += deltaT * speed;
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