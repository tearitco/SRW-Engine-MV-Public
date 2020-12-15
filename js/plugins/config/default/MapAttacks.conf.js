$SRWConfig.mapAttacks = function(){
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
		},
		false,
		{faceName: "Actor3", faceIdx: 7, text: "Marsha\nGet a load of this!"}
	);	
	
	this.addDefinition(
		1, 
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