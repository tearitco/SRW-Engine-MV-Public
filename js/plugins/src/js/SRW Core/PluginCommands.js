	export default {
		patches: patches,
	} 
	
	function patches(){};
	
	patches.apply = function(){
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
				
				var event = $statCalc.getReferenceEvent($gameActors.actor(actorId));
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
				deployInfo.assignedSub = {};
				deployInfo.assignedShips = {};
				deployInfo.lockedSlots = {};
				deployInfo.lockedShipSlots = {};
				$gameSystem.setDeployInfo(deployInfo);
			}
			
			if (command === 'populateDeployList') {
				$gameSystem.constructDeployList();
			}
			
			if (command === 'setDeployCount') {
				var deployInfo = $gameSystem.getDeployInfo();
				deployInfo.count = args[0];
				$gameSystem.setDeployInfo(deployInfo);
			}
			
			if (command === 'setShipDeployCount') {
				var deployInfo = $gameSystem.getDeployInfo();
				deployInfo.shipCount = args[0];
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
			
			if (command === 'assignSlotSub') {
				//args[0]: slot 
				//args[1]: actor id
				var deployInfo = $gameSystem.getDeployInfo();
				var actorId = args[1];
				var parts = actorId.match(/\<(.*)\>/);	
				if(parts && parts.length > 1){
					actorId = $gameVariables.value(parts[1]);
				}
				deployInfo.assignedSub[args[0]] = actorId;
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
			
			if (command === 'lockShipDeploySlot') {
				//prevents a slot from being changed by the player in the menu, assignSlot can still override
				var deployInfo = $gameSystem.getDeployInfo();
				deployInfo.lockedShipSlots[args[0]] = true;
				$gameSystem.setDeployInfo(deployInfo);
			}
			
			if (command === 'unlockShipDeploySlot') {
				var deployInfo = $gameSystem.getDeployInfo();
				deployInfo.lockedShipSlots[args[0]] = false;
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
			
			if (command === 'resetRegionAttributes') {			
				if(!$gameSystem.regionAttributes){
					$gameSystem.regionAttributes = {};
				}	
				delete $gameSystem.regionAttributes[args[0] * 1];
			}
			
			if (command === 'addRegionAttributes') {
				if(!$gameSystem.regionAttributes){
					$gameSystem.regionAttributes = {};
				}
				$gameSystem.regionAttributes[args[0] * 1] = {
					defense: args[1] * 1,
					evasion: args[2] * 1,
					hp_regen: args[3] * 1, 
					en_regen: args[4] * 1
				};
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
				var deployInfo = $gameSystem.getDeployInfo();
				var deployList = $gameSystem.getShipDeployList();			
				var activeDeployList = [];
				for(var i = 0; i < deployInfo.shipCount; i++){
					activeDeployList.push(deployList[i]);
				}
				$gameSystem.setActiveShipDeployList(activeDeployList);
				$gameSystem.deployShips(args[0]);					
			}
			
			if (command === 'deployAll') {
				var deployInfo = $gameSystem.getDeployInfo();
				var deployList = $gameSystem.getDeployList();
				var activeDeployList = [];
				for(var i = 0; i < deployInfo.count; i++){
					activeDeployList.push(deployList[i]);
				}
				$gameSystem.setActiveDeployList(activeDeployList);
				$gameSystem.deployActors(args[0], "all");
			}
			
			if (command === 'deployAllLocked') {
				$gameSystem.deployActors(args[0], "locked");
			}
			
			if (command === 'deployAllUnLocked') {
				$gameSystem.deployActors(args[0], "unlocked");
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
					$gameSystem.deployActor(actor_unit, event, args[2] * 1, args[3]);
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
					$gameSystem.deployActor(actor_unit, $gameMap.event(eventId), args[1], deployInfo.assignedSub[slot]);
				}			
			}
			
			if (command === 'redeployActor') {
				$gameSystem.redeployActor(args[0], args[1] * 1);			
			}
			
			if (command === 'moveEventToPoint') {
				$gameMap._interpreter.setWaitMode("move_to_point");
				$gameSystem.setSrpgWaitMoving(true);
				var event = $gameMap.event(args[0]);
				if(event){
					var position = $statCalc.getAdjacentFreeSpace({x: args[1], y: args[2]}, null, null, {x: event.posX(), y: event.posY()});
					event.srpgMoveToPoint(position, true, true);
					if(args[3] * 1){
						$gamePlayer.locate(event.posX(), event.posY());
						$gameTemp.followMove = true;
					}			
				}
			}
			
			if (command === 'moveActorToPoint') {
				$gameMap._interpreter.setWaitMode("move_to_point");
				$gameSystem.setSrpgWaitMoving(true);
				var event = $statCalc.getReferenceEvent($gameActors.actor(args[0]));
				if(event){
					var position = $statCalc.getAdjacentFreeSpace({x: args[1], y: args[2]}, null, null, {x: event.posX(), y: event.posY()});
					event.srpgMoveToPoint(position, true, true);
					if(args[3] * 1){
						$gamePlayer.locate(event.posX(), event.posY());
						$gameTemp.followMove = true;
					}	
				}					
			}
			
			if (command === 'moveEventToEvent') {
				$gameMap._interpreter.setWaitMode("move_to_point");
				$gameSystem.setSrpgWaitMoving(true);
				var targetEvent = $gameMap.event(args[1]);
				var event = $gameMap.event(args[0]);
				if(event && targetEvent){
					var position = $statCalc.getAdjacentFreeSpace({x: targetEvent.posX(), y: targetEvent.posY()}, null, null, {x: event.posX(), y: event.posY()});
					event.srpgMoveToPoint(position, true, true);
					if(args[2] * 1){
						$gamePlayer.locate(event.posX(), event.posY());
						$gameTemp.followMove = true;
					}			
				}
			}
			
			if (command === 'moveActorToEvent') {
				$gameMap._interpreter.setWaitMode("move_to_point");
				$gameSystem.setSrpgWaitMoving(true);
				var targetEvent = $gameMap.event(args[1]);
				var event = $statCalc.getReferenceEvent($gameActors.actor(args[0]));
				if(event && targetEvent){
					var position = $statCalc.getAdjacentFreeSpace({x: targetEvent.posX(), y: targetEvent.posY()}, null, null, {x: event.posX(), y: event.posY()});
					event.srpgMoveToPoint(position, true, true);
					if(args[2] * 1){
						$gamePlayer.locate(event.posX(), event.posY());
						$gameTemp.followMove = true;
					}
				}						
			}
			
			if (command === 'moveEventToActor') {
				$gameMap._interpreter.setWaitMode("move_to_point");
				$gameSystem.setSrpgWaitMoving(true);
				var targetEvent = $statCalc.getReferenceEvent($gameActors.actor(args[1]));
				var event = $gameMap.event(args[0]);
				if(event && targetEvent){
					var position = $statCalc.getAdjacentFreeSpace({x: targetEvent.posX(), y: targetEvent.posY()}, null, null, {x: event.posX(), y: event.posY()});
					event.srpgMoveToPoint(position, true, true);
					if(args[2] * 1){
						$gamePlayer.locate(event.posX(), event.posY());
						$gameTemp.followMove = true;
					}			
				}
			}
			
			if (command === 'moveActorToActor') {
				$gameMap._interpreter.setWaitMode("move_to_point");
				$gameSystem.setSrpgWaitMoving(true);
				var targetEvent = $statCalc.getReferenceEvent($gameActors.actor(args[1]));
				var event = $statCalc.getReferenceEvent($gameActors.actor(args[0]));
				if(event && targetEvent){
					var position = $statCalc.getAdjacentFreeSpace({x: targetEvent.posX(), y: targetEvent.posY()}, null, null, {x: event.posX(), y: event.posY()});
					event.srpgMoveToPoint(position, true, true);
					if(args[2] * 1){
						$gamePlayer.locate(event.posX(), event.posY());
						$gameTemp.followMove = true;
					}
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
				/*if(actor.isSubTwin){
					var main = $statCalc.getMainTwin(actor);
					$statCalc.swap(main, true);
				}*/
				$statCalc.transform(actor, args[1], true);
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
				/*if(actor.isSubTwin){
					var main = $statCalc.getMainTwin(actor);
					$statCalc.swap(main, true);
				}*/
				$statCalc.transform(actor, args[1], true, args[2]);
				var se = {};
				se.name = 'SRWTransform';
				se.pan = 0;
				se.pitch = 100;
				se.volume = 80;
				AudioManager.playSe(se);
			}

			if (command === 'transformActorDirect') {
				var actor = $gameActors.actor(args[0]);
				/*if(actor.isSubTwin){
					var main = $statCalc.getMainTwin(actor);
					$statCalc.swap(main, true);
				}*/
				$statCalc.transform(actor, 0, true, args[1]);
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
			
			if (command === 'separateActor') {
				var actor = $gameActors.actor(args[0]);
				if(actor.isSubTwin){
					actor = $statCalc.getMainTwin(actor);
				}
				if(actor.subTwin || actor.isSubTwin){
					$statCalc.separate(actor, true);
				}			
			}
			
			if (command === 'makeActorMainTwin') {
				var actor = $gameActors.actor(args[0]);
				if(actor.isSubTwin){
					actor = $statCalc.getMainTwin(actor);
					$statCalc.swap(actor, true);
				}			
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
			
			if (command === 'setEventAttackAction') {	
				var actor = $gameSystem.EventToUnit(args[0])[1];
				actor.attackBehavior = args[1];
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
				$gameSystem.lockTransformation(args[0], args[1]);
			}
			
			if (command === 'lockAllTransformations') {	
				$gameSystem.lockAllTransformations();
			}
			
			if (command === 'unlockTransformation') {	
				$gameSystem.unlockTransformation(args[0], args[1]);
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
			
			if (command === 'setPilotAbilityUpgrade') {	
				$pilotAbilityManager.setUpgrade(args[0], args[1]);
			}
			
			if (command === 'setMechAbilityUpgrade') {	
				$mechAbilityManager.setUpgrade(args[0], args[1]);
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
			
			if (command === 'clearTile') {
				var position = {x: args[0], y: args[1]};
				var actor = $statCalc.activeUnitAtPosition(position);
				if(actor){
					var newPosition = $statCalc.getAdjacentFreeSpace(position);
					var event = $statCalc.getReferenceEvent(actor);
					var actorId = -1;
					if(actor.isActor()){
						actorId = actor.actorId();
					}
					if(event.eventId() != args[2] && actorId != args[3]){
						event.locate(newPosition.x, newPosition.y);
					}				
				}
			}
			
			function clearAdjacentToTile(position, includeDiagonal){
				var positions  = [];
				positions.push({position: {x: position.x - 1, y: position.y}, biasPosition:{x: position.x - 2, y: position.y}});
				positions.push({position: {x: position.x + 1, y: position.y}, biasPosition:{x: position.x + 2, y: position.y}});
				positions.push({position: {x: position.x, y: position.y + 1}, biasPosition:{x: position.x, y: position.y + 2}});
				positions.push({position: {x: position.x, y: position.y - 1}, biasPosition:{x: position.x, y: position.y - 2}});
				
				if(includeDiagonal){
					positions.push({position: {x: position.x - 1, y: position.y - 1}, biasPosition:{x: position.x - 2, y: position.y - 2}});
					positions.push({position: {x: position.x + 1, y: position.y + 1}, biasPosition:{x: position.x + 2, y: position.y + 2}});
					positions.push({position: {x: position.x - 1, y: position.y + 1}, biasPosition:{x: position.x - 2, y: position.y + 2}});
					positions.push({position: {x: position.x + 1, y: position.y - 1}, biasPosition:{x: position.x + 2, y: position.y - 2}});
				}
				
				var usedPositions = {};
				positions.forEach(function(currentInfo){				
					var actor = $statCalc.activeUnitAtPosition(currentInfo.position);
					if(actor){
						var newPosition = $statCalc.getAdjacentFreeSpace(currentInfo.position, null, null, currentInfo.biasPosition, true, usedPositions);
						if(!usedPositions[newPosition.x]){
							usedPositions[newPosition.x] = {};
						}
						if(!usedPositions[newPosition.x][newPosition.y]){
							usedPositions[newPosition.x][newPosition.y] = true;
						}
						var event = $statCalc.getReferenceEvent(actor);
						var actorId = -1;					
						event.locate(newPosition.x, newPosition.y);								
					}
				});	
			}
			
			if (command === 'clearAdjacentToTile') {
				clearAdjacentToTile({x: args[0] * 1, y: args[1] * 1}, args[2] * 1);
			}
			
			if (command === 'clearAdjacentToEvent') {
				var event = $gameMap.event(args[0]);
				if(event){
					clearAdjacentToTile({x: event.posX(), y:  event.posY()}, args[1] * 1);
				}			
			}
			
			if (command === 'clearAdjacentToActor') {
				var event = $statCalc.getReferenceEvent($gameActors.actor(args[0]));
				if(event){
					clearAdjacentToTile({x: event.posX(), y:  event.posY()}, args[1] * 1);
				}			
			}
			if (command === 'stopSkipping') {
				//exists purely to manually ensure A+Start skipping stops at the point the command is called.
			}
		};	
	}