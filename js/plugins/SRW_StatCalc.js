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
		if($gameMap.regionId(position.x, position.y) % 8 == 1){//air
			if(this.canFly(actor)){
				if(!this.isFlying(actor)){
					this.setFlying(actor, true);
				}
			} else {
				return false;
			}			
		}
		if($gameMap.regionId(position.x, position.y) % 8 == 2){//land
			if(!this.canBeOnLand(actor)){
				if(this.canFly(actor)){
					if(!this.isFlying(actor)){
						this.setFlying(actor, true);
					}
				} else {
					return false;
				}
			}
		}
		if($gameMap.regionId(position.x, position.y) % 8 == 3){//water
			if(!this.canBeOnWater(actor)){
				if(this.canFly(actor)){
					if(!this.isFlying(actor)){
						this.setFlying(actor, true);
					}
				} else {
					return false;
				}
			}
		}
		if($gameMap.regionId(position.x, position.y) % 8 == 4){//space
			if(!this.canBeOnSpace(actor)){
				return false;
			}
		}
		return true;
	} 
	return false;	
}

StatCalc.prototype.getTileType = function(actor){
	if(this.isActorSRWInitialized(actor) && actor.event && actor.event.posX){
		var position = {x: actor.event.posX(), y: actor.event.posY()};
		if($gameMap.regionId(position.x, position.y) % 8 == 1){//air
			return "air";		
		}
		if($gameMap.regionId(position.x, position.y) % 8 == 2){//land
			return "land";	
		}
		if($gameMap.regionId(position.x, position.y) % 8 == 3){//water
			return "water";	
		}
		if($gameMap.regionId(position.x, position.y) % 8 == 4){//space
			return "space";	
		}
	}
}

StatCalc.prototype.terrainToNumeric = function(terrainString){
	if(terrainString == "-"){
		return -1;
	}
	if(this._terrainToNumeric[terrainString]){
		return this._terrainToNumeric[terrainString];
	} else {
		return -1;
	}
}

StatCalc.prototype.numericToTerrain = function(terrainNumber){
	if(terrainNumber == -1){
		return "-";
	}
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

StatCalc.prototype.getPilotStatInfo = function(actorProperties){
	function parseGrowthRate(raw){
		var result = {};
		var parts = raw.split(",");
		if(parts.length == 1){
			result.type = "flat";
			result.rate = parseFloat(parts[0]);
		} else {
			result.type = "curve";
			result.target = parseInt(parts[0]);
			result.rate = parseFloat(parts[1]);
		}
		return result;
	}
	
	return {
		base: {
			SP: parseInt(actorProperties.pilotBaseSP),
			melee: parseInt(actorProperties.pilotBaseMelee),
			ranged: parseInt(actorProperties.pilotBaseRanged),
			skill: parseInt(actorProperties.pilotBaseSkill),
			defense: parseInt(actorProperties.pilotBaseDefense),
			evade: parseInt(actorProperties.pilotBaseEvade),
			hit: parseInt(actorProperties.pilotBaseHit),
			terrain: this.parseTerrainString(actorProperties.pilotTerrain)
		},
		growthRates: {
			SP: parseGrowthRate(actorProperties.pilotSPGrowth),
			melee: parseGrowthRate(actorProperties.pilotMeleeGrowth),
			ranged: parseGrowthRate(actorProperties.pilotRangedGrowth),
			skill: parseGrowthRate(actorProperties.pilotSkillGrowth),
			defense: parseGrowthRate(actorProperties.pilotDefenseGrowth),
			evade: parseGrowthRate(actorProperties.pilotEvadeGrowth),
			hit: parseGrowthRate(actorProperties.pilotHitGrowth)
		}
	}
}

StatCalc.prototype.getMechWeapons = function(actor, mechProperties, previousWeapons){
	var result = [];
	var currentWeaponsLookup = {};
	if(previousWeapons){
		previousWeapons.forEach(function(weapon){
			currentWeaponsLookup[weapon.id] = weapon;
		});
	}
	for(var i = 0; i < 20; i++) {
		var weaponDef = mechProperties["mechAttack"+i];
		if(weaponDef !== undefined){		
			var parts = weaponDef.split(",");
			var weaponId = parts[0];
			var isLocked = parts[1];
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
				var currentAmmo;
				var currentWeapon = currentWeaponsLookup[parseInt(weaponDefinition.id)];
				if(currentWeapon){
					currentAmmo = currentWeapon.currentAmmo;
				} else {
					currentAmmo = totalAmmo;
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
					currentAmmo: currentAmmo,
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
					combinationType: combinationType,
					isLocked: isLocked,
					isCounter: parseInt(weaponProperties.weaponIsCounter),
					upgradeType: parseInt(weaponProperties.weaponUpgradeType) || 0,
					isSelfDestruct: parseInt(weaponProperties.weaponIsSelfDestruct),
				});
			}
		}
	}
	return result;
}

StatCalc.prototype.getPersonalityDef = function(actorProperties){
	var result = {
		hit: actorProperties.pilotOnHitWill * 1 || 0,
		miss: actorProperties.pilotOnMissWill * 1 || 0,
		damage: actorProperties.pilotOnDamageWill * 1 || 0,
		evade: actorProperties.pilotOnEvadeWill * 1 || 0,
		destroy: actorProperties.pilotOnDestroyWill * 1 || 3,
	};
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

StatCalc.prototype.getPilotRelationshipInfo = function(actorProperties){
	var result = {};
	var currentListIdx = 0;
	for(var i = 1; i <= 50; i++){
		var abilityString = actorProperties["pilotRelationship"+i];
		if(abilityString){
			var parts = abilityString.split(",");	
			var actor = parseInt(parts[0]);
			var effectId  = parseInt(parts[1]);
			var level = parseInt(parts[2]);
			result[actor] = {
				actor: actor,
				effectId: effectId,
				level: level
			};
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
	if(mech.meta.mechInheritsPartsFrom != null){
		mechId = mech.meta.mechInheritsPartsFrom;
		mech = $dataClasses[mechId];
	}
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
			abilityUsed: {},
			isRevealed: false,
			mapAttackCoolDown: 1,
			nonMapAttackCounter: 1,
			isBoarded: false,
			isAI: false,
			isEssential: false,
			additionalActions: 0
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
		return actor.isEmpty || actor.isActor() || actor.SRWStats.stageTemp.isRevealed;
	} else {
		return true;
	}
}

StatCalc.prototype.isAI = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return !actor.isActor() || actor.SRWStats.stageTemp.isAI;
	} else {
		return false;
	}
}

StatCalc.prototype.setIsAI = function(actor, state){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.isAI = state;
	} 
}

StatCalc.prototype.isEssential = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.stageTemp.isEssential;
	} else {
		return false;
	}
}

StatCalc.prototype.setEssential = function(actor, state){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.isEssential = state;
	} 
}

StatCalc.prototype.setRevealed = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.isRevealed = true;
	} 
}

StatCalc.prototype.addAdditionalAction = function(actor){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.stageTemp.additionalActions++;
	} 
}

