	export default {
		patches: patches,
	} 
	
	function patches(){};
	
	patches.apply = function(){
		//====================================================================
		// Save Management
		//====================================================================	

		DataManager.loadGameWithoutRescue = function(savefileId) {
			if (this.isThisGameFile(savefileId)) {
				var json = StorageManager.load(savefileId);
				this.createGameObjects();
				this.extractSaveContents(JsonEx.parse(json));
				this._lastAccessedId = savefileId;
				//$gameSystem.setSrpgActors();
				//$gameSystem.setSrpgEnemys();
				if($gameSystem.isIntermission()){
					$gameSystem.startIntermission();
				} else {
					$statCalc.softRefreshUnits();
				}			
				return true;
			} else {
				return false;
			}
		};

		DataManager.makeSavefileInfo = function() {
			var info = {};
			info.globalId   = this._globalId;
			info.title      = $gameSystem.saveDisplayName || $dataSystem.gameTitle;
			info.characters = $gameParty.charactersForSavefile();
			info.faces      = $gameParty.facesForSavefile();
			info.playtime   = $gameSystem.playtimeText();
			info.timestamp  = Date.now();
			info.funds = $gameParty.gold();
			info.SRCount = $SRWSaveManager.getSRCount();
			info.turnCount =  $gameVariables.value(_turnCountVariable)
			return info;
		};
		
		DataManager.saveContinueSlot = function() {
			var savefileId = "continue";
			$gameSystem.onBeforeSave();
			var json = JsonEx.stringify({date: Date.now(), content: this.makeSaveContents()});		
			StorageManager.save(savefileId, json);
			return true;
		};
		
		DataManager.loadContinueSlot = function() {
			try{
				var savefileId = "continue";
				var globalInfo = this.loadGlobalInfo();		
				var json = StorageManager.load(savefileId);
				this.createGameObjects();
				this.extractSaveContents(JsonEx.parse(json).content);
				$statCalc.softRefreshUnits();
				SceneManager._scene.fadeOutAll()
				SceneManager.goto(Scene_Map);
				if($gameSystem._bgmOnSave){
					$gameTemp.continueLoaded = true;
				}			
			} catch(e){
				console.log("Attempted to load non existant continue save!");
			}		
			return true;		
		};
		
		DataManager.latestSavefileDate = function() {
			var globalInfo = this.loadGlobalInfo();
			var savefileId = 1;
			var timestamp = 0;
			if (globalInfo) {
				for (var i = 1; i < globalInfo.length; i++) {
					if (this.isThisGameFile(i) && globalInfo[i].timestamp > timestamp) {
						timestamp = globalInfo[i].timestamp;
						savefileId = i;
					}
				}
			}
			return timestamp;
		};	
	}