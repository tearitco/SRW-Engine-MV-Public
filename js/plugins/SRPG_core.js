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

//disable touch support

TouchInput.update = function() {}
 
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

var $SRWEditor = new SRWEditor();

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

if(typeof ENGINE_SETTINGS == "undefined"){
	ENGINE_SETTINGS = {};
}
Object.keys(ENGINE_SETTINGS_DEFAULT).forEach(function(key){
	if(ENGINE_SETTINGS[key] == null){
		ENGINE_SETTINGS[key] = ENGINE_SETTINGS_DEFAULT[key];
	}
});

(function() {
	//TODO: Proper pre-loading/load waiting

	
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
	Graphics._updateCanvas = function(){
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
		$CSSUIManager.updateScaledText();				
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

	
    var _Game_Interpreter_pluginCommand =
            Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'SRPGBattle') {
            switch (args[0]) {
            case 'Start':
                $gameSystem.startSRPG();
                break;
            case 'End':
                $gameSystem.endSRPG();
                break;
            }
        }
		if (command === 'Intermission') {
            switch (args[0]) {
            case 'Start':
                $gameSystem.startIntermission();
                break;
            case 'End':
				$gameSystem.endIntermission();
                break;
            }
        }
		if (command === 'UnlockUnit') {
            $SRWSaveManager.setUnitUnlocked(args[0]);
        }
		if (command === 'unlockUnit') {
            $SRWSaveManager.setUnitUnlocked(args[0]);
        }
		if (command === 'lockUnit') {
            $SRWSaveManager.setUnitLocked(args[0]);
        }
		if (command === 'SetLevel') {
            $SRWSaveManager.setPilotLevel(args[0], args[1]);
        }
		if (command === 'setLevel') {
            $SRWSaveManager.setPilotLevel(args[0], args[1]);
        }
		if (command === 'addKills') {
            $SRWSaveManager.addKills(args[0], args[1]);
        }		
		if (command === 'addPP') {
            $SRWSaveManager.addPP(args[0], args[1]);
        }
		if (command === 'addExp') {
            $SRWSaveManager.addExp(args[0], args[1]);
        }
		if (command === 'setStageSong') {
            $gameSystem.currentStageSong  = args[0];
        }	
		if (command === 'setSpecialTheme') {
            $songManager.setSpecialTheme(args[0]);
        }	
		if (command === 'clearSpecialTheme') {
            $songManager.clearSpecialTheme();
        }			
		if (command === 'addItem') {
            $inventoryManager.addItem(args[0]);
        }	
		if (command === 'addAllItems') {            
			for(var i = 0; i < $itemEffectManager.getDefinitionCount(); i++){
				$inventoryManager.addItem(i);
			}
        }
		if (command === 'removeItem') {
            $inventoryManager.removeItem(args[0]);
        }	
		if (command === 'addItemToHolder') {
            $inventoryManager.addItemHolder(args[0], args[1], args[2]);
        }
		if (command === 'removeItemFromHolder') {
            $inventoryManager.removeItemHolder(args[0], args[1]);
        }
		if (command === 'focusActor') {
			var actorId = args[0];
			var parts = actorId.match(/\<(.*)\>/);	
			if(parts && parts.length > 1){
				actorId = $gameVariables.value(parts[1]);
			}
			
			var event = $gameMap.event($gameSystem.ActorToEvent(actorId));
			if(event && !event.isErased()){
				$gamePlayer.locate(event.posX(), event.posY());
			}
        }
		if (command === 'focusEvent') {
			var event = $gameMap.event(args[0]);
			if(event && !event.isErased()){
				$gamePlayer.locate(event.posX(), event.posY());
			}
        }
		
		if (command === 'clearDeployInfo') {
			var deployInfo = $gameSystem.getDeployInfo();
			deployInfo.count = 0;
			deployInfo.assigned = {};
			deployInfo.assignedShips = {};
			deployInfo.lockedSlots = {};
			$gameSystem.setDeployInfo(deployInfo);
        }
		
		if (command === 'setDeployCount') {
			var deployInfo = $gameSystem.getDeployInfo();
			deployInfo.count = args[0];
			$gameSystem.setDeployInfo(deployInfo);
        }
		
		if (command === 'assignSlot') {
			//args[0]: slot 
			//args[1]: actor id
			var deployInfo = $gameSystem.getDeployInfo();
			var actorId = args[1];
			var parts = actorId.match(/\<(.*)\>/);	
			if(parts && parts.length > 1){
				actorId = $gameVariables.value(parts[1]);
			}
			deployInfo.assigned[args[0]] = actorId;
			$gameSystem.setDeployInfo(deployInfo);
        }
		
		if (command === 'assignShipSlot') {
			//args[0]: slot 
			//args[1]: actor id
			var deployInfo = $gameSystem.getDeployInfo();
			deployInfo.assignedShips[args[0]] = args[1];
			$gameSystem.setDeployInfo(deployInfo);
        }
		
		if (command === 'lockDeploySlot') {
			//prevents a slot from being changed by the player in the menu, assignSlot can still override
			var deployInfo = $gameSystem.getDeployInfo();
			deployInfo.lockedSlots[args[0]] = true;
			$gameSystem.setDeployInfo(deployInfo);
		}
		
		if (command === 'unlockDeploySlot') {
			var deployInfo = $gameSystem.getDeployInfo();
			deployInfo.lockedSlots[args[0]] = false;
			$gameSystem.setDeployInfo(deployInfo);
		}
		
		if (command === 'setSRWBattleBg') {
			$gameSystem.battleBg = args[0];
		}
		
		if (command === 'setSRWBattleParallax1') {
			$gameSystem.battleParallax1 = args[0];
		}
		
		if (command === 'setSRWBattleParallax2') {
			$gameSystem.battleParallax2 = args[0];
		}
		
		if (command === 'setSRWBattleParallax3') {
			$gameSystem.battleParallax3 = args[0];
		}
		
		if (command === 'setSRWBattleParallax3') {
			$gameSystem.battleParallax3 = args[0];
		}
		
		if (command === 'setSRWBattleFloor') {
			$gameSystem.battleFloor = args[0];
		}
		
		if (command === 'setSRWBattleSkybox') {
			$gameSystem.battleSkyBox = args[0];
		}
		
		if (command === 'setSRWSkyBattleBg') {
			$gameSystem.skyBattleBg = args[0];
		}
		
		if (command === 'setSRWSkyBattleParallax1') {
			$gameSystem.skyBattleParallax1 = args[0];
		}
		
		if (command === 'setSRWDefaultBattleEnv') {
			$gameSystem.defaultBattleEnv = args[0];
		}
		
		if (command === 'setDefaultBattleEnv') {
			$gameSystem.defaultBattleEnv = args[0];
		}
		
		if (command === 'setSkyBattleEnv') {
			$gameSystem.skyBattleEnv = args[0];
		}
		
		if (command === 'setRegionBattleEnv') {
			$gameSystem.regionBattleEnv[args[0]] = args[1];
		}
		
		if (command === 'setRegionSkyBattleEnv') {
			$gameSystem.regionSkyBattleEnv[args[0]] = args[1];
		}
		
		if (command === 'addMapHighlight') {
			if(!$gameSystem.highlightedTiles){
				$gameSystem.highlightedTiles = [];
			}
			$gameSystem.highlightedTiles.push({x: args[0], y: args[1], color: args[2] || "white"});
			$gameSystem.highlightsRefreshed = true;
		}
		
		if (command === 'removeMapHighlight') {
			if($gameSystem.highlightedTiles){
				var x = args[0];
				var y = args[1];
				var tmp = [];
				for(var i = 0; i < $gameSystem.highlightedTiles.length; i++){
					if($gameSystem.highlightedTiles[i].x != x || $gameSystem.highlightedTiles[i].y != y){
						tmp.push($gameSystem.highlightedTiles);
					}
				}
				$gameSystem.highlightedTiles = tmp;
			}
			$gameSystem.highlightsRefreshed = true;
		}
		
		if (command === 'addMapRegionHighlight') {
			if(!$gameSystem.regionHighlights){
				$gameSystem.regionHighlights = {};
			}
			$gameSystem.regionHighlights[args[0]] = args[1] || "white";
			$gameSystem.highlightsRefreshed = true;
		}
		
		if (command === 'removeMapRegionHighlight') {
			delete $gameSystem.regionHighlights[args[0]];
			$gameSystem.highlightsRefreshed = true;
		}
		
		if (command === 'setEnemyUpgradeLevel') {
			$gameSystem.enemyUpgradeLevel = args[0];
		}
		
		if (command === 'setMechUpgradeLevel') {
			var mechId = args[0]*1;
			var targetLevel = args[1]*1;
			var force = args[2]*1;
			var mechData = $statCalc.getMechData($dataClasses[mechId], true);
			if(mechData && mechData.id != -1){
				var upgradeLevels = mechData.stats.upgradeLevels;
				var targetUpgrades = ["maxHP","maxEN","armor","mobility","accuracy","weapons"];
				targetUpgrades.forEach(function(upgrade){
					if(upgradeLevels[upgrade] < targetLevel || force){
						upgradeLevels[upgrade] = targetLevel;
					}
				});
			}
			$statCalc.storeMechData(mechData);
		}
		
		if (command === 'setPilotRelationship') {
			var actorId = parseInt(args[0]);
			var otherActorId = parseInt(args[1]);
			var effectId = parseInt(args[2]);
			var level = parseInt( args[3]);
			
			var actor = $gameActors.actor(actorId);
			if(!actor.SRWStats.pilot.relationships){
				actor.SRWStats.pilot.relationships = {};
			}
			actor.SRWStats.pilot.relationships[otherActorId] = {
				actor: otherActorId,
				effectId: effectId,
				level: level
			};
			$statCalc.storeActorData(actor);	
		}		
		
		if (command === 'addPersuadeOption') {
			//args[0] = actorId
			//args[1] = eventId
			//args[2] = varId
			if(!$gameSystem.persuadeOptions[args[0]]){
				$gameSystem.persuadeOptions[args[0]] = {};
			}
			$gameSystem.persuadeOptions[args[0]][args[1]] = args[2];
		}	

		if (command === 'removePersuadeOption') {
			//args[0] = actorId
			//args[1] = eventId
			if($gameSystem.persuadeOptions[args[0]]){
				delete $gameSystem.persuadeOptions[args[0]][args[1]];
			}
		}	
		
		if (command === 'deployShips') {
			$gameSystem.deployShips(args[0]);
		}
		
		if (command === 'deployAll') {
			$gameSystem.deployActors(args[0]);
		}
		
		if (command === 'deployAllLocked') {
			$gameSystem.deployActors(args[0], true);
		}
		
		if (command === 'deployActor') {
			var actor_unit = $gameActors.actor(args[0]);
			var event = $gameMap.event(args[1]);
			if(actor_unit && event){
				var type;
				if(event.event().meta.type){
					type = event.event().meta.type;
				} else {
					type = "actor";
				}
				event.setType(type);
				$gameSystem.deployActor(actor_unit, event, args[2] * 1);
			}			
		}
		
		if (command === 'deploySlot') {
			var slot = args[0];
			var deployInfo = $gameSystem.getDeployInfo();
			var actor_id = deployInfo.assigned[slot];
			var actor_unit = $gameActors.actor(actor_id);
			var eventId = -1;
			var ctr = 0;
			var actorEventCtr = 0;
			var events = $gameMap.events();
			while(eventId == -1 && ctr < events.length){
				var event = events[ctr];
				if (event.isType() === 'actor'){
					if(actorEventCtr == slot){
						eventId = event.eventId();
					}
					actorEventCtr++;
				}
				ctr++;
			}
			if(actor_unit && eventId != -1){
				$gameSystem.deployActor(actor_unit, $gameMap.event(eventId), args[1]);
			}			
		}
		
		if (command === 'redeployActor') {
			$gameSystem.redeployActor(args[0], args[1] * 1);			
		}
		
		if (command === 'moveEventToPoint') {
			$gameMap._interpreter.setWaitMode("move_to_point");
			$gameSystem.setSrpgWaitMoving(true);
			var event = $gameMap.event(args[0]);
			var position = $statCalc.getAdjacentFreeSpace({x: args[1], y: args[2]});
			event.srpgMoveToPoint(position, true);
			if(args[3] * 1){
				$gameTemp.followMove = true;
			}			
		}
		
		if (command === 'setEventFlying') {
			var actor = $gameSystem.EventToUnit(args[0])[1];
			if($statCalc.canFly(actor)){
				$statCalc.setFlying(actor, true);
			}			
		}
		
		if (command === 'setEventLanded') {
			var actor = $gameSystem.EventToUnit(args[0])[1];		
			$statCalc.setFlying(actor, false);						
		}
		
		if (command === 'enableFaction') {
			$gameSystem.enableFaction(args[0]);
		}
		
		if (command === 'disableFaction') {
			$gameSystem.disableFaction(args[0]);
		}			
		
		if (command === 'setFactionAggro') {
			$gameSystem.setFactionAggro(args[0], JSON.parse(args[1]));
		}
		
		if (command === 'clearFactionAggro') {
			$gameSystem.clearFactionAggro(args[0]);
		}
		
		if (command === 'transformEvent') {
			var actor = $gameSystem.EventToUnit(args[0])[1];
			$statCalc.transform(actor, true);
			var se = {};
			se.name = 'SRWTransform';
			se.pan = 0;
			se.pitch = 100;
			se.volume = 80;
			AudioManager.playSe(se);
		}	

		if (command === 'combineEvent') {
			var actor = $gameSystem.EventToUnit(args[0])[1];
			$statCalc.combine(actor, true);
			var se = {};
			se.name = 'SRWTransform';
			se.pan = 0;
			se.pitch = 100;
			se.volume = 80;
			AudioManager.playSe(se);
		}	

		if (command === 'splitEvent') {
			var actor = $gameSystem.EventToUnit(args[0])[1];
			$statCalc.split(actor, true);
			var se = {};
			se.name = 'SRWTransform';
			se.pan = 0;
			se.pitch = 100;
			se.volume = 80;
			AudioManager.playSe(se);
		}
		
		if (command === 'transformActor') {
			var actor = $gameActors.actor(args[0]);
			$statCalc.transform(actor, true);
			var se = {};
			se.name = 'SRWTransform';
			se.pan = 0;
			se.pitch = 100;
			se.volume = 80;
			AudioManager.playSe(se);
		}	

		if (command === 'combineActor') {
			var actor = $gameActors.actor(args[0]);
			$statCalc.combine(actor, true);
			var se = {};
			se.name = 'SRWTransform';
			se.pan = 0;
			se.pitch = 100;
			se.volume = 80;
			AudioManager.playSe(se);
		}	

		if (command === 'splitActor') {
			var actor = $gameActors.actor(args[0]);
			$statCalc.split(actor, true);
			var se = {};
			se.name = 'SRWTransform';
			se.pan = 0;
			se.pitch = 100;
			se.volume = 80;
			AudioManager.playSe(se);
		}
		
		if (command === 'preventActorDeathQuote') {
			if(!$gameTemp.preventedDeathQuotes){
				$gameTemp.preventedDeathQuotes = {};
			}
			$gameTemp.preventedDeathQuotes[args[0]] = true;
		}
		
		if (command === 'setSaveDisplayName') {			
			$gameSystem.saveDisplayName = (args[0] || "").replace(/\_/ig, " ");
		}	

		if (command === 'setStageTextId') {			
			$gameSystem.stageTextId = args[0];
		}				
		
		if (command === 'setEventWill') {	
			var actor = $gameSystem.EventToUnit(args[0])[1];
			$statCalc.setWill(actor, args[1] * 1);
		}
		
		if (command === 'setActorWill') {	
			var actor = $gameActors.actor(args[0]);
			$statCalc.setWill(actor, args[1] * 1);
		}
		
		if (command === 'makeActorAI') {	
			var actor = $gameActors.actor(args[0]);
			$statCalc.setIsAI(actor, true);
		}
		
		if (command === 'makeActorControllable') {	
			var actor = $gameActors.actor(args[0]);
			$statCalc.setIsAI(actor, false);
		}
		
		if (command === 'setActorEssential') {
			var actor = $gameActors.actor(args[0]);
			$statCalc.setEssential(actor, true);
		}
		
		if (command === 'setActorNonEssential') {
			var actor = $gameActors.actor(args[0]);
			$statCalc.setEssential(actor, false);
		}
		
		if (command === 'unlockMechWeapon') {			
			$statCalc.setWeaponUnlocked(args[0], args[1]);
		}
		
		if (command === 'lockMechWeapon') {
			$statCalc.setWeaponLocked(args[0], args[1]);
		}
		
		if (command === 'setUnlockedUpgradeLevel') {
			var tmp = parseInt(args[0]);
			if(!isNaN(tmp)){
				$gameSystem.unlockedUpgradeLevel = tmp;
			}			
		}
		
		if (command === 'setRequiredFUBLevel') {
			var tmp = parseInt(args[0]);
			if(!isNaN(tmp)){
				$gameSystem.requiredFUBLevel = tmp;
			}			
		}
		
		if (command === 'setEventCounterAction') {	
			var actor = $gameSystem.EventToUnit(args[0])[1];
			actor.counterBehavior = args[1];
		}
		
		if (command === 'setEventBattleMode') {	
			var battlerArray = $gameSystem.EventToUnit(args[0]);
			if (battlerArray && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
				battlerArray[1].setBattleMode(args[1], true);			
			}
			if(battlerArray[0] === 'enemy'){
				if(battlerArray[1].squadId != -1){
					this.setSquadMode(squadId, args[1]);
				}
			}	
			return true;
		};
		
		if (command === 'hidePilotAbility') {	
			$gameSystem.setPilotAbilityStatus(args[0], args[1], "hidden");
		}
		
		if (command === 'lockPilotAbility') {	
			$gameSystem.setPilotAbilityStatus(args[0], args[1], "locked");
		}
		
		if (command === 'unlockPilotAbility') {	
			$gameSystem.setPilotAbilityStatus(args[0], args[1], "");
		}
		
		if (command === 'hideMechAbility') {	
			$gameSystem.setMechAbilityStatus(args[0], args[1], "hidden");
		}
		
		if (command === 'lockMechAbility') {	
			$gameSystem.setMechAbilityStatus(args[0], args[1], "locked");
		}
		
		if (command === 'unlockMechAbility') {	
			$gameSystem.setMechAbilityStatus(args[0], args[1], "");
		}
		
		if (command === 'lockTransformation') {	
			$gameSystem.lockTransformation(args[0]);
		}
		
		if (command === 'lockAllTransformations') {	
			$gameSystem.lockAllTransformations();
		}
		
		if (command === 'unlockTransformation') {	
			$gameSystem.unlockTransformation(args[0]);
		}
		
		if (command === 'unlockAllTransformations') {	
			$gameSystem.unlockAllTransformations();
		}
		
		if (command === 'setFaceAlias') {	
			if(!$gameSystem.faceAliases){
				$gameSystem.faceAliases = {};
			}
			$gameSystem.faceAliases[args[0]] = args[1];
		}
		
		if (command === 'setCharacterIndexAlias') {	
			if(!$gameSystem.characterIdexAliases){
				$gameSystem.characterIdexAliases = {};
			}
			$gameSystem.characterIdexAliases[args[0]] = args[1];
		}
		
		if (command == 'showTargetingReticule'){			
			var eventIdSource;
			var parts = args[0].match(/\actor\:(.*)/);	
			if(parts && parts.length > 1){
				eventIdSource = $gameSystem.ActorToEvent(parts[1]);
			} else {
				eventIdSource = args[0];
			}			
			
			var eventIdTarget;
			var parts = args[1].match(/\actor\:(.*)/);	
			if(parts && parts.length > 1){
				eventIdTarget = $gameSystem.ActorToEvent(parts[1]);
			} else {
				eventIdTarget = args[1];
			}
			
			var actionArray = $gameSystem.EventToUnit(eventIdSource);
			var targetArray = $gameSystem.EventToUnit(eventIdTarget);
			if(actionArray && targetArray){
				$gameTemp.reticuleInfo = {
					actor: actionArray[1],
					targetActor: targetArray[1]
				};
			}			
		}
    };		
//====================================================================
// ●Game_Temp
//====================================================================
    //初期化処理
    var _SRPG_Game_Temp_initialize = Game_Temp.prototype.initialize;
    Game_Temp.prototype.initialize = function() {
		_SRPG_Game_Temp_initialize.call(this);
		this._MoveTable = [];
		this._MoveList = [];
		this._RangeTable = [];
		this._RangeList = [];
		this._ResetMoveList = false;
		this._SrpgDistance = 0;
		this._SrpgSpecialRange = true;
		this._ActiveEvent = null;
		this._TargetEvent = null;
		this._OriginalPos = [];
		this._SrpgEventList = [];
		this._autoMoveDestinationValid = false;
		this._autoMoveDestinationX = -1;
		this._autoMoveDestinationY = -1;
		this._srpgLoadFlag = false;
		this._srpgActorEquipFlag = false;
		this._SrpgTurnEndFlag = false;
		this._srpgBestSearchFlag = false;
		this._srpgBestSearchRoute = [null, []];
		this._srpgPriorityTarget = null;
    };
	
	DataManager.loadGameWithoutRescue = function(savefileId) {
		if (this.isThisGameFile(savefileId)) {
			var json = StorageManager.load(savefileId);
			this.createGameObjects();
			this.extractSaveContents(JsonEx.parse(json));
			this._lastAccessedId = savefileId;
			//$gameSystem.setSrpgActors();
			//$gameSystem.setSrpgEnemys();
			$statCalc.softRefreshUnits();
			return true;
		} else {
			return false;
		}
	};
	
    //移動範囲と移動経路を記録する配列変数を返す
    Game_Temp.prototype.MoveTable = function(x, y) {
        return this._MoveTable[x][y];
    };

    //移動範囲を設定する
    Game_Temp.prototype.setMoveTable = function(x, y, move, route) {
        this._MoveTable[x][y] = [move, route];
    };

    //攻撃射程と計算経路を記録する配列変数を返す
    Game_Temp.prototype.RangeTable = function(x, y) {
        return this._RangeTable[x][y];
    };

    //攻撃射程を設定する
    Game_Temp.prototype.setRangeTable = function(x, y, move, route) {
        this._RangeTable[x][y] = [move, route];
    };

    //移動可能な座標のリストを返す(移動範囲表示で使用)
    Game_Temp.prototype.moveList = function() {
        return this._MoveList;
    };

    //移動可能な座標のリストに追加する
    Game_Temp.prototype.pushMoveList = function(xy) {
        this._MoveList.push(xy);
    };

    //座標リストにデータが入っているか返す
    Game_Temp.prototype.isMoveListValid = function() {
        return this._MoveList.length > 0;
    };

    //攻撃可能な座標のリストを返す(攻撃射程表示で使用)
    Game_Temp.prototype.rangeList = function() {
        return this._RangeList;
    };

    //攻撃可能な座標のリストに追加する
    Game_Temp.prototype.pushRangeList = function(xy) {
        this._RangeList.push(xy);
    };

    //移動範囲の配列に射程範囲の配列を結合する
    Game_Temp.prototype.pushRangeListToMoveList = function(array) {
        Array.prototype.push.apply(this._MoveList, this._RangeList);
    };

    //射程範囲から最低射程を除く
    Game_Temp.prototype.minRangeAdapt = function(oriX, oriY, minRange) {
        var newList = [];
        for (var i = 0; i < this._RangeList.length; i++) {
            var x = this._RangeList[i][0];
            var y = this._RangeList[i][1];
            var dis = Math.abs(x - oriX) + Math.abs(y - oriY);
            if (dis >= minRange) {
                newList.push(this._RangeList[i]);
            }
        }
        this._RangeList = [];
        this._RangeList = newList;
    };

    //移動範囲を初期化する
    Game_Temp.prototype.clearMoveTable = function() {
		$gameTemp.validTiles = {};
		$gameSystem.highlightedTiles = [];
		$gameSystem.highlightsRefreshed = true;
		$gameTemp.disableHighlightGlow = false;
        this._MoveTable = [];
        this._MoveList = [];
        for (var i = 0; i < $dataMap.width; i++) {
          var vartical = [];
          for (var j = 0; j < $dataMap.height; j++) {
            vartical[j] = [-1, []];
          }
          this._MoveTable[i] = vartical;
        }
        this._RangeTable = [];
        this._RangeList = [];
        for (var i = 0; i < $dataMap.width; i++) {
          var vartical = [];
          for (var j = 0; j < $dataMap.height; j++) {
            vartical[j] = [-1, []];
          }
          this._RangeTable[i] = vartical;
        }
    };

    //移動範囲のスプライト消去のフラグを返す
    Game_Temp.prototype.resetMoveList = function() {
        return this._ResetMoveList;
    };

    //移動範囲のスプライト消去のフラグを設定する
    Game_Temp.prototype.setResetMoveList = function(flag) {
        this._ResetMoveList = flag;
    };

    //自身の直下は常に歩けるようにする
    Game_Temp.prototype.initialMoveTable = function(oriX, oriY, oriMove) {
        this.setMoveTable(oriX, oriY, oriMove, [0]);
        this.pushMoveList([oriX, oriY, false]);
    }

    //自身の直下は常に攻撃射程に含める
    Game_Temp.prototype.initialRangeTable = function(oriX, oriY, oriMove) {
        this.setRangeTable(oriX, oriY, oriMove, [0]);
        this.pushRangeList([oriX, oriY, true]);
    }

    //攻撃ユニットと対象の距離を返す
    Game_Temp.prototype.SrpgDistance = function() {
        return this._SrpgDistance;
    };

    //攻撃ユニットと対象の距離を設定する
    Game_Temp.prototype.setSrpgDistance = function(val) {
        this._SrpgDistance = val;
    };

    //攻撃ユニットと対象が特殊射程内にいるかを返す
    Game_Temp.prototype.SrpgSpecialRange = function() {
        return this._SrpgSpecialRange;
    };

    //攻撃ユニットと対象が特殊射程内にいるかを設定する
    Game_Temp.prototype.setSrpgSpecialRange = function(val) {
        this._SrpgSpecialRange = val;
    };

    //アクティブイベントの設定
    Game_Temp.prototype.activeEvent = function() {
        return this._ActiveEvent;
    };

    Game_Temp.prototype.setActiveEvent = function(event) {
        this._ActiveEvent = event;
        $gameVariables.setValue(_activeEventID, event.eventId());
		var actor = $gameSystem.EventToUnit(event.eventId())[1];
		if(actor.isActor()){
			$gameVariables.setValue(_currentActorId, actor.actorId());
		} else {
			$gameVariables.setValue(_currentEnemyId, actor.enemyId());
		}		
    };

    Game_Temp.prototype.clearActiveEvent = function() {
        this._ActiveEvent = null;
        $gameVariables.setValue(_activeEventID, 0);
    };

    //行動対象となるユニットの設定
    Game_Temp.prototype.targetEvent = function() {
        return this._TargetEvent;
    };

    Game_Temp.prototype.setTargetEvent = function(event) {
        this._TargetEvent = event;
        if (this._TargetEvent) {
            $gameVariables.setValue(_targetEventID, event.eventId());
			var actor = $gameSystem.EventToUnit(event.eventId())[1];
			if(actor.isActor()){
				$gameVariables.setValue(_currentActorId, actor.actorId());
			} else {
				$gameVariables.setValue(_currentEnemyId, actor.enemyId());
			}	
        }
    };

    Game_Temp.prototype.clearTargetEvent = function() {
        this._TargetEvent = null;
        $gameVariables.setValue(_targetEventID, 0);
    };

    //アクティブイベントの座標を返す
    Game_Temp.prototype.originalPos = function() {
        return this._OriginalPos;
    };

    //アクティブイベントの座標を記録する
    Game_Temp.prototype.reserveOriginalPos = function(x, y) {
        this._OriginalPos = [x, y];
    };

    //実行待ちイベントリストを確認する
    Game_Temp.prototype.isSrpgEventList = function() {
        return this._SrpgEventList.length > 0;
    };

    //実行待ちイベントリストを追加する
    Game_Temp.prototype.pushSrpgEventList = function(event) {
        this._SrpgEventList.push(event);
    };

    //実行待ちイベントリストの先頭を取得し、前に詰める
    Game_Temp.prototype.shiftSrpgEventList = function() {
        var event = this._SrpgEventList[0];
        this._SrpgEventList.shift();
        return event;
    };

    //プレイヤーの自動移動フラグを返す
    Game_Temp.prototype.isAutoMoveDestinationValid = function() {
        return this._autoMoveDestinationValid;
    };

    //プレイヤーの自動移動フラグを設定する
    Game_Temp.prototype.setAutoMoveDestinationValid = function(val) {
        this._autoMoveDestinationValid = val;
    };

    //プレイヤーの自動移動先を返す(X)
    Game_Temp.prototype.autoMoveDestinationX = function() {
        return this._autoMoveDestinationX;
    };

    //プレイヤーの自動移動先を返す(Y)
    Game_Temp.prototype.autoMoveDestinationY = function() {
        return this._autoMoveDestinationY;
    };

    //プレイヤーの自動移動先を設定する
    Game_Temp.prototype.setAutoMoveDestination = function(x, y) {
        this._autoMoveDestinationX = x;
        this._autoMoveDestinationY = y;
    };

    //戦闘中にロードしたフラグを返す
    Game_Temp.prototype.isSrpgLoadFlag = function() {
        return this._srpgLoadFlag;
    };

    //戦闘中にロードしたフラグを設定する
    Game_Temp.prototype.setSrpgLoadFlag = function(flag) {
        this._srpgLoadFlag = flag;
    };

    //ターン終了フラグを返す
    Game_Temp.prototype.isTurnEndFlag = function() {
        return this._SrpgTurnEndFlag;
    };

    //ターン終了フラグを変更する
    Game_Temp.prototype.setTurnEndFlag = function(flag) {
        this._SrpgTurnEndFlag = flag;
    };

    //オート戦闘フラグを返す
    Game_Temp.prototype.isAutoBattleFlag = function() {
        return this._SrpgAutoBattleFlag;
    };

    //オート戦闘フラグを変更する
    Game_Temp.prototype.setAutoBattleFlag = function(flag) {
        this._SrpgAutoBattleFlag = flag;
    };

    //アクターコマンドから装備を呼び出したフラグを返す
    Game_Temp.prototype.isSrpgActorEquipFlag = function() {
        return this._srpgActorEquipFlag;
    };

    //アクターコマンドから装備を呼び出したフラグを設定する
    Game_Temp.prototype.setSrpgActorEquipFlag = function(flag) {
        this._srpgActorEquipFlag = flag;
    };

    //探索用移動範囲計算時の実行フラグを返す
    Game_Temp.prototype.isSrpgBestSearchFlag = function() {
        return this._srpgBestSearchFlag;
    };

    //探索用移動範囲計算時の実行フラグを設定する
    Game_Temp.prototype.setSrpgBestSearchFlag = function(flag) {
        this._srpgBestSearchFlag = flag;
    };

    //探索用移動範囲計算時の最適ルートを返す
    Game_Temp.prototype.isSrpgBestSearchRoute = function() {
        return this._srpgBestSearchRoute;
    };

    //探索用移動範囲計算時の最適ルートを設定する
    Game_Temp.prototype.setSrpgBestSearchRoute = function(array) {
        this._srpgBestSearchRoute = array;
    };

    //優先ターゲットを返す
    Game_Temp.prototype.isSrpgPriorityTarget = function() {
        return this._srpgPriorityTarget;
    };

    //優先ターゲットを設定する
    Game_Temp.prototype.setSrpgPriorityTarget = function(event) {
        this._srpgPriorityTarget = event;
    };
	
	Game_Temp.prototype.isMapTarget = function(eventId) {
		var result = false;
		if(this.currentMapTargets){
			for(var i = 0; i < this.currentMapTargets.length; i++){
				if(this.currentMapTargets[i].event.eventId() == eventId){
					result = true;
				}
			}
		}
		return result;
    };

//====================================================================
// ●Game_System
//====================================================================
//初期化処理
    var _SRPG_Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _SRPG_Game_System_initialize.call(this);
        this._SRPGMode = false;
        this._isBattlePhase = 'initialize';
        this._isSubBattlePhase = 'initialize';
        this._AutoUnitId = 0;
        this._EventToUnit = [];
        this._SrpgStatusWindowRefreshFlag = [false, null];
        this._SrpgBattleWindowRefreshFlag = [false, null, null];
        this._SrpgWaitMoving = false;
        this._SrpgActorCommandWindowRefreshFlag = [false, null];
        this._SrpgActorCommandStatusWindowRefreshFlag = [false, null];
        this._srpgAllActors = []; //SRPGモードに参加する全てのアクターの配列
        this._searchedItemList = [];
    };

