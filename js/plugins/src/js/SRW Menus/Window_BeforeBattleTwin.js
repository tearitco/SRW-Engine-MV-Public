import Window_CSS from "./Window_CSS.js";
import MechList from "./MechList.js"
import DetailBarMechDetail from "./DetailBarMechDetail.js";
import DetailBarMechUpgrades from "./DetailBarMechUpgrades.js";
import AttackList from "./AttackList.js";
import DetailBarAttackSummary from "./DetailBarAttackSummary.js";
import "./style/Window_Beforebattle.css";

export default function Window_BeforebattleTwin() {
	this.initialize.apply(this, arguments);	
}

Window_BeforebattleTwin.prototype = Object.create(Window_CSS.prototype);
Window_BeforebattleTwin.prototype.constructor = Window_BeforebattleTwin;

Window_BeforebattleTwin.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "before_battle";	
	this._pageSize = 1;
	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	this._currentAction = "counter";
	this._currentSelection = 0;
	this._currentActionSelection = 0;
	this._currentSupportSelection = 0;
	this._currentTwinTargetSelection = 0;
	this._currentEnemySelection = 0;
	this._currentUIState = "main_selection";
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});
}	

Window_BeforebattleTwin.prototype.show = function(){
	Window_CSS.prototype.show.call(this);
	this._currentSelection = 0;
	this._currentActionSelection = 0;
	this._currentSupportSelection = 0;
	this.getWindowNode().style.display = "";
	this._longPressTimer = 20;
}

Window_BeforebattleTwin.prototype.getMaxMainSelection = function(){
	if(!$gameTemp.currentBattleActor.isActor()){
		return 2;
	} else if($gameTemp.isEnemyAttack){
		return 3;
	} else {
		return 3;
	}
}

Window_BeforebattleTwin.prototype.isALLContext = function(){
	return $gameTemp.currentTargetingSettings.actor == "all" || $gameTemp.currentTargetingSettings.actorTwin == "all";
}

Window_BeforebattleTwin.prototype.incrementMainSelection = function(){
	this._currentSelection++;
	if(this._currentSelection == 1 && ENGINE_SETTINGS.DISABLE_FULL_BATTLE_SCENE){
		this._currentSelection++;
	}
	if(this._currentSelection >= this.getMaxMainSelection()){
		this._currentSelection = 0;
	}
}

Window_BeforebattleTwin.prototype.decrementMainSelection = function(){
	this._currentSelection--;
	if(this._currentSelection == 1 && ENGINE_SETTINGS.DISABLE_FULL_BATTLE_SCENE){
		this._currentSelection--;
	}
	if(this._currentSelection < 0){
		this._currentSelection = this.getMaxMainSelection() - 1;
	}
}

Window_BeforebattleTwin.prototype.incrementActionSelection = function(){
	this._currentActionSelection++;
	if(this._currentActionSelection >= 3){
		this._currentActionSelection = 0;
	}
}

Window_BeforebattleTwin.prototype.decrementActionSelection = function(){
	this._currentActionSelection--;
	if(this._currentActionSelection < 0){
		this._currentActionSelection = 2;
	}
}


Window_BeforebattleTwin.prototype.getMaxSupportSelection = function(){
	if($gameTemp.isEnemyAttack){
		return $gameTemp.supportDefendCandidates.length + 1;
	} else {
		return $gameTemp.supportAttackCandidates.length + 1;
	}
}

Window_BeforebattleTwin.prototype.incrementSupportSelection = function(){
	this._currentSupportSelection++;
	if(this._currentSupportSelection >= this.getMaxSupportSelection()){
		this._currentSupportSelection = 0;
	}
}

Window_BeforebattleTwin.prototype.decrementSupportSelection = function(){
	this._currentSupportSelection--;
	if(this._currentSupportSelection < 0){
		this._currentSupportSelection = this.getMaxSupportSelection() - 1;
	}
}

Window_BeforebattleTwin.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	if(ENGINE_SETTINGS.DISABLE_FULL_BATTLE_SCENE){
		windowNode.classList.add("full_scene_disabled");
	}
	
	windowNode.classList.add("twin");
	
	this._enemy_header = document.createElement("div");
	this._enemy_header.id = this.createId("enemy_header");
	this._enemy_header.classList.add("scaled_text");
	this._enemy_header.classList.add("faction_color");
	this._enemy_label = document.createElement("div");
	this._enemy_label.classList.add("enemy_label");
	this._enemy_header.appendChild(this._enemy_label);
	windowNode.appendChild(this._enemy_header);	
	
	this._ally_header = document.createElement("div");
	this._ally_header.id = this.createId("ally_header");
	this._ally_header.classList.add("scaled_text");
	this._ally_header.classList.add("faction_color");
	this._ally_label = document.createElement("div");
	this._ally_label.classList.add("ally_label");
	this._ally_header.appendChild(this._ally_label);	
	windowNode.appendChild(this._ally_header);	
	
	this._ally_main = document.createElement("div");
	this._ally_main.id = this.createId("ally_main");
	this._ally_main.classList.add("faction_color");
	windowNode.appendChild(this._ally_main);	
	
	this._ally_twin = document.createElement("div");
	this._ally_twin.id = this.createId("ally_twin");
	this._ally_twin.classList.add("faction_color");
	windowNode.appendChild(this._ally_twin);	
	
	this._enemy_main = document.createElement("div");
	this._enemy_main.id = this.createId("enemy_main");
	this._enemy_main.classList.add("faction_color");
	windowNode.appendChild(this._enemy_main);		
	
	this._enemy_twin = document.createElement("div");
	this._enemy_twin.id = this.createId("enemy_twin");
	this._enemy_twin.classList.add("faction_color");
	windowNode.appendChild(this._enemy_twin);	
	
	this._btn_start = document.createElement("div");
	this._btn_start.id = this.createId("btn_start");
	this._btn_start.innerHTML = "Start Battle";
	this._btn_start.classList.add("action_btn");
	this._btn_start.classList.add("scaled_text");
	this._btn_start.setAttribute("action_id", 0);
	windowNode.appendChild(this._btn_start);	
	
	this._btn_demo = document.createElement("div");
	this._btn_demo.id = this.createId("btn_demo");
	this._btn_demo.innerHTML = "DEMO: OFF";
	this._btn_demo.classList.add("action_btn");
	this._btn_demo.classList.add("scaled_text");
	this._btn_demo.setAttribute("action_id", 1);
	windowNode.appendChild(this._btn_demo);	
	
	this._btn_assist = document.createElement("div");
	this._btn_assist.id = this.createId("btn_asssist");
	this._btn_assist.innerHTML = "Select Assist";
	this._btn_assist.classList.add("action_btn");
	this._btn_assist.classList.add("scaled_text");
	this._btn_assist.setAttribute("action_id", 2);
	windowNode.appendChild(this._btn_assist);	
	
	this._btn_action = document.createElement("div");
	this._btn_action.id = this.createId("btn_action");
	this._btn_action.innerHTML = "Select Action";
	this._btn_action.classList.add("action_btn");
	this._btn_action.classList.add("scaled_text");
	this._btn_action.setAttribute("action_id", 3);
	windowNode.appendChild(this._btn_action);

	this._support_selection = document.createElement("div");
	this._support_selection.id = this.createId("support_selection");
	windowNode.appendChild(this._support_selection);		
	
	this._action_selection = document.createElement("div");
	this._action_selection.id = this.createId("action_selection");
	this._action_selection.classList.add("scaled_text");
	windowNode.appendChild(this._action_selection);

	this._ally_support_1 = document.createElement("div");
	this._ally_support_1.id = this.createId("ally_support_1");
	this._ally_support_1.classList.add("faction_color");
	windowNode.appendChild(this._ally_support_1);

	this._ally_support_2 = document.createElement("div");
	this._ally_support_2.id = this.createId("ally_support_2");
	this._ally_support_2.classList.add("faction_color");
	windowNode.appendChild(this._ally_support_2);	

	this._enemy_support_1 = document.createElement("div");
	this._enemy_support_1.id = this.createId("enemy_support_1");
	this._enemy_support_1.classList.add("faction_color");
	windowNode.appendChild(this._enemy_support_1);

	this._enemy_support_2 = document.createElement("div");
	this._enemy_support_2.id = this.createId("enemy_support_2");
	this._enemy_support_2.classList.add("faction_color");
	windowNode.appendChild(this._enemy_support_2);		
	
	this._targeting_arrows_1 = document.createElement("img");
	this._targeting_arrows_1.id = this.createId("targeting_arrows_1");
	this._targeting_arrows_1.setAttribute("src", "img/system/targeting1.png");
	windowNode.appendChild(this._targeting_arrows_1);	
	
	this._targeting_arrows_2 = document.createElement("img");
	this._targeting_arrows_2.id = this.createId("targeting_arrows_2");
	this._targeting_arrows_2.setAttribute("src", "img/system/targeting1.png");
	windowNode.appendChild(this._targeting_arrows_2);	
	
	this._targeting_arrows_enemy_1 = document.createElement("img");
	this._targeting_arrows_enemy_1.id = this.createId("targeting_arrows_enemy_1");
	this._targeting_arrows_enemy_1.setAttribute("src", "img/system/targeting1.png");
	windowNode.appendChild(this._targeting_arrows_enemy_1);	
	
	this._targeting_arrows_enemy_2 = document.createElement("img");
	this._targeting_arrows_enemy_2.id = this.createId("targeting_arrows_enemy_2");
	this._targeting_arrows_enemy_2.setAttribute("src", "img/system/targeting1.png");
	windowNode.appendChild(this._targeting_arrows_enemy_2);	
	
}	

