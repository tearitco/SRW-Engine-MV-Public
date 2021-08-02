	export default {
		patches: patches,
		Sprite_Player: Sprite_Player,
		Sprite_SrpgMoveTile:Sprite_SrpgMoveTile,
		Sprite_MapEffect:Sprite_MapEffect,
		Sprite_MapAttack:Sprite_MapAttack,
		Sprite_WillIndicator:Sprite_WillIndicator,
		Sprite_BasicShadow:Sprite_BasicShadow,
		Sprite_DefendIndicator:Sprite_DefendIndicator,
		Sprite_AttackIndicator:Sprite_AttackIndicator,
		Sprite_TwinIndicator:Sprite_TwinIndicator,
		Sprite_Destroyed:Sprite_Destroyed,
		Sprite_Appear:Sprite_Appear,
		Sprite_Disappear:Sprite_Disappear,
		Sprite_Reticule:Sprite_Reticule,
		Sprite_SrpgGrid:Sprite_SrpgGrid,
		Sprite_AreaHighlights:Sprite_AreaHighlights,
	} 
	
	function patches(){};
	
	patches.apply = function(){
		Sprite_Character.prototype.setupAnimation = function() {
			if (this._character.animationId() > 0) {
				var animation = $dataAnimations[this._character.animationId()];
				var animOptions = this._character._animationOptions;
				if(animOptions){
					Object.keys(animOptions).forEach(function(key){
						animation[key] = animOptions[key];
					});
				}
				this.startAnimation(animation, false, 0);
				this._character.startAnimation();
			}
		};

		Sprite_Animation.prototype.update = function() {
			Sprite.prototype.update.call(this);
			this.updateMain();
			this.updateFlash();
			this.updateScreenFlash();
			this.updateHiding();
			Sprite_Animation._checker1 = {};
			Sprite_Animation._checker2 = {};		
			
			this.scale.x = 1;
			this.scale.y = 1;	
			this.rotation = 0;
			if(this._animation.direction){			
				
				if(this._animation.direction == "down"){
					this.scale.y = -1;	
				}
				if(this._animation.direction == "left" || this._animation.direction == "right"){				
					this.scale.x = -1;		
					this.rotation = 90 * Math.PI / 180;				
				}
				
				if(this._animation.direction == "left"){
					this.scale.y = -1;	
				}			
				
				if(this._animation.offset){
					var offset = this._animation.offset[this._animation.direction];	
					if(offset){
						this.x+=offset.x;
						this.y+=offset.y;
					}	
				}			
			}
			
			if(this._animation.scale){
				this.scale.y*=this._animation.scale;
				this.scale.x*=this._animation.scale;
			}
			
		};
			
		Sprite_Animation.prototype.updatePosition = function() {
			if (this._animation.position === 3) {
				this.x = this.parent.width / 2;
				this.y = this.parent.height / 2;
			} else {
				var parent = this._target.parent;
				var grandparent = parent ? parent.parent : null;
				this.x = this._target.x;
				this.y = this._target.y;
				if (this.parent === grandparent) {
					this.x += parent.x;
					this.y += parent.y;
				}
				if (this._animation.position === 0) {
					this.y -= this._target.height;
				} else if (this._animation.position === 1) {
					this.y -= this._target.height / 2 - 0;
				}
			}
		};
		
		var _SRPG_Sprite_Actor_setActorHome = Sprite_Actor.prototype.setActorHome;
		Sprite_Actor.prototype.setActorHome = function(index) {
			if ($gameSystem.isSRPGMode() == true) {
				this.setHome(Graphics.width - 216 - index * 240, Graphics.height / 2 + 48);
			} else {
				_SRPG_Sprite_Actor_setActorHome.call(this, index);
			}
		};
		
		//Character sprites are split into two a bottom and top part to improve overlap for units whose map icon goes outside their current tiles.
		//This can happen for flying units for example.
		//The base sprite is normally hidden, but is still available.
		
		Sprite_Character.prototype.allBodyPartsAvailable = function(character) {
			return this._upperBody && this._lowerBody && this._upperBodyTop && this._upperBodyOverlay && this._lowerBodyOverlay;
		}
		
		Sprite_Character.prototype.update = function(character) {
			Sprite_Base.prototype.update.call(this);
			if(!this.visible) {
				return;
			}
			this.updateBitmap();
			this.updateFrame();
			this.updatePosition();
			this.updateAnimation();
			this.updateBalloon();
			this.updateOther();
			if (this._character.isEvent() == true) {
				var battlerArray = $gameSystem.EventToUnit(this._character.eventId());
				if (battlerArray) {
					if ($gameSystem.isEnemy(battlerArray[1]) && !ENGINE_SETTINGS.KEEP_ENEMY_SPRITE_ORIENTATION) {
						this.scale.x = -1;			
						if(this.allBodyPartsAvailable()){	
							this._upperBody.scale.x = -1;
							this._upperBodyOverlay.scale.x = -1;
							this._upperBodyTop.scale.x = -1;
							this._lowerBody.scale.x = -1;
							this._lowerBodyOverlay.scale.x = -1;
						}	
					} else {
						this.scale.x = 1;				
						if(this.allBodyPartsAvailable()){	
							this._upperBody.scale.x = 1;
							this._upperBodyOverlay.scale.x = 1;
							this._upperBodyTop.scale.x = 1;
							this._lowerBody.scale.x = 1;
							this._lowerBodyOverlay.scale.x = 1;
						}
					}
					if(this.allBodyPartsAvailable()){	
						if(battlerArray[0] === 'actor' && $gameTemp.doingManualDeploy){
							this._frameCount+=2;
							this._frameCount %= 200;
							if(this._frameCount < 100){
								this._upperBody.opacity = this._frameCount + 80;
								this._upperBodyTop.opacity = this._frameCount + 80;
								this._lowerBody.opacity = this._frameCount + 80;
							} else {
								this._upperBody.opacity = 200 + 80 - this._frameCount;
								this._upperBodyTop.opacity = 200 + 80 - this._frameCount;
								this._lowerBody.opacity = 200 + 80 - this._frameCount;
							}
						} else {
							this._upperBody.opacity = 255;
							this._upperBodyTop.opacity = 255;
							this._lowerBody.opacity = 255;
						}
						
						this._upperBodyOverlay.opacity = 0;
						this._lowerBodyOverlay.opacity = 0;
						
						var refX;
						var refY;
						if(this._character._x != this._character._realX || this._character._y != this._character._realY){
							if($gameMap.hasStarTile(this._character._x,  this._character._y) || $gameMap.hasStarTile(this._character._prevX,  this._character._prevY)){
								this._upperBodyTop.opacity = 0;
								
								if($gameSystem.foregroundSpriteToggleState == 0){
									this._upperBodyOverlay.opacity = 0;
									this._lowerBodyOverlay.opacity = 0;
								} else if($gameSystem.foregroundSpriteToggleState == 1){
									this._upperBodyOverlay.opacity = 128;
									this._lowerBodyOverlay.opacity = 128;
								} else if($gameSystem.foregroundSpriteToggleState == 2){
									this._upperBodyOverlay.opacity = 255;
									this._lowerBodyOverlay.opacity = 255;
								}
								//this._upperBodyOverlay.opacity = 128;
								//this._lowerBodyOverlay.opacity = 128;
							} else {
								this._upperBodyTop.opacity = 255;
								this._upperBody.opacity = 0;
							}
						} else {
							if($gameMap.hasStarTile(this._character._x,  this._character._y)){
								this._upperBodyTop.opacity = 0;
								if($gameSystem.foregroundSpriteToggleState == 0){
									this._upperBodyOverlay.opacity = 0;
									this._lowerBodyOverlay.opacity = 0;
								} else if($gameSystem.foregroundSpriteToggleState == 1){
									this._upperBodyOverlay.opacity = 128;
									this._lowerBodyOverlay.opacity = 128;
								} else if($gameSystem.foregroundSpriteToggleState == 2){
									this._upperBodyOverlay.opacity = 255;
									this._lowerBodyOverlay.opacity = 255;
								}
								//this._upperBodyOverlay.opacity = 128;
								//this._lowerBodyOverlay.opacity = 128;
							} else {
								this._upperBodyTop.opacity = 255;
								this._upperBody.opacity = 0;
							}
						}	
						if($gameTemp.activeEvent() == this._character || 
							$gameTemp._TargetEvent == this._character ||
							$gameSystem.isSubBattlePhase() == "actor_move" || 
							$gameSystem.isSubBattlePhase()== "enemy_move" || 
							$gameSystem.isSubBattlePhase()== "actor_target" || 
							$gameSystem.isSubBattlePhase() == "enemy_targeting_display" ||
							$gameSystem.isSubBattlePhase() == "post_move_command_window" ||
							$gameSystem.isSubBattlePhase() == "rearrange_deploys" ||
							$gameSystem.isSubBattlePhase() == "hover_deploy_btn"							
						){
							this._upperBodyOverlay.opacity = 255;
							this._lowerBodyOverlay.opacity = 255;
						}
						if(battlerArray && battlerArray[1] && $statCalc.getCurrentTerrain(battlerArray[1]) == "water"){
							this._upperBody.opacity-=120;
							this._upperBodyOverlay.opacity-=120;
							this._upperBodyTop.opacity-=120;
							this._lowerBody.opacity-=120;
							this._lowerBodyOverlay.opacity-=120;
						}					
					}
				}			
			}		
		}
		
		Sprite_Character.prototype.isTurnEndUnit = function() {
			if (this._character.isEvent() == true) {
				var battlerArray = $gameSystem.EventToUnit(this._character.eventId());
				if (battlerArray) {
					if (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy') {
						return battlerArray[1].srpgTurnEnd();
					}
				} else {
					return false;
				}
			} else {
				return false;
			}
		};

		//キャラクタービットマップの更新
		var _SRPG_Sprite_Character_setCharacterBitmap = Sprite_Character.prototype.setCharacterBitmap;
		Sprite_Character.prototype.setCharacterBitmap = function() {
			_SRPG_Sprite_Character_setCharacterBitmap.call(this);
			this._turnEndBitmap = ImageManager.loadCharacter('srpg_set');
			this._frameCount = 0;
		};
		
		Sprite_Character.prototype.setUpperBodyTop = function(sprite) {
			this._upperBodyTop = sprite;
			this._upperBodyTop.anchor.x = 0.5;
			this._upperBodyTop.anchor.y = 2;
		}
		
		Sprite_Character.prototype.setUpperBody = function(sprite) {
			this._upperBody = sprite;
			this._upperBody.anchor.x = 0.5;
			this._upperBody.anchor.y = 2;
		}

		Sprite_Character.prototype.setLowerBody = function(sprite) {
			this._lowerBody = sprite;
			this._lowerBody.anchor.x = 0.5;
			this._lowerBody.anchor.y = 2;
		}
		
		Sprite_Character.prototype.setUpperBodyOverlay = function(sprite) {
			this._upperBodyOverlay = sprite;
			this._upperBodyOverlay.anchor.x = 0.5;
			this._upperBodyOverlay.anchor.y = 2;
		}

		Sprite_Character.prototype.setLowerBodyOverlay = function(sprite) {
			this._lowerBodyOverlay = sprite;
			this._lowerBodyOverlay.anchor.x = 0.5;
			this._lowerBodyOverlay.anchor.y = 2;
		}
		
		Sprite_Character.prototype.setTurnEnd = function(sprite) {
			this._turnEndSprite = sprite;
			this._turnEndSprite.anchor.x = 0;
			this._turnEndSprite.anchor.y = 1;
		}

		
		Sprite_Character.prototype.updateHalfBodySprites = function() {   
			if(this.allBodyPartsAvailable()){		
				this._upperBody.bitmap = this.bitmap;
				this._upperBody.visible = true;
				this._upperBodyTop.bitmap = this.bitmap;
				this._upperBodyTop.visible = true;
				this._lowerBody.bitmap = this.bitmap;
				this._lowerBody.visible = true;	
				this._upperBodyOverlay.bitmap = this.bitmap;
				this._upperBodyOverlay.visible = true;
				this._lowerBodyOverlay.bitmap = this.bitmap;
				this._lowerBodyOverlay.visible = true;	
			}
		};
		
		Sprite_Character.prototype.updatePosition = function() {
			this.x = this._character.screenX();
			this.y = this._character.screenY();
			this.z = this._character.screenZ();
			
			if(this.allBodyPartsAvailable()){
				this._upperBody.x = this.x;
				this._upperBody.y = this.y;
				this._upperBody.z = this.z + 1;
				
				this._upperBodyOverlay.x = this.x;
				this._upperBodyOverlay.y = this.y;
				this._upperBodyOverlay.z = this.z + 1;
				
				this._upperBodyTop.x = this.x;
				this._upperBodyTop.y = this.y;
				this._upperBodyTop.z = this.z + 1;
				
				this._lowerBody.x = this.x;
				this._lowerBody.y = this.y + 24;
				this._lowerBody.z = this.z;
				
				this._lowerBodyOverlay.x = this.x;
				this._lowerBodyOverlay.y = this.y + 24;
				this._lowerBodyOverlay.z = this.z;
				
				this._turnEndSprite.x = this.x - 20;
				this._turnEndSprite.y = this.y - this._character._floatOffset;
				this._turnEndSprite.z = this.z + 2;
			}
		};
		
		//キャラクターフレームの更新
		var _SRPG_Sprite_Character_updateCharacterFrame = Sprite_Character.prototype.updateCharacterFrame;
		Sprite_Character.prototype.updateCharacterFrame = function() {
			var pw = this.patternWidth();
			var ph = this.patternHeight();
			var sx = (this.characterBlockX() + this.characterPatternX()) * pw;
			var sy = (this.characterBlockY() + this.characterPatternY()) * ph;
			
			if(this.allBodyPartsAvailable() && this._character.isEvent() == true){	
				var battlerArray = $gameSystem.EventToUnit(this._character.eventId());
				
				this.updateHalfBodySprites();
			
				var d = 24;
				this._upperBody.setFrame(sx, sy, pw, ph - d);
				this._upperBodyTop.setFrame(sx, sy, pw, ph - d);
				this._upperBodyOverlay.setFrame(sx, sy, pw, ph - d);
				this._lowerBody.setFrame(sx, sy + ph - d, pw, d);	
				this._lowerBodyOverlay.setFrame(sx, sy + ph - d, pw, d);	

				if($gameSystem.isSubBattlePhase() !== 'actor_map_target_confirm' || $gameTemp.isMapTarget(this._character.eventId())){				
					if(battlerArray && battlerArray[1] && $statCalc.getCurrentTerrain(battlerArray[1]) == "water"){
						this._upperBody.setBlendColor([21, 87, 255, 64]);	
						this._upperBodyOverlay.setBlendColor([21, 87, 255, 64]);	
						this._upperBodyTop.setBlendColor([21, 87, 255, 64]);	
						this._lowerBody.setBlendColor([21, 87, 255, 64]);
						this._lowerBodyOverlay.setBlendColor([21, 87, 255, 64]);
						
						
					} else {
						this._upperBody.setBlendColor([0, 0, 0, 0]);	
						this._upperBodyOverlay.setBlendColor([0, 0, 0, 0]);	
						this._upperBodyTop.setBlendColor([0, 0, 0, 0]);
						this._lowerBody.setBlendColor([0, 0, 0, 0]);
						this._lowerBodyOverlay.setBlendColor([0, 0, 0, 0]);
					}				
				} else {
					this._upperBody.setBlendColor([0, 0, 0, 128]);	
					this._upperBodyOverlay.setBlendColor([0, 0, 0, 128]);	
					this._upperBodyTop.setBlendColor([0, 0, 0, 128]);	
					this._lowerBody.setBlendColor([0, 0, 0, 128]);
					this._lowerBodyOverlay.setBlendColor([0, 0, 0, 128]);
				}			
				
				
				
				this.visible = false;
				
				//hack to ensure there's no weird overlap issues when deploying an actor from a ship
				if($gameTemp.activeShip && $gameTemp.activeShip.event.eventId() != this._character.eventId()){
					if(this._character.posX() == $gameTemp.activeShip.position.x && this._character.posY() == $gameTemp.activeShip.position.y){
						this.visible = true;
						this.setFrame(sx, sy, pw, ph);
					}				
				}		
				this.setFrame(sx, sy, pw, ph);
				//this.visible = false;
				if ($gameSystem.isSRPGMode() == true && this._character.isEvent() == true) {
					var battlerArray = $gameSystem.EventToUnit(this._character.eventId());
					if (battlerArray) {				
						var pw = this._turnEndBitmap.width / 12;
						var ph = this._turnEndBitmap.height / 8;
						if ((battlerArray[0] === 'actor' || battlerArray[0] === 'enemy') &&
							battlerArray[1].isAlive() && !this._character.isErased()) {
							if (battlerArray[1].isRestricted()) {
								var sx = (6 + this.characterPatternX()) * pw;
								var sy = (0 + this.characterPatternY()) * ph;
								this.createTurnEndSprites();
								this._turnEndSprite.bitmap = this._turnEndBitmap;
								this._turnEndSprite.visible = true;
								this._turnEndSprite.setFrame(sx, sy, pw, ph);
							} else if (this.isTurnEndUnit() == true) {
								var sx = (3 + this.characterPatternX()) * pw;
								var sy = (0 + this.characterPatternY()) * ph;
								this.createTurnEndSprites();
								this._turnEndSprite.bitmap = this._turnEndBitmap;
								this._turnEndSprite.visible = true;
								this._turnEndSprite.setFrame(sx, sy, pw, ph);
							} else if (battlerArray[1].isAutoBattle()) {
								var sx = (9 + this.characterPatternX()) * pw;
								var sy = (0 + this.characterPatternY()) * ph;
								this.createTurnEndSprites();
								this._turnEndSprite.bitmap = this._turnEndBitmap;
								this._turnEndSprite.visible = true;
								this._turnEndSprite.setFrame(sx, sy, pw, ph);
							} else if (this._turnEndSprite) {
								this._turnEndSprite.visible = false;
							}
						} else if (this._turnEndSprite) {
							this._turnEndSprite.visible = false;
						}
					}
				}
			} else {
				this.setFrame(sx, sy, pw, ph);
			}
		};
		

		//ターン終了の表示を作る
		Sprite_Character.prototype.createTurnEndSprites = function() {
			if (!this._turnEndSprite) {
				this._turnEndSprite = new Sprite();
				this._turnEndSprite.anchor.x = 0.5;
				this._turnEndSprite.anchor.y = 1;
							
				this.addChild(this._turnEndSprite);
			}
		};	
	}	
	
	function Sprite_Player() {
        this.initialize.apply(this, arguments);
    }

    Sprite_Player.prototype = Object.create(Sprite_Character.prototype);
    Sprite_Player.prototype.constructor = Sprite_Player;
	
	Sprite_Player.prototype.updatePosition = function() {
		this.x = this._character.screenX();
		this.y = this._character.screenY();
		this.z = this._character.screenZ();
		
		if($gamePlayer.followedEvent && $gameTemp.followMove){			
			this.y = this.y + ($gamePlayer.followedEvent._floatOffset);		
		} else {
			var prevUnit = $statCalc.activeUnitAtPosition({x: this._character._prevX, y: this._character._prevY});
			var prevHoverState = prevUnit && $statCalc.isFlying(prevUnit);
			var newUnit = $statCalc.activeUnitAtPosition({x: this._character._x, y: this._character._y});
			var newHoverState = newUnit && $statCalc.isFlying(newUnit);
			if(prevHoverState == newHoverState){
				if(prevHoverState){
					this.y = this.y + (newUnit.event._floatOffset);
				}			
			} else if(prevHoverState || newHoverState){
				var floatOffset = 0;
				if(prevHoverState && prevUnit){
					floatOffset = prevUnit.event._floatOffset;
				}
				if(newHoverState && newUnit){
					floatOffset = newUnit.event._floatOffset;
				}
				var delta = 0;
				if(this._character._x != this._character._realX || this._character._y != this._character._realY){				
					if(this._character._x != this._character._realX){
						delta = Math.abs(this._character._x - this._character._realX);
					} else if(this._character._y != this._character._realY){
						delta = Math.abs(this._character._y - this._character._realY);
					}				
				}
				var ratio;
				if(newHoverState){
					ratio = 1 - delta;
				} else {
					ratio = 0 + delta;
				}
				this.y = this.y + (floatOffset * ratio);
			}
		}	
	};
	
	
	
	
	



