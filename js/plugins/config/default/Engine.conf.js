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
	}
}