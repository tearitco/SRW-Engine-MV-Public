function BattleCalc(){
	this._weaponTerrainValues = {
		"S": 1.1,
		"A": 1.0,
		"B": 0.8,
		"C": 0.6,
		"D": 0.5,
	};
	this._mechTerrainValues = {
		"S": 1.1,
		"A": 1.0,
		"B": 0.9,
		"C": 0.8,
		"D": 0.6,
	};
	this._mechSizeValues = {
		"S": 0.8,
		"M": 1.0,
		"1L": 1.2,
		"2L": 1.4
	};
	this._sizeEvadeMod = {
		"S": 0.8,
		"M": 1.0,
		"1L": 1.2,
		"2L": 1.4
	};
}

BattleCalc.prototype.isTargetInRange = function(originPos, targetPos, range, minRange){
	var deltaX = Math.abs(targetPos.x - originPos.x);
	var deltaY = Math.abs(targetPos.y - originPos.y);
	return deltaX + deltaY <= range && deltaX + deltaY >= minRange;
}

BattleCalc.prototype.performPPCalculation = function(attacker, defender){
	var attackerLevel = attacker.SRWStats.pilot.level;
	var defenderLevel = defender.SRWStats.pilot.level;
	var defenderTotalYield = defender.SRWStats.pilot.PPYield + defender.SRWStats.mech.PPYield ;
	var totalExp = defenderTotalYield * (defenderLevel/attackerLevel);
	if(totalExp < 1){
		totalExp = 1;
	}
	if(totalExp > 100){
		totalExp = 100;
	}
	return Math.floor(totalExp);
}

BattleCalc.prototype.performExpCalculation = function(attacker, defender){
	var attackerLevel = attacker.SRWStats.pilot.level;
	var defenderLevel = defender.SRWStats.pilot.level;
	var defenderTotalYield = defender.SRWStats.pilot.expYield + defender.SRWStats.mech.expYield ;
	
	var totalExp = eval(ENGINE_SETTINGS.EXP_YIELD.LEVEL_SCALING_FORMULA);
	if(totalExp < ENGINE_SETTINGS.EXP_YIELD.MIN){
		totalExp = ENGINE_SETTINGS.EXP_YIELD.MIN;
	}
	if(totalExp > ENGINE_SETTINGS.EXP_YIELD.MAX){
		totalExp = ENGINE_SETTINGS.EXP_YIELD.MAX;
	}
	
	return Math.floor(totalExp);
}

BattleCalc.prototype.performCritCalculation = function(attackerInfo, defenderInfo){
	var result = 0;
	var attackerAction = attackerInfo.action;
	if(attackerAction.type == "attack"){
		var attackerPilotStats = $statCalc.getCalculatedPilotStats(attackerInfo.actor);
		var attackerMechStats = $statCalc.getCalculatedMechStats(attackerInfo.actor);
		var weaponInfo = attackerAction.attack;			
		var attackerTerrainMod = $statCalc.getTerrainMod(attackerInfo.actor);
		
		var baseCrit = (attackerPilotStats.skill/2) * attackerTerrainMod + (weaponInfo.critMod);
		
		var defenderPilotStats = $statCalc.getCalculatedPilotStats(defenderInfo.actor);
		var defenderMechStats = $statCalc.getCalculatedMechStats(defenderInfo.actor);
		var defenderTerrainMod = $statCalc.getTerrainMod(defenderInfo.actor);
		
		var baseCritEvade = (defenderPilotStats.skill/2) * defenderTerrainMod;
		
		var finalCrit = (baseCrit - baseCritEvade);
		
		finalCrit = $statCalc.applyStatModsToValue(attackerInfo.actor, finalCrit, ["crit"]);

		finalCrit = finalCrit/100;
		if(finalCrit < 0){
			finalCrit = 0;
		}
		result = finalCrit;
	}
	return result;
}

BattleCalc.prototype.getActorFinalCrit = function(){
	return this.performCritCalculation(
		{actor: $gameTemp.currentBattleActor, action: $gameTemp.actorAction},
		{actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction}
	);
}

BattleCalc.prototype.getEnemyFinalCrit = function(){
	return this.performCritCalculation(			
		{actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction},
		{actor: $gameTemp.currentBattleActor, action: $gameTemp.actorAction}
	);
}

BattleCalc.prototype.doesActorCrit = function(){
	return Math.random() < this.getActorFinalCrit();
}

BattleCalc.prototype.doesEnemyCrit = function(){
	return Math.random() < this.getEnemyFinalCrit();
}	

