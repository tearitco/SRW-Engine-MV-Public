function StatCalc(){
	this._terrainStringLookup = {
		1: "air",
		2: "land",
		3: "water",
		4: "space"
	}
	this._terrainToNumeric =  {
		"S": 4,
		"A": 3,
		"B": 2,
		"C": 1,
		"D": 0
	};
	this._numericToTerrain =  {
		4: "S",
		3: "A",
		2: "B",
		1: "C",
		0: "D"
	};
	this._terrainSumToLevel = {
		0: "D",
		1: "C",
		2: "C",
		3: "B",
		4: "B",
		5: "A",
		6: "A",
		7: "A",
		8: "S"
	};
	this._terrainLevelPerformance = {
		"S": 1.1,
		"A": 1,
		"B": 0.9,
		"C": 0.8,
		"D": 0.6
	};
	
}

StatCalc.prototype.isActorSRWInitialized = function(actor){
	return actor && actor.SRWInitialized;
}

StatCalc.prototype.canStandOnTile = function(actor, position){
	if(this.isActorSRWInitialized(actor)){
		if($gameMap.regionId(position.x, position.y) % 8 == 1){
			if(this.canFly(actor)){
				if(!this.isFlying(actor)){
					this.setFlying(actor, true);
				}
			} else {
				return false;
			}			
		}
		return true;
	} 
	return false;	
}

StatCalc.prototype.terrainToNumeric = function(terrainString){
	if(this._terrainToNumeric[terrainString]){
		return this._terrainToNumeric[terrainString];
	} else {
		return -1;
	}
}

StatCalc.prototype.numericToTerrain = function(terrainNumber){
	if(this._numericToTerrain[terrainNumber]){
		return this._numericToTerrain[terrainNumber];
	} else {
		return -1;
	}
}

StatCalc.prototype.setCurrentTerrainFromRegionIndex = function(actor, terrainIndex){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.mech.currentTerrain = this._terrainStringLookup[terrainIndex % 8];
	}		
}

StatCalc.prototype.setCurrentTerrainModsFromTilePropertyString = function(actor, propertyString){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.mech.currentTerrainMods = {
			defense: 0,
			evasion: 0,
			hp_regen: 0,
			en_regen: 0
		}		
		if(propertyString){
			var parts = propertyString.split(",");
			actor.SRWStats.mech.currentTerrainMods = {
				defense: String(parts[0]).trim()*1,
				evasion: String(parts[1]).trim()*1,
				hp_regen: String(parts[2]).trim()*1,
				en_regen: String(parts[3]).trim()*1
			};
		}
		
	}		
}

StatCalc.prototype.getCurrentTerrain = function(actor){
	if(this.isActorSRWInitialized(actor)){
		if(this.isFlying(actor)){
			return this._terrainStringLookup[1];
		} else {
			return actor.SRWStats.mech.currentTerrain;
		}		
	}		
}

StatCalc.prototype.getCurrentTerrainMods = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.currentTerrainMods;
	}		
}

StatCalc.prototype.parseTerrainString = function(terrainString){
	if(!terrainString){
		return {
			air: "C",
			land: "C",
			water: "C",
			space: "C"
		}
	}
	var parts = terrainString.split("");
	return {
		air: parts[0],
		land: parts[1],
		water: parts[2],
		space: parts[3]
	}
}

StatCalc.prototype.getMechWeapons = function(actor, mechProperties){
	var result = [];
	for(var i = 0; i < 20; i++) {
		var weaponId = mechProperties["mechAttack"+i];
		if(weaponId !== undefined){
			var weaponDefinition = $dataWeapons[weaponId];
			var weaponProperties = weaponDefinition.meta;
			var totalAmmo = parseInt(weaponProperties.weaponAmmo);
			totalAmmo = Math.ceil(this.applyStatModsToValue(actor, totalAmmo, ["ammo"]));
			var effects = [];
			for(var j = 0; j < 2; j++){
				if(weaponProperties["weaponEffect"+j]){
					effects[j] = weaponProperties["weaponEffect"+j];
				}
			}
			var isMap = false;
			var mapId;
			var ignoresFriendlies = false;
			if(weaponProperties.weaponMapId){
				isMap = true;
				mapId = JSON.parse(weaponProperties.weaponMapId);
				ignoresFriendlies = weaponProperties.weaponIgnoresFriendlies*1 || 0;
			}
			
			var isCombination = false;
			var combinationWeapons = [];
			var combinationType = 0;
			if(weaponProperties.weaponComboWeapons){
				isCombination = true;
				combinationWeapons = JSON.parse(weaponProperties.weaponComboWeapons);
			}
			if(weaponProperties.weaponComboType){
				combinationType = weaponProperties.weaponComboType;
			}
			result.push({
				id: parseInt(weaponDefinition.id),
				name: weaponDefinition.name,
				type: weaponProperties.weaponType,
				postMoveEnabled: parseInt(weaponProperties.weaponPostMoveEnabled),
				power: parseInt(weaponProperties.weaponPower),
				minRange: parseInt(weaponProperties.weaponMinRange),
				range: parseInt(weaponProperties.weaponRange),
				hitMod: parseInt(weaponProperties.weaponHitMod),
				critMod: parseInt(weaponProperties.weaponCritMod),
				totalAmmo: totalAmmo,
				currentAmmo: parseInt(weaponProperties.weaponAmmo),
				ENCost: parseInt(weaponProperties.weaponEN),
				willRequired: parseInt(weaponProperties.weaponWill),
				terrain: this.parseTerrainString(weaponProperties.weaponTerrain),
				effects: effects,
				particleType: (weaponProperties.weaponCategory || "").trim(), //missile, funnel, beam, gravity, physical or "".
				animId: parseInt(weaponProperties.weaponAnimId) || -1,
				isMap: isMap, 
				mapId: mapId,
				ignoresFriendlies: ignoresFriendlies,
				isCombination: isCombination,
				combinationWeapons: combinationWeapons,
				combinationType: combinationType
			});
		}
	}
	return result;
}

StatCalc.prototype.getSpiritInfo = function(actor, actorProperties){
	var result = [];
	for(var i = 1; i <= 6; i++){
		var spiritString = actorProperties["pilotSpirit"+i];
		if(spiritString){
			var parts = spiritString.split(",");
			var cost = String(parts[2]).trim()*1;			
			cost = $statCalc.applyStatModsToValue(actor, cost, ["sp_cost"]);
			result.push({
				idx: String(parts[0]).trim(),
				level: String(parts[1]).trim(),
				cost: cost,
			});
		}
	}
	return result;
}

StatCalc.prototype.getPilotAbilityInfo = function(actorProperties, targetLevel){
	var result = {};
	var currentListIdx = 0;
	for(var i = 1; i <= 30; i++){
		var abilityString = actorProperties["pilotAbility"+i];
		if(abilityString){
			var parts = abilityString.split(",");
			var idx = String(parts[0]).trim();
			var level = String(parts[1]).trim();
			var requiredLevel = String(parts[2]).trim();
			if(requiredLevel <= targetLevel){
				if(!result[idx]){
					result[idx] = {
						idx: idx,
						level: level,
						requiredLevel: requiredLevel,
						slot: currentListIdx++
					}
				} else if(result[idx].level <= level){
					result[idx] = {
						idx: idx,
						level: level,
						requiredLevel: requiredLevel,
						slot: result[idx].slot
					}
				}				
			}
		}
	}
	return result;
}

StatCalc.prototype.getMechAbilityInfo = function(mechProperties){
	var result = [];
	for(var i = 1; i <= 6; i++){
		var abilityString = mechProperties["mechAbility"+i];
		if(abilityString){
			var parts = abilityString.split(",");
			result.push({
				idx: String(parts[0]).trim()
			});
		}
	}
	return result;
}

StatCalc.prototype.getActorMechItems = function(mechId){
	var result = [];	
	var mech = $dataClasses[mechId];
	var ids = $inventoryManager.getActorItemIds(mechId);
	for(var i = 0; i < mech.meta.mechItemSlots; i++){
		if(ids[i]){
			result.push({
				idx: ids[i]
			});
		} else {
			result.push(null);
		}
	}	
	return result;
}

StatCalc.prototype.getMechItemInfo = function(mechProperties){
	var result = [];
	for(var i = 1; i <= 6; i++){
		var abilityString = mechProperties["mechItem"+i];
		if(abilityString){
			var parts = abilityString.split(",");
			result.push({
				idx: String(parts[0]).trim()
			});
		}
	}
	return result;
}

StatCalc.prototype.resetBattleTemp = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.battleTemp = {
			supportAttackCount: 0,
			supportDefendCount: 0,
			actionCount: 0,
			hasFinishedTurn: 0,
			hasUsedContinuousAction: 0,
			evadeCount: 0,
			currentAttack: null
		};
	}
}

StatCalc.prototype.resetStageTemp = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp = {
			inventoryConsumed: {},
			isRevealed: false,
			mapAttackCoolDown: 1,
			nonMapAttackCounter: 1,
			isBoarded: false
		};
		this.resetStatus(actor);
	}
}

StatCalc.prototype.resetStatus = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.status = {
			accuracyDown: false,
			mobilityDown: false,
			armorDown: false,
			movementDown: false,
			attackDown: false,
			rangeDown: false
		}
	}
}

StatCalc.prototype.resetAllStatus = function(type){		
	var _this = this;
	_this.iterateAllActors(type, function(actor){			
		_this.resetStatus(actor);						
	});
}

StatCalc.prototype.isAccuracyDown = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.stageTemp.status.accuracyDown;
	} else {
		return false;
	}
}

StatCalc.prototype.setAccuracyDown = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.status.accuracyDown = true;
	} 
}

StatCalc.prototype.isMobilityDown = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.stageTemp.status.mobilityDown;
	} else {
		return false;
	}
}

StatCalc.prototype.setMobilityDown = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.status.mobilityDown = true;
	} 
}

StatCalc.prototype.isArmorDown = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.stageTemp.status.armorDown;
	} else {
		return false;
	}
}

StatCalc.prototype.setArmorDown = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.status.armorDown = true;
	} 
}

StatCalc.prototype.isMovementDown = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.stageTemp.status.movementDown;
	} else {
		return false;
	}
}

StatCalc.prototype.setMovementDown = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.status.movementDown = true;
	} 
}

StatCalc.prototype.isRangeDown = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.stageTemp.status.rangeDown;
	} else {
		return false;
	}
}

StatCalc.prototype.setRangeDown = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.status.rangeDown = true;
	} 
}

StatCalc.prototype.isAttackDown = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.stageTemp.status.attackDown;
	} else {
		return false;
	}
}

StatCalc.prototype.setAttackDown = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.status.attackDown = true;
	} 
}

StatCalc.prototype.isBoarded = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.stageTemp.isBoarded;
	} else {
		return true;
	}
}

StatCalc.prototype.setBoarded = function(actor){
	if(this.isActorSRWInitialized(actor)){
		this.recoverAmmoPercent(actor, 100);
		if(this.getCurrentWill(actor) > 100){
			this.modifyWill(actor, -5);
			if(this.getCurrentWill(actor) < 100){
				this.setWill(actor, 100);
			}
		}
		actor.SRWStats.stageTemp.isBoarded = true;
	}
}

StatCalc.prototype.clearBoarded = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.isBoarded = false;
	}
}

StatCalc.prototype.isRevealed = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.isActor() || actor.SRWStats.stageTemp.isRevealed;
	} else {
		return true;
	}
}

StatCalc.prototype.setRevealed = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.isRevealed = true;
	} 
}

StatCalc.prototype.getCurrentMaxHPDisplay = function(actor){
	var result = "?????";
	if(this.isActorSRWInitialized(actor)){
		if($statCalc.isRevealed(actor)){
			result = this.getCalculatedMechStats(actor).maxHP;
		}		
	}
	return result;
}