Window_BeforebattleTwin.prototype.update = function() {	
	Window_Base.prototype.update.call(this);
	var _this = this;
	if(this.isOpen() && !this._handlingInput){
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			this.requestRedraw();
			
			//this._attackList.incrementSelection();
			if(this._currentUIState == "support_selection"){
				SoundManager.playCursor();
				_this.incrementSupportSelection()
			} else if(this._currentUIState == "action_selection"){
				SoundManager.playCursor();
				_this.incrementActionSelection();
			} else if(this._currentUIState == "actor_twin_target_selection"){
				SoundManager.playCursor();	
				_this._currentTwinTargetSelection++;
			
				if($statCalc.isMainTwin($gameTemp.currentBattleActor)){
					if(_this._currentTwinTargetSelection > 1){
						_this._currentTwinTargetSelection = 0;
						_this._currentUIState = "main_selection";
					}
				} else {
					if(_this._currentTwinTargetSelection > 0){
						_this._currentTwinTargetSelection = 0;
						_this._currentUIState = "main_selection";
					}
				}
				
			} else if(this._currentUIState == "enemy_twin_target_selection"){
				SoundManager.playCursor();	
				_this._currentEnemySelection++;
				
				if($statCalc.isMainTwin($gameTemp.currentBattleEnemy)){
					if(_this._currentEnemySelection > 1){
						_this._currentEnemySelection = 1;
					}
				} else {
					if(_this._currentEnemySelection > 0){
						_this._currentEnemySelection = 0;
					}
				}				
			}
			
		
		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			this.requestRedraw();
		    
			//this._attackList.decrementSelection();
			if(this._currentUIState == "support_selection"){
				SoundManager.playCursor();
				_this.decrementSupportSelection()
			} else if(this._currentUIState == "action_selection"){
				SoundManager.playCursor();
				_this.decrementActionSelection();
			} else if(this._currentUIState == "main_selection"){
				//if($statCalc.isMainTwin($gameTemp.currentBattleEnemy)){
					SoundManager.playCursor();
					if($statCalc.isMainTwin($gameTemp.currentBattleActor)){
						_this._currentTwinTargetSelection = 1;
					} else {
						_this._currentTwinTargetSelection = 0;
					}					
					_this._currentUIState = "actor_twin_target_selection";
				//}				
			} else if(this._currentUIState == "actor_twin_target_selection"){					
				_this._currentTwinTargetSelection--;
				if(_this._currentTwinTargetSelection < 0){
					_this._currentTwinTargetSelection = 0;
				} else {
					SoundManager.playCursor();
				}
			} else if(this._currentUIState == "enemy_twin_target_selection"){
				SoundManager.playCursor();	
				_this._currentEnemySelection--;
				
				if(_this._currentEnemySelection < 0){
					_this._currentEnemySelection = 0;
				}
				
			}
		}		

		if(Input.isTriggered('left') || Input.isRepeated('left')){
			this.requestRedraw();			
			//this._attackList.decrementPage();		
			if(this._currentUIState == "main_selection"){
				SoundManager.playCursor();
				this.incrementMainSelection();
			}
			
		} else if (Input.isTriggered('right') || Input.isRepeated('right')) {
			this.requestRedraw();			
			//this._attackList.incrementPage();		
			if(this._currentUIState == "main_selection"){
				SoundManager.playCursor();
				this.decrementMainSelection();
			}
		}
		
		if(Input.isTriggered('left_trigger') || Input.isRepeated('left_trigger')){
			this.requestRedraw();
			
		} else if (Input.isTriggered('right_trigger') || Input.isRepeated('right_trigger')) {
			this.requestRedraw();
			
		}
		
		function quickUpdateActorAction(){
			if(_this._currentActionSelection == 0){
				$gameTemp.actorAction.type = "attack";				
			}
			if(_this._currentActionSelection == 1){
				$gameTemp.actorAction.type = "defend";					
			}
			if(_this._currentActionSelection == 2){
				$gameTemp.actorAction.type = "evade";
			}
		}		
		
		if(Input.isTriggered('pageup') || Input.isRepeated('pageup')){
			this.requestRedraw();
			if(this._currentUIState == "main_selection"){
				if($gameTemp.currentBattleActor.isActor() && $gameTemp.isEnemyAttack){
					_this._currentActionSelection--;
					if(_this._currentActionSelection < 0){
						_this._currentActionSelection = 2;
					}
					quickUpdateActorAction();
				}
			}
		} else if (Input.isTriggered('pagedown') || Input.isRepeated('pagedown')) {
			this.requestRedraw();
			if(this._currentUIState == "main_selection"){
				if($gameTemp.currentBattleActor.isActor() && $gameTemp.isEnemyAttack){
					_this._currentActionSelection++;
					if(_this._currentActionSelection > 2){
						_this._currentActionSelection = 0;
					}
					quickUpdateActorAction();
				}
			}			
		}
		
		if(Input.isTriggered('L3')){
			this.requestRedraw();			
		} 	
		
		if(this._longPressTimer <= 0 && Input.isLongPressed('ok')){
			if(this._currentSelection == 0){
				if(this._callbacks["selected"]){
					this._callbacks["selected"]();
				}	
				setTimeout(function(){_this.getWindowNode().style.display = "none"; _this.close()}, 1000); //hack to make sure the pre battle window is hidden after returning from the battle scene
			}
		}	
		this._longPressTimer--;
		
		if(Input.isTriggered('ok')){	
			//$gameTemp.popMenu = true;	
			if(this._currentUIState == "main_selection"){
				if(this._currentSelection == 0){
					if(this._callbacks["selected"]){
						this._callbacks["selected"]();
					}	
					setTimeout(function(){_this.getWindowNode().style.display = "none"; _this.close()}, 1000); //hack to make sure the pre battle window is hidden after returning from the battle scene
				}
				if(this._currentSelection == 1){
					this.requestRedraw();
					$gameSystem.demoSetting = !$gameSystem.demoSetting;
				}
				if(this._currentSelection == 2){
					SoundManager.playOk();
					this.requestRedraw();
					_this._currentUIState = "support_selection";
					if($gameTemp.isEnemyAttack){
						_this._currentSupportSelection = $gameTemp.supportDefendSelected + 1;
					} else {
						_this._currentSupportSelection = $gameTemp.supportAttackSelected + 1;
					}
					
				}
				if(this._currentSelection == 3){
					SoundManager.playOk();
					this.requestRedraw();
					_this._currentUIState = "action_selection";
					if($gameTemp.actorAction.type == "attack"){
						_this._currentActionSelection = 0;
					}
					if($gameTemp.actorAction.type == "defend"){
						_this._currentActionSelection = 1;
					}
					if($gameTemp.actorAction.type == "evade"){
						_this._currentActionSelection = 2;
					}
				}
			} else if(this._currentUIState == "support_selection"){
				SoundManager.playOk();
				this.requestRedraw();
				_this._currentUIState = "main_selection";
				if($gameTemp.isEnemyAttack){
					$gameTemp.supportDefendSelected = _this._currentSupportSelection - 1;
				} else {
					$gameTemp.supportAttackSelected = _this._currentSupportSelection - 1;
					if(_this._currentSupportSelection != 0){
						var supporter = $gameTemp.supportAttackCandidates[$gameTemp.supportAttackSelected];	
						
						$gameTemp.currentMenuUnit = {
							actor: supporter.actor,
							mech: supporter.actor.SRWStats.mech
						};
						$gameTemp.attackWindowCallback = function(attack){

							$gameTemp.popMenu = true;	
							supporter.action.type = "attack";
							supporter.action.attack = attack;
							if($statCalc.isMainTwin(supporter.actor)){
								var twinPos = {
									x: supporter.actor.event.posX(),
									y: supporter.actor.event.posY(),
								};
								
								var targetPos = {
									x: $gameTemp.currentBattleEnemy.event.posX(),
									y: $gameTemp.currentBattleEnemy.event.posY()
								};
								
								if($battleCalc.getBestWeapon({actor: supporter.actor.subTwin, pos: twinPos}, {actor: $gameTemp.currentBattleEnemy, pos: targetPos}, false, false, false)){
										$gameTemp.currentMenuUnit = {
										actor: supporter.actor.subTwin,
										mech: supporter.actor.subTwin.SRWStats.mech
									};
									$gameTemp.attackWindowCallback = function(attack){
										$gameTemp.popMenu = true;	
										$gameTemp.twinSupportAttack = {actor: supporter.actor.subTwin, action: {type: "attack", attack: attack}}
										_this._currentSelection = 0;
										_this.requestRedraw();	
									};
									$gameTemp.pushMenu = "attack_list";
								} else {
									$gameTemp.twinSupportAttack = null;
									_this._currentSelection = 0;
									_this.requestRedraw();	
								}								
							} else {
								$gameTemp.twinSupportAttack = null;
								_this._currentSelection = 0;
								_this.requestRedraw();	
							}
													
						};		
						$gameTemp.pushMenu = "attack_list";
					}  else {
						$gameTemp.twinSupportAttack = null;
					}		
				}
			} else if(this._currentUIState == "action_selection"){
				SoundManager.playOk();
				_this._currentUIState = "main_selection";
				this.requestRedraw();
				if(_this._currentActionSelection == 0){
					$gameTemp.actorAction.type == "attack";
					$gameTemp.allAttackSelectionRequired = false;
					if(_this._currentTwinTargetSelection == 0){
						if($gameTemp.currentTargetingSettings.actorTwin == "all"){
							$gameTemp.allAttackSelectionRequired = true;
						}
						$gameTemp.currentMenuUnit = {
							actor: $gameTemp.currentBattleActor,
							mech: $gameTemp.currentBattleActor.SRWStats.mech
						};
					} else {
						if($gameTemp.currentTargetingSettings.actor == "all"){
							$gameTemp.allAttackSelectionRequired = true;
						}
						$gameTemp.currentMenuUnit = {
							actor: $gameTemp.currentBattleActor.subTwin,
							mech: $gameTemp.currentBattleActor.subTwin.SRWStats.mech
						};
					}
					$gameTemp.attackWindowCallback = function(attack){
						$gameTemp.popMenu = true;	
						var allSelected = false;
						if(_this._currentTwinTargetSelection == 0){
							$gameTemp.actorAction.type = "attack";
							$gameTemp.actorAction.attack = attack;
							if(attack.isAll){
								$gameTemp.actorTwinAction.type = "defend";	
								$gameTemp.currentTargetingSettings.actor = "all";
								allSelected = true;
							}
						} else {
							$gameTemp.actorTwinAction.type = "attack";
							$gameTemp.actorTwinAction.attack = attack;
							if(attack.isAll){
								$gameTemp.actorAction.type = "defend";	
								$gameTemp.currentTargetingSettings.actorTwin = "all";
								allSelected = true;
							}
						}
						if(allSelected){
							_this._currentUIState = "main_selection";
						} else {
							_this._currentUIState = "enemy_twin_target_selection";
						}
						$gameTemp.allAttackSelectionRequired = false;
						_this._currentSelection = 0;
						_this.requestRedraw();							
					};		
					
					$gameTemp.attackWindowCancelCallback = function(){
						$gameTemp.allAttackSelectionRequired = false;
					}
					$gameTemp.pushMenu = "attack_list";
				}
				if(_this._currentActionSelection == 1){
					if(_this._currentTwinTargetSelection == 0){
						$gameTemp.actorAction.type = "defend";	
					} else {
						$gameTemp.actorTwinAction.type = "defend";	
					}	
					_this._currentUIState = "main_selection";
				}
				if(_this._currentActionSelection == 2){
					if(_this._currentTwinTargetSelection == 0){
						$gameTemp.actorAction.type = "evade";	
					} else {
						$gameTemp.actorTwinAction.type = "evade";	
					}	
					_this._currentUIState = "main_selection";
				}
			} else if(this._currentUIState == "actor_twin_target_selection"){
				SoundManager.playOk();
				//_this._currentUIState = "enemy_twin_target_selection";
				if(_this._currentTwinTargetSelection == 0){
					if($gameTemp.isEnemyAttack){
						_this._currentUIState = "action_selection";
					} else if($gameTemp.currentTargetingSettings.actor != "all"){
						_this._currentUIState = "enemy_twin_target_selection";
					}
				} else {
					_this._currentUIState = "action_selection";
				}				
				this.requestRedraw();
			} else if(this._currentUIState == "enemy_twin_target_selection"){
				SoundManager.playOk();
				if(_this._currentTwinTargetSelection == 0){
					if(_this._currentEnemySelection == 0){
						$gameTemp.currentTargetingSettings.actor = "main";
					} else {
						$gameTemp.currentTargetingSettings.actor = "twin";
					}
				} else {
					if(_this._currentEnemySelection == 0){
						$gameTemp.currentTargetingSettings.actorTwin = "main";
					} else {
						$gameTemp.currentTargetingSettings.actorTwin = "twin";
					}
				}
				_this._currentUIState = "main_selection";
				this.requestRedraw();
			}					
		}
		if(Input.isTriggered('cancel')){	
			if(this._currentUIState == "main_selection"){
				if(!$gameTemp.isEnemyAttack){
					SoundManager.playCancel();
					$gameTemp.popMenu = true;	
					if(this._callbacks["closed"]){
						this._callbacks["closed"]();
					}
				}
			} else if(this._currentUIState == "support_selection"){
				SoundManager.playCancel();
				this.requestRedraw();
				_this._currentUIState = "main_selection";
			} else if(this._currentUIState == "action_selection"){
				SoundManager.playCancel();
				this.requestRedraw();
				_this._currentUIState = "main_selection";
			} else if(this._currentUIState == "actor_twin_target_selection"){
				SoundManager.playCancel();
				this.requestRedraw();
				_this._currentUIState = "main_selection";
			} else if(this._currentUIState == "enemy_twin_target_selection"){
				SoundManager.playCancel();
				this.requestRedraw();
				_this._currentUIState = "actor_twin_target_selection";
			}			
			
		}		
		
		if(Input.isTriggered('menu')){
			this.requestRedraw();
			$gameSystem.demoSetting = !$gameSystem.demoSetting;
		}		
		
		this.refresh();
	}		
};

