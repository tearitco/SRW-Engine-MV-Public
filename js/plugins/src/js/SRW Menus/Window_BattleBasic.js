import Window_CSS from "./Window_CSS.js";
import "./style/Window_BattleBasic.css";

export default function Window_BattleBasic() {
	this.initialize.apply(this, arguments);	
}

Window_BattleBasic.prototype = Object.create(Window_CSS.prototype);
Window_BattleBasic.prototype.constructor = Window_BattleBasic;

Window_BattleBasic.prototype.initialize = function() {
	var _this = this;
	this._processingAction = false;
	this._processingAnimationCount = 0;
	this._animationQueue = [];
	this._requiredImages = [];	
	this._layoutId = "battle_basic";	
	this._timer = 50;
	this._participantInfo = {
		"actor": {
			img: "", 
			participating: false
		},
		"actor_twin": {
			img: "", 
			participating: false
		},
		"actor_supporter": {
			img: "", 
			participating: false
		},
		"actor_supporter_twin": {
			img: "", 
			participating: false
		},
		"enemy": {
			img: "", 
			participating: false
		},
		"enemy_twin": {
			img: "", 
			participating: false
		},
		"enemy_supporter": {
			img: "", 
			participating: false
		},
		"enemy_supporter_twin": {
			img: "", 
			participating: false
		}
	};
	this._participantTypeLookup = {};
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});
		
	this._actionQueue = [];
	
	this._finishing = false;
	this._finishTimer = 0;
}

Window_BattleBasic.prototype.getCurrentSelection = function(){
	return this._mechList.getCurrentSelection();	
}

Window_BattleBasic.prototype.createParticipantComponents = function(componentId, side) {
	var component = {};
	
	var id = this.createId(componentId);
	var previous = document.getElementById(id);
	if(previous){
		previous.parent.removeChild(previous);
	}
	
	var container = document.createElement("div"); 
	
	component.side = side;
	
	container.classList.add("participant_container");
	container.classList.add(side);
	container.id = this.createId(componentId);
	component.container = container;
	
	var unitPicContainer = document.createElement("div");
	unitPicContainer.classList.add("unit_pic_container");
	container.appendChild(unitPicContainer);
	component.unitPicContainer = unitPicContainer;
	
	var image = document.createElement("img");
	image.classList.add("unit_pic");
	unitPicContainer.appendChild(image);
	//this._participantInfo.actor.imgElem = this._actorImg;
	component.image = image;	
	
	var HP = document.createElement("div");
	HP.classList.add("label");
	HP.classList.add("HP_bar");
	
	var HPFill =  document.createElement("div");
	HPFill.classList.add("fill");
	HP.appendChild(HPFill);	
	
	container.appendChild(HP);
	//container.appendChild(HPFill);
	
	component.HP = HP;
	component.HPFill = HPFill;
	
	var damageLabel = document.createElement("div");
	damageLabel.classList.add("label");
	damageLabel.classList.add("damage_label");
	container.appendChild(damageLabel);
	component.damageLabel = damageLabel;
	
	var evadeLabel = document.createElement("div");
	evadeLabel.classList.add("evade_label");
	evadeLabel.classList.add("scaled_text");
	evadeLabel.classList.add("label");
	evadeLabel.innerHTML = "MISS";
	container.appendChild(evadeLabel);
	component.evadeLabel = evadeLabel;
	
	var counterLabel = document.createElement("div");
	counterLabel.classList.add("label");
	counterLabel.classList.add("counter_label");
	counterLabel.classList.add("scaled_text");
	counterLabel.innerHTML = "COUNTER";
	container.appendChild(counterLabel);
	component.counterLabel = counterLabel;
	
	var specialEvadeLabel = document.createElement("div");
	specialEvadeLabel.classList.add("label");
	specialEvadeLabel.classList.add("special_evade_label");
	specialEvadeLabel.classList.add("scaled_text");
	specialEvadeLabel.innerHTML = "DOUBLE IMAGE";
	container.appendChild(specialEvadeLabel);
	component.specialEvadeLabel = specialEvadeLabel;
	
	var barrier = document.createElement("img");
	barrier.classList.add("barrier");
	barrier.setAttribute("src", this.makeImageURL("barrier"));
	container.appendChild(barrier);
	component.barrier = barrier;
	
	var destroyedContainer = document.createElement("div");
	destroyedContainer.classList.add("destroyed_container");
	container.appendChild(destroyedContainer);
	component.destroyedContainer = destroyedContainer;
	
	var destroyed = document.createElement("img");
	destroyed.classList.add("destroyed_anim");
	destroyed.setAttribute("src", this.makeImageURL("destroyed"));
	destroyedContainer.appendChild(destroyed);
	component.destroyed = destroyed;
	
	this._participantComponents[componentId] = component;
}