BattleCalc.prototype.performHitCalculation = function(attackerInfo, defenderInfo, ignoreAlert){
	var result = 0;
	var attackerAction = attackerInfo.action;
	if(attackerAction.type == "attack"){
		if(!ignoreAlert && $statCalc.getActiveSpirits(defenderInfo.actor).alert){
			return 0;
		}
								
		var attackerPilotStats = $statCalc.getCalculatedPilotStats(attackerInfo.actor);
		var attackerMechStats = $statCalc.getCalculatedMechStats(attackerInfo.actor);
		var accuracy = attackerMechStats.accuracy;
		if($statCalc.isAccuracyDown(attackerInfo.actor)){
			accuracy-=30;
		}
		accuracy = $statCalc.applyStatModsToValue(attackerInfo.actor, accuracy, ["accuracy"]);
		var weaponInfo = attackerAction.attack;			
		var attackerTerrainMod = $statCalc.getTerrainMod(attackerInfo.actor);
		
		var attackerHit = attackerPilotStats.hit;
		
		attackerHit = $statCalc.applyStatModsToValue(attackerInfo.actor, attackerHit, ["stat_hit"]);
		if(attackerInfo.isInitiator){
			attackerHit = $statCalc.applyStatModsToValue(attackerInfo.actor, attackerHit, ["stat_hit_init"]);
		}
		
		
		var baseHit = (attackerHit/2 + accuracy) * attackerTerrainMod + weaponInfo.hitMod;
		
		
		var defenderPilotStats = $statCalc.getCalculatedPilotStats(defenderInfo.actor);
		var defenderMechStats = $statCalc.getCalculatedMechStats(defenderInfo.actor);
		var mobility = defenderMechStats.mobility;
		if($statCalc.isMobilityDown(defenderInfo.actor)){
			mobility-=30;
		}
		mobility = $statCalc.applyStatModsToValue(defenderInfo.actor, mobility, ["mobility"]);
		
		var defenderTerrainMod = $statCalc.getTerrainMod(defenderInfo.actor);
		
		var defenderEvade = defenderPilotStats.evade;
		
		defenderEvade = $statCalc.applyStatModsToValue(defenderInfo.actor, defenderEvade, ["stat_evade"]);
		if(defenderInfo.isInitiator){
			defenderEvade = $statCalc.applyStatModsToValue(defenderInfo.actor, defenderEvade, ["stat_evade_init"]);
		}
		
		
		var baseEvade = (defenderEvade/2 + mobility) * defenderTerrainMod;
		
		var terrainEvadeFactor = $statCalc.getCurrentTerrainMods(defenderInfo.actor).evasion || 0;
		
		var finalHit = (baseHit - baseEvade) * this._sizeEvadeMod[defenderMechStats.size] * (1 - terrainEvadeFactor/100);
		
		//finalHit = finalHit + $statCalc.getCommanderBonus(attackerInfo.actor) - $statCalc.getCommanderBonus(defenderInfo.actor);
		
		finalHit = $statCalc.applyStatModsToValue(attackerInfo.actor, finalHit, ["hit"]);
		var evadeMod = 0;
		evadeMod = $statCalc.applyStatModsToValue(defenderInfo.actor, evadeMod, ["evade"]);
		finalHit-=evadeMod;
		
		if(defenderInfo.action.type == "evade"){
			finalHit/=2;
		}
		if($statCalc.getActiveSpirits(attackerInfo.actor).focus) {
			finalHit+=30;
		}
		if($statCalc.getActiveSpirits(defenderInfo.actor).focus) {
			finalHit-=30;
		}
		
		if(!$statCalc.applyStatModsToValue(defenderInfo.actor, 0, ["ignore_evasion_decay"]) && !ENGINE_SETTINGS.DISABLE_EVASION_DECAY){
			finalHit+=$statCalc.getEvadeCount(defenderInfo.actor) * 5;//evasion decay
		}			
		
		if($statCalc.getActiveSpirits(attackerInfo.actor).disrupt) {
			finalHit/=2;
		}
		if($statCalc.applyStatModsToValue(attackerInfo.actor, 0, ["causality_manip"])){
			if(finalHit >= 70){
				finalHit = 100;
			}
		}
		if($statCalc.applyStatModsToValue(defenderInfo.actor, 0, ["causality_manip"])){
			if(finalHit <= 30){
				finalHit = 0;
			}
		}
		
		finalHit = finalHit/100;
		if(finalHit < 0){
			finalHit = 0;
		}
		if(!$statCalc.applyStatModsToValue(attackerInfo.actor, 0, ["hit_cap_break"])){
			if(finalHit > 1){
				finalHit = 1;
			}
		}
		
		if($statCalc.getActiveSpirits(attackerInfo.actor).strike){
			if(finalHit < 1){
				return 1;
			}			
		}
		
		result = finalHit;
	}
	return result;
}

BattleCalc.prototype.getActorFinalHit = function(){
	return this.performHitCalculation(
		{actor: $gameTemp.currentBattleActor, action: $gameTemp.actorAction},
		{actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction}
	);
}

BattleCalc.prototype.getEnemyFinalHit = function(){
	return this.performHitCalculation(			
		{actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction},
		{actor: $gameTemp.currentBattleActor, action: $gameTemp.actorAction}
	);
}

BattleCalc.prototype.getSupportFinalHit = function(){
	var supporter = $gameTemp.supportAttackCandidates[$gameTemp.supportAttackSelected];
	return this.performHitCalculation(
		{actor: supporter.actor, action: {type: "attack", attack: supporter.weapon}},
		{actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction}
	);
}

BattleCalc.prototype.doesActorhit = function(){
	return Math.random() < this.getActorFinalHit();
}

BattleCalc.prototype.doesEnemyhit = function(){
	return Math.random() < this.getEnemyFinalHit();
}	

BattleCalc.prototype.doesSupportHit = function(){
	return Math.random() < this.getSupportFinalHit();
}	