StatCalc.prototype.consumeAdditionalAction = function(actor){
	if(this.isActorSRWInitialized(actor)){
		if(actor.SRWStats.stageTemp.additionalActions){
			actor.SRWStats.stageTemp.additionalActions--;
			return true;
		}		
	} 	
	return false;	
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


StatCalc.prototype.applyBattleStartWill = function(actor){
	var _this = this;
	if(_this.isActorSRWInitialized(actor)){		
		var rankInfo = $gameSystem.actorRankLookup;		
		_this.setWill(actor, 100);	
		_this.modifyWill(actor, _this.applyStatModsToValue(actor, 0, ["start_will"]));			
		if(actor.isActor()){
			
			if(_this.isAce(actor)){
				_this.modifyWill(actor, 5);	
				
				if(rankInfo[actor.actorId()] < 3){
					_this.modifyWill(actor, 5);	
				}
			}			
		}
	}
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
		"fury",
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

StatCalc.prototype.softRefreshUnits = function(){
	var _this = this;	
	this.iterateAllActors(null, function(actor, event){
		var itemsIds = [];
		actor.SRWStats.mech.items.forEach(function(item){
			if(!item){
				itemsIds.push(null);
			} else {
				itemsIds.push(item.idx);
			}			
		});
		actor.SRWStats.pilot.abilities = null;//ensure reload
		_this.initSRWStats(actor, _this.getCurrentLevel(actor), itemsIds, true);				
	});
	this.invalidateAbilityCache();
}

StatCalc.prototype.createEmptyActor = function(level){
	var _this = this;
	var result = {
		SRWStats: _this.createEmptySRWStats()
	}	
	
	result.isEmpty = true;
	result.SRWInitialized = true;
	_this.resetStageTemp(result);
	_this.resetSpiritsAndEffects(result);
	return result;
}

StatCalc.prototype.createEmptySRWStats = function(level){
	level = level || 0;
	return {
		pilot: {
			race: "",
			id: -1,
			level: level,
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
}

StatCalc.prototype.resetSpiritsAndEffects = function(actor){
	if(this.isActorSRWInitialized(actor)){
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
	}
}

StatCalc.prototype.initSRWStats = function(actor, level, itemIds, preserveVolatile){
	var _this = this;
	if(!level){
		level = 1;
	}
	var items = [];
	if(itemIds){
		for(var i = 0; i < itemIds.length; i++){
			items.push({idx: itemIds[i]});
		}
	}
	
	if(!actor.SRWStats){
		actor.SRWStats = _this.createEmptySRWStats(level);
	}
	actor.SRWInitialized = true;
	if(!preserveVolatile){
		this.resetBattleTemp(actor);
		this.resetStageTemp(actor);	
	}
	
	var actorId;
	var actorProperties;
	if(actor.isActor()){
		actorId = parseInt(actor.actorId());
		actorProperties = $dataActors[actorId].meta;
	} else {
		actorId = parseInt(actor.enemyId());
		actorProperties = $dataEnemies[actorId].meta;
	}
	
	actor.SRWStats.pilot.grantsGainsTo = actorProperties.pilotGrantsGainsTo;
	
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
	
	if(!preserveVolatile){
		_this.resetSpiritsAndEffects(actor);
	}
	
	var statInfo = _this.getPilotStatInfo(actorProperties);
	
	actor.SRWStats.pilot.stats.base = statInfo.base;	
	actor.SRWStats.pilot.stats.growthRates = statInfo.growthRates;
	
	

	this.calculateSRWActorStats(actor, preserveVolatile);// calculate stats to ensure level is set before fetching abilities
	
	var dbAbilities = this.getPilotAbilityInfo(actorProperties, this.getCurrentLevel(actor));	
	var dbRelationships = this.getPilotRelationshipInfo(actorProperties);
	
	if(actor.isActor()){
		this.applyStoredActorData(actor, dbAbilities, dbRelationships);
	} else {
		actor.SRWStats.pilot.abilities = dbAbilities;
		actor.SRWStats.pilot.relationships = dbRelationships;
	}	
	
	this.calculateSRWActorStats(actor, preserveVolatile);// calculate stats again to ensure changes due to abilities are applied
	
	var mech;
	var isForActor;
	if(actor.isActor()){
		if(actor._mechClass){//should only be the case when the editor is used
			mech = $dataClasses[actor._mechClass];
		} else if(preserveVolatile && actor.SRWStats.mech){
			mech = $dataClasses[actor.SRWStats.mech.id];
		}
		if(!mech){// && !actor.isSubPilot sub pilots should not be linked to mechs
			mech = actor.currentClass();

		}		
		isForActor = true;
	} else {
		mech = $dataClasses[actor._mechClass];
		isForActor = false;	
	}	
	if(mech){
		var previousWeapons = [];
		var previousStats;
		var previousFlightState;
		var previousCombineInfo;
		var previousBoarded;
		var customStats;
		
		if(preserveVolatile){
			if(actor.SRWStats.mech && actor.SRWStats.mech.stats){
				var previousStats = actor.SRWStats.mech.stats.calculated;				
				if(preserveVolatile){
					previousWeapons = actor.SRWStats.mech.weapons;
				}
				previousFlightState = actor.SRWStats.mech.isFlying;
				previousCombineInfo = actor.SRWStats.mech.combineInfo;
				previousBoarded = actor.SRWStats.mech.unitsOnBoard;
				customStats = actor.SRWStats.mech.stats.custom;
			}			
		}
		actor.SRWStats.mech = this.getMechData(mech, isForActor, items, previousWeapons);
		if(!isForActor && $gameSystem.enemyUpgradeLevel){
			var levels = actor.SRWStats.mech.stats.upgradeLevels;
			levels.maxHP = $gameSystem.enemyUpgradeLevel;
			levels.maxEN = $gameSystem.enemyUpgradeLevel;
			levels.armor = $gameSystem.enemyUpgradeLevel;
			levels.mobility = $gameSystem.enemyUpgradeLevel;			
			levels.accuracy = $gameSystem.enemyUpgradeLevel;
			levels.weapons = $gameSystem.enemyUpgradeLevel;			
		}		
		this.calculateSRWMechStats(actor.SRWStats.mech, preserveVolatile);	
		if(preserveVolatile){
			if(previousStats){
				actor.SRWStats.mech.stats.calculated.currentHP = previousStats.currentHP;
				actor.SRWStats.mech.stats.calculated.currentEN = previousStats.currentEN;
			}
			if(customStats){
				Object.keys(customStats).forEach(function(stat){
					actor.SRWStats.mech.stats.calculated[stat] = customStats[stat];
				});
			}
			if(previousFlightState){
				actor.SRWStats.mech.isFlying = previousFlightState;
			}
			if(previousCombineInfo){
				actor.SRWStats.mech.combineInfo = previousCombineInfo;
			}
			if(previousBoarded){
				actor.SRWStats.mech.unitsOnBoard = previousBoarded;
			}
		}
	} else {
		actor.SRWStats.mech = this.getMechData();
	}			
	
	if(!preserveVolatile){		
		if(!isForActor){
			if(this.canFly(actor)){
				this.setFlying(actor, true);
			}		
		}	
		if(actor.event && $dataMap){ //hacky solution to the initializer being called in context where either no event has been assigned to the actor(initial load of map, intermission) or where $dataMap has not loaded yet(loading save)
			var validPosition = this.canStandOnTile(actor, {x: actor.event.posX(), y: actor.event.posY()});
			if(!validPosition){
				console.log("Unit initialized on invalid terrain!");
			}
		}
	}
	actor.SRWStats.pilot.spirits = this.getSpiritInfo(actor, actorProperties);	
	
	actor.SRWStats.pilot.personalityInfo = this.getPersonalityDef(actorProperties);
	
	var subPilots = this.getSubPilots(actor);
	if(!actor.isSubPilot){
		var mainPilot = actor;
		var ctr = 0;
		subPilots.forEach(function(pilotId){
			var actor = $gameActors.actor(pilotId);
			if(actor){
				actor.isSubPilot = true;
				actor.subPilotSlot = ctr;
				actor.mainPilot = mainPilot;
				_this.initSRWStats(actor, 1, [], preserveVolatile);
			}			
		});	
	}	
}

StatCalc.prototype.getMechDataById = function(id, forActor){
	var mech = $dataClasses[id];
	return this.getMechData(mech, forActor);
}	

StatCalc.prototype.getMechData = function(mech, forActor, items, previousWeapons){	
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
			upgradeAmounts: {},
			calculated: {}
		},
		weapons: [],
		equips:[],
		abilities: [],
		fullUpgradeAbility: -1,
		basicBattleSpriteName: "",
		allowedPilots: [],
		items: []
	};
	if(mech && mech.name){		
		var mechProperties = mech.meta;
		result.classData = mech;
		result.isShip = mechProperties.mechIsShip;
		result.canFly = mechProperties.mechCanFly || mechProperties.mechAirEnabled;
		result.canLand = mechProperties.mechLandEnabled || 1;
		result.canWater = mechProperties.mechWaterEnabled || 1;
		result.canSpace = mechProperties.mechSpaceEnabled || 1;
		result.isFlying = false;
		result.id = mech.id;
		result.expYield = parseInt(mechProperties.mechExpYield);
		result.PPYield = parseInt(mechProperties.mechPPYield);
		result.fundYield = parseInt(mechProperties.mechFundYield);
		
		function parsePilotList(raw){
			var parts = raw.split(",");
			var tmp = [];
			parts.forEach(function(id){
				id = parseInt(id);
				if(!isNaN(id)){
					tmp.push(id);
				}
			});
			return tmp;
		}
		
		if(mechProperties.mechAllowedPilots){
			result.allowedPilots = parsePilotList(mechProperties.mechAllowedPilots);
		}
		result.hasVariableSubPilots = false;
		result.allowedSubPilots = {};
		for(var i = 0; i < 10; i++){
			if(mechProperties["mechAllowedSubPilots"+(i+1)]){
				result.hasVariableSubPilots = true;
				result.allowedSubPilots[i] = parsePilotList(mechProperties["mechAllowedSubPilots"+(i+1)]);
			}
		}
		
		result.notDeployable = parseInt(mechProperties.mechNotDeployable || 0);
		
		result.deployConditions = JSON.parse(mechProperties.mechDeployConditions || "{}");
		
		result.forcePilots = parseInt(mechProperties.mechForcePilots || 0);
		
		/*result.basicBattleSpriteName = mechProperties.mechBasicBattleSprite;
		result.battleSceneSpriteName = mechProperties.mechBattleSceneSprite;
		
		result.battleSceneSpriteSize = parseInt(mechProperties.mechBattleSceneSpriteSize);
		
		result.useSpriter = parseInt(mechProperties.mechBattleSceneUseSpriter);
		
		result.battleSceneShadowInfo = {
			size: 3,
			offsetZ: 0,
			offsetX: 0
		};

		
		if(mechProperties.mechBattleSceneShadowSize){
			result.battleSceneShadowInfo.size = mechProperties.mechBattleSceneShadowSize*1;
		}
		if(mechProperties.mechBattleSceneShadowOffsetZ){
			result.battleSceneShadowInfo.offsetZ = mechProperties.mechBattleSceneShadowOffsetZ*1;
		}
		if(mechProperties.mechBattleSceneShadowOffsetX){
			result.battleSceneShadowInfo.offsetX = mechProperties.mechBattleSceneShadowOffsetX*1;
		}*/
		
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
		
		result.stats.upgradeAmounts.maxHP = parseInt(mechProperties.mechUpgradeHPAmount) || 350;
		result.stats.upgradeAmounts.maxEN = parseInt(mechProperties.mechUpgradeENAmount) || 10;
		result.stats.upgradeAmounts.armor = parseInt(mechProperties.mechUpgradeArmorAmount) || 60;
		result.stats.upgradeAmounts.mobility = parseInt(mechProperties.mechUpgradeMobilityAmount) || 5;
		result.stats.upgradeAmounts.accuracy = parseInt(mechProperties.mechUpgradAccuracyAmount) || 6;
				

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
		result.transformRestores;
		if(mechProperties.mechTransformRestores){
			var parts = mechProperties.mechTransformRestores.split(",");
			if(parts.length == 1){
				result.transformRestores = {
					HP: parts[0] * 1 ? true: false,
					EN: parts[0] * 1 ? true: false,
				}
			} else {
				result.transformRestores = {
					HP: parts[0] * 1 ? true: false,
					EN: parts[1] * 1 ? true: false,
				}
			}
		}
		
		
		result.destroyTransformInto = mechProperties.mechDestroyTransformInto * 1 || null;		
		result.destroyTransformedActor = mechProperties.mechDestroyTransformedActor * 1 || null;	

		if(mechProperties.mechAttribute1){
			result.attribute1 = mechProperties.mechAttribute1.trim();
		}
		
		if(mechProperties.mechAttribute2){
			result.attribute2 = mechProperties.mechAttribute2.trim();
		}
		
		//result.transformedActor = mechProperties.mechTransformedActor;

		/*var mechOnDeployMain;
		var mechOnDeployMainRaw = mechProperties.mechOnDeployMain;
		if(!isNaN(mechOnDeployMainRaw * 1)){
			mechOnDeployMain = {type: "direct", id: mechOnDeployMainRaw * 1};
		} else if(mechOnDeployMainRaw){
			try {
				mechOnDeployMain = JSON.parse(mechOnDeployMainRaw);
			} catch(e){
				
			}			
		}
		
		result.onDeployMain = mechOnDeployMain || {};*/
		
		var deployActionsId = parseInt(mechProperties.mechDeployActions);
		if(!isNaN(deployActionsId)){
			result.deployActions = DEPLOY_ACTIONS[deployActionsId];
		}		
		
		result.inheritsUpgradesFrom = mechProperties.mechInheritsUpgradesFrom * 1 || null;	
		
		result.inheritsPartsFrom = mechProperties.mechInheritsPartsFrom * 1 || null;	
		
		
		result.abilities = this.getMechAbilityInfo(mechProperties);
		result.itemSlots = parseInt(mechProperties.mechItemSlots);		
			
		if(forActor){
			if(result.inheritsUpgradesFrom){
				result.stats.upgradeLevels = this.getStoredMechData(result.inheritsUpgradesFrom).mechUpgrades;
				result.genericFUBAbilityIdx = this.getStoredMechData(result.inheritsUpgradesFrom).genericFUBAbilityIdx;	
				result.unlockedWeapons = this.getStoredMechData(result.inheritsUpgradesFrom).unlockedWeapons;					
			} else {
				result.stats.upgradeLevels = this.getStoredMechData(mech.id).mechUpgrades;
				result.genericFUBAbilityIdx = this.getStoredMechData(result.id).genericFUBAbilityIdx;
				result.unlockedWeapons = this.getStoredMechData(result.id).unlockedWeapons;	
			}			
			var storedSubPilots = this.getStoredMechData(result.id).subPilots;
			if(storedSubPilots){
				result.subPilots = storedSubPilots;
			}			
			result.items = this.getActorMechItems(mech.id);
		} else {
			result.items = items || [];
		}
		
		if(typeof result.genericFUBAbilityIdx != "undefined"){
			result.genericFullUpgradeAbility = {
				idx: parseInt(result.genericFUBAbilityIdx),
				level: 0,
				requiredLevel: 0
			}
		}
		
		var mechData = {
			SRWStats: {
				pilot: {
					abilities: [],
					level: 0,
					SRWInitialized: true
				},			
				mech: result			
			},
			SRWInitialized: true
		}		
		
		result.weapons = this.getMechWeapons(mechData, mechProperties, previousWeapons);
	}
	return result;
}

StatCalc.prototype.getSubPilots = function(actor){
	if(this.isActorSRWInitialized(actor) && actor.SRWStats.mech){
		return actor.SRWStats.mech.subPilots || [];
	} else {
		return [];
	}
}
StatCalc.prototype.canTransform = function(actor){
	if(this.isActorSRWInitialized(actor) && actor.isActor()){
		return actor.SRWStats.mech.transformsInto != null && !$gameSystem.isTransformationLocked(actor.SRWStats.mech.id) && actor.SRWStats.mech.transformWill <= this.getCurrentWill(actor);
	} 
	return false;
}

StatCalc.prototype.transform = function(actor, force){
	if(this.isActorSRWInitialized(actor) && actor.isActor()){
		if(this.canTransform(actor) || force){	
			var calculatedStats = this.getCalculatedMechStats(actor);
			var previousHPRatio = calculatedStats.currentHP / calculatedStats.maxHP;
			var previousENRatio = calculatedStats.currentEN / calculatedStats.maxEN;
			var restoreInfo = actor.SRWStats.mech.transformRestores || {HP: false, EN: false};
			var transformIntoId = actor.SRWStats.mech.transformsInto;
			
			var targetMechData = this.getMechDataById(transformIntoId, true);
		
			actor.isSubPilot = false;
			actor.SRWStats.mech = this.getMechDataById(transformIntoId, true);
			this.calculateSRWMechStats(actor.SRWStats.mech);
			
			this.applyDeployActions(actor.SRWStats.pilot.id, actor.SRWStats.mech.id);
			
			var targetActor = this.getCurrentPilot(transformIntoId, true);
			if(targetActor && targetActor.actorId() != actor.actorId()){
				targetActor.event = actor.event;
				actor.event = null;
				$gameSystem.setEventToUnit(targetActor.event.eventId(), 'actor', targetActor.actorId());
				actor = targetActor;
			}			
			
			calculatedStats = this.getCalculatedMechStats(actor);
			if(!restoreInfo.HP){				
				calculatedStats.currentHP = Math.round(previousHPRatio * calculatedStats.maxHP);
			}	
			if(!restoreInfo.EN){	
				calculatedStats.currentEN = Math.round(previousENRatio * calculatedStats.maxEN);
			}
									
			actor.initImages(actor.SRWStats.mech.classData.meta.srpgOverworld.split(","));
			actor.event.refreshImage();			
		}		
	}
}

StatCalc.prototype.transformOnDestruction = function(actor, force){
	if(this.isActorSRWInitialized(actor) && actor.isActor()){		
		var transformIntoId = actor.SRWStats.mech.destroyTransformInto;
		var targetActorId = actor.SRWStats.mech.destroyTransformedActor;
		
		actor.isSubPilot = false;
		actor.SRWStats.mech = this.getMechDataById(transformIntoId, true);
		this.calculateSRWMechStats(actor.SRWStats.mech);
		this.applyDeployActions(actor.SRWStats.pilot.id, actor.SRWStats.mech.id);
		
		if(targetActorId != null){
			var targetActor = $gameActors.actor(targetActorId);
			if(targetActor.actorId() != actor.actorId()){
				if(this.isActorSRWInitialized(targetActor)){
					targetActor.event = actor.event;
					actor.event = null;
					actor.isSubPilot = true;
					actor.SRWStats.mech = null;
					$gameSystem.setEventToUnit(targetActor.event.eventId(), 'actor', targetActor.actorId());
					actor = targetActor;
				}
			}
		}		
							
		actor.initImages(actor.SRWStats.mech.classData.meta.srpgOverworld.split(","));
		actor.event.refreshImage();							
	}
}

StatCalc.prototype.split = function(actor){
	if(this.isActorSRWInitialized(actor) && actor.isActor()){
		var combineInfo = actor.combineInfo;
		var targetActor = actor;
		var calculatedStats = this.getCalculatedMechStats(actor);
		var combinedHPRatio = calculatedStats.currentHP / calculatedStats.maxHP;
		var combinedENRatio = calculatedStats.currentEN / calculatedStats.maxEN;
		
		var subPilots = JSON.parse(JSON.stringify(targetActor.SRWStats.mech.subPilots));
		
		/*targetActor.SRWStats.mech = this.getMechData(actor.currentClass(), true);
		this.calculateSRWMechStats(targetActor.SRWStats.mech);	*/	
		
		
		
		/*calculatedStats = this.getCalculatedMechStats(targetActor);
		calculatedStats.currentHP = Math.round(combinedHPRatio * calculatedStats.maxHP);
		calculatedStats.currentEN = Math.round(combinedENRatio * calculatedStats.maxEN);*/
		var combinesFrom = actor.SRWStats.mech.combinesFrom;
		for(var i = 0; i < combinesFrom.length; i++){
			var actor;
			if(i == 0){
				actor = targetActor;
			} else {
				actor = $gameActors.actor(subPilots[i-1]);	
			}

					

			this.applyDeployActions(actor.SRWStats.pilot.id, combinesFrom[i]);
			
			var calculatedStats = this.getCalculatedMechStats(actor);
			calculatedStats.currentHP = Math.round(combinedHPRatio * calculatedStats.maxHP);
			calculatedStats.currentEN = Math.round(combinedENRatio * calculatedStats.maxEN);
			var event = actor.event;
			if(!event){
				event = $gameMap.requestDynamicEvent(targetActor.event)
				actor.event = event;
				event.setType(targetActor.event.isType());
				$gameSystem.setEventToUnit(actor.event.eventId(), 'actor', actor.actorId());
				
				//SceneManager.reloadCharacters();
			}
			if(event){
				if(actor.actorId() != targetActor.actorId()){
					var space = this.getAdjacentFreeSpace({x: targetActor.event.posX(), y: targetActor.event.posY()});
					event.appear();
					event.locate(space.x, space.y);
				}
				event.refreshImage();
				actor.initImages(actor.SRWStats.mech.classData.meta.srpgOverworld.split(","));
				actor.event.refreshImage();
			}					
			//
		}				
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
			
			for(var i = 0; i < combineResult.participants.length; i++){
				var actor = $gameActors.actor(combineResult.participants[i]);
				var calculatedStats = this.getCalculatedMechStats(actor);
				HPRatioSum+=calculatedStats.currentHP / calculatedStats.maxHP;
				HPRatioCount++;
				ENRatioSum+=calculatedStats.currentEN / calculatedStats.maxEN;
				ENRatioCount++;						
			}
			
			
			var targetMechData = this.getMechDataById(combinesInto, true);
			
			this.applyDeployActions(actor.SRWStats.pilot.id, combinesInto);
			
			var targetActor = this.getCurrentPilot(combinesInto, true);
			targetActor.combineInfo = combineResult;
			/*if(targetActor && targetActor.actorId() != actor.actorId()){
				targetActor.event = actor.event;
				actor.event = null;
				$gameSystem.setEventToUnit(targetActor.event.eventId(), 'actor', targetActor.actorId());
				actor = targetActor;
			}	*/
			
			//targetActor.SRWStats.mech = targetMechData;
			
			//var targetActor = $gameActors.actor(targetMechData.combinedActor);		
			
			this.calculateSRWMechStats(targetActor.SRWStats.mech);
			//$gameSystem.redeployActor(targetActor, targetActor.event);
			for(var i = 0; i < combineResult.participants.length; i++){
				if(combineResult.participants[i] != targetActor.actorId()){	
					var actor = $gameActors.actor(combineResult.participants[i]);
					if(actor.event)	{
						actor.event.erase();
					}					
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
				if(current.event && !visited[current.event.eventId()]){
					var currentMechId = current.SRWStats.mech.id;
					if(!current.event.isErased() && requiredLookup[currentMechId]){
						current.mechBeforeTransform = currentMechId;
						candidates.push(current.actorId());
					}
					var adjacent;
					if(!forced){
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

StatCalc.prototype.applyStoredActorData = function(actor, dbAbilities, dbRelationships){
	if(actor.isActor()){
		var storedData = $SRWSaveManager.getActorData(actor.actorId());
		actor.SRWStats.pilot.PP = storedData.PP;
		actor.SRWStats.pilot.exp = storedData.exp;
		actor.SRWStats.pilot.kills = storedData.kills;
		actor.SRWStats.pilot.stats.upgrades = storedData.pilotUpgrades;			
		
		var storedAbilities = $SRWSaveManager.getActorData(actor.actorId()).abilities || {};
		var usedSlots = {};
		Object.keys(storedAbilities).forEach(function(abilityIdx){
			var slot = storedAbilities[abilityIdx].slot;
			if(slot != -1){
				usedSlots[slot] = true;
			}
		});
		function getSlot(){
			var slot = -1;
			var ctr = 0;
			while(slot == -1 && ctr < 6){
				if(!usedSlots[ctr]){
					slot = ctr;
				}
				ctr++;
			}
			return slot;
		}
		
		Object.keys(dbAbilities).forEach(function(abilityIdx){
			if(!storedAbilities[abilityIdx]){//newly added ability for the unit in the db
				var slot = getSlot();
				usedSlots[slot] = true;
				storedAbilities[abilityIdx] = {
					idx: abilityIdx,
					level: dbAbilities[abilityIdx].level,
					requiredLevel: dbAbilities[abilityIdx].requiredLevel,
					slot: slot
				}
			}
		});
		
		actor.SRWStats.pilot.abilities = storedAbilities;
		
		var storedRelationships = storedData.relationships || {};
		
		Object.keys(dbRelationships).forEach(function(targetActor){
			if(!storedRelationships[targetActor]){
				storedRelationships[targetActor] = dbRelationships[targetActor];
			}
		});
		
		actor.SRWStats.pilot.relationships = storedRelationships;
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
			relationships: actor.SRWStats.pilot.relationships
		});
		var classId;
		if(actor.SRWStats.mech.inheritsUpgradesFrom != null){
			classId = actor.SRWStats.mech.inheritsUpgradesFrom;
		} else if(actor.currentClass()){
			classId = actor.currentClass().id;
		}
		if(classId){
			$SRWSaveManager.storeMechData(classId, {
				mechUpgrades: actor.SRWStats.mech.stats.upgradeLevels,
				genericFUBAbilityIdx: actor.SRWStats.mech.genericFUBAbilityIdx
			});	
		}			
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
		mechUpgrades: mech.stats.upgradeLevels,
		genericFUBAbilityIdx: mech.genericFUBAbilityIdx,
		unlockedWeapons: mech.unlockedWeapons,
		subPilots: mech.subPilots
	});	
}

StatCalc.prototype.calculateSRWActorStats = function(actor, preserveVolatile){
	var _this = this;
	if(this.isActorSRWInitialized(actor)){
		var level = Math.floor(actor.SRWStats.pilot.exp / 500);
		actor.SRWStats.pilot.level = level;
		var baseStats = actor.SRWStats.pilot.stats.base;
		var growthRates = actor.SRWStats.pilot.stats.growthRates;
		var calculatedStats = actor.SRWStats.pilot.stats.calculated;
		Object.keys(growthRates).forEach(function(baseStateName){
			var growthInfo = growthRates[baseStateName];
			if(growthInfo.type == "flat"){
				calculatedStats[baseStateName] = baseStats[baseStateName] + Math.floor(level * growthInfo.rate);	
			} else {				
				var min = baseStats[baseStateName];
				var max = growthInfo.target;
				var rate = growthInfo.rate;				
				calculatedStats[baseStateName] = eval(ENGINE_SETTINGS.STAT_GROWTH_FORMULA);
			}						
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
		if(!preserveVolatile || calculatedStats.currentSP == null){
			calculatedStats.currentSP = calculatedStats.SP;		
			if(actor.isActor() && ENGINE_SETTINGS.VXT_SP){
				if(_this.isAce(actor)){
					calculatedStats.currentSP = Math.round(calculatedStats.currentSP * 0.75) ;
				} else {
					calculatedStats.currentSP = Math.round(calculatedStats.currentSP * 0.5);
				}				
			}
		}
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

StatCalc.prototype.getGenericFUB = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.genericFUBAbilityIdx
	}
}

StatCalc.prototype.applyGenericFUB = function(actor, skillId){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.mech.genericFUBAbilityIdx = skillId;
		this.calculateSRWMechStats(actor.SRWStats.mech);
	}
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

StatCalc.prototype.getBattleSceneInfo = function(actor){
	var result = {};
	if(this.isActorSRWInitialized(actor)){
		var mechProperties = $dataClasses[actor.SRWStats.mech.id].meta;
		result.basicBattleSpriteName = mechProperties.mechBasicBattleSprite;
		result.battleSceneSpriteName = mechProperties.mechBattleSceneSprite;
		if(mechProperties.mechMenuSprite){
			result.menuSpritePath = "menu/"+mechProperties.mechMenuSprite+".png";
		} else {
			result.menuSpritePath = "SRWBattleScene/"+result.battleSceneSpriteName+"/main.png";
		}
		
		result.battleSceneSpriteSize = parseInt(mechProperties.mechBattleSceneSpriteSize);
		
		result.useSpriter = parseInt(mechProperties.mechBattleSceneUseSpriter);
		
		result.useDragonBones = parseInt(mechProperties.mechBattleSceneUseDragonBones);
		result.dragonbonesWorldSize = parseInt(mechProperties.mechBattleSceneDragonBonesSize || 5);
		var width = parseInt(mechProperties.mechBattleSceneCanvasWidth || 0);
		var height = parseInt(mechProperties.mechBattleSceneCanvasHeight || 0);
		if(width && height){
			result.canvasDims = {width: width, height: height};
		}
		result.armatureName = String(mechProperties.mechBattleSceneArmatureName || "").trim();
		
		
		result.battleSceneShadowInfo = {
			size: 1,
			offsetZ: 0,
			offsetX: 0
		};

		
		if(mechProperties.mechBattleSceneShadowSize){
			result.battleSceneShadowInfo.size = mechProperties.mechBattleSceneShadowSize*1;
		}
		if(mechProperties.mechBattleSceneShadowOffsetZ){
			result.battleSceneShadowInfo.offsetZ = mechProperties.mechBattleSceneShadowOffsetZ*1;
		}
		if(mechProperties.mechBattleSceneShadowOffsetX){
			result.battleSceneShadowInfo.offsetX = mechProperties.mechBattleSceneShadowOffsetX*1;
		}
		
		result.battleReferenceSize = parseInt(mechProperties.mechBattleReferenceSize) || 3;
		
		result.deathAnimId = mechProperties.mechBattleSceneDeathAnim;
		
		result.yOffset = parseFloat(mechProperties.mechBattleYOffset) || 0;
	} 
	return result;
}

StatCalc.prototype.getMenuImagePath = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return this.getBattleSceneInfo(actor).menuSpritePath;	
	} else {
		return "";
	}
}

StatCalc.prototype.getBattleSceneImage = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return this.getBattleSceneInfo(actor).battleSceneSpriteName;	
	} else {
		return "";
	}
}

StatCalc.prototype.getBattleSceneSpriteType = function(actor){
	if(this.isActorSRWInitialized(actor)){
		if(this.getBattleSceneInfo(actor).useSpriter){
			return "spriter";
		} else if(this.getBattleSceneInfo(actor).useDragonBones){
			return "dragonbones";
		} else {
			return "default";
		}
	} else {
		return "";
	}
}

StatCalc.prototype.getBattleSceneImageSize = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return this.getBattleSceneInfo(actor).battleSceneSpriteSize;	
	} else {
		return 0;
	}
}

StatCalc.prototype.getBattleSceneShadowInfo = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return JSON.parse(JSON.stringify(this.getBattleSceneInfo(actor).battleSceneShadowInfo));	
	} else {
		return 0;
	}
}