StatCalc.prototype.getCurrentHPDisplay = function(actor){
	var result = "?????";
	if(this.isActorSRWInitialized(actor)){
		if($statCalc.isRevealed(actor)){
			result = this.getCalculatedMechStats(actor).currentHP;
		}		
	}
	return result;
}

StatCalc.prototype.getCurrentMaxENDisplay = function(actor){
	var result = "???";
	if(this.isActorSRWInitialized(actor)){
		if($statCalc.isRevealed(actor)){
			result = this.getCalculatedMechStats(actor).maxEN;
		}		
	}
	return result;
}

StatCalc.prototype.getCurrentENDisplay = function(actor){
	var result = "???";
	if(this.isActorSRWInitialized(actor)){
		if($statCalc.isRevealed(actor)){
			result = this.getCalculatedMechStats(actor).currentEN;
		}		
	}
	return result;
}

StatCalc.prototype.applyBattleStartWill = function(){
	var _this = this;
	this.iterateAllActors(null, function(actor, event){			
		_this.modifyWill(actor, _this.applyStatModsToValue(actor, 0, ["start_will"]));				
	});
}

StatCalc.prototype.applyTurnStartWill = function(type, factionId){
	var _this = this;
	this.iterateAllActors(type, function(actor, event){			
		if(actor.isActor() || actor.factionId == factionId || factionId == null){
			_this.modifyWill(actor, _this.applyStatModsToValue(actor, 1, ["start_turn_will"]));	
		}		
	});
}

StatCalc.prototype.applyEnemyDestroyedWill = function(factionId){
	var _this = this;
	this.iterateAllActors(null, function(actor, event){	
		if($gameSystem.isFriendly(actor, factionId)){
			_this.modifyWill(actor, _this.applyStatModsToValue(actor, 1, ["destroy_will"]));
		}		
	});
}

StatCalc.prototype.getAvailableSpiritStates = function(type){
	return [
		"accel",
		"alert",
		"analyse",
		"charge",
		"disrupt",
		"focus",
		"fortune",
		"gain",
		"mercy",
		"persist",
		"snipe",
		"soul",
		"strike",
		"valor",
		"wall",
		"zeal"
	];
}

StatCalc.prototype.refreshAllSRWStats = function(type){
	var _this = this;
	this.iterateAllActors(type, function(actor, event){			
		_this.initSRWStats(actor, _this.getCurrentLevel(actor));				
	});
}

StatCalc.prototype.initSRWStats = function(actor, level, itemIds){
	if(!level){
		level = 1;
	}
	var items = [];
	if(itemIds){
		for(var i = 0; i < itemIds.length; i++){
			items.push({idx: itemIds[i]});
		}
	}
	actor.SRWStats = {
		pilot: {
			race: "",
			id: -1,
			level: 0,
			will: 100,
			PP: 0,
			exp: level * 500,
			kills: 0,	
			expYield: 0,	
			PPYield: 0,
			stats: {
				base: {},
				growthRates: {},
				calculated: {},
				upgrades: {
					melee: 0,
					ranged: 0,
					skill: 0,
					defense: 0,
					evade: 0,
					hit: 0,
					terrain: {
						air: 0,
						land: 0,
						water: 0,
						space: 0
					},
				}
			},
			spirits: [],
			abilities: null,
			aceAbility: -1
		}, mech: {}
		
	};
	actor.SRWInitialized = true;
	this.resetBattleTemp(actor);
	this.resetStageTemp(actor);	
	var actorId;
	var actorProperties;
	if(actor.isActor()){
		actorId = parseInt(actor.actorId());
		actorProperties = $dataActors[actorId].meta;
	} else {
		actorId = parseInt(actor.enemyId());
		actorProperties = $dataEnemies[actorId].meta;
	}
	actor.SRWStats.pilot.id = actorId;
	actor.SRWStats.pilot.name = actor.name();
	actor.SRWStats.pilot.expYield = parseInt(actorProperties.pilotExpYield);
	actor.SRWStats.pilot.PPYield = parseInt(actorProperties.pilotPPYield);
	
	var aceAbilityIdx = actorProperties.pilotAbilityAce;
	if(typeof aceAbilityIdx != "undefined"){
		actor.SRWStats.pilot.aceAbility = {
			idx: parseInt(aceAbilityIdx),
			level: 0,
			requiredLevel: 0
		}
	}
	actor.SRWStats.pilot.species = actorProperties.pilotSpecies;
	
	
	actor.SRWStats.pilot.activeSpirits = {
		"accel": false,
		"alert": false,
		"analyse": false,
		"charge": false,
		"disrupt": false,
		"focus": false,
		"fortune": false,
		"gain": false,
		"mercy": false,
		"persist": false,
		"snipe": false,
		"soul": false,
		"strike": false,
		"valor": false,
		"vigor": false,
		"wall": false,
		"zeal": false
	};
	actor.SRWStats.pilot.activeEffects = {};
	
	actor.SRWStats.pilot.stats.base.SP = parseInt(actorProperties.pilotBaseSP);
	actor.SRWStats.pilot.stats.base.melee = parseInt(actorProperties.pilotBaseMelee);
	actor.SRWStats.pilot.stats.base.ranged = parseInt(actorProperties.pilotBaseRanged);
	actor.SRWStats.pilot.stats.base.skill = parseInt(actorProperties.pilotBaseSkill);
	actor.SRWStats.pilot.stats.base.defense = parseInt(actorProperties.pilotBaseDefense);
	actor.SRWStats.pilot.stats.base.evade = parseInt(actorProperties.pilotBaseEvade);
	actor.SRWStats.pilot.stats.base.hit = parseInt(actorProperties.pilotBaseHit);
	actor.SRWStats.pilot.stats.base.terrain = this.parseTerrainString(actorProperties.pilotTerrain);
	
	actor.SRWStats.pilot.stats.growthRates.SP = parseFloat(actorProperties.pilotSPGrowth);
	actor.SRWStats.pilot.stats.growthRates.melee = parseFloat(actorProperties.pilotMeleeGrowth);
	actor.SRWStats.pilot.stats.growthRates.ranged = parseFloat(actorProperties.pilotRangedGrowth);
	actor.SRWStats.pilot.stats.growthRates.skill = parseFloat(actorProperties.pilotSkillGrowth);
	actor.SRWStats.pilot.stats.growthRates.defense = parseFloat(actorProperties.pilotDefenseGrowth);
	actor.SRWStats.pilot.stats.growthRates.evade = parseFloat(actorProperties.pilotEvadeGrowth);
	actor.SRWStats.pilot.stats.growthRates.hit = parseFloat(actorProperties.pilotHitGrowth);
	this.applyStoredActorData(actor);
	this.calculateSRWActorStats(actor);	
	if(!actor.SRWStats.pilot.abilities){
		actor.SRWStats.pilot.abilities = this.getPilotAbilityInfo(actorProperties, this.getCurrentLevel(actor));
	}
	
	var mech;
	var isForActor;
	if(actor.isActor()){
		mech = actor.currentClass();
		isForActor = true;
	} else {
		mech = $dataClasses[actor._mechClass];
		isForActor = false;	
	}	
	if(mech){
		actor.SRWStats.mech = this.getMechData(mech, isForActor, items);
		if(!isForActor && $gameTemp.enemyUpgradeLevel){
			var levels = actor.SRWStats.mech.stats.upgradeLevels;
			levels.maxHP = $gameTemp.enemyUpgradeLevel;
			levels.maxEN = $gameTemp.enemyUpgradeLevel;
			levels.armor = $gameTemp.enemyUpgradeLevel;
			levels.mobility = $gameTemp.enemyUpgradeLevel;			
			levels.accuracy = $gameTemp.enemyUpgradeLevel;
			levels.weapons = $gameTemp.enemyUpgradeLevel;			
		}		
		this.calculateSRWMechStats(actor.SRWStats.mech);		
	}
	
	if(!isForActor){
		if(this.canFly(actor)){
			this.setFlying(actor, true);
		}		
	}	
	
	actor.SRWStats.pilot.spirits = this.getSpiritInfo(actor, actorProperties);	
}

StatCalc.prototype.getMechDataById = function(id, forActor){
	var mech = $dataClasses[id];
	return this.getMechData(mech, forActor);
}	

StatCalc.prototype.getMechData = function(mech, forActor, items){	
	var result = {
		id: -1,
		isShip: false,
		unitsOnBoard: [],
		canFly: false,
		isFlying: false,
		currentTerrain: 0,
		currentTerrainMods: {
			defense: 0,
			evasion: 0,
			hp_regen: 0,
			en_regen: 0
		},
		expYield: 0,
		PPYield: 0,
		stats: {
			base: {},
			upgradeLevels: {
				maxHP: 0,
				maxEN: 0,
				armor: 0,
				mobility: 0,
				terrain: {						
					air: 0,
					land: 0,
					water: 0,
					space: 0
				},
				accuracy: 0,
				weapons: 0,
				move: 0
			},
			upgradeCostTypes: {
				maxHP: 0,
				maxEN: 0,
				armor: 0,
				mobility: 0,
				accuracy: 0,
				weapons: 0
			},
			calculated: {}
		},
		weapons: [],
		equips:[],
		abilities: [],
		fullUpgradeAbility: -1,
		basicBattleSpriteName: ""
	};
	if(mech){		
		var mechProperties = mech.meta;
		result.classData = mech;
		result.isShip = mechProperties.mechIsShip;
		result.canFly = mechProperties.mechCanFly;
		result.isFlying = false;
		result.id = mech.id;
		result.expYield = parseInt(mechProperties.mechExpYield);
		result.PPYield = parseInt(mechProperties.mechPPYield);
		result.fundYield = parseInt(mechProperties.mechFundYield);
		result.basicBattleSpriteName = mechProperties.mechBasicBattleSprite;
		result.battleSceneSpriteName = mechProperties.mechBattleSceneSprite;
		result.battleSceneSpriteSize = mechProperties.mechBattleSceneSpriteSize || 0;
		
		result.stats.base.maxHP = parseInt(mechProperties.mechHP);
		//result.currentHP = mechProperties.mechHP;
		result.stats.base.maxEN = parseInt(mechProperties.mechEN);
		//result.currentEN = mechProperties.mechHP;
		result.stats.base.armor = parseInt(mechProperties.mechArmor);
		result.stats.base.mobility = parseInt(mechProperties.mechMobility);	
		result.stats.base.accuracy = parseInt(mechProperties.mechAccuracy);
		result.stats.base.terrain = this.parseTerrainString(mechProperties.mechTerrain);
		result.stats.base.move = parseInt(mechProperties.mechMove);
		var sizeString = mechProperties.mechSize.trim();	
		if(sizeString == "LL"){
			sizeString = "2L";
		}
		if(sizeString == "L"){
			sizeString = "1L";
		}
		if(sizeString == "1S"){
			sizeString = "S";
		}
		result.stats.base.size = sizeString;
		

		result.stats.upgradeCostTypes.maxHP = parseInt(mechProperties.mechUpgradeHPCost);
		//result.currentHP = mechProperties.mechHP;
		result.stats.upgradeCostTypes.maxEN = parseInt(mechProperties.mechUpgradeENCost);
		//result.currentEN = mechProperties.mechHP;
		result.stats.upgradeCostTypes.armor = parseInt(mechProperties.mechUpgradeArmorCost);
		result.stats.upgradeCostTypes.mobility = parseInt(mechProperties.mechUpgradeMobilityCost);	
		result.stats.upgradeCostTypes.accuracy = parseInt(mechProperties.mechUpgradAccuracyCost);	
		result.stats.upgradeCostTypes.weapons = parseInt(mechProperties.mechUpgradeWeaponCost);

		var FUBAbilityIdx = mechProperties.mechFullUpgradeAbility;
		if(typeof FUBAbilityIdx != "undefined"){
			result.fullUpgradeAbility = {
				idx: parseInt(FUBAbilityIdx),
				level: 0,
				requiredLevel: 0
			}
		}
		if(mechProperties.mechCombinesFrom){
			result.combinesFrom = JSON.parse(mechProperties.mechCombinesFrom);
		}
		if(mechProperties.mechCombinesTo){
			result.combinesInto = JSON.parse(mechProperties.mechCombinesTo);
		}
		result.combinedActor = mechProperties.mechCombinedActor;	
		if(mechProperties.mechSubPilots){
			result.subPilots = JSON.parse(mechProperties.mechSubPilots);
		}	
		
		result.transformsInto = mechProperties.mechTransformsInto * 1 || null;			
		result.transformWill = mechProperties.mechTransformWill * 1 || 0;
		result.transformRestores = mechProperties.mechTransformRestores * 1 || 0;	

		result.inheritsUpgradesFrom = mechProperties.mechInheritsUpgradesFrom * 1 || 0;		
		
		result.abilities = this.getMechAbilityInfo(mechProperties);
		result.itemSlots = parseInt(mechProperties.mechItemSlots);		
		
		if(forActor){
			if(result.inheritsUpgradesFrom){
				result.stats.upgradeLevels = this.getStoredMechData(result.inheritsUpgradesFrom).mechUpgrades;
			} else {
				result.stats.upgradeLevels = this.getStoredMechData(mech.id).mechUpgrades;
			}			
			result.items = this.getActorMechItems(mech.id);
		} else {
			result.items = items || [];
		}
		
		var mechData = {
			SRWStats: {
				pilot: {
					abilities: []
				},
				mech: result			
			},
			SRWInitialized: true
		}
		
		result.weapons = this.getMechWeapons(mechData, mechProperties);
	}
	return result;
}

