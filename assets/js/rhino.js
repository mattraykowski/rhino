$(document).ready(function() {
  var tiles = {
    'DOOR_NORMAL'      : 2,
    'WALL_BLOCKS'      : 15,
    'WALL_COBBLESTONE' : 16,
    'FLOOR_EMPTY'      : 50,
    'FLOOR_NORMAL'     : 51,
    'PLAYER_NORMAL'    : 190,
    'HEART_FULL'       : 250
    
  };
  
  var TILE_DIM              = 16;
  var MAX_MONSTERS_PER_ROOM = 5;
  var MAX_RHINO_HEALTH      = 4;
  var RHINO_DEBUG = true;
  
  var rhino = {
    // Some constants.
    game: null,
    
    masterRhino: {
      sprite: null,
      health: MAX_RHINO_HEALTH
    },
    
    // Holds all of the variables and functions for managing and interacting with rot.js
    rot: {
      scheduler: null,
      
      process: function() {
        
      }
    },
    
    // Holds all of the variables and functions for manipulating the HUD.
    hud: {
      PADDING: 2,
      group: null,
      health: [],
      
      init: function() {
        // Build the HUD.
        rhino.hud.group = rhino.game.add.group();
        rhino.hud.group.z = 10;
        for(var i=0; i<MAX_RHINO_HEALTH; i++) {
          rhino.hud.health[i] = rhino.hud.group.create(i * (TILE_DIM + rhino.hud.PADDING), 0, "tiles", tiles['HEART_FULL']);
          console.log(rhino.hud.health[i]);
          rhino.hud.health[i].fixedToCamera = true;  
        }
      }
    },
    
    map: {
      floors: null,
      floorTileIndexes: {},
      walls: null,
      wallTileIndexes: {},
      objects: null,
      paths: [],
      doors: [],
      
      masterRhino: null,
      
      digger: null,
      
      
      
      init: function() {
        rhino.map.floors = rhino.game.add.group();
		    rhino.map.floors.z = 1;
		    
		    rhino.map.objects = rhino.game.add.group();
		    rhino.map.objects.z = 2;
		    
		    rhino.map.walls = rhino.game.add.group();
		    rhino.map.walls.z = 3;
      },
      
      buildDungeon: function() {
        ROT.RNG.setSeed(10);
        rhino.map.digger = new ROT.Map.Digger(40, 30, { roomWidth: [5,13], roomHeight: [3,15], corridorLength: [2,4], dugPercentage: 0.5 });
        rhino.map.digger.create(rhino.map.renderPath);
        
        var rooms = rhino.map.digger.getRooms();
        var initialRhinoLocation = Math.round(ROT.RNG.getUniform() * (rooms.length - 1));
        
        rhino.map.buildRooms(rooms, initialRhinoLocation);
        
        console.log("Hero Room: %s. Rooms: %s", initialRhinoLocation, rooms.length);
        rhino.map.spawnMasterRhino(rooms[initialRhinoLocation])
      },
      
      buildRooms: function(rooms, initialRhinoLocation) {
        for(var i = 0; i < rooms.length; i++) {
          var room = rooms[i];
          rhino.map.renderRoom(room)
          
          // For locations not occupied by the hero at the beginning...
          if(i != initialRhinoLocation) {
            // Attempt to spawn monsters if not the hero location.
            rhino.map.spawnMonsters(room);
            
            // Attempt to spawn treasures.
            rhino.map.spawnTreasures(room);
          }
        }
      },
      
      renderPath: function(x, y, value) {
        var tile;
        if(!value) {
          tile = rhino.map.floors.create(x * TILE_DIM, y * TILE_DIM, "tiles", tiles['FLOOR_NORMAL']);
          tile.tileXY = x + "," + y;
          tile.alpha = rhino.debug.alpha();
          rhino.map.floorTileIndexes[tile.tileXY] = rhino.map.floors.getIndex(tile);
        }
        
        rhino.map.paths[x + "," + y] = value;
      },
      
      // Responsible for converting a ROT room into Phaser.
      renderRoom: function(room) {
        var tile;
        
        // Function used to build the walls of the room. Pretty simple to use.
        var buildWall = function(boundryA, boundryB, boundryC, vertical, tileType) {
          var tile;
          
          for(var i = boundryA -1; i <= boundryB +1; i++) {
            if(vertical) {
              tile = rhino.map.walls.create((boundryC) * TILE_DIM, i * TILE_DIM, "tiles", tileType);
              tile.tileXY = boundryC + "," + i;
            } else {
              tile = rhino.map.walls.create(i * TILE_DIM, (boundryC) * TILE_DIM, "tiles", tileType);
              tile.tileXY = i + "," + boundryC;
            }
            
            tile.alpha = rhino.debug.alpha();
            
            rhino.map.wallTileIndexes[tile.tileXY] = rhino.map.walls.getIndex(tile);
          }
        };
        
        
        // Top Wall
        buildWall(room.getLeft(), room.getRight(), room.getTop()-1, false, tiles['WALL_COBBLESTONE']);
        
        // Bottom Wall
        buildWall(room.getLeft(), room.getRight(), room.getBottom()+1, false, tiles['WALL_COBBLESTONE']);
        
        // Left Wall
        buildWall(room.getTop(), room.getBottom(), room.getLeft()-1, true, tiles['WALL_COBBLESTONE']);
        
        // Right Wall
        buildWall(room.getTop(), room.getBottom(), room.getRight()+1, true, tiles['WALL_COBBLESTONE']);
		    
		    room.getDoors(function (x, y) {
			    tile = rhino.map.walls.create(x * TILE_DIM, y * TILE_DIM, "tiles", tiles['DOOR_NORMAL']);
			    tile.tileXY = x + "," + y;
			    tile.alpha = rhino.debug.alpha();
			    rhino.map.wallTileIndexes[tile.tileXY] = rhino.map.walls.getIndex(tile);

			    // change floor
			    var floorIndex = rhino.map.floorTileIndexes[tile.tileXY];
			    var floor = rhino.map.floors.getAt(floorIndex);
			    floor.frame = 3;

			    // set this as default. when door is open, set to 0.
			    rhino.map.paths[x + "," + y] = 1;
			    rhino.map.doors[x + "," + y] = 1;
		    });
      },
      
      spawnMonsters: function(room) {
        
      },
      
      spawnTreasures: function(room) {
        
      },
      
      spawnMasterRhino: function(startingRoom) {
        // Calculate random location within a starting room.
        var h = startingRoom.getRight() - startingRoom.getLeft() * 0.5;
        var v = startingRoom.getBottom() - startingRoom.getTop() * 0.5;
        var randX = startingRoom.getLeft() + Math.round(ROT.RNG.getNormal(h, h*0.5));
        var randY = startingRoom.getTop() + Math.round(ROT.RNG.getNormal(v, v*0.5));
        
        rhino.masterRhino.sprite = rhino.map.objects.create(randX * TILE_DIM, randY * TILE_DIM, "tiles", tiles['PLAYER_NORMAL']);
        rhino.masterRhino.sprite.tileX = randX;
        rhino.masterRhino.sprite.tileY = randY;
        rhino.masterRhino.sprite.name = "MasterRhino";
      }
    },
    
    preload: function() {
      rhino.game.load.spritesheet("tiles", "/assets/images/tiles16x16.png", TILE_DIM, TILE_DIM);
      
      rhino.music.init();
    },
    
    create: function() {
      // Initialize the Rot.js scheduler:
      rhino.rot.scheduler = new ROT.Scheduler.Simple();
      
      rhino.hud.init();
      rhino.map.init();
      
      rhino.map.buildDungeon();
      
      rhino.music.play('backgroundMusic', true);

    },
    
    update: function() {
      
    },
    
    init: function() {
      rhino.game = new Phaser.Game(640, 480, Phaser.AUTO, "game", {
		    preload: rhino.preload,
		    create: rhino.create,
		    update: rhino.update
	    });
    },
    
    music: {
      currentSong: null,
      
      init: function() {
        rhino.game.load.audio('backgroundMusic', ['/assets/audio/bg1.mp3']);
      },
      
      play: function(song, loop) {
        rhino.music.currentSong = rhino.game.sound.play(song);
        console.log(rhino.music.currentSong);
        rhino.music.currentSong.loop = loop;
      }
      
    },
    
    debug: {
      alpha: function() {
        if(RHINO_DEBUG) {
          return 1;
        } else {
          return 0;
        }
      }
    }
  }
  
  rhino.init();
});