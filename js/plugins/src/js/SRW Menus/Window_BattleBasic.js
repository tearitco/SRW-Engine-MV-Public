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
		"actor_supporter": {
			img: "", 
			participating: false
		},
		"enemy": {
			img: "", 
			participating: false
		},
		"enemy_supporter": {
			img: "", 
			participating: false
		}
	};
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

Window_BattleBasic.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	var windowNode = this.getWindowNode();
	
	
	//this._actor.classList.add("scaled_width");
	//this._actor.classList.add("scaled_height");
	this._actor = document.createElement("div");
	this._actor.classList.add("participant_container");
	this._actor.id = this.createId("actor");
	this._actorImg = document.createElement("img");
	this._actor.appendChild(this._actorImg);
	this._participantInfo.actor.imgElem = this._actorImg;
	
	this._actorHP = document.createElement("div");
	this._actorHP.id = this.createId("actorHP");
	this._actorHPFill = document.createElement("div");
	this._actorHPFill.id = this.createId("actorHPFill");
	this._actorHP.appendChild(this._actorHPFill);	
	
	this._actorSupporter = document.createElement("div");
	this._actorSupporter.classList.add("participant_container");
	this._actorSupporter.id = this.createId("actor_supporter");
	this._actorSupporterImg = document.createElement("img");
	this._actorSupporter.appendChild(this._actorSupporterImg);
	this._participantInfo.actor_supporter.imgElem = this._actorSupporterImg;
	
	this._actorSupporterHP = document.createElement("div");
	this._actorSupporterHP.id = this.createId("actorSupporterHP");
	this._actorSupporterHPFill = document.createElement("div");
	this._actorSupporterHPFill.id = this.createId("actorHPFill");
	this._actorSupporterHP.appendChild(this._actorSupporterHPFill);
	
	this._enemy = document.createElement("div");
	this._enemy.classList.add("participant_container");
	this._enemy.id = this.createId("enemy");
	this._enemyImg = document.createElement("img");
	this._enemy.appendChild(this._enemyImg);
	this._participantInfo.enemy.imgElem = this._enemyImg;
	
	this._enemyHP = document.createElement("div");
	this._enemyHP.id = this.createId("enemyHP");
	this._enemyHPFill = document.createElement("div");
	this._enemyHPFill.id = this.createId("enemyHPFill");
	this._enemyHP.appendChild(this._enemyHPFill);
		
	this._enemySupporter = document.createElement("div");
	this._enemySupporter.classList.add("participant_container");
	this._enemySupporter.id = this.createId("enemy_supporter");
	this._enemySupporterImg = document.createElement("img");
	this._enemySupporter.appendChild(this._enemySupporterImg);
	this._participantInfo.enemy_supporter.imgElem = this._enemySupporterImg;
	
	this._enemySupporterHP = document.createElement("div");
	this._enemySupporterHP.id = this.createId("enemySupporterHP");
	this._enemySupporterHPFill = document.createElement("div");
	this._enemySupporterHPFill.id = this.createId("enemyHPFill");
	this._enemySupporterHP.appendChild(this._enemySupporterHPFill);	
	
	this._actorDamage = document.createElement("div");
	this._actorDamage.id = this.createId("actor_damage");
	
	this._actorSupportDamage = document.createElement("div");
	this._actorSupportDamage.id = this.createId("actor_damage_support");
	
	this._actorEvade = document.createElement("div");
	this._actorEvade.id = this.createId("actor_evade");
	this._actorEvade.classList.add("scaled_text");
	this._actorEvade.innerHTML = "MISS";
	
	this._enemyEvade = document.createElement("div");
	this._enemyEvade.id = this.createId("enemy_evade");
	this._enemyEvade.classList.add("scaled_text");
	this._enemyEvade.innerHTML = "MISS";
	
	this._enemyDamage = document.createElement("div");
	this._enemyDamage.id = this.createId("enemy_damage");
	
	this._enemySupportDamage = document.createElement("div");
	this._enemySupportDamage.id = this.createId("enemy_damage_support");
	
	this._enemyDestroyed = document.createElement("div");
	this._enemyDestroyed.id = this.createId("enemy_destroyed");
	this._enemyDestroyedImageContainer = document.createElement("div");
	this._enemyDestroyedImageContainer.classList.add("destroyed_anim_container");
	this._enemyDestroyedImage = document.createElement("img");
	this._enemyDestroyedImage.classList.add("destroyed_anim");
	this._enemyDestroyedImage.setAttribute("src", this.makeImageURL("destroyed"));
	this._enemyDestroyedImageContainer.appendChild(this._enemyDestroyedImage);
	this._enemyDestroyed.appendChild(this._enemyDestroyedImageContainer);
	
	this._enemySupportDestroyed = document.createElement("div");
	this._enemySupportDestroyed.id = this.createId("enemy_support_destroyed");
	this._enemySupportDestroyedImageContainer = document.createElement("div");
	this._enemySupportDestroyedImageContainer.classList.add("destroyed_anim_container");
	this._enemySupportDestroyedImage = document.createElement("img");
	this._enemySupportDestroyedImage.classList.add("destroyed_anim");
	this._enemySupportDestroyedImage.setAttribute("src", this.makeImageURL("destroyed"));
	this._enemySupportDestroyedImageContainer.appendChild(this._enemySupportDestroyedImage);
	this._enemySupportDestroyed.appendChild(this._enemySupportDestroyedImageContainer);
	
	this._actorDestroyed = document.createElement("div");
	this._actorDestroyed.id = this.createId("actor_destroyed");
	this._actorDestroyedImageContainer = document.createElement("div");
	this._actorDestroyedImageContainer.classList.add("destroyed_anim_container");
	this._actorDestroyedImage = document.createElement("img");
	this._actorDestroyedImage.classList.add("destroyed_anim");
	this._actorDestroyedImage.setAttribute("src", this.makeImageURL("destroyed"));
	this._actorDestroyedImageContainer.appendChild(this._actorDestroyedImage);
	this._actorDestroyed.appendChild(this._actorDestroyedImageContainer);
	
	this._actorSupportDestroyed = document.createElement("div");
	this._actorSupportDestroyed.id = this.createId("actor_support_destroyed");
	this._actorSupportDestroyedImageContainer = document.createElement("div");
	this._actorSupportDestroyedImageContainer.classList.add("destroyed_anim_container");
	this._actorSupportDestroyedImage = document.createElement("img");
	this._actorSupportDestroyedImage.classList.add("destroyed_anim");
	this._actorSupportDestroyedImage.setAttribute("src", this.makeImageURL("destroyed"));
	this._actorSupportDestroyedImageContainer.appendChild(this._actorSupportDestroyedImage);
	this._actorSupportDestroyed.appendChild(this._actorSupportDestroyedImageContainer);
	
	this._actorCounter = document.createElement("div");
	this._actorCounter.id = this.createId("actor_counter");	
	this._actorCounter.classList.add("scaled_text");
	this._actorCounter.innerHTML = "COUNTER";
	
	this._enemyCounter = document.createElement("div");
	this._enemyCounter.id = this.createId("enemy_counter");
	this._enemyCounter.classList.add("scaled_text");
	this._enemyCounter.innerHTML = "COUNTER";
	
	this._actorDoubleImage = document.createElement("div");
	this._actorDoubleImage.id = this.createId("actor_double_image");	
	this._actorDoubleImage.classList.add("scaled_text");
	this._actorDoubleImage.innerHTML = "DOUBLE IMAGE";
	
	this._enemyDoubleImage = document.createElement("div");
	this._enemyDoubleImage.id = this.createId("enemy_double_image");
	this._enemyDoubleImage.classList.add("scaled_text");
	this._enemyDoubleImage.innerHTML = "DOUBLE IMAGE";	
	
	this._actorSupportDoubleImage = document.createElement("div");
	this._actorSupportDoubleImage.id = this.createId("actor_support_double_image");	
	this._actorSupportDoubleImage.classList.add("scaled_text");
	this._actorSupportDoubleImage.innerHTML = "DOUBLE IMAGE";
	
	this._enemySupportDoubleImage = document.createElement("div");
	this._enemySupportDoubleImage.id = this.createId("enemy_support_double_image");
	this._enemySupportDoubleImage.classList.add("scaled_text");
	this._enemySupportDoubleImage.innerHTML = "DOUBLE IMAGE";
	
	this._actorBarrier = document.createElement("div");
	this._actorBarrier.id = this.createId("actor_barrier");
	this._actorBarrierImage = document.createElement("img");
	this._actorBarrierImage.setAttribute("src", this.makeImageURL("barrier"));
	this._actorBarrier.appendChild(this._actorBarrierImage);	
	
	this._enemyBarrier = document.createElement("div");
	this._enemyBarrier.id = this.createId("enemy_barrier");
	this._enemyBarrierImage = document.createElement("img");
	this._enemyBarrierImage.setAttribute("src", this.makeImageURL("barrier"));
	this._enemyBarrier.appendChild(this._enemyBarrierImage);
	
	this._actorSupportBarrier = document.createElement("div");
	this._actorSupportBarrier.id = this.createId("actor_support_barrier");
	this._actorSupportBarrierImage = document.createElement("img");
	this._actorSupportBarrierImage.setAttribute("src", this.makeImageURL("barrier"));
	this._actorSupportBarrier.appendChild(this._actorSupportBarrierImage);	
	
	this._enemySupportBarrier = document.createElement("div");
	this._enemySupportBarrier.id = this.createId("enemy_support_barrier");
	this._enemySupportBarrierImage = document.createElement("img");
	this._enemySupportBarrierImage.setAttribute("src", this.makeImageURL("barrier"));
	this._enemySupportBarrier.appendChild(this._enemySupportBarrierImage);
	

	
	this._bgFadeContainer.innerHTML = "";
	
	this._activeZoneContainer = document.createElement("div");
	this._activeZoneContainer.id = this.createId("active_zone_container");
	
	this._activeZone = document.createElement("div");
	this._activeZone.id = this.createId("active_zone");
	
	this._activeZone.appendChild(this._actor);	
	this._activeZone.appendChild(this._actorSupporter);	
	this._activeZone.appendChild(this._enemy);	
	this._activeZone.appendChild(this._enemySupporter);	
	
	this._activeZone.appendChild(this._enemyDamage);	
	this._activeZone.appendChild(this._actorDamage);	
	this._activeZone.appendChild(this._enemySupportDamage);	
	this._activeZone.appendChild(this._actorSupportDamage);
	this._activeZone.appendChild(this._actorEvade);	
	this._activeZone.appendChild(this._enemyEvade);	
	
	this._activeZone.appendChild(this._enemyDestroyed);	
	this._activeZone.appendChild(this._actorDestroyed);

	this._activeZone.appendChild(this._enemySupportDestroyed);	
	this._activeZone.appendChild(this._actorSupportDestroyed);		
	
	this._activeZone.appendChild(this._enemyHP);	
	this._activeZone.appendChild(this._actorHP);	
	this._activeZone.appendChild(this._enemySupporterHP);
	this._activeZone.appendChild(this._actorSupporterHP);	
	
	this._activeZone.appendChild(this._actorCounter);	
	this._activeZone.appendChild(this._enemyCounter);	
	
	this._activeZone.appendChild(this._actorDoubleImage);	
	this._activeZone.appendChild(this._enemyDoubleImage);
	
	this._activeZone.appendChild(this._actorSupportDoubleImage);	
	this._activeZone.appendChild(this._enemySupportDoubleImage);
	
	this._activeZone.appendChild(this._actorBarrier);
	this._activeZone.appendChild(this._enemyBarrier);
	this._activeZone.appendChild(this._actorSupportBarrier);
	this._activeZone.appendChild(this._enemySupportBarrier);
	
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
	//_this._requiredImages.push("img/basic_battle/test.png");
	_this._participantInfo.actor.participating = false;
	_this._participantInfo.actor_supporter.participating = false;
	_this._participantInfo.enemy.participating = false;
	_this._participantInfo.enemy_supporter.participating = false;
	Object.keys($gameTemp.battleEffectCache).forEach(function(cacheRef){
		var battleEffect = $gameTemp.battleEffectCache[cacheRef];
		_this._actionQueue[battleEffect.actionOrder] = battleEffect;
		battleEffect.currentAnimHP = $statCalc.getCalculatedMechStats(battleEffect.ref).currentHP;
		if(battleEffect.side == "actor"){
			if(battleEffect.type == "initiator" || battleEffect.type == "defender"){
				_this._participantInfo.actor.participating = true;
				_this._participantInfo.actor.img = $statCalc.getBasicBattleImage(battleEffect.ref);
				_this._participantInfo.actor.ref = battleEffect.ref;
			}
			if(battleEffect.type == "support defend" || battleEffect.type == "support attack"){
				_this._participantInfo.actor_supporter.participating = true;
				_this._participantInfo.actor_supporter.img = $statCalc.getBasicBattleImage(battleEffect.ref);
				_this._participantInfo.actor_supporter.ref = battleEffect.ref;
			}
		} else {
			if(battleEffect.type == "initiator" || battleEffect.type == "defender"){
				_this._participantInfo.enemy.participating = true;
				_this._participantInfo.enemy.img = $statCalc.getBasicBattleImage(battleEffect.ref);
				_this._participantInfo.enemy.ref = battleEffect.ref;
			}
			if(battleEffect.type == "support defend" || battleEffect.type == "support attack"){
				_this._participantInfo.enemy_supporter.participating = true;
				_this._participantInfo.enemy_supporter.img = $statCalc.getBasicBattleImage(battleEffect.ref);
				_this._participantInfo.enemy_supporter.ref = battleEffect.ref;
			}
		}				
	});
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