StatCalc.prototype.getSubPilots = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.subPilots || [];
	}
}
StatCalc.prototype.canTransform = function(actor){
	if(this.isActorSRWInitialized(actor) && actor.isActor()){
		return actor.SRWStats.mech.transformsInto != null && actor.SRWStats.mech.transformWill <= this.getCurrentWill(actor);
	} 
	return false;
}

StatCalc.prototype.transform = function(actor, force){
	if(this.isActorSRWInitialized(actor) && actor.isActor()){
		if(this.canTransform(actor ) || force){			
			var calculatedStats = this.getCalculatedMechStats(actor);
			var previousHPRatio = calculatedStats.currentHP / calculatedStats.maxHP;
			var previousENRatio = calculatedStats.currentEN / calculatedStats.maxEN;
			actor.SRWStats.mech = this.getMechDataById(actor.SRWStats.mech.transformsInto, true);
			this.calculateSRWMechStats(actor.SRWStats.mech);
			if(!actor.SRWStats.mech.transformRestores){
				calculatedStats = this.getCalculatedMechStats(actor);
				calculatedStats.currentHP = Math.round(previousHPRatio * calculatedStats.maxHP);
				calculatedStats.currentEN = Math.round(previousENRatio * calculatedStats.maxEN);
			}						
			actor.initImages(actor.SRWStats.mech.classData.meta.srpgOverworld.split(","));
			actor.event.refreshImage();			
		}		
	}
}

StatCalc.prototype.split = function(actor){
	if(this.isActorSRWInitialized(actor) && actor.isActor()){
		var combineInfo = actor.SRWStats.mech.combineInfo;
		var targetActor = $gameActors.actor(actor.SRWStats.mech.combinedActor);
		var calculatedStats = this.getCalculatedMechStats(actor);
		var combinedHPRatio = calculatedStats.currentHP / calculatedStats.maxHP;
		var combinedENRatio = calculatedStats.currentEN / calculatedStats.maxEN;
		targetActor.SRWStats.mech = this.getMechData(actor.currentClass(), true);
		this.calculateSRWMechStats(targetActor.SRWStats.mech);		
		calculatedStats = this.getCalculatedMechStats(targetActor);
		calculatedStats.currentHP = Math.round(combinedHPRatio * calculatedStats.maxHP);
		calculatedStats.currentEN = Math.round(combinedENRatio * calculatedStats.maxEN);
		for(var i = 0; i < combineInfo.participants.length; i++){
			if(combineInfo.participants[i] != targetActor.actorId()){
				var actor = $gameActors.actor(combineInfo.participants[i]);
				var space = this.getAdjacentFreeSpace({x: targetActor.event.posX(), y: targetActor.event.posY()});
				var calculatedStats = this.getCalculatedMechStats(actor);
				calculatedStats.currentHP = Math.round(combinedHPRatio * calculatedStats.maxHP);
				calculatedStats.currentEN = Math.round(combinedENRatio * calculatedStats.maxEN);
				var event = actor.event;
				event.appear();
				event.locate(space.x, space.y);
				event.refreshImage();
			}
		}		
		targetActor.initImages(targetActor.SRWStats.mech.classData.meta.srpgOverworld.split(","));
		targetActor.event.refreshImage();
	}
}

StatCalc.prototype.combine = function(actor, forced){
	if(this.isActorSRWInitialized(actor) && actor.isActor()){
		var combineResult = this.canCombine(actor, forced);
		if(combineResult.isValid){
			var HPRatioSum = 0;
			var HPRatioCount = 0;
			var ENRatioSum = 0;
			var ENRatioCount = 0;
			var combinesInto = combineResult.combinesInto;
			var targetMechData = this.getMechDataById(combinesInto, true);
			targetMechData.combineInfo = combineResult;
			var targetActor = $gameActors.actor(targetMechData.combinedActor);
			var calculatedStats = this.getCalculatedMechStats(targetActor);
			HPRatioSum+=calculatedStats.currentHP / calculatedStats.maxHP;
			HPRatioCount++;
			ENRatioSum+=calculatedStats.currentEN / calculatedStats.maxEN;
			ENRatioCount++;
			targetActor.SRWStats.mech = targetMechData;
			this.calculateSRWMechStats(targetActor.SRWStats.mech);
			//$gameSystem.redeployActor(targetActor, targetActor.event);
			for(var i = 0; i < combineResult.participants.length; i++){
				if(combineResult.participants[i] != targetActor.actorId()){
					var actor = $gameActors.actor(combineResult.participants[i]);
					var calculatedStats = this.getCalculatedMechStats(actor);
					HPRatioSum+=calculatedStats.currentHP / calculatedStats.maxHP;
					HPRatioCount++;
					ENRatioSum+=calculatedStats.currentEN / calculatedStats.maxEN;
					ENRatioCount++;					
					actor.event.erase();
				}
			}
			
			calculatedStats = this.getCalculatedMechStats(targetActor);
			calculatedStats.currentHP = Math.round(calculatedStats.maxHP * HPRatioSum / HPRatioCount);
			calculatedStats.currentEN = Math.round(calculatedStats.maxEN * ENRatioSum / ENRatioCount);
			//targetActor.event.locate(actor.event.posX(), actor.event.posY());
			targetActor.initImages(targetActor.SRWStats.mech.classData.meta.srpgOverworld.split(","));
			targetActor.event.refreshImage();
		}		
	}
}

StatCalc.prototype.isCombined = function(actor){
	if(this.isActorSRWInitialized(actor)){
		 return actor.SRWStats.mech.combinesFrom && actor.SRWStats.mech.combinesFrom.length;
	} else {
		return false;
	}
}

StatCalc.prototype.canCombine = function(actor, forced){
	var result = {
		isValid: false,
		participants: []
	};
	var _this = this;
	if(this.isActorSRWInitialized(actor)){
		var combinesInto = actor.SRWStats.mech.combinesInto;
		if(combinesInto != null){
			var required = this.getMechDataById(combinesInto).combinesFrom;
			var requiredLookup = {};
			for(var i = 0; i < required.length; i++){
				requiredLookup[required[i]] = true;
			}
			var stack = [actor];
			var candidates = [];
			var visited = {};
			while(candidates.length < required.length && stack.length){
				var current = stack.pop();
				if(!visited[current.event.eventId()]){
					var currentMechId = current.SRWStats.mech.id;
					if(!current.event.isErased() && requiredLookup[currentMechId]){
						candidates.push(current.actorId());
					}
					var adjacent;
					if(forced){
						adjacent = _this.getAdjacentActors(actor.isActor() ? "actor" : "enemy", {x: current.event.posX(), y: current.event.posY()});
					} else {
						adjacent = _this.getAllCandidateActors(actor.isActor() ? "actor" : "enemy");
					}
						
					for(var i = 0; i < adjacent.length; i++){
						if(!visited[adjacent[i].event.eventId()]){							
							stack.push(adjacent[i]);
						}
					}
					visited[current.event.eventId()] = true;
				}				
			}
			if(candidates.length == required.length || forced){
				result = {
					isValid: true,
					participants: candidates,
					combinesInto: combinesInto
				};
			}
		}
	}
	return result;
}

StatCalc.prototype.applyStoredActorData = function(actor){
	if(actor.isActor()){
		var storedData = $SRWSaveManager.getActorData(actor.actorId());
		actor.SRWStats.pilot.PP = storedData.PP;
		actor.SRWStats.pilot.exp = storedData.exp;
		actor.SRWStats.pilot.kills = storedData.kills;
		actor.SRWStats.pilot.stats.upgrades = storedData.pilotUpgrades;
		actor.SRWStats.pilot.abilities = storedData.abilities;
	}
}

StatCalc.prototype.getStoredMechData = function(mechId){
	return $SRWSaveManager.getMechData(mechId);	
}

StatCalc.prototype.storeActorData = function(actor){
	if(actor.isActor()){
		$SRWSaveManager.storeActorData(actor.actorId(), {
			pilotUpgrades: actor.SRWStats.pilot.stats.upgrades,			
			PP: actor.SRWStats.pilot.PP,
			exp: actor.SRWStats.pilot.exp,
			kills: actor.SRWStats.pilot.kills,
			abilities: actor.SRWStats.pilot.abilities,
		});
		var classId;
		if(actor.SRWStats.mech.inheritsUpgradesFrom != null){
			classId = actor.SRWStats.mech.inheritsUpgradesFrom;
		} else {
			classId = actor.currentClass().id;
		}
		$SRWSaveManager.storeMechData(classId, {
			mechUpgrades: actor.SRWStats.mech.stats.upgradeLevels
		});		
	}	
}

StatCalc.prototype.storeMechData = function(mech){
	var classId;
	if(mech.inheritsUpgradesFrom != null){
		classId = mech.inheritsUpgradesFrom;
	} else {
		classId = mech.classData.id;
	}
	$SRWSaveManager.storeMechData(classId, {
		mechUpgrades: mech.stats.upgradeLevels
	});	
}

StatCalc.prototype.calculateSRWActorStats = function(actor){
	var _this = this;
	if(this.isActorSRWInitialized(actor)){
		var level = Math.floor(actor.SRWStats.pilot.exp / 500);
		actor.SRWStats.pilot.level = level;
		var baseStats = actor.SRWStats.pilot.stats.base;
		var growthRates = actor.SRWStats.pilot.stats.growthRates;
		var calculatedStats = actor.SRWStats.pilot.stats.calculated;
		Object.keys(growthRates).forEach(function(baseStateName){
			calculatedStats[baseStateName] = baseStats[baseStateName] + Math.floor(level * growthRates[baseStateName]);				
		});
		var upgrades = actor.SRWStats.pilot.stats.upgrades;
		Object.keys(upgrades).forEach(function(baseStateName){
			if(baseStateName == "terrain"){
				calculatedStats.terrain = {};
				Object.keys(baseStats.terrain).forEach(function(terrainType){
					calculatedStats.terrain[terrainType] = _this.incrementTerrain(baseStats.terrain[terrainType], upgrades.terrain[terrainType]);
				});
			} else {
				calculatedStats[baseStateName]+=upgrades[baseStateName];			
			}
		});
		
		calculatedStats.SP = this.applyStatModsToValue(actor, calculatedStats.SP, ["sp"]);	
		calculatedStats.currentSP = calculatedStats.SP;		
	}
}

