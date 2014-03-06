/*
 * InitialState module
 * Dependency: constants, tileindex
 */
define(['modules/constants', 'modules/tileindex'], function(Constants, TileIndex) {
  var _game = null;
      
  var PADDING = 2;
  
  return {
    init: function(game) {
      _game = game;
    },
    
    create: function() {
      _group = _game.add.group();
      _group.z = 10;
      
      for(var i=0; i<Constants.MAX_RHINO_HEALTH; i++) {
        _health[i] = _group.create(i * (Constants.TILE_DIM + PADDING), 0, "tiles", TileIndex['HEART_FULL']);
        console.log(_health[i]);
        _health[i].fixedToCamera = true;  
      }
    },
    
    update: function() {
      
    }
  };
});