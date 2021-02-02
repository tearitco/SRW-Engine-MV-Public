$SRWConfig.abilityCommands = function(){
	this.addDefinition(
		0, 
		"Chalice", 
		"Recover HP and EN to full up to twice per stage.", 
		2, //the number of times the ability can be used per stage
		function(actor){
			$statCalc.recoverHPPercent(actor, 100);
			$statCalc.recoverENPercent(actor, 100);
		}, function(actor){
			return $statCalc.canRecoverEN(actor) || $statCalc.canRecoverHP(actor)
		},
		42//the animation that should be played when the ability is used, -1 if none
	);	
}