//=============================================================================
// SRPG_core.js -SRPGコンバータMV-
// バージョン   : 1.22
// 最終更新日   : 2019/8/23
// 制作         : 神鏡学斗
// 配布元       : http://www.lemon-slice.net/
// バグ修正協力 : アンチョビ様　
//                エビ様　http://www.zf.em-net.ne.jp/~ebi-games/
//                Tsumio様
// Copyright 2017 - 2019 Lemon slice all rights reserved.
//-----------------------------------------------------------------------------
// SRW Engine MV
// Version   : 1.0
// Copyright 2020 The Shadow Knight all rights reserved.
//-----------------------------------------------------------------------------
// Released under the MIT license.
// http://opensource.org/licenses/mit-license.php
//=============================================================================

//global reference to the filesystem module to circumvent issues with webpacked sections(battle scene)
const FILESYSTEM = require("fs");

//disable touch support

TouchInput.update = function() {}

var windowOffset = 0;
 
//Control variable ids 
var _nextMapVariable = 6;
var _nextMapXVariable = 7;
var _nextMapYVariable = 8;
var _nextMapDeployVariable = 9;
var _SRCountVariable = 10;
var _lastStageIdVariable = 11;
var _turnCountVariable = 12;

var _currentActorId = 13;
var _currentEnemyId = 14;

var _actorsDestroyed = 15;
var _enemiesDestroyed = 16;

var _masteryConditionText = 17;
var _victoryConditionText = 18;
var _defeatConditionText = 19;

var _existShipVarId = 20;

var _lastActorAttackId = 61;
var _lastActorSupportAttackId = 62;
var _lastEnemyAttackId = 63;
var _lastEnemySupportAttackId = 64;

if(typeof ENGINE_SETTINGS == "undefined"){
	ENGINE_SETTINGS = {};
}
Object.keys(ENGINE_SETTINGS_DEFAULT).forEach(function(key){
	if(ENGINE_SETTINGS[key] == null){
		ENGINE_SETTINGS[key] = ENGINE_SETTINGS_DEFAULT[key];
	}
});

var $SRWEditor = new SRWEditor();

var $SRWGameState = new GameStateManager();
$SRWGameState.requestNewState("normal");

var $SRWStageInfoManager = new SRWStageInfoManager();
var $SRWSaveManager = new SRWSaveManager();
var $statCalc = new StatCalc();
var $spiritManager = new SpiritManager(); 
var $pilotAbilityManager = new PilotAbilityManager(); 
var $mechAbilityManager = new MechAbilityManager(); 
var $itemEffectManager = new ItemEffectManager(); 
var $abilityCommandManger = new AbilityCommandManger();
var $weaponEffectManager = new WeaponEffectManager();
var $relationshipBonusManager = new RelationshipBonusManager();
var $battleCalc = new BattleCalc();
var $CSSUIManager = new CSSUIManager();
var $songManager = new SRWSongManager();
var $mapAttackManager = new MapAttackManager();

var $inventoryManager = new SRWInventoryManager();
 
var $battleSceneManager = new BattleSceneManager();

var parameters = PluginManager.parameters('SRPG_core');
var _srpgTroopID = Number(parameters['srpgTroopID'] || 1);
var _srpgBattleSwitchID = Number(parameters['srpgBattleSwitchID'] || 1);
var _endIntermissionSwitchID = 3;
var _inIntermissionSwitchID = 4;
var _existActorVarID = Number(parameters['existActorVarID'] || 1);
var _existEnemyVarID = Number(parameters['existEnemyVarID'] || 2);

var _turnVarID = Number(parameters['turnVarID'] || 3);
var _activeEventID = Number(parameters['activeEventID'] || 4);
var _targetEventID = Number(parameters['targetEventID'] || 5);
var _defaultMove = Number(parameters['defaultMove'] || 4);
var _srpgBattleExpRate = Number(parameters['srpgBattleExpRate'] || 0.4);
var _srpgBattleExpRateForActors = Number(parameters['srpgBattleExpRateForActors'] || 0.1);
var _enemyDefaultClass = parameters['enemyDefaultClass'] || 'エネミー';
var _textSrpgEquip = parameters['textSrpgEquip'] || '装備';
var _textSrpgMove = parameters['textSrpgMove'] || '移動力';
var _textSrpgRange = parameters['textSrpgRange'] || '射程';
var _textSrpgWait = parameters['textSrpgWait'] || '待機';
var _textSrpgTurnEnd = parameters['textSrpgTurnEnd'] || 'ターン終了';
var _textSrpgAutoBattle = parameters['textSrpgAutoBattle'] || 'オート戦闘';
var _srpgBattleQuickLaunch = parameters['srpgBattleQuickLaunch'] || 'true';
var _srpgActorCommandEquip = parameters['srpgActorCommandEquip'] || 'true';
var _srpgBattleEndAllHeal = parameters['srpgBattleEndAllHeal'] || 'true';
var _srpgStandUnitSkip = parameters['srpgStandUnitSkip'] || 'false';
var _srpgPredictionWindowMode = Number(parameters['srpgPredictionWindowMode'] || 1);
var _srpgAutoBattleStateId = Number(parameters['srpgAutoBattleStateId'] || 14);
var _srpgBestSearchRouteSize = Number(parameters['srpgBestSearchRouteSize'] || 20);
var _srpgDamageDirectionChange = parameters['srpgDamageDirectionChange'] || 'true';
var _defaultPlayerSpeed = parameters['defaultPlayerSpeed'] || 4;


