require.config({
  'paths': {
    'phaser': '../../components/phaser/phaser',
    'jquery': '../../components/jquery/dist/jquery'
  },
  
  shim: {
    'rot': {
      exports: 'ROT'
    }
  }
});

require(['phaser','rot', 'modules/constants', 'modules/tileindex', 'modules/hud', 'modules/map', 'modules/musicmanager', 'modules/level', 'modules/player'], 
    function(Phaser, ROT, Constants, TileIndex, HUD, Map, MusicManager, Level, Player) {
      
  var _game = null;
  
  var rhino = {
    // Some constants.
    game: null,
    
    masterRhino: {
      sprite: null,
      health: Constants.MAX_RHINO_HEALTH
    },

    preload: function() {
      rhino.game.load.spritesheet("tiles", "/assets/images/tiles16x16.png", Constants.TILE_DIM, Constants.TILE_DIM);
      
      MusicManager.init(rhino.game);
      HUD.init(rhino.game);
      //Map.init(rhino.game);
      
      Level.init(rhino.game);
      Player.init(rhino.game);
    },
    
    create: function() {
      // Initialize the Rot.js scheduler:
      //rhino.rot.scheduler = new ROT.Scheduler.Simple();
      
      HUD.create();
      //Map.create();
      MusicManager.create();
      
      //MusicManager.play('backgroundMusic', true);
      
      Level.create();
      Level.loadLevel(function() {
        Player.create();
      });
      

    },
    
    update: function() {
      HUD.update();
      //Map.update();
      
      Level.update();
      MusicManager.update();
      Player.update();
    },
    
    init: function() {
      rhino.game = new Phaser.Game(640, 480, Phaser.AUTO, "#game-container", {
        preload: rhino.preload,
        create: rhino.create,
        update: rhino.update
      });
    },
  }
  
  rhino.init();
});