Window_BattleBasic.prototype.createComponents = function() {
	var _this = this;
	Window_CSS.prototype.createComponents.call(this);
	var windowNode = this.getWindowNode();
	
	this._participantComponents = {};
	
	this.createParticipantComponents("actor", "actor");
	this.createParticipantComponents("actor_twin", "actor");
	this.createParticipantComponents("actor_supporter", "actor");
	this.createParticipantComponents("actor_supporter_twin", "actor");
	
	this.createParticipantComponents("enemy", "enemy");
	this.createParticipantComponents("enemy_twin", "enemy");
	this.createParticipantComponents("enemy_supporter", "enemy");
	this.createParticipantComponents("enemy_supporter_twin", "enemy");
	
	
	
	
	this._bgFadeContainer.innerHTML = "";
	
	this._activeZoneContainer = document.createElement("div");
	this._activeZoneContainer.id = this.createId("active_zone_container");
	
	this._activeZone = document.createElement("div");
	this._activeZone.id = this.createId("active_zone");
		
	Object.keys(_this._participantComponents).forEach(function(type){
		_this._activeZone.appendChild(_this._participantComponents[type].container);
	});
	
	this._activeZoneContainer.appendChild(this._activeZone);	
	
	this._activeZoneContainerGradient = document.createElement("div");
	this._activeZoneContainerGradient.id = this.createId("active_zone_container_gradient");
	this._activeZoneContainer.appendChild(this._activeZoneContainerGradient);
	
	this._activeZoneContainerLeft = document.createElement("div");
	this._activeZoneContainerLeft.id = this.createId("active_zone_container_left");
	this._activeZoneContainer.appendChild(this._activeZoneContainerLeft);
	
	this._activeZoneContainerRight = document.createElement("div");
	this._activeZoneContainerRight.id = this.createId("active_zone_container_right");
	this._activeZoneContainer.appendChild(this._activeZoneContainerRight);
	
	this._activeZoneContainerShadowLeft = document.createElement("div");
	this._activeZoneContainerShadowLeft.id = this.createId("active_zone_container_shadow_left");
	this._activeZoneContainer.appendChild(this._activeZoneContainerShadowLeft);
	
	this._activeZoneContainerShadowRight = document.createElement("div");
	this._activeZoneContainerShadowRight.id = this.createId("active_zone_container_shadow_right");
	this._activeZoneContainer.appendChild(this._activeZoneContainerShadowRight);
	
	
	this._bgFadeContainer.appendChild(this._activeZoneContainer);	
}	

Window_BattleBasic.prototype.loadRequiredImages = function(){
	var _this = this;
	return new Promise(function(resolve, reject){
		var promises = [];
		Object.keys(_this._participantInfo).forEach(function(type){
			var participant = _this._participantInfo[type];
			if(participant.participating){
				promises.push(_this.loadImage(_this.makeImageURL(participant.img)));
			}			
		});
		promises.push(_this.loadImage(_this.makeImageURL("destroyed")));
		promises.push(_this.loadImage(_this.makeImageURL("barrier")));
		Promise.all(promises).then(function(){
			resolve();
		});
	});
}

Window_BattleBasic.prototype.loadImage = function(url){
	return new Promise(function(resolve, reject){
		var img=new Image();
		img.src=url;
		img.onload = resolve;
	});
}

Window_BattleBasic.prototype.readBattleCache = function() {
	var _this = this;
	_this._actionQueue = [];
	
	_this._participantInfo.actor.participating = false;
	_this._participantInfo.actor_twin.participating = false;
	_this._participantInfo.actor_supporter.participating = false;
	_this._participantInfo.actor_supporter_twin.participating = false;
	_this._participantInfo.enemy.participating = false;
	_this._participantInfo.enemy_twin.participating = false;
	_this._participantInfo.enemy_supporter.participating = false;
	_this._participantInfo.enemy_supporter_twin.participating = false;
	Object.keys($gameTemp.battleEffectCache).forEach(function(cacheRef){
		var battleEffect = $gameTemp.battleEffectCache[cacheRef];
		_this._actionQueue[battleEffect.actionOrder] = battleEffect;
		//battleEffect.currentAnimHP = $statCalc.getCalculatedMechStats(battleEffect.ref).currentHP - (battleEffect.HPRestored || 0);
		if(battleEffect.side == "actor"){
			if(battleEffect.type == "initiator" || battleEffect.type == "defender" || battleEffect.type == "twin attack" || battleEffect.type == "twin defend"){
				if(battleEffect.ref.isSubTwin){
					_this._participantInfo.actor_twin.participating = true;
					_this._participantInfo.actor_twin.img = $statCalc.getBasicBattleImage(battleEffect.ref);
					_this._participantInfo.actor_twin.ref = battleEffect.ref;
					_this._participantTypeLookup[cacheRef] = "actor_twin";
				} else {
					_this._participantInfo.actor.participating = true;
					_this._participantInfo.actor.img = $statCalc.getBasicBattleImage(battleEffect.ref);
					_this._participantInfo.actor.ref = battleEffect.ref;
					_this._participantTypeLookup[cacheRef] = "actor";
				}				
			}
			if(battleEffect.type == "support defend" || battleEffect.type == "support attack"){
				if(battleEffect.ref.isSubTwin){
					_this._participantInfo.actor_supporter_twin.participating = true;
					_this._participantInfo.actor_supporter_twin.img = $statCalc.getBasicBattleImage(battleEffect.ref);
					_this._participantInfo.actor_supporter_twin.ref = battleEffect.ref;
					_this._participantTypeLookup[cacheRef] = "actor_supporter_twin";
				} else {
					_this._participantInfo.actor_supporter.participating = true;
					_this._participantInfo.actor_supporter.img = $statCalc.getBasicBattleImage(battleEffect.ref);
					_this._participantInfo.actor_supporter.ref = battleEffect.ref;
					_this._participantTypeLookup[cacheRef] = "actor_supporter";
				}
			}
		} else {
			if(battleEffect.type == "initiator" || battleEffect.type == "defender" || battleEffect.type == "twin attack" || battleEffect.type == "twin defend"){
				if(battleEffect.ref.isSubTwin){
					_this._participantInfo.enemy_twin.participating = true;
					_this._participantInfo.enemy_twin.img = $statCalc.getBasicBattleImage(battleEffect.ref);
					_this._participantInfo.enemy_twin.ref = battleEffect.ref;
					_this._participantTypeLookup[cacheRef] = "enemy_twin";
				} else {
					_this._participantInfo.enemy.participating = true;
					_this._participantInfo.enemy.img = $statCalc.getBasicBattleImage(battleEffect.ref);
					_this._participantInfo.enemy.ref = battleEffect.ref;
					_this._participantTypeLookup[cacheRef] = "enemy";
				}
			}
			if(battleEffect.type == "support defend" || battleEffect.type == "support attack"){
				if(battleEffect.ref.isSubTwin){
					_this._participantInfo.enemy_supporter_twin.participating = true;
					_this._participantInfo.enemy_supporter_twin.img = $statCalc.getBasicBattleImage(battleEffect.ref);
					_this._participantInfo.enemy_supporter_twin.ref = battleEffect.ref;
					_this._participantTypeLookup[cacheRef] = "enemy_supporter_twin";
				} else {
					_this._participantInfo.enemy_supporter.participating = true;
					_this._participantInfo.enemy_supporter.img = $statCalc.getBasicBattleImage(battleEffect.ref);
					_this._participantInfo.enemy_supporter.ref = battleEffect.ref;
					_this._participantTypeLookup[cacheRef] = "enemy_supporter";
				}
			}
		}				
	});
	
	/*Object.keys(_this._participantComponents).forEach(function(type){
		_this._participantComponents[type].container.className = "participant_container "+_this._participantComponents[type].side;
		_this._participantComponents[type].destroyed.className = "destroyed_anim";
		_this._participantComponents[type].container.style.visibility = "visible";
	});*/
	_this.createParticipantComponents();
}