//====================================================================
// ●Sprite_SrpgMoveTile
//====================================================================
    function Sprite_SrpgMoveTile() {
        this.initialize.apply(this, arguments);
    }

    Sprite_SrpgMoveTile.prototype = Object.create(Sprite.prototype);
    Sprite_SrpgMoveTile.prototype.constructor = Sprite_SrpgMoveTile;

    Sprite_SrpgMoveTile.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.createBitmap();
        this._frameCount = 0;
        this._posX = -1;
        this._posY = -1;
        this.visible = false;
    };

    Sprite_SrpgMoveTile.prototype.isThisMoveTileValid = function() {
        return this._posX >= 0 && this._posY >= 0;
    }

    Sprite_SrpgMoveTile.prototype.setThisMoveTile = function(x, y, attackFlag) {
        this._frameCount = 0;
        this._posX = x;
        this._posY = y;
        if (attackFlag == true) {
            this.bitmap.fillAll('red');
        } else {
            this.bitmap.fillAll('blue');
        }
    }

    Sprite_SrpgMoveTile.prototype.clearThisMoveTile = function() {
        this._frameCount = 0;
        this._posX = -1;
        this._posY = -1;
    }

    Sprite_SrpgMoveTile.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (this.isThisMoveTileValid()){
            this.updatePosition();
            this.updateAnimation();
            this.visible = true;
        } else {
            this.visible = false;
        }
    };

    Sprite_SrpgMoveTile.prototype.createBitmap = function() {
        var tileWidth = $gameMap.tileWidth();
        var tileHeight = $gameMap.tileHeight();
        this.bitmap = new Bitmap(tileWidth, tileHeight);
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.blendMode = Graphics.BLEND_ADD;
    };

    Sprite_SrpgMoveTile.prototype.updatePosition = function() {
        var tileWidth = $gameMap.tileWidth();
        var tileHeight = $gameMap.tileHeight();
        this.x = ($gameMap.adjustX(this._posX) + 0.5) * tileWidth;
        this.y = ($gameMap.adjustY(this._posY) + 0.5) * tileHeight;
    };

    Sprite_SrpgMoveTile.prototype.updateAnimation = function() {
       /* this._frameCount++;
        this._frameCount %= 40;
        this.opacity = (40 - this._frameCount) * 3;*/
    };
	