StatCalc.prototype.getPilotTerrainIncreaseCost = function(levels){
	var costTable = [50, 100, 200, 250];	
	var cost = 0;
	for(var i = 0; i < levels.length; i++){		
		cost+=costTable[levels[i]];						
	}
	return cost;
}

StatCalc.prototype.applyMechUpgradeDeltas = function(actor, deltas){
	var upgradeLevels = actor.SRWStats.mech.stats.upgradeLevels;
	Object.keys(deltas).forEach(function(upgradeStat){
		if(typeof upgradeLevels[upgradeStat] != "undefined"){
			upgradeLevels[upgradeStat]+=deltas[upgradeStat];
		}
	});
	this.calculateSRWMechStats(actor.SRWStats.mech);
}

StatCalc.prototype.applyPilotUpgradeDeltas = function(actor, deltas){
	var upgradeLevels = actor.SRWStats.pilot.stats.upgrades;
	Object.keys(deltas).forEach(function(upgradeStat){
		if(typeof upgradeLevels[upgradeStat] != "undefined"){
			upgradeLevels[upgradeStat]+=deltas[upgradeStat];
		}
		if(upgradeStat == "air" || upgradeStat == "land" || upgradeStat == "water" || upgradeStat == "space"){
			upgradeLevels.terrain[upgradeStat]+=deltas[upgradeStat];
		}
	});
	this.calculateSRWActorStats(actor);
}

StatCalc.prototype.isShip = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.isShip;	
	} else {
		return false;
	}
}

StatCalc.prototype.getBoardedUnits = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.unitsOnBoard;	
	} else {
		return [];
	}
}

StatCalc.prototype.hasBoardedUnits = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.unitsOnBoard.length > 0;	
	} else {
		return false;
	}
}

StatCalc.prototype.removeBoardedUnit = function(actor, ship){
	if(this.isActorSRWInitialized(ship)){
		this.clearBoarded(actor);
		var tmp = [];
		for(var i = 0; i < ship.SRWStats.mech.unitsOnBoard.length; i++){
			if(ship.SRWStats.mech.unitsOnBoard[i] != actor){
				tmp.push(ship.SRWStats.mech.unitsOnBoard[i]);
			}
		}
		ship.SRWStats.mech.unitsOnBoard = tmp;
	} 
}

StatCalc.prototype.addBoardedUnit = function(actor, ship){
	if(this.isActorSRWInitialized(ship)){
		this.setBoarded(actor);
		ship.SRWStats.mech.unitsOnBoard.push(actor);	
	} 
}

StatCalc.prototype.getBattleSceneImage = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.battleSceneSpriteName;	
	} else {
		return "";
	}
}

StatCalc.prototype.getBattleSceneImageSize = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.battleSceneSpriteSize;	
	} else {
		return 0;
	}
}

StatCalc.prototype.getBasicBattleImage = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.basicBattleSpriteName;	
	} else {
		return "";
	}
}

StatCalc.prototype.getBattleIdleImage = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.battleSceneSpriteName;	
	} else {
		return "";
	}
}

StatCalc.prototype.getWeaponDamageUpgradeAmount = function(levels){
	var increasesTable = [100, 100, 100, 150, 150, 150, 200, 200, 200, 250, 200, 200, 200, 200, 200];
	var amount = 0;
	for(var i = 0; i < levels.length; i++){
		if(levels[i] < this.getMaxUpgradeLevel()){			
			amount+=increasesTable[levels[i]];			
		}				
	}
	return amount;
}

StatCalc.prototype.getMechStatIncreaseCost = function(actor, type, levels){
	var costTables = {
		0: [2000, 4000, 6000, 8000, 10000, 10000, 15000, 15000, 15000, 15000, 10000, 10000, 10000, 10000, 10000],
		1: [2000, 3000, 5000, 5000, 5000, 10000, 10000, 15000, 15000, 15000, 10000, 10000, 10000, 10000, 10000]
	};
	var weaponCostTables = {
		0: [12000, 17000, 23000, 30000, 38000, 47000, 57000, 68000, 80000, 93000, 90000, 90000, 90000, 90000, 90000]
	};
	
	var cost = 0;
	var costType = actor.SRWStats.mech.stats.upgradeCostTypes[type];
	for(var i = 0; i < levels.length; i++){
		if(levels[i] < this.getMaxUpgradeLevel()){
			if(type == "weapons"){
				cost+=weaponCostTables[costType][levels[i]];
			} else {
				cost+=costTables[costType][levels[i]];
			}
		}				
	}
	return cost;
}



StatCalc.prototype.getMechStatIncrease = function(type, levels){
	var amountPerLevel = {
		maxHP: 350,
		maxEN: 10,
		armor: 60,
		mobility: 5,
		accuracy: 6
	};
	if(amountPerLevel[type]){
		return amountPerLevel[type] * levels;
	} else {
		return 0;
	}
}

StatCalc.prototype.calculateSRWMechStats = function(targetStats){
	var _this = this;
					
	var mechStats = targetStats.stats.base;
	var mechUpgrades = targetStats.stats.upgradeLevels;
	var calculatedStats = targetStats.stats.calculated;
	calculatedStats.size = mechStats.size;
	Object.keys(mechUpgrades).forEach(function(upgradedStat){
		if(upgradedStat == "maxHP"){
			calculatedStats[upgradedStat] = mechStats[upgradedStat] + (350 * mechUpgrades[upgradedStat]);
		}
		if(upgradedStat == "maxEN"){
			calculatedStats[upgradedStat] = mechStats[upgradedStat] + (10 * mechUpgrades[upgradedStat]);
		}
		if(upgradedStat == "armor"){
			calculatedStats[upgradedStat] = mechStats[upgradedStat] + (60 * mechUpgrades[upgradedStat]);
		}
		if(upgradedStat == "mobility"){
			calculatedStats[upgradedStat] = mechStats[upgradedStat] + (5 * mechUpgrades[upgradedStat]);
		}
		if(upgradedStat == "accuracy"){
			calculatedStats[upgradedStat] = mechStats[upgradedStat] + (6 * mechUpgrades[upgradedStat]);
		}
		if(upgradedStat == "move"){
			calculatedStats[upgradedStat] = mechStats[upgradedStat] + mechUpgrades[upgradedStat];
		}
		if(upgradedStat == "terrain"){
			calculatedStats[upgradedStat] = {};
			Object.keys(mechStats.terrain).forEach(function(terrainType){
				calculatedStats[upgradedStat][terrainType] = _this.incrementTerrain(mechStats.terrain[terrainType], mechUpgrades.terrain[terrainType]);
			});
		}
	});
	
	var mechData = {
		SRWStats: {
			pilot: {
				abilities: []
			},
			mech: targetStats			
		},
		SRWInitialized: true
	}
	calculatedStats.maxHP = $statCalc.applyStatModsToValue(mechData, calculatedStats.maxHP, "maxHP");
	calculatedStats.maxEN = $statCalc.applyStatModsToValue(mechData, calculatedStats.maxEN, "maxEN");

	calculatedStats.currentHP = calculatedStats.maxHP;
	calculatedStats.currentEN = calculatedStats.maxEN;
}

StatCalc.prototype.incrementTerrain = function(terrain, increment){
	var result = this._terrainToNumeric[terrain] + increment;
	if(result > 4){
		result = 4;
	}
	if(result < 0){
		result = 0;
	}
	return this._numericToTerrain[result];
}

StatCalc.prototype.getEquipInfo = function(actor){
	if(this.isActorSRWInitialized(actor)){
		var result = [];
		for(var i = 0; i < actor.SRWStats.mech.itemSlots; i++){			
			result.push(actor.SRWStats.mech.items[i]);				
		}
		return result;	
	} else {
		return [];
	}	
}

StatCalc.prototype.getCurrentWeapons = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.weapons;	
	} else {
		return [];
	}	
}

StatCalc.prototype.getActiveMapWeapons = function(actor, isPostMove){
	var _this = this;
	var mapWeapons = [];
	if(this.isActorSRWInitialized(actor)){
		var weapons =  actor.SRWStats.mech.weapons;	
		var mapWeapons = [];
		weapons.forEach(function(weapon){
			if(weapon.isMap && _this.canUseWeapon(actor, weapon, isPostMove)){
				mapWeapons.push(weapon);
			}
		});
	} 
	return mapWeapons;
}

StatCalc.prototype.getWeaponPower = function(actor, weapon){
	if(this.isActorSRWInitialized(actor)){
		var levels = [];
		for(var i = 0; i < actor.SRWStats.mech.stats.upgradeLevels.weapons; i++){
			levels.push(i);
		}
		return weapon.power + this.getWeaponDamageUpgradeAmount(levels);
	} else {
		return 0;
	}
}

StatCalc.prototype.getMaxPilotStat = function(){
	return 400;
}

StatCalc.prototype.getMaxTerrainLevelNumeric = function(){
	return 4;
}

StatCalc.prototype.getMaxUpgradeLevel = function(){
	return 10;
}

StatCalc.prototype.getOverallModificationLevel = function(actor){
	if(this.isActorSRWInitialized(actor)){
		var totalPercent = 0;
		var unitPercent = 100 / (this.getMaxUpgradeLevel() * 5);
		var mechUpgrades = actor.SRWStats.mech.stats.upgradeLevels;	
		Object.keys(mechUpgrades).forEach(function(upgradedStat){
			if(upgradedStat == "maxHP" || upgradedStat == "maxEN" || upgradedStat == "armor" || upgradedStat == "mobility" || upgradedStat == "accuracy"){
				totalPercent+=(mechUpgrades[upgradedStat] || 0) * unitPercent;
			}
		});		
		return Math.round(totalPercent);
	} else {
		return 0;
	}
}

StatCalc.prototype.getWeaponUpgradeLevel = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.stats.upgradeLevels.weapons;
	} else {
		return "";
	}	
}

StatCalc.prototype.getPilotStat = function(actor, stat){
	if(this.isActorSRWInitialized(actor)){
		var result = actor.SRWStats.pilot.stats.calculated[stat];
		if(typeof result != "undefined"){
			return result;
		} else {
			return 0;
		}
	} else {
		return 0;
	}
}

StatCalc.prototype.getPilotTerrain = function(actor, terrain){
	if(this.isActorSRWInitialized(actor)){
		var result = actor.SRWStats.pilot.stats.calculated.terrain[terrain];
		if(typeof result != "undefined"){
			return result;
		} else {
			return "C";
		}
	} else {
		return "C";
	}
}

StatCalc.prototype.getCurrentPilot = function(mechId){
	var result;
	this.iterateAllActors("actor", function(actor){
		if(actor.currentClass().id == mechId){
			result = actor;
		}
	});
	return result;
}

StatCalc.prototype.getCurrentDeploySlot = function(actorId){
	var party = $gameParty.allMembers();
	var ctr = 0;
	var slot = -1;
	while(slot == -1 && ctr < party.length){
		if(party[ctr].actorId() == actorId){
			slot = ctr;
		}
		ctr++;
	}
	return slot;
}

StatCalc.prototype.getSpecies = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.species;
	} else {
		return "";
	}	
}

StatCalc.prototype.getAwardedFunds = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.fundYield;
	} else {
		return 0;
	}	
}

