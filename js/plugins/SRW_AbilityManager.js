function AbilityManager(){
	this._abilityDefinitions = [];
	this.initDefinitions();	
}

AbilityManager.prototype.addDefinition = function(idx, name, desc, hasLevel, isUnique, statmodHandler, isActiveHandler, cost, maxLevel){
	var _this = this;
	this._abilityDefinitions[idx] = {
		name: name,
		desc: desc,
		hasLevel: hasLevel,
		isUnique: isUnique,
		statmodHandler: statmodHandler,
		isActiveHandler: isActiveHandler,
		cost: cost,
		maxLevel: maxLevel
	};
	if(statmodHandler){
		this._abilityDefinitions[idx].statmodHandler = statmodHandler;
	} else {
		this._abilityDefinitions[idx].statmodHandler = function(){return {}}
	}
	if(isActiveHandler){
		this._abilityDefinitions[idx].isActiveHandler = isActiveHandler;
	} else {
		this._abilityDefinitions[idx].isActiveHandler = function(){return true;}
	}
}

AbilityManager.prototype.getDefinitionCount = function(){
	return this._abilityDefinitions.length;
}

AbilityManager.prototype.getAbilityDisplayInfo = function(idx){
	var abilityDef = this._abilityDefinitions[idx];
	var result = {
		name: "",
		desc: "",
		hasLevel: false,
		isUnique: false,
		isActiveHandler: function(){return false;},
		cost: 0,
		maxLevel: 1
	};
	if(abilityDef){
		result.name = abilityDef.name;
		result.desc = abilityDef.desc;
		result.hasLevel = abilityDef.hasLevel;
		result.isUnique = abilityDef.isUnique;
		result.isActiveHandler = abilityDef.isActiveHandler;
		result.cost = abilityDef.cost;
		result.maxLevel = abilityDef.maxLevel;
	}
	return result;
}

AbilityManager.prototype.getAbilityDef = function(idx){
	return this._abilityDefinitions[idx];
}

AbilityManager.prototype.isActive = function(actor, idx, level){
	return this.getAbilityDef(idx).isActiveHandler(actor, level);
}

AbilityManager.prototype.getStatmod = function(actor, idx, level){
	return this.getAbilityDef(idx).statmodHandler(actor, level);
}

function PilotAbilityManager(){
	this._parent = AbilityManager.prototype;
	this._parent.constructor.call(this);
}

PilotAbilityManager.prototype = Object.create(AbilityManager.prototype);
PilotAbilityManager.prototype.constructor = PilotAbilityManager;

PilotAbilityManager.prototype.initDefinitions = function(){
	$SRWConfig.pilotAbilties.call(this);
}

function MechAbilityManager(){
	this._parent = AbilityManager.prototype;
	this._parent.constructor.call(this);
}

MechAbilityManager.prototype = Object.create(AbilityManager.prototype);
MechAbilityManager.prototype.constructor = MechAbilityManager;

MechAbilityManager.prototype.initDefinitions = function(){
	$SRWConfig.mechAbilties.call(this);
}

//isunique flag is used to indicate a consumable
function ItemEffectManager(){
	this._parent = AbilityManager.prototype;
	this._parent.constructor.call(this);
}

ItemEffectManager.prototype = Object.create(AbilityManager.prototype);
ItemEffectManager.prototype.constructor = ItemEffectManager;


ItemEffectManager.prototype.applyConsumable = function(actor, itemIdx){
	var effectHandlers = {
		"HP_recover": function(value){
			$statCalc.recoverHPPercent(actor, value);
		},
		"EN_recover": function(value){
			$statCalc.recoverENPercent(actor, value);
		},
		"ammo_recover": function(value){
			$statCalc.recoverAmmoPercent(actor, value);
		}
		,
		"SP_recover": function(value){
			$statCalc.recoverSP(actor, value);
		},
		"miracle": function(value){
			$statCalc.modifyWill(actor, 10);
			$statCalc.setSpirit(actor, "accel");
			$statCalc.setSpirit(actor, "strike");
			$statCalc.setSpirit(actor, "alert");
			$statCalc.setSpirit(actor, "valor");
			$statCalc.setSpirit(actor, "spirit");
			$statCalc.setSpirit(actor, "gain");
			$statCalc.setSpirit(actor, "fortune");
			$statCalc.setSpirit(actor, "soul");
			$statCalc.setSpirit(actor, "zeal");
			$statCalc.setSpirit(actor, "persist");
			$statCalc.setSpirit(actor, "wall");
			$statCalc.setSpirit(actor, "focus");
			$statCalc.setSpirit(actor, "snipe");
		},
		"victory_turn": function(value){
			$statCalc.setTempEffect(actor, "victory_turn");
		}
	};
	var effects = this.getAbilityDef(itemIdx).statmodHandler();	
	effects.forEach(function(effect){
		if(effectHandlers[effect.type]){
			effectHandlers[effect.type](effect.value);
		}
	});	
}

ItemEffectManager.prototype.initDefinitions = function(){
	$SRWConfig.itemEffects.call(this);
}

function WeaponEffectManager(){
	this._parent = AbilityManager.prototype;
	this._parent.constructor.call(this);
}

WeaponEffectManager.prototype = Object.create(AbilityManager.prototype);
WeaponEffectManager.prototype.constructor = WeaponEffectManager;

WeaponEffectManager.prototype.initDefinitions = function(){
	$SRWConfig.weaponEffects.call(this);
}

function AbilityCommandManger(){
	this._parent = AbilityManager.prototype;
	this._parent.constructor.call(this);
}

AbilityCommandManger.prototype = Object.create(AbilityManager.prototype);
AbilityCommandManger.prototype.constructor = AbilityCommandManger;

AbilityCommandManger.prototype.initDefinitions = function(){
	$SRWConfig.abilityCommands.call(this);
}

AbilityCommandManger.prototype.addDefinition = function(idx, name, desc, useCount, statmodHandler, isActiveHandler, animId){
	var _this = this;
	this._abilityDefinitions[idx] = {
		name: name,
		desc: desc,
		useCount: useCount,
		statmodHandler: statmodHandler,
		isActiveHandler: isActiveHandler,
		animId: animId
	};
	if(statmodHandler){
		this._abilityDefinitions[idx].statmodHandler = statmodHandler;
	} else {
		this._abilityDefinitions[idx].statmodHandler = function(){return {}}
	}
	if(isActiveHandler){
		this._abilityDefinitions[idx].isActiveHandler = isActiveHandler;
	} else {
		this._abilityDefinitions[idx].isActiveHandler = function(){return true;}
	}
}

AbilityCommandManger.prototype.getAbilityDisplayInfo = function(idx){
	var abilityDef = this._abilityDefinitions[idx];
	var result = {
		name: "",
		desc: "",
		useCount: 0,
		isActiveHandler: function(){return false;},
	};
	if(abilityDef){
		result.name = abilityDef.name;
		result.desc = abilityDef.desc;
		result.useCount = abilityDef.useCount;
		result.isActiveHandler = abilityDef.isActiveHandler;
	}
	return result;
}