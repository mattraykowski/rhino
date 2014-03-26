/*
 * HUD module
 * Dependency: constants, tileindex
 */
define(['lodash','jquery','phaser', 'modules/constants', 'modules/entities'], function(_, jquery, Phaser, Constants, Entities) {
  var _game = null,
      _levelData = null,
      _levelName = null,
      _map = null,
      _layers = [],
      _loaded = false,
      _collisionLayerIndex = 0,
      _groups = [];
  
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
          createObjectLayer(layer, data.tilesets);
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

  var createObjectLayer = function(layer, tilesets) {
    var og = layer;
    var group = _game.add.group();
    group.name = og.name || '';
    group.visible = og.visible === undefined ? true : og.visible;
    group.alpha = +og.opacity || 1;
    
    og.objects.forEach(function(ogObject) {
      console.log(ogObject);
      
      var tileset_name;
      var tileset_id;
      // We'll need to look up the tileset that this uses to determine the sprintsheet and tileset ID to use.
      console.log(tilesets.length)
      var last_tileset;
      for(var idx=0; idx < tilesets.length; idx++) {
        var tileset = tilesets[idx];
        //console.log(tileset);
        //console.log("first gid: " + tileset.first_gid + " tile gid: " + ogObject.gid);
        var tilesetFirstGid = +tileset.firstgid;
        var objectGid = +ogObject.gid;
        if(tilesetFirstGid > objectGid) {
          var lastTilesetFirstGid = +last_tileset.firstgid;
          
          tileset_name = last_tileset.name;
          tileset_id = objectGid - lastTilesetFirstGid;
          console.log("matched: " + tileset_name + " with local id:" +tileset_id);
          break;
        } else {
          last_tileset = tileset;
        }
      }
      var newObject = Entities.create(ogObject.type, tileset_name, tileset_id, ogObject.name, ogObject.x, ogObject.y, ogObject.width, ogObject.height, ogObject.properties);
      
      if(newObject === null) {
        return;
      }
      
      group.add(newObject);
      _groups.push(group);
    });
    
    console.log(og.name);
  };

  var buildCollisions = function() {
    var data = _game.cache.getTilemapData( 'level' ).data;
    var solidTiles = [];
    
    data.tilesets.forEach(function(tileset) {
      var tileProperties = tileset.tileproperties;
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
    
    var main_layer_name = data.properties.main_layer || 'World Layer';
    var main_layer = _.first(_layers, function(layer) {
      return layer.name == main_layer_name
    });
    
    main_layer[0].resizeWorld();

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
      _groups.forEach(function(group) {
        group.exists = true;
      });
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