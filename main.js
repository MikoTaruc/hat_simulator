var game = new Phaser.Game(1067, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var player;
var squirrels;

var leftWall;
var rightWall;

var hatStrings = ['cat_hat', 'dog_hat', 'heart_cap', 'normal_cap', 'cat_beanie', 'paper_hat'];
var allHats;
var wornHats = new Array();
var lastHatRain;

var cursors;

// Audio
var hatYell;
var compliment;
var wilhelm;

// Scoreboard
var rabiesCounter = 0;
var rabiesText;

var highscore = 0;
var highscoreText;

var hatsText = 0;

function preload() {
  // This function gets executed at the beginning
  // This is where you load images and sounds
  game.load.image('background', 'assets/background.png');

  game.load.spritesheet('player', 'assets/player.png', 37, 42);
  game.load.spritesheet('squirrel', 'assets/squirrel/squirrel.png', 30, 24);
  game.load.spritesheet('poof', 'assets/poof.png', 64, 64);

  game.load.image('cat_hat', 'assets/hats/cat_hat.png');
  game.load.image('dog_hat', 'assets/hats/dog_hat.png');
  game.load.image('heart_cap', 'assets/hats/heart_cap.png');
  game.load.image('cat_beanie', 'assets/hats/cat_beanie.png');
  game.load.image('normal_cap', 'assets/hats/normal_cap.png');
  game.load.image('paper_hat', 'assets/hats/paper_hat.png');

  game.load.audio('hats_yell', 'assets/audio/hats_yell.m4a');
  game.load.audio('nice_hat', 'assets/audio/nice_hat.m4a');
  game.load.audio('wilhelm', 'assets/audio/wilhelm.mp3');
}

function create() {
  // This function is called after the preload function
  // here we set up the gam, display sprites, etc
  var background = game.add.sprite(0, 0, 'background');
  hatYell = game.add.audio('hats_yell');
  compliment = game.add.audio('nice_hat');
  wilhelm = game.add.audio('wilhelm');

  // setup Score
  rabiesText = game.add.text(16, 16, 'You have 0 rabies', { fontSize: '28px' });
  hatsText = game.add.text(44, 44, 'but it\'s k because it\'s raining hats...', { fontSize: '16px' });
  highscoreText = game.add.text( 900, 44, 'Highscore: 0', {fontSize: '16px'});

  // setup Free Hats Group
  allHats = game.add.group();
  allHats.enableBody = true;
  allHats.physicsBodyType = Phaser.Physics.ARCADE;

  squirrels = game.add.group();
  squirrels.enableBody = true;
  squirrels.physicsBodyType = Phaser.Physics.ARCADE;

  game.physics.startSystem(Phaser.Physics.ARCADE);

  setupPlayer();
  setupSquirrels();
  setupSideWalls();
  setupHats();
  lastHatRain = game.time.now;

  //  Our controls.
  cursors = game.input.keyboard.createCursorKeys();
}

function setupSideWalls() {
  leftWall = game.add.sprite(-10, 0, 'cat_beanie');
  leftWall.scale.setTo(0.2, 22);
  game.physics.enable(leftWall);
  leftWall.body.immovable = true;

  rightWall = game.add.sprite(game.world.width, 0, 'cat_beanie');
  rightWall.scale.setTo(0.2, 22);
  game.physics.enable(rightWall);
  rightWall.body.immovable = true;
}

function makePoof(x, y) {
  var poof = game.add.sprite(x, y, 'poof');
  poof.anchor.setTo(0.5, 0.5);
  poof.animations.add('explosion', [0, 1, 2, 3, 4], 10, false);
  poof.animations.currentAnim.onComplete.add(function(){ poof.destroy(); }, this);
  poof.animations.play('explosion');
}

function setupHats() {
  for (var i = 0; i < 5; i++) {
    var rand = game.rnd.integerInRange(0, 5);
    var hat = allHats.create(game.rnd.integerInRange(0, game.world.width), -30, hatStrings[rand]);
    hat.anchor.setTo(0.5, 0.5);

    // Caps don't fit on player head if you dont set the anchor to this.
    switch (rand) {
      case 0:
        hat.anchor.setTo(0.5, 0.65);
        break;
      case 2, 3:
        hat.anchor.setTo(0.6, 0.5);
        break;
      default:
        break;
    }
    // hat.body.collideWorldBounds = true;
    hat.body.gravity.x = game.rnd.integerInRange(-100, 100);
    hat.body.gravity.y = 50 + Math.random() * 100;
    hat.body.bounce.x = 1.0;
  }
}

function setupPlayer() {
  hatYell.play();
  player = game.add.sprite(game.world.width/2, game.world.height, 'player');
  player.anchor.setTo(0.5, 0.5);
  player.animations.add('left', [8, 9, 10, 11], 10, true);
  player.animations.add('right', [12, 13, 14, 15], 10, true);
  player.animations.add('up', [4, 5, 6, 7], 10, true);
  player.animations.add('down', [0, 1, 2, 3], 10, true);

  // Set the physics system
  game.physics.enable(player);
  player.body.gravity.y = 0;
  player.body.collideWorldBounds = true;
  player.body.setSize(35, 35);

  var playerGroup = game.add.group();
  playerGroup.add(player);
}

function setupSquirrels() {

  for (var i = 0; i < 5; i++) {
    var randomX = game.rnd.integerInRange(0, game.world.width - 50);
    var randomY = game.rnd.integerInRange(477 , game.world.height - 50);
    var squirrel = squirrels.create(randomX, 477 + i * 20, 'squirrel');
    squirrel.anchor.setTo(0.5, 0.5);
    squirrel.animations.add('left', [0, 1, 2], 10, true);
    squirrel.animations.add('right', [3, 4, 5], 10, true);
    squirrel.goLeft = (randomX % 2 === 0);
    game.physics.enable(squirrel);

    squirrel.body.setSize(15, 5);
  }
}

function listenControls() {
  if (cursors.left.isDown) {
    player.body.velocity.x = -210;
    player.animations.play('left');
  } else if (cursors.right.isDown) {
    player.body.velocity.x = 210;
    player.animations.play('right');
  } else if (cursors.up.isDown) {
    if (player.position.y >= 475) {
      player.body.velocity.y = -210;
    }
    player.animations.play('up');
  } else if (cursors.down.isDown) {
    player.body.velocity.y = 210;
    player.animations.play('down');
  } else {
    player.animations.stop();
    player.frame = 0;
  }

  var pauseButton = game.input.keyboard.addKey(Phaser.Keyboard.P);
  pauseButton.onDown.add(pauseGame, this);

  if (player.position.y <= 467) {
    player.body.velocity.y = 0;
  }
}

function pauseGame() {
  game.paused = !game.paused;
}

function setupHatLanding() {
  for (var i = 0; i < allHats.children.length; i++) {
    var hat = allHats.children[i];
    if (hat.body.gravity.y === 0) { continue; }
    if (hat.body.position.y >= game.rnd.integerInRange(467, game.world.height - 19) ) {
      hat.body.velocity.y = 0;
      hat.body.velocity.x = 0;
      hat.body.gravity.y = 0;
      hat.body.gravity.x = 0;
    }
  }
}

function pickupHat(player, hat) {
  var cloned = game.add.sprite(player.x, player.y - 17 - (wornHats.length * 6), hat.key, hat.frame);
  cloned.anchor.setTo(hat.anchor.x, hat.anchor.y);

  allHats.remove(hat, true);
  wornHats.push(cloned);
  hat.kill();

  hatsText.text = 'but its k because you have ' + wornHats.length + ' hats...';
  if (wornHats.length > highscore) {
    highscore = wornHats.length;
    highscoreText.text = 'Highscore: ' + highscore;
  }
}

function keepHatOnHead() {
  for (var i = 0; i < wornHats.length; i++) {
    wornHats[i].x = player.x;
    wornHats[i].y = player.y - 17 - (i * 6);
  }
}

function squirrelLoop() {
  for (var i = 0; i < squirrels.children.length; i++) {
    var squirrel = squirrels.children[i];

    if (squirrel.x <= 0) {
      squirrel.goLeft = false;
      squirrel.animations.stop();
    } else if (squirrel.x >= 1067) {
      squirrel.goLeft = true;
      squirrel.animations.stop();
    }

    if (squirrel.goLeft) {
      squirrel.body.velocity.x = -400;
      squirrel.animations.play('left');
    } else {
      squirrel.body.velocity.x = 400;
      squirrel.animations.play('right');
    }
  }
}

function resetSquirrels() {
  squirrels.removeAll(true);
  setupSquirrels();
}

function resetPlayer() {
  player.x = game.world.width/2;
  player.y = game.world.height;
}

function eatPlayer(squirrel, player) {
  squirrel.body.velocity.x = 0;

  numWornHats = wornHats.length;
  for (var i = 0; i < numWornHats; i++) {
    var variance = 20 * (i % 2);
    makePoof(wornHats[0].x + variance, wornHats[0].y);
    wornHats[0].destroy();
    wornHats.splice(0, 1);
  }

  makePoof(player.x, player.y);

  wilhelm.play();

  rabiesCounter++;
  rabiesText.text = 'You have ' + rabiesCounter  + ' rabies';
  hatsText.text = '... yeah... that blows.'
  resetSquirrels();
  resetPlayer();
}

function update() {
  // Called each time screen draws so rougly 60 times per second
  // contains game's logic
  player.body.velocity.x = 0;
  player.body.velocity.y = 0;

  // Check if we want to rain hats
  if (game.time.now - lastHatRain > 1000) {
    lastHatRain = game.time.now;
    setupHats();
  }

  // Setup hat landing
  if (allHats) {
    setupHatLanding();
  }

  // Keep hats in line with your fucking head
  if (wornHats.length > 0) {
    keepHatOnHead();
  }

  // Make the squirrel run back and forth
  squirrelLoop();

  // Prepare collisions
  game.physics.arcade.overlap(player, allHats, pickupHat, null, this);
  game.physics.arcade.overlap(squirrels, player, eatPlayer);
  game.physics.arcade.collide(leftWall, allHats);
  game.physics.arcade.collide(rightWall, allHats);
  listenControls();
}

// Start the game
game.state.start();
