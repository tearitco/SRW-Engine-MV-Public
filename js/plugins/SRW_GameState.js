function GameState(){
	this.allowedActions = {
		cursor: false,
		menu: false,
		summaries: false
	};
}

GameState.prototype.update = function(scene){
	return true;
}

GameState.prototype.updateTriggerAction = function(cursor){
	return false;
}

GameState.prototype.updateMapEvent = function(x, y, triggers){
	return false;
}

GameState.prototype.canCursorMove = function(){
	return this.allowedActions.cursor;
}

GameState.prototype.canUseMenu = function(){
	return this.allowedActions.menu;
}

GameState.prototype.canShowSummaries = function(){
	return this.allowedActions.summaries;
}

function GameStateManager(){
	var _this = this;
	this._currentState = "";
	this._stateClassMapping = {
		actor_command_window: "GameState_actor_command_window", //OK
		actor_map_target: "GameState_actor_map_target", //OK
		actor_map_target_confirm: "GameState_actor_map_target_confirm", //OK
		actor_move: "GameState_actor_move", //OK
		actor_support: "GameState_actor_support", //OK
		actor_target: "GameState_actor_target", //OK
		actor_target_spirit: "GameState_actor_target_spirit", //OK
		after_battle: "GameState_after_battle", //OK
		//auto_actor_action: "GameState_auto_actor_action",
		//auto_actor_move: "GameState_auto_actor_move",
		auto_spirits: "GameState_auto_spirits",
		await_character_anim: "GameState_await_character_anim",
		battle_basic: "GameState_battle_basic",
		battle_window: "GameState_battle_window",
		before_enemy_map_animation: "GameState_before_enemy_map_animation",
		cancel_move: "GameState_cancel_move",
		cancel_post_move: "GameState_cancel_post_move",
		confirm_boarding: "GameState_confirm_boarding",
		confirm_end_turn: "GameState_confirm_end_turn",
		end_actor_turn: "GameState_end_actor_turn",
		enemy_action: "GameState_enemy_action",
		enemy_attack: "GameState_enemy_attack",
		enemy_command: "GameState_enemy_command",
		enemy_move: "GameState_enemy_move",
		enemy_range_display: "GameState_enemy_range_display",
		enemy_targeting_display: "GameState_enemy_targeting_display",
		enemy_unit_summary: "GameState_enemy_unit_summary",
		event_before_battle: "GameState_event_before_battle",
		event_spirits: "GameState_event_spirits",
		event_spirits_display: "GameState_event_spirits_display",
		halt: "GameState_halt",
		initialize: "GameState_initialize",
		invoke_action: "GameState_invoke_action",
		level_up_display: "GameState_level_up_display",
		map_attack_animation: "GameState_map_attack_animation",
		map_spirit_animation: "GameState_map_spirit_animation",
		normal: "GameState_normal",
		pause_menu: "GameState_pause_menu",
		post_move_command_window: "GameState_post_move_command_window",
		process_death: "GameState_process_death",
		process_death_queue: "GameState_process_death_queue",
		process_destroy_transform: "GameState_process_destroy_transform",
		process_destroy_transform_queue: "GameState_process_destroy_transform_queue",
		process_map_attack_queue: "GameState_process_map_attack_queue",
		rearrange_deploys: "GameState_rearrange_deploys",
		rearrange_deploys_init: "GameState_rearrange_deploys_init",
		rewards_display: "GameState_rewards_display",
		select_deploy_position: "GameState_select_deploy_position",
		spirit_activation: "GameState_spirit_activation",
		start_srpg: "GameState_start_srpg",
		status_window: "GameState_status_window",
		twin_selection: "GameState_twin_selection",	
	};
	this._stateObjMapping = {};
	Object.keys(_this._stateClassMapping).forEach(function(stateId){
		var className = _this._stateClassMapping[stateId];
		if(window[className]){
			_this._stateObjMapping[stateId] = new window[className]();
		}
	});
}

GameStateManager.prototype.getActiveStateName = function(){
	return this._currentState;
}

GameStateManager.prototype.getActiveState = function(){
	return this._stateObjMapping[this._currentState];
}

