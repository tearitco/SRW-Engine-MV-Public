	export default {
		patches: patches,
	} 
	
	function patches(){};
	
	patches.apply = function(){
		
	//==================================================================
	// ●Game_BattlerBase
	//====================================================================
		// 初期処理
		Object.defineProperties(Game_BattlerBase.prototype, {
			// Hit Points
			hp: { get: function() { 
				if($statCalc.isActorSRWInitialized(this)){
					return this.SRWStats.mech.stats.calculated.currentHP;
				} else {
					return this._hp; 
				}			
			}, configurable: true },
			// Magic Points
			mp: { get: function() { 
				if($statCalc.isActorSRWInitialized(this)){
					return this.SRWStats.mech.stats.calculated.currentEN;
				} else {
					return this._mp; 
				}
			}, configurable: true },
			// Tactical Points
			mhp: { get: function() { 
				if($statCalc.isActorSRWInitialized(this)){
					return this.SRWStats.mech.stats.calculated.maxHP;
				} else {
					return this.param(0); 
				}		
			}, configurable: true },
			// Maximum Magic Points
			mmp: { get: function() { 
				if($statCalc.isActorSRWInitialized(this)){
					return this.SRWStats.mech.stats.calculated.maxEN;
				} else {
					return this.param(1); 
				}
			}, configurable: true },
			// ATtacK power
		});
		
		Game_BattlerBase.prototype.setHp = function(hp) {
			if(!isNaN(hp)){
				if(hp < 0){
					hp = 0;
				}
				if($statCalc.isActorSRWInitialized(this)){
					this.SRWStats.mech.stats.calculated.currentHP = hp;
				}
				this._hp = hp;
				this.refresh();
			} else {
				console.log("setHp received invalid value!");
			}
		};

		Game_BattlerBase.prototype.setMp = function(mp) {
			if(!isNaN(mp)){
				if(mp < 0){
					mp = 0;
				}
				if($statCalc.isActorSRWInitialized(this)){
					this.SRWStats.mech.stats.calculated.currentEN = mp;
				}
				this._mp = mp;
				this.refresh();
			} else {
				console.log("setMp received invalid value!");
			}		
		};	
		
		var _SRPG_Game_BattlerBase_initMembers = Game_BattlerBase.prototype.initMembers;
		Game_BattlerBase.prototype.initMembers = function() {
			_SRPG_Game_BattlerBase_initMembers.call(this);
			this._srpgTurnEnd = false;
			this._srpgActionTiming = -1; // 0:攻撃側、1:防御側
		};

		// 移動力を返す（定義は、gameActor, gameEnemyで行う）
		Game_BattlerBase.prototype.srpgMove = function() {
			return 0;
		};

		// スキル・アイテムの射程を返す（定義は、gameActor, gameEnemyで行う）
		Game_BattlerBase.prototype.srpgSkillRange = function(skill) {
			return 0;
		};

		// 武器の攻撃射程を返す（定義は、gameActor, gameEnemyで行う）
		Game_BattlerBase.prototype.srpgWeaponRange = function() {
			return 0;
		};

		// 武器が反撃可能かを返す（定義は、gameActor, gameEnemyで行う）
		Game_BattlerBase.prototype.srpgWeaponCounter = function() {
			return true;
		};

		// 通行可能タグを返す（定義は、gameActor, gameEnemyで行う）
		Game_BattlerBase.prototype.srpgThroughTag = function() {
			return 0;
		};

		//行動終了かどうかを返す
		Game_BattlerBase.prototype.srpgTurnEnd = function() {
			return this._srpgTurnEnd;
		};

		//行動終了を設定する
		Game_BattlerBase.prototype.setSrpgTurnEnd = function(flag) {
			if(flag){
				$statCalc.setTurnEnd(this);
			}		
			this._srpgTurnEnd = flag;
		};

		//攻撃側か防御側かを返す
		Game_BattlerBase.prototype.srpgActionTiming = function() {
			return this._srpgActionTiming;
		};

		//攻撃側か防御側かを設定する
		Game_BattlerBase.prototype.setActionTiming = function(timing) {
			this._srpgActionTiming = timing;
		};

		// 入力可能かどうかの判定
		var _SRPG_Game_BattlerBase_canInput = Game_BattlerBase.prototype.canInput;
		Game_BattlerBase.prototype.canInput = function() {
			if ($gameSystem.isSRPGMode() == true) {
				return this.isAppeared() && !this.isRestricted() && !this.isAutoBattle() &&
					   !this.srpgTurnEnd();
			} else {
				return _SRPG_Game_BattlerBase_canInput.call(this);
			}
		};

		// スキル・アイテムが使用可能かの判定
		var _SRPG_Game_BattlerBase_isOccasionOk = Game_BattlerBase.prototype.isOccasionOk;
		Game_BattlerBase.prototype.isOccasionOk = function(item) {
			if ($gameSystem.isSRPGMode() == true) {
				if ($gameSystem.isBattlePhase() === 'actor_phase' &&
					$gameSystem.isSubBattlePhase() === 'normal') {
					return false;
				} else {
					return item.occasion === 0 || item.occasion === 1;
				}
			} else {
				return _SRPG_Game_BattlerBase_isOccasionOk.call(this, item);
			}
		};

		// スキル・アイテムが使用可能かの判定
		var _SRPG_Game_BattlerBase_canUse = Game_BattlerBase.prototype.canUse;
		Game_BattlerBase.prototype.canUse = function(item) {
			if ($gameSystem.isSRPGMode() == true) {
				if (!item) {
					return false;
				}
				if ($gameSystem.isBattlePhase() === 'actor_phase' && 
					$gameSystem.isSubBattlePhase() === 'normal') {
					return false;
				}
				if (($gameSystem.isSubBattlePhase() === 'invoke_action' ||
					 $gameSystem.isSubBattlePhase() === 'auto_actor_action' ||
					 $gameSystem.isSubBattlePhase() === 'enemy_action' ||
					 $gameSystem.isSubBattlePhase() === 'battle_window') &&
					(this.srpgSkillRange(item) < $gameTemp.SrpgDistance() ||
					this.srpgSkillMinRange(item) > $gameTemp.SrpgDistance() ||
					$gameTemp.SrpgSpecialRange() == false ||
					(this._srpgActionTiming == 1 && this.srpgWeaponCounter() == false))) {
					return false;
				}
			}
			return _SRPG_Game_BattlerBase_canUse.call(this, item);
		};

		// ステートのターン経過処理（ＳＲＰＧ用）
		// 行動終了時：行動ごとに１ターン経過
		// ターン終了時：全体のターン終了ごとに１ターン経過
		Game_BattlerBase.prototype.updateSrpgStateTurns = function(timing) {
			this._states.forEach(function(stateId) {
				if (this._stateTurns[stateId] > 0 && $dataStates[stateId].autoRemovalTiming === timing) {
					this._stateTurns[stateId]--;
				}
			}, this);
		};


	//====================================================================
	// ●Game_Battler
	//====================================================================
		

		var _SRPG_Game_Battler_initMembers = Game_Battler.prototype.initMembers;
		Game_Battler.prototype.initMembers = function() {
			_SRPG_Game_Battler_initMembers.call(this);
			this._battleMode = 'normal';
			this._searchItem = false;
			this._targetId = -1;
			this._SRPGActionTimes = 1;
		};

		// 行動モードの設定
		Game_Battler.prototype.setBattleMode = function(mode, force) {
			if(force || (this._battleMode != "fixed" && this._battleMode != "disabled")){
				this._battleMode = mode;	
			}        
		};
		
		Game_Battler.prototype.setSquadMode = function(mode) {
			var _this = this;
			_this.setBattleMode(mode);
			if(_this.squadId != -1){
				var type = _this.isActor() ? "actor" : "enemy";
				$gameMap.events().forEach(function(event) {
					if (event.isType() === type) {
						var enemy = $gameSystem.EventToUnit(event.eventId())[1];	
						if(enemy.squadId == _this.squadId){
							enemy.setBattleMode(_this._battleMode);
						}	
					}
				});
			}		
		}

		Game_Battler.prototype.battleMode = function() {
			return this._battleMode;
		};

		// アイテム探査モードの設定
		Game_Battler.prototype.setSearchItem = function(mode) {
			if (mode) {
				this._searchItem = true;
			} else {
				this._searchItem = false;
			}
		};

		Game_Battler.prototype.searchItem = function() {
			return this._searchItem;
		};

		// ターゲットＩＤの設定
		Game_Battler.prototype.setTargetId = function(id) {
			this._targetId = id;
		};

		Game_Battler.prototype.targetId = function() {
			return this._targetId;
		};

		// 行動回数を設定する（SRPG用）
		Game_Battler.prototype.SRPGActionTimesSet = function(amount) {
			this._SRPGActionTimes = amount || 1;
		};

		// 行動回数を返す
		Game_Battler.prototype.SRPGActionTimes = function() {
			return this._SRPGActionTimes;
		};

		// 行動回数を消費する
		Game_Battler.prototype.useSRPGActionTimes = function(num) {
			this._SRPGActionTimes -= num;
		};

		// 行動回数の設定（戦闘用）
		var _SRPG_Game_Battler_makeActionTimes = Game_Battler.prototype.makeActionTimes;
		Game_Battler.prototype.makeActionTimes = function() {
			if ($gameSystem.isSRPGMode() == true) {
				return 1;
			} else {
				return _SRPG_Game_Battler_makeActionTimes.call(this);
			}
		};

		// アクションのから配列を作成する
		Game_Battler.prototype.srpgMakeNewActions = function() {
			this.clearActions();
			//if (this.canMove()) {
				var actionTimes = this.makeActionTimes();
				this._actions = [];
				for (var i = 0; i < actionTimes; i++) {
					this._actions.push(new Game_Action(this));
				}
			//}
			this.setActionState('waiting');
		};
		
		Game_Battler.prototype.srpgInitAction = function() {
			 this.clearActions();
			 this._actions.push(new Game_Action(this));
		}

		// 行動開始時の処理
		var _SRPG_Game_Battler_onBattleStart = Game_Battler.prototype.onBattleStart;
		Game_Battler.prototype.onBattleStart = function() {
			if ($gameSystem.isSRPGMode() == true) {
				this.setActionState('undecided');
				this.clearMotion();
			} else {
				return _SRPG_Game_Battler_onBattleStart.call(this);
			}
		};

		// 行動終了時の処理
		var _SRPG_Game_Battler_onAllActionsEnd = Game_Battler.prototype.onAllActionsEnd;
		Game_Battler.prototype.onAllActionsEnd = function() {
			if ($gameSystem.isSRPGMode() == true) {
				this.updateSrpgStateTurns(1);
				this.removeStatesAuto(1);
				this.clearResult();
			} else {
				return _SRPG_Game_Battler_onAllActionsEnd.call(this);
			}
		};

		// ターン終了時の処理
		var _SRPG_Game_Battler_onTurnEnd = Game_Battler.prototype.onTurnEnd;
		Game_Battler.prototype.onTurnEnd = function() {
			if ($gameSystem.isSRPGMode() == true) {
				this.regenerateAll();
				this.updateSrpgStateTurns(2);
				this.updateBuffTurns();
				this.removeStatesAuto(2);
				this.removeBuffsAuto();
				this.clearResult();
				this.setSrpgTurnEnd(false);
			} else {
				return _SRPG_Game_Battler_onTurnEnd.call(this);
			}
		};

		Game_Battler.prototype.srpgCheckFloorEffect = function(x, y) {
			if ($gameMap.isDamageFloor(x, y) == true) {
				this.srpgExecuteFloorDamage();
			}
		};

		Game_Battler.prototype.srpgExecuteFloorDamage = function() {
			var damage = Math.floor(this.srpgBasicFloorDamage() * this.fdr);
			damage = Math.min(damage, this.srpgMaxFloorDamage());
			this.gainHp(-damage);
			if (damage > 0) {
				$gameScreen.startFlashForDamage();
			}
		};

		Game_Battler.prototype.srpgBasicFloorDamage = function() {
			return this.mhp * 0.1;
		};

		Game_Battler.prototype.srpgMaxFloorDamage = function() {
			return $dataSystem.optFloorDeath ? this.hp : Math.max(this.hp - 1, 0);
		};

	//====================================================================
	// ●Game_Actor
	//====================================================================
		Object.defineProperty(Game_Actor.prototype, 'level', {
			get: function() {
				if($statCalc.isActorSRWInitialized(this)){
					return this.SRWStats.pilot.level;
				} else {
					return this._level; 
				}	
			},
			configurable: true
		});
		
		
		Game_Actor.prototype.expForLevel = function(level) {
			return 500 * level;
		};

		Game_Actor.prototype.initExp = function() {
			//stubbed	
		};

		Game_Actor.prototype.currentExp = function() {
			return this.SRWStats.pilot.exp;
		};

		Game_Actor.prototype.currentLevelExp = function() {
			return this.expForLevel(this._level);
		};

		Game_Actor.prototype.nextLevelExp = function() {
			return this.expForLevel(this._level + 1);
		};

		Game_Actor.prototype.nextRequiredExp = function() {
			return this.nextLevelExp() - this.currentExp();
		};

		Game_Actor.prototype.maxLevel = function() {
			return 99;
		};

		Game_Actor.prototype.isMaxLevel = function() {
			return this._level >= this.maxLevel();
		};
		
		var Game_Actor_initImages = Game_Actor.prototype.initImages;
		Game_Actor.prototype.initImages = function(overworldSpriteData) {
			if($gameSystem.isSRPGMode()){
				var actor = this.actor();
				if(!overworldSpriteData){
					if($dataClasses[actor.classId].meta.srpgOverworld){
						overworldSpriteData = $dataClasses[actor.classId].meta.srpgOverworld.split(",");
					} else {
						overworldSpriteData = [actor.characterName, actor.characterIndex];
					}
				}
						
				this._characterName = overworldSpriteData[0];
				this._characterIndex = overworldSpriteData[1];
				this._faceName = actor.faceName;
				this._faceIndex = actor.faceIndex;
				this._battlerName = actor.battlerName;
			} else {
				Game_Actor_initImages.call(this);
			}
			
		};

		// 装備変更可能か
		Window_EquipSlot.prototype.isEnabled = function(index) {
			return this._actor ? this._actor.isEquipChangeOk(index) : false;
		};
		
		Game_Actor.prototype.setAttack = function(slotId, item) {
			this._equips[slotId].setObject(item);
		};

		var _SRPG_Game_Actor_isEquipChangeOk = Game_Actor.prototype.isEquipChangeOk;
		Game_Actor.prototype.isEquipChangeOk = function(slotId) {
			if ($gameSystem.isSRPGMode() == true) {
				if (this.srpgTurnEnd() == true || this.isRestricted() == true) {
					return false;
				} else {
					return _SRPG_Game_Actor_isEquipChangeOk.call(this, slotId);
				}
			} else {
				return _SRPG_Game_Actor_isEquipChangeOk.call(this, slotId);
			}
		};

		// アクターコマンドで装備が可能か（移動後は不可）
		Game_Actor.prototype.canSrpgEquip = function() {
			return $gameTemp.originalPos()[0] == $gameTemp.activeEvent().posX() &&
				   $gameTemp.originalPos()[1] == $gameTemp.activeEvent().posY();
		};

		// 経験値の割合を返す
		Game_Actor.prototype.expRate = function() {
			if (this.isMaxLevel()) {
				var rate = 1.0;
			} else {
				var rate = (this.currentExp() - this.currentLevelExp()) / (this.nextLevelExp() - this.currentLevelExp());
			}
			return rate;
		};

		// 移動力を返す
		Game_Actor.prototype.srpgMove = function() {
			var n = this.currentClass().meta.srpgMove;
			if (!n) {
				n = _defaultMove;
			}
			n = Number(n);
			// ステートによる変更
			this.states().forEach(function(state) {
				if (state.meta.srpgMovePlus) {
					n += Number(state.meta.srpgMovePlus);
				}
			}, this);
			// 装備による変更
			var equips = this.equips();
			for (var i = 0; i < equips.length; i++) {
				var item = equips[i];
				if (item && item.meta.srpgMovePlus) {
					n += Number(item.meta.srpgMovePlus);
				}
			}
			n = Number(Math.max(n, 0));
			return n;
		};

		// スキル・アイテムの射程を返す
		Game_Actor.prototype.srpgSkillRange = function(skill) {
			var range = 1;
			if (skill && skill.meta.srpgRange == -1) {
				if (!this.hasNoWeapons()) {
					weapon = this.weapons()[0];
					range = weapon.meta.weaponRange;
				}
			} else if (skill.meta.srpgRange) {
				range = skill.meta.srpgRange;
			} else {
				range = 1;
			}
			return Number(range);
		};

		// 武器の攻撃射程を返す
		Game_Actor.prototype.srpgWeaponRange = function() {
			return this.srpgSkillRange($dataSkills[this.attackSkillId()]);
		};

		// 武器が反撃可能かを返す
		Game_Actor.prototype.srpgWeaponCounter = function() {
			if (this.hasNoWeapons()) {
				return true;
			} else {
				var weapon = this.weapons()[0];
				if (!weapon.meta.srpgCounter || !weapon.meta.srpgCounter == 'false') {
					return true;
				} else {
					return false;
				}
			}
		};

		// 通行可能タグを返す（class, equip, stateの設定で最大の物を採用する）
		Game_Actor.prototype.srpgThroughTag = function() {
			var n = 0;
			// 職業
			if (this.currentClass().meta.srpgThroughTag && n < Number(this.currentClass().meta.srpgThroughTag)) {
				n = Number(this.currentClass().meta.srpgThroughTag);
			}
			// ステート
			this.states().forEach(function(state) {
				if (state.meta.srpgThroughTag && n < Number(state.meta.srpgThroughTag)) {
					n = Number(state.meta.srpgThroughTag);
				}
			}, this);
			// 装備
			var equips = this.equips();
			for (var i = 0; i < equips.length; i++) {
				var item = equips[i];
				if (item && item.meta.srpgThroughTag && n < Number(item.meta.srpgThroughTag)) {
					n = Number(item.meta.srpgThroughTag);
				}
			}
			return n;
		};

		// スキル・アイテムの最低射程を返す
		Game_Actor.prototype.srpgSkillMinRange = function(skill) {
			var minRange = 0;
			if (skill) {
				if (skill.meta.srpgRange == -1) {
					if (!this.hasNoWeapons()) {
						var weapon = this.weapons()[0];
						minRange = weapon.meta.weaponMinRange;
					}
				} else if (skill.meta.srpgMinRange) {
					minRange = skill.meta.srpgMinRange;
				}
				if (!minRange) {
					minRange = 0;
				}
			} else {
				minRange = 0;
			}
			if (minRange > this.srpgSkillRange(skill)) {
				minRange = this.srpgSkillRange(skill);
			}
			return Number(minRange);
		};

		// 武器の最低射程を返す
		Game_Actor.prototype.srpgWeaponMinRange = function() {
			return this.srpgSkillMinRange($dataSkills[this.attackSkillId()]);
		};

		// attackSkillId == 1 以外の武器を作る
		Game_Actor.prototype.attackSkillId = function() {
			var weapon = this.weapons()[0];
			if (weapon && weapon.meta.srpgWeaponSkill) {
				return Number(weapon.meta.srpgWeaponSkill);
			} else {
				return Game_BattlerBase.prototype.attackSkillId.call(this);
			}
		};

		//自動行動を決定する
		var _SRPG_Game_Actor_makeAutoBattleActions = Game_Actor.prototype.makeAutoBattleActions;
		Game_Actor.prototype.makeAutoBattleActions = function() {
			if ($gameSystem.isSRPGMode() == true) {
				for (var i = 0; i < this.numActions(); i++) {
					var list = this.makeActionList();
					this.setAction(i, list[Math.randomInt(list.length)]);
				}
				this.setActionState('waiting');
			} else {
				return _SRPG_Game_Actor_makeAutoBattleActions.call(this);
			}
		};

	//====================================================================
	// ●Game_Enemy
	//====================================================================
		// 戦闘画面での座標を設定する
		Game_Enemy.prototype.setScreenXy = function(x, y) {
			this._screenX = x;
			this._screenY = y;
		};

		// 移動力を返す
		Game_Enemy.prototype.srpgMove = function() {
			var n = this.enemy().meta.srpgMove;
			if (!n) {
				n = _defaultMove;
			}
			n = Number(n);
			// ステートによる変更
			this.states().forEach(function(state) {
				if (state.meta.srpgMovePlus) {
					n += Number(state.meta.srpgMovePlus);
				}
			}, this);
			// 装備による変更
			if (!this.hasNoWeapons()) {
				var item = $dataWeapons[this.enemy().meta.srpgWeapon];
				if (item && item.meta.srpgMovePlus) {
					n += Number(item.meta.srpgMovePlus);
				}
			}
			n = Number(Math.max(n, 0));
			return n;
		};

		// スキル・アイテムの射程を返す
		Game_Enemy.prototype.srpgSkillRange = function(skill) {
			var range = 1;
			if (skill && skill.meta.srpgRange == -1) {
				if (!this.hasNoWeapons()) {
					var weapon = $dataWeapons[this.enemy().meta.srpgWeapon];
					range = weapon.meta.weaponRange;
				} else {
					range = this.enemy().meta.weaponRange;
				}
			} else if (skill.meta.srpgRange) {
				range = skill.meta.srpgRange;
			} else {
				range = 1;
			}
			return Number(range);
		};

		// 武器の攻撃射程を返す
		Game_Enemy.prototype.srpgWeaponRange = function() {
			return this.srpgSkillRange($dataSkills[this.attackSkillId()]);
		};

		// 武器が反撃可能かを返す
		Game_Enemy.prototype.srpgWeaponCounter = function() {
			if (!this.hasNoWeapons()) {
				var weapon = $dataWeapons[this.enemy().meta.srpgWeapon];
				var counter = weapon.meta.srpgCounter;
			} else {
				var counter = this.enemy().meta.srpgCounter;
			} 
			if (!counter || !counter == 'false') {
				return true;
			} else {
				return false;
			}
		};

		// 通行可能タグを返す（enemy, equip, stateの設定で最大の物を採用する）
		Game_Enemy.prototype.srpgThroughTag = function() {
			var n = 0;
			// エネミー
			if (this.enemy().meta.srpgThroughTag && n < Number(this.enemy().meta.srpgThroughTag)) {
				n = Number(this.enemy().meta.srpgThroughTag);
			}
			// ステート
			this.states().forEach(function(state) {
				if (state.meta.srpgThroughTag && n < Number(state.meta.srpgThroughTag)) {
					n = Number(state.meta.srpgThroughTag);
				}
			}, this);
			// 装備
			if (!this.hasNoWeapons()) {
				var item = $dataWeapons[this.enemy().meta.srpgWeapon];
				if (item && item.meta.srpgThroughTag && n < Number(item.meta.srpgThroughTag)) {
					n = Number(item.meta.srpgThroughTag);
				}
			}
			return n;
		};

		// スキル・アイテムの最低射程を返す
		Game_Enemy.prototype.srpgSkillMinRange = function(skill) {
			var minRange = 0;
			if (skill) {
				if (skill.meta.srpgRange == -1) {
					if (!this.hasNoWeapons()) {
						var weapon = $dataWeapons[this.enemy().meta.srpgWeapon];
						minRange = weapon.meta.weaponMinRange;
					} else {
						minRange = this.enemy().meta.weaponMinRange;
					}
				} else if (skill.meta.srpgMinRange) {
					minRange = skill.meta.srpgMinRange;
				}
				if (!minRange) {
					minRange = 0;
				}
			} else {
				minRange = 0;
			}
			if (minRange > this.srpgSkillRange(skill)) {
				minRange = this.srpgSkillRange(skill);
			}
			return Number(minRange);
		};

		// 武器の最低射程を返す
		Game_Enemy.prototype.srpgWeaponMinRange = function() {
			return this.srpgSkillMinRange($dataSkills[this.attackSkillId()]);
		};

		// 武器を装備しているか返す
		Game_Enemy.prototype.hasNoWeapons = function() {
			return !$dataWeapons[this.enemy().meta.srpgWeapon];
		};

		// 装備の特徴を反映する
		var _SRPG_Game_Enemy_traitObjects = Game_Enemy.prototype.traitObjects;
		Game_Enemy.prototype.traitObjects = function() {
			var objects = _SRPG_Game_Enemy_traitObjects.call(this);
			if ($gameSystem.isSRPGMode() == true) {
				var item = $dataWeapons[this.enemy().meta.srpgWeapon];
				if (item) {
					objects.push(item);
				}
			}
			return objects;
		};

		// 装備の能力変化値を反映する
		Game_Enemy.prototype.paramPlus = function(paramId) {
			var value = Game_Battler.prototype.paramPlus.call(this, paramId);
			if ($gameSystem.isSRPGMode() == true) {
				var item = $dataWeapons[this.enemy().meta.srpgWeapon];
				if (item) {
					value += item.params[paramId];
				}
			}
			return value;
		};

		// 装備のアニメーションを反映する
		Game_Enemy.prototype.attackAnimationId = function() {
			if (this.hasNoWeapons()) {
				return this.bareHandsAnimationId();
			} else {
				var weapons = $dataWeapons[this.enemy().meta.srpgWeapon];
				return weapons ? weapons.animationId : 1;
			}
		};

		// 装備が設定されていない（素手）の時のアニメーションＩＤ
		Game_Enemy.prototype.bareHandsAnimationId = function() {
			return 1;
		};

		// attackSkillId == 1 以外の武器を作る
		Game_Enemy.prototype.attackSkillId = function() {
			var weapon = $dataWeapons[this.enemy().meta.srpgWeapon];
			if (weapon && weapon.meta.srpgWeaponSkill) {
				return Number(weapon.meta.srpgWeaponSkill);
			} else {
				return Game_BattlerBase.prototype.attackSkillId.call(this);
			}
		};

		// ＳＲＰＧ用の行動決定
		Game_Enemy.prototype.makeSrpgActions = function() {
			Game_Battler.prototype.makeActions.call(this);
			if (this.numActions() > 0) {
				if (this.isConfused()) {
					this.makeConfusionActions();
				} else {
					var actionList = this.enemy().actions.filter(function(a) {
						if (a.skillId == 1) {
							a.skillId = this.attackSkillId();
						}
						return this.isActionValid(a);
					}, this);
					if (actionList.length > 0) {
						this.selectAllActions(actionList);
					}
				}
			}
			this.setActionState('waiting');
		};

		// ＳＲＰＧ用の行動決定
		Game_Enemy.prototype.makeConfusionActions = function() {
			for (var i = 0; i < this.numActions(); i++) {
				this.action(i).setSkill(this.attackSkillId());
			}
		};

	//====================================================================
	// ●Game_Unit
	//====================================================================
		var _SRPG_Game_Unit_onBattleEnd = Game_Unit.prototype.onBattleEnd;
		Game_Unit.prototype.onBattleEnd = function() {
			if ($gameSystem.isSRPGMode() == true) {
				this._inBattle = false;
			} else {
				_SRPG_Game_Unit_onBattleEnd.call(this);
			}
		};

	//====================================================================
	// ●Game_Party
	//====================================================================
		// 初期化
		var _SRPG_Game_Party_initialize = Game_Party.prototype.initialize;
		Game_Party.prototype.initialize = function() {
			_SRPG_Game_Party_initialize.call(this);
			this._srpgBattleActors = []; //SRPGモードの戦闘時に呼び出すメンバーを設定する（行動者と対象者）
		};

		Game_Party.prototype.SrpgBattleActors = function() {
			return this._srpgBattleActors;
		};

		Game_Party.prototype.clearSrpgBattleActors = function() {
			this._srpgBattleActors = [];
		};

		Game_Party.prototype.pushSrpgBattleActors = function(actor) {
			this._srpgBattleActors.push(actor);
		};
		
		 Game_Party.prototype.setSrpgBattleActors = function(actors) {
			this._srpgBattleActors = actors;
		};

		//プレイヤー移動時の処理
		var _SRPG_Game_Party_onPlayerWalk = Game_Party.prototype.onPlayerWalk;
		Game_Party.prototype.onPlayerWalk = function() {
			if ($gameSystem.isSRPGMode() == false) {
				return _SRPG_Game_Party_onPlayerWalk.call(this);
			}
		};

		// SRPG戦闘中にはmembersで呼び出す配列を変える
		var _SRPG_Game_Party_members = Game_Party.prototype.members;
		Game_Party.prototype.members = function() {
			if ($gameSystem.isSRPGMode() == true) {
				if ($gameSystem.isSubBattlePhase() === 'normal' || $gameSystem.isSubBattlePhase() === 'initialize') {
					return this.allMembers();
				} else {
					return this.battleMembers();
				}
			} else {
				return _SRPG_Game_Party_members.call(this);
			}
		};

		// SRPG戦闘中にはbattleMembersで呼び出す配列を変える
		var _SRPG_Game_Party_battleMembers = Game_Party.prototype.battleMembers;
		Game_Party.prototype.battleMembers = function() {
			if ($gameSystem.isSRPGMode() == true) {
				return this.SrpgBattleActors();
			} else {
				return _SRPG_Game_Party_battleMembers.call(this);
			}
		};

		// セーブファイル用の処理
		var _SRPG_Game_Party_charactersForSavefile = Game_Party.prototype.charactersForSavefile;
		Game_Party.prototype.charactersForSavefile = function() {
			return null;
			
			if ($gameSystem.isSRPGMode() == true) {
				return this.allMembers().map(function(actor) {
					return [actor.characterName(), actor.characterIndex()];
				});
			} else {
				return _SRPG_Game_Party_charactersForSavefile.call(this);
			}
		};

		var _SRPG_Game_Party_facesForSavefile = Game_Party.prototype.facesForSavefile;
		Game_Party.prototype.facesForSavefile = function() {
			return null;
			
			if ($gameSystem.isSRPGMode() == true) {
				return this.allMembers().map(function(actor) {
					return [actor.faceName(), actor.faceIndex()];
				});
			} else {
				return _SRPG_Game_Party_facesForSavefile.call(this);
			}
		};

	/*
		// アイテム・スキルの使用条件
		var _SRPG_Game_Party_canUse = Game_Party.prototype.canUse;
		Game_Party.prototype.canUse = function(item) {
			if ($gameSystem.isSRPGMode() == true) {
				var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
				return actor.canUse(item);
			} else {
				return _SRPG_Game_Party_canUse.call(this, item);
			}
		};
	*/
	//====================================================================
	// ●Game_Troop
	//====================================================================
		// 初期化
		var _Game_Troop_initialize = Game_Troop.prototype.initialize
		Game_Troop.prototype.initialize = function() {
			_Game_Troop_initialize.call(this);
			this._srpgBattleEnemys = []; //SRPGモードの戦闘時に呼び出すメンバーを設定する（行動者と対象者）
		};

		Game_Troop.prototype.SrpgBattleEnemys = function() {
			return this._srpgBattleEnemys;
		};

		Game_Troop.prototype.clearSrpgBattleEnemys = function() {
			this._srpgBattleEnemys = [];
		};

		Game_Troop.prototype.pushSrpgBattleEnemys = function(enemy) {
			this._srpgBattleEnemys.push(enemy);
		};
		
		 Game_Troop.prototype.setSrpgBattleEnemys = function(enemies) {
			this._srpgBattleEnemys = enemies;
			this._enemies = enemies;
		};

		Game_Troop.prototype.pushMembers = function(enemy) {
			this._enemies.push(enemy);
		};

		// セットアップ
		var _SRPG_Game_Troop_setup = Game_Troop.prototype.setup;
		Game_Troop.prototype.setup = function(troopId) {
			if ($gameSystem.isSRPGMode() == true) {
				this.clear();
				this._troopId = troopId;
				this._enemies = [];
				for (var i = 0; i < this.SrpgBattleEnemys().length; i++) {
					var enemy = this.SrpgBattleEnemys()[i];
					enemy.setScreenXy(200 + 240 * i, Graphics.height / 2 + 48);
					this._enemies.push(enemy);
				}
				this.makeUniqueNames();
			} else {
				_SRPG_Game_Troop_setup.call(this, troopId);
			}
		};

		// EXPを返す
		var _SRPG_Game_Troop_expTotal = Game_Troop.prototype.expTotal;
		Game_Troop.prototype.expTotal = function() {
			if ($gameSystem.isSRPGMode() == true) {
				if (this.SrpgBattleEnemys() && this.SrpgBattleEnemys().length > 0) {
					if (this.isAllDead()) {
						return _SRPG_Game_Troop_expTotal.call(this);
					} else {
						var exp = 0;
						for (var i = 0; i < this.members().length; i++) {
							var enemy = this.members()[i];
							exp += enemy.exp();
						}
						return Math.floor(exp * _srpgBattleExpRate);
					}
				} else {
					var actor = $gameParty.battleMembers()[0];
					var exp = actor.nextLevelExp() - actor.currentLevelExp();
					return Math.floor(exp * _srpgBattleExpRateForActors);
				}
			} else {
				return _SRPG_Game_Troop_expTotal.call(this);
			}
		};

	//====================================================================
	// ●Game_CharacterBase
	//====================================================================
		//X座標を返す
		Game_CharacterBase.prototype.posX = function() {
			return this._x;
		};

		//Y座標を返す
		Game_CharacterBase.prototype.posY = function() {
			return this._y;
		};
		
		Game_CharacterBase.prototype.shiftY = function() {
			return 0;
		}

		//イベントかどうかを返す
		Game_CharacterBase.prototype.isEvent = function() {
			return false;
		};

		//プレイヤーの移動速度を変える（自動移動中は高速化）
		var _SRPG_Game_CharacterBase_realMoveSpeed = Game_CharacterBase.prototype.realMoveSpeed;
		Game_CharacterBase.prototype.realMoveSpeed = function() {
			if ($gameSystem.isSRPGMode() == true && 
			   ($gameTemp.isAutoMoveDestinationValid() == true || $gameTemp.isDestinationValid() == true)) {
				return 6;
			} else {
				return this._moveSpeed + (this.isDashing() ? 2 : 0);
			}
		};

		//戦闘中はキャラクターがすり抜けて移動するように変更する
		var _SRPG_Game_CharacterBase_canPass = Game_CharacterBase.prototype.canPass;
		Game_CharacterBase.prototype.canPass = function(x, y, d) {
			if ($gameSystem.isSRPGMode() == true) {
				var x2 = $gameMap.roundXWithDirection(x, d);
				var y2 = $gameMap.roundYWithDirection(y, d);
				if (!$gameMap.isValid(x2, y2)) {
					return false;
				}
				return true;
			} else {
				return _SRPG_Game_CharacterBase_canPass.call(this, x, y, d);
			}
		};

		//対立陣営であれば通り抜けられない（移動範囲演算用） オブジェクトも一緒に処理する
		Game_CharacterBase.prototype.isSrpgCollidedWithEvents = function(x, y) {
			var events = $gameMap.eventsXyNt(x, y);
			return events.some(function(event) {
				if ((event.isType() === 'actor' && $gameTemp.activeEvent().isType() === 'enemy') ||
					(event.isType() === 'enemy' && $gameTemp.activeEvent().isType() === 'actor') ||
					(event.isType() === 'object' && event.characterName() != '') && !event.isErased()) {
					return true;
				} else {
					return false;
				}
			});
		};

		//移動可能かを判定する（移動範囲演算用）
		Game_CharacterBase.prototype.srpgMoveCanPass = function(x, y, d, tag) {
			var x2 = $gameMap.roundXWithDirection(x, d);
			var y2 = $gameMap.roundYWithDirection(y, d);
			if (!$gameMap.isValid(x2, y2)) {
				return false;
			}
			if (this.isSrpgCollidedWithEvents(x2, y2)) {
				return false;
			}
			if (this.isThrough()) {
				return true;
			}
			if (($gameMap.terrainTag(x2, y2) > 0 && $gameMap.terrainTag(x2, y2) <= tag) ||
				($gameMap.terrainTag(x, y) > 0 && $gameMap.terrainTag(x, y) <= tag &&
				 $gameMap.isPassable(x2, y2, this.reverseDir(d)))) {
				return true;
			}
			if (!this.isMapPassable(x, y, d)) {
				return false;
			}
			return true;
		};

		//対立陣営がいるか調べる（探索用移動範囲演算）
		Game_CharacterBase.prototype.isSrpgCollidedWithOpponentsUnit = function(x, y, d, route) {
			var x2 = $gameMap.roundXWithDirection(x, d);
			var y2 = $gameMap.roundYWithDirection(y, d);
			var events = $gameMap.eventsXyNt(x2, y2);
			return events.some(function(event) {
				if ((event.isType() === 'actor' && $gameTemp.activeEvent().isType() === 'enemy') ||
					(event.isType() === 'enemy' && $gameTemp.activeEvent().isType() === 'actor') && !event.isErased()) {
					if ($gameTemp.isSrpgPriorityTarget()) {
						if ($gameTemp.isSrpgPriorityTarget() == event &&
							$gameTemp.isSrpgBestSearchRoute()[1].length > route.length) {
							$gameTemp.setSrpgBestSearchRoute([event, route]);
						}
					} else {
						if ($gameTemp.isSrpgBestSearchRoute()[1].length > route.length) {
							$gameTemp.setSrpgBestSearchRoute([event, route]);
						}
					}
				}
			});
		};

		//移動範囲の計算
		Game_CharacterBase.prototype.makeMoveTable = function(x, y, move, route, actor) {
			var _this = this;
			function isPassableTile(currentX, currentY, x, y, actor){
				if(ENGINE_SETTINGS.USE_TILE_PASSAGE && !$statCalc.isFlying(actor)){
					var direction = 0;			
					if(currentX == x){
						if(currentY > y){
							direction = 8; //up
						} else {
							direction = 2; //down
						}			
					} else {
						if(currentX > x){
							direction = 4; //left
						} else {
							direction = 6; //right
						}
					}				
					if(!_this.isMapPassable(currentX, currentY, direction)){
						return false;
					}
				}
				
				if($gameMap.regionId(x, y) == 0){
					return false;
				}
				if($gameTemp._MoveTable[x] == undefined){
					return false;
				}
				if($gameTemp._MoveTable[x][y] == undefined){
					return false;
				}
				if($gameMap.regionId(x, y) % 8 == 1 && !$statCalc.isFlying(actor)){
					return false;
				}
				if($gameMap.regionId(x, y) % 8 == 2 && !$statCalc.canBeOnLand(actor) && !$statCalc.isFlying(actor)){
					return false;
				}
				if($gameMap.regionId(x, y) % 8 == 3 && !$statCalc.canBeOnWater(actor) && !$statCalc.isFlying(actor)){
					return false;
				}
				if($gameMap.regionId(x, y) % 8 == 4 && !$statCalc.canBeOnSpace(actor)){
					return false;
				}
				return $statCalc.isFreeSpace({x: x, y: y}, actor.isActor() ? "enemy" : "actor");
			}
			
			var currentRegion = $gameMap.regionId(x, y) % 8; //1 air, 2 land, 3 water, 4 space
			var moveCost = 1;
			if(route.length > 1){//no movecost for the start tile
				var taggedCost = $gameMap.SRPGTerrainTag(x, y);
				if(taggedCost > 1){
					if(currentRegion == 4 || !$statCalc.isFlying(actor)){
						moveCost = taggedCost;
					}					
					
				}
			}		

			if(currentRegion == 3 && !$statCalc.isFlying(actor)){
				if($statCalc.canBeOnWater(actor, "water") < 2){
					moveCost*=2;
				}
			} 		
			
			if (move <= 0) {
				return;
			}
			//上方向を探索
			if (route[route.length - 1] != 2) {
				if (isPassableTile(x, y, x, y-1, actor)) {
					if ($gameTemp.MoveTable(x, $gameMap.roundY(y - 1))[0] < move - moveCost) {
						if ($gameTemp.MoveTable(x, $gameMap.roundY(y - 1))[0] < 0) {
							$gameTemp.pushMoveList([x, $gameMap.roundY(y - 1), false]);
						}
						$gameTemp.setMoveTable(x, $gameMap.roundY(y - 1), move - moveCost, route.concat(8));
						this.makeMoveTable(x, $gameMap.roundY(y - 1), move - moveCost, route.concat(8), actor);
					}
				} else if ($gameTemp.isSrpgBestSearchFlag() == true) {
					this.isSrpgCollidedWithOpponentsUnit(x, y, 8, route);
				}
			}
			//右方向を探索
			if (route[route.length - 1] != 4) {
				if (isPassableTile(x, y, x+1, y, actor)) {
					if ($gameTemp.MoveTable($gameMap.roundX(x + 1), y)[0] < move - moveCost) {
						if ($gameTemp.MoveTable($gameMap.roundX(x + 1), y)[0] < 0) {
							$gameTemp.pushMoveList([$gameMap.roundX(x + 1), y, false]);
						}
						$gameTemp.setMoveTable($gameMap.roundX(x + 1), y, move - moveCost, route.concat(6));
						this.makeMoveTable($gameMap.roundX(x + 1), y, move - moveCost, route.concat(6), actor);
					}
				} else if ($gameTemp.isSrpgBestSearchFlag() == true) {
					this.isSrpgCollidedWithOpponentsUnit(x, y, 6, route);
				}
			}
			//左方向を探索
			if (route[route.length - 1] != 6) {
				if (isPassableTile(x, y, x-1, y, actor)) {
					if ($gameTemp.MoveTable($gameMap.roundX(x - 1), y)[0] < move - moveCost) {
						if ($gameTemp.MoveTable($gameMap.roundX(x - 1), y)[0] < 0) {
							$gameTemp.pushMoveList([$gameMap.roundX(x - 1), y, false]);
						}
						$gameTemp.setMoveTable($gameMap.roundX(x - 1), y, move - moveCost, route.concat(4));
						this.makeMoveTable($gameMap.roundX(x - 1), y, move - moveCost, route.concat(4), actor);
					}
				} else if ($gameTemp.isSrpgBestSearchFlag() == true) {
					this.isSrpgCollidedWithOpponentsUnit(x, y, 4, route);
				}
			}
			//下方向を探索
			if (route[route.length - 1] != 8) {
				if (isPassableTile(x, y, x, y+1, actor)) {
					if ($gameTemp.MoveTable(x, $gameMap.roundY(y + 1))[0] < move - moveCost) {
						if ($gameTemp.MoveTable(x, $gameMap.roundY(y + 1))[0] < 0) {
							$gameTemp.pushMoveList([x, $gameMap.roundY(y + 1), false]);
						}
						$gameTemp.setMoveTable(x, $gameMap.roundY(y + 1), move - moveCost, route.concat(2));
						this.makeMoveTable(x, $gameMap.roundY(y + 1), move - moveCost, route.concat(2), actor);
					}
				} else if ($gameTemp.isSrpgBestSearchFlag() == true) {
					this.isSrpgCollidedWithOpponentsUnit(x, y, 2, route);
				}
			}
		};

		//通行可能かを判定する（攻撃射程演算用）
		Game_CharacterBase.prototype.srpgRangeCanPass = function(x, y, d) {
			var x2 = $gameMap.roundXWithDirection(x, d);
			var y2 = $gameMap.roundYWithDirection(y, d);
			if (!$gameMap.isValid(x2, y2)) {
				return false;
			}
			if ($gameMap.terrainTag(x2, y2) == 7) {
				return false;
			}
			return true;
		};
		
		//特殊射程の処理
		Game_CharacterBase.prototype.srpgRangeExtention = function(x, y, oriX, oriY, skill, range) {
			switch (skill && skill.meta.specialRange) {
			case 'king': 
				if ((Math.abs(x - oriX) <= range / 2) && (Math.abs(y - oriY) <= range / 2)) {
					return true;
				} else {
					return false;
				}
			case 'queen': 
				if ((x == oriX || y == oriY) || (Math.abs(x - oriX) == Math.abs(y - oriY))) {
					return true;
				} else {
					return false;
				}
			case 'luke': 
				if (x == oriX || y == oriY) {
					return true;
				} else {
					return false;
				}
			case 'bishop': 
				if (Math.abs(x - oriX) == Math.abs(y - oriY)) {
					return true;
				} else {
					return false;
				}
			case 'knight': 
				if (!((x == oriX || y == oriY) || (Math.abs(x - oriX) == Math.abs(y - oriY)))) {
					return true;
				} else {
					return false;
				}
			default:
				return true;
			}
		};

		//攻撃射程の計算
		Game_CharacterBase.prototype.makeRangeTable = function(x, y, range, route, oriX, oriY, skill) {
			if (range <= 0) {
				return;
			}
			//上方向を探索
			if (route[route.length - 1] != 2) {
				if (this.srpgRangeCanPass(x, y, 8)) {
					//if ($gameTemp.RangeTable(x, $gameMap.roundY(y - 1))[0] < range - 1) {
						if (this.srpgRangeExtention(x, $gameMap.roundY(y - 1), oriX, oriY, skill, range + route.length - 1) == true) {
							if ($gameTemp.MoveTable(x, $gameMap.roundY(y - 1))[0] < 0 && $gameTemp.RangeTable(x, $gameMap.roundY(y - 1))[0] < 0) {
								$gameTemp.pushRangeList([x, $gameMap.roundY(y - 1), true]);
							}
							$gameTemp.setRangeTable(x, $gameMap.roundY(y - 1), range - 1, route.concat(8));
						}
						this.makeRangeTable(x, $gameMap.roundY(y - 1), range - 1, route.concat(8), oriX, oriY, skill);
					//}
				}
			}
			//右方向を探索
			if (route[route.length - 1] != 4) {
				if (this.srpgRangeCanPass(x, y, 6)) {
					//if ($gameTemp.RangeTable($gameMap.roundX(x + 1), y)[0] < range - 1) {
						if (this.srpgRangeExtention($gameMap.roundX(x + 1), y, oriX, oriY, skill, range + route.length - 1) == true) {
							if ($gameTemp.MoveTable($gameMap.roundX(x + 1), y)[0] < 0 && $gameTemp.RangeTable($gameMap.roundX(x + 1), y)[0] < 0) {
								$gameTemp.pushRangeList([$gameMap.roundX(x + 1), y, true]);
							}
							$gameTemp.setRangeTable($gameMap.roundX(x + 1), y, range - 1, route.concat(6));
						}
						this.makeRangeTable($gameMap.roundX(x + 1), y, range - 1, route.concat(6), oriX, oriY, skill);
					//}
				}
			}
			//左方向を探索
			if (route[route.length - 1] != 6) {
				if (this.srpgRangeCanPass(x, y, 4)) {
					//if ($gameTemp.RangeTable($gameMap.roundX(x - 1), y)[0] < range - 1) {
						if (this.srpgRangeExtention($gameMap.roundX(x - 1), y, oriX, oriY, skill, range + route.length - 1) == true) {
							if ($gameTemp.MoveTable($gameMap.roundX(x - 1), y)[0] < 0 && $gameTemp.RangeTable($gameMap.roundX(x - 1), y)[0] < 0) {
								$gameTemp.pushRangeList([$gameMap.roundX(x - 1), y, true]);
							}
							$gameTemp.setRangeTable($gameMap.roundX(x - 1), y, range - 1, route.concat(4));
						}
						this.makeRangeTable($gameMap.roundX(x - 1), y, range - 1, route.concat(4), oriX, oriY, skill);
					//}
				}
			}
			//下方向を探索
			if (route[route.length - 1] != 8) {
				if (this.srpgRangeCanPass(x, y, 2)) {
					//if ($gameTemp.RangeTable(x, $gameMap.roundY(y + 1))[0] < range - 1) {
						if (this.srpgRangeExtention(x, $gameMap.roundY(y + 1), oriX, oriY, skill, range + route.length - 1) == true) {
							if ($gameTemp.MoveTable(x, $gameMap.roundY(y + 1))[0] < 0 && $gameTemp.RangeTable(x, $gameMap.roundY(y + 1))[0] < 0) {
								$gameTemp.pushRangeList([x, $gameMap.roundY(y + 1), true]);
							}
							$gameTemp.setRangeTable(x, $gameMap.roundY(y + 1), range - 1, route.concat(2));
						}
						this.makeRangeTable(x, $gameMap.roundY(y + 1), range - 1, route.concat(2), oriX, oriY, skill);
					//}
				}
			}
		};

		//移動可能かを判定する（イベント出現時用）
		Game_CharacterBase.prototype.srpgAppearCanPass = function(x, y, d) {
			var x2 = $gameMap.roundXWithDirection(x, d);
			var y2 = $gameMap.roundYWithDirection(y, d);
			if (!$gameMap.isValid(x2, y2)) {
				return false;
			}
			if (!this.isMapPassable(x, y, d)) {
				return false;
			}
			return true;
		};

		//出現可能場所の計算
		Game_CharacterBase.prototype.makeAppearPoint = function(event, x, y) {
			var events = $gameMap.eventsXyNt(x, y);
			if (events.length == 0 || (events.length == 1 && events[0] == event)) {
				return [x,y];
			}
			//上方向を探索
			if (this.srpgAppearCanPass(x, y, 8)) {
				return this.makeAppearPoint(event, x, y - 1);
			}
			//右方向を探索
			if (this.srpgAppearCanPass(x, y, 6)) {
				return this.makeAppearPoint(event, x + 1, y);
			}
			//左方向を探索
			if (this.srpgAppearCanPass(x, y, 4)) {
				return this.makeAppearPoint(event, x - 1, y);
			}
			//下方向を探索
			if (this.srpgAppearCanPass(x, y, 2)) {
				return this.makeAppearPoint(event, x, y + 1);
			}
		};
		
		var Game_CharacterBase_update = Game_CharacterBase.prototype.update;
		Game_CharacterBase.prototype.update = function() {
			Game_CharacterBase_update.call(this);
			
		}
		
		var Game_CharacterBase_initialize = Game_CharacterBase.prototype.initialize;
		Game_CharacterBase.prototype.initialize = function() {
			Game_CharacterBase_initialize.call(this);
			this._floatOffset = 0;
			this._floatAmount = 10;
			this._floating = false;
		}
		
		var Game_CharacterBase_screenY = Game_CharacterBase.prototype.screenY;
		Game_CharacterBase.prototype.screenY = function() {
			var value = Game_CharacterBase_screenY.call(this);
			var battlerArray = $gameSystem.EventToUnit(this._eventId);
			if(battlerArray && $statCalc.isFlying(battlerArray[1])){
				if(!this._floating){
					this._floatOffset = 0;
					this._floating = true;
					this._floatTimer = this._floatAmount;
				}
				if(this._floatTimer > 0) {
					this._floatTimer--;
					this._floatOffset--;
				}						
			} else {
				if(this._floating){
					this._floatOffset = this._floatAmount * -1;
					this._floating = false;
					this._floatTimer = this._floatAmount;
				}
				if(this._floatTimer > 0) {
					this._floatTimer--;
					this._floatOffset++;
				}
			}	
			value+=this._floatOffset;
			return Math.round(value);
		};
		
		/*Extensions to character map animations*/
		
		Game_CharacterBase.prototype.requestAnimation = function(animationId, options) {
			this._animationId = animationId;
			this._animationOptions = options;
		};
		
		
		
		
	//====================================================================
	// ●Game_Player
	//====================================================================
		//プレイヤーの画像を変更する
		
		Game_Player.prototype.initialize = function() {
		Game_Character.prototype.initialize.call(this);
			this.setTransparent($dataSystem.optTransparent);
			this._topSpeed = ENGINE_SETTINGS.CURSOR_SPEED || 4;
			this._initialSpeed = this._topSpeed;
			this._moveSpeed = this._initialSpeed + 1;
			this._tileCounter = 0;
			this._speedResetCounter = 0;
			this._followSpeed = 0;
		};
		
		Game_Player.prototype.setMoveSpeed = function(moveSpeed) {
			this._moveSpeed = moveSpeed;
		};
		
		var _SRPG_Game_Player_refresh = Game_Player.prototype.refresh;
		Game_Player.prototype.refresh = function() {
			if ($gameSystem.isSRPGMode() == true) {
				var characterName = 'srpg_set';
				var characterIndex = 0;
				this.setImage(characterName, characterIndex);
				this._followers.refresh();
			} else {
				_SRPG_Game_Player_refresh.call(this);
			}
		};
		
		Game_Player.prototype.setFollowSpeed = function(speed) {
			this._moveSpeed = speed;
		}
		
		Game_Player.prototype.clearFollowSpeed = function() {
			this._moveSpeed = this._topSpeed + 1;
		}
		
		Game_Player.prototype.update = function(sceneActive) {		
			/*if(this._followSpeed){
				this._moveSpeed = this._followSpeed;
			}else if(Input.isPressed('shift')){
				this._moveSpeed = ENGINE_SETTINGS.CURSOR_MAX_SPEED || this._topSpeed;
			} else {
				if(this._tileCounter > 1){
					this._moveSpeed = this._topSpeed;
				} else {
					if(this._speedResetCounter <= 0){
						this._moveSpeed = this._initialSpeed;
					} else {
						this._speedResetCounter--;
					}				
				}			
			}*/
			if(!this._moveSpeed){ //support for old save files
				this._moveSpeed = ENGINE_SETTINGS.CURSOR_SPEED || 4;
			}	
			//console.log("move speed: "+this._moveSpeed);
			
			var lastScrolledX = this.scrolledX();
			var lastScrolledY = this.scrolledY();
			var wasMoving = this.isMoving();
			this.updateDashing();
			if (sceneActive) {
				this.moveByInput();
			}
			Game_Character.prototype.update.call(this);
			this.updateScroll(lastScrolledX, lastScrolledY);
			this.updateVehicle();
			if (!this.isMoving()) {
				this.updateNonmoving(wasMoving);
				if(!wasMoving){
					$gameTemp.clearDestination();
				}				
			}
			this._followers.update();
		};

		//プレイヤーの自動移動を設定する
		var _SRPG_Game_Player_moveByInput = Game_Player.prototype.moveByInput;
		Game_Player.prototype.moveByInput = function() {		
			if(!this.getInputDirection()){			
				if(this._tileCounter > 0){				
					this._speedResetCounter = 10;
				}
				this._tileCounter = 0;		
			} else if(!this.isMoving()){
				this._tileCounter++;
			}
			
			
			 if ($gameSystem.isSRPGMode() == true && $gameTemp.isAutoMoveDestinationValid() == true &&
				!this.isMoving()) {
				var x = $gameTemp.autoMoveDestinationX() - this.x;
				var y = $gameTemp.autoMoveDestinationY() - this.y;
				if ($gameMap.isLoopHorizontal() == true) {
		　　        var minDisX = Math.abs($gameTemp.autoMoveDestinationX() - this.x);
					var destX = $gameTemp.autoMoveDestinationX() > this.x ? $gameTemp.autoMoveDestinationX() - $gameMap.width() : $gameTemp.autoMoveDestinationX() + $gameMap.width();
					var disX = Math.abs(destX - this.x);
					x = minDisX < disX ? x : x * -1;
				}
				if ($gameMap.isLoopVertical() == true) {
			　　    var minDisY = Math.abs($gameTemp.autoMoveDestinationY() - this.y);
					var destY = $gameTemp.autoMoveDestinationY() > this.y ? $gameTemp.autoMoveDestinationY() - $gameMap.height() : $gameTemp.autoMoveDestinationY() + $gameMap.height();
					var disY = Math.abs(destY - this.y);
					y = minDisY < disY ? y : y * -1;
				}
				if (x < 0) {
					if (y < 0) {
						this.moveDiagonally(4, 8);
					} else if (y == 0) {
						this.moveStraight(4);
					} else if (y > 0) {
						this.moveDiagonally(4, 2);
					}
				} else if (x == 0) {
					if (y < 0) {
						this.moveStraight(8);
					} else if (y == 0) {
						$gameTemp.setAutoMoveDestinationValid(false);
						$gameTemp.setAutoMoveDestination(-1, -1);
					} else if (y > 0) {
						this.moveStraight(2);
					}
				} else if (x > 0) {
					if (y < 0) {
						this.moveDiagonally(6, 8);
					} else if (y == 0) {
						this.moveStraight(6);
					} else if (y > 0) {
						this.moveDiagonally(6, 2);
					}
				}
			} else {	
			//	mapRetargetLock
				if (!this.isMoving() && this.canMove()) {
					var direction = this.getInputDirection();
					var validDestination = true;
					if($gameTemp.mapRetargetLock && $gameTemp.currentMapTargetTiles && $gameTemp.currentMapTargetTiles.length){
						// up: 8 down: 2 left: 4 right: 6
						var x = this._realX;
						var y = this._realY;
						if(direction == 8){
							y--;
						} else if(direction == 2){
							y++;
						} else if(direction == 6){
							x++;
						} else if(direction == 4){
							x--;
						}
						
						validDestination = false;
						ctr = 0;
						while(!validDestination && ctr < $gameTemp.currentMapTargetTiles.length){
							var coords = $gameTemp.currentMapTargetTiles[ctr++];
							if(coords[0] == x && coords[1] == y){
								validDestination = true;
							}
						}					
					}
					if(validDestination){
						if (direction > 0) {
							$gameTemp.clearDestination();
						} else if ($gameTemp.isDestinationValid()){
							var x = $gameTemp.destinationX();
							var y = $gameTemp.destinationY();
							direction = this.findDirectionTo(x, y);
						}
						if (direction > 0) {
							this.executeMove(direction);
						}
					}				
				}			
			}      
		};
		
		Game_Player.prototype.updateEncounterCount = function() {
			
		};
		
	/* 戦闘中のイベント起動に関する処理
	 * 戦闘中、通常のイベント内容は起動しないようにする
	 * 戦闘中はユニットが選択されたと判断して、移動範囲演算とステータスの表示を行う(行動可能アクターなら行動する)。
	*/
		//戦闘中、ユニット上で決定キーが押された時の処理
		var _SRPG_Game_Player_startMapEvent = Game_Player.prototype.startMapEvent;
		Game_Player.prototype.startMapEvent = function(x, y, triggers, normal) {
			if ($gameSystem.isSRPGMode() == true) {
				if (!$gameMap.isEventRunning() && $gameSystem.isBattlePhase() === 'actor_phase') {
					if(!$SRWGameState.updateMapEvent(x, y, triggers)){
						return;
					}				
					
					if ($gameSystem.isSubBattlePhase() === 'normal') {
						
					} else if ($gameSystem.isSubBattlePhase() === 'twin_selection') {					
								
					} 
				}
			} else {
				_SRPG_Game_Player_startMapEvent.call(this, x, y, triggers, normal);
			}
		};

		//戦闘中、サブフェーズの状況に応じてプレイヤーの移動を制限する
		var _SRPG_Game_Player_canMove = Game_Player.prototype.canMove;
		Game_Player.prototype.canMove = function() {
			if ($gameSystem.isSRPGMode() == true) {
				/*if ($gameSystem.srpgWaitMoving() == true ||
					$gameSystem.isSubBattlePhase() === 'status_window' ||
				 //   $gameSystem.isSubBattlePhase() === 'actor_command_window' ||
					$gameSystem.isSubBattlePhase() === 'post_move_command_window' ||				
					$gameSystem.isSubBattlePhase() === 'battle_window' ||
					$gameSystem.isBattlePhase() === 'auto_actor_phase' ||
					$gameSystem.isBattlePhase() === 'AI_phase' ||
					$gameSystem.isSubBattlePhase() === 'rewards_display' ||
					$gameSystem.isSubBattlePhase() === 'level_up_display' ||
					$gameSystem.isSubBattlePhase() === 'process_death_queue' ||
					$gameSystem.isSubBattlePhase() === 'process_death' || 
					$gameSystem.isSubBattlePhase() === 'pause_menu' || 				
					$gameSystem.isSubBattlePhase() === 'event_before_battle' || 			
					$gameSystem.isSubBattlePhase() === 'battle_basic' ||
					$gameSystem.isSubBattlePhase() === 'spirit_activation' ||
					$gameSystem.isSubBattlePhase() === 'after_battle' ||
					$gameSystem.isSubBattlePhase() === 'actor_map_target' ||
					$gameSystem.isSubBattlePhase() === 'map_attack_animation' ||
					$gameSystem.isSubBattlePhase() === 'process_map_attack_queue' ||
					$gameSystem.isSubBattlePhase() === 'map_spirit_animation' ||
					$gameSystem.isSubBattlePhase() === 'confirm_boarding' ||
					$gameSystem.isSubBattlePhase() === 'enemy_unit_summary' ||
					$gameSystem.isSubBattlePhase() === 'confirm_end_turn'	||
					$gameSystem.isSubBattlePhase() === 'enemy_targeting_display' ||
					$gameSystem.isSubBattlePhase() === 'enemy_attack' ||
					$gameSystem.isSubBattlePhase() === 'await_character_anim' ||
					$gameSystem.isSubBattlePhase() === 'process_destroy_transform_queue'
					
					
					
					){
					return false;
				}*/
				
				if(!$SRWGameState.canCursorMove()){
					return false;
				}
			}
			if($gameSystem.isSubBattlePhase() === 'rearrange_deploys'){
				return true;
			}
			return _SRPG_Game_Player_canMove.call(this);
		};

		//戦闘中、サブフェーズの状況に応じて決定キー・タッチの処理を変える
		var _SRPG_Game_Player_triggerAction = Game_Player.prototype.triggerAction;
		Game_Player.prototype.triggerAction = function() {
			if ($gameSystem.isSRPGMode() == true) {
				if(!$SRWGameState.updateTriggerAction(this)){
					return false;
				} else {
					return _SRPG_Game_Player_triggerAction.call(this);
				}
				
				//TODO remove these checks once all states are migrated
				/*if ($gameSystem.srpgWaitMoving() == true ||
					//$gameTemp.isAutoMoveDestinationValid() == true ||
					//$gameSystem.isSubBattlePhase() === 'actor_command_window' ||
					$gameSystem.isSubBattlePhase() === 'post_move_command_window' ||
					$gameSystem.isSubBattlePhase() === 'battle_window' ||
					$gameSystem.isBattlePhase() === 'auto_actor_phase' ||
					$gameSystem.isBattlePhase() === 'AI_phase' || 
					$gameSystem.isSubBattlePhase() === 'rewards_display' ||
					$gameSystem.isSubBattlePhase() === 'level_up_display' ||
					$gameSystem.isSubBattlePhase() === 'battle_basic' ||
					$gameSystem.isSubBattlePhase() === 'spirit_activation' ||
					$gameSystem.isSubBattlePhase() === 'after_battle' ) {
					return false;
				}  else {
					
				}	*/		
			} else {
				return _SRPG_Game_Player_triggerAction.call(this);
			}
		};

		//戦闘中、隣接するイベントへの起動判定は行わない
		var _SRPG_Game_Player_checkEventTriggerThere = Game_Player.prototype.checkEventTriggerThere;
		Game_Player.prototype.checkEventTriggerThere = function(triggers) {
			if ($gameSystem.isSRPGMode() == false) {
				_SRPG_Game_Player_checkEventTriggerThere.call(this, triggers);
			}
		};

		//戦闘中、接触による起動判定は行わない
		var _SRPG_Game_Player_checkEventTriggerTouch = Game_Player.prototype.checkEventTriggerTouch;
		Game_Player.prototype.checkEventTriggerTouch = function(x, y) {
			if ($gameSystem.isSRPGMode() == false) {
				_SRPG_Game_Player_checkEventTriggerTouch.call(this, x, y);
			}
		};

	//====================================================================
	// ●Game_Follower
	//====================================================================
		//戦闘中、フォロワーが表示されないようにする
		var _SRPG_Game_Follower_refresh = Game_Follower.prototype.refresh;
		Game_Follower.prototype.refresh = function() {
			if ($gameSystem.isSRPGMode() == true) {
				this.setImage('', 0);
			} else {
				_SRPG_Game_Follower_refresh.call(this);
			}
		};

	//====================================================================
	// ●Game_Event
	//====================================================================
		//初期化処理
		var _SRPG_Game_Event_initMembers = Game_Event.prototype.initMembers;
		Game_Event.prototype.initMembers = function() {
			_SRPG_Game_Event_initMembers.call(this);
			this._srpgForceRoute = [];
			this._srpgEventType = '';
		};

		//ゲームページを返す
		Game_Event.prototype.pageIndex = function() {
			return this._pageIndex;
		};

		//イベントかどうかを返す
		Game_Event.prototype.isEvent = function() {
			return true;
		};

		//消去済みかどうかを返す
		Game_Event.prototype.isErased = function() {
			return this._erased;
		};

		//消去済みフラグを消す
		Game_Event.prototype.appear = function() {
			this._erased = false;
			this.refresh();
		};

		//タイプを設定する
		Game_Event.prototype.setType = function(type) {
			this._srpgEventType = type;
		};

		//タイプを返す
		Game_Event.prototype.isType = function() {
			return this._srpgEventType;
		};

		// アクター・エネミーデータを元にイベントのグラフィックを変更する＋戦闘以外では元に戻す
		Game_Event.prototype.refreshImage = function() {
			if ($gameSystem.isSRPGMode() == true) {
				var battlerArray = $gameSystem.EventToUnit(this._eventId);
				if (!battlerArray || this.isErased()) {
					return ;
				}
				var type = battlerArray[0];
				var unit = battlerArray[1];
				if (type === 'actor') {
					var mechClass;

					if(unit.SRWStats && unit.SRWStats.mech){
						mechClass = unit.SRWStats.mech.id;
					} else {
						mechClass = unit._classId;
					}
					
					var overworldSpriteData = $dataClasses[mechClass].meta.srpgOverworld.split(",");
					characterName = overworldSpriteData[0];
					characterIndex = overworldSpriteData[1];
					this.setImage(characterName, characterIndex);
				} else if (type === 'enemy') {
					var characterName;
					var characterIndex;        
					var mechClass = unit._mechClass;
					if(mechClass){
						var overworldSpriteData = $dataClasses[mechClass].meta.srpgOverworld.split(",");
						characterName = overworldSpriteData[0];
						characterIndex = overworldSpriteData[1];
					} else {
						characterName = unit.enemy().meta.characterName;
						characterIndex = unit.enemy().meta.characterIndex;
						if (!characterName || !characterIndex) {
							characterName = 'monster.png';
							characterIndex = 0;
						}
					}
					this.setImage(characterName, characterIndex);
				} else if (type === 'null') {
					this.erase();
				}
			} else {
				if (this.isErased()) {
					this.appear();
				}
				var page = this.page();
				if(page){
					var image = page.image;
					if (image.tileId > 0) {
						this.setTileImage(image.tileId);
					} else {
						this.setImage(image.characterName, image.characterIndex);
					}
					this.setDirection(image.direction);
					this.setPattern(image.pattern);
				}
				
			}
		};
		
		Game_Event.prototype.srpgMoveToPoint = function(targetPosition, ignoreMoveTable, ignoreObstacles) {
			this._pendingMoveToPoint = true;
			this._targetPosition = targetPosition;
			
			var actor = $gameSystem.EventToUnit(this.eventId())[1];
			
			var list = $gameTemp.moveList();
			var moveListLookup = {};
			list.forEach(function(entry){
				if(!moveListLookup[entry[0]]){
					moveListLookup[entry[0]] = [];
				}
				moveListLookup[entry[0]][entry[1]] = true;
			});
			//construct grid representation for pathfinding
			var occupiedPositions = $statCalc.getOccupiedPositionsLookup(actor.isActor() ? "enemy" : "actor");
			var pathfindingGrid = [];
			var directionGrid = [];
			for(var i = 0; i < $gameMap.width(); i++){
				
				pathfindingGrid[i] = [];
				directionGrid[i] = [];
				for(var j = 0; j < $gameMap.height(); j++){
					
					var weight = 1 ;
					if(i >= 0 && j >= 0){
						if(!$statCalc.isFlying(actor)){
							weight+=$gameMap.SRPGTerrainTag(i, j);
						}
						if(ignoreObstacles){
							pathfindingGrid[i][j] = 1;
							directionGrid[i][j] = {
								top: true,
								bottom: true,
								left: true,
								right: true
							};
						} else {
							
							var isCenterPassable = !(occupiedPositions[i] && occupiedPositions[i][j]) 
								&& $statCalc.canStandOnTile(actor, {x: i, y: j})
								&& (ignoreMoveTable || (moveListLookup[i] && moveListLookup[i][j]));
							var isTopPassable;
							var isBottomPassable;
							var isLeftPassable;
							var isRightPassable;
							if(!isCenterPassable || $statCalc.isFlying(actor) || !ENGINE_SETTINGS.USE_TILE_PASSAGE){
								isTopPassable = isCenterPassable;
								isBottomPassable = isCenterPassable;
								isLeftPassable = isCenterPassable;
								isRightPassable = isCenterPassable;
							} else {
								isTopPassable = $gameMap.isPassable(i, j, 8);
								isBottomPassable = $gameMap.isPassable(i, j, 2);
								isLeftPassable = $gameMap.isPassable(i, j, 4);
								isRightPassable = $gameMap.isPassable(i, j, 6);
							}
							
					
							pathfindingGrid[i][j] = isCenterPassable ? weight : 0; 	
							directionGrid[i][j] = {
								top: isTopPassable,
								bottom: isBottomPassable,
								left: isLeftPassable,
								right: isRightPassable
							};
						}
					} else {
						pathfindingGrid[i][j] = 0;
						directionGrid[i][j] = {
							top: false,
							bottom: false,
							left: false,
							right: false
						};
					}
				}
			}
			var graph = new Graph(pathfindingGrid, directionGrid);
			
			var startCoords = {x: this.posX(), y: this.posY()};
			var startNode = graph.grid[startCoords.x][startCoords.y];
			var endCoords = {x: this._targetPosition.x, y: this._targetPosition.y};
			var endNode = graph.grid[endCoords.x][endCoords.y];

			
			var path = astar.search(graph, startNode, endNode);
			
			$gamePlayer.followedEvent = this;
			this._pathToCurrentTarget = path;	
		}
		//移動ルートを設定する
		Game_Event.prototype.srpgMoveRouteForce = function(array) {
			this._srpgForceRoute = [];
			for (var i = 1; i < array.length; i++) {
				this._srpgForceRoute.push(array[i]);
			}
			this._srpgForceRoute.push(0);
		};

		//設定されたルートに沿って移動する
		var _SRPG_Game_Event_updateStop = Game_Event.prototype.updateStop;
		Game_Event.prototype.updateStop = function() {
			var battlerArray = $gameSystem.EventToUnit(this._eventId);
			var isActor = false;
			if(battlerArray && battlerArray[1]){
				var isActor = battlerArray[1].isActor();
			}	
			var followMove = !isActor || $gameTemp.followMove;
			if(battlerArray && battlerArray[1]){
				var regionId = $gameMap.regionId(this._x, this._y);
				$statCalc.setCurrentTerrainFromRegionIndex(battlerArray[1], regionId);
				$gameMap.initSRWTileProperties();
				if($gameSystem.regionAttributes && $gameSystem.regionAttributes[regionId]){
					var def = $gameSystem.regionAttributes[regionId];
					$statCalc.setCurrentTerrainModsFromTilePropertyString(battlerArray[1], def.defense+","+def.evasion+","+def.hp_regen+","+def.en_regen+",");
				} else {
					$statCalc.setCurrentTerrainModsFromTilePropertyString(battlerArray[1], $gameMap.getTileProperties({x: this._x, y: this._y}));
				}			
			}		
			if ($gameSystem.isSRPGMode() == true && this._srpgForceRoute.length > 0) {
				if (!this.isMoving()) {
					var command = this._srpgForceRoute[0];
					this._srpgForceRoute.shift();
					if (command == 0) {
						this._srpgForceRoute = [];
						$gameSystem.setSrpgWaitMoving(false);
					} else {
						this.moveStraight(command);
					}
				}
			} else if(this._pendingMoveToPoint){
				if (!this.isMoving()) {
					Input.update();
					if(Input.isPressed("pagedown") || Input.isLongPressed("pagedown") || $gameSystem.optionSkipUnitMoving){					
						if(this._pathToCurrentTarget && this._pathToCurrentTarget.length){//avoid rare crash where this functional is called when the path has already been cleared
							var targetPosition = this._pathToCurrentTarget[this._pathToCurrentTarget.length-1];
							this._pathToCurrentTarget = [];
							this.locate(targetPosition.x, targetPosition.y);
							if(followMove){
								$gamePlayer.locate(targetPosition.x, targetPosition.y);
							}
							
						}		
						$gamePlayer.clearFollowSpeed();
						$gamePlayer.followedEvent = null;
						this._targetPosition = null;
						this._pathToCurrentTarget = null;
						this._pendingMoveToPoint = false;
						$gameTemp.followMove = false;
						$gameSystem.setSrpgWaitMoving(false);
						$statCalc.invalidateAbilityCache();		
					} else {				
						this.setMoveSpeed(6);
						if(followMove){
							$gamePlayer.setFollowSpeed(6);
						}
						var nextPosition = this._pathToCurrentTarget.shift();
						if(nextPosition && (this._x != nextPosition.x || this._y != nextPosition.y)) {
							var deltaX = nextPosition.x - this._x;				
							var deltaY = nextPosition.y - this._y;
							if(deltaX != 0){
								if(Math.sign(deltaX) == 1){
									this.moveStraight(6); //right
									if(followMove){
										$gamePlayer.moveStraight(6);
									}
								} else {
									this.moveStraight(4); //left
									if(followMove){
										$gamePlayer.moveStraight(4);
									}
								}
							}
							if(deltaY != 0){
								if(Math.sign(deltaY) == 1){
									this.moveStraight(2); //down
									if(followMove){
										$gamePlayer.moveStraight(2);
									}
								} else {
									this.moveStraight(8); //up
									if(followMove){
										$gamePlayer.moveStraight(8);
									}
								}
							}					
						} else {
							$gamePlayer.clearFollowSpeed();
							this._targetPosition = null;
							this._pathToCurrentTarget = null;
							this._pendingMoveToPoint = false;
							$gameTemp.followMove = false;
							$gamePlayer.followedEvent = null;
							$gameSystem.setSrpgWaitMoving(false);
							$statCalc.invalidateAbilityCache();
						}	
					}
				}
			} else {
				_SRPG_Game_Event_updateStop.call(this);
			}
		};
		
		Game_Event.prototype.event = function() {
			if(!$dataMap.events[this._eventId]){
				return JSON.parse('{"id":1,"name":"ACTOR_0","note":"<type:actor>","pages":[{"conditions":{"actorId":1,"actorValid":false,"itemId":1,"itemValid":false,"selfSwitchCh":"A","selfSwitchValid":false,"switch1Id":1,"switch1Valid":false,"switch2Id":1,"switch2Valid":false,"variableId":1,"variableValid":false,"variableValue":0},"directionFix":false,"image":{"tileId":0,"characterName":"","direction":2,"pattern":0,"characterIndex":0},"list":[{"code":0,"indent":0,"parameters":[]}],"moveFrequency":3,"moveRoute":{"list":[{"code":0,"parameters":[]}],"repeat":true,"skippable":false,"wait":false},"moveSpeed":3,"moveType":0,"priorityType":0,"stepAnime":false,"through":false,"trigger":0,"walkAnime":true}],"x":17,"y":7,"meta":{"type":"actor"}}');
			}
			return $dataMap.events[this._eventId];
		};


		Game_CharacterBase.prototype.characterIndex = function() {
			var filename = this.characterName();
			var index = this._characterIndex;
			if($gameSystem.characterIdexAliases && $gameSystem.characterIdexAliases[filename]){
				 index = $gameSystem.characterIdexAliases[filename];
			}
			return index;
		};
		
		Game_CharacterBase.prototype.moveStraight = function(d) {
			this.setMovementSuccess(this.canPass(this._x, this._y, d));
			if (this.isMovementSucceeded()) {
				this.setDirection(d);
				this._prevX = this._x;
				this._prevY = this._y;
				this._x = $gameMap.roundXWithDirection(this._x, d);
				this._y = $gameMap.roundYWithDirection(this._y, d);
				this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(d));
				this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(d));
				this.increaseSteps();
			} else {
				this.setDirection(d);
				this.checkEventTriggerTouchFront(d);
			}
		};
	}