BattleCalc.prototype.performDamageCalculation = function(attackerInfo, defenderInfo, noCrit, noBarrier, isSupportDefender, isSupportAttacker){
	var result = {
		damage: 0,
		isCritical: false,
		barrierCost: 0,
		hasThresholdBarrier: false,
		thresholdBarrierBroken: false,
		hasReductionBarrier: false,
		hasPercentBarrier: false
	};
	var attackerAction = attackerInfo.action;
	if(attackerAction.type == "attack"){			
		//initial attack
		var weaponInfo = attackerAction.attack;
		var weaponPower = $statCalc.getWeaponPower(attackerInfo.actor, weaponInfo)*1;
		var weaponTerrainRating = this._weaponTerrainValues[$statCalc.getWeaponTerrainMod(defenderInfo.actor, weaponInfo)];
		
		var attackerPilotOffense;
		var attackerPilotStats = $statCalc.getCalculatedPilotStats(attackerInfo.actor);
		var attackerMechStats = $statCalc.getCalculatedMechStats(attackerInfo.actor);
		var defenderMechStats = $statCalc.getCalculatedMechStats(defenderInfo.actor);
		/*if(weaponInfo.particleType == "beam" && $statCalc.getCurrentTerrain(defenderInfo.actor) == "water"){
			weaponTerrainRating = this._weaponTerrainValues["D"];
		}*/
		
		var activeAttackerSpirits = $statCalc.getActiveSpirits(attackerInfo.actor);
			
		if(weaponInfo.type == "M"){ //melee
			attackerPilotOffense = attackerPilotStats.melee;
			attackerPilotOffense = $statCalc.applyStatModsToValue(attackerInfo.actor, attackerPilotOffense, ["stat_melee"]);
			if(attackerInfo.isInitiator){
				attackerPilotOffense = $statCalc.applyStatModsToValue(attackerInfo.actor, attackerPilotOffense, ["stat_melee_init"]);
			}
			weaponPower = $statCalc.applyStatModsToValue(attackerInfo.actor, weaponPower, ["weapon_melee"]);
		} else { //ranged
			attackerPilotOffense = attackerPilotStats.ranged;
			attackerPilotOffense = $statCalc.applyStatModsToValue(attackerInfo.actor, attackerPilotOffense, ["stat_ranged"]);
			if(attackerInfo.isInitiator){
				attackerPilotOffense = $statCalc.applyStatModsToValue(attackerInfo.actor, attackerPilotOffense, ["stat_ranged_init"]);
			}
			weaponPower = $statCalc.applyStatModsToValue(attackerInfo.actor, weaponPower, ["weapon_ranged"]);
		}
		if($statCalc.isAttackDown(attackerInfo.actor)){
			weaponPower-=500;
		}		
		var attackerWill = $statCalc.getCurrentWill(attackerInfo.actor);
		var initialAttack = weaponPower * weaponTerrainRating * (attackerPilotOffense + attackerWill) / 200;
		//initial defense
		var defenderPilotStats = $statCalc.getCalculatedPilotStats(defenderInfo.actor);
		
		var armor =  defenderMechStats.armor;
		if($statCalc.isArmorDown(defenderInfo.actor)){
			armor/=2;
		}
		armor = $statCalc.applyStatModsToValue(defenderInfo.actor, armor, ["armor"]);	

		if($statCalc.applyStatModsToValue(attackerInfo.actor, 0, ["ignore_armor"])){
			armor = 1;
		}	
		
		var defenderTerrainRating = this._mechTerrainValues[defenderMechStats.terrain[$statCalc.getCurrentTerrain(defenderInfo.actor)]];
		
		//final damage
		var terrainDefenseFactor = $statCalc.getCurrentTerrainMods(defenderInfo.actor).defense || 0; 
		var sizeFactor = 1 + this._mechSizeValues[defenderMechStats.size] - this._mechSizeValues[attackerMechStats.size];
		var attackerHasIgnoreSize = $statCalc.applyStatModsToValue(attackerInfo.actor, 0, ["ignore_size"]) || activeAttackerSpirits.fury;
		if(attackerHasIgnoreSize && sizeFactor > 1){
			sizeFactor = 1;
		}
		
		var defenderDefense = defenderPilotStats.defense;
		
		defenderDefense = $statCalc.applyStatModsToValue(defenderInfo.actor, defenderDefense, ["stat_defense"]);
		if(defenderInfo.isInitiator){
			defenderDefense = $statCalc.applyStatModsToValue(defenderInfo.actor, defenderDefense, ["stat_defense_init"]);
		}
		
		var initialDefend = armor * defenderTerrainRating * (defenderDefense + $statCalc.getCurrentWill(defenderInfo.actor)) / 200 * sizeFactor;
		
		var finalDamage = (initialAttack - initialDefend) * (1 - terrainDefenseFactor/100);
		var isCritical = false;
		if(Math.random() < this.performCritCalculation(attackerInfo, defenderInfo)){
			isCritical = true;
		}				
		
		
		finalDamage = $statCalc.applyStatModsToValue(attackerInfo.actor, finalDamage, ["final_damage"]);	

		if($statCalc.applyStatModsToValue(attackerInfo.actor, 0, ["hit_cap_break"])){
			if($gameTemp.battleTargetInfo){			
				var targetInfo = $gameTemp.battleTargetInfo[attackerInfo.actor._cacheReference];
				if(!targetInfo){
					targetInfo = $gameTemp.battleTargetInfo[attackerInfo.actor._supportCacheReference];
				}
				if(targetInfo && targetInfo.hitRate > 1){
					finalDamage*=targetInfo.hitRate;
				}
			}
		}	
		
		finalDamage = $statCalc.applyStatModsToValue(defenderInfo.actor, finalDamage, ["final_defend"]);
		
		if(attackerInfo.isCounterAttack){
			finalDamage = $statCalc.applyStatModsToValue(attackerInfo.actor, finalDamage, ["revenge"]);	
		}
		
		if($statCalc.getActiveTempEffects(attackerInfo.actor).victory_turn){
			finalDamage*=1.3;
		}
		
		if($statCalc.getActiveTempEffects(defenderInfo.actor).victory_turn){
			finalDamage*=0.7;
		}
		
		if(ENGINE_SETTINGS.ENABLE_ATTRIBUTE_SYSTEM){
			finalDamage*=$statCalc.getEffectivenessMultipler(attackerInfo.actor, defenderInfo.actor);
		}
		
		
		if(activeAttackerSpirits.soul){				
			finalDamage*=2.2;
			noCrit = true;
		} else if(activeAttackerSpirits.valor){				
			finalDamage*=2;
			noCrit = true;
		}
		
		if(activeAttackerSpirits.analyse){
			finalDamage*=0.9;
		}
		
		if(isCritical && !noCrit){
			result.isCritical = isCritical;
			finalDamage*=1.25;
		}
		
		if(defenderInfo.action.type == "defend"){
			finalDamage*=0.6;
		}
		
		var activeDefenderSpirits = $statCalc.getActiveSpirits(defenderInfo.actor);
		if(activeDefenderSpirits.wall){
			finalDamage*=0.25;
		}
		
		if(activeDefenderSpirits.analyse){
			finalDamage*=1.1;
		}
		
		var vengeanceRatio = $statCalc.applyStatModsToValue(attackerInfo.actor, 0, ["vengeance"]);
		if(vengeanceRatio){
			var missingHP = attackerMechStats.maxHP - attackerMechStats.currentHP;		
			finalDamage+=Math.floor(missingHP * vengeanceRatio);
		}		
		
		if(isSupportDefender){
			var supportDefendMod = $statCalc.applyStatModsToValue(defenderInfo.actor, 0, ["support_defend_armor"]) || 0;		
			finalDamage = finalDamage - (finalDamage / 100 * supportDefendMod);
		}	
		
		if(isSupportAttacker){
			var supportAttackMod = $statCalc.applyStatModsToValue(attackerInfo.actor, 0, ["support_attack_buff"]) || 0;		
			finalDamage = finalDamage + (finalDamage / 100 * supportAttackMod);
		}
		
		if(activeDefenderSpirits.persist){
			finalDamage = 10;
		}
		
		if(finalDamage < 10){
			finalDamage = 10;
		}
		
		if(activeAttackerSpirits.mercy){
			if(attackerPilotStats.skill > defenderPilotStats.skill){
				finalDamage = Math.min(finalDamage, defenderMechStats.currentHP - 10);
			}				
		}
		
		result.barrierNames = [];
		if(!noBarrier && !$statCalc.applyStatModsToValue(attackerInfo.actor, 0, ["pierce_barrier"]) && !activeAttackerSpirits.fury){			
			var totalBarrierCost = 0;
			
			
			var percentBarrierAmount = 1;
			var percentBarrierCost = 0;
			var barrierName = "";
			
			var percentEffect = $statCalc.getModDefinitions(defenderInfo.actor, ["percent_barrier"]); 
			
			var type = weaponInfo.type == "M" ? "melee" : "ranged";	
			
			percentEffect.forEach(function(effect){
				if(effect.subType == type){
					if(effect.value < percentBarrierAmount && ((totalBarrierCost + effect.cost) <= $statCalc.getCurrenEN(defenderInfo.actor))){
						if(!effect.success_rate || Math.random() < effect.success_rate){
							percentBarrierAmount = effect.value;
							percentBarrierCost = effect.cost;
							barrierName = effect.name;
						}						
					}
				}
			});
			
			var type = weaponInfo.particleType;
			if(!type){
				type = "typeless";
			}
			
			percentEffect.forEach(function(effect){
				if(effect.subType == type || effect.subType == "all"){
					if(effect.value < percentBarrierAmount && ((totalBarrierCost + effect.cost) <= $statCalc.getCurrenEN(defenderInfo.actor))){
						if(!effect.success_rate || Math.random() < effect.success_rate){
							percentBarrierAmount = effect.value;
							percentBarrierCost = effect.cost;
							barrierName = effect.name;
						}						
					}
				}
			});
			
			if(percentBarrierAmount < 1){				
				totalBarrierCost+=percentBarrierCost;
				if(totalBarrierCost <= $statCalc.getCurrenEN(defenderInfo.actor)){
					result.hasPercentBarrier = true;
					finalDamage = Math.floor(finalDamage * percentBarrierAmount);
					result.barrierNames.push(barrierName);
				} 			
			}
			
			
			var reductionBarrierAmount = 0;
			var reductionBarrierCost = 0;
			var barrierName = "";
			
			var reductionEffects = $statCalc.getModDefinitions(defenderInfo.actor, ["reduction_barrier"]); 
			
			var type = weaponInfo.type == "M" ? "melee" : "ranged";			
			
			reductionEffects.forEach(function(effect){
				if(effect.statType == type){
					if(effect.value > reductionBarrierAmount && ((totalBarrierCost + effect.cost) <= $statCalc.getCurrenEN(defenderInfo.actor))){
						if(!effect.success_rate || Math.random() < effect.success_rate){
							reductionBarrierAmount = effect.value;
							reductionBarrierCost = effect.cost || 0;
							barrierName = effect.name;
						}
					}
				}
			});				
			
			var type = weaponInfo.particleType;
			if(!type){
				type = "typeless";
			}
			
			reductionEffects.forEach(function(effect){
				if(effect.subType == type || effect.subType == "all"){
					if(effect.value > reductionBarrierAmount && ((totalBarrierCost + effect.cost) <= $statCalc.getCurrenEN(defenderInfo.actor))){
						if(!effect.success_rate || Math.random() < effect.success_rate){
							reductionBarrierAmount = effect.value;
							reductionBarrierCost = effect.cost;
							barrierName = effect.name;
						}
					}
				}
			});
			
			if(reductionBarrierAmount) {
				//totalBarrierCost+=$statCalc.applyStatModsToValue(defenderInfo.actor, 0, ["reduction_barrier_cost"]);
				totalBarrierCost+=reductionBarrierCost;
				if(totalBarrierCost <= $statCalc.getCurrenEN(defenderInfo.actor)){
					result.hasReductionBarrier = true;
					finalDamage-=reductionBarrierAmount;
					result.barrierNames.push(barrierName);
					if(finalDamage < 0){
						finalDamage = 0;
					}
				}
			}
			
			//var thresholdBarrierAmount = $statCalc.applyStatModsToValue(defenderInfo.actor, 0, ["threshold_barrier"]);
			var thresholdBarrierAmount = 0;
			var thresholdBarrierCost = 0;
			var barrierName = "";
			
			var tresholdEffects = $statCalc.getModDefinitions(defenderInfo.actor, ["threshold_barrier"]); 
			
			var type = weaponInfo.particleType;
			if(!type){
				type = "typeless";
			}
			
			tresholdEffects.forEach(function(effect){
				if(effect.subType == type || effect.subType == "all"){
					if(effect.value > thresholdBarrierAmount && ((totalBarrierCost + effect.cost) <= $statCalc.getCurrenEN(defenderInfo.actor))){
						if(!effect.success_rate || Math.random() < effect.success_rate){
							thresholdBarrierAmount = effect.value;
							thresholdBarrierCost = effect.cost;
							barrierName = effect.name;
						}
					}
				}
			});
			
			if(thresholdBarrierAmount) {				
				totalBarrierCost+=thresholdBarrierCost;
				if(totalBarrierCost <= $statCalc.getCurrenEN(defenderInfo.actor)){
					result.hasThresholdBarrier = true;
					result.barrierNames.push(barrierName);
					if(finalDamage < thresholdBarrierAmount) {
						finalDamage = 0;
					} else {
						result.thresholdBarrierBroken = true;
					}
				} 			
			}
			result.barrierCost = totalBarrierCost;	
			var barrierCostReduction = $statCalc.applyStatModsToValue(defenderInfo.actor, 0, ["barrier_cost_reduction"]);
			if(barrierCostReduction){
				result.barrierCost = Math.max(0, result.barrierCost - barrierCostReduction);
			}
		}
		
		if(Number.isNaN(finalDamage)){
			console.log("Calculated damage output is NaN!");
			finalDamage = 0;
		}
		
		
		result.damage = Math.floor(finalDamage);
	}
	return result;
}
BattleCalc.prototype.getActorDamageOutput = function(){
	return this.performDamageCalculation(
		{actor: $gameTemp.currentBattleActor, action: $gameTemp.actorAction},
		{actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction}
	);
}
BattleCalc.prototype.getEnemyDamageOutput = function(){
	return this.performDamageCalculation(			
		{actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction},
		{actor: $gameTemp.currentBattleActor, action: $gameTemp.actorAction}
	);
}

