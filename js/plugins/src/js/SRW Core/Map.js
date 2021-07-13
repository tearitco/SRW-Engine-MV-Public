	export default {
		patches: patches,
	} 
	
	function patches(){};
	
	patches.apply = function(){
		//====================================================================
		// ●Game_Map
		//====================================================================
		//アクター・エネミーデータに合わせてグラフィックを変更する
		
		var Game_Map_prototype_initialize = Game_Map.prototype.initialize;
		Game_Map.prototype.initialize = function() {
			Game_Map_prototype_initialize.call(this);		
			
		}
		
		Game_Map.prototype.setupEvents = function() {
			this._events = [];
			for (var i = 0; i < $dataMap.events.length; i++) {
				if ($dataMap.events[i]) {
					this._events[i] = new Game_Event(this._mapId, i);
				}
			}
			this._startOfDynamicEvents = this._events.length;
			for (var i = this._startOfDynamicEvents; i < this._startOfDynamicEvents + 100; i++) {
				var event = new Game_Event(this._mapId, i);
				event.isUnused = true;
				this._events[i] = event;			
			}
			this._commonEvents = this.parallelCommonEvents().map(function(commonEvent) {
				return new Game_CommonEvent(commonEvent.id);
			});
			this.refreshTileEvents();
		};
		
		Game_Map.prototype.getRegionTiles = function(id) {
			if(!this._regionTilesLookup){
				this._regionTilesLookup = {};
				for(var i = 0; i < this.width(); i++){
					for(var j = 0; j < this.width(); j++){
						var region = this.regionId(i, j);
						if(!this._regionTilesLookup[region]){
							this._regionTilesLookup[region] = [];
						}
						this._regionTilesLookup[region].push({x: i, y: j});
					}
				}
			}
			return this._regionTilesLookup[id] || [];
		}
		
		Game_Map.prototype.initSRWTileProperties = function() {
			var _this = this;
			if(!this._SRWTileProperties){
				this._SRWTileProperties = {};
			}
			if(!this._SRWTileProperties[this._tilesetId]){
				var regex = new RegExp("srwTileAttributes([0-9]+)");
				var rangeRegex = new RegExp("srwTileAttributes([0-9]+)\-([0-9]+)");
				this._SRWTileProperties[this._tilesetId] = {};
				var tileSetMeta = $dataTilesets[this._tilesetId].meta;
				Object.keys(tileSetMeta).forEach(function(key){				
					var matches = key.match(regex);
					if(matches.length){
						_this._SRWTileProperties[_this._tilesetId][matches[1]] = tileSetMeta[key];
					}
					var matches = key.match(rangeRegex);
					if(matches.length){
						var startId = matches[1];
						var endId = matches[2];
						for(var i = startId; i < endId; i++){
							_this._SRWTileProperties[_this._tilesetId][i] = tileSetMeta[key];
						}
					}
				});
			}
		};
		
		Game_Map.prototype.getTileProperties = function(tileCoords) {
			if(this._SRWTileProperties && this._SRWTileProperties[this._tilesetId]){
				var bTileId = $gameMap.tileId(tileCoords.x, tileCoords.y, 3);
				var autoTileId = $gameMap.tileId(tileCoords.x, tileCoords.y, 1);
				var groundTileId = $gameMap.tileId(tileCoords.x, tileCoords.y, 0);
				
				if(this._SRWTileProperties[this._tilesetId][bTileId]){
					return this._SRWTileProperties[this._tilesetId][bTileId];
				} else if(this._SRWTileProperties[this._tilesetId][autoTileId]){
					return this._SRWTileProperties[this._tilesetId][autoTileId];
				} else if(this._SRWTileProperties[this._tilesetId][groundTileId]){
					return this._SRWTileProperties[this._tilesetId][groundTileId];
				}
			} else {
				return null;
			}		
		}
		
		Game_Map.prototype.getTilePropertiesAsObject = function(tileCoords) {
			var result;
			var string = this.getTileProperties(tileCoords);
			if(string){
				var parts = string.split(",");		
				result = {
					defense: String(parts[0]).trim()*1,
					evasion: String(parts[1]).trim()*1,
					hp_regen: String(parts[2]).trim()*1,
					en_regen: String(parts[3]).trim()*1
				};
			}	
			return result;
		}
		
		Game_Map.prototype.requestDynamicEvent = function() {
			var event;
			var ctr = this._startOfDynamicEvents;
			while(ctr < this._events.length && !event){
				if(this._events[ctr].isUnused){
					event = this._events[ctr];
				}
				ctr++;
			}
			if(event){
				event.isUnused = false;
			}		
			return event;
		};	
		
		Game_Map.prototype.setEventImages = function() {
			this.events().forEach(function(event) {
				event.refreshImage();
			});
		};

		//最大のイベントＩＤを返す
		Game_Map.prototype.isMaxEventId = function() {
			var maxId = 0;
			this.events().forEach(function(event) {
				if (event.eventId() > maxId) {
					maxId = event.eventId();
				}
			});
			return maxId;
		};

		//イベントの実行順序を変更する（実行待ちのイベントを優先する）
		var _SRPG_Game_Map_setupStartingMapEvent = Game_Map.prototype.setupStartingMapEvent;
		Game_Map.prototype.setupStartingMapEvent = function() {
			if ($gameTemp.isSrpgEventList()) {
				var event = $gameTemp.shiftSrpgEventList();
				if (event.isStarting()) {
					event.clearStartingFlag();
					this._interpreter.setup(event.list(), event.eventId());
					return true;
				}
			}
			return _SRPG_Game_Map_setupStartingMapEvent.call(this);
		};
		
		Game_Map.prototype.SRPGTerrainTag = function(x, y) {
			if (this.isValid(x, y)) {
				var flags = this.tilesetFlags();
				var tiles = this.layeredTiles(x, y);
				for (var i = 0; i < tiles.length; i++) {
					var tag = flags[tiles[i]] >> 12;
					if (tiles[i] != 0) {
						return tag;
					}
				}
			}
			return 0;
		};
		
		Game_Map.prototype.hasStarTile = function(x, y) {
			var flags = this.tilesetFlags();
			var tile = this.allTiles(x, y)[0];
			if(tile != 0){
				var flag = flags[tile];
				if ((flag & 0x10) !== 0){
					return true;
				} 
			}
			return false;
		};
			
	//====================================================================
	// ●Spriteset_Map
	//====================================================================

		function UpperTilemap(){
			this.initialize.apply(this, arguments);
		}
		
		UpperTilemap.prototype = Object.create(Tilemap.prototype);
		UpperTilemap.prototype.constructor = UpperTilemap;
		
		UpperTilemap.prototype._paintTiles = function(startX, startY, x, y) {
			var tableEdgeVirtualId = 10000;
			var mx = startX + x;
			var my = startY + y;
			var dx = (mx * this._tileWidth).mod(this._layerWidth);
			var dy = (my * this._tileHeight).mod(this._layerHeight);
			var lx = dx / this._tileWidth;
			var ly = dy / this._tileHeight;
			var tileId0 = this._readMapData(mx, my, 0);
			var tileId1 = this._readMapData(mx, my, 1);
			var tileId2 = this._readMapData(mx, my, 2);
			var tileId3 = this._readMapData(mx, my, 3);
			var shadowBits = this._readMapData(mx, my, 4);
			var upperTileId1 = this._readMapData(mx, my - 1, 1);
			var lowerTiles = [];
			var upperTiles = [];

			if (this._isHigherTile(tileId0)) {
				upperTiles.push(tileId0);
			}
			if (this._isHigherTile(tileId1)) {
				upperTiles.push(tileId1);
			} 

			if (this._isOverpassPosition(mx, my)) {
				upperTiles.push(tileId2);
				upperTiles.push(tileId3);
			} else {
				if (this._isHigherTile(tileId2)) {
					upperTiles.push(tileId2);
				} 
				if (this._isHigherTile(tileId3)) {
					upperTiles.push(tileId3);
				} 
			}
			var lastUpperTiles = this._readLastTiles(1, lx, ly);
			if (!upperTiles.equals(lastUpperTiles)) {
				this._upperBitmap.clearRect(dx, dy, this._tileWidth, this._tileHeight);
				for (var j = 0; j < upperTiles.length; j++) {
					this._drawTile(this._upperBitmap, upperTiles[j], dx, dy);
				}
				this._writeLastTiles(1, lx, ly, upperTiles);
			}
		};

		function UpperShaderTileMap(){
			Tilemap.apply(this, arguments);
			this.roundPixels = true;
		}
		
		UpperShaderTileMap.prototype = Object.create(ShaderTilemap.prototype);
		UpperShaderTileMap.prototype.constructor = UpperShaderTileMap;
		
		UpperShaderTileMap.prototype._paintTiles = function(startX, startY, x, y) {
			var mx = startX + x;
			var my = startY + y;
			var dx = x * this._tileWidth, dy = y * this._tileHeight;
			var tileId0 = this._readMapData(mx, my, 0);
			var tileId1 = this._readMapData(mx, my, 1);
			var tileId2 = this._readMapData(mx, my, 2);
			var tileId3 = this._readMapData(mx, my, 3);
			var shadowBits = this._readMapData(mx, my, 4);
			var upperTileId1 = this._readMapData(mx, my - 1, 1);
			var lowerLayer = this.lowerLayer.children[0];
			var upperLayer = this.upperLayer.children[0];

			if (this._isHigherTile(tileId0)) {
				this._drawTile(upperLayer, tileId0, dx, dy);
			} 
			if (this._isHigherTile(tileId1)) {
				this._drawTile(upperLayer, tileId1, dx, dy);
			} 

			
			if (this._isOverpassPosition(mx, my)) {
				this._drawTile(upperLayer, tileId2, dx, dy);
				this._drawTile(upperLayer, tileId3, dx, dy);
			} else {
				if (this._isHigherTile(tileId2)) {
					this._drawTile(upperLayer, tileId2, dx, dy);
				} 
				if (this._isHigherTile(tileId3)) {
					this._drawTile(upperLayer, tileId3, dx, dy);
				} 
			}
		};
		
		Spriteset_Map.prototype.createUpperLayer = function() {
			
			/*if($gameTemp.intermissionPending){
				return;
			}*/
			
			if (Graphics.isWebGL()) {
				this._upperTilemap = new UpperShaderTileMap();
			} else {
				this._upperTilemap = new UpperTilemap();
			}
			this._upperTilemap.tileWidth = $gameMap.tileWidth();
			this._upperTilemap.tileHeight = $gameMap.tileHeight();
			this._upperTilemap.setData($gameMap.width(), $gameMap.height(), $gameMap.data());
			this._upperTilemap.horizontalWrap = $gameMap.isLoopHorizontal();
			this._upperTilemap.verticalWrap = $gameMap.isLoopVertical();
		
			this._tileset = $gameMap.tileset();
			if (this._tileset) {
				var tilesetNames = this._tileset.tilesetNames;
				for (var i = 0; i < tilesetNames.length; i++) {
					this._upperTilemap.bitmaps[i] = ImageManager.loadTileset(tilesetNames[i]);
				}
				var newTilesetFlags = $gameMap.tilesetFlags();			
				this._upperTilemap.refreshTileset();
				if (!this._tilemap.flags.equals(newTilesetFlags)) {				
					this._upperTilemap.refresh();
				}
				this._upperTilemap.flags = newTilesetFlags;
			}
		
			this._baseSprite.addChild(this._upperTilemap);
			
			for (var i = 0; i < this.shipUpperTops.length; i++) {
				this.addCharacterToBaseSprite(this.shipUpperTops[i]);
			}
			for (var i = 0; i < this.actorUpperTops.length; i++) {
				this.addCharacterToBaseSprite(this.actorUpperTops[i]);
			}
			
			this._srpgMoveTile = [];
			for (var i = 0; i < $gameSystem.spriteMoveTileMax(); i++) {
				this._srpgMoveTile[i] = new Sprite_SrpgMoveTile();
				this._baseSprite.addChild(this._srpgMoveTile[i]);
			}
			
			this._highlightSprite = new Sprite_AreaHighlights();
			this._baseSprite.addChild(this._highlightSprite); 
			
			for (var i = 0; i < this.shipBottomOverlays.length; i++) {
				this.addCharacterToBaseSprite(this.shipBottomOverlays[i]);
			}
			
			for (var i = 0; i < this.shipTopOverlays.length; i++) {
				this.addCharacterToBaseSprite(this.shipTopOverlays[i]);
			}
			
			for (var i = 0; i < this.actorBottomOverlays.length; i++) {
				this.addCharacterToBaseSprite(this.actorBottomOverlays[i]);
			}
			
			for (var i = 0; i < this.actorTopOverlays.length; i++) {
				this.addCharacterToBaseSprite(this.actorTopOverlays[i]);
			}	
			
			for (var i = 0; i < this.shipTurnEndSprites.length; i++) {
				this.addCharacterToBaseSprite(this.shipTurnEndSprites[i]);
			}
			
			for (var i = 0; i < this.actorTurnEndSprites.length; i++) {
				this.addCharacterToBaseSprite(this.actorTurnEndSprites[i]);
			}
			
			$gameMap.events().forEach(function(event) {
				this.createDefendIndicator(event._eventId, event);
				this.createAttackIndicator(event._eventId, event);
				this.createWillIndicator(event._eventId, event);
				this.createTwinIndicator(event._eventId, event);
				this.createExplosionSprite(event._eventId, event);
				this.createAppearSprite(event._eventId, event);
				this.createDisappearSprite(event._eventId, event);	
			}, this);
			
			
			
			this._reticuleSprite = new Sprite_Reticule();
			this.addCharacterToBaseSprite(this._reticuleSprite);
			
			var sprite = new Sprite_Player($gamePlayer);
			$gameTemp.upperPlayerSprite = sprite;
			this.addCharacterToBaseSprite(sprite);   
						
			
			this.createPictures();
			this.createTimer();
			this.createScreenSprites();
			
			$gameTemp.updatePlayerSpriteVisibility();
		};
		
		Spriteset_Map.prototype.updateTilemap = function() {
			this._tilemap.origin.x = $gameMap.displayX() * $gameMap.tileWidth();
			this._tilemap.origin.y = $gameMap.displayY() * $gameMap.tileHeight();
			
			this._upperTilemap.origin.x = $gameMap.displayX() * $gameMap.tileWidth();
			this._upperTilemap.origin.y = $gameMap.displayY() * $gameMap.tileHeight();
		};

		var _SRPG_Spriteset_Map_createTilemap = Spriteset_Map.prototype.createTilemap;
		Spriteset_Map.prototype.createTilemap = function() {		
			_SRPG_Spriteset_Map_createTilemap.call(this);
			if($gameTemp.intermissionPending){
				return;
			}
			this._gridSprite = new Sprite_SrpgGrid();
			this._baseSprite.addChild(this._gridSprite);   
			
					
				
		};
		
		Spriteset_Map.prototype.addCharacterToBaseSprite = function(sprite) {
			var child = this._baseSprite.addChild(sprite);
			this._characterLayerSprites.push(child);
		}
		
		Spriteset_Map.prototype.reloadCharacters = function() {
			var _this = this;
			this._characterLayerSprites.forEach(function(child){
				_this._baseSprite.removeChild(child);
			});
			this.createCharacters();
		}
		
		var _SRPG_Spriteset_Map_createTilemap_createCharacters = Spriteset_Map.prototype.createCharacters;
		Spriteset_Map.prototype.createCharacters = function() {
			var _this  = this;
			this._characterLayerSprites = [];
			/*if($gameTemp.intermissionPending){
				return;
			}*/
				
			this._bshadowSprites = {};
			this._explosionSprites = {};
			this._appearSprites = {};
			this._disappearSprites = {};
			this._willIndicators = {};
			this._defendIndicators = {};
			this._attackIndicators = {};
			this._twinIndicators = {};
			$gameMap.events().forEach(function(event) {
				this.createBShadow(event._eventId,event);			
			}, this);
			//_SRPG_Spriteset_Map_createTilemap_createCharacters.call(this);
			this._characterSprites = [];
			var ships = [];
			var shipBottoms = [];
			var shipTops = [];
			var actors = [];
			var actorBottoms = [];
			var actorTops = [];
			
			this.shipTurnEndSprites = [];
			this.actorTurnEndSprites = [];
			this.shipUpperTops = [];
			this.actorUpperTops = [];
			this.actorTopOverlays = [];
			this.actorBottomOverlays = [];
			this.shipTopOverlays = [];
			this.shipBottomOverlays = [];
			
			$gameMap.events().forEach(function(event) {
				if(event.isType() == "ship" || event.isType() == "ship_event"){
					ships.push(new Sprite_Character(event));
					shipBottoms.push(new Sprite());
					_this.shipBottomOverlays.push(new Sprite());
					_this.shipTurnEndSprites.push(new Sprite());
				} else {
					actors.push(new Sprite_Character(event));
					actorBottoms.push(new Sprite());
					_this.actorBottomOverlays.push(new Sprite());
					_this.actorTurnEndSprites.push(new Sprite());
				}			
			}, this);
			
			
			$gameMap.events().forEach(function(event) {
				if(event.isType() == "ship" || event.isType() == "ship_event"){				
					shipTops.push(new Sprite());
					_this.shipTopOverlays.push(new Sprite());
					_this.shipUpperTops.push(new Sprite());
				} else {			
					actorTops.push(new Sprite());
					_this.actorTopOverlays.push(new Sprite());
					_this.actorUpperTops.push(new Sprite());
				}			
			}, this);
			
			for(var i = 0; i < actors.length; i++){
				actors[i].setLowerBody(actorBottoms[i]);
				actors[i].setUpperBody(actorTops[i]);
				actors[i].setUpperBodyTop(this.actorUpperTops[i]);
				actors[i].setTurnEnd(this.actorTurnEndSprites[i]);
				actors[i].setLowerBodyOverlay(this.actorBottomOverlays[i]);
				actors[i].setUpperBodyOverlay(this.actorTopOverlays[i]);
			}
			
			for(var i = 0; i < ships.length; i++){
				ships[i].setLowerBody(shipBottoms[i]);
				ships[i].setUpperBody(shipTops[i]);
				ships[i].setUpperBodyTop(this.shipUpperTops[i]);
				ships[i].setTurnEnd(this.shipTurnEndSprites[i]);
				ships[i].setLowerBodyOverlay(this.shipBottomOverlays[i]);
				ships[i].setUpperBodyOverlay(this.shipTopOverlays[i]);
			}
			
			this._characterSprites = shipBottoms.concat(actorBottoms).concat(shipTops).concat(actorTops).concat(ships).concat(actors);
			
			//.concat(shipTurnEndSprites) .concat(actorTurnEndSprites)
			$gameMap.vehicles().forEach(function(vehicle) {
				this._characterSprites.push(new Sprite_Character(vehicle));
			}, this);
			$gamePlayer.followers().reverseEach(function(follower) {
				this._characterSprites.push(new Sprite_Character(follower));
			}, this);
			var sprite = new Sprite_Player($gamePlayer);
			$gameTemp.lowerPlayerSprite = sprite;
			this.addCharacterToBaseSprite(sprite);  		 
			
			for (var i = 0; i < this._characterSprites.length; i++) {
				this.addCharacterToBaseSprite(this._characterSprites[i]);
			}		   	
		};
		
		Spriteset_Map.prototype.createExplosionSprite = function(id,character) {
			if (!character) return;
			if (!this._explosionSprites[id]) {
				this._explosionSprites[id] = new Sprite_Destroyed(character);
				this.addCharacterToBaseSprite(this._explosionSprites[id]);
				character._explosionSprite = true;
			};
		};
		
		Spriteset_Map.prototype.createAppearSprite = function(id,character) {
			if (!character) return;
			if (!this._appearSprites[id]) {
				this._appearSprites[id] = new Sprite_Appear(character);
				this.addCharacterToBaseSprite(this._appearSprites[id]);
				character._appearSprite = true;
			};
		};
		
		Spriteset_Map.prototype.createDisappearSprite = function(id,character) {
			if (!character) return;
			if (!this._disappearSprites[id]) {
				this._disappearSprites[id] = new Sprite_Disappear(character);
				this.addCharacterToBaseSprite(this._disappearSprites[id]);
				character._disappearSprite = true;
			};
		};
		
		Spriteset_Map.prototype.createBShadow = function(id,character) {
			if (!character) return;
			if (!this._bshadowSprites[id]) {
				this._bshadowSprites[id] = new Sprite_BasicShadow(character);
				this.addCharacterToBaseSprite(this._bshadowSprites[id]);
				character._shadSprite = true;
			};
		};
		
		Spriteset_Map.prototype.createWillIndicator = function(id,character) {
			if (!character) return;
			if (!this._willIndicators[id]) {
				this._willIndicators[id] = new Sprite_WillIndicator(character);
				this.addCharacterToBaseSprite(this._willIndicators[id]);
				character._willIndicator = true;
			};
		};	
		
		Spriteset_Map.prototype.createDefendIndicator = function(id,character) {
			if (!character) return;
			if (!this._defendIndicators[id]) {
				this._defendIndicators[id] = new Sprite_DefendIndicator(character);
				this.addCharacterToBaseSprite(this._defendIndicators[id]);
				character._defendIndicator = true;
			};
		};	
		
		Spriteset_Map.prototype.createAttackIndicator = function(id,character) {
			if (!character) return;
			if (!this._attackIndicators[id]) {
				this._attackIndicators[id] = new Sprite_AttackIndicator(character);
				this.addCharacterToBaseSprite(this._attackIndicators[id]);
				character._defendIndicator = true;
			};
		};
		
		Spriteset_Map.prototype.createTwinIndicator = function(id,character) {
			if (!character) return;
			if (!this._twinIndicators[id]) {
				this._twinIndicators[id] = new Sprite_TwinIndicator(character);
				this.addCharacterToBaseSprite(this._twinIndicators[id]);
				character._twinIndicator = true;
			};
		};	

		var _SRPG_Spriteset_Map_update = Spriteset_Map.prototype.update;
		Spriteset_Map.prototype.update = function() {
			_SRPG_Spriteset_Map_update.call(this);
			this.updateSrpgMoveTile();
			if($gameTemp.tempSprites){
				while($gameTemp.tempSprites.length){
					var sprite = $gameTemp.tempSprites.pop();
					this._baseSprite.addChild(sprite);
				}
			}
		};

		Spriteset_Map.prototype.updateSrpgMoveTile = function() {
			if(this._srpgMoveTile){		
				if ($gameTemp.resetMoveList() == true) {
					for (var i = 0; i < $gameSystem.spriteMoveTileMax(); i++) {
						this._srpgMoveTile[i].clearThisMoveTile();
					}
					$gameTemp.setResetMoveList(false);
				}
				if ($gameTemp.isMoveListValid()) {
					if (!this._srpgMoveTile[0].isThisMoveTileValid()) {
						var list = $gameTemp.moveList();
						for (var i = 0; i < list.length; i++) {
							var pos = list[i];
							this._srpgMoveTile[i].setThisMoveTile(pos[0], pos[1], pos[2]);
						}
					}
				} else {
					if (this._srpgMoveTile[0].isThisMoveTileValid()) {
						for (var i = 0; i < $gameSystem.spriteMoveTileMax(); i++) {
							this._srpgMoveTile[i].clearThisMoveTile();
						}
					}
				}
			}
		};
	}