//====================================================================
// ●Sprite_MapEffect
//====================================================================	
	
	function Sprite_MapEffect() {
		this.initialize.apply(this, arguments);
	}

	Sprite_MapEffect.prototype = Object.create(Sprite_Base.prototype);
	Sprite_MapEffect.prototype.constructor = Sprite_MapEffect;

	Sprite_MapEffect.prototype.initialize = function(spriteInfo, position) {
		Sprite_Base.prototype.initialize.call(this);		
		this.bitmap =  ImageManager.loadNormalBitmap('img/SRWMapEffects/'+spriteInfo.name+".png");
		this.anchor.x = 0.5;
		this.anchor.y = 0.5;
		this._animationFrame = 0;
		this.visible = false;
		this._frameSize = spriteInfo.frameSize;
		this._sheetHeight = spriteInfo.sheetHeight;
		this._sheetWidth = spriteInfo.sheetWidth;
		this._frames = spriteInfo.frames;
		this._frameCounter = 0;
		this._animationSpeed = spriteInfo.animationSpeed || 2;
		this._position = position;
		this._positionOffset = spriteInfo.offset || {x: 0, y: 0}
		this.setFrame(0 * this._frameSize, 0 * this._frameSize, this._frameSize, this._frameSize);
	};
	
	Sprite_MapEffect.prototype.updatePosition = function() {
		this.x = this._position.x + this._positionOffset.x;
		this.y = this._position.y + this._positionOffset.y;
		this.z = 999;
	}
	
	Sprite_MapEffect.prototype.update = function() {	
		this.updatePosition();
		if(this._animationFrame > this._frames){
			this.visible = false;
			this.parent.removeChild(this);
		} else {								
			this.visible = true;
			var col = this._animationFrame % this._sheetWidth;
			var row = Math.floor(this._animationFrame / this._sheetWidth);
			this.setFrame(col * this._frameSize, row * this._frameSize, this._frameSize, this._frameSize);
			this._frameCounter++;
			if(this._frameCounter >= this._animationSpeed){
				this._animationFrame++;
				this._frameCounter = 0;
			}				
		}			
	};	
	
	function Sprite_MapAttack() {
		this.initialize.apply(this, arguments);
	}

	Sprite_MapAttack.prototype = Object.create(Sprite_MapEffect.prototype);
	Sprite_MapAttack.prototype.constructor = Sprite_MapAttack;
	
	Sprite_MapAttack.prototype.updatePosition = function() {
		this.scale.x = 1;
		this.scale.y = 1;		
		var offset = JSON.parse(JSON.stringify(this._positionOffset));
		if($gameTemp.mapTargetDirection == "left"){
			offset.x*= -1;
			this.scale.x = -1;	
		}
		if($gameTemp.mapTargetDirection == "up" || $gameTemp.mapTargetDirection == "down"){
			var tmp = offset.x;
			offset.x = offset.y;
			offset.y = tmp;
			this.scale.y = -1;		
		}
		if($gameTemp.mapTargetDirection == "up"){
			offset.y*= -1;
		}		
		this.x = this._position.x + offset.x;
		this.y = this._position.y + offset.y;
		this.z = 999;
	}
	