GameStateManager.prototype.update = function(scene){
	if(this._stateObjMapping[this._currentState]){
		return this._stateObjMapping[this._currentState].update(scene);
	} else {
		return true;
	}
}

GameStateManager.prototype.updateTriggerAction = function(cursor){
	if(this._stateObjMapping[this._currentState]){
		return this._stateObjMapping[this._currentState].updateTriggerAction(cursor);
	} else {
		return true;
	}
}

GameStateManager.prototype.updateMapEvent = function(x, y, triggers){
	if(this._stateObjMapping[this._currentState]){
		return this._stateObjMapping[this._currentState].updateMapEvent(x, y, triggers);
	} else {
		return true;
	}
}

GameStateManager.prototype.canCursorMove = function(){
	if(this._stateObjMapping[this._currentState]){
		return this._stateObjMapping[this._currentState].canCursorMove();
	} else {
		return true;
	}
}

GameStateManager.prototype.canUseMenu = function(){
	if(this._stateObjMapping[this._currentState]){
		return this._stateObjMapping[this._currentState].canUseMenu();
	} else {
		return true;
	}
}

GameStateManager.prototype.canShowSummaries = function(){
	if(this._stateObjMapping[this._currentState]){
		return this._stateObjMapping[this._currentState].canShowSummaries();
	} else {
		return false;
	}
}

GameStateManager.prototype.requestNewState = function(state){
	if(this._stateObjMapping[state]){
		this._currentState = state;
	} else {
		//while transitioning to the new system allow the stage manager to be left on an empty state
		this._currentState = null;
		//throw("Invalid game state requested!")
	}	
}

/*State implementations*/

function GameState_actor_command_window(){
	GameState.call(this);
}

GameState_actor_command_window.prototype = Object.create(GameState.prototype);
GameState_actor_command_window.prototype.constructor = GameState_actor_command_window;

function GameState_actor_move(){
	GameState.call(this);
	this.allowedActions = {
		cursor: true,
		menu: false,
		summaries: false
	};
}

GameState_actor_move.prototype = Object.create(GameState.prototype);
GameState_actor_move.prototype.constructor = GameState_actor_move;

GameState_actor_move.prototype.update = function(){
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
	return true;
}

