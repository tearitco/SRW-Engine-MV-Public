$SRWConfig.battleText = {
	actors: {
		1: { //Harold
			battle_intro: {
				default: [
					"Let's see how well you stand up to my assault!",
					"Don't underestimate me just because I can't fly!"
				]
			},
			retaliate: {
				default: [
					"Right back at ya, pal."
				]
			},
			attacks: {
				0: ["Things are about to get rough."],
				1: ["HAAAAAAA"],	
				2: ["HAAAAAAAAAAA"],
				3: ["HAAAAAAAAAAAAAAA"],
				4: ["HAAAAAAAAAAAAAAAAAA"],
				5: ["HAAAAAAAAAAAAAAAAAAAAAA"],	
				6: ["HAH!"],
				7: ["End of the line for you, pal."],
			},
			evade: {
				default: [
					"Whew, I actually dodged something for once."
				]
			},
			damage: {
				default: [
					"Hey! You're scuffing the paint on my armor!"
				]
			},
			damage_critical: {
				default: [
					"Well, this is looking kinda bad..."
				]
			},
			destroyed: {
				default: [
					"Aaaaaaaaaagh!"
				]
			}, 
			support_defend: {
				default: [
					"Stand back!"
				],
				3: [
					"Marsha, watch out!"
				]
			}
		},
		3: { //Marsha
			battle_intro: {
				default: [
					"Line right up for your free explosion!"
				]
			},
			retaliate: {
				default: [
					"You're messing with the wrong witch, punk!"
				],
				1: [
					"Why is it always bats..."
				]
			},
			attacks: {
				0: ["Time to get serious!"],
				1: ["Got get 'em boys!"]		
			},
			evade: {
				default: [
					"Better luck next time!"
				]
			},
			damage: {
				default: [
					"Ack, I'm not built for actually taking hits..."
				]
			},
			damage_critical: {
				default: [
					"H-Harold, could you give me some cover please..."
				]
			},
			destroyed: {
				default: [
					"Iyaaaaaaaaaa!"
				]
			}, 
			support_defend: {
				default: [
					"Wait, why am I jumping in to take an attack?!"
				]
			}
		}
	},
	enemies: {
		1: { //Bat
			battle_intro: {
				default: [
					"Skree!"
				]
			},
			retaliate: {
				default: [
					"Skr-Skreeee!"
				]
			},
			attacks: {

			},
			evade: {
				default: [
					"Skree skree!"
				]
			},
			damage: {
				default: [
					"Skree!"
				]
			},
			damage_critical: {
				default: [
					"Skree..."
				]
			},
			destroyed: {
				default: [
					"SKREEEEEEEEEEEE!"
				]
			}, 
			support_defend: {
				default: [
					"Skree!"
				]
			}
		},
		3: { //Orc
			battle_intro: {
				default: [
					"... Attack..."
				]
			},
			retaliate: {
				default: [
					"... Attack!"
				]
			},
			attacks: {
				
			},
			evade: {
				default: [
					"Ha!"
				]
			},
			damage: {
				default: [
					"Gah!"
				]
			},
			damage_critical: {
				default: [
					"Grugh!!"
				]
			},
			destroyed: {
				default: [
					"GRAAAAAAAAGH!"
				]
			}, 
			support_defend: {
				default: [
					"... Defend..."
				]
			}
		},
		5: { //Wraith
			battle_intro: {
				default: [
					"Be cursed with me..."
				]
			},
			retaliate: {
				default: [
					"Unforgivable..."
				]
			},
			attacks: {
				
			},
			evade: {
				default: [
					"Useless."
				]
			},
			damage: {
				default: [
					"Agh!"
				]
			},
			damage_critical: {
				default: [
					"Pain..."
				]
			},
			destroyed: {
				default: [
					"SHYAAAAAAA..."
				]
			}, 
			support_defend: {
				default: [
					"... Defend..."
				]
			}
		}
	}
};

$SRWConfig.eventBattleText = {
	0: {
		actors: {			
			1: { //Harold
				damage: {
					default: [
						"That director guy better pay for my armor..."
					]
				},			
				support_defend: {
					3: [
						"Marsha, don't die in the event!"
					]
				}
			},
		}
	}
}