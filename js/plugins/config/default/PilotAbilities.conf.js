$SRWConfig.pilotAbilties = function(){
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
	this.addDefinition(
		39, 
		"Parry", 
		"When triggered, negates damage from physical weapons. The chance to trigger increases with the skill's level.", 
		true,
		true,
		function(actor, level){
			var effectTable = [
				[{type: "parry_rate", modType: "addFlat", value: 0.5}], //1
				[{type: "parry_rate", modType: "addFlat", value: 0.10}], //2
				[{type: "parry_rate", modType: "addFlat", value: 0.15}], //3
				[{type: "parry_rate", modType: "addFlat", value: 0.20}], //4
				[{type: "parry_rate", modType: "addFlat", value: 0.25}], //5
				[{type: "parry_rate", modType: "addFlat", value: 0.30}], //6
				[{type: "parry_rate", modType: "addFlat", value: 0.35}], //7
				[{type: "parry_rate", modType: "addFlat", value: 0.40}], //8
				[{type: "parry_rate", modType: "addFlat", value: 0.45}], //9				
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
		40, 
		"Shoot Down", 
		"Allows the pilot to deflect funnel and missile attacks. Activation depends on Skill stat difference with the enemy.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "shoot_down", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	this.addDefinition(
		41, 
		"Attack Again", 
		"Allows the pilot to provide a support attack for themself if their Skill stat is atleast 20 points higher than the opponent's.", 
		false,
		false,
		function(actor, level){
			return [
				{type: "attack_again", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return true;
		},
		[200],
		1
	);
	this.addDefinition(
		42, 
		"Double Action", 
		"Allows the pilot an additional action each turn.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "extra_action", modType: "addFlat", value: 1}
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	this.addDefinition(
		43, 
		"Triple Action", 
		"Allows the pilot two additional actions each turn.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "extra_action", modType: "addFlat", value: 2}
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	
	this.addDefinition(
		44, 
		"Commander", 
		"Grants a boost to evasion and accuracy to adjacent allies. Range and effectiveness depend on the skill level.", 
		true,
		true,
		function(actor, level){
			return [
				{type: "commander_aura", modType: "addFlat", value: level}
			];
		},
		function(actor, level){
			return true;
		},
		[0],
		4
	);
}