GameState_actor_move.prototype.updateTriggerAction = function(cursor){
	if (Input.isTriggered('ok') || TouchInput.isTriggered()) {
		var list = $gameTemp.moveList();
		for (var i = 0; i < list.length; i++) {
			var pos = list[i];
			if (pos[2] == false && pos[0] == cursor._x && pos[1] == cursor._y) {
				var target = $statCalc.activeUnitAtPosition({x: cursor._x, y: cursor._y}, "actor");	
				var initiator = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
				
				if(!$statCalc.isEssential(initiator) && !$gameTemp.activeShip && $statCalc.isShip(target) && $gameTemp.activeEvent().eventId() != target.event.eventId()){
					SoundManager.playOk();
					var battlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
					battlerArray[1].srpgMakeNewActions();
					$gameSystem.setSrpgActorCommandWindowNeedRefresh(battlerArray);
					$gameSystem.setSubBattlePhase('confirm_boarding');
					$gameTemp.targetShip = {position: {x: cursor._x, y: cursor._y}, actor: target};
				} else if ($statCalc.isFreeSpace({x: cursor._x, y: cursor._y})) {
					SoundManager.playOk();

				   // var route = $gameTemp.MoveTable(pos[0], pos[1])[1];
					var event = $gameTemp.activeEvent();
					$gameSystem.setSrpgWaitMoving(true);
					event.srpgMoveToPoint({x: cursor._x, y: cursor._y});
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
}

//unused

function GameState_select_deploy_position(){
	GameState.call(this);
	this.allowedActions = {
		cursor: true,
		menu: false,
		summaries: false
	};
}

GameState_select_deploy_position.prototype = Object.create(GameState.prototype);
GameState_select_deploy_position.prototype.constructor = GameState_select_deploy_position;

GameState_select_deploy_position.prototype.updateTriggerAction = function(cursor){
	if (Input.isTriggered('ok') || TouchInput.isTriggered()) {   					
		if ($statCalc.isFreeSpace({x: cursor._x, y: cursor._y}) && $statCalc.canStandOnTile($gameTemp.actorToDeploy, {x: cursor._x, y: cursor._y})) {
			SoundManager.playOk();
			
			
			var isInrange = ((Math.abs($gameTemp.activeEvent().posX() - cursor.x) + Math.abs($gameTemp.activeEvent().posY() - cursor.y)) == 1);
			
			if(isInrange){
				$statCalc.removeBoardedUnit($gameTemp.actorToDeploy, $gameTemp.activeShip);				
				var event = $gameTemp.actorToDeploy.event;
				event.locate(cursor._x, cursor._y);
				event.appear();						
				$gameMap.setEventImages();	
				
				$gamePlayer.locate($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
				var battlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
				if($statCalc.hasBoardedUnits($gameTemp.activeShip)){
					$gameTemp.actorCommandPosition = 1;
				}						
				$gameSystem.setSrpgActorCommandWindowNeedRefresh(battlerArray);
				
				$gameSystem.setSubBattlePhase('actor_command_window');
				$gameTemp.clearMoveTable();						
			
			}						                          
		} else {
			SoundManager.playBuzzer();
		}                    
		return true;
	}
	return false;
}


//utility
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

function GameState_actor_map_target(){
	GameState.call(this);
	this.allowedActions = {
		cursor: false,
		menu: false,
		summaries: false
	};
}

GameState_actor_map_target.prototype = Object.create(GameState.prototype);
GameState_actor_map_target.prototype.constructor = GameState_actor_map_target;

GameState_actor_map_target.prototype.update = function(scene){
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
			var adjusted = scene.getAdjustedMapAttackCoordinates([[x, y]], $gameTemp.mapTargetDirection);
			$gamePlayer.locate($gameTemp.activeEvent().posX() + adjusted[0][0], $gameTemp.activeEvent().posY() + adjusted[0][1]);
			$gameSystem.setSubBattlePhase('actor_map_target_confirm');
			Input.clear();
		}								
	} else if (Input.isTriggered('cancel') || TouchInput.isCancelled()) {
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
	} else {	
		var directionChanged = false;
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
		
		tileCoordinates = scene.getAdjustedMapAttackCoordinates(tileCoordinates, direction);
		
		
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
	return true;
}

function GameState_actor_map_target_confirm(){
	GameState.call(this);
	this.allowedActions = {
		cursor: true,
		menu: true,
		summaries: false
	};
}

GameState_actor_map_target_confirm.prototype = Object.create(GameState.prototype);
GameState_actor_map_target_confirm.prototype.constructor = GameState_actor_map_target_confirm;	

GameState_actor_map_target_confirm.prototype.update = function(scene){
	
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
				$gameSystem.highlightedMapRetargetTiles = [];
				$gameSystem.highlightsRefreshed = true;	
				_this.mapAttackStart();
			}
		}				
	} else if (Input.isTriggered('cancel') || TouchInput.isCancelled()) {
		$gameSystem.highlightedMapRetargetTiles = [];
		$gameSystem.highlightsRefreshed = true;
		$gameTemp.mapRetargetLock = false;
		SoundManager.playCancel();
		var event = $gameTemp.activeEvent();
		$gamePlayer.locate(event.posX(), event.posY());
		$gameSystem.setSubBattlePhase('actor_map_target');	
	 }	
	 return true;
}

function GameState_actor_support(){
	GameState.call(this);
	this.allowedActions = {
		cursor: true,
		menu: false,
		summaries: true
	};
}

GameState_actor_support.prototype = Object.create(GameState.prototype);
GameState_actor_support.prototype.constructor = GameState_actor_support;

GameState_actor_support.prototype.update = function(scene){
	if (Input.isTriggered('cancel') || TouchInput.isCancelled()) {
		var battlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
		SoundManager.playCancel();
		$gameTemp.clearMoveTable();
		$gamePlayer.locate($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
		$gameSystem.setSrpgActorCommandWindowNeedRefresh(battlerArray);
		$gameSystem.setSubBattlePhase("actor_command_window");    
		scene._mapSrpgActorCommandWindow.activate();					
	}
	return true;
}

GameState_actor_support.prototype.updateTriggerAction = function(cursor){
	return true;
}

GameState_actor_support.prototype.updateMapEvent = function(x, y, triggers){
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
	return true;
}	

function GameState_actor_target(){
	GameState.call(this);
	this.allowedActions = {
		cursor: true,
		menu: false,
		summaries: true
	};
}

GameState_actor_target.prototype = Object.create(GameState.prototype);
GameState_actor_target.prototype.constructor = GameState_actor_target;

GameState_actor_target.prototype.update = function(scene){
	if (Input.isTriggered('pageup')) {                   
		$gameSystem.getNextLTarget();
	} else if (Input.isTriggered('pagedown')) {      
		$gameSystem.getNextRTarget();
	}
	
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
	return true;
}

GameState_actor_target.prototype.updateTriggerAction = function(cursor){
	return true;
}

GameState_actor_target.prototype.updateMapEvent = function(x, y, triggers){
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
						
						var allRequired = false;
						if($gameTemp.actorAction && $gameTemp.actorAction.attack){
							allRequired = $gameTemp.actorAction.attack.isAll ? 1 : -1;
						}
						
						var supporterInfo = [];
						var supporterSelected = -1;
						var bestDamage = 0;
						for(var i = 0; i < supporters.length; i++){
							var weaponResult = $battleCalc.getBestWeaponAndDamage(supporters[i], enemyInfo, false, false, false, allRequired);
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
						
						if(!$gameTemp.actorAction || !$gameTemp.actorAction.attack || !$gameTemp.actorAction.attack.isAll){
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
						} else {
							$gameTemp.supportDefendCandidates = [];
							$gameTemp.supportDefendSelected = -1;
						}
						$gameTemp.currentTargetingSettings = null;																				
						$battleCalc.updateTwinActions();
						
						$gameTemp.setTargetEvent(event);
						$statCalc.invalidateAbilityCache();
						$gameSystem.setSubBattlePhase('battle_window');
						$gameTemp.pushMenu = "before_battle";
					}	
				}								
			}
		}
	});	
}