//====================================================================
// ●Sprite_WillIndicator
//====================================================================	
	
	function Sprite_WillIndicator() {
		this.initialize.apply(this, arguments);
	}

	Sprite_WillIndicator.prototype = Object.create(Sprite_Base.prototype);
	Sprite_WillIndicator.prototype.constructor = Sprite_WillIndicator;

	Sprite_WillIndicator.prototype.initialize = function(character) {
		Sprite_Base.prototype.initialize.call(this);
		this._character = character;		
		this.text = new PIXI.Text('',
		{
		  fontFamily : 'Arial',
		  fontSize: "13px",
		  fill : 0xffffff,
		  cacheAsBitmap: true, // for better performance
		  height: 30,
		  width: 20,
		});
		this.addChild(this.text);
		this._previousEventType = -1;
	};

	Sprite_WillIndicator.prototype.update = function() {
		var type = this._character.isType();
		this._isEnemy = type === 'enemy'
		if(this._previousEventType != type){
			this._previousEventType = type;
			if(this._isEnemy){
				this.bitmap = ImageManager.loadSystem('WillIndicatorEnemy');
			} else {
				this.bitmap = ImageManager.loadSystem('WillIndicator');
			}
		}		
		
		this.anchor.x = 0.5;
		this.anchor.y = 1;
		
		 
		if(this._isEnemy){
			this.text.anchor.set(0); 
			this.text.x = -23; 
			this.text.y = -49.5	;
		} else {
			this.text.anchor.set(1); 
			this.text.x = 23; 
			this.text.y = -33.5	;
		}	
		
		this.x = this._character.screenX();
		this.y = this._character.screenY();
		//this.z = this._character.screenZ() - 1;
		var eventId = this._character.eventId();
		var battlerArray = $gameSystem.EventToUnit(eventId);
		if($gameSystem.showWillIndicator && battlerArray){
			var unit = battlerArray[1];
			if(unit && !this._character.isErased()){
				this.opacity = 255;
				var maxWill = $statCalc.getMaxWill(unit);
				var will = $statCalc.getCurrentWill(unit);
				//this.drawText(will, 0, 0, 20);
				this.text.text = will;
				var color = "#ffffff";				
				if(will < 100){
					color = "#f1de55";
				} 
				if(will <= 50){
					color = "#ff2222";
				}
				if(will == maxWill){
					color = "#00f1ff";
				}
				this.text.style.fill = color;
			} else {
				this.opacity = 0;
			}
		} else {
			this.opacity = 0;
		}		
	};
	
