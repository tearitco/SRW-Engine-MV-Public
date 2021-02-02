$SRWConfig.abilityCommands = function(){
	this.addDefinition(
		0, //the id of the command
		"Chalice", //the display name of the command
		"Recover HP and EN to full up to twice per stage.", //the display description of the command
		2, //the number of times the ability can be used per stage
		function(actor){ //the function that applies the effect of the command to the user
			$statCalc.recoverHPPercent(actor, 100);
			$statCalc.recoverENPercent(actor, 100);
		}, function(actor){ //the function that checks if the command can be used
			return $statCalc.canRecoverEN(actor) || $statCalc.canRecoverHP(actor)
		},
		42 //the animation that should be played when the ability is used, -1 if none
	);	
}