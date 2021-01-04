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

SRWBattleTextManager.prototype.getText = function(target, id, type, subType, targetId, targetIdx){
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
		definitions = _this._definitions.actor;
	}
	if(target == "enemy"){
		definitions = _this._definitions.enemy;
	}
	if(definitions[id] && definitions[id][type] && !definitions[id][type][subType]){
		subType = "default";
	}	
	if(definitions[id] && definitions[id][type] && definitions[id][type][subType]){
		var options;
		options = definitions[id][type][subType];
		if(subType != "default"){
			var tmp = [];
			options.forEach(function(option){
				if(option.unitId == targetId){
					tmp.push(option);
				}
			});
			if(tmp.length){
				options = tmp;
			}
		}
		 
		var idx;

		if(targetIdx != null){
			idx = targetIdx;
		} else {
			idx = Math.floor(Math.random() * (options.length));
		}	
		text = options[idx];
	}
	return text;
}