Window_BattleBasic.prototype.show = function() {
	var _this = this;
	this._processingAction = false;
	this._finishing = false;
	var windowNode = this.getWindowNode();
	windowNode.classList.add("beforeView");
	windowNode.classList.remove("beginView");
	windowNode.classList.remove("fadeIn");	
	windowNode.classList.add("fadeIn");
	
	setTimeout(function(){
		windowNode.classList.remove("beforeView");
		windowNode.classList.add("beginView");
	}, 300);
	_this.initTimer = 24;
	_this.createComponents();
	_this.readBattleCache();
	_this.assignFactionColorClass(_this._activeZoneContainerLeft, _this._participantInfo.enemy.ref);
	_this.assignFactionColorClass(_this._activeZoneContainerRight, _this._participantInfo.actor.ref);
	
	_this.loadRequiredImages().then(function(){
		_this._handlingInput = false;
		_this.visible = true;
		_this._redrawRequested = true;
		_this._visibility = "";
		_this.refresh();	
		Graphics._updateCanvas();
	});	
};

Window_BattleBasic.prototype.getHPAnimInfo = function(action, attackRef) {
	var targetMechStats = $statCalc.getCalculatedMechStats(action["attacked"+attackRef].ref);

	var startPercent = Math.floor((action["attacked"+attackRef].currentAnimHP / targetMechStats.maxHP)*100);
	var endPercent = Math.floor(((action["attacked"+attackRef].currentAnimHP - action["damageInflicted"+attackRef]) / targetMechStats.maxHP)*100);
	if(endPercent < 0){
		endPercent = 0;
	}
	return {startPercent: startPercent, endPercent: endPercent};
}

Window_BattleBasic.prototype.getHPRecoveredAnimInfo = function(action) {
	var result = null;
	if(action.HPRestored){
		var targetMechStats = $statCalc.getCalculatedMechStats(action.ref);

		var startPercent = Math.floor((action.currentAnimHP / targetMechStats.maxHP)*100);
		var endPercent = Math.floor(((action.currentAnimHP + action.HPRestored) / targetMechStats.maxHP)*100);
		if(endPercent < 0){
			endPercent = 0;
		}
		result = {startPercent: startPercent, endPercent: endPercent};
	}	
	return result;
}

Window_BattleBasic.prototype.animateHP = function(type, startPercent, endPercent) {
	var _this = this;
	var containerInfo = this._participantComponents[type];
	var elem = containerInfo.HP;
	var fillElem = containerInfo.HPFill;
	elem.style.display = "block";
	fillElem.style.width = startPercent+"%";
	var steps = 100;
	var stepDuration =  400/steps;
	var startTime = Date.now();
	var step = (startPercent - endPercent) / steps;
	var hpDrainInterval = setInterval(function(){
		var ctr = Math.floor((Date.now() - startTime) / stepDuration);
		if(ctr <= steps){
			fillElem.style.width=startPercent - (step * ctr)+"%";;
		} else {
			fillElem.style.width=endPercent;
		}
		if(ctr >= steps + 100){//linger a bit on the final hp value
			clearInterval(hpDrainInterval);
			elem.style.display = "none";
		}
	}, stepDuration);
}