StatCalc.prototype.getBasicBattleImage = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return this.getBattleSceneInfo(actor).basicBattleSpriteName;	
	} else {
		return "";
	}
}

StatCalc.prototype.getBattleIdleImage = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return this.getBattleSceneInfo(actor).battleSceneSpriteName;	
	} else {
		return "";
	}
}

StatCalc.prototype.getBattleReferenceSize = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return this.getBattleSceneInfo(actor).battleReferenceSize;	
	} else {
		return "";
	}
}

StatCalc.prototype.getWeaponDamageUpgradeAmount = function(attack, levels){
	var type = attack.upgradeType;
	var increasesTable = ENGINE_SETTINGS.WEAPON_UPGRADE_TYPES[type];
	var amount = 0;
	for(var i = 0; i < levels.length; i++){
		if(levels[i] < this.getMaxUpgradeLevel()){			
			amount+=increasesTable[levels[i]];			
		}				
	}
	return amount;
}

StatCalc.prototype.getMechStatIncreaseCost = function(actor, type, levels){
	var costTables = ENGINE_SETTINGS.COST_TYPES.NORMAL;
	var weaponCostTables = ENGINE_SETTINGS.COST_TYPES.WEAPON;
	
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



StatCalc.prototype.getMechStatIncrease = function(actor, type, levels){
	var amountPerLevel = actor.SRWStats.mech.stats.upgradeAmounts;
	/*{
		maxHP: 350,
		maxEN: 10,
		armor: 60,
		mobility: 5,
		accuracy: 6
	};*/
	if(amountPerLevel[type]){
		return amountPerLevel[type] * levels;
	} else {
		return 0;
	}
}

StatCalc.prototype.calculateSRWMechStats = function(targetStats, preserveVolatile){
	var _this = this;
					
	var mechStats = targetStats.stats.base;
	var mechUpgrades = targetStats.stats.upgradeLevels;
	var calculatedStats = targetStats.stats.calculated;
	var upgradeAmounts = targetStats.stats.upgradeAmounts;
	
	if(mechStats && mechUpgrades && calculatedStats && upgradeAmounts && mechStats.terrain){
		calculatedStats.size = mechStats.size;
		Object.keys(mechUpgrades).forEach(function(upgradedStat){
			if(upgradedStat == "maxHP"){
				calculatedStats[upgradedStat] = mechStats[upgradedStat] + (upgradeAmounts[upgradedStat] * mechUpgrades[upgradedStat]);
			}
			if(upgradedStat == "maxEN"){
				calculatedStats[upgradedStat] = mechStats[upgradedStat] + (upgradeAmounts[upgradedStat] * mechUpgrades[upgradedStat]);
			}
			if(upgradedStat == "armor"){
				calculatedStats[upgradedStat] = mechStats[upgradedStat] + (upgradeAmounts[upgradedStat] * mechUpgrades[upgradedStat]);
			}
			if(upgradedStat == "mobility"){
				calculatedStats[upgradedStat] = mechStats[upgradedStat] + (upgradeAmounts[upgradedStat] * mechUpgrades[upgradedStat]);
			}
			if(upgradedStat == "accuracy"){
				calculatedStats[upgradedStat] = mechStats[upgradedStat] + (upgradeAmounts[upgradedStat] * mechUpgrades[upgradedStat]);
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
					abilities: [],
					level: 0,
					SRWInitialized: true
				},			
				mech: targetStats			
			},
			SRWInitialized: true
		}
		calculatedStats.maxHP = $statCalc.applyStatModsToValue(mechData, calculatedStats.maxHP, "maxHP");
		calculatedStats.maxEN = $statCalc.applyStatModsToValue(mechData, calculatedStats.maxEN, "maxEN");
		
		calculatedStats.armor = $statCalc.applyStatModsToValue(mechData, calculatedStats.armor, "base_arm");
		calculatedStats.mobility = $statCalc.applyStatModsToValue(mechData, calculatedStats.mobility, "base_mob");
		calculatedStats.accuracy = $statCalc.applyStatModsToValue(mechData, calculatedStats.accuracy, "base_acc");
		
		calculatedStats.move = $statCalc.applyStatModsToValue(mechData, calculatedStats.move, "base_move");
		
		
		if(!preserveVolatile){
			calculatedStats.currentHP = calculatedStats.maxHP;
			calculatedStats.currentEN = calculatedStats.maxEN;
		}		
	} else {
		console.log("Attempted to calculate stats for an undefined mech, please check your unlocks!");
	}
}

StatCalc.prototype.setCustomMechStats = function(actor, stats){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.mech.stats.custom = stats;
		Object.keys(stats).forEach(function(stat){
			actor.SRWStats.mech.stats.calculated[stat] = stats[stat];
			if(stat == "maxHP"){
				actor.SRWStats.mech.stats.calculated["currentHP"] = stats[stat];
			}
		});
	}
}

