var game = new Phaser.Game(1067, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var player;
var hatStrings = ['cat_hat', 'dog_hat', 'heart_cap', 'normal_cap', 'cat_beanie', 'paper_hat'];
var free_hats;
var worn_hats = new Array();
var cursors;
var hat_yell;
var compliment;
var hats_finished_setup = true;
var squirrel;

function preload() {
  // This function gets executed at the beginning
  // This is where you load images and sounds
  game.load.image('background', 'assets/background.png');

  game.load.spritesheet('player', 'assets/playerpink.png', 37, 42);
  game.load.spritesheet('squirrel', 'assets/squirrel/squirrelpink.png', 30, 24);

  game.load.image('cat_hat', 'assets/hats/cat_hat.png');
  game.load.image('dog_hat', 'assets/hats/dog_hat.png');
  game.load.image('heart_cap', 'assets/hats/heart_cap.png');
  game.load.image('cat_beanie', 'assets/hats/cat_beanie.png');
  game.load.image('normal_cap', 'assets/hats/normal_cap.png');
  game.load.image('paper_hat', 'assets/hats/paper_hat.png');

  game.load.audio('hats_yell', 'assets/hats_yell.m4a');
  game.load.audio('nice_hat', 'assets/nice_hat.m4a');
}

function create() {
  // This function is called after the preload function
  // here we set up the gam, display sprites, etc
  var background = game.add.sprite(0, 0, 'background');
  hat_yell = game.add.audio('hats_yell');
  compliment = game.add.audio('nice_hat');

  // setup Free Hats Group
  free_hats = game.add.group();
  free_hats.enableBody = true;
  free_hats.physicsBodyType = Phaser.Physics.ARCADE;

  game.physics.startSystem(Phaser.Physics.ARCADE);

  setupPlayer();
  setupSquirrel();
  setupPoof();

  //  Our controls.
  cursors = game.input.keyboard.createCursorKeys();
}

function setupHats() {
  hat_yell.play();
  for (var i = 0; i < 2; i++) {
    var rand = game.rnd.integerInRange(0, 5);
    var hat = free_hats.create(game.rnd.integerInRange(0, game.world.width), 0, hatStrings[rand]);
    hat.anchor.setTo(0.5, 0.5);

    // Caps don't fit on player head if you dont set the anchor to this.
    switch (rand) {
      case 2, 3:
        hat.anchor.setTo(0.6, 0.5);
        break;
      default:
        break;
    }
    hat.body.collideWorldBounds = true;
    hat.body.gravity.x = game.rnd.integerInRange(-50, 50);
    hat.body.gravity.y = 50 + Math.random() * 100;
  }
}

function setupPoof() {

}

function setupPlayer() {
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

  var playerGroup = game.add.group();
  playerGroup.add(player);
}

function setupSquirrel() {
  squirrel = game.add.sprite(game.world.width - 50, game.world.height - 50, 'squirrel');
  squirrel.anchor.setTo(0, 0.5);
  squirrel.animations.add('left', [0, 1, 2], 10, true);
  squirrel.animations.add('right', [3, 4, 5], 10, true);
  squirrel.goLeft = true;
  game.physics.enable(squirrel);
}

function listenControls() {
  if (cursors.left.isDown) {
    player.body.velocity.x = -150;
    player.animations.play('left');
  } else if (cursors.right.isDown) {
    player.body.velocity.x = 150;
    player.animations.play('right');
  } else if (cursors.up.isDown) {
    if (player.position.y >= 475) {
      player.body.velocity.y = -150;
    }
    player.animations.play('up');
  } else if (cursors.down.isDown) {
    player.body.velocity.y = 150;
    player.animations.play('down');
  } else {
    player.animations.stop();
    player.frame = 0;
  }

  var dropHats = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  dropHats.onDown.add(setupHats, this);

  if (player.position.y <= 467) {
    player.body.velocity.y = 0;
  }
}

function setupHatLanding() {
  for (var i = 0; i < free_hats.children.length; i++) {
    hats_finished_setup = false;
    var hat = free_hats.children[i];
    if (hat.body.gravity.y === 0) { continue; }
    if (hat.body.position.y >= game.rnd.integerInRange(467, game.world.height - 19) ) {
      hat.body.velocity.y = 0;
      hat.body.velocity.x = 0;
      hat.body.gravity.y = 0;
      hat.body.gravity.x = 0;
    }
  }
  hats_finished_setup = true;
}

function pickupHat(player, hat) {
  var cloned = game.add.sprite(0, 0, hat.key, hat.frame);
  cloned.anchor.setTo(hat.anchor.x, hat.anchor.y);

  worn_hats.push(cloned);
  hat.kill();
  // compliment.play();
}

// function eatHat(squirrel, hat) {
//   hat.kill();
// }

function keepHatOnHead() {
  for (var i = 0; i < worn_hats.length; i++) {
    worn_hats[i].x = player.x;
    worn_hats[i].y = player.y - 15 - (i * 6);
  }
}

function squirrelLoop() {
  // console.log(squirrel.x);
  if (squirrel.x <= 0) {
    squirrel.goLeft = false;
    squirrel.animations.stop();
  } else if (squirrel.x >= 1067) {
    squirrel.goLeft = true;
    squirrel.animations.stop();
  }

  if (squirrel.goLeft) {
    squirrel.body.velocity.x = -300;
    squirrel.animations.play('left');
  } else {
    squirrel.body.velocity.x = 300;
    squirrel.animations.play('right');
  }
}

function update() {
  // Called each time screen draws so rougly 60 times per second
  // contains game's logic
  player.body.velocity.x = 0;
  player.body.velocity.y = 0;

  // Setup hat landing
  if (free_hats) {
    setupHatLanding();
  }

  // Keep hats in line with your fucking head
  if (worn_hats.length > 0) {
    keepHatOnHead();
  }

  // Make the squirrel run back and forth
  squirrelLoop();

  // Prepare collisions
  game.physics.arcade.overlap(player, free_hats, pickupHat, null, this);
  // game.physics.arcade.overlap(squirrel, free_hats, eatHat, null, this);
  game.physics.arcade.collide(squirrel, free_hats);
  game.physics.arcade.collide(squirrel, player);
  listenControls();
}

// Start the game
game.state.start();