BattleCalc.prototype.getSupportDamageOutput = function(){
	var supporter = $gameTemp.supportAttackCandidates[$gameTemp.supportAttackSelected];
	return this.performDamageCalculation(
		{actor: supporter.actor, action: {type: "attack", attack: supporter.weapon}},
		{actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction}			
	);
}

BattleCalc.prototype.getSupportDamageTaken = function(){
	var supporter = $gameTemp.supportDefendCandidates[$gameTemp.supportDefendSelected];
	return this.performDamageCalculation(
		{actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction},
		{actor: supporter.actor, action: {type: "defend", attack: supporter.weapon}}
	);
}

BattleCalc.prototype.prepareBattleCache = function(actionObject, type){
	var actor = actionObject.actor;
	

	/*if(actor.isActor()){
		actor._cacheReference = "a_"+actor.actorId();
	} else {
		actor._cacheReference = "e_"+actor.enemyId();
	}*/
	var ref;
	if(type == "initiator" || type == "defender"){
		ref = actor.event.eventId();
		actor._cacheReference = ref;
		
	} else {
		ref = "support_"+actor.event.eventId();
		actor._supportCacheReference = ref;		
	}	
	$gameTemp.battleEffectCache[ref] = {
		ref: actor,
		damageTaken: 0,
		isActor: actor.isActor(),
		type: type || "",
		action: actionObject.action,
		ownRef: actor._cacheReference,
		ENUsed: 0,
		ammoUsed: 0,
		hasActed: false,
		currentAnimHP: $statCalc.getCalculatedMechStats(actor).currentHP,
		currentAnimEN: $statCalc.getCalculatedMechStats(actor).currentEN,
	};
}