//====================================================================
// ●Sprite_BasicShadow
//====================================================================	
	
	function Sprite_BasicShadow() {
		this.initialize.apply(this, arguments);
	}

	Sprite_BasicShadow.prototype = Object.create(Sprite_Base.prototype);
	Sprite_BasicShadow.prototype.constructor = Sprite_BasicShadow;

	Sprite_BasicShadow.prototype.initialize = function(character) {
		Sprite_Base.prototype.initialize.call(this);
		this._character = character;
		this.bitmap =  ImageManager.loadPicture('flight_shadow');
		this.anchor.x = 0.5;
		this.anchor.y = 1;
	};

	Sprite_BasicShadow.prototype.update = function() {
		this.x = this._character.screenX();
		this.y = this._character.screenY();
		//this.z = this._character.screenZ() - 1;
		var eventId = this._character.eventId();
		var battlerArray = $gameSystem.EventToUnit(eventId);
		if(battlerArray){
			if (this._character._characterName == "" || this._character._transparent || !$statCalc.isFlying(battlerArray[1])) {
				this.opacity = 0;
			} else {
				this.y-=this._character._floatOffset;
				this.opacity = this._character._opacity - 128;
			};
		} else {
			this.opacity = 0;
		}		
	};

//====================================================================
// ●Sprite_DefendIndicator
//====================================================================	
	
	function Sprite_DefendIndicator() {
		this.initialize.apply(this, arguments);
	}

	Sprite_DefendIndicator.prototype = Object.create(Sprite_Base.prototype);
	Sprite_DefendIndicator.prototype.constructor = Sprite_DefendIndicator;

	Sprite_DefendIndicator.prototype.initialize = function(character) {
		Sprite_Base.prototype.initialize.call(this);
		this._character = character;
		this.bitmap =  ImageManager.loadSystem('shield');
		this.anchor.x = 0.5;
		this.anchor.y = 1;
		this._frameCount = 0;
	};

	Sprite_DefendIndicator.prototype.update = function() {
		this.x = this._character.screenX();
		
		this.y = this._character.screenY() - 2;
		//this.z = this._character.screenZ() - 1;
		var eventId = this._character.eventId();
		var battlerArray = $gameSystem.EventToUnit(eventId);
		
		if(battlerArray){
			var unit = battlerArray[1];
			var isShown = true;
			if(!$gameSystem.isEnemy(unit)){
				if(!$gameTemp.showAllyDefendIndicator){
					isShown = false;
				}
				this.x = this._character.screenX() + 15;
			} else {
				if(!$gameTemp.showEnemyDefendIndicator){
					isShown = false;
				}
				this.x = this._character.screenX() - 15;
			}
			if($gameSystem.isBattlePhase() === 'AI_phase' || $gameSystem.isSubBattlePhase() === 'actor_target'){
				var activeEvent = $gameTemp.activeEvent();
				if(activeEvent){
					var actor = $gameSystem.EventToUnit(activeEvent.eventId())[1];
					if($gameSystem.isFriendly(actor, $gameSystem.getFactionId(unit))){
						if(!actor || !$statCalc.canSupportDefend(actor, unit)){
							isShown = false;
						}
					} else {
						if(!$statCalc.hasSupportDefend(unit)){
							isShown = false;
						}
					}					
				} else {
					isShown = false;
				}
			} else {
				if($gameTemp.summaryUnit && !$statCalc.canSupportDefend($gameTemp.summaryUnit, unit)){
					isShown = false;
				}
			}
			if(isShown && unit && !this._character.isErased()){
			
				this._frameCount+=2;
				this._frameCount %= 200;
				if(this._frameCount < 100){
					this.opacity = this._frameCount + 120;
				} else {
					this.opacity = 200 + 120 - this._frameCount;
				}
				
			} else {
				this.opacity = 0;
			}
		} else {
			this.opacity = 0;
		}		
	};
	