StatCalc.prototype.incrementTerrain = function(terrain, increment){
	if(terrain == "-"){
		return "-";
	}
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
		for(var i = 0; i < this.getRealItemSlots(actor); i++){			
			result.push(actor.SRWStats.mech.items[i]);				
		}
		return result;	
	} else {
		return [];
	}	
}

StatCalc.prototype.setWeaponUnlocked = function(mechId, weaponId){
	var mechData = this.getMechDataById(mechId, true);
	mechData.unlockedWeapons[weaponId] = true;
	this.storeMechData(mechData);
	
	//ensure any live instances of the mech on the map also unlock the attack
	var currentPilot = this.getCurrentPilot(mechId);
	if(currentPilot){
		this.setWeaponUnlockedForActor(currentPilot, weaponId)
	}
}

StatCalc.prototype.setWeaponUnlockedForActor = function(actor, weaponId){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.mech.unlockedWeapons[weaponId] = true;
		this.storeMechData(actor.SRWStats.mech);
	} else {
		return false;
	}
}

StatCalc.prototype.setWeaponLocked = function(mechId, weaponId){
	var mechData = this.getMechDataById(mechId, true);
	mechData.unlockedWeapons[weaponId] = false;
	this.storeMechData(mechData);
	
	//ensure any live instances of the mech on the map also lock the attack
	var currentPilot = this.getCurrentPilot(mechId);
	if(currentPilot){
		this.setWeaponLockedForActor(currentPilot, weaponId)
	}
}