//変数関係の処理
    //戦闘中かどうかのフラグを返す
    Game_System.prototype.isSRPGMode = function() {
        return this._SRPGMode;
    };

    //戦闘のフェーズを返す
    // initialize：初期化状態
    // actor_phase：アクター行動フェーズ
    // auto_actor_phase：アクター自動行動フェーズ
    // enemy_phase：エネミー行動フェーズ
    Game_System.prototype.isBattlePhase = function() {
        return this._isBattlePhase;
    };

    //戦闘のフェーズを変更する
    Game_System.prototype.setBattlePhase = function(phase) {
        this._isBattlePhase = phase;
    };

    //戦闘のサブフェーズを返す。各BattlePhase内で使用され、処理の進行を制御する。
    // initialize：初期化を行う状態
    // normal：行動アクターが選択されていない状態
    // actor_move：移動範囲が表示され、移動先を選択している状態
    // actor_target：行動対象を選択している状態
    // status_window：ステータスウィンドウが開かれている状態
    // actor_command_window：アクターコマンドウィンドウが開かれている状態
    // battle_window：攻撃確認ウィンドウが開かれている状態
    // auto_actor_command：自動行動アクターをイベント順に行動決定する状態
    // auto_actor_move : 自動行動アクターが移動先を決定し、移動する状態
    // auto_actor_action：自動行動アクターの実際の行動を行う状態
    // enemy_command：エネミーをイベント順に行動決定する状態
    // enemy_move : エネミーが移動先を決定し、移動する状態
    // enemy_action：エネミーの実際の行動を行う状態
    // invoke_action：戦闘を実行している状態
    // after_battle：戦闘終了後の処理を呼び出す状態
    Game_System.prototype.isSubBattlePhase = function() {
        return this._isSubBattlePhase;
    };

    //戦闘のサブフェーズを変更する
    Game_System.prototype.setSubBattlePhase = function(phase) {
        this._isSubBattlePhase = phase;
    };

    //自動行動・エネミーの実行ＩＤを返す
    Game_System.prototype.isAutoUnitId = function() {
        return this._AutoUnitId;
    };

    //自動行動・エネミーの実行ＩＤを設定する
    Game_System.prototype.setAutoUnitId = function(num) {
        this._AutoUnitId = num;
    };

    // ステータスウィンドウのリフレッシュフラグを返す
    Game_System.prototype.srpgStatusWindowNeedRefresh = function() {
        return this._SrpgStatusWindowRefreshFlag;
    };

    // ステータスウィンドウのリフレッシュフラグを設定する
    Game_System.prototype.setSrpgStatusWindowNeedRefresh = function(battlerArray) {
        this._SrpgStatusWindowRefreshFlag = [true, battlerArray];
    };

    // ステータスウィンドウのリフレッシュフラグをクリアする
    Game_System.prototype.clearSrpgStatusWindowNeedRefresh = function() {
        this._SrpgStatusWindowRefreshFlag = [false, null];
    };

    // 予想ウィンドウ・戦闘開始ウィンドウのリフレッシュフラグを返す
    Game_System.prototype.srpgBattleWindowNeedRefresh = function() {
        return this._SrpgBattleWindowRefreshFlag;
    };

    // 予想ウィンドウ・戦闘開始ウィンドウのリフレッシュフラグを設定する
    Game_System.prototype.setSrpgBattleWindowNeedRefresh = function(actionBattlerArray, targetBattlerArray) {
        this._SrpgBattleWindowRefreshFlag = [true, actionBattlerArray, targetBattlerArray];
    };

    // 予想ウィンドウ・戦闘開始ウィンドウのリフレッシュフラグをクリアする
    Game_System.prototype.clearSrpgBattleWindowNeedRefresh = function() {
        this._SrpgBattleWindowRefreshFlag = [false, null, null];
    };

    //移動範囲を表示するスプライトの最大数
    Game_System.prototype.spriteMoveTileMax = function() {
        return Math.min($dataMap.width * $dataMap.height, 1000);
    };

    // 移動中のウェイトフラグを返す
    Game_System.prototype.srpgWaitMoving = function() {
        return this._SrpgWaitMoving;
    };

    // 移動中のウェイトフラグを設定する
    Game_System.prototype.setSrpgWaitMoving = function(flag) {
        this._SrpgWaitMoving = flag;
    };

    // アクターコマンドウィンドウのリフレッシュフラグを返す
    Game_System.prototype.srpgActorCommandWindowNeedRefresh = function() {
        return this._SrpgActorCommandWindowRefreshFlag;
    };

    // アクターコマンドウィンドウのリフレッシュフラグを設定する
    Game_System.prototype.setSrpgActorCommandWindowNeedRefresh = function(battlerArray) {
        this._SrpgActorCommandWindowRefreshFlag = [true, battlerArray];
    };

    // アクターコマンドウィンドウのリフレッシュフラグをクリアする
    Game_System.prototype.clearSrpgActorCommandWindowNeedRefresh = function() {
        this._SrpgActorCommandWindowRefreshFlag = [false, null];
    };

    // 行動中アクターの簡易ステータスウィンドウのリフレッシュフラグを返す
    Game_System.prototype.srpgActorCommandStatusWindowNeedRefresh = function() {
        return this._SrpgActorCommandStatusWindowRefreshFlag;
    };

    // 行動中アクターの簡易ステータスウィンドウのリフレッシュフラグを設定する
    Game_System.prototype.setSrpgActorCommandStatusWindowNeedRefresh = function(battlerArray) {
        this._SrpgActorCommandStatusWindowRefreshFlag = [true, battlerArray];
    };

    // 行動中アクターの簡易ステータスウィンドウのリフレッシュフラグをクリアする
    Game_System.prototype.clearSrpgActorCommandStatusWindowNeedRefresh = function() {
        this._SrpgActorCommandStatusWindowRefreshFlag = [false, null];
    };

    //戦闘に参加するアクターのリスト
    Game_System.prototype.srpgAllActors = function() {
        return this._srpgAllActors;
    };

    Game_System.prototype.clearSrpgAllActors = function() {
        this._srpgAllActors = [];
    };

    Game_System.prototype.pushSrpgAllActors = function(actor) {
        this._srpgAllActors.push(actor);
    };

    // 探査済み座標のリスト
    Game_System.prototype.pushSearchedItemList = function(xy) {
        if (!this._searchedItemList) {
            this._searchedItemList = [];
        }
        this._searchedItemList.push(xy);
    };

    Game_System.prototype.indexOfSearchedItemList = function(xy) {
        if (!this._searchedItemList) {
            this._searchedItemList = [];
        }
        var flag = -1;
        for (var i=0; i < this._searchedItemList.length; i++) {
            var xy2 = this._searchedItemList[i];
            if (xy[0] === xy2[0] && xy[1] === xy2[1]) {
                flag = i;
                break;
            }
        };
        return flag;
    };

    Game_System.prototype.resetSearchedItemList = function() {
        this._searchedItemList = [];
    };