//====================================================================
// ●Sprite_AttackIndicator
//====================================================================	
	
	function Sprite_AttackIndicator() {
		this.initialize.apply(this, arguments);
	}

	Sprite_AttackIndicator.prototype = Object.create(Sprite_Base.prototype);
	Sprite_AttackIndicator.prototype.constructor = Sprite_AttackIndicator;

	Sprite_AttackIndicator.prototype.initialize = function(character) {
		Sprite_Base.prototype.initialize.call(this);
		this._character = character;
		this.bitmap =  ImageManager.loadSystem('sword');
		this.anchor.x = 0.5;
		this.anchor.y = 1;
		this._frameCount = 0;
	};

	Sprite_AttackIndicator.prototype.update = function() {
		this.x = this._character.screenX();
		
		this.y = this._character.screenY() - 2;
		//this.z = this._character.screenZ() - 1;
		var eventId = this._character.eventId();
		var battlerArray = $gameSystem.EventToUnit(eventId);
		
		if(battlerArray){
			var unit = battlerArray[1];
			var isShown = true;
			if(!$gameSystem.isEnemy(unit)){
				if(!$gameTemp.showAllyAttackIndicator){
					isShown = false;
				}
				this.x = this._character.screenX() - 15;
			} else {
				if(!$gameTemp.showEnemyAttackIndicator){
					isShown = false;
				}
				this.x = this._character.screenX() + 15;
			}
			
			if($gameSystem.isBattlePhase() === 'AI_phase' || $gameSystem.isSubBattlePhase() === 'actor_target'){
				var activeEvent = $gameTemp.activeEvent();
				if(activeEvent){
					var actor = $gameSystem.EventToUnit(activeEvent.eventId())[1];
					if($gameSystem.isFriendly(actor, $gameSystem.getFactionId(unit))){
						if(!actor || !$statCalc.canSupportAttack(actor, unit)){
							isShown = false;
						}
					} else {
						if(!$statCalc.hasSupportAttack(unit)){
							isShown = false;
						}
					}
				} else {
					isShown = false;
				}				
			} else {
				if(!$gameTemp.summaryUnit || !$statCalc.canSupportAttack($gameTemp.summaryUnit, unit)){
					isShown = false;
				}
			}
			
			
			if(isShown && unit && !this._character.isErased()){
			
				this._frameCount+=2;
				this._frameCount %= 200;
				if(this._frameCount < 100){
					this.opacity = this._frameCount + 120;
				} else {
					this.opacity = 200 + 120 - this._frameCount;
				}
				
			} else {
				this.opacity = 0;
			}
		} else {
			this.opacity = 0;
		}		
	};	
	
//====================================================================
// ●Sprite_TwinIndicator
//====================================================================	
	
	function Sprite_TwinIndicator() {
		this.initialize.apply(this, arguments);
	}

	Sprite_TwinIndicator.prototype = Object.create(Sprite_Base.prototype);
	Sprite_TwinIndicator.prototype.constructor = Sprite_TwinIndicator;

	Sprite_TwinIndicator.prototype.initialize = function(character) {
		Sprite_Base.prototype.initialize.call(this);
		this._character = character;
		this.bitmap =  ImageManager.loadSystem('twin');
		this.anchor.x = 0.5;
		this.anchor.y = 1;
		this._frameCount = 0;
	};

	Sprite_TwinIndicator.prototype.update = function() {
		this.x = this._character.screenX();
		
		this.y = this._character.screenY() - 30;
		//this.z = this._character.screenZ() - 1;
		var eventId = this._character.eventId();
		var battlerArray = $gameSystem.EventToUnit(eventId);
		
		if(battlerArray){
			var unit = battlerArray[1];
			if(!$gameSystem.isEnemy(unit)){				
				this.x = this._character.screenX() - 15;
			} else {
				this.x = this._character.screenX() + 15;
			}		
			
			if($statCalc.isMainTwin(unit) && unit && !this._character.isErased()){
			
				/*this._frameCount+=2;
				this._frameCount %= 200;
				if(this._frameCount < 100){
					this.opacity = this._frameCount + 120;
				} else {
					this.opacity = 200 + 120 - this._frameCount;
				}*/
				this.opacity = 255;
			} else {
				this.opacity = 0;
			}
		} else {
			this.opacity = 0;
		}		
	};	
		
	
//====================================================================
// Sprite_Destroyed
//====================================================================	
	
	function Sprite_Destroyed() {
		this.initialize.apply(this, arguments);
	}

	Sprite_Destroyed.prototype = Object.create(Sprite_Base.prototype);
	Sprite_Destroyed.prototype.constructor = Sprite_Destroyed;

	Sprite_Destroyed.prototype.initialize = function(character) {
		Sprite_Base.prototype.initialize.call(this);		
		this.bitmap =  ImageManager.loadAnimation('Explosion1');
		this._character = character;
		this.anchor.x = 0.5;
		this.anchor.y = 0.6;
		this._animationFrame = 0;
		this.visible = false;
		this._frameSize = 192;
		this._sheetHeight = 3;
		this._sheetWidth = 5;
		this._frames = 11;
		this._frameCounter = 0;
		this._animationSpeed = 2;
		this.setFrame(0 * this._frameSize, 0 * this._frameSize, this._frameSize, this._frameSize);
	};
	
	Sprite_Destroyed.prototype.setCharacter = function(character){
		this._character = character;
	}

	Sprite_Destroyed.prototype.update = function() {
		if(this._character.manuallyErased){
			return;
		}
		if(this._animationFrame > this._frames){
			this.visible = false;
			this._character.isDoingDeathAnim = false;
			this._processedDeath = false;
			this._animationFrame = 0;
		} else {
			var eventId = this._character.eventId();
			var battlerArray = $gameSystem.EventToUnit(eventId);
			
			if(this._animationFrame == 3 && !this._processedDeath){
				this._processedDeath = true;
				if(this._character.isDoingSubTwinDeath){
					$statCalc.swapEvent(this._character, true);
					//_this._currentDeath.event.appear();
					//this._character.refreshImage();
					$statCalc.getMainTwin(battlerArray[1]).subTwin = null;
				} else if(this._character.isDoingMainTwinDeath){	
					$statCalc.swapEvent(this._character, true);
					$statCalc.getMainTwin(battlerArray[1]).subTwin = null;
					//battlerArray[1].subTwin.isSubTwin = false;
					//battlerArray[1].subTwin = null;
				} else {	
					this._character.erase();	
				}							
			}				
			this.x = this._character.screenX();
			this.y = this._character.screenY();
			this.z = this._character.screenZ() + 1;
			
			if(battlerArray && battlerArray[1]){
				if (this._character.isDoingDeathAnim) {
					if(this._animationFrame == 1){
						var se = {};
						se.name = 'SRWExplosion';
						se.pan = 0;
						se.pitch = 100;
						se.volume = 80;
						AudioManager.playSe(se);
					}
					
					this.visible = true;
					var col = this._animationFrame % this._sheetWidth;
					var row = Math.floor(this._animationFrame / this._sheetWidth);
					this.setFrame(col * this._frameSize, row * this._frameSize, this._frameSize, this._frameSize);
					this._frameCounter++;
					if(this._frameCounter >= this._animationSpeed){
						this._animationFrame++;
						this._frameCounter = 0;
					}					
				} 
			}	
		}			
	};	
	
