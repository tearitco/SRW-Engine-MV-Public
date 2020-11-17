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
	this.addDefinition(
		0, 
		"Attacker", 
		"Final damage times 1.2 at 130 Will or higher.", 
		false,
		true,
		function(actor, level){
			return [{type: "final_damage", modType: "mult", value: 1.2}];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130;
		},
		[0],
		1
	);
	this.addDefinition(
		1, 
		"Guard", 
		"Reduces damage taken by 20% at 130 Will or higher.", 
		false,
		false,
		function(actor, level){
			return [{type: "final_defend", modType: "mult", value: 0.8}];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130;
		},
		[150],
		1
	);
	this.addDefinition(
		2, 
		"In-Fight", 
		"Melee Damage and Movement Range increase with Level.", 
		true,
		true,
		function(actor, level){
			var effectTable = [
				[{type: "weapon_melee", modType: "addFlat", value: 50}], //1
				[{type: "weapon_melee", modType: "addFlat", value: 100}], //2
				[{type: "weapon_melee", modType: "addFlat", value: 150}], //3
				[{type: "weapon_melee", modType: "addFlat", value: 150}, {type: "movement", modType: "addFlat", value: 1}], //4
				[{type: "weapon_melee", modType: "addFlat", value: 200}, {type: "movement", modType: "addFlat", value: 1}], //5
				[{type: "weapon_melee", modType: "addFlat", value: 250}, {type: "movement", modType: "addFlat", value: 1}], //6
				[{type: "weapon_melee", modType: "addFlat", value: 250}, {type: "movement", modType: "addFlat", value: 2}], //7
				[{type: "weapon_melee", modType: "addFlat", value: 300}, {type: "movement", modType: "addFlat", value: 2}], //8
				[{type: "weapon_melee", modType: "addFlat", value: 350}, {type: "movement", modType: "addFlat", value: 2}], //9				
			];
			if(effectTable[level-1]){
				return effectTable[level-1];
			} else {
				return [];
			}			
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	this.addDefinition(
		3, 
		"Gunfight", 
		"Ranged Damage and Range increase with Level.", 
		true,
		true,
		function(actor, level){
			var effectTable = [
				[{type: "weapon_ranged", modType: "addFlat", value: 50}], //1
				[{type: "weapon_ranged", modType: "addFlat", value: 100}], //2
				[{type: "weapon_ranged", modType: "addFlat", value: 150}], //3
				[{type: "weapon_ranged", modType: "addFlat", value: 150}, {type: "range", modType: "addFlat", value: 1}], //4
				[{type: "weapon_ranged", modType: "addFlat", value: 200}, {type: "range", modType: "addFlat", value: 1}], //5
				[{type: "weapon_ranged", modType: "addFlat", value: 250}, {type: "range", modType: "addFlat", value: 1}], //6
				[{type: "weapon_ranged", modType: "addFlat", value: 250}, {type: "range", modType: "addFlat", value: 2}], //7
				[{type: "weapon_ranged", modType: "addFlat", value: 300}, {type: "range", modType: "addFlat", value: 2}], //8
				[{type: "weapon_ranged", modType: "addFlat", value: 350}, {type: "range", modType: "addFlat", value: 2}], //9				
			];
			if(effectTable[level-1]){
				return effectTable[level-1];
			} else {
				return [];
			}			
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	this.addDefinition(
		4, 
		"Prevail", 
		"Hit, Evade, Armor and Critical go up as HP decreases.", 
		true,
		false,
		function(actor, level){
			var mechStats = $statCalc.getCalculatedMechStats(actor);		
			var targetSlice = Math.floor(mechStats.currentHP / mechStats.maxHP * 10);
			var hitEvadeMod = (level - targetSlice) * 0.05;
			if(hitEvadeMod < 0){
				hitEvadeMod = 0;
			}
			var armorMod = (level - targetSlice) * 0.1;
			if(armorMod < 0){
				armorMod = 0;
			}
			var critMod = (level - targetSlice) * 0.08;
			if(armorMod < 0){
				armorMod = 0;
			}
			return [
				{type: "hit", modType: "addFlat", value: hitEvadeMod * 100},
				{type: "evade", modType: "addFlat", value: hitEvadeMod * 100},
				{type: "armor", modType: "addPercent", value: armorMod},
				{type: "crit", modType: "addFlat", value: critMod * 100},
			];
		},
		function(actor, level){
			var mechStats = $statCalc.getCalculatedMechStats(actor);	
			var targetSlice = Math.floor(mechStats.currentHP / mechStats.maxHP * 10);
			return (targetSlice + 1) <= level;
		},
		[20,30,40,50,60,70,80,90,100],
		9
	);
	this.addDefinition(
		5, 
		"Attuned", 
		"Hit, Evade, Armor and Critical go up with Level.", 
		true,
		true,
		function(actor, level){
			var effectTable = [
				[{type: "hit", modType: "addFlat", value: 0},{type: "evade", modType: "addFlat", value: 0},{type: "armor", modType: "addFlat", value: 0},{type: "crit", modType: "addFlat", value: 0}], //1
				[{type: "hit", modType: "addFlat", value: 2},{type: "evade", modType: "addFlat", value: 2},{type: "armor", modType: "addFlat", value: 0},{type: "crit", modType: "addFlat", value: 1}], //2
				[{type: "hit", modType: "addFlat", value: 4},{type: "evade", modType: "addFlat", value: 4},{type: "armor", modType: "addFlat", value: 100},{type: "crit", modType: "addFlat", value: 3}], //3
				[{type: "hit", modType: "addFlat", value: 6},{type: "evade", modType: "addFlat", value: 6},{type: "armor", modType: "addFlat", value: 100},{type: "crit", modType: "addFlat", value: 5}], //4
				[{type: "hit", modType: "addFlat", value: 8},{type: "evade", modType: "addFlat", value: 8},{type: "armor", modType: "addFlat", value: 100},{type: "crit", modType: "addFlat", value: 7}], //5
				[{type: "hit", modType: "addFlat", value: 10},{type: "evade", modType: "addFlat", value: 10},{type: "armor", modType: "addFlat", value: 200},{type: "crit", modType: "addFlat", value: 9}], //6
				[{type: "hit", modType: "addFlat", value: 12},{type: "evade", modType: "addFlat", value: 12},{type: "armor", modType: "addFlat", value: 200},{type: "crit", modType: "addFlat", value: 11}], //7
				[{type: "hit", modType: "addFlat", value: 14},{type: "evade", modType: "addFlat", value: 14},{type: "armor", modType: "addFlat", value: 200},{type: "crit", modType: "addFlat", value: 13}], //8
				[{type: "hit", modType: "addFlat", value: 16},{type: "evade", modType: "addFlat", value: 16},{type: "armor", modType: "addFlat", value: 300},{type: "crit", modType: "addFlat", value: 15}], //9				
			];
			if(effectTable[level-1]){
				return effectTable[level-1];
			} else {
				return [];
			}	
		},
		function(actor, level){
			return level > 1;
		},
		[0],
		9
	);
	this.addDefinition(
		6, 
		"SP Regen", 
		"Recover 10 SP at the start of the turn.", 
		false,
		true,
		function(actor, level){
			return [{type: "SP_regen", modType: "addFlat", value: 10}];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	this.addDefinition(
		7, 
		"Genius", 
		"+20 to Hit/Evade/Critical.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "hit", modType: "addFlat", value: 20},
				{type: "evade", modType: "addFlat", value: 20},
				{type: "crit", modType: "addFlat", value: 20},
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	this.addDefinition(
		8, 
		"Supreme", 
		"+30 to Hit/Evade/Critical.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "hit", modType: "addFlat", value: 30},
				{type: "evade", modType: "addFlat", value: 30},
				{type: "crit", modType: "addFlat", value: 30},
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	this.addDefinition(
		9, 
		"Magician", 
		"Hit, Evade, and Range go up with Level.", 
		true,
		true,
		function(actor, level){
			var effectTable = [
				[{type: "hit", modType: "addFlat", value: 0},{type: "evade", modType: "addFlat", value: 0},{type: "range", modType: "addFlat", value: 0}], //1
				[{type: "hit", modType: "addFlat", value: 5},{type: "evade", modType: "addFlat", value: 5},{type: "range", modType: "addFlat", value: 0}], //2
				[{type: "hit", modType: "addFlat", value: 10},{type: "evade", modType: "addFlat", value: 10},{type: "range", modType: "addFlat", value: 0}], //3
				[{type: "hit", modType: "addFlat", value: 15},{type: "evade", modType: "addFlat", value: 15},{type: "range", modType: "addFlat", value: 0}], //4
				[{type: "hit", modType: "addFlat", value: 20},{type: "evade", modType: "addFlat", value: 20},{type: "range", modType: "addFlat", value: 0}], //5
				[{type: "hit", modType: "addFlat", value: 25},{type: "evade", modType: "addFlat", value: 25},{type: "range", modType: "addFlat", value: 0}], //6
				[{type: "hit", modType: "addFlat", value: 25},{type: "evade", modType: "addFlat", value: 25},{type: "range", modType: "addFlat", value: 1}], //7
				[{type: "hit", modType: "addFlat", value: 30},{type: "evade", modType: "addFlat", value: 30},{type: "range", modType: "addFlat", value: 1}], //8
				[{type: "hit", modType: "addFlat", value: 30},{type: "evade", modType: "addFlat", value: 30},{type: "range", modType: "addFlat", value: 2}], //9				
			];
			if(effectTable[level-1]){
				return effectTable[level-1];
			} else {
				return [];
			}	
		},
		function(actor, level){
			return level > 1;
		},
		[0],
		9
	);
	this.addDefinition(
		10, 
		"Fortune", 
		"Fund gain is increased by 20% when defeating an enemy.", 
		false,
		true,
		function(actor, level){
			return [{type: "fund_gain_destroy", modType: "mult", value: 1.2}];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	this.addDefinition(
		11, 
		"Support Attack", 
		"Allows the unit to perform a support attack up to Level times per turn.", 
		true,
		false,
		function(actor, level){
			return [{type: "support_attack", modType: "addFlat", value: level}];
		},
		function(actor, level){
			return true;
		},
		[100,120,140,160],
		4
	);
	this.addDefinition(
		12, 
		"Support Defend", 
		"Allows the unit to provide defend support up to Level times per turn.", 
		true,
		false,
		function(actor, level){
			return [{type: "support_defend", modType: "addFlat", value: level}];
		},
		function(actor, level){
			return true;
		},
		[100,120,140,160],
		4
	);
	this.addDefinition(
		13, 
		"Meditate", 
		"Reduce SP costs by 20%.", 
		false,
		false,
		function(actor, level){
			return [{type: "sp_cost", modType: "mult", value: 0.8}];
		},
		function(actor, level){
			return true;
		},
		[350],
		1
	);
	this.addDefinition(
		14, 
		"SP Up", 
		"Increases max SP by 5 for each Level.", 
		true,
		false,
		function(actor, level){
			return [{type: "sp", modType: "addFlat", value: level * 5}];
		},
		function(actor, level){
			return true;
		},
		[60,70,80,90,100,110,120,130,140],
		9
	);
	this.addDefinition(
		15, 
		"Will Limit Break", 
		"Increases max Will by 20.", 
		false,
		false,
		function(actor, level){
			return [{type: "max_will", modType: "addFlat", value: 20}];
		},
		function(actor, level){
			return true;
		},
		[250],
		1
	);
	this.addDefinition(
		16, 
		"Continuous Action", 
		"If Will is above 120 the unit can move one additional time per turn if they destroyed a target.", 
		false,
		false,
		function(actor, level){
			return [{type: "continuous_action", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 120;
		},
		[380],
		1
	);
	this.addDefinition(
		17, 
		"Counter", 
		"The unit may attack first during the enemy phase. Chance depends on level.", 
		true,
		false,
		function(actor, level){
			return [{type: "counter_rate", modType: "addFlat", value: level/10}];
		},
		function(actor, level){
			return true;
		},
		[20,30,40,50,60,70,80,90,100],
		9
	);
	this.addDefinition(
		18, 
		"E Save", 
		"EN Costs are reduced by 30%.", 
		false,
		false,
		function(actor, level){
			return [{type: "EN_cost", modType: "mult", value: 0.7}];
		},
		function(actor, level){
			return true;
		},
		[200],
		1
	);
	this.addDefinition(
		19, 
		"B Save", 
		"Ammo +50%.", 
		false,
		false,
		function(actor, level){
			return [{type: "ammo", modType: "mult_ceil", value: 1.5}];
		},
		function(actor, level){
			return true;
		},
		[200],
		1
	);
	this.addDefinition(
		20, 
		"EXP Up", 
		"EXP gain +20%.", 
		false,
		false,
		function(actor, level){
			return [{type: "exp", modType: "mult", value: 1.2}];
		},
		function(actor, level){
			return true;
		},
		[180],
		1
	);
	this.addDefinition(
		21, 
		"Revenge", 
		"Deal 1.2 times damage when counter attacking.", 
		false,
		false,
		function(actor, level){
			return [{type: "revenge", modType: "mult", value: 1.2}];
		},
		function(actor, level){
			return true;
		},
		[300],
		1
	);
	this.addDefinition(
		22, 
		"Instinct", 
		"+10% to Hit and Evasion at 130 Will or higher.", 
		false,
		false,
		function(actor, level){
			return [{type: "evade", modType: "addFlat", value: 10}, {type: "hit", modType: "addFlat", value: 10}];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130;
		},
		[150],
		1
	);
	this.addDefinition(
		23, 
		"Dash", 
		"Movement +1.", 
		false,
		false,
		function(actor, level){
			return [{type: "movement", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		},
		[250],
		1
	);
	this.addDefinition(
		24, 
		"Ignore Size", 
		"Ignore negative effects of the target's size when attacking.", 
		false,
		false,
		function(actor, level){
			return [{type: "ignore_size", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		},
		[200],
		1
	);
	this.addDefinition(
		25, 
		"Hit & Away", 
		"The unit can move after attacking if they did not move yet.", 
		false,
		false,
		function(actor, level){
			return [{type: "hit_and_away", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		},
		[200],
		1
	);
	this.addDefinition(
		26, 
		"Heal", 
		"The unit can heal an adjacent Unit.", 
		false,
		false,
		function(actor, level){
			return [{type: "heal", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	this.addDefinition(
		27, 
		"Resupply", 
		"The unit can recover all EN for an adjacent Unit. The target's Will is reduced by 10.", 
		false,
		false,
		function(actor, level){
			return [{type: "resupply", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	this.addDefinition(
		28, 
		"Resolve", 
		"+5 Will at the start of the map.", 
		false,
		false,
		function(actor, level){
			return [{type: "start_will", modType: "addFlat", value: 5}];
		},
		function(actor, level){
			return true;
		},
		[100],
		1

	);
	this.addDefinition(
		29, 
		"Morale", 
		"+2 Will at the start of each turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "start_turn_will", modType: "addFlat", value: 2}];
		},
		function(actor, level){
			return true;
		},
		[100],
		1
	);
	this.addDefinition(
		30, 
		"Will+ Evade", 
		"+1 Will after evading an enemy attack.", 
		false,
		false,
		function(actor, level){
			return [{type: "evade_will", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		},
		[80],
		1
	);
	this.addDefinition(
		31, 
		"Will+ Damage", 
		"+2 Will after taking damage.", 
		false,
		false,
		function(actor, level){
			return [{type: "damage_will", modType: "addFlat", value: 2}];
		},
		function(actor, level){
			return true;
		},
		[80],
		1
	);
	this.addDefinition(
		32, 
		"Will+ Hit", 
		"+1 Will after hitting an enemy.", 
		false,
		false,
		function(actor, level){
			return [{type: "hit_will", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		},
		[80],
		1
	);
	this.addDefinition(
		33, 
		"Will+ Destroy", 
		"+1 Will after an enemy is destroyed.", 
		false,
		false,
		function(actor, level){
			return [{type: "destroy_will", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		},
		[100],
		1
	);
	this.addDefinition(
		34, 
		"Great Wall", 
		"When casting Wall, Drive is also cast.", 
		false,
		true,
		function(actor, level){
			return [{type: "great_wall", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return $statCalc.isAce(actor);
		},
		[0],
		1
	);
	this.addDefinition(
		35, 
		"Carrot Fling", 
		"This unit can use resupply on any ally regardless of distance. This unit can use resupply on themself.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "all_range_resupply", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return $statCalc.isAce(actor);
		},
		[0],
		1
	);
	this.addDefinition(
		36, 
		"Auto-Wall", 
		"Automatically cast Wall at the start of the turn when above 140 Will.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "auto_wall", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return $statCalc.isAce(actor) && $statCalc.getCurrentWill(actor) >= 140;
		},
		[0],
		1
	);
	this.addDefinition(
		37, 
		"FBK FBK FBK", 
		"When adjacent to Fubuki: Evasion +30%, Crit Rate +30%.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "evade", modType: "addFlat", value: 30},
				{type: "crit", modType: "addFlat", value: 30},
			];
		},
		function(actor, level){
			return $statCalc.isAce(actor) && $statCalc.isAdjacentTo(actor.isActor() ? "actor" : "enemy", actor, 12);
		},
		[0],
		1
	);
	this.addDefinition(
		38, 
		"Caring Meme Queen", 
		"Take 20% less damage when support defending. +5 SP recovered at the start of the turn.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "support_defend_armor", modType: "addFlat", value: 20},
				{type: "SP_regen", modType: "addFlat", value: 5},
			];
		},
		function(actor, level){
			return $statCalc.isAce(actor);
		},
		[0],
		1
	);
}

function MechAbilityManager(){
	this._parent = AbilityManager.prototype;
	this._parent.constructor.call(this);
}

MechAbilityManager.prototype = Object.create(AbilityManager.prototype);
MechAbilityManager.prototype.constructor = MechAbilityManager;

MechAbilityManager.prototype.initDefinitions = function(){
	this.addDefinition(
		0, 
		"Double Image", 
		"30% chance to evade any attack above 130 Will.", 
		false,
		false,
		function(actor, level){
			return [{type: "double_image_rate", modType: "addFlat", value: 0.3}];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130;
		}
	);
	this.addDefinition(
		1, 
		"HP Regen S", 
		"10% HP recovered at the start of the turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "HP_regen", modType: "addFlat", value: 10}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		2, 
		"HP Regen M", 
		"20% HP recovered at the start of the turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "HP_regen", modType: "addFlat", value: 20}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		3, 
		"HP Regen L", 
		"30% HP recovered at the start of the turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "HP_regen", modType: "addFlat", value: 30}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		4, 
		"EN Regen S", 
		"10% EN recovered at the start of the turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "EN_regen", modType: "addFlat", value: 10}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		5, 
		"EN Regen M", 
		"20% EN recovered at the start of the turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "EN_regen", modType: "addFlat", value: 20}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		6, 
		"EN Regen L", 
		"30% EN recovered at the start of the turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "EN_regen", modType: "addFlat", value: 30}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		7, 
		"Repair Kit", 
		"The unit can heal an adjacent Unit.", 
		false,
		false,
		function(actor, level){
			return [{type: "heal", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		8, 
		"Resupply Kit", 
		"The unit can recover all EN for an adjacent Unit. The target's Will is reduced by 10.", 
		false,
		false,
		function(actor, level){
			return [{type: "resupply", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		9, 
		"G-Wall", 
		"Cancels all damage if damage is below 800. 5 EN per use.", 
		false,
		false,
		function(actor, level){
			return [{type: "threshold_barrier", modType: "addFlat", value: 800},{type: "threshold_barrier_cost", modType: "addFlat", value: 5}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		10, 
		"G-Territory", 
		"Cancels all damage if damage is below 1800. 15 EN per use.", 
		false,
		false,
		function(actor, level){
			return [{type: "threshold_barrier", modType: "addFlat", value: 1800},{type: "threshold_barrier_cost", modType: "addFlat", value: 15}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		11, 
		"Barrier Field", 
		"Reduces all damage by 1000. 10 EN per use.", 
		false,
		false,
		function(actor, level){
			return [{type: "reduction_barrier", modType: "addFlat", value: 1000},{type: "reduction_barrier_cost", modType: "addFlat", value: 10}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		12, 
		"Unarmed", 
		"Movement + 1, Mobility +20", 
		false,
		true,
		function(actor, level){
			return [{type: "movement", modType: "addFlat", value: 1},{type: "mobility", modType: "addFlat", value: 20}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		13, 
		"N. Destroy", 
		"If the unit makes contact with a human opponent, both are destroyed after battle.", 
		false,
		true,
		function(actor, level){
			return [{type: "noise_destroy", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		14, 
		"N. Shift", 
		"The unit takes 1/8 damage.", 
		false,
		true,
		function(actor, level){
			return [{type: "percent_barrier", modType: "addFlat", value: 1/8}];
		},
		function(actor, level){
			return !$statCalc.isStatModActiveOnAnyActor("noise_cancel", {14: true});
		}
	);
	this.addDefinition(
		15, 
		"N. Cancel", 
		"Disables N.Shift on all units if deployed. Unit is immune to N. Destroy.", 
		false,
		true,
		function(actor, level){
			return [{type: "noise_destroy_immune", modType: "addFlat", value: 1},{type: "noise_cancel", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		16, 
		"Spirit Barrier", 
		"Unit is immune to N. Destroy.", 
		false,
		true,
		function(actor, level){
			return [{type: "noise_destroy_immune", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		17, 
		"Spirit Barrier+", 
		"All units become immune to N. Destroy.", 
		false,
		true,
		function(actor, level){
			return [{type: "noise_destroy_immune_all", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		18, 
		"Barrier Jacket", 
		"Reduces all ranged damage by 500. Effect increases with Magician Level. Unit is immune to N. Destroy.", 
		false,
		false,
		function(actor, level){
			var magicianLevel = $statCalc.getPilotAbilityLevel(actor, 9);
			var effectTable = [
				0, //1
				100, //2
				100, //3
				200, //4
				200, //5
				200, //6
				300, //7
				300, //8
				500, //9				
			];
			var boost = 0;
			if(typeof effectTable[magicianLevel-1] != "undefined"){
				boost = effectTable[magicianLevel-1];
			}
			return [{type: "ranged_reduction_barrier", modType: "addFlat", value: 500 + boost}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		19, 
		"Warp Field", 
		"All damage received is halved.", 
		false,
		true,
		function(actor, level){
			return [{type: "percent_barrier", modType: "addFlat", value: 1/2}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		20, 
		"Holo Boost", 
		"All weapons +500. Movement +1.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "movement", modType: "addFlat", value: 1},
				{type: "weapon_melee", modType: "addFlat", value: 500},
				{type: "weapon_ranged", modType: "addFlat", value: 500},
			];
		},
		function(actor, level){
			return $statCalc.isFUB(actor);
		}
	);
	this.addDefinition(
		21, 
		"Heal", 
		"The unit can heal an adjacent Unit.", 
		false,
		false,
		function(actor, level){
			return [{type: "heal", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	this.addDefinition(
		22, 
		"Resupply", 
		"The unit can recover all EN for an adjacent Unit. The target's Will is reduced by 10.", 
		false,
		false,
		function(actor, level){
			return [{type: "resupply", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
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
	this.addDefinition(
		0, 
		"Booster", 
		"Movement +1.", 
		false,
		false,
		function(actor, level){
			return [{type: "movement", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		1, 
		"Mega Booster", 
		"Movement +2.", 
		false,
		false,
		function(actor, level){
			return [{type: "movement", modType: "addFlat", value: 2}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		2, 
		"Apogee Motor", 
		"Movement +1, Mobility +5.", 
		false,
		false,
		function(actor, level){
			return [{type: "movement", modType: "addFlat", value: 1}, {type: "mobility", modType: "addFlat", value: 5}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		3, 
		"Servo Motor", 
		"Mobility +5.", 
		false,
		false,
		function(actor, level){
			return [{type: "mobility", modType: "addFlat", value: 5}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		4, 
		"Bio Sensor", 
		"Mobility +15.", 
		false,
		false,
		function(actor, level){
			return [{type: "mobility", modType: "addFlat", value: 15}];
		},
		function(actor, level){
			return true;
		}
	);
	
	this.addDefinition(
		5, 
		"High-Performance Thruster", 
		"Mobility +25.", 
		false,
		false,
		function(actor, level){
			return [{type: "mobility", modType: "addFlat", value: 25}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		6, 
		"High-Performance CPU", 
		"Movement +2, Mobility +25, Weapon Accuracy +20, Weapon Range +1(except MAP weapons).", 
		false,
		false,
		function(actor, level){
			return [{type: "mobility", modType: "addFlat", value: 25},{type: "accuracy", modType: "addFlat", value: 20},{type: "movement", modType: "addFlat", value: 2},{type: "range", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	
	this.addDefinition(
		7, 
		"A-Adapter", 
		"All Mech and Weapon terrain rankings become A.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "land_terrain_rating", modType: "addFlat", value: 3},
				{type: "air_terrain_rating", modType: "addFlat", value: 3},
				{type: "water_terrain_rating", modType: "addFlat", value: 3},
				{type: "space_terrain_rating", modType: "addFlat", value: 3}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		8, 
		"S-Adapter", 
		"All Mech and Weapon terrain rankings become S.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "land_terrain_rating", modType: "addFlat", value: 4},
				{type: "air_terrain_rating", modType: "addFlat", value: 4},
				{type: "water_terrain_rating", modType: "addFlat", value: 4},
				{type: "space_terrain_rating", modType: "addFlat", value: 4}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		9, 
		"Thruster Module", 
		"Mech and Weapon Space terrain rankings become S.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "space_terrain_rating", modType: "addFlat", value: 4}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		10, 
		"Dustproofing", 
		"Mech and Weapon Land terrain rankings become S.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "land_terrain_rating", modType: "addFlat", value: 4}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		11, 
		"Screw Module", 
		"Mech and Weapon Water terrain rankings become S.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "water_terrain_rating", modType: "addFlat", value: 4}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		12, 
		"Tesla Drive", 
		"Mech and Weapon Air terrain rankings become A. Enables Flight.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "air_terrain_rating", modType: "addFlat", value: 3},
				{type: "fly", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		13, 
		"Tesla Drive S", 
		"Mech and Weapon Air terrain rankings become S. Enables Flight. Movement +1.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "air_terrain_rating", modType: "addFlat", value: 4},
				{type: "fly", modType: "addFlat", value: 1},
				{type: "movement", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		14, 
		"Crobham Armor", 
		"Max HP +500, Armor +100.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "maxHP", modType: "addFlat", value: 500},
				{type: "armor", modType: "addFlat", value: 100}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		15, 
		"Hybrid Armor", 
		"Max HP +1000, Armor +150.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "maxHP", modType: "addFlat", value: 1000},
				{type: "armor", modType: "addFlat", value: 150}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		16, 
		"Orihalconium", 
		"Max HP +1000, Armor +200.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "maxHP", modType: "addFlat", value: 1000},
				{type: "armor", modType: "addFlat", value: 200}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		17, 
		"Z.O. Armor", 
		"Max HP +1500, Armor +250.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "maxHP", modType: "addFlat", value: 1500},
				{type: "armor", modType: "addFlat", value: 250}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		18, 
		"Large Generator", 
		"Max EN +50.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "maxEN", modType: "addFlat", value: 50}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		19, 
		"Mega Generator", 
		"Max EN +100.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "maxEN", modType: "addFlat", value: 100}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		20, 
		"Giga Generator", 
		"Max EN +200.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "maxEN", modType: "addFlat", value: 200}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		21, 
		"Solar Panels", 
		"10% EN recovered at the start of the turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "EN_regen", modType: "addFlat", value: 10}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		22, 
		"G-Wall", 
		"Cancels all damage if damage is below 800. 5 EN per use.", 
		false,
		false,
		function(actor, level){
			return [{type: "threshold_barrier", modType: "addFlat", value: 800},{type: "threshold_barrier_cost", modType: "addFlat", value: 5}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		23, 
		"G-Territory", 
		"Cancels all damage if damage is below 1800. 15 EN per use.", 
		false,
		false,
		function(actor, level){
			return [{type: "threshold_barrier", modType: "addFlat", value: 1800},{type: "threshold_barrier_cost", modType: "addFlat", value: 15}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		24, 
		"Mark of the Hero", 
		"Armor +200. Mobility +25. Weapon Accuracy +30.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "mobility", modType: "addFlat", value: 25},
				{type: "armor", modType: "addFlat", value: 200},
				{type: "accuracy", modType: "addFlat", value: 30}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		25, 
		"Soul of Steel", 
		"Armor +250. Mobility +30. Weapon Accuracy +35.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "mobility", modType: "addFlat", value: 30},
				{type: "armor", modType: "addFlat", value: 250},
				{type: "accuracy", modType: "addFlat", value: 35}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		26, 
		"Dual Sensor", 
		"Weapon Accuracy +10.", 
		false,
		false,
		function(actor, level){
			return [ 
				{type: "accuracy", modType: "addFlat", value: 10}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		27, 
		"Multi Sensor", 
		"Weapon Accuracy +20.", 
		false,
		false,
		function(actor, level){
			return [ 
				{type: "accuracy", modType: "addFlat", value: 20}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		28, 
		"High Perf. Scope", 
		"Weapon Accuracy +30.", 
		false,
		false,
		function(actor, level){
			return [ 
				{type: "accuracy", modType: "addFlat", value: 30}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		29, 
		"Optimized Sensor", 
		"Weapon Accuracy +40.", 
		false,
		false,
		function(actor, level){
			return [  
				{type: "accuracy", modType: "addFlat", value: 40}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		30, 
		"Martial Arts Movie", 
		"Weapon Critical +20.", 
		false,
		false,
		function(actor, level){
			return [ 
				{type: "crit", modType: "addFlat", value: 20}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		31, 
		"High-Performance Radar", 
		"Weapon Range +1.", 
		false,
		false,
		function(actor, level){
			return [ 
				{type: "range", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		32, 
		"Repair Kit", 
		"Restore all HP once per stage.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "HP_recover", modType: "addFlat", value: 100}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		33, 
		"Energy Capsule", 
		"Restore all EN once per stage.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "EN_recover", modType: "addFlat", value: 100}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		34, 
		"Cartridge", 
		"Restore all Ammo once per stage.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "ammo_recover", modType: "addFlat", value: 100}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		35, 
		"Super Repair Kit", 
		"Restore all HP, EN and Ammo once per stage.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "HP_recover", modType: "addFlat", value: 100},
				{type: "EN_recover", modType: "addFlat", value: 100},
				{type: "ammo_recover", modType: "addFlat", value: 100}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		36, 
		"SP Drink", 
		"Restore 50SP once per stage.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "SP_recover", modType: "addFlat", value: 50}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		37, 
		"Something Warm", 
		"Restore all SP once per stage.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "SP_recover", modType: "addFlat", value: 999}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		38, 
		"Hachimaki", 
		"+5 starting Will.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "start_will", modType: "addFlat", value: 5}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		39, 
		"Neijiri Hachimaki", 
		"+10 starting Will.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "start_will", modType: "addFlat", value: 10}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		40, 
		"Pocket Haro", 
		"Movement +2, Mobility +25, Weapon Accuracy +20, Weapon Range +1(except MAP weapons).", 
		false,
		false,
		function(actor, level){
			return [{type: "mobility", modType: "addFlat", value: 25},{type: "accuracy", modType: "addFlat", value: 20},{type: "movement", modType: "addFlat", value: 2},{type: "range", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		41, 
		"Causality Manipulator", 
		"Hit becomes 100% if Hit is above 70%, and enemy Hit becomes 0% if enemy Hit is below 30%.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "causality_manip", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		42, 
		"Miracle Mark", 
		"Weapon damage +200 and Movement +2. Range +1 for all non-MAP, non-Range 1 weapons. Spirit Command Miracle can be used once per map.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "weapon_ranged", modType: "addFlat", value: 200},
				{type: "weapon_melee", modType: "addFlat", value: 200},
				{type: "movement", modType: "addFlat", value: 2},
				{type: "range", modType: "addFlat", value: 1},
				{type: "miracle", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		43, 
		"Victory Turn", 
		"Damage dealt +30%, damage taken -30% for one turn. Can only be used once per map.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "victory_turn", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		44, 
		"Spiral Effector", 
		"Damage of all weapons +300. Grants effects Ignore Size and Barrier Piercing.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "weapon_ranged", modType: "addFlat", value: 300},
				{type: "weapon_melee", modType: "addFlat", value: 300},
				{type: "ignore_size", modType: "addFlat", value: 1},
				{type: "pierce_barrier", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		45, 
		"Omnidefensor", 
		"The Unit suffers no Evasion decay. Grants Barrier Field.", 
		false,
		false,
		function(actor, level){
			return [				
				{type: "ignore_evasion_decay", modType: "addFlat", value: 1},
				{type: "reduction_barrier", modType: "addFlat", value: 1000}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		46, 
		"Hyper Generator", 
		"Restores EN to Max at the start of Player Phase.", 
		false,
		false,
		function(actor, level){
			return [				
				{type: "EN_regen", modType: "addFlat", value: 100}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		47, 
		"Hyper Reloader", 
		"Restores Ammo to Max at the start of Player Phase.", 
		false,
		false,
		function(actor, level){
			return [				
				{type: "ammo_regen", modType: "addFlat", value: 100}
			];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		48, 
		"Soldier's Medallion", 
		"Max Morale +30.", 
		false,
		false,
		function(actor, level){
			return [				
				{type: "max_will", modType: "addFlat", value: 30}
			];
		},
		function(actor, level){
			return true;
		}
	);
}

function WeaponEffectManager(){
	this._parent = AbilityManager.prototype;
	this._parent.constructor.call(this);
}

WeaponEffectManager.prototype = Object.create(AbilityManager.prototype);
WeaponEffectManager.prototype.constructor = WeaponEffectManager;


WeaponEffectManager.prototype.initDefinitions = function(){
	this.addDefinition(
		0, 
		"Barrier Piercing", 
		"Ignores barriers on the target.", 
		false,
		false,
		function(actor, level){
			return [{type: "pierce_barrier", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		1, 
		"Ignore Size", 
		"Ignore negative effects of the target's size when attacking.", 
		false,
		false,
		function(actor, level){
			return [{type: "ignore_size", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		2, 
		"Accuracy Down", 
		"Accuracy reduced by 30 for 1 turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "inflict_accuracy_down", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		3, 
		"Mobility Down", 
		"Mobility reduced by 30 for 1 turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "inflict_mobility_down", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		4, 
		"Armor Down", 
		"Armor reduced by 500 for 1 turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "inflict_armor_down", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		5, 
		"Movement Down", 
		"Movement reduced by 3 for 1 turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "inflict_move_down", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		6, 
		"Attack Power Down", 
		"Attack Power reduced by 500 for 1 turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "inflict_attack_down", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);

	this.addDefinition(
		7, 
		"Range Down", 
		"Attack Range reduced by 3 for 1 turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "inflict_range_down", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		8, 
		"SP Down", 
		"SP reduced by 10.", 
		false,
		false,
		function(actor, level){
			return [{type: "inflict_SP_down", modType: "addFlat", value: 10}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		9, 
		"Will Down", 
		"Will reduced by 10.", 
		false,
		false,
		function(actor, level){
			return [{type: "inflict_will_down", modType: "addFlat", value: 10}];
		},
		function(actor, level){
			return true;
		}
	);
}