Window_BattleBasic.prototype.animateDamage = function(type, special) {
	var _this = this;
	var containerInfo = this._participantComponents[type];
	containerInfo.damageLabel.style.display = "block";
	containerInfo.damageLabel.className = "scaled_text damage_label label";	
	containerInfo.damageLabel.innerHTML = special.damage;
	this.applyDoubleTime(containerInfo.damageLabel);
	var seName = "SRWHit";
	if(special.crit){
		containerInfo.damageLabel.classList.add("crit");
		seName = "SRWHit_Crit";
	}
	if(special.barrierState == 1){
		seName = "SRWHit_Barrier";
	}
	if(special.barrierState == 2){
		seName = "SRWHit_Barrier_Break";
	}
	
	setTimeout(function(){ containerInfo.damageLabel.style.display = "none" }, 600 * this.getAnimTimeRatio());
	
	var se = {};
	se.name = seName;
	se.pan = 0;
	se.pitch = 100;
	se.volume = 80;
	AudioManager.playSe(se);
}

Window_BattleBasic.prototype.animateDestroy = function(type) {
	var containerInfo = this._participantComponents[type];
	if(containerInfo){
		containerInfo.destroyed.className = "";	
		containerInfo.destroyed.className = "destroyed_anim active";	
		this.applyDoubleTime(containerInfo.destroyed);

		setTimeout(function(){ containerInfo.container.style.visibility = "hidden" }, 400 * this.getAnimTimeRatio());
	}
	
	var se = {};
	se.name = 'SRWExplosion';
	se.pan = 0;
	se.pitch = 100;
	se.volume = 80;
	AudioManager.playSe(se);
}	