//戦闘開始に関係する処理
    //戦闘開始するためのプラグイン・コマンド
	Game_System.prototype.startIntermission = function(){
		this._availableUnits = $gameParty.allMembers();
		this._availableUnits.forEach(function(actor){
			actor.isSubPilot = false;
			$statCalc.initSRWStats(actor);
		});
		this._isIntermission = true;
	}
	
	Game_System.prototype.isIntermission = function(id){
		return this._isIntermission;
	}
	
	Game_System.prototype.getAvailableUnits = function(id){
		return this._availableUnits;
	}
	
	//use $gameActors.actor instead!
	Game_System.prototype.getActorById = function(id){
		var result;
		var ctr = 0; 
		while(!result && ctr < this._availableUnits.length){
			if(this._availableUnits[ctr].actorId() == id){
				result = this._availableUnits[ctr];
			}
			ctr++;
		}
		return result;
	}
	
	Game_System.prototype.endIntermission = function(){
		$gameTemp.intermissionPending = false;
		this._isIntermission = false;
	}	
	
    Game_System.prototype.startSRPG = function() {
        this._SRPGMode = true;
		this.enableGrid = true;
		$gameTemp.listContext = "actor";
        $gameSwitches.setValue(_srpgBattleSwitchID, true);
        this._isBattlePhase = 'start_srpg';
        this._isSubBattlePhase = 'start_srpg';
        $gamePlayer.refresh();
        $gameTemp.clearActiveEvent();
		$gameTemp.actorAction = {};
		$gameTemp.enemyAction = {};
        this.clearData(); //データの初期化
        this.setAllEventType(); //イベントタイプの設定
		this._availableUnits = [];
        this.setSrpgActors(); //アクターデータの作成
        this.setSrpgEnemys(); //エネミーデータの作成
		
        $gameMap.setEventImages();   // ユニットデータに合わせてイベントのグラフィックを変更する
        this.runBattleStartEvent(); // ゲーム開始時の自動イベントを実行する
		this.runAfterDeployEvent();
		//clear stage temp variables
		for(var i = 21; i <= 60; i++){
			$gameVariables.setValue(i, 0);
		}
	
        $gameVariables.setValue(_turnVarID, 1); //ターン数を初期化する
        $gameSystem.resetSearchedItemList(); //探索済み座標を初期化する
		$gameSystem._specialTheme = -1;
		$gameSystem.highlightedTiles = [];
		$gameSystem.regionHighlights = {};
		$gameSystem.enemyUpgradeLevel = 0;
		$gameSystem.persuadeOptions = {};
		$gameTemp.currentSwapSource = -1;
		$gameTemp.enemyAppearQueue = [];
		$gameSystem.defaultBattleEnv = null;
		$gameSystem.skyBattleEnv = null;
		$gameSystem.regionBattleEnv = {};
		$gameSystem.regionSkyBattleEnv = {};
		$gameSystem.stageTextId = null;
		//$gameSystem.showWillIndicator = false;
		$gameTemp.disappearQueue = [];

		$gameSystem.actorRankLookup = $statCalc.getActorRankLookup();
		$gameTemp.AIWaitTimer = 0;
		
		$gameVariables.setValue(_masteryConditionText, APPSTRINGS.GENERAL.label_default_mastery_condition);	
		$gameVariables.setValue(_victoryConditionText, APPSTRINGS.GENERAL.label_default_victory_condition);	
		$gameVariables.setValue(_defeatConditionText, APPSTRINGS.GENERAL.label_default_defeat_condition);
		
		$gameSystem.factionConfig = {
			0: {
				attacksPlayers:true,
				attacksFactions: [1,2],
				active: true
			},
			1: {
				attacksPlayers:false,
				attacksFactions: [0],
				active: false
			},
			2: {
				attacksPlayers:false,
				attacksFactions: [0],
				active: false
			}
		};
		$gameTemp.preventedDeathQuotes = {};
        
    };
	
	Game_System.prototype.enableFaction = function(id) {
		if(this.factionConfig[id]){
			this.factionConfig[id].active = true;
		}		
	}
	
	Game_System.prototype.disableFaction = function(id) {
		if(this.factionConfig[id]){
			this.factionConfig[id].active = false;
		}		
	}
	
	Game_System.prototype.setFactionAggro = function(id, aggro) {
		if(this.factionConfig[id]){
			this.factionConfig[id].attacksFactions = [];
			for(var i = 0; i < aggro.length; i++){
				if(aggro[i] == "player"){
					this.factionConfig[id].attacksPlayers = true;
				} else {
					this.factionConfig[id].attacksFactions.push(aggro[i]);
				}
			}		
		}
	}		
	
	Game_System.prototype.clearFactionAggro = function(id) {
		if(this.factionConfig[id]){
			this.factionConfig[id].attacksFactions = [];
		}
	}
	
	Game_System.prototype.getPlayerFactionInfo = function() {
		 var aggressiveFactions = [];
		 if(this.factionConfig[0].attacksPlayers){
			 aggressiveFactions.push(0);
		 }
		 if(this.factionConfig[1].attacksPlayers){
			 aggressiveFactions.push(1);
		 }
		 if(this.factionConfig[2].attacksPlayers){
			 aggressiveFactions.push(2);
		 }
		 return {
			attacksPlayers:false,
			attacksFactions: aggressiveFactions,
			active: true 
		 };
	}
	
	Game_System.prototype.getFactionId = function(actor) {
		if(actor.isActor()){
			return "player";
		} else {
			return actor.factionId;
		}		
	}
	
	Game_System.prototype.getEnemyFactionInfo = function(enemy) {
		 return this.factionConfig[enemy.factionId];
	}
	
	Game_System.prototype.isFriendly = function(actor, factionId) {
		var factionInfo = this.getUnitFactionInfo(actor);
		if(factionId == "player"){
			return !factionInfo.attacksPlayers;
		} else {
			return factionInfo.attacksFactions.indexOf(factionId) == -1;
		}
	}	
	
	Game_System.prototype.getUnitFactionInfo = function(actor) {
		if(actor.isActor()){
			return this.getPlayerFactionInfo();
		} else {
			return this.getEnemyFactionInfo(actor);
		}
	}
	
	Game_System.prototype.isEnemy = function(actor) {
		if(!actor.isActor){
			return true;
		}
		if(actor.isActor()){
			return false;
		} else {
			return this.getEnemyFactionInfo(actor).attacksPlayers;
		}
	}
	
	Game_System.prototype.isEnemyPhase = function(actor) {
		return $gameSystem.factionConfig[$gameTemp.currentFaction].attacksPlayers;
	}

    //イベントＩＤに対応するアクター・エネミーデータを初期化する
    Game_System.prototype.clearData = function() {
        this._EventToUnit = [];
        $gameSystem.clearSrpgAllActors();
    };

    //イベントＩＤに対応するアクター・エネミーデータをセットする
    Game_System.prototype.setEventToUnit = function(event_id, type, data) {
        this._EventToUnit[event_id] = [type, data];
    };
	
	Game_System.prototype.clearEventToUnit = function(event_id) {
		delete this._EventToUnit[event_id];
	}

    //イベントＩＤから対応するアクター・エネミーデータを返す
    Game_System.prototype.EventToUnit = function(event_id) {
        //return this._EventToUnit[event_id];
        var battlerArray = this._EventToUnit[event_id];
        if (battlerArray) {
            if (battlerArray[0] === 'actor') {
                var actor = $gameActors.actor(battlerArray[1]);
                return [battlerArray[0], actor]
            } else {
                return battlerArray;
            }
        } else {
            return;
        }
    };

    //アクターＩＤから対応するイベントＩＤを返す
    Game_System.prototype.ActorToEvent = function(actor_id) {
        var eventId = 0;
        $gameMap.events().forEach(function(event) {
            if (event.isType() === 'actor' || event.isType() === 'ship' || event.isType() === 'ship_event') {
				var unit =  $gameSystem.EventToUnit(event.eventId());
				if(unit){
					var actor = unit[1];
					if (actor && actor.actorId() == actor_id) {
						eventId = event.eventId();
					}
				}              
            }
        });
        return eventId;
    };
	

    // イベントのメモからイベントのタイプを設定する
    Game_System.prototype.setAllEventType = function() {
        $gameMap.events().forEach(function(event) {
            if (event.event().meta.type) {
                event.setType(event.event().meta.type);
            }
        });
    }
	
	Game_System.prototype.getActorsWithAction = function(){
		var _this = this;		
		var result = [];
		$gameMap.events().forEach(function(event) {
			var battlerArray = _this.EventToUnit(event.eventId());
			if(!event.isErased() && battlerArray){
				var actor = battlerArray[1];
				if(actor.isActor() && !actor.srpgTurnEnd()){
					result.push(actor);
				}
			}
        });
		return result;
	}

    // イベントのメモからアクターを読み込み、対応するイベントＩＤに紐づけする
    Game_System.prototype.setSrpgActors = function() {
  
        $gameVariables.setValue(_existActorVarID, 0);
		$gameVariables.setValue(_actorsDestroyed, 0);
		$gameVariables.setValue(_existShipVarId, 0);	

		this._availableUnits = $gameParty.allMembers();
		this._availableUnits.forEach(function(actor){
			$statCalc.initSRWStats(actor);
		});
		
		$gameMap.events().forEach(function(event) {
			if (event.isType() === 'actor' || event.isType() === 'ship' || event.isType() === 'ship_event') {
				event.erase();
			}
		});
    };

	Game_System.prototype.deployShips = function(toAnimQueue) {
		var _this = this;
		var deployInfo = _this.getDeployInfo();
		var shipCtr = 0;
		
		$gameMap.events().forEach(function(event) { //ensure to spawn ships first so that are drawn below the other actor sprites
			if (event.isType() === 'ship') {
				var actor_unit;
				var actorId = deployInfo.assignedShips[shipCtr++];				
				if(typeof actorId != "undefined"){
					actor_unit = $gameActors.actor(actorId);
				}
				if (actor_unit) {
					actor_unit.event = event;
                    _this.pushSrpgAllActors(event.eventId());
                    event.isDeployed = true;
                    var bitmap = ImageManager.loadFace(actor_unit.faceName()); //顔グラフィックをプリロードする
                    var oldValue = $gameVariables.value(_existShipVarId);
                    $gameVariables.setValue(_existShipVarId, oldValue + 1);
                    _this.setEventToUnit(event.eventId(), 'actor', actor_unit.actorId());
					$statCalc.initSRWStats(actor_unit);
					actor_unit.setSrpgTurnEnd(false);	
					
					if(toAnimQueue){				
						$gameTemp.enemyAppearQueue.push(event);
						event.erase();
					} else {
						event.appear();
						$gameMap.setEventImages();			
					}
                } else {
					event.erase();
				}
			}
		});
	}
	
	Game_System.prototype.deployActor = function(actor_unit, event, toAnimQueue) {
		var _this = this;
		actor_unit.event = event;
		_this.pushSrpgAllActors(event.eventId());
		event.isDeployed = true;
		var bitmap = ImageManager.loadFace(actor_unit.faceName()); //顔グラフィックをプリロードする
		var oldValue = $gameVariables.value(_existActorVarID);
		$gameVariables.setValue(_existActorVarID, oldValue + 1);
		_this.setEventToUnit(event.eventId(), 'actor', actor_unit.actorId());
		actor_unit.isSubPilot = false;
		
		//$statCalc.initSRWStats(actor_unit);
		
		$statCalc.applyDeployActions(actor_unit.SRWStats.pilot.id, actor_unit.SRWStats.mech.id);
		
		$statCalc.applyBattleStartWill(actor_unit);
		actor_unit.SRPGActionTimesSet($statCalc.applyStatModsToValue(actor_unit, 1, ["extra_action"]));
		actor_unit.setSrpgTurnEnd(false);	
		actor_unit.setBattleMode("");

		var position = $statCalc.getAdjacentFreeSpace({x: event.posX(), y: event.posY()}, null, event.eventId());
		event.locate(position.x, position.y);
		
		if(!$gameTemp.enemyAppearQueue){
			$gameTemp.enemyAppearQueue = [];
		}	
		if(toAnimQueue){				
			$gameTemp.enemyAppearQueue.push(event);
			event.erase();
		} else {
			event.appear();
			//event.refreshImage();
			$gameMap.setEventImages();			
		}
		
		var deployInfo = $gameSystem.getDeployInfo();
		var currentSlot = -1;
		var currentMaxSlot = -1;
		
		Object.keys(deployInfo.assigned).forEach(function(slot){
			if(slot > currentMaxSlot){
				currentMaxSlot = slot;
			}
			if(deployInfo.assigned[slot] == actor_unit.actorId()){
				currentSlot = slot;
			}
		});		
		if(currentSlot == -1){
			deployInfo.assigned[currentMaxSlot+1] = actor_unit.actorId();
		}
		$gameSystem.setDeployInfo(deployInfo);
		
		$statCalc.invalidateAbilityCache();
		$statCalc.initSRWStats(actor_unit);
	}
	
	Game_System.prototype.getEventDeploySlot = function(event) {
		var _this = this;
		if(!this.eventToDeploySlot){
			this.eventToDeploySlot = {};
			var i = 0;
			$gameMap.events().forEach(function(event) {
				if(event.isType() === 'actor') {
					_this.eventToDeploySlot[event.eventId()] = i++;
				}
			});
		}
		return this.eventToDeploySlot[event.eventId()];
	}
	
	Game_System.prototype.highlightDeployTiles = function() {
		var _this = this;
		if(!$gameSystem.highlightedTiles){
			$gameSystem.highlightedTiles = [];
		}
		this.removeDeployTileHighlights();
		$gameTemp.currentDeployTileHighlights = [];
		var deployInfo = _this.getDeployInfo();
		var i = 0;
		$gameMap.events().forEach(function(event) {
			if(event.isType() === 'actor') {
				if(i == $gameTemp.currentSwapSource){
					$gameSystem.highlightedTiles.push({x: event.posX(), y: event.posY(), color: "#00FF00"});
				} else if(deployInfo.lockedSlots[i]){
					$gameSystem.highlightedTiles.push({x: event.posX(), y: event.posY(), color: "yellow"});
				} else if(deployInfo.assigned[i] && !$statCalc.canStandOnTile($gameActors.actor(deployInfo.assigned[i]), {x: event.posX(), y: event.posY()})){
					$gameSystem.highlightedTiles.push({x: event.posX(), y: event.posY(), color: "red"});
				} else {
					$gameSystem.highlightedTiles.push({x: event.posX(), y: event.posY(), color: "white"});
				}
				$gameTemp.currentDeployTileHighlights.push({x: event.posX(), y: event.posY()});
				i++;
			}
		});
		
		$gameSystem.highlightsRefreshed = true;
	}	
	
	Game_System.prototype.removeDeployTileHighlights = function() {
		var _this = this;
		if($gameTemp.currentDeployTileHighlights && $gameSystem.highlightedTiles){
			var tileLookup = {};
			$gameTemp.currentDeployTileHighlights.forEach(function(coords){
				if(!tileLookup[coords.x]){
					tileLookup[coords.x] = {};
				}
				tileLookup[coords.x][coords.y] = true;
			});
						
			var tmp = [];
			for(var i = 0; i < $gameSystem.highlightedTiles.length; i++){
				if(!tileLookup[$gameSystem.highlightedTiles[i].x] || !tileLookup[$gameSystem.highlightedTiles[i].x][$gameSystem.highlightedTiles[i].y]){
					tmp.push($gameSystem.highlightedTiles);
				}
			}
			$gameSystem.highlightedTiles = tmp;
			$gameSystem.highlightsRefreshed = true;
		}
	}
	
	Game_System.prototype.undeployActors = function(){
		$gameVariables.setValue(_existActorVarID, 0);
		$gameSystem.clearSrpgAllActors();
		$gameMap.events().forEach(function(event) {			
			if (event.isType() === 'actor') {
				$gameSystem.clearEventToUnit(event.eventId());
				event.isDeployed = false;
				event.erase();
			}
		});
	}
	
	Game_System.prototype.redeployActors = function(validatePositions){                                                                                                                                                                                                                             
		$gameVariables.setValue(_existActorVarID, 0);
		$gameSystem.clearSrpgAllActors();
		$gameMap.events().forEach(function(event) {
            if (event.isType() === 'actor') {
				$gameSystem.clearEventToUnit(event.eventId());
				event.isDeployed = false;
			}
		 });
		 this.deployActors(false, false, validatePositions);
	}
	
	Game_System.prototype.redeployActor = function(actorId, toAnimQueue){  
		var actor = $gameActors.actor(actorId);		
		$gameMap.events().forEach(function(event) {
			if (event.eventId() === actor.event.eventId()) {
				$gameSystem.clearEventToUnit(event.eventId());
				event.isDeployed = false;
				var oldValue = $gameVariables.value(_existActorVarID);
				$gameVariables.setValue(_existActorVarID, oldValue - 1);
			}
		});
		this.deployActor(actor, actor.event, toAnimQueue);
		actor.initImages(actor.SRWStats.mech.classData.meta.srpgOverworld.split(","));
		if(!toAnimQueue){
			actor.event.refreshImage();
		}		 
	}
	
	Game_System.prototype.deployActors = function(toAnimQueue, lockedOnly, validatePositions) {
		var _this = this;
		var deployInfo = _this.getDeployInfo();
		var i = 0;
        $gameMap.events().forEach(function(event) {
            if (event.isType() === 'actor' && !event.isDeployed) {
              	var actor_unit;
				var actorId = deployInfo.assigned[i];		
				if(!lockedOnly || deployInfo.lockedSlots[i]){
					if(typeof actorId != "undefined"){
						actor_unit = $gameActors.actor(actorId);
					}
					
					
					
					if (actor_unit) {
						var validPosition;
						if(validatePositions && !deployInfo.lockedSlots[i]){
							validPosition = $statCalc.canStandOnTile(actor_unit, {x: event.posX(), y: event.posY()})
						} else {
							validPosition = true;
						}
						if(validPosition){
							_this.deployActor(actor_unit, event, toAnimQueue);
						} else {
							event.erase();
						}						
					} else {
						event.erase();
					}
				}	
				
				i++;	
            }		
        });
	}
	
    // イベントのメモからエネミーを読み込み、対応するイベントＩＤに紐づけする
    Game_System.prototype.setSrpgEnemys = function() {
        $gameVariables.setValue(_existEnemyVarID, 0);
		$gameVariables.setValue(_enemiesDestroyed, 0);
        var i = 0;
        $gameMap.events().forEach(function(event) {
            if (event.isType() === 'enemy') {
                var enemyId = event.event().meta.id ? Number(event.event().meta.id) : 1;
                var enemy_unit = new Game_Enemy(enemyId, 0, 0);				
				enemy_unit._mechClass = parseInt(event.event().meta.mechClass)
				
                if (enemy_unit) {
					enemy_unit.event = event;
                    if (event.event().meta.mode) {
                        enemy_unit.setBattleMode(event.event().meta.mode);
                        if (event.event().meta.targetId) {
                            enemy_unit.setTargetId(event.event().meta.targetId);
                        }
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
					$statCalc.initSRWStats(enemy_unit);
                }
            }
        });
    };

    //２イベント間の距離を返す
    Game_System.prototype.unitDistance = function(event1, event2) {
        var minDisX = Math.abs(event1.posX() - event2.posX());
        var minDisY = Math.abs(event1.posY() - event2.posY());
        if ($gameMap.isLoopHorizontal() == true) {
            var event1X = event1.posX() > event2.posX() ? event1.posX() - $gameMap.width() : event1.posX() + $gameMap.width();
            var disX = Math.abs(event1X - event2.posX());
            minDisX = minDisX < disX ? minDisX : disX;
        }
        if ($gameMap.isLoopVertical() == true) {
            var event1Y = event1.posY() > event2.posY() ? event1.posY() - $gameMap.height() : event1.posY() + $gameMap.height();
            var disY = Math.abs(event1Y - event2.posY());
            minDisY = minDisY < disY ? minDisY : disY;
        }
        return minDisX + minDisY;
    };

//戦闘終了に関係する処理
    //戦闘終了するためのプラグイン・コマンド
    Game_System.prototype.endSRPG = function() {
        $gameTemp.clearActiveEvent();
        $gameMap.events().forEach(function(event) {
            var battlerArray = $gameSystem.EventToUnit(event.eventId());
            if (battlerArray && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
                if (_srpgBattleEndAllHeal == 'true') {
                    battlerArray[1].recoverAll();
                }
                battlerArray[1].onTurnEnd();
            }
        });
        this._SRPGMode = false;
        $gameSwitches.setValue(_srpgBattleSwitchID, false);
        this._isBattlePhase = 'initialize';
        this._isSubBattlePhase = 'initialize';
        $gamePlayer.refresh();
        this.clearData(); //データの初期化
        $gameMap.setEventImages();   // ユニットデータに合わせてイベントのグラフィックを変更する
    };

//戦闘の進行に関係する処理
    // 戦闘開始時のイベントを起動する
    Game_System.prototype.runBattleStartEvent = function() {
        $gameMap.events().forEach(function(event) {
            if (event.isType() === 'battleStart') {
                if (event.pageIndex() >= 0) event.start();
                $gameTemp.pushSrpgEventList(event);
            }
        });
    };
	
	Game_System.prototype.runAfterDeployEvent = function() {
        $gameMap.events().forEach(function(event) {
            if (event.isType() === 'afterDeploy') {
                if (event.pageIndex() >= 0) event.start();
                $gameTemp.pushSrpgEventList(event);
            }
        });
    };

    //次のカーソル移動先のアクターを取得する(R)
    Game_System.prototype.getNextRActor = function() {
        var candidates =  $statCalc.getAllCandidates("actor");
		this.actorLRId++;
		if(this.actorLRId >= candidates.length){
			this.actorLRId = 0;
		}
       	var candidate = candidates[this.actorLRId];
		if(candidate){
			$gamePlayer.locate(candidate.pos.x, candidate.pos.y);
		}  
    }

    //次のカーソル移動先のアクターを取得する(L)
    Game_System.prototype.getNextLActor = function() {       
		var candidates =  $statCalc.getAllCandidates("actor");
		this.actorLRId--;
		if(this.actorLRId < 0){
			this.actorLRId = candidates.length-1;
		}
       	var candidate = candidates[this.actorLRId];
		if(candidate){
			$gamePlayer.locate(candidate.pos.x, candidate.pos.y);
		}        
    }

    //アクターターンの開始
    Game_System.prototype.srpgStartActorTurn = function() {
		var _this = this;
		$statCalc.invalidateAbilityCache();
		
		$gameTemp.currentFaction = -1;
		$songManager.playStageSong();
        this.aliveActorIdList = [];
        this.actorLRId = 0;
		var spiritActivations = [];
		var AIActors = [];
        $gameMap.events().forEach(function(event) {
            if (event.isType() === 'actorTurn') {
                if (event.pageIndex() >= 0) event.start();
                $gameTemp.pushSrpgEventList(event);
            }
            var battlerArray = $gameSystem.EventToUnit(event.eventId());
            if (battlerArray && battlerArray[0] === 'actor' && battlerArray[1].isAlive() && !event.isErased()) {
                $gameSystem.aliveActorIdList.push(event.eventId());
                battlerArray[1].SRPGActionTimesSet($statCalc.applyStatModsToValue(battlerArray[1], 1, ["extra_action"]));
				var SPRegen = 0;
				SPRegen = $statCalc.applyStatModsToValue(battlerArray[1], SPRegen, ["SP_regen"]);
				if(ENGINE_SETTINGS.VXT_SP){
					SPRegen+=5;
				}
				if(ENGINE_SETTINGS.DEFAULT_SP_REGEN){
					SPRegen+=ENGINE_SETTINGS.DEFAULT_SP_REGEN;
				}
				if($gameVariables.value(_turnVarID) != 1){
					$statCalc.recoverSP(battlerArray[1], SPRegen);
				}
				
				var autoSpirits = $statCalc.getModDefinitions(battlerArray[1], ["auto_spirit"]);
				
				autoSpirits.forEach(function(autoSpirit){		
					$statCalc.setAbilityUsed(battlerArray[1], "auto_spirit_"+autoSpirit.stackId);
					spiritActivations.push({actor: battlerArray[1], spirit: autoSpirit.value});				
				});				
				
				if($statCalc.isAI(battlerArray[1])){
					AIActors.push(event);
				}
            }
            if (battlerArray && battlerArray[0] === 'enemy' && battlerArray[1].isAlive()) {
                battlerArray[1].SRPGActionTimesSet(1);
            }
			
        });
		$statCalc.clearSpiritOnAll("actor", "strike");
		$statCalc.clearSpiritOnAll("actor", "wall");
		$statCalc.clearSpiritOnAll("actor", "focus");
		$statCalc.clearSpiritOnAll("enemy", "disrupt");
		$statCalc.clearSpiritOnAll("enemy", "analyse");
		$statCalc.clearTempEffectOnAll("actor", "victory_turn");
		$statCalc.resetAllBattleTemp();
		$statCalc.resetAllStatus("enemy");
		if($gameVariables.value(_turnVarID) != 1){
			$statCalc.applyTurnStartWill("actor");
		}
		$statCalc.applyENRegen("actor");
		$statCalc.applyAmmoRegen("actor");
		$statCalc.applyHPRegen("actor");
        this.aliveActorIdList.sort(function(a, b) {
            return a - b;
        });
        var actor1 = $gameMap.event(this.aliveActorIdList[0]);
        if (actor1) {
			$gamePlayer.locate(actor1.posX(), actor1.posY());
        }
		$gameTemp.autoSpirits = spiritActivations;
		$gameTemp.autoSpiritsDelay = 150;
		
		_this.setBattlePhase('actor_phase');
		
		$gameTemp.AIActors = AIActors;
		if(spiritActivations.length){					
			_this.setSubBattlePhase('auto_spirits');
		} else if($gameTemp.AIActors.length){
			_this.setBattlePhase('AI_phase');
			_this.setSubBattlePhase('enemy_command');
		} else {			
			_this.setSubBattlePhase('initialize');
		}	
    };

    //自動行動アクターターンの開始
    Game_System.prototype.srpgStartAutoActorTurn = function() {
        this.setBattlePhase('auto_actor_phase');
        this.setSubBattlePhase('auto_actor_command');
    };

    //エネミーターンの開始
    Game_System.prototype.srpgStartEnemyTurn = function(factionId) {
		var _this = this;
		$statCalc.invalidateAbilityCache();
		
		
		$gameTemp.showAllyAttackIndicator = false;
		$gameTemp.showAllyDefendIndicator = false;
		$gameTemp.showEnemyAttackIndicator = false;
		$gameTemp.showEnemyDefendIndicator = false;
		$gameTemp.currentFaction = factionId;
		if(factionId > 2){
			$gameSystem.srpgTurnEnd();
			return;
		}
		
		if(!$gameSystem.factionConfig[factionId].active){
			$gameTemp.currentFaction++;
			this.srpgStartEnemyTurn($gameTemp.currentFaction);
			return;
		}		
		$songManager.playStageSong();
		var spiritActivations = [];
		$gameTemp.AIActors = [];
        $gameMap.events().forEach(function(event) {
            if (event.isType() === 'enemyTurn') {
                if (event.pageIndex() >= 0) event.start();
                $gameTemp.pushSrpgEventList(event);
            }
			var battlerArray = $gameSystem.EventToUnit(event.eventId());
			if (battlerArray && battlerArray[0] === 'enemy' && battlerArray[1].isAlive()) {
                battlerArray[1].SRPGActionTimesSet($statCalc.applyStatModsToValue(battlerArray[1], 1, ["extra_action"]));
				var SPRegen = 0;
				SPRegen = $statCalc.applyStatModsToValue(battlerArray[1], SPRegen, ["SP_regen"]);
				$statCalc.recoverSP(battlerArray[1], SPRegen);
				
				$gameTemp.AIActors.push(event);
				
				var autoSpirits = $statCalc.getModDefinitions(battlerArray[1], ["auto_spirit"]);
				
				autoSpirits.forEach(function(autoSpirit){	
					$statCalc.setAbilityUsed(actor, "auto_spirit_"+autoSpirit.stackId);
					spiritActivations.push({actor: battlerArray[1], spirit: autoSpirit.value});				
				});	
            }
        });
		
		$statCalc.clearSpiritOnAll("enemy", "strike", factionId);
		$statCalc.clearSpiritOnAll("enemy", "wall", factionId);
		$statCalc.clearSpiritOnAll("enemy", "focus", factionId);
		$statCalc.clearSpiritOnAll("actor", "disrupt");
		$statCalc.clearSpiritOnAll("actor", "analyse");
		$statCalc.applyTurnStartWill("enemy", factionId);
		$statCalc.applyENRegen("enemy", factionId);
		$statCalc.applyAmmoRegen("enemy", factionId);
		$statCalc.applyHPRegen("enemy", factionId);
		$statCalc.resetAllBattleTemp(null, factionId);
		$statCalc.resetAllStatus("actor");
		$gameTemp.AIWaitTimer = 0;
		
		$gameTemp.autoSpirits = spiritActivations;
		$gameTemp.autoSpiritsDelay = 150;
		
		if(spiritActivations.length){					
			_this.setSubBattlePhase('auto_spirits');
		} //else if($gameTemp.AIActors.length){
			_this.setBattlePhase('AI_phase');
			_this.setSubBattlePhase('enemy_command');
		//}
		
        //this.setSubBattlePhase('enemy_command');
    };

    //ターン終了
    Game_System.prototype.srpgTurnEnd = function() {
        $gameMap.events().forEach(function(event) {
            var battlerArray = $gameSystem.EventToUnit(event.eventId());
            if (battlerArray && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
                battlerArray[1].onTurnEnd();
            }
        });
        $gameMap.events().forEach(function(event) {
            if (event.isType() === 'turnEnd') {
                if (event.pageIndex() >= 0) event.start();
                $gameTemp.pushSrpgEventList(event);
            }
        });
        this.srpgTurnPlus();
        this.srpgStartActorTurn();//アクターターンを開始する
    };

    //ターン数を増やす
    Game_System.prototype.srpgTurnPlus = function() {
        var oldValue = $gameVariables.value(_turnVarID);
        $gameVariables.setValue(_turnVarID, oldValue + 1);
		
		var oldValue = $gameVariables.value(_turnCountVariable);
        $gameVariables.setValue(_turnCountVariable, oldValue + 1);
    };

//戦闘の計算に関係する処理
    // 移動範囲および攻撃範囲を計算・表示する
    Game_System.prototype.srpgMakeMoveTable = function(event) {
        var battlerArray = $gameSystem.EventToUnit(event.eventId());
		
		var moveRange = $statCalc.getCurrentMoveRange(battlerArray[1]);
        $gameTemp.clearMoveTable();
        $gameTemp.initialMoveTable(event.posX(), event.posY(), battlerArray[1].srpgThroughTag());
        event.makeMoveTable(event.posX(), event.posY(), moveRange, [0], battlerArray[1]);
        var list = $gameTemp.moveList();
		
        $gameTemp.pushRangeListToMoveList();
    };

    //移動先にアクターまたはエネミーがいる場合は移動できない（重なりを避ける）
    Game_System.prototype.areTheyNoUnits = function(x, y, type) {
        var flag = true;
        $gameMap.eventsXy(x, y).forEach(function(event) {
            var battlerArray = $gameSystem.EventToUnit(event._eventId);
            if (battlerArray && event != $gameTemp.activeEvent() && !event.isErased() &&
                battlerArray[0] === type || event.isType() === 'playerEvent') {
                flag = false;
            }
        });
        return flag;
    };

    //移動先にイベントユニットがあるかどうか
    Game_System.prototype.isThereEventUnit = function(x, y) {
        var flag = false;
        $gameMap.eventsXy(x, y).forEach(function(event) {
            if (event.isType() === 'unitEvent') {
                flag = true;
            }
        });
        return flag;
    };
	
	Game_System.prototype.getDeployInfo = function() {
		var info = $gameVariables.value(_nextMapDeployVariable);
		if(!info){
			info = {
				count: 0,
				assigned: {},
				assignedShips: {},
				lockedSlots: {},
				favorites: {}
			};
		} else {
			info = JSON.parse(info);
		}
		return info;
    };
	
	Game_System.prototype.setDeployInfo = function(info) {
		$gameVariables.setValue(_nextMapDeployVariable, JSON.stringify(info));
    };
	
	Game_System.prototype.clearActorDeployInfo = function(actorId) {
		var deployInfo = this.getDeployInfo();
		Object.keys(deployInfo.assigned).forEach(function(slot){
			if(deployInfo.assigned[slot] == actorId){
				delete deployInfo.assigned[slot];
			}
		});
		this.setDeployInfo(deployInfo);
    };
	
	Game_System.prototype.getPersuadeOption = function(actor) {
		if(this.persuadeOptions && actor.isActor()){
			var lookup = this.persuadeOptions[actor.actorId()];
			if(lookup){
				var event = actor.event;
				var position = {x: event.posX(), y: event.posY()};
				var adjacentEvents = $statCalc.getAdjacentEvents(null, position);
				
				var option;
				var ctr = 0;
				while(!option && ctr < adjacentEvents.length){
					var eventId = adjacentEvents[ctr].eventId();
					if(lookup[eventId] != null){
						option = {eventId: eventId, controlVar: lookup[eventId]};
					}
					ctr++;
				}
				return option;
			}			
		} 
		return null;		
    };
	
	Game_System.prototype.getUnitSceneBgId = function(actor) {
		if($gameTemp.editMode){
			return $SRWEditor.getBattleEnvironmentId();
		} else {
			var region = $gameMap.regionId(actor.event.posX(), actor.event.posY());
			if($statCalc.isFlying(actor)){
				if($gameSystem.regionSkyBattleEnv[region] != null){
					return $gameSystem.regionSkyBattleEnv[region];
				}
				
				if($gameSystem.skyBattleEnv){
					return $gameSystem.skyBattleEnv;
				} 
			} 
			if($gameSystem.regionBattleEnv[region] != null){
				return $gameSystem.regionBattleEnv[region];
			}
			return $gameSystem.defaultBattleEnv;						
		}
    };
	
	Game_System.prototype.validateAbilityLockInfo = function(actorId, abilityId) {
		if(!this.abilityLockInfo){
			this.abilityLockInfo = {
				actor: {},
				mech: {}
			}
		}
	}
	
	Game_System.prototype.setAbilityStatus = function(abilityInfo, id, abilityId, status) {
		//status: hidden, locked, ""
		if(!abilityInfo[id]){
			abilityInfo[id] = {};
		}
		abilityInfo[id][abilityId] = status;
	}
	
	Game_System.prototype.getAbilityStatus = function(abilityInfo, id, abilityId) {
		//status: hidden, locked, ""		
		var result = "";
		if(abilityInfo[id] && abilityInfo[id][abilityId]){
			result = abilityInfo[id][abilityId];
		}		
		return result;
	}
	
	Game_System.prototype.setPilotAbilityStatus = function(actorId, abilityId, status) {		
		this.validateAbilityLockInfo();
		this.setAbilityStatus(this.abilityLockInfo.actor, actorId, abilityId, status);
	}
	
	Game_System.prototype.getPilotAbilityStatus = function(actorId, abilityId) {	
		this.validateAbilityLockInfo();
		return this.getAbilityStatus(this.abilityLockInfo.actor, actorId, abilityId);
	}
	
	Game_System.prototype.isHiddenActorAbility = function(actor, abilityId) {
		var result = false;
		if(actor.isActor()){
			var status = this.getPilotAbilityStatus(actor.actorId(), abilityId);
			result = status == "hidden" || status == "locked";
		}		
		return result;
	}
	
	Game_System.prototype.isLockedActorAbility = function(actor, abilityId) {
		var result = false;
		if(actor.isActor()){
			var status = this.getPilotAbilityStatus(actor.actorId(), abilityId);
			result = status == "locked";
		}		
		return result;
	}
	
	Game_System.prototype.setMechAbilityStatus = function(mechId, abilityId, status) {		
		this.validateAbilityLockInfo();
		this.setAbilityStatus(this.abilityLockInfo.mech, mechId, abilityId, status);
	}
	
	Game_System.prototype.getMechAbilityStatus = function(mechId, abilityId) {	
		this.validateAbilityLockInfo();
		return this.getAbilityStatus(this.abilityLockInfo.mech, mechId, abilityId);
	}
	
	Game_System.prototype.isHiddenMechAbility = function(actor, abilityId) {
		var result = false;
		if(actor.SRWStats && actor.SRWStats.mech){
			var status = this.getMechAbilityStatus(actor.SRWStats.mech.id, abilityId);
			result = status == "hidden" || status == "locked";
		}		
		return result;
	}
	
	Game_System.prototype.isLockedMechAbility = function(actor, abilityId) {
		var result = false;
		if(actor.SRWStats && actor.SRWStats.mech){
			var status = this.getMechAbilityStatus(actor.SRWStats.mech.id, abilityId);
			result = status == "locked";
		}		
		return result;
	}
	
	Game_System.prototype.validateTransformationLockInfo = function() {
		if(!this.transformationLockInfo){
			this.transformationLockInfo = {}
		}
	}
	
	Game_System.prototype.isTransformationLocked = function(mechId) {
		this.validateTransformationLockInfo();
		return this.transformationLockInfo[mechId];
	}
	
	Game_System.prototype.lockTransformation = function(mechId) {
		this.validateTransformationLockInfo();
		this.transformationLockInfo[mechId] = true;
	}
	
	Game_System.prototype.lockAllTransformations = function() {
		this.validateTransformationLockInfo();
		for(var i = 1; i < $dataActors.length; i++){
			this.transformationLockInfo[i] = true;
		}	
	}
	
	Game_System.prototype.unlockTransformation = function(mechId) {
		this.validateTransformationLockInfo();
		delete this.transformationLockInfo[mechId];
	}
	
	Game_System.prototype.unlockAllTransformations = function() {
		this.validateTransformationLockInfo();
		for(var i = 1; i < $dataActors.length; i++){
			delete this.transformationLockInfo[i];
		}	
	}
//==================================================================
// ●Game_Action
//====================================================================
    // 予想ダメージの計算
    Game_Action.prototype.srpgPredictionDamage = function(target) {
        var item = this.item();
        if (this.item().damage.type > 0) {
            var baseValue = this.evalDamageFormula(target);
        } else {
            var baseValue = 0;
        }
        var value = baseValue * this.calcElementRate(target);
        if (this.isPhysical()) {
            value *= target.pdr;
        }
        if (this.isMagical()) {
            value *= target.mdr;
        }
        if (baseValue < 0) {
            value *= target.rec;
        }
        item.effects.forEach(function(effect) {
            value -= this.srpgPredictionItemEffect(target, effect);
        }, this);
        return Math.round(value);
    };

    // エネミーアクションのインデックスを設定する
    Game_Action.prototype.srpgPredictionItemEffect = function(target, effect) {
        switch (effect.code) {
        case Game_Action.EFFECT_RECOVER_HP:
            var value = (target.mhp * effect.value1 + effect.value2) * target.rec;
            if (this.isItem()) {
                value *= this.subject().pha;
            }
            return Math.floor(value);
        case Game_Action.EFFECT_RECOVER_MP:
            var value = (target.mmp * effect.value1 + effect.value2) * target.rec;
            if (this.isItem()) {
                value *= this.subject().pha;
            }
            return Math.floor(value);
        case Game_Action.EFFECT_GAIN_TP:
            var value = Math.floor(effect.value1);
            return Math.floor(value);
        }
        return 0;
    };

    // エネミーアクションのインデックスを設定する
    Game_Action.prototype.setSrpgEnemySubject = function(index) {
        this._subjectEnemyIndex = index;
        this._subjectActorId = 0;
    };

    // 混乱状態でのターゲットを設定する
    var _SRPG_Game_Action_confusionTarget = Game_Action.prototype.confusionTarget;
    Game_Action.prototype.confusionTarget = function() {
        if ($gameSystem.isSRPGMode() == true) {
            if (this._targetIndex == 0) {
                 return this.opponentsUnit().smoothTarget(this._targetIndex);
            } else {
                 return this.friendsUnit().smoothTarget(this._targetIndex);
            }
        } else {
            _SRPG_Game_Action_confusionTarget.call(this);
        }
    };
	
	Game_Action.prototype.makeDamageValue = function(target, critical) {		
		return $gameTemp.battleEffectCache[this._cacheReference].damageInflicted;			  
    };
	
	Game_Action.prototype.itemHit = function(target) {  
		return $gameTemp.battleEffectCache[this._cacheReference].hits;		
    };
	
	Game_Action.prototype.itemCri = function(target) {  
		return $gameTemp.battleEffectCache[this._cacheReference].inflictedCritical;		
    };
	//fixes a bug where a battle scene would sometimes be set up with invalid items, root cause still under investigation
	Game_Action.prototype.isValid = function() {
		return true;
	}

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
	
	Game_Actor.prototype.initImages = function(overworldSpriteData) {
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

    // SRPG戦闘中にはallMembersで呼び出す配列を変える→メニューで戦闘参加アクターを呼び出す
   /* var _SRPG_Game_Party_allMembers = Game_Party.prototype.allMembers;
    Game_Party.prototype.allMembers = function() {
        if ($gameSystem.isSRPGMode() == true && $gameSystem.isSubBattlePhase() !== 'initialize') {
            var _list = [];
            for (var i = 0; i < $gameSystem.srpgAllActors().length; i++) {
                var actor = $gameSystem.EventToUnit($gameSystem.srpgAllActors()[i])[1];
                _list.push(actor);
            }
            return _list;
        } else {
            return _SRPG_Game_Party_allMembers.call(this);
        }
    };*/

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
		function isPassableTile(x, y, actor){
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
			var taggedCost = $gameMap.terrainTag(x, y);
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
            if (isPassableTile(x, y-1, actor)) {
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
            if (isPassableTile(x+1, y, actor)) {
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
            if (isPassableTile(x-1, y, actor)) {
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
            if (isPassableTile(x, y+1, actor)) {
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
				if($gameTemp.mapRetargetLock){
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
                if ($gameSystem.isSubBattlePhase() === 'normal') {
                    $gameMap.eventsXy(x, y).forEach(function(event) {
                        if (event.isTriggerIn(triggers) && !event.isErased()) {
							var battlerArray = $gameSystem.EventToUnit(event.eventId());
                            if ((event.isType() === 'actor' || event.isType() === 'ship' || event.isType() === 'ship_event') && !$statCalc.isAI(battlerArray[1])) {
                                SoundManager.playOk();
                                $gameTemp.setActiveEvent(event);								
                                /*$gameSystem.srpgMakeMoveTable(event);
                                var battlerArray = $gameSystem.EventToUnit(event.eventId());
                                if (battlerArray[1].canInput() == true) {
                                    $gameParty.pushSrpgBattleActors(battlerArray[1]);
                                    $gameTemp.reserveOriginalPos($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
                                    $gameSystem.setSrpgActorCommandStatusWindowNeedRefresh(battlerArray);
                                    $gameSystem.setSubBattlePhase('actor_move');
                                } else {
                                    $gameSystem.setSrpgStatusWindowNeedRefresh(battlerArray);
                                    $gameSystem.setSubBattlePhase('status_window');
                                }*/
								if (battlerArray[1].canInput() == true) {
									$gameSystem.highlightedTiles = [];
									$gameSystem.highlightsRefreshed = true;
									$gameTemp.commanderAuraVisible = false;
									
									$gameTemp.reserveOriginalPos($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
									$gameSystem.setSrpgActorCommandWindowNeedRefresh(battlerArray);
									$gameParty.pushSrpgBattleActors(battlerArray[1]);
									$gameSystem.setSubBattlePhase('actor_command_window');
								} else {
									$gameTemp.detailPagesWindowCancelCallback = function(){
										$gameTemp.detailPagesWindowCancelCallback = null;
										$gameSystem.setSubBattlePhase('normal');
									}
									
									var battlerArray = $gameSystem.EventToUnit(event.eventId());
									$gameTemp.currentMenuUnit = {
										actor: battlerArray[1],
										mech: battlerArray[1].SRWStats.mech
									};
									
									$gameSystem.setSubBattlePhase('enemy_unit_summary');
									$gameTemp.pushMenu = "detail_pages";
									
                                }
                                return;
                            } else if (event.isType() === 'enemy' || (battlerArray && $statCalc.isAI(battlerArray[1]))) {
                               /* SoundManager.playOk();
                                $gameTemp.setActiveEvent(event);
                                $gameSystem.srpgMakeMoveTable(event);
                                var battlerArray = $gameSystem.EventToUnit(event.eventId());
                                $gameSystem.setSrpgStatusWindowNeedRefresh(battlerArray);
                                $gameSystem.setSubBattlePhase('status_window');
                                return;*/
								/*
								$gameTemp.detailPagesWindowCancelCallback = function(){
									$gameTemp.detailPagesWindowCancelCallback = null;
									$gameSystem.setSubBattlePhase('normal');
								}
								
								var battlerArray = $gameSystem.EventToUnit(event.eventId());
								$gameTemp.currentMenuUnit = {
									actor: battlerArray[1],
									mech: battlerArray[1].SRWStats.mech
								};
								$gameSystem.setSubBattlePhase('enemy_unit_summary');
								$gameTemp.pushMenu = "detail_pages";*/
								
								$gameSystem.srpgMakeMoveTable(event);
								$gameSystem.setSubBattlePhase('enemy_range_display');
								
								return;
								
                            } else if (event.isType() === 'playerEvent') {
                                if (event.pageIndex() >= 0) event.start();
                                return;
                            }
                        }
                    });
                } else if ($gameSystem.isSubBattlePhase() === 'actor_target') {
                    $gameMap.eventsXy(x, y).forEach(function(event) {
                        if (event.isTriggerIn(triggers) && !event.isErased()) {
                            if (event.isType() == 'actor' || event.isType() == 'enemy') {
                                var actionBattlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
                                var targetBattlerArray = $gameSystem.EventToUnit(event.eventId());
                               
								var isInRange = $battleCalc.isTargetInRange({x: $gameTemp.activeEvent()._x, y: $gameTemp.activeEvent()._y}, {x: event.posX(), y: event.posY()}, $statCalc.getRealWeaponRange(actionBattlerArray[1], $gameTemp.actorAction.attack), $gameTemp.actorAction.attack.minRange);
								var validTarget = $statCalc.canUseWeapon(actionBattlerArray[1], $gameTemp.actorAction.attack, false, targetBattlerArray[1]);
								
								if(isInRange && validTarget){
									if(($gameSystem.isEnemy(targetBattlerArray[1]) && $gameTemp.actorAction.type === "attack") || 
									   (targetBattlerArray[0] === 'actor' && $gameTemp.actorAction.type === "support")){
										//$gameSystem.setSrpgBattleWindowNeedRefresh(actionBattlerArray, targetBattlerArray);
										//$gameSystem.setSrpgStatusWindowNeedRefresh(actionBattlerArray);
										$gameTemp.currentBattleActor = actionBattlerArray[1];
										//enemy counter action determination
										$gameTemp.currentBattleEnemy = targetBattlerArray[1];
										//var availableWeapons = $statCalc.getActorMechWeapons();
										var enemyInfo = {actor: $gameTemp.currentBattleEnemy, pos: {x: event.posX(), y: event.posY()}};
										var actorInfo = {actor: $gameTemp.currentBattleActor, pos: {x: $gameTemp.activeEvent()._x, y: $gameTemp.activeEvent()._y}};
										$gameTemp.enemyAction = null;
										if(enemyInfo.actor.counterBehavior == "defend"){
											$gameTemp.enemyAction = {
												type: "defend",
												attack: 0,
												target: 0
											};
										} else if(enemyInfo.actor.counterBehavior == "evade"){
											$gameTemp.enemyAction = {
												type: "evade",
												attack: 0,
												target: 0
											};
										} else if(enemyInfo.actor.counterBehavior == "defend_low"){
											var stats = $statCalc.getCalculatedMechStats(enemyInfo.actor);
											if(stats.currentHP / stats.maxHP <= 0.25){
												$gameTemp.enemyAction = {
													type: "defend",
													attack: 0,
													target: 0
												};	
											} 										
										} else if(enemyInfo.actor.counterBehavior == "evade_low"){
											var stats = $statCalc.getCalculatedMechStats(enemyInfo.actor);
											if(stats.currentHP / stats.maxHP <= 0.25){
												$gameTemp.enemyAction = {
													type: "evade",
													attack: 0,
													target: 0
												};
											}
										} else if(enemyInfo.actor.counterBehavior == "survive"){
											var weaponResult = $battleCalc.getBestWeaponAndDamage(actorInfo, enemyInfo);											
											var stats = $statCalc.getCalculatedMechStats(enemyInfo.actor);
											if(weaponResult.damage >= stats.currentHP){
												if(weaponResult.damage <= stats.currentHP * 2){
													$gameTemp.enemyAction = {
														type: "defend",
														attack: 0,
														target: 0
													};
												} else {
													$gameTemp.enemyAction = {
														type: "evade",
														attack: 0,
														target: 0
													};
												}												
											}
										}
										
										if(enemyInfo.actor.counterBehavior == "attack" || $gameTemp.enemyAction == null){
											var weapon = $battleCalc.getBestWeapon(enemyInfo, actorInfo);
											if($gameTemp.currentBattleEnemy.battleMode() !== 'disabled' && weapon){
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
										}
											
										var position = {
											x: $gameTemp.activeEvent().posX(),
											y: $gameTemp.activeEvent().posY(),
										};
										var supporters = $statCalc.getSupportAttackCandidates("player", position, $statCalc.getCurrentTerrain($gameTemp.currentBattleActor));
										
										var aSkill = $statCalc.getPilotStat($gameTemp.currentBattleActor, "skill");
										var dSkill = $statCalc.getPilotStat($gameTemp.currentBattleEnemy, "skill");
										
										if((aSkill - dSkill >= 20) && $statCalc.applyStatModsToValue($gameTemp.currentBattleActor, 0, ["attack_again"])){
											supporters.push({actor: $gameTemp.currentBattleActor, pos: {x: $gameTemp.currentBattleActor.event.posX(), y: $gameTemp.currentBattleActor.event.posY()}});
										}
										
										if($statCalc.applyStatModsToValue($gameTemp.currentBattleActor, 0, ["disable_support"]) || 
											$statCalc.applyStatModsToValue($gameTemp.currentBattleEnemy, 0, ["disable_target_support"])){
											supporters = [];
										}
										
										var supporterInfo = [];
										var supporterSelected = -1;
										var bestDamage = 0;
										for(var i = 0; i < supporters.length; i++){
											var weaponResult = $battleCalc.getBestWeaponAndDamage(supporters[i], enemyInfo);
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
										
										var supporters = $statCalc.getSupportDefendCandidates(
											$gameSystem.getFactionId($gameTemp.currentBattleEnemy), 
											{x: event.posX(), y: event.posY()},
											$statCalc.getCurrentTerrain($gameTemp.currentBattleEnemy)
										);
										
										if($statCalc.applyStatModsToValue($gameTemp.currentBattleEnemy, 0, ["disable_support"]) || 
											$statCalc.applyStatModsToValue($gameTemp.currentBattleActor, 0, ["disable_target_support"])){
											supporters = [];
										}
										
										var supporterSelected = -1;
										var minDamage = -1;
										for(var i = 0; i < supporters.length; i++){
											supporters[i].action = {type: "defend", attack: null};											
											
											var damageResult = $battleCalc.performDamageCalculation(
												{actor: actorInfo.actor, action: $gameTemp.actorAction},
												supporters[i],
												true,
												false,
												true	
											);
											
											if(minDamage == -1 || damageResult.damage < minDamage){
												minDamage = damageResult.damage;
												supporterSelected = i;
											}
										}
										$gameTemp.supportDefendCandidates = supporters;
										$gameTemp.supportDefendSelected = supporterSelected;
										
										$gameTemp.setTargetEvent(event);
										$statCalc.invalidateAbilityCache();
										$gameSystem.setSubBattlePhase('battle_window');
										$gameTemp.pushMenu = "before_battle";
									}	
								}								
                            }
                        }
                    });
                } else if ($gameSystem.isSubBattlePhase() === 'actor_target_spirit') {
					var spiritDef = $spiritManager.getSpiritDef($gameTemp.currentTargetingSpirit.idx);
                    $gameMap.eventsXy(x, y).forEach(function(event) {
                        if (event.isTriggerIn(triggers) && !event.isErased()) {
                            if (event.isType() == 'actor' && spiritDef.targetType == "ally" || event.isType() == 'enemy'  && spiritDef.targetType == "enemy") {
                                var actionBattlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
                                var targetBattlerArray = $gameSystem.EventToUnit(event.eventId());
								var spiritInfo = $gameTemp.currentTargetingSpirit;
								var target = targetBattlerArray[1];
							
								var caster;
								if(spiritInfo.caster){
									caster = spiritInfo.caster;
								} else {
									caster = actionBattlerArray[1];
								}
								
								if(spiritDef.singleTargetEnabledHandler(target)){
									$spiritManager.applyEffect($gameTemp.currentTargetingSpirit.idx, caster, [target], $gameTemp.currentTargetingSpirit.cost);
									$gamePlayer.locate(event.posX(), event.posY());
									
									$gameTemp.spiritTargetActor = target;
									$gameTemp.queuedActorEffects = [{type: "spirit", parameters: {target: target, idx: $gameTemp.currentTargetingSpirit.idx}}];
									$gameSystem.setSubBattlePhase('spirit_activation');
									
									$gameTemp.spiritWindowDoneHandler = function(){
										$gamePlayer.locate($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
										$gameTemp.popMenu = true;
										$gameSystem.setSrpgActorCommandWindowNeedRefresh($gameSystem.EventToUnit($gameTemp.activeEvent().eventId()));
										$gameSystem.setSubBattlePhase("actor_command_window");
									}	
									$gameTemp.pushMenu = "spirit_activation";
									
									//$gameSystem.setSrpgActorCommandWindowNeedRefresh(actionBattlerArray);
									//$gameSystem.setSubBattlePhase("actor_command_window");
									//_this._mapSrpgActorCommandWindow.activate();
									
								}																					
                            }
                        }
                    });
                } else if ($gameSystem.isSubBattlePhase() === 'actor_support') {
					
					
					$gameMap.eventsXy(x, y).forEach(function(event) {
						if (event.isTriggerIn(triggers) && !event.isErased()) {
							if (event.isType() == 'actor') {
								var actionBattlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
								var candidate = $gameSystem.EventToUnit(event.eventId())[1];
								var battler = actionBattlerArray[1];
								var position = {
									x: $gameTemp.activeEvent().posX(),
									y: $gameTemp.activeEvent().posY(),
								};
								var isInrange = false;
								if($statCalc.applyStatModsToValue(battler, 0, ["all_range_resupply"])){
									isInrange = true;
								} else {
									isInrange = ((Math.abs(event.posX() - position.x) + Math.abs(event.posY() - position.y)) == 1);
								}
								var candidateCanReceiveSupport = ($gameTemp.supportType == "heal" && $statCalc.canRecoverHP(candidate) || $gameTemp.supportType == "resupply" && ($statCalc.canRecoverEN(candidate) || $statCalc.canRecoverAmmo(candidate)));
								if (isInrange && candidateCanReceiveSupport) {
									
									var stats = $statCalc.getCalculatedMechStats(candidate);
									
									var originalEN = stats.currentEN;
									if($gameTemp.supportType == "heal") {
										$statCalc.recoverHPPercent(candidate, 50);
									} else {
										$statCalc.recoverENPercent(candidate, 100);
										$statCalc.recoverAmmoPercent(candidate, 100);
										$statCalc.modifyWill(candidate, -10);
									}							
									$gameTemp.clearMoveTable();
									
									stats = $statCalc.getCalculatedMechStats(candidate);
									var newEN = stats.currentEN;
									var effect;
	
									var baseYield;
									if($gameTemp.supportType == "heal"){
										baseYield = 250;
										effect = {type: "repair", parameters: {animId: "trust", target: candidate, startAmount: stats.HPBeforeRecovery, endAmount: stats.currentHP, total: stats.maxHP}};									
									} else {
										baseYield = 375;
										effect = {type: "repair", parameters: {animId: "resupply", target: candidate, startAmount: originalEN, endAmount: newEN, total: stats.maxEN}};		
									}									
									$gameTemp.queuedActorEffects = [effect];	

									$gameTemp.spiritTargetActor	= candidate;						
										
									$gameTemp.spiritWindowDoneHandler = function(){
										var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
										
										var attackerLevel = actor.SRWStats.pilot.level;
										var defenderLevel = candidate.SRWStats.pilot.level;
										var defenderTotalYield = baseYield;
										
										var totalExp = eval(ENGINE_SETTINGS.EXP_YIELD.LEVEL_SCALING_FORMULA);
										if(totalExp < ENGINE_SETTINGS.EXP_YIELD.MIN){
											totalExp = ENGINE_SETTINGS.EXP_YIELD.MIN;
										}
										if(totalExp > ENGINE_SETTINGS.EXP_YIELD.MAX){
											totalExp = ENGINE_SETTINGS.EXP_YIELD.MAX;
										}
										totalExp = Math.floor(totalExp);
										var gainResults = [{actor: actor, expGain: totalExp, ppGain: 0}];			
			
										var expResults = [{actor: actor, details: $statCalc.addExp(actor, totalExp)}];
													
										
										$gameTemp.rewardsInfo = {
											//actor: battleEffect.ref,
											levelResult: expResults,
											//expGain: battleEffect.expGain,
											//ppGain: battleEffect.ppGain,
											itemDrops: [],
											fundGain: 0,
											gainResults: gainResults
										};
										
										$gameTemp.popMenu = true;
										$gameTemp.rewardsDisplayTimer = 20;	
										$gameSystem.setSubBattlePhase("rewards_display");				
										$gameTemp.pushMenu = "rewards";
										//$gameSystem.setSubBattlePhase('end_actor_turn');
									}							
									
									$gameSystem.setSubBattlePhase('spirit_activation');	
									$gameTemp.pushMenu = "spirit_activation";
										            
								}
							}
						}
					});			
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
            if ($gameSystem.srpgWaitMoving() == true ||
                $gameSystem.isSubBattlePhase() === 'status_window' ||
                $gameSystem.isSubBattlePhase() === 'actor_command_window' ||
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
            if ($gameSystem.srpgWaitMoving() == true ||
                $gameTemp.isAutoMoveDestinationValid() == true ||
                $gameSystem.isSubBattlePhase() === 'actor_command_window' ||
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
            } else if ($gameSystem.isSubBattlePhase() === 'status_window') {
                if (Input.isTriggered('ok') || TouchInput.isTriggered()) {
                    var battlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
                    var type = battlerArray[0];
                    var battler = battlerArray[1];
                    $gameSystem.clearSrpgStatusWindowNeedRefresh();
                    SoundManager.playCancel();
                    $gameTemp.clearActiveEvent();
                    $gameSystem.setSubBattlePhase('normal');
                    $gameTemp.clearMoveTable();
                    return true;
                }
                return false;
            } else if ($gameSystem.isSubBattlePhase() === 'actor_move') {
                if (Input.isTriggered('ok') || TouchInput.isTriggered()) {
                    var list = $gameTemp.moveList();
                    for (var i = 0; i < list.length; i++) {
                        var pos = list[i];
                        if (pos[2] == false && pos[0] == this._x && pos[1] == this._y) {
							var target = $statCalc.activeUnitAtPosition({x: this._x, y: this._y}, "actor");	
							var initiator = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
							
							if(!$statCalc.isEssential(initiator) && !$gameTemp.activeShip && $statCalc.isShip(target) && $gameTemp.activeEvent().eventId() != target.event.eventId()){
								SoundManager.playOk();
								var battlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
                                battlerArray[1].srpgMakeNewActions();
								$gameSystem.setSrpgActorCommandWindowNeedRefresh(battlerArray);
								$gameSystem.setSubBattlePhase('confirm_boarding');
								$gameTemp.targetShip = {position: {x: this._x, y: this._y}, actor: target};
							} else if ($statCalc.isFreeSpace({x: this._x, y: this._y})) {
                                SoundManager.playOk();

                               // var route = $gameTemp.MoveTable(pos[0], pos[1])[1];
                                var event = $gameTemp.activeEvent();
                                $gameSystem.setSrpgWaitMoving(true);
                                event.srpgMoveToPoint({x: this._x, y: this._y});
                                var battlerArray = $gameSystem.EventToUnit(event.eventId());
                                battlerArray[1].srpgMakeNewActions();
                                
								$gameTemp.isPostMove = true;
								if($gameTemp.isHitAndAway){
									$gameTemp.clearMoveTable();
									$gameSystem.setSubBattlePhase('end_actor_turn');
								} else {
									$gameSystem.setSrpgActorCommandWindowNeedRefresh(battlerArray);
									$gameSystem.setSubBattlePhase('post_move_command_window');
								}                                
                            } else {
                                SoundManager.playBuzzer();
                            }
                        }
                    }
                    return true;
                }
                return false;
            } else if($gameSystem.isSubBattlePhase() === 'select_deploy_position'){
				if (Input.isTriggered('ok') || TouchInput.isTriggered()) {   					
					if ($statCalc.isFreeSpace({x: this._x, y: this._y}) && $statCalc.canStandOnTile($gameTemp.actorToDeploy, {x: this._x, y: this._y})) {
						SoundManager.playOk();
						
						
						var isInrange = ((Math.abs($gameTemp.activeEvent().posX() - this.x) + Math.abs($gameTemp.activeEvent().posY() - this.y)) == 1);
						
						if(isInrange){
							$statCalc.removeBoardedUnit($gameTemp.actorToDeploy, $gameTemp.activeShip);				
							var event = $gameTemp.actorToDeploy.event;
							event.locate(this._x, this._y);
							event.appear();						
							$gameMap.setEventImages();	
							
							$gamePlayer.locate($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
							var battlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
							if($statCalc.hasBoardedUnits($gameTemp.activeShip)){
								$gameTemp.actorCommandPosition = 1;
							}						
							$gameSystem.setSrpgActorCommandWindowNeedRefresh(battlerArray);
							//$gameTemp.refreshActorMenu = true;
							$gameSystem.setSubBattlePhase('actor_command_window');
							$gameTemp.clearMoveTable();
							
							/*_this._mapSrpgActorCommandWindow.refresh();
							_this._mapSrpgActorCommandWindow.updatePlacement();
							_this._mapSrpgActorCommandWindow.activate();
							_this._mapSrpgActorCommandWindow.show(); */ 
						}						                          
					} else {
						SoundManager.playBuzzer();
					}                    
                    return true;
                }
                return false;
					
			} else {
                return _SRPG_Game_Player_triggerAction.call(this);
            }			
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
            var image = page.image;
            if (image.tileId > 0) {
                this.setTileImage(image.tileId);
            } else {
                this.setImage(image.characterName, image.characterIndex);
            }
            this.setDirection(image.direction);
            this.setPattern(image.pattern);
        }
    };
	
	Game_Event.prototype.srpgMoveToPoint = function(targetPosition, ignoreMoveTable) {
		this._pendingMoveToPoint = true;
		this._targetPosition = targetPosition;
		
		//construct grid representation for pathfinding
		var occupiedPositions = $statCalc.getOccupiedPositionsLookup($gameSystem.EventToUnit(this.eventId())[1].isActor() ? "enemy" : "actor");
		var pathfindingGrid = [];
		for(var i = 0; i < $gameMap.width(); i++){
			pathfindingGrid[i] = [];
			for(var j = 0; j < $gameMap.height(); j++){
				pathfindingGrid[i][j] = ((occupiedPositions[i] && occupiedPositions[i][j]) || (!ignoreMoveTable && $gameTemp._MoveTable[i][j][0] == -1)) ? 0 : 1;
			}
		}
		var graph = new Graph(pathfindingGrid);
		var startNode = graph.grid[this._x][this._y];
		var endNode = graph.grid[this._targetPosition.x][this._targetPosition.y];
		
		var path = astar.search(graph, startNode, endNode);
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
			$statCalc.setCurrentTerrainFromRegionIndex(battlerArray[1], $gameMap.regionId(this._x, this._y));
			$gameMap.initSRWTileProperties();
			$statCalc.setCurrentTerrainModsFromTilePropertyString(battlerArray[1], $gameMap.getTileProperties({x: this._x, y: this._y}));
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
				if(Input.isPressed("pagedown") || Input.isLongPressed("pagedown")){
					
					var targetPosition = this._pathToCurrentTarget[this._pathToCurrentTarget.length-1];
					this._pathToCurrentTarget = [];
					this.locate(targetPosition.x, targetPosition.y);
					if(followMove){
						$gamePlayer.locate(targetPosition.x, targetPosition.y);
					}
					$gamePlayer.clearFollowSpeed();
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

//====================================================================
// ●Game_Interpreter
//====================================================================
// イベントＩＤをもとに、ユニット間の距離をとる

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
Game_Interpreter.prototype.addEnemy = function(toAnimQueue, eventId, enemyId, mechClass, level, mode, targetId, items, squadId, targetRegion, factionId, counterBehavior) {
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

Game_Interpreter.prototype.eraseEvents = function(startId, endId, toQueue) {
	for(var i = startId; i <= endId; i++){
		this.eraseEvent(i);
	}
}

Game_Interpreter.prototype.eraseEvent = function(eventId, toQueue) {
	var event = $gameMap.event(eventId);
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
        waiting = $gameTemp.enemyAppearQueueIsProcessing;
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

Game_Interpreter.prototype.manualDeploy = function(){
	this.setWaitMode("manual_deploy");
	$gameTemp.doingManualDeploy = true;
	$gameTemp.disableHighlightGlow = true;
	$gameSystem.setSubBattlePhase("deploy_selection_window");
	$gameTemp.pushMenu = "in_stage_deploy";
	$gameTemp.originalDeployInfo = JSON.parse(JSON.stringify($gameSystem.getDeployInfo()));
	
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
		enemySupport: { // ommit this section if there is no enemy supporter
			id: 3, // the id of the enemy pilot
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
		eventId: function(){return 1;}
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
		eventId: function(){return 3;}
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
		eventId: function(){return 2;}
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
		eventId: function(){return 4;}
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
	
	var actor = actorInfo.actor;
	var enemy = enemyInfo.actor;
	
	var attacker;
	var defender;
	var attackerSide;
	var defenderSide;
	if(params.enemyFirst){
		attackerSide = "enemy";
		defenderSide = "actor";
		attacker = enemyInfo;
		defender = actorInfo;
	} else {
		attackerSide = "actor";
		defenderSide = "enemy";
		attacker = actorInfo;
		defender = enemyInfo;
	}
	
	$battleCalc.prepareBattleCache(attacker, "initiator");
	$battleCalc.prepareBattleCache(defender, "defender");
		
	
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
		var dCache = $gameTemp.battleEffectCache[this._defender.actor._cacheReference];
		aCache.side = this._side;
		var activeDefender = this._defender;
		if(this._supportDefender) {
			var sCache = $gameTemp.battleEffectCache[this._supportDefender.actor._supportCacheReference];
			if(!sCache.hasActed){
				activeDefender = this._supportDefender;
				dCache = sCache;
				dCache.defended = this._defender.actor;
			}
		}		
		
		if(!aCache.isDestroyed && !dCache.isDestroyed){		
			aCache.actionOrder = orderIdx;
			aCache.attacked = dCache;
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
				aCache.hits = isHit;
				aCache.inflictedCritical = this._attacker.params.isCrit;
				dCache.isHit = isHit;
				dCache.tookCritical = this._attacker.params.isCrit;
				
				var mechStats = $statCalc.getCalculatedMechStats(activeDefender.actor);
				var damagePercent = activeDefender.params.startHP - this._attacker.params.targetEndHP;
				var damage = Math.floor(mechStats.maxHP * (damagePercent / 100));
				aCache.damageInflicted = damage;
				dCache.damageTaken = damage;
				if(this._attacker.params.targetEndHP <= 0){
					dCache.isDestroyed = true;
					dCache.destroyer = aCache.ref;
				}
			} else {
				aCache.damageInflicted = 0;
				dCache.damageTaken = 0;
			}
		}
	}
	
	var actions = [];
	if(supportAttacker){			
		actions.push(new BattleAction(supportAttacker, defender, supportDefender, attackerSide, true));								
	}	
	actions.push(new BattleAction(attacker, defender, supportDefender, attackerSide));	
	actions.push(new BattleAction(defender, attacker, null, defenderSide));			
	
	
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
	
	//Character sprites are split into two a bottom and top part to improve overlap for units whose map icon goes outside their current tiles.
	//This can happen for flying units for example.
	//The base sprite is normally hidden, but is still available.
	Sprite_Character.prototype.update = function(character) {
		Sprite_Base.prototype.update.call(this);
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
					if(this._upperBody && this._lowerBody){	
						this._upperBody.scale.x = -1;
						this._lowerBody.scale.x = -1;
					}	
				} else {
					this.scale.x = 1;				
					if(this._upperBody && this._lowerBody){	
						this._upperBody.scale.x = 1;
						this._lowerBody.scale.x = 1;
					}
				}
				if(this._upperBody && this._lowerBody){	
					if(battlerArray[0] === 'actor' && $gameTemp.doingManualDeploy){
						this._frameCount+=2;
						this._frameCount %= 200;
						if(this._frameCount < 100){
							this._upperBody.opacity = this._frameCount + 80;
							this._lowerBody.opacity = this._frameCount + 80;
						} else {
							this._upperBody.opacity = 200 + 80 - this._frameCount;
							this._lowerBody.opacity = 200 + 80 - this._frameCount;
						}
					} else {
						this._upperBody.opacity = 255;
						this._lowerBody.opacity = 255;
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
	
	Sprite_Character.prototype.setTurnEnd = function(sprite) {
		this._turnEndSprite = sprite;
		this._turnEndSprite.anchor.x = 0;
        this._turnEndSprite.anchor.y = 1;
	}
	
	Sprite_Character.prototype.updateHalfBodySprites = function() {   
		if(this._upperBody && this._lowerBody){		
			this._upperBody.bitmap = this.bitmap;
			this._upperBody.visible = true;
			this._lowerBody.bitmap = this.bitmap;
			this._lowerBody.visible = true;	
		}
	};
	
	Sprite_Character.prototype.updatePosition = function() {
		this.x = this._character.screenX();
		this.y = this._character.screenY();
		this.z = this._character.screenZ();
		
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
		}
	};
	
    //キャラクターフレームの更新
    var _SRPG_Sprite_Character_updateCharacterFrame = Sprite_Character.prototype.updateCharacterFrame;
    Sprite_Character.prototype.updateCharacterFrame = function() {
		var pw = this.patternWidth();
		var ph = this.patternHeight();
		var sx = (this.characterBlockX() + this.characterPatternX()) * pw;
		var sy = (this.characterBlockY() + this.characterPatternY()) * ph;
		if(this._upperBody && this._lowerBody){			
			
			this.updateHalfBodySprites();
		
			var d = 24;
			this._upperBody.setFrame(sx, sy, pw, ph - d);
			this._lowerBody.setFrame(sx, sy + ph - d, pw, d);	

			if($gameSystem.isSubBattlePhase() !== 'actor_map_target_confirm' || $gameTemp.isMapTarget(this._character.eventId())){
				this._upperBody.setBlendColor([0, 0, 0, 0]);	
				this._lowerBody.setBlendColor([0, 0, 0, 0]);
			} else {
				this._upperBody.setBlendColor([0, 0, 0, 128]);	
				this._lowerBody.setBlendColor([0, 0, 0, 128]);
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
		this.bitmap =  ImageManager.loadAnimation('SRWAppear');
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
	
	Sprite_Appear.prototype.setCharacter = function(character){
		this._character = character;
	}

	Sprite_Appear.prototype.update = function() {
		if(this._animationFrame > this._frames){
			this.visible = false;
			this._character.isDoingAppearAnim = false;
		} else {
			if(this._animationFrame == 3){
				this._character.appear();
				this._character.refreshImage();
			}				
			this.x = this._character.screenX();
			this.y = this._character.screenY();
			this.z = this._character.screenZ() + 1;
			var eventId = this._character.eventId();
			var battlerArray = $gameSystem.EventToUnit(eventId);
			if(battlerArray && battlerArray[1]){
				if (this._character.isDoingAppearAnim) {
					if(this._animationFrame == 0){
						var se = {};
						se.name = 'SRWAppear';
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
		if($gameSystem.enableGrid){
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
		this.bitmap = new Bitmap($gameMap.tileWidth() * $gameMap.width(), $gameMap.tileHeight() * $gameMap.height());	
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
		
		this.addCharacterToBaseSprite(new Sprite_Character($gamePlayer));   	
		
		this.createPictures();
		this.createTimer();
		this.createScreenSprites();
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
		
		this._highlightSprite = new Sprite_AreaHighlights();
		this._baseSprite.addChild(this._highlightSprite);  		
        this._srpgMoveTile = [];
        for (var i = 0; i < $gameSystem.spriteMoveTileMax(); i++) {
			this._srpgMoveTile[i] = new Sprite_SrpgMoveTile();
			this._baseSprite.addChild(this._srpgMoveTile[i]);
        }		
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
		this._characterLayerSprites = [];
		if($gameTemp.intermissionPending){
			return;
		}
			
		this._bshadowSprites = {};
		this._explosionSprites = {};
		this._appearSprites = {};
		this._disappearSprites = {};
		this._willIndicators = {};
		this._defendIndicators = {};
		this._attackIndicators = {};
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
		
		var shipTurnEndSprites = [];
		var actorTurnEndSprites = [];
		
		$gameMap.events().forEach(function(event) {
			if(event.isType() == "ship" || event.isType() == "ship_event"){
				ships.push(new Sprite_Character(event));
				shipBottoms.push(new Sprite());
				shipTurnEndSprites.push(new Sprite());
			} else {
				actors.push(new Sprite_Character(event));
				actorBottoms.push(new Sprite());
				actorTurnEndSprites.push(new Sprite());
			}			
		}, this);
		
		$gameMap.events().forEach(function(event) {
			if(event.isType() == "ship" || event.isType() == "ship_event"){				
				shipTops.push(new Sprite());
			} else {			
				actorTops.push(new Sprite());
			}			
		}, this);
		
		for(var i = 0; i < actors.length; i++){
			actors[i].setLowerBody(actorBottoms[i]);
			actors[i].setUpperBody(actorTops[i]);
			actors[i].setTurnEnd(actorTurnEndSprites[i]);
		}
		
		for(var i = 0; i < ships.length; i++){
			ships[i].setLowerBody(shipBottoms[i]);
			ships[i].setUpperBody(shipTops[i]);
			ships[i].setTurnEnd(shipTurnEndSprites[i]);
		}
		
		this._characterSprites = shipBottoms.concat(shipTurnEndSprites).concat(actorBottoms).concat(actorTurnEndSprites).concat(shipTops).concat(actorTops).concat(ships).concat(actors);
		$gameMap.vehicles().forEach(function(vehicle) {
			this._characterSprites.push(new Sprite_Character(vehicle));
		}, this);
		$gamePlayer.followers().reverseEach(function(follower) {
			this._characterSprites.push(new Sprite_Character(follower));
		}, this);
		//this._characterSprites.push(new Sprite_Character($gamePlayer));
		for (var i = 0; i < this._characterSprites.length; i++) {
			this.addCharacterToBaseSprite(this._characterSprites[i]);
		}
		$gameMap.events().forEach(function(event) {
			this.createExplosionSprite(event._eventId, event);
			this.createAppearSprite(event._eventId, event);
			this.createDisappearSprite(event._eventId, event);
			this.createWillIndicator(event._eventId, event);
			this.createDefendIndicator(event._eventId, event);
			this.createAttackIndicator(event._eventId, event);
		}, this);			
		
		this._reticuleSprite = new Sprite_Reticule();
		this.addCharacterToBaseSprite(this._reticuleSprite);   	
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
// ●Window_Base
//====================================================================
    // EXPの割合を表示する
    Window_Base.prototype.drawSrpgExpRate = function(actor, x, y, width) {
        width = width || 120;
        var color1 = this.hpGaugeColor1();
        var color2 = this.hpGaugeColor2();
        this.drawGauge(x, y, width, actor.expRate(), color1, color2);
    };

    Window_Base.prototype.drawEnemyFaceWhenNoFace = function(enemy, x, y, width, height) {
        width = width || Window_Base._faceWidth;
        height = height || Window_Base._faceHeight;
        if ($gameSystem.isSideView()) {
            var bitmap = ImageManager.loadSvEnemy(enemy.battlerName(), enemy.battlerHue());
        } else {
            var bitmap = ImageManager.loadEnemy(enemy.battlerName(), enemy.battlerHue());
        }
        var pw = Window_Base._faceWidth;
        var ph = Window_Base._faceHeight;
        var sw = Math.min(width, pw, bitmap.width);
        var sh = Math.min(height, ph, bitmap.height);
        var dx = Math.floor(x + Math.max(width - bitmap.width, 0) / 2);
        var dy = Math.floor(y + Math.max(height - bitmap.height, 0) / 2);
        var sx = Math.floor(Math.max(bitmap.width / 2 - width / 2, 0));
        var sy = Math.floor(Math.max(bitmap.height / 2 - height / 2, 0));
        this.contents.blt(bitmap, sx, sy, sw, sh, dx, dy);
    };

    // エネミーの職業（クラス）を描画する
    Window_Base.prototype.drawEnemyClass = function(enemy, x, y, width) {
        width = width || 168;
        var className = enemy.enemy().meta.srpgClass;
        if (!className) {
            className = _enemyDefaultClass;
        }
        this.resetTextColor();
        this.drawText(className, x, y, width);
    };

    // エネミーの顔グラフィックを描画する
    Window_Base.prototype.drawEnemyFace = function(enemy, x, y, width, height) {
        var faceName = enemy.enemy().meta.faceName;
        var faceIndex = enemy.enemy().meta.faceIndex - 1;
        if (!faceName || !faceIndex) {
            this.drawEnemyFaceWhenNoFace(enemy, x, y, width, height);
        } else {
            this.drawFace(faceName, faceIndex, x, y, width, height);
        }
    };

    // エネミーのレベルを描画する
    Window_Base.prototype.drawEnemyLevel = function(enemy, x, y) {
		var srpgLevel;
		var SRWLevel = $statCalc.getCurrentLevel(enemy);
		if(SRWLevel){
			srpgLevel = SRWLevel;
		} else {
			srpgLevel = enemy.enemy().meta.srpgLevel;
		}
        if (srpgLevel) {
            this.changeTextColor(this.systemColor());
            this.drawText(TextManager.levelA, x, y, 48);
            this.resetTextColor();
            this.drawText(srpgLevel, x + 84, y, 36, 'right');
        }
    };

    // アクターの装備（武器）を描画する
    Window_Base.prototype.drawActorSrpgEqiup = function(actor, x, y) {
        var item = actor.weapons()[0]
        this.changeTextColor(this.systemColor());
        this.drawText(_textSrpgEquip, x, y, 92);
        this.resetTextColor();
        if (item) {
            this.drawItemName(item, x + 96, y, 240);
        } else {
// Japanese Term "なし"
            this.drawText('None', x + 96, y, 240);
        }
    };

    // エネミーの装備（武器）を描画する
    Window_Base.prototype.drawEnemySrpgEqiup = function(enemy, x, y) {
        var item = $dataWeapons[enemy.enemy().meta.srpgWeapon];
        this.changeTextColor(this.systemColor());
        this.drawText(_textSrpgEquip, x, y, 92);
        this.resetTextColor();
        if (item) {
            this.drawItemName(item, x + 96, y, 240);
        } else {
// Japanese Term "なし"
            this.drawText('None', x + 96, y, 240);
        }
    };
	
	Window_Base.prototype.drawActorMp = function(actor, x, y, width) {
		width = width || 186;
		var color1 = this.mpGaugeColor1();
		var color2 = this.mpGaugeColor2();
		this.drawGauge(x, y, width, actor.mpRate(), color1, color2);
		this.changeTextColor(this.systemColor());
		this.drawText("EN", x, y, 44);
		this.drawCurrentAndMax(actor.mp, actor.mmp, x, y, width,
							   this.mpColor(actor), this.normalColor());
	};

//====================================================================
// ●Window_SrpgStatus
//====================================================================
    function Window_SrpgStatus() {
        this.initialize.apply(this, arguments);
    }

    Window_SrpgStatus.prototype = Object.create(Window_Base.prototype);
    Window_SrpgStatus.prototype.constructor = Window_SrpgStatus;

    Window_SrpgStatus.prototype.initialize = function(x, y) {
        var width = this.windowWidth();
        var height = this.windowHeight();
        this._type = null;
        this._battler = null;
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this.refresh();
    };

    Window_SrpgStatus.prototype.windowWidth = function() {
        return 408;
    };

    Window_SrpgStatus.prototype.windowHeight = function() {
        return this.fittingHeight(6);
    };

    Window_SrpgStatus.prototype.setBattler = function(data) {
        this._type = data[0];
        this._battler = data[1];
        this.refresh();
    };

    Window_SrpgStatus.prototype.clearBattler = function() {
        this._type = null;
        this._battler = null;
        this.refresh();
    };

    Window_SrpgStatus.prototype.refresh = function() {
        this.contents.clear();
        if (!this._battler) {
          return;
        }
        if (this._type === 'actor') {
            this.drawContentsActor();
        } else if (this._type === 'enemy') {
            this.drawContentsEnemy();
        }
    };

    Window_SrpgStatus.prototype.drawContentsActor = function() {
        var lineHeight = this.lineHeight();
        this.drawActorName(this._battler, 6, lineHeight * 0);
        this.drawActorClass(this._battler, 192, lineHeight * 0);
        this.drawActorFace(this._battler, 6, lineHeight * 1);
        this.drawBasicInfoActor(176, lineHeight * 1);
        //this.drawActorSrpgEqiup(this._battler, 6, lineHeight * 5);
       // this.drawParameters(6, lineHeight * 6);
        //this.drawSrpgParameters(6, lineHeight * 9);
    };

    Window_SrpgStatus.prototype.drawContentsEnemy = function() {
        var lineHeight = this.lineHeight();
        this.drawActorName(this._battler, 6, lineHeight * 0);
        this.drawEnemyClass(this._battler, 192, lineHeight * 0);
        this.drawEnemyFace(this._battler, 6, lineHeight * 1);
        this.drawBasicInfoEnemy(176, lineHeight * 1);
        //this.drawEnemySrpgEqiup(this._battler, 6, lineHeight * 5);
       // this.drawParameters(6, lineHeight * 6);
       // this.drawSrpgParameters(6, lineHeight * 9);
    };

    Window_SrpgStatus.prototype.drawBasicInfoActor = function(x, y) {
        var lineHeight = this.lineHeight();
        this.drawSrpgExpRate(this._battler, x, y + lineHeight * 0);
        this.drawActorLevel(this._battler, x, y + lineHeight * 0);
        this.drawActorIcons(this._battler, x, y + lineHeight * 1);
        this.drawActorHp(this._battler, x, y + lineHeight * 2);
        if ($dataSystem.optDisplayTp) {
            this.drawActorMp(this._battler, x, y + lineHeight * 3, 90);
            this.drawActorTp(this._battler, x + 96, y + lineHeight * 3, 90);
        } else {
            this.drawActorMp(this._battler, x, y + lineHeight * 3);
        }
    };

    Window_SrpgStatus.prototype.drawBasicInfoEnemy = function(x, y) {
        var lineHeight = this.lineHeight();
        this.drawEnemyLevel(this._battler, x, y + lineHeight * 0);
        this.drawActorIcons(this._battler, x, y + lineHeight * 1);
        this.drawActorHp(this._battler, x, y + lineHeight * 2);
        if ($dataSystem.optDisplayTp) {
            this.drawActorMp(this._battler, x, y + lineHeight * 3, 90);
            this.drawActorTp(this._battler, x + 96, y + lineHeight * 3, 90);
        } else {
            this.drawActorMp(this._battler, x, y + lineHeight * 3);
        }
    };

    Window_SrpgStatus.prototype.drawParameters = function(x, y) {
        var lineHeight = this.lineHeight();
        for (var i = 0; i < 6; i++) {
            var paramId = i + 2;
            var x2 = x + 188 * (i % 2);
            var y2 = y + lineHeight * Math.floor(i / 2);
            this.changeTextColor(this.systemColor());
            this.drawText(TextManager.param(paramId), x2, y2, 120);
            this.resetTextColor();
            this.drawText(this._battler.param(paramId), x2 + 120, y2, 48, 'right');
        }
    };

    Window_SrpgStatus.prototype.drawSrpgParameters = function(x, y) {
        var lineHeight = this.lineHeight();
        this.changeTextColor(this.systemColor());
        this.drawText(_textSrpgMove, x, y, 120);
        this.resetTextColor();
        this.drawText(this._battler.srpgMove(), x + 120, y, 48, 'right');
        this.changeTextColor(this.systemColor());
        this.drawText(_textSrpgRange, x + 188, y, 120);
        this.resetTextColor();
        var text = '';
        if (this._battler.srpgWeaponMinRange() > 0) {
            text += this._battler.srpgWeaponMinRange() + '-';
        }
        text += this._battler.srpgWeaponRange();
        this.drawText(text, x + 188 + 72, y, 96, 'right');
    };

//====================================================================
// ●Window_SrpgActorCommandStatus
//====================================================================
    function Window_SrpgActorCommandStatus() {
        this.initialize.apply(this, arguments);
    }

    Window_SrpgActorCommandStatus.prototype = Object.create(Window_Base.prototype);
    Window_SrpgActorCommandStatus.prototype.constructor = Window_SrpgActorCommandStatus;

    Window_SrpgActorCommandStatus.prototype.initialize = function(x, y) {
        var width = this.windowWidth();
        var height = this.windowHeight();
        this._battler = null;
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this.refresh();
    };

    Window_SrpgActorCommandStatus.prototype.windowWidth = function() {
        return Graphics.boxWidth - 240;
    };

    Window_SrpgActorCommandStatus.prototype.windowHeight = function() {
        return this.fittingHeight(3);
    };

    Window_SrpgActorCommandStatus.prototype.setBattler = function(battler) {
        this._battler = battler;
        this.refresh();
        this.open();
    };

    Window_SrpgActorCommandStatus.prototype.clearBattler = function() {
        this._battler = null;
        this.refresh();
        this.close();
    };

    Window_SrpgActorCommandStatus.prototype.refresh = function() {
        this.contents.clear();
        if (!this._battler) {
          return;
        }
        this.drawContents();
    };

    Window_SrpgActorCommandStatus.prototype.drawContents = function() {
        this.drawActorFace(this._battler, 0, -24, Window_Base._faceWidth, Window_Base._faceHeight);
        var x = 156;
        var y = 0;
        var width = this.windowWidth() - x - this.textPadding();
        var width2 = Math.min(200, this.windowWidth() - 180 - this.textPadding());
        var lineHeight = this.lineHeight();
        var x2 = x + 180;
        var width2 = Math.min(200, width - 180 - this.textPadding());
        this.drawActorName(this._battler, x, y);
        this.drawActorLevel(this._battler, x, y + lineHeight * 1);
        this.drawActorIcons(this._battler, x, y + lineHeight * 2);
        this.drawActorClass(this._battler, x2, y);
        this.drawActorHp(this._battler, x2, y + lineHeight * 1, width2);
        if ($dataSystem.optDisplayTp) {
            this.drawActorMp(this._battler, x2, y + lineHeight * 2, width2 / 2 - 4);
            this.drawActorTp(this._battler, x2 + width2 / 2 + 4, y + lineHeight * 2, width2 / 2 - 4);
        } else {
            this.drawActorMp(this._battler, x2, y + lineHeight * 2);
        }
    };

//====================================================================
// ●Window_SrpgBattleStatus
//====================================================================
    function Window_SrpgBattleStatus() {
        this.initialize.apply(this, arguments);
    }

    Window_SrpgBattleStatus.prototype = Object.create(Window_Base.prototype);
    Window_SrpgBattleStatus.prototype.constructor = Window_SrpgBattleStatus;

    Window_SrpgBattleStatus.prototype.initialize = function(pos) {
        var width = this.windowWidth();
        var height = this.windowHeight();
        var x = 0 + width * pos;
        var y = Graphics.boxHeight - height;
        this._type = null;
        this._battler = null;
        this._reserveHp = null;
        this._reserveMp = null;
        this._reserveTp = null;
        this._changeHp = 0;
        this._changeMp = 0;
        this._changeTp = 0;
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this.refresh();
    };

    Window_SrpgBattleStatus.prototype.windowWidth = function() {
        return Graphics.boxWidth / 2;
    };

    Window_SrpgBattleStatus.prototype.windowHeight = function() {
        return this.fittingHeight(4);
    };

    Window_SrpgBattleStatus.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        this.updateData();
    };


    Window_SrpgBattleStatus.prototype.updateData = function() {
        if (!this._type || !this._battler) {
            return;
        }
        if (this._changeHp > 0 || this._changeMp > 0 || this._changeTp > 0) {
            this.refresh();
        }
    };

    Window_SrpgBattleStatus.prototype.setBattler = function(battler) {
        if (battler.isActor() == true) {
            this._type = 'actor';
        } else if (battler.isEnemy() == true) {
            this._type = 'enemy';
        }
        this._battler = battler;
        this._reserveHp = battler.hp;
        this._reserveMp = battler.mp;
        this._reserveTp = battler.tp;
        this._changeHp = 1;
        this._changeMp = 1;
        this._changeTp = 1;
        this.refresh();
    };

    Window_SrpgBattleStatus.prototype.refresh = function() {
        this.contents.clear();
        if (!this._battler) {
          return;
        }
        if (this._changeHp <= 0 && this._reserveHp != this._battler.hp) {
            this._changeHp = 20;
        }
        if (this._changeMp <= 0 && this._reserveMp != this._battler.mp) {
            this._changeMp = 20;
        }
        if (this._changeTp <= 0 && this._reserveTp != this._battler.tp) {
            this._changeTp = 20;
        }
        if (this._type === 'actor') {
            this.drawContentsActor();
        } else if (this._type === 'enemy') {
            this.drawContentsEnemy();
        }
    };

    Window_SrpgBattleStatus.prototype.drawContentsActor = function() {
        var lineHeight = this.lineHeight();
        this.drawActorName(this._battler, 176, lineHeight * 0);
        this.drawActorFace(this._battler, 6, lineHeight * 0);
        this.drawBasicInfoActor(176, lineHeight * 1);
    };

    Window_SrpgBattleStatus.prototype.drawContentsEnemy = function() {
        var lineHeight = this.lineHeight();
        this.drawActorName(this._battler, 176, lineHeight * 0);
        this.drawEnemyFace(this._battler, 6, lineHeight * 0);
        this.drawBasicInfoEnemy(176, lineHeight * 1);
    };

    Window_SrpgBattleStatus.prototype.drawBasicInfoActor = function(x, y) {
        var lineHeight = this.lineHeight();
        this.drawActorIcons(this._battler, x, y + lineHeight * 0);
        this.drawActorHp(this._battler, x, y + lineHeight * 1);
        if ($dataSystem.optDisplayTp) {
            this.drawActorMp(this._battler, x, y + lineHeight * 2, 90);
            this.drawActorTp(this._battler, x + 96, y + lineHeight * 2, 90);
        } else {
            this.drawActorMp(this._battler, x, y + lineHeight * 2);
        }

    };

    Window_SrpgBattleStatus.prototype.drawBasicInfoEnemy = function(x, y) {
        var lineHeight = this.lineHeight();
        this.drawActorIcons(this._battler, x, y + lineHeight * 0);
        this.drawActorHp(this._battler, x, y + lineHeight * 1);
        if ($dataSystem.optDisplayTp) {
            this.drawActorMp(this._battler, x, y + lineHeight * 2, 90);
            this.drawActorTp(this._battler, x + 96, y + lineHeight * 2, 90);
        } else {
            this.drawActorMp(this._battler, x, y + lineHeight * 2);
        }
    };

    Window_SrpgBattleStatus.prototype.drawActorHp = function(actor, x, y, width) {
        width = width || 186;
        var color1 = this.hpGaugeColor1();
        var color2 = this.hpGaugeColor2();
        var nowHp = Math.floor(actor.hp + (this._reserveHp - actor.hp) / 20 * (this._changeHp - 1));
        var rate = nowHp / actor.mhp;
        this.drawGauge(x, y, width, rate, color1, color2);
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.hpA, x, y, 44);
        this.drawCurrentAndMax(nowHp, actor.mhp, x, y, width,
                               this.hpColor(actor), this.normalColor());
        this._changeHp -= 1;
        if (this._changeHp <= 0) {
            this._reserveHp = actor.hp;
        }
    };

    Window_SrpgBattleStatus.prototype.drawActorMp = function(actor, x, y, width) {
        width = width || 186;
        var color1 = this.mpGaugeColor1();
        var color2 = this.mpGaugeColor2();
        var nowMp = Math.floor(actor.mp + (this._reserveMp - actor.mp) / 20 * (this._changeMp - 1));
        if (actor.mmp == 0) {
            var rate = 0;
        } else {
            var rate = nowMp / actor.mmp;
        }
        this.drawGauge(x, y, width, rate, color1, color2);
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.mpA, x, y, 44);
        this.drawCurrentAndMax(nowMp, actor.mmp, x, y, width,
                               this.mpColor(actor), this.normalColor());
        this._changeMp -= 1;
        if (this._changeMp <= 0) {
            this._reserveMp = actor.mp;
        }
    };

    Window_SrpgBattleStatus.prototype.drawActorTp = function(actor, x, y, width) {
        width = width || 96;
        var color1 = this.tpGaugeColor1();
        var color2 = this.tpGaugeColor2();
        var nowTp = Math.floor(actor.tp + (this._reserveTp - actor.tp) / 20 * (this._changeTp - 1));
        var rate = nowTp / actor.maxTp();
        this.drawGauge(x, y, width, rate, color1, color2);
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.tpA, x, y, 44);
        this.changeTextColor(this.tpColor(actor));
        this.drawText(nowTp, x + width - 64, y, 64, 'right');
        this._changeTp -= 1;
        if (this._changeTp <= 0) {
            this._reserveTp = actor.tp;
        }
    };

//====================================================================
// ●Window_SrpgBattleResult
//====================================================================
    function Window_SrpgBattleResult() {
        this.initialize.apply(this, arguments);
    }

    Window_SrpgBattleResult.prototype = Object.create(Window_Base.prototype);
    Window_SrpgBattleResult.prototype.constructor = Window_SrpgBattleResult;

    Window_SrpgBattleResult.prototype.initialize = function(battler) {
        var width = this.windowWidth();
        var height = this.windowHeight();
        var x = (Graphics.boxWidth - width) / 2;
        var y = Graphics.boxHeight / 2 - height;
        this._battler = battler;
        this._reserveExp = this._battler.currentExp();
        this._level = this._battler.level;
        this._rewards = null;
        this._changeExp = 0;
        Window_Base.prototype.initialize.call(this, x, y, width, height);
    };

    Window_SrpgBattleResult.prototype.windowWidth = function() {
        return Graphics.boxWidth - 300;
    };

    Window_SrpgBattleResult.prototype.windowHeight = function() {
        return this.fittingHeight(4);
    };

    Window_SrpgBattleResult.prototype.isChangeExp = function() {
        return this._changeExp > 0;
    };

    Window_SrpgBattleResult.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        this.updateData();
    };


    Window_SrpgBattleResult.prototype.updateData = function() {
        if (!this._battler) {
            return;
        }
        if (this._changeExp > 0) {
            this.refresh();
        }
    };

    Window_SrpgBattleResult.prototype.setRewards = function(rewards) {
        this._rewards = rewards;
        this._changeExp = 30;
    };

    Window_SrpgBattleResult.prototype.refresh = function() {
        this.contents.clear();
        this.drawContents();
    };

    Window_SrpgBattleResult.prototype.drawContents = function() {
        var lineHeight = this.lineHeight();
        this.drawGainExp(6, lineHeight * 0);
        this.drawGainGold(6, lineHeight * 2);
        this.drawGainItem(0, lineHeight * 3);
    };

    Window_SrpgBattleResult.prototype.drawGainExp = function(x, y) {
        var lineHeight = this.lineHeight();
        var exp = this._rewards.exp;
        var width = this.windowWidth() - this.padding * 2;
        if (exp > 0) {
            var text = TextManager.obtainExp.format(exp, TextManager.exp);
            this.resetTextColor();
            this.drawText(text, x, y, width);
        } else {
            this._changeExp = 1;
        }
        var color1 = this.hpGaugeColor1();
        var color2 = this.hpGaugeColor2();
        var nowExp = Math.floor(this._reserveExp + exp / 30 * (31 - this._changeExp));
        if (nowExp >= this._battler.expForLevel(this._level + 1)) {
            this._level += 1;
            var se = {};
            se.name = 'Up4';
            se.pan = 0;
            se.pitch = 100;
            se.volume = 90;
            AudioManager.playSe(se);
        }
        if (this._level >= this._battler.maxLevel()) {
            var rate = 1.0;
            var nextExp = '-------'
        } else {
            var rate = (nowExp - this._battler.expForLevel(this._level)) / 
                       (this._battler.expForLevel(this._level + 1) - this._battler.expForLevel(this._level));
            var nextExp = this._battler.expForLevel(this._level + 1) - nowExp;
        }
        this.drawGauge(x + 100, y + lineHeight, width - 100, rate, color1, color2);
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.levelA, x, y + lineHeight, 48);
        this.resetTextColor();
        this.drawText(this._level, x + 48, y + lineHeight, 36, 'right');
        var expNext = TextManager.expNext.format(TextManager.level);
        this.drawText(expNext, width - 270, y + lineHeight, 270);
        this.drawText(nextExp, width - 270, y + lineHeight, 270, 'right');
        this._changeExp -= 1;
    };

    Window_SrpgBattleResult.prototype.drawGainGold = function(x, y) {
        var gold = this._rewards.gold;
        var width = (this.windowWidth() - this.padding * 2) / 2;
        if (gold > 0) {
            var unitWidth = Math.min(80, this.textWidth(TextManager.currencyUnit));
            this.resetTextColor();
            this.drawText(gold, x, y, width - unitWidth - 6);
            this.changeTextColor(this.systemColor());
            this.drawText(TextManager.currencyUnit, x + this.textWidth(gold) + 6, y, unitWidth);
        }
    }

    Window_SrpgBattleResult.prototype.drawGainItem = function(x, y) {
        var items = this._rewards.items;
        if (items.length > 1) {
            var width = (this.windowWidth() - this.padding * 2) / 2;
        } else {
            var width = this.windowWidth() - this.padding * 2;
        }
        if (items.length > 0) {
            for (var i = 0; i < items.length; i++) {
                this.drawItemName(items[i], x + width * Math.floor(0.5 + i * 0.5), y - this.lineHeight() * (i % 2), width);
            }
        }
    }

//====================================================================
// ●Window_SrpgPrediction
//====================================================================
    function Window_SrpgPrediction() {
        this.initialize.apply(this, arguments);
    }

    Window_SrpgPrediction.prototype = Object.create(Window_Base.prototype);
    Window_SrpgPrediction.prototype.constructor = Window_SrpgPrediction;

    Window_SrpgPrediction.prototype.initialize = function(x, y) {
        var width = this.windowWidth();
        var height = this.windowHeight();
        this._actionArray = [];
        this._targetArray = [];
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this.refresh();
    };

    Window_SrpgPrediction.prototype.windowWidth = function() {
        return Graphics.boxWidth;
    };

    Window_SrpgPrediction.prototype.windowHeight = function() {
        if (_srpgPredictionWindowMode === 2) {
            return this.fittingHeight(1);
        } else {
            return this.fittingHeight(3);
        }
    };

    Window_SrpgPrediction.prototype.setBattler = function(data1, data2) {
        this._actionArray = data1;
        this._targetArray = data2;
        this.refresh();
    };

    Window_SrpgPrediction.prototype.clearBattler = function() {
        this._actionArray = [];
        this._targetArray = [];
        this.refresh();
    };

    Window_SrpgPrediction.prototype.refresh = function() {
        this.contents.clear();
        if (!this._actionArray[1] || !this._targetArray[1]) {
          return;
        }
        //this.setTargetAction();
        this.drawContents();
    };

    Window_SrpgPrediction.prototype.setTargetAction = function() {
        $gameParty.clearSrpgBattleActors();
        $gameTroop.clearSrpgBattleEnemys();
        $gameTroop.clear();
        if (this._actionArray[0] === 'actor') {
            $gameParty.pushSrpgBattleActors(this._actionArray[1]);
            if (this._targetArray[0] === 'actor') {
                if (this._actionArray[1] != this._targetArray[1]) {
                    $gameParty.pushSrpgBattleActors(this._targetArray[1]);
                    this._actionArray[1].action(0).setTarget(1);
                } else {
                    this._actionArray[1].action(0).setTarget(0);
                }
            } else if (this._targetArray[0] === 'enemy') {
                $gameTroop.pushSrpgBattleEnemys(this._targetArray[1]);
                this._actionArray[1].action(0).setTarget(0);
            }
        } else if (this._actionArray[0] === 'enemy') {
            $gameTroop.pushSrpgBattleEnemys(this._actionArray[1]);
            this._actionArray[1].action(0).setSrpgEnemySubject(0);
            if (this._targetArray[0] === 'actor') {
                $gameParty.pushSrpgBattleActors(this._targetArray[1]);
                this._actionArray[1].action(0).setTarget(0);
            } else if (this._targetArray[0] === 'enemy') {
                if (this._actionArray[1] != this._targetArray[1]) {
                    $gameTroop.pushSrpgBattleEnemys(this._targetArray[1]);
                    this._actionArray[1].action(0).setTarget(1);
                } else {
                    this._actionArray[1].action(0).setTarget(0);
                }
            }
        }
        //対象の行動を設定
        if (this._actionArray[1] != this._targetArray[1]) {
            this._targetArray[1].srpgMakeNewActions();
            if (this._actionArray[0] === 'actor' && this._targetArray[0] === 'enemy' &&
                this._targetArray[1].canMove()) {
                $gameTroop.pushMembers(this._targetArray[1]);
                this._targetArray[1].action(0).setSrpgEnemySubject(0);
                this._targetArray[1].action(0).setAttack();
                this._targetArray[1].action(0).setTarget(0);
            }
            if (this._actionArray[0] === 'enemy' && this._targetArray[0] === 'actor' &&
                this._targetArray[1].canMove()) {
                this._targetArray[1].action(0).setAttack();
                this._targetArray[1].action(0).setTarget(0);
            }
        }
    };

    Window_SrpgPrediction.prototype.drawContents = function() {
        var windowWidth = this.windowWidth();
        var lineHeight = this.lineHeight();
        var x = 40;
        // 攻撃側

		
        this.drawSrpgBattleActionName($gameTemp.actorAction, windowWidth / 2 + x, lineHeight * 0);
        this.drawSrpgBattleHit($battleCalc.getActorFinalHit(), windowWidth / 2 + x, lineHeight * 1);
       // this.drawSrpgBattleDistance(actor, action, windowWidth / 2 + 160 + x, lineHeight * 1);
       // this.drawSrpgBattleDamage(damage, windowWidth / 2 + x, lineHeight * 2);
        // 迎撃側
       /* var actor = this._targetArray[1];
        var target = this._actionArray[1];
        var action = actor.currentAction();
        if (!this._targetArray[1].canUse(action.item())) {
            action = null;
        }
        if (!action || actor == target) {
            this.drawSrpgBattleActionName(actor, action, x, lineHeight * 0, false);
            return;
        }
    */
		this.drawSrpgBattleActionName($gameTemp.enemyAction, x, lineHeight * 0);
        this.drawSrpgBattleHit($battleCalc.getEnemyFinalHit(), x, lineHeight * 1);
       // this.drawSrpgBattleDistance(actor, action, 160 + x, lineHeight * 1);
        //this.drawSrpgBattleDamage(damage, x, lineHeight * 2);
       // this._targetArray[1].clearActions();
		
    };

    Window_SrpgPrediction.prototype.drawSrpgBattleActionName = function(actionDef, x, y) {
        /*if (action && flag == true) {
            var skill = action.item();
            if (skill) {
                var costWidth = this.costWidth();
                this.changePaintOpacity(this.isEnabled(actor, skill));
                if (DataManager.isSkill(skill) && skill.id == actor.attackSkillId() &&
                    !actor.hasNoWeapons()) {
                    if (actor.isActor()) {
                        var item = actor.weapons()[0];
                    } else {
                        var item = $dataWeapons[actor.enemy().meta.srpgWeapon];
                    }
                    this.drawItemName(item, x, y, 280 - costWidth);
                } else {
                    this.drawItemName(skill, x, y, 280 - costWidth);
                }
                this.drawSkillCost(actor, skill, x, y, 288);
                this.changePaintOpacity(1);
            } else {
                this.drawText('------------', x + 52, y, 96, 'right');
            }
        } else {
            this.drawText('------------', x + 52, y, 96, 'right');
        }*/
		if(actionDef.type === "attack"){			
			this.drawText(actionDef.attack.name, x + 52, y, 96, 'right');
		} else if(actionDef.type === "evade"){
			this.drawText('Evade', x + 52, y, 96, 'right');
		} else if(actionDef.type === "defend"){
			this.drawText('Defend', x + 52, y, 96, 'right');
		}
    };

    Window_SrpgPrediction.prototype.drawSrpgBattleDistance = function(actor, action, x, y) {
        var skill = action.item();
        this.changeTextColor(this.systemColor());
        this.drawText(_textSrpgRange, x, y, 98);
        this.resetTextColor();
        var text = '';
        if (actor.srpgSkillMinRange(skill) > 0) {
            text += actor.srpgSkillMinRange(skill) + '-';
        }
        text += actor.srpgSkillRange(skill);
        this.drawText(text, x + 32, y, 96, 'right');
    };

    Window_SrpgPrediction.prototype.drawSrpgBattleDamage = function(damage, x, y) {
        this.changeTextColor(this.systemColor());
        if (damage >= 0) {
// Japanese Term "ダメージ"
            this.drawText('Damage', x, y, 164);
            this.resetTextColor();
            this.drawText(damage, x + 188, y, 100, 'right');
        } else {
// Japanese Term "回復"
            this.drawText('Recovery', x, y, 164);
            this.resetTextColor();
            this.drawText(damage * -1, x + 188, y, 100, 'right');
        }
    };

    Window_SrpgPrediction.prototype.drawSrpgBattleHit = function(finalHit, x, y) {
        var val = finalHit;
        this.changeTextColor(this.systemColor());
// Japanese Term "回復"
        this.drawText('Hit', x, y, 98);
        this.resetTextColor();
        this.drawText(Math.floor(val * 100) + '%', x + 64, y, 64, 'right');
    };

    Window_SrpgPrediction.prototype.costWidth = function() {
        return this.textWidth('000');
    };

    Window_SrpgPrediction.prototype.drawSkillCost = function(actor, skill, x, y, width) {
        if (actor.skillTpCost(skill) > 0) {
            this.changeTextColor(this.tpCostColor());
            this.drawText(actor.skillTpCost(skill), x, y, width, 'right');
        } else if (actor.skillMpCost(skill) > 0) {
            this.changeTextColor(this.mpCostColor());
            this.drawText(actor.skillMpCost(skill), x, y, width, 'right');
        }
    };

    Window_SrpgPrediction.prototype.isEnabled = function(actor, item) {
        return actor && actor.canUse(item);
    };

//====================================================================
// ●Window_ActorCommand
//====================================================================
    Window_Command.prototype.isList = function() {
        if (this._list) {
            return true;
        } else {
            return false;
        }
    };

    var _SRPG_Window_ActorCommand_numVisibleRows = Window_ActorCommand.prototype.numVisibleRows;
    Window_ActorCommand.prototype.numVisibleRows = function() {
        if ($gameSystem.isSRPGMode() == true) {
            if (this.isList()) {
                return this.maxItems();
            } else {
                return 0;
            }
        } else {
            return _SRPG_Window_ActorCommand_numVisibleRows.call(this);
        }
    };

    var _SRPG_Window_ActorCommand_makeCommandList = Window_ActorCommand.prototype.makeCommandList;
    Window_ActorCommand.prototype.makeCommandList = function() {
		var _this = this;
        if ($gameSystem.isSRPGMode() == true) {
            if (this._actor) {
				//TODO: turn different menus into subclasses
				
				var battler = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
				var type = battler.isActor() ? "enemy" : "actor";
				var pos = {
					x: $gameTemp.activeEvent().posX(),
					y: $gameTemp.activeEvent().posY()
				};
				var fullRange = $statCalc.getFullWeaponRange(battler, $gameTemp.isPostMove);
				var hasTarget = $statCalc.getAllInRange($gameSystem.getPlayerFactionInfo(), pos, fullRange.range, fullRange.minRange).length > 0;
				var hasMapWeapon = $statCalc.hasMapWeapon(battler);
				
				function boardingMenu(){
					_this.addCommand(APPSTRINGS.MAPMENU.board, 'board');
				}
				
				function regularMenu(){
					if(_this._actor.battleMode() != "fixed"){
						_this.addMoveCommand();
					}
					if(hasTarget || hasMapWeapon){
						_this.addCommand(APPSTRINGS.MAPMENU.cmd_attack, 'attack');
					}
					if($statCalc.isShip(_this._actor) && $statCalc.hasBoardedUnits(_this._actor)){
						_this.addCommand(APPSTRINGS.MAPMENU.deploy, 'deploy');
					}
					_this.addCommand(APPSTRINGS.MAPMENU.cmd_spirit, 'spirit');
					if($statCalc.applyStatModsToValue(_this._actor, 0, ["heal"])){
						_this.addCommand(APPSTRINGS.MAPMENU.cmd_repair, 'heal');
					}
					if($statCalc.applyStatModsToValue(_this._actor, 0, ["resupply"])){
						_this.addCommand(APPSTRINGS.MAPMENU.cmd_resupply, 'resupply');
					}
					if($statCalc.getConsumables(_this._actor).length){
						 _this.addCommand(APPSTRINGS.MAPMENU.cmd_item, 'item');
					}
					if($statCalc.getAbilityCommands(_this._actor).length){
						 _this.addCommand(APPSTRINGS.MAPMENU.cmd_ability, 'ability');
					}
					if($statCalc.canFly(_this._actor) && $statCalc.getCurrentTerrain(_this._actor) != "space"){
						if($statCalc.isFlying(_this._actor)){
							if(($statCalc.getTileType(_this._actor) == "land" && $statCalc.canBeOnLand(_this._actor)) || ($statCalc.getTileType(_this._actor) == "water" && $statCalc.canBeOnWater(_this._actor))){
								_this.addCommand(APPSTRINGS.MAPMENU.cmd_land, 'land');
							}
						} else {
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_fly, 'fly');
						}
					}		
					if($gameSystem.getPersuadeOption(_this._actor)){
						_this.addCommand(APPSTRINGS.MAPMENU.cmd_persuade, 'persuade');
					}	
					if($statCalc.canCombine(_this._actor).isValid){
						_this.addCommand(APPSTRINGS.MAPMENU.cmd_combine, 'combine');
					}	
					if($statCalc.isCombined(_this._actor)){
						_this.addCommand(APPSTRINGS.MAPMENU.cmd_split, 'split');
					}		
					if($statCalc.canTransform(_this._actor)){
						_this.addCommand(APPSTRINGS.MAPMENU.cmd_transform, 'transform');
					}	
					
					_this.addWaitCommand();					
				}
				
				function hitAndAwayMenu(){
					_this.addMoveCommand();
					_this.addWaitCommand();
				}
				
				function disabledMenu(){
					_this.addWaitCommand();
				}
				
				function postMoveMenu(){
					if(hasTarget || hasMapWeapon){
						_this.addCommand(APPSTRINGS.MAPMENU.cmd_attack, 'attack');
					}
					if($gameSystem.getPersuadeOption(_this._actor)){
						_this.addCommand(APPSTRINGS.MAPMENU.cmd_persuade, 'persuade');
					}
					if($statCalc.applyStatModsToValue(_this._actor, 0, ["heal"])){
						_this.addCommand(APPSTRINGS.MAPMENU.cmd_repair, 'heal');
					}
					_this.addWaitCommand();
				}
				
				function deployMenu(){
					_this.addMoveCommand();					
					_this.addCommand(APPSTRINGS.MAPMENU.cmd_spirit, 'spirit');
					if($statCalc.canFly(_this._actor) && $statCalc.getCurrentTerrain(_this._actor) != "space"){
						if($statCalc.isFlying(_this._actor)){
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_land, 'land');
						} else {
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_fly, 'fly');
						}
					}
					if($statCalc.getConsumables(_this._actor).length){
						 _this.addCommand(APPSTRINGS.MAPMENU.cmd_item, 'item');
					}
				}
				
				if($gameSystem.isSubBattlePhase() == 'confirm_boarding'){
					boardingMenu();
				} else if($gameTemp.isHitAndAway){
					hitAndAwayMenu();
				} else if($gameTemp.isPostMove){
					postMoveMenu();
				} else if($gameTemp.activeShip){
					deployMenu();
				} else if(this._actor.battleMode() == "disabled"){
					disabledMenu();
				} else {	
					regularMenu();
				}				
            }
        } else {
            _SRPG_Window_ActorCommand_makeCommandList.call(this);
        }
    };

    Window_ActorCommand.prototype.addEquipCommand = function() {
        this.addCommand(_textSrpgEquip, 'equip', this._actor.canSrpgEquip());
    };

    Window_ActorCommand.prototype.addWaitCommand = function() {
        this.addCommand(APPSTRINGS.MAPMENU.cmd_wait, 'wait');
    };
	
	Window_ActorCommand.prototype.addMoveCommand = function() {
        this.addCommand(APPSTRINGS.MAPMENU.cmd_move, 'move');
    };

    var _SRPG_Window_ActorCommand_setup = Window_ActorCommand.prototype.setup;
    Window_ActorCommand.prototype.setup = function(actor) {
        if ($gameSystem.isSRPGMode() == true) {
            this._actor = actor;
            this.clearCommandList();
            this.makeCommandList();
            this.updatePlacement();
            this.refresh();
            this.selectLast();
            this.activate();
            this.open();
        } else {
            _SRPG_Window_ActorCommand_setup.call(this, actor);
        }
    };

    Window_ActorCommand.prototype.updatePlacement = function() {
        this.width = this.windowWidth();
        this.height = this.windowHeight();
        this.x = Math.max($gameTemp.activeEvent().screenX() - $gameMap.tileWidth() / 2 - this.windowWidth(), 0);
        if ($gameTemp.activeEvent().screenY() < Graphics.boxHeight - 160) {
            var eventY = $gameTemp.activeEvent().screenY();
        } else {
            var eventY = Graphics.boxHeight - 160;
        }
        this.y = Math.max(eventY - this.windowHeight(), 0);
    };

//====================================================================
// ●Window_SrpgBattle
//====================================================================
    function Window_SrpgBattle() {
        this.initialize.apply(this, arguments);
    }

    Window_SrpgBattle.prototype = Object.create(Window_HorzCommand.prototype);
    Window_SrpgBattle.prototype.constructor = Window_SrpgBattle;

    Window_SrpgBattle.prototype.initialize = function() {
        Window_HorzCommand.prototype.initialize.call(this, 0, 0);
        this._actor = null;
        this._item = null;
        this.openness = 0;
        this.deactivate();
    };

    Window_SrpgBattle.prototype.windowWidth = function() {
        return 240;
    };
	
	Window_SrpgBattle.prototype.windowHeight = function() {
        return this.fittingHeight(3);
    };

    Window_SrpgBattle.prototype.maxCols = function() {
        return 1;
    };

    Window_SrpgBattle.prototype.makeCommandList = function() {
// Japanese Term "戦闘開始"
        this.addCommand('Execute', 'battleStart');
		if($gameTemp.isEnemyAttack){
			if($gameTemp.actorAction.type === "attack"){
				this.addCommand('Counter', 'selectCounterAction');
			} else if($gameTemp.actorAction.type === "defend"){
				this.addCommand('Defend', 'selectCounterAction');
			} else if($gameTemp.actorAction.type === "evade"){
				this.addCommand('Evade', 'selectCounterAction');
			}			
			this.addCommand('Support', '');
		} else {
			if($gameTemp.supportAttackCandidates && $gameTemp.supportAttackCandidates.length){
				this.addCommand('Support', 'selectSupportAttack');
			}
			this.addCommand(TextManager.cancel, 'cancel');
		}        
    };

    Window_SrpgBattle.prototype.setup = function(actorArray) {
        //this._actor = actorArray[1];
       // this._item = actorArray[1].currentAction().item();
        this.clearCommandList();
        this.makeCommandList();
        this.refresh();
        this.activate();
        this.open();
    };

    Window_SrpgBattle.prototype.clearActor = function() {
        this._actor = null;
        this._item = null;
        this.clearCommandList();
    };

//====================================================================
// ●Window_BattleLog
//====================================================================
    var _SRPG_Window_BattleLog_showEnemyAttackAnimation = Window_BattleLog.prototype.showEnemyAttackAnimation;
    Window_BattleLog.prototype.showEnemyAttackAnimation = function(subject, targets) {
        if ($gameSystem.isSRPGMode() == true) {
            this.showNormalAnimation(targets, subject.attackAnimationId(), false);
        } else {
            _SRPG_Window_BattleLog_showEnemyAttackAnimation.call(this, subject, targets);
        }
    };

//====================================================================
// ●Window_MenuStatus
//====================================================================
    var _SRPG_Window_MenuStatus_drawItemImage = Window_MenuStatus.prototype.drawItemImage;
    Window_MenuStatus.prototype.drawItemImage = function(index) {
        if ($gameSystem.isSRPGMode() == true) {
            var actor = $gameParty.members()[index];
            var rect = this.itemRect(index);
            if (actor.srpgTurnEnd() == true || actor.isRestricted() == true) {
                this.changePaintOpacity(false);
            } else {
                this.changePaintOpacity(true);
            }
            this.drawActorFace(actor, rect.x + 1, rect.y + 1, Window_Base._faceWidth, Window_Base._faceHeight);
        } else {
            _SRPG_Window_MenuStatus_drawItemImage.call(this, index);
        }
    };

//====================================================================
// ●Window_MenuCommand
//====================================================================
    var _SRPG_Window_MenuCommand_makeCommandList = Window_MenuCommand.prototype.makeCommandList;
    Window_MenuCommand.prototype.makeCommandList = function() {       
        this.addTurnEndCommand();        
       // _SRPG_Window_MenuCommand_makeCommandList.call(this);
	   this.addCommand(APPSTRINGS.MAPMENU.cmd_list, 'unitList', true);
	   this.addCommand(APPSTRINGS.MAPMENU.cmd_conditions, 'conditions', true);
	   this.addCommand(APPSTRINGS.MAPMENU.cmd_options, 'options');
	   this.addCommand(APPSTRINGS.MAPMENU.cmd_save, 'save');
	   this.addCommand(APPSTRINGS.MAPMENU.cmd_game_end, 'gameEnd');
    };

    Window_MenuCommand.prototype.addTurnEndCommand = function() {
        this.addCommand(APPSTRINGS.MAPMENU.cmd_end_turn, 'turnEnd', true);
    };

    var _SRPG_Window_MenuCommand_isFormationEnabled = Window_MenuCommand.prototype.isFormationEnabled;
    Window_MenuCommand.prototype.isFormationEnabled = function() {
        if ($gameSystem.isSRPGMode() == true) {
            return false;
        } else {
            return _SRPG_Window_MenuCommand_isFormationEnabled.call(this);
        }
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
        this.createSrpgStatusWindow();
        this.createSrpgActorCommandStatusWindow();
        this.createSrpgTargetWindow();
        this.createSrpgPredictionWindow();
        this.createSrpgActorCommandWindow();
        this.createSrpgBattleWindow();
        this.createHelpWindow();
        this.createSkillWindow();
        
		this.createAttackWindow();
		this.createSpiritWindow();
		this.createCounterWindow();
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
		this.createDeploymentWindow();
		this.createEndTurnConfirmWindow();
		this.createDeploymentInStageWindow();
		this.createDeploySelectionWindow();
		$battleSceneManager.init();	
		//SceneManager.stop();
    };
	
	Scene_Map.prototype.createPauseWindow = function() {
		
		this._commandWindow = new Window_MenuCommand(0, 0);
		this._commandWindow.setHandler('save',      this.commandSave.bind(this));
		this._commandWindow.setHandler('gameEnd',   this.commandGameEnd.bind(this));
		this._commandWindow.setHandler('options',   this.commandOptions.bind(this));
		this._commandWindow.setHandler('cancel',    this.closePauseMenu.bind(this));
		this._commandWindow.setHandler('turnEnd',this.commandTurnEnd.bind(this));    
		this._commandWindow.setHandler('unitList',this.commandUnitList.bind(this));     
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
		SceneManager.push(Scene_Options);
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
		if($gameSystem.getActorsWithAction().length){
			$gameSystem.setSubBattlePhase('confirm_end_turn');
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
			/*if($gameTemp.isEnemyAttack){
				_this._mapSrpgBattleWindow.activate();
			} else {			
				_this._mapSrpgActorCommandWindow.activate();
			}  */
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
			/*if($gameTemp.isEnemyAttack){
				_this._mapSrpgBattleWindow.activate();
			} else {			
				_this._mapSrpgActorCommandWindow.activate();
			}  */
			if($gameTemp.mechListWindowCancelCallback){
				$gameTemp.mechListWindowCancelCallback();
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
		this._deploymentWindow = new Window_Deployment(0, 0, Graphics.boxWidth, Graphics.boxHeight);
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
			$gameSystem.setSubBattlePhase("normal");
			if(result){
				$gameTemp.setTurnEndFlag(true);
				$gameTemp.setAutoBattleFlag(false);
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
	

    // ステータスウィンドウを作る
    Scene_Map.prototype.createSrpgStatusWindow = function() {
        this._mapSrpgStatusWindow = new Window_SrpgStatus(0, 0);
        this._mapSrpgStatusWindow.x = Graphics.boxWidth - this._mapSrpgStatusWindow.windowWidth();
        this._mapSrpgStatusWindow.openness = 0;
        this.addWindow(this._mapSrpgStatusWindow);
    };

    // アクターコマンド表示時のステータスウィンドウを作る
    Scene_Map.prototype.createSrpgActorCommandStatusWindow = function() {
        this._mapSrpgActorCommandStatusWindow = new Window_SrpgActorCommandStatus(0, 0);
        this._mapSrpgActorCommandStatusWindow.x = 120;
        this._mapSrpgActorCommandStatusWindow.y = Graphics.boxHeight - this._mapSrpgActorCommandStatusWindow.windowHeight();
        this._mapSrpgActorCommandStatusWindow.openness = 0;
        this.addWindow(this._mapSrpgActorCommandStatusWindow);
    };

    // ターゲットウィンドウを作る
    Scene_Map.prototype.createSrpgTargetWindow = function() {
        this._mapSrpgTargetWindow = new Window_SrpgStatus(0, 0);
        this._mapSrpgTargetWindow.openness = 0;
        this.addWindow(this._mapSrpgTargetWindow);
    };

    // 予想ウィンドウを作る
    Scene_Map.prototype.createSrpgPredictionWindow = function() {
        this._mapSrpgPredictionWindow = new Window_SrpgPrediction(0, 0);
        this._mapSrpgPredictionWindow.y = this._mapSrpgStatusWindow.windowHeight();
        this._mapSrpgPredictionWindow.openness = 0;
        this.addWindow(this._mapSrpgPredictionWindow);
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

    // スキルウィンドウを作る
    Scene_Map.prototype.createSkillWindow = function() {
        var wy = this._helpWindow.y + this._helpWindow.height;
        var wh = Graphics.boxHeight - wy - this._mapSrpgActorCommandStatusWindow.windowHeight();
        this._skillWindow = new Window_BattleSkill(0, wy, Graphics.boxWidth, wh);
        this._skillWindow.setHelpWindow(this._helpWindow);
        this._skillWindow.setHandler('ok',     this.onSkillOk.bind(this));
        this._skillWindow.setHandler('cancel', this.onSkillCancel.bind(this));
        this.addWindow(this._skillWindow);
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
			/*if($gameTemp.isEnemyAttack){
				_this._mapSrpgBattleWindow.activate();
			} else {			
				_this._mapSrpgActorCommandWindow.activate();
			}  */
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
		_this._beforeBattleWindow = new Window_BeforeBattle(0, 0, Graphics.boxWidth, Graphics.boxHeight);		
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
	
	Scene_Map.prototype.createCounterWindow = function() {
		var wy = this._helpWindow.y + this._helpWindow.height;
		var wh = Graphics.boxHeight - wy - this._mapSrpgActorCommandStatusWindow.windowHeight();
		this._counterWindow = new Window_CounterCommand(0, wy, Graphics.boxWidth, wh);
		
		this._counterWindow.x = Math.max((Graphics.boxWidth - this._counterWindow.windowWidth()) / 2, 120) + this._mapSrpgBattleWindow.windowWidth();
        this._counterWindow.y = this._mapSrpgStatusWindow.windowHeight() + this._mapSrpgPredictionWindow.windowHeight();

		this._counterWindow.setHelpWindow(this._helpWindow);
		//this._counterWindow.setHandler('ok',     this.onAttackOk.bind(this));
		//this._attackWindow.setHandler('cancel', this.onAttackCancel.bind(this));
		//this._counterWindow.setup();
		this._counterWindow.setHandler('counter',     this.onCounterSelected.bind(this));
		this._counterWindow.setHandler('defend',     this.onDefendSelected.bind(this));
		this._counterWindow.setHandler('evade',     this.onEvadeSelected.bind(this));
		this._counterWindow.setHandler('cancel',     this.onCounterCancel.bind(this));
		this.addWindow(this._counterWindow);
    };

    // アイテムウィンドウを作る
    Scene_Map.prototype.createItemWindow = function() {
        var wy = this._helpWindow.y + this._helpWindow.height;
        var wh = Graphics.boxHeight - wy - this._mapSrpgActorCommandStatusWindow.windowHeight();
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
        var wh = Graphics.boxHeight - wy - this._mapSrpgActorCommandStatusWindow.windowHeight();
        this._abilityWindow = new Window_SRWAbilityCommand(0, wy, 200, 180);
		this._abilityWindow.x = this._mapSrpgActorCommandWindow.x - this._mapSrpgActorCommandWindow.windowWidth() + 120;
		this._abilityWindow.y = this._mapSrpgActorCommandWindow.y - this._mapSrpgActorCommandWindow.windowHeight()/2;
        //this._itemWindow.setHelpWindow(this._helpWindow);
        this._abilityWindow.setHandler('ok',     this.onAbilityOk.bind(this));
        this._abilityWindow.setHandler('cancel', this.onAbilityCancel.bind(this));
        this.addWindow(this._abilityWindow);
    };
	
	
	

    // 戦闘開始ウィンドウを作る
    Scene_Map.prototype.createSrpgBattleWindow = function() {
        this._mapSrpgBattleWindow = new Window_SrpgBattle();
        this._mapSrpgBattleWindow.x = Math.max((Graphics.boxWidth - this._mapSrpgBattleWindow.windowWidth()) / 2, 120);
        this._mapSrpgBattleWindow.y = this._mapSrpgStatusWindow.windowHeight() + this._mapSrpgPredictionWindow.windowHeight();
        this._mapSrpgBattleWindow.setHandler('battleStart', this.commandBattleStart.bind(this));
		this._mapSrpgBattleWindow.setHandler('selectCounterAction', this.selectCounterAction.bind(this));
        this._mapSrpgBattleWindow.setHandler('cancel', this.selectPreviousSrpgBattleStart.bind(this));
		
		
        this.addWindow(this._mapSrpgBattleWindow);
    };
	
	Scene_Map.prototype.createRewardsWindow = function() {
		var wy = this._helpWindow.y + this._helpWindow.height;
		var wh = Graphics.boxHeight - wy - this._mapSrpgActorCommandStatusWindow.windowHeight();
		this._rewardsWindow = new Window_Rewards(0, wy, Graphics.boxWidth, wh);
		
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
		var wy = this._helpWindow.y + this._helpWindow.height;
		var wh = Graphics.boxHeight - wy - this._mapSrpgActorCommandStatusWindow.windowHeight();
		this._levelUpWindow = new Window_LevelUp(0, wy, Graphics.boxWidth, wh);
				
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
			if($gameSystem.isSubBattlePhase() === 'process_death_queue'){
				if($gameMap.isEventRunning()){
					return;
				}
				if($gameTemp.deathQueue.length){
					_this._currentDeath = $gameTemp.deathQueue.shift();
					_this._deathTimer = 60;
					_this._startDeath = true;
					$gameSystem.setSubBattlePhase("process_death");
				} else {
					$statCalc.invalidateAbilityCache();
					_this.srpgAfterAction();
				}
				return;
			}
			
			if($gameSystem.isSubBattlePhase() === 'process_death'){
				if(_this._startDeath){
					_this._startDeath = false;
					_this._currentDeath.event.isDoingDeathAnim = true;
				}
				if(_this._deathTimer <= 0){
					_this._currentDeath.event.isUnused = true;
					//_this._currentDeath.event.erase();
					if (_this._currentDeath.actor.isActor()) {
						var oldValue = $gameVariables.value(_existActorVarID);
						$gameVariables.setValue(_existActorVarID, oldValue - 1);
						
						var oldValue = $gameVariables.value(_actorsDestroyed);
						$gameVariables.setValue(_actorsDestroyed, oldValue + 1); 
						
						if(_this._currentDeath.event.isType() == "ship"){
							var oldValue = $gameVariables.value(_existShipVarId);
							$gameVariables.setValue(_existShipVarId, oldValue - 1); 	
						}
					} else {
						var oldValue = $gameVariables.value(_existEnemyVarID);
						$gameVariables.setValue(_existEnemyVarID, oldValue - 1);
						
						var oldValue = $gameVariables.value(_enemiesDestroyed);
						$gameVariables.setValue(_enemiesDestroyed, oldValue + 1);
					}
					$gameSystem.setSubBattlePhase("process_death_queue");
				}				
				_this._deathTimer--;
				return;
			}
			
			if($gameSystem.isSubBattlePhase() === 'process_destroy_transform_queue'){
				if($gameMap.isEventRunning()){
					return;
				}
				if($gameTemp.destroyTransformQueue.length){
					_this._currentDeath = $gameTemp.destroyTransformQueue.shift();
					_this._deathTimer = 60;
					_this._startDeath = true;
					$statCalc.transformOnDestruction(_this._currentDeath.actor);
						var se = {};
						se.name = 'SRWTransform';
						se.pan = 0;
						se.pitch = 100;
						se.volume = 80;
						AudioManager.playSe(se);
					$gameSystem.setSubBattlePhase("process_destroy_transform");
				} else {
					$gameSystem.setSubBattlePhase("process_death_queue");
				}
				return;
			}
			
			if($gameSystem.isSubBattlePhase() === 'process_destroy_transform'){
				if(_this._startDeath){
					_this._startDeath = false;
				}
				if(_this._deathTimer <= 0){
					
					$gameSystem.setSubBattlePhase("process_death_queue");
				}				
				_this._deathTimer--;
				return;
			}
			
			
			if ($gameSystem.isSubBattlePhase() === 'rewards_display') {
				 if (Input.isTriggered('cancel') || Input.isTriggered('ok') || TouchInput.isCancelled() || ($gameTemp.rewardsDisplayTimer <= 0 && (Input.isLongPressed('ok') || Input.isLongPressed('cancel')))) {
					 //this._rewardsWindow.close();
					 $gameTemp.popMenu = true;	
					 this._rewardsWindow.hide();
					 this._rewardsWindow.deactivate();
					 if($gameTemp.rewardsInfo.levelResult.length){
						
						$gameSystem.setSubBattlePhase("level_up_display");
						$gameTemp.awaitingLevelUpWindow = false;
						/*this._levelUpWindow.refresh();
						this._levelUpWindow.show();
						this._levelUpWindow.activate();		*/
						
					} else {
						 //this.srpgPrepareNextAction();
					}					 
					return;
				 }
				 $gameTemp.rewardsDisplayTimer--;
			}
			if ($gameSystem.isSubBattlePhase() === 'level_up_display') {				
				if($gameTemp.awaitingLevelUpWindow){
					if (Input.isTriggered('cancel') || Input.isTriggered('ok') || TouchInput.isCancelled()|| ($gameTemp.rewardsDisplayTimer <= 0 && (Input.isLongPressed('ok') || Input.isLongPressed('cancel')))) {
						$gameTemp.popMenu = true;
						this._levelUpWindow.hide();
						this._levelUpWindow.deactivate();
						if($gameTemp.rewardsInfo.levelResult.length){
							$gameTemp.awaitingLevelUpWindow = false;
						} else {
							$gameTemp.rewardsInfo = {};					
							this.srpgPrepareNextAction();
						}						
					}
				}	

				if(!$gameTemp.awaitingLevelUpWindow){
					$gameTemp.awaitingLevelUpWindow = true;
					var currentResult = $gameTemp.rewardsInfo.levelResult.shift();
					while($gameTemp.rewardsInfo.levelResult.length && !currentResult.details.hasLevelled){
						currentResult = $gameTemp.rewardsInfo.levelResult.shift();
					}					
					if(currentResult && currentResult.details.hasLevelled){
						$gameTemp.currentLevelResult = currentResult;
						$gameTemp.rewardsDisplayTimer = 30;
						
						var se = {};
						se.name = 'SRWLevelUp';
						se.pan = 0;
						se.pitch = 100;
						se.volume = 80;
						AudioManager.playSe(se);						
						$gameTemp.pushMenu = "level_up";
					} else {
						$gameTemp.rewardsInfo = {};					
						this.srpgPrepareNextAction();
					}					
				} 
				
				$gameTemp.rewardsDisplayTimer--;
				return;
			}
            if ($gameSystem.srpgWaitMoving() == true ||
                $gameTemp.isAutoMoveDestinationValid() == true ||
                $gameSystem.isSubBattlePhase() === 'status_window' ||
                $gameSystem.isSubBattlePhase() === 'battle_window' ||
				$gameSystem.isSubBattlePhase() === 'actor_command_window' ||
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
            }			
            if ($gameSystem.isSubBattlePhase() === 'normal' && !$gameSystem.isIntermission()) {
				$gameTemp.isPostMove = false;
                if (Input.isTriggered('pageup')) {                   
                    $gameSystem.getNextLActor();
                } else if (Input.isTriggered('pagedown')) {      
                    $gameSystem.getNextRActor();
                }
            }
            if ($gameSystem.isSubBattlePhase() === 'actor_move') {
                if (Input.isTriggered('cancel') || TouchInput.isCancelled()) {
					$statCalc.invalidateAbilityCache();
                    SoundManager.playCancel();
					$gameTemp.isPostMove = false;
					$gameTemp.activeEvent().locate($gameTemp.originalPos()[0], $gameTemp.originalPos()[1]);
                    $gameSystem.setSubBattlePhase('cancel_move');
                    $gameTemp.clearMoveTable();							
					
					var battlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());					
					$gameSystem.setSrpgActorCommandWindowNeedRefresh(battlerArray);
                }
            } else if ($gameSystem.isSubBattlePhase() === 'actor_target' || $gameSystem.isSubBattlePhase() === 'actor_map_target') {
                if (Input.isTriggered('cancel') || TouchInput.isCancelled()) {
					$gameTemp.showAllyAttackIndicator = false;
					$gameTemp.showAllyDefendIndicator = false;
					$gameTemp.showEnemyAttackIndicator = false;
					$gameTemp.showEnemyDefendIndicator = false;
                    SoundManager.playCancel();
                    var event = $gameTemp.activeEvent();
                    var battlerArray = $gameSystem.EventToUnit(event.eventId());
                    $gameTemp.clearMoveTable();
					
                    /*var list = $gameTemp.moveList();
                    for (var i = 0; i < list.length; i++) {
                        var pos = list[i];
                        event.makeRangeTable(pos[0], pos[1], battlerArray[1].srpgWeaponRange(), [0], pos[0], pos[1], $dataSkills[battlerArray[1].attackSkillId()]);
                    }*/
                    $gameTemp.pushRangeListToMoveList();
                    $gameTemp.setResetMoveList(true);
                    $gameSystem.setSrpgActorCommandWindowNeedRefresh(battlerArray);
					if($gameTemp.isPostMove){
						$gameSystem.setSubBattlePhase('post_move_command_window');
						$gameTemp.initialMoveTable($gameTemp.originalPos()[0], $gameTemp.originalPos()[1], $statCalc.getCurrentMoveRange(battlerArray[1]));
						event.makeMoveTable($gameTemp.originalPos()[0], $gameTemp.originalPos()[1], $statCalc.getCurrentMoveRange(battlerArray[1]), [0], battlerArray[1]);
					} else {
						$gamePlayer.locate(event.posX(), event.posY());
						$gameSystem.setSubBattlePhase('actor_command_window');	
					}                   
                }
            } else if ($gameSystem.isSubBattlePhase() === 'actor_map_target_confirm') {
				 if (Input.isTriggered('cancel') || TouchInput.isCancelled()) {
					$gameSystem.highlightedMapRetargetTiles = [];
					$gameSystem.highlightsRefreshed = true;
					$gameTemp.mapRetargetLock = false;
                    SoundManager.playCancel();
					var event = $gameTemp.activeEvent();
					$gamePlayer.locate(event.posX(), event.posY());
					$gameSystem.setSubBattlePhase('actor_map_target');	
				 }	
			} else if ($gameSystem.isSubBattlePhase() === 'actor_target_spirit') {
                if (Input.isTriggered('cancel') || TouchInput.isCancelled()) {
					var battlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
                    SoundManager.playCancel();
					$gamePlayer.locate($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
                    $gameSystem.setSrpgActorCommandWindowNeedRefresh(battlerArray);
					$gameSystem.setSubBattlePhase("actor_command_window");                  
                }
            } else if ($gameSystem.isSubBattlePhase() === 'actor_support') {
                if (Input.isTriggered('cancel') || TouchInput.isCancelled()) {
					var battlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
                    SoundManager.playCancel();
					$gameTemp.clearMoveTable();
					$gamePlayer.locate($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
                    $gameSystem.setSrpgActorCommandWindowNeedRefresh(battlerArray);
					$gameSystem.setSubBattlePhase("actor_command_window");    
					_this._mapSrpgActorCommandWindow.activate();					
                }
            } /*else {
                _SRPG_SceneMap_updateCallMenu.call(this);
            }*/
        } else {
            _SRPG_SceneMap_updateCallMenu.call(this);
        }
    };

    // マップの更新
    var _SRPG_SceneMap_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
		var _this = this;
		
		if ($gameSystem.isSubBattlePhase() == "halt"){
			return;
		}
		
		if(this._transitioningToBattle){
			this.updateEncounterEffect();
			return;
		}
		
		if(this._loadingIntoBattle){
			this._loadingIntoBattle = false;
			
			setTimeout(function(){
				//hack to remove the black overlay of the map scene while in the battle scene
				_this.removeChild(_this._transitionBackSprite);					
			}, 500);						
			
			$gameSystem.setSubBattlePhase('halt');			
			$battleSceneManager.playBattleScene();
			//
			return;
		}
		
		
		if(!$gameSystem.isIntermission() && Input.isPressed("ok") && Input.isPressed("cancel") && Input.isPressed("pageup") && Input.isPressed("pagedown")){
			Input.clear();
			try {
				JsonEx.parse(StorageManager.load("continue"));//check if the continue slot exists first by trying to parse it
				DataManager.loadContinueSlot();
			} catch(e){
				
			}			
			return;
		}
		if($gameTemp.continueLoaded){
			$gameTemp.continueLoaded = false;
			$gameSystem.onAfterLoad();
		}
				
		if ($gameSystem.isSubBattlePhase() == "start_srpg"){
			if (!$gameMap.isEventRunning()) {
				$gameSystem.srpgStartActorTurn();
			}
		}
		
		
		if ($gameSystem.isSubBattlePhase() !== 'normal') {	
			this._summaryWindow.hide();
			this._terrainDetailsWindow.hide();
		}		
        _SRPG_SceneMap_update.call(this);
		
		if ($gameSystem.isSubBattlePhase() == "enemy_targeting_display"){
			if($gameTemp.targetingDisplayCounter <= 0){
				$statCalc.invalidateAbilityCache();
				$gameTemp.pushMenu = "before_battle";
				$gameSystem.setSubBattlePhase("enemy_attack");
			} else {
				$gameTemp.targetingDisplayCounter--;
			}
			return;
		}		
		
		if($gameTemp.OKHeld && !Input.isTriggered("ok")){
			$gameTemp.OKHeld = false;
		}
		
		
		if($gameSystem.isSubBattlePhase() == "event_spirits"){
			$gameSystem.setSubBattlePhase("event_spirits_display");
			_this.handleEventSpirits($gameTemp.eventSpirits);
			return;
		}
		
		if($gameSystem.isSubBattlePhase() == "event_spirits_display"){
			if(!$gameTemp.playingSpiritAnimations){
				$gameSystem.setSubBattlePhase("normal");
			}
			return;
		}
		
		if($gameSystem.isSubBattlePhase() == "enemy_range_display"){
			if(Input.isTriggered("cancel")){
				$gameTemp.clearMoveTable();
				$gameSystem.setSubBattlePhase("normal");
			}
			return;
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
					$gameTemp.unitAppearTimer = 15;
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
		
		if($gameSystem.isSubBattlePhase() == "event_before_battle"){
			if(!$gameMap.isEventRunning()){
				if(_this.beforeBattleEventTimer <= 0){
					this.playBattleScene();
				} else {
					_this.beforeBattleEventTimer--;
				}				
			} else {
				_this.beforeBattleEventTimer = 20;
			}
			return;
		}
		
		if($gameSystem.isIntermission()){
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
		if($gameSystem.isSubBattlePhase() === 'rearrange_deploys_init'){
			$gameSystem.setSubBattlePhase('rearrange_deploys');
			Input.update();
			if(Input.isPressed("menu") || Input.isLongPressed("menu")){
				$gameTemp.menuStillHeld = true;
			}
			$gameTemp.popMenu = true;
			return;
		}
		
		if($gameSystem.isSubBattlePhase() === 'rearrange_deploys'){
			if(Input.isTriggered("ok")){
				
				var event;// = $statCalc.activeUnitAtPosition({x: $gamePlayer.posX(), y: $gamePlayer.posY()}).event;
				var events = $gameMap.events();
				events.forEach(function(e){
					if(e.posX() == $gamePlayer.posX() && e.posY() == $gamePlayer.posY()){
						event = e;
					}
				});
				if(event && event.isType() == "actor"){				
					var slot = $gameSystem.getEventDeploySlot(event);
					var deployInfo = $gameSystem.getDeployInfo();					
					if(!deployInfo.lockedSlots[slot]){
						SoundManager.playOk();	
						if($gameTemp.currentSwapSource == -1){
							$gameTemp.currentSwapSource = slot;
							$gameTemp.currentSwapSourcePosition = {x: event.posX(), y: event.posY()};
							$gameSystem.highlightDeployTiles();
						} else {						
							var swapSource = $gameTemp.currentSwapSource;
							var selection = slot;									
							
							var sourceActor = deployInfo.assigned[swapSource];
							var targetActor = deployInfo.assigned[selection];
							
							var validPositions = (!sourceActor || $statCalc.canStandOnTile($gameActors.actor(sourceActor), {x: event.posX(), y: event.posY()})) && (!targetActor || $statCalc.canStandOnTile($gameActors.actor(targetActor), $gameTemp.currentSwapSourcePosition));
							if(validPositions){
								if(typeof sourceActor != undefined){
									deployInfo.assigned[selection] = sourceActor;
								} else {
									delete deployInfo.assigned[selection];
								}
								
								if(typeof targetActor != undefined){
									deployInfo.assigned[swapSource] = targetActor;
								} else {
									delete deployInfo.assigned[swapSource];
								}
								$gameSystem.setDeployInfo(deployInfo);
								$gameTemp.currentSwapSource = -1;
								
								$gameSystem.redeployActors();
								$gameSystem.highlightDeployTiles();
								$gameMap.setEventImages();
							} else {
								SoundManager.playBuzzer();	
							}							
						}
					} else {
						SoundManager.playBuzzer();	
					}
				}	
			}	
			
			if(!Input.isTriggered("menu")){
				$gameTemp.menuStillHeld = false;
			}
			
			if(!$gameTemp.menuStillHeld && Input.isTriggered("menu")){	
				$gameSystem.removeDeployTileHighlights();
				$gameTemp.doingManualDeploy = false;
				$gameTemp.disableHighlightGlow = false;
				$gameSystem.undeployActors();
				$gameSystem.deployActors(true, false, true);
				$gameSystem.setSubBattlePhase("start_srpg");
				
				$gameMap._interpreter.setWaitMode("enemy_appear");
				$gameTemp.enemyAppearQueueIsProcessing = true;
				$gameTemp.unitAppearTimer = 0;
			} 
			
			if(Input.isTriggered("cancel")){
				SoundManager.playCancel();	
				if($gameTemp.currentSwapSource == -1){
					$gameSystem.setDeployInfo($gameTemp.originalDeployInfo);
					$gameSystem.setSubBattlePhase("deploy_selection_window");
					$gameTemp.pushMenu = "in_stage_deploy";
					$gameSystem.undeployActors();		
				} else {								
					$gameTemp.currentSwapSource = -1;
					$gameSystem.highlightDeployTiles();
				}
			}
			return;
		}
		
		
		
		
		if ($gameSystem.isSubBattlePhase() == "auto_spirits"){
			if($gameMap._interpreter.isRunning()){
				return;
			}
			/*if($gameTemp.autoSpiritsDelay > 0){
				$gameTemp.autoSpiritsDelay--;
				return;
			}*/
			if(!_this.handlingAutoSpirits){
				_this.handlingAutoSpirits = true;
				$gameTemp.spiritWindowDoneHandler = function(){
					handleAutoSpirits()
				}	
				function handleAutoSpirits(){
					$gameTemp.popMenu = true;
					if($gameTemp.autoSpirits.length){
						$gameTemp.queuedActorEffects = [];
						var currentActor = $gameTemp.autoSpirits[0].actor;
						var remaining = [];
						$gameTemp.autoSpirits.forEach(function(autoSpirit){
							if(autoSpirit.actor == currentActor){							
								$gameTemp.spiritTargetActor = autoSpirit.actor;
								$gamePlayer.locate(autoSpirit.actor.event.posX(), autoSpirit.actor.event.posY());
								$spiritManager.applyEffect(autoSpirit.spirit, autoSpirit.actor, [autoSpirit.actor], 0);
								$gameTemp.queuedActorEffects.push({type: "spirit", parameters: {idx: autoSpirit.spirit, target: autoSpirit.actor}})
							} else {
								remaining.push(autoSpirit);
							}
						});
						
						$gameTemp.autoSpirits = remaining;
						
						
						$gameSystem.setSubBattlePhase('spirit_activation');				
						$gameTemp.pushMenu = "spirit_activation";		
					} else {
						_this.handlingAutoSpirits = false;
						if($gameTemp.AIActors.length){
							$gameSystem.setBattlePhase('AI_phase');
							$gameSystem.setSubBattlePhase('enemy_command');
						} else {			
							$gameSystem.setSubBattlePhase('initialize');
						}	
					}			
				}
				handleAutoSpirits();
			}	
			return;	
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
		if ($gameSystem.isSubBattlePhase() == "end_actor_turn"){
			if($gameTemp.eraseActorAfterTurn){
				$gameTemp.activeEvent().erase();
			}
			this.srpgPrepareNextAction();
		}
        //ステータスウィンドウの開閉
        var flag = $gameSystem.srpgStatusWindowNeedRefresh();
        if (flag[0]) {
            if (!this._mapSrpgStatusWindow.isOpen() && !this._mapSrpgStatusWindow.isOpening()) {
                this._mapSrpgStatusWindow.setBattler(flag[1]);
                this._mapSrpgStatusWindow.open();
				this._mapSrpgStatusWindow.show();
            }
        } else {
            if (this._mapSrpgStatusWindow.isOpen() && !this._mapSrpgStatusWindow.isClosing()) {
                this._mapSrpgStatusWindow.clearBattler();
                this._mapSrpgStatusWindow.close();
            }
        }
        //アクターコマンドウィンドウの開閉
		
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
        //行動アクターの簡易ステータスウィンドウの開閉
        var flag = $gameSystem.srpgActorCommandStatusWindowNeedRefresh();
        if (!flag) {
            flag = [false, null];
        }
        if (flag[0]) {
            if (!this._mapSrpgActorCommandStatusWindow.isOpen() && !this._mapSrpgActorCommandStatusWindow.isOpening()) {
                this._mapSrpgActorCommandStatusWindow.setBattler(flag[1][1]);
				this._mapSrpgActorCommandStatusWindow.show();
            }
        } else {
            if (this._mapSrpgActorCommandStatusWindow.isOpen() && !this._mapSrpgActorCommandStatusWindow.isClosing()) {
                this._mapSrpgActorCommandStatusWindow.clearBattler();
            }
        }
        //予想ウィンドウ・戦闘開始ウィンドウの開閉
        var flag = $gameSystem.srpgBattleWindowNeedRefresh();
        if (flag[0]) {
            if (_srpgPredictionWindowMode === 3) {
                this.commandBattleStart();
                return;
            }
            if (!this._mapSrpgTargetWindow.isOpen() && !this._mapSrpgTargetWindow.isOpening()) {
                this._mapSrpgTargetWindow.setBattler(flag[2]);
                this._mapSrpgTargetWindow.open();
				this._mapSrpgTargetWindow.show();
            }
            if (!this._mapSrpgPredictionWindow.isOpen() && !this._mapSrpgPredictionWindow.isOpening()) {
                this._mapSrpgPredictionWindow.setBattler(flag[1], flag[2]);
                this._mapSrpgPredictionWindow.open();
				this._mapSrpgPredictionWindow.show();
            }
            if (!this._mapSrpgBattleWindow.isOpen() && !this._mapSrpgBattleWindow.isOpening()) {
                this._mapSrpgBattleWindow.setup(flag[1]);
				this._mapSrpgBattleWindow.show();
            }
        } else {
            if (this._mapSrpgTargetWindow.isOpen() && !this._mapSrpgTargetWindow.isClosing()) {
                this._mapSrpgTargetWindow.clearBattler();
                this._mapSrpgTargetWindow.close();
            }
            if (this._mapSrpgPredictionWindow.isOpen() && !this._mapSrpgPredictionWindow.isClosing()) {
                this._mapSrpgPredictionWindow.clearBattler();
                this._mapSrpgPredictionWindow.close();
            }
            if (this._mapSrpgBattleWindow.isOpen() && !this._mapSrpgBattleWindow.isClosing()) {
                this._mapSrpgBattleWindow.clearActor();
                this._mapSrpgBattleWindow.close();
                this._mapSrpgBattleWindow.deactivate();
            }
        }
			
        
        //戦闘開始の処理
        if (this._callSrpgBattle == true && this._mapSrpgBattleWindow.isClosed()) {
            this._callSrpgBattle = false;
            SceneManager.push(Scene_Battle);
            return;
        }
        //戦闘終了後の処理
        if ($gameSystem.isSubBattlePhase() === 'after_battle') {
			
			if($gameTemp.playingBattleDemo){
				$gameSystem.setSubBattlePhase('normal');
				$gameTemp.scriptedBattleDemoId = null;
				$gameTemp.playingBattleDemo = false;
			} else {
				$gameTemp.clearMoveTable();
				this.srpgBattlerDeadAfterBattle();
			}			
            return;
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
                $gameSystem.srpgStartAutoActorTurn(); //自動行動のアクターが行動する
            } else {
                $gameSystem.setSubBattlePhase('normal');
            }
        }
        //自動アクターフェイズの処理
        if ($gameSystem.isBattlePhase() === 'auto_actor_phase') {
            if ($gameSystem.isSubBattlePhase() === 'auto_actor_command') {
                this.srpgInvokeAutoActorCommand();
                return;
            } else if ($gameSystem.isSubBattlePhase() === 'auto_actor_move') {
                this.srpgInvokeAutoActorMove();
                return;
            } else if ($gameSystem.isSubBattlePhase() === 'auto_actor_action') {
                this.srpgInvokeAutoUnitAction();
                return;
            }
        }		
		
        //エネミーフェイズの処理
        if ($gameSystem.isBattlePhase() === 'AI_phase') {
			$gameTemp.summaryUnit = null;			
			
			if ($gameSystem.isSubBattlePhase() == "rewards_display"){
				return;
			}
			if ($gameSystem.isSubBattlePhase() == "level_up_display"){
				return;
			}			
			$gameTemp.AIWaitTimer--;
			if($gameTemp.AIWaitTimer < 0){			
				if ($gameSystem.isSubBattlePhase() === 'enemy_command') {
					$gameTemp.unitHitInfo = {};
					this.srpgInvokeAICommand();					
					return;
				} else if ($gameSystem.isSubBattlePhase() === 'enemy_move') {				
					this.srpgInvokeAIMove();			
					$gameTemp.AIWaitTimer = 30;	
					return;
				} else if ($gameSystem.isSubBattlePhase() === 'enemy_action') {				
					$gamePlayer.setTransparent(false);
					this.srpgInvokeAIAction();		
					$gameTemp.AIWaitTimer = 0;	
					return;
				}
			}
        }
		
		function waitResetCursor(nextSubBattlePhase){
			$gamePlayer.locate($gameTemp.originalPos()[0], $gameTemp.originalPos()[1]);
			if($gamePlayer._realX === $gameTemp.originalPos()[0] && $gamePlayer._realY === $gameTemp.originalPos()[1]){
				$gameSystem.setSubBattlePhase(nextSubBattlePhase);				
			}
		}
		
		if ($gameSystem.isSubBattlePhase() === 'cancel_post_move') {		
			waitResetCursor("actor_move");
		}
		
		if ($gameSystem.isSubBattlePhase() === 'cancel_move') {			
			$gameTemp.activeEvent().locate($gameTemp.originalPos()[0], $gameTemp.originalPos()[1]);			
			waitResetCursor("actor_command_window");
		}	
		
		if ($gameSystem.isSubBattlePhase() === 'await_character_anim'){
			if($gameTemp.animCharacter){
				if($gameTemp.animCharacter.isAnimationPlaying()){
					return;
				} else {					
					$gameSystem.setSubBattlePhase('normal');
					$gameTemp.animCharacter = null;
				}
			}
		}
					
		if ($gameSystem.isSubBattlePhase() === 'normal') {	
			$gameTemp.activeShip = null;
			$gameTemp.actorAction = {};
			$gameTemp.enemyAction = {};
			$gameTemp.isEnemyAttack = false;
			$gameTemp.battleOccurred = false;
			$gameTemp.mapAttackOccurred = false;
			$gameTemp.supportAttackSelected = -1;
			$gameTemp.supportDefendSelected = -1;
			$gameTemp.isPostMove = false;
			$gameTemp.isHitAndAway = false;		
			$gameTemp.currentMapTargets	= [];
			$gameTemp.unitHitInfo = {};
			previousPosition = $gameTemp.previousCursorPosition || {x: -1, y: -1};
			var currentPosition = {x: $gamePlayer.posX(), y: $gamePlayer.posY()};
			$gameTemp.previousCursorPosition = currentPosition;			
		
			var summaryUnit = $statCalc.activeUnitAtPosition(currentPosition);
			if(summaryUnit){
				var previousUnit = $gameTemp.summaryUnit;
				$gameTemp.summaryUnit = summaryUnit;	
				if(!_this._summaryWindow.visible || $gameTemp.summaryUnit != previousUnit){
					_this._summaryWindow.show();
				}			

				if(!$gameTemp.commanderAuraVisible || $gameTemp.summaryUnit != previousUnit){
					
					$gameTemp.commanderAuraVisible = true;
					var commanderAuraLookup = $statCalc.getCommanderAura(summaryUnit, summaryUnit.event, commanderAuraLookup);
					$gameSystem.highlightedTiles = [];
					Object.keys(commanderAuraLookup).forEach(function(x){
						Object.keys(commanderAuraLookup[x]).forEach(function(y){
							$gameSystem.highlightedTiles.push({x: x, y: y, color: "yellow"});
						});
					});
					
					$gameSystem.highlightsRefreshed = true;
					
					if(!$gameSystem.isEnemy($gameTemp.summaryUnit)){
						$gameTemp.showAllyAttackIndicator = true;
						$gameTemp.showAllyDefendIndicator = true;
					} else {
						$gameTemp.showEnemyAttackIndicator = true;
						$gameTemp.showEnemyDefendIndicator = true;
					}
				}
				
			} else {
				_this._summaryWindow.hide();
				if($gameTemp.commanderAuraVisible){
					$gameTemp.commanderAuraVisible = false;
					$gameSystem.highlightedTiles = [];
					$gameSystem.highlightsRefreshed = true;
				}				
				
				$gameTemp.showAllyAttackIndicator = false;
				$gameTemp.showAllyDefendIndicator = false;
				$gameTemp.showEnemyAttackIndicator = false;
				$gameTemp.showEnemyDefendIndicator = false;
				
				if(Input.isTriggered('ok')){
					//if(!$gameTemp.OKHeld){
						_this.showPauseMenu();
						$gameSystem.setSubBattlePhase('pause_menu');
					//}									
				} else {
					$gameTemp.OKHeld = false;
				}
				
				if(Input.isTriggered('menu')){
					$gameSystem.showWillIndicator = !$gameSystem.showWillIndicator;
				}
				
				/*if(Input.isTriggered('cancel')){
					_this.showPauseMenu();
					$gameSystem.setSubBattlePhase('pause_menu');
				}*/
			}		
		
			var terrainDetails = $gameMap.getTilePropertiesAsObject({x: currentPosition.x, y: currentPosition.y});		
			if(terrainDetails){
				$gameTemp.terrainDetails = terrainDetails;
				if(!this._terrainDetailsWindow.visible || previousPosition.x != currentPosition.x || previousPosition.y != currentPosition.y){
					this._terrainDetailsWindow.show();
				}
			} else {
				this._terrainDetailsWindow.hide();
			}
			
			if(summaryUnit && Input.isTriggered("menu")){
				$gameTemp.detailPagesWindowCancelCallback = function(){
					$gameTemp.detailPagesWindowCancelCallback = null;
					$gameSystem.setSubBattlePhase('normal');
				};
				$gameTemp.currentMenuUnit = {
					actor: summaryUnit,
					mech: summaryUnit.SRWStats.mech
				};
				$gameSystem.setSubBattlePhase('enemy_unit_summary');
				$gameTemp.pushMenu = "detail_pages";
			}			
		}	
		
		if ($gameSystem.isSubBattlePhase() === 'actor_target' || $gameSystem.isSubBattlePhase() === 'actor_target_spirit' || $gameSystem.isSubBattlePhase() === 'actor_map_target_confirm') {
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
		
		if ($gameSystem.isSubBattlePhase() === 'pause_menu') {
			if(!$gameTemp.deactivatePauseMenu){
				this.showPauseMenu();
			}			
		}	
		
		if ($gameSystem.isSubBattlePhase() === 'map_spirit_animation') {
			if($gameTemp.mapSpiritAnimationDelay > 0){
				$gameTemp.mapSpiritAnimationDelay--;
				return;
			}
			if(!$gameTemp.mapSpiritAnimationStarted){
				$gameTemp.clearMoveTable();
				var attack;
				if($gameTemp.isEnemyAttack){
					attack = $gameTemp.enemyAction.attack;
				} else {
					attack = $gameTemp.actorAction.attack;
				}
				var spiritInfo = $spiritManager.getSpiritDisplayInfo($gameTemp.queuedEffectSpiritId).animInfo;
				
				
				$gameTemp.mapSpiritAnimationStarted = true;
				$gameTemp.mapSpiritAnimationDuration = spiritInfo.duration || 60;
				var activeEvent = $gameTemp.activeEvent();
				var eventX = activeEvent.posX();
				var eventY = activeEvent.posY();
				var spritePosition = {
					x: activeEvent.screenX(),//(eventX * $gameMap.tileWidth()) + ($gameMap.tileWidth() / 2),
					y: activeEvent.screenY() - ($gameMap.tileWidth() / 2),//(eventY * $gameMap.tileWidth()) + ($gameMap.tileWidth() / 2)
				};
				/*if(!$gameTemp.tempSprites){
					$gameTemp.tempSprites = [];
				}
				$gameTemp.tempSprites.push(new Sprite_MapEffect(spiritInfo, spritePosition));*/
				$gameTemp.animCharacter = activeEvent;
				activeEvent.requestAnimation(spiritInfo.animId);
			} else {
				if(!$gameTemp.animCharacter.isAnimationPlaying()){
					$gameTemp.animCharacter = null;
					$gameTemp.mapSpiritAnimationStarted = false;
					//_this.srpgBattlerDeadAfterBattle();
					$gameSystem.setSubBattlePhase("actor_command_window");
					$gameSystem.setSrpgActorCommandWindowNeedRefresh($gameSystem.EventToUnit($gameTemp.activeEvent().eventId()));
					this._mapSrpgActorCommandWindow.activate();	
					this._mapSrpgActorCommandWindow.show()
				}
				$gameTemp.mapSpiritAnimationDuration--;
			}				
		}
		
		function updateMapAttackTargets(tiles, attack){
			var targets = $statCalc.activeUnitsInTileRange(tiles || [], attack.ignoresFriendlies ? "enemy" : null);
			var tmp = [];
			for(var i = 0; i < targets.length; i++){
				var terrain = $statCalc.getCurrentTerrain(targets[i]);					
				var terrainRank = attack.terrain[terrain];
				if(terrainRank != "-"){
					tmp.push(targets[i]);
				}
			}
			targets = tmp;
			
			return targets;
		}
		
		
		if ($gameSystem.isSubBattlePhase() === 'actor_map_target_confirm') {
			
			var attack = $gameTemp.actorAction.attack;
			var mapAttackDef = $mapAttackManager.getDefinition(attack.mapId);
			if(mapAttackDef.retargetInfo && !$gamePlayer.isMoving()){				
				$gameTemp.mapRetargetLock = true;	
				$gameSystem.highlightedMapRetargetTiles = [];
				
				var deltaX = $gamePlayer.posX() - mapAttackDef.retargetInfo.center.x;
				var deltaY = $gamePlayer.posY() - mapAttackDef.retargetInfo.center.y;
				var tileCoordinates = JSON.parse(JSON.stringify(mapAttackDef.retargetInfo.shape));
				
				for(var i = 0; i < tileCoordinates.length; i++){
					tileCoordinates[i][0]+=deltaX;
					tileCoordinates[i][1]+=deltaY;

					$gameSystem.highlightedMapRetargetTiles.push({x: tileCoordinates[i][0], y: tileCoordinates[i][1], color: "white"});
					$gameSystem.highlightsRefreshed = true;					
				}				
				
				$gameTemp.currentMapReTargetTiles = JSON.parse(JSON.stringify(tileCoordinates));
				
				var targets = updateMapAttackTargets($gameTemp.currentMapReTargetTiles || [], attack);
				
				$gameTemp.currentMapTargets = targets;				
			}			
			
			if(Input.isTriggered("ok")){// && !$gameTemp.OKHeld	
				$gameTemp.mapRetargetLock = false;
				if(!mapAttackDef.retargetInfo){
					$gameTemp.clearMoveTable();	
					$gameTemp.setResetMoveList(true);
					_this.mapAttackStart();
				} else {
					var targets = updateMapAttackTargets($gameTemp.currentMapReTargetTiles, attack);
					if(targets.length){
						$gameTemp.currentMapTargets = targets;
						/*var targetEvent = targets[0].event;
						if(targetEvent){
							$gamePlayer.locate(targetEvent.posX(), targetEvent.posY());
						}*/
						$gameSystem.highlightedMapRetargetTiles = [];
						$gameSystem.highlightsRefreshed = true;	
						_this.mapAttackStart();
					}
				}				
			}		
		}	
		
		
		if ($gameSystem.isSubBattlePhase() === 'actor_map_target') {
			
			var attack = $gameTemp.actorAction.attack;
			var mapAttackDef = $mapAttackManager.getDefinition(attack.mapId);
			if(Input.isTriggered("ok")){// && !$gameTemp.OKHeld						
				if(!mapAttackDef.retargetInfo){					
					var targets = updateMapAttackTargets($gameTemp.currentMapTargetTiles, attack);
					if(targets.length){
						$gameTemp.currentMapTargets = targets;
						var targetEvent = targets[0].event;
						if(targetEvent){
							$gamePlayer.locate(targetEvent.posX(), targetEvent.posY());
						}
						$gameSystem.setSubBattlePhase('actor_map_target_confirm');
					}
				} else {
					var x = mapAttackDef.retargetInfo.initialPosition.x;
					var y = mapAttackDef.retargetInfo.initialPosition.y;
					var adjusted = this.getAdjustedMapAttackCoordinates([[x, y]], $gameTemp.mapTargetDirection);
					$gamePlayer.locate($gameTemp.activeEvent().posX() + adjusted[0][0], $gameTemp.activeEvent().posY() + adjusted[0][1]);
					$gameSystem.setSubBattlePhase('actor_map_target_confirm');
				}								
			} else {	
				
				var tileCoordinates = mapAttackDef.shape;
				if(!mapAttackDef.lockRotation){						
					if(Input.isTriggered("up")){
						$gameTemp.mapTargetDirection = "up";
					} else if(Input.isTriggered("down")){
						$gameTemp.mapTargetDirection = "down";
					} else if(Input.isTriggered("left")){
						$gameTemp.mapTargetDirection = "left";
					} else if(Input.isTriggered("right")){
						$gameTemp.mapTargetDirection = "right";
					}
				} else {
					$gameTemp.mapTargetDirection = "right";
				}
				var deltaX = $gameTemp.activeEvent().posX();
				var deltaY = $gameTemp.activeEvent().posY();
				
				
				var direction = $gameTemp.mapTargetDirection;
				
				tileCoordinates = this.getAdjustedMapAttackCoordinates(tileCoordinates, direction);
				
				$gameTemp.clearMoveTable();	
				$gameTemp.setResetMoveList(true);
				for(var i = 0; i < tileCoordinates.length; i++){
					tileCoordinates[i].push(true); //is attack range
					tileCoordinates[i][0]+=deltaX;
					tileCoordinates[i][1]+=deltaY;
					$gameTemp.pushMoveList(tileCoordinates[i]);					
				}							
				$gameTemp.currentMapTargetTiles = JSON.parse(JSON.stringify(tileCoordinates));										
			}	
		}	
		
		if ($gameSystem.isSubBattlePhase() === 'before_enemy_map_animation') {
			if($gameTemp.mapAttackRetargetDelay > 0){
				$gameTemp.mapAttackRetargetDelay--;
				return;
			}
			
			if($gameTemp.showBeforeEnemyMapAnimation){
				$gameTemp.showBeforeEnemyMapAnimation = false;
				var bestMapAttack = $gameTemp.enemyMapAttackDef;
				if(bestMapAttack.bestPosition){
					var mapAttackDef = $mapAttackManager.getDefinition(bestMapAttack.attack.mapId);
					$gamePlayer.locate(bestMapAttack.bestPosition.x, bestMapAttack.bestPosition.y);
					
					$gameSystem.highlightedMapRetargetTiles = [];
					
					var deltaX = bestMapAttack.bestPosition.x - mapAttackDef.retargetInfo.center.x;
					var deltaY = bestMapAttack.bestPosition.y - mapAttackDef.retargetInfo.center.y;
					var tileCoordinates = JSON.parse(JSON.stringify(mapAttackDef.retargetInfo.shape));
					
					for(var i = 0; i < tileCoordinates.length; i++){
						tileCoordinates[i][0]+=deltaX;
						tileCoordinates[i][1]+=deltaY;

						$gameSystem.highlightedMapRetargetTiles.push({x: tileCoordinates[i][0], y: tileCoordinates[i][1], color: "white"});
						$gameSystem.highlightsRefreshed = true;					
					}				
					
					$gameTemp.currentMapReTargetTiles = JSON.parse(JSON.stringify(tileCoordinates));	
					
					$gameTemp.showingEnemyMapRetarget = true;
					$gameTemp.enemyMapRetargetTimer = 30;						
				} else {
					$gameSystem.setSubBattlePhase('map_attack_animation');
				}				
			}
			
			if($gameTemp.showingEnemyMapRetarget){
				if($gameTemp.enemyMapRetargetTimer < 0){
					$gameTemp.showingEnemyMapRetarget = false;
					$gameSystem.setSubBattlePhase('map_attack_animation');
					$gameTemp.mapAttackAnimationDelay = 30;
				} 				
				$gameTemp.enemyMapRetargetTimer--;
			}
			
			return;
		}
		
		
		if ($gameSystem.isSubBattlePhase() === 'map_attack_animation') {
			if($gameTemp.mapAttackAnimationDelay > 0){
				$gameTemp.mapAttackAnimationDelay--;
				return;
			}
			$gameSystem.highlightedMapRetargetTiles = [];
			$gameSystem.highlightsRefreshed = true;	
			
			if(!$gameTemp.mapAttackAnimationStarted){
				$songManager.playBattleSong($gameTemp.currentBattleActor);
				$gameTemp.clearMoveTable();
				var attack;
				if($gameTemp.isEnemyAttack){
					attack = $gameTemp.enemyAction.attack;
				} else {
					attack = $gameTemp.actorAction.attack;
				}
				var mapAttackDef = $mapAttackManager.getDefinition(attack.mapId);
				$gameTemp.mapAttackAnimationStarted = true;
				$gameTemp.mapAttackAnimationDuration = mapAttackDef.animInfo.duration || 60;
				
				var textInfo = mapAttackDef.textInfo;
				if(textInfo){
					$gameMap._interpreter.showMapAttackText(textInfo.faceName, textInfo.faceIdx, textInfo.text);
				}	
				$gameTemp.mapAttackAnimationPlaying = false;			
				
			} else {
				if(!$gameMap._interpreter.updateWaitMode()){
					if(!$gameTemp.mapAttackAnimationPlaying){
						$gameTemp.mapAttackAnimationPlaying = true;
						var attack;
						if($gameTemp.isEnemyAttack){
							attack = $gameTemp.enemyAction.attack;
						} else {
							attack = $gameTemp.actorAction.attack;
						}
						var mapAttackDef = $mapAttackManager.getDefinition(attack.mapId);
						
						var options = JSON.parse(JSON.stringify(mapAttackDef.animInfo));					
						
						var activeEvent;
						if(!mapAttackDef.retargetInfo){
							activeEvent = $gameTemp.activeEvent();
							options.direction = $gameTemp.mapTargetDirection;
						} else {
							activeEvent = $gamePlayer;
							options.direction = "up";
							options.offset = {up: options.offset};
						}
						
						
						/*var eventX = activeEvent.posX();
						var eventY = activeEvent.posY();
						var spritePosition;

						if(!mapAttackDef.retargetInfo){
							spritePosition = {
								x: $gamePlayer.screenX(),//(eventX * $gameMap.tileWidth()) + ($gameMap.tileWidth() / 2),
								y: $gamePlayer.screenY() - ($gameMap.tileWidth() / 2),//(eventY * $gameMap.tileWidth()) + ($gameMap.tileWidth() / 2)
							};
						} else 	{
							spritePosition = {
								x: activeEvent.screenX(),//(eventX * $gameMap.tileWidth()) + ($gameMap.tileWidth() / 2),
								y: activeEvent.screenY() - ($gameMap.tileWidth() / 2),//(eventY * $gameMap.tileWidth()) + ($gameMap.tileWidth() / 2)
							};
						}*/
						/*if(!$gameTemp.tempSprites){
							$gameTemp.tempSprites = [];
						}
						if(mapAttackDef.animInfo.se){
							var se = {};
							se.name = mapAttackDef.animInfo.se;
							se.pan = 0;
							se.pitch = 100;
							se.volume = 90;
							AudioManager.playSe(se);
						}
						$gameTemp.tempSprites.push(new Sprite_MapAttack(mapAttackDef.animInfo, spritePosition));*/
						
						
						$gameTemp.animCharacter = activeEvent;
					
						activeEvent.requestAnimation(mapAttackDef.animInfo.animId, options);
					} else if(!$gameTemp.awaitingMapAttackAnim){
						if(!$gameTemp.animCharacter.isAnimationPlaying()){
							$gameTemp.afterMapAttackAnimationDelay = 30;
							$gameTemp.awaitingMapAttackAnim = true;
						}
					}					
				}				
			} 

			if($gameTemp.awaitingMapAttackAnim){
				if($gameTemp.afterMapAttackAnimationDelay < 0){
					$gameTemp.animCharacter = null;
					$gameTemp.mapAttackAnimationStarted = false;
					$gameTemp.awaitingMapAttackAnim = false;
					//_this.srpgBattlerDeadAfterBattle();
					_this.startMapAttackResultDisplay();
				}		
				$gameTemp.afterMapAttackAnimationDelay--;	
			}				
		}		
		
		if ($gameSystem.isSubBattlePhase() === 'process_map_attack_queue') {
			if(!$gameTemp.processingMapAttackEffect){
				$gameTemp.processingMapAttackEffect = true;
				if($gameTemp.mapAttackEffectQueue.length){
					var effect = $gameTemp.mapAttackEffectQueue.shift();
					var target = effect.parameters.target;
					var event = target.event;					
					
					$gamePlayer.locate(event.posX(), event.posY());
					$gameTemp.queuedActorEffects = [effect];			
					$gameTemp.spiritTargetActor	= target;
					$gameTemp.spiritWindowDoneHandler = function(){						
						$gameTemp.processingMapAttackEffect = false;
					}	
					if(!$gameTemp.battleEffectWindowIsOpen){
						$gameTemp.battleEffectWindowIsOpen = true;
						$gameTemp.pushMenu = "spirit_activation";
					}
					_this._spiritAnimWindow.show();
						
				} else {
					$gamePlayer.locate($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
					_this.srpgBattlerDeadAfterBattle();
					$gameTemp.popMenu = true;
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
					$gameTemp.deathQueue.push({actor: battleEffect.ref, event: battleEffect.ref.event});
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
				gainResults.push({actor: $gameActors.actor(id), expGain: 0, ppGain: battleEffect.ppGain});
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
		function applyStatusConditions(attacker, defender){
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
						applyStatusConditions(battleEffect.attackedBy.ref, battleEffect.ref);
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
						
						applyStatusConditions(battleEffect.ref, battleEffect.attacked.ref);
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
        if ($gameSystem.isBattlePhase() === 'actor_phase' || $gameSystem.isBattlePhase() === 'auto_actor_phase') {
            this.eventUnitEvent();
        }
        $gameTemp.clearActiveEvent();
        if ($gameSystem.isBattlePhase() === 'actor_phase') {
            if (this.isSrpgActorTurnEnd()) {
                $gameSystem.srpgStartAutoActorTurn(); //自動行動のアクターが行動する
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
			if($gameTemp.isEnemyAttack){
				_this._mapSrpgBattleWindow.activate();
			} else {			
				_this._mapSrpgActorCommandWindow.activate();
			} 
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
		$statCalc.transform($gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1]);
		$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
		$gameSystem.setSubBattlePhase('normal');
		var se = {};
		se.name = 'SRWTransform';
		se.pan = 0;
		se.pitch = 100;
		se.volume = 80;
		AudioManager.playSe(se);
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
			//var event = $gameTemp.activeEvent();
			//event.locate($gameTemp.originalPos()[0], $gameTemp.originalPos()[1]);
		} else {
			$gameSystem.setSubBattlePhase('normal');
		}        
    };

    //スキルコマンド・決定
    Scene_Map.prototype.onSkillOk = function() {
        var skill = this._skillWindow.item();
        var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
        actor.action(0).setSkill(skill.id);
        this._skillWindow.hide();
        this.startActorTargeting();
    };

    //スキルコマンド・キャンセル
    Scene_Map.prototype.onSkillCancel = function() {
        this._skillWindow.hide();
        this._mapSrpgActorCommandWindow.activate();
    };
	
	Scene_Map.prototype.onAttackOk = function() {
        var weapon = this._attackWindow.item();
		$gameTemp.actorAction.type = "attack";  
		$gameTemp.actorAction.attack = weapon;       
        this._attackWindow.hide();		
		if($gameTemp.isEnemyAttack){
			this._mapSrpgPredictionWindow.refresh();
			this._mapSrpgBattleWindow.refresh();
			this._mapSrpgBattleWindow.activate();
		} else {			
			
			this.startActorTargeting();
		}           
    };	
	
	Scene_Map.prototype.onAttackCancel = function() {
		this._attackWindow.hide();
		if($gameTemp.isEnemyAttack){
			this._mapSrpgBattleWindow.activate();
		} else {			
			this._mapSrpgActorCommandWindow.activate();
		}        
    };
	
	Scene_Map.prototype.onCounterSelected = function() {
        this._counterWindow.hide();
        $gameTemp.actorAction.type = "attack";
		/*
		this._attackWindow.setActor($gameTemp.currentBattleActor);
        this._attackWindow.setStypeId(this._mapSrpgActorCommandWindow.currentExt());
        this._attackWindow.refresh();
        this._attackWindow.show();
        this._attackWindow.activate();*/
	
		$gameTemp.currentMenuUnit = {
			actor: $gameTemp.currentBattleActor,
			mech: $gameTemp.currentBattleActor.SRWStats.mech
		};
		$gameTemp.pushMenu = "attack_list";
    };
	
	Scene_Map.prototype.onDefendSelected = function() {
        this._counterWindow.hide();
        $gameTemp.actorAction.type = "defend";
		this._mapSrpgPredictionWindow.refresh();
		this._mapSrpgBattleWindow.refresh();
		this._mapSrpgBattleWindow.activate();
    };
	
	Scene_Map.prototype.onEvadeSelected = function() {
        this._counterWindow.hide();
        $gameTemp.actorAction.type = "evade";
		this._mapSrpgPredictionWindow.refresh();
		this._mapSrpgBattleWindow.refresh();
		this._mapSrpgBattleWindow.activate();
    };
	
	Scene_Map.prototype.onCounterCancel = function() {
        this._counterWindow.hide();
		this._mapSrpgPredictionWindow.refresh();
		this._mapSrpgBattleWindow.refresh();
		this._mapSrpgBattleWindow.activate();
    };
    //アイテムコマンド・決定
    Scene_Map.prototype.onItemOk = function() {
        var item = this._itemWindow.item();
        var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
        actor.action(0).setItem(item.id);
        this._itemWindow.hide();
        this.startActorTargeting();
    };
	
	Scene_Map.prototype.onConsumableOk = function() {
        var item = this._itemWindow.item();		
        var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		$statCalc.setConsumableUsed(actor, item.listIdx);
        $itemEffectManager.applyConsumable(actor, item.itemIdx);
        this._itemWindow.hide();
		this._mapSrpgActorCommandWindow.setup(actor);
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
	
	Scene_Map.prototype.onAbilityCancel = function() {
        this._abilityWindow.hide();
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
			$gameSystem.setSubBattlePhase('actor_map_target');
		} else {
			var range = $statCalc.getRealWeaponRange(battler, weapon);
			var minRange = $statCalc.getRealWeaponMinRange(battler, weapon);
			
			this.setUpAttackRange(event.posX(), event.posY(), range, minRange);
			
			$gameSystem.clearSrpgActorCommandWindowNeedRefresh();
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
		this._mapSrpgBattleWindow.hide();
		this._mapSrpgPredictionWindow.hide();
		this._mapSrpgTargetWindow.hide();      
		this._mapSrpgActorCommandStatusWindow.hide();	
		this._mapSrpgStatusWindow.hide();		
        $gameSystem.clearSrpgStatusWindowNeedRefresh();
        $gameSystem.clearSrpgBattleWindowNeedRefresh();
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
			$gameSystem.clearSrpgActorCommandStatusWindowNeedRefresh(battlerArray);
			$gameSystem.clearSrpgStatusWindowNeedRefresh();
			$gameSystem.clearSrpgBattleWindowNeedRefresh();
			$gameTemp.setSrpgDistance(0);
			$gameTemp.setSrpgSpecialRange(true);
			$gameTemp.clearTargetEvent();
			$gameSystem.setSubBattlePhase('actor_target');
		} else {
			this._mapSrpgBattleWindow.activate();
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
                $gameSystem.srpgStartAutoActorTurn(); //自動行動のアクターが行動する
            } else {
                $gameSystem.setSubBattlePhase('normal');
            }
        } else if ($gameSystem.isBattlePhase() === 'auto_actor_phase') {
            $gameSystem.setSubBattlePhase('auto_actor_command');
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
		$gameTemp.AIWaitTimer = 45;
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
						optimalPos = this.srpgSearchOptimalPos({x: targetInfo.target.posX(), y: targetInfo.target.posY()}, enemy, type, fullRange.range || -1, minRange);
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

    // 最適移動位置の探索
    Scene_Map.prototype.srpgSearchOptimalPos = function(targetCoords, battler, type, range, minRange) {
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
		
		
		
		
		var pathfindingGrid = [];
		for(var i = 0; i < $gameMap.width(); i++){
			pathfindingGrid[i] = [];
			for(var j = 0; j < $gameMap.height(); j++){
				pathfindingGrid[i][j] = ((occupiedPositions[i] && occupiedPositions[i][j]) || !$statCalc.canStandOnTile(battler, {x: i, y: j})) ? 0 : 1;
			}
		}
		
		var targetDist = minRange || 1;
		var currentBestDist = -1;
		var improves = true;
		var path = [];
		var bestPath = [];
		var targetTileCounter = 0;
		
		while(currentBestDist != targetDist && targetTileCounter < list.length){
			var graph = new Graph(pathfindingGrid);
			var startNode = graph.grid[battler.event.posX()][battler.event.posY()];
			var endNode = graph.grid[targetCoords.x][targetCoords.y];
			
			path = astar.search(graph, startNode, endNode, {closest: true});
			if(path.length){		
				var closestValidNode = null;
				var ctr = path.length-1;
				while(ctr >= 0 && !closestValidNode){
					var node = path[ctr];
					var deltaX = Math.abs(targetCoords.x - node.x);
					var deltaY = Math.abs(targetCoords.y - node.y);
					var dist = Math.hypot(deltaX, deltaY);			
					
					if(dist >= targetDist && isValidSpace({x: node.x, y: node.y})){
						closestValidNode = node;
					} else {
						pathfindingGrid[node.x][node.y] = 0;
					}
					ctr--;
				}			
				
				var deltaX = Math.abs(targetCoords.x - node.x);
				var deltaY = Math.abs(targetCoords.y - node.y);
				var dist = Math.hypot(deltaX, deltaY);
				
				if(currentBestDist != -1 && currentBestDist >= targetDist && currentBestDist <= dist){
					improves = false;				
				} else {
					bestPath = path;
					currentBestDist = dist;
				}				
			} else {
				improves = false;
			}
			targetTileCounter++;
		}	

		if(bestPath){
			path = bestPath;
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
			return [targetCoords.x, targetCoords.y];
		}
		
		if(!isValidSpace({x: resultPos[0], y: resultPos[1]})){
			return [targetCoords.x, targetCoords.y];
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
		$gameTemp.supportDefendSelected = supporterSelected;
		
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
		
		var supporterInfo = [];
		var supporterSelected = -1;
		var bestDamage = 0;
		for(var i = 0; i < supporters.length; i++){
			var weaponResult = $battleCalc.getBestWeaponAndDamage(supporters[i], actorInfo);
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
		//this.preBattleSetDirection();
		//this._callSrpgBattle = true;
		this.eventBeforeBattle();
		/*
		$gameSystem.setSubBattlePhase('battle_basic');
		$gameTemp.pushMenu = "battle_basic";
		*/
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
		
		$songManager.playBattleSong($gameTemp.currentBattleActor, $gameTemp.currentBattleEnemy);
    };
	
Scene_Gameover.prototype.gotoTitle = function() {
	$gameTemp.intermissionPending = true;
	$SRWSaveManager.lockMapSRPoint($gameMap.mapId());	
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
			this._commandWindow.y = 100;
			this._commandWindow.x = 800;
        }
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
// ●BattleManager
//====================================================================
    //初期化
    var _SRPG_BattleManager_initMembers = BattleManager.initMembers;
    BattleManager.initMembers = function() {
        _SRPG_BattleManager_initMembers.call(this);
        this._srpgBattleStatusWindowLeft = null;
        this._srpgBattleStatusWindowRight = null;
        this._srpgBattleResultWindow = null;
    };

    //ステータスウィンドウのセット
    BattleManager.setSrpgBattleStatusWindow = function(left, right) {
        this._srpgBattleStatusWindowLeft = left;
        this._srpgBattleStatusWindowRight = right;
    };

    //ステータスウィンドウのリフレッシュ
    var _SRPG_BattleManager_refreshStatus = BattleManager.refreshStatus;
    BattleManager.refreshStatus = function() {
        if ($gameSystem.isSRPGMode() == true) {
            this._srpgBattleStatusWindowLeft.refresh();
            this._srpgBattleStatusWindowRight.refresh();
        } else {
            _SRPG_BattleManager_refreshStatus.call(this);
        }
    };

    //リザルトウィンドウのセット
    BattleManager.setSrpgBattleResultWindow = function(window) {
        this._srpgBattleResultWindow = window;
    };

    //戦闘開始
    var _SRPG_BattleManager_startBattle = BattleManager.startBattle;
    BattleManager.startBattle = function() {
        if ($gameSystem.isSRPGMode() == true) {
            this._phase = 'start';
            $gameSystem.onBattleStart();
            $gameParty.onBattleStart();
            $gameTroop.onBattleStart();
        } else {
            _SRPG_BattleManager_startBattle.call(this);
        }
    };

    //入力開始
    var _SRPG_BattleManager_startInput = BattleManager.startInput;
    BattleManager.startInput = function() {
        if ($gameSystem.isSRPGMode() == true) {
            //this.clearActor();
            this.startTurn();
        } else {
            _SRPG_BattleManager_startInput.call(this);
        }
    };

    //入力開始
    var _SRPG_BattleManager_invokeAction = BattleManager.invokeAction;
    BattleManager.invokeAction = function(subject, target) {
        if ($gameSystem.isSRPGMode() == true) {
            this._logWindow.push('pushBaseLine');
            if (Math.random() < this._action.itemCnt(target)) {
                var attackSkill = $dataSkills[target.attackSkillId()]
                if (target.canUse(attackSkill) == true) {
                    this.invokeCounterAttack(subject, target);
                } else {
                    this.invokeNormalAction(subject, target);
                }
            } else if (Math.random() < this._action.itemMrf(target)) {
                this.invokeMagicReflection(subject, target);
            } else {
                this.invokeNormalAction(subject, target);
            }
            subject.setLastTarget(target);
            this._logWindow.push('popBaseLine');
            this.refreshStatus();
        } else {
            _SRPG_BattleManager_invokeAction.call(this, subject, target);
        }
    };

    //戦闘終了のチェック（SRPG戦闘では無効化する）
    var _SRPG_BattleManager_checkBattleEnd = BattleManager.checkBattleEnd;
    BattleManager.checkBattleEnd = function() {
        if ($gameSystem.isSRPGMode() == false) {
            return _SRPG_BattleManager_checkBattleEnd.call(this);
        } else {
            return false;
        }
    };

    var _SRPG_BattleManager_checkAbort = BattleManager.checkAbort;
    BattleManager.checkAbort = function() {
        if ($gameSystem.isSRPGMode() == false) {
            return _SRPG_BattleManager_checkAbort.call(this);
        } else {
            if (this.isAborting()) {
                this.processAbort();
                return true;
            }
            return false;
        }
    };

    var _SRPG_BattleManager_checkAbort2 = BattleManager.checkAbort2;
    BattleManager.checkAbort2 = function() {
        if ($gameSystem.isSRPGMode() == false) {
            return _SRPG_BattleManager_checkAbort2.call(this);
        } else {
            if (this.isAborting()) {
                SoundManager.playEscape();
                this._escaped = true;
                this.processAbort();
            }
            return false;
        }
    };

    //ターン終了時の処理
    var _SRPG_BattleManager_endTurn = BattleManager.endTurn;
    BattleManager.endTurn = function() {
        if ($gameSystem.isSRPGMode() == true) {
            this._phase = 'battleEnd';
            this._preemptive = false;
            this._surprise = false;
            this.refreshStatus();
            if (this._phase) {
				this.endBattle(3);
                /*if ($gameParty.battleMembers()[0] && $gameParty.battleMembers()[0].isAlive()) {
                    this.processSrpgVictory();
                } else {
                    this.endBattle(3);
                }*/
            }
        } else {
            _SRPG_BattleManager_endTurn.call(this);
        }
    };

    //戦闘終了の処理（勝利）
    BattleManager.processSrpgVictory = function() {
        /*if ($gameTroop.members()[0] && $gameTroop.isAllDead()) {
            $gameParty.performVictory();
        }
        this.makeRewards();
        this._srpgBattleResultWindow.setRewards(this._rewards);
        var se = {};
        se.name = 'Item3';
        se.pan = 0;
        se.pitch = 100;
        se.volume = 90;
        AudioManager.playSe(se);
        this._srpgBattleResultWindow.open();
        this.gainRewards();*/
    };

    //経験値の入手
    var _SRPG_BattleManager_gainExp = BattleManager.gainExp;
    BattleManager.gainExp = function() {
        /*if ($gameSystem.isSRPGMode() == true) {
            var exp = this._rewards.exp;
            $gameParty.battleMembers()[0].gainExp(exp);
        } else {
            _SRPG_BattleManager_gainExp.call(this);
        }*/
    };

    //戦闘終了の処理（共通）
    var _SRPG_BattleManager_endBattle = BattleManager.endBattle;
    BattleManager.endBattle = function(result) {
        _SRPG_BattleManager_endBattle.call(this, result);
        if (this._srpgBattleResultWindow) {
            this._srpgBattleResultWindow.close();
        }
        this.replayBgmAndBgs();
        $gameSystem.setSubBattlePhase('after_battle');
    };

    //戦闘終了処理のアップデート
    var _SRPG_BattleManager_updateBattleEnd = BattleManager.updateBattleEnd;
    BattleManager.updateBattleEnd = function() {
        if ($gameSystem.isSRPGMode() == true) {
            if ($gameSystem.isSubBattlePhase() === 'after_battle') {
                SceneManager.pop();
                this._phase = null;
            } else if (this._srpgBattleResultWindow.isChangeExp() == false &&
                (Input.isPressed('ok') || TouchInput.isPressed())) {
                this.endBattle(3);
            }
        } else {
            _SRPG_BattleManager_updateBattleEnd.call(this);
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



	//A window that lists the attacks a unit can use based on its class
	/*function Window_AttackList(){
		this.initialize.apply(this, arguments);
		this.select(0);
	}

	Window_AttackList.prototype = Object.create(Window_SkillList.prototype);
	Window_AttackList.prototype.constructor = Window_AttackList;

	Window_AttackList.prototype.makeItemList = function() {
		var items = [];
		if (this._actor) {
			items = this._actor.SRWStats.mech.weapons;
		}
		this._data = items;
	};

	Window_AttackList.prototype.drawItem = function(index) {
		var weapon = this._data[index];
		if (weapon) {
			var costWidth = this.costWidth();
			var rect = this.itemRect(index);
			rect.width -= this.textPadding();
			this.changePaintOpacity(this.isEnabled(weapon));
			this.drawText(weapon.name, rect.x, rect.y, rect.width - costWidth);
			//this.drawSkillCost(skill, rect.x, rect.y, rect.width);
			this.changePaintOpacity(1);
		}
	};

	Window_AttackList.prototype.maxCols = function() {
		return 1;
	};

	Window_AttackList.prototype.isEnabled = function(item) {
		if(!$gameTemp.isPostMove || item.postMoveEnabled || $statCalc.getActiveSpirits(this._actor).charge){
			if($statCalc.canUseWeapon(this._actor, item)){
				return true;
			} else {
				return false;
			}		
		} else {
			return false;
		}   
	};*/

	//A window that lists the counter/evade/defend options for the player when counter attacking
	function Window_CounterCommand(){
		this.initialize.apply(this, arguments);
	}

	Window_CounterCommand.prototype = Object.create(Window_Command.prototype);
	Window_CounterCommand.prototype.constructor = Window_CounterCommand;

	Window_CounterCommand.prototype.initialize = function() {
		Window_Command.prototype.initialize.call(this, 0, 0);
		this._actor = null;
		this._item = null;
		this.openness = 0;
		this.setup();
		this.hide();
		this.deactivate();
	};

	Window_CounterCommand.prototype.makeCommandList = function() {  
		this.addCommand("Counter", 'counter');	
		this.addCommand("Defend", 'defend');
		this.addCommand("Evade", 'evade');
	};

	Window_CounterCommand.prototype.setup = function(actorArray) {
		this.clearCommandList();
		this.makeCommandList();
		this.refresh();
		this.activate();
		this.open();
	};

	Window_CounterCommand.prototype.maxCols = function() {
		return 1;
	};

	Window_CounterCommand.prototype.windowHeight = function() {
		return this.fittingHeight(3);
	};
	
	
	Window_Base.prototype.drawSectionRect = function(x, y, w, h, margin, color) {
		var lineWidth = 1;
		x+=margin;
		y+=margin;
		w-=2*margin;
		h-=2*margin;
		//top
		this.contents.fillRect(x ,y, w, lineWidth, color);
		//bottom
		this.contents.fillRect(x, y + h, w + lineWidth, lineWidth, color);
		//left
		this.contents.fillRect(x ,y, lineWidth, h, color);
		//right
		this.contents.fillRect(x + w, y, lineWidth, h, color);
	}
	
	Window_Base.prototype.drawRect = function(x, y, w, h, margin, color) {
		x+=margin;
		y+=margin;
		w-=2*margin;
		h-=2*margin;
		this.contents.fillRect(x ,y, w, h, color);
	}
	
	Window_Base.prototype.windowInnerWidth = function() {
        return this.windowWidth() - 38;
    };
	
	Window_Base.prototype.setFontSize = function(size) {
        this.contents.fontSize = size;
    };
	
	Window_Base.prototype.setItalic = function(state) {
        this.contents.fontItalic = state;
    };
	
	Window_Base.prototype.centerTextOffset = function(text, containerWidth) {
        return containerWidth / 2 - this.textWidth(text) / 2;
    };
	
	
	
	function Window_SRWItemBattle() {
		this._parent = Window_BattleItem.prototype;
		this.initialize.apply(this, arguments);	
    }

    Window_SRWItemBattle.prototype = Object.create(Window_BattleItem.prototype);
    Window_SRWItemBattle.prototype.constructor = Window_SRWItemBattle;
	
	Window_SRWItemBattle.prototype.maxCols = function(){
		return 1;
	}
	
	Window_SRWItemBattle.prototype.windowWidth = function() {
        return 240;
    };

    Window_SRWItemBattle.prototype.windowHeight = function() {
        return this.fittingHeight(4);
    };
	
	Window_SRWItemBattle.prototype.refresh = function(){
		this._parent.refresh.call(this);
	}
	
	Window_SRWItemBattle.prototype.drawItem = function(index) {
		var item = this._data[index];
		if (item) {
			item = $itemEffectManager.getAbilityDisplayInfo(item.itemIdx);
			var numberWidth = 0;//this.numberWidth();
			var rect = this.itemRect(index);
			//rect.width -= this.textPadding();
			this.drawItemName(item, rect.x, rect.y, rect.width - numberWidth);
		}
	};
	
	Window_SRWItemBattle.prototype.drawItemName = function(item, x, y, width) {
		width = width || 312;
		if (item) {
			this.resetTextColor();
			this.drawText(item.name, x + 10, y, width - 20);
		}
	};
	
	Window_SRWItemBattle.prototype.makeItemList = function() {
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		this._data = $statCalc.getConsumables(actor);
	};
	
	Window_SRWItemBattle.prototype.isEnabled = function(item) {
		return true;
	};	
	
	function Window_SRWAbilityCommand() {
		this._parent = Window_BattleItem.prototype;
		this.initialize.apply(this, arguments);	
    }

    Window_SRWAbilityCommand.prototype = Object.create(Window_BattleItem.prototype);
    Window_SRWAbilityCommand.prototype.constructor = Window_SRWAbilityCommand;
	
	Window_SRWAbilityCommand.prototype.maxCols = function(){
		return 1;
	}
	
	Window_SRWAbilityCommand.prototype.windowWidth = function() {
        return 240;
    };

    Window_SRWAbilityCommand.prototype.windowHeight = function() {
        return this.fittingHeight(4);
    };
	
	Window_SRWAbilityCommand.prototype.refresh = function(){
		this._parent.refresh.call(this);
	}
	
	Window_SRWAbilityCommand.prototype.drawItem = function(index) {
		var item = this._data[index];
		if (item != null) {
			item = $abilityCommandManger.getAbilityDisplayInfo(item);
			var numberWidth = 0;//this.numberWidth();
			var rect = this.itemRect(index);
			//rect.width -= this.textPadding();
			this.drawItemName(item, rect.x, rect.y, rect.width - numberWidth);
		}
	};
	
	Window_SRWAbilityCommand.prototype.drawItemName = function(item, x, y, width) {
		width = width || 312;
		if (item) {
			this.resetTextColor();
			this.drawText(item.name, x + 10, y, width - 20);
		}
	};
	
	Window_SRWAbilityCommand.prototype.makeItemList = function() {
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		this._data = $statCalc.getAbilityCommands(actor);
	};
	
	Window_SRWAbilityCommand.prototype.isEnabled = function(item) {
		return true;
	};	
	
	
	
	
	
	function Window_StageInfo() {
		this.initialize.apply(this, arguments);
	}

	Window_StageInfo.prototype = Object.create(Window_Base.prototype);
	Window_StageInfo.prototype.constructor = Window_StageInfo;

	Window_StageInfo.prototype.initialize = function(x, y) {
		var width = this.windowWidth();
		var height = this.windowHeight();
		Window_Base.prototype.initialize.call(this, x, y, width, height);
		this.refresh();
	};

	Window_StageInfo.prototype.windowWidth = function() {
		return 240;
	};

	Window_StageInfo.prototype.windowHeight = function() {
		return this.fittingHeight(4);
	};

	Window_StageInfo.prototype.refresh = function() {
		var lineheight = 35;
		var columnOffset = 95;
		var x = 5;
		var y = 0;
		var width = this.contents.width - this.textPadding() * 2;
		this.contents.clear();
		this.changeTextColor("#FFFFFF");
		//this.drawCurrencyValue(this.value(), this.currencyUnit(), x, 0, width);
		this.drawText(APPSTRINGS.MAPMENU.label_funds, x, 0, width);
		this.drawText(this.value(), x + columnOffset , 0, width);
		
		this.drawText(APPSTRINGS.MAPMENU.label_turn, x,  lineheight, width);
		/*--text-color-highlight: #f9e343;	
	 	--text-color-highlight2: #43dbf9;	*/
		this.changeTextColor("#43dbf9");
		this.drawText($gameVariables.value(_turnVarID), x + columnOffset, lineheight, width);
		this.changeTextColor("#FFFFFF");
		this.drawText(APPSTRINGS.MAPMENU.label_enemy, x,  lineheight * 2, width);
		this.changeTextColor("#AA2222");
		this.drawText($gameVariables.value(_enemiesDestroyed), x + columnOffset,  lineheight * 2, width);
		this.changeTextColor("#FFFFFF");
		this.drawText("/", x + columnOffset + 30,  lineheight * 2, width);
		this.changeTextColor("#43dbf9");
		this.drawText($gameVariables.value(_enemiesDestroyed) + $gameVariables.value(_existEnemyVarID), x + columnOffset + 45,  lineheight * 2, width);
		this.changeTextColor("#FFFFFF");
		
		this.drawText(APPSTRINGS.MAPMENU.label_ally, x,  lineheight * 3, width);
		this.changeTextColor("#AA2222");
		this.drawText($gameVariables.value(_actorsDestroyed), x + columnOffset,  lineheight * 3, width);
		this.changeTextColor("#FFFFFF");
		this.drawText("/", x + columnOffset + 30,  lineheight * 3, width);
		this.changeTextColor("#43dbf9");
		this.drawText($gameVariables.value(_actorsDestroyed) + $gameVariables.value(_existActorVarID), x + columnOffset + 45,  lineheight * 3, width);
		this.changeTextColor("#FFFFFF");
		
	};

	Window_StageInfo.prototype.value = function() {
		return $gameParty.gold();
	};

	Window_StageInfo.prototype.currencyUnit = function() {
		return TextManager.currencyUnit;
	};

	Window_StageInfo.prototype.open = function() {
		this.refresh();
		Window_Base.prototype.open.call(this);
	};
	
	
	function Window_ConditionsInfo() {
		this.initialize.apply(this, arguments);
	}

	Window_ConditionsInfo.prototype = Object.create(Window_Base.prototype);
	Window_ConditionsInfo.prototype.constructor = Window_ConditionsInfo;

	Window_ConditionsInfo.prototype.initialize = function(x, y) {
		var width = this.windowWidth();
		var height = this.windowHeight();
		Window_Base.prototype.initialize.call(this, x, y, width, height);
		this.refresh();
	};

	Window_ConditionsInfo.prototype.windowWidth = function() {
		return 760;
	};

	Window_ConditionsInfo.prototype.windowHeight = function() {
		return this.fittingHeight(6);
	};

	Window_ConditionsInfo.prototype.refresh = function() {
		var lineheight = 35;
		var columnOffset = 95;
		var x = 5;
		var y = 0;
		var width = this.contents.width - this.textPadding() * 2;
		this.contents.clear();
		this.changeTextColor("#FFFFFF");
		//this.drawCurrencyValue(this.value(), this.currencyUnit(), x, 0, width);
		/*$gameMessage.add(APPSTRINGS.GENERAL.label_victory_condition + ": "+$gameVariables.value(_victoryConditionText));
		$gameMessage.add(APPSTRINGS.GENERAL.label_defeat_condition + ": "+$gameVariables.value(_defeatConditionText));
		$gameMessage.add(APPSTRINGS.GENERAL.label_mastery_condition + ": "+$gameVariables.value(_masteryConditionText));*/
		/*--text-color-highlight: #f9e343;	
	 	--text-color-highlight2: #43dbf9;	*/
		
		
		this.changeTextColor("#43dbf9");
		this.drawText(APPSTRINGS.GENERAL.label_victory_condition, x, 0, width);
		
		this.drawText(APPSTRINGS.GENERAL.label_defeat_condition, x, lineheight * 2, width);
		
		this.drawText(APPSTRINGS.GENERAL.label_mastery_condition, x, lineheight * 4, width);
		
		this.changeTextColor("#FFFFFF");
		
		var valueOffset = 20;
		this.drawText($gameVariables.value(_victoryConditionText) || "", x + valueOffset, lineheight, width - valueOffset);
		
		this.drawText($gameVariables.value(_defeatConditionText) || "", x + valueOffset, lineheight * 3, width - valueOffset);
		
		var masteryText = $gameVariables.value(_masteryConditionText);
		if($SRWSaveManager.isMapSRPointLocked($gameMap.mapId())){
			masteryText = APPSTRINGS.GENERAL.label_mastery_locked;
		}
		this.drawText(masteryText || "", x + valueOffset, lineheight * 5, width - valueOffset);
		/*
		this.drawText(APPSTRINGS.MAPMENU.label_funds, x, 0, width);
		this.drawText(this.value(), x + columnOffset , 0, width);
		
		this.drawText(APPSTRINGS.MAPMENU.label_turn, x,  lineheight, width);
		
		this.changeTextColor("#43dbf9");
		this.drawText($gameVariables.value(_turnVarID), x + columnOffset, lineheight, width);
		this.changeTextColor("#FFFFFF");
		this.drawText(APPSTRINGS.MAPMENU.label_enemy, x,  lineheight * 2, width);
		this.changeTextColor("#AA2222");
		this.drawText($gameVariables.value(_enemiesDestroyed), x + columnOffset,  lineheight * 2, width);
		this.changeTextColor("#FFFFFF");
		this.drawText("/", x + columnOffset + 30,  lineheight * 2, width);
		this.changeTextColor("#43dbf9");
		this.drawText($gameVariables.value(_enemiesDestroyed) + $gameVariables.value(_existEnemyVarID), x + columnOffset + 45,  lineheight * 2, width);
		this.changeTextColor("#FFFFFF");
		
		this.drawText(APPSTRINGS.MAPMENU.label_ally, x,  lineheight * 3, width);
		this.changeTextColor("#AA2222");
		this.drawText($gameVariables.value(_actorsDestroyed), x + columnOffset,  lineheight * 3, width);
		this.changeTextColor("#FFFFFF");
		this.drawText("/", x + columnOffset + 30,  lineheight * 3, width);
		this.changeTextColor("#43dbf9");
		this.drawText($gameVariables.value(_actorsDestroyed) + $gameVariables.value(_existActorVarID), x + columnOffset + 45,  lineheight * 3, width);
		this.changeTextColor("#FFFFFF");*/
		
	};

	Window_ConditionsInfo.prototype.value = function() {
		return $gameParty.gold();
	};

	Window_ConditionsInfo.prototype.currencyUnit = function() {
		return TextManager.currencyUnit;
	};

	Window_ConditionsInfo.prototype.open = function() {
		this.refresh();
		Window_Base.prototype.open.call(this);
	};
	
//====================================================================
// Save Management
//====================================================================	
	DataManager.makeSavefileInfo = function() {
		var info = {};
		info.globalId   = this._globalId;
		info.title      = $gameSystem.saveDisplayName || $dataSystem.gameTitle;
		info.characters = $gameParty.charactersForSavefile();
		info.faces      = $gameParty.facesForSavefile();
		info.playtime   = $gameSystem.playtimeText();
		info.timestamp  = Date.now();
		info.funds = $gameParty.gold();
		info.SRCount = $SRWSaveManager.getSRCount();
		info.turnCount =  $gameVariables.value(_turnCountVariable)
		return info;
	};
	
	DataManager.saveContinueSlot = function() {
		var savefileId = "continue";
		$gameSystem.onBeforeSave();
		var json = JsonEx.stringify({date: Date.now(), content: this.makeSaveContents()});		
		StorageManager.save(savefileId, json);
		return true;
	};
	
	DataManager.loadContinueSlot = function() {
		try{
			var savefileId = "continue";
			var globalInfo = this.loadGlobalInfo();		
			var json = StorageManager.load(savefileId);
			this.createGameObjects();
			this.extractSaveContents(JsonEx.parse(json).content);
			$statCalc.softRefreshUnits();
			SceneManager._scene.fadeOutAll()
			SceneManager.goto(Scene_Map);
			if($gameSystem._bgmOnSave){
				$gameTemp.continueLoaded = true;
			}			
		} catch(e){
			console.log("Attempted to load non existant continue save!");
		}		
		return true;		
	};
	
	DataManager.latestSavefileDate = function() {
		var globalInfo = this.loadGlobalInfo();
		var savefileId = 1;
		var timestamp = 0;
		if (globalInfo) {
			for (var i = 1; i < globalInfo.length; i++) {
				if (this.isThisGameFile(i) && globalInfo[i].timestamp > timestamp) {
					timestamp = globalInfo[i].timestamp;
					savefileId = i;
				}
			}
		}
		return timestamp;
	};
	
	Window_SavefileList.prototype.drawItem = function(index) {
		var id = index + 1;
		var valid = DataManager.isThisGameFile(id);
		var info = DataManager.loadSavefileInfo(id);
		var rect = this.itemRectForText(index);
		this.resetTextColor();
		if (this._mode === 'load') {
			this.changePaintOpacity(valid);
		}
		this.drawFileId(id, rect.x, rect.y);
		if (info) {
			this.changePaintOpacity(valid);
			this.drawContents(info, rect, valid);
			this.changePaintOpacity(true);
		}
	};
	
	Window_SavefileList.prototype.drawContents = function(info, rect, valid) {
		var bottom = rect.y + rect.height;
		if (rect.width >= 420) {
			this.drawGameTitle(info, rect.x + 192, rect.y, rect.width - 192);
			if (valid) {
				this.drawPartyCharacters(info, rect.x + 220, bottom - 4);
			}
		}
		var lineHeight = this.lineHeight();
		var y2 = bottom - lineHeight;
		if (y2 >= lineHeight) {
			this.drawPlaytime(info, rect.x, y2, rect.width);
		}
		var offSetX = 20;
		var bottomOffset = 54;
		if(info.funds != null){
			this.drawText(APPSTRINGS.SAVEMENU.label_funds+": "+info.funds, offSetX + rect.x, bottom - bottomOffset, 240);
		}
		if(info.funds != null){
			this.drawText(APPSTRINGS.SAVEMENU.label_SR_count+": "+info.SRCount, offSetX + rect.x + 240, bottom - bottomOffset, 240);
		}
		if(info.funds != null){
			this.drawText(APPSTRINGS.SAVEMENU.label_turn_count+": "+info.turnCount, offSetX + rect.x + 480, bottom - bottomOffset, 240);
		}		
	};
	
	Window_Options.prototype.addGeneralOptions = function() {
		this.addCommand(APPSTRINGS.GENERAL.label_dash_pref, 'alwaysDash');
		//this.addCommand(TextManager.commandRemember, 'commandRemember');
	};
		
})();

