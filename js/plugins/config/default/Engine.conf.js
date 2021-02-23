var ENGINE_SETTINGS_DEFAULT = {
	DISABLE_FULL_BATTLE_SCENE: false,// if true the option to show the battle DEMO will not be available
	BATTLE_SCENE: {
		SPRITES_FILTER_MODE: "NEAREST", // set the filtering mode for textures in the battle scene: NEAREST or TRILINEAR
		DEFAULT_ANIM: {// defines default animations
			DESTROY: 2 // the default destroy animation
		}
	},
	KEEP_ENEMY_SPRITE_ORIENTATION: false, // if true enemy sprites on the map will not be flipped
	ENEMY_TARGETING_FORMULA: "Math.min(hitrate + 0.01, 1) * damage", // the formula used by enemy AI to score potential targets. A target with a higher score will be preferred. hitrate and damage are the projected hit rate and damage the unit will deal to a target.
	DEBUG_SAVING: false, // if enabled the save option on the pause menu during a stage will behave like the regular save function, rather than as a quick save.
	CURSOR_SPEED: 4, // the default cursor speed
	COMMANDER_AURA: {
		1: [10,8],
		2: [15,12,8],
		3: [20,16,12,8],
		4: [25,20,15,10,5]
	},
	SUPPORT_ATTACK_RATIO: 0.8,
	ALLOW_TURN_END_SUPPORT: false,
	VXT_SP: false,
	COST_TYPES: {
		NORMAL: {
			0: [2000, 4000, 6000, 8000, 10000, 10000, 15000, 15000, 15000, 15000, 10000, 10000, 10000, 10000, 10000],
			1: [2000, 3000, 5000, 5000, 5000, 10000, 10000, 15000, 15000, 15000, 10000, 10000, 10000, 10000, 10000]
		},
		WEAPON: {
			0: [12000, 17000, 23000, 30000, 38000, 47000, 57000, 68000, 80000, 93000, 90000, 90000, 90000, 90000, 90000]
		}
	},
	WEAPON_UPGRADE_TYPES: {
		0: [100, 100, 100, 150, 150, 150, 200, 200, 200, 250, 200, 200, 200, 200, 200],
		1: [100, 150, 150, 150, 150, 200, 200, 200, 200, 250, 200, 200, 200, 200, 200]		
	},
	ACE_REQUIREMENT: 50, //amount of kills required to unlocked the Ace Bonus
	DEFAULT_SP_REGEN: 0, //default SP regen in points of SP
	DEFAULT_HP_REGEN: 0, //default HP regen in percent of total(10,50,etc.)
	DEFAULT_EN_REGEN: 0, //default EN regen in percent of total(10,50,etc.)
	DODGE_PATTERNS: {//defines what animations should be used when performing special dodges in the basic and full battle scene
		1: {basic_anim: "double_image", full_anim: 3, full_anim_return: 4, se: "SRWDoubleImage"},
		2: {basic_anim: "no_damage", full_anim: null, full_anim_return: null, se: "SRWParry"},
		3: {basic_anim: "no_damage", full_anim: null, full_anim_return: null, se: "SRWJamming"},
		4: {basic_anim: "no_damage", full_anim: null, full_anim_return: null, se: "SRWShootDown"},		
	}
}