Window_BattleBasic.prototype.setUpAnimations = function(nextAction) {
	var _this = this;
	var type;
	if(nextAction.side == "actor"){
		type = "actor";
	} else {
		type = "enemy";
	}
	/*var typeInfo = {
		"actor": {
			support: this._actorSupporter,
			main: this._actor,
			targetSupport: this._enemySupporter,
			targetMain: this._enemy,
			anim_mainAttack: "actor_attack",
			anim_targetSupportDefend: "enemy_support_defend",
			special_targetSupportDamage: "enemy_damage_support",
			special_targetSupportHP: "hp_bar_enemy_support",
			anim_targetSupportReturn: "enemy_support_defend_return",
			anim_targetDamage: "enemy_damage",
			special_targetHP: "hp_bar_enemy",
			special_initiatorHP: "hp_bar_actor",
			special_initiatorSupportHP: "hp_bar_actor_support",
			anim_targetEvade: "evade_enemy",
			special_targetEvade: "enemy_evade",
			anim_targetDestroy: "destroyed_participant",
			special_targetDestroy:  "enemy_destroyed",
			special_targetSupportDestroy:  "enemy_support_destroyed",
			anim_mainReturn: "actor_return",
			special_counterNotification: "actor_counter",
			special_specialEvade: "enemy_special_evade",
			special_supportSpecialEvade: "enemy_support_special_evade",
			special_targetBarrier: "enemy_barrier",
			special_targetSupportBarrier: "enemy_support_barrier",
			
			special_targetParry: "enemy_parry",
			special_targetSupportParry: "enemy_support_parry",
			
			special_targetJamming: "enemy_jamming",
			special_targetSupportJamming: "enemy_support_jamming",
			
			special_targetShootDown: "enemy_shoot_down",
			special_targetSupportShootDown: "enemy_support_shoot_down",
		},
		"enemy": {
			support: this._enemySupporter,
			main: this._enemy,
			targetSupport: this._actorSupporter,
			targetMain: this._actor,
			anim_mainAttack: "enemy_attack",
			anim_targetSupportDefend: "actor_support_defend",
			special_targetSupportDamage: "actor_damage_support",
			special_targetSupportHP: "hp_bar_actor_support",
			anim_targetSupportReturn: "actor_support_defend_return",
			anim_targetDamage: "actor_damage",
			special_targetHP: "hp_bar_actor",
			special_initiatorHP: "hp_bar_enemy",
			special_initiatorSupportHP: "hp_bar_enemy_support",
			anim_targetEvade: "evade_actor",
			special_targetEvade: "actor_evade",
			anim_targetDestroy:  "destroyed_participant",
			special_targetDestroy:  "actor_destroyed",
			special_targetSupportDestroy:  "actor_support_destroyed",
			anim_mainReturn: "enemy_return",
			special_counterNotification: "enemy_counter",
			special_specialEvade: "actor_special_evade",
			special_supportSpecialEvade: "actor_support_special_evade",
			special_targetBarrier: "actor_barrier",
			special_targetSupportBarrier: "actor_support_barrier",
			
			special_targetParry: "actor_parry",
			special_targetSupportParry: "actor_support_parry",
			
			special_targetJamming: "actor_jamming",
			special_targetSupportJamming: "actor_support_jamming",
			
			special_targetShootDown: "actor_shoot_down",
			special_targetSupportShootDown: "actor_support_shoot_down",
		}
	};
	var currentInfo = typeInfo[type];
	var initiator;
	var initiatorIsSupport;
	if(nextAction.type == "support attack"){
		initiator = currentInfo.support;
		initiatorIsSupport = true;
	} else {
		initiator = currentInfo.main;
		initiatorIsSupport = false;
	}
	var target;
	if(nextAction.attacked.type == "support defend"){							
		target = currentInfo.targetSupport;							
	} else {
		target = currentInfo.targetMain;
	}
	
	if(nextAction.counterActivated){
		var counterAnimation =  {target: initiator, type: "counter"};
		counterAnimation.special =  {};
		counterAnimation.special[currentInfo.special_counterNotification] = true;	
		this._animationQueue.push([counterAnimation]);
	}
	
	var attackAnimation = {target: initiator, type: currentInfo.anim_mainAttack};
	attackAnimation.special = {
		attack_start: true
	} 
	this._animationQueue.push([attackAnimation]);
	if(nextAction.hits){
		if(nextAction.attacked.type == "support defend"){
			this._animationQueue.push([{target: target, type: currentInfo.anim_targetSupportDefend}]);
		}							
							
		var animInfo = _this.getHPAnimInfo(nextAction);
		var hpRecoveredAnimInfo = _this.getHPRecoveredAnimInfo(nextAction);
		
		nextAction.attacked.currentAnimHP = nextAction.attacked.currentAnimHP - nextAction.damageInflicted;
		if(nextAction.HPRestored){
			nextAction.currentAnimHP = nextAction.currentAnimHP + nextAction.HPRestored;
		}
		
		if(nextAction.attacked.type == "support defend"){			
			var damageAnimation;
			if(nextAction.damageInflicted > 0){
				damageAnimation = {target: target, type: "damage"};
			} else {
				damageAnimation = {target: target, type: "no_damage"};
			}
			
			damageAnimation.special =  {};
			
			var barrierState = 0;
			if(nextAction.attacked.hasBarrier){
				if(nextAction.attacked.barrierBroken){
					barrierState = 2;
				} else {
					barrierState = 1;
				}
			}
			damageAnimation.special[currentInfo.special_targetSupportDamage] = {damage: nextAction.damageInflicted, crit: nextAction.inflictedCritical, barrierState: barrierState};
			if(nextAction.attacked.hasBarrier && !nextAction.attacked.barrierBroken){
				damageAnimation.special[currentInfo.special_targetSupportBarrier] = true;
			}
			this._animationQueue.push([damageAnimation]);
			
			var hpBarAnimation = {target: target, type: "hp_bar"}
			hpBarAnimation.special =  {};
			hpBarAnimation.special[currentInfo.special_targetSupportHP] =  {startPercent: animInfo.startPercent, endPercent: animInfo.endPercent};
			
			if(hpRecoveredAnimInfo){
				//var hpBarAnimation = {target:initiator, type: "hp_bar"}
				//hpBarAnimation.special =  {};
				hpBarAnimation.special[initiatorIsSupport ? currentInfo.special_initiatorSupportHP : currentInfo.special_initiatorHP] =  {startPercent: hpRecoveredAnimInfo.startPercent, endPercent: hpRecoveredAnimInfo.endPercent};
				
				//this._animationQueue.push([hpBarAnimation]);
			}
			this._animationQueue.push([hpBarAnimation]);
			
			if(nextAction.attacked.currentAnimHP <= 0){
				var destroyAnimation = {target: target, type: currentInfo.anim_targetDestroy};
				destroyAnimation.special = {};
				destroyAnimation.special[currentInfo.special_targetSupportDestroy] = true;		
				this._animationQueue.push([destroyAnimation]);
			} else {
				this._animationQueue.push([{target: target, type: currentInfo.anim_targetSupportReturn}]);
			}			
		} else {
			var damageAnimation;
			if(nextAction.damageInflicted > 0){
				damageAnimation = {target: target, type: "damage"};
			} else {
				damageAnimation = {target: target, type: "no_damage"};
			}
			
			damageAnimation.special =  {};
			var barrierState = 0;
			if(nextAction.attacked.hasBarrier){
				if(nextAction.attacked.barrierBroken){
					barrierState = 2;
				} else {
					barrierState = 1;
				}
			}
			damageAnimation.special[currentInfo.anim_targetDamage] = {damage: nextAction.damageInflicted, crit: nextAction.inflictedCritical, barrierState: barrierState};
			if(nextAction.attacked.hasBarrier && !nextAction.attacked.barrierBroken){
				damageAnimation.special[currentInfo.special_targetBarrier] = true;
			}
			this._animationQueue.push([damageAnimation]);

			var hpBarAnimation = {target: target, type: "hp_bar"}
			hpBarAnimation.special =  {};
			hpBarAnimation.special[currentInfo.special_targetHP] =  {startPercent: animInfo.startPercent, endPercent: animInfo.endPercent};
				
			
			if(hpRecoveredAnimInfo){
				//var hpBarAnimation = {target:initiator, type: "hp_bar"}
				//hpBarAnimation.special =  {};
				hpBarAnimation.special[initiatorIsSupport ? currentInfo.special_initiatorSupportHP : currentInfo.special_initiatorHP] =  {startPercent: hpRecoveredAnimInfo.startPercent, endPercent: hpRecoveredAnimInfo.endPercent};
				
				//this._animationQueue.push([hpBarAnimation]);
			}
			
			this._animationQueue.push([hpBarAnimation]);
			
			if(nextAction.attacked.currentAnimHP <= 0){
				var destroyAnimation = {target: target, type: currentInfo.anim_targetDestroy};
				destroyAnimation.special = {};
				destroyAnimation.special[currentInfo.special_targetDestroy] = true;		
				this._animationQueue.push([destroyAnimation]);
			} 
		}
	} else {
		var evadeAnimation;
		
		if(nextAction.attacked.specialEvasion){
			var patternId = nextAction.attacked.specialEvasion.dodgePattern;
			var animDef = {
				basic_anim: "no_damage",
				se: "SRWMiss"
			};
			if(patternId != null && ENGINE_SETTINGS.DODGE_PATTERNS[patternId]){
				animDef =  ENGINE_SETTINGS.DODGE_PATTERNS[patternId];
			}
			
			animDef.name = nextAction.attacked.specialEvasion.name;
			
			var evadeAnimation = animDef.basic_anim;
			
			
			if(nextAction.attacked.type == "support defend"){				
				this._animationQueue.push([{target: target, type: currentInfo.anim_targetSupportDefend}]);			
			 
				evadeAnimation = {target: target, type: evadeAnimation};
				evadeAnimation.special = {};
				evadeAnimation.special[currentInfo.special_supportSpecialEvade] = animDef;
				this._animationQueue.push([evadeAnimation]);
						
				this._animationQueue.push([{target: target, type: currentInfo.anim_targetSupportReturn}]);			
			} else {
				evadeAnimation = {target: target, type: evadeAnimation};
				evadeAnimation.special = {};
				evadeAnimation.special[currentInfo.special_specialEvade] = animDef;
				this._animationQueue.push([evadeAnimation]);
			}
		} else {
			evadeAnimation = {target: currentInfo.targetMain, type: currentInfo.anim_targetEvade};
			evadeAnimation.special = {};
			evadeAnimation.special[currentInfo.special_targetEvade] = true;		
			this._animationQueue.push([evadeAnimation])	
		}		
	}
	
	this._animationQueue.push([{target: initiator, type: currentInfo.anim_mainReturn}]);*/
	
	var initiator;
	if(nextAction.type == "support attack" || nextAction.type == "support defend"){
		initiator = _this._participantTypeLookup[nextAction.ref._supportCacheReference];
	} else {
		initiator = _this._participantTypeLookup[nextAction.ref._cacheReference];
	}
	
	var target;
	if(nextAction.attacked){
		if(nextAction.attacked.type == "support defend" || nextAction.attacked.type == "support attack"){							
			target = _this._participantTypeLookup[nextAction.attacked.ref._supportCacheReference];						
		} else {
			target = _this._participantTypeLookup[nextAction.attacked.ref._cacheReference];		
		}	
	}
	
	var allTarget;
	if(nextAction.attacked_all_sub){
		if(nextAction.attacked_all_sub.type == "support defend" || nextAction.attacked_all_sub.type == "support attack"){							
			allTarget = _this._participantTypeLookup[nextAction.attacked_all_sub.ref._supportCacheReference];						
		} else {
			allTarget = _this._participantTypeLookup[nextAction.attacked_all_sub.ref._cacheReference];		
		}
	}
	
	
	if(nextAction.counterActivated){
		var counterAnimation =  {target: initiator, type: "counter"};
		counterAnimation.special =  {};
		counterAnimation.special["counterActivated"] = nextAction.side;	
		this._animationQueue.push([counterAnimation]);
	}
	
	var attackAnimation = {target: initiator, type: "startAttack"};
	attackAnimation.special = {
		attack_start: true
	} 
	this._animationQueue.push([attackAnimation]);
	
	var attackAnimationSubQueue = {
		supportDefendAnimation: null,
		damageAnimation: [],
		hpBarAnimation: [],
		destroyAnimation: [],
		evadeAnimation: [],
		supportDefendReturnAnimation: null,
	};
	
	if(target){
		processBattleAnimations("", target);
	}
	
	if(allTarget){
		processBattleAnimations("_all_sub", allTarget);
	}
	
	
	var hpRecoveredAnimInfo = _this.getHPRecoveredAnimInfo(nextAction);
	if(nextAction.HPRestored){
		nextAction.currentAnimHP = nextAction.currentAnimHP + nextAction.HPRestored;
	}
	
	if(hpRecoveredAnimInfo && attackAnimationSubQueue.hpBarAnimation[0]){			
		attackAnimationSubQueue.hpBarAnimation[0].special["hp_bar_recover"] =  {target: initiator, startPercent: hpRecoveredAnimInfo.startPercent, endPercent: hpRecoveredAnimInfo.endPercent};
	}
	
	if(attackAnimationSubQueue.supportDefendAnimation){
		this._animationQueue.push([attackAnimationSubQueue.supportDefendAnimation]);
	}
	
	this._animationQueue.push(attackAnimationSubQueue.damageAnimation.concat(attackAnimationSubQueue.evadeAnimation));
	
	if(attackAnimationSubQueue.hpBarAnimation.length){
		this._animationQueue.push(attackAnimationSubQueue.hpBarAnimation);
	}
	
	if(attackAnimationSubQueue.destroyAnimation.length){
		this._animationQueue.push(attackAnimationSubQueue.destroyAnimation);
	}
	
	if(attackAnimationSubQueue.supportDefendReturnAnimation){
		this._animationQueue.push([attackAnimationSubQueue.supportDefendReturnAnimation]);
	}
	
	
	
	
	function processBattleAnimations(attackRef, target){
		if(nextAction["hits"+attackRef]){
			if(nextAction["attacked"+attackRef].type == "support defend"){
				if(nextAction["attacked"+attackRef].ref.isSubTwin){
					attackAnimationSubQueue.supportDefendAnimation = {target: target, type: "supportDefendSub"};
				} else {
					attackAnimationSubQueue.supportDefendAnimation = {target: target, type: "supportDefend"};
				}				
			}
			
			var animInfo = _this.getHPAnimInfo(nextAction, attackRef);
			
			
			nextAction["attacked"+attackRef].currentAnimHP = nextAction["attacked"+attackRef].currentAnimHP - nextAction["damageInflicted"+attackRef];		
			
			
			
			
			var damageAnimation;
			if(nextAction["damageInflicted"+attackRef] > 0){
				damageAnimation = {target: target, type: "damage"};
			} else {
				damageAnimation = {target: target, type: "no_damage"};
			}
			
			damageAnimation.special =  {};
			var barrierState = 0;
			if(nextAction["attacked"+attackRef].hasBarrier){
				if(nextAction["attacked"+attackRef].barrierBroken){
					barrierState = 2;
				} else {
					barrierState = 1;
				}
			}
			damageAnimation.special["damage"] = {target: target, damage: nextAction["damageInflicted"+attackRef], crit: nextAction.inflictedCritical, barrierState: barrierState};
			if(nextAction["attacked"+attackRef].hasBarrier && !nextAction["attacked"+attackRef].barrierBroken){
				damageAnimation.special["barrier"] = {target: target};
			}
			attackAnimationSubQueue.damageAnimation.push(damageAnimation);
			
			var hpBarAnimation = {target: target, type: "hp_bar"}
			hpBarAnimation.special =  {};
			hpBarAnimation.special["hp_bar"] =  {target: target, startPercent: animInfo.startPercent, endPercent: animInfo.endPercent};
			
			
			attackAnimationSubQueue.hpBarAnimation.push(hpBarAnimation);
					
			if(nextAction["attacked"+attackRef].currentAnimHP <= 0){
				var destroyAnimation = {target: target, type: "destroyed_participant"};
				destroyAnimation.special = {};
				destroyAnimation.special["destroy"] = {target: target};		
				attackAnimationSubQueue.destroyAnimation.push(destroyAnimation);
			} else if(nextAction["attacked"+attackRef].type == "support defend"){
				if(nextAction["attacked"+attackRef].ref.isSubTwin){
					attackAnimationSubQueue.supportDefendReturnAnimation = {target: target, type: "supportDefendSubReturn"};
				} else {
					attackAnimationSubQueue.supportDefendReturnAnimation = {target: target, type: "supportDefendReturn"};
				}
			}
			
		} else {
			var evadeAnimation;
			
			if(nextAction["attacked"+attackRef].specialEvasion){
				var patternId = nextAction["attacked"+attackRef].specialEvasion.dodgePattern;
				var animDef = {
					basic_anim: "no_damage",
					se: "SRWMiss",
					
				};
				if(patternId != null && ENGINE_SETTINGS.DODGE_PATTERNS[patternId]){
					animDef =  ENGINE_SETTINGS.DODGE_PATTERNS[patternId];
				}
				
				animDef.name = nextAction["attacked"+attackRef].specialEvasion.name;
				animDef.target = target;
				
				var evadeAnimation = animDef.basic_anim;
				
				
				if(nextAction["attacked"+attackRef].type == "support defend"){				
					attackAnimationSubQueue.supportDefendAnimation = {target: target, type: "supportDefend"};		
				 
					evadeAnimation = {target: target, type: evadeAnimation};
					evadeAnimation.special = {};
					evadeAnimation.special["special_evade"] = animDef;

					attackAnimationSubQueue.evadeAnimation.push(evadeAnimation);
							
					attackAnimationSubQueue.supportDefendReturnAnimation = {target: target, type: "supportDefendReturn"};		
				} else {
					evadeAnimation = {target: target, type: evadeAnimation};
					evadeAnimation.special = {};
					evadeAnimation.special["special_evade"] = animDef;
					attackAnimationSubQueue.evadeAnimation.push(evadeAnimation);
				}
			} else {
				evadeAnimation = {target: target, type: "evade"};
				evadeAnimation.special = {};
				evadeAnimation.special["evade"] = {target: target};		
				attackAnimationSubQueue.evadeAnimation.push(evadeAnimation);
			}
		}
	}
	
	this._animationQueue.push([{target: initiator, type: "return"}]);
}