StatCalc.prototype.getPilotStats = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.stats;
	} else {
		return {};
	}	
}

StatCalc.prototype.getCalculatedPilotStats = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.stats.calculated;
	} else {
		return {};
	}	
}

StatCalc.prototype.getCalculatedMechStats = function(actor){
	if(this.isActorSRWInitialized(actor)){
		if(actor.SRWStats.mech.stats){
			return actor.SRWStats.mech.stats.calculated;
		} else {
			return {};
		}		
	} else {
		return {};
	}	
}	

StatCalc.prototype.getCurrentLevel = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.level;
	} else {
		return 0;
	}	
}

StatCalc.prototype.getCurrentSP = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.stats.calculated.currentSP;
	} else {
		return 0;
	}	
}

StatCalc.prototype.getCurrentPP = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.PP;
	} else {
		return 0;
	}	
}

StatCalc.prototype.getSpiritList = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.spirits;
	} else {
		return 0;
	}	
}	

StatCalc.prototype.getActiveSpirits = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.activeSpirits;
	} else {
		return {};
	}	
}	

StatCalc.prototype.getLearnedPilotAbilities = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.abilities;
	} else {
		return {};
	}
}

StatCalc.prototype.learnAbility = function(actor, abilityDef){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.pilot.abilities[abilityDef.idx] = abilityDef;
	} else {
		return {};
	}
}

StatCalc.prototype.getPilotAbilityList = function(actor){
	if(this.isActorSRWInitialized(actor)){
		var learnedAbilities = actor.SRWStats.pilot.abilities;
		var result = [];
		if(learnedAbilities){
			Object.keys(learnedAbilities).forEach(function(abilityIdx){
				var ability = learnedAbilities[abilityIdx];
				if(ability.slot != -1){
					result[ability.slot] = ability;
				}
			});	
		}		
		return result;
	} else {
		return 0;
	}	
}	

StatCalc.prototype.getMechAbilityList = function(actor){
	if(this.isActorSRWInitialized(actor)){			
		return actor.SRWStats.mech.abilities;
	} else {
		return 0;
	}	
}	


StatCalc.prototype.getMechFUB = function(actor){
	if(this.isActorSRWInitialized(actor)){			
		return actor.SRWStats.mech.fullUpgradeAbility;
	} else {
		return null;
	}	
}	

StatCalc.prototype.getAceAbility = function(actor){
	if(this.isActorSRWInitialized(actor)){			
		return actor.SRWStats.pilot.aceAbility;
	} else {
		return null;
	}	
}

StatCalc.prototype.getCurrentMaxPilotAbilitySlot = function(actor){
	if(this.isActorSRWInitialized(actor)){
		var maxSlot = -1;
		var learnedAbilities = actor.SRWStats.pilot.abilities;	
		Object.keys(learnedAbilities).forEach(function(abilityIdx){
			var ability = learnedAbilities[abilityIdx];
			if(ability.slot > maxSlot){
				maxSlot = ability.slot;
			}
		});
		return maxSlot;
	} else {
		return 0;
	}	
}	

StatCalc.prototype.getActorMechWeapons = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.weapons;
	} else {
		return {};
	}	
}

StatCalc.prototype.getActorMechWeapon = function(actor, weaponId){
	var result;
	if(this.isActorSRWInitialized(actor)){
		var weapons = this.getActorMechWeapons(actor);
		weapons.forEach(function(weapon){
			if(weapon.id == weaponId){
				result = weapon;
			}
		});
	} else {
		return {};
	}
	return result;	
}

StatCalc.prototype.getCurrentWill = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.will;
	} else {
		return {};
	}	
}

StatCalc.prototype.getCurrentMoveRange = function(actor){
	if(this.isActorSRWInitialized(actor)){
		var totalMove = actor.SRWStats.mech.stats.calculated.move;
		if(this.getActiveSpirits(actor).accel){
			totalMove+=3; 
		}
		totalMove = this.applyStatModsToValue(actor, totalMove, ["movement"]);
		if(this.isMovementDown(actor)){
			totalMove-=3;
		}
		if(totalMove < 1){
			totalMove = 1;
		}
		return totalMove;
	} else {
		return 1;
	}		
}

StatCalc.prototype.canFly = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.canFly * 1 || this.applyStatModsToValue(actor, 0, ["fly"]);
	} else {
		return false;
	}		
}

StatCalc.prototype.isFlying = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.isFlying;
	} else {
		return false;
	}		
}

StatCalc.prototype.setFlying = function(actor, newVal){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.mech.isFlying = newVal;
	} 		
}	

StatCalc.prototype.getCombinationWeaponParticipants = function(actor, weapon){
	var _this = this;
	var result = {
		isValid: false,
		participants: []
	};
	
	if(weapon.isCombination){
		var requiredWeaponsLookup = {};
		weapon.combinationWeapons.forEach(function(weapon){
			requiredWeaponsLookup[weapon] = true;
		});
		var targetCount = weapon.combinationWeapons.length;
		
		function validateParticipant(actor){
			var hasARequiredWeapon = false;
					
			var weapons = _this.getCurrentWeapons(actor);
			var ctr = 0;			
			while(!hasARequiredWeapon && ctr < weapons.length){					
				if(requiredWeaponsLookup[weapons[ctr].id]){
					var currentWeapon = weapons[ctr];
					var canUse = true;
					if(_this.getCurrentWill(actor) < currentWeapon.willRequired){
						canUse = false;
					}
					if(currentWeapon.requiredEN != -1 && _this.getCurrenEN(actor) < currentWeapon.ENCost){
						canUse = false;
					}						
					if(currentWeapon.currentAmmo == 0){
						canUse = false;
					}							
					if(canUse){
						hasARequiredWeapon = true;								
					}						
				}
				ctr++;
			}
			
			return hasARequiredWeapon;
		}
		var participants = [];
		if(weapon.combinationType == 0){//all participants must be adjacent			
			var candidates = [actor];
			var visited = {};
			visited[actor.event.eventId()] = true;
			while(participants.length < targetCount && candidates.length){
				var current = candidates.pop();
				var adjacent = this.getAdjacentActorsWithDiagonal(actor.isActor() ? "actor" : "enemy", {x: current.event.posX(), y: current.event.posY()});
				for(var i = 0; i < adjacent.length; i++){
					if(!visited[adjacent[i].event.eventId()] && validateParticipant(adjacent[i])){
						participants.push(adjacent[i]);
						candidates.push(adjacent[i]);
						visited[adjacent[i].event.eventId()] = true;
					}
				}			
			}
			
		} else if(weapon.combinationType == 1){//all participants must be on the map
			this.iterateAllActors(actor.isActor() ? "actor" : "enemy", function(actor, event){			
				if(validateParticipant(actor)){
					participants.push(actor);
				}
			});
		}
		if(participants.length >= targetCount){
			result = {
				isValid: true,
				participants: participants
			};
		}
	}
	return result;
}

StatCalc.prototype.canUseWeaponDetail = function(actor, weapon, postMoveEnabledOnly, rangeTarget){
	var canUse = true;
	var detail = {};
	if(this.isActorSRWInitialized(actor)){
		if(weapon.isCombination){			
			if(!this.getCombinationWeaponParticipants(actor, weapon).isValid){
				canUse = false;
				detail.noParticipants = true;
			} 						
		}		
		if(weapon.currentAmmo == 0){ //current ammo is -1 for attacks that don't consume any
			canUse = false;
			detail.ammo = true;
		}
		if(weapon.ENCost > actor.SRWStats.mech.stats.calculated.currentEN){
			canUse = false;
			detail.EN = true;
		}
		if(weapon.willRequired > actor.SRWStats.pilot.will){
			canUse = false;
			detail.will = true;
		}
		if(postMoveEnabledOnly && !weapon.postMoveEnabled){
			canUse = false;
			detail.postMove = true;
		}
		var pos = {
			x: actor.event.posX(),
			y: actor.event.posY()
		};
		if(!weapon.isMap){
			if(rangeTarget){
				var targetpos = {
					x: rangeTarget.event.posX(),
					y: rangeTarget.event.posY()
				};
				if(!$battleCalc.isTargetInRange(pos, targetpos, weapon.range, weapon.minRange)){
					canUse = false;
					detail.target = true;
				}
			} else {
				var rangeResult;
				var type = actor.isActor() ? "enemy" : "actor";
				
				if(!this.getAllInRange($gameSystem.getUnitFactionInfo(actor), pos, weapon.range, weapon.minRange).length){
					canUse = false;
					detail.target = true;
				}
			}
		} else if($gameTemp.isEnemyAttack){
			canUse = false;
			detail.isMap = true;
		}		
	} else {
		canUse = false;
	} 	
	return {
		canUse: canUse,
		detail: detail
	};
}

StatCalc.prototype.canUseWeapon = function(actor, weapon, postMoveEnabledOnly){
	if(this.isActorSRWInitialized(actor)){
		if(weapon.isCombination){			
			if(!this.getCombinationWeaponParticipants(actor, weapon).isValid){
				return false;
			} 						
		}
		if(weapon.currentAmmo == 0){ //current ammo is -1 for attacks that don't consume any
			return false;
		}
		if(weapon.ENCost > actor.SRWStats.mech.stats.calculated.currentEN){
			return false;
		}
		if(weapon.willRequired > actor.SRWStats.pilot.will){
			return false;
		}
		if(postMoveEnabledOnly && !weapon.postMoveEnabled){
			return false;
		}
		if(!actor.isActor() && weapon.isMap && actor.SRWStats.stageTemp.nonMapAttackCounter < actor.SRWStats.stageTemp.mapAttackCoolDown){
			return false;
		}
	} else {
		return false;
	} 	
	return true;
}	

StatCalc.prototype.hasMapWeapon = function(actor){
	if(this.isActorSRWInitialized(actor)){
		var allWeapons = this.getActorMechWeapons(actor);
		var result = false;
		allWeapons.forEach(function(weapon){
			if(weapon.isMap){
				result = true;
			}
		});
		return result;
	} else {
		return false;
	}
}

StatCalc.prototype.incrementNonMapAttackCounter = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.nonMapAttackCounter++;
	} 
}

StatCalc.prototype.clearNonMapAttackCounter = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.nonMapAttackCounter = 0;
	} 
}

StatCalc.prototype.getMaxWill = function(actor){
	if(this.isActorSRWInitialized(actor)){
		var maxWill = 150;
		maxWill = $statCalc.applyStatModsToValue(actor, maxWill, ["max_will"]);
		return maxWill;			
	} 	
	return 100;
}

StatCalc.prototype.canWillIncrease = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.will < this.getMaxWill(actor);		
	} 	
	return false;
}

StatCalc.prototype.canWillDecrease = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.will > 50;		
	} 	
	return false;
}

StatCalc.prototype.iterateAllActors = function(type, func){
	var _this = this;
	var actorCollection;
	if($gameSystem._isIntermission){
		actorCollection = $gameSystem._availableUnits;
		actorCollection.forEach(function(actor) {			
			if(actor && _this.isActorSRWInitialized(actor)){
				if(!type || (type == "actor" && actor.isActor()) || (type == "enemy" && !actor.isActor())){
					func(actor, null);
				}			
			}
		});
	} else {
		actorCollection = $gameMap.events();
		actorCollection.forEach(function(event) {
			var battlerArray = $gameSystem.EventToUnit(event.eventId());
			if(battlerArray){
				var actor = battlerArray[1];
				if(actor && _this.isActorSRWInitialized(actor)){
					if(!type || (type == "actor" && actor.isActor()) || (type == "enemy" && !actor.isActor())){
						func(actor, event);
					}
				}
			}
		});
	}
}

