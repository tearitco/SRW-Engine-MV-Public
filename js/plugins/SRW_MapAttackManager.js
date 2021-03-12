function MapAttackManager(){
	this._definitions = [];
	this.initDefinitions();	
}

MapAttackManager.prototype.addDefinition = function(idx, shape, animInfo, lockRotation, textInfo, retargetInfo){
	var _this = this;
	this._definitions[idx] = {
		name: name,
		shape: shape,
		animInfo: animInfo,
		lockRotation: lockRotation,
		textInfo: textInfo,
		retargetInfo: retargetInfo
	};	
}

MapAttackManager.prototype.getDefinition = function(idx){
	return this._definitions[idx];
}

MapAttackManager.prototype.initDefinitions = function(){
	$SRWConfig.mapAttacks.call(this);
}