BattleCalc.prototype.generateBattleResult = function(){
	var _this = this;
	$statCalc.invalidateAbilityCache();
	
	$gameTemp.battleEffectCache = {};
	$gameTemp.sortedBattleActorCaches = [];
	var attacker;
	var defender;
	var supportAttacker; 
	if($gameTemp.supportAttackCandidates){
		supportAttacker = $gameTemp.supportAttackCandidates[$gameTemp.supportAttackSelected];
	}
	var supportDefender; 
	if($gameTemp.supportDefendCandidates){
		supportDefender = $gameTemp.supportDefendCandidates[$gameTemp.supportDefendSelected];
	}
	
	$gameVariables.setValue(_lastActorSupportAttackId, null);
	$gameVariables.setValue(_lastEnemySupportAttackId, null);
	
	var attackerSide;
	var defenderSide;
	if($gameTemp.isEnemyAttack){
		attackerSide = "enemy";
		defenderSide = "actor";
		attacker = {actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction, isInitiator: true};
		defender = {actor: $gameTemp.currentBattleActor, action: $gameTemp.actorAction};
		if(supportAttacker){			
			$gameVariables.setValue(_lastEnemySupportAttackId, supportAttacker.action.attack.id);
		}
		
	} else {
		attackerSide = "actor";
		defenderSide = "enemy";
		attacker = {actor: $gameTemp.currentBattleActor, action: $gameTemp.actorAction, isInitiator: true};
		defender = {actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction};
		if(supportAttacker){
			$gameVariables.setValue(_lastActorSupportAttackId, supportAttacker.action.attack.id);
		}
	}
	
	$gameVariables.setValue(_lastActorAttackId, $gameTemp.actorAction.attack.id);
	$gameVariables.setValue(_lastEnemyAttackId, $gameTemp.enemyAction.attack.id);
	
	
	defender.isCounterAttack = true;
	this.prepareBattleCache(attacker, "initiator");
	this.prepareBattleCache(defender, "defender");
	if(supportAttacker){
		this.prepareBattleCache(supportAttacker, "support attack");
	}
	
	if(supportDefender){
		this.prepareBattleCache(supportDefender, "support defend");
	}		
	
	function BattleAction(attacker, defender, supportDefender, side, isSupportAttack){
		this._attacker = attacker;
		this._defender = defender;
		this._supportDefender = supportDefender;
		this._side = side;
		this._isSupportAttack = isSupportAttack;
	}
	
	BattleAction.prototype.execute = function(orderIdx){
		var mainAttackerCache = $gameTemp.battleEffectCache[attacker.actor._cacheReference];
		var aCache = $gameTemp.battleEffectCache[this._attacker.actor._cacheReference];
		var storedCacheRef = this._attacker.actor._cacheReference;
		if(this._isSupportAttack){
			this._attacker.actor._cacheReference = null; //remove the main attacker cache ref while calculating support results for this actor 
			//this is a hack to circumvent issues with determining ability activation when a unit has self supporting capabilites
			aCache =  $gameTemp.battleEffectCache[this._attacker.actor._supportCacheReference];
		}
		aCache.side = this._side;
		if(aCache.type == "support attack"){
			if(mainAttackerCache.isDestroyed){
				return; //the support attacker does not get to attack if the main attacker is down
			}			
			aCache.mainAttacker = mainAttackerCache;
		}
		if(aCache.type == "defender"){
			aCache.counterActivated = $gameTemp.defenderCounterActivated;
		}
		var dCache = $gameTemp.battleEffectCache[this._defender.actor._cacheReference];
		var sCache;
		if(this._supportDefender) {
			sCache = $gameTemp.battleEffectCache[this._supportDefender.actor._supportCacheReference];
		}
		if(!aCache.isDestroyed && !dCache.isDestroyed) {
			aCache.actionOrder = orderIdx;
			aCache.hasActed = true;
			var weaponref = this._attacker.action.attack;
			aCache.attacked = dCache;
			aCache.originalTarget = dCache;
			$gameTemp.sortedBattleActorCaches.push(aCache);
			
			/*var isHit = Math.random() < _this.performHitCalculation(
				this._attacker,
				this._defender		
			);*/
			
			var hitInfo;
			if(this._isSupportAttack){
				hitInfo = $gameTemp.battleTargetInfo[this._attacker.actor._supportCacheReference];
			} else {
				hitInfo = $gameTemp.battleTargetInfo[this._attacker.actor._cacheReference];
			}			
			var isHit = hitInfo.isHit;	
			dCache.specialEvasion = hitInfo.specialEvasion;
			
			var activeDefender = this._defender;
			var activeDefenderCache = dCache;						
			
			var damageResult = {
				damage: 0,
				isCritical: false,
				barrierCost: 0,
				hasThresholdBarrier: false,
				thresholdBarrierBroken: false,
				hasReductionBarrier: false,
				hasPercentBarrier: false
			};
			var isSupportDefender = false;
			if(isHit){
				if(isHit && sCache && !sCache.hasActed){
					isHit = 1;
					activeDefender = this._supportDefender;
					activeDefenderCache = sCache;
					
					activeDefenderCache.defended = this._defender.actor;
					isSupportDefender = true;
					aCache.attacked = sCache;
					
					sCache.hasActed = true;						
					if(Math.random() < $statCalc.applyStatModsToValue(this._supportDefender.actor, 0, ["double_image_rate"])){
						sCache.isDoubleImage = true;
						isHit = 0;
					}
				}
				if(isHit){
					damageResult = _this.performDamageCalculation(
						this._attacker,
						activeDefender,
						false,
						false,
						isSupportDefender,
						aCache.type == "support attack"
					);	
				} 					
			} 
			
			if(isHit){
				if(this._attacker.action.attack && this._attacker.action.attack.type == "M"){
					aCache.madeContact = true;
					activeDefenderCache.madeContact = true;
					//activeDefenderCache.attacked = aCache;
				}
			}
			if(this._isSupportAttack && !$statCalc.applyStatModsToValue(this._attacker.actor, 0, ["full_support_damage"])){
				damageResult.damage = Math.floor(damageResult.damage * ENGINE_SETTINGS.SUPPORT_ATTACK_RATIO);				
			}
			
			aCache.hits = isHit;
			activeDefenderCache.isHit = isHit;
			activeDefenderCache.isAttacked = true;
			aCache.inflictedCritical = damageResult.isCritical;
			activeDefenderCache.tookCritical = damageResult.isCritical;
			activeDefenderCache.barrierCost = damageResult.barrierCost;
			activeDefenderCache.hasBarrier = damageResult.hasThresholdBarrier || damageResult.hasReductionBarrier || damageResult.hasPercentBarrier;
			activeDefenderCache.hasThresholdBarrier = damageResult.hasThresholdBarrier;
			activeDefenderCache.barrierBroken = damageResult.thresholdBarrierBroken;
			
			dCache.barrierNames = damageResult.barrierNames;
			
			if(this._side == "actor"){
				if(dCache){
					dCache.side = "enemy";
				}
				if(sCache){
					sCache.side = "enemy";
				}
			} else {
				if(dCache){
					dCache.side = "actor";
				}
				if(sCache){
					sCache.side = "actor";
				}
			}
			
			aCache.damageInflicted = damageResult.damage;
			
			var drainRatio = $statCalc.applyMaxStatModsToValue(this._attacker.actor, 0, ["hp_drain"]);
			if(drainRatio){
				if(!aCache.HPRestored){
					aCache.HPRestored = 0;
				}
				var amount = Math.floor(aCache.damageInflicted * drainRatio);
				aCache.HPRestored+=amount;
				//$statCalc.recoverHP(this._attacker.actor, amount);
				//aCache.currentAnimHP+=amount;
			}
			
			activeDefenderCache.damageTaken+=damageResult.damage;
			
			if(activeDefenderCache.damageTaken >= activeDefenderCache.currentAnimHP + (activeDefenderCache.HPRestored || 0)){
				if($statCalc.applyMaxStatModsToValue(this._defender.actor, 0, ["one_time_miracle"])){
					$statCalc.setAbilityUsed(this._defender.actor, "one_time_miracle");
					activeDefenderCache.damageTaken = activeDefenderCache.currentAnimHP + (activeDefenderCache.HPRestored || 0) - 1;
					aCache.damageInflicted = activeDefenderCache.damageTaken;
				} else {
					activeDefenderCache.isDestroyed = true;
					activeDefenderCache.destroyer = aCache.ref;
				}				
			}				
			
			
			var extraActionInfo = $statCalc.getModDefinitions(this._defender.actor, ["extra_action_on_damage"]);
			var minDamageRequired = -1;
			
			for(var i = 0; i < extraActionInfo.length; i++){
				if(minDamageRequired == -1 || extraActionInfo[i].value < extraActionInfo){
					minDamageRequired = extraActionInfo[i].value;
				}
			}
			
			if(minDamageRequired != -1 && minDamageRequired <= damageResult.damage){
				$statCalc.addAdditionalAction(this._defender.actor);
			}
			
			if(aCache.action.attack && 
				(
					$statCalc.applyStatModsToValue(this._attacker.actor, 0, ["self_destruct"]) ||
					(aCache.hits && $statCalc.applyStatModsToValue(this._attacker.actor, 0, ["self_destruct_hit"]))
				)	
			){
				aCache.isDestroyed = true;
				aCache.selfDestructed = true;
			}
			
			
			var ENCost = weaponref.ENCost;
			if(ENCost != -1){
				aCache.ENUsed = ENCost;
			}
			if(weaponref.totalAmmo != -1){
				aCache.ammoUsed = 1;
			}
			
			
			var activeAttackerSpirits = $statCalc.getActiveSpirits(this._attacker.actor);
			if(activeAttackerSpirits.soul){
				$statCalc.clearSpirit(this._attacker.actor, "soul");
			} else {
				$statCalc.clearSpirit(this._attacker.actor, "valor");
			}			
			$statCalc.clearSpirit(this._attacker.actor, "fury");
			$statCalc.clearSpirit(this._attacker.actor, "mercy");
			$statCalc.clearSpirit(this._attacker.actor, "snipe");				
		}	
		if(dCache && dCache.selfDestructed){
			aCache.targetSelfDestructed = true;
		}	
		
		this._attacker.actor._cacheReference = storedCacheRef;
	}
	
	BattleAction.prototype.determineTargetInfo = function(){
		var finalTarget = this._defender;
		var hitRate = _this.performHitCalculation(
			this._attacker,
			this._defender		
		);		
		
		var isHit = Math.random() < hitRate;
		var specialEvasion = null;
		if(isHit){		
			var weaponref = this._attacker.action.attack; 
			var specialEvadeInfo = $statCalc.getModDefinitions(this._defender.actor, ["special_evade"]);
			var weaponType = weaponref.particleType;
			var aSkill = $statCalc.getPilotStat(this._attacker.actor, "skill");
			var dSkill = $statCalc.getPilotStat(this._defender.actor, "skill");		
			
			var ctr = 0;
			
			if(!$statCalc.getActiveSpirits(this._attacker.actor).strike && !$statCalc.getActiveSpirits(this._attacker.actor).fury){
				while(isHit && ctr < specialEvadeInfo.length){
					var evasionType = specialEvadeInfo[ctr].subType;
					if(evasionType == weaponType || evasionType == "all"){
						if(specialEvadeInfo[ctr].activation == "skill"){
							isHit = dSkill < aSkill;
						} else if(specialEvadeInfo[ctr].activation == "random"){
							isHit = Math.random() > specialEvadeInfo[ctr].value;
						}
						if(!isHit){
							specialEvasion = specialEvadeInfo[ctr];
						}
					}
					ctr++;
				}
			}
		}
		if(isHit && this._supportDefender && !this._supportDefender.blockedHit){
			this._supportDefender.blockedHit = true;
			finalTarget = this._supportDefender;
		}
		var cacheRef;
		if(this._isSupportAttack){
			cacheRef = this._attacker.actor._supportCacheReference;
		} else {
			cacheRef = this._attacker.actor._cacheReference;
		}		
		$gameTemp.battleTargetInfo[cacheRef] = {
			isHit: isHit,
			target: finalTarget,
			initiator: this._attacker,
			specialEvasion: specialEvasion,
			hitRate: hitRate
		}
	}
	
	var actions = [];
	var defenderCounterActivates = Math.random() < $statCalc.applyStatModsToValue(defender.actor, 0, ["counter_rate"]);
	if(defender.action && defender.action.attack && defender.action.attack.isCounter){
		defenderCounterActivates = true;
	}
	if(defenderCounterActivates){
		$gameTemp.defenderCounterActivated = true;
		actions.push(new BattleAction(defender, attacker, null, defenderSide));
		if(!ENGINE_SETTINGS.USE_SRW_SUPPORT_ORDER && supportAttacker){			
			actions.push(new BattleAction(supportAttacker, defender, supportDefender, attackerSide, true));								
		}	
		actions.push(new BattleAction(attacker, defender, supportDefender, attackerSide));		
		if(ENGINE_SETTINGS.USE_SRW_SUPPORT_ORDER && supportAttacker){			
			actions.push(new BattleAction(supportAttacker, defender, supportDefender, attackerSide, true));								
		}	
	} else {
		$gameTemp.defenderCounterActivated = false;
		if(!ENGINE_SETTINGS.USE_SRW_SUPPORT_ORDER && supportAttacker){			
			actions.push(new BattleAction(supportAttacker, defender, supportDefender, attackerSide, true));								
		}	
		actions.push(new BattleAction(attacker, defender, supportDefender, attackerSide));	
		
		actions.push(new BattleAction(defender, attacker, null, defenderSide));		

		if(ENGINE_SETTINGS.USE_SRW_SUPPORT_ORDER && supportAttacker){			
			actions.push(new BattleAction(supportAttacker, defender, supportDefender, attackerSide, true));								
		}	
	}
	
	$gameTemp.battleTargetInfo = {};	
	for(var i = 0; i < actions.length; i++){
		actions[i].determineTargetInfo();
	}
	
	
	
	for(var i = 0; i < actions.length; i++){
		$statCalc.invalidateAbilityCache();
		actions[i].execute(i);
	}
	
	var gainRecipient = $gameTemp.currentBattleActor;	
	var aCache = $gameTemp.battleEffectCache[gainRecipient._cacheReference];
	aCache.expGain = 0;
	aCache.ppGain = 0;
	aCache.fundGain = 0;
	
	var gainDonors = [];
	gainDonors.push($gameTemp.currentBattleEnemy);
	if(supportDefender){
		gainDonors.push(supportDefender.actor);
	}
	aCache.gainDonors = [];
	gainDonors.forEach(function(gainDonor){		
		//var gainDonor = $gameTemp.currentBattleEnemy;
		var dCache = $gameTemp.battleEffectCache[gainDonor._cacheReference];			
		if(!dCache){
			dCache = $gameTemp.battleEffectCache[gainDonor._supportCacheReference];	
		}
		
		if(aCache && dCache){	
			aCache.gainDonors.push(dCache);
		
			var expGain = _this.performExpCalculation(gainRecipient, gainDonor);
			expGain = $statCalc.applyStatModsToValue(gainRecipient, expGain, ["exp"]);
			if($statCalc.getActiveSpirits(gainRecipient).gain){
				totalExp*=2;
			}
			
			var ppGain = _this.performPPCalculation(gainRecipient, gainDonor);
			var fundGain = $statCalc.getAwardedFunds(gainDonor);
			if($statCalc.getActiveSpirits(gainRecipient).fortune){
				fundGain*=2;
			}
			if(!dCache.isDestroyed){
				expGain = Math.floor(expGain / 10);
				ppGain = 0;
				fundGain = 0;
			} else {
				fundGain = $statCalc.applyStatModsToValue(gainRecipient, fundGain, ["fund_gain_destroy"]);
			}
			
			aCache.expGain+= expGain;
			aCache.ppGain+= ppGain;
			aCache.fundGain+= fundGain;
			
			
		}
	});
	if($statCalc.getActiveSpirits(gainRecipient).gain){
		$statCalc.clearSpirit(gainRecipient, "gain");
	}
	if($statCalc.getActiveSpirits(gainRecipient).fortune){
		$statCalc.clearSpirit(gainRecipient, "fortune");
	}
	
	$gameTemp.unitHitInfo = {
		actor: {
			
		},
		enemy: {
			
		},
		event: {
			
		}
	};
	
	Object.keys($gameTemp.battleEffectCache).forEach(function(cacheRef){
		var battleEffect = $gameTemp.battleEffectCache[cacheRef];
		if(battleEffect && battleEffect.attacked && battleEffect.hits){
			var attackId = battleEffect.action.attack.id;
			if(battleEffect.attacked.ref.isActor()){
				var targetId = battleEffect.attacked.ref.actorId();
				if(!$gameTemp.unitHitInfo.actor[targetId]){
					$gameTemp.unitHitInfo.actor[targetId] = {};
				}
				$gameTemp.unitHitInfo.actor[targetId][attackId] = {isSupport: battleEffect.type == "support attack"};		
			} else {
				var targetId = battleEffect.attacked.ref.enemyId();
				if(!$gameTemp.unitHitInfo.enemy[targetId]){
					$gameTemp.unitHitInfo.enemy[targetId] = {};
				}
				$gameTemp.unitHitInfo.enemy[targetId][attackId] = {isSupport: battleEffect.type == "support attack"};		
			}
			var targetId = battleEffect.attacked.ref.event.eventId();
			if(!$gameTemp.unitHitInfo.event[targetId]){
				$gameTemp.unitHitInfo.event[targetId] = {};
			}
			$gameTemp.unitHitInfo.event[targetId][attackId] = {isSupport: battleEffect.type == "support attack"};	
			
		}
	});	
}