//====================================================================
// Sprite_Appear
//====================================================================	
	
	function Sprite_Appear() {
		this.initialize.apply(this, arguments);
	}

	Sprite_Appear.prototype = Object.create(Sprite_Base.prototype);
	Sprite_Appear.prototype.constructor = Sprite_Appear;

	Sprite_Appear.prototype.initialize = function(character) {
		Sprite_Base.prototype.initialize.call(this);		
		
		this._character = character;
		
		
		this._initialized = false;
		
		this.anchor.x = 0.5;
		this.anchor.y = 0.6;
		this._animationFrame = 0;
		this.visible = false;
		
		this._sheetHeight = 3;
		
		this._frameCounter = 0;
		
		
		this.setFrame(0 * this._frameSize, 0 * this._frameSize, this._frameSize, this._frameSize);
	};
	
	Sprite_Appear.prototype.setCharacter = function(character){
		this._character = character;
	}
	
	Sprite_Appear.prototype.erase = function() {
		this._initialized = false;
		this._erased = true;
		this.refresh();
	};

	Sprite_Appear.prototype.update = function() {
		var eventId = this._character.eventId();
		var battlerArray = $gameSystem.EventToUnit(eventId);
		if(!this._initialized && battlerArray && battlerArray[1]){
			this._initialized = true;
			var animInfo = $statCalc.getSpawnAnimInfo(battlerArray[1]);
			this.bitmap =  ImageManager.loadAnimation(animInfo.name);
			this._frameSize = animInfo.frameSize;
			this._sheetWidth = animInfo.sheetWidth;
			this._frames = animInfo.frames;
			this._animationSpeed = animInfo.speed;
			this._appearFrame = animInfo.appearFrame;
			this._se = animInfo.se;
		}
		
		
		if(this._animationFrame > this._frames){
			this.visible = false;
			this._character.isDoingAppearAnim = false;
		} else {
			if(this._animationFrame == this._appearFrame){
				this._character.appear();
				this._character.refreshImage();
			}				
			this.x = this._character.screenX();
			this.y = this._character.screenY();
			this.z = this._character.screenZ() + 1;
			
			
			if(battlerArray && battlerArray[1]){
				if (this._character.isDoingAppearAnim) {
					if(this._animationFrame == 0){
						var se = {};
						se.name = this._se;
						se.pan = 0;
						se.pitch = 100;
						se.volume = 60;
						AudioManager.playSe(se);
					}
					this.visible = true;
					var col = this._animationFrame % this._sheetWidth;
					var row = Math.floor(this._animationFrame / this._sheetWidth);
					this.setFrame(col * this._frameSize, row * this._frameSize, this._frameSize, this._frameSize);
					this._frameCounter++;
					if(this._frameCounter >= this._animationSpeed){
						this._animationFrame++;
						this._frameCounter = 0;
					}					
				} 
			}	
		}			
	};	

//====================================================================
// Sprite_Disappear
//====================================================================	
	
	function Sprite_Disappear() {
		this.initialize.apply(this, arguments);
	}

	Sprite_Disappear.prototype = Object.create(Sprite_Base.prototype);
	Sprite_Disappear.prototype.constructor = Sprite_Disappear;

	Sprite_Disappear.prototype.initialize = function(character) {
		Sprite_Base.prototype.initialize.call(this);		
		this.bitmap =  ImageManager.loadAnimation('SRWDisappear');
		this._character = character;
		this.anchor.x = 0.5;
		this.anchor.y = 0.6;
		this._animationFrame = 0;
		this.visible = false;
		this._frameSize = 192;
		this._sheetHeight = 3;
		this._sheetWidth = 5;
		this._frames = 8;
		this._frameCounter = 0;
		this._animationSpeed = 2;
		this.setFrame(0 * this._frameSize, 0 * this._frameSize, this._frameSize, this._frameSize);
	};
	
	Sprite_Disappear.prototype.setCharacter = function(character){
		this._character = character;
	}

	Sprite_Disappear.prototype.update = function() {
		if(this._animationFrame > this._frames){
			this.visible = false;
			this._character.isDoingDisappearAnim = false;
		} else {
			if(this._animationFrame == 3){
				this._character.erase();
			}				
			this.x = this._character.screenX();
			this.y = this._character.screenY();
			this.z = this._character.screenZ() + 1;
			var eventId = this._character.eventId();
			var battlerArray = $gameSystem.EventToUnit(eventId);
			if(battlerArray && battlerArray[1]){
				if (this._character.isDoingDisappearAnim) {
					if(this._animationFrame == 0){
						var se = {};
						se.name = 'SRWDisappear';
						se.pan = 0;
						se.pitch = 100;
						se.volume = 60;
						AudioManager.playSe(se);
					}
					this.visible = true;
					var col = this._animationFrame % this._sheetWidth;
					var row = Math.floor(this._animationFrame / this._sheetWidth);
					this.setFrame(col * this._frameSize, row * this._frameSize, this._frameSize, this._frameSize);
					this._frameCounter++;
					if(this._frameCounter >= this._animationSpeed){
						this._animationFrame++;
						this._frameCounter = 0;
					}					
				} 
			}	
		}			
	};		
	
	
//====================================================================
// Sprite_SrpgGrid
//====================================================================	
	
	function Sprite_Reticule() {
		this.initialize.apply(this, arguments);
	}

	Sprite_Reticule.prototype = Object.create(Sprite_Base.prototype);
	Sprite_Reticule.prototype.constructor = Sprite_Reticule;

	Sprite_Reticule.prototype.initialize = function() {
		Sprite_Base.prototype.initialize.call(this);
		this.bitmap =  ImageManager.loadPicture('reticule');
		this.anchor.x = 0.5;
		this.anchor.y = 0.5;
		this._duration = 10;
		this._holdDuration = 20;
	};
	
	Sprite_Reticule.prototype.start = function(info) {
		this._time = 0;
		this._actor = info.actor;
		this._targetActor = info.targetActor;
	}

	Sprite_Reticule.prototype.update = function() {
		function lerp(start, end, t){
		//	t => 1-(--t)*t*t*t;
			return start + (end - start) * t;
		}
		
		if(this._time > this._duration){
			if(this._time < this._duration + this._holdDuration){
				var scaleFactor = 1.05 + (Math.sin((this._time - this._duration) / 2) / 15);
				this.scale.x = scaleFactor;
				this.scale.y = scaleFactor;
			} else {
				$gameTemp.reticuleInfo = null;
				this._actor = null;
				this._targetActor = null;
				this._time = 0;
				this.scale.x = 1;
				this.scale.y = 1;
			}			
		}
		if(this._actor && this._targetActor){	
			if(this._time <= this._duration){
				this.visible = true;
				this.x = lerp(this._actor.event.screenX(), this._targetActor.event.screenX(), this._time / this._duration);
				this.y = lerp(this._actor.event.screenY() - 24, this._targetActor.event.screenY() - 24, this._time / this._duration);				
			}
			this._time++;
		} else if($gameTemp.reticuleInfo){
			this.start($gameTemp.reticuleInfo);
		} else {	
			this.visible = false;
		}		
	};
