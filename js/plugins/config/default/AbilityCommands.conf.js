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
	
	this.addDefinition(
		1, //the id of the command
		"Summon Illusion", //the display name of the command
		"Summon a ghostly copy of an enemy to fight on your side.", //the display description of the command
		1, //the number of times the ability can be used per stage
		function(actor){ //the function that applies the effect of the command to the user
			var event = $gameMap.requestDynamicEvent();			
			var space = $statCalc.getAdjacentFreeSpace({x: actor.event.posX(), y: actor.event.posY()});			
			event.locate(space.x, space.y);
			
			var actor_unit = $gameActors.actor(14);//change this number to change the actor that is deployed
			actor_unit._mechClass = 10;
			
			var units = $statCalc.getAllActors("enemy");
			var classes = [];
			units.forEach(function(unit){
				classes.push(unit.SRWStats.mech.id);
			});
			
			var mechClass = classes[Math.floor(Math.random() * classes.length)];
			if(mechClass != null){
				actor_unit._mechClass = mechClass;
			}			
			
			$statCalc.initSRWStats(actor_unit, actor.SRWStats.pilot.level);			
			if(actor_unit && event){
				event.setType("actor");
				$gameSystem.deployActor(actor_unit, event, false);		
				$statCalc.setCustomMechStats(actor_unit, {maxHP: 10000, armor: 500, mobility: 130});				
			}
			
			event.appear();
			event.refreshImage();
		}, function(actor){ //the function that checks if the command can be used
			return true;
		},
		102 //the animation that should be played when the ability is used, -1 if none
	);	
}