/*
 * HUD module
 * Dependency: constants, tileindex
 */
define(['rot', 'modules/constants', 'modules/tileindex'], function(ROT, Constants, TileIndex) {
  var _game = null,
      _floors = null,
      _floorTileIndexes = {},
      _walls = null,
      _wallTileIndexes = {},
      _objects = null,
      _paths = [],
      _doors = [],
      _digger = null;
  
  var FIXME = 1;
  
  var buildDungeon = function() {
    ROT.RNG.setSeed(10);
    _digger = new ROT.Map.Digger(40, 30, { roomWidth: [5,13], roomHeight: [3,15], corridorLength: [2,4], dugPercentage: 0.5 });
    _digger.create(renderPath);
        
    var rooms = _digger.getRooms();
    var initialRhinoLocation = Math.round(ROT.RNG.getUniform() * (rooms.length - 1));
        
    buildRooms(rooms, initialRhinoLocation);
        
    console.log("Hero Room: %s. Rooms: %s", initialRhinoLocation, rooms.length);
    spawnMasterRhino(rooms[initialRhinoLocation])
  };
  
  var renderPath = function(x, y, value) {
    var tile;
    if(!value) {
      tile = _floors.create(x * Constants.TILE_DIM, y * Constants.TILE_DIM, "tiles", TileIndex['FLOOR_NORMAL']);
      tile.tileXY = x + "," + y;
      tile.alpha = FIXME;
      _floorTileIndexes[tile.tileXY] = _floors.getIndex(tile);
    }

    _paths[x + "," + y] = value;
  };
  
  var buildRooms = function(rooms, initialRhinoLocation) {
    for(var i = 0; i < rooms.length; i++) {
      var room = rooms[i];
      renderRoom(room)
          
      // For locations not occupied by the hero at the beginning...
      if(i != initialRhinoLocation) {
        // Attempt to spawn monsters if not the hero location.
        spawnMonsters(room);
        
        // Attempt to spawn treasures.
        spawnTreasures(room);
      }
    }
  };
  
  // Responsible for converting a ROT room into Phaser.
  var renderRoom = function(room) {
    var tile;
        
    // Function used to build the walls of the room. Pretty simple to use.
    var buildWall = function(boundryA, boundryB, boundryC, vertical, tileType) {
      var tile;
        
      for(var i = boundryA -1; i <= boundryB +1; i++) {
        if(vertical) {
          tile = _walls.create((boundryC) * Constants.TILE_DIM, i * Constants.TILE_DIM, "tiles", tileType);
          tile.tileXY = boundryC + "," + i;
        } else {
          tile = _walls.create(i * Constants.TILE_DIM, (boundryC) * Constants.TILE_DIM, "tiles", tileType);
          tile.tileXY = i + "," + boundryC;
        }
            
        tile.alpha = FIXME;
            
        _wallTileIndexes[tile.tileXY] = _walls.getIndex(tile);
      }
    };
        
        
    // Top Wall
    buildWall(room.getLeft(), room.getRight(), room.getTop()-1, false, TileIndex['WALL_COBBLESTONE']);
        
    // Bottom Wall
    buildWall(room.getLeft(), room.getRight(), room.getBottom()+1, false, TileIndex['WALL_COBBLESTONE']);
        
    // Left Wall
    buildWall(room.getTop(), room.getBottom(), room.getLeft()-1, true, TileIndex['WALL_COBBLESTONE']);
        
    // Right Wall
    buildWall(room.getTop(), room.getBottom(), room.getRight()+1, true, TileIndex['WALL_COBBLESTONE']);

    room.getDoors(function (x, y) {
      tile = _walls.create(x * Constants.TILE_DIM, y * Constants.TILE_DIM, "tiles", TileIndex['DOOR_NORMAL']);
      tile.tileXY = x + "," + y;
      tile.alpha = FIXME;
      _wallTileIndexes[tile.tileXY] = _walls.getIndex(tile);

      // change floor
      var floorIndex = _floorTileIndexes[tile.tileXY];
      var floor = _floors.getAt(floorIndex);
      floor.frame = 3;

      // set this as default. when door is open, set to 0.
      _paths[x + "," + y] = 1;
      _doors[x + "," + y] = 1;
    });
  };
  
  var spawnMonsters = function(room) {
    // No logic in here yet.
  };
      
  var spawnTreasures = function(room) {
    // No logic in here yet.
  };
      
  var spawnMasterRhino = function(startingRoom) {
    // Calculate random location within a starting room.
    var h = startingRoom.getRight() - startingRoom.getLeft() * 0.5;
    var v = startingRoom.getBottom() - startingRoom.getTop() * 0.5;
    var randX = startingRoom.getLeft() + Math.round(ROT.RNG.getNormal(h, h*0.5));
    var randY = startingRoom.getTop() + Math.round(ROT.RNG.getNormal(v, v*0.5));
        
    //rhino.masterRhino.sprite = rhino.map.objects.create(randX * Constants.TILE_DIM, randY * Constants.TILE_DIM, "tiles", TileIndex['PLAYER_NORMAL']);
    //rhino.masterRhino.sprite.tileX = randX;
    //rhino.masterRhino.sprite.tileY = randY;
    //rhino.masterRhino.sprite.name = "MasterRhino";
  };
  
  return {
    init: function(game) {
      _game = game;
    },
    
    create: function() {
      _floors = _game.add.group();
      _floors.z = 1;

      _objects = _game.add.group();
      _objects.z = 2;

      _walls = _game.add.group();
      _walls.z = 3;
      
      buildDungeon();
    },
    
    update: function() {
      
    }
  };
});