Window_BeforebattleTwin.prototype.createParticipantBlock = function(ref, action, isSupport, allyOrEnemy) {
	var content = "";
	content+="<div class='participant_block "+allyOrEnemy+"'>";
	content+="<div class='scaled_text action_row'>";
	if(!isSupport){
		if(action.type == "attack"){
			content+="Attack";
		}
		if(action.type == "evade"){
			content+="Evade";
		}
		if(action.type == "defend"){
			content+="Defend";
		}
		if(action.type == "none"){
			content+="---";
		}
	} else {
		if(action.type == "attack"){
			content+="Attack";
		}
		if(action.type == "evade"){
			content+="---";
		}
		if(action.type == "defend"){
			content+="Defend";
		}
		if(action.type == "none"){
			content+="---";
		}
	}
	content+="</div>";
	content+="<div class='main_row'>";
	if(allyOrEnemy == "ally"){
		content+=createPercentIndicator();
		content+=createMainContent();
	} else {
		content+=createMainContent();
		content+=createPercentIndicator();		
	}
	
	function createPercentIndicator(){		
		var content = "";
		content+="<div class='scaled_text percent_indicator'>";
		var hitRates = [];
		if(action.type == "attack"){	
			var initiatorType;			
			if(allyOrEnemy == "ally"){
				initiatorType = "actor";
				if(ref.isSubTwin){
					initiatorType = "actorTwin"
				}
			} else {
				initiatorType = "enemy";
				if(ref.isSubTwin){
					initiatorType = "enemyTwin"
				}
			}
		
			
			var initiator;			
			var initiatorAction;	
			if(initiatorType == "actor"){
				initiator = $gameTemp.currentBattleActor;
				initiatorAction = $gameTemp.actorAction;
			} else if(initiatorType == "actorTwin"){
				initiator = $gameTemp.currentBattleActor.subTwin;
				initiatorAction = $gameTemp.actorTwinAction;
			} else if(initiatorType == "enemy"){
				initiator = $gameTemp.currentBattleEnemy;
				initiatorAction = $gameTemp.enemyAction;
			} else if(initiatorType == "enemyTwin"){
				initiator = $gameTemp.currentBattleEnemy.subTwin;
				initiatorAction = $gameTemp.enemyTwinAction;
			}
			
			var defenderInfo = [];
			var defender;
			var defenderAction;
			var targetType = $gameTemp.currentTargetingSettings[initiatorType];
			if(allyOrEnemy == "ally"){
				if(targetType == "main"){
					defenderInfo.push({
						defender: $gameTemp.currentBattleEnemy,					
						defenderAction: $gameTemp.enemyAction
					});
				}
				if(targetType == "twin"){
					defenderInfo.push({
						defender: $gameTemp.currentBattleEnemy.subTwin,					
						defenderAction: $gameTemp.enemyTwinAction
					});
				}
				if(targetType == "all"){
					defenderInfo.push({
						defender: $gameTemp.currentBattleEnemy,					
						defenderAction: $gameTemp.enemyAction
					});
					defenderInfo.push({
						defender: $gameTemp.currentBattleEnemy.subTwin,					
						defenderAction: $gameTemp.enemyTwinAction
					});
				}
			} else {
				if(targetType == "main"){
					defenderInfo.push({
						defender: $gameTemp.currentBattleActor,					
						defenderAction: $gameTemp.actorAction
					});
				}
				if(targetType == "twin"){					
					defenderInfo.push({
						defender: $gameTemp.currentBattleActor.subTwin,					
						defenderAction: $gameTemp.actorTwinAction
					});
				}
				if(targetType == "all"){
					defenderInfo.push({
						defender: $gameTemp.currentBattleActor,					
						defenderAction: $gameTemp.actorAction
					});
					defenderInfo.push({
						defender: $gameTemp.currentBattleActor.subTwin,					
						defenderAction: $gameTemp.actorTwinAction
					});
				}
			}		
			
			var realIdx = 0;
			for(var i = 0; i < defenderInfo.length; i++){
				var hitRate = -1;
				if(defenderInfo[i].defender && defenderInfo[i].defenderAction){
					if(allyOrEnemy == "ally"){				
						hitRate = $battleCalc.performHitCalculation(
							{actor: initiator, action: initiatorAction, isInitiator: !$gameTemp.isEnemyAttack},
							{actor: defenderInfo[i].defender, action: defenderInfo[i].defenderAction, isInitiator: $gameTemp.isEnemyAttack}
						);					
					} else {				
						hitRate = $battleCalc.performHitCalculation(				
							{actor: initiator, action: initiatorAction, isInitiator: $gameTemp.isEnemyAttack},
							{actor: defenderInfo[i].defender, action: defenderInfo[i].defenderAction, isInitiator: !$gameTemp.isEnemyAttack}
						);			
					}			
					hitRates[realIdx++] = hitRate;
				}				
			}			
		}
		content+="<div>";
		for(var i = 0; i < hitRates.length; i++){
			var hitRate = hitRates[i];
			content+="<div>";
			if(hitRate == -1){
				content+="---";	
			} else {
				content+=Math.floor(hitRate * 100)+"%";	
			}
			content+="</div>";
		}
		content+="</div>";
		
		content+="</div>";
		return content;
	}
	
	function createMainContent(){
		var content = "";
	
		content+="<div class='main_content'>";
	
		if(ref.isActor()){
			content+="<div data-pilot='"+ref.SRWStats.pilot.id+"' class='pilot_icon'>";
			content+="</div>";
		} else {
			content+="<div data-pilot='"+ref.SRWStats.pilot.id+"' class='enemy_icon'>";
			content+="</div>";
		}		
		
		content+="<div class='pilot_name scaled_text scaled_width fitted_text'>";
		content+=ref.name();
		content+="</div>";
		
		content+="<div class='pilot_stats scaled_text'>";	
		content+="<div class='level scaled_width'>";
		content+="<div class='label'>";
		content+="Lv";
		content+="</div>";
		content+="<div class='value'>";
		content+=$statCalc.getCurrentLevel(ref);
		content+="</div>";
		content+="</div>";
		content+="<div class='will scaled_width'>";
		content+="<div class='label'>";
		content+="Will";
		content+="</div>";
		content+="<div class='value'>";
		content+=$statCalc.getCurrentWill(ref);
		content+="</div>";
		content+="</div>";
		content+="</div>";
		
		var calculatedStats = $statCalc.getCalculatedMechStats(ref);
		
		content+="<div class='mech_hp_en_container scaled_text'>";
		content+="<div class='hp_label scaled_text'>HP</div>";
		content+="<div class='en_label scaled_text'>EN</div>";

		content+="<div class='hp_display'>";
		content+="<div class='current_hp scaled_text'>"+$statCalc.getCurrentHPDisplay(ref)+"</div>";
		content+="<div class='divider scaled_text'>/</div>";
		content+="<div class='max_hp scaled_text'>"+$statCalc.getCurrentMaxHPDisplay(ref)+"</div>";
		
		content+="</div>";
		
		content+="<div class='en_display'>";
		content+="<div class='current_en scaled_text'>"+$statCalc.getCurrentENDisplay(ref)+"</div>";
		content+="<div class='divider scaled_text'>/</div>";
		content+="<div class='max_en scaled_text'>"+$statCalc.getCurrentMaxENDisplay(ref)+"</div>";
		
		content+="</div>";
		
		var hpPercent = Math.floor(calculatedStats.currentHP / calculatedStats.maxHP * 100);
		content+="<div class='hp_bar'><div style='width: "+hpPercent+"%;' class='hp_bar_fill'></div></div>";
		
		var enPercent = Math.floor(calculatedStats.currentEN / calculatedStats.maxEN * 100);
		content+="<div class='en_bar'><div style='width: "+enPercent+"%;' class='en_bar_fill'></div></div>";
		content+="</div>";
		
		content+="<div class='attack_name fitted_text'>";	
		var attack = action.attack;
		if(attack && action.type == "attack"){	
			if(attack.type == "M"){
				content+="<img class='attack_list_type scaled_width' src='svg/punch_blast.svg'>";
			} else {
				content+="<img class='attack_list_type scaled_width' src='svg/crosshair.svg'>";
			}
			content+="<div class='scaled_text'>"+attack.name+"</div>";
		} else {
			content+="<div class='scaled_text'>------</div>";
		}
		content+="</div>";	
		
		var spirits = $statCalc.getAvailableSpiritStates();
		var activeSpirits = $statCalc.getActiveSpirits(ref);
		content+="<div class='active_spirits scaled_text'>";	
		for(var i = 0; i < spirits.length; i++){
			content+="<div class='spirit_entry "+(activeSpirits[spirits[i]] ? "active" : "")+"'>";	
			content+=spirits[i].substring(0, 3).toUpperCase();	
			content+="</div>";	
		}
		content+="</div>";	
		content+="</div>";	
		return content;
	}
	
	content+="</div>";
	content+="</div>";
	return content;
}