Window_BattleBasic.prototype.getHPAnimInfo = function(action) {
	var targetMechStats = $statCalc.getCalculatedMechStats(action.attacked.ref);

	var startPercent = Math.floor((action.attacked.currentAnimHP / targetMechStats.maxHP)*100);
	var endPercent = Math.floor(((action.attacked.currentAnimHP - action.damageInflicted) / targetMechStats.maxHP)*100);
	if(endPercent < 0){
		endPercent = 0;
	}
	return {startPercent: startPercent, endPercent: endPercent};
}

Window_BattleBasic.prototype.animateHP = function(elem, fillElem, startPercent, endPercent) {
	var _this = this;
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

Window_BattleBasic.prototype.animateDamage = function(elem, special) {
	var _this = this;
	elem.style.display = "block";
	elem.className = "scaled_text";	
	elem.innerHTML = special.damage;
	this.applyDoubleTime(elem);
	
	if(special.crit){
		elem.classList.add("crit");
	}
	setTimeout(function(){ elem.style.display = "none" }, 600 * this.getAnimTimeRatio());
	
	var se = {};
	se.name = 'SRWHit';
	se.pan = 0;
	se.pitch = 100;
	se.volume = 80;
	AudioManager.playSe(se);
}

Window_BattleBasic.prototype.animateDestroy = function(elem, imgElem) {
	elem.style.display = "block";
	imgElem.className = "";	
	imgElem.className = "destroyed_anim";	
	this.applyDoubleTime(imgElem);

	setTimeout(function(){ elem.style.display = "none" }, 400 * this.getAnimTimeRatio());
	
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
	var typeInfo = {
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
			anim_targetEvade: "evade_enemy",
			special_targetEvade: "enemy_evade",
			anim_targetDestroy: "destroyed_participant",
			special_targetDestroy:  "enemy_destroyed",
			special_targetSupportDestroy:  "enemy_support_destroyed",
			anim_mainReturn: "actor_return",
			special_counterNotification: "actor_counter",
			special_targetDoubleImage: "enemy_double_image",
			special_targetSupportDoubleImage: "enemy_support_double_image",
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
			anim_targetEvade: "evade_actor",
			special_targetEvade: "actor_evade",
			anim_targetDestroy:  "destroyed_participant",
			special_targetDestroy:  "actor_destroyed",
			special_targetSupportDestroy:  "actor_support_destroyed",
			anim_mainReturn: "enemy_return",
			special_counterNotification: "enemy_counter",
			special_targetDoubleImage: "actor_double_image",
			special_targetSupportDoubleImage: "actor_support_double_image",
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
	if(nextAction.type == "support attack"){
		initiator = currentInfo.support;
	} else {
		initiator = currentInfo.main;
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
	this._animationQueue.push([attackAnimation]);
	if(nextAction.hits){
		if(nextAction.attacked.type == "support defend"){
			this._animationQueue.push([{target: target, type: currentInfo.anim_targetSupportDefend}]);
		}							
							
		var animInfo = _this.getHPAnimInfo(nextAction);
		nextAction.attacked.currentAnimHP = nextAction.attacked.currentAnimHP - nextAction.damageInflicted;
		if(nextAction.attacked.type == "support defend"){			
			var damageAnimation;
			if(nextAction.damageInflicted > 0){
				damageAnimation = {target: target, type: "damage"};
			} else {
				damageAnimation = {target: target, type: "no_damage"};
			}
			
			damageAnimation.special =  {};
			damageAnimation.special[currentInfo.special_targetSupportDamage] = {damage: nextAction.damageInflicted, crit: nextAction.inflictedCritical};
			if(nextAction.attacked.hasBarrier && !nextAction.attacked.barrierBroken){
				damageAnimation.special[currentInfo.special_targetSupportBarrier] = true;
			}
			this._animationQueue.push([damageAnimation]);
			
			var hpBarAnimation = {target: target, type: "hp_bar"}
			hpBarAnimation.special =  {};
			hpBarAnimation.special[currentInfo.special_targetSupportHP] =  {startPercent: animInfo.startPercent, endPercent: animInfo.endPercent};
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
		/*	var damageAnimation = {target: target, type: "damage"};
			damageAnimation.special =  {};
			damageAnimation.special[currentInfo.anim_targetDamage] = {damage: nextAction.damageInflicted, crit: nextAction.inflictedCritical};
			this._animationQueue.push([damageAnimation]);*/
			
			var damageAnimation;
			if(nextAction.damageInflicted > 0){
				damageAnimation = {target: target, type: "damage"};
			} else {
				damageAnimation = {target: target, type: "no_damage"};
			}
			
			damageAnimation.special =  {};
			damageAnimation.special[currentInfo.anim_targetDamage] = {damage: nextAction.damageInflicted, crit: nextAction.inflictedCritical};
			if(nextAction.attacked.hasBarrier && !nextAction.attacked.barrierBroken){
				damageAnimation.special[currentInfo.special_targetBarrier] = true;
			}
			this._animationQueue.push([damageAnimation]);

			var hpBarAnimation = {target: target, type: "hp_bar"}
			hpBarAnimation.special =  {};
			hpBarAnimation.special[currentInfo.special_targetHP] =  {startPercent: animInfo.startPercent, endPercent: animInfo.endPercent};
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
		if(nextAction.attacked.isDoubleImage){
			if(nextAction.attacked.type == "support defend"){				
				this._animationQueue.push([{target: target, type: currentInfo.anim_targetSupportDefend}]);			
			 
				evadeAnimation = {target: target, type: "double_image"};
				evadeAnimation.special = {};
				evadeAnimation.special[currentInfo.special_targetSupportDoubleImage] = true;
				this._animationQueue.push([evadeAnimation]);
						
				this._animationQueue.push([{target: target, type: currentInfo.anim_targetSupportReturn}]);			
			} else {
				evadeAnimation = {target: target, type: "double_image"};
				evadeAnimation.special = {};
				evadeAnimation.special[currentInfo.special_targetDoubleImage] = true;
				this._animationQueue.push([evadeAnimation]);
			}					
		} if(nextAction.attacked.isParry){
			if(nextAction.attacked.type == "support defend"){				
				this._animationQueue.push([{target: target, type: currentInfo.anim_targetSupportDefend}]);			
			 
				evadeAnimation = {target: target, type: "no_damage"};
				evadeAnimation.special = {};
				evadeAnimation.special[currentInfo.special_targetSupportParry] = true;
				this._animationQueue.push([evadeAnimation]);
						
				this._animationQueue.push([{target: target, type: currentInfo.anim_targetSupportReturn}]);			
			} else {
				evadeAnimation = {target: target, type: "no_damage"};
				evadeAnimation.special = {};
				evadeAnimation.special[currentInfo.special_targetParry] = true;
				this._animationQueue.push([evadeAnimation]);
			}					
		} else if(nextAction.attacked.isJamming){
			if(nextAction.attacked.type == "support defend"){				
				this._animationQueue.push([{target: target, type: currentInfo.anim_targetSupportDefend}]);			
			 
				evadeAnimation = {target: target, type: "no_damage"};
				evadeAnimation.special = {};
				evadeAnimation.special[currentInfo.special_targetSupportJamming] = true;
				this._animationQueue.push([evadeAnimation]);
						
				this._animationQueue.push([{target: target, type: currentInfo.anim_targetSupportReturn}]);			
			} else {
				evadeAnimation = {target: target, type: "no_damage"};
				evadeAnimation.special = {};
				evadeAnimation.special[currentInfo.special_targetJamming] = true;
				this._animationQueue.push([evadeAnimation]);
			}					
		} else if(nextAction.attacked.isShootDown){
			if(nextAction.attacked.type == "support defend"){				
				this._animationQueue.push([{target: target, type: currentInfo.anim_targetSupportDefend}]);			
			 
				evadeAnimation = {target: target, type: "no_damage"};
				evadeAnimation.special = {};
				evadeAnimation.special[currentInfo.special_targetSupportShootDown] = true;
				this._animationQueue.push([evadeAnimation]);
						
				this._animationQueue.push([{target: target, type: currentInfo.anim_targetSupportReturn}]);			
			} else {
				evadeAnimation = {target: target, type: "no_damage"};
				evadeAnimation.special = {};
				evadeAnimation.special[currentInfo.special_targetShootDown] = true;
				this._animationQueue.push([evadeAnimation]);
			}					
		} else {
			evadeAnimation = {target: currentInfo.targetMain, type: currentInfo.anim_targetEvade};
			evadeAnimation.special = {};
			evadeAnimation.special[currentInfo.special_targetEvade] = true;		
			this._animationQueue.push([evadeAnimation])	
		}		
	}
	
	this._animationQueue.push([{target: initiator, type: currentInfo.anim_mainReturn}]);
}





Window_BattleBasic.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){
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
				this._actor.className = "participant_container";
				this._enemy.className = "participant_container";
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
						nextAnimation.target.className = "participant_container";
						nextAnimation.target.classList.add(nextAnimation.type);
						nextAnimation.target.style["animation-duration"] = "";
						
						_this.applyDoubleTime(nextAnimation.target);
						nextAnimation.target.addEventListener("animationend", function(){
							//nextAnimation.target.className = "";
							_this._processingAnimationCount--;
						});
						if(nextAnimation.special){
							if(nextAnimation.special.enemy_damage){
								_this.animateDamage(_this._enemyDamage, nextAnimation.special.enemy_damage);										
							}
							if(nextAnimation.special.actor_damage){
								_this.animateDamage(_this._actorDamage, nextAnimation.special.actor_damage);										
							}
							if(nextAnimation.special.actor_damage_support){
								_this.animateDamage(_this._actorSupportDamage, nextAnimation.special.actor_damage_support);										
							}
							if(nextAnimation.special.enemy_damage_support){
								_this.animateDamage(_this._enemySupportDamage, nextAnimation.special.enemy_damage_support);										
							}
							if(nextAnimation.special.enemy_evade){
								_this._enemyEvade.style.display = "block";
								setTimeout(function(){ _this._enemyEvade.style.display = "none" }, 200 * _this.getAnimTimeRatio());	

								var se = {};
								se.name = 'SRWMiss';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);
							}
							if(nextAnimation.special.actor_evade){
								_this._actorEvade.style.display = "block";
								setTimeout(function(){ _this._actorEvade.style.display = "none" }, 200 * _this.getAnimTimeRatio());

								var se = {};
								se.name = 'SRWMiss';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);	
							}
							if(nextAnimation.special.enemy_destroyed){
								_this.animateDestroy(_this._enemyDestroyed, _this._enemyDestroyedImage);	
							}
							if(nextAnimation.special.enemy_support_destroyed){
								_this.animateDestroy(_this._enemySupportDestroyed, _this._enemySupportDestroyedImage);									
							}
							if(nextAnimation.special.actor_destroyed){
								_this.animateDestroy(_this._actorDestroyed, _this._actorDestroyedImage);									
							}
							if(nextAnimation.special.actor_support_destroyed){
								_this.animateDestroy(_this._actorSupportDestroyed, _this._actorSupportDestroyedImage);									
							}					
							
							if(nextAnimation.special.hp_bar_enemy){								
								_this.animateHP(_this._enemyHP, _this._enemyHPFill, nextAnimation.special.hp_bar_enemy.startPercent, nextAnimation.special.hp_bar_enemy.endPercent);
							}
							if(nextAnimation.special.hp_bar_actor){								
								_this.animateHP(_this._actorHP, _this._actorHPFill, nextAnimation.special.hp_bar_actor.startPercent, nextAnimation.special.hp_bar_actor.endPercent);
							}
							if(nextAnimation.special.hp_bar_enemy_support){								
								_this.animateHP(_this._enemySupporterHP, _this._enemySupporterHPFill, nextAnimation.special.hp_bar_enemy_support.startPercent, nextAnimation.special.hp_bar_enemy_support.endPercent);
							}
							if(nextAnimation.special.hp_bar_actor_support){								
								_this.animateHP(_this._actorSupporterHP, _this._actorSupporterHPFill, nextAnimation.special.hp_bar_actor_support.startPercent, nextAnimation.special.hp_bar_actor_support.endPercent);
							}
							if(nextAnimation.special.enemy_counter){
								_this._enemyCounter.style.display = "block";
								setTimeout(function(){ _this._enemyCounter.style.display = "none" }, 200 * _this.getAnimTimeRatio());		
							}
							if(nextAnimation.special.actor_counter){
								_this._actorCounter.style.display = "block";
								setTimeout(function(){ _this._actorCounter.style.display = "none" }, 200 * _this.getAnimTimeRatio());		
							}
														
							if(nextAnimation.special.enemy_double_image){
								_this._enemyDoubleImage.style.display = "block";
								_this._enemyDoubleImage.innerHTML = "DOUBLE IMAGE";
								setTimeout(function(){ _this._enemyDoubleImage.style.display = "none" }, 200 * _this.getAnimTimeRatio());	

								var se = {};
								se.name = 'SRWDoubleImage';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);		
							}
							if(nextAnimation.special.actor_double_image){
								_this._actorDoubleImage.style.display = "block";
								_this._actorDoubleImage.innerHTML = "DOUBLE IMAGE";
								setTimeout(function(){ _this._actorDoubleImage.style.display = "none" }, 200 * _this.getAnimTimeRatio());	

								var se = {};
								se.name = 'SRWDoubleImage';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);								
							}
							if(nextAnimation.special.enemy_support_double_image){
								_this._enemySupportDoubleImage.style.display = "block";
								_this._enemySupportDoubleImage.innerHTML = "DOUBLE IMAGE";
								setTimeout(function(){ _this._enemySupportDoubleImage.style.display = "none" }, 200 * _this.getAnimTimeRatio());	

								var se = {};
								se.name = 'SRWDoubleImage';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);		
							}
							if(nextAnimation.special.actor_support_double_image){
								_this._actorSupportDoubleImage.style.display = "block";
								_this._actorSupportDoubleImage.innerHTML = "DOUBLE IMAGE";
								setTimeout(function(){ _this._actorSupportDoubleImage.style.display = "none" }, 200 * _this.getAnimTimeRatio());	

								var se = {};
								se.name = 'SRWDoubleImage';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);									
							}
							
							if(nextAnimation.special.enemy_parry){
								_this._enemyDoubleImage.style.display = "block";
								_this._enemyDoubleImage.innerHTML = "PARRY";
								setTimeout(function(){ _this._enemyDoubleImage.style.display = "none" }, 200 * _this.getAnimTimeRatio());	

								var se = {};
								se.name = 'SRWParry';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);		
							}
							if(nextAnimation.special.actor_parry){
								_this._actorDoubleImage.style.display = "block";
								_this._actorDoubleImage.innerHTML = "PARRY";
								setTimeout(function(){ _this._actorDoubleImage.style.display = "none" }, 200 * _this.getAnimTimeRatio());	

								var se = {};
								se.name = 'SRWParry';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);								
							}
							if(nextAnimation.special.enemy_support_parry){
								_this._enemySupportDoubleImage.style.display = "block";
								_this._enemySupportDoubleImage.innerHTML = "PARRY";
								setTimeout(function(){ _this._enemySupportDoubleImage.style.display = "none" }, 200 * _this.getAnimTimeRatio());	

								var se = {};
								se.name = 'SRWParry';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);		
							}
							if(nextAnimation.special.actor_support_parry){
								_this._actorSupportDoubleImage.style.display = "block";
								_this._actorSupportDoubleImage.innerHTML = "PARRY";
								setTimeout(function(){ _this._actorSupportDoubleImage.style.display = "none" }, 200 * _this.getAnimTimeRatio());	

								var se = {};
								se.name = 'SRWParry';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);									
							}
							
							if(nextAnimation.special.enemy_jamming){
								_this._enemyDoubleImage.style.display = "block";
								_this._enemyDoubleImage.innerHTML = "JAMMING";
								setTimeout(function(){ _this._enemyDoubleImage.style.display = "none" }, 200 * _this.getAnimTimeRatio());	

								var se = {};
								se.name = 'SRWJamming';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);		
							}
							if(nextAnimation.special.actor_jamming){
								_this._actorDoubleImage.style.display = "block";
								_this._actorDoubleImage.innerHTML = "JAMMING";
								setTimeout(function(){ _this._actorDoubleImage.style.display = "none" }, 200 * _this.getAnimTimeRatio());	

								var se = {};
								se.name = 'SRWJamming';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);								
							}
							if(nextAnimation.special.enemy_support_jamming){
								_this._enemySupportDoubleImage.style.display = "block";
								_this._enemySupportDoubleImage.innerHTML = "JAMMING";
								setTimeout(function(){ _this._enemySupportDoubleImage.style.display = "none" }, 200 * _this.getAnimTimeRatio());	

								var se = {};
								se.name = 'SRWJamming';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);		
							}
							if(nextAnimation.special.actor_support_jamming){
								_this._actorSupportDoubleImage.style.display = "block";
								_this._actorSupportDoubleImage.innerHTML = "JAMMING";
								setTimeout(function(){ _this._actorSupportDoubleImage.style.display = "none" }, 200 * _this.getAnimTimeRatio());	

								var se = {};
								se.name = 'SRWJamming';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);									
							}
							
							if(nextAnimation.special.enemy_shoot_down){
								_this._enemyDoubleImage.style.display = "block";
								_this._enemyDoubleImage.innerHTML = "SHOOT DOWN";
								setTimeout(function(){ _this._enemyDoubleImage.style.display = "none" }, 200 * _this.getAnimTimeRatio());	

								var se = {};
								se.name = 'SRWShootDown';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);		
							}
							if(nextAnimation.special.actor_shoot_down){
								_this._actorDoubleImage.style.display = "block";
								_this._actorDoubleImage.innerHTML = "SHOOT DOWN";
								setTimeout(function(){ _this._actorDoubleImage.style.display = "none" }, 200 * _this.getAnimTimeRatio());	

								var se = {};
								se.name = 'SRWShootDown';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);								
							}
							if(nextAnimation.special.enemy_support_shoot_down){
								_this._enemySupportDoubleImage.style.display = "block";
								_this._enemySupportDoubleImage.innerHTML = "SHOOT DOWN";
								setTimeout(function(){ _this._enemySupportDoubleImage.style.display = "none" }, 200 * _this.getAnimTimeRatio());	

								var se = {};
								se.name = 'SRWShootDown';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);		
							}
							if(nextAnimation.special.actor_support_shoot_down){
								_this._actorSupportDoubleImage.style.display = "block";
								_this._actorSupportDoubleImage.innerHTML = "SHOOT DOWN";
								setTimeout(function(){ _this._actorSupportDoubleImage.style.display = "none" }, 200 * _this.getAnimTimeRatio());	

								var se = {};
								se.name = 'SRWShootDown';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);									
							}
							
							if(nextAnimation.special.actor_barrier){
								_this._actorBarrier.style.display = "block";
								setTimeout(function(){ _this._actorBarrier.style.display = "none" }, 600 * _this.getAnimTimeRatio());	

								var se = {};
								se.name = 'SRWShield';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);		
							}
							if(nextAnimation.special.actor_support_barrier){
								_this._actorSupportBarrier.style.display = "block";
								setTimeout(function(){ _this._actorSupportBarrier.style.display = "none" }, 600 * _this.getAnimTimeRatio());	
								
								var se = {};
								se.name = 'SRWShield';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);	
							}
							if(nextAnimation.special.enemy_barrier){
								_this._enemyBarrier.style.display = "block";
								setTimeout(function(){ _this._enemyBarrier.style.display = "none" }, 600 * _this.getAnimTimeRatio());		
								
								var se = {};
								se.name = 'SRWShield';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);
							}
							if(nextAnimation.special.enemy_support_barrier){
								_this._enemySupportBarrier.style.display = "block";
								setTimeout(function(){ _this._enemySupportBarrier.style.display = "none" }, 600 * _this.getAnimTimeRatio());

								var se = {};
								se.name = 'SRWShield';
								se.pan = 0;
								se.pitch = 100;
								se.volume = 80;
								AudioManager.playSe(se);	
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
			this.readBattleCache();
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
		if(participant.participating){
			participant.imgElem.setAttribute("src", _this.makeImageURL(participant.img));
			//_this.updateScaledImage(participant.imgElem);
		}			
	});	
	_this.updateScaledImage(_this._enemyDestroyedImage);
	_this.updateScaledImage(_this._actorDestroyedImage);
	_this.updateScaledImage(_this._enemySupportDestroyedImage);
	_this.updateScaledImage(_this._actorSupportDestroyedImage);
	
	_this.updateScaledDiv(_this._enemyDestroyed);
	_this.updateScaledDiv(_this._actorDestroyed);
	_this.updateScaledDiv(_this._enemySupportDestroyed);
	_this.updateScaledDiv(_this._actorSupportDestroyed);
	
	_this.updateScaledDiv(_this._enemyHP);
	_this.updateScaledDiv(_this._enemySupporterHP);
	_this.updateScaledDiv(_this._actorHP);
	_this.updateScaledDiv(_this._actorSupporterHP);
	
	_this.updateScaledDiv(_this._actorBarrier);
	_this.updateScaledDiv(_this._enemyBarrier);
	_this.updateScaledDiv(_this._actorSupportBarrier);
	_this.updateScaledDiv(_this._enemySupportBarrier);
	
	_this.updateScaledImage(_this._actorBarrierImage);
	_this.updateScaledImage(_this._enemyBarrierImage);
	_this.updateScaledImage(_this._actorSupportBarrierImage);
	_this.updateScaledImage(_this._enemySupportBarrierImage);
	
	_this.updateScaledDiv(_this._actor);
	_this.updateScaledDiv(_this._actorSupporter);
	_this.updateScaledDiv(_this._enemy);
	_this.updateScaledDiv(_this._enemySupporter);
	Graphics._updateCanvas();
}

