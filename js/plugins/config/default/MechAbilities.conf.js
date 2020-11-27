$SRWConfig.mechAbilties = function(){
	this.addDefinition(
		0, 
		"Double Image", 
		"30% chance to evade any attack above 130 Will.", 
		false,
		false,
		function(actor, level){
			return [{type: "double_image_rate", modType: "addFlat", value: 0.3}];
		},
		function(actor, level){
			return $statCalc.getCurrentWill(actor) >= 130;
		}
	);
	this.addDefinition(
		1, 
		"HP Regen S", 
		"10% HP recovered at the start of the turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "HP_regen", modType: "addFlat", value: 10}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		2, 
		"HP Regen M", 
		"20% HP recovered at the start of the turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "HP_regen", modType: "addFlat", value: 20}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		3, 
		"HP Regen L", 
		"30% HP recovered at the start of the turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "HP_regen", modType: "addFlat", value: 30}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		4, 
		"EN Regen S", 
		"10% EN recovered at the start of the turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "EN_regen", modType: "addFlat", value: 10}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		5, 
		"EN Regen M", 
		"20% EN recovered at the start of the turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "EN_regen", modType: "addFlat", value: 20}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		6, 
		"EN Regen L", 
		"30% EN recovered at the start of the turn.", 
		false,
		false,
		function(actor, level){
			return [{type: "EN_regen", modType: "addFlat", value: 30}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		7, 
		"Repair Kit", 
		"The unit can heal an adjacent Unit.", 
		false,
		false,
		function(actor, level){
			return [{type: "heal", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		8, 
		"Resupply Kit", 
		"The unit can recover all EN for an adjacent Unit. The target's Will is reduced by 10.", 
		false,
		false,
		function(actor, level){
			return [{type: "resupply", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		9, 
		"G-Wall", 
		"Cancels all damage if damage is below 800. 5 EN per use.", 
		false,
		false,
		function(actor, level){
			return [{type: "threshold_barrier", modType: "addFlat", value: 800},{type: "threshold_barrier_cost", modType: "addFlat", value: 5}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		10, 
		"G-Territory", 
		"Cancels all damage if damage is below 1800. 15 EN per use.", 
		false,
		false,
		function(actor, level){
			return [{type: "threshold_barrier", modType: "addFlat", value: 1800},{type: "threshold_barrier_cost", modType: "addFlat", value: 15}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		11, 
		"Barrier Field", 
		"Reduces all damage by 1000. 10 EN per use.", 
		false,
		false,
		function(actor, level){
			return [{type: "reduction_barrier", modType: "addFlat", value: 1000},{type: "reduction_barrier_cost", modType: "addFlat", value: 10}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		12, 
		"Unarmed", 
		"Movement + 1, Mobility +20", 
		false,
		true,
		function(actor, level){
			return [{type: "movement", modType: "addFlat", value: 1},{type: "mobility", modType: "addFlat", value: 20}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		13, 
		"N. Destroy", 
		"If the unit makes contact with a human opponent, both are destroyed after battle.", 
		false,
		true,
		function(actor, level){
			return [{type: "noise_destroy", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		14, 
		"N. Shift", 
		"The unit takes 1/8 damage.", 
		false,
		true,
		function(actor, level){
			return [{type: "percent_barrier", modType: "addFlat", value: 1/8}];
		},
		function(actor, level){
			return !$statCalc.isStatModActiveOnAnyActor("noise_cancel", {14: true});
		}
	);
	this.addDefinition(
		15, 
		"N. Cancel", 
		"Disables N.Shift on all units if deployed. Unit is immune to N. Destroy.", 
		false,
		true,
		function(actor, level){
			return [{type: "noise_destroy_immune", modType: "addFlat", value: 1},{type: "noise_cancel", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		16, 
		"Spirit Barrier", 
		"Unit is immune to N. Destroy.", 
		false,
		true,
		function(actor, level){
			return [{type: "noise_destroy_immune", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		17, 
		"Spirit Barrier+", 
		"All units become immune to N. Destroy.", 
		false,
		true,
		function(actor, level){
			return [{type: "noise_destroy_immune_all", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		18, 
		"Barrier Jacket", 
		"Reduces all ranged damage by 500. Effect increases with Magician Level. Unit is immune to N. Destroy.", 
		false,
		false,
		function(actor, level){
			var magicianLevel = $statCalc.getPilotAbilityLevel(actor, 9);
			var effectTable = [
				0, //1
				100, //2
				100, //3
				200, //4
				200, //5
				200, //6
				300, //7
				300, //8
				500, //9				
			];
			var boost = 0;
			if(typeof effectTable[magicianLevel-1] != "undefined"){
				boost = effectTable[magicianLevel-1];
			}
			return [{type: "ranged_reduction_barrier", modType: "addFlat", value: 500 + boost}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		19, 
		"Warp Field", 
		"All damage received is halved.", 
		false,
		true,
		function(actor, level){
			return [{type: "percent_barrier", modType: "addFlat", value: 1/2}];
		},
		function(actor, level){
			return true;
		}
	);
	this.addDefinition(
		20, 
		"Holo Boost", 
		"All weapons +500. Movement +1.", 
		false,
		true,
		function(actor, level){
			return [
				{type: "movement", modType: "addFlat", value: 1},
				{type: "weapon_melee", modType: "addFlat", value: 500},
				{type: "weapon_ranged", modType: "addFlat", value: 500},
			];
		},
		function(actor, level){
			return $statCalc.isFUB(actor);
		}
	);
	this.addDefinition(
		21, 
		"Heal", 
		"The unit can heal an adjacent Unit.", 
		false,
		false,
		function(actor, level){
			return [{type: "heal", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);
	this.addDefinition(
		22, 
		"Resupply", 
		"The unit can recover all EN for an adjacent Unit. The target's Will is reduced by 10.", 
		false,
		false,
		function(actor, level){
			return [{type: "resupply", modType: "addFlat", value: 1}];
		},
		function(actor, level){
			return true;
		},
		[0],
		1
	);	
};