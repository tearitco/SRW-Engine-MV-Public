	export default {
		patches: patches,
	} 
	
	function patches(){};
	
	patches.apply = function(){
		
	//====================================================================
	// ●Game_System
	//====================================================================
	//初期化処理
		var _SRPG_Game_System_initialize = Game_System.prototype.initialize;
		Game_System.prototype.initialize = function() {
			_SRPG_Game_System_initialize.call(this);
			this._SRPGMode = false;
			this._isBattlePhase = 'initialize';
			this._isSubBattlePhase = 'initialize';
			this._AutoUnitId = 0;
			this._EventToUnit = [];
			this._SrpgStatusWindowRefreshFlag = [false, null];
			this._SrpgBattleWindowRefreshFlag = [false, null, null];
			this._SrpgWaitMoving = false;
			this._SrpgActorCommandWindowRefreshFlag = [false, null];
			this._SrpgActorCommandStatusWindowRefreshFlag = [false, null];
			this._srpgAllActors = []; //SRPGモードに参加する全てのアクターの配列
			this._searchedItemList = [];
			this.initOptions();
		};
		
		Game_System.prototype.initOptions = function() {
			if(this.optionDisableGrid == null){
				this.optionDisableGrid = false;
			}
			if(this.showWillIndicator == null){
				this.showWillIndicator = false;
			}
			if(this.optionDefaultSupport == null){
				this.optionDefaultSupport = true;
			}
			if(this.optionSkipUnitMoving == null){
				this.optionSkipUnitMoving = false;
			}
			if(this.optionBattleBGM == null){
				this.optionBattleBGM = true;
			}
			if(this.optionAfterBattleBGM == null){
				this.optionAfterBattleBGM = true;
			}
		};

	//変数関係の処理
		//戦闘中かどうかのフラグを返す
		Game_System.prototype.isSRPGMode = function() {
			return this._SRPGMode;
		};

		//戦闘のフェーズを返す
		// initialize：初期化状態
		// actor_phase：アクター行動フェーズ
		// auto_actor_phase：アクター自動行動フェーズ
		// enemy_phase：エネミー行動フェーズ
		Game_System.prototype.isBattlePhase = function() {
			return this._isBattlePhase;
		};

		//戦闘のフェーズを変更する
		Game_System.prototype.setBattlePhase = function(phase) {
			this._isBattlePhase = phase;
		};

		//戦闘のサブフェーズを返す。各BattlePhase内で使用され、処理の進行を制御する。
		// initialize：初期化を行う状態
		// normal：行動アクターが選択されていない状態
		// actor_move：移動範囲が表示され、移動先を選択している状態
		// actor_target：行動対象を選択している状態
		// status_window：ステータスウィンドウが開かれている状態
		// actor_command_window：アクターコマンドウィンドウが開かれている状態
		// battle_window：攻撃確認ウィンドウが開かれている状態
		// auto_actor_command：自動行動アクターをイベント順に行動決定する状態
		// auto_actor_move : 自動行動アクターが移動先を決定し、移動する状態
		// auto_actor_action：自動行動アクターの実際の行動を行う状態
		// enemy_command：エネミーをイベント順に行動決定する状態
		// enemy_move : エネミーが移動先を決定し、移動する状態
		// enemy_action：エネミーの実際の行動を行う状態
		// invoke_action：戦闘を実行している状態
		// after_battle：戦闘終了後の処理を呼び出す状態
		Game_System.prototype.isSubBattlePhase = function() {
			return this._isSubBattlePhase;
		};

		//戦闘のサブフェーズを変更する
		Game_System.prototype.setSubBattlePhase = function(phase) {
			$SRWGameState.requestNewState(phase);
			this._isSubBattlePhase = phase;
		};

		//自動行動・エネミーの実行ＩＤを返す
		Game_System.prototype.isAutoUnitId = function() {
			return this._AutoUnitId;
		};

		//自動行動・エネミーの実行ＩＤを設定する
		Game_System.prototype.setAutoUnitId = function(num) {
			this._AutoUnitId = num;
		};

		// ステータスウィンドウのリフレッシュフラグを返す
		Game_System.prototype.srpgStatusWindowNeedRefresh = function() {
			return this._SrpgStatusWindowRefreshFlag;
		};

		// ステータスウィンドウのリフレッシュフラグを設定する
		Game_System.prototype.setSrpgStatusWindowNeedRefresh = function(battlerArray) {
			this._SrpgStatusWindowRefreshFlag = [true, battlerArray];
		};

		// ステータスウィンドウのリフレッシュフラグをクリアする
		Game_System.prototype.clearSrpgStatusWindowNeedRefresh = function() {
			this._SrpgStatusWindowRefreshFlag = [false, null];
		};

		// 予想ウィンドウ・戦闘開始ウィンドウのリフレッシュフラグを返す
		Game_System.prototype.srpgBattleWindowNeedRefresh = function() {
			return this._SrpgBattleWindowRefreshFlag;
		};

		// 予想ウィンドウ・戦闘開始ウィンドウのリフレッシュフラグを設定する
		Game_System.prototype.setSrpgBattleWindowNeedRefresh = function(actionBattlerArray, targetBattlerArray) {
			this._SrpgBattleWindowRefreshFlag = [true, actionBattlerArray, targetBattlerArray];
		};

		// 予想ウィンドウ・戦闘開始ウィンドウのリフレッシュフラグをクリアする
		Game_System.prototype.clearSrpgBattleWindowNeedRefresh = function() {
			this._SrpgBattleWindowRefreshFlag = [false, null, null];
		};

		//移動範囲を表示するスプライトの最大数
		Game_System.prototype.spriteMoveTileMax = function() {
			return Math.min($dataMap.width * $dataMap.height, 1000);
		};

		// 移動中のウェイトフラグを返す
		Game_System.prototype.srpgWaitMoving = function() {
			return this._SrpgWaitMoving;
		};

		// 移動中のウェイトフラグを設定する
		Game_System.prototype.setSrpgWaitMoving = function(flag) {
			this._SrpgWaitMoving = flag;
		};

		// アクターコマンドウィンドウのリフレッシュフラグを返す
		Game_System.prototype.srpgActorCommandWindowNeedRefresh = function() {
			return this._SrpgActorCommandWindowRefreshFlag;
		};

		// アクターコマンドウィンドウのリフレッシュフラグを設定する
		Game_System.prototype.setSrpgActorCommandWindowNeedRefresh = function(battlerArray) {
			this._SrpgActorCommandWindowRefreshFlag = [true, battlerArray];
		};

		// アクターコマンドウィンドウのリフレッシュフラグをクリアする
		Game_System.prototype.clearSrpgActorCommandWindowNeedRefresh = function() {
			this._SrpgActorCommandWindowRefreshFlag = [false, null];
		};

		// 行動中アクターの簡易ステータスウィンドウのリフレッシュフラグを返す
		Game_System.prototype.srpgActorCommandStatusWindowNeedRefresh = function() {
			return this._SrpgActorCommandStatusWindowRefreshFlag;
		};

		// 行動中アクターの簡易ステータスウィンドウのリフレッシュフラグを設定する
		Game_System.prototype.setSrpgActorCommandStatusWindowNeedRefresh = function(battlerArray) {
			this._SrpgActorCommandStatusWindowRefreshFlag = [true, battlerArray];
		};

		// 行動中アクターの簡易ステータスウィンドウのリフレッシュフラグをクリアする
		Game_System.prototype.clearSrpgActorCommandStatusWindowNeedRefresh = function() {
			this._SrpgActorCommandStatusWindowRefreshFlag = [false, null];
		};

		//戦闘に参加するアクターのリスト
		Game_System.prototype.srpgAllActors = function() {
			return this._srpgAllActors;
		};

		Game_System.prototype.clearSrpgAllActors = function() {
			this._srpgAllActors = [];
		};

		Game_System.prototype.pushSrpgAllActors = function(actor) {
			this._srpgAllActors.push(actor);
		};

		// 探査済み座標のリスト
		Game_System.prototype.pushSearchedItemList = function(xy) {
			if (!this._searchedItemList) {
				this._searchedItemList = [];
			}
			this._searchedItemList.push(xy);
		};

		Game_System.prototype.indexOfSearchedItemList = function(xy) {
			if (!this._searchedItemList) {
				this._searchedItemList = [];
			}
			var flag = -1;
			for (var i=0; i < this._searchedItemList.length; i++) {
				var xy2 = this._searchedItemList[i];
				if (xy[0] === xy2[0] && xy[1] === xy2[1]) {
					flag = i;
					break;
				}
			};
			return flag;
		};

		Game_System.prototype.resetSearchedItemList = function() {
			this._searchedItemList = [];
		};

	//戦闘開始に関係する処理
		//戦闘開始するためのプラグイン・コマンド
		Game_System.prototype.startIntermission = function(){
			this._isIntermission = true;
			this._availableUnits = $gameParty.allMembers();
			this.dummyId = 0;
			this._availableUnits.forEach(function(actor){
				actor.isSubPilot = false;
				$statCalc.attachDummyEvent(actor, actor.SRWStats.mech.id);
				$statCalc.invalidateAbilityCache();
				$statCalc.initSRWStats(actor);			
			});
			
			this._availableMechs = [];
			var tmp = Object.keys($SRWSaveManager.getUnlockedUnits());			
			for(var i = 0; i < tmp.length; i++){
				var currentPilot = $statCalc.getCurrentPilot(tmp[i]);
				if(!currentPilot){
					var mechData = $statCalc.getMechData($dataClasses[tmp[i]], true);			
					
					var result = $statCalc.createEmptyActor();				
					result.SRWStats.mech = mechData;		
					$statCalc.attachDummyEvent(result, mechData.id);
																	
					this._availableMechs.push(result);
					$statCalc.invalidateAbilityCache();	
					$statCalc.calculateSRWMechStats(mechData, false, result);		
				}
			}	
			
			$statCalc.invalidateAbilityCache();
			$gameTemp.deployMode = "";
			
		}
		
		Game_System.prototype.isIntermission = function(id){
			return this._isIntermission;
		}
		
		Game_System.prototype.getAvailableUnits = function(id){
			return this._availableUnits;
		}
		
		//use $gameActors.actor instead!
		Game_System.prototype.getActorById = function(id){
			var result;
			var ctr = 0; 
			while(!result && ctr < this._availableUnits.length){
				if(this._availableUnits[ctr].actorId() == id){
					result = this._availableUnits[ctr];
				}
				ctr++;
			}
			return result;
		}
		
		Game_System.prototype.endIntermission = function(){
			$gameTemp.intermissionPending = false;
			this._isIntermission = false;
		}	
		
		Game_System.prototype.startSRPG = function() {
			this._SRPGMode = true;
			this.enableGrid = true;
			$gameTemp.listContext = "actor";
			$gameSwitches.setValue(_srpgBattleSwitchID, true);
			this._isBattlePhase = 'start_srpg';
			this._isSubBattlePhase = 'start_srpg';
			$gamePlayer.refresh();
			$gameTemp.clearActiveEvent();
			$gameTemp.actorAction = {};
			$gameTemp.enemyAction = {};
			this.clearData(); //データの初期化
			this.setAllEventType(); //イベントタイプの設定
			this._availableUnits = [];
			this.setSrpgActors(); //アクターデータの作成
			this.setSrpgEnemys(); //エネミーデータの作成
			
			$gameMap.setEventImages();   // ユニットデータに合わせてイベントのグラフィックを変更する
			this.runBattleStartEvent(); // ゲーム開始時の自動イベントを実行する
			this.runAfterDeployEvent();
			//clear stage temp variables
			for(var i = 21; i <= 60; i++){
				$gameVariables.setValue(i, 0);
			}
		
			$gameVariables.setValue(_turnVarID, 1); //ターン数を初期化する
			$gameSystem.resetSearchedItemList(); //探索済み座標を初期化する
			$gameSystem._specialTheme = -1;
			$gameSystem.highlightedTiles = [];
			$gameSystem.regionHighlights = {};
			$gameSystem.enemyUpgradeLevel = 0;
			$gameSystem.persuadeOptions = {};
			$gameTemp.currentSwapSource = -1;
			$gameTemp.enemyAppearQueue = [];
			$gameSystem.defaultBattleEnv = null;
			$gameSystem.skyBattleEnv = null;
			$gameSystem.regionBattleEnv = {};
			$gameSystem.regionSkyBattleEnv = {};
			$gameSystem.stageTextId = null;
			
			if($gameSystem.foregroundSpriteToggleState == null){
				$gameSystem.foregroundSpriteToggleState = 0;
			}
			//$gameSystem.showWillIndicator = false;
			$gameTemp.disappearQueue = [];

			$gameSystem.actorRankLookup = $statCalc.getActorRankLookup();
			$gameTemp.AIWaitTimer = 0;
			
			$gameVariables.setValue(_masteryConditionText, APPSTRINGS.GENERAL.label_default_mastery_condition);	
			$gameVariables.setValue(_victoryConditionText, APPSTRINGS.GENERAL.label_default_victory_condition);	
			$gameVariables.setValue(_defeatConditionText, APPSTRINGS.GENERAL.label_default_defeat_condition);
			
			$gameSystem.factionConfig = {
				0: {
					attacksPlayers:true,
					attacksFactions: [1,2],
					active: true
				},
				1: {
					attacksPlayers:false,
					attacksFactions: [0],
					active: false
				},
				2: {
					attacksPlayers:false,
					attacksFactions: [0],
					active: false
				}
			};
			$gameTemp.preventedDeathQuotes = {};
			$gameTemp.updatePlayerSpriteVisibility();
			
			SceneManager._scene.createPauseWindow(); //ensure pause menu is updated to reflect the new mode
		};
		
		
		
		Game_System.prototype.enableFaction = function(id) {
			if(this.factionConfig[id]){
				this.factionConfig[id].active = true;
			}		
		}
		
		Game_System.prototype.disableFaction = function(id) {
			if(this.factionConfig[id]){
				this.factionConfig[id].active = false;
			}		
		}
		
		Game_System.prototype.setFactionAggro = function(id, aggro) {
			if(this.factionConfig[id]){
				this.factionConfig[id].attacksFactions = [];
				for(var i = 0; i < aggro.length; i++){
					if(aggro[i] == "player"){
						this.factionConfig[id].attacksPlayers = true;
					} else {
						this.factionConfig[id].attacksFactions.push(aggro[i]);
					}
				}		
			}
		}		
		
		Game_System.prototype.clearFactionAggro = function(id) {
			if(this.factionConfig[id]){
				this.factionConfig[id].attacksFactions = [];
			}
		}
		
		Game_System.prototype.getPlayerFactionInfo = function() {
			 var aggressiveFactions = [];
			 if(this.factionConfig[0].attacksPlayers){
				 aggressiveFactions.push(0);
			 }
			 if(this.factionConfig[1].attacksPlayers){
				 aggressiveFactions.push(1);
			 }
			 if(this.factionConfig[2].attacksPlayers){
				 aggressiveFactions.push(2);
			 }
			 return {
				attacksPlayers:false,
				attacksFactions: aggressiveFactions,
				active: true 
			 };
		}
		
		Game_System.prototype.getFactionId = function(actor) {
			if(actor.isActor()){
				return "player";
			} else {
				return actor.factionId;
			}		
		}
		
		Game_System.prototype.getEnemyFactionInfo = function(enemy) {
			 return this.factionConfig[enemy.factionId];
		}
		
		Game_System.prototype.isFriendly = function(actor, factionId) {
			var factionInfo = this.getUnitFactionInfo(actor);
			if(factionId == "player"){
				return !factionInfo.attacksPlayers;
			} else {
				return factionInfo.attacksFactions.indexOf(factionId) == -1;
			}
		}	
		
		Game_System.prototype.getUnitFactionInfo = function(actor) {
			if(actor.isActor()){
				return this.getPlayerFactionInfo();
			} else {
				return this.getEnemyFactionInfo(actor);
			}
		}
		
		Game_System.prototype.isEnemy = function(actor) {
			if(!actor.isActor){
				return true;
			}
			if(actor.isActor()){
				return false;
			} else {
				return this.getEnemyFactionInfo(actor).attacksPlayers;
			}
		}
		
		Game_System.prototype.isEnemyPhase = function(actor) {
			return $gameSystem.factionConfig[$gameTemp.currentFaction].attacksPlayers;
		}

		//イベントＩＤに対応するアクター・エネミーデータを初期化する
		Game_System.prototype.clearData = function() {
			this._EventToUnit = [];
			$gameSystem.clearSrpgAllActors();
		};

		//イベントＩＤに対応するアクター・エネミーデータをセットする
		Game_System.prototype.setEventToUnit = function(event_id, type, data) {
			this._EventToUnit[event_id] = [type, data];
		};
		
		Game_System.prototype.clearEventToUnit = function(event_id) {
			delete this._EventToUnit[event_id];
		}

		//イベントＩＤから対応するアクター・エネミーデータを返す
		Game_System.prototype.EventToUnit = function(event_id) {
			//return this._EventToUnit[event_id];
			var battlerArray = this._EventToUnit[event_id];
			if (battlerArray) {
				if (battlerArray[0] === 'actor') {
					var actor = $gameActors.actor(battlerArray[1]);
					return [battlerArray[0], actor]
				} else {
					return battlerArray;
				}
			} else {
				return;
			}
		};

		//アクターＩＤから対応するイベントＩＤを返す
		Game_System.prototype.ActorToEvent = function(actor_id) {
			var eventId = 0;
			$gameMap.events().forEach(function(event) {
				if (event.isType() === 'actor' || event.isType() === 'ship' || event.isType() === 'ship_event') {
					var unit =  $gameSystem.EventToUnit(event.eventId());
					if(unit){
						var actor = unit[1];
						if (actor && actor.actorId() == actor_id) {
							eventId = event.eventId();
						}
					}              
				}
			});
			return eventId;
		};
		

		// イベントのメモからイベントのタイプを設定する
		Game_System.prototype.setAllEventType = function() {
			$gameMap.events().forEach(function(event) {
				if (event.event().meta.type) {
					event.setType(event.event().meta.type);
				}
			});
		}
		
		Game_System.prototype.getActorsWithAction = function(){
			var _this = this;		
			var result = [];
			$gameMap.events().forEach(function(event) {
				var battlerArray = _this.EventToUnit(event.eventId());
				if(!event.isErased() && battlerArray){
					var actor = battlerArray[1];
					if(actor.isActor() && !actor.srpgTurnEnd()){
						result.push(actor);
					}
				}
			});
			return result;
		}

		// イベントのメモからアクターを読み込み、対応するイベントＩＤに紐づけする
		Game_System.prototype.setSrpgActors = function() {
	  
			$gameVariables.setValue(_existActorVarID, 0);
			$gameVariables.setValue(_actorsDestroyed, 0);
			$gameVariables.setValue(_existShipVarId, 0);	

			this._availableUnits = $gameParty.allMembers();
			this._availableUnits.forEach(function(actor){
				$statCalc.initSRWStats(actor);
				actor.event = null;
			});
			
			$gameMap.events().forEach(function(event) {
				if (event.isType() === 'actor' || event.isType() === 'ship' || event.isType() === 'ship_event') {
					event.erase();
				}
			});
		};

		Game_System.prototype.deployShips = function(toAnimQueue) {		
			var _this = this;
			var deployInfo = _this.getDeployInfo();
			var deployList = _this.getActiveShipDeployList();			
			
			var shipCtr = 0;		
			$gameMap.events().forEach(function(event) { //ensure to spawn ships first so that are drawn below the other actor sprites
				if (event.isType() === 'ship' && !event.isDeployed) {
					var actor_unit;
					var entry = deployList[shipCtr] || {};
					var actorId = entry.main;					
					if(typeof actorId != "undefined"){
						actor_unit = $gameActors.actor(actorId);
					}
					if (actor_unit) {
						actor_unit.event = event;
						_this.pushSrpgAllActors(event.eventId());
						event.isDeployed = true;
						var bitmap = ImageManager.loadFace(actor_unit.faceName()); //顔グラフィックをプリロードする
						var oldValue = $gameVariables.value(_existShipVarId);
						$gameVariables.setValue(_existShipVarId, oldValue + 1);
						_this.setEventToUnit(event.eventId(), 'actor', actor_unit.actorId());
						$statCalc.initSRWStats(actor_unit);
						actor_unit.setSrpgTurnEnd(false);	
						
						if(toAnimQueue){				
							$gameTemp.enemyAppearQueue.push(event);
							event.erase();
						} else {
							event.appear();
							$gameMap.setEventImages();			
						}
					} else {
						event.erase();
					}
					shipCtr++;
				}
				
			});
		}
		
		Game_System.prototype.deployActor = function(actor_unit, event, toAnimQueue, subId) {
			var _this = this;
			actor_unit.event = event;
			_this.pushSrpgAllActors(event.eventId());
			event.isDeployed = true;
			var bitmap = ImageManager.loadFace(actor_unit.faceName()); //顔グラフィックをプリロードする
			var oldValue = $gameVariables.value(_existActorVarID);
			$gameVariables.setValue(_existActorVarID, oldValue + 1);
			_this.setEventToUnit(event.eventId(), 'actor', actor_unit.actorId());
			actor_unit.isSubPilot = false;
			
			$statCalc.initSRWStats(actor_unit);
			
			$statCalc.applyDeployActions(actor_unit.SRWStats.pilot.id, actor_unit.SRWStats.mech.id);
			
			$statCalc.applyBattleStartWill(actor_unit);
			actor_unit.SRPGActionTimesSet($statCalc.applyStatModsToValue(actor_unit, 1, ["extra_action"]));
			actor_unit.setSrpgTurnEnd(false);	
			actor_unit.setBattleMode("");

			var position = $statCalc.getAdjacentFreeSpace({x: event.posX(), y: event.posY()}, null, event.eventId());
			event.locate(position.x, position.y);
			
			if(!$gameTemp.enemyAppearQueue){
				$gameTemp.enemyAppearQueue = [];
			}	
			if(toAnimQueue){				
				$gameTemp.enemyAppearQueue.push(event);
				event.erase();
				event.isPendingDeploy = true;
			} else {
				event.appear();
				//event.refreshImage();
				$gameMap.setEventImages();			
			}
			
			/*var deployInfo = $gameSystem.getDeployInfo();
			var currentSlot = -1;
			var currentMaxSlot = -1;
			
			Object.keys(deployInfo.assigned).forEach(function(slot){
				if(slot > currentMaxSlot){
					currentMaxSlot = slot;
				}
				if(deployInfo.assigned[slot] == actor_unit.actorId()){
					currentSlot = slot;
				}
			});		
			if(currentSlot == -1){
				deployInfo.assigned[currentMaxSlot+1] = actor_unit.actorId();
			}
			$gameSystem.setDeployInfo(deployInfo);*/
			
			if(subId != null){
				actor_unit.subTwinId = subId;
			}
			
			$statCalc.invalidateAbilityCache();
			$statCalc.initSRWStats(actor_unit);
			$statCalc.updateFlightState(actor_unit);
		}
		
		Game_System.prototype.getEventDeploySlot = function(event) {
			var _this = this;
			if(!this.eventToDeploySlot){
				this.eventToDeploySlot = {};
				var i = 0;
				$gameMap.events().forEach(function(event) {
					if(event.isType() === 'actor') {
						_this.eventToDeploySlot[event.eventId()] = i++;
					}
				});
			}
			return this.eventToDeploySlot[event.eventId()];
		}
		
		Game_System.prototype.highlightDeployTiles = function() {
			var _this = this;
			if(!$gameSystem.highlightedTiles){
				$gameSystem.highlightedTiles = [];
			}
			this.removeDeployTileHighlights();
			$gameTemp.currentDeployTileHighlights = [];
			var deployInfo = _this.getDeployInfo();
			var i = 0;
			$gameMap.events().forEach(function(event) {
				if(event.isType() === 'actor') {
					if(i == $gameTemp.currentSwapSource){
						$gameSystem.highlightedTiles.push({x: event.posX(), y: event.posY(), color: "#00FF00"});
					} else if(deployInfo.lockedSlots[i]){
						$gameSystem.highlightedTiles.push({x: event.posX(), y: event.posY(), color: "yellow"});
					} else if(deployInfo.assigned[i] && !$statCalc.canStandOnTile($gameActors.actor(deployInfo.assigned[i]), {x: event.posX(), y: event.posY()})){
						$gameSystem.highlightedTiles.push({x: event.posX(), y: event.posY(), color: "red"});
					} else {
						$gameSystem.highlightedTiles.push({x: event.posX(), y: event.posY(), color: "white"});
					}
					$gameTemp.currentDeployTileHighlights.push({x: event.posX(), y: event.posY()});
					i++;
				}
			});
			
			$gameSystem.highlightsRefreshed = true;
		}	
		
		Game_System.prototype.removeDeployTileHighlights = function() {
			var _this = this;
			if($gameTemp.currentDeployTileHighlights && $gameSystem.highlightedTiles){
				var tileLookup = {};
				$gameTemp.currentDeployTileHighlights.forEach(function(coords){
					if(!tileLookup[coords.x]){
						tileLookup[coords.x] = {};
					}
					tileLookup[coords.x][coords.y] = true;
				});
							
				var tmp = [];
				for(var i = 0; i < $gameSystem.highlightedTiles.length; i++){
					if(!tileLookup[$gameSystem.highlightedTiles[i].x] || !tileLookup[$gameSystem.highlightedTiles[i].x][$gameSystem.highlightedTiles[i].y]){
						tmp.push($gameSystem.highlightedTiles);
					}
				}
				$gameSystem.highlightedTiles = tmp;
				$gameSystem.highlightsRefreshed = true;
			}
		}
		
		Game_System.prototype.undeployActors = function(){
			$gameVariables.setValue(_existActorVarID, 0);
			$gameSystem.clearSrpgAllActors();
			$gameMap.events().forEach(function(event) {			
				if (event.isType() === 'actor') {
					$gameSystem.clearEventToUnit(event.eventId());
					event.isDeployed = false;
					event.erase();
				}
			});
		}
		
		Game_System.prototype.redeployActors = function(validatePositions){                                                                                                                                                                                                                             
			$gameVariables.setValue(_existActorVarID, 0);
			$gameSystem.clearSrpgAllActors();
			$gameMap.events().forEach(function(event) {
				if (event.isType() === 'actor') {
					$gameSystem.clearEventToUnit(event.eventId());
					event.isDeployed = false;
				}
			 });
			 this.deployActors(false, $gameTemp.manualDeployType, validatePositions);
		}
		
		Game_System.prototype.redeployActor = function(actorId, toAnimQueue){  
			var actor = $gameActors.actor(actorId);		
			$gameMap.events().forEach(function(event) {
				if (event.eventId() === actor.event.eventId()) {
					$gameSystem.clearEventToUnit(event.eventId());
					event.isDeployed = false;
					var oldValue = $gameVariables.value(_existActorVarID);
					$gameVariables.setValue(_existActorVarID, oldValue - 1);
				}
			});
			this.deployActor(actor, actor.event, toAnimQueue);
			actor.initImages(actor.SRWStats.mech.classData.meta.srpgOverworld.split(","));
			if(!toAnimQueue){
				actor.event.refreshImage();
			}		 
		}
		
		Game_System.prototype.deployActors = function(toAnimQueue, lockedOnly, validatePositions) {
			var _this = this;
			if(lockedOnly == null){
				lockedOnly = "all";
			}
			var deployInfo = _this.getDeployInfo();
			var deployList = _this.getActiveDeployList();
			var i = 0;
			$gameMap.events().forEach(function(event) {
				if (event.isType() === 'actor' && !event.isDeployed) {
					var actor_unit;
					var entry = deployList[i] || {};
					var actorId =entry.main;		
					if(lockedOnly == "all" || (lockedOnly == "locked" && deployInfo.lockedSlots[i]) || (lockedOnly == "unlocked" && !deployInfo.lockedSlots[i])){
						if(typeof actorId != "undefined"){
							actor_unit = $gameActors.actor(actorId);
						}				
						if (actor_unit) {
							var validPosition;
							if(validatePositions && !deployInfo.lockedSlots[i]){
								validPosition = $statCalc.canStandOnTile(actor_unit, {x: event.posX(), y: event.posY()})
							} else {
								validPosition = true;
							}
							if(validPosition){
								_this.deployActor(actor_unit, event, toAnimQueue, entry.sub);
							} else {
								event.erase();
							}						
						} else {
							event.erase();
						}
					}	
					
					i++;	
				}		
			});
		}
		
		// イベントのメモからエネミーを読み込み、対応するイベントＩＤに紐づけする
		Game_System.prototype.setSrpgEnemys = function() {
			$gameVariables.setValue(_existEnemyVarID, 0);
			$gameVariables.setValue(_enemiesDestroyed, 0);
			var i = 0;
			$gameMap.events().forEach(function(event) {
				if (event.isType() === 'enemy') {
					var enemyId = event.event().meta.id ? Number(event.event().meta.id) : 1;
					var enemy_unit = new Game_Enemy(enemyId, 0, 0);				
					enemy_unit._mechClass = parseInt(event.event().meta.mechClass)
					
					if (enemy_unit) {
						enemy_unit.event = event;
						if (event.event().meta.mode) {
							enemy_unit.setBattleMode(event.event().meta.mode);
							if (event.event().meta.targetId) {
								enemy_unit.setTargetId(event.event().meta.targetId);
							}
						}
						enemy_unit.initTp(); //TPを初期化
						var faceName = enemy_unit.enemy().meta.faceName; //顔グラフィックをプリロードする
						if (faceName) {
							var bitmap = ImageManager.loadFace(faceName);
						} else {
							if ($gameSystem.isSideView()) {
								var bitmap = ImageManager.loadSvEnemy(enemy_unit.battlerName(), enemy_unit.battlerHue());
							} else {
								var bitmap = ImageManager.loadEnemy(enemy_unit.battlerName(), enemy_unit.battlerHue());
							}
						}
						var oldValue = $gameVariables.value(_existEnemyVarID);
						$gameVariables.setValue(_existEnemyVarID, oldValue + 1);
						$gameSystem.setEventToUnit(event.eventId(), 'enemy', enemy_unit);
						$statCalc.initSRWStats(enemy_unit);
					}
				}
			});
		};

		//２イベント間の距離を返す
		Game_System.prototype.unitDistance = function(event1, event2) {
			var minDisX = Math.abs(event1.posX() - event2.posX());
			var minDisY = Math.abs(event1.posY() - event2.posY());
			if ($gameMap.isLoopHorizontal() == true) {
				var event1X = event1.posX() > event2.posX() ? event1.posX() - $gameMap.width() : event1.posX() + $gameMap.width();
				var disX = Math.abs(event1X - event2.posX());
				minDisX = minDisX < disX ? minDisX : disX;
			}
			if ($gameMap.isLoopVertical() == true) {
				var event1Y = event1.posY() > event2.posY() ? event1.posY() - $gameMap.height() : event1.posY() + $gameMap.height();
				var disY = Math.abs(event1Y - event2.posY());
				minDisY = minDisY < disY ? minDisY : disY;
			}
			return minDisX + minDisY;
		};

	//戦闘終了に関係する処理
		//戦闘終了するためのプラグイン・コマンド
		Game_System.prototype.endSRPG = function() {
			$gameTemp.clearActiveEvent();
			$gameMap.events().forEach(function(event) {
				var battlerArray = $gameSystem.EventToUnit(event.eventId());
				if (battlerArray && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
					if (_srpgBattleEndAllHeal == 'true') {
						battlerArray[1].recoverAll();
					}
					battlerArray[1].onTurnEnd();
				}
			});
			this._SRPGMode = false;
			$gameSwitches.setValue(_srpgBattleSwitchID, false);
			this._isBattlePhase = 'initialize';
			this._isSubBattlePhase = 'initialize';
			$gamePlayer.refresh();
			this.clearData(); //データの初期化
			$gameMap.setEventImages();   // ユニットデータに合わせてイベントのグラフィックを変更する
			
			$gameTemp.updatePlayerSpriteVisibility();
			SceneManager._scene.createPauseWindow(); //ensure pause menu is updated to reflect the new mode
		};

	//戦闘の進行に関係する処理
		// 戦闘開始時のイベントを起動する
		Game_System.prototype.runBattleStartEvent = function() {
			$gameMap.events().forEach(function(event) {
				if (event.isType() === 'battleStart') {
					if (event.pageIndex() >= 0) event.start();
					$gameTemp.pushSrpgEventList(event);
				}
			});
		};
		
		Game_System.prototype.runAfterDeployEvent = function() {
			$gameMap.events().forEach(function(event) {
				if (event.isType() === 'afterDeploy') {
					if (event.pageIndex() >= 0) event.start();
					$gameTemp.pushSrpgEventList(event);
				}
			});
		};

		//次のカーソル移動先のアクターを取得する(R)
		Game_System.prototype.getNextRActor = function() {
			var candidates =  $statCalc.getAllCandidates("actor");
			this.actorLRId++;
			if(this.actorLRId >= candidates.length){
				this.actorLRId = 0;
			}
			var candidate = candidates[this.actorLRId];
			if(candidate){
				$gamePlayer.locate(candidate.pos.x, candidate.pos.y);
			}  
		}

		//次のカーソル移動先のアクターを取得する(L)
		Game_System.prototype.getNextLActor = function() {       
			var candidates =  $statCalc.getAllCandidates("actor");
			this.actorLRId--;
			if(this.actorLRId < 0){
				this.actorLRId = candidates.length-1;
			}
			var candidate = candidates[this.actorLRId];
			if(candidate){
				$gamePlayer.locate(candidate.pos.x, candidate.pos.y);
			}        
		}
		
		Game_System.prototype.isValidAttackTarget = function(candidate){
			var actionBattlerArray = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId());
			var targetBattlerArray = $gameSystem.EventToUnit(candidate.event.eventId());
		   
			var isInRange = $battleCalc.isTargetInRange({x: $gameTemp.activeEvent()._x, y: $gameTemp.activeEvent()._y}, {x: candidate.event.posX(), y: candidate.event.posY()}, $statCalc.getRealWeaponRange(actionBattlerArray[1], $gameTemp.actorAction.attack), $gameTemp.actorAction.attack.minRange);
			var validTarget = $statCalc.canUseWeapon(actionBattlerArray[1], $gameTemp.actorAction.attack, false, targetBattlerArray[1]);
			
			return isInRange && validTarget;
		}                               
		
		Game_System.prototype.getNextRTarget = function() {
			var candidates =  $statCalc.getAllCandidates("enemy");
			var candidate;
			var ctr = 0;
			while(ctr < candidates.length && !candidate){
				this.targetLRId++;
				if(this.targetLRId >= candidates.length){
					this.targetLRId = 0;
				}
				if(this.isValidAttackTarget(candidates[this.targetLRId])){
					candidate = candidates[this.targetLRId];
				}			
				ctr++;
			}
			
			if(candidate){
				$gamePlayer.locate(candidate.pos.x, candidate.pos.y);
			}  
		}

		//次のカーソル移動先のアクターを取得する(L)
		Game_System.prototype.getNextLTarget = function() {       
			var candidates =  $statCalc.getAllCandidates("enemy");
			var candidate;
			var ctr = 0;
			while(ctr < candidates.length && !candidate){
				this.targetLRId--;
				if(this.targetLRId < 0){
					this.targetLRId = candidates.length-1;
				}
				if(this.isValidAttackTarget(candidates[this.targetLRId])){
					candidate = candidates[this.targetLRId];
				}			
				ctr++;
			}
			
			if(candidate){
				$gamePlayer.locate(candidate.pos.x, candidate.pos.y);
			}  		
		}

		//アクターターンの開始
		Game_System.prototype.srpgStartActorTurn = function() {
			var _this = this;
			$statCalc.invalidateAbilityCache();
			
			$gameTemp.currentFaction = -1;
			$songManager.playStageSong();
			this.aliveActorIdList = [];
			this.actorLRId = 0;
			this.targetLRId = 0;
			var spiritActivations = [];
			var AIActors = [];
			$gameMap.events().forEach(function(event) {
				if (event.isType() === 'actorTurn') {
					if (event.pageIndex() >= 0) event.start();
					$gameTemp.pushSrpgEventList(event);
				}
				var battlerArray = $gameSystem.EventToUnit(event.eventId());
				if (battlerArray && battlerArray[0] === 'actor' && battlerArray[1].isAlive() && !event.isErased()) {
					$gameSystem.aliveActorIdList.push(event.eventId());
					battlerArray[1].SRPGActionTimesSet($statCalc.applyStatModsToValue(battlerArray[1], 1, ["extra_action"]));
					var SPRegen = 0;
					SPRegen = $statCalc.applyStatModsToValue(battlerArray[1], SPRegen, ["SP_regen"]);
					if(ENGINE_SETTINGS.VXT_SP){
						SPRegen+=5;
					}
					if(ENGINE_SETTINGS.DEFAULT_SP_REGEN){
						SPRegen+=ENGINE_SETTINGS.DEFAULT_SP_REGEN;
					}
					if($gameVariables.value(_turnVarID) != 1){
						$statCalc.recoverSP(battlerArray[1], SPRegen);
					}
					
					var autoSpirits = $statCalc.getModDefinitions(battlerArray[1], ["auto_spirit"]);
					
					autoSpirits.forEach(function(autoSpirit){		
						$statCalc.setAbilityUsed(battlerArray[1], "auto_spirit_"+autoSpirit.stackId);
						spiritActivations.push({actor: battlerArray[1], spirit: autoSpirit.value});				
					});				
					
					if($statCalc.isAI(battlerArray[1])){
						AIActors.push(event);
					}
				}
				if (battlerArray && battlerArray[0] === 'enemy' && battlerArray[1].isAlive()) {
					battlerArray[1].SRPGActionTimesSet(1);
				}
				
			});
			$statCalc.clearSpiritOnAll("actor", "strike");
			$statCalc.clearSpiritOnAll("actor", "wall");
			$statCalc.clearSpiritOnAll("actor", "focus");
			$statCalc.clearSpiritOnAll("enemy", "disrupt");
			$statCalc.clearSpiritOnAll("enemy", "analyse");
			$statCalc.clearTempEffectOnAll("actor", "victory_turn");
			$statCalc.resetAllBattleTemp();
			$statCalc.resetAllStatus("enemy");
			if($gameVariables.value(_turnVarID) != 1){
				$statCalc.applyTurnStartWill("actor");
			}
			$statCalc.applyENRegen("actor");
			$statCalc.applyAmmoRegen("actor");
			$statCalc.applyHPRegen("actor");
			this.aliveActorIdList.sort(function(a, b) {
				return a - b;
			});
			var actor1 = $gameMap.event(this.aliveActorIdList[0]);
			if (actor1) {
				$gamePlayer.locate(actor1.posX(), actor1.posY());
			}
			$gameTemp.autoSpirits = spiritActivations;
			$gameTemp.autoSpiritsDelay = 150;
			
			_this.setBattlePhase('actor_phase');
			
			$gameTemp.AIActors = AIActors;
			if(spiritActivations.length){					
				_this.setSubBattlePhase('auto_spirits');
			} else if($gameTemp.AIActors.length){
				_this.setBattlePhase('AI_phase');
				_this.setSubBattlePhase('enemy_command');
			} else {			
				_this.setSubBattlePhase('initialize');
			}	
		};

		//自動行動アクターターンの開始
		Game_System.prototype.srpgStartAutoActorTurn = function() {
			this.setBattlePhase('auto_actor_phase');
			this.setSubBattlePhase('auto_actor_command');
		};

		//エネミーターンの開始
		Game_System.prototype.srpgStartEnemyTurn = function(factionId) {
			var _this = this;
			$statCalc.invalidateAbilityCache();
			
			
			$gameTemp.showAllyAttackIndicator = false;
			$gameTemp.showAllyDefendIndicator = false;
			$gameTemp.showEnemyAttackIndicator = false;
			$gameTemp.showEnemyDefendIndicator = false;
			$gameTemp.currentFaction = factionId;
			if(factionId > 2){
				$gameSystem.srpgTurnEnd();
				return;
			}
			
			if(!$gameSystem.factionConfig[factionId].active){
				$gameTemp.currentFaction++;
				this.srpgStartEnemyTurn($gameTemp.currentFaction);
				return;
			}		
			$songManager.playStageSong();
			var spiritActivations = [];
			$gameTemp.AIActors = [];
			$gameMap.events().forEach(function(event) {
				if (event.isType() === 'enemyTurn') {
					if (event.pageIndex() >= 0) event.start();
					$gameTemp.pushSrpgEventList(event);
				}
				var battlerArray = $gameSystem.EventToUnit(event.eventId());
				if (battlerArray && battlerArray[0] === 'enemy' && battlerArray[1].isAlive()) {
					battlerArray[1].SRPGActionTimesSet($statCalc.applyStatModsToValue(battlerArray[1], 1, ["extra_action"]));
					var SPRegen = 0;
					SPRegen = $statCalc.applyStatModsToValue(battlerArray[1], SPRegen, ["SP_regen"]);
					$statCalc.recoverSP(battlerArray[1], SPRegen);
					
					$gameTemp.AIActors.push(event);
					
					var autoSpirits = $statCalc.getModDefinitions(battlerArray[1], ["auto_spirit"]);
					
					autoSpirits.forEach(function(autoSpirit){	
						$statCalc.setAbilityUsed(actor, "auto_spirit_"+autoSpirit.stackId);
						spiritActivations.push({actor: battlerArray[1], spirit: autoSpirit.value});				
					});	
				}
			});
			
			$statCalc.clearSpiritOnAll("enemy", "strike", factionId);
			$statCalc.clearSpiritOnAll("enemy", "wall", factionId);
			$statCalc.clearSpiritOnAll("enemy", "focus", factionId);
			$statCalc.clearSpiritOnAll("actor", "disrupt");
			$statCalc.clearSpiritOnAll("actor", "analyse");
			$statCalc.applyTurnStartWill("enemy", factionId);
			$statCalc.applyENRegen("enemy", factionId);
			$statCalc.applyAmmoRegen("enemy", factionId);
			$statCalc.applyHPRegen("enemy", factionId);
			$statCalc.resetAllBattleTemp(null, factionId);
			$statCalc.resetAllStatus("actor");
			$gameTemp.AIWaitTimer = 0;
			
			$gameTemp.autoSpirits = spiritActivations;
			$gameTemp.autoSpiritsDelay = 150;
			
			if(spiritActivations.length){					
				_this.setSubBattlePhase('auto_spirits');
			} //else if($gameTemp.AIActors.length){
				_this.setBattlePhase('AI_phase');
				_this.setSubBattlePhase('enemy_command');
			//}
			
			//this.setSubBattlePhase('enemy_command');
		};

		//ターン終了
		Game_System.prototype.srpgTurnEnd = function() {
			$gameMap.events().forEach(function(event) {
				var battlerArray = $gameSystem.EventToUnit(event.eventId());
				if (battlerArray && (battlerArray[0] === 'actor' || battlerArray[0] === 'enemy')) {
					battlerArray[1].onTurnEnd();
				}
			});
			$gameMap.events().forEach(function(event) {
				if (event.isType() === 'turnEnd') {
					if (event.pageIndex() >= 0) event.start();
					$gameTemp.pushSrpgEventList(event);
				}
			});
			this.srpgTurnPlus();
			this.srpgStartActorTurn();//アクターターンを開始する
		};

		//ターン数を増やす
		Game_System.prototype.srpgTurnPlus = function() {
			var oldValue = $gameVariables.value(_turnVarID);
			$gameVariables.setValue(_turnVarID, oldValue + 1);
			
			var oldValue = $gameVariables.value(_turnCountVariable);
			$gameVariables.setValue(_turnCountVariable, oldValue + 1);
		};

	//戦闘の計算に関係する処理
		// 移動範囲および攻撃範囲を計算・表示する
		Game_System.prototype.srpgMakeMoveTable = function(event) {
			var battlerArray = $gameSystem.EventToUnit(event.eventId());
			
			var moveRange = $statCalc.getCurrentMoveRange(battlerArray[1]);
			$gameTemp.clearMoveTable();
			$gameTemp.initialMoveTable(event.posX(), event.posY(), battlerArray[1].srpgThroughTag());
			event.makeMoveTable(event.posX(), event.posY(), moveRange, [0], battlerArray[1]);
			var list = $gameTemp.moveList();
			
			$gameTemp.pushRangeListToMoveList();
		};

		//移動先にアクターまたはエネミーがいる場合は移動できない（重なりを避ける）
		Game_System.prototype.areTheyNoUnits = function(x, y, type) {
			var flag = true;
			$gameMap.eventsXy(x, y).forEach(function(event) {
				var battlerArray = $gameSystem.EventToUnit(event._eventId);
				if (battlerArray && event != $gameTemp.activeEvent() && !event.isErased() &&
					battlerArray[0] === type || event.isType() === 'playerEvent') {
					flag = false;
				}
			});
			return flag;
		};

		//移動先にイベントユニットがあるかどうか
		Game_System.prototype.isThereEventUnit = function(x, y) {
			var flag = false;
			$gameMap.eventsXy(x, y).forEach(function(event) {
				if (event.isType() === 'unitEvent') {
					flag = true;
				}
			});
			return flag;
		};
		
		Game_System.prototype.getTwinInfo = function() {
			if(!$gameSystem.twinInfo){
				$gameSystem.twinInfo = {};
			} 
			return $gameSystem.twinInfo;
		};
		
		Game_System.prototype.getIsTwinInfo = function() {
			if(!$gameSystem.isTwinInfo){
				$gameSystem.isTwinInfo = {};
			} 
			return $gameSystem.isTwinInfo;
		};
		
		Game_System.prototype.getPreferredSlotInfo = function() {
			if(!this.preferredSlotInfo){
				this.preferredSlotInfo = {};
			} 
			return this.preferredSlotInfo;
		};
		
		Game_System.prototype.getPreferredShipSlotInfo = function() {
			if(!this.preferredShipSlotInfo){
				this.preferredShipSlotInfo = {};
			} 
			return this.preferredShipSlotInfo;
		};
		
		Game_System.prototype.invalidateDeployList = function() {
			$gameSystem.deployList = null;
		}
		
		Game_System.prototype.getDeployList = function() {
			if(!$gameSystem.deployList){
				this.constructDeployList();
			}
			return $gameSystem.deployList;
		}
		
		Game_System.prototype.getShipDeployList = function() {
			if(!$gameSystem.shipDeployList){
				this.constructShipDeployList();
			}
			return $gameSystem.shipDeployList;
		}
		
		Game_System.prototype.getActiveDeployList = function() {
			return this._activeDeploylist;
		}
		
		Game_System.prototype.setActiveDeployList = function(list) {
			this._activeDeploylist = list;
		}
		
		Game_System.prototype.getActiveShipDeployList = function() {
			return this._activeShipDeploylist;
		}
		
		Game_System.prototype.setActiveShipDeployList = function(list) {
			this._activeShipDeploylist = list;
		}
		
		Game_System.prototype.constructDeployList = function(forShips) {
			$gameSystem.deployList = [];
			var deployInfo = this.getDeployInfo();
			var usedUnits = {};
			var slotLookup = {};
			
			var validActors = {};
			var candidates = $gameSystem.getAvailableUnits();	
			var tmp = [];
			candidates.forEach(function(candidate){
				if($statCalc.isValidForDeploy(candidate) && !$statCalc.isShip(candidate)){
					validActors[candidate.actorId()] = true;
					tmp.push(candidate);
				}
			});	
			candidates = tmp;
			
			var sortedCandidates = [];
			var usedActors = {};
			var preferredSlotInfo = this.getPreferredSlotInfo();
			Object.keys(preferredSlotInfo).forEach(function(slot){
				var info = preferredSlotInfo[slot];			
				var entry = {
					main: null,
					sub: null
				};
				isValid = false;
				if(info.main != -1 && validActors[info.main]){
					entry.main = info.main;
					isValid = true;
					usedActors[entry.main] = true;
				}
				if(info.sub != -1 && validActors[info.sub]){
					entry.sub = info.sub;
					isValid = true;
					usedActors[entry.sub] = true;
				}
				if(isValid){
					sortedCandidates.push(entry);
				}
			});
			
			tmp.forEach(function(candidate){
				if(!usedActors[candidate.actorId()]){
					sortedCandidates.push({
						main: candidate.actorId(),
						sub: null
					});
				}
			});	
					
			
			var i = 0;
			while(sortedCandidates.length){	
				var entry = {};
				if(i < deployInfo.count){				
					var isPredefined = false;
					if(deployInfo.assigned[i] && validActors[deployInfo.assigned[i]]){
						entry.main = deployInfo.assigned[i];
						isPredefined = true;
					}
					if(deployInfo.assignedSub[i] && validActors[deployInfo.assigned[i]]){
						entry.sub = deployInfo.assignedSub[i];
						isPredefined = true;
					}
					if(!isPredefined){
						entry = sortedCandidates.pop();
					} 				
				} else {
					entry = sortedCandidates.pop();
				}
				if(usedUnits[entry.main]){
					entry.main = null;
				}
				if(usedUnits[entry.sub]){
					entry.sub = null;
				}
				if(entry.main || entry.sub){
					$gameSystem.deployList.push(entry);							
					usedUnits[entry.main] = true;
					usedUnits[entry.sub] = true;
				}
				i++;
			}
		}
		
		Game_System.prototype.constructShipDeployList = function() {
			$gameSystem.shipDeployList = [];
			var deployInfo = this.getDeployInfo();
			var usedUnits = {};
			
			var validActors = {};
			var candidates = $gameSystem.getAvailableUnits();	
			var tmp = [];
			candidates.forEach(function(candidate){
				if($statCalc.isValidForDeploy(candidate) && $statCalc.isShip(candidate)){
					validActors[candidate.actorId()] = true;
					tmp.push(candidate);
				}
			});	
			candidates = tmp;
			
			var sortedCandidates = [];
			var usedActors = {};
			var preferredSlotInfo = this.getPreferredShipSlotInfo();
			Object.keys(preferredSlotInfo).forEach(function(slot){
				var info = preferredSlotInfo[slot];			
				var entry = {
					main: null,
					sub: null
				};
				isValid = false;
				if(info.main != -1 && validActors[info.main]){
					entry.main = info.main;
					isValid = true;
					usedActors[entry.main] = true;
				}
				if(isValid){
					sortedCandidates.push(entry);
				}
			});
			
			tmp.forEach(function(candidate){
				if(!usedActors[candidate.actorId()]){
					sortedCandidates.push({
						main: candidate.actorId(),
						sub: null
					});
				}
			});	
					
			
			var i = 0;
			while(sortedCandidates.length){	
				var entry = {};
				if(i < deployInfo.shipCount){				
					var isPredefined = false;
					if(deployInfo.assignedShips[i] && validActors[deployInfo.assignedShips[i]]){
						entry.main = deployInfo.assignedShips[i];
						isPredefined = true;
					}
					if(!isPredefined){
						entry = sortedCandidates.pop();
					} 				
				} else {
					entry = sortedCandidates.pop();
				}
				if(usedUnits[entry.main]){
					entry.main = null;
				}
				if(usedUnits[entry.sub]){
					entry.sub = null;
				}
				if(entry.main || entry.sub){
					$gameSystem.shipDeployList.push(entry);							
					usedUnits[entry.main] = true;
					usedUnits[entry.sub] = true;
				}
				i++;
			}
		}
		
		Game_System.prototype.syncPreferredSlots = function() {
			var deployInfo = this.getDeployList();
			this.preferredSlotInfo = {};
			for(var i = 0; i < deployInfo.length; i++){
				this.preferredSlotInfo[i] = deployInfo[i];
			}
		}
		
		Game_System.prototype.getDeployInfo = function() {
			var info = $gameVariables.value(_nextMapDeployVariable);
			if(!info){
				info = {
					count: 0,
					shipCount: 0,
					assigned: {},
					assignedSub: {},
					assignedShips: {},
					lockedSlots: {},		
					lockedShipSlots: {},	
					favorites: {}
				};
			} else {
				info = JSON.parse(info);
			}
			return info;
		};
		
		Game_System.prototype.setDeployInfo = function(info) {
			this.invalidateDeployList();
			$gameVariables.setValue(_nextMapDeployVariable, JSON.stringify(info));
		};
		
		Game_System.prototype.clearActorDeployInfo = function(actorId) {
			var deployInfo = this.getDeployInfo();
			Object.keys(deployInfo.assigned).forEach(function(slot){
				if(deployInfo.assigned[slot] == actorId){
					delete deployInfo.assigned[slot];
				}
			});
			this.setDeployInfo(deployInfo);
		};
		
		Game_System.prototype.getPersuadeOption = function(actor) {
			if(this.persuadeOptions && actor.isActor()){
				var lookup = this.persuadeOptions[actor.actorId()];
				if(lookup){
					var event = actor.event;
					var position = {x: event.posX(), y: event.posY()};
					var adjacentEvents = $statCalc.getAdjacentEvents(null, position);
					
					var option;
					var ctr = 0;
					while(!option && ctr < adjacentEvents.length){
						var eventId = adjacentEvents[ctr].eventId();
						if(lookup[eventId] != null){
							option = {eventId: eventId, controlVar: lookup[eventId]};
						}
						ctr++;
					}
					return option;
				}			
			} 
			return null;		
		};
		
		Game_System.prototype.getUnitSceneBgId = function(actor) {
			if($gameTemp.editMode){
				return $SRWEditor.getBattleEnvironmentId();
			} else {
				var event = $statCalc.getReferenceEvent(actor);
				var region = $gameMap.regionId(event.posX(), event.posY());
				if($statCalc.isFlying(actor)){
					if($gameSystem.regionSkyBattleEnv[region] != null){
						return $gameSystem.regionSkyBattleEnv[region];
					}
					
					if($gameSystem.skyBattleEnv){
						return $gameSystem.skyBattleEnv;
					} 
				} 
				if($gameSystem.regionBattleEnv[region] != null){
					return $gameSystem.regionBattleEnv[region];
				}
				return $gameSystem.defaultBattleEnv;						
			}
		};
		
		Game_System.prototype.validateAbilityLockInfo = function(actorId, abilityId) {
			if(!this.abilityLockInfo){
				this.abilityLockInfo = {
					actor: {},
					mech: {}
				}
			}
		}
		
		Game_System.prototype.setAbilityStatus = function(abilityInfo, id, abilityId, status) {
			//status: hidden, locked, ""
			if(!abilityInfo[id]){
				abilityInfo[id] = {};
			}
			abilityInfo[id][abilityId] = status;
		}
		
		Game_System.prototype.getAbilityStatus = function(abilityInfo, id, abilityId) {
			//status: hidden, locked, ""		
			var result = "";
			if(abilityInfo[id] && abilityInfo[id][abilityId]){
				result = abilityInfo[id][abilityId];
			}		
			return result;
		}
		
		Game_System.prototype.setPilotAbilityStatus = function(actorId, abilityId, status) {		
			this.validateAbilityLockInfo();
			this.setAbilityStatus(this.abilityLockInfo.actor, actorId, abilityId, status);
		}
		
		Game_System.prototype.getPilotAbilityStatus = function(actorId, abilityId) {	
			this.validateAbilityLockInfo();
			return this.getAbilityStatus(this.abilityLockInfo.actor, actorId, abilityId);
		}
		
		Game_System.prototype.isHiddenActorAbility = function(actor, abilityId) {
			var result = false;
			if(actor.isActor()){
				var status = this.getPilotAbilityStatus(actor.actorId(), abilityId);
				result = status == "hidden" || status == "locked";
			}		
			return result;
		}
		
		Game_System.prototype.isLockedActorAbility = function(actor, abilityId) {
			var result = false;
			if(actor.isActor()){
				var status = this.getPilotAbilityStatus(actor.actorId(), abilityId);
				result = status == "locked";
			}		
			return result;
		}
		
		Game_System.prototype.setMechAbilityStatus = function(mechId, abilityId, status) {		
			this.validateAbilityLockInfo();
			this.setAbilityStatus(this.abilityLockInfo.mech, mechId, abilityId, status);
		}
		
		Game_System.prototype.getMechAbilityStatus = function(mechId, abilityId) {	
			this.validateAbilityLockInfo();
			return this.getAbilityStatus(this.abilityLockInfo.mech, mechId, abilityId);
		}
		
		Game_System.prototype.isHiddenMechAbility = function(actor, abilityId) {
			var result = false;
			if(actor.SRWStats && actor.SRWStats.mech){
				var status = this.getMechAbilityStatus(actor.SRWStats.mech.id, abilityId);
				result = status == "hidden" || status == "locked";
			}		
			return result;
		}
		
		Game_System.prototype.isLockedMechAbility = function(actor, abilityId) {
			var result = false;
			if(actor.SRWStats && actor.SRWStats.mech){
				var status = this.getMechAbilityStatus(actor.SRWStats.mech.id, abilityId);
				result = status == "locked";
			}		
			return result;
		}
		
		Game_System.prototype.validateTransformationLockInfo = function() {
			if(!this.transformationLockInfo){
				this.transformationLockInfo = {}
			}
		}
		
		Game_System.prototype.isTransformationLocked = function(mechId, index) {
			this.validateTransformationLockInfo();
			if(this.transformationLockInfo[mechId]){
				return this.transformationLockInfo[mechId][index];
			} else {
				return false;
			}		
		}
		
		Game_System.prototype.lockTransformation = function(mechId, index) {
			this.validateTransformationLockInfo();
			if(!this.transformationLockInfo[mechId]){
				this.transformationLockInfo[mechId] = {};
			}
			this.transformationLockInfo[mechId][index] = true;
		}
		
		Game_System.prototype.lockAllTransformations = function() {
			this.validateTransformationLockInfo();
			for(var i = 1; i < $dataClasses.length; i++){
				var mechProperties = $dataClasses[i].meta;
				var transformsInto;
				transformsInto = mechProperties.mechTransformsInto * 1 || -1;	
				if(transformsInto == -1 && mechProperties.mechTransformsInto != null){
					try {
						transformsInto = JSON.parse(mechProperties.mechTransformsInto);
					} catch(e){
										
					}
				}
				
				if(transformsInto && transformsInto != -1){
					if(!Array.isArray(transformsInto)){
						transformsInto = [transformsInto];
					}			
				} else {
					transformsInto = [];
				}
				this.transformationLockInfo[i] = {};
				for(var j = 0; j < transformsInto.length; j++){				
					this.transformationLockInfo[i][j] = true;
				}			
			}	
		}
		
		Game_System.prototype.unlockTransformation = function(mechId, index) {
			this.validateTransformationLockInfo();
			if(this.transformationLockInfo[mechId]){
				this.transformationLockInfo[mechId][index] = false;
			}		
		}
		
		Game_System.prototype.unlockAllTransformations = function() {
			this.validateTransformationLockInfo();
			for(var i = 1; i < $dataClasses.length; i++){
				delete this.transformationLockInfo[i];
			}	
		}
		
		
		Game_System.prototype.validateAbilityUpgradesInfo = function(type) {
			if(!this.abilityUpgradesInfo){
				this.abilityUpgradesInfo = {}
			}
			if(!this.abilityUpgradesInfo[type]){
				this.abilityUpgradesInfo[type] = {};
			}
		}
		
		Game_System.prototype.setAbilityUpgrade = function(type, baseIdx, upgradeIdx) {
			this.validateAbilityUpgradesInfo(type);
			this.abilityUpgradesInfo[type][baseIdx] = upgradeIdx;
		}
		
		Game_System.prototype.getAbilityUpgrades = function(type) {
			this.validateAbilityUpgradesInfo(type);
			return this.abilityUpgradesInfo[type];
		}
	}