(function() {
	//TODO: Proper pre-loading/load waiting

	
    
	
	
	
	Input._isEscapeCompatible = function(keyName) {
		return keyName === 'cancel';
	};
	
	Input._shouldPreventDefault = function(keyCode) {
		if($gameTemp.editMode){
			return false;
		} else {
			switch (keyCode) {
				case 8:     // backspace
				case 33:    // pageup
				case 34:    // pagedown
				case 37:    // left arrow
				case 38:    // up arrow
				case 39:    // right arrow
				case 40:    // down arrow
					return true;
			}
		}		
		return false;
	};
	
	/*Input._pollGamepads = function() {
		if (navigator.getGamepads) {
			var gamepads = navigator.getGamepads();
			if (gamepads) {
				for (var i = 0; i < gamepads.length; i++) {
					var gamepad = gamepads[i];
					if (gamepad && gamepad.connected && gamepad.id == "Xbox 360 Controller (XInput STANDARD GAMEPAD)") {
						this._updateGamepadState(gamepad);
					}
				}
			}
		}
	};*/
	
	TouchInput._onWheel = function(event) {
		
	}
	
	Graphics._createAllElements = function() {
		this._createErrorPrinter();
		this._createCanvas();
		this._createVideo();
		this._createUpperCanvas();
		this._createRenderer();
		this._createFPSMeter();
		this._createModeBox();
		this._createGameFontLoader();
		
		$CSSUIManager.initAllWindows();	
		$battleSceneManager.initContainer();			
	};
	

	
	Graphics.render = function(stage) {
		if (this._skipCount <= 0) { //fix for rare freezes
			var startTime = Date.now();
			if (stage) {
				this._renderer.render(stage);
				if (this._renderer.gl && this._renderer.gl.flush) {
					this._renderer.gl.flush();
				}
			}
			var endTime = Date.now();
			var elapsed = endTime - startTime;
			this._skipCount = Math.min(Math.floor(elapsed / 15), this._maxSkip);
			this._rendered = true;
		} else {
			this._skipCount--;
			this._rendered = false;
		}
		this.frameCount++;
	};
	

	var Graphics_updateCanvas = Graphics._updateCanvas;
	Graphics._updateCanvas = function(windowId){
		Graphics_updateCanvas.call(this);
		if(!$gameTemp || !$gameTemp.editMode){
			var battleScenePIXILayer = document.querySelector("#battle_scene_pixi_layer");
			if(battleScenePIXILayer){
				battleScenePIXILayer.width = this._width;
				battleScenePIXILayer.height = this._height;
				this._centerElement(battleScenePIXILayer);
			}	
			var customUILayer = document.querySelector("#custom_UI_layer");
			if(customUILayer){
				customUILayer.width = this._width;
				customUILayer.height = this._height;
				this._centerElement(customUILayer);
			}
			var battleSceneLayer = document.querySelector("#battle_scene_layer");
			if(battleSceneLayer){
				battleSceneLayer.width = this._width;
				battleSceneLayer.height = this._height;
				this._centerElement(battleSceneLayer);
			}	
			var battleSceneUILayer = document.querySelector("#battle_scene_ui_layer");
			if(battleSceneUILayer){
				battleSceneUILayer.width = this._width;
				battleSceneUILayer.height = this._height;
				this._centerElement(battleSceneUILayer);
			}	
			var fadeContainer = document.querySelector("#fade_container");
			if(fadeContainer){
				fadeContainer.width = this._width;
				fadeContainer.height = this._height;
				this._centerElement(fadeContainer);
			}	
		}	
		$CSSUIManager.updateScaledText(windowId);				
	}
	
	ImageManager.getTranslationInfo = function(filename){		
		if($gameSystem.faceAliases && $gameSystem.faceAliases[filename]){
			filename = $gameSystem.faceAliases[filename];
		}
		if(ENGINE_SETTINGS.variableUnitPortraits){
			var keyParts = filename.split("_");
			keyParts.pop();
			var variablePortraitKey = keyParts.join("_");
			var defs = ENGINE_SETTINGS.variableUnitPortraits[variablePortraitKey];
			if(defs){
				var translationFound = false;
				var ctr = 0;
				while(ctr < defs.length && !translationFound){
					var def = defs[ctr];
					var mechId = def.deployedId;
					if($statCalc.isMechDeployed(mechId)){
						translationFound = true;
						filename = def.filename;
					}
					ctr++;
				}
			}			
		}
		return filename;
	}
	
	ImageManager.loadFace = function(filename, hue) {
		filename = this.getTranslationInfo(filename); 
		return this.loadBitmap('img/faces/', filename, hue, true);
	};	
	
	ImageManager.requestFace = function(filename, hue) {		
		filename = this.getTranslationInfo(filename); 		
		return this.requestBitmap('img/faces/', filename, hue, true);
	};
	
	ImageManager.reserveFace = function(filename, hue, reservationId) {
		filename = this.getTranslationInfo(filename); 
		return this.reserveBitmap('img/faces/', filename, hue, true, reservationId);
	};
    	



//==================================================================
// ●Game_BattlerBase
//====================================================================
    // 初期処理
	Object.defineProperties(Game_BattlerBase.prototype, {
		// Hit Points
		hp: { get: function() { 
			if($statCalc.isActorSRWInitialized(this)){
				return this.SRWStats.mech.stats.calculated.currentHP;
			} else {
				return this._hp; 
			}			
		}, configurable: true },
		// Magic Points
		mp: { get: function() { 
			if($statCalc.isActorSRWInitialized(this)){
				return this.SRWStats.mech.stats.calculated.currentEN;
			} else {
				return this._mp; 
			}
		}, configurable: true },
		// Tactical Points
		mhp: { get: function() { 
			if($statCalc.isActorSRWInitialized(this)){
				return this.SRWStats.mech.stats.calculated.maxHP;
			} else {
				return this.param(0); 
			}		
		}, configurable: true },
		// Maximum Magic Points
		mmp: { get: function() { 
			if($statCalc.isActorSRWInitialized(this)){
				return this.SRWStats.mech.stats.calculated.maxEN;
			} else {
				return this.param(1); 
			}
		}, configurable: true },
		// ATtacK power
	});
	
	Game_BattlerBase.prototype.setHp = function(hp) {
		if(!isNaN(hp)){
			if(hp < 0){
				hp = 0;
			}
			if($statCalc.isActorSRWInitialized(this)){
				this.SRWStats.mech.stats.calculated.currentHP = hp;
			}
			this._hp = hp;
			this.refresh();
		} else {
			console.log("setHp received invalid value!");
		}
	};

	Game_BattlerBase.prototype.setMp = function(mp) {
		if(!isNaN(mp)){
			if(mp < 0){
				mp = 0;
			}
			if($statCalc.isActorSRWInitialized(this)){
				this.SRWStats.mech.stats.calculated.currentEN = mp;
			}
			this._mp = mp;
			this.refresh();
		} else {
			console.log("setMp received invalid value!");
		}		
	};	
	
    var _SRPG_Game_BattlerBase_initMembers = Game_BattlerBase.prototype.initMembers;
    Game_BattlerBase.prototype.initMembers = function() {
        _SRPG_Game_BattlerBase_initMembers.call(this);
        this._srpgTurnEnd = false;
        this._srpgActionTiming = -1; // 0:攻撃側、1:防御側
    };

    // 移動力を返す（定義は、gameActor, gameEnemyで行う）
    Game_BattlerBase.prototype.srpgMove = function() {
        return 0;
    };

    // スキル・アイテムの射程を返す（定義は、gameActor, gameEnemyで行う）
    Game_BattlerBase.prototype.srpgSkillRange = function(skill) {
        return 0;
    };

    // 武器の攻撃射程を返す（定義は、gameActor, gameEnemyで行う）
    Game_BattlerBase.prototype.srpgWeaponRange = function() {
        return 0;
    };

    // 武器が反撃可能かを返す（定義は、gameActor, gameEnemyで行う）
    Game_BattlerBase.prototype.srpgWeaponCounter = function() {
        return true;
    };

    // 通行可能タグを返す（定義は、gameActor, gameEnemyで行う）
    Game_BattlerBase.prototype.srpgThroughTag = function() {
        return 0;
    };

    //行動終了かどうかを返す
    Game_BattlerBase.prototype.srpgTurnEnd = function() {
        return this._srpgTurnEnd;
    };

    //行動終了を設定する
    Game_BattlerBase.prototype.setSrpgTurnEnd = function(flag) {
		if(flag){
			$statCalc.setTurnEnd(this);
		}		
        this._srpgTurnEnd = flag;
    };

    //攻撃側か防御側かを返す
    Game_BattlerBase.prototype.srpgActionTiming = function() {
        return this._srpgActionTiming;
    };

    //攻撃側か防御側かを設定する
    Game_BattlerBase.prototype.setActionTiming = function(timing) {
        this._srpgActionTiming = timing;
    };

    // 入力可能かどうかの判定
    var _SRPG_Game_BattlerBase_canInput = Game_BattlerBase.prototype.canInput;
    Game_BattlerBase.prototype.canInput = function() {
        if ($gameSystem.isSRPGMode() == true) {
            return this.isAppeared() && !this.isRestricted() && !this.isAutoBattle() &&
                   !this.srpgTurnEnd();
        } else {
            return _SRPG_Game_BattlerBase_canInput.call(this);
        }
    };

    // スキル・アイテムが使用可能かの判定
    var _SRPG_Game_BattlerBase_isOccasionOk = Game_BattlerBase.prototype.isOccasionOk;
    Game_BattlerBase.prototype.isOccasionOk = function(item) {
        if ($gameSystem.isSRPGMode() == true) {
            if ($gameSystem.isBattlePhase() === 'actor_phase' &&
                $gameSystem.isSubBattlePhase() === 'normal') {
                return false;
            } else {
                return item.occasion === 0 || item.occasion === 1;
            }
        } else {
            return _SRPG_Game_BattlerBase_isOccasionOk.call(this, item);
        }
    };

    // スキル・アイテムが使用可能かの判定
    var _SRPG_Game_BattlerBase_canUse = Game_BattlerBase.prototype.canUse;
    Game_BattlerBase.prototype.canUse = function(item) {
        if ($gameSystem.isSRPGMode() == true) {
            if (!item) {
                return false;
            }
            if ($gameSystem.isBattlePhase() === 'actor_phase' && 
                $gameSystem.isSubBattlePhase() === 'normal') {
                return false;
            }
            if (($gameSystem.isSubBattlePhase() === 'invoke_action' ||
                 $gameSystem.isSubBattlePhase() === 'auto_actor_action' ||
                 $gameSystem.isSubBattlePhase() === 'enemy_action' ||
                 $gameSystem.isSubBattlePhase() === 'battle_window') &&
                (this.srpgSkillRange(item) < $gameTemp.SrpgDistance() ||
                this.srpgSkillMinRange(item) > $gameTemp.SrpgDistance() ||
                $gameTemp.SrpgSpecialRange() == false ||
                (this._srpgActionTiming == 1 && this.srpgWeaponCounter() == false))) {
                return false;
            }
        }
        return _SRPG_Game_BattlerBase_canUse.call(this, item);
    };

    // ステートのターン経過処理（ＳＲＰＧ用）
    // 行動終了時：行動ごとに１ターン経過
    // ターン終了時：全体のターン終了ごとに１ターン経過
    Game_BattlerBase.prototype.updateSrpgStateTurns = function(timing) {
        this._states.forEach(function(stateId) {
            if (this._stateTurns[stateId] > 0 && $dataStates[stateId].autoRemovalTiming === timing) {
                this._stateTurns[stateId]--;
            }
        }, this);
    };


//====================================================================
// ●Game_Battler
//====================================================================
	

    var _SRPG_Game_Battler_initMembers = Game_Battler.prototype.initMembers;
    Game_Battler.prototype.initMembers = function() {
        _SRPG_Game_Battler_initMembers.call(this);
        this._battleMode = 'normal';
        this._searchItem = false;
        this._targetId = -1;
        this._SRPGActionTimes = 1;
    };

    // 行動モードの設定
    Game_Battler.prototype.setBattleMode = function(mode, force) {
		if(force || (this._battleMode != "fixed" && this._battleMode != "disabled")){
			this._battleMode = mode;	
		}        
    };
	
	Game_Battler.prototype.setSquadMode = function(mode) {
		var _this = this;
		_this.setBattleMode(mode);
		if(_this.squadId != -1){
			var type = _this.isActor() ? "actor" : "enemy";
			$gameMap.events().forEach(function(event) {
				if (event.isType() === type) {
					var enemy = $gameSystem.EventToUnit(event.eventId())[1];	
					if(enemy.squadId == _this.squadId){
						enemy.setBattleMode(_this._battleMode);
					}	
				}
			});
		}		
	}

    Game_Battler.prototype.battleMode = function() {
        return this._battleMode;
    };

    // アイテム探査モードの設定
    Game_Battler.prototype.setSearchItem = function(mode) {
        if (mode) {
            this._searchItem = true;
        } else {
            this._searchItem = false;
        }
    };

    Game_Battler.prototype.searchItem = function() {
        return this._searchItem;
    };

    // ターゲットＩＤの設定
    Game_Battler.prototype.setTargetId = function(id) {
        this._targetId = id;
    };

    Game_Battler.prototype.targetId = function() {
        return this._targetId;
    };

    // 行動回数を設定する（SRPG用）
    Game_Battler.prototype.SRPGActionTimesSet = function(amount) {
        this._SRPGActionTimes = amount || 1;
    };

    // 行動回数を返す
    Game_Battler.prototype.SRPGActionTimes = function() {
        return this._SRPGActionTimes;
    };

    // 行動回数を消費する
    Game_Battler.prototype.useSRPGActionTimes = function(num) {
        this._SRPGActionTimes -= num;
    };

    // 行動回数の設定（戦闘用）
    var _SRPG_Game_Battler_makeActionTimes = Game_Battler.prototype.makeActionTimes;
    Game_Battler.prototype.makeActionTimes = function() {
        if ($gameSystem.isSRPGMode() == true) {
            return 1;
        } else {
            return _SRPG_Game_Battler_makeActionTimes.call(this);
        }
    };

    // アクションのから配列を作成する
    Game_Battler.prototype.srpgMakeNewActions = function() {
        this.clearActions();
        //if (this.canMove()) {
            var actionTimes = this.makeActionTimes();
            this._actions = [];
            for (var i = 0; i < actionTimes; i++) {
                this._actions.push(new Game_Action(this));
            }
        //}
        this.setActionState('waiting');
    };
	
	Game_Battler.prototype.srpgInitAction = function() {
		 this.clearActions();
		 this._actions.push(new Game_Action(this));
	}

    // 行動開始時の処理
    var _SRPG_Game_Battler_onBattleStart = Game_Battler.prototype.onBattleStart;
    Game_Battler.prototype.onBattleStart = function() {
        if ($gameSystem.isSRPGMode() == true) {
            this.setActionState('undecided');
            this.clearMotion();
        } else {
            return _SRPG_Game_Battler_onBattleStart.call(this);
        }
    };

    // 行動終了時の処理
    var _SRPG_Game_Battler_onAllActionsEnd = Game_Battler.prototype.onAllActionsEnd;
    Game_Battler.prototype.onAllActionsEnd = function() {
        if ($gameSystem.isSRPGMode() == true) {
            this.updateSrpgStateTurns(1);
            this.removeStatesAuto(1);
            this.clearResult();
        } else {
            return _SRPG_Game_Battler_onAllActionsEnd.call(this);
        }
    };

    // ターン終了時の処理
    var _SRPG_Game_Battler_onTurnEnd = Game_Battler.prototype.onTurnEnd;
    Game_Battler.prototype.onTurnEnd = function() {
        if ($gameSystem.isSRPGMode() == true) {
            this.regenerateAll();
            this.updateSrpgStateTurns(2);
            this.updateBuffTurns();
            this.removeStatesAuto(2);
            this.removeBuffsAuto();
            this.clearResult();
            this.setSrpgTurnEnd(false);
        } else {
            return _SRPG_Game_Battler_onTurnEnd.call(this);
        }
    };

    Game_Battler.prototype.srpgCheckFloorEffect = function(x, y) {
        if ($gameMap.isDamageFloor(x, y) == true) {
            this.srpgExecuteFloorDamage();
        }
    };

    Game_Battler.prototype.srpgExecuteFloorDamage = function() {
        var damage = Math.floor(this.srpgBasicFloorDamage() * this.fdr);
        damage = Math.min(damage, this.srpgMaxFloorDamage());
        this.gainHp(-damage);
        if (damage > 0) {
            $gameScreen.startFlashForDamage();
        }
    };

    Game_Battler.prototype.srpgBasicFloorDamage = function() {
        return this.mhp * 0.1;
    };

    Game_Battler.prototype.srpgMaxFloorDamage = function() {
        return $dataSystem.optFloorDeath ? this.hp : Math.max(this.hp - 1, 0);
    };

//====================================================================
// ●Game_Actor
//====================================================================
	Object.defineProperty(Game_Actor.prototype, 'level', {
		get: function() {
			if($statCalc.isActorSRWInitialized(this)){
				return this.SRWStats.pilot.level;
			} else {
				return this._level; 
			}	
		},
		configurable: true
	});
	
	
	Game_Actor.prototype.expForLevel = function(level) {
		return 500 * level;
	};

	Game_Actor.prototype.initExp = function() {
		//stubbed	
	};

	Game_Actor.prototype.currentExp = function() {
		return this.SRWStats.pilot.exp;
	};

	Game_Actor.prototype.currentLevelExp = function() {
		return this.expForLevel(this._level);
	};

	Game_Actor.prototype.nextLevelExp = function() {
		return this.expForLevel(this._level + 1);
	};

	Game_Actor.prototype.nextRequiredExp = function() {
		return this.nextLevelExp() - this.currentExp();
	};

	Game_Actor.prototype.maxLevel = function() {
		return 99;
	};

	Game_Actor.prototype.isMaxLevel = function() {
		return this._level >= this.maxLevel();
	};
	
	var Game_Actor_initImages = Game_Actor.prototype.initImages;
	Game_Actor.prototype.initImages = function(overworldSpriteData) {
		if($gameSystem.isSRPGMode()){
			var actor = this.actor();
			if(!overworldSpriteData){
				if($dataClasses[actor.classId].meta.srpgOverworld){
					overworldSpriteData = $dataClasses[actor.classId].meta.srpgOverworld.split(",");
				} else {
					overworldSpriteData = [actor.characterName, actor.characterIndex];
				}
			}
					
			this._characterName = overworldSpriteData[0];
			this._characterIndex = overworldSpriteData[1];
			this._faceName = actor.faceName;
			this._faceIndex = actor.faceIndex;
			this._battlerName = actor.battlerName;
		} else {
			Game_Actor_initImages.call(this);
		}
		
	};

    // 装備変更可能か
    Window_EquipSlot.prototype.isEnabled = function(index) {
        return this._actor ? this._actor.isEquipChangeOk(index) : false;
    };
	
	Game_Actor.prototype.setAttack = function(slotId, item) {
		this._equips[slotId].setObject(item);
	};

    var _SRPG_Game_Actor_isEquipChangeOk = Game_Actor.prototype.isEquipChangeOk;
    Game_Actor.prototype.isEquipChangeOk = function(slotId) {
        if ($gameSystem.isSRPGMode() == true) {
            if (this.srpgTurnEnd() == true || this.isRestricted() == true) {
                return false;
            } else {
                return _SRPG_Game_Actor_isEquipChangeOk.call(this, slotId);
            }
        } else {
            return _SRPG_Game_Actor_isEquipChangeOk.call(this, slotId);
        }
    };

    // アクターコマンドで装備が可能か（移動後は不可）
    Game_Actor.prototype.canSrpgEquip = function() {
        return $gameTemp.originalPos()[0] == $gameTemp.activeEvent().posX() &&
               $gameTemp.originalPos()[1] == $gameTemp.activeEvent().posY();
    };

    // 経験値の割合を返す
    Game_Actor.prototype.expRate = function() {
        if (this.isMaxLevel()) {
            var rate = 1.0;
        } else {
            var rate = (this.currentExp() - this.currentLevelExp()) / (this.nextLevelExp() - this.currentLevelExp());
        }
        return rate;
    };

    // 移動力を返す
    Game_Actor.prototype.srpgMove = function() {
        var n = this.currentClass().meta.srpgMove;
        if (!n) {
            n = _defaultMove;
        }
        n = Number(n);
        // ステートによる変更
        this.states().forEach(function(state) {
            if (state.meta.srpgMovePlus) {
                n += Number(state.meta.srpgMovePlus);
            }
        }, this);
        // 装備による変更
        var equips = this.equips();
        for (var i = 0; i < equips.length; i++) {
            var item = equips[i];
            if (item && item.meta.srpgMovePlus) {
                n += Number(item.meta.srpgMovePlus);
            }
        }
        n = Number(Math.max(n, 0));
        return n;
    };

    // スキル・アイテムの射程を返す
    Game_Actor.prototype.srpgSkillRange = function(skill) {
        var range = 1;
        if (skill && skill.meta.srpgRange == -1) {
            if (!this.hasNoWeapons()) {
                weapon = this.weapons()[0];
                range = weapon.meta.weaponRange;
            }
        } else if (skill.meta.srpgRange) {
            range = skill.meta.srpgRange;
        } else {
            range = 1;
        }
        return Number(range);
    };

    // 武器の攻撃射程を返す
    Game_Actor.prototype.srpgWeaponRange = function() {
        return this.srpgSkillRange($dataSkills[this.attackSkillId()]);
    };

    // 武器が反撃可能かを返す
    Game_Actor.prototype.srpgWeaponCounter = function() {
        if (this.hasNoWeapons()) {
            return true;
        } else {
            var weapon = this.weapons()[0];
            if (!weapon.meta.srpgCounter || !weapon.meta.srpgCounter == 'false') {
                return true;
            } else {
                return false;
            }
        }
    };

    // 通行可能タグを返す（class, equip, stateの設定で最大の物を採用する）
    Game_Actor.prototype.srpgThroughTag = function() {
        var n = 0;
        // 職業
        if (this.currentClass().meta.srpgThroughTag && n < Number(this.currentClass().meta.srpgThroughTag)) {
            n = Number(this.currentClass().meta.srpgThroughTag);
        }
        // ステート
        this.states().forEach(function(state) {
            if (state.meta.srpgThroughTag && n < Number(state.meta.srpgThroughTag)) {
                n = Number(state.meta.srpgThroughTag);
            }
        }, this);
        // 装備
        var equips = this.equips();
        for (var i = 0; i < equips.length; i++) {
            var item = equips[i];
            if (item && item.meta.srpgThroughTag && n < Number(item.meta.srpgThroughTag)) {
                n = Number(item.meta.srpgThroughTag);
            }
        }
        return n;
    };

    // スキル・アイテムの最低射程を返す
    Game_Actor.prototype.srpgSkillMinRange = function(skill) {
        var minRange = 0;
        if (skill) {
            if (skill.meta.srpgRange == -1) {
                if (!this.hasNoWeapons()) {
                    var weapon = this.weapons()[0];
                    minRange = weapon.meta.weaponMinRange;
                }
            } else if (skill.meta.srpgMinRange) {
                minRange = skill.meta.srpgMinRange;
            }
            if (!minRange) {
                minRange = 0;
            }
        } else {
            minRange = 0;
        }
        if (minRange > this.srpgSkillRange(skill)) {
            minRange = this.srpgSkillRange(skill);
        }
        return Number(minRange);
    };

    // 武器の最低射程を返す
    Game_Actor.prototype.srpgWeaponMinRange = function() {
        return this.srpgSkillMinRange($dataSkills[this.attackSkillId()]);
    };

    // attackSkillId == 1 以外の武器を作る
    Game_Actor.prototype.attackSkillId = function() {
        var weapon = this.weapons()[0];
        if (weapon && weapon.meta.srpgWeaponSkill) {
            return Number(weapon.meta.srpgWeaponSkill);
        } else {
            return Game_BattlerBase.prototype.attackSkillId.call(this);
        }
    };

    //自動行動を決定する
    var _SRPG_Game_Actor_makeAutoBattleActions = Game_Actor.prototype.makeAutoBattleActions;
    Game_Actor.prototype.makeAutoBattleActions = function() {
        if ($gameSystem.isSRPGMode() == true) {
            for (var i = 0; i < this.numActions(); i++) {
                var list = this.makeActionList();
                this.setAction(i, list[Math.randomInt(list.length)]);
            }
            this.setActionState('waiting');
        } else {
            return _SRPG_Game_Actor_makeAutoBattleActions.call(this);
        }
    };

//====================================================================
// ●Game_Enemy
//====================================================================
    // 戦闘画面での座標を設定する
    Game_Enemy.prototype.setScreenXy = function(x, y) {
        this._screenX = x;
        this._screenY = y;
    };

    // 移動力を返す
    Game_Enemy.prototype.srpgMove = function() {
        var n = this.enemy().meta.srpgMove;
        if (!n) {
            n = _defaultMove;
        }
        n = Number(n);
        // ステートによる変更
        this.states().forEach(function(state) {
            if (state.meta.srpgMovePlus) {
                n += Number(state.meta.srpgMovePlus);
            }
        }, this);
        // 装備による変更
        if (!this.hasNoWeapons()) {
            var item = $dataWeapons[this.enemy().meta.srpgWeapon];
            if (item && item.meta.srpgMovePlus) {
                n += Number(item.meta.srpgMovePlus);
            }
        }
        n = Number(Math.max(n, 0));
        return n;
    };

    // スキル・アイテムの射程を返す
    Game_Enemy.prototype.srpgSkillRange = function(skill) {
        var range = 1;
        if (skill && skill.meta.srpgRange == -1) {
            if (!this.hasNoWeapons()) {
                var weapon = $dataWeapons[this.enemy().meta.srpgWeapon];
                range = weapon.meta.weaponRange;
            } else {
                range = this.enemy().meta.weaponRange;
            }
        } else if (skill.meta.srpgRange) {
            range = skill.meta.srpgRange;
        } else {
            range = 1;
        }
        return Number(range);
    };

    // 武器の攻撃射程を返す
    Game_Enemy.prototype.srpgWeaponRange = function() {
        return this.srpgSkillRange($dataSkills[this.attackSkillId()]);
    };

    // 武器が反撃可能かを返す
    Game_Enemy.prototype.srpgWeaponCounter = function() {
        if (!this.hasNoWeapons()) {
            var weapon = $dataWeapons[this.enemy().meta.srpgWeapon];
            var counter = weapon.meta.srpgCounter;
        } else {
            var counter = this.enemy().meta.srpgCounter;
        } 
        if (!counter || !counter == 'false') {
            return true;
        } else {
            return false;
        }
    };

    // 通行可能タグを返す（enemy, equip, stateの設定で最大の物を採用する）
    Game_Enemy.prototype.srpgThroughTag = function() {
        var n = 0;
        // エネミー
        if (this.enemy().meta.srpgThroughTag && n < Number(this.enemy().meta.srpgThroughTag)) {
            n = Number(this.enemy().meta.srpgThroughTag);
        }
        // ステート
        this.states().forEach(function(state) {
            if (state.meta.srpgThroughTag && n < Number(state.meta.srpgThroughTag)) {
                n = Number(state.meta.srpgThroughTag);
            }
        }, this);
        // 装備
        if (!this.hasNoWeapons()) {
            var item = $dataWeapons[this.enemy().meta.srpgWeapon];
            if (item && item.meta.srpgThroughTag && n < Number(item.meta.srpgThroughTag)) {
                n = Number(item.meta.srpgThroughTag);
            }
        }
        return n;
    };

    // スキル・アイテムの最低射程を返す
    Game_Enemy.prototype.srpgSkillMinRange = function(skill) {
        var minRange = 0;
        if (skill) {
            if (skill.meta.srpgRange == -1) {
                if (!this.hasNoWeapons()) {
                    var weapon = $dataWeapons[this.enemy().meta.srpgWeapon];
                    minRange = weapon.meta.weaponMinRange;
                } else {
                    minRange = this.enemy().meta.weaponMinRange;
                }
            } else if (skill.meta.srpgMinRange) {
                minRange = skill.meta.srpgMinRange;
            }
            if (!minRange) {
                minRange = 0;
            }
        } else {
            minRange = 0;
        }
        if (minRange > this.srpgSkillRange(skill)) {
            minRange = this.srpgSkillRange(skill);
        }
        return Number(minRange);
    };

    // 武器の最低射程を返す
    Game_Enemy.prototype.srpgWeaponMinRange = function() {
        return this.srpgSkillMinRange($dataSkills[this.attackSkillId()]);
    };

    // 武器を装備しているか返す
    Game_Enemy.prototype.hasNoWeapons = function() {
        return !$dataWeapons[this.enemy().meta.srpgWeapon];
    };

    // 装備の特徴を反映する
    var _SRPG_Game_Enemy_traitObjects = Game_Enemy.prototype.traitObjects;
    Game_Enemy.prototype.traitObjects = function() {
        var objects = _SRPG_Game_Enemy_traitObjects.call(this);
        if ($gameSystem.isSRPGMode() == true) {
            var item = $dataWeapons[this.enemy().meta.srpgWeapon];
            if (item) {
                objects.push(item);
            }
        }
        return objects;
    };

    // 装備の能力変化値を反映する
    Game_Enemy.prototype.paramPlus = function(paramId) {
        var value = Game_Battler.prototype.paramPlus.call(this, paramId);
        if ($gameSystem.isSRPGMode() == true) {
            var item = $dataWeapons[this.enemy().meta.srpgWeapon];
            if (item) {
                value += item.params[paramId];
            }
        }
        return value;
    };

    // 装備のアニメーションを反映する
    Game_Enemy.prototype.attackAnimationId = function() {
        if (this.hasNoWeapons()) {
            return this.bareHandsAnimationId();
        } else {
            var weapons = $dataWeapons[this.enemy().meta.srpgWeapon];
            return weapons ? weapons.animationId : 1;
        }
    };

    // 装備が設定されていない（素手）の時のアニメーションＩＤ
    Game_Enemy.prototype.bareHandsAnimationId = function() {
        return 1;
    };

    // attackSkillId == 1 以外の武器を作る
    Game_Enemy.prototype.attackSkillId = function() {
        var weapon = $dataWeapons[this.enemy().meta.srpgWeapon];
        if (weapon && weapon.meta.srpgWeaponSkill) {
            return Number(weapon.meta.srpgWeaponSkill);
        } else {
            return Game_BattlerBase.prototype.attackSkillId.call(this);
        }
    };

    // ＳＲＰＧ用の行動決定
    Game_Enemy.prototype.makeSrpgActions = function() {
        Game_Battler.prototype.makeActions.call(this);
        if (this.numActions() > 0) {
            if (this.isConfused()) {
                this.makeConfusionActions();
            } else {
                var actionList = this.enemy().actions.filter(function(a) {
                    if (a.skillId == 1) {
                        a.skillId = this.attackSkillId();
                    }
                    return this.isActionValid(a);
                }, this);
                if (actionList.length > 0) {
                    this.selectAllActions(actionList);
                }
            }
        }
        this.setActionState('waiting');
    };

    // ＳＲＰＧ用の行動決定
    Game_Enemy.prototype.makeConfusionActions = function() {
        for (var i = 0; i < this.numActions(); i++) {
            this.action(i).setSkill(this.attackSkillId());
        }
    };

//====================================================================
// ●Game_Unit
//====================================================================
    var _SRPG_Game_Unit_onBattleEnd = Game_Unit.prototype.onBattleEnd;
    Game_Unit.prototype.onBattleEnd = function() {
        if ($gameSystem.isSRPGMode() == true) {
            this._inBattle = false;
        } else {
            _SRPG_Game_Unit_onBattleEnd.call(this);
        }
    };

//====================================================================
// ●Game_Party
//====================================================================
    // 初期化
    var _SRPG_Game_Party_initialize = Game_Party.prototype.initialize;
    Game_Party.prototype.initialize = function() {
        _SRPG_Game_Party_initialize.call(this);
        this._srpgBattleActors = []; //SRPGモードの戦闘時に呼び出すメンバーを設定する（行動者と対象者）
    };

    Game_Party.prototype.SrpgBattleActors = function() {
        return this._srpgBattleActors;
    };

    Game_Party.prototype.clearSrpgBattleActors = function() {
        this._srpgBattleActors = [];
    };

    Game_Party.prototype.pushSrpgBattleActors = function(actor) {
        this._srpgBattleActors.push(actor);
    };
	
	 Game_Party.prototype.setSrpgBattleActors = function(actors) {
        this._srpgBattleActors = actors;
    };

    //プレイヤー移動時の処理
    var _SRPG_Game_Party_onPlayerWalk = Game_Party.prototype.onPlayerWalk;
    Game_Party.prototype.onPlayerWalk = function() {
        if ($gameSystem.isSRPGMode() == false) {
            return _SRPG_Game_Party_onPlayerWalk.call(this);
        }
    };

    // SRPG戦闘中にはmembersで呼び出す配列を変える
    var _SRPG_Game_Party_members = Game_Party.prototype.members;
    Game_Party.prototype.members = function() {
        if ($gameSystem.isSRPGMode() == true) {
            if ($gameSystem.isSubBattlePhase() === 'normal' || $gameSystem.isSubBattlePhase() === 'initialize') {
                return this.allMembers();
            } else {
                return this.battleMembers();
            }
        } else {
            return _SRPG_Game_Party_members.call(this);
        }
    };

    // SRPG戦闘中にはbattleMembersで呼び出す配列を変える
    var _SRPG_Game_Party_battleMembers = Game_Party.prototype.battleMembers;
    Game_Party.prototype.battleMembers = function() {
        if ($gameSystem.isSRPGMode() == true) {
            return this.SrpgBattleActors();
        } else {
            return _SRPG_Game_Party_battleMembers.call(this);
        }
    };

    // セーブファイル用の処理
    var _SRPG_Game_Party_charactersForSavefile = Game_Party.prototype.charactersForSavefile;
    Game_Party.prototype.charactersForSavefile = function() {
		return null;
		
        if ($gameSystem.isSRPGMode() == true) {
            return this.allMembers().map(function(actor) {
                return [actor.characterName(), actor.characterIndex()];
            });
        } else {
            return _SRPG_Game_Party_charactersForSavefile.call(this);
        }
    };

    var _SRPG_Game_Party_facesForSavefile = Game_Party.prototype.facesForSavefile;
    Game_Party.prototype.facesForSavefile = function() {
		return null;
		
        if ($gameSystem.isSRPGMode() == true) {
            return this.allMembers().map(function(actor) {
                return [actor.faceName(), actor.faceIndex()];
            });
        } else {
            return _SRPG_Game_Party_facesForSavefile.call(this);
        }
    };

/*
    // アイテム・スキルの使用条件
    var _SRPG_Game_Party_canUse = Game_Party.prototype.canUse;
    Game_Party.prototype.canUse = function(item) {
        if ($gameSystem.isSRPGMode() == true) {
            var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
            return actor.canUse(item);
        } else {
            return _SRPG_Game_Party_canUse.call(this, item);
        }
    };
*/
//====================================================================
// ●Game_Troop
//====================================================================
    // 初期化
    var _Game_Troop_initialize = Game_Troop.prototype.initialize
    Game_Troop.prototype.initialize = function() {
        _Game_Troop_initialize.call(this);
        this._srpgBattleEnemys = []; //SRPGモードの戦闘時に呼び出すメンバーを設定する（行動者と対象者）
    };

    Game_Troop.prototype.SrpgBattleEnemys = function() {
        return this._srpgBattleEnemys;
    };

    Game_Troop.prototype.clearSrpgBattleEnemys = function() {
        this._srpgBattleEnemys = [];
    };

    Game_Troop.prototype.pushSrpgBattleEnemys = function(enemy) {
        this._srpgBattleEnemys.push(enemy);
    };
	
	 Game_Troop.prototype.setSrpgBattleEnemys = function(enemies) {
        this._srpgBattleEnemys = enemies;
		this._enemies = enemies;
    };

    Game_Troop.prototype.pushMembers = function(enemy) {
        this._enemies.push(enemy);
    };

    // セットアップ
    var _SRPG_Game_Troop_setup = Game_Troop.prototype.setup;
    Game_Troop.prototype.setup = function(troopId) {
        if ($gameSystem.isSRPGMode() == true) {
            this.clear();
            this._troopId = troopId;
            this._enemies = [];
            for (var i = 0; i < this.SrpgBattleEnemys().length; i++) {
                var enemy = this.SrpgBattleEnemys()[i];
                enemy.setScreenXy(200 + 240 * i, Graphics.height / 2 + 48);
                this._enemies.push(enemy);
            }
            this.makeUniqueNames();
        } else {
            _SRPG_Game_Troop_setup.call(this, troopId);
        }
    };

    // EXPを返す
    var _SRPG_Game_Troop_expTotal = Game_Troop.prototype.expTotal;
    Game_Troop.prototype.expTotal = function() {
        if ($gameSystem.isSRPGMode() == true) {
            if (this.SrpgBattleEnemys() && this.SrpgBattleEnemys().length > 0) {
                if (this.isAllDead()) {
                    return _SRPG_Game_Troop_expTotal.call(this);
                } else {
                    var exp = 0;
                    for (var i = 0; i < this.members().length; i++) {
                        var enemy = this.members()[i];
                        exp += enemy.exp();
                    }
                    return Math.floor(exp * _srpgBattleExpRate);
                }
            } else {
                var actor = $gameParty.battleMembers()[0];
                var exp = actor.nextLevelExp() - actor.currentLevelExp();
                return Math.floor(exp * _srpgBattleExpRateForActors);
            }
        } else {
            return _SRPG_Game_Troop_expTotal.call(this);
        }
    };

//====================================================================
// ●Game_CharacterBase
//====================================================================
    //X座標を返す
    Game_CharacterBase.prototype.posX = function() {
        return this._x;
    };

    //Y座標を返す
    Game_CharacterBase.prototype.posY = function() {
        return this._y;
    };
	
	Game_CharacterBase.prototype.shiftY = function() {
		return 0;
	}

    //イベントかどうかを返す
    Game_CharacterBase.prototype.isEvent = function() {
        return false;
    };

    //プレイヤーの移動速度を変える（自動移動中は高速化）
    var _SRPG_Game_CharacterBase_realMoveSpeed = Game_CharacterBase.prototype.realMoveSpeed;
    Game_CharacterBase.prototype.realMoveSpeed = function() {
        if ($gameSystem.isSRPGMode() == true && 
           ($gameTemp.isAutoMoveDestinationValid() == true || $gameTemp.isDestinationValid() == true)) {
            return 6;
        } else {
            return this._moveSpeed + (this.isDashing() ? 2 : 0);
        }
    };

    //戦闘中はキャラクターがすり抜けて移動するように変更する
    var _SRPG_Game_CharacterBase_canPass = Game_CharacterBase.prototype.canPass;
    Game_CharacterBase.prototype.canPass = function(x, y, d) {
        if ($gameSystem.isSRPGMode() == true) {
            var x2 = $gameMap.roundXWithDirection(x, d);
            var y2 = $gameMap.roundYWithDirection(y, d);
            if (!$gameMap.isValid(x2, y2)) {
                return false;
            }
            return true;
        } else {
            return _SRPG_Game_CharacterBase_canPass.call(this, x, y, d);
        }
    };

    //対立陣営であれば通り抜けられない（移動範囲演算用） オブジェクトも一緒に処理する
    Game_CharacterBase.prototype.isSrpgCollidedWithEvents = function(x, y) {
        var events = $gameMap.eventsXyNt(x, y);
        return events.some(function(event) {
            if ((event.isType() === 'actor' && $gameTemp.activeEvent().isType() === 'enemy') ||
                (event.isType() === 'enemy' && $gameTemp.activeEvent().isType() === 'actor') ||
                (event.isType() === 'object' && event.characterName() != '') && !event.isErased()) {
                return true;
            } else {
                return false;
            }
        });
    };

    //移動可能かを判定する（移動範囲演算用）
    Game_CharacterBase.prototype.srpgMoveCanPass = function(x, y, d, tag) {
        var x2 = $gameMap.roundXWithDirection(x, d);
        var y2 = $gameMap.roundYWithDirection(y, d);
        if (!$gameMap.isValid(x2, y2)) {
            return false;
        }
        if (this.isSrpgCollidedWithEvents(x2, y2)) {
            return false;
        }
        if (this.isThrough()) {
            return true;
        }
        if (($gameMap.terrainTag(x2, y2) > 0 && $gameMap.terrainTag(x2, y2) <= tag) ||
            ($gameMap.terrainTag(x, y) > 0 && $gameMap.terrainTag(x, y) <= tag &&
             $gameMap.isPassable(x2, y2, this.reverseDir(d)))) {
            return true;
        }
        if (!this.isMapPassable(x, y, d)) {
            return false;
        }
        return true;
    };

    //対立陣営がいるか調べる（探索用移動範囲演算）
    Game_CharacterBase.prototype.isSrpgCollidedWithOpponentsUnit = function(x, y, d, route) {
        var x2 = $gameMap.roundXWithDirection(x, d);
        var y2 = $gameMap.roundYWithDirection(y, d);
        var events = $gameMap.eventsXyNt(x2, y2);
        return events.some(function(event) {
            if ((event.isType() === 'actor' && $gameTemp.activeEvent().isType() === 'enemy') ||
                (event.isType() === 'enemy' && $gameTemp.activeEvent().isType() === 'actor') && !event.isErased()) {
                if ($gameTemp.isSrpgPriorityTarget()) {
                    if ($gameTemp.isSrpgPriorityTarget() == event &&
                        $gameTemp.isSrpgBestSearchRoute()[1].length > route.length) {
                        $gameTemp.setSrpgBestSearchRoute([event, route]);
                    }
                } else {
                    if ($gameTemp.isSrpgBestSearchRoute()[1].length > route.length) {
                        $gameTemp.setSrpgBestSearchRoute([event, route]);
                    }
                }
            }
        });
    };

    //移動範囲の計算
    Game_CharacterBase.prototype.makeMoveTable = function(x, y, move, route, actor) {
		var _this = this;
		function isPassableTile(currentX, currentY, x, y, actor){
			if(ENGINE_SETTINGS.USE_TILE_PASSAGE && !$statCalc.isFlying(actor)){
				var direction = 0;			
				if(currentX == x){
					if(currentY > y){
						direction = 8; //up
					} else {
						direction = 2; //down
					}			
				} else {
					if(currentX > x){
						direction = 4; //left
					} else {
						direction = 6; //right
					}
				}				
				if(!_this.isMapPassable(currentX, currentY, direction)){
					return false;
				}
			}
			
			if($gameMap.regionId(x, y) == 0){
				return false;
			}
			if($gameTemp._MoveTable[x] == undefined){
				return false;
			}
			if($gameTemp._MoveTable[x][y] == undefined){
				return false;
			}
			if($gameMap.regionId(x, y) % 8 == 1 && !$statCalc.isFlying(actor)){
				return false;
			}
			if($gameMap.regionId(x, y) % 8 == 2 && !$statCalc.canBeOnLand(actor) && !$statCalc.isFlying(actor)){
				return false;
			}
			if($gameMap.regionId(x, y) % 8 == 3 && !$statCalc.canBeOnWater(actor) && !$statCalc.isFlying(actor)){
				return false;
			}
			if($gameMap.regionId(x, y) % 8 == 4 && !$statCalc.canBeOnSpace(actor)){
				return false;
			}
			return $statCalc.isFreeSpace({x: x, y: y}, actor.isActor() ? "enemy" : "actor");
		}
		
		var currentRegion = $gameMap.regionId(x, y) % 8; //1 air, 2 land, 3 water, 4 space
		var moveCost = 1;
		if(route.length > 1){//no movecost for the start tile
			var taggedCost = $gameMap.SRPGTerrainTag(x, y);
			if(taggedCost > 1){
				if(currentRegion == 4 || !$statCalc.isFlying(actor)){
					moveCost = taggedCost;
				}					
				
			}
		}		

		if(currentRegion == 3 && !$statCalc.isFlying(actor)){
			if($statCalc.canBeOnWater(actor, "water") < 2){
				moveCost*=2;
			}
		} 		
		
        if (move <= 0) {
            return;
        }
        //上方向を探索
        if (route[route.length - 1] != 2) {
            if (isPassableTile(x, y, x, y-1, actor)) {
                if ($gameTemp.MoveTable(x, $gameMap.roundY(y - 1))[0] < move - moveCost) {
                    if ($gameTemp.MoveTable(x, $gameMap.roundY(y - 1))[0] < 0) {
                        $gameTemp.pushMoveList([x, $gameMap.roundY(y - 1), false]);
                    }
                    $gameTemp.setMoveTable(x, $gameMap.roundY(y - 1), move - moveCost, route.concat(8));
                    this.makeMoveTable(x, $gameMap.roundY(y - 1), move - moveCost, route.concat(8), actor);
                }
            } else if ($gameTemp.isSrpgBestSearchFlag() == true) {
                this.isSrpgCollidedWithOpponentsUnit(x, y, 8, route);
            }
        }
        //右方向を探索
        if (route[route.length - 1] != 4) {
            if (isPassableTile(x, y, x+1, y, actor)) {
                if ($gameTemp.MoveTable($gameMap.roundX(x + 1), y)[0] < move - moveCost) {
                    if ($gameTemp.MoveTable($gameMap.roundX(x + 1), y)[0] < 0) {
                        $gameTemp.pushMoveList([$gameMap.roundX(x + 1), y, false]);
                    }
                    $gameTemp.setMoveTable($gameMap.roundX(x + 1), y, move - moveCost, route.concat(6));
                    this.makeMoveTable($gameMap.roundX(x + 1), y, move - moveCost, route.concat(6), actor);
                }
            } else if ($gameTemp.isSrpgBestSearchFlag() == true) {
                this.isSrpgCollidedWithOpponentsUnit(x, y, 6, route);
            }
        }
        //左方向を探索
        if (route[route.length - 1] != 6) {
            if (isPassableTile(x, y, x-1, y, actor)) {
                if ($gameTemp.MoveTable($gameMap.roundX(x - 1), y)[0] < move - moveCost) {
                    if ($gameTemp.MoveTable($gameMap.roundX(x - 1), y)[0] < 0) {
                        $gameTemp.pushMoveList([$gameMap.roundX(x - 1), y, false]);
                    }
                    $gameTemp.setMoveTable($gameMap.roundX(x - 1), y, move - moveCost, route.concat(4));
                    this.makeMoveTable($gameMap.roundX(x - 1), y, move - moveCost, route.concat(4), actor);
                }
            } else if ($gameTemp.isSrpgBestSearchFlag() == true) {
                this.isSrpgCollidedWithOpponentsUnit(x, y, 4, route);
            }
        }
        //下方向を探索
        if (route[route.length - 1] != 8) {
            if (isPassableTile(x, y, x, y+1, actor)) {
                if ($gameTemp.MoveTable(x, $gameMap.roundY(y + 1))[0] < move - moveCost) {
                    if ($gameTemp.MoveTable(x, $gameMap.roundY(y + 1))[0] < 0) {
                        $gameTemp.pushMoveList([x, $gameMap.roundY(y + 1), false]);
                    }
                    $gameTemp.setMoveTable(x, $gameMap.roundY(y + 1), move - moveCost, route.concat(2));
                    this.makeMoveTable(x, $gameMap.roundY(y + 1), move - moveCost, route.concat(2), actor);
                }
            } else if ($gameTemp.isSrpgBestSearchFlag() == true) {
                this.isSrpgCollidedWithOpponentsUnit(x, y, 2, route);
            }
        }
    };

    //通行可能かを判定する（攻撃射程演算用）
    Game_CharacterBase.prototype.srpgRangeCanPass = function(x, y, d) {
        var x2 = $gameMap.roundXWithDirection(x, d);
        var y2 = $gameMap.roundYWithDirection(y, d);
        if (!$gameMap.isValid(x2, y2)) {
            return false;
        }
        if ($gameMap.terrainTag(x2, y2) == 7) {
            return false;
        }
        return true;
    };
    
    //特殊射程の処理
    Game_CharacterBase.prototype.srpgRangeExtention = function(x, y, oriX, oriY, skill, range) {
        switch (skill && skill.meta.specialRange) {
        case 'king': 
            if ((Math.abs(x - oriX) <= range / 2) && (Math.abs(y - oriY) <= range / 2)) {
                return true;
            } else {
                return false;
            }
        case 'queen': 
            if ((x == oriX || y == oriY) || (Math.abs(x - oriX) == Math.abs(y - oriY))) {
                return true;
            } else {
                return false;
            }
        case 'luke': 
            if (x == oriX || y == oriY) {
                return true;
            } else {
                return false;
            }
        case 'bishop': 
            if (Math.abs(x - oriX) == Math.abs(y - oriY)) {
                return true;
            } else {
                return false;
            }
        case 'knight': 
            if (!((x == oriX || y == oriY) || (Math.abs(x - oriX) == Math.abs(y - oriY)))) {
                return true;
            } else {
                return false;
            }
        default:
            return true;
        }
    };

    //攻撃射程の計算
    Game_CharacterBase.prototype.makeRangeTable = function(x, y, range, route, oriX, oriY, skill) {
        if (range <= 0) {
            return;
        }
        //上方向を探索
        if (route[route.length - 1] != 2) {
            if (this.srpgRangeCanPass(x, y, 8)) {
                //if ($gameTemp.RangeTable(x, $gameMap.roundY(y - 1))[0] < range - 1) {
                    if (this.srpgRangeExtention(x, $gameMap.roundY(y - 1), oriX, oriY, skill, range + route.length - 1) == true) {
                        if ($gameTemp.MoveTable(x, $gameMap.roundY(y - 1))[0] < 0 && $gameTemp.RangeTable(x, $gameMap.roundY(y - 1))[0] < 0) {
                            $gameTemp.pushRangeList([x, $gameMap.roundY(y - 1), true]);
                        }
                        $gameTemp.setRangeTable(x, $gameMap.roundY(y - 1), range - 1, route.concat(8));
                    }
                    this.makeRangeTable(x, $gameMap.roundY(y - 1), range - 1, route.concat(8), oriX, oriY, skill);
                //}
            }
        }
        //右方向を探索
        if (route[route.length - 1] != 4) {
            if (this.srpgRangeCanPass(x, y, 6)) {
                //if ($gameTemp.RangeTable($gameMap.roundX(x + 1), y)[0] < range - 1) {
                    if (this.srpgRangeExtention($gameMap.roundX(x + 1), y, oriX, oriY, skill, range + route.length - 1) == true) {
                        if ($gameTemp.MoveTable($gameMap.roundX(x + 1), y)[0] < 0 && $gameTemp.RangeTable($gameMap.roundX(x + 1), y)[0] < 0) {
                            $gameTemp.pushRangeList([$gameMap.roundX(x + 1), y, true]);
                        }
                        $gameTemp.setRangeTable($gameMap.roundX(x + 1), y, range - 1, route.concat(6));
                    }
                    this.makeRangeTable($gameMap.roundX(x + 1), y, range - 1, route.concat(6), oriX, oriY, skill);
                //}
            }
        }
        //左方向を探索
        if (route[route.length - 1] != 6) {
            if (this.srpgRangeCanPass(x, y, 4)) {
                //if ($gameTemp.RangeTable($gameMap.roundX(x - 1), y)[0] < range - 1) {
                    if (this.srpgRangeExtention($gameMap.roundX(x - 1), y, oriX, oriY, skill, range + route.length - 1) == true) {
                        if ($gameTemp.MoveTable($gameMap.roundX(x - 1), y)[0] < 0 && $gameTemp.RangeTable($gameMap.roundX(x - 1), y)[0] < 0) {
                            $gameTemp.pushRangeList([$gameMap.roundX(x - 1), y, true]);
                        }
                        $gameTemp.setRangeTable($gameMap.roundX(x - 1), y, range - 1, route.concat(4));
                    }
                    this.makeRangeTable($gameMap.roundX(x - 1), y, range - 1, route.concat(4), oriX, oriY, skill);
                //}
            }
        }
        //下方向を探索
        if (route[route.length - 1] != 8) {
            if (this.srpgRangeCanPass(x, y, 2)) {
                //if ($gameTemp.RangeTable(x, $gameMap.roundY(y + 1))[0] < range - 1) {
                    if (this.srpgRangeExtention(x, $gameMap.roundY(y + 1), oriX, oriY, skill, range + route.length - 1) == true) {
                        if ($gameTemp.MoveTable(x, $gameMap.roundY(y + 1))[0] < 0 && $gameTemp.RangeTable(x, $gameMap.roundY(y + 1))[0] < 0) {
                            $gameTemp.pushRangeList([x, $gameMap.roundY(y + 1), true]);
                        }
                        $gameTemp.setRangeTable(x, $gameMap.roundY(y + 1), range - 1, route.concat(2));
                    }
                    this.makeRangeTable(x, $gameMap.roundY(y + 1), range - 1, route.concat(2), oriX, oriY, skill);
                //}
            }
        }
    };

    //移動可能かを判定する（イベント出現時用）
    Game_CharacterBase.prototype.srpgAppearCanPass = function(x, y, d) {
        var x2 = $gameMap.roundXWithDirection(x, d);
        var y2 = $gameMap.roundYWithDirection(y, d);
        if (!$gameMap.isValid(x2, y2)) {
            return false;
        }
        if (!this.isMapPassable(x, y, d)) {
            return false;
        }
        return true;
    };

    //出現可能場所の計算
    Game_CharacterBase.prototype.makeAppearPoint = function(event, x, y) {
        var events = $gameMap.eventsXyNt(x, y);
        if (events.length == 0 || (events.length == 1 && events[0] == event)) {
            return [x,y];
        }
        //上方向を探索
        if (this.srpgAppearCanPass(x, y, 8)) {
            return this.makeAppearPoint(event, x, y - 1);
        }
        //右方向を探索
        if (this.srpgAppearCanPass(x, y, 6)) {
            return this.makeAppearPoint(event, x + 1, y);
        }
        //左方向を探索
        if (this.srpgAppearCanPass(x, y, 4)) {
            return this.makeAppearPoint(event, x - 1, y);
        }
        //下方向を探索
        if (this.srpgAppearCanPass(x, y, 2)) {
            return this.makeAppearPoint(event, x, y + 1);
        }
    };
	
	var Game_CharacterBase_update = Game_CharacterBase.prototype.update;
	Game_CharacterBase.prototype.update = function() {
		Game_CharacterBase_update.call(this);
		
	}
	
	var Game_CharacterBase_initialize = Game_CharacterBase.prototype.initialize;
	Game_CharacterBase.prototype.initialize = function() {
		Game_CharacterBase_initialize.call(this);
		this._floatOffset = 0;
		this._floatAmount = 10;
		this._floating = false;
	}
	
	var Game_CharacterBase_screenY = Game_CharacterBase.prototype.screenY;
	Game_CharacterBase.prototype.screenY = function() {
		var value = Game_CharacterBase_screenY.call(this);
		var battlerArray = $gameSystem.EventToUnit(this._eventId);
		if(battlerArray && $statCalc.isFlying(battlerArray[1])){
			if(!this._floating){
				this._floatOffset = 0;
				this._floating = true;
				this._floatTimer = this._floatAmount;
			}
			if(this._floatTimer > 0) {
				this._floatTimer--;
				this._floatOffset--;
			}						
		} else {
			if(this._floating){
				this._floatOffset = this._floatAmount * -1;
				this._floating = false;
				this._floatTimer = this._floatAmount;
			}
			if(this._floatTimer > 0) {
				this._floatTimer--;
				this._floatOffset++;
			}
		}	
		value+=this._floatOffset;
		return Math.round(value);
	};
	
	/*Extensions to character map animations*/
	
	Game_CharacterBase.prototype.requestAnimation = function(animationId, options) {
		this._animationId = animationId;
		this._animationOptions = options;
	};
	
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
	
	
//====================================================================
// ●Game_Player
//====================================================================
    //プレイヤーの画像を変更する
	
	Game_Player.prototype.initialize = function() {
    Game_Character.prototype.initialize.call(this);
		this.setTransparent($dataSystem.optTransparent);
		this._topSpeed = ENGINE_SETTINGS.CURSOR_SPEED || 4;
		this._initialSpeed = this._topSpeed;
		this._moveSpeed = this._initialSpeed + 1;
		this._tileCounter = 0;
		this._speedResetCounter = 0;
		this._followSpeed = 0;
	};
	
	Game_Player.prototype.setMoveSpeed = function(moveSpeed) {
		this._moveSpeed = moveSpeed;
	};
	
    var _SRPG_Game_Player_refresh = Game_Player.prototype.refresh;
    Game_Player.prototype.refresh = function() {
        if ($gameSystem.isSRPGMode() == true) {
            var characterName = 'srpg_set';
            var characterIndex = 0;
            this.setImage(characterName, characterIndex);
            this._followers.refresh();
        } else {
            _SRPG_Game_Player_refresh.call(this);
        }
    };
	
	Game_Player.prototype.setFollowSpeed = function(speed) {
		this._moveSpeed = speed;
	}
	
	Game_Player.prototype.clearFollowSpeed = function() {
		this._moveSpeed = this._topSpeed + 1;
	}
	
	Game_Player.prototype.update = function(sceneActive) {		
		/*if(this._followSpeed){
			this._moveSpeed = this._followSpeed;
		}else if(Input.isPressed('shift')){
			this._moveSpeed = ENGINE_SETTINGS.CURSOR_MAX_SPEED || this._topSpeed;
		} else {
			if(this._tileCounter > 1){
				this._moveSpeed = this._topSpeed;
			} else {
				if(this._speedResetCounter <= 0){
					this._moveSpeed = this._initialSpeed;
				} else {
					this._speedResetCounter--;
				}				
			}			
		}*/
		if(!this._moveSpeed){ //support for old save files
			this._moveSpeed = ENGINE_SETTINGS.CURSOR_SPEED || 4;
		}	
		//console.log("move speed: "+this._moveSpeed);
		
		var lastScrolledX = this.scrolledX();
		var lastScrolledY = this.scrolledY();
		var wasMoving = this.isMoving();
		this.updateDashing();
		if (sceneActive) {
			this.moveByInput();
		}
		Game_Character.prototype.update.call(this);
		this.updateScroll(lastScrolledX, lastScrolledY);
		this.updateVehicle();
		if (!this.isMoving()) {
			this.updateNonmoving(wasMoving);
		}
		this._followers.update();
	};

    //プレイヤーの自動移動を設定する
    var _SRPG_Game_Player_moveByInput = Game_Player.prototype.moveByInput;
    Game_Player.prototype.moveByInput = function() {		
		if(!this.getInputDirection()){			
			if(this._tileCounter > 0){				
				this._speedResetCounter = 10;
			}
			this._tileCounter = 0;		
		} else if(!this.isMoving()){
			this._tileCounter++;
		}
		
		
		 if ($gameSystem.isSRPGMode() == true && $gameTemp.isAutoMoveDestinationValid() == true &&
			!this.isMoving()) {
			var x = $gameTemp.autoMoveDestinationX() - this.x;
			var y = $gameTemp.autoMoveDestinationY() - this.y;
			if ($gameMap.isLoopHorizontal() == true) {
	　　        var minDisX = Math.abs($gameTemp.autoMoveDestinationX() - this.x);
				var destX = $gameTemp.autoMoveDestinationX() > this.x ? $gameTemp.autoMoveDestinationX() - $gameMap.width() : $gameTemp.autoMoveDestinationX() + $gameMap.width();
				var disX = Math.abs(destX - this.x);
				x = minDisX < disX ? x : x * -1;
			}
			if ($gameMap.isLoopVertical() == true) {
		　　    var minDisY = Math.abs($gameTemp.autoMoveDestinationY() - this.y);
				var destY = $gameTemp.autoMoveDestinationY() > this.y ? $gameTemp.autoMoveDestinationY() - $gameMap.height() : $gameTemp.autoMoveDestinationY() + $gameMap.height();
				var disY = Math.abs(destY - this.y);
				y = minDisY < disY ? y : y * -1;
			}
			if (x < 0) {
				if (y < 0) {
					this.moveDiagonally(4, 8);
				} else if (y == 0) {
					this.moveStraight(4);
				} else if (y > 0) {
					this.moveDiagonally(4, 2);
				}
			} else if (x == 0) {
				if (y < 0) {
					this.moveStraight(8);
				} else if (y == 0) {
					$gameTemp.setAutoMoveDestinationValid(false);
					$gameTemp.setAutoMoveDestination(-1, -1);
				} else if (y > 0) {
					this.moveStraight(2);
				}
			} else if (x > 0) {
				if (y < 0) {
					this.moveDiagonally(6, 8);
				} else if (y == 0) {
					this.moveStraight(6);
				} else if (y > 0) {
					this.moveDiagonally(6, 2);
				}
			}
		} else {	
		//	mapRetargetLock
			if (!this.isMoving() && this.canMove()) {
				var direction = this.getInputDirection();
				var validDestination = true;
				if($gameTemp.mapRetargetLock && $gameTemp.currentMapTargetTiles && $gameTemp.currentMapTargetTiles.length){
					// up: 8 down: 2 left: 4 right: 6
					var x = this._realX;
					var y = this._realY;
					if(direction == 8){
						y--;
					} else if(direction == 2){
						y++;
					} else if(direction == 6){
						x++;
					} else if(direction == 4){
						x--;
					}
					
					validDestination = false;
					ctr = 0;
					while(!validDestination && ctr < $gameTemp.currentMapTargetTiles.length){
						var coords = $gameTemp.currentMapTargetTiles[ctr++];
						if(coords[0] == x && coords[1] == y){
							validDestination = true;
						}
					}					
				}
				if(validDestination){
					if (direction > 0) {
						$gameTemp.clearDestination();
					} else if ($gameTemp.isDestinationValid()){
						var x = $gameTemp.destinationX();
						var y = $gameTemp.destinationY();
						direction = this.findDirectionTo(x, y);
					}
					if (direction > 0) {
						this.executeMove(direction);
					}
				}				
			}			
		}      
    };
	
	Game_Player.prototype.updateEncounterCount = function() {
		
	};
	
/* 戦闘中のイベント起動に関する処理
 * 戦闘中、通常のイベント内容は起動しないようにする
 * 戦闘中はユニットが選択されたと判断して、移動範囲演算とステータスの表示を行う(行動可能アクターなら行動する)。
*/
    //戦闘中、ユニット上で決定キーが押された時の処理
    var _SRPG_Game_Player_startMapEvent = Game_Player.prototype.startMapEvent;
    Game_Player.prototype.startMapEvent = function(x, y, triggers, normal) {
        if ($gameSystem.isSRPGMode() == true) {
			if (!$gameMap.isEventRunning() && $gameSystem.isBattlePhase() === 'actor_phase') {
				if(!$SRWGameState.updateMapEvent(x, y, triggers)){
					return;
				}				
				
                if ($gameSystem.isSubBattlePhase() === 'normal') {
                    
                } else if ($gameSystem.isSubBattlePhase() === 'twin_selection') {					
							
                } 
            }
        } else {
            _SRPG_Game_Player_startMapEvent.call(this, x, y, triggers, normal);
        }
    };

    //戦闘中、サブフェーズの状況に応じてプレイヤーの移動を制限する
    var _SRPG_Game_Player_canMove = Game_Player.prototype.canMove;
    Game_Player.prototype.canMove = function() {
        if ($gameSystem.isSRPGMode() == true) {
            /*if ($gameSystem.srpgWaitMoving() == true ||
                $gameSystem.isSubBattlePhase() === 'status_window' ||
             //   $gameSystem.isSubBattlePhase() === 'actor_command_window' ||
				$gameSystem.isSubBattlePhase() === 'post_move_command_window' ||				
                $gameSystem.isSubBattlePhase() === 'battle_window' ||
                $gameSystem.isBattlePhase() === 'auto_actor_phase' ||
                $gameSystem.isBattlePhase() === 'AI_phase' ||
                $gameSystem.isSubBattlePhase() === 'rewards_display' ||
				$gameSystem.isSubBattlePhase() === 'level_up_display' ||
				$gameSystem.isSubBattlePhase() === 'process_death_queue' ||
				$gameSystem.isSubBattlePhase() === 'process_death' || 
				$gameSystem.isSubBattlePhase() === 'pause_menu' || 				
				$gameSystem.isSubBattlePhase() === 'event_before_battle' || 			
				$gameSystem.isSubBattlePhase() === 'battle_basic' ||
				$gameSystem.isSubBattlePhase() === 'spirit_activation' ||
				$gameSystem.isSubBattlePhase() === 'after_battle' ||
				$gameSystem.isSubBattlePhase() === 'actor_map_target' ||
				$gameSystem.isSubBattlePhase() === 'map_attack_animation' ||
				$gameSystem.isSubBattlePhase() === 'process_map_attack_queue' ||
				$gameSystem.isSubBattlePhase() === 'map_spirit_animation' ||
				$gameSystem.isSubBattlePhase() === 'confirm_boarding' ||
				$gameSystem.isSubBattlePhase() === 'enemy_unit_summary' ||
				$gameSystem.isSubBattlePhase() === 'confirm_end_turn'	||
				$gameSystem.isSubBattlePhase() === 'enemy_targeting_display' ||
				$gameSystem.isSubBattlePhase() === 'enemy_attack' ||
				$gameSystem.isSubBattlePhase() === 'await_character_anim' ||
				$gameSystem.isSubBattlePhase() === 'process_destroy_transform_queue'
				
				
				
				){
                return false;
            }*/
			
			if(!$SRWGameState.canCursorMove()){
				return false;
			}
        }
		if($gameSystem.isSubBattlePhase() === 'rearrange_deploys'){
			return true;
		}
        return _SRPG_Game_Player_canMove.call(this);
    };

    //戦闘中、サブフェーズの状況に応じて決定キー・タッチの処理を変える
    var _SRPG_Game_Player_triggerAction = Game_Player.prototype.triggerAction;
    Game_Player.prototype.triggerAction = function() {
        if ($gameSystem.isSRPGMode() == true) {
			if(!$SRWGameState.updateTriggerAction(this)){
				return false;
			} else {
				return _SRPG_Game_Player_triggerAction.call(this);
			}
			
			//TODO remove these checks once all states are migrated
            /*if ($gameSystem.srpgWaitMoving() == true ||
                //$gameTemp.isAutoMoveDestinationValid() == true ||
                //$gameSystem.isSubBattlePhase() === 'actor_command_window' ||
				$gameSystem.isSubBattlePhase() === 'post_move_command_window' ||
                $gameSystem.isSubBattlePhase() === 'battle_window' ||
                $gameSystem.isBattlePhase() === 'auto_actor_phase' ||
                $gameSystem.isBattlePhase() === 'AI_phase' || 
				$gameSystem.isSubBattlePhase() === 'rewards_display' ||
				$gameSystem.isSubBattlePhase() === 'level_up_display' ||
				$gameSystem.isSubBattlePhase() === 'battle_basic' ||
				$gameSystem.isSubBattlePhase() === 'spirit_activation' ||
				$gameSystem.isSubBattlePhase() === 'after_battle' ) {
                return false;
            }  else {
                
            }	*/		
        } else {
            return _SRPG_Game_Player_triggerAction.call(this);
        }
    };

    //戦闘中、隣接するイベントへの起動判定は行わない
    var _SRPG_Game_Player_checkEventTriggerThere = Game_Player.prototype.checkEventTriggerThere;
    Game_Player.prototype.checkEventTriggerThere = function(triggers) {
        if ($gameSystem.isSRPGMode() == false) {
            _SRPG_Game_Player_checkEventTriggerThere.call(this, triggers);
        }
    };

    //戦闘中、接触による起動判定は行わない
    var _SRPG_Game_Player_checkEventTriggerTouch = Game_Player.prototype.checkEventTriggerTouch;
    Game_Player.prototype.checkEventTriggerTouch = function(x, y) {
        if ($gameSystem.isSRPGMode() == false) {
            _SRPG_Game_Player_checkEventTriggerTouch.call(this, x, y);
        }
    };

//====================================================================
// ●Game_Follower
//====================================================================
    //戦闘中、フォロワーが表示されないようにする
    var _SRPG_Game_Follower_refresh = Game_Follower.prototype.refresh;
    Game_Follower.prototype.refresh = function() {
        if ($gameSystem.isSRPGMode() == true) {
            this.setImage('', 0);
        } else {
            _SRPG_Game_Follower_refresh.call(this);
        }
    };

//====================================================================
// ●Game_Event
//====================================================================
    //初期化処理
    var _SRPG_Game_Event_initMembers = Game_Event.prototype.initMembers;
    Game_Event.prototype.initMembers = function() {
        _SRPG_Game_Event_initMembers.call(this);
        this._srpgForceRoute = [];
        this._srpgEventType = '';
    };

    //ゲームページを返す
    Game_Event.prototype.pageIndex = function() {
        return this._pageIndex;
    };

    //イベントかどうかを返す
    Game_Event.prototype.isEvent = function() {
        return true;
    };

    //消去済みかどうかを返す
    Game_Event.prototype.isErased = function() {
        return this._erased;
    };

    //消去済みフラグを消す
    Game_Event.prototype.appear = function() {
        this._erased = false;
        this.refresh();
    };

    //タイプを設定する
    Game_Event.prototype.setType = function(type) {
        this._srpgEventType = type;
    };

    //タイプを返す
    Game_Event.prototype.isType = function() {
        return this._srpgEventType;
    };

    // アクター・エネミーデータを元にイベントのグラフィックを変更する＋戦闘以外では元に戻す
    Game_Event.prototype.refreshImage = function() {
        if ($gameSystem.isSRPGMode() == true) {
            var battlerArray = $gameSystem.EventToUnit(this._eventId);
            if (!battlerArray || this.isErased()) {
                return ;
            }
            var type = battlerArray[0];
            var unit = battlerArray[1];
            if (type === 'actor') {
				var mechClass;

				if(unit.SRWStats && unit.SRWStats.mech){
					mechClass = unit.SRWStats.mech.id;
				} else {
					mechClass = unit._classId;
				}
				
				var overworldSpriteData = $dataClasses[mechClass].meta.srpgOverworld.split(",");
				characterName = overworldSpriteData[0];
				characterIndex = overworldSpriteData[1];
                this.setImage(characterName, characterIndex);
            } else if (type === 'enemy') {
				var characterName;
				var characterIndex;        
				var mechClass = unit._mechClass;
				if(mechClass){
					var overworldSpriteData = $dataClasses[mechClass].meta.srpgOverworld.split(",");
					characterName = overworldSpriteData[0];
					characterIndex = overworldSpriteData[1];
				} else {
					characterName = unit.enemy().meta.characterName;
					characterIndex = unit.enemy().meta.characterIndex;
					if (!characterName || !characterIndex) {
						characterName = 'monster.png';
						characterIndex = 0;
					}
				}
                this.setImage(characterName, characterIndex);
            } else if (type === 'null') {
                this.erase();
            }
        } else {
            if (this.isErased()) {
                this.appear();
            }
            var page = this.page();
			if(page){
				var image = page.image;
				if (image.tileId > 0) {
					this.setTileImage(image.tileId);
				} else {
					this.setImage(image.characterName, image.characterIndex);
				}
				this.setDirection(image.direction);
				this.setPattern(image.pattern);
			}
            
        }
    };
	
	Game_Event.prototype.srpgMoveToPoint = function(targetPosition, ignoreMoveTable, ignoreObstacles) {
		this._pendingMoveToPoint = true;
		this._targetPosition = targetPosition;
		
		var actor = $gameSystem.EventToUnit(this.eventId())[1];
		
		var list = $gameTemp.moveList();
		var moveListLookup = {};
		list.forEach(function(entry){
			if(!moveListLookup[entry[0]]){
				moveListLookup[entry[0]] = [];
			}
			moveListLookup[entry[0]][entry[1]] = true;
		});
		//construct grid representation for pathfinding
		var occupiedPositions = $statCalc.getOccupiedPositionsLookup(actor.isActor() ? "enemy" : "actor");
		var pathfindingGrid = [];
		var directionGrid = [];
		for(var i = 0; i < $gameMap.width(); i++){
			
			pathfindingGrid[i] = [];
			directionGrid[i] = [];
			for(var j = 0; j < $gameMap.height(); j++){
				
				var weight = 1 ;
				if(i >= 0 && j >= 0){
					if(!$statCalc.isFlying(actor)){
						weight+=$gameMap.SRPGTerrainTag(i, j);
					}
					if(ignoreObstacles){
						pathfindingGrid[i][j] = 1;
						directionGrid[i][j] = {
							top: true,
							bottom: true,
							left: true,
							right: true
						};
					} else {
						
						var isCenterPassable = !(occupiedPositions[i] && occupiedPositions[i][j]) 
							&& $statCalc.canStandOnTile(actor, {x: i, y: j})
							&& (ignoreMoveTable || (moveListLookup[i] && moveListLookup[i][j]));
						var isTopPassable;
						var isBottomPassable;
						var isLeftPassable;
						var isRightPassable;
						if(!isCenterPassable || $statCalc.isFlying(actor) || !ENGINE_SETTINGS.USE_TILE_PASSAGE){
							isTopPassable = isCenterPassable;
							isBottomPassable = isCenterPassable;
							isLeftPassable = isCenterPassable;
							isRightPassable = isCenterPassable;
						} else {
							isTopPassable = $gameMap.isPassable(i, j, 8);
							isBottomPassable = $gameMap.isPassable(i, j, 2);
							isLeftPassable = $gameMap.isPassable(i, j, 4);
							isRightPassable = $gameMap.isPassable(i, j, 6);
						}
						
				
						pathfindingGrid[i][j] = isCenterPassable ? weight : 0; 	
						directionGrid[i][j] = {
							top: isTopPassable,
							bottom: isBottomPassable,
							left: isLeftPassable,
							right: isRightPassable
						};
					}
				} else {
					pathfindingGrid[i][j] = 0;
					directionGrid[i][j] = {
						top: false,
						bottom: false,
						left: false,
						right: false
					};
				}
			}
		}
		var graph = new Graph(pathfindingGrid, directionGrid);
		
		var startCoords = {x: this.posX(), y: this.posY()};
		var startNode = graph.grid[startCoords.x][startCoords.y];
		var endCoords = {x: this._targetPosition.x, y: this._targetPosition.y};
		var endNode = graph.grid[endCoords.x][endCoords.y];

		
		var path = astar.search(graph, startNode, endNode);
		
		$gamePlayer.followedEvent = this;
		this._pathToCurrentTarget = path;	
	}
    //移動ルートを設定する
    Game_Event.prototype.srpgMoveRouteForce = function(array) {
        this._srpgForceRoute = [];
        for (var i = 1; i < array.length; i++) {
            this._srpgForceRoute.push(array[i]);
        }
        this._srpgForceRoute.push(0);
    };

    //設定されたルートに沿って移動する
    var _SRPG_Game_Event_updateStop = Game_Event.prototype.updateStop;
    Game_Event.prototype.updateStop = function() {
		var battlerArray = $gameSystem.EventToUnit(this._eventId);
		var isActor = false;
		if(battlerArray && battlerArray[1]){
			var isActor = battlerArray[1].isActor();
		}	
		var followMove = !isActor || $gameTemp.followMove;
		if(battlerArray && battlerArray[1]){
			var regionId = $gameMap.regionId(this._x, this._y);
			$statCalc.setCurrentTerrainFromRegionIndex(battlerArray[1], regionId);
			$gameMap.initSRWTileProperties();
			if($gameSystem.regionAttributes && $gameSystem.regionAttributes[regionId]){
				var def = $gameSystem.regionAttributes[regionId];
				$statCalc.setCurrentTerrainModsFromTilePropertyString(battlerArray[1], def.defense+","+def.evasion+","+def.hp_regen+","+def.en_regen+",");
			} else {
				$statCalc.setCurrentTerrainModsFromTilePropertyString(battlerArray[1], $gameMap.getTileProperties({x: this._x, y: this._y}));
			}			
		}		
        if ($gameSystem.isSRPGMode() == true && this._srpgForceRoute.length > 0) {
            if (!this.isMoving()) {
                var command = this._srpgForceRoute[0];
                this._srpgForceRoute.shift();
                if (command == 0) {
                    this._srpgForceRoute = [];
                    $gameSystem.setSrpgWaitMoving(false);
                } else {
                    this.moveStraight(command);
                }
            }
        } else if(this._pendingMoveToPoint){
			if (!this.isMoving()) {
				Input.update();
				if(Input.isPressed("pagedown") || Input.isLongPressed("pagedown") || $gameSystem.optionSkipUnitMoving){					
					if(this._pathToCurrentTarget && this._pathToCurrentTarget.length){//avoid rare crash where this functional is called when the path has already been cleared
						var targetPosition = this._pathToCurrentTarget[this._pathToCurrentTarget.length-1];
						this._pathToCurrentTarget = [];
						this.locate(targetPosition.x, targetPosition.y);
						if(followMove){
							$gamePlayer.locate(targetPosition.x, targetPosition.y);
						}
						
					}		
					$gamePlayer.clearFollowSpeed();
					$gamePlayer.followedEvent = null;
					this._targetPosition = null;
					this._pathToCurrentTarget = null;
					this._pendingMoveToPoint = false;
					$gameTemp.followMove = false;
					$gameSystem.setSrpgWaitMoving(false);
					$statCalc.invalidateAbilityCache();		
				} else {				
					this.setMoveSpeed(6);
					if(followMove){
						$gamePlayer.setFollowSpeed(6);
					}
					var nextPosition = this._pathToCurrentTarget.shift();
					if(nextPosition && (this._x != nextPosition.x || this._y != nextPosition.y)) {
						var deltaX = nextPosition.x - this._x;				
						var deltaY = nextPosition.y - this._y;
						if(deltaX != 0){
							if(Math.sign(deltaX) == 1){
								this.moveStraight(6); //right
								if(followMove){
									$gamePlayer.moveStraight(6);
								}
							} else {
								this.moveStraight(4); //left
								if(followMove){
									$gamePlayer.moveStraight(4);
								}
							}
						}
						if(deltaY != 0){
							if(Math.sign(deltaY) == 1){
								this.moveStraight(2); //down
								if(followMove){
									$gamePlayer.moveStraight(2);
								}
							} else {
								this.moveStraight(8); //up
								if(followMove){
									$gamePlayer.moveStraight(8);
								}
							}
						}					
					} else {
						$gamePlayer.clearFollowSpeed();
						this._targetPosition = null;
						this._pathToCurrentTarget = null;
						this._pendingMoveToPoint = false;
						$gameTemp.followMove = false;
						$gamePlayer.followedEvent = null;
						$gameSystem.setSrpgWaitMoving(false);
						$statCalc.invalidateAbilityCache();
					}	
				}
			}
		} else {
            _SRPG_Game_Event_updateStop.call(this);
        }
    };
	
	Game_Event.prototype.event = function() {
		if(!$dataMap.events[this._eventId]){
			return JSON.parse('{"id":1,"name":"ACTOR_0","note":"<type:actor>","pages":[{"conditions":{"actorId":1,"actorValid":false,"itemId":1,"itemValid":false,"selfSwitchCh":"A","selfSwitchValid":false,"switch1Id":1,"switch1Valid":false,"switch2Id":1,"switch2Valid":false,"variableId":1,"variableValid":false,"variableValue":0},"directionFix":false,"image":{"tileId":0,"characterName":"","direction":2,"pattern":0,"characterIndex":0},"list":[{"code":0,"indent":0,"parameters":[]}],"moveFrequency":3,"moveRoute":{"list":[{"code":0,"parameters":[]}],"repeat":true,"skippable":false,"wait":false},"moveSpeed":3,"moveType":0,"priorityType":0,"stepAnime":false,"through":false,"trigger":0,"walkAnime":true}],"x":17,"y":7,"meta":{"type":"actor"}}');
		}
		return $dataMap.events[this._eventId];
	};

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
// ●Game_Interpreter
//====================================================================
// イベントＩＤをもとに、ユニット間の距離をとる

Game_Interpreter.prototype.initialize = function(depth) {
    this._depth = depth || 0;
    this.checkOverflow();
    this.clear();
    this._branch = {};
    this._params = [];
    this._indent = 0;
    this._frameCount = 0;
    this._freezeChecker = 0;
	
	this._lastFadeState = -1;
	this._haltingCommands = {
		
	};
};

Game_Interpreter.prototype.isHaltingCommand = function(command) {
	if(command.code == 355){ // script call
		//loose checking for halting custom commands 
		var haltingScriptCommands = [
			"showStageConditions",
			"showEnemyPhaseText",
			"awardSRPoint",
			"showMapAttackText",
			"destroyEvent",
			"destroyEvents",
			"applyActorSpirits",
			"applyEventSpirits",
			"processEnemyAppearQueue",
			"processUnitAppearQueue",
			"processDisappearQueue",
			"manualDeploy",
			"manualShipDeploy",
			"playBattleScene",			
		];
		
		var hasHalting = false;
		haltingScriptCommands.forEach(function(entry){
			var re = new RegExp(".*"+entry+".*","g");
			if(command.parameters[0].match(re)){
				hasHalting = true;
			}
		});
		return hasHalting;
	}
	
	if(command.code == 356){ // plugin command
		var haltingPluginCommands = {
			"stopSkipping": true,
			"Intermission": true
		}
		var args = command.parameters[0].split(" ");
		var entry = args.shift();
		return !!haltingPluginCommands[entry];
	}
	
	return !!this._haltingCommands[command.code];
}

// Script
Game_Interpreter.prototype.command355 = function() {
    var script = this.currentCommand().parameters[0] + '\n';
    while (this.nextEventCode() === 655) {
        this._index++;
        script += this.currentCommand().parameters[0] + '\n';
    }
    var result = eval(script);
	if(result == null){
		return true;
	} else {
		return result;
	}
};

Game_Interpreter.prototype.EventDistance = function(variableId, eventId1, eventId2) {
    var event1 = $gameMap.event(eventId1);
    var event2 = $gameMap.event(eventId2);
    if (event1 && event2 && !event1.isErased() && !event2.isErased()) {
        var value = $gameSystem.unitDistance(event1, event2);
        $gameVariables.setValue(variableId, value);
    } else {
        $gameVariables.setValue(variableId, 999);
    }
    return true;
};

// アクターＩＤをもとに、ユニット間の距離をとる
Game_Interpreter.prototype.ActorDistance = function(variableId, actorId1, actorId2) {
    var eventId1 = $gameSystem.ActorToEvent(actorId1);
    var eventId2 = $gameSystem.ActorToEvent(actorId2);
    this.EventDistance(variableId, eventId1, eventId2);
    return true;
};

// 特定のＩＤのイベントと全アクターの中で最短の距離をとる
Game_Interpreter.prototype.fromActorMinimumDistance = function(variableId, eventId) {
    var minDistance = 999;
    var event1 = $gameMap.event(eventId);
    $gameMap.events().forEach(function(event) {
        if (event.isType() === 'actor' || event.isType() === 'ship' || event.isType() === 'ship_event') {
            var event2 = $gameMap.event(event.eventId());
            if (event1 && event2 && !event1.isErased() && !event2.isErased()) {
                var value = $gameSystem.unitDistance(event1, event2);
                if (value < minDistance) {
                    minDistance = value;
                }
            }
        }
    });
    $gameVariables.setValue(variableId, minDistance);
    return true;
};

// 新規アクターを追加する（増援）
Game_Interpreter.prototype.addActor = function(eventId, actorId) {
    var actor_unit = $gameActors.actor(actorId);
    var event = $gameMap.event(eventId);
    if (actor_unit && event) {
        $gameSystem.pushSrpgAllActors(event.eventId());
        actor_unit.initTp(); //TPを初期化
        var bitmap = ImageManager.loadFace(actor_unit.faceName()); //顔グラフィックをプリロードする
        var oldValue = $gameVariables.value(_existActorVarID);
        $gameVariables.setValue(_existActorVarID, oldValue + 1);
        $gameSystem.setEventToUnit(event.eventId(), 'actor', actor_unit.actorId());
        event.setType('actor');
        var xy = event.makeAppearPoint(event, event.posX(), event.posY());
        event.setPosition(xy[0], xy[1]);
        $gameMap.setEventImages();
    }
    return true;
};

Game_Interpreter.prototype.setMasteryText = function(text){
	$gameVariables.setValue(_masteryConditionText, text);
}

Game_Interpreter.prototype.setVictoryText = function(text){
	$gameVariables.setValue(_victoryConditionText, text);
}

Game_Interpreter.prototype.setDefeatText = function(text){
	$gameVariables.setValue(_defeatConditionText, text);
}

Game_Interpreter.prototype.showStageConditions = function(){
	if (!$gameMessage.isBusy()) {
		$gameMessage.setFaceImage("", "");
		$gameMessage.setBackground(0);
        $gameMessage.setPositionType(1);
		$gameMessage.add(APPSTRINGS.GENERAL.label_victory_condition + ": "+($gameVariables.value(_victoryConditionText) || ""));
		$gameMessage.add(APPSTRINGS.GENERAL.label_defeat_condition + ": "+($gameVariables.value(_defeatConditionText) || ""));
		var masteryText = $gameVariables.value(_masteryConditionText);
		if($SRWSaveManager.isMapSRPointLocked($gameMap.mapId())){
			masteryText = APPSTRINGS.GENERAL.label_mastery_locked;
		}
		$gameMessage.add(APPSTRINGS.GENERAL.label_mastery_condition + ": "+(masteryText || ""));
		
		this._index++;
        this.setWaitMode('message');
	}
	return false;
}

Game_Interpreter.prototype.showEnemyPhaseText = function(){
	if (!$gameMessage.isBusy()) {
		$gameMessage.setFaceImage("", "");
		$gameMessage.setBackground(1);
        $gameMessage.setPositionType(1);
		var text;
		if($gameSystem.isEnemyPhase()){
			text =  APPSTRINGS.GENERAL.label_enemy_phase;
		} else {
			text =  APPSTRINGS.GENERAL.label_ally_phase;
		}
		var colorId;
		if($gameTemp.currentFaction == 0){
			colorId = 18;
		}
		if($gameTemp.currentFaction == 1){
			colorId = 3;
		}
		if($gameTemp.currentFaction == 2){
			colorId = 14;
		}
		$gameMessage.add("\\TA[1]\n\\>\\C["+colorId+"]\\{"+text+"\n\\.\\.\\^");	//\\|			
		this._index++;
        this.setWaitMode('message');
	}
	return false;
}

Game_Interpreter.prototype.awardSRPoint = function(){	
	var mapId = $gameMap.mapId();
	var isNewlyAwarded = $SRWSaveManager.awardMapSRPoint(mapId);	
	if(isNewlyAwarded){
		if(ENGINE_SETTINGS.MASTERY_REWARDS){
			if(ENGINE_SETTINGS.MASTERY_REWARDS.PP){
				var scope = ENGINE_SETTINGS.MASTERY_REWARDS.PP.SCOPE;
				var actors = [];
				if(scope == "deployed"){
					actors = $statCalc.getAllActors("actor");
				} else if(scope == "unlocked"){
					actors = $gameParty.allMembers();
				} else if(scope == "all"){
					for(var i = 0; i < $dataActors.length; i++){
						var actor = $gameActors.actor(i);
						actors.push(actor);
					}
				}	
				actors.forEach(function(actor){
					if(actor && actor.isActor()){
						$statCalc.addPP(actor, ENGINE_SETTINGS.MASTERY_REWARDS.PP.AMOUNT);	
					}					
				});
			}
			if(ENGINE_SETTINGS.MASTERY_REWARDS.FUNDS){
				$gameParty.gainGold(ENGINE_SETTINGS.MASTERY_REWARDS.FUNDS);	
			}
		}		
		
		var se = {};
		se.name = 'SRWMastery';
		se.pan = 0;
		se.pitch = 100;
		se.volume = 80;
		AudioManager.playSe(se);
		$gameVariables.setValue(_masteryConditionText, APPSTRINGS.GENERAL.label_mastery_completed);	
		
		if (!$gameMessage.isBusy()) {
			$gameMessage.setFaceImage("", "");
			$gameMessage.setBackground(1);
			$gameMessage.setPositionType(1);
			$gameMessage.add("\\TA[1]\n" + APPSTRINGS.GENERAL.label_mastery_completed_message);				
			this._index++;
			this.setWaitMode('message');
		}
		
		return false;
	}
	return true;
}

Game_Interpreter.prototype.showMapAttackText = function(faceName, faceIdx, text){
	if (!$gameMessage.isBusy()) {
		$gameMessage.setFaceImage(faceName, faceIdx);
        $gameMessage.setPositionType(2);
		$gameMessage.setBackground(0);
		$gameMessage.add(text);				
		this._index++;
        this.setWaitMode('message');
	}
	return false;
}

Game_Interpreter.prototype.isActorDestructionQueued  = function(id){
	var result = false;
	if($gameTemp.deathQueue && $gameTemp.deathQueue.length){
		$gameTemp.deathQueue.forEach(function(queuedDeath){
			if(queuedDeath.actor.isActor() && queuedDeath.actor.actorId() == id && (!$gameTemp.preventedDeathQuotes || !$gameTemp.preventedDeathQuotes[id])){
				result = true;
			}
		});
	}
	return result;
}

Game_Interpreter.prototype.isEnemyDestructionQueued  = function(id){
	var result = false;
	if($gameTemp.deathQueue && $gameTemp.deathQueue.length){
		$gameTemp.deathQueue.forEach(function(queuedDeath){
			if(!queuedDeath.actor.isActor() && queuedDeath.actor.enemyId() == id){
				result = true;
			}
		});
	}
	return result;
}

Game_Interpreter.prototype.isEventDestructionQueued  = function(id){
	var result = false;
	if($gameTemp.deathQueue && $gameTemp.deathQueue.length){
		$gameTemp.deathQueue.forEach(function(queuedDeath){
			if(!queuedDeath.actor.isActor() && queuedDeath.actor.event.eventId() == id){
				result = true;
			}
		});
	}
	return result;
}

Game_Interpreter.prototype.isActorBelowHP  = function(id, hp){
	return $statCalc.isActorBelowHP(id, hp);
}

Game_Interpreter.prototype.isEnemyBelowHP  = function(id, hp){
	return $statCalc.isEnemyBelowHP(id, hp);
}

Game_Interpreter.prototype.isEventBelowHP  = function(id, hp){
	return $statCalc.isEventBelowHP(id, hp);
}

Game_Interpreter.prototype.cancelActorDestruction  = function(id){
	var tmp = [];
	if($gameTemp.deathQueue && $gameTemp.deathQueue.length){		
		$gameTemp.deathQueue.forEach(function(queuedDeath){
			if(!queuedDeath.actor.isActor() || queuedDeath.actor.actorId() != id){
				tmp.push(queuedDeath);
			}
		});
		$gameTemp.deathQueue = tmp;
	}
}

Game_Interpreter.prototype.cancelEnemyDestruction  = function(id){
	var tmp = [];
	if($gameTemp.deathQueue && $gameTemp.deathQueue.length){		
		$gameTemp.deathQueue.forEach(function(queuedDeath){
			if(queuedDeath.actor.isActor() || queuedDeath.actor.enemyId() != id){
				tmp.push(queuedDeath);
			}
		});
		$gameTemp.deathQueue = tmp;
	}
}

Game_Interpreter.prototype.cancelEventDestruction  = function(id){
	var tmp = [];
	if($gameTemp.deathQueue && $gameTemp.deathQueue.length){		
		$gameTemp.deathQueue.forEach(function(queuedDeath){
			if(!queuedDeath.actor.event && queuedDeath.actor.event.eventId() != id){
				tmp.push(queuedDeath);
			}
		});
		$gameTemp.deathQueue = tmp;
	}
}

Game_Interpreter.prototype.addEnemiesFromObj = function(params) {
	for(var i = startId; i <= endId; i++){
		this.addEnemy(
			params.toAnimQueue, 
			i, 
			params.enemyId, 
			params.mechClass, 
			params.level, 
			params.mode, 
			params.targetId, 
			params.items, 
			params.squadId, 
			params.targetRegion,
			params.factionId
		);
	}
}

Game_Interpreter.prototype.addEnemies = function(toAnimQueue, startId, endId, enemyId, mechClass, level, mode, targetId, items, squadId, targetRegion, factionId) {
	for(var i = startId; i <= endId; i++){
		this.addEnemy(toAnimQueue, i, enemyId, mechClass, level, mode, targetId, items, squadId, targetRegion, factionId);
	}
}

Game_Interpreter.prototype.addEnemyFromObj = function(params){
	this.addEnemy(
		params.toAnimQueue, 
		params.eventId, 
		params.enemyId, 
		params.mechClass, 
		params.level, 
		params.mode, 
		params.targetId, 
		params.items, 
		params.squadId, 
		params.targetRegion,
		params.factionId,
		params.counterBehavior
	);
}

// 新規エネミーを追加する（増援）
Game_Interpreter.prototype.addEnemy = function(toAnimQueue, eventId, enemyId, mechClass, level, mode, targetId, items, squadId, targetRegion, factionId, counterBehavior, attackBehavior) {
    var enemy_unit = new Game_Enemy(enemyId, 0, 0);
    var event = $gameMap.event(eventId);
	if(typeof squadId == "undefined" || squadId == ""){
		squadId = -1;
	}
	if(typeof targetRegion == "undefined"|| targetRegion == ""){
		targetRegion = -1;
	}
	if(typeof factionId == "undefined"|| factionId == ""){
		factionId = 0;
	}
    if (enemy_unit && event) { 	
		enemy_unit._mechClass = mechClass;	
		enemy_unit.squadId = squadId;	
		enemy_unit.targetRegion = targetRegion;	
		enemy_unit.factionId = factionId;	
		enemy_unit.targetUnitId = targetId || "";
		enemy_unit.counterBehavior = counterBehavior || "attack";
		enemy_unit.attackBehavior = attackBehavior || "attack";
		if (enemy_unit) {
			enemy_unit.event = event;
			if (mode) {
				enemy_unit.setBattleMode(mode);
			}
			enemy_unit.initTp(); //TPを初期化
			var faceName = enemy_unit.enemy().meta.faceName; //顔グラフィックをプリロードする
			if (faceName) {
				var bitmap = ImageManager.loadFace(faceName);
			} else {
				if ($gameSystem.isSideView()) {
					var bitmap = ImageManager.loadSvEnemy(enemy_unit.battlerName(), enemy_unit.battlerHue());
				} else {
					var bitmap = ImageManager.loadEnemy(enemy_unit.battlerName(), enemy_unit.battlerHue());
				}
			}
			var oldValue = $gameVariables.value(_existEnemyVarID);
			$gameVariables.setValue(_existEnemyVarID, oldValue + 1);
			$gameSystem.setEventToUnit(event.eventId(), 'enemy', enemy_unit);
			$statCalc.initSRWStats(enemy_unit, level, items);
			$statCalc.applyBattleStartWill(enemy_unit);
			$statCalc.updateFlightState(enemy_unit);
			
			event.setType('enemy');
			/*var xy = event.makeAppearPoint(event, event.posX(), event.posY())
			event.setPosition(xy[0], xy[1]);	*/
			var position = $statCalc.getAdjacentFreeSpace({x: event.posX(), y: event.posY()}, null, event.eventId());
			event.locate(position.x, position.y);
			if(!$gameTemp.enemyAppearQueue){
				$gameTemp.enemyAppearQueue = [];
			}	
			if(toAnimQueue){				
				event.erase();
				$gameTemp.enemyAppearQueue.push(event);
			} else {
				$gameMap.setEventImages();
			}
		}
    }
	$statCalc.invalidateAbilityCache();
    return true;
};

Game_Interpreter.prototype.addSubTwinEnemy = function(eventId, enemyId, mechClass, level, mode, targetId, items, squadId, targetRegion, factionId, counterBehavior) {
	var enemy_unit = new Game_Enemy(enemyId, 0, 0);
    var event = $gameMap.event(eventId);
	if(typeof squadId == "undefined" || squadId == ""){
		squadId = -1;
	}
	if(typeof targetRegion == "undefined"|| targetRegion == ""){
		targetRegion = -1;
	}
	if(typeof factionId == "undefined"|| factionId == ""){
		factionId = 0;
	}
    if (enemy_unit && event) { 	
		var mainEnemy = $gameSystem.EventToUnit(eventId)[1];
		
		enemy_unit._mechClass = mechClass;	
		enemy_unit.squadId = squadId;	
		enemy_unit.targetRegion = targetRegion;	
		enemy_unit.factionId = factionId;	
		enemy_unit.targetUnitId = targetId || "";
		enemy_unit.counterBehavior = counterBehavior || "attack";
		if (enemy_unit) {
			
			if (mode) {
				enemy_unit.setBattleMode(mode);
			}
			enemy_unit.initTp(); //TPを初期化
			var faceName = enemy_unit.enemy().meta.faceName; //顔グラフィックをプリロードする
			if (faceName) {
				var bitmap = ImageManager.loadFace(faceName);
			} else {
				if ($gameSystem.isSideView()) {
					var bitmap = ImageManager.loadSvEnemy(enemy_unit.battlerName(), enemy_unit.battlerHue());
				} else {
					var bitmap = ImageManager.loadEnemy(enemy_unit.battlerName(), enemy_unit.battlerHue());
				}
			}
			var oldValue = $gameVariables.value(_existEnemyVarID);
			$gameVariables.setValue(_existEnemyVarID, oldValue + 1);			
			$statCalc.initSRWStats(enemy_unit, level, items);
			$statCalc.applyBattleStartWill(enemy_unit);
			
			enemy_unit.isSubTwin = true;			
			mainEnemy.subTwin = enemy_unit;
			mainEnemy.subTwinId = enemy_unit.enemyId();
		}
    }
	$statCalc.invalidateAbilityCache();
    return true;
}

Game_Interpreter.prototype.destroyEvents = function(startId, endId) {
	for(var i = startId; i <= endId; i++){
		this.destroyEvent(i);
	}
}

Game_Interpreter.prototype.destroyEvent = function(eventId) {
	$gameMap.event(eventId).isDoingDeathAnim = true;
	var actor = $gameSystem.EventToUnit(eventId)[1];
	if(actor.isActor()){
		var oldValue = $gameVariables.value(_existActorVarID);
		$gameVariables.setValue(_existActorVarID, oldValue - 1);
	} else {
		var oldValue = $gameVariables.value(_existEnemyVarID);
		$gameVariables.setValue(_existEnemyVarID, oldValue - 1);
	}
	
}

Game_Interpreter.prototype.eraseEventsOfType = function(type, omitted, toQueue) {
	var _this = this;
	var candidates = $statCalc.getAllCandidateActors(type);
	candidates.forEach(function(candidate){
		if(candidate.event){
			if(omitted.indexOf(candidate.event.eventId()) == -1){
				_this.eraseEvent(candidate.event.eventId(), toQueue);
			}
		}
	});
}

Game_Interpreter.prototype.eraseEvents = function(startId, endId, toQueue) {
	for(var i = startId; i <= endId; i++){
		this.eraseEvent(i, toQueue);
	}
}

Game_Interpreter.prototype.eraseEvent = function(eventId, toQueue) {
	var event = $gameMap.event(eventId);
	if(event){
		if(toQueue){
			if(!$gameTemp.disappearQueue){
				$gameTemp.disappearQueue = [];
			}
			$gameTemp.disappearQueue.push(event);
		} else {
			event.erase();
		}	
		event.manuallyErased = true;
		var actor = $gameSystem.EventToUnit(eventId)[1];
		if(actor.isActor()){
			var oldValue = $gameVariables.value(_existActorVarID);
			$gameVariables.setValue(_existActorVarID, oldValue - 1);
		} else {
			var oldValue = $gameVariables.value(_existEnemyVarID);
			$gameVariables.setValue(_existEnemyVarID, oldValue - 1);
		}
	}	
}

Game_Interpreter.prototype.updateWaitMode = function() {
    var waiting = false;
    switch (this._waitMode) {
    case 'message':
        waiting = $gameMessage.isBusy();
        break;
    case 'transfer':
        waiting = $gamePlayer.isTransferring();
        break;
    case 'scroll':
        waiting = $gameMap.isScrolling();
        break;
    case 'route':
        waiting = this._character.isMoveRouteForcing();
        break;
    case 'animation':
        waiting = this._character.isAnimationPlaying();
        break;
    case 'balloon':
        waiting = this._character.isBalloonPlaying();
        break;
    case 'gather':
        waiting = $gamePlayer.areFollowersGathering();
        break;
    case 'action':
        waiting = BattleManager.isActionForced();
        break;
    case 'video':
        waiting = Graphics.isVideoPlaying();
        break;
    case 'image':
        waiting = !ImageManager.isReady();
        break;
	case 'enemy_appear':
        waiting = $gameTemp.enemyAppearQueueIsProcessing || $gameTemp.disappearQueueIsProcessing;
        break;	
	case 'manual_deploy':
		waiting = $gameTemp.doingManualDeploy;
		break;	
	case 'move_to_point':
		waiting = $gameSystem.srpgWaitMoving();
		break;	
	case 'battle_demo':
		waiting = $gameTemp.playingBattleDemo;
		break;
	case 'spirit_activation':
		waiting = $gameTemp.playingSpiritAnimations;
		break;		
    }
	
    if (!waiting) {
        this._waitMode = '';
    }
    return waiting;
};

Game_Interpreter.prototype.applyActorSpirits = function(actorId, spiritIds){
	this.applyEventSpirits($gameActors.actor(actorId).event.eventId(), spiritIds);
}

Game_Interpreter.prototype.applyEventSpirits = function(eventId, spiritIds){
	var spirits = [];
	var event = $gameMap.event(eventId);
	$gamePlayer.locate(event.posX(), event.posY());
	var actor = $gameSystem.EventToUnit(eventId)[1];
	spiritIds.forEach(function(spiritId){
		spirits.push({
			idx: spiritId,
			level: 1,
			cost: 0,
			caster: actor,
			target: actor
		});
	});
	$gameTemp.playingSpiritAnimations = true;
	this.setWaitMode("spirit_activation");
	$gameTemp.eventSpirits = spirits;
	$gameSystem.setSubBattlePhase("event_spirits");
	this._index++;
	return false;
}

Game_Interpreter.requestImages = function(list, commonList){
    if(!list) return;

    list.forEach(function(command){
        var params = command.parameters;
        switch(command.code){
            // Show Text
            case 101:
                ImageManager.requestFace(params[0]);
                break;

            // Common Event
            case 117:
                var commonEvent = $dataCommonEvents[params[0]];
                if (commonEvent) {
                    if (!commonList) {
                        commonList = [];
                    }
                    if (!commonList.contains(params[0])) {
                        commonList.push(params[0]);
                        Game_Interpreter.requestImages(commonEvent.list, commonList);
                    }
                }
                break;

            // Change Party Member
            case 129:
                var actor = $gameActors.actor(params[0]);
                if (actor && params[1] === 0) {
                    var name = actor.characterName();
                    ImageManager.requestCharacter(name);
                }
                break;

            // Set Movement Route
            case 205:
                if(params[1]){
                    params[1].list.forEach(function(command){
                        var params = command.parameters;
                        if(command.code === Game_Character.ROUTE_CHANGE_IMAGE){
                            ImageManager.requestCharacter(params[0]);
                        }
                    });
                }
                break;

            // Show Animation, Show Battle Animation
            case 212: case 337:
                if(params[1]) {
                    var animation = $dataAnimations[params[1]];
                    var name1 = animation.animation1Name;
                    var name2 = animation.animation2Name;
                    var hue1 = animation.animation1Hue;
                    var hue2 = animation.animation2Hue;
                    ImageManager.requestAnimation(name1, hue1);
                    ImageManager.requestAnimation(name2, hue2);
                }
                break;

            // Change Player Followers
            case 216:
                if (params[0] === 0) {
                    $gamePlayer.followers().forEach(function(follower) {
                        var name = follower.characterName();
                        ImageManager.requestCharacter(name);
                    });
                }
                break;

            // Show Picture
            case 231:
                ImageManager.loadPicture(params[1]); //make show picture awaitable by the interpreter
                break;

            // Change Tileset
            case 282:
                var tileset = $dataTilesets[params[0]];
                tileset.tilesetNames.forEach(function(tilesetName){
                    ImageManager.requestTileset(tilesetName);
                });
                break;

            // Change Battle Back
            case 283:
                if ($gameParty.inBattle()) {
                    ImageManager.requestBattleback1(params[0]);
                    ImageManager.requestBattleback2(params[1]);
                }
                break;

            // Change Parallax
            case 284:
                if (!$gameParty.inBattle()) {
                    ImageManager.requestParallax(params[0]);
                }
                break;

            // Change Actor Images
            case 322:
                ImageManager.requestCharacter(params[1]);
                ImageManager.requestFace(params[3]);
                ImageManager.requestSvActor(params[5]);
                break;

            // Change Vehicle Image
            case 323:
                var vehicle = $gameMap.vehicle(params[0]);
                if(vehicle){
                    ImageManager.requestCharacter(params[1]);
                }
                break;

            // Enemy Transform
            case 336:
                var enemy = $dataEnemies[params[1]];
                var name = enemy.battlerName;
                var hue = enemy.battlerHue;
                if ($gameSystem.isSideView()) {
                    ImageManager.requestSvEnemy(name, hue);
                } else {
                    ImageManager.requestEnemy(name, hue);
                }
                break;
        }
    });
};

Game_Interpreter.prototype.processEnemyAppearQueue = function(){
	this.setWaitMode("enemy_appear");
	$gameTemp.enemyAppearQueueIsProcessing = true;
	$gameTemp.unitAppearTimer = 0;
}

Game_Interpreter.prototype.processUnitAppearQueue = function(){
	this.setWaitMode("enemy_appear");
	$gameTemp.enemyAppearQueueIsProcessing = true;
	$gameTemp.unitAppearTimer = 0;
}

Game_Interpreter.prototype.processDisappearQueue = function(){
	this.setWaitMode("enemy_appear");
	$gameTemp.disappearQueueIsProcessing = true;
	$gameTemp.unitAppearTimer = 0;
}

Game_Interpreter.prototype.manualDeploy = function(unlockedOnly){
	this.setWaitMode("manual_deploy");
	$gameTemp.deployMode = "";
	$gameTemp.manualDeployType = unlockedOnly ? "unlocked" : "all";
	$gameTemp.doingManualDeploy = true;
	$gameTemp.disableHighlightGlow = true;
	$gameSystem.setSubBattlePhase("deploy_selection_window");
	$gameTemp.pushMenu = "in_stage_deploy";
	$gameTemp.originalDeployInfo = JSON.parse(JSON.stringify($gameSystem.getDeployList()));
}

Game_Interpreter.prototype.manualShipDeploy = function(){
	this.setWaitMode("manual_deploy");
	$gameTemp.deployMode = "ships";
	$gameTemp.doingManualDeploy = true;
	$gameTemp.disableHighlightGlow = true;
	$gameSystem.setSubBattlePhase("deploy_selection_window");
	$gameTemp.pushMenu = "in_stage_deploy";
	$gameTemp.originalDeployInfo = JSON.parse(JSON.stringify($gameSystem.getDeployList()));
}

// 指定した座標にプレイヤーを移動する
Game_Interpreter.prototype.playerMoveTo = function(x, y) {
    $gameTemp.setAutoMoveDestinationValid(true);
    $gameTemp.setAutoMoveDestination(x, y);
    return true;
};

Game_Interpreter.prototype.cursorMoveTo = function(x, y) {
	$gamePlayer.locate(x, y);
    return true;
};

Game_Interpreter.prototype.isActorInRegion = function(actorId, regionId) {
	return $statCalc.isActorInRegion(actorId, regionId);
}

Game_Interpreter.prototype.isEnemyInRegion = function(enemyId, regionId) {
	return $statCalc.isEnemyInRegion(enemyId, regionId);
}

Game_Interpreter.prototype.getActorKillCount = function(actorId) {
	return $statCalc.getKills($gameActors.actor(actorId));
}

Game_Interpreter.prototype.setBattleModes = function(startId, endId, mode) {
	for(var i = startId; i <= endId; i++){
		this.setBattleMode(i, mode);
	}
}

// 指定したイベントの戦闘モードを設定する
Game_Interpreter.prototype.setBattleMode = function(eventId, mode) {
    var battlerArray = $gameSystem.EventToUnit(eventId);
    if (battlerArray && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
        battlerArray[1].setBattleMode(mode, true);			
    }
	if(battlerArray[0] === 'enemy'){
		if(battlerArray[1].squadId != -1){
			this.setSquadMode(squadId, mode);
		}
	}	
    return true;
};

Game_Interpreter.prototype.setTargetRegion = function(eventId, targetRegion) {
    var battlerArray = $gameSystem.EventToUnit(eventId);
    if (battlerArray && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
        battlerArray[1].targetRegion = targetRegion;				
    }
	
    return true;
};

Game_Interpreter.prototype.setActorTargetRegion = function(actorId, targetRegion) {	
	return this.setTargetRegion($gameActors.actor(actorId).event.eventId(), targetRegion);
};

// 指定したイベントの戦闘モードを設定する
Game_Interpreter.prototype.setActorBattleMode = function(actorId, mode) {  
    $gameActors.actor(actorId).setBattleMode(mode, true);		
    return true;
};

Game_Interpreter.prototype.setSquadMode = function(squadId, mode) {
	$gameMap.events().forEach(function(event) {
		if (event.isType() === 'enemy') {
			var enemy = $gameSystem.EventToUnit(event.eventId())[1];	
			if(enemy.squadId == squadId){
				enemy.setBattleMode(mode, true);
			}	
		}
	});
}

Game_Interpreter.prototype.isDeployed = function(actorId) {
	var isDeployed = false;
	$gameMap.events().forEach(function(event) {
		if (event.isType() === 'actor') {
			var battlerArray = $gameSystem.EventToUnit(event.eventId());
			if(battlerArray){
				var actor = battlerArray[1];
				if(actor.actorId() == actorId){
					isDeployed = true;
				}
			}				
		}
	});
	return isDeployed;
}

Game_Interpreter.prototype.isSquadWiped = function(squadId) {
	var isWiped = true;
	$gameMap.events().forEach(function(event) {
		if (event.isType() === 'enemy') {
			var enemy = $gameSystem.EventToUnit(event.eventId())[1];	
			if(enemy.squadId == squadId && !event.isErased()){
				isWiped = false;
			}	
		}
	});
	return isWiped;
}

Game_Interpreter.prototype.canObtainSRPoint = function() {
	return !$SRWSaveManager.isMapSRPointLocked($gameMap.mapId());
}

Game_Interpreter.prototype.activeFaction = function() {
	return $gameTemp.currentFaction;
}

Game_Interpreter.prototype.lastActorAttack = function() {
	return $gameTemp.lastActorAttack;
}

Game_Interpreter.prototype.isActorHitBy = function(actorId, weaponId, includeSupport) {
	var result = false;
	if($gameTemp.unitHitInfo && $gameTemp.unitHitInfo.actor){
		if($gameTemp.unitHitInfo.actor[actorId] && $gameTemp.unitHitInfo.actor[actorId][weaponId]){
			var hitInfo = $gameTemp.unitHitInfo.actor[actorId][weaponId];
			if(includeSupport || !hitInfo.isSupport) {
				result = true;
			} 
		}
	}
	return result;
}

Game_Interpreter.prototype.isEnemyHitBy = function(enemyId, weaponId, includeSupport) {
	var result = false;
	if($gameTemp.unitHitInfo && $gameTemp.unitHitInfo.enemy){
		if($gameTemp.unitHitInfo.enemy[enemyId] && $gameTemp.unitHitInfo.enemy[enemyId][weaponId]){
			var hitInfo = $gameTemp.unitHitInfo.enemy[enemyId][weaponId];
			if(includeSupport || !hitInfo.isSupport) {
				result = true;
			} 
		}
	}
	return result;
}

Game_Interpreter.prototype.isEventHitBy = function(eventId, weaponId, includeSupport) {
	var result = false;
	if($gameTemp.unitHitInfo && $gameTemp.unitHitInfo.event){
		if($gameTemp.unitHitInfo.event[eventId] && $gameTemp.unitHitInfo.event[eventId][weaponId]){
			var hitInfo = $gameTemp.unitHitInfo.event[eventId][weaponId];
			if(includeSupport || !hitInfo.isSupport) {
				result = true;
			} 
		}
	}
	return result;
}

Game_Interpreter.prototype.isActorInBattle = function(actorId) {
	var result = false;
	if($gameTemp.currentBattleActor && $gameTemp.currentBattleActor.isActor()){
		if($gameTemp.currentBattleActor.actorId() == actorId){
			result = true;
		}		
		if($gameTemp.currentBattleActor.subTwin && $gameTemp.currentBattleActor.subTwin.actorId() == actorId){
			result = true;
		}
	}
	if($gameTemp.currentBattleEnemy && $gameTemp.currentBattleEnemy.isActor()){
		if($gameTemp.currentBattleEnemy.actorId() == actorId){
			result = true;
		}
		if($gameTemp.currentBattleEnemy.subTwin && $gameTemp.currentBattleEnemy.subTwin.actorId() == actorId){
			result = true;
		}
	}
	return result;
}

Game_Interpreter.prototype.isEnemyInBattle = function(enemyId) {
	var result = false;
	if($gameTemp.currentBattleActor && $gameTemp.currentBattleActor.isEnemy()){
		if($gameTemp.currentBattleActor.enemyId() == enemyId){
			result = true;
		}		
		if($gameTemp.currentBattleActor.subTwin && $gameTemp.currentBattleActor.subTwin.enemyId() == enemyId){
			result = true;
		}
	}
	if($gameTemp.currentBattleEnemy && $gameTemp.currentBattleEnemy.isEnemy()){
		if($gameTemp.currentBattleEnemy.enemyId() == enemyId){
			result = true;
		}
		if($gameTemp.currentBattleEnemy.subTwin && $gameTemp.currentBattleEnemy.subTwin.enemyId() == enemyId){
			result = true;
		}
	}
	return result;
}

Game_Interpreter.prototype.isEventInBattle = function(eventId) {
	var result = false;
	if($gameTemp.currentBattleActor && $gameTemp.currentBattleActor.event && $gameTemp.currentBattleActor.event.eventId() == eventId){
		result = true;
	}
	if($gameTemp.currentBattleEnemy && $gameTemp.currentBattleEnemy.event && $gameTemp.currentBattleEnemy.event.eventId() == eventId){
		result = true;
		
	}
	return result;
}

Game_Interpreter.prototype.applyFadeState = function() {
	if(this.isTextSkipMode){
		if(this._lastFadeState == 0){
			$gameScreen.startFadeOut(this.fadeSpeed());
			this.wait(this.fadeSpeed());
		} else {
			$gameScreen.startFadeIn(this.fadeSpeed());
			this.wait(this.fadeSpeed());
		}
	}
}

Game_Interpreter.prototype.executeCommand = function() {
    var command = this.currentCommand();
	
    if (command) {
		//Input.update();
		if(!this.isHaltingCommand(command) && Input.isPressed("ok") && Input.isPressed("menu")){
			if(!this.isTextSkipMode){
				$gameScreen.startFadeOut(this.fadeSpeed());
			}
			this.isTextSkipMode = true;		
			$gameTemp.isSkippingEvents = true;	
		}
		
		if(this.isHaltingCommand(command)){
			this.applyFadeState();
			this.isTextSkipMode = false;		
			$gameTemp.isSkippingEvents = false;	
		}
        this._params = command.parameters;
        this._indent = command.indent;
        var methodName = 'command' + command.code;
        if (typeof this[methodName] === 'function') {
            if (!this[methodName]()) {
                return false;
            }
        }
        this._index++;
    } else {
		this.applyFadeState();
		this.isTextSkipMode = false;		
		$gameTemp.isSkippingEvents = false;	
        this.terminate();
    }
    return true;
};

// Fadeout Screen
Game_Interpreter.prototype.command221 = function() {
    if (!$gameMessage.isBusy()) {
		this._lastFadeState = 0;
		if(!this.isTextSkipMode){
			$gameScreen.startFadeOut(this.fadeSpeed());
			this.wait(this.fadeSpeed());
		}
        this._index++;
    }
    return false;
};

// Fadein Screen
Game_Interpreter.prototype.command222 = function() {
    if (!$gameMessage.isBusy()) {
		this._lastFadeState = 1;
		if(!this.isTextSkipMode){
			$gameScreen.startFadeIn(this.fadeSpeed());
			this.wait(this.fadeSpeed());
		}
        this._index++;
    }
    return false;
};

//Wait
Game_Interpreter.prototype.command230 = function() {
	if(!this.isTextSkipMode){
		this.wait(this._params[0]);
	}
    return true;
};

// Show Animation
Game_Interpreter.prototype.command212 = function() {
    this._character = this.character(this._params[0]);
    if (this._character && !this.isTextSkipMode) {
        this._character.requestAnimation(this._params[1]);
        if (this._params[2]) {
            this.setWaitMode('animation');
        }
    }
    return true;
};

Game_Interpreter.prototype.command101 = function() {
    if (!$gameMessage.isBusy()) {
        $gameMessage.setFaceImage(this._params[0], this._params[1]);
        $gameMessage.setBackground(this._params[2]);
        $gameMessage.setPositionType(this._params[3]);
        while (this.nextEventCode() === 401) {  // Text data
            this._index++;
            $gameMessage.add(this.currentCommand().parameters[0]);
        }
        switch (this.nextEventCode()) {
        case 102:  // Show Choices
            this._index++;
            this.setupChoices(this.currentCommand().parameters);
			
			this.applyFadeState();
			this.isTextSkipMode = false;
			$gameTemp.isSkippingEvents = false;	
            break;
        case 103:  // Input Number
            this._index++;
            this.setupNumInput(this.currentCommand().parameters);
			
			this.applyFadeState();
			this.isTextSkipMode = false;
			$gameTemp.isSkippingEvents = false;	
            break;
        case 104:  // Select Item
            this._index++;
            this.setupItemChoice(this.currentCommand().parameters);
			
			this.applyFadeState();
			this.isTextSkipMode = false;
			$gameTemp.isSkippingEvents = false;	
            break;
		default: // Regular text 
			if(this.isTextSkipMode){
				$gameMessage.clear();
			}			
			break;
        }
        this._index++;
        this.setWaitMode('message');
    }
    return false;
};

/**************************************
Sample:
	this.playBattleScene({
		eventId: 0, // if included the matching event text will be used for the scene(see BattleText.conf.js).
		enemyFirst: 0, // if 0 the actor will move first, if 1 the enemy will move first. This also affects the supports. If 0, the actor support will be attacking otherwise defending. If 1, the enemy support will be attacking otherwise defending.
		songId: "Battle1", // the id of the song that should be played during the battle scene
		actor: {
			id: 1, // the id of the actor pilot
			action: "attack", // the action the actor will take: "attack", "defend", "evade". 
			weapon: 1, // the id of the attack the actor will use. Only used if the action is "attack".
			hits: 1, // if 0 the attack performed by this unit will miss, if 1 the attack will hit 
			startHP: 20, // the start HP of the actor in percent
			targetEndHP: 5, // the end HP of the target in percent
			posX: 0, // the x coordinate of the position on the map where this unit stands(optional)
			posY: 0, // the y coordinate of the position on the map where this unit stands(optional)
			referenceEventId: 21 // if provided posX, posY and startHP will be derived from this event instead
		},
		actorTwin: {
			id: 2, // the id of the actor pilot
			action: "attack", // the action the actor will take: "attack", "defend", "evade". 
			weapon: 3, // the id of the attack the actor will use. Only used if the action is "attack".
			hits: 1, // if 0 the attack performed by this unit will miss, if 1 the attack will hit 
			startHP: 20, // the start HP of the actor in percent
			targetEndHP: 5, // the end HP of the target in percent
			posX: 0, // the x coordinate of the position on the map where this unit stands(optional)
			posY: 0, // the y coordinate of the position on the map where this unit stands(optional)
			referenceEventId: 21 // if provided posX, posY and startHP will be derived from this event instead
		},
		actorSupport: { // ommit this section if there is no actor supporter
			id: 3, // the id of the actor pilot
			action: "attack", // the action the actor will take: "attack", "defend", "evade". 
			weapon: 5, // the id of the attack the actor will use. Only used if the action is "attack".
			hits: 1, // if 0 the attack performed by this unit will miss, if 1 the attack will hit 
			startHP: 100, // the start HP of the actor in percent
			targetEndHP: 0, // the end HP of the target in percent
		},
		enemy: {
			id: 1, // the id of the enemy pilot
			mechId: 10, // the id of the enemy mech
			weapon: 6, // the id of the attack the actor will use. Only used if the action is "attack".
			action: "attack", // the action the enemy will take: "attack", "defend", "evade". 
			hits: 1, // if 0 the attack performed by this unit will miss, if 1 the attack will hit 
			startHP: 80, // the start HP of the enemy in percent
			targetEndHP: 5, // the end HP of the target in percent
		},
		enemyTwin: {
			id: 1, // the id of the enemy pilot
			mechId: 10, // the id of the enemy mech
			weapon: 6, // the id of the attack the actor will use. Only used if the action is "attack".
			action: "attack", // the action the enemy will take: "attack", "defend", "evade". 
			hits: 1, // if 0 the attack performed by this unit will miss, if 1 the attack will hit 
			startHP: 80, // the start HP of the enemy in percent
			targetEndHP: 5, // the end HP of the target in percent
		},
		enemySupport: { // ommit this section if there is no enemy supporter
			id: 3, // the id of the enemy pilot
			mechId: 11,
			action: "defend", // the action the enemy will take: "attack", "defend", "evade". 
			hits: 1, // if 0 the attack performed by this unit will miss, if 1 the attack will hit 
			weapon: -1, // the id of the attack the actor will use. Only used if the action is "attack".
			startHP: 100, // the start HP of the enemy in percent
			targetEndHP: 0, // the end HP of the target in percent
		}			
	});

**************************************/
Game_Interpreter.prototype.prepareBattleSceneActor = function(params) {
	var actor = new Game_Actor(params.id, 0, 0);
	$statCalc.initSRWStats(actor);
	if(params.mechId){
		actor._mechClass = params.mechId;	
		$statCalc.initSRWStats(actor);
	}
	params.unit = actor;
	actor.event = {
		eventId: function(){return 1;}, 
		posX: function(){return params.posX || 0},
		posY: function(){return params.posY || 0},
	};
	
	return {actor: actor, action: this.prepareBattleSceneAction(params), params: params};
}

Game_Interpreter.prototype.prepareBattleSceneSupportActor = function(params) {
	var actor = new Game_Actor(params.id, 0, 0);
	$statCalc.initSRWStats(actor);
	if(params.mechId){
		actor._mechClass = params.mechId;	
		$statCalc.initSRWStats(actor);
	}
	params.unit = actor;
	actor.event = {
		eventId: function(){return 3;},
		posX: function(){return params.posX || 0},
		posY: function(){return params.posY || 0},
	};
	
	return {actor: actor, action: this.prepareBattleSceneAction(params), params: params};
}

Game_Interpreter.prototype.prepareBattleSceneActorTwin = function(params) {
	var actor = new Game_Actor(params.id, 0, 0);
	$statCalc.initSRWStats(actor);
	actor.isEventSubTwin = true;
	actor.isSubTwin = true;
	if(params.mechId){
		actor._mechClass = params.mechId;	
		$statCalc.initSRWStats(actor);
	}
	params.unit = actor;
	actor.event = {
		eventId: function(){return 5;},
		posX: function(){return params.posX || 0},
		posY: function(){return params.posY || 0},
	};
	
	return {actor: actor, action: this.prepareBattleSceneAction(params), params: params};
}

Game_Interpreter.prototype.prepareBattleSceneEnemy = function(params) {
	var enemy = new Game_Enemy(params.id, 0, 0);
	$statCalc.initSRWStats(enemy);
	params.unit = enemy;
	enemy._mechClass = params.mechId;	
	$statCalc.initSRWStats(enemy);
	enemy.event = {
		eventId: function(){return 2;},
		posX: function(){return params.posX || 0},
		posY: function(){return params.posY || 0},
	};
	return {actor: enemy, action: this.prepareBattleSceneAction(params), params: params};
}

Game_Interpreter.prototype.prepareBattleSceneSupportEnemy = function(params) {
	var enemy = new Game_Enemy(params.id, 0, 0);
	$statCalc.initSRWStats(enemy);
	params.unit = enemy;
	enemy._mechClass = params.mechId;	
	$statCalc.initSRWStats(enemy);
	enemy.event = {
		eventId: function(){return 4;},
		posX: function(){return params.posX || 0},
		posY: function(){return params.posY || 0},
	};
	return {actor: enemy, action: this.prepareBattleSceneAction(params), params: params};
}

Game_Interpreter.prototype.prepareBattleSceneEnemyTwin = function(params) {
	var enemy = new Game_Enemy(params.id, 0, 0);
	$statCalc.initSRWStats(enemy);
	enemy.isEventSubTwin = true;
	enemy.isSubTwin = true;
	params.unit = enemy;
	enemy._mechClass = params.mechId;	
	$statCalc.initSRWStats(enemy);
	enemy.event = {
		eventId: function(){return 6;},
		posX: function(){return params.posX || 0},
		posY: function(){return params.posY || 0},
	};
	return {actor: enemy, action: this.prepareBattleSceneAction(params), params: params};
}

Game_Interpreter.prototype.prepareBattleSceneAction = function(params) {
	var unit = params.unit;
	
	var weapon;
	if(typeof params.weapon == "object"){
		weapon = params.weapon;
	} else {
		weapon = $statCalc.getActorMechWeapon(unit, params.weapon)
	}
	
	var action;
	if(params.action == "attack"){		
		action = {
			type: "attack",
			attack: weapon,
			target: 0
		}
	}
	if(params.action == "defend"){		
		action = {
			type: "defend",
			attack: -1,
			target: 0
		}
	}
	if(params.action == "evade"){		
		action = {
			type: "evade",
			attack: -1,
			target: 0
		}
	}
	return action;
}

Game_Interpreter.prototype.setBattleSceneHP = function(actor, params) {
	if(actor && params){
		var mechStats = $statCalc.getCalculatedMechStats(actor);
		mechStats.currentHP = Math.floor(mechStats.maxHP * (params.startHP / 100));
	}	
}

Game_Interpreter.prototype.playBattleScene = function(params) {
	this.setWaitMode("battle_demo");
	$gameTemp.playingBattleDemo = true;
	$gameTemp.battleEffectCache = {};
	
	var actorInfo = this.prepareBattleSceneActor(params.actor);
	var enemyInfo = this.prepareBattleSceneEnemy(params.enemy);
		
	var actorTwinInfo;
	if(params.actorTwin){
		actorTwinInfo = this.prepareBattleSceneActorTwin(params.actorTwin);
	}
	
	var enemyTwinInfo;
	if(params.enemyTwin){
		enemyTwinInfo = this.prepareBattleSceneEnemyTwin(params.enemyTwin);
	}
	
	var actor = actorInfo.actor;
	var enemy = enemyInfo.actor;
	
	var attacker;
	var attackerTwin;
	var defender;
	var defenderTwin;
	var attackerSide;
	var defenderSide;
	if(params.enemyFirst){
		attackerSide = "enemy";
		defenderSide = "actor";
		attacker = enemyInfo;
		defender = actorInfo;
		attackerTwin = enemyTwinInfo;
		defenderTwin = actorTwinInfo;
	} else {
		attackerSide = "actor";
		defenderSide = "enemy";
		attacker = actorInfo;
		defender = enemyInfo;
		attackerTwin = actorTwinInfo;
		defenderTwin = enemyTwinInfo;
	}
	
	$battleCalc.prepareBattleCache(attacker, "initiator");
	$battleCalc.prepareBattleCache(defender, "defender");
	
	if(attackerTwin){
		$battleCalc.prepareBattleCache(attackerTwin, "twin attack");
	}
	
	if(defenderTwin){
		$battleCalc.prepareBattleCache(defenderTwin, "twin defend");
	}
		
	
	var actorCacheEntry = $gameTemp.battleEffectCache[actor._cacheReference];
	var enemyCacheEntry = $gameTemp.battleEffectCache[enemy._cacheReference];
	
	var supportAttacker;
	var supportDefender;
	
	var actorSupportInfo;	
	if(params.actorSupport){
		actorSupportInfo = this.prepareBattleSceneSupportActor(params.actorSupport);		
	}
	var actorSupport;
	var actorSupportCacheEntry;
	if(actorSupportInfo){
		actorSupport = actorSupportInfo.actor;
		if(params.enemyFirst){
			supportDefender = actorSupportInfo;
			$battleCalc.prepareBattleCache(actorSupportInfo, "support defend");
		} else {
			supportAttacker = actorSupportInfo;
			$battleCalc.prepareBattleCache(actorSupportInfo, "support attack");
		}	
		actorSupportCacheEntry = $gameTemp.battleEffectCache[actorSupport._cacheReference];	
	}
	
	var enemySupportInfo;	
	if(params.enemySupport){
		enemySupportInfo = this.prepareBattleSceneSupportEnemy(params.enemySupport);		
	}
	var enemySupport;
	var enemySupportCacheEntry;
	if(enemySupportInfo){
		enemySupport = enemySupportInfo.actor;
		if(params.enemyFirst){
			supportAttacker = enemySupportInfo;
			$battleCalc.prepareBattleCache(enemySupportInfo, "support attack");
		} else {
			supportDefender = enemySupportInfo;
			$battleCalc.prepareBattleCache(enemySupportInfo, "support defend");
		}	
		enemySupportCacheEntry = $gameTemp.battleEffectCache[enemySupport._cacheReference];	
	}	
	
		
	this.setBattleSceneHP(actor, params.actor);
	this.setBattleSceneHP(enemy, params.enemy);
	this.setBattleSceneHP(actorSupport, params.actorSupport);
	this.setBattleSceneHP(enemySupport, params.enemySupport);

	function BattleAction(attacker, defender, supportDefender, side, isSupportAttack){
		this._attacker = attacker;
		this._defender = defender;
		this._supportDefender = supportDefender;
		this._side = side;
		this._isSupportAttack = isSupportAttack;
	}
	
	BattleAction.prototype.execute = function(orderIdx){
		var aCache = $gameTemp.battleEffectCache[this._attacker.actor._cacheReference];
		if(this._isSupportAttack){
			aCache =  $gameTemp.battleEffectCache[this._attacker.actor._supportCacheReference];
		}
		aCache.damageInflicted = 0;
		aCache.side = this._side;
		
			
		
		var defenders = [this._defender];
		if(this._attacker.action.attack && this._attacker.action.attack.isAll){
			if(this._side == "actor"){ 
				if(this._attacker.actor.isSubTwin && params.enemyTwin){
					defenders.push(enemyInfo);
				} else if(params.enemy){
					defenders.push(enemyTwinInfo);
				}				
			}
			if(this._side == "enemy"){				
				if(this._attacker.actor.isSubTwin && params.actorTwin){
					defenders.push(actorInfo);
				} else if(params.actor){
					defenders.push(actorTwinInfo);
				}
			}
		}
		
		for(var i = 0; i < defenders.length; i++){	
			var attackedRef = "";
			if(i == 1){
				attackedRef = "_all_sub";
			}
			var dCache = $gameTemp.battleEffectCache[defenders[i].actor._cacheReference];
			
			var activeDefender = this._defender;
			if(this._supportDefender) {
				var sCache = $gameTemp.battleEffectCache[this._supportDefender.actor._supportCacheReference];
				if(!sCache.hasActed){
					activeDefender = this._supportDefender;
					dCache = sCache;
					dCache.defended = defenders[i].actor;
				}
			}	
			
			dCache.damageTaken = 0;
			if(!aCache.isDestroyed && !dCache.isDestroyed){		
				aCache.actionOrder = orderIdx;
				aCache["attacked"+attackedRef] = dCache;
				aCache.originalTarget = dCache;
				aCache.hasActed = true;
				dCache.hasActed = true;
				
				if(this._side == "actor"){
					dCache.side = "enemy";
				} else {
					dCache.side = "actor";
				}
				
				var isHit = this._attacker.params.hits;
				if(isHit){
					aCache["hits"+attackedRef] = isHit;
					aCache.inflictedCritical = this._attacker.params.isCrit;
					dCache.isHit = isHit;
					dCache.tookCritical = this._attacker.params.isCrit;
					
					var mechStats = $statCalc.getCalculatedMechStats(activeDefender.actor);
					var damagePercent = activeDefender.params.startHP - this._attacker.params.targetEndHP;
					var damage = Math.floor(mechStats.maxHP * (damagePercent / 100));
					aCache["damageInflicted"+attackedRef] = damage;
					dCache.damageTaken+= damage;
					if(this._attacker.params.targetEndHP <= 0){
						dCache.isDestroyed = true;
						dCache.destroyer = aCache.ref;
					}
				} 
			}
		}
	}
	
	var currentTargetingSettings = {
		attacker: defender,
		attackerTwin: defenderTwin,
		defender: attacker,
		defenderTwin: attackerTwin
	};
	
	if(params.actor){
		var target;
		if(params.actor.target == "twin" && params.enemyTwin){
			target = "twin";
		} else {
			target = "main";
		}
		if(params.enemyFirst){
			if(target == "twin"){
				currentTargetingSettings.defender = attackerTwin;
			} else {
				currentTargetingSettings.defender = attacker;
			}			
		} else {
			if(target == "twin"){
				currentTargetingSettings.attacker = defenderTwin;
			} else {
				currentTargetingSettings.attacker = defender;
			}
		}
	} 
	
	if(params.actorTwin){
		var target;
		if(params.actorTwin.target == "twin" && params.enemyTwin){
			target = "twin";
		} else {
			target = "main";
		}
		if(params.enemyFirst){
			if(target == "twin"){
				currentTargetingSettings.defenderTwin = attackerTwin;
			} else {
				currentTargetingSettings.defenderTwin = attacker;
			}			
		} else {
			if(target == "twin"){
				currentTargetingSettings.attackerTwin = defenderTwin;
			} else {
				currentTargetingSettings.attackerTwin = defender;
			}
		}
	}
	
	if(params.enemy){
		var target;
		if(params.enemy.target == "twin" && params.actorTwin){
			target = "twin";
		} else {
			target = "main";
		}
		if(params.enemyFirst){
			if(target == "twin"){
				currentTargetingSettings.attacker = defenderTwin;
			} else {
				currentTargetingSettings.attacker = defender;
			}		
		} else {			
			if(target == "twin"){
				currentTargetingSettings.defender = attackerTwin;
			} else {
				currentTargetingSettings.defender = attacker;
			}
		}
	} 
	
	if(params.enemyTwin){
		var target;
		if(params.enemyTwin.target == "twin" && params.actorTwin){
			target = "twin";
		} else {
			target = "main";
		}
		if(params.enemyFirst){
			if(target == "twin"){
				currentTargetingSettings.attackerTwin = defenderTwin;
			} else {
				currentTargetingSettings.attackerTwin = defender;
			}		
		} else {			
			if(target == "twin"){
				currentTargetingSettings.defenderTwin = attackerTwin;
			} else {
				currentTargetingSettings.defenderTwin = attacker;
			}	
		}
	}
	
	
	
	var actions = [];
	if(!ENGINE_SETTINGS.USE_SRW_SUPPORT_ORDER && supportAttacker){			
		actions.push(new BattleAction(supportAttacker, currentTargetingSettings.attacker, supportDefender, attackerSide, true));								
	}	
	if(attackerTwin){
		actions.push(new BattleAction(attackerTwin, currentTargetingSettings.attackerTwin, supportDefender, attackerSide));	
	}
	actions.push(new BattleAction(attacker, currentTargetingSettings.attacker, supportDefender, attackerSide));	
	
	if(ENGINE_SETTINGS.USE_SRW_SUPPORT_ORDER && supportAttacker){			
		actions.push(new BattleAction(supportAttacker, currentTargetingSettings.attacker, supportDefender, attackerSide, true));								
	}	
	
	if(defenderTwin){
		actions.push(new BattleAction(defenderTwin, currentTargetingSettings.defenderTwin, supportDefender, defenderSide));	
	}
	actions.push(new BattleAction(defender, currentTargetingSettings.defender, null, defenderSide));			
	
	
	for(var i = 0; i < actions.length; i++){
		actions[i].execute(i);
	}
	if(params.eventId != null){
		$gameTemp.scriptedBattleDemoId = params.eventId;
	}
	
	$gameSystem.setSubBattlePhase('halt');
	//SceneManager.stop();	
	$battleSceneManager.playBattleScene();
	if(params.songId){
		$songManager.playSong(params.songId);
	}	
}

// 指定したイベントのターゲットＩＤを設定する（戦闘モードが'aimingEvent'または'aimingActor'でのみ機能する）
Game_Interpreter.prototype.setTargetId = function(eventId, targetId) {
    var battlerArray = $gameSystem.EventToUnit(eventId);
    if (battlerArray && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
        battlerArray[1].setTargetId(targetId);
    }
    return true;
};

// 指定したイベントが戦闘不能か指定したスイッチに返す
Game_Interpreter.prototype.isUnitDead = function(switchId, eventId) {
    $gameSwitches.setValue(switchId, false);
    var battlerArray = $gameSystem.EventToUnit(eventId);
    if (battlerArray && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
        $gameSwitches.setValue(switchId, battlerArray[1].isDead());
    }
    return true;
};

// 指定した座標のイベントＩＤを取得する
Game_Interpreter.prototype.isEventIdXy = function(variableId, x, y) {
    $gameVariables.setValue(variableId, 0);
    $gameMap.eventsXy(x, y).forEach(function(event) {
        var battlerArray = $gameSystem.EventToUnit(event.eventId());
        if (battlerArray && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
            $gameVariables.setValue(variableId, event.eventId());
        }
    });
    return true;
};

// 指定したイベントＩＤのユニットを全回復する
Game_Interpreter.prototype.unitRecoverAll = function(eventId) {
    var battlerArray = $gameSystem.EventToUnit(eventId);
    if (battlerArray && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
        if (battlerArray[1].isAlive()) {
            battlerArray[1].recoverAll();
        }
    }
    return true;
};

// 指定したイベントＩＤのユニットを復活する
Game_Interpreter.prototype.unitRevive = function(eventId) {
    var battlerArray = $gameSystem.EventToUnit(eventId);
    var event = $gameMap.event(eventId);
    if (battlerArray && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
        if (battlerArray[1].isAlive()) {
            return;
        }
        battlerArray[1].removeState(battlerArray[1].deathStateId());
        var oldValue = $gameVariables.value(_existEnemyVarID);
        $gameVariables.setValue(_existEnemyVarID, oldValue + 1);
        var xy = event.makeAppearPoint(event, event.posX(), event.posY())
        event.setPosition(xy[0], xy[1]);
        event.appear();
        $gameMap.setEventImages();
    }
};

// 指定したイベントＩＤのユニットを指定したステートにする
Game_Interpreter.prototype.unitAddState = function(eventId, stateId) {
    var battlerArray = $gameSystem.EventToUnit(eventId);
    var event = $gameMap.event(eventId);
    if (battlerArray && event && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
        var alreadyDead = battlerArray[1].isDead();
        battlerArray[1].addState(stateId);
        if (battlerArray[1].isDead() && !alreadyDead) {
            if (!event.isErased()) {
                event.erase();
                if (battlerArray[0] === 'actor') {
                    var oldValue = $gameVariables.value(_existActorVarID);
                    $gameVariables.setValue(_existActorVarID, oldValue - 1);
					
					var oldValue = $gameVariables.value(_actorsDestroyed);
                    $gameVariables.setValue(_actorsDestroyed, oldValue + 1);
		
                } else if (battlerArray[0] === 'enemy') {
                    var oldValue = $gameVariables.value(_existEnemyVarID);
                    $gameVariables.setValue(_existEnemyVarID, oldValue - 1);
					
					var oldValue = $gameVariables.value(_enemiesDestroyed);
                    $gameVariables.setValue(_enemiesDestroyed, oldValue + 1);
                }
            }
        }
        battlerArray[1].clearResult();
    }
    return true;
};

// ターン終了を行う（メニューの「ターン終了」と同じ）
    Game_Interpreter.prototype.turnEnd = function() {
        $gameTemp.setTurnEndFlag(true);
        return true;
    };

// プレイヤーの操作を受け付けるかの判定（操作できるサブフェーズか？）
    Game_Interpreter.prototype.isSubPhaseNormal = function(id) {
        if ($gameSystem.isBattlePhase() === 'actor_phase' && $gameSystem.isSubBattlePhase() === 'normal') {
            $gameSwitches.setValue(id, true);
        } else {
            $gameSwitches.setValue(id, false);
        }
        return true;
    };
	
	
	Game_Interpreter.prototype.runSubEvent = function(id) {
        $gameMap.events().forEach(function(event) {
            if (event.event().meta.function == id) {
				if (event.pageIndex() >= 0){
					$gameMap._interpreter.setupChild(event.list(), 0);
				}				
            }
        });
    };

//====================================================================
// ●Sprite_Actor
//====================================================================
    //アクタースプライトの基準位置
    var _SRPG_Sprite_Actor_setActorHome = Sprite_Actor.prototype.setActorHome;
    Sprite_Actor.prototype.setActorHome = function(index) {
        if ($gameSystem.isSRPGMode() == true) {
            this.setHome(Graphics.width - 216 - index * 240, Graphics.height / 2 + 48);
        } else {
            _SRPG_Sprite_Actor_setActorHome.call(this, index);
        }
    };

//====================================================================
// ●Sprite_Character
//====================================================================
	
	
	Game_CharacterBase.prototype.characterIndex = function() {
		var filename = this.characterName();
		var index = this._characterIndex;
		if($gameSystem.characterIdexAliases && $gameSystem.characterIdexAliases[filename]){
			 index = $gameSystem.characterIdexAliases[filename];
		}
		return index;
	};
	
	Game_CharacterBase.prototype.moveStraight = function(d) {
    this.setMovementSuccess(this.canPass(this._x, this._y, d));
    if (this.isMovementSucceeded()) {
        this.setDirection(d);
		this._prevX = this._x;
        this._prevY = this._y;
        this._x = $gameMap.roundXWithDirection(this._x, d);
        this._y = $gameMap.roundYWithDirection(this._y, d);
        this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(d));
        this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(d));
        this.increaseSteps();
    } else {
        this.setDirection(d);
        this.checkEventTriggerTouchFront(d);
    }
};
	
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
				
		
		
		/*
		if(this._upperBody && this._lowerBody){
			this._upperBody.x = this.x;
			this._upperBody.y = this.y;
			this._upperBody.z = this.z + 1;
			
			this._lowerBody.x = this.x;
			this._lowerBody.y = this.y + 24;
			this._lowerBody.z = this.z;
			
			this._turnEndSprite.x = this.x - 20;
			this._turnEndSprite.y = this.y - this._character._floatOffset;
			this._turnEndSprite.z = this.z + 2;
		}*/
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
						$gameSystem.isSubBattlePhase() == "post_move_command_window"
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
	
