/*
 * HUD module
 * Dependency: constants, tileindex
 */
define(['lodash','jquery','phaser', 'modules/constants'], function(_, jquery, Phaser, Constants) {
  var _game = null,
      _levelData = null,
      _levelName = null,
      _map = null,
      _layers = [],
      _loaded = false,
      _collisionLayerIndex = 0;
  
  var BASE_ASSET_TILE_PATH = 'assets/tileset/';

  var waitForLoad = function(timeoutFn) {
    if(_game.load.totalQueuedFiles() !== 0) {
      setTimeout(function() {
        waitForLoad(timeoutFn);
      }, 10);
    } else {
      timeoutFn();
    }
  };
  
  var preloadMap = function(next) {
    console.log("[LOADING LEVEL] Loading level map: " + _levelName);
    _game.load.tilemap('level', BASE_ASSET_TILE_PATH + _levelName + '.json', null, Phaser.Tilemap.TILED_JSON);

    // Kick off the loader to get the tilemap data.
    _game.load.start();
    waitForLoad(function() {
      loadTilesetImages(next);
    });
  };

  var loadTilesetImages = function(next) {
    var data = _game.cache.getTilemapData( 'level' ).data;

    data.tilesets.forEach(function(tileset) {
      console.log('[LOADING LEVEL] Tileset Image (' + tileset.name + ') ' + tileset.image);
      _game.load.image(tileset.name, BASE_ASSET_TILE_PATH + tileset.image, Constants.TILE_DIM, Constants.TILE_DIM);
    });

    // Kick off the loader to load the images.
    _game.load.start();

    waitForLoad(function() {
       next();
     });
   };
  
  var createLayers = function() {
    var data = _game.cache.getTilemapData( 'level' ).data;
    var layers = data.layers;
    var layerCount = 0;

    layers.forEach(function(layer) {
      switch(layer.type) {
        case 'tilelayer':
          createTileLayer(layer, layerCount);
          layerCount++;
          break;
        case 'objectgroup':
          //createObjectLayer();
          break;
        default:
          console.log("[LAYER LOADER] Failed to load layer: invalid layer type: " + layer.type);
          break;
      }
    });
  };

  var createTileLayer = function(layer, layerLevel) {
    var mapLayer = _map.createLayer(layerLevel);
    mapLayer.name = layer.name;
    mapLayer.visible = layer.visible;
    mapLayer.fixedToCamera = false;

    if(layer.properties && layer.properties.solid == 'true') {
      mapLayer.solid = true;
    } else {
      mapLayer.solid = false;
    }
    _layers.push(mapLayer);
  };

  var createObjectLayer = function(layer) {

  }

  var buildCollisions = function() {
    var data = _game.cache.getTilemapData( 'level' ).data;
    var solidTiles = [];
    
    data.tilesets.forEach(function(tileset) {
      var tileProperties = tileset.tileproperties;
      console.log("tileset firstgid " + tileset.firstgid )
      var tileset_gid = +tileset.firstgid;

      if(tileProperties !== undefined) {
        for(var key in tileProperties) {
          var index = +key;
          var tile_index = index+tileset_gid;

          if( !isNaN(index)) {
            var val = tileProperties[index];

            if(val.solid !== undefined) {
              solidTiles.push(index+tileset_gid);
            }
          }
        }
      }
    });

    for(var idx = 0; idx < _layers.length; idx++) {
      var layer = _layers[idx];

      if(layer.solid) {
        console.log('[LOADING LEVEL] Setting solid tile collision for this layer: ' + layer.index);
        
        _collisionLayerIndex = idx;
        _map.setCollision(solidTiles, true, layer);
      }
    };
  };

  var buildMap = function(next) {
    var data = _game.cache.getTilemapData( 'level' ).data;

     // Load the map.
    _map = _game.add.tilemap('level');
    
    data.tilesets.forEach(function(tileset) {
      console.log('[LOADING LEVEL] Associating tileset to image (' + tileset.name + ') ' + tileset.image);

      _map.addTilesetImage(tileset.name);
    });

    createLayers();
    
    // Create the layers.
    // _levelData.tilemap.layers.forEach(function(layer) {
    //   _layer[layer.name] = _map.createLayer(layer.name);
    //   //_layer[layer.name].z = 1;
      
    //   // Hide invisible layers
    //   if(layer.visible === false) {
    //     _layer[layer.name].visible = false;
    //   }
      
    //   // Make collision layers active.
    //   if(layer.collision === true) {
    //     _map.setCollision(layer.collideIndices, true, _layer[layer.name]);
    //   }
      
    //   if(layer.world === true) {
    //     _layer[layer.name].resizeWorld();
    //   }
    // });

    buildCollisions();
    
    _loaded = true;
    next();
  };
  
  var loadLevel = function(levelName, next) {
    preloadMap(function() {
      buildMap(function() {
        next();
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
    
    loadLevel: function(levelName, next) {
      _levelName = levelName;
      loadLevel(levelName, next);
    },
    
    isLoaded: function() {
      return _loaded;
    },
    
    getCollisionLayer: function() {
      return _layers[_collisionLayerIndex];
    }
  };
});