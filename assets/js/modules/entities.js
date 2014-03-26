/*
 * Entities module
 * Dependency: lodash, phaser, constants
 */
define(['lodash','phaser', 'modules/constants'], function(_, Phaser, Constants) {
  var _game = null;
  
  var _extends = function( derived, base ) {
		for( var p in base ){if( base.hasOwnProperty(p) ) derived[p] = base[p];}
		function __() { this.constructor = derived; }
		__.prototype = base.prototype;
		derived.prototype = new __();
	};
	
	var EntityTypes = {};
	
	EntityTypes.BaseSprite = function(game, tileset_name, tileset_gid, name, x, y, width, height, props) {
    // (account for anchor position when setting x & y )
		x += width * 0.5;
		y += height * 0.5;
		console.log("creating sprite with " + tileset_name + " using gid " + tileset_gid + " at location " + x + "," + y);
		Phaser.Sprite.call(this, game, x, y, tileset_name, tileset_gid );

   //console.log("key is " + key)
		// fields
		this.name = name || '';
		this.initial_x = x;
		this.initial_y = y;
		/** A sprite is not the player-controlled sprite by default.
		 * (override this for the player sprite!)
		 * @prop {boolean} is_player_sprite */
		this.is_player_sprite = false;

		// Phaser.Sprite settings
		this.anchor.x = 0.5;
		this.anchor.y = 0.5;
		// after setting the anchor we have to re-set x/y to get the sprite
		// in the correct position
		this.x = this.initial_x;
		this.y = this.initial_y;

		// set any additional properties onto the new sprite object
		if( props ) {
			for( var k in props ) {
				if( props.hasOwnProperty( k ) )	{
					if( k !== 'name' &&
						k !== 'initial_x' && 
						k !== 'initial_y' )
						this[k] = props[k];
				}
			}
		}

		game.add.existing( this );
  };
  
	EntityTypes.BaseSprite.prototype = Object.create( Phaser.Sprite );
	_extends( EntityTypes.BaseSprite, Phaser.Sprite );
	EntityTypes.BaseSprite.prototype.constructor = EntityTypes.BaseSprite;
  EntityTypes.BaseSprite.prototype.reset = function() {
		Phaser.Sprite.prototype.reset.call( this, this.initial_x, this.initial_y );
		Phaser.Sprite.prototype.updateCache.call( this );
	};

  
  return {
    init: function(game) {
      _game = game;
    },
    
    create: function(typeString, tileset_name, tileset_id, name, x, y, width, height, props) {
      var factory = EntityTypes['BaseSprite'];
      
      if(EntityTypes[typeString] !== undefined) {
        factory = EntityTypes[typeString];
      }
      
      return new factory(_game, tileset_name, tileset_id, name, x, y, width, height, props);
    }
  };
});