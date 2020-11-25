function MapAttackManager(){
	this._definitions = [];
	this.initDefinitions();	
}

MapAttackManager.prototype.addDefinition = function(idx, shape, animInfo){
	var _this = this;
	this._definitions[idx] = {
		name: name,
		shape: shape,
		animInfo: animInfo
	};	
}

MapAttackManager.prototype.getDefinition = function(idx){
	return this._definitions[idx];
}

MapAttackManager.prototype.initDefinitions = function(){
	$SRWConfig.mapAttacks.call(this);
}