StatCalc.prototype.setWeaponLockedForActor = function(actor, weaponId){
	if(this.isActorSRWInitialized(actor)){
		actor.SRWStats.mech.unlockedWeapons[weaponId] = false;
		this.storeMechData(actor.SRWStats.mech);
	} else {
		return false;
	}
}

StatCalc.prototype.isWeaponUnlocked = function(actor, weapon){
	if(this.isActorSRWInitialized(actor)){
		if(actor.SRWStats.mech.unlockedWeapons && actor.SRWStats.mech.unlockedWeapons[weapon.id] != null){			
			return actor.SRWStats.mech.unlockedWeapons[weapon.id];						
		} else {
			return !weapon.isLocked;
		}
	} else {
		return false;
	}
}

StatCalc.prototype.getCurrentWeapons = function(actor){
	if(this.isActorSRWInitialized(actor)){
		var tmp = [];
		var allWeapons = actor.SRWStats.mech.weapons;	
		for(var i = 0; i < allWeapons.length; i++){
			if(this.isWeaponUnlocked(actor, allWeapons[i])){
				tmp.push(allWeapons[i]);
			}
		}
		return tmp;	
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
		return weapon.power + this.getWeaponDamageUpgradeAmount(weapon, levels);
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

StatCalc.prototype.getUnlockedUpgradeLevel = function(){
	if($gameSystem.unlockedUpgradeLevel != null){
		return $gameSystem.unlockedUpgradeLevel;
	} else {
		return this.getMaxUpgradeLevel();
	}
}

StatCalc.prototype.getMaxUpgradeLevel = function(){
	return 10;
}

StatCalc.prototype.getMinModificationLevel = function(actor){
	if(this.isActorSRWInitialized(actor)){
		var minLevel = this.getMaxUpgradeLevel();
		var mechUpgrades = actor.SRWStats.mech.stats.upgradeLevels;	
		Object.keys(mechUpgrades).forEach(function(upgradedStat){
			if(upgradedStat == "maxHP" || upgradedStat == "maxEN" || upgradedStat == "armor" || upgradedStat == "mobility" || upgradedStat == "accuracy"){
				var level = mechUpgrades[upgradedStat] || 0;
				if(level < minLevel){
					minLevel = level;
				}				
			}
		});		
		return minLevel;
	} else {
		return 0;
	}
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
			return "-";
		}
	} else {
		return "-";
	}
}

StatCalc.prototype.getMechTerrain = function(actor, terrain){
	if(this.isActorSRWInitialized(actor)){
		var result = actor.SRWStats.mech.stats.calculated.terrain[terrain];
		if(typeof result != "undefined"){
			return result;
		} else {
			return "-";
		}
	} else {
		return "-";
	}
}

StatCalc.prototype.getCurrentPilot = function(mechId, includeUndeployed){
	var result;
	if(includeUndeployed){
		for(var i = 0; i < $dataActors.length; i++){
			var actor = $dataActors[i];
			if(actor && actor.name && actor.classId == mechId){
				result = $gameActors.actor(i);
			}
		}
	} else {
		this.iterateAllActors("actor", function(actor){
			if(actor.currentClass() && actor.currentClass().id == mechId){
				result = actor;
			}
		});
	}
	
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
		if(actor.SRWStats.mech && actor.SRWStats.mech.stats){
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

StatCalc.prototype.getPersonalityInfo = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.personalityInfo;
	} else {
		return {
			hit: 0,
			miss: 0,
			damage: 0,
			evade: 0,
			destroy: 3,
		};
	}	
}	

StatCalc.prototype.getSpiritList = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.spirits || [];
	} else {
		return [];
	}	
}	

StatCalc.prototype.getActiveSpirits = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.activeSpirits || {};
	} else {
		return {};
	}	
}	

StatCalc.prototype.getLearnedPilotAbilities = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.pilot.abilities || {};
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

StatCalc.prototype.getPilotRelationships = function(actor){
	if(this.isActorSRWInitialized(actor)){			
		return actor.SRWStats.pilot.relationships || {};
	} else {
		return {};
	}
}

StatCalc.prototype.getActiveRelationshipBonuses = function(actor){
	var _this = this;
	var result = [];
	if(this.isActorSRWInitialized(actor) && actor.event){	
		var candidateLookup = this.getPilotRelationships(actor);
		
		Object.keys(candidateLookup).forEach(function(otherId){
			var def = candidateLookup[otherId];
			if(def){
				result.push({
					idx: def.effectId,
					level: def.level,
					appliesTo: otherId
				});
			}
			if(!actor.isSubPilot){
				var subPilots = _this.getSubPilots(actor);
				subPilots.forEach(function(pilotId){
					var actor = $gameActors.actor(pilotId);
					var candidateLookup = _this.getPilotRelationships(actor);
					if(actor){
						var def = candidateLookup[otherId];
						if(def){
							result.push({
								idx: def.effectId,
								level: def.level,
								appliesTo: otherId
							});
						}
					}			
				});	
			}
		});		
	}
	return result;
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
	return this.getCurrentWeapons(actor);
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

StatCalc.prototype.canBeOnLand = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.canLand * 1 || this.applyStatModsToValue(actor, 0, ["land_enabled"]);
	} else {
		return false;
	}		
}

StatCalc.prototype.canBeOnWater = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.canWater * 1 || this.applyStatModsToValue(actor, 0, ["water_enabled"]);
	} else {
		return false;
	}		
}

StatCalc.prototype.canBeOnSpace = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return actor.SRWStats.mech.canSpace * 1 || this.applyStatModsToValue(actor, 0, ["space_enabled"]);
	} else {
		return false;
	}		
}