//====================================================================
// ●Spriteset_Map
//====================================================================	
	
SceneManager.reloadCharacters = function(startEvent){
	if(SceneManager._scene){
		SceneManager._scene.children[0].reloadCharacters(startEvent);
	}	
}
	
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


//====================================================================
// ●Window_MenuCommand
//====================================================================
    var _SRPG_Window_MenuCommand_makeCommandList = Window_MenuCommand.prototype.makeCommandList;
    Window_MenuCommand.prototype.makeCommandList = function() {       
          
       // _SRPG_Window_MenuCommand_makeCommandList.call(this);
	   
	   if($gameSystem.isSRPGMode()){
		   this.addTurnEndCommand();     
		   this.addCommand(APPSTRINGS.MAPMENU.cmd_search, 'search', true);
		   this.addCommand(APPSTRINGS.MAPMENU.cmd_list, 'unitList', true);
		   this.addCommand(APPSTRINGS.MAPMENU.cmd_conditions, 'conditions', true);
	   }
	   
	   this.addCommand(APPSTRINGS.MAPMENU.cmd_options, 'options');
	   this.addCommand(APPSTRINGS.MAPMENU.cmd_save, 'save');
	   this.addCommand(APPSTRINGS.MAPMENU.cmd_game_end, 'gameEnd');
    };

    Window_MenuCommand.prototype.addTurnEndCommand = function() {
        this.addCommand(APPSTRINGS.MAPMENU.cmd_end_turn, 'turnEnd', true);
    };

    var _SRPG_Window_MenuCommand_isFormationEnabled = Window_MenuCommand.prototype.isFormationEnabled;
    Window_MenuCommand.prototype.isFormationEnabled = function() {
        /*if ($gameSystem.isSRPGMode() == true) {
            return false;
        } else {
            return _SRPG_Window_MenuCommand_isFormationEnabled.call(this);
        }*/
		return false
    };

