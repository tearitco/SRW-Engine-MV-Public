function SRWBattleTextManager(){
	this.initDefinitions();
}


SRWBattleTextManager.prototype.initDefinitions = function(){
	var _this = this;
	_this._textBuilder = new BattleTextBuilder();
	_this._textBuilder.isLoaded().then(function(){
		_this._definitions = _this._textBuilder.getDefinitions().default;	
		_this._eventDefinitions = _this._textBuilder.getDefinitions().event;
	});			
}

SRWBattleTextManager.prototype.getTextBuilder = function(){
	return this._textBuilder;
}

SRWBattleTextManager.prototype.getText = function(target, id, type, subType, targetId, targetIdx, attackId){
	var _this = this;
	var definitions;
	/*if($gameTemp.scriptedBattleDemoId != null){
		if(target == "actor"){
			definitions = _this._eventDefinitions[$gameTemp.scriptedBattleDemoId].actors;
		}
		if(target == "enemy"){
			definitions = _this._eventDefinitions[$gameTemp.scriptedBattleDemoId].enemies;
		}
		if(definitions && definitions[id] && definitions[id][type] && !definitions[id][type][subType]){
			subType = "default";
		}
		if(definitions && definitions[id] && definitions[id][type] && definitions[id][type][subType]){
			var options = definitions[id][type][subType];
			var idx = Math.floor(Math.random() * (options.length));
			return options[idx];
		}
	}*/
	var text;
	if($gameTemp.scriptedBattleDemoId != null){
		var eventDefs = _this._eventDefinitions;
		var def;
		var ctr = 0;
		while(!def && ctr < eventDefs.length){
			if(eventDefs[ctr].refId == $gameTemp.scriptedBattleDemoId){
				def = eventDefs[ctr].data;
			}
			ctr++;
		}
		if(def){
			text = _this.getTextCandidate(def, target, id, type, subType, targetId, targetIdx, attackId);
		}		
	}
	if(!text){
		if($gameSystem.stageTextId != null){
			var eventDefs = _this._eventDefinitions;
			var def;
			var ctr = 0;
			while(!def && ctr < eventDefs.length){
				if(eventDefs[ctr].refId == $gameSystem.stageTextId){
					def = eventDefs[ctr].data;
				}
				ctr++;
			}
			if(def){
				text = _this.getTextCandidate(def, target, id, type, subType, targetId, targetIdx, attackId);
			}		
		}
	}
	if(!text){
		text = _this.getTextCandidate(_this._definitions, target, id, type, subType, targetId, targetIdx, attackId);
	}
	
	if(!text){
		text = "...";
	}
	return text;
}

SRWBattleTextManager.prototype.getTextCandidate = function(definitions, target, id, type, subType, targetId, targetIdx, attackId){	
	if(typeof subType == "undefined") {
		subType = "default";
	}
	var text = null;
	
	try {
		if(target == "actor"){
			definitions = definitions.actor;
		}
		if(target == "enemy"){
			definitions = definitions.enemy;
		}
		if(definitions){
			definitions = definitions[id][type];		
				
			if(type == "attacks"){
				definitions = definitions[attackId];
			}
			
			if(definitions && !definitions[subType]){
				subType = "default";
			}	
			if(definitions && definitions[subType]){
				var options;
				options = definitions[subType];
				if(subType != "default"){
					var tmp = [];
					options.forEach(function(option){
						if(option.unitId == targetId){
							tmp.push(option);
						}
					});			
					options = tmp;			
				}
				 
				if(!options.length){
					options = definitions.default;
				} 
				var idx;

				if(targetIdx != null){
					idx = targetIdx;
				} else {
					idx = Math.floor(Math.random() * (options.length));
				}	
				text = options[idx];
			}
		}
	} catch (e){
		
	} 
	return text;
}