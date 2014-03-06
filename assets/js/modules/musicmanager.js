/*
 * MusicManager module
 * Dependency: null
 */
define(function() {
  var _game = null;
  var _currentSong = null;
  
  return {
    init: function(game) {
      _game = game;
      _game.load.audio('backgroundMusic', ['/assets/audio/bg1.mp3']);
    },
    
    create: function() {
      
    },
    
    update: function() {
      
    },
    
    play: function(song, loop) {
      _currentSong = _game.sound.play(song);
      _currentSong.loop = loop;
      console.log(_currentSong);
    }
  };
});