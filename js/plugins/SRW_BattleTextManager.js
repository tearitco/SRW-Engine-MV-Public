function SRWBattleTextManager(){
	this.initDefinitions();
}


SRWBattleTextManager.prototype.initDefinitions = function(){
	var _this = this;
	_this._definitions = $SRWConfig.battleText;	
	_this._eventDefinitions = $SRWConfig.eventBattleText;	
}

SRWBattleTextManager.prototype.getText = function(target, id, type, subType){
	var _this = this;
	var definitions;
	if($gameTemp.scriptedBattleDemoId != null){
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
	}
	
	if(typeof subType == "undefined") {
		subType = "default";
	}
	var text = "...";
	
	if(target == "actor"){
		definitions = _this._definitions.actors;
	}
	if(target == "enemy"){
		definitions = _this._definitions.enemies;
	}
	if(definitions[id] && definitions[id][type] && !definitions[id][type][subType]){
		subType = "default";
	}	
	if(definitions[id] && definitions[id][type] && definitions[id][type][subType]){
		var options = definitions[id][type][subType];
		var idx = Math.floor(Math.random() * (options.length));
		text = options[idx];
	}
	return text;
}