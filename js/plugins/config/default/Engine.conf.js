var ENGINE_SETTINGS = {
	DISABLE_FULL_BATTLE_SCENE: false,
	BATTLE_SCENE: {
		SPRITES_FILTER_MODE: "NEAREST", // NEAREST or TRILINEAR
		DEFAULT_ANIM: {
			DESTROY: 2
		}
	},
	KEEP_ENEMY_SPRITE_ORIENTATION: false,
	ENEMY_TARGETING_FORMULA: "Math.min(hitrate + 0.01, 1) * damage",
	DEBUG_SAVING: false,
	CURSOR_SPEED: 4,
	CURSOR_MAX_SPEED: 7,
	CURSOR_MODE: "tick"
}