Window_BeforebattleTwin.prototype.createSmallParticipantBlock = function(ref, action, allyOrEnemy) {
	var content = "";
	content+="<div class='participant_block participant_block_small "+allyOrEnemy+"'>";
	content+="<div class='scaled_text action_row'>";
	
	if(ref.isActor()){
		content+=createPercentIndicator();
		content+="<div data-pilot='"+ref.SRWStats.pilot.id+"' class='pilot_icon'>";
		content+="</div>";
	} 
	
	if(action.type == "attack"){
		content+="<div class='attack_name fitted_text'>";	
		var attack = action.attack;
		if(attack && action.type == "attack"){	
			if(attack.type == "M"){
				content+="<img class='attack_list_type scaled_width' src='svg/punch_blast.svg'>";
			} else {
				content+="<img class='attack_list_type scaled_width' src='svg/crosshair.svg'>";
			}
			content+="<div class='scaled_text'>"+attack.name+"</div>";
		} else {
			content+="<div class='scaled_text'>------</div>";
		}
		content+="</div>";
	}
	/*if(action.type == "evade"){
		content+="---";
	}*/
	if(action.type == "defend"){
		content+="<div class='attack_name fitted_text'>";	
		content+="Support Defend";
		content+="</div>";
	}
	/*if(action.type == "none"){
		content+="---";
	}*/
	
	if(!ref.isActor()){
		content+="<div data-pilot='"+ref.SRWStats.pilot.id+"' class='enemy_icon'>";
		content+="</div>";
		content+=createPercentIndicator();
	}
	
	content+="</div>";
	//content+="<div class='main_row'>";
	/*if(allyOrEnemy == "ally"){
		content+=createPercentIndicator();
		content+=createMainContent();
	} else {
		content+=createMainContent();
		content+=createPercentIndicator();		
	}*/
	
	function createPercentIndicator(){		
		var content = "";
		content+="<div class='scaled_text percent_indicator'>";
		var hitRate = -1;
		if(action.type == "attack"){	
			if(allyOrEnemy == "ally"){
				
				var supporter = $gameTemp.supportAttackCandidates[$gameTemp.supportAttackSelected];
				if(supporter){					
					hitRate = $battleCalc.performHitCalculation(
						{actor: supporter.actor, action: supporter.action},
						{actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction}
					);
				}
				
				
			} else {
				
				var supporter = $gameTemp.supportAttackCandidates[$gameTemp.supportAttackSelected];
				if(supporter){	
					hitRate = $battleCalc.performHitCalculation(
						{actor: supporter.actor, action: supporter.action},
						{actor: $gameTemp.currentBattleActor, action: $gameTemp.actorAction}
					);
				}
				
			}
		}
		if(hitRate == -1){
			content+="---";	
		} else {
			content+=Math.floor(hitRate * 100)+"%";	
		}
		
		content+="</div>";
		return content;
	}
	
	function createMainContent(){
		var content = "";
	
		content+="<div class='main_content'>";
	
		if(ref.isActor()){
			content+="<div data-pilot='"+ref.SRWStats.pilot.id+"' class='pilot_icon'>";
			content+="</div>";
		} else {
			content+="<div data-pilot='"+ref.SRWStats.pilot.id+"' class='enemy_icon'>";
			content+="</div>";
		}		
		
		content+="<div class='pilot_name scaled_text scaled_width fitted_text'>";
		content+=ref.name();
		content+="</div>";
		
		content+="<div class='pilot_stats scaled_text'>";	
		content+="<div class='level scaled_width'>";
		content+="<div class='label'>";
		content+="Lv";
		content+="</div>";
		content+="<div class='value'>";
		content+=$statCalc.getCurrentLevel(ref);
		content+="</div>";
		content+="</div>";
		content+="<div class='will scaled_width'>";
		content+="<div class='label'>";
		content+="Will";
		content+="</div>";
		content+="<div class='value'>";
		content+=$statCalc.getCurrentWill(ref);
		content+="</div>";
		content+="</div>";
		content+="</div>";
		
		var calculatedStats = $statCalc.getCalculatedMechStats(ref);
		
		content+="<div class='mech_hp_en_container scaled_text'>";
		content+="<div class='hp_label scaled_text'>HP</div>";
		content+="<div class='en_label scaled_text'>EN</div>";

		content+="<div class='hp_display'>";
		content+="<div class='current_hp scaled_text'>"+$statCalc.getCurrentHPDisplay(ref)+"</div>";
		content+="<div class='divider scaled_text'>/</div>";
		content+="<div class='max_hp scaled_text'>"+$statCalc.getCurrentMaxHPDisplay(ref)+"</div>";
		
		content+="</div>";
		
		content+="<div class='en_display'>";
		content+="<div class='current_en scaled_text'>"+$statCalc.getCurrentENDisplay(ref)+"</div>";
		content+="<div class='divider scaled_text'>/</div>";
		content+="<div class='max_en scaled_text'>"+$statCalc.getCurrentMaxENDisplay(ref)+"</div>";
		
		content+="</div>";
		
		var hpPercent = Math.floor(calculatedStats.currentHP / calculatedStats.maxHP * 100);
		content+="<div class='hp_bar'><div style='width: "+hpPercent+"%;' class='hp_bar_fill'></div></div>";
		
		var enPercent = Math.floor(calculatedStats.currentEN / calculatedStats.maxEN * 100);
		content+="<div class='en_bar'><div style='width: "+enPercent+"%;' class='en_bar_fill'></div></div>";
		content+="</div>";
		
		content+="<div class='attack_name fitted_text'>";	
		var attack = action.attack;
		if(attack && action.type == "attack"){	
			if(attack.type == "M"){
				content+="<img class='attack_list_type scaled_width' src='svg/punch_blast.svg'>";
			} else {
				content+="<img class='attack_list_type scaled_width' src='svg/crosshair.svg'>";
			}
			content+="<div class='scaled_text'>"+attack.name+"</div>";
		} else {
			content+="<div class='scaled_text'>------</div>";
		}
		content+="</div>";	
		
		var spirits = $statCalc.getAvailableSpiritStates();
		var activeSpirits = $statCalc.getActiveSpirits(ref);
		content+="<div class='active_spirits scaled_text'>";	
		for(var i = 0; i < spirits.length; i++){
			content+="<div class='spirit_entry "+(activeSpirits[spirits[i]] ? "active" : "")+"'>";	
			content+=spirits[i].substring(0, 3).toUpperCase();	
			content+="</div>";	
		}
		content+="</div>";	
		content+="</div>";	
		return content;
	}
	
	//content+="</div>";
	content+="</div>";
	return content;
}