//====================================================================
// Sprite_SrpgGrid
//====================================================================	
	
	function Sprite_SrpgGrid() {
		this.initialize.apply(this, arguments);
	}

	Sprite_SrpgGrid.prototype = Object.create(Sprite_Base.prototype);
	Sprite_SrpgGrid.prototype.constructor = Sprite_SrpgGrid;

	Sprite_SrpgGrid.prototype.initialize = function() {
		Sprite_Base.prototype.initialize.call(this);
		this.bitmap = new Bitmap($gameMap.tileWidth() * $gameMap.width(), $gameMap.tileHeight() * $gameMap.height());
		for(var i = 0; i < $gameMap.width(); i++){
			this.bitmap.fillRect(i * $gameMap.tileWidth(), 0, 1 , this.bitmap.height, "white");
		}
		for(var i = 0; i < $gameMap.height(); i++){
			this.bitmap.fillRect(0, i * $gameMap.tileHeight(), this.bitmap.width , 1, "white");
		}
		
		this.anchor.x = 0;
		this.anchor.y = 0;
		this._posX = 0;
		this._posY = 0;
		//this.blendMode = Graphics.BLEND_ADD;
	};

	Sprite_SrpgGrid.prototype.update = function() {
		if($gameSystem.enableGrid && !$gameSystem.optionDisableGrid){
			this.opacity = 128;
		} else {
			this.opacity = 0;
		}		
		this.updatePosition();		
		//this.bitmap.fillAll('red');
	};
	
	Sprite_SrpgGrid.prototype.updatePosition = function() {
        var tileWidth = $gameMap.tileWidth();
        var tileHeight = $gameMap.tileHeight();
        this.x = ($gameMap.adjustX(this._posX) + 0.5) * tileWidth -$gameMap.tileWidth()/2;
        this.y = ($gameMap.adjustY(this._posY) + 0.5) * tileHeight -$gameMap.tileHeight()/2;
		this.z = 0;
    };

//====================================================================
// Sprite_AreaHighlights
//====================================================================	
	
	function Sprite_AreaHighlights() {
		this.initialize.apply(this, arguments);
	}

	Sprite_AreaHighlights.prototype = Object.create(Sprite_Base.prototype);
	Sprite_AreaHighlights.prototype.constructor = Sprite_AreaHighlights;

	Sprite_AreaHighlights.prototype.initialize = function() {
		Sprite_Base.prototype.initialize.call(this);
		/*for(var i = 0; i < $gameMap.width(); i++){
			this.bitmap.fillRect(i * $gameMap.tileWidth(), 0, 1 , this.bitmap.height, "white");
		}
		for(var i = 0; i < $gameMap.height(); i++){
			this.bitmap.fillRect(0, i * $gameMap.tileHeight(), this.bitmap.width , 1, "white");
		}*/
		this.bitmap = new Bitmap($gameMap.tileWidth() * $gameMap.width(), $gameMap.tileHeight() * $gameMap.height());
		this.construct();
		this.anchor.x = 0;
		this.anchor.y = 0;
		this._posX = 0;
		this._posY = 0;
		//this.opacity = 128;
		//this.blendMode = Graphics.BLEND_ADD;
		this._frameCount = 0;
		
		
	};
	
	Sprite_AreaHighlights.prototype.construct = function() {
		var _this = this;
		this._frameCount = 0;
		this.bitmap.clearRect(0, 0, $gameMap.tileWidth() * $gameMap.width(), $gameMap.tileHeight() * $gameMap.height());			
			
		if($gameSystem.highlightedTiles){
			for(var i = 0; i < $gameSystem.highlightedTiles.length; i++){
				var highlight = $gameSystem.highlightedTiles[i];
				this.bitmap.fillRect(highlight.x * $gameMap.tileWidth(), highlight.y * $gameMap.tileHeight(), $gameMap.tileWidth(), $gameMap.tileHeight(), highlight.color);
			}
		}	
		if($gameSystem.regionHighlights){
			Object.keys($gameSystem.regionHighlights).forEach(function(regionId){
				var color = $gameSystem.regionHighlights[regionId];
				var tileCoords = $gameMap.getRegionTiles(regionId);
				for(var i = 0; i < tileCoords.length; i++){
					var highlight = tileCoords[i];
					_this.bitmap.fillRect(highlight.x * $gameMap.tileWidth(), highlight.y * $gameMap.tileHeight(), $gameMap.tileWidth(), $gameMap.tileHeight(), color);
				}
			});			
		}	
		if($gameSystem.highlightedMapRetargetTiles){
			for(var i = 0; i < $gameSystem.highlightedMapRetargetTiles.length; i++){
				var highlight = $gameSystem.highlightedMapRetargetTiles[i];
				this.bitmap.fillRect(highlight.x * $gameMap.tileWidth(), highlight.y * $gameMap.tileHeight(), $gameMap.tileWidth(), $gameMap.tileHeight(), highlight.color);
			}
		}
		
		if($gameSystem.highlightedActionTiles){
			for(var i = 0; i < $gameSystem.highlightedActionTiles.length; i++){
				var highlight = $gameSystem.highlightedActionTiles[i];
				this.bitmap.fillRect(highlight.x * $gameMap.tileWidth(), highlight.y * $gameMap.tileHeight(), $gameMap.tileWidth(), $gameMap.tileHeight(), highlight.color);
			}
		}
	}

	Sprite_AreaHighlights.prototype.update = function() {
		if($gameSystem.highlightsRefreshed){
			$gameSystem.highlightsRefreshed = false;
			this.construct();
		}	
		this.updatePosition();		
		if($gameTemp.disableHighlightGlow){
			this.opacity = 128;
		} else {
			this._frameCount+=2;
			this._frameCount %= 200;
			if(this._frameCount < 100){
				this.opacity = this._frameCount + 80;
			} else {
				this.opacity = 200 + 80 - this._frameCount;
			}
		}		
	};
	
	Sprite_AreaHighlights.prototype.updatePosition = function() {
        var tileWidth = $gameMap.tileWidth();
        var tileHeight = $gameMap.tileHeight();
        this.x = ($gameMap.adjustX(this._posX) + 0.5) * tileWidth -$gameMap.tileWidth()/2;
        this.y = ($gameMap.adjustY(this._posY) + 0.5) * tileHeight -$gameMap.tileHeight()/2;
		this.z = 0;
    };
	