Window_BattleBasic.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){
		//return;
		if(_this.initTimer > 0){
			_this.initTimer--;
			return;
		}
		
		
		
		if(this._finishing){
			if(this._finishTimer <= 0 && !$gameTemp.pauseBasicBattle){
				this._finishing = false;
				$gameTemp.popMenu = true;
				$gameSystem.setSubBattlePhase('after_battle');
			}
			this._finishTimer--;
		}
		
		if(!this._processingAction){
			var nextAction = this._actionQueue.shift();
			while((!nextAction || !nextAction.hasActed || nextAction.action.type == "defend" || nextAction.action.type == "evade" || nextAction.action.type == "none") && this._actionQueue.length){
				nextAction = this._actionQueue.shift();
			}
			if(nextAction && (!nextAction.hasActed || nextAction.action.type == "defend" || nextAction.action.type == "evade" || nextAction.action.type == "none")){
				nextAction = null;
			}
			if(!nextAction){
				if(!this._finishing){
					this._finishing = true;
					this._finishTimer = 20;
				}							
			} else {
				//this._actor.className = "participant_container";
				//this._enemy.className = "participant_container";
				this.setUpAnimations(nextAction);
				this._processingAction = true;
				this._processingAnimation = false;
			}			
		} else {
			if(this._processingAnimationCount <= 0){
				_this._processingAnimationCount = 0;
				var nextAnimations = this._animationQueue.shift();
				if(nextAnimations){
					this._processingAnimation = true;					
					
					for(var i = 0; i < nextAnimations.length; i++){
						_this._processingAnimationCount++;
						var nextAnimation = nextAnimations[i];
						var componentInfo = _this._participantComponents[nextAnimation.target];
						var target = _this._participantComponents[nextAnimation.target].container;
						target.className = "";
						void target.offsetWidth;
						target.className = "participant_container "+componentInfo.side;
						
						target.classList.add(nextAnimation.type);
						target.style["animation-duration"] = "";
						
						/*componentInfo.unitPicContainer.className = "";
						componentInfo.unitPicContainer.className = "unit_pic_container";
						componentInfo.unitPicContainer.style["animation-duration"] = "";
						
						componentInfo.image.className = "";
						componentInfo.image.className = "unit_pic";
						componentInfo.image.style["animation-duration"] = "";*/
						
						_this.applyDoubleTime(target);
						target.addEventListener("animationend", function(){
							//nextAnimation.target.className = "";
							_this._processingAnimationCount--;
						});
						if(nextAnimation.special){
							if(nextAnimation.special.damage){
								_this.animateDamage(nextAnimation.special.damage.target, nextAnimation.special.damage);		
							}
							
							if(nextAnimation.special.hp_bar){								
								_this.animateHP(nextAnimation.special.hp_bar.target, nextAnimation.special.hp_bar.startPercent, nextAnimation.special.hp_bar.endPercent);
							}
							
							if(nextAnimation.special.hp_bar_recover){								
								_this.animateHP(nextAnimation.special.hp_bar_recover.target, nextAnimation.special.hp_bar_recover.startPercent, nextAnimation.special.hp_bar_recover.endPercent);
							}

							if(nextAnimation.special.destroy){								
								_this.animateDestroy(nextAnimation.special.destroy.target);								
							}
							

							if(nextAnimation.special.barrier){
								var target = _this._participantComponents[nextAnimation.special.barrier.target].barrier;
								target.style.display = "block";
								setTimeout(function(){ target.style.display = "none" }, 600 * _this.getAnimTimeRatio());	
							}								
							
							if(nextAnimation.special.attack_start){
								var se = {};
								se.name = 'SRWAttack';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);									
							}	

							if(nextAnimation.special.evade){
								var target = _this._participantComponents[nextAnimation.special.evade.target].evadeLabel;
								target.style.display = "block";
								setTimeout(function(){ target.style.display = "none" }, 200 * _this.getAnimTimeRatio());	

								var se = {};
								se.name = 'SRWMiss';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);
							}							


							if(nextAnimation.special.special_evade){
								var target = _this._participantComponents[nextAnimation.special.special_evade.target].specialEvadeLabel;
								var def = nextAnimation.special.special_evade;
								target.style.display = "block";
								target.innerHTML = def.name;
								setTimeout(function(){ target.style.display = "none" }, 200 * _this.getAnimTimeRatio());	

								var se = {};
								se.name = def.se;
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);		
							}	
								
							
							
							if(nextAnimation.special.enemy_counter){
								_this._enemyCounter.style.display = "block";
								setTimeout(function(){ _this._enemyCounter.style.display = "none" }, 200 * _this.getAnimTimeRatio());		
							}
							if(nextAnimation.special.actor_counter){
								_this._actorCounter.style.display = "block";
								setTimeout(function(){ _this._actorCounter.style.display = "none" }, 200 * _this.getAnimTimeRatio());		
							}
														
							
						}
					}
					Graphics._updateCanvas();					
				} else {
					this._processingAction = false;
				}			
			}
		}		
		/*this._timer--;
		if(this._timer < 0){
			$gameTemp.popMenu = true;
			$gameSystem.setSubBattlePhase('after_battle');
		}*/
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			//this.requestRedraw();

		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			//this.requestRedraw();
	
		}			

		if(Input.isTriggered('left') || Input.isRepeated('left')){
			//this.requestRedraw();
	
		} else if (Input.isTriggered('right') || Input.isRepeated('right')) {
			//this.requestRedraw();
	
		}
		
		if(Input.isTriggered('left_trigger') || Input.isRepeated('left_trigger')){
			//this.requestRedraw();
		
		} else if (Input.isTriggered('right_trigger') || Input.isRepeated('right_trigger')) {
			//this.requestRedraw();
			
		}
		
		if (Input.isTriggered('ok') || Input.isPressed('ok')) {
			this._doubleSpeedEnabled = true;
			this.getWindowNode().classList.add("double_speed");
		} else {
			this._doubleSpeedEnabled = false;
			this.getWindowNode().classList.remove("double_speed"); //debug should be remove for final!
		}
		
		if(Input.isTriggered('pageup')){
			//this.requestRedraw();
			//this.readBattleCache();
		} 	
		
		if(Input.isTriggered('ok')){
			
		}
		if(Input.isTriggered('cancel')){				
			//$gameTemp.popMenu = true;	
		}		
		
		this.refresh();
	}		
};

Window_BattleBasic.prototype.makeImageURL = function(name) {
	return "img/basic_battle/"+name+".png";
}

Window_BattleBasic.prototype.redraw = function() {	
	var _this = this;
	Object.keys(_this._participantInfo).forEach(function(type){
		var participant = _this._participantInfo[type];
		if(participant.participating && _this._participantComponents[type]){
			//participant.imgElem.setAttribute("src", _this.makeImageURL(participant.img));
			//_this.updateScaledImage(participant.imgElem);
			var containerInfo = _this._participantComponents[type];
			containerInfo.image.setAttribute("src", _this.makeImageURL(participant.img));
			_this.updateScaledDiv(containerInfo.container);
			_this.updateScaledDiv(containerInfo.HP);
			_this.updateScaledDiv(containerInfo.destroyedContainer);
			_this.updateScaledImage(containerInfo.destroyed);
			_this.updateScaledImage(containerInfo.barrier);
		}			
	});	
		
	Graphics._updateCanvas();
}