function GameState_actor_target_spirit(){
	GameState.call(this);
	this.allowedActions = {
		cursor: true,
		menu: false,
		summaries: true
	};
}

GameState_actor_target_spirit.prototype = Object.create(GameState.prototype);
GameState_actor_target_spirit.prototype.constructor = GameState_actor_target_spirit;

GameState_actor_target_spirit.prototype.update = function(scene){
	if (Input.isTriggered('cancel') || TouchInput.isCancelled()) {
		var battlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
		SoundManager.playCancel();
		$gamePlayer.locate($gameTemp.activeEvent().posX(), $gameTemp.activeEvent().posY());
		$gameSystem.setSrpgActorCommandWindowNeedRefresh(battlerArray);
		$gameSystem.setSubBattlePhase("actor_command_window");                  
	}
	return true;
}

GameState_actor_target_spirit.prototype.updateTriggerAction = function(cursor){
	return true;
}

GameState_actor_target_spirit.prototype.updateMapEvent = function(x, y, triggers){
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
				}																					
			}
		}
	});
}

function GameState_after_battle(){
	GameState.call(this);
}

GameState_after_battle.prototype = Object.create(GameState.prototype);
GameState_after_battle.prototype.constructor = GameState_after_battle;

GameState_after_battle.prototype.update = function(scene){
	if(!$gameSystem.optionAfterBattleBGM){
		$songManager.playStageSong();
	}
	if($gameTemp.playingBattleDemo){
		$gameSystem.setSubBattlePhase('normal');
		$gameTemp.scriptedBattleDemoId = null;
		$gameTemp.playingBattleDemo = false;
	} else {
		$gameTemp.clearMoveTable();
		scene.srpgBattlerDeadAfterBattle();
	}			
    return false;
}

/***********************/