StatCalc.prototype.getTopAce = function(){
	var _this = this;
	var maxKills = -1;
	var topAce;
	this.iterateAllActors(null, function(actor, event){		
		var kills = _this.getKills(actor);
		if(kills > maxKills){
			maxKills = kills;
			topAce = actor;
		}		
	});
	return topAce;
}

StatCalc.prototype.getFullWeaponRange = function(actor, postMoveEnabledOnly){
	var _this = this;
	var allWeapons = _this.getActorMechWeapons(actor);
	var currentRange = 0;
	var currentMinRange = -1;
	allWeapons.forEach(function(weapon){
		if(_this.canUseWeapon(actor, weapon, postMoveEnabledOnly)){
			var range = _this.getRealWeaponRange(actor, weapon.range);
			var minRange = weapon.minRange;
			if(range > currentRange){
				currentRange = range;
			}
			if(currentMinRange == -1 || currentMinRange > minRange){
				currentMinRange = minRange;
			}
		}		
	});
	return {range: currentRange, minRange: currentMinRange};
}

StatCalc.prototype.isReachable = function(target, user, range, minRange){
	var _this = this;	
	var hasEmptyTiles = false;
	var userIsInRange = false;
	var offsetX = target.event.posX();
	var offsetY = target.event.posY();
	for(var i = 0; i < $gameMap.width(); i++){
		for(var j = 0; j < $gameMap.height(); j++){
			var deltaX = Math.abs(offsetX - i);
			var deltaY = Math.abs(offsetY - j);
			var totalDelta = deltaX + deltaY;
			if(totalDelta <= range && totalDelta >= minRange){
				var unit = this.activeUnitAtPosition({x: i, y: j});
				if(unit){
					if(unit.event.eventId() == user.event.eventId()){
						userIsInRange = true;
					}
				} else {
					hasEmptyTiles = true;
				}
			}
		}
	}
	return hasEmptyTiles || userIsInRange;
}

StatCalc.prototype.getAllInRange = function(factionConfig, pos, range, minRange){
	var _this = this;
	var result = [];
	this.iterateAllActors(null, function(actor, event){			
		var isInRange = $battleCalc.isTargetInRange({x: pos.x, y: pos.y}, {x: event.posX(), y: event.posY()}, range, minRange);
		var isValidTarget = false;
		if(factionConfig.attacksPlayers && actor.isActor()){
			isValidTarget = true;
		}
		if(actor.isEnemy() && factionConfig.attacksFactions.indexOf(actor.factionId) != -1){
			isValidTarget = true;
		}
		if(isValidTarget && isInRange && !event._erased){
			result.push(event);
		}			
	});
	return result;
}

StatCalc.prototype.isActorBelowHP = function(id, hp){
	return this.isBelowHP("actor", id, hp);
}

StatCalc.prototype.isEnemyBelowHP = function(id, hp){
	return this.isBelowHP("enemy", id, hp);
}

StatCalc.prototype.isBelowHP = function(type, id, hp){
	var _this = this;
	var result = false;
	this.iterateAllActors(type, function(actor, event){	
		if(!event.isErased()){
			var currentId;
			if(type == "actor"){
				currentId = actor.actorId();
			} else {
				currentId = actor.enemyId();
			}
			if(currentId == id && _this.getCalculatedMechStats(actor).currentHP < hp){
				result = true;
			}
		}				
	});
	return result;
}

StatCalc.prototype.isEventBelowHP = function(id, hp){
	var _this = this;
	var result = false;
	this.iterateAllActors(null, function(actor, event){	
		if(!event.isErased()){	
			if(actor.event.eventId() == id && _this.getCalculatedMechStats(actor).currentHP < hp){
				result = true;
			}	
		}	
	});
	return result;
}

StatCalc.prototype.getAllOccupiedSpaces = function(){
	var result = [];
	this.iterateAllActors(null, function(actor, event){			
		result.push({x: event.posX(), y: event.posY()});				
	});
	return result;
}

StatCalc.prototype.isActorInRegion = function(actorId, regionId){
	var result = false;
	this.iterateAllActors("actor", function(actor, event){	
		if((actorId == -1 || actorId == actor.actorId()) && $gameMap.regionId(event.posX(), event.posY()) == regionId){
			result = true;
		}				
	});
	return result;
}

StatCalc.prototype.isEnemyInRegion = function(enemyId, regionId){
	var result = false;
	this.iterateAllActors("enemy", function(actor, event){	
		if((enemyId == -1 || enemyId == actor.enemyId()) && $gameMap.regionId(event.posX(), event.posY()) == regionId){
			result = true;
		}				
	});
	return result;
}


StatCalc.prototype.isFreeSpace = function(position, type){
	var isFree = true;
	this.iterateAllActors(type, function(actor, event){			
		if(event.posX() == position.x && event.posY() == position.y && !event.isErased()){
			isFree = false;
		}		
	});
	return isFree;
}

StatCalc.prototype.getAdjacentFreeSpace = function(position, type, eventId){
	var occupiedCoordLookup = {};
	this.iterateAllActors(type, function(actor, event){			
		if(!event.isErased() && event.eventId() != eventId){
			if(!occupiedCoordLookup[event.posX()]){
				occupiedCoordLookup[event.posX()] = {};
			}
			occupiedCoordLookup[event.posX()][event.posY()] = true;
		}		
	});
	
	var candidates = [];
	for(var i = 0; i < $gameMap.width(); i++){
		for(var j = 0; j < $gameMap.height(); j++){
			if(!occupiedCoordLookup[i] || !occupiedCoordLookup[i][j]){
				candidates.push({position: {x: i, y: j}, distance: Math.hypot(position.x-i, position.y-j)});
			}
		}
	}
	
	return candidates.sort(function(a, b){return a.distance - b.distance;})[0].position;

}

StatCalc.prototype.activeUnitAtPosition = function(position, type){
	var result;
	this.iterateAllActors(type, function(actor, event){			
		if(!event.isErased() && event.posX() == position.x && event.posY() == position.y && !event.isErased()){
			result = actor;
		}		
	});
	return result;
}

StatCalc.prototype.activeUnitsInTileRange = function(tiles, type){
	var result = [];
	var lookup = {};
	for(var i = 0; i < tiles.length; i++){
		var coord = tiles[i];
		if(!lookup[coord[0]]){
			lookup[coord[0]] = {};
		}
		if(!lookup[coord[0]][coord[1]]){
			lookup[coord[0]][coord[1]] = true;
		}
	}
	this.iterateAllActors(null, function(actor, event){			
		if(!event.isErased() && lookup[event.posX()]  && lookup[event.posX()][event.posY()]){3
			if(type == "enemy"){
				if($gameSystem.isEnemy(actor)){
					result.push(actor);
				}				
			} else if(type == "actor"){
				if(!$gameSystem.isEnemy(actor)){
					result.push(actor);
				}	
			} else {
				result.push(actor);
			}			
		}		
	});
	return result;
}

StatCalc.prototype.getAllActors = function(type){
	var result = [];
	this.iterateAllActors(type, function(actor){			
		result.push(actor);				
	});
	return result;
}


StatCalc.prototype.getAllActorEvents = function(type){
	var result = [];
	this.iterateAllActors(type, function(actor, event){	
		if(!event.isErased()){
			result.push(event);	
		}					
	});
	return result;
}


StatCalc.prototype.getOccupiedPositionsLookup = function(type){
	var result = {};
	this.iterateAllActors(type, function(actor, event){	
		if(!event.isErased()){
			var x = event.posX();
			var y = event.posY(); 
			if(!result[x]){
				result[x] = {};
			}
			result[x][y] = 1;
		}					
	});
	return result;
}

StatCalc.prototype.getAllCandidates = function(type){
	var result = [];
	this.iterateAllActors(type, function(actor, event){	
		if(!event.isErased()){
			result.push({actor: actor, pos: {x: event.posX(), y: event.posY()}, event: event});	
		}					
	});
	return result;
}

StatCalc.prototype.getAllCandidateActors = function(type){
	var result = [];
	this.iterateAllActors(type, function(actor, event){	
		if(!event.isErased()){
			result.push(actor);	
		}					
	});
	return result;
}

StatCalc.prototype.isAdjacentTo = function(type, actor, targetId){
	var result = false
	var actorId;
	if(actor.isActor()){
		actorId = actor.actorId();
	} else {
		actorId = actor.enemyId();
	}
	var event = $gameMap.event($gameSystem.ActorToEvent(actorId));
	if(event){
		var position = {x: event.posX(), y: event.posY()};
		this.iterateAllActors(type, function(actor, event){	
			var actorId;
			if(actor.isActor()){
				actorId = actor.actorId();
			} else {
				actorId = actor.enemyId();
			}
			if(!event.isErased() && actorId == targetId && (Math.abs(event.posX() - position.x) + Math.abs(event.posY() - position.y)) == 1){		
				result = true;
			}					
		});
	}
	return result;
}

StatCalc.prototype.getAdjacentEvents = function(type, position){
	var result = [];
	this.iterateAllActors(type, function(actor, event){
		if(!event.isErased() && (Math.abs(event.posX() - position.x) + Math.abs(event.posY() - position.y)) == 1){				
			result.push(event);							
		}					
	});
	return result;
}

StatCalc.prototype.getAdjacentActors = function(type, position){
	var result = [];
	this.iterateAllActors(type, function(actor, event){
		if(!event.isErased() && (Math.abs(event.posX() - position.x) + Math.abs(event.posY() - position.y)) == 1){				
			result.push(actor);							
		}					
	});
	return result;
}

StatCalc.prototype.getAdjacentActorsWithDiagonal = function(type, position){
	var result = [];
	this.iterateAllActors(type, function(actor, event){
		var isDirect = false;
		if((Math.abs(event.posX() - position.x) + Math.abs(event.posY() - position.y)) == 1){
			isDirect = true;
		}
		var isDiagonal = false;
		if((Math.abs(event.posX() - position.x) == 1 && Math.abs(event.posY() - position.y)) == 1){
			isDiagonal = true;
		}	
		if(!event.isErased() && (isDirect || isDiagonal)){				
			result.push(actor);							
		}					
	});
	return result;
}

StatCalc.prototype.getSupportRecipientCandidates = function(type, position, all){
	var result = [];
	this.iterateAllActors(type, function(actor, event){
		if(!event.isErased() && (Math.abs(event.posX() - position.x) + Math.abs(event.posY() - position.y)) == 1){				
			result.push({actor: actor, pos: {x: event.posX(), y: event.posY()}, event: event});							
		}					
	});
	return result;
}

StatCalc.prototype.getSupportAttackCandidates = function(factionId, position){
	var result = [];
	this.iterateAllActors(null, function(actor, event){
		if(!event.isErased() && (Math.abs(event.posX() - position.x) + Math.abs(event.posY() - position.y)) == 1){
			var maxSupportAttacks = $statCalc.applyStatModsToValue(actor, 0, ["support_attack"]);
			if(maxSupportAttacks > actor.SRWStats.battleTemp.supportAttackCount && !actor.SRWStats.battleTemp.hasFinishedTurn){
				if($gameSystem.isFriendly(actor, factionId)){
					result.push({actor: actor, pos: {x: event.posX(), y: event.posY()}});	
				}				
			}			
		}					
	});
	return result;
}

StatCalc.prototype.incrementSupportAttackCounter = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.battleTemp.supportAttackCount++;
	}
}
	
StatCalc.prototype.getSupportDefendCandidates = function(factionId, position){
	var result = [];
	this.iterateAllActors(null, function(actor, event){
		if(!event.isErased() && (Math.abs(event.posX() - position.x) + Math.abs(event.posY() - position.y)) == 1){
			var maxSupportDefends = $statCalc.applyStatModsToValue(actor, 0, ["support_defend"]);			
			if(maxSupportDefends > actor.SRWStats.battleTemp.supportDefendCount){
				if($gameSystem.isFriendly(actor, factionId)){
					result.push({actor: actor, pos: {x: event.posX(), y: event.posY()}});
				}				
			}
		}					
	});
	return result;
}

