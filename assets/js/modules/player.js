/*
 * Player module
 * Dependency: constants
 */
define(['modules/constants'], function(Constants) {
  var _game = null,
      _playerSprite = null;
      
  return {
    init: function(game) {
      _game = game;
      
      _game.load.spritesheet("player0", "/assets/tileset/Characters/Player0.png", Constants.TILE_DIM, Constants.TILE_DIM);
    },
    
    create: function() {
      _playerSprite = _game.add.sprite(200, 70, 'player0', 0);
      _playerSprite.anchor.setTo(0.5, 0.5);
      _playerSprite.z = 100;

      _game.camera.follow(_playerSprite);

    },
    
    update: function() {
      
    }
  };
});