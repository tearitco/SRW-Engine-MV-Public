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
	this.addDefinition(
		0, 
		[[1,0],[1,1],[1,-1],[2,0],[2,1],[2,-1],[3,0],[3,1],[3,-1]], 
		{
			name: "Explosion",	
			frameSize: 136, 
			sheetHeight: 1,
			sheetWidth: 7,
			frames: 7,
			offset: {x: 96, y: 0},
			duration: 50,
			se: "SRWExplosion"
		}
	);	
}

