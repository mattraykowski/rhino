/*
 * HUD module
 * Dependency: constants, tileindex
 */
define(['jquery','phaser'], function(jquery, Phaser) {
  var _game = null,
      _levelData = null,
      _map = null,
      _layer = {};
  
  var loadMapJson = function(next) {
    jquery.ajax({
      url: '/assets/maps/example/example.json'
    }).done(function(data) {
      _levelData = data;
      
      next();
    });
  };
  
  var preloadMap = function(next) {
    console.log("[LOADING LEVEL] Loading level map: " + _levelData.tilemap.file);
    _game.load.tilemap('level3', _levelData.tilemap.file, null, Phaser.Tilemap.TILED_JSON);
      
    // Load the images that the level will use.
    _levelData.tilemap.images.forEach(function(tileImage) {
      console.log("[LOADING LEVEL] Loading tile image: (" + tileImage.name +") " + tileImage.file);
      _game.load.image(tileImage.name, tileImage.file, 16, 16);
    });
    
    _game.load.start();
    var waitForLoad = function() {
      if(_game.load.totalQueuedFiles() !== 0) {
        setTimeout(waitForLoad, 10);
      } else {
        next();
      }
    };
    waitForLoad();
  };
  
  var buildMap = function(next) {
     // Load the map.
    _map = _game.add.tilemap('level3');
    
    // Associate the images to the tilsets.
    _levelData.tilemap.images.forEach(function(tileImage) {
      _map.addTilesetImage(tileImage.name, tileImage.name);
    });
    
    // Create the layers.
    _levelData.tilemap.layers.forEach(function(layer) {
      _layer[layer.name] = _map.createLayer(layer.name);
      //_layer[layer.name].z = 1;
      
      // Hide invisible layers
      if(layer.visible === false) {
        _layer[layer.name].visible = false;
      }
      
      // Make collision layers active.
      if(layer.collision === true) {
        //_layer[layer.name].
      }
      
      if(layer.world === true) {
        _layer[layer.name].resizeWorld();
      }
    });
    
    next();
  };
  
  var loadLevel = function(next) {
    loadMapJson(function() {
      preloadMap(function() {
        buildMap(next);
      });
    });
    
  };
  return {
    init: function(game) {
      _game = game;
    },
    
    create: function() {
      
    },
    
    update: function() {
      
    },
    
    loadLevel: function() {
      loadLevel();
    }
  }
});