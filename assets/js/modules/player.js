/*
 * Player module
 * Dependency: constants
 */
define(['phaser', 'modules/constants', 'modules/level'], function(Phaser, Constants, Level) {
  var _game = null,
      _playerSprite = null,
      _cursors = null,
      _state = 'idle';
  
  var DEFAULT_PLAYER_VELOCITY = 50;
  
  return {
    init: function(game) {
      _game = game;
      
      _game.load.spritesheet("player0", "/assets/tileset/Characters/Player0.png", Constants.TILE_DIM, Constants.TILE_DIM);
    },
    
    create: function() {
      _playerSprite = _game.add.sprite(200, 70, 'player0', 0);
      _playerSprite.anchor.setTo(0.5, 0.5);
      _playerSprite.body.collideWorldBounds = true;
      _playerSprite.z = 100;

      _game.camera.follow(_playerSprite, Phaser.Camera.FOLLOW_PLATFORMER);
      _cursors = _game.input.keyboard.createCursorKeys();

    },
    
    update: function() {
      // We can't do anything until the level is loaded.
      if(!Level.isLoaded()) {
        return;
      }
      
      
      var collisionLayer = Level.getCollisionLayer();
      var keyPressed = false;
      
      //console.log(collisionLayer)
      _game.physics.collide(_playerSprite, collisionLayer);
      
      _playerSprite.body.velocity.x = 0;
      _playerSprite.body.velocity.y = 0;

      if(_cursors.left.isDown) {
        _playerSprite.body.velocity.x = -DEFAULT_PLAYER_VELOCITY;
        keyPressed = true;
        if(_state != 'left') {
          //_playerSprite.animations.play('left');
          _state = 'left';
        }
      } else if(_cursors.right.isDown) {
        _playerSprite.body.velocity.x = DEFAULT_PLAYER_VELOCITY;
        keyPressed = true;
        
        if(_state != 'right') {
          //_playerSprite.animations.play('right');
          _state = 'right';
        }
      }
      
      if(_cursors.up.isDown) {
        _playerSprite.body.velocity.y = -DEFAULT_PLAYER_VELOCITY;
        keyPressed = true;
        
        if(_state != 'up') {
          //_playerSprite.animations.play('right');
          _state = 'up';
        }
      } else if(_cursors.down.isDown) {
        _playerSprite.body.velocity.y = DEFAULT_PLAYER_VELOCITY;
        keyPressed = true;
        
        if(_state != 'down') {
          //_playerSprite.animations.play('right');
          _state = 'down';
        }
      }
      
      // If we didn't press a key switch back to an idle state.
      if(!keyPressed && _state != 'idle') {
        //_playerSprite.animations.stop();

        // if(_state == 'left'){
        //   _playerSprite.frame = 0;
        // } else {
        //   _playerSprite.frame = 5;
        // }
        _state = 'idle';
      }
    }
  };
});