StatCalc.prototype.incrementSupportDefendCounter = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.battleTemp.supportDefendCount++;
	}
}

StatCalc.prototype.getEvadeCount = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.battleTemp.evadeCount;
	}
}

StatCalc.prototype.incrementEvadeCount = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.battleTemp.evadeCount++;
	}
}

StatCalc.prototype.resetEvadeCount = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.battleTemp.evadeCount = 0;
	}
}

StatCalc.prototype.hasUsedContinuousAction = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.battleTemp.hasUsedContinuousAction;
	}
}

StatCalc.prototype.setHasUsedContinuousAction = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.battleTemp.hasUsedContinuousAction = 1;
	}
}

StatCalc.prototype.setCurrentAttack = function(actor, attack){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.battleTemp.currentAttack = attack;
	}
}

StatCalc.prototype.resetCurrentAttack = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.battleTemp.currentAttack = null;
	}
}

StatCalc.prototype.modifyAllWill = function(type, increment){		
	var _this = this;
	_this.iterateAllActors(type, function(actor){			
		_this.modifyWill(actor, increment);						
	});
}

StatCalc.prototype.setWill = function(actor, amount){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.pilot.will = amount;
	}
}

StatCalc.prototype.modifyWill = function(actor, increment){
	if(this.isActorSRWInitialized(actor)){
		var maxWill = this.getMaxWill(actor);
		actor.SRWStats.pilot.will+=increment;
		if(actor.SRWStats.pilot.will > maxWill){
			actor.SRWStats.pilot.will = maxWill;
		}
		if(actor.SRWStats.pilot.will < 50){
			actor.SRWStats.pilot.will = 50;
		}
	} 	
}

StatCalc.prototype.getTerrainMod = function(actor){
	if(this.isActorSRWInitialized(actor)){
		var currentTerrain = this.getCurrentTerrain(actor);
		var pilotTerrainLevel = actor.SRWStats.pilot.stats.calculated.terrain[currentTerrain];
		var mechTerrainLevel = actor.SRWStats.mech.stats.calculated.terrain[currentTerrain]; 
		var mechTerrainNumeric = this._terrainToNumeric[mechTerrainLevel];
		var minMechTerrains = {
			"land": this.applyMaxStatModsToValue(actor, 0, ["land_terrain_rating"]),
			"air": this.applyMaxStatModsToValue(actor, 0, ["air_terrain_rating"]),
			"water": this.applyMaxStatModsToValue(actor, 0, ["water_terrain_rating"]),
			"space": this.applyMaxStatModsToValue(actor, 0, ["space_terrain_rating"])
		};		
		if(mechTerrainNumeric < minMechTerrains[currentTerrain]){
			mechTerrainNumeric = minMechTerrains[currentTerrain];
		}		
		return this._terrainLevelPerformance[this._terrainSumToLevel[this._terrainToNumeric[pilotTerrainLevel] + mechTerrainNumeric]];
	} 	
	return 0;
}

StatCalc.prototype.getWeaponTerrainMod = function(actor, weaponInfo){
	if(this.isActorSRWInitialized(actor)){
		var currentTerrain = this.getCurrentTerrain(actor);
		var weaponTerrainRanking = weaponInfo.terrain[currentTerrain];
		
		var weaponTerrainNumeric = this._terrainToNumeric[weaponTerrainRanking];
		var minTerrains = {
			"land": this.applyMaxStatModsToValue(actor, 0, ["land_terrain_rating"]),
			"air": this.applyMaxStatModsToValue(actor, 0, ["air_terrain_rating"]),
			"water": this.applyMaxStatModsToValue(actor, 0, ["water_terrain_rating"]),
			"space": this.applyMaxStatModsToValue(actor, 0, ["space_terrain_rating"])
		};		
		if(weaponTerrainNumeric < minTerrains[currentTerrain]){
			weaponTerrainNumeric = minTerrains[currentTerrain];
		}		
		return this._terrainSumToLevel[weaponTerrainNumeric + weaponTerrainNumeric];
	} 	
	return 0;
}

StatCalc.prototype.getExp = function(actor){
	return actor.SRWStats.pilot.exp;
}

StatCalc.prototype.addExp = function(actor, amount){	
	var _this = this;
	if(this.isActorSRWInitialized(actor)){
		var oldStats = JSON.parse(JSON.stringify(this.getCalculatedPilotStats(actor)));
		var oldLevel = this.getCurrentLevel(actor);
		actor.SRWStats.pilot.exp+=amount;
		this.calculateSRWActorStats(actor);
		this.getCalculatedPilotStats(actor).currentSP = oldStats.currentSP;
		var newLevel = this.getCurrentLevel(actor);		
		var newStats;
		var currentAbilities;
		var oldAbilities;
		if(oldLevel != newLevel){
			newStats = JSON.parse(JSON.stringify(this.getCalculatedPilotStats(actor)));
			if(actor.isActor()){
				var actorId = parseInt(actor.actorId());
				var actorProperties = $dataActors[actor.actorId()].meta;	
				var updatedAbilities = this.getPilotAbilityInfo(actorProperties, newLevel);
				currentAbilities = actor.SRWStats.pilot.abilities;
				oldAbilities = JSON.parse(JSON.stringify(currentAbilities));
				Object.keys(updatedAbilities).forEach(function(ability){
					if(currentAbilities[ability]){
						if(currentAbilities[ability].level < updatedAbilities[ability].level){
							currentAbilities[ability].level = updatedAbilities[ability].level;
						}
					} else {
						var currentMaxSlot = _this.getCurrentMaxPilotAbilitySlot(actor);
						currentAbilities[ability] = updatedAbilities[ability];						
						if(currentMaxSlot < (6 - 1)){
							currentAbilities[ability].slot = currentMaxSlot + 1;
						}
					}
				});
				
			}			
		}
		this.storeActorData(actor);
		return {
			hasLevelled: oldLevel != newLevel,
			oldLevel: oldLevel,
			newLevel: newLevel,
			oldStats: oldStats,
			newStats: newStats,
			oldAbilities: oldAbilities,
			newAbilities: currentAbilities
		};
	} else {
		return false;
	}		
}

StatCalc.prototype.recoverHP = function(actor, amount){		
	if(this.isActorSRWInitialized(actor)){			
		var mechStats = this.getCalculatedMechStats(actor);
		mechStats.HPBeforeRecovery = mechStats.currentHP;
		mechStats.currentHP+=amount;
		if(mechStats.currentHP > mechStats.maxHP){
			mechStats.currentHP = mechStats.maxHP;
		}
	} 	
}

StatCalc.prototype.recoverHPPercent = function(actor, percent){		
	if(this.isActorSRWInitialized(actor)){	
		var mechStats = this.getCalculatedMechStats(actor);
		this.recoverHP(actor, Math.floor(mechStats.maxHP * percent / 100));		
	} 	
}

StatCalc.prototype.applyHPRegen = function(type, factionId){
	var _this = this;
	this.iterateAllActors(type, function(actor, event){	
		if(actor.isActor() || actor.factionId == factionId || factionId == null){
			if(_this.isBoarded(actor)){
				_this.recoverHPPercent(actor, 20);	
			} else {
				_this.recoverHPPercent(actor, _this.applyStatModsToValue(actor, 0, ["HP_regen"]));			
				_this.recoverHPPercent(actor, _this.getCurrentTerrainMods(actor).hp_regen);	
			}
		}		
	});
}

StatCalc.prototype.setAllWill = function(type, amount){
	var _this = this;
	var result = [];
	this.iterateAllActors(type, function(actor){			
		_this.setWill(actor, amount);
	});
	return result;
}

StatCalc.prototype.setAllHPPercent = function(type, percent){
	var _this = this;
	var result = [];
	this.iterateAllActors(type, function(actor){			
		var mechStats = _this.getCalculatedMechStats(actor);
		mechStats.currentHP = mechStats.maxHP * percent / 100;	
	});
	return result;
}

StatCalc.prototype.canRecoverHP = function(actor){
	if(this.isActorSRWInitialized(actor)){			
		var mechStats = this.getCalculatedMechStats(actor);
		return mechStats.currentHP < mechStats.maxHP;			
	}
}


StatCalc.prototype.addPP = function(actor, amount){		
	if(this.isActorSRWInitialized(actor)){			
		actor.SRWStats.pilot.PP+=amount;
		this.storeActorData(actor);
	} 	
}

StatCalc.prototype.subtractPP = function(actor, amount){		
	if(this.isActorSRWInitialized(actor)){			
		actor.SRWStats.pilot.PP-=amount;
	} 	
}

StatCalc.prototype.addKill = function(actor){		
	if(this.isActorSRWInitialized(actor)){			
		actor.SRWStats.pilot.kills++;
		this.storeActorData(actor);
	} 	
}

StatCalc.prototype.getKills = function(actor){		
	if(this.isActorSRWInitialized(actor)){		
		return actor.SRWStats.pilot.kills;
	} else {
		return 0;
	}
}

StatCalc.prototype.isAce = function(actor){
	if(this.isActorSRWInitialized(actor)){		
		return this.getKills(actor) >= 50;
	} else {
		return false;
	}
}

StatCalc.prototype.isFUB = function(actor){
	if(this.isActorSRWInitialized(actor)){		
		return this.getOverallModificationLevel(actor) >= 100;
	} else {
		return false;
	}
}

StatCalc.prototype.applySPCost = function(actor, amount){		
	if(this.isActorSRWInitialized(actor)){			
		var pilotStats = this.getCalculatedPilotStats(actor);
		pilotStats.currentSP-=amount;
		if(pilotStats.currentSP < 0){
			console.log("SP Cost applied while actor had insufficient SP!");
			pilotStats.currentSP = 0;
		}
	} 	
}

StatCalc.prototype.setAllSPPercent = function(type, percent){
	var _this = this;
	var result = [];
	this.iterateAllActors(type, function(actor){			
		var pilotStats = _this.getCalculatedPilotStats(actor);
		pilotStats.currentSP = pilotStats.SP * percent / 100;	
	});
	return result;
}

StatCalc.prototype.recoverSP = function(actor, amount){		
	if(this.isActorSRWInitialized(actor)){			
		var pilotStats = this.getCalculatedPilotStats(actor);
		pilotStats.currentSP+=amount;
		if(pilotStats.currentSP > pilotStats.SP){
			pilotStats.currentSP = pilotStats.SP;
		}
	} 	
}

StatCalc.prototype.getCurrenEN = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.stats.calculated.currentEN;
	} 		
}

StatCalc.prototype.recoverEN = function(actor, amount){		
	if(this.isActorSRWInitialized(actor)){			
		var mechStats = this.getCalculatedMechStats(actor);
		mechStats.currentEN+=amount;
		if(mechStats.currentEN > mechStats.maxEN){
			mechStats.currentEN = mechStats.maxEN;
		}
	} 	
}

StatCalc.prototype.recoverENPercent = function(actor, percent){
	if(this.isActorSRWInitialized(actor)){
		var mechStats = this.getCalculatedMechStats(actor);
		this.recoverEN(actor, Math.floor(mechStats.maxEN * percent / 100));
	}
}

StatCalc.prototype.applyENRegen = function(type, factionId){
	var _this = this;
	this.iterateAllActors(type, function(actor, event){		
		if(actor.isActor() || actor.factionId == factionId || factionId == null){
			if(_this.isBoarded(actor)){
				_this.recoverENPercent(actor, 20);	
			} else {
				_this.recoverENPercent(actor, _this.applyStatModsToValue(actor, 0, ["EN_regen"]));	
				_this.recoverENPercent(actor, _this.getCurrentTerrainMods(actor).en_regen);	
			}	
		}	
	});
}