//====================================================================
// ●Scene_Base
//====================================================================
    //SRPG戦闘中は無効化する
    var _SRPG_Scene_Base_checkGameover = Scene_Base.prototype.checkGameover;
    Scene_Base.prototype.checkGameover = function() {
        if ($gameSystem.isSRPGMode() == false) {
            _SRPG_Scene_Base_checkGameover.call(this);
        }
    };

//====================================================================
// ●Scene_Map
//====================================================================
    // 初期化
    var _SRPG_SceneMap_initialize = Scene_Map.prototype.initialize;
    Scene_Map.prototype.initialize = function() {
        _SRPG_SceneMap_initialize.call(this);
        this._callSrpgBattle = false;
		//this._deathQueue = [];
		this.idToMenu = {};
		$gameTemp.menuStack = [];
    };

    // フェード速度を返す
    Scene_Map.prototype.fadeSpeed = function() {
        if ($gameSystem.isSRPGMode() == true && _srpgBattleQuickLaunch == 'true') {
           return 12;
        } else {
           return Scene_Base.prototype.fadeSpeed.call(this);
        }
    };

    //セーブファイルをロードした際に画像をプリロードする
    var _SRPG_Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _SRPG_Scene_Map_start.call(this);
        if ($gameTemp.isSrpgLoadFlag() == true) {
            $gameMap.events().forEach(function(event) {
                var battlerArray = $gameSystem.EventToUnit(event.eventId());
                if (battlerArray && battlerArray[0] === 'actor') {
                    var bitmap = ImageManager.loadFace(battlerArray[1].faceName());
                } else if (battlerArray && battlerArray[0] === 'enemy') {
                    var faceName = battlerArray[1].enemy().meta.faceName;
                    if (faceName) {
                        var bitmap = ImageManager.loadFace(faceName);
                    } else {
                        if ($gameSystem.isSideView()) {
                            var bitmap = ImageManager.loadSvEnemy(battlerArray[1].battlerName(), battlerArray[1].battlerHue());
                        } else {
                            var bitmap = ImageManager.loadEnemy(battlerArray[1].battlerName(), battlerArray[1].battlerHue());
                        }
                    }
                }
            });
            $gameTemp.setSrpgLoadFlag(false);
        }
    };
	
	Scene_Map.prototype.destroy = function() {
		
	}
	
	var Scene_Map_prototype_stop = Scene_Map.prototype.stop;
	Scene_Map.prototype.stop = function() {
		var _this = this;
		Scene_Map_prototype_stop.call(this);
		Object.keys(_this.idToMenu).forEach(function(id){
			_this.idToMenu[id].destroy();
		});
	}

    // マップのウィンドウ作成
    var _SRPG_SceneMap_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        _SRPG_SceneMap_createAllWindows.call(this);
        this.createSrpgActorCommandWindow();
        this.createHelpWindow();
        
		this.createAttackWindow();
		this.createSpiritWindow();
		
		this.createRewardsWindow();
		this.createLevelUpWindow();
		this.createUnitSummaryWindow();
		this.createTerrainDetailsWindow();
		this.createIntermissionWindow();
		this.createMechListWindow();
		this.createMechListDeployedWindow();
		this.createMechReassignSelectWindow();
		this.createPilotReassignSelectWindow();
		this.createUpgradeUnitSelectionWindow();
		this.createUpgradeMechWindow();
		this.createPilotListWindow();
		this.createPilotUpgradeSelectionWindow();
		this.createPilotUpgradeWindow();
		this.createItemEquipWindow();
		this.createItemEquipSelectionWindow();
		this.createMinimalBattleWindow();
		this.createSpiritAnimWindow();
		this.createDetailPagesWindow();
		this.createBeforeBattleWindow();
		this.createPauseWindow();
		this.createConditionsWindow();
		this.createItemWindow();
		this.createAbilityWindow();
		this.createTransformWindow();
		this.createDeploymentWindow();
		this.createEndTurnConfirmWindow();
		this.createDeploymentInStageWindow();
		this.createDeploySelectionWindow();
		this.createSearchWindow();
		this.createOptionsWindow();
		$battleSceneManager.init();	
    };
	
	Scene_Map.prototype.createPauseWindow = function() {
		
		this._commandWindow = new Window_MenuCommand(0, 0);
		this._commandWindow.setHandler('save',      this.commandSave.bind(this));
		this._commandWindow.setHandler('gameEnd',   this.commandGameEnd.bind(this));
		this._commandWindow.setHandler('options',   this.commandOptions.bind(this));
		this._commandWindow.setHandler('cancel',    this.closePauseMenu.bind(this));
		this._commandWindow.setHandler('turnEnd',this.commandTurnEnd.bind(this));    
		this._commandWindow.setHandler('unitList',this.commandUnitList.bind(this));   
		this._commandWindow.setHandler('search',this.commandSearch.bind(this));   		
		this._commandWindow.setHandler('conditions',this.commandConditions.bind(this)); 
		
		this._commandWindow.y = 100;
		this._commandWindow.x = 800;
		this.addWindow(this._commandWindow);	
		this._goldWindow = new Window_StageInfo(0, 0);
		this._goldWindow.y = this._commandWindow.y + this._commandWindow.windowHeight();
		this._goldWindow.x = 800;
		this.addWindow(this._goldWindow);
		this._commandWindow.hide();
		this._commandWindow.deactivate();
		this._goldWindow.hide();
		this._goldWindow.deactivate();
	}
	
	Scene_Map.prototype.createConditionsWindow = function() {
		this._conditionsWindow = new Window_ConditionsInfo(0, 0);
		this._conditionsWindow.y = 100;
		this._conditionsWindow.x = 20;
		this._conditionsWindow.hide();
		this._conditionsWindow.deactivate();
		this.addWindow(this._conditionsWindow);
	};
	
	Scene_Map.prototype.commandOptions = function() {
		//SceneManager.push(Scene_Options);
		var _this = this;
		$gameTemp.optionsWindowCancelCallback = function(){
			$gameTemp.optionsWindowCancelCallback = null;
			_this._commandWindow.activate();
			$gameTemp.deactivatePauseMenu = false;
			Input.clear();//ensure the B press from closing the list does not propagate to the pause menu
		}
		this._commandWindow.deactivate();
		$gameTemp.deactivatePauseMenu = true;
		//$gameSystem.setSubBattlePhase('normal');
        $gameTemp.pushMenu = "options";
	};
	
	Scene_Map.prototype.showPauseMenu = function() {
		this._commandWindow.open();
		this._commandWindow.show();
		this._commandWindow.activate();
		this._goldWindow.open();
		this._goldWindow.show();
		this._goldWindow.activate();
	}
	
	Scene_Map.prototype.closePauseMenu = function() {
		this._commandWindow.hide();
		this._commandWindow.deactivate();
		this._goldWindow.hide();
		this._goldWindow.deactivate();
		this._conditionsWindow.hide();
		$gameSystem.setSubBattlePhase('normal');
	}
	
	Scene_Map.prototype.commandGameEnd = function() {
		SceneManager.push(Scene_GameEnd);
	};
	
	Scene_Map.prototype.commandSave = function() {
		if(ENGINE_SETTINGS.DEBUG_SAVING){
			$gameSystem.setSubBattlePhase('normal');
			SceneManager.push(Scene_Save);
			DataManager.saveContinueSlot();	
		} else {
			this.closePauseMenu();
			DataManager.saveContinueSlot();	
		}			
	};
	
	Scene_Map.prototype.commandTurnEnd = function() {
		this._commandWindow.hide();
		this._goldWindow.hide();
		$gameSystem.setSubBattlePhase('confirm_end_turn');
		if($gameSystem.getActorsWithAction().length){			
			$gameTemp.pushMenu = "confirm_end_turn";
		} else {
			$gameTemp.setTurnEndFlag(true);
			$gameTemp.setAutoBattleFlag(false);
		}		
    }
	
	Scene_Map.prototype.commandUnitList = function() {
		var _this = this;
		$gameTemp.mechListWindowCancelCallback = function(){
			$gameTemp.mechListWindowCancelCallback = null;
			_this._commandWindow.activate();
			$gameTemp.deactivatePauseMenu = false;
			Input.clear();//ensure the B press from closing the list does not propagate to the pause menu
		}
		this._commandWindow.deactivate();
		$gameTemp.deactivatePauseMenu = true;
		//$gameSystem.setSubBattlePhase('normal');
        $gameTemp.pushMenu = "mech_list_deployed";
    }
	
	Scene_Map.prototype.commandSearch = function() {
		var _this = this;
		$gameTemp.searchWindowCancelCallback = function(){
			$gameTemp.searchWindowCancelCallback = null;
			_this._commandWindow.activate();
			$gameTemp.deactivatePauseMenu = false;
			Input.clear();//ensure the B press from closing the list does not propagate to the pause menu
		}
		$gameTemp.searchWindowSelectedCallback = function(actor){
			$gameTemp.searchWindowSelectedCallback = null;
			var referenceEvent = $statCalc.getReferenceEvent(actor);
			if(referenceEvent){
				$gamePlayer.locate(referenceEvent.posX(), referenceEvent.posY());
			}
			_this.closePauseMenu();
		}
		this._commandWindow.deactivate();
		$gameTemp.deactivatePauseMenu = true;
		//$gameSystem.setSubBattlePhase('normal');
        $gameTemp.pushMenu = "search";
    }
	
	Scene_Map.prototype.commandConditions = function() {
		this._conditionsWindow.refresh();
		if(this._conditionsWindow.visible){
			this._conditionsWindow.hide();
		} else {
			this._conditionsWindow.show();
		}		
	}	
	
	Scene_Map.prototype.createIntermissionWindow = function() {
		var _this = this;
		_this._intermissionWindow = new Window_Intermission(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		_this._intermissionWindow.addHandler("intermissionEnd", function(){
			//$gameVariables.setValue(_nextMapVariable, 4);
			$gameVariables.setValue(_nextMapXVariable, 1);
			$gameVariables.setValue(_nextMapYVariable, 1);
			$gameSwitches.setValue(_endIntermissionSwitchID, true);
		});
		_this._intermissionWindow.hide();
		_this._intermissionWindow.close();
		_this.addWindow(this._intermissionWindow);
		_this.idToMenu["intermission_menu"] = this._intermissionWindow;
    };
	
	Scene_Map.prototype.createMechListWindow = function() {
		var _this = this;
		this._mechListWindow = new Window_MechList(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._mechListWindow.close();
		this.addWindow(this._mechListWindow);
		this._mechListWindow.registerCallback("closed", function(){
			if($gameTemp.mechListWindowCancelCallback){
				$gameTemp.mechListWindowCancelCallback();
			}
		});
		this._mechListWindow.hide();
		this.idToMenu["mech_list"] = this._mechListWindow;
    };
	
	Scene_Map.prototype.createMechListDeployedWindow = function() {
		var _this = this;
		this._mechListDeployedWindow = new Window_MechListDeployed(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._mechListDeployedWindow.close();
		this.addWindow(this._mechListDeployedWindow);
		this._mechListDeployedWindow.registerCallback("closed", function(){
			if($gameTemp.mechListWindowCancelCallback){
				$gameTemp.mechListWindowCancelCallback();
			}
		});
		this._mechListDeployedWindow.registerCallback("search_selected", function(actor){
			if($gameTemp.mechListWindowSearchSelectionCallback){
				$gameTemp.mechListWindowSearchSelectionCallback(actor);
			}
		});
		this._mechListDeployedWindow.hide();
		this.idToMenu["mech_list_deployed"] = this._mechListDeployedWindow;
    };
	
	Scene_Map.prototype.createMechReassignSelectWindow = function() {
		var _this = this;
		this._mechReassignSelectWindow = new Window_SelectReassignMech(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._mechReassignSelectWindow.close();
		this.addWindow(this._mechReassignSelectWindow);
		
		this._mechReassignSelectWindow.hide();
		this.idToMenu["mech_reassign_select"] = this._mechReassignSelectWindow;
    };
	
	Scene_Map.prototype.createPilotReassignSelectWindow = function() {
		var _this = this;
		this._pilotReassignSelectWindow = new Window_SelectReassignPilot(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._pilotReassignSelectWindow.close();
		this.addWindow(this._pilotReassignSelectWindow);
		
		this._pilotReassignSelectWindow.hide();
		this.idToMenu["pilot_reassign_select"] = this._pilotReassignSelectWindow;
    };	
	
	Scene_Map.prototype.createDeploySelectionWindow = function() {
		var _this = this;
		this._deploySelectionWindow = new Window_DeploySelection(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._deploySelectionWindow.close();
		this.addWindow(this._deploySelectionWindow);
		this._deploySelectionWindow.hide();
		this.idToMenu["boarded_deploy_selection"] = this._deploySelectionWindow;
    };
	
	Scene_Map.prototype.createDeploymentWindow = function() {
		var _this = this;
		
		this._deploymentWindow = new Window_DeploymentTwin(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		
		
		this._deploymentWindow.close();
		this.addWindow(this._deploymentWindow);
		this._deploymentWindow.hide();
		this.idToMenu["deployment"] = this._deploymentWindow;
    };
	
	Scene_Map.prototype.createEndTurnConfirmWindow = function() {
		var _this = this;
		this._endTurnConfirmWindow = new Window_ConfirmEndTurn(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._endTurnConfirmWindow.close();
		this.addWindow(this._endTurnConfirmWindow);
		this._endTurnConfirmWindow.registerCallback("selected", function(result){
			$gameTemp.OKHeld = true;			
			if(result){
				$gameTemp.setTurnEndFlag(true);
				$gameTemp.setAutoBattleFlag(false);
			} else {
				$gameSystem.setSubBattlePhase("normal");
			}
		});
		this._endTurnConfirmWindow.hide();
		this.idToMenu["confirm_end_turn"] = this._endTurnConfirmWindow;
    };	
	
	Scene_Map.prototype.createDeploymentInStageWindow = function() {
		var _this = this;
		this._deploymentInStageWindow = new Window_DeploymentInStage(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._deploymentInStageWindow.close();
		this.addWindow(this._deploymentInStageWindow);
		this._deploymentInStageWindow.hide();
		this.idToMenu["in_stage_deploy"] = this._deploymentInStageWindow;
    };
	
	Scene_Map.prototype.createUpgradeUnitSelectionWindow = function() {
		var _this = this;
		this._ugradeUnitSelectionWindow = new Window_UpgradeUnitSelection(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._ugradeUnitSelectionWindow.close();
		this.addWindow(this._ugradeUnitSelectionWindow);
		this._ugradeUnitSelectionWindow.hide();
		this.idToMenu["upgrade_unit_selection"] = this._ugradeUnitSelectionWindow;
    };
	
	Scene_Map.prototype.createUpgradeMechWindow = function() {
		var _this = this;
		this._upgradeMechWindow = new Window_UpgradeMech(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._upgradeMechWindow.close();
		this.addWindow(this._upgradeMechWindow);
		this._upgradeMechWindow.hide();
		this.idToMenu["upgrade_mech"] = this._upgradeMechWindow;
    };
	
	Scene_Map.prototype.createPilotListWindow = function() {
		var _this = this;
		this._pilotListWindow = new Window_PilotList(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._pilotListWindow.close();
		this.addWindow(this._pilotListWindow);
		this._pilotListWindow.hide();
		this.idToMenu["pilot_list"] = this._pilotListWindow;
    };	
	
	Scene_Map.prototype.createPilotUpgradeSelectionWindow = function() {
		var _this = this;
		this._pilotUpgradeSelectionWindow = new Window_UpgradePilotSelection(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._pilotUpgradeSelectionWindow.close();
		this.addWindow(this._pilotUpgradeSelectionWindow);
		this._pilotUpgradeSelectionWindow.hide();
		this.idToMenu["pilot_upgrade_list"] = this._pilotUpgradeSelectionWindow;
    };	
	
	Scene_Map.prototype.createPilotUpgradeWindow = function() {
		var _this = this;
		this._pilotUpgradeWindow = new Window_UpgradePilot(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._pilotUpgradeWindow.close();
		this.addWindow(this._pilotUpgradeWindow);
		this._pilotUpgradeWindow.hide();
		this.idToMenu["upgrade_pilot"] = this._pilotUpgradeWindow;
    };	
	
	Scene_Map.prototype.createItemEquipWindow = function() {
		var _this = this;
		this._itemEquipWindow = new Window_EquipItem(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._itemEquipWindow.close();
		this.addWindow(this._itemEquipWindow);
		this._itemEquipWindow.hide();
		this.idToMenu["equip_item"] = this._itemEquipWindow;
    };	
	
	
	Scene_Map.prototype.createItemEquipSelectionWindow = function() {
		var _this = this;
		this._itemEquipSelectWindow = new Window_EquipMechSelection(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._itemEquipSelectWindow.close();
		this.addWindow(this._itemEquipSelectWindow);
		this._itemEquipSelectWindow.hide();
		this.idToMenu["equip_item_select"] = this._itemEquipSelectWindow;
    };		
	
	Scene_Map.prototype.createMinimalBattleWindow = function() {
		var _this = this;
		this._minimalBattleWindow = new Window_BattleBasic(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._minimalBattleWindow.close();
		this.addWindow(this._minimalBattleWindow);
		this._minimalBattleWindow.hide();
		this.idToMenu["battle_basic"] = this._minimalBattleWindow;
    };	
	
	Scene_Map.prototype.createSpiritAnimWindow = function() {
		var _this = this;
		this._spiritAnimWindow = new Window_SpiritActivation(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._spiritAnimWindow.registerCallback("done", function(){
			if($gameTemp.spiritWindowDoneHandler){
				$gameTemp.spiritWindowDoneHandler();
			}
		});
		this._spiritAnimWindow.close();
		this.addWindow(this._spiritAnimWindow);
		this._spiritAnimWindow.hide();
		this.idToMenu["spirit_activation"] = this._spiritAnimWindow;
    };
	
	Scene_Map.prototype.createDetailPagesWindow = function() {
		var _this = this;
		this._detailPagesWindow = new Window_DetailPages(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._detailPagesWindow.registerCallback("closed", function(){
			if($gameTemp.detailPagesWindowCancelCallback){
				$gameTemp.detailPagesWindowCancelCallback();
			}
		});
		this._detailPagesWindow.close();
		this.addWindow(this._detailPagesWindow);
		this._detailPagesWindow.hide();
		this.idToMenu["detail_pages"] = this._detailPagesWindow;
    };
	
	Scene_Map.prototype.createSearchWindow = function() {
		var _this = this;
		this._searchWindow = new Window_Search(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._searchWindow.registerCallback("closed", function(){
			if($gameTemp.searchWindowCancelCallback){
				$gameTemp.searchWindowCancelCallback();
			}
		});
		this._searchWindow.registerCallback("selected", function(actor){
			if($gameTemp.searchWindowSelectedCallback){
				$gameTemp.searchWindowSelectedCallback(actor);
			}
		});
		this._searchWindow.close();
		this.addWindow(this._searchWindow);
		this._searchWindow.hide();
		this.idToMenu["search"] = this._searchWindow;
    };
	
	Scene_Map.prototype.createOptionsWindow = function() {
		var _this = this;
		this._optionsWindow = new Window_Options(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._optionsWindow.registerCallback("closed", function(){
			if($gameTemp.optionsWindowCancelCallback){
				$gameTemp.optionsWindowCancelCallback();
			}
		});
		this._optionsWindow.close();
		this.addWindow(this._optionsWindow);
		this._optionsWindow.hide();
		this.idToMenu["options"] = this._optionsWindow;
    };

    // アクターコマンドウィンドウを作る
    Scene_Map.prototype.createSrpgActorCommandWindow = function() {
        this._mapSrpgActorCommandWindow = new Window_ActorCommand();
        this._mapSrpgActorCommandWindow.x = Math.max(Graphics.boxWidth / 2 - this._mapSrpgActorCommandWindow.windowWidth(), 0);
        this._mapSrpgActorCommandWindow.y = Math.max(Graphics.boxHeight / 2 - this._mapSrpgActorCommandWindow.windowHeight(), 0);
		this._mapSrpgActorCommandWindow.setHandler('move',  this.commandMove.bind(this));
        this._mapSrpgActorCommandWindow.setHandler('attack', this.commandAttack.bind(this));
        this._mapSrpgActorCommandWindow.setHandler('skill',  this.commandSkill.bind(this));
        this._mapSrpgActorCommandWindow.setHandler('item',   this.commandItem.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('ability',   this.commandAbility.bind(this));
        this._mapSrpgActorCommandWindow.setHandler('equip',   this.commandEquip.bind(this));
        this._mapSrpgActorCommandWindow.setHandler('wait',  this.commandWait.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('land',  this.commandLand.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('fly',  this.commandFly.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('spirit',  this.commandSpirit.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('board',  this.commandBoard.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('deploy',  this.commandDeploy.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('heal',  this.commandHeal.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('resupply',  this.commandResupply.bind(this));				
		this._mapSrpgActorCommandWindow.setHandler('persuade', this.persuadeActorMenuCommand.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('combine', this.combineActorMenuCommand.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('split', this.splitActorMenuCommand.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('transform', this.transformActorMenuCommand.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('swap', this.swapActorMenuCommand.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('separate', this.separateActorMenuCommand.bind(this));
		this._mapSrpgActorCommandWindow.setHandler('join', this.joinActorMenuCommand.bind(this));		
		
		
        this._mapSrpgActorCommandWindow.setHandler('cancel', this.cancelActorMenuCommand.bind(this));
		$gameTemp.actorCommandPosition = -1;
        this.addWindow(this._mapSrpgActorCommandWindow);
    };

    // ヘルプウィンドウを作る
    Scene_Map.prototype.createHelpWindow = function() {
        this._helpWindow = new Window_Help();
        this._helpWindow.visible = false;
        this.addWindow(this._helpWindow);
    };
	
	Scene_Map.prototype.createAttackWindow = function() {
		var _this = this;
		this._attackWindow = new Window_AttackList(0, 0, Graphics.boxWidth, Graphics.boxHeight);
		this._attackWindow.registerCallback("selected", function(attack){			
			if($gameTemp.attackWindowCallback){
				$gameTemp.attackWindowCallback(attack);
			}
		});
		this._attackWindow.registerCallback("closed", function(){
			if($gameTemp.attackWindowCancelCallback){
				$gameTemp.attackWindowCancelCallback();
			}
		});
		this._attackWindow.close();
		this.addWindow(this._attackWindow);
		this._attackWindow.hide();
		this.idToMenu["attack_list"] = this._attackWindow;
    };
	
	Scene_Map.prototype.createSpiritWindow = function() {
		var _this = this;
		_this._spiritWindow = new Window_SpiritSelection(0, 0, Graphics.boxWidth, Graphics.boxHeight);		
		this._spiritWindow.registerCallback("selected", function(spiritInfo){
			_this.handleSpiritSelection(spiritInfo);
		});
		this._spiritWindow.registerCallback("selectedMultiple", function(spirits){
			_this.handleMultipleSpiritSelection(spirits);
		});		
		this._spiritWindow.registerCallback("closed", function(spiritInfo){
			_this._spiritWindow.close();
			_this._mapSrpgActorCommandWindow.activate()
			_this._mapSrpgActorCommandWindow.show()
		});
		this._spiritWindow.close();
		this.addWindow(this._spiritWindow);
		this._spiritWindow.hide();
		this.idToMenu["spirit_selection"] = this._spiritWindow;
    };
	
	Scene_Map.prototype.createBeforeBattleWindow = function() {
		var _this = this;
		if(ENGINE_SETTINGS.ENABLE_TWIN_SYSTEM){
			_this._beforeBattleWindow = new Window_BeforebattleTwin(0, 0, Graphics.boxWidth, Graphics.boxHeight);		
		} else {
			_this._beforeBattleWindow = new Window_BeforeBattle(0, 0, Graphics.boxWidth, Graphics.boxHeight);		
		}
		
		this._beforeBattleWindow.registerCallback("selected", function(spiritInfo){
			_this.commandBattleStart();
		});
		this._beforeBattleWindow.registerCallback("closed", function(spiritInfo){
			_this.selectPreviousSrpgBattleStart();
		});
		
		this._beforeBattleWindow.close();
		this.addWindow(this._beforeBattleWindow);
		this._beforeBattleWindow.hide();
		this.idToMenu["before_battle"] = this._beforeBattleWindow;
    };
	
	
	Scene_Map.prototype.applyAdditionalSpiritEffects = function(spiritInfo, target, caster) {
		//Implementation of Great Wall Ace Bonus
		if(spiritInfo.idx == 22 && $statCalc.applyStatModsToValue(target, 0, ["great_wall"])) { //Wall
			$spiritManager.applyEffect(9, caster, [target], 0); //Drive
		}
	}
	
	Scene_Map.prototype.handleMultipleSpiritSelection = function(spirits) {
		var _this = this;
		$gameTemp.playingSpiritAnimations = true;
		var currentSpirit = spirits.pop();	
		this._spiritWindow.close();
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		
		function applySpirit(){
			_this.applyAdditionalSpiritEffects(currentSpirit, currentSpirit.target, currentSpirit.caster);
			var targets = [currentSpirit.target];
			if(currentSpirit.target.isActor()){
				var subPilots = currentSpirit.target.SRWStats.mech.subPilots;
				if(subPilots){
					subPilots.forEach(function(actorId){
						targets.push($gameActors.actor(actorId));
					});
				}
			}			
			$spiritManager.applyEffect(currentSpirit.idx, currentSpirit.caster, targets, currentSpirit.cost);
			
			$gameTemp.spiritTargetActor = currentSpirit.target;
			$gameTemp.queuedActorEffects = [{type: "spirit", parameters: {target: currentSpirit.target, idx: currentSpirit.idx}}];	
			_this._spiritAnimWindow.show(true);	
		}
			
		$gameTemp.spiritWindowDoneHandler = function(){
			if(!spirits.length){
				$gameTemp.playingSpiritAnimations = false;
				$gameTemp.popMenu = true;
				$gameSystem.setSrpgActorCommandWindowNeedRefresh($gameSystem.EventToUnit($gameTemp.activeEvent().eventId()));
				$gameSystem.setSubBattlePhase("actor_command_window");
			} else {
				currentSpirit = spirits.pop();	
				applySpirit();
			}
		}
		
		$gameSystem.setSubBattlePhase('spirit_activation');	
		$gameTemp.pushMenu = "spirit_activation";
		applySpirit();
	}
	
	Scene_Map.prototype.handleEventSpirits = function(spirits) {
		var _this = this;
		$gameTemp.playingSpiritAnimations = true;
		var currentSpirit = spirits.pop();	
		this._spiritWindow.close();
		
		function applySpirit(){
			_this.applyAdditionalSpiritEffects(currentSpirit, currentSpirit.target, currentSpirit.caster);					
			$spiritManager.applyEffect(currentSpirit.idx, currentSpirit.caster, [currentSpirit.target], 0);			
			$gameTemp.spiritTargetActor = currentSpirit.target;
			$gameTemp.queuedActorEffects = [{type: "spirit", parameters: {target: currentSpirit.target, idx: currentSpirit.idx}}];	
			_this._spiritAnimWindow.show(true);	
		}
			
		$gameTemp.spiritWindowDoneHandler = function(){
			if(!spirits.length){
				$gameSystem.setSubBattlePhase('normal');	
				$gameTemp.playingSpiritAnimations = false;
				$gameTemp.popMenu = true;
			} else {
				currentSpirit = spirits.pop();	
				applySpirit();
			}
		}
		
		$gameSystem.setSubBattlePhase('spirit_activation');	
		$gameTemp.pushMenu = "spirit_activation";
		applySpirit();
	}
	
	Scene_Map.prototype.handleSpiritSelection = function(spiritInfo) {
		this._spiritWindow.close();
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		var battlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
		var target;
		if(spiritInfo.target){
			target = spiritInfo.target;
		} else {
			target = battlerArray[1];
		}
		var caster;
		if(spiritInfo.caster){
			caster = spiritInfo.caster;
		} else {
			caster = battlerArray[1];
		}
		var initialTargetingResult = $spiritManager.performInitialTargeting(spiritInfo.idx, target);
		
		if(initialTargetingResult.type == "enemy" || initialTargetingResult.type == "ally"){
		 //manual Targeting required
			 $gameTemp.currentTargetingSpirit = spiritInfo;
			 $gameSystem.setSubBattlePhase('actor_target_spirit');
		} else {
			//apply immediately
			$spiritManager.applyEffect(spiritInfo.idx, caster, initialTargetingResult.targets, spiritInfo.cost);
			
			this.applyAdditionalSpiritEffects(spiritInfo, target, caster);
			if(initialTargetingResult.type != "enemy_all" && initialTargetingResult.type != "ally_all"){
				$gameTemp.spiritTargetActor = initialTargetingResult.targets[0];
				$gameTemp.queuedActorEffects = [{type: "spirit", parameters: {target: initialTargetingResult.targets[0], idx: spiritInfo.idx}}];					
				$gameSystem.setSubBattlePhase('spirit_activation');
				
				
				$gameTemp.spiritWindowDoneHandler = function(){
					$gameTemp.popMenu = true;
					$gameSystem.setSrpgActorCommandWindowNeedRefresh($gameSystem.EventToUnit($gameTemp.activeEvent().eventId()));
					$gameSystem.setSubBattlePhase("actor_command_window");
				}
				
					
				$gameTemp.pushMenu = "spirit_activation";
				
							
				//_this._mapSrpgActorCommandWindow.activate();
			} else {
				$gameTemp.queuedEffectSpiritId = spiritInfo.idx; 
				$gameSystem.setSubBattlePhase("map_spirit_animation");				
			}				
		}
	}


    // アイテムウィンドウを作る
    Scene_Map.prototype.createItemWindow = function() {
        var wy = this._helpWindow.y + this._helpWindow.height;
        var wh = Graphics.boxHeight - wy - windowOffset;
        this._itemWindow = new Window_SRWItemBattle(0, wy, 200, 180);
		this._itemWindow.x = this._mapSrpgActorCommandWindow.x - this._mapSrpgActorCommandWindow.windowWidth() + 120;
		this._itemWindow.y = this._mapSrpgActorCommandWindow.y - this._mapSrpgActorCommandWindow.windowHeight()/2;
        //this._itemWindow.setHelpWindow(this._helpWindow);
        this._itemWindow.setHandler('ok',     this.onConsumableOk.bind(this));
        this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
        this.addWindow(this._itemWindow);
    };
	
	Scene_Map.prototype.createAbilityWindow = function() {
        var wy = this._helpWindow.y + this._helpWindow.height;
        var wh = Graphics.boxHeight - wy - windowOffset;
        this._abilityWindow = new Window_SRWAbilityCommand(0, wy, 200, 180);
		this._abilityWindow.x = this._mapSrpgActorCommandWindow.x - this._mapSrpgActorCommandWindow.windowWidth() + 120;
		this._abilityWindow.y = this._mapSrpgActorCommandWindow.y - this._mapSrpgActorCommandWindow.windowHeight()/2;
        //this._itemWindow.setHelpWindow(this._helpWindow);
        this._abilityWindow.setHandler('ok',     this.onAbilityOk.bind(this));
        this._abilityWindow.setHandler('cancel', this.onAbilityCancel.bind(this));
        this.addWindow(this._abilityWindow);
    };
	
	Scene_Map.prototype.createTransformWindow = function() {
        var wy = this._helpWindow.y + this._helpWindow.height;
        var wh = Graphics.boxHeight - wy - windowOffset;
        this._transformWindow = new Window_SRWTransformSelection(0, wy, 200, 180);
		this._transformWindow.x = this._mapSrpgActorCommandWindow.x - this._mapSrpgActorCommandWindow.windowWidth() + 120;
		this._transformWindow.y = this._mapSrpgActorCommandWindow.y - this._mapSrpgActorCommandWindow.windowHeight()/2;
        //this._itemWindow.setHelpWindow(this._helpWindow);
        this._transformWindow.setHandler('ok',     this.onTransformOk.bind(this));
        this._transformWindow.setHandler('cancel', this.onTransformCancel.bind(this));
        this.addWindow(this._transformWindow);
    };
	
	Scene_Map.prototype.createRewardsWindow = function() {
		this._rewardsWindow = new Window_Rewards();
		
		this._rewardsWindow.close();
		this.addWindow(this._rewardsWindow);
		this._rewardsWindow.hide();
		this.idToMenu["rewards"] = this._rewardsWindow;
    };
		
	Scene_Map.prototype.createUnitSummaryWindow = function() {
		this._summaryWindow = new Window_UnitSummary(0, 0);				
		this._summaryWindow.close();
		this.addWindow(this._summaryWindow);
		this._summaryWindow.hide();
		this.idToMenu["unit_summary"] = this._summaryWindow;
    };
	
	Scene_Map.prototype.createTerrainDetailsWindow = function() {
		this._terrainDetailsWindow = new Window_TerrainDetails(0, 0);				
		this._terrainDetailsWindow.close();
		this.addWindow(this._terrainDetailsWindow);
		this._terrainDetailsWindow.hide();
		this.idToMenu["terrain_details"] = this._terrainDetailsWindow;
    };
	
	Scene_Map.prototype.createLevelUpWindow = function() {
		this._levelUpWindow = new Window_LevelUp();
				
		this._levelUpWindow.close();
		this.addWindow(this._levelUpWindow);
		this._levelUpWindow.hide();
		this.idToMenu["level_up"] = this._levelUpWindow;
    };

    // サブフェーズの状況に応じてキャンセルキーの機能を変更する
    var _SRPG_SceneMap_updateCallMenu = Scene_Map.prototype.updateCallMenu;
    Scene_Map.prototype.updateCallMenu = function() {
		var _this = this;
        if ($gameSystem.isSRPGMode() == true) {
			
           /* if ($gameSystem.srpgWaitMoving() == true ||
                $gameTemp.isAutoMoveDestinationValid() == true ||
                $gameSystem.isSubBattlePhase() === 'status_window' ||
                $gameSystem.isSubBattlePhase() === 'battle_window' ||
				//$gameSystem.isSubBattlePhase() === 'actor_command_window' ||
				$gameSystem.isSubBattlePhase() === 'post_move_command_window' ||
                $gameSystem.isBattlePhase() != 'actor_phase' ||				
				$gameSystem.isSubBattlePhase() === 'process_death_queue' || 
				$gameSystem.isSubBattlePhase() === 'process_death' || 
				$gameSystem.isSubBattlePhase() === 'pause_menu' || 
				$gameSystem.isSubBattlePhase() === 'event_before_battle' || 		
				$gameSystem.isSubBattlePhase() === 'rewards_display' ||
				$gameSystem.isSubBattlePhase() === 'level_up_display' ||
				$gameSystem.isSubBattlePhase() === 'battle_basic' ||
				$gameSystem.isSubBattlePhase() === 'spirit_activation' ||
				$gameSystem.isSubBattlePhase() === 'after_battle'  ||
				$gameSystem.isSubBattlePhase() === 'map_attack_animation' ||
				$gameSystem.isSubBattlePhase() === 'process_map_attack_queue' ||
				$gameSystem.isSubBattlePhase() === 'map_spirit_animation' ||
				$gameSystem.isSubBattlePhase() === 'confirm_boarding' ||
				$gameSystem.isSubBattlePhase() === 'enemy_unit_summary' ||
				$gameSystem.isSubBattlePhase() === 'confirm_end_turn' ||
				$gameSystem.isSubBattlePhase() === 'enemy_targeting_display' ||
				$gameSystem.isSubBattlePhase() === 'enemy_attack' ||
				$gameSystem.isSubBattlePhase() === 'enemy_range_display' ||
				$gameSystem.isSubBattlePhase() === 'await_character_anim' ||
				$gameSystem.isSubBattlePhase() === 'process_destroy_transform_queue'
				
				) {
                this.menuCalling = false;
                return;
				
				
            }	*/	

			if(!$SRWGameState.canUseMenu()){
				 this.menuCalling = false;
				return;
			}
			
            if ($gameSystem.isSubBattlePhase() === 'normal' && !$gameSystem.isIntermission()) {
				$gameTemp.isPostMove = false;
                if (Input.isTriggered('pageup')) {                   
                    $gameSystem.getNextLActor();
                } else if (Input.isTriggered('pagedown')) {      
                    $gameSystem.getNextRActor();
                }
            }
			
			if ($gameSystem.isSubBattlePhase() === 'twin_selection') {
                
            }/*else {
                _SRPG_SceneMap_updateCallMenu.call(this);
            }*/
        } else {
            _SRPG_SceneMap_updateCallMenu.call(this);
        }
    };
	
	Scene_Map.prototype.processMenuStack = function(){
		var menuStack = $gameTemp.menuStack;
		if($gameTemp.popMenu){
			//console.log("Pop Menu " + $gameTemp.menuStack[menuStack.length-1]);
			
			//Input.update is called twice to prevent inputs that triggered the closing of a window to also trigger something in the new state
			Input.update();
			Input.update();
			if(menuStack.length){
				var menu = menuStack.pop();
				if(menu){
					menu.hide();
					menu.close();
					menu.deactivate();
				}
				if(menuStack.length){					
					var menu = menuStack[menuStack.length-1];
					if(menu){
						menu.show();
						menu.open();
						menu.activate();
					}
				}
			}
			$gameTemp.popMenu = false;
			if($gameTemp.popFunction){
				$gameTemp.popFunction.call(this);				
				$gameTemp.popFunction = null;
			}
		}		
		
		if($gameTemp.killMenus && Object.keys($gameTemp.killMenus).length){
			var tmp = [];
			for(var i = 0; i < menuStack.length; i++){
				var menu = menuStack[i];
				if(menu){
					if(!$gameTemp.killMenus[menuStack[i]._layoutId]){
						tmp.push(menu);
					} else {
						menu.hide();
						menu.close();
						menu.deactivate();
					}					
				}				
			}
			$gameTemp.killMenus = {};
			menuStack = tmp;
			if(menuStack.length){					
				var menu = menuStack[menuStack.length-1];
				if(menu){
					menu.show();
					menu.open();
					menu.activate();
				}
			}
			$gameTemp.menuStack = menuStack;
		}
		
		if($gameTemp.pushMenu){
			//console.log("Push Menu "+$gameTemp.pushMenu);
			if(menuStack.length){
				var menu = menuStack[menuStack.length-1];
				if(menu){
					menu.hide();
					menu.close();
					menu.deactivate();
				}
			}
			var menu = this.idToMenu[$gameTemp.pushMenu];
			if(menu){
				menu.show();
				menu.open();
				menu.activate();
				menuStack.push(menu);
			}	
			$gameTemp.pushMenu = null;	
		}	
	}

    // マップの更新
    var _SRPG_SceneMap_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
		var _this = this;
		
		//Soft Reset
		if(!$gameSystem.isIntermission() && Input.isPressed("ok") && Input.isPressed("cancel") && Input.isPressed("pageup") && Input.isPressed("pagedown")){
			Input.clear();
			try {
				JsonEx.parse(StorageManager.load("continue"));//check if the continue slot exists first by trying to parse it
				DataManager.loadContinueSlot();
			} catch(e){
				
			}			
			return;
		}		
		
		_SRPG_SceneMap_update.call(this);
		
		this.processMenuStack();
		
		if($gameSystem.isIntermission()){
			$SRWGameState.requestNewState("intermission");
			if(!this._intermissionWindowOpen){
				$gameSystem.clearData();//make sure stage temp data is cleared when moving between stages
				this._intermissionWindowOpen = true;
				this._intermissionWindow.setActor($gameSystem._availableUnits[0]);
				/*this._intermissionWindow.refresh();
				this._intermissionWindow.open();
				this._intermissionWindow.show();
				this._intermissionWindow.activate();*/
				$gameTemp.pushMenu = "intermission_menu";
			}	
			var menu = this.idToMenu["intermission_menu"];
			if(!menu.visible){
				menu.visible = true;
			}
			return;			
		} else {
			if(this._intermissionWindowOpen){
				this._intermissionWindowOpen = false;
				this._intermissionWindow.close();
				this._intermissionWindow.hide();
			}
		}
		
		if(!$SRWGameState.update(this)) {
			return;
		}
						
		
		
		if($gameTemp.continueLoaded){
			$gameTemp.continueLoaded = false;
			$gameSystem.onAfterLoad();
		}
		
		//Start first actor turn
		if ($gameSystem.isBattlePhase() == "start_srpg"){
			if (!$gameMap.isEventRunning()) {
				$gameSystem.srpgStartActorTurn();
			}
		}
		
		//$gameSystem.isSubBattlePhase() !== 'normal' && $gameSystem.isSubBattlePhase() !== 'actor_target' && $gameSystem.isSubBattlePhase() !== 'actor_target_spirit' && $gameSystem.isSubBattlePhase() !== 'actor_map_target_confirm'
		if (!$SRWGameState.canShowSummaries()) {	
			this._summaryWindow.hide();
			this._terrainDetailsWindow.hide();
		}		
		
		
		if($gameTemp.OKHeld && !Input.isTriggered("ok")){
			$gameTemp.OKHeld = false;
		}		
				
		//console.log($gameSystem.isSubBattlePhase());
		if($gameTemp.enemyAppearQueueIsProcessing){
			$gameTemp.unitAppearTimer--;
			if($gameTemp.unitAppearTimer <= 0){
				if(!$gameTemp.enemyAppearQueue.length){
					$gameTemp.enemyAppearQueueIsProcessing = false;
				} else {
					var current = $gameTemp.enemyAppearQueue.shift();
					$gamePlayer.locate(current.posX(), current.posY());
					current.isDoingAppearAnim = true;
					current.isPendingDeploy = false;
					var battlerArray = $gameSystem.EventToUnit(current.eventId());
					var wait = 15;
					/*if(battlerArray && battlerArray[1]){
						var animInfo = $statCalc.getSpawnAnimInfo(battlerArray[1]);
						wait+=animInfo.frames;
					}*/
					$gameTemp.unitAppearTimer = wait;
				}				
			}
		}
		
		if($gameTemp.disappearQueueIsProcessing){
			$gameTemp.unitAppearTimer--;
			if($gameTemp.unitAppearTimer <= 0){
				if(!$gameTemp.disappearQueue.length){
					$gameTemp.disappearQueueIsProcessing = false;
				} else {
					var current = $gameTemp.disappearQueue.shift();
					$gamePlayer.locate(current.posX(), current.posY());
					current.isDoingDisappearAnim = true;
					$gameTemp.unitAppearTimer = 15;
				}				
			}
		}
				
        if ($gameSystem.isSRPGMode() == false) {
            return;
        }
        if ($gameSystem.srpgWaitMoving() == true || $gameTemp.isAutoMoveDestinationValid() == true) {
            return;
        }
        //ターン終了コマンドの実行
        if ($gameTemp.isTurnEndFlag() == true) {
            this.menuActorTurnEnd();
            return;
        }
        //アクターコマンドからの装備変更の後処理
        if ($gameTemp.isSrpgActorEquipFlag() == true) {
            this.srpgAfterActorEquip();
            return;
        }
			
        var flag = $gameSystem.srpgActorCommandWindowNeedRefresh();
        if (flag[0]) {
            if ($gameTemp.forceActorMenuRefresh || (!this._mapSrpgActorCommandWindow.isOpen() && !this._mapSrpgActorCommandWindow.isOpening())) {
                $gameTemp.forceActorMenuRefresh = false;
				this._mapSrpgActorCommandWindow.setup(flag[1][1]);
				this._mapSrpgActorCommandWindow.activate();
				this._mapSrpgActorCommandWindow.open();
				this._mapSrpgActorCommandWindow.show();
				if($gameTemp.actorCommandPosition != -1){					
					this._mapSrpgActorCommandWindow.select($gameTemp.actorCommandPosition);
					$gameTemp.actorCommandPosition = -1;
				}
            }
        } else {
            if (this._mapSrpgActorCommandWindow.isOpen() && !this._mapSrpgActorCommandWindow.isClosing()) {
                this._mapSrpgActorCommandWindow.close();
                this._mapSrpgActorCommandWindow.deactivate();
            }
        }
        
      
		
		if ($gameMap.isEventRunning() == true) {
            return;
        }
		
        //アクターフェイズの開始処理
        if ($gameSystem.isBattlePhase() === 'actor_phase' && $gameSystem.isSubBattlePhase() === 'initialize') {
			/*if($gameVariables.value(_turnVarID) != 1){
				$statCalc.modifyAllWill("actor", 1);				
			}*/
            if (this.isSrpgActorTurnEnd()) {
                $gameSystem.srpgStartEnemyTurn(0); //自動行動のアクターが行動する
            } else {
                $gameSystem.setSubBattlePhase('normal');
            }
        }      
       	
		
        //エネミーフェイズの処理
        if ($gameSystem.isBattlePhase() === 'AI_phase') {
			$gameTemp.summaryUnit = null;					
        }
						
		//$gameSystem.isSubBattlePhase() === 'actor_target' || $gameSystem.isSubBattlePhase() === 'actor_target_spirit' || $gameSystem.isSubBattlePhase() === 'actor_map_target_confirm'
		if ($SRWGameState.canShowSummaries()) {
			var currentPosition = {x: $gamePlayer.posX(), y: $gamePlayer.posY()};
			$gameTemp.previousCursorPosition = currentPosition;
			var summaryUnit = $statCalc.activeUnitAtPosition(currentPosition);
			if(summaryUnit && ($gameSystem.isSubBattlePhase() !== 'actor_map_target_confirm' || $gameTemp.isMapTarget(summaryUnit.event.eventId()))){
				var previousUnit = $gameTemp.summaryUnit;
				$gameTemp.summaryUnit = summaryUnit;	
				if(!_this._summaryWindow.visible || $gameTemp.summaryUnit != previousUnit){
					_this._summaryWindow.show();
				}											
			}
		}
		
    };
	
	Scene_Map.prototype.startMapAttackResultDisplay = function(){
		$gameTemp.mapAttackEffectQueue = [];
		Object.keys($gameTemp.battleEffectCache).forEach(function(cacheRef){
			var battleEffect = $gameTemp.battleEffectCache[cacheRef];
			if(battleEffect.type == "defender"){
				var effect = {parameters: {target: battleEffect.ref}};
				if(battleEffect.isHit){
					effect.type = "damage";
					effect.parameters.damage = battleEffect.damageTaken;
				} else if(battleEffect.isDoubleImage){
					effect.type = "double_image";
				} else {
					effect.type = "miss";
				}				
				$gameTemp.mapAttackEffectQueue.push(effect);
			}
		});
		$gameTemp.battleEffectWindowIsOpen = false;
		$gameTemp.processingMapAttackEffect = false;
		$gameSystem.setSubBattlePhase('process_map_attack_queue');
	}
	
	Scene_Map.prototype.getAdjustedMapAttackCoordinates = function(originalCoordinates, direction){
		var result = JSON.parse(JSON.stringify(originalCoordinates));
		//default direction is right
		if(direction == "left"){
			for(var i = 0; i < result.length; i++){
				result[i][0]*=-1;
			}
		} 
		if(direction == "down" || direction == "up"){
			for(var i = 0; i < result.length; i++){
				var tmp = result[i][0];
				result[i][0] = result[i][1];
				result[i][1] = tmp;
			}
			if(direction == "up"){
				for(var i = 0; i < result.length; i++){
					result[i][1]*=-1;
				}
			}
		} 	
		return result;
	};
	
    //戦闘終了後の戦闘不能判定
    Scene_Map.prototype.srpgBattlerDeadAfterBattle = function() {
		var _this = this;
		$gameTemp.deathQueue = [];
		$gameTemp.destroyTransformQueue = [];
		
		Object.keys($gameTemp.battleEffectCache).forEach(function(cacheRef){
			var battleEffect = $gameTemp.battleEffectCache[cacheRef];
			if(battleEffect.isDestroyed){
				if(battleEffect.ref.SRWStats.mech.destroyTransformInto != null){
					//$statCalc.transformOnDestruction(battleEffect.ref);
					$gameTemp.destroyTransformQueue.push({actor: battleEffect.ref, event: battleEffect.ref.event});
				} else {
					//battleEffect.ref.event._erased = true;
					$gameTemp.deathQueue.push({actor: battleEffect.ref, event: $statCalc.getReferenceEvent(battleEffect.ref)});
					if($statCalc.isShip(battleEffect.ref)){
						var boardedUnits = $statCalc.getBoardedUnits(battleEffect.ref)
						for(var i = 0; i < boardedUnits.length; i++){
							$gameTemp.deathQueue.push({actor: boardedUnits[i], event: boardedUnits[i].event});
						}
					}
				}				
			}			
		});
		if($gameTemp.destroyTransformQueue.length){
			$gameSystem.setSubBattlePhase("process_destroy_transform_queue");
			this.eventBeforeDestruction();
		} else if($gameTemp.deathQueue.length){
			$gameSystem.setSubBattlePhase("process_death_queue");
			this.eventBeforeDestruction();
		} else {
			this.srpgAfterAction();
		}
    };

    //行動終了時の処理
    //戦闘終了の判定はイベントで行う。
    Scene_Map.prototype.srpgAfterAction = function() {		
	
		function processGains(battleEffect){
			var subPilots = $statCalc.getSubPilots(battleEffect.ref);
			var gainResults = [];
			subPilots.forEach(function(id){	
				if($gameActors.actor(id)){
					gainResults.push({actor: $gameActors.actor(id), expGain: 0, ppGain: battleEffect.ppGain});
				}				
			});
		
			var gainDonors = battleEffect.gainDonors;
			var itemDrops = [];
			gainDonors.forEach(function(gainDonor){
				if(gainDonor.isDestroyed){
					$statCalc.addKill(battleEffect.ref);
				}				
				var itemDrop = -1;
				if(gainDonor.isDestroyed){
					var items = $statCalc.getEquipInfo(gainDonor.ref);
					if(items[0]){
						itemDrop = items[0].idx;
					}
				}
				if(itemDrop != -1){
					$inventoryManager.addItem(itemDrop);
					itemDrops.push(itemDrop);
				}							
				
				gainResults.forEach(function(entry){	
					var gain = $battleCalc.performExpCalculation(entry.actor, gainDonor.ref);
					if(!gainDonor.isDestroyed){
						gain = Math.floor(gain/10);
					}
					entry.expGain+=gain;
				});
			});	

			if($statCalc.isMainTwin(battleEffect.ref)){
				var subTwin = battleEffect.ref.subTwin;
				var gainModifier = 0.75;
				if($statCalc.applyStatModsToValue(subTwin, 0, ["full_twin_gains"])){
					gainModifier = 1;
				}
				gainResults.unshift({actor: subTwin, expGain: Math.floor(battleEffect.expGain * gainModifier), ppGain: Math.floor(battleEffect.ppGain * gainModifier)});	
			}	
			
			gainResults.unshift({actor: battleEffect.ref, expGain: battleEffect.expGain, ppGain: battleEffect.ppGain});			
			
			var expResults = [];
			gainResults.forEach(function(entry){						
				$statCalc.addPP(entry.actor, battleEffect.ppGain);
				expResults.push({actor: entry.actor, details: $statCalc.addExp(entry.actor, entry.expGain)});				
			});				
			
			$gameTemp.rewardsInfo = {
				//actor: battleEffect.ref,
				levelResult: expResults,
				//expGain: battleEffect.expGain,
				//ppGain: battleEffect.ppGain,
				itemDrops: itemDrops,
				fundGain: battleEffect.fundGain,
				gainResults: gainResults
			};
		}
	
		function applyCostsToActor(actor, weapon, battleResult){
			if(actor && weapon && battleResult){			
				var targetActors = [actor];
				if(weapon.isCombination){
					targetActors  = targetActors.concat($statCalc.getCombinationWeaponParticipants(actor, weapon).participants);
				}
				targetActors.forEach(function(actor){
					if(actor && actor.SRWStats && actor.SRWStats.mech){
						var ENCost = battleResult.ENUsed;
						ENCost = $statCalc.applyStatModsToValue(actor, ENCost, ["EN_cost"]);
						if(battleResult.barrierCost){
							ENCost+=battleResult.barrierCost;
						}			
						actor.setMp(actor.mp - Math.floor(ENCost));
						if(weapon){
							weapon.currentAmmo-=battleResult.ammoUsed;
						}
					}					
				});	
			}			
		}
		function applyStatusConditions(attacker, defender, hasFury){
			var resistance = $statCalc.applyMaxStatModsToValue(defender, 0, ["status_resistance"]);
			if(resistance < 1 || (hasFury && resistance == 1)){			
				if($statCalc.applyStatModsToValue(attacker, 0, ["inflict_accuracy_down"])){
					$statCalc.setAccuracyDown(defender);
				}
				if($statCalc.applyStatModsToValue(attacker, 0, ["inflict_mobility_down"])){
					$statCalc.setMobilityDown(defender);
				}
				if($statCalc.applyStatModsToValue(attacker, 0, ["inflict_armor_down"])){
					$statCalc.setArmorDown(defender);
				}
				if($statCalc.applyStatModsToValue(attacker, 0, ["inflict_move_down"])){
					$statCalc.setMovementDown(defender);
				}
				if($statCalc.applyStatModsToValue(attacker, 0, ["inflict_attack_down"])){
					$statCalc.setAttackDown(defender);
				}
				if($statCalc.applyStatModsToValue(attacker, 0, ["inflict_range_down"])){
					$statCalc.setRangeDown(defender);
				}
				var SPReduction = $statCalc.applyStatModsToValue(attacker, 0, ["inflict_SP_down"]);
				$statCalc.applySPCost(defender, SPReduction);
				
				var willReduction = $statCalc.applyStatModsToValue(attacker, 0, ["inflict_will_down"]);
				$statCalc.modifyWill(defender, willReduction * -1);
			}
		}
		$gameTemp.clearMoveTable();
		if($gameTemp.mapAttackOccurred){
			Object.keys($gameTemp.battleEffectCache).forEach(function(cacheRef){
				var battleEffect = $gameTemp.battleEffectCache[cacheRef];
				if(battleEffect.ref && !battleEffect.ref.isActor()){
					battleEffect.ref.setSquadMode("normal");
				}
				if(battleEffect.attacked && battleEffect.attacked.ref && !battleEffect.attacked.ref.isActor()){
					battleEffect.attacked.ref.setSquadMode("normal");
				}
				applyCostsToActor(battleEffect.ref, battleEffect.action.attack, battleEffect);
				if(battleEffect.damageTaken){
					var oldHP = $statCalc.getCalculatedMechStats(battleEffect.ref).currentHP;
					battleEffect.ref.setHp(oldHP - battleEffect.damageTaken);
				}
				
				var defenderPersonalityInfo = $statCalc.getPersonalityInfo(battleEffect.ref);
				var attackerPersonalityInfo = $statCalc.getPersonalityInfo(battleEffect.attackedBy);
				
				if(battleEffect.attackedBy && battleEffect.isDestroyed){
					$statCalc.modifyWill(battleEffect.attackedBy.ref, Math.floor((attackerPersonalityInfo.destroy || 0) / 2));
					//$statCalc.modifyAllWill(battleEffect.isActor ? "actor" : "enemy", 1);	
					$statCalc.applyEnemyDestroyedWill($gameSystem.getFactionId(battleEffect.attackedBy.ref));	
				}
				if(battleEffect.isAttacked){		
					if(!battleEffect.isHit){
						$statCalc.modifyWill(battleEffect.ref, $statCalc.applyStatModsToValue(battleEffect.ref, 0, ["evade_will"]));
						$statCalc.modifyWill(battleEffect.ref, defenderPersonalityInfo.evade);
						$statCalc.incrementEvadeCount(battleEffect.ref);
					} else {						
						$statCalc.resetEvadeCount(battleEffect.ref);
					}					
				}
				if(battleEffect.isHit){		
					$statCalc.modifyWill(battleEffect.ref, defenderPersonalityInfo.damage);
					$statCalc.modifyWill(battleEffect.ref, $statCalc.applyStatModsToValue(battleEffect.ref, 0, ["damage_will"]));
					if(battleEffect.attackedBy){
						applyStatusConditions(battleEffect.attackedBy.ref, battleEffect.ref, battleEffect.hasFury);
					}					
				}
				if(battleEffect.type == "initiator"){
					$statCalc.clearNonMapAttackCounter(battleEffect.ref);
				}
				
				if(battleEffect.isActor && battleEffect.type == "initiator"){	
					processGains(battleEffect);
				}
			});	
			$gameTemp.mapAttackOccurred = false;
			if($gameTemp.isEnemyAttack){
				this.srpgAfterAction();
			} else {
				$gameParty.gainGold($gameTemp.rewardsInfo.fundGain);	
				$gameTemp.rewardsDisplayTimer = 20;	
				$gameSystem.setSubBattlePhase("rewards_display");				
				$gameTemp.pushMenu = "rewards";
			}			
		} else if($gameTemp.battleOccurred){
			var actorIsDestroyed = false;
			if($gameTemp.supportAttackCandidates){
				$gameTemp.supportAttackCandidates.forEach(function(candidate){
					candidate.actor.isSupport = false;
					if(candidate.actor.subTwin){
						candidate.actor.subTwin.isSupport = false;
					}
				});
			}
			Object.keys($gameTemp.battleEffectCache).forEach(function(cacheRef){
				var battleEffect = $gameTemp.battleEffectCache[cacheRef];
				
				if(battleEffect.ref){
					if(battleEffect.HPRestored){
						$statCalc.recoverHP(battleEffect.ref, battleEffect.HPRestored);
					}					
				}
				
				if(battleEffect.ref && !battleEffect.ref.isActor()){
					battleEffect.ref.setSquadMode("normal");
				}
				if(battleEffect.attacked && battleEffect.attacked.ref && !battleEffect.attacked.ref.isActor()){
					battleEffect.attacked.ref.setSquadMode("normal");
				}
				applyCostsToActor(battleEffect.ref, battleEffect.action.attack, battleEffect);
				if(battleEffect.hasActed && battleEffect.attacked){
					var oldHP = $statCalc.getCalculatedMechStats(battleEffect.attacked.ref).currentHP;
					battleEffect.attacked.ref.setHp(oldHP - battleEffect.damageInflicted);
				}
				if(battleEffect.hasActed && battleEffect.attacked_all_sub){
					var oldHP = $statCalc.getCalculatedMechStats(battleEffect.attacked_all_sub.ref).currentHP;
					battleEffect.attacked_all_sub.ref.setHp(oldHP - battleEffect.damageInflicted_all_sub);
				}
				
				var personalityInfo = $statCalc.getPersonalityInfo(battleEffect.ref);
				
				
				if(battleEffect.attacked && battleEffect.attacked.isDestroyed){					
					$statCalc.modifyWill(battleEffect.ref, personalityInfo.destroy || 0);
					//$statCalc.modifyAllWill(battleEffect.isActor ? "actor" : "enemy", 1);	
					$statCalc.applyEnemyDestroyedWill($gameSystem.getFactionId(battleEffect.ref));	
				}	
				if(battleEffect.isAttacked){		
					if(!battleEffect.isHit){
						;
						$statCalc.incrementEvadeCount(battleEffect.ref);
					} else {
						$statCalc.resetEvadeCount(battleEffect.ref);
					}					
				}
				if(battleEffect.isHit){		
					
				}
				if(battleEffect.attacked){	
					var defenderPersonalityInfo = $statCalc.getPersonalityInfo(battleEffect.attacked.ref);
					if(battleEffect.attacked.isHit){
						$statCalc.modifyWill(battleEffect.ref, personalityInfo.hit || 0);
						$statCalc.modifyWill(battleEffect.ref, $statCalc.applyStatModsToValue(battleEffect.ref, 0, ["hit_will"]));

						$statCalc.modifyWill(battleEffect.attacked.ref, defenderPersonalityInfo.damage || 0);
						$statCalc.modifyWill(battleEffect.attacked.ref, $statCalc.applyStatModsToValue(battleEffect.attacked.ref, 0, ["damage_will"]));						
						
						applyStatusConditions(battleEffect.ref, battleEffect.attacked.ref, battleEffect.hasFury);
					} else {
						
						$statCalc.modifyWill(battleEffect.attacked.ref, defenderPersonalityInfo.evade || 0)
						$statCalc.modifyWill(battleEffect.attacked.ref, $statCalc.applyStatModsToValue(battleEffect.attacked.ref, 0, ["evade_will"]));
									
						$statCalc.modifyWill(battleEffect.ref, personalityInfo.miss || 0);
					}					
				}			
				if(battleEffect.type == "initiator"){
					$statCalc.incrementNonMapAttackCounter(battleEffect.ref);
				}
				if(battleEffect.isActor && (battleEffect.type == "initiator" || battleEffect.type == "defender")){
					if(battleEffect.isDestroyed) {
						actorIsDestroyed = true;
					} else {
						processGains(battleEffect);
					}						
				}
				
				if(battleEffect.isAttacked){
					$statCalc.clearSpirit(battleEffect.ref, "alert");
				}
				if(battleEffect.isHit){
					$statCalc.clearSpirit(battleEffect.ref, "persist");
				}
				if(battleEffect.type == "support attack"){
					$statCalc.incrementSupportAttackCounter(battleEffect.ref);
				}
				if(battleEffect.type == "support defend" && battleEffect.hasActed){
					$statCalc.incrementSupportDefendCounter(battleEffect.ref);
				}
				if($statCalc.getCalculatedMechStats(battleEffect.ref).currentHP <= 100000){
					$statCalc.setRevealed(battleEffect.ref);
				}	
				if(battleEffect.attacked && battleEffect.attacked.ref && $statCalc.getCalculatedMechStats(battleEffect.attacked.ref).currentHP <= 100000){
					$statCalc.setRevealed(battleEffect.attacked.ref);
				}
			});
			$gameTemp.battleOccurred = false;
			$gameTemp.currentBattleResult = null;
			if(actorIsDestroyed){				
				this.srpgPrepareNextAction();
			} else if($gameTemp.rewardsInfo){
				$gameParty.gainGold($gameTemp.rewardsInfo.fundGain);	
				$gameTemp.rewardsDisplayTimer = 20;
				$gameSystem.setSubBattlePhase("rewards_display");				
				/*this._rewardsWindow.refresh();
				//this._rewardsWindow.open();
				this._rewardsWindow.show();
				this._rewardsWindow.activate();	*/
				$gameTemp.pushMenu = "rewards";
			} else {
				this.srpgPrepareNextAction();
			}						
		} else {
			this.srpgPrepareNextAction();
		}
		$statCalc.resetCurrentAttack($gameTemp.currentBattleActor);	
		$statCalc.resetCurrentAttack($gameTemp.currentBattleEnemy);	
	}	
	
	Scene_Map.prototype.srpgPrepareNextAction = function(){
		$gameTemp.rewardsInfo = null;	
		var battler = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		if(!$gameTemp.isPostMove && $statCalc.applyStatModsToValue(battler, 0, ["hit_and_away"])){
			$gameTemp.isHitAndAway = true;
			$gamePlayer.locate($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
			$gameSystem.setSrpgActorCommandWindowNeedRefresh($gameSystem.EventToUnit($gameTemp.activeEvent().eventId()));
			$gameSystem.setSubBattlePhase('actor_command_window');			
			return;
		}
		
       
        battler.srpgCheckFloorEffect($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
		
		if($gameTemp.isPostMove){
			$statCalc.clearSpirit(battler, "accel");
			$statCalc.clearSpirit(battler, "charge");
		}
        
		var hasDefeatedOpponent;
		var battleEffect;
		if($gameTemp.battleEffectCache){
			battleEffect = $gameTemp.battleEffectCache[battler._cacheReference];
		}		
		
		if(battleEffect && battleEffect.attacked){
			hasDefeatedOpponent	= battleEffect.attacked.isDestroyed;
		}		
		var hasContinuousAction = $statCalc.applyStatModsToValue(battler, 0, ["continuous_action"]) && !$statCalc.hasUsedContinuousAction(battler);
		
		if(hasDefeatedOpponent && hasContinuousAction){
			$statCalc.setHasUsedContinuousAction(battler);
		} else if($statCalc.getActiveSpirits(battler).zeal){
			$statCalc.clearSpirit(battler, "zeal");
		} else if($statCalc.consumeAdditionalAction(battler)){
			//do not end turn if an action could be consumed
		} else {
			if (battler.SRPGActionTimes() <= 1) {
				battler.setSrpgTurnEnd(true);
			} else {
				battler.useSRPGActionTimes(1);
			}
		}	
        
        $gameSystem.clearSrpgActorCommandWindowNeedRefresh();
        $gameSystem.clearSrpgActorCommandStatusWindowNeedRefresh();        
        $gameTemp.clearTargetEvent();
        $gameParty.clearSrpgBattleActors();
        $gameTroop.clearSrpgBattleEnemys();
        this.eventAfterAction();
        if ($gameSystem.isBattlePhase() === 'actor_phase') {
            this.eventUnitEvent();
        }
        $gameTemp.clearActiveEvent();
        if ($gameSystem.isBattlePhase() === 'actor_phase') {
            if (this.isSrpgActorTurnEnd()) {
                $gameSystem.srpgStartEnemyTurn(0); //自動行動のアクターが行動する
            } else {
                $gameSystem.setSubBattlePhase('normal');
            }
        } else if ($gameSystem.isBattlePhase() === 'auto_actor_phase') {
            $gameSystem.setSubBattlePhase('auto_actor_command');
        } else if ($gameSystem.isBattlePhase() === 'AI_phase') {
            $gameSystem.setSubBattlePhase('enemy_command');
        }
    };

    //ユニットイベントの実行
    Scene_Map.prototype.eventUnitEvent = function() {
        $gameMap.eventsXy($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY()).forEach(function(event) {
            if (event.isType() === 'unitEvent') {
                if (event.pageIndex() >= 0) event.start();
                $gameTemp.pushSrpgEventList(event);
                $gameSystem.pushSearchedItemList([$gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY()]);
            }
        });
    };

    //行動前イベントの実行
    Scene_Map.prototype.eventBeforeBattle = function() {
        $gameMap.events().forEach(function(event) {
            if (event.isType() === 'beforeBattle') {
                if (event.pageIndex() >= 0) event.start();
                $gameTemp.pushSrpgEventList(event);
            }
        });
		if ($gameTemp.isSrpgEventList()) {
            var event = $gameTemp.shiftSrpgEventList();
            if (event.isStarting()) {
                event.clearStartingFlag();
                $gameMap._interpreter.setup(event.list(), event.eventId());
            }
        }
    };
	
	Scene_Map.prototype.eventBeforeDestruction = function() {
        $gameMap.events().forEach(function(event) {
            if (event.isType() === 'beforeDestruction') {
                if (event.pageIndex() >= 0) event.start();
                $gameTemp.pushSrpgEventList(event);
            }
        });
		if ($gameTemp.isSrpgEventList()) {
            var event = $gameTemp.shiftSrpgEventList();
            if (event.isStarting()) {
                event.clearStartingFlag();
                $gameMap._interpreter.setup(event.list(), event.eventId());
            }
        }
    };

    //行動後イベントの実行
    Scene_Map.prototype.eventAfterAction = function() {
        $gameMap.events().forEach(function(event) {
            if (event.isType() === 'afterAction') {
                if (event.pageIndex() >= 0) event.start();
                $gameTemp.pushSrpgEventList(event);
            }
        });
    };

    //アクターターン終了の判定
    Scene_Map.prototype.isSrpgActorTurnEnd = function() {
        /*return $gameMap.events().some(function(event) {
            var battlerArray = $gameSystem.EventToUnit(event._eventId);
            if (battlerArray && battlerArray[0] === 'actor') {
                return battlerArray[1].canInput();
            }
        });*/
		return $gameTemp.isTurnEndFlag();
    };

    //アクターコマンド・攻撃
    Scene_Map.prototype.commandAttack = function() {
		var _this = this
        var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
       /* this._attackWindow.setActor(actor);
        this._attackWindow.setStypeId(this._mapSrpgActorCommandWindow.currentExt());
        this._attackWindow.refresh();
        this._attackWindow.show();
        this._attackWindow.activate();*/
		
		$gameTemp.summaryUnit = null;
		
		$gameTemp.showAllyAttackIndicator = true;
		$gameTemp.showAllyDefendIndicator = false;
		$gameTemp.showEnemyAttackIndicator = false;
		$gameTemp.showEnemyDefendIndicator = true;
		
		
		var actionBattlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
		$gameTemp.currentMenuUnit = {
			actor: actionBattlerArray[1],
			mech: actionBattlerArray[1].SRWStats.mech
		};
		$gameTemp.attackWindowCallback = function(attack){
			$gameTemp.popMenu = true;	
			$gameTemp.actorAction.type = "attack";  
			$gameTemp.actorAction.attack = attack;
			_this.startActorTargeting();
		};		
		$gameTemp.attackWindowCancelCallback = function(){						
			_this._mapSrpgActorCommandWindow.activate();			 
		}
		
		$gameTemp.pushMenu = "attack_list";
    };

    //アクターコマンド・スキル
    Scene_Map.prototype.commandSkill = function() {
        var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
        this._skillWindow.setActor(actor);
        this._skillWindow.setStypeId(this._mapSrpgActorCommandWindow.currentExt());
        this._skillWindow.refresh();
        this._skillWindow.show();
        this._skillWindow.activate();
    };

    //アクターコマンド・アイテム
    Scene_Map.prototype.commandItem = function() {
        this._itemWindow.refresh();
        this._itemWindow.show();
        this._itemWindow.activate();
    };
	
	 Scene_Map.prototype.commandAbility = function() {
        this._abilityWindow.refresh();
        this._abilityWindow.show();
        this._abilityWindow.activate();
    };
	
	

    //アクターコマンド・装備
    Scene_Map.prototype.commandEquip = function() {
        SceneManager.push(Scene_Equip);
    };

    //アクターコマンド・待機
    Scene_Map.prototype.commandWait = function() {
		$gameTemp.isPostMove = true;
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		$statCalc.clearTwinPositionInfo(actor);
		actor.onAllActionsEnd();
		this.srpgAfterAction();		       
    };
	
	Scene_Map.prototype.commandLand = function() {
        var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		$statCalc.setFlying(actor, false);
        this._mapSrpgActorCommandWindow.refresh();
		this._mapSrpgActorCommandWindow.activate();
    };
	
	Scene_Map.prototype.commandFly = function() {
        var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		$statCalc.setFlying(actor, true);
        this._mapSrpgActorCommandWindow.refresh();
		this._mapSrpgActorCommandWindow.activate();
    };
	
	Scene_Map.prototype.commandSpirit = function() {
		var actionBattlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
		$gameTemp.currentMenuUnit = {
			actor: actionBattlerArray[1],
			mech: actionBattlerArray[1].SRWStats.mech
		};
		$gameTemp.pushMenu = "spirit_selection";
		this._mapSrpgActorCommandWindow.hide()
    };	
	
	Scene_Map.prototype.commandDeploy = function() {
		var _this = this;
		var actionBattlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
		this._deploySelectionWindow.setAvailableUnits($statCalc.getBoardedUnits(actionBattlerArray[1]));
		this._deploySelectionWindow.setCurrentSelection(0);
      	$gameTemp.pushMenu = "boarded_deploy_selection";
		//this._mapSrpgActorCommandWindow.hide();
		//this._mapSrpgActorCommandWindow.close();
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh(actionBattlerArray[1]);
		
		$gameTemp.deployWindowCallback = function(deployed){
			var shipEvent = $gameTemp.activeEvent();
			$gameTemp.activeShip = {position: {x: shipEvent.posX(), y: shipEvent.posY()}, actor: $gameSystem.EventToUnit(shipEvent.eventId())[1], event: $gameTemp.activeEvent()};
			
			$statCalc.removeBoardedUnit(deployed.actor, $gameTemp.activeShip.actor);				
			var event = deployed.actor.event;
			event.locate($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
			event.appear();					
			$gameMap.setEventImages();	
			
			$gameTemp.setActiveEvent(event);			
			var actor = $gameSystem.EventToUnit(event.eventId())[1];
			//$gameSystem.srpgMakeMoveTable(event);
			var battlerArray = actor;		
			$gameSystem.setSrpgActorCommandWindowNeedRefresh($gameSystem.EventToUnit($gameTemp.activeEvent().eventId()));
			
			//$gameSystem.setSubBattlePhase('actor_move');
		}
		
		$gameTemp.deployCancelWindowCallback = function(){
			$gameSystem.setSrpgActorCommandWindowNeedRefresh($gameSystem.EventToUnit($gameTemp.activeEvent().eventId()));
		}
    };	
	
	Scene_Map.prototype.commandBoard = function() {
		var event = $gameTemp.activeEvent();
       	var actionBattlerArray = $gameSystem.EventToUnit(event.eventId());
		/*$gameTemp.currentMenuUnit = {
			actor: actionBattlerArray[1],
			mech: actionBattlerArray[1].SRWStats.mech
		};
		$gameTemp.pushMenu = "spirit_selection";
		this._mapSrpgActorCommandWindow.hide()*/
		if($gameTemp.targetShip){
			$statCalc.addBoardedUnit(actionBattlerArray[1], $gameTemp.targetShip.actor);
			$gameSystem.setSrpgWaitMoving(true);
            event.srpgMoveToPoint($gameTemp.targetShip.position);
			$gameTemp.clearMoveTable();
			$gameTemp.eraseActorAfterTurn = true;
			$gameSystem.setSubBattlePhase('end_actor_turn');
			$gameTemp.targetShip = null;
		}
    };	
	
	Scene_Map.prototype.commandHeal = function() {
        //var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		var event = $gameTemp.activeEvent();
		var battler = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		$gameTemp.supportType = "heal";        
		$gameTemp.clearMoveTable();
        $gameTemp.initialRangeTable(event.posX(), event.posY(), 1);
        event.makeRangeTable(event.posX(), event.posY(), 1, [0], event.posX(), event.posY(), null);
        $gameTemp.minRangeAdapt(event.posX(), event.posY(), 0);
        $gameTemp.pushRangeListToMoveList();
        $gameTemp.setResetMoveList(true);
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		$gameSystem.setSubBattlePhase('actor_support');
    };	
	
	Scene_Map.prototype.commandResupply = function() {
        //var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		var event = $gameTemp.activeEvent();
		var battler = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		$gameTemp.supportType = "resupply";        
		$gameTemp.clearMoveTable();
		if(!$statCalc.applyStatModsToValue(battler, 0, ["all_range_resupply"])){			
			$gameTemp.initialRangeTable(event.posX(), event.posY(), 1);
			event.makeRangeTable(event.posX(), event.posY(), 1, [0], event.posX(), event.posY(), null);
			 $gameTemp.minRangeAdapt(event.posX(), event.posY(), 0);
			$gameTemp.pushRangeListToMoveList();
			$gameTemp.setResetMoveList(true);
		}           
       
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		$gameSystem.setSubBattlePhase('actor_support');
    };	
	
	//command version of actor movement
	Scene_Map.prototype.commandMove = function() {
		var event = $gameTemp.activeEvent();
        var actor = $gameSystem.EventToUnit(event.eventId())[1];
        $gameSystem.srpgMakeMoveTable(event);
		var battlerArray = actor;		
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		$gameSystem.setSubBattlePhase('actor_move');
    };

	Scene_Map.prototype.transformActorMenuCommand = function() {   
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		var list = $statCalc.getTransformationList(actor);
		if(list.length == 1){
			$statCalc.transform(actor);
			$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
			$gameSystem.setSubBattlePhase('normal');
			var se = {};
			se.name = 'SRWTransform';
			se.pan = 0;
			se.pitch = 100;
			se.volume = 80;
			AudioManager.playSe(se);	
		} else {
			this._transformWindow.refresh();
			this._transformWindow.show();
			this._transformWindow.activate();
		}		
    };	
	
	Scene_Map.prototype.swapActorMenuCommand = function() {   
		$statCalc.swap($gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1]);
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		$gameSystem.setSubBattlePhase('normal');
    };
	
	Scene_Map.prototype.separateActorMenuCommand = function() {   
		$statCalc.separate($gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1]);
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		$gameSystem.setSubBattlePhase('normal');
    };	
	
	Scene_Map.prototype.joinActorMenuCommand = function() {   
		//$statCalc.separate($gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1]);
		
		$gameSystem.highlightedActionTiles = [];
		$gameSystem.highlightsRefreshed = true;
		var x = $gameTemp.activeEvent().posX();
		var y = $gameTemp.activeEvent().posY();
		
		$gameSystem.highlightedActionTiles.push({x: x-1, y: y+1, color: "#009bff"});
		$gameSystem.highlightedActionTiles.push({x: x, y: y+1, color: "#009bff"});
		$gameSystem.highlightedActionTiles.push({x: x+1, y: y+1, color: "#009bff"});
		$gameSystem.highlightedActionTiles.push({x: x-1, y: y, color: "#009bff"});
		$gameSystem.highlightedActionTiles.push({x: x+1, y: y, color: "#009bff"});
		$gameSystem.highlightedActionTiles.push({x: x-1, y: y-1, color: "#009bff"});
		$gameSystem.highlightedActionTiles.push({x: x, y: y-1, color: "#009bff"});
		$gameSystem.highlightedActionTiles.push({x: x+1, y: y-1, color: "#009bff"});
		
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		$gameSystem.setSubBattlePhase('twin_selection');
    };	
	
	Scene_Map.prototype.splitActorMenuCommand = function() {   
		$statCalc.split($gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1]);
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		$gameSystem.setSubBattlePhase('normal');
		var se = {};
		se.name = 'SRWTransform';
		se.pan = 0;
		se.pitch = 100;
		se.volume = 80;
		AudioManager.playSe(se);
    };
	
	Scene_Map.prototype.combineActorMenuCommand = function() {   
		$statCalc.combine($gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1]);
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		$gameSystem.setSubBattlePhase('normal');
		var se = {};
		se.name = 'SRWTransform';
		se.pan = 0;
		se.pitch = 100;
		se.volume = 80;
		AudioManager.playSe(se);
    };
		
	Scene_Map.prototype.persuadeActorMenuCommand = function() {
		$gameTemp.isPostMove = true;
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		var persuadeOption = $gameSystem.getPersuadeOption(actor);
		$gameVariables.setValue(persuadeOption.controlVar, 1);
		actor.onAllActionsEnd();
		this.srpgAfterAction();	       
    };

    //アクターコマンド・キャンセル
    Scene_Map.prototype.cancelActorMenuCommand = function() {
        $gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		if($gameTemp.activeShip && !$gameTemp.isPostMove){
			var event = $gameTemp.activeEvent();
			var actor = $gameSystem.EventToUnit(event.eventId())[1];
			$statCalc.addBoardedUnit(actor, $gameTemp.activeShip.actor);			
			//event.locate($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
			event.erase();					
			//$gameMap.setEventImages();	
			$gameTemp.setActiveEvent($gameTemp.activeShip.actor.event);
			$gameTemp.forceActorMenuRefresh = true;
			$gameSystem.setSrpgActorCommandWindowNeedRefresh($gameSystem.EventToUnit($gameTemp.activeEvent().eventId()));
				
			$gameTemp.activeShip = null;
		} else if($gameSystem.isSubBattlePhase() == "confirm_boarding"){
			$gameSystem.setSubBattlePhase('actor_move');
		} else if($gameTemp.isPostMove){
			$gameSystem.setSubBattlePhase('actor_move');
			if($gameTemp.hasTwinned){
				$gameTemp.hasTwinned = false;
				$statCalc.separate($gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1]);
			}
			//var event = $gameTemp.activeEvent();
			//event.locate($gameTemp.originalPos()[0], $gameTemp.originalPos()[1]);
		} else {
			$gameTemp.clearActiveEvent();
			$gameSystem.setSubBattlePhase('normal');
		}        
    };

	
   
	
	Scene_Map.prototype.onConsumableOk = function() {
        var item = this._itemWindow.item();		
        var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		$statCalc.setConsumableUsed(actor, item.listIdx);
        $itemEffectManager.applyConsumable(actor, item.itemIdx);
        this._itemWindow.hide();
		//this._mapSrpgActorCommandWindow.setup(actor);
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		$gameSystem.setSubBattlePhase('normal');
    };
	

    //アイテムコマンド・キャンセル
    Scene_Map.prototype.onItemCancel = function() {
        this._itemWindow.hide();
        this._mapSrpgActorCommandWindow.activate();
    };
	
	Scene_Map.prototype.onAbilityOk = function() {
        var item = this._abilityWindow.item();		
		var itemDef = $abilityCommandManger.getAbilityDef(item);
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		if(itemDef && itemDef.isActiveHandler(actor)){			
			$statCalc.setAbilityUsed(actor, item);
			itemDef.statmodHandler(actor);
       
			this._abilityWindow.hide();
			$gameSystem.clearSrpgActorCommandWindowNeedRefresh();				
			
			if(itemDef.animId != null && itemDef.animId != -1){
				$gameSystem.setSubBattlePhase('await_character_anim');	
				$gameTemp.animCharacter = actor.event;
				actor.event.requestAnimation(itemDef.animId);
			}			
		} else {
			this._abilityWindow.activate();
		}
    };
	
	Scene_Map.prototype.onTransformOk = function() {
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
        var item = this._transformWindow.item();		
		$statCalc.transform(actor, 0, true, item);
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		$gameSystem.setSubBattlePhase('normal');
		var se = {};
		se.name = 'SRWTransform';
		se.pan = 0;
		se.pitch = 100;
		se.volume = 80;
		AudioManager.playSe(se);
		this._transformWindow.hide();
    };
	
	Scene_Map.prototype.onAbilityCancel = function() {
        this._abilityWindow.hide();
        this._mapSrpgActorCommandWindow.activate();
    };
	
	Scene_Map.prototype.onTransformCancel = function() {
        this._transformWindow.hide();
        this._mapSrpgActorCommandWindow.activate();
    };
	
	Scene_Map.prototype.getMapAttackTargets = function(originEvent, attack, type, direction) {
		var _this = this;	
		var result = [];
		var deltaX = originEvent.posX();
		var deltaY = originEvent.posY();
		
		var mapAttackDef = $mapAttackManager.getDefinition(attack.mapId);
		
		var tileCoordinates = JSON.parse(JSON.stringify(mapAttackDef.shape));		
		tileCoordinates = _this.getAdjustedMapAttackCoordinates(tileCoordinates, direction);
		for(var i = 0; i < tileCoordinates.length; i++){
			tileCoordinates[i].push(true); //is attack range
			tileCoordinates[i][0]+=deltaX;
			tileCoordinates[i][1]+=deltaY;
			//$gameTemp.pushMoveList(tileCoordinates[i]);					
		}			
		
		if(mapAttackDef.retargetInfo){
			for(var i = 0; i < tileCoordinates.length; i++){
				var deltaX = tileCoordinates[i][0] - mapAttackDef.retargetInfo.center.x;
				var deltaY = tileCoordinates[i][1] - mapAttackDef.retargetInfo.center.y;
				var retargetCoordinates = JSON.parse(JSON.stringify(mapAttackDef.retargetInfo.shape));
				
				for(var j = 0; j < retargetCoordinates.length; j++){
					retargetCoordinates[j][0]+=deltaX;
					retargetCoordinates[j][1]+=deltaY;			
				}
				var targets = $statCalc.activeUnitsInTileRange(retargetCoordinates || [], type);
				var tmp = [];
				for(var j = 0; j < targets.length; j++){
					var terrain = $statCalc.getCurrentTerrain(targets[j]);					
					var terrainRank = attack.terrain[terrain];
					if(terrainRank != "-"){
						tmp.push(targets[j]);
					}
				}
				result.push({position: {x: tileCoordinates[i][0], y: tileCoordinates[i][1]}, direction: direction, targets: tmp});
			}
		} else {
			var targets = $statCalc.activeUnitsInTileRange(tileCoordinates || [], type);
			var tmp = [];
			for(var i = 0; i < targets.length; i++){
				var terrain = $statCalc.getCurrentTerrain(targets[i]);					
				var terrainRank = attack.terrain[terrain];
				if(terrainRank != "-"){
					tmp.push(targets[i]);
				}
			}
			result.push({targets: tmp, direction: direction});
		}
		return result;
	}
	
	Scene_Map.prototype.getBestMapAttackTargets = function(originEvent, attack, type) {
		var _this = this;				
			
		var directions = ["up", "down", "left", "right"];
		var maxTargets = -1;
		var bestDirection = "up";
		var bestPosition;
		var bestTargets = [];
		
		directions.forEach(function(direction){		
			var targetResults = _this.getMapAttackTargets(originEvent, attack, type, direction);
			targetResults.forEach(function(targetResult){
				if(targetResult.targets.length > maxTargets){
					maxTargets = targetResult.targets.length;
					bestDirection = targetResult.direction;
					bestPosition = targetResult.position;
					bestTargets = targetResult.targets;
				}
			});
			
		});
		return {targets: bestTargets, direction: bestDirection, bestPosition: bestPosition};
	}
    //ターゲットの選択開始
    Scene_Map.prototype.startActorTargeting = function() {
		var _this = this;
        var event = $gameTemp.activeEvent();
        var battler = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
        var weapon = $gameTemp.actorAction.attack;
		if(weapon.isMap){
			$gameTemp.currentBattleActor = battler;			
			var type;
			if(battler.isActor()){
				type = "enemy";
			} else {
				type = "actor";
			}
			
			$gameTemp.mapTargetDirection = this.getBestMapAttackTargets(event, weapon, type).direction;			
			$statCalc.setCurrentAttack(battler, weapon);
			$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
			$gameTemp.OKHeld = true;
			Input.clear();
			$gameSystem.setSubBattlePhase('actor_map_target');
		} else {
			var range = $statCalc.getRealWeaponRange(battler, weapon);
			var minRange = $statCalc.getRealWeaponMinRange(battler, weapon);
			
			this.setUpAttackRange(event.posX(), event.posY(), range, minRange);
			
			$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
			$gameSystem.targetLRId = -1;
			$gameSystem.setSubBattlePhase('actor_target');
		}		
    };
	
	Scene_Map.prototype.setUpAttackRange = function(x, y, range, minRange) {
		$gameTemp.validTiles = {};
		$gameSystem.highlightedTiles = [];
		$gameSystem.highlightsRefreshed = true;
		$gameTemp.disableHighlightGlow = true;
		for(var i = range * -1; i <= range; i++){
			for(var j = range * -1; j <= range; j++){
				var distance = Math.abs(i) + Math.abs(j);
				if(distance <= range && distance >= minRange){
					var realX = x - i;
					var realY = y - j;
					if(realX >= 0 && realX < $gameMap.width() && realY >=0 && realY <= $gameMap.height()){
						if(!$gameTemp.validTiles[realX]){
							$gameTemp.validTiles[realX] = {};
						}
						$gameTemp.validTiles[realX][realY] = true;
						$gameSystem.highlightedTiles.push({x: realX, y: realY, color: "#ff3a3a"});
					}					
				}
			}
		}	
	}

    //戦闘開始コマンド・戦闘開始
    Scene_Map.prototype.commandBattleStart = function() {
        var actionArray = $gameSystem.srpgBattleWindowNeedRefresh()[1];
		var targetArray = $gameSystem.srpgBattleWindowNeedRefresh()[2];			

        $gameSystem.setSubBattlePhase('invoke_action');
        this.srpgBattleStart(actionArray, targetArray);
    };
	
	Scene_Map.prototype.selectCounterAction = function() {		
		this._counterWindow.show();
		this._counterWindow.activate();
	}	

    //戦闘開始コマンド・キャンセル
    Scene_Map.prototype.selectPreviousSrpgBattleStart = function() {
		if(!$gameTemp.isEnemyAttack){		
			var battlerArray = $gameSystem.srpgBattleWindowNeedRefresh()[1];
			$gameTemp.setSrpgDistance(0);
			$gameTemp.setSrpgSpecialRange(true);
			$gameTemp.clearTargetEvent();
			$gameSystem.setSubBattlePhase('actor_target');
		}
    };

    //メニューからのターン終了処理
    Scene_Map.prototype.menuActorTurnEnd = function() {
        for (var i = 1; i <= $gameMap.isMaxEventId(); i++) {
            var event = $gameMap.event(i);
            if (event && !event.isErased() && (event.isType() === 'actor' || event.isType() === 'ship'  || event.isType() === 'ship_event')) {
                var battlerArray =  $gameSystem.EventToUnit(event.eventId());
				if(battlerArray){
					var actor = battlerArray[1];
					if (actor && actor.canInput() == true && !actor.srpgTurnEnd()) {
						if ($gameTemp.isAutoBattleFlag() == true) {
							actor.addState(_srpgAutoBattleStateId);
						} else {
							$gameTemp.setActiveEvent(event);
							actor.onAllActionsEnd();
							actor.useSRPGActionTimes(99);
							this.srpgAfterAction();
						}
					}
				}				
            }
        }
        $gameTemp.setAutoBattleFlag(false);
        if ($gameSystem.isBattlePhase() === 'actor_phase') {
            if (this.isSrpgActorTurnEnd()) {
                $gameSystem.srpgStartEnemyTurn(0); //自動行動のアクターが行動する
            } else {
                $gameSystem.setSubBattlePhase('normal');
            }
        } else if ($gameSystem.isBattlePhase() === 'AI_phase') {
            $gameSystem.setSubBattlePhase('enemy_command');
        }
        $gameTemp.setTurnEndFlag(false); // 処理終了
        return;
    };

    //アクターコマンドからの装備変更の後処理
    Scene_Map.prototype.srpgAfterActorEquip = function() {
        var event = $gameTemp.activeEvent();
        var battlerArray = $gameSystem.EventToUnit(event.eventId());
        $gameTemp.clearMoveTable();
        $gameTemp.initialMoveTable($gameTemp.originalPos()[0], $gameTemp.originalPos()[1], battlerArray[1].srpgMove());
        event.makeMoveTable($gameTemp.originalPos()[0], $gameTemp.originalPos()[1], $statCalc.getCurrentMoveRange(battlerArray[1]), [0], battlerArray[1]);
        var list = $gameTemp.moveList();
        for (var i = 0; i < list.length; i++) {
            var pos = list[i];
            event.makeRangeTable(pos[0], pos[1], battlerArray[1].srpgWeaponRange(), [0], pos[0], pos[1], $dataSkills[battlerArray[1].attackSkillId()]);
        }
        $gameTemp.pushRangeListToMoveList();
        $gameTemp.setResetMoveList(true);
        $gameTemp.setSrpgActorEquipFlag(false); // 処理終了
        return;
    };

    //自動行動アクターの行動決定
    Scene_Map.prototype.srpgInvokeAutoActorCommand = function() {
		
        for (var i = 1; i <= $gameMap.isMaxEventId() + 1; i++) {
            var event = $gameMap.event(i);
            if (event && !event.isErased() && (event.isType() === 'actor' || event.isType() === 'ship'  || event.isType() === 'ship_event')) {
                var battlerArray =  $gameSystem.EventToUnit(event.eventId());
				if(battlerArray){
					var actor = battlerArray[1];
					if (actor && actor.canMove() == true && !actor.srpgTurnEnd()) {
						break;
					}
				}
            }
            if (i > $gameMap.isMaxEventId()) {
                $gameSystem.srpgStartEnemyTurn(0); // エネミーターンの開始
                return;
            }
        }
        actor.makeActions();
        if (actor.isConfused()) {
            actor.makeConfusionActions();
        }
        if (_srpgStandUnitSkip === 'true' && actor.battleMode() === 'stand') {
            var targetType = this.makeTargetType(actor, 'actor');
            $gameTemp.setActiveEvent(event);
            $gameSystem.srpgMakeMoveTable(event);
            var canAttackTargets = this.srpgMakeCanAttackTargets(enemy, targetType); //行動対象としうるユニットのリストを作成
            $gameTemp.clearMoveTable();
            if (canAttackTargets.length === 0) {
                $gameTemp.setActiveEvent(event);
                actor.onAllActionsEnd();
                this.srpgAfterAction();
                return;
            }
        }
        if (actor.action(0).item()) {
            $gameTemp.setAutoMoveDestinationValid(true);
            $gameTemp.setAutoMoveDestination(event.posX(), event.posY());
            $gameTemp.setActiveEvent(event);
            $gameSystem.setSubBattlePhase('auto_actor_move');
        } else {
            $gameTemp.setActiveEvent(event);
            actor.onAllActionsEnd();
            this.srpgAfterAction();
        }
    };

    //自動行動アクターの移動先決定と移動実行
    Scene_Map.prototype.srpgInvokeAutoActorMove = function() {
        var event = $gameTemp.activeEvent();
        var type = $gameSystem.EventToUnit(event.eventId())[0];
        var actor = $gameSystem.EventToUnit(event.eventId())[1];
        var targetType = this.makeTargetType(actor, type);
        $gameSystem.srpgMakeMoveTable(event);
        this.srpgPriorityTarget(actor); //優先ターゲットの設定
        var canAttackTargets = this.srpgMakeCanAttackTargets(actor, targetType); //行動対象としうるユニットのリストを作成
        var targetEvent = this.srpgDecideTarget(canAttackTargets, event, targetType); //ターゲットの設定
        $gameTemp.setTargetEvent(targetEvent);
        if ($gameTemp.isSrpgBestSearchFlag() == true) {
            $gameTemp.setSrpgBestSearchFlag(false);
            $gameSystem.srpgMakeMoveTable(event);
        }
        var optimalPos = this.srpgSearchOptimalPos(targetEvent, actor, type);
        var route = $gameTemp.MoveTable(optimalPos[0], optimalPos[1])[1];
        $gameSystem.setSrpgWaitMoving(true);
        event.srpgMoveRouteForce(route);
        $gameSystem.setSubBattlePhase('auto_actor_action');
    };

    //エネミーの行動決定
    Scene_Map.prototype.srpgInvokeAICommand = function() {
		if($gameTemp.currentFaction == -1){
			var enemy;
			var ctr = 0;
			while(!enemy && ctr < $gameTemp.AIActors.length){
				var event = $gameTemp.AIActors[ctr];	
				var candidate = $gameSystem.EventToUnit(event.eventId())[1];
				if (!$statCalc.hasEndedTurn(candidate)) {
					enemy = candidate;
				}	
				ctr++;	
			}	

			if (!enemy) {
				$gameSystem.setBattlePhase('actor_phase');
				$gameSystem.setSubBattlePhase('initialize');				
				return;
			}	
		} else {		
			for (var i = 1; i <= $gameMap.isMaxEventId() + 1; i++) {				
				var event = $gameMap.event(i);
				if (event && event.isType() === 'enemy') {
					var enemy = $gameSystem.EventToUnit(event.eventId())[1];
					if (enemy.canMove() == true && !enemy.srpgTurnEnd() && !event.isErased() && enemy.factionId == $gameTemp.currentFaction) {
						break;
					}
				}
				if (i > $gameMap.isMaxEventId()) {
					$gameTemp.currentFaction++;
					$gameSystem.srpgStartEnemyTurn($gameTemp.currentFaction); // ターンを終了する
					return;
				}
			}            
		}
		
		
		$gameTemp.isPostMove = false;
		if(enemy.battleMode() === 'disabled'){
			$gameTemp.setActiveEvent(event);
			enemy.onAllActionsEnd();
			$gameTemp.AIWaitTimer = 15;
			$gamePlayer.locate(event.posX(), event.posY());		
			this.srpgAfterAction();
			return;
		}
		
    
        if (_srpgStandUnitSkip === 'true' && enemy.battleMode() === 'stand' || enemy.battleMode() === 'fixed') {
            $gameTemp.setActiveEvent(event);
            $gameSystem.srpgMakeMoveTable(event);
            var canAttackTargets = this.srpgMakeCanAttackTargets(enemy); //行動対象としうるユニットのリストを作成
            $gameTemp.clearMoveTable();
            if (canAttackTargets.length === 0) {
                $gameTemp.setActiveEvent(event);
                enemy.onAllActionsEnd();
				$gameTemp.AIWaitTimer = 15;
				$gamePlayer.locate(event.posX(), event.posY());		
                this.srpgAfterAction();
                return;
            }
        }
		
		if($gameSystem.isEnemy(enemy)){
			$gameTemp.showAllyAttackIndicator = false;
			$gameTemp.showAllyDefendIndicator = true;
			$gameTemp.showEnemyAttackIndicator = true;
			$gameTemp.showEnemyDefendIndicator = false;
		} else {
			$gameTemp.showAllyAttackIndicator = true;
			$gameTemp.showAllyDefendIndicator = false;
			$gameTemp.showEnemyAttackIndicator = false;
			$gameTemp.showEnemyDefendIndicator = true;
		}
		
        		
		$gameTemp.setActiveEvent(event);
		$gameSystem.setSubBattlePhase('enemy_move');
		$gameTemp.AIWaitTimer = 25;
		$gamePlayer.locate(event.posX(), event.posY());			
      
    };
	
	Scene_Map.prototype.doEnemyMapAttack = function(event, isPostMove) {
		var _this = this;
		var enemy = $gameSystem.EventToUnit(event.eventId())[1];		
		var mapWeapons = $statCalc.getActiveMapWeapons(enemy, isPostMove);
		var bestMapAttack;
		if(mapWeapons.length){
			mapWeapons.forEach(function(mapWeapon){
				var targetInfo = _this.getBestMapAttackTargets(event, mapWeapon, $gameSystem.isEnemy(enemy) ? "actor" : "enemy");
				if(targetInfo.targets.length && (!bestMapAttack || targetInfo.targets.length > bestMapAttack.targets.length)){
					bestMapAttack = targetInfo;
					bestMapAttack.attack = mapWeapon;
				}
			});
		}
		if(bestMapAttack){
			$gameTemp.enemyMapAttackDef = bestMapAttack;
			var type = "";
			if(bestMapAttack.attack.ignoresFriendlies){
				type = $gameSystem.isEnemy(enemy) ? "actor" : "enemy";
			}
			var targetInfo = _this.getMapAttackTargets(event, bestMapAttack.attack, type, bestMapAttack.direction);
			if(bestMapAttack.bestPosition){				
				targetInfo.forEach(function(candidate){
					if(candidate.position && candidate.position.x == bestMapAttack.bestPosition.x && candidate.position.y == bestMapAttack.bestPosition.y){
						$gameTemp.currentMapTargets = candidate.targets;
					}
				});				
			}
			$gameTemp.mapTargetDirection = bestMapAttack.direction;
			$gameTemp.currentBattleEnemy = enemy;
			$gameTemp.enemyAction = {
				type: "attack",
				attack: bestMapAttack.attack,
				target: 0
			};
			$gameTemp.clearMoveTable();	
			$gameTemp.setResetMoveList(true);
						
			var deltaX = event.posX();
			var deltaY = event.posY();
			
			var tileCoordinates = JSON.parse(JSON.stringify($mapAttackManager.getDefinition(bestMapAttack.attack.mapId).shape));		
			tileCoordinates = _this.getAdjustedMapAttackCoordinates(tileCoordinates,  bestMapAttack.direction);
			for(var i = 0; i < tileCoordinates.length; i++){
				tileCoordinates[i].push(true); //is attack range
				tileCoordinates[i][0]+=deltaX;
				tileCoordinates[i][1]+=deltaY;
				$gameTemp.pushMoveList(tileCoordinates[i]);					
			}
			
						
			
			$statCalc.setCurrentAttack(enemy, bestMapAttack.attack);
			_this.enemyMapAttackStart();
			return true;
		} else {
			return false;
		}
	}
	
    //エネミーの移動先決定と移動実行
    Scene_Map.prototype.srpgInvokeAIMove = function() {
		var _this = this;
		$gameVariables.setValue(_currentActorId, -1); //ensure no active actor id lingers
		$gameTemp.enemyWeaponSelection = null;
        var event = $gameTemp.activeEvent();
        var type = $gameSystem.EventToUnit(event.eventId())[0];
        var enemy = $gameSystem.EventToUnit(event.eventId())[1];
		
		if(!this.doEnemyMapAttack(event, false)){      
			this.srpgPriorityTarget(enemy); //優先ターゲットの設定
			var canAttackTargets = this.srpgMakeCanAttackTargets(enemy); //行動対象としうるユニットのリストを作成
			
			if(canAttackTargets.length){		
				var targetInfo = this.srpgDecideTarget(canAttackTargets, event); //ターゲットの設定
				$gameTemp.enemyWeaponSelection = targetInfo.weapon;
				$gameTemp.setTargetEvent(targetInfo.target);
				enemy._currentTarget = targetInfo.target;
				var alreadyInRange = $battleCalc.isTargetInRange({x: event.posX(), y: event.posY()}, {x: targetInfo.target.posX(), y: targetInfo.target.posY()}, $statCalc.getRealWeaponRange(enemy, targetInfo.weapon), $statCalc.getRealWeaponMinRange(enemy, targetInfo.weapon));
				if(!alreadyInRange){
					$gameSystem.srpgMakeMoveTable(event);
					if ($gameTemp.isSrpgBestSearchFlag() == true) {
						$gameTemp.setSrpgBestSearchFlag(false);
						$gameSystem.srpgMakeMoveTable(event);
					}
					var optimalPos = this.srpgSearchOptimalPos({x: targetInfo.target.posX(), y: targetInfo.target.posY()}, enemy, type, $statCalc.getRealWeaponRange(enemy, targetInfo.weapon), $statCalc.getRealWeaponMinRange(enemy, targetInfo.weapon));
					if(optimalPos[0] != event.posX() || optimalPos[1] != event.posY()){
						$gameTemp.isPostMove = true;
						var route = $gameTemp.MoveTable(optimalPos[0], optimalPos[1])[1];
						$gameSystem.setSrpgWaitMoving(true);
						event.srpgMoveToPoint({x: optimalPos[0], y: optimalPos[1]});
						$gamePlayer.setTransparent(true);
					}				
				}				
			} else {
				var fullRange = $statCalc.getFullWeaponRange(enemy, true);
				$gameSystem.srpgMakeMoveTable(event);
				var targetInfo;
				var optimalPos;
				/*if(enemy._currentTarget && !enemy._currentTarget.isErased()){
					targetInfo = {target: enemy._currentTarget};
					optimalPos = this.srpgSearchOptimalPos({x: targetInfo.target.posX(), y: targetInfo.target.posY()}, enemy, type, fullRange.range, fullRange.minRange);
				} else */
				if(enemy.targetRegion != -1 && enemy.targetRegion != null){
					var candidatePositions = $gameMap.getRegionTiles(enemy.targetRegion);
					var currentBestDist = -1;
					var xRef = event.posX();
					var yRef = event.posY();
					for(var i = 0; i < candidatePositions.length; i++){
						
						var dist = Math.hypot(xRef-candidatePositions[i].x, yRef-candidatePositions[i].y);
						if((currentBestDist == -1 || dist < currentBestDist) && ($statCalc.isFreeSpace(candidatePositions[i]) || (xRef == candidatePositions[i].x && yRef == candidatePositions[i].y))){
							optimalPos = candidatePositions[i];
						}
					}
					if(!optimalPos){
						currentBestDist = -1;
						for(var i = 0; i < candidatePositions.length; i++){						
							var dist = Math.hypot(xRef-candidatePositions[i].x, yRef-candidatePositions[i].y);
							if((currentBestDist == -1 || dist < currentBestDist)){
								optimalPos = candidatePositions[i];
							}
						}
					}
					if(optimalPos){
						optimalPos = this.srpgSearchOptimalPos(optimalPos, enemy, type, -1, 0);
					}					
				} 
				
				
				//check for targets in movement range
				if(!optimalPos){
					var canAttackTargets = this.srpgMakeCanAttackTargetsWithMove(enemy);
					if(canAttackTargets && canAttackTargets.length){
						targetInfo = this.srpgDecideTarget(canAttackTargets, event); //ターゲットの設定
						if(targetInfo.target){
							enemy._currentTarget = targetInfo.target;						
							optimalPos = this.srpgSearchOptimalPos({x: targetInfo.target.posX(), y: targetInfo.target.posY()}, enemy, type, fullRange.range, fullRange.minRange);
						}
					}
				}
				
				//check for targets on map
				if(!optimalPos){
					targetInfo = this.srpgDecideTarget($statCalc.getAllActorEvents("actor"), event); //ターゲットの設定
					if(targetInfo.target){
						enemy._currentTarget = targetInfo.target;
						var minRange = fullRange.minRange;
						if(minRange == -1){
							minRange = 0;
						}
						optimalPos = this.srpgSearchOptimalPos({x: targetInfo.target.posX(), y: targetInfo.target.posY()}, enemy, type, fullRange.range || -1, minRange, true);
					}
				}
				
				if(optimalPos){
					$gameTemp.isPostMove = true;
					var route = $gameTemp.MoveTable(optimalPos[0], optimalPos[1])[1];
					$gameSystem.setSrpgWaitMoving(true);
					event.srpgMoveToPoint({x: optimalPos[0], y: optimalPos[1]});
					$gamePlayer.setTransparent(true);
				}
			}
			$gameSystem.setSubBattlePhase('enemy_action');
		}
		
    };

    // 行動対象とするユニットのタイプを返す
    Scene_Map.prototype.makeTargetType = function(battler, type) {
        var targetType = null;
        if (battler.isConfused() == true) {
            switch (battler.confusionLevel()) {
            case 1:
                if (type === 'enemy') {
                    return 'actor';
                } else if (type === 'actor') {
                    return 'enemy';
                }
            case 2:
                if (Math.randomInt(2) === 0) {
                    if (type === 'enemy') {
                        return 'actor';
                    } else if (type === 'actor') {
                        return 'enemy';
                    }
                }
                if (type === 'enemy') {
                    return 'enemy';
                } else if (type === 'actor') {
                    return 'actor';
                }
            default:
                if (type === 'enemy') {
                    return 'enemy';
                } else if (type === 'actor') {
                    return 'actor';
                }
            }
        }
        if (type === 'enemy' && battler.currentAction().isForOpponent()) {
            targetType = 'actor';
        } else if (type === 'enemy' && battler.currentAction().isForFriend()) {
            targetType = 'enemy';
        } else if (type === 'actor' && battler.currentAction().isForOpponent()) {
            targetType = 'enemy';
        } else if (type === 'actor' && battler.currentAction().isForFriend()) {
            targetType = 'actor';
        }
        return targetType;
    };

    // 移動力と射程を足した範囲内にいる対象をリストアップする
    Scene_Map.prototype.srpgMakeCanAttackTargets = function(battler, targetType) {        	
		//var type = battler.isActor() ? "enemy" : "actor";
		if(battler.attackBehavior == "none"){
			return [];
		}
		var pos = {
			x: $gameTemp.activeEvent().posX(),
			y: $gameTemp.activeEvent().posY()
		};
		var fullRange = $statCalc.getFullWeaponRange(battler, $gameTemp.isPostMove);
        var targets = $statCalc.getAllInRange($gameSystem.getUnitFactionInfo(battler), pos, fullRange.range, fullRange.minRange);
		var tmp = [];
		for(var i = 0; i < targets.length; i++){
			var actor = $gameSystem.EventToUnit(targets[i].eventId())[1];
			if($battleCalc.getBestWeapon({actor: battler}, {actor: actor}, false, true, false)){
				tmp.push(targets[i]);
			}
		}
		targets = tmp;
		if(!battler.isActor() && battler.targetUnitId != "" && battler.targetUnitId != -1){
			var target;
			for(var i = 0; i < targets.length; i++){
				var actor = $gameSystem.EventToUnit(targets[i].eventId())[1];
				if(actor.isActor() && actor.actorId() == battler.targetUnitId){
					target = targets[i];
				}
			}
			if(target){
				targets = [target];
			} else {
				targets = [];
			}
		}
		return targets;
    };
	
	Scene_Map.prototype.srpgMakeCanAttackTargetsWithMove = function(battler, targetType) {        	
		//var type = battler.isActor() ? "enemy" : "actor";
		if(battler.attackBehavior == "none"){
			return [];
		}
		var pos = {
			x: $gameTemp.activeEvent().posX(),
			y: $gameTemp.activeEvent().posY()
		};
		var fullRange = $statCalc.getFullWeaponRange(battler, true);
		var moveRange = $statCalc.getCurrentMoveRange(battler);
		fullRange.range+=moveRange;
        var targets =  $statCalc.getAllInRange($gameSystem.getUnitFactionInfo(battler), pos, fullRange.range, fullRange.minRange);
		var tmp = [];
		for(var i = 0; i < targets.length; i++){
			var actor = $gameSystem.EventToUnit(targets[i].eventId())[1];
			if($battleCalc.getBestWeapon({actor: battler}, {actor: actor}, false, true, false)){
				tmp.push(targets[i]);
			}
		}
		targets = tmp;
		if(!battler.isActor() && battler.targetUnitId != "" && battler.targetUnitId != -1){
			var target;
			for(var i = 0; i < targets.length; i++){
				var actor = $gameSystem.EventToUnit(targets[i].eventId())[1];
				if(actor.isActor() && actor.actorId() == battler.targetUnitId){
					target = targets[i];
				}
			}
			if(target){
				targets = [target];
			} else {
				targets = [];
			}
		}
		return targets;
    };

     //優先ターゲットの決定
    Scene_Map.prototype.srpgPriorityTarget = function(battler) {
        var event = null;
        if (battler.battleMode() === 'aimingEvent') {
            event = $gameMap.event(battler.targetId());
        } else if (battler.battleMode() === 'aimingActor') {
            var eventId1 = $gameSystem.ActorToEvent(battler.targetId());
            event = $gameMap.event(eventId1);
        }
        // ターゲットにしたeventが有効でない場合、優先ターゲットは設定しない
        if (event) { 
            var targetBattlerArray = $gameSystem.EventToUnit(event.eventId());
            // 優先ターゲットが失われている場合、優先ターゲットは設定しない
            if (!(targetBattlerArray && targetBattlerArray[1].isAlive())) event = null;
        }
        $gameTemp.setSrpgPriorityTarget(event);
    }

     //ターゲットの決定
    Scene_Map.prototype.srpgDecideTarget = function(canAttackTargets, activeEvent, targetType) {
        var targetEvent = null;
       	
		var bestTarget;
		var bestWeapon;
		var bestScore = -1;
		var attacker = $gameSystem.EventToUnit(activeEvent.eventId())[1];
		var targetsByHit = [];
		var priorityTargetId = attacker.targetUnitId;
		var priorityTargetEvent = -1;
		
		canAttackTargets.forEach(function(event) {
			if(!event.isErased()){					
				var defender = $gameSystem.EventToUnit(event.eventId())[1];
				if(defender.isActor() && defender.actorId() == priorityTargetId){
					priorityTargetEvent = event;
				}
				var hitRate = $battleCalc.performHitCalculation(
					{actor: attacker, action: {type: "attack", attack: {hitMod: 0}}},
					{actor: defender, action: {type: "none"}},
					true
				);
				targetsByHit.push({
					hit: hitRate,
					target: defender,
					event: event
				});
			}
		});
		if(priorityTargetEvent != -1){
			var defender = $gameSystem.EventToUnit(priorityTargetEvent.eventId())[1];
			targetsByHit = [{
				hit: 0,
				target: defender,
				event: priorityTargetEvent
			}];
		}
		/*targetsByHit.sort(function(a, b){
			return b.hit - a.hit;
		});*/
		var maxHitRate = targetsByHit[0].hit;
		var ctr = 0;
		var currentHitRate = targetsByHit[0].hit;
		while(ctr < targetsByHit.length){
			var currentHitRate = targetsByHit[ctr].hit;
						
			var defender = targetsByHit[ctr].target;
			var weaponResult = {};
			var weaponResultCurrentPos = $battleCalc.getBestWeaponAndDamage(
				{actor: attacker, pos: {x: activeEvent.posX(), y:  activeEvent.posY()}},
				{actor: defender, pos: {x: targetsByHit[ctr].event.posX(), y: targetsByHit[ctr].event.posY()}},
				false,
				false, 
				false
			);
			
				
			var weaponResultAnyPosPostMove = $battleCalc.getBestWeaponAndDamage(
				{actor: attacker, pos: {x: activeEvent.posX(), y:  activeEvent.posY()}},
				{actor: defender, pos: {x: targetsByHit[ctr].event.posX(), y: targetsByHit[ctr].event.posY()}},
				false,
				true, 
				true
			);
			
			if(weaponResultCurrentPos.weapon && weaponResultAnyPosPostMove.weapon){
				if(weaponResultCurrentPos.damage > weaponResultAnyPosPostMove.damage){
					weaponResult = weaponResultCurrentPos;
				} else {
					weaponResult = weaponResultAnyPosPostMove;
				}
			} else if(weaponResultCurrentPos.weapon){
				weaponResult = weaponResultCurrentPos;
			} else if(weaponResultAnyPosPostMove.weapon){
				weaponResult = weaponResultAnyPosPostMove;
			} else {
				weaponResult = $battleCalc.getBestWeaponAndDamage(
					{actor: attacker, pos: {x: activeEvent.posX(), y:  activeEvent.posY()}},
					{actor: defender, pos: {x: targetsByHit[ctr].event.posX(), y: targetsByHit[ctr].event.posY()}},
					false,
					true, 
					false
				);
			}
			var damage = weaponResult.damage;
			var hitrate = currentHitRate;
			var canDestroy = weaponResult.damage >= $statCalc.getCalculatedMechStats(defender).currentHP ? 1 : 0;
			var formula = ENGINE_SETTINGS.ENEMY_TARGETING_FORMULA || "Math.min(hitrate + 0.01, 1) * (damage + (canDestroy * 5000))";
			var score = eval(formula);
			
			if(score > bestScore){
				bestScore = score;
				bestTarget = targetsByHit[ctr].event;
				bestWeapon = weaponResult.weapon
			}
			
			ctr++;
		}
		
        return {target: bestTarget, weapon: bestWeapon};
    };
	
	function coordUtils(startX, startY, chunkRadius){
		this.startX = startX;
		this.startY = startY;
		this.radius = chunkRadius;
	}
	
	coordUtils.prototype.convertToNormalCoordinate = function(coord){
			return Math.floor(coord / 3);
	}
	
	coordUtils.prototype.convertToExplodedCoordinate = function(coord){
		return coord * 3 + 1;
	}
	
	coordUtils.prototype.convertToGridCoordinate = function(coords){
		return {
			x: coords.x - this.startX + this.radius,
			y: coords.y - this.startY + this.radius
		}
	}
	
	coordUtils.prototype.convertToMapCoordinate = function(coords){
		return {
			x: coords.x + this.startX - this.radius,
			y: coords.y + this.startY - this.radius
		}
	}

    // 最適移動位置の探索
    Scene_Map.prototype.srpgSearchOptimalPos = function(targetCoords, battler, type, range, minRange, noTargets) {
		function isValidSpace(pos){
			return $statCalc.isFreeSpace(pos) || (pos.x == $gameTemp.activeEvent().posX() && pos.y == $gameTemp.activeEvent().posY());
		}
		
		if(targetCoords.x == battler.event.posX() && targetCoords.y == battler.event.posY()){
			return [targetCoords.x, targetCoords.y];
		}
		
        if ($gameTemp.isSrpgBestSearchRoute()[0] && 
            !(battler.battleMode() === 'absRegionUp' || battler.battleMode() === 'absRegionDown')) {
            var route = $gameTemp.isSrpgBestSearchRoute()[1].slice(1, battler.srpgMove() + 1);
            for (var i = 0; i < battler.srpgMove() + 1; i++) {
                var pos = [$gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY()];
                for (var j = 0; j < route.length; j++) {
                    var d = route[j];
                    if (d == 2) {
                        pos[1] += 1;
                    } else if (d == 4) {
                        pos[0] -= 1;
                    } else if (d == 6) {
                        pos[0] += 1;
                    } else if (d == 8) {
                        pos[1] -= 1;
                    }
                }
                if (pos[0] < 0) {
                  pos[0] += $gameMap.width();
                } else if (pos[0] >= $gameMap.width()) {
                  pos[0] -= $gameMap.width();
                }
                if (pos[1] < 0) {
                  pos[1] += $gameMap.height();
                } else if (pos[1] >= $gameMap.height()) {
                  pos[1] -= $gameMap.height();
                }
                if (isValidSpace({x: pos[0], y: pos[1]})) {
                    break;
                } else {
                    route.pop();
                }
            }
            $gameTemp.setSrpgBestSearchRoute([null, []]);
            return pos;
        }
        var list = $gameTemp.moveList();
		list.push([$gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY(), false]);
		
		var occupiedPositions = $statCalc.getOccupiedPositionsLookup(battler.isActor() ? "enemy" :  "actor");
		var allOccupiedPosition = $statCalc.getOccupiedPositionsLookup();
		
		
		
		
		var detailedAIRadius = 30;
		var startX = battler.event.posX();
		var startY = battler.event.posY();
		var bestDist = -1;
		var referencePos = {x: startX, y: startY};
		
		var pathfindingGrid = [];
		var directionGrid = [];
		for(var i = 0; i < $gameMap.width(); i++){			
			pathfindingGrid[i] = [];
			directionGrid[i] = [];			
			for(var j = 0; j < $gameMap.height(); j++){
				var isCenterPassable = !(occupiedPositions[i] && occupiedPositions[i][j]) && $statCalc.canStandOnTile(battler, {x: i, y: j});
				var isTopPassable;
				var isBottomPassable;
				var isLeftPassable;
				var isRightPassable;
				if(!isCenterPassable || $statCalc.isFlying(battler) || !ENGINE_SETTINGS.USE_TILE_PASSAGE){
				 	isTopPassable = isCenterPassable;
					isBottomPassable = isCenterPassable;
					isLeftPassable = isCenterPassable;
					isRightPassable = isCenterPassable;
				} else {
					isTopPassable = $gameMap.isPassable(i, j, 8);
					isBottomPassable = $gameMap.isPassable(i, j, 2);
					isLeftPassable = $gameMap.isPassable(i, j, 4);
					isRightPassable = $gameMap.isPassable(i, j, 6);
				}
				
				var weight = 1 ;
				
				if(!$statCalc.isFlying(battler)){
					weight+=$gameMap.SRPGTerrainTag(i, j);
				}				
				pathfindingGrid[i][j] = isCenterPassable ? weight : 0; 	
				directionGrid[i][j] = {
					top: isTopPassable,
					bottom: isBottomPassable,
					left: isLeftPassable,
					right: isRightPassable
				};
			}
		}
		
		
		
		var targetDist = minRange || 1;
		var currentBestDist = -1;
		var improves = true;
		var path = [];
	
		var candidatePaths = [];
		var targetTileCounter = 0;	
				
		var graph = new Graph(pathfindingGrid, directionGrid);
		
		while(currentBestDist != targetDist && targetTileCounter < list.length){
			
			var startCoords = {x: battler.event.posX(), y: battler.event.posY()};
			var startNode = graph.grid[startCoords.x][startCoords.y];
			
			var targetNode = list[targetTileCounter];
			var endCoords ={x: targetNode[0], y: targetNode[1]};
			var endNode = graph.grid[endCoords.x][endCoords.y];
			
			if(isValidSpace({x: endNode.x, y: endNode.y})){			
				path = astar.search(graph, startNode, endNode, {closest: true});
				if(path.length){		
					var closestValidNode = null;
					var ctr = path.length-1;
					while(ctr >= 0 && !closestValidNode){
						var node = path[ctr];
						var x = node.x;
						var y = node.y;
						var deltaX = Math.abs(targetCoords.x - x);
						var deltaY = Math.abs(targetCoords.y - y);
						var dist = Math.hypot(deltaX, deltaY);			
						
						if(dist >= targetDist && isValidSpace({x: x, y: y})){
							closestValidNode = node;
						} else {
							//pathfindingGrid[node.x][node.y] = 0;
						}
						ctr--;
					}			
					candidatePaths.push(path);				
				} else {
					improves = false;
				}
			}
			targetTileCounter++;
		}	
		
		
		
		var canReach = false;
		var pathScores = [];
		var bestPath = [];
		candidatePaths.forEach(function(path){
			var node = path[path.length-1];
			var deltaX = Math.abs(targetCoords.x - node.x);
			var deltaY = Math.abs(targetCoords.y - node.y);
			var dist = deltaX + deltaY;
			var environmentScore = 0;
			var terrainDetails = $gameMap.getTilePropertiesAsObject({x: node.x, y: node.y});	
			var terrainScore = 0;
			if(terrainDetails){
				terrainScore+=terrainDetails.defense / 100;
				terrainScore+=terrainDetails.evasion / 100;
				terrainScore+=terrainDetails.hp_regen / 100;
				terrainScore+=terrainDetails.en_regen / 100;
			}			
			environmentScore+=terrainScore;
			
			var supporterDefenders = $statCalc.getSupportDefendCandidates(
				$gameSystem.getFactionId(battler), 
				{x: node.x, y: node.y},
				$statCalc.getCurrentTerrain(battler),
				battler.event.eventId()
			);
			
			if(supporterDefenders.length){
				environmentScore+=1;
			}
			
			var supportersAttackers = $statCalc.getSupportAttackCandidates(
				$gameSystem.getFactionId(battler), 
				{x: node.x, y: node.y},
				$statCalc.getCurrentTerrain(battler),
				battler.event.eventId()
			);
			
			if(supportersAttackers.length){
				environmentScore+=0.5;
			}
			var distanceOK = dist <= range && dist >= minRange;
			if(distanceOK){
				canReach = true;
			}
			pathScores.push({
				path: path,
				distanceOK: distanceOK,
				dist: dist,
				environment: environmentScore
			});
		});
		if(canReach){
			pathScores.sort(function(a, b){
				if(a.distanceOK && b.distanceOK){
					if(b.environment - a.environment == 0){
						return a.dist - b.dist;
					} else {
						return b.environment - a.environment;
					}				
				} else if(a.distanceOK){
					return -1;
				} else if(b.distanceOK) {
					return 1;
				} else {
					return 0;
				}
			});

			if(pathScores[0]){
				path = pathScores[0].path;
			}
		} else {
			//var graph = new Graph(pathfindingGrid);
			var startCoords = {x: battler.event.posX(), y: battler.event.posY()};
			var startNode = graph.grid[startCoords.x][startCoords.y];
			var endCoords = {x: targetCoords.x, y: targetCoords.y};
			var endNode = graph.grid[endCoords.x][endCoords.y];
			path = astar.search(graph, startNode, endNode, {closest: true});
		}
			
		
		var pathNodeLookup = {};
		var ctr = 0;
		
		var tmp = [];
		path.forEach(function(node){
			var deltaX = Math.abs(targetCoords.x - node.x);
			var deltaY = Math.abs(targetCoords.y - node.y);
			var dist = Math.hypot(deltaX, deltaY);
			if(deltaX + deltaY >= minRange){
				tmp.push(node);
			}
		});
		path = tmp;

		path.forEach(function(node){
			if(!pathNodeLookup[node.x]){
				pathNodeLookup[node.x] = {};
			}
			pathNodeLookup[node.x][node.y] = ctr++;
		});
		
		var bestIdx = -1;
		for(var i = 0; i < list.length; i++){
			var pathIdx = -1;
			if(pathNodeLookup[list[i][0]] && pathNodeLookup[list[i][0]][list[i][1]] != null){
				pathIdx = pathNodeLookup[list[i][0]][list[i][1]];
			}
			if(isValidSpace({x: list[i][0], y: list[i][1]}) && pathIdx > bestIdx){
				bestIdx = pathIdx;
			}
		}
		
		var candidatePos = [];
		if(bestIdx != -1){
			candidatePos.push([path[bestIdx].x, path[bestIdx].y]);
		} else {		
			var distanceSortedPositions = [];
			
			for(var i = 0; i < list.length; i++){
				var deltaX = Math.abs(targetCoords.x - list[i][0]);
				var deltaY = Math.abs(targetCoords.y - list[i][1]);
				var distance = Math.hypot(deltaX, deltaY);
				if((range == -1 || (deltaX + deltaY <= range && deltaX + deltaY >= minRange)) && isValidSpace({x: list[i][0], y: list[i][1]})){
					distanceSortedPositions.push({
						x: list[i][0],
						y: list[i][1],
						distance: distance
					});
				}
			}		
			distanceSortedPositions = distanceSortedPositions.sort(function(a, b){
				return a.distance - b.distance;
			});
			if(distanceSortedPositions.length){
				var optimalDistance = distanceSortedPositions[0].distance;
				var ctr = 0;
				var currentDistance = distanceSortedPositions[0].distance;
				while(currentDistance == optimalDistance && ctr < distanceSortedPositions.length){
					currentDistance = distanceSortedPositions[ctr].distance;
					if(currentDistance == optimalDistance){
						candidatePos.push([distanceSortedPositions[ctr].x, distanceSortedPositions[ctr].y]);
					}			
					ctr++;
				} 
			}			
		}
		
		
		for(var i = 0; i < candidatePos.length; i++){
			if(candidatePos[i][0] == targetCoords.x && candidatePos[i][1] == targetCoords.y){
				return candidatePos[i];
			}
		} 
		var resultPos = candidatePos[0];
		var ctr = 1;
		while(ctr < candidatePos.length && !isValidSpace({x: resultPos[0], y: resultPos[1]})){
			resultPos = candidatePos[ctr++];
		}
		if(!resultPos){
			return [startX, startY];
		}
		
		if(!isValidSpace({x: resultPos[0], y: resultPos[1]})){
			return [startX, startY];
		} else {
			return resultPos;
		}        
    };

    //自動行動アクター&エネミーの戦闘の実行
    Scene_Map.prototype.srpgInvokeAutoUnitAction = function() {
        if (!$gameTemp.targetEvent()) {
            var actionArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
            actionArray[1].onAllActionsEnd();
            this.srpgAfterAction();
            return;
        }
        var actionArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
        var targetArray = $gameSystem.EventToUnit($gameTemp.targetEvent().eventId());
        var skill = actionArray[1].currentAction().item();
        var range = actionArray[1].srpgSkillRange(skill);
        $gameTemp.setSrpgDistance($gameSystem.unitDistance($gameTemp.activeEvent(), $gameTemp.targetEvent()));
        $gameTemp.setSrpgSpecialRange($gameTemp.activeEvent().srpgRangeExtention($gameTemp.targetEvent().posX(), $gameTemp.targetEvent().posY(), $gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY(), skill, range));
        if (actionArray[1].canUse(skill)) {
            $gameTemp.setAutoMoveDestinationValid(true);
            $gameTemp.setAutoMoveDestination($gameTemp.targetEvent().posX(), $gameTemp.targetEvent().posY());
            $gameSystem.setSubBattlePhase('invoke_action');
            this.srpgBattleStart(actionArray, targetArray);
        } else {
            actionArray[1].onAllActionsEnd();
            this.srpgAfterAction();
        }
    };
	
	Scene_Map.prototype.srpgInvokeAIAction = function() {		
		if(this.doEnemyMapAttack($gameTemp.activeEvent(), true)){
			return;
		}
		
        if (!$gameTemp.targetEvent()) {
			var actionArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
			var canAttackTargets = this.srpgMakeCanAttackTargets(actionArray[1]); //行動対象としうるユニットのリストを作成			
			if(canAttackTargets.length){		
				var targetInfo = this.srpgDecideTarget(canAttackTargets, $gameTemp.activeEvent()); //ターゲットの設定
				$gameTemp.enemyWeaponSelection = targetInfo.weapon;
				$gameTemp.setTargetEvent(targetInfo.target);
				$gameTemp.activeEvent()._currentTarget = targetInfo.target;
			} else {				
				actionArray[1].onAllActionsEnd();
				this.srpgAfterAction();
				return;
			}           
        }
		
		
		
        var actionArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
        var targetArray = $gameSystem.EventToUnit($gameTemp.targetEvent().eventId());
		
		$gameTemp.reticuleInfo = {
			actor: actionArray[1],
			targetActor: targetArray[1]
		};
	
		$gameSystem.setSubBattlePhase('invoke_action');
		
		//actor default action determination
		$gameTemp.isEnemyAttack = true;
		$gameTemp.currentBattleActor = targetArray[1];			
		$gameTemp.currentBattleEnemy = actionArray[1];
		
		
		
		var enemyInfo = {actor: $gameTemp.currentBattleEnemy, pos: {x: $gameTemp.currentBattleEnemy.event.posX(), y: $gameTemp.currentBattleEnemy.event.posY()}};
		var actorInfo = {actor: $gameTemp.currentBattleActor, pos: {x: $gameTemp.currentBattleActor.event.posX(), y: $gameTemp.currentBattleActor.event.posY()}};
		var weapon = $gameTemp.enemyWeaponSelection;
		if(weapon){
			$gameTemp.enemyAction = {
				type: "attack",
				attack: weapon,
				target: 0
			};
		} else {
			$gameTemp.enemyAction = {
				type: "none",
				attack: 0,
				target: 0
			};
		}		
		var weapon = $battleCalc.getBestWeapon(actorInfo, enemyInfo, true);
		if(weapon){
			$gameTemp.actorAction = {
				type: "attack",
				attack: weapon,
				target: 0
			};
		} else {
			$gameTemp.actorAction = {
				type: "none",
				attack: 0,
				target: 0
			};
		}
		
		if((!$gameTemp.enemyAction || !$gameTemp.enemyAction.attack || !$gameTemp.enemyAction.attack.isAll)){	
			var supporters = $statCalc.getSupportDefendCandidates(
				$gameSystem.getFactionId(actorInfo.actor), 
				actorInfo.pos,
				$statCalc.getCurrentTerrain(actorInfo.actor)
			);
			
			if($statCalc.applyStatModsToValue($gameTemp.currentBattleActor, 0, ["disable_support"]) || 
				$statCalc.applyStatModsToValue($gameTemp.currentBattleEnemy, 0, ["disable_target_support"])){
				supporters = [];
			}
			
			var supporterSelected = -1;
			var minDamage = -1;
			for(var i = 0; i < supporters.length; i++){
				supporters[i].action = {type: "defend", attack: null};			
				var damageResult = $battleCalc.performDamageCalculation(
					{actor: enemyInfo.actor, action: $gameTemp.enemyAction},
					supporters[i],
					true,
					false,
					true	
				);				
				if(minDamage == -1 || damageResult.damage < minDamage){
					if(damageResult.damage < $statCalc.getCalculatedMechStats(supporters[i].actor).currentHP){
						minDamage = damageResult.damage;
						supporterSelected = i;
					}				
				}
			}
			$gameTemp.supportDefendCandidates = supporters;
			if($gameSystem.optionDefaultSupport){
				$gameTemp.supportDefendSelected = supporterSelected;
			} else {
				$gameTemp.supportDefendSelected = -1;
			}			
		} else {
			$gameTemp.supportDefendCandidates = [];
			$gameTemp.supportDefendSelected = -1;
		}
		var supporters = $statCalc.getSupportAttackCandidates(
			$gameSystem.getFactionId(enemyInfo.actor), 
			{x: $gameTemp.activeEvent().posX(), y: $gameTemp.activeEvent().posY()},
			$statCalc.getCurrentTerrain($gameTemp.currentBattleEnemy)
		);
		
		var aSkill = $statCalc.getPilotStat(enemyInfo.actor, "skill");
		var dSkill = $statCalc.getPilotStat(actorInfo.actor, "skill");
		
		if((aSkill - dSkill >= 20) && $statCalc.applyStatModsToValue(enemyInfo.actor, 0, ["attack_again"])){
			supporters.push({actor:enemyInfo.actor, pos: {x: enemyInfo.actor.event.posX(), y: enemyInfo.actor.event.posY()}});
		}
		
		if($statCalc.applyStatModsToValue($gameTemp.currentBattleEnemy, 0, ["disable_support"]) || 
			$statCalc.applyStatModsToValue($gameTemp.currentBattleActor, 0, ["disable_target_support"])){
			supporters = [];
		}
		
		var allRequired = false;
		if($gameTemp.enemyAction && $gameTemp.enemyAction.attack){
			allRequired = $gameTemp.enemyAction.attack.isAll ? 1 : -1;
		}
		
		var supporterInfo = [];
		var supporterSelected = -1;
		var bestDamage = 0;
		for(var i = 0; i < supporters.length; i++){
			var weaponResult = $battleCalc.getBestWeaponAndDamage(supporters[i], actorInfo, false, false, false, allRequired);
			if(weaponResult.weapon){
				supporters[i].action = {type: "attack", attack: weaponResult.weapon};
				supporterInfo.push(supporters[i]);
				if(bestDamage < weaponResult.damage){
					bestDamage = weaponResult.damage;
					supporterSelected = i;
				}
			}
		}										
		$gameTemp.supportAttackCandidates = supporterInfo;
		$gameTemp.supportAttackSelected = supporterSelected;
		
		$battleCalc.updateTwinSupportAttack();
		
		//hack to make sure that the actor attacks from the correct side of the screen when dealing with AI actors
		if($gameTemp.currentBattleEnemy.isActor() && !$gameSystem.isEnemy($gameTemp.currentBattleEnemy)){
			$gameTemp.isEnemyAttack = false;
			var tmp = $gameTemp.currentBattleActor;
			$gameTemp.currentBattleActor = $gameTemp.currentBattleEnemy;
			$gameTemp.currentBattleEnemy = tmp;
			
			var tmp = $gameTemp.actorAction;
			$gameTemp.actorAction = $gameTemp.enemyAction;
			$gameTemp.enemyAction = tmp;
		}
		$gameTemp.currentTargetingSettings = null;	
		$battleCalc.updateTwinActions();
		
		var weapon = $gameTemp.enemyWeaponSelection;
		var range = $statCalc.getRealWeaponRange(actionArray[1], weapon);
		var minRange = $statCalc.getRealWeaponMinRange(actionArray[1], weapon);
		var event = actionArray[1].event;		
		
		this.setUpAttackRange(event.posX(), event.posY(), range, minRange);
		
		$gameSystem.setSubBattlePhase("enemy_targeting_display");
		$gameTemp.targetingDisplayCounter = 60;
       
    };

    //戦闘処理の実行
    Scene_Map.prototype.srpgBattleStart = function(actionArray, targetArray) {		
		$statCalc.setCurrentAttack($gameTemp.currentBattleActor, $gameTemp.actorAction.attack);	
		$statCalc.setCurrentAttack($gameTemp.currentBattleEnemy, $gameTemp.enemyAction.attack);	
		
		$battleCalc.generateBattleResult();
		
				
				
     
		Object.keys($gameTemp.battleEffectCache).forEach(function(cacheRef){
			var battleEffect = $gameTemp.battleEffectCache[cacheRef];				
			if(	
				battleEffect.madeContact && 
				battleEffect.attacked && 
				$statCalc.applyStatModsToValue(battleEffect.ref, 0, ["noise_destroy"]) && 
				$statCalc.getSpecies(battleEffect.attacked.ref) == "human" && 
				!$statCalc.applyStatModsToValue(battleEffect.attacked.ref, 0, ["noise_destroy_immune"]) && 
				!$statCalc.isStatModActiveOnAnyActor("noise_destroy_immune_all")
			){						
				battleEffect.isDestroyed = true;
				battleEffect.attacked.isDestroyed = true;
			}					
			
		});
		
		
		$gameTemp.clearMoveTable();
		$gameTemp.isEnemyAttack = false;
		$gameTemp.battleOccurred = true;
	
		this.eventBeforeBattle();
		
		if($gameMap.isEventRunning()){		
			$gameTemp.popMenu = true;
			$gameSystem.setSubBattlePhase('event_before_battle');
		} else {
			this.playBattleScene();
		}
		
    };
	
	Scene_Map.prototype.enemyMapAttackStart = function(actionArray, targetArray) {	
		var _this = this;
		$gameTemp.isEnemyAttack = true;
		$battleCalc.generateMapBattleResult();				
				
		$gameTemp.mapAttackOccurred = true;
		$gameTemp.mapAttackAnimationStarted = false;
		$gameTemp.mapAttackAnimationDelay = 30; 
		$gameTemp.mapAttackRetargetDelay = 30; 
		$gameTemp.showBeforeEnemyMapAnimation = true;
		$gameSystem.setSubBattlePhase('before_enemy_map_animation');			
    };
	
	Scene_Map.prototype.mapAttackStart = function(actionArray, targetArray) {	
		var _this = this;
		$gameTemp.isEnemyAttack = false;
		$battleCalc.generateMapBattleResult();				
		$gameTemp.clearMoveTable();		
		$gameTemp.mapAttackOccurred = true;
		$gameTemp.mapAttackAnimationStarted = false;
		$gameSystem.setSubBattlePhase('map_attack_animation');		
    };
	
	Scene_Map.prototype.playBattleScene = function() {
		if($gameSystem.demoSetting){
			this.startEncounterEffect();			
		} else {
			$gameTemp.popMenu = true;//remove before battle menu
			$gameSystem.setSubBattlePhase('battle_basic');
			$gameTemp.pushMenu = "battle_basic";
		}
	}

    // 戦闘開始時に向きを修正する
    Scene_Map.prototype.preBattleSetDirection = function() {
        var differenceX = $gameTemp.activeEvent().posX() - $gameTemp.targetEvent().posX();
        var differenceY = $gameTemp.activeEvent().posY() - $gameTemp.targetEvent().posY();
        if ($gameMap.isLoopHorizontal() == true) {
            var event1X = $gameTemp.activeEvent().posX() > $gameTemp.targetEvent().posX() ? $gameTemp.activeEvent().posX() - $gameMap.width() : $gameTemp.activeEvent().posX() + $gameMap.width();
            var disX = event1X - $gameTemp.targetEvent().posX();
            differenceX = Math.abs(differenceX) < Math.abs(disX) ? differenceX : disX;
        }
        if ($gameMap.isLoopVertical() == true) {
            var event1Y = $gameTemp.activeEvent().posY() > $gameTemp.targetEvent().posY() ? $gameTemp.activeEvent().posY() - $gameMap.height() : $gameTemp.activeEvent().posY() + $gameMap.height();
            var disY = event1Y - $gameTemp.targetEvent().posY();
            differenceY = Math.abs(differenceY) < Math.abs(disY) ? differenceY : disY;
        }
        if (Math.abs(differenceX) > Math.abs(differenceY)) {
            if (differenceX > 0) {
                $gameTemp.activeEvent().setDirection(4);
                if (_srpgDamageDirectionChange == 'true') $gameTemp.targetEvent().setDirection(6);
            } else {
                $gameTemp.activeEvent().setDirection(6);
                if (_srpgDamageDirectionChange == 'true') $gameTemp.targetEvent().setDirection(4);
            }
        } else {
            if (differenceY >= 0) {
                $gameTemp.activeEvent().setDirection(8);
                if (_srpgDamageDirectionChange == 'true') $gameTemp.targetEvent().setDirection(2);
            } else {
                $gameTemp.activeEvent().setDirection(2);
                if (_srpgDamageDirectionChange == 'true') $gameTemp.targetEvent().setDirection(8);
            }
        }
    };

      // SRPG戦闘中は戦闘開始エフェクトを高速化する
    var _SRPG_SceneMap_updateEncounterEffect = Scene_Map.prototype.updateEncounterEffect;
    Scene_Map.prototype.updateEncounterEffect = function() {
        /*if ($gameSystem.isSRPGMode() == true && $gameSwitches.value(2) == true) {
            if (this._encounterEffectDuration > 0) {
                this._encounterEffectDuration--;
                this.snapForBattleBackground();
                BattleManager.playBattleBgm();
            }
        } else if ($gameSystem.isSRPGMode() == true && _srpgBattleQuickLaunch == 'true') {
            if (this._encounterEffectDuration > 0) {
                this._encounterEffectDuration--;
                var speed = this.encounterEffectSpeed();
                var n = speed - this._encounterEffectDuration;
                //if (n === Math.floor(speed / 3)) {
                //     this.startFlashForEncounter(speed);
                //}
                if (n === Math.floor(speed)) {
                    BattleManager.playBattleBgm();
                    this.startFadeOut(this.fadeSpeed() / 2);
                }
            }
        } else {
            _SRPG_SceneMap_updateEncounterEffect.call(this);
        }*/
		
		
		//this._twistFilter.radius+=20;
		
		
		this._transitionSprite.scale.x = this._transitionSpriteScale;
		this._transitionSprite.scale.y = this._transitionSpriteScale;
		if (this._transitionFilter.strength >= 0.4) {	
			this._transitionSprite.opacity-=10;
			/*this._transitionSpriteScale+=0.005;
			this._transitionSprite.x-=2.5;
			this._transitionSprite.y-=0.5;*/
			this._transitionFilter.strength+=0.01;
			if(this._transitionFilter.strength >= 0.65){
				//this._transitionFilter.blurX = 0;	
				//this.clearTREffects();
				this._transitioningToBattle = false;
				this._loadingIntoBattle = true;
				this.removeChild(this._transitionSprite);				
			}			
		} else {
			this._transitionFilter.strength+=0.02;
		}
		this._transitionTimer++;
    };

    // SRPG戦闘中は戦闘開始エフェクトを高速化する
    var _SRPG_SceneMap_encounterEffectSpeed = Scene_Map.prototype.encounterEffectSpeed;
    Scene_Map.prototype.encounterEffectSpeed = function() {
        if ($gameSystem.isSRPGMode() == true && _srpgBattleQuickLaunch == 'true') {
            return 10;
        } else {
            return _SRPG_SceneMap_encounterEffectSpeed.call(this);
        }
    };
	
	var _SRPG_SceneMap_startEncounterEffect = Scene_Map.prototype.startEncounterEffect;
    Scene_Map.prototype.startEncounterEffect = function() {
        /*if ($gameSystem.isSRPGMode() == true && _srpgBattleQuickLaunch == 'true') {
            this._encounterEffectDuration = this.encounterEffectSpeed();
        } else {
            _SRPG_SceneMap_startEncounterEffect.call(this);
        }*/
		
		try {
			this.removeChild(this._transitionBackSprite);
		} catch(e){
			
		}
		
		this._transitionBase = SceneManager.snap();
		
		this._transitioningToBattle = true;
		this._transitionTimer = 0;
	
		this._transitionBackSprite = new Sprite(new Bitmap(Graphics.boxWidth,Graphics.boxHeight));
		this._transitionBackSprite.bitmap.fillAll('black');
		this.addChild(this._transitionBackSprite);

		this._transitionSprite = new Sprite(this._transitionBase);
		this._transitionSpriteScale = 1;
		
		var filter = new PIXI.filters.ZoomBlurFilter();
		filter.strength = 0.01;
		var x = 0;
		var y = 0;
		var activeEvent = $gameTemp.targetEvent();
		if(activeEvent){
			x = activeEvent.screenX();
			y = activeEvent.screenY() - 24;
		}
		filter.center = [x, y];
		filter.innerRadius = 0;
		
		this._transitionFilter = filter;	
		
		/*var twistFilter = new PIXI.filters.TwistFilter();
		twistFilter.angle = -0.5;
		twistFilter.offset = [Graphics._getCurrentWidth() / 2, Graphics._getCurrentHeight() / 2];
		twistFilter.radius = 0;
		
		this._twistFilter = twistFilter;	*/
		
		this._transitionSprite.filters = [filter];
		this.addChild(this._transitionSprite);
		
		if($gameSystem.optionBattleBGM){
			$songManager.playBattleSong($gameTemp.currentBattleActor, $gameTemp.currentBattleEnemy);
		}		
    };
	
	Scene_Gameover.prototype.gotoTitle = function() {
		$gameTemp.intermissionPending = true;
		
		$SRWSaveManager.lockMapSRPoint($gameMap.mapId());	
		$gameMap._interpreter.clear();//make sure no events run after the game over before loading into the intermission
		$gamePlayer.reserveTransfer(2, 0, 0);//send player to intermission after losing
		SceneManager.goto(Scene_Map);
	};

//====================================================================
// ●Scene_Menu
//====================================================================
    var _SRPG_SceneMenu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
        _SRPG_SceneMenu_createCommandWindow.call(this);
        if ($gameSystem.isSRPGMode() == true) {
            this._commandWindow.setHandler('turnEnd',this.commandTurnEnd.bind(this));
            this._commandWindow.setHandler('autoBattle',this.commandAutoBattle.bind(this));			
        }
		this._commandWindow.y = 100;
		this._commandWindow.x = 800;
    };    

    Scene_Menu.prototype.commandAutoBattle = function() {
        $gameTemp.setTurnEndFlag(true);
        $gameTemp.setAutoBattleFlag(true);
        SceneManager.pop();
    };
	
	Scene_Menu.prototype.createStatusWindow = function() {
        
    };
	
	Scene_Menu.prototype.start = function() {
		Scene_MenuBase.prototype.start.call(this);
		
	};
	
	

	Scene_Menu.prototype.createGoldWindow = function() {
		this._goldWindow = new Window_StageInfo(0, 0);
		this._goldWindow.y = this._commandWindow.y + this._commandWindow.windowHeight();
		this._goldWindow.x = 800;
		this.addWindow(this._goldWindow);
	};
	
	SceneManager.snapForBackground = function() {
		this._backgroundBitmap = this.snap();
		this._backgroundBitmap.blur();
	};
	
	SceneManager.snap = function() {
		return Bitmap.snap(this._scene);
	};
	

//====================================================================
// ●Scene_Equip
//====================================================================
    Scene_Equip.prototype.popScene = function() {
        if ($gameSystem.isSRPGMode() == true && $gameTemp.activeEvent()) {
            $gameTemp.setSrpgActorEquipFlag(true);
        }
        SceneManager.pop();
    };

//====================================================================
// ●Scene_Load
//====================================================================
    var _SRPG_Scene_Load_onLoadSuccess = Scene_Load.prototype.onLoadSuccess;
    Scene_Load.prototype.onLoadSuccess = function() {
        _SRPG_Scene_Load_onLoadSuccess.call(this);
        if ($gameSystem.isSRPGMode() == true) {
            $gameTemp.setSrpgLoadFlag(true);
        }
    };

    var _SRPG_Scene_Load_reloadMapIfUpdated = Scene_Load.prototype.reloadMapIfUpdated;
    Scene_Load.prototype.reloadMapIfUpdated = function() {
        if ($gameSystem.isSRPGMode() == false) {
            _SRPG_Scene_Load_reloadMapIfUpdated.call(this);
        }
    };


//====================================================================
// ●Scene_Battle
//====================================================================
    // フェード速度を返す
    Scene_Battle.prototype.fadeSpeed = function() {
        if ($gameSystem.isSRPGMode() == true && _srpgBattleQuickLaunch == 'true') {
           return 12;
        } else {
           return Scene_Base.prototype.fadeSpeed.call(this);
        }
    };

    // ウィンドウの作成
    var _SRPG_Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        _SRPG_Scene_Battle_createAllWindows.call(this);
        this.createSprgBattleStatusWindow();
        if ($gameParty.battleMembers()[0] && $gameParty.battleMembers()[0].isAlive()) {
            this.createSrpgBattleResultWindow();
        }
    };

    // SRPG戦闘用のウィンドウを作る
    Scene_Battle.prototype.createSprgBattleStatusWindow = function() {
        this._srpgBattleStatusWindowLeft = new Window_SrpgBattleStatus(0);
        this._srpgBattleStatusWindowRight = new Window_SrpgBattleStatus(1);
        this._srpgBattleStatusWindowLeft.openness = 0;
        this._srpgBattleStatusWindowRight.openness = 0;
        if ($gameParty.battleMembers()[0]) {
            this._srpgBattleStatusWindowRight.setBattler($gameParty.battleMembers()[0]);
            if ($gameParty.battleMembers()[1]) {
                this._srpgBattleStatusWindowLeft.setBattler($gameParty.battleMembers()[1]);
            }
        }
        if ($gameTroop.members()[0]) {
            this._srpgBattleStatusWindowLeft.setBattler($gameTroop.members()[0]);
            if ($gameTroop.members()[1]) {
                this._srpgBattleStatusWindowRight.setBattler($gameTroop.members()[1]);
            }
        }
        this.addWindow(this._srpgBattleStatusWindowLeft);
        this.addWindow(this._srpgBattleStatusWindowRight);
        BattleManager.setSrpgBattleStatusWindow(this._srpgBattleStatusWindowLeft, this._srpgBattleStatusWindowRight);
    };

    // SRPG戦闘用のウィンドウを作る
    Scene_Battle.prototype.createSrpgBattleResultWindow = function() {
        this._srpgBattleResultWindow = new Window_SrpgBattleResult($gameParty.battleMembers()[0]);
        this._srpgBattleResultWindow.openness = 0;
        this.addWindow(this._srpgBattleResultWindow);
        BattleManager.setSrpgBattleResultWindow(this._srpgBattleResultWindow);
    };

    //ステータスウィンドウのアップデート
    var _SRPG_Scene_Battle_updateStatusWindow = Scene_Battle.prototype.updateStatusWindow;
    Scene_Battle.prototype.updateStatusWindow = function() {
        if ($gameSystem.isSRPGMode() == true) {
            this._statusWindow.close();
            if ($gameMessage.isBusy()) {
                this._srpgBattleStatusWindowLeft.close();
                this._srpgBattleStatusWindowRight.close();
                this._partyCommandWindow.close();
                this._actorCommandWindow.close();
            } else if (this.isActive() && !this._messageWindow.isClosing()) {
                this._srpgBattleStatusWindowLeft.open();
                this._srpgBattleStatusWindowRight.open();
            }
        } else {
            _SRPG_Scene_Battle_updateStatusWindow.call(this);
        }
    };

    //ステータスウィンドウのリフレッシュ
    var _SRPG_Scene_Battle_refreshStatus = Scene_Battle.prototype.refreshStatus;
    Scene_Battle.prototype.refreshStatus = function() {
        if ($gameSystem.isSRPGMode() == true) {
            this._srpgBattleStatusWindowLeft.refresh();
            this._srpgBattleStatusWindowRight.refresh();
        } else {
            _SRPG_Scene_Battle_refreshStatus.call(this);
        }
    };


	

	
	//patch the audio manager to suppress sound effects while events are being skipped
	AudioManager.playSe = function(se) {
		if (se.name && !$gameTemp.isSkippingEvents) {
			this._seBuffers = this._seBuffers.filter(function(audio) {
				return audio.isPlaying();
			});
			var buffer = this.createBuffer('se', se.name);
			this.updateSeParameters(buffer, se);
			buffer.play(false);
			this._seBuffers.push(buffer);
		}
	};
		
})();