BattleCalc.prototype.generateMapBattleResult = function(){
	var _this = this;
	$statCalc.invalidateAbilityCache();
	
	$gameTemp.battleEffectCache = {};
	$gameTemp.sortedBattleActorCaches = [];
	var attacker;
	if($gameTemp.isEnemyAttack){
		attacker = {actor: $gameTemp.currentBattleEnemy, action: $gameTemp.enemyAction};		
	} else {
		attacker = {actor: $gameTemp.currentBattleActor, action: $gameTemp.actorAction};
	}
	_this.prepareBattleCache(attacker, "initiator");
	var aCache = $gameTemp.battleEffectCache[attacker.actor._cacheReference];	
	
	var weaponref = aCache.action.attack;
	var ENCost = weaponref.ENCost;
	if(ENCost != -1){
		aCache.ENUsed = ENCost;
	}
	if(weaponref.totalAmmo != -1){
		aCache.ammoUsed = 1;
	}
	

	aCache.expGain = 0;
	aCache.ppGain = 0;
	aCache.fundGain = 0;	
	aCache.gainDonors = [];
	
	var targets = $gameTemp.currentMapTargets;
	targets.forEach(function(target){
		var defender = {actor: target, action: {type: "none"}};
		_this.prepareBattleCache(defender, "defender");
		var dCache = $gameTemp.battleEffectCache[defender.actor._cacheReference];
		dCache.isAttacked = true;
		dCache.attackedBy = aCache;
		var isHit = Math.random() < _this.performHitCalculation(
			attacker,
			defender		
		);
		if(isHit){
			if(Math.random() < $statCalc.applyStatModsToValue(defender.actor, 0, ["double_image_rate"])){
				dCache.isDoubleImage = true;
				isHit = 0;
			}
		}
		var damageResult = {
			damage: 0,
			isCritical: false,
			barrierCost: 0,
			hasThresholdBarrier: false,
			thresholdBarrierBroken: false,
			hasReductionBarrier: false,
			hasPercentBarrier: false
		};
		if(isHit){
			damageResult = _this.performDamageCalculation(
				attacker,
				defender,
				false,
				false,
				false	
			);	
		} 
		dCache.isHit = isHit;
		dCache.type = "defender";
		dCache.tookCritical = damageResult.isCritical;
		dCache.barrierCost = damageResult.barrierCost;
		dCache.hasBarrier = damageResult.hasThresholdBarrier || damageResult.hasReductionBarrier || damageResult.hasPercentBarrier;
		dCache.hasThresholdBarrier = damageResult.hasThresholdBarrier;
		dCache.barrierBroken = damageResult.thresholdBarrierBroken;
		
		dCache.damageTaken+=damageResult.damage;
		
		if(dCache.damageTaken >= dCache.currentAnimHP){
			dCache.isDestroyed = true;
		}	
		gainRecipient = attacker.actor;
		gainDonor = defender.actor;
				
		if(aCache && dCache){			
			var expGain = _this.performExpCalculation(gainRecipient, gainDonor);
			expGain = $statCalc.applyStatModsToValue(gainRecipient, expGain, ["exp"]);
			if($statCalc.getActiveSpirits(gainRecipient).gain){
				totalExp*=2;
			}
			var ppGain = _this.performPPCalculation(gainRecipient, gainDonor);
			var fundGain = $statCalc.getAwardedFunds(gainDonor);
			if($statCalc.getActiveSpirits(gainRecipient).fortune){
				fundGain*=2;
			}
			if(!dCache.isDestroyed){
				expGain = Math.floor(expGain / 10);
				ppGain = 0;
				fundGain = 0;
			} else {
				fundGain = $statCalc.applyStatModsToValue(gainRecipient, fundGain, ["fund_gain_destroy"]);
			}
			
			aCache.expGain+= expGain;
			aCache.ppGain+= ppGain;
			aCache.fundGain+= fundGain;
			aCache.gainDonors.push(dCache);
		}		
	});
	
	if($statCalc.getActiveSpirits(aCache).fortune){
		$statCalc.clearSpirit(aCache, "fortune");
	}	
	
	if($statCalc.getActiveSpirits(gainRecipient).gain){
		$statCalc.clearSpirit(gainRecipient, "gain");
	}
	
	var activeAttackerSpirits = $statCalc.getActiveSpirits(aCache.actor);
	if(activeAttackerSpirits.soul){
		$statCalc.clearSpirit(aCache.actor, "soul");
	} else {
		$statCalc.clearSpirit(aCache.actor, "valor");
	}
	
	var mapRewardsScaling = 1 / (targets.length / 2);
	aCache.expGain = Math.floor(aCache.expGain * mapRewardsScaling);
	aCache.ppGain = Math.floor(aCache.ppGain * mapRewardsScaling);
	aCache.fundGain = Math.floor(aCache.fundGain * mapRewardsScaling);
	
}