StatCalc.prototype.setAllENPercent = function(type, percent){
	var _this = this;
	var result = [];
	this.iterateAllActors(type, function(actor){			
		var mechStats = _this.getCalculatedMechStats(actor);
		mechStats.currentEN = Math.floor(mechStats.maxEN * percent / 100);	
	});
	return result;
}

StatCalc.prototype.canRecoverEN = function(actor, amount){
	if(this.isActorSRWInitialized(actor)){			
		var mechStats = this.getCalculatedMechStats(actor);
		return mechStats.currentEN < mechStats.maxEN;			
	}
}

StatCalc.prototype.recoverAmmoPercent = function(actor, percent){		
	if(this.isActorSRWInitialized(actor)){			
		var weapons = this.getActorMechWeapons(actor);
		weapons.forEach(function(weapon){
			if(weapon.totalAmmo != -1){
				weapon.currentAmmo+=Math.ceil(weapon.totalAmmo * percent / 100);
				if(weapon.currentAmmo > weapon.totalAmmo){
					weapon.currentAmmo = weapon.totalAmmo;
				}
			}
		});
	} 	
}

StatCalc.prototype.canRecoverAmmo = function(actor, percent){		
	if(this.isActorSRWInitialized(actor)){			
		var weapons = this.getActorMechWeapons(actor);
		var ctr = 0;
		var hasUsedAmmo = false;
		while(!hasUsedAmmo && ctr < weapons.length){
			var weapon = weapons[ctr++];
			if(weapon.totalAmmo != -1){
				hasUsedAmmo = weapon.currentAmmo < weapon.totalAmmo;
			}			
		}
		return hasUsedAmmo;
	} 	
}

StatCalc.prototype.applyAmmoRegen = function(type, factionId){
	var _this = this;
	this.iterateAllActors(type, function(actor, event){	
		if(actor.isActor() || actor.factionId == factionId || factionId == null){
			_this.recoverAmmoPercent(actor, _this.applyStatModsToValue(actor, 0, ["ammo_regen"]));				
		}	
	});
}

StatCalc.prototype.setSpirit = function(actor, spirit){		
	if(this.isActorSRWInitialized(actor)){			
		actor.SRWStats.pilot.activeSpirits[spirit] = true;
	} 	
}

StatCalc.prototype.clearSpirit = function(actor, spirit){		
	if(this.isActorSRWInitialized(actor)){			
		actor.SRWStats.pilot.activeSpirits[spirit] = false;
	} 	
}

StatCalc.prototype.clearSpiritOnAll = function(type, spirit, factionId){		
	var _this = this;
	_this.iterateAllActors(type, function(actor){	
		if(actor.isActor() || actor.factionId == factionId || factionId == null){
			_this.clearSpirit(actor, spirit);
		}								
	});
}

StatCalc.prototype.getActiveTempEffects = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.activeEffects;
	} else {
		return {};
	}	
}	

StatCalc.prototype.setTempEffect = function(actor, effect){		
	if(this.isActorSRWInitialized(actor)){			
		actor.SRWStats.pilot.activeEffects[effect] = true;
	} 	
}

StatCalc.prototype.clearTempEffect = function(actor, effect){		
	if(this.isActorSRWInitialized(actor)){			
		actor.SRWStats.pilot.activeEffects[effect] = false;
	} 	
}

StatCalc.prototype.clearTempEffectOnAll = function(type, effect){		
	var _this = this;
	_this.iterateAllActors(type, function(actor){			
		_this.clearTempEffect(actor, effect);						
	});
}

StatCalc.prototype.resetAllBattleTemp = function(type, factionId){		
	var _this = this;
	_this.iterateAllActors(type, function(actor){
		if(actor.isActor() || actor.factionId == factionId || factionId == null){		
			_this.resetBattleTemp(actor);	
		}		
	});
}

StatCalc.prototype.setTurnEnd = function(actor){		
	if(this.isActorSRWInitialized(actor)){			
		actor.SRWStats.battleTemp.hasFinishedTurn = true;
	} 	
}

StatCalc.prototype.getRealENCost = function(actor, cost){
	if(this.isActorSRWInitialized(actor)){	
		if(cost != -1){
			cost = this.applyStatModsToValue(actor, cost, ["EN_cost"]);
		}		
	} 
	return cost;
}

StatCalc.prototype.getRealWeaponRange = function(actor, originalRange){		
	if(this.isActorSRWInitialized(actor)){			
		var result = originalRange;
		if(actor.SRWStats.pilot.activeSpirits.snipe){
			result+=2;
		}
		result = this.applyStatModsToValue(actor, result, ["range"]);
		if(this.isRangeDown(actor)){
			result-=3;
		}
		if(result < 1){
			result = 1;
		}
		return result;
	} else {
		return 0;
	}
}

StatCalc.prototype.getPilotAbilityLevel = function(actor, abilityIdx){		
	var _this = this;
	var result = 0;
	if(_this.isActorSRWInitialized(actor)){			
		var abilities = actor.SRWStats.pilot.abilities;		
		abilities.forEach(function(abilityDef){
			if(abilityDef.idx == abilityIdx){
				result = abilityDef.level;
			}			
		});	
	}
	return result;
}

StatCalc.prototype.getActiveAbilityIds = function(actor){		
	var _this = this;
	var result = {};
	if(_this.isActorSRWInitialized(actor)){			
		var abilities = actor.SRWStats.pilot.abilities;		
		abilities.forEach(function(abilityDef){
			if(_this.getCurrentLevel(actor) >= abilityDef.requiredLevel && $pilotAbilityManager.isActive(actor, abilityDef.idx, abilityDef.level)){
				result[abilityDef.idx] = true;
			}			
		});	
	}
	return result;
}

StatCalc.prototype.getConsumables = function(actor){
	var _this = this;
	var result = [];
	if(_this.isActorSRWInitialized(actor)){	
		var items = actor.SRWStats.mech.items;		
		for(var i = 0; i < items.length; i++){
			if(items[i]){			
				if($itemEffectManager.getAbilityDef(items[i].idx).isUnique && !actor.SRWStats.stageTemp.inventoryConsumed[i]){
					result.push({itemIdx: items[i].idx, listIdx: i});
				}
			}
		}
	}	
	return result;
}

StatCalc.prototype.setConsumableUsed = function(actor, idx){
	if(this.isActorSRWInitialized(actor)){	
		actor.SRWStats.stageTemp.inventoryConsumed[idx] = true;
	}	
}

StatCalc.prototype.isStatModActiveOnAnyActor = function(modType, excludedSkills){
	var _this = this;
	var result = false;
	this.iterateAllActors(null, function(actor, event){			
		if(_this.applyStatModsToValue(actor, 0, modType, excludedSkills)){
			result = true;
		}				
	});
	return result;
}

StatCalc.prototype.getActiveStatMods = function(actor, excludedSkills){
	var _this = this;
	if(!excludedSkills){
		excludedSkills = {};
	}
	var result = {
		mult: [],
		mult_ceil: [],
		addPercent: [],
		addFlat: [],
	};
	function accumulateFromAbilityList(abilityList, abilityManager){
		if(abilityList && abilityManager){			
			abilityList.forEach(function(abilityDef){
				if(abilityDef && !excludedSkills[abilityDef.idx] && (typeof abilityDef.requiredLevel == "undefined" || _this.getCurrentLevel(actor) >= abilityDef.requiredLevel) && abilityManager.isActive(actor, abilityDef.idx, abilityDef.level)){
					var statMods = abilityManager.getStatmod(actor, abilityDef.idx, abilityDef.level);
					var targetList;			
					statMods.forEach(function(statMod){
						if(statMod.modType == "mult"){
							targetList = result.mult;
						} else if(statMod.modType == "addPercent"){
							targetList = result.addPercent;
						} else if(statMod.modType == "addFlat"){
							targetList = result.addFlat;
						} else if(statMod.modType == "mult_ceil"){
							targetList = result.mult_ceil;
						}
						targetList.push(statMod);
					});			
				}			
			});	
		}
	}
	
	if(_this.isActorSRWInitialized(actor)){						
		accumulateFromAbilityList(this.getPilotAbilityList(actor), $pilotAbilityManager);
		
		var aceAbility = actor.SRWStats.pilot.aceAbility;	
		if(typeof aceAbility != "undefined" && aceAbility != -1){
			accumulateFromAbilityList([aceAbility], $pilotAbilityManager);	
		}			
		
		var abilities = actor.SRWStats.mech.abilities;		
		accumulateFromAbilityList(abilities, $mechAbilityManager);
		
		var FUBAbility = actor.SRWStats.mech.fullUpgradeAbility;	
		if(typeof FUBAbility != "undefined" && FUBAbility != -1){
			accumulateFromAbilityList([FUBAbility], $mechAbilityManager);	
		}
		
		var items = actor.SRWStats.mech.items;		
		accumulateFromAbilityList(items, $itemEffectManager);		

		if(actor.SRWStats.battleTemp && actor.SRWStats.battleTemp.currentAttack){
			var effects = actor.SRWStats.battleTemp.currentAttack.effects;
			if(effects){
				var tmp = [];
				for(var i = 0; i < effects.length; i++){
					tmp.push({idx: effects[i]});
				}
				accumulateFromAbilityList(tmp, $weaponEffectManager);		
			}
		}	
	}
	return result;
}

StatCalc.prototype.applyStatModsToValue = function(actor, value, types, excludedSkills){
	var statMods = this.getActiveStatMods(actor, excludedSkills);
	for(var i = 0; i < statMods.addFlat.length; i++){
		if(types.indexOf(statMods.addFlat[i].type) != -1){
			value+=statMods.addFlat[i].value*1;
		}		
	}
	for(var i = 0; i < statMods.addPercent.length; i++){
		if(types.indexOf(statMods.addPercent[i].type) != -1){
			value+=Math.floor(value * statMods.addPercent[i].value);
		}		
	}
	for(var i = 0; i < statMods.mult.length; i++){
		if(types.indexOf(statMods.mult[i].type) != -1){
			value = Math.floor(value * statMods.mult[i].value);
		}		
	}
	for(var i = 0; i < statMods.mult_ceil.length; i++){
		if(types.indexOf(statMods.mult_ceil[i].type) != -1){
			value = Math.ceil(value * statMods.mult_ceil[i].value);
		}		
	}
	return value;
}

StatCalc.prototype.applyMaxStatModsToValue = function(actor, value, types, excludedSkills){
	var max = value;
	var statMods = this.getActiveStatMods(actor, excludedSkills);
	for(var i = 0; i < statMods.addFlat.length; i++){
		if(types.indexOf(statMods.addFlat[i].type) != -1){
			if(value + statMods.addFlat[i].value*1 > max){
				max = value + statMods.addFlat[i].value*1;
			}
		}		
	}
	for(var i = 0; i < statMods.addPercent.length; i++){
		if(types.indexOf(statMods.addPercent[i].type) != -1){
			if(value + Math.floor(value * statMods.addPercent[i].value) > max){
				max = value + Math.floor(value * statMods.addPercent[i].value);
			}
		}		
	}
	for(var i = 0; i < statMods.mult.length; i++){
		if(types.indexOf(statMods.mult[i].type) != -1){
			if(Math.floor(value * statMods.mult[i].value) > max){
				max = Math.floor(value * statMods.mult[i].value);
			}
		}		
	}
	for(var i = 0; i < statMods.mult_ceil.length; i++){
		if(types.indexOf(statMods.mult_ceil[i].type) != -1){
			if(Math.ceil(value * statMods.mult[i].value) > max){
				max = Math.ceil(value * statMods.mult[i].value);
			}
		}		
	}
	return max;
}