StatCalc.prototype.canFly = function(actor){
	if(this.isActorSRWInitialized(actor)){
		return ((actor.SRWStats.mech.canFly * 1 || this.applyStatModsToValue(actor, 0, ["fly"])) && this.getTileType(actor) != "space");
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
	
	if(actor || !actor.event){
		return result;
	}
	
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
				if(!$battleCalc.isTargetInRange(pos, targetpos, $statCalc.getRealWeaponRange(actor, weapon), $statCalc.getRealWeaponMinRange(actor, weapon))){
					canUse = false;
					detail.target = true;
				}
				var targetTerrain = this.getCurrentTerrain(rangeTarget);
				var terrainRank = weapon.terrain[targetTerrain];
				if(terrainRank == "-"){
					canUse = false;
					detail.terrain = true;
				}
			} else {
				var rangeResult;
				var type = actor.isActor() ? "enemy" : "actor";
				
				if(!this.getAllInRange($gameSystem.getUnitFactionInfo(actor), pos, $statCalc.getRealWeaponRange(actor, weapon), $statCalc.getRealWeaponMinRange(actor, weapon)).length){
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

StatCalc.prototype.canUseWeapon = function(actor, weapon, postMoveEnabledOnly, defender){
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
		
		if(defender){
			var targetTerrain = this.getCurrentTerrain(defender)
			var terrainRank = weapon.terrain[targetTerrain];
			if(terrainRank == "-"){
				return false;
			}
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

StatCalc.prototype.isMechDeployed = function(mechId){
	var result = false;
	this.iterateAllActors(null, function(actor, event){		
		if(actor.SRWStats.mech.id == mechId){
			result = true;
		}
	});
	return result;
}

StatCalc.prototype.getTopAce = function(){
	var _this = this;
	var maxKills = -1;
	var topAce;
	this.iterateAllActors("actor", function(actor, event){		
		var kills = _this.getKills(actor);
		if(kills > maxKills){
			maxKills = kills;
			topAce = actor;
		}		
	});
	return topAce;
}

StatCalc.prototype.getActorRankLookup = function(){
	var _this = this;
	var result = {};
	var rankInfo = [];
	$gameParty.allMembers().forEach(function(actor){
		rankInfo.push({id: actor.actorId(), score: _this.getKills(actor), name: actor.name()})
	});
	
	rankInfo = rankInfo.sort(function(a, b){
		var result;
		if(a.score != b.score){
			result = b.score - a.score;
		} else {
			result = a.name.localeCompare(b.name);
		}
		return result;
	});
	
	for(var i = 0; i < rankInfo.length; i++){
		result[rankInfo[i].id] = i;
	}
	return result;
}

StatCalc.prototype.getFullWeaponRange = function(actor, postMoveEnabledOnly){
	var _this = this;
	var allWeapons = _this.getActorMechWeapons(actor);
	var currentRange = 0;
	var currentMinRange = -1;
	allWeapons.forEach(function(weapon){
		if(_this.canUseWeapon(actor, weapon, postMoveEnabledOnly)){
			var range = _this.getRealWeaponRange(actor, weapon);
			var minRange = _this.getRealWeaponMinRange(actor, weapon);
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

StatCalc.prototype.hasSupportAttack = function(supportingActor){
	var maxSupportAttacks = $statCalc.applyStatModsToValue(supportingActor, 0, ["support_attack"]);			
	return (maxSupportAttacks > supportingActor.SRWStats.battleTemp.supportAttackCount && (!supportingActor.SRWStats.battleTemp.hasFinishedTurn || ENGINE_SETTINGS.ALLOW_TURN_END_SUPPORT));
}

StatCalc.prototype.canSupportAttack = function(supportedActor, supportingActor){
	var _this = this;
	var result = false;
	var terrain = this.getCurrentTerrain(supportedActor);
	var maxSupportAttacks = $statCalc.applyStatModsToValue(supportingActor, 0, ["support_attack"]);
	if(supportedActor != supportingActor && maxSupportAttacks > supportingActor.SRWStats.battleTemp.supportAttackCount && (!supportingActor.SRWStats.battleTemp.hasFinishedTurn || ENGINE_SETTINGS.ALLOW_TURN_END_SUPPORT)){
		var validTerrain = true;
		if(terrain == "air"){
			validTerrain = _this.canFly(supportingActor)
		} else if(terrain == "land"){
			validTerrain = _this.canBeOnLand(supportingActor)
		} else if(terrain == "water"){
			validTerrain = _this.canBeOnWater(supportingActor)
		} else if(terrain == "space"){
			validTerrain = _this.canBeOnSpace(supportingActor)
		}
		
		if($gameSystem.isFriendly(supportingActor, $gameSystem.getFactionId(supportedActor)) && validTerrain){
			result = true;
		}				
	}
	return result;
}

StatCalc.prototype.getSupportAttackCandidates = function(factionId, position, terrain){
	var _this = this;
	var result = [];
	this.iterateAllActors(null, function(actor, event){
		if(!event.isErased() && (Math.abs(event.posX() - position.x) + Math.abs(event.posY() - position.y)) == 1){
			var maxSupportAttacks = $statCalc.applyStatModsToValue(actor, 0, ["support_attack"]);
			if(maxSupportAttacks > actor.SRWStats.battleTemp.supportAttackCount && (!actor.SRWStats.battleTemp.hasFinishedTurn || ENGINE_SETTINGS.ALLOW_TURN_END_SUPPORT)){
				var validTerrain = true;
				if(terrain == "air"){
					validTerrain = _this.canFly(actor)
				} else if(terrain == "land"){
					validTerrain = _this.canBeOnLand(actor)
				} else if(terrain == "water"){
					validTerrain = _this.canBeOnWater(actor)
				} else if(terrain == "space"){
					validTerrain = _this.canBeOnSpace(actor)
				}
				
				if($gameSystem.isFriendly(actor, factionId) && validTerrain){
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

StatCalc.prototype.hasSupportDefend = function(supportingActor){
	var maxSupportDefends = $statCalc.applyStatModsToValue(supportingActor, 0, ["support_defend"]);			
	return (maxSupportDefends > supportingActor.SRWStats.battleTemp.supportDefendCount);
}

StatCalc.prototype.canSupportDefend = function(supportedActor, supportingActor){
	var _this = this;
	var result = false;
	var terrain = this.getCurrentTerrain(supportedActor);
	var maxSupportDefends = $statCalc.applyStatModsToValue(supportingActor, 0, ["support_defend"]);			
	if(supportedActor != supportingActor && maxSupportDefends > supportingActor.SRWStats.battleTemp.supportDefendCount){
		var validTerrain = true;
		if(terrain == "air"){
			validTerrain = _this.canFly(supportingActor)
		} else if(terrain == "land"){
			validTerrain = _this.canBeOnLand(supportingActor)
		} else if(terrain == "water"){
			validTerrain = _this.canBeOnWater(supportingActor)
		} else if(terrain == "space"){
			validTerrain = _this.canBeOnSpace(supportingActor)
		}
		if($gameSystem.isFriendly(supportingActor, $gameSystem.getFactionId(supportedActor)) && validTerrain){
			result = true;
		}				
	}
	return result;
}
	
StatCalc.prototype.getSupportDefendCandidates = function(factionId, position, terrain){
	var _this = this;
	var result = [];
	this.iterateAllActors(null, function(actor, event){
		if(!event.isErased() && (Math.abs(event.posX() - position.x) + Math.abs(event.posY() - position.y)) == 1){
			var maxSupportDefends = $statCalc.applyStatModsToValue(actor, 0, ["support_defend"]);			
			if(maxSupportDefends > actor.SRWStats.battleTemp.supportDefendCount){
				var validTerrain = true;
				if(terrain == "air"){
					validTerrain = _this.canFly(actor)
				} else if(terrain == "land"){
					validTerrain = _this.canBeOnLand(actor)
				} else if(terrain == "water"){
					validTerrain = _this.canBeOnWater(actor)
				} else if(terrain == "space"){
					validTerrain = _this.canBeOnSpace(actor)
				}
				if($gameSystem.isFriendly(actor, factionId) && validTerrain){
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
	this.invalidateAbilityCache();
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
		if(actor.SRWStats.pilot.grantsGainsTo){
			actor = $gameActors.actor(actor.SRWStats.pilot.grantsGainsTo);
		}
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

StatCalc.prototype.setHP = function(actor, amount){		
	if(this.isActorSRWInitialized(actor)){			
		var mechStats = this.getCalculatedMechStats(actor);
		mechStats.currentHP=amount;
		if(mechStats.currentHP > mechStats.maxHP){
			mechStats.currentHP = mechStats.maxHP;
		}
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
				_this.recoverHPPercent(actor, _this.applyMaxStatModsToValue(actor, 0, ["HP_regen"]));			
				_this.recoverHPPercent(actor, _this.getCurrentTerrainMods(actor).hp_regen);	
				_this.recoverHPPercent(actor, ENGINE_SETTINGS.DEFAULT_HP_REGEN || 0);	
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
		mechStats.currentHP = Math.floor(mechStats.maxHP * percent / 100);	
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
		if(actor.SRWStats.pilot.grantsGainsTo){
			actor = $gameActors.actor(actor.SRWStats.pilot.grantsGainsTo);
		}
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
		if(actor.SRWStats.pilot.grantsGainsTo){
			actor = $gameActors.actor(actor.SRWStats.pilot.grantsGainsTo);
		}
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
		return this.getKills(actor) >= (ENGINE_SETTINGS.ACE_REQUIREMENT || 50);
	} else {
		return false;
	}
}

StatCalc.prototype.isFUB = function(actor){
	if(this.isActorSRWInitialized(actor)){	
		if($gameSystem.requiredFUBLevel != null){
			return this.getMinModificationLevel(actor) >= $gameSystem.requiredFUBLevel;
		} else {
			return this.getOverallModificationLevel(actor) >= 100;
		}		
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
				_this.recoverENPercent(actor, _this.applyMaxStatModsToValue(actor, 0, ["EN_regen"]));	
				_this.recoverENPercent(actor, _this.getCurrentTerrainMods(actor).en_regen);	
				_this.recoverENPercent(actor, ENGINE_SETTINGS.DEFAULT_EN_REGEN || 0);			
				_this.recoverEN(actor, 5);	
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
	var _this = this;
	if(_this.isActorSRWInitialized(actor)){			
		actor.SRWStats.pilot.activeSpirits[spirit] = false;
		if(actor.SRWStats.mech){
			var subPilots = actor.SRWStats.mech.subPilots;
			if(subPilots){
				subPilots.forEach(function(subPilotId){
					var subActor = $gameActors.actor(subPilotId);
					if(_this.isActorSRWInitialized(subActor)){
						subActor.SRWStats.pilot.activeSpirits[spirit] = false;
					}				
				});
			}
		}		
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

StatCalc.prototype.hasEndedTurn = function(actor){		
	if(this.isActorSRWInitialized(actor)){			
		return actor.SRWStats.battleTemp.hasFinishedTurn;
	} 	
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

StatCalc.prototype.getRealItemSlots = function(actor){	
	if(this.isActorSRWInitialized(actor)){
		var slots = actor.SRWStats.mech.itemSlots;
		slots = this.applyStatModsToValue(actor, slots, ["item_slot"]);
		return Math.min(slots, 4);
	}	
	return 0;
}

StatCalc.prototype.getRealWeaponRange = function(actor, weapon){		
	if(this.isActorSRWInitialized(actor)){			
		var result = weapon.range;
		if(result == 1){
			return 1;
		}
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

StatCalc.prototype.getRealWeaponMinRange = function(actor, weapon){		
	if(this.isActorSRWInitialized(actor)){			
		var result = weapon.minRange;
		if(result == 1){
			return 1;
		}		
		var minRangeImprovement =  this.applyStatModsToValue(actor, 0, ["min_range"]);
		result-= minRangeImprovement;
		
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
		if(abilities){
			Object.keys(abilities).forEach(function(idx){
				var abilityDef = abilities[idx];
				if(abilityDef.idx == abilityIdx){
					result = abilityDef.level;
				}			
			});	
		}			
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

StatCalc.prototype.getAbilityCommands = function(actor){
	var _this = this;
	var result = [];
	if(_this.isActorSRWInitialized(actor)){	
		if(!actor.SRWStats.stageTemp.abilityUsed){
			actor.SRWStats.stageTemp.abilityUsed = {};
		}
		var commands = _this.getModDefinitions(actor, ["ability_command"]);
		commands.forEach(function(commandDef){
			var abilityDefinition = $abilityCommandManger.getAbilityDef(commandDef.cmdId);
			var timesUsed = actor.SRWStats.stageTemp.abilityUsed[commandDef.cmdId] || 0;
			if(abilityDefinition && timesUsed < abilityDefinition.useCount){
				result.push(commandDef.cmdId);
			}			
		});
	}	
	return result;
}

StatCalc.prototype.setAbilityUsed = function(actor, idx){
	if(this.isActorSRWInitialized(actor)){	
		if(!actor.SRWStats.stageTemp.abilityUsed){
			actor.SRWStats.stageTemp.abilityUsed = {};
		}
		if(!actor.SRWStats.stageTemp.abilityUsed[idx]){
			actor.SRWStats.stageTemp.abilityUsed[idx] = 1;
		} else {
			actor.SRWStats.stageTemp.abilityUsed[idx]++;
		}
	}	
}

StatCalc.prototype.getUsedCount = function(actor, idx){
	if(this.isActorSRWInitialized(actor)){	
		return actor.SRWStats.stageTemp.abilityUsed[idx] || 0
	}	
	return 0;
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
		list: []
	};
	function accumulateFromAbilityList(abilityList, abilityManager){
		if(abilityList && abilityManager){			
			abilityList.forEach(function(abilityDef){
				if(abilityDef && !excludedSkills[abilityManager.getIdPrefix()+"_"+abilityDef.idx] && (typeof abilityDef.requiredLevel == "undefined" || abilityDef.requiredLevel == 0 || _this.getCurrentLevel(actor) >= abilityDef.requiredLevel) && abilityManager.isActive(actor, abilityDef.idx, abilityDef.level)){
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
						
						statMod.rangeInfo = abilityManager.getRangeDef(actor, abilityDef.idx, abilityDef.level) || {min: 0, max: 0, targets: "own"};
						
						statMod.stackId = abilityManager.getIdPrefix()+"_"+abilityDef.idx;
						statMod.canStack = abilityManager.canStack(abilityDef.idx);
						
						statMod.appliesTo = abilityDef.appliesTo;
						
						statMod.originType = actor.isActor() ? "actor" : "enemy";
						statMod.originId = actor.SRWStats.pilot.id;
						
						if(targetList){
							targetList.push(statMod);
						}
						var listEntry = JSON.parse(JSON.stringify(statMod));
						if(!listEntry.name){
							listEntry.name = abilityManager.getAbilityDisplayInfo(abilityDef.idx).name;
						}
						
						result.list.push(listEntry);
					});			
				}			
			});	
		}
	}
	
	if(_this.isActorSRWInitialized(actor)){		
		var abilities  = this.getPilotAbilityList(actor);
		if(abilities){
			var tmp = [];
			for(var i = 0; i < abilities.length; i++){
				if(!$gameSystem.isLockedActorAbility(actor, abilities[i].idx)){
					tmp.push(abilities[i]);
				}
			}
			abilities = tmp;
		}
		accumulateFromAbilityList(abilities, $pilotAbilityManager);
		
		var aceAbility = actor.SRWStats.pilot.aceAbility;	
		if(typeof aceAbility != "undefined" && aceAbility != -1){
			accumulateFromAbilityList([aceAbility], $pilotAbilityManager);	
		}		

		if(actor.SRWStats.mech){			
			var abilities = actor.SRWStats.mech.abilities;	
			
			if(abilities){
				var tmp = [];
				for(var i = 0; i < abilities.length; i++){
					if(!$gameSystem.isLockedMechAbility(actor, abilities[i].idx)){
						tmp.push(abilities[i]);
					}
				}
				abilities = tmp;
			}			
			
			accumulateFromAbilityList(abilities, $mechAbilityManager);
			
			var FUBAbility = actor.SRWStats.mech.fullUpgradeAbility;	
			if(typeof FUBAbility != "undefined" && FUBAbility != -1 && FUBAbility.idx != -1){
				accumulateFromAbilityList([FUBAbility], $mechAbilityManager);	
			}
			
			var genericFullUpgradeAbility = actor.SRWStats.mech.genericFullUpgradeAbility;	
			if(typeof genericFullUpgradeAbility != "undefined" && genericFullUpgradeAbility != -1 && genericFullUpgradeAbility.idx != -1){
				accumulateFromAbilityList([genericFullUpgradeAbility], $mechAbilityManager);	
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
			
			var relationshipBonuses = this.getActiveRelationshipBonuses(actor);
			if(relationshipBonuses){
				accumulateFromAbilityList(relationshipBonuses, $relationshipBonusManager);	
			}
			
		}
	}
	return result;
}



StatCalc.prototype.invalidateAbilityCache = function(excludedSkills){
	this._abilityCacheDirty = true;
}

StatCalc.prototype.createActiveAbilityLookup = function(excludedSkills){
	var _this = this;
	
	function processActor(actor, isEnemy, sourceX, sourceY, type, slot){
		var accumulators = _this.getActiveStatMods(actor, excludedSkills);
		Object.keys(accumulators).forEach(function(accType){
			var activeAbilities = accumulators[accType];
			activeAbilities.forEach(function(effect){
				effect = JSON.parse(JSON.stringify(effect));
				effect.slotType = type;
				effect.slot = slot;
				var rangeInfo = effect.rangeInfo;
				var target;
				if(isEnemy){
					if(rangeInfo.targets == "own"){
						target = "enemy";
					} else {
						target = "ally";
					}
				} else {
					if(rangeInfo.targets == "own"){
						target = "ally";
					} else {
						target = "enemy";
					}
				}
				for(var i = 0; i <= rangeInfo.max * 2; i++){
					var x = i - rangeInfo.max;
					for(var j = 0; j <= rangeInfo.max * 2; j++){
						var y = j - rangeInfo.max;
						var distance = Math.abs(x) + Math.abs(y);
						if(distance <= rangeInfo.max && distance >= rangeInfo.min){
							var realX = sourceX + x;
							var realY = sourceY + y;
							if(!result[realX]){
								result[realX] = {};
							}
							if(!result[realX][realY]){
								result[realX][realY] = {};
							}
							if(!result[realX][realY][target]){
								result[realX][realY][target] = {
									mult: [],
									mult_ceil: [],
									addPercent: [],
									addFlat: [],
									list: []
								};
							}
							/*if(!result[realX][realY][target][accType]){
								result[realX][realY][target][accType] = [];
							}*/
							if(effect.range == null || effect.range == distance){
								result[realX][realY][target][accType].push(effect);
									
								var stackInfo = {};
								var tmp = [];
								
								var effects = result[realX][realY][target][accType];
								effects.forEach(function(effect){
									if(effect.canStack){
										tmp.push(effect);
									} else {
										if(!stackInfo[effect.stackId]){
											stackInfo[effect.stackId] = {};
										}
										if(!stackInfo[effect.stackId][effect.type]){
											stackInfo[effect.stackId][effect.type] = effect;
										} else if(stackInfo[effect.stackId][effect.type].value < effect.value){
											stackInfo[effect.stackId][effect.type] = effect;
										}
									}									
								});
								Object.keys(stackInfo).forEach(function(stackId){
									var typeInfo = stackInfo[stackId];
									Object.keys(typeInfo).forEach(function(type){
										tmp.push(stackInfo[stackId][type]);
									});										
								});									
								result[realX][realY][target][accType] = tmp;
							}
						}
					}	
				}
			});	
		});	
	}
	
	if(_this._cachedAbilityLookup && !_this._abilityCacheDirty){
		return _this._cachedAbilityLookup;
	}
	var result = {};
	_this.iterateAllActors(null, function(actor, event){			
		if(actor && event && !event.isErased()){
			var isEnemy = $gameSystem.isEnemy(actor);
			var sourceX = event.posX();
			var sourceY = event.posY();
			
			processActor(actor, isEnemy, sourceX, sourceY, "main");		
			
			var subPilots = _this.getSubPilots(actor);
			if(!actor.isSubPilot){
				var ctr = 0;
				subPilots.forEach(function(pilotId){
					var actor = $gameActors.actor(pilotId);
					if(actor){
						processActor(actor, isEnemy, sourceX, sourceY, "sub", ctr++);		
					}			
				});	
			}
		}
	});
	_this._cachedAbilityLookup = result;
	_this._abilityCacheDirty = false;
	return result;
}


StatCalc.prototype.getActorStatMods = function(actor, excludedSkills){
	var abilityLookup = this.createActiveAbilityLookup(excludedSkills);
	var statMods;// = this.getActiveStatMods(actor, excludedSkills);
	var event;
	if(actor.isSubPilot && actor.mainPilot){		
		event = actor.mainPilot.event;
	} else {
		event = actor.event;
	}
	try {
		if(event && abilityLookup && abilityLookup[event.posX()] && abilityLookup[event.posX()][event.posY()]){
			if($gameSystem.isEnemy(actor)){				
				statMods = abilityLookup[event.posX()][event.posY()].enemy;
			} else {
				statMods = abilityLookup[event.posX()][event.posY()].ally;
			}
		}		
	} catch(e){
		
	}
	if(!statMods){
		statMods = {
			mult: [],
			mult_ceil: [],
			addPercent: [],
			addFlat: [],
			list: []
		};
	}
	return statMods;
}

StatCalc.prototype.getActorSlotInfo = function(actor){
	var result = {};
	if(actor.isSubPilot){
		result.type = "sub";
		result.slot = actor.subPilotSlot;
	} else {
		result.type = "main";
	}
	return result;
}

StatCalc.prototype.validateEffectTarget = function(effect, actor){
	var slotInfo = this.getActorSlotInfo(actor);
	var validSlot = true;
	if(slotInfo.type == effect.slotType){
		if(slotInfo.type == "sub"){
			if(slotInfo.slot != effect.slot){
				validSlot = false;
			}
		}
	} else {
		validSlot = false;
	}
	return validSlot && (effect.appliesTo == null || effect.appliesTo == actor.SRWStats.pilot.id)
}

StatCalc.prototype.getModDefinitions = function(actor, types, excludedSkills){
	var result = [];
	var statMods = this.getActorStatMods(actor, excludedSkills);		
	for(var i = 0; i < statMods.list.length; i++){
		if(this.validateEffectTarget(statMods.list[i], actor) && types.indexOf(statMods.list[i].type) != -1){
			result.push(statMods.list[i]);
		}		
	}	
	return result;
}

StatCalc.prototype.applyStatModsToValue = function(actor, value, types, excludedSkills){
	var statMods = this.getActorStatMods(actor, excludedSkills);	
	for(var i = 0; i < statMods.addFlat.length; i++){
		if(this.validateEffectTarget(statMods.addFlat[i], actor) && types.indexOf(statMods.addFlat[i].type) != -1){
			value+=statMods.addFlat[i].value*1;
		}		
	}
	for(var i = 0; i < statMods.addPercent.length; i++){
		if(this.validateEffectTarget(statMods.addPercent[i], actor) && types.indexOf(statMods.addPercent[i].type) != -1){
			value+=Math.floor(value * statMods.addPercent[i].value);
		}		
	}
	for(var i = 0; i < statMods.mult.length; i++){
		if(this.validateEffectTarget(statMods.mult[i], actor) && types.indexOf(statMods.mult[i].type) != -1){
			value = Math.floor(value * statMods.mult[i].value);
		}		
	}
	for(var i = 0; i < statMods.mult_ceil.length; i++){
		if(this.validateEffectTarget(statMods.mult_ceil[i], actor) && types.indexOf(statMods.mult_ceil[i].type) != -1){
			value = Math.ceil(value * statMods.mult_ceil[i].value);
		}		
	}
	return value;
}

StatCalc.prototype.applyMaxStatModsToValue = function(actor, value, types, excludedSkills){
	var max = value;
	var statMods = this.getActorStatMods(actor, excludedSkills);	
	for(var i = 0; i < statMods.addFlat.length; i++){
		if(this.validateEffectTarget(statMods.addFlat[i], actor) && types.indexOf(statMods.addFlat[i].type) != -1){
			if(value + statMods.addFlat[i].value*1 > max){
				max = value + statMods.addFlat[i].value*1;
			}
		}		
	}
	for(var i = 0; i < statMods.addPercent.length; i++){
		if(this.validateEffectTarget(statMods.addPercent[i], actor) && types.indexOf(statMods.addPercent[i].type) != -1){
			if(value + Math.floor(value * statMods.addPercent[i].value) > max){
				max = value + Math.floor(value * statMods.addPercent[i].value);
			}
		}		
	}
	for(var i = 0; i < statMods.mult.length; i++){
		if(this.validateEffectTarget(statMods.mult[i], actor) && types.indexOf(statMods.mult[i].type) != -1){
			if(Math.floor(value * statMods.mult[i].value) > max){
				max = Math.floor(value * statMods.mult[i].value);
			}
		}		
	}
	for(var i = 0; i < statMods.mult_ceil.length; i++){
		if(this.validateEffectTarget(statMods.mult_ceil[i], actor) && types.indexOf(statMods.mult_ceil[i].type) != -1){
			if(Math.ceil(value * statMods.mult_ceil[i].value) > max){
				max = Math.ceil(value * statMods.mult_ceil[i].value);
			}
		}		
	}
	return max;
}

StatCalc.prototype.getCommanderBonus = function(actor){
	var commanderLookup = this.getCommanderAuraLookup(actor);
	var result = 0;
	if(actor.event){
	    var x = actor.event.posX();
		var y = actor.event.posY();
		if(commanderLookup[x] && commanderLookup[x][y]){
			result = commanderLookup[x][y];
		}
	}
	result = parseInt(result);
	if(isNaN(result)){
		result = 0;
	}
	return result;
}


StatCalc.prototype.getCommanderAura = function(actor){
	var _this = this;
	var result = {};
	var abilityLookup = this.createActiveAbilityLookup();	
	
	var commanderLevel = _this.getPilotAbilityLevel(actor, 44);
	if(commanderLevel > 0 && actor.event){
		var sourceX = actor.event.posX();
		var sourceY = actor.event.posY();
		for(var i = 0; i <= 10; i++){
			var x = i - 5;
			for(var j = 0; j <= 10; j++){
				var y = j - 5;
				var distance = Math.abs(x) + Math.abs(y);
				if(distance <= 5 && distance > 0){
					var realX = sourceX + x;
					var realY = sourceY + y;
					var auraLookup = ENGINE_SETTINGS.COMMANDER_AURA[commanderLevel];
					if(auraLookup){
						var amount = auraLookup[distance-1];
						if(amount){
							if(!result[realX]){
								result[realX] = {};
							}
							if(!result[realX][realY]){
								result[realX][realY] = 0;
							}
							if(amount > result[realX][realY]){
								result[realX][realY] = amount;
							}
						}
					}
				}
			}	
		}
	}
	return result;
}

StatCalc.prototype.getCommanderAuraLookup = function(actor){
	var _this = this;
	var result = {};
	var type = $gameSystem.isEnemy(actor);
	
	if(this.isActorSRWInitialized(actor)){
		this.iterateAllActors(null, function(actor, event){			
			if(!event.isErased() && $gameSystem.isEnemy(actor) == type){
				_this.getCommanderAura(actor, event, result);
			}		
		});
	} 
	return result;		
}

StatCalc.prototype.getCurrentVariableSubPilotMechs = function(actorId){
	var _this = this;
	var result = [];
	for(var i = 0; i < $dataClasses.length; i++){
		var mechData = _this.getMechDataById(i, true);
		if(mechData.id != -1 && !mechData.fixedSubPilots){
			if(mechData.subPilots && mechData.subPilots.indexOf(actorId) != -1){
				result.push(mechData.id);
			}
		}
	}
	return result;
}

StatCalc.prototype.isValidForDeploy = function(actor){
	var _this = this;
	if(this.isActorSRWInitialized(actor)){
		var deployConditionsMet = true;
		
		var deployActions = this.getDeployActions(actor.SRWStats.pilot.id, actor.SRWStats.mech.id);
		
		if(deployActions){
			Object.keys(deployActions).forEach(function(targetMechId){
				var actions = deployActions[targetMechId];
				actions.forEach(function(action){
					var targetDef = action.target;
					var sourceDef = action.source;
					if(sourceDef.type == "direct"){
						var sourceId = _this.getSourceId(sourceDef);
					
						if(targetDef.type == "main"){
							var currentPilot = _this.getCurrentPilot(targetMechId, true);
							if(!currentPilot || !currentPilot.actorId() == sourceId){
								deployConditionsMet = false;
							}
						} else {
							var mechData = _this.getMechDataById(targetMechId, true);
							if(!mechData || mechData.subPilots[targetDef.slot] != sourceId){
								deployConditionsMet = false;
							}
						}
					} else {
						if(targetDef.type == "main"){
							var currentPilot = _this.getCurrentPilot(targetMechId, true);
							if(!currentPilot || currentPilot == -1){
								deployConditionsMet = false;
							}
						} else {
							var mechData = _this.getMechDataById(targetMechId, true);
							if(!mechData || mechData.subPilots[targetDef.slot] == 0 || mechData.subPilots[targetDef.slot] == -1){
								deployConditionsMet = false;
							}
						}
					}					
				});
			});
		}
		
		return deployConditionsMet && !actor.isEmpty && actor.SRWStats.pilot.id != -1 && actor.SRWStats.mech.id != -1 && !actor.SRWStats.mech.notDeployable;
	} else {
		return false;
	}
}

StatCalc.prototype.getDeployActions = function(actorId, mechId){
	var result;
	var mechData = this.getMechData($dataClasses[mechId], true);
	if(mechData && mechData.deployActions){
		result = mechData.deployActions[actorId];
		if(!result){
			result = mechData.deployActions[-1];
		}
	}	
	if(!result){
		return null;
	} else {
		return JSON.parse(JSON.stringify(result));
	}	
}

StatCalc.prototype.hasDeployActions = function(actorId, mechId){
	return this.getDeployActions(actorId, mechId) != null;
}

StatCalc.prototype.getSourceId = function(sourceDef){
	var sourceId = -1;
	if(sourceDef.type == "direct"){
		sourceId = sourceDef.id;
	} else if(sourceDef.type == "main"){
		var donorMech = this.getMechDataById(sourceDef.mech_id, true);
		if(donorMech){
			var pilot =  this.getCurrentPilot(donorMech.id);
			if(pilot){
				sourceId = pilot.SRWStats.pilot.id;
			}
		}
	} else if(sourceDef.type == "sub"){
		var donorMech = this.getMechDataById(sourceDef.mech_id, true);				
		if(donorMech){
			var subPilots = donorMech.subPilots;
			if(subPilots[sourceDef.slot]){
				sourceId = subPilots[sourceDef.slot];												
			}					
		}
	}
	sourceDef.realId = sourceId;
	return sourceId;
}

StatCalc.prototype.applyDeployActions = function(actorId, mechId){
	var _this = this;
	var deployActions = this.getDeployActions(actorId, mechId);
	var affectedActors = [];
	
	if(deployActions){
		Object.keys(deployActions).forEach(function(targetMechId){
			var reservedActors = {};
			var actions = deployActions[targetMechId];
			
			actions.forEach(function(action){		
				var sourceId = _this.getSourceId(action.source);
				if(sourceId != 0 && sourceId != -1){
					reservedActors[sourceId] = true;
				}
			});
			
			Object.keys(reservedActors).forEach(function(actorId){
				var previousMechs = $statCalc.getCurrentVariableSubPilotMechs(actorId);
				previousMechs.forEach(function(previousMechId){		
					var previousMech = $statCalc.getMechData($dataClasses[previousMechId], true);
					if(previousMech && previousMech.id != -1){
						previousMech.subPilots[previousMech.subPilots.indexOf(actorId)] = 0;
						$statCalc.storeMechData(previousMech);
						
						//ensure the live copy of the unit is also updated
						var currentPilot = $statCalc.getCurrentPilot(previousMech.id);
						if(currentPilot){
							$statCalc.initSRWStats(currentPilot);
						}
					}	
				});
				
				var actor = $gameActors.actor(actorId);
				actor._classId = 0;
				$statCalc.initSRWStats(actor);		
			});		
			
			actions.forEach(function(action){
				var targetDef = action.target;
				var sourceDef = action.source;
				
				var sourceId = sourceDef.realId;
				
				if(sourceId != 0 && sourceId != -1){
					var targetPilot = $gameActors.actor(sourceId);					
					if(targetDef.type == "main"){
						targetPilot._classId = targetMechId;
						targetPilot.isSubPilot = false;
						$statCalc.initSRWStats(targetPilot);
					} else {
						var targetMech = $statCalc.getMechData($dataClasses[targetMechId], true);
						targetMech.subPilots[targetDef.slot] = targetPilot.actorId();
						$statCalc.storeMechData(targetMech);
						
						//ensure the live copy of the unit is also updated
						var currentPilot = $statCalc.getCurrentPilot(targetMechId);
						if(currentPilot){
							$statCalc.initSRWStats(currentPilot);
						}
					}
				}
			});
		});		
		this.initSRWStats($gameActors.actor(actorId));		
	}		
	this.invalidateAbilityCache();	
}

StatCalc.prototype.isInCombat = function(actor){
	return $gameTemp.currentBattleActor == actor || $gameTemp.currentBattleEnemy == actor;
}

StatCalc.prototype.getActiveCombatInfo = function(actor){	
	if($gameTemp.battleTargetInfo){
		var targetInfo = $gameTemp.battleTargetInfo[actor._cacheReference];
		if(!targetInfo){
			 targetInfo = $gameTemp.battleTargetInfo[actor._supportCacheReference];
		}
		if(targetInfo){
			return {
				self: targetInfo.initiator.actor,
				other: targetInfo.target.actor,
				self_action: targetInfo.initiator.action
			}
		}
	}	
	return null;
}

StatCalc.prototype.getAttributeInfo = function(actor){
	var result = {
		attribute1: "",
		attribute2: ""
	}
	if(this.isActorSRWInitialized(actor)){	
		result = {
			attribute1: String(actor.SRWStats.mech.attribute1).toLowerCase(),
			attribute2: String(actor.SRWStats.mech.attribute2).toLowerCase()
		}
	}	
	return result;
}

StatCalc.prototype.getEffectivenessMultipler = function(attacker, defender){
	function readLookup(lookup, attackerAttr, defenderAttr){
		var result = 1;
		if(lookup){
			if(lookup[attackerAttr] && lookup[attackerAttr][defenderAttr]){
				result = lookup[attackerAttr][defenderAttr];
			}
		}
		return result;
	}
	var attackerAttr1 = attacker.SRWStats.mech.attribute1 || "";
	var defenderAttr1 = defender.SRWStats.mech.attribute1 || ""; 
	
	var attr1Mult = readLookup(ENGINE_SETTINGS.EFFECTIVENESS.attribute1, attackerAttr1, defenderAttr1);
	
	var attackerAttr2 = attacker.SRWStats.mech.attribute2 || "";
	var defenderAttr2 = defender.SRWStats.mech.attribute2 || ""; 
	
	var attr2Mult = readLookup(ENGINE_SETTINGS.EFFECTIVENESS.attribute2, attackerAttr2, defenderAttr2);
	
	return attr1Mult * attr2Mult;
}