BattleCalc.prototype.getBestWeapon = function(attackerInfo, defenderInfo, optimizeCost, ignoreRange, postMoveEnabledOnly){
	var _this = this;
	var result = _this.getBestWeaponAndDamage(attackerInfo, defenderInfo, optimizeCost, ignoreRange, postMoveEnabledOnly);
	return result.weapon;
}

BattleCalc.prototype.getBestWeaponAndDamage = function(attackerInfo, defenderInfo, optimizeCost, ignoreRange, postMoveEnabledOnly){
	var _this = this;
	var allWeapons = $statCalc.getActorMechWeapons(attackerInfo.actor);
	var bestWeapon;
	var bestDamage = 0;
	var minENCost = -2;
	var maxTotalAmmo = -2;
	var defenderHP = defenderInfo.actor.hp;
	var canShootDown = false;
	allWeapons.forEach(function(weapon){
		if(!weapon.isMap && $statCalc.canUseWeapon(attackerInfo.actor, weapon, postMoveEnabledOnly, defenderInfo.actor) && (ignoreRange || _this.isTargetInRange(attackerInfo.pos, defenderInfo.pos, $statCalc.getRealWeaponRange(attackerInfo.actor, weapon), $statCalc.getRealWeaponMinRange(attackerInfo.actor, weapon)))){
			var damageResult = _this.performDamageCalculation(
				{actor: attackerInfo.actor, action: {type: "attack", attack: weapon}},
				{actor: defenderInfo.actor, action: {type: "none"}},
				true,
				true
			);
			var isReachable;
			var range = $statCalc.getRealWeaponRange(attackerInfo.actor, weapon);
			isReachable = $statCalc.isReachable(defenderInfo.actor, attackerInfo.actor, range, $statCalc.getRealWeaponMinRange(attackerInfo.actor, weapon));
			
			if(isReachable){				
				if(optimizeCost){
					var currentWeaponCanShootDown = false;
					if(damageResult.damage >= defenderHP){
						canShootDown = true;
						currentWeaponCanShootDown = true;
					}
					if(canShootDown){
						if(currentWeaponCanShootDown){
							var currentENCost = weapon.ENCost;
							var currentTotalAmmo = weapon.totalAmmo;
							if(currentTotalAmmo != -1){//ammo using weapon
								if(maxTotalAmmo == -2 || currentTotalAmmo > maxTotalAmmo){
									if(minENCost == -2 || minENCost > 100/currentTotalAmmo){
										bestDamage = damageResult.damage;
										bestWeapon = weapon;
										currentTotalAmmo = maxTotalAmmo;
									}
								}
							} else {
								if(minENCost == -2 || minENCost > currentENCost){
									if(maxTotalAmmo == -2 || 100/currentTotalAmmo > currentENCost){
										bestDamage = damageResult.damage;
										bestWeapon = weapon;
										minENCost = currentENCost;
									}
								}
							}
						}
					} else if(damageResult.damage > bestDamage){
						bestDamage = damageResult.damage;
						bestWeapon = weapon;
					}
				} else {
					if(damageResult.damage > bestDamage){
						bestDamage = damageResult.damage;
						bestWeapon = weapon;
					}
				}
			}
		}
	});		
	return {weapon: bestWeapon, damage: bestDamage};
}