Window_BeforebattleTwin.prototype.redraw = function() {
	var _this = this;
	//this._mechList.redraw();	

	/*
	
	var mechIcon = this._container.querySelector("#detail_pages_weapons_name_icon");
	this.loadMechMiniSprite(this.getCurrentSelection().mech.id, mechIcon);	
*/
	this._ally_main.innerHTML = this.createParticipantBlock($gameTemp.currentBattleActor, $gameTemp.actorAction, false, "ally");
	this._enemy_main.innerHTML = this.createParticipantBlock($gameTemp.currentBattleEnemy, $gameTemp.enemyAction, false, "enemy");
	this._enemy_main.style.display = "";
	var supporter = $gameTemp.supportAttackCandidates[$gameTemp.supportAttackSelected];
	this._ally_support_1.innerHTML = "";
	this._enemy_support_1.innerHTML = "";
	this._enemy_support_1.style.display = "none";
	this._ally_support_1.style.display = "none";
	if(supporter){
		if($gameTemp.isEnemyAttack){
			this._enemy_support_1.innerHTML = this.createSmallParticipantBlock(supporter.actor, supporter.action, true, "enemy");
			this._enemy_support_1.style.display = "";
		} else {
			this._ally_support_1.innerHTML = this.createSmallParticipantBlock(supporter.actor, supporter.action, true, "ally");
			this._ally_support_1.style.display = "";
		}
		
	} else {
		if($gameTemp.isEnemyAttack){
			this._enemy_support_1.innerHTML = "";
			this._enemy_support_1.style.display = "none";
		} else {
			this._ally_support_1.innerHTML = "";
			this._ally_support_1.style.display = "none";
		}
	}
	
	var supporter = $gameTemp.supportDefendCandidates[$gameTemp.supportDefendSelected];	
	if(supporter){
		if($gameTemp.isEnemyAttack){
			this._ally_support_1.innerHTML = this.createSmallParticipantBlock(supporter.actor, supporter.action, true, "ally");
			this._ally_support_1.style.display = "";
		} else {			
			this._enemy_support_1.innerHTML = this.createSmallParticipantBlock(supporter.actor, supporter.action, true, "enemy");
			this._enemy_support_1.style.display = "";
		}
		
	} else {
		if($gameTemp.isEnemyAttack){			
			this._ally_support_1.innerHTML = "";
			this._ally_support_1.style.display = "none";
		} else {
			this._enemy_support_1.innerHTML = "";
			this._enemy_support_1.style.display = "none";
		}
	}
	
	var supporter = $gameTemp.twinSupportAttack;
	this._ally_support_2.innerHTML = "";
	this._ally_support_2.style.display = "none";
	this._enemy_support_2.innerHTML = "";
	this._enemy_support_2.style.display = "none";
	if(supporter){
		if($gameTemp.isEnemyAttack){
			this._enemy_support_2.innerHTML = this.createSmallParticipantBlock(supporter.actor, supporter.action, true, "enemy");
			this._enemy_support_2.style.display = "";
		} else {
			this._ally_support_2.innerHTML = this.createSmallParticipantBlock(supporter.actor, supporter.action, true, "ally");
			this._ally_support_2.style.display = "";
		}
		
	} else {
		if($gameTemp.isEnemyAttack){
			this._enemy_support_2.innerHTML = "";
			this._enemy_support_2.style.display = "none";
		} else {
			this._ally_support_2.innerHTML = "";
			this._ally_support_2.style.display = "none";
		}
	}
	

	if($gameTemp.currentBattleActor.subTwin){
		var action;
		if(!$gameTemp.actorTwinAction){
			action = {type: "none"};
		} else {
			action = $gameTemp.actorTwinAction;
		}
		this._ally_twin.innerHTML = this.createParticipantBlock($gameTemp.currentBattleActor.subTwin, action, false, "ally");
		this._ally_twin.style.display = "";
	} else {
		this._ally_twin.innerHTML = "";
		this._ally_twin.style.display = "none";
	}
	
	if($gameTemp.currentBattleEnemy.subTwin){
		var action;
		if(!$gameTemp.enemyTwinAction){
			action = {type: "none"};
		} else {
			action = $gameTemp.enemyTwinAction;
		}
		this._enemy_twin.innerHTML = this.createParticipantBlock($gameTemp.currentBattleEnemy.subTwin, action, false, "enemy");
		this._enemy_twin.style.display = "";
	} else {
		this._enemy_twin.innerHTML = "";
		this._enemy_twin.style.display = "none";
	}
	
	
	if(!$gameTemp.isEnemyAttack){
		this._enemy_label.innerHTML = "Defending";
		this._ally_label.innerHTML = "Attacking";
	} else {
		this._enemy_label.innerHTML = "Attacking";
		this._ally_label.innerHTML = "Defending";
	}
	
	
	
	var spiritEntries = this.getWindowNode().querySelectorAll(".spirit_entry");
	spiritEntries.forEach(function(spiritEntry){
		_this.updateScaledDiv(spiritEntry);
	});
	
	var disableActionButtons = false;
	if(_this._currentUIState != "actor_twin_target_selection" && _this._currentUIState != "enemy_twin_target_selection"){
		disableActionButtons = true;
	}
	var actionButtons = this.getWindowNode().querySelectorAll(".action_btn");
	actionButtons.forEach(function(actionButton){
		if(disableActionButtons && actionButton.getAttribute("action_id") == _this._currentSelection){
			actionButton.classList.add("selected");
		} else {
			actionButton.classList.remove("selected");
		}		
	});
	
	
	if($gameSystem.demoSetting){
		_this._btn_demo.innerHTML = "DEMO: ON";
	} else {
		_this._btn_demo.innerHTML = "DEMO: OFF";
	}
	
	/*if(!$gameTemp.currentBattleActor.isActor()){
		_this._btn_action.style.display = "none";
		_this._btn_assist.style.display = "none";
	} else {
		_this._btn_action.style.display = "";
		_this._btn_assist.style.display = "";
		if($gameTemp.isEnemyAttack){
			_this._btn_action.style.display = "";
		} else {
			_this._btn_action.style.display = "none";
		}
	}*/	
	
	_this._enemy_header.classList.remove("support_selection_header");
	_this.assignFactionColorClass(_this._enemy_header, $gameTemp.currentBattleEnemy);
	_this.assignFactionColorClass(_this._enemy_main, $gameTemp.currentBattleEnemy);
	_this.assignFactionColorClass(_this._enemy_twin, $gameTemp.currentBattleEnemy);
	_this.assignFactionColorClass(_this._enemy_support_1, $gameTemp.currentBattleEnemy);
	_this.assignFactionColorClass(_this._enemy_support_2, $gameTemp.currentBattleEnemy);
	
	_this._ally_header.classList.remove("support_selection_header");
	_this.assignFactionColorClass(_this._ally_header, $gameTemp.currentBattleActor);
	_this.assignFactionColorClass(_this._ally_main, $gameTemp.currentBattleActor);
	_this.assignFactionColorClass(_this._ally_twin, $gameTemp.currentBattleActor);	
	_this.assignFactionColorClass(_this._ally_support_1, $gameTemp.currentBattleActor);
	_this.assignFactionColorClass(_this._ally_support_2, $gameTemp.currentBattleActor);
	
	
	
	_this._support_selection.style.display = "none";
	
	if(_this._currentUIState == "support_selection"){
		_this._enemy_main.style.display = "none";
		_this._enemy_twin.style.display = "none";
		_this._enemy_label.innerHTML = "Choose Assist";
		_this._enemy_header.classList.add("support_selection_header");
		_this._support_selection.style.display = "";
		var content = "";
		content+="<div class='support_candiate_block none scaled_text' id='"+(_this._currentSupportSelection == 0 ? "selected_candidate" : "")+"'>";
		content+="---------";
		content+="</div>";
		if($gameTemp.isEnemyAttack){
			for(var i = 0; i < 4; i++){				
				if($gameTemp.supportDefendCandidates[i]){
					content+="<div class='support_candiate_block' id='"+(i + 1 == _this._currentSupportSelection ? "selected_candidate" : "")+"'>";
					content+=this.createParticipantBlock($gameTemp.supportDefendCandidates[i].actor, $gameTemp.supportDefendCandidates[i].action, true, "ally");
					content+="</div>";
				}				
			}			
		} else {
			for(var i = 0; i < 4; i++){				
				if($gameTemp.supportAttackCandidates[i]){
					content+="<div class='support_candiate_block' id='"+(i + 1 == _this._currentSupportSelection ? "selected_candidate" : "")+"'>";
					content+=this.createParticipantBlock($gameTemp.supportAttackCandidates[i].actor, $gameTemp.supportAttackCandidates[i].action, true, "ally");
					content+="</div>";
				}				
			}
		}
		_this._support_selection.innerHTML = content;
	}
	
	content = "";
	content+="<div class='action_block "+(_this._currentActionSelection == 0 ? "selected" : "")+"'>";
	content+="Attack";
	content+="</div>";
	content+="<div class='action_block "+(_this._currentActionSelection == 1 ? "selected" : "")+"'>";
	content+="Defend";
	content+="</div>";
	content+="<div class='action_block "+(_this._currentActionSelection == 2 ? "selected" : "")+"'>";
	content+="Evade";
	content+="</div>";
	if(_this._currentUIState == "action_selection"){
		_this._action_selection.style.display = "block";
	} else {
		_this._action_selection.style.display = "";
	}
	_this._action_selection.innerHTML = content;
	_this._action_selection.classList.remove("slot_0");
	_this._action_selection.classList.remove("slot_1");
	_this._action_selection.classList.add("slot_"+_this._currentTwinTargetSelection);
	
	var pilotIcons = this.getWindowNode().querySelectorAll(".pilot_icon");
	pilotIcons.forEach(function(pilotIcon){
		_this.updateScaledDiv(pilotIcon);
		var pilotId = pilotIcon.getAttribute("data-pilot");
		_this.loadActorFace(pilotId, pilotIcon);
	});
	
	var pilotIcons = this.getWindowNode().querySelectorAll(".enemy_icon");
	pilotIcons.forEach(function(pilotIcon){
		_this.updateScaledDiv(pilotIcon);
		var pilotId = pilotIcon.getAttribute("data-pilot");
		_this.loadEnemyFace(pilotId, pilotIcon);
	});
	
	_this._targeting_arrows_1.style.transform = "";
	_this._targeting_arrows_1.style.display = "none";
	_this._targeting_arrows_1.style.top = "";
	_this._targeting_arrows_1.src = "img/system/targeting1.png";
	
	_this._targeting_arrows_2.style.transform = "";
	_this._targeting_arrows_2.style.display = "none";
	_this._targeting_arrows_2.style.top = "";
	_this._targeting_arrows_2.src = "img/system/targeting1.png";
	
	if($gameTemp.actorAction.type == "attack"){
		_this._targeting_arrows_1.style.display = "";
	}
	
	if($gameTemp.currentTargetingSettings.actor == "twin"){
		_this._targeting_arrows_1.style.transform = "rotate(-45deg)";
	}	
	
	if($gameTemp.currentTargetingSettings.actor == "all"){
		_this._targeting_arrows_1.src = "img/system/targeting2.png";
		_this._targeting_arrows_1.style.top = "24.5%";
	}
	
	if($gameTemp.currentBattleActor.subTwin){
		if($gameTemp.actorTwinAction && $gameTemp.actorTwinAction.type == "attack"){
			_this._targeting_arrows_2.style.display = "";
		}
		if($gameTemp.currentTargetingSettings.actorTwin == "main"){
			_this._targeting_arrows_2.style.transform = "rotate(45deg)";
		}	
		if($gameTemp.currentTargetingSettings.actor == "all"){
			_this._targeting_arrows_2.src = "img/system/targeting2.png";
			_this._targeting_arrows_2.style.transform = "scaleY(-1)";
			_this._targeting_arrows_2.style.top = "54.5%";
		}	
	}
	
	_this._targeting_arrows_enemy_1.style.transform = "";
	_this._targeting_arrows_enemy_1.style.display = "none";
	_this._targeting_arrows_enemy_1.style.top = "";
	_this._targeting_arrows_enemy_1.src = "img/system/targeting1.png";
	
	_this._targeting_arrows_enemy_2.style.transform = "";
	_this._targeting_arrows_enemy_2.style.display = "none";
	_this._targeting_arrows_enemy_2.style.top = "";
	_this._targeting_arrows_enemy_2.src = "img/system/targeting1.png";
	
	if($gameTemp.enemyAction.type == "attack"){
		_this._targeting_arrows_enemy_1.style.display = "";
	}
	
	if($gameTemp.currentTargetingSettings.enemy == "twin"){
		_this._targeting_arrows_enemy_1.style.transform = "rotate(-45deg)";
	}	
	
	if($gameTemp.currentTargetingSettings.enemy == "all"){
		_this._targeting_arrows_enemy_1.src = "img/system/targeting2.png";
		_this._targeting_arrows_enemy_1.style.top = "24.5%";
	}
	
	if($gameTemp.currentBattleEnemy.subTwin){
		if($gameTemp.enemyTwinAction && $gameTemp.enemyTwinAction.type == "attack"){
			_this._targeting_arrows_enemy_2.style.display = "";
		}
		if($gameTemp.currentTargetingSettings.enemyTwin == "main"){
			_this._targeting_arrows_enemy_2.style.transform = "rotate(45deg)";
		}	
		if($gameTemp.currentTargetingSettings.enemy == "all"){
			_this._targeting_arrows_enemy_2.src = "img/system/targeting2.png";
			_this._targeting_arrows_enemy_2.style.transform = "scaleY(-1) scaleX(-1)";
			_this._targeting_arrows_enemy_2.style.top = "54.5%";
		}	
	}
	
	_this.updateScaledImage(_this._targeting_arrows_1);
	_this.updateScaledImage(_this._targeting_arrows_2);
	
	_this.updateScaledImage(_this._targeting_arrows_enemy_1);
	_this.updateScaledImage(_this._targeting_arrows_enemy_2);
	
	
	this._ally_twin.classList.remove("selected");
	this._ally_main.classList.remove("selected");
	if(this._currentUIState == "actor_twin_target_selection" || this._currentUIState == "enemy_twin_target_selection"){
		_this._ally_label.innerHTML = "Select Action";
		_this._ally_header.classList.add("support_selection_header");
		if(_this._currentTwinTargetSelection == 0){
			this._ally_main.classList.add("selected");
		} else {
			this._ally_twin.classList.add("selected");
		}
	}
	
	this._enemy_twin.classList.remove("selected");
	this._enemy_main.classList.remove("selected");
	if(this._currentUIState == "enemy_twin_target_selection"){
		_this._enemy_label.innerHTML = "Select Target";
		_this._enemy_header.classList.add("support_selection_header");
		if(_this._currentEnemySelection == 0){
			this._enemy_main.classList.add("selected");
		} else {
			this._enemy_twin.classList.add("selected");
		}
	}
	
	Graphics._updateCanvas();
}