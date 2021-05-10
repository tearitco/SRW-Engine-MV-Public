function SRWEditor(){
	this._currentEditor = "attack_editor";
	this._title = "SRW Engine MV Editor v0.1";
	this._editorData = {
		attack_editor: {title: "Attack Editor", func: this.showAttackEditor},
		environment_editor: {title: "Environment Editor", func: this.showEnvironmentEditor},
		battle_text_editor: {title: "Battle Text", func: this.showBattleTextEditor},
	}
	
	window.addEventListener("resize", function(){
		Graphics.updatePreviewWindowWidth();	
	});
}

SRWEditor.prototype.init = function(){
	var _this = this;
	var head  = document.getElementsByTagName('head')[0];
	var link  = document.createElement('link');
	link.rel  = 'stylesheet';
	link.type = 'text/css';
	link.href = 'js/plugins/editor/editor.css';
	link.media = 'all';
	head.appendChild(link);
	
	_this._contentDiv = document.createElement("div");
	_this._contentDiv.id = "srw_editor";
	document.body.appendChild(_this._contentDiv);
	
	this._battleTextBuilder = $battleSceneManager.getBattleTextBuilder();
	
	$gameSystem.skyBattleOffset = 0;
	
	$gameSystem.battleBg = "mountains2";
	//$gameSystem.battleParallax1 = "Empty";
	
	$gameSystem.battleParallax1 = "trees1";
	$gameSystem.battleParallax2 = "trees2";
	$gameSystem.battleParallax3 = "mountains1";
	
	$gameSystem.floorParallax1 = "dirt1";
	$gameSystem.floorParallax2 = "dirt2";
	
	//$gameSystem.battleFloor = "floor1";
	$gameSystem.battleSkyBox = "dusk";
	
	$gameSystem.skyBattleBg = "Sky";
	$gameSystem.skyBattleParallax1 = "Empty";
	
	$gameSystem.setSubBattlePhase('after_battle');
	
	_this._previewAttackHits = true;
	_this._previewAttackDestroys = false;
	_this._enemySideAttack = false;
	_this._currentDefinition = 0;
	_this._currentEnvironmentDefinition = 0;
	_this._sequenceTypes = [
		{name: "Main", id: "mainAnimation"},
		{name: "Hit", id: "onHit"},		
		{name: "Hit Overwrite", id: "onHitOverwrite"},		
		{name: "Miss", id: "onMiss"},
		{name: "Miss Overwrite", id: "onMissOverwrite"},
		{name: "Destroy", id: "onDestroy"},
		{name: "Destroy Overwrite", id: "onDestroyOverwrite"},
	];
	
	_this._specialTargets = [
		{name: "active_main", id: "active_main"},
		{name: "active_target", id: "active_target"},
		{name: "Camera", id: "Camera"},
	];
	
	_this._easingFunctions = {
		"sine": "SineEase",		
		"circle": "CircleEase",
		"back": "BackEase",
		"bounce": "BounceEase",
		"cubic": "CubicEase",
		"elastic": "ElasticEase",
		"exponential": "ExponentialEase",
		"power": "PowerEase",
		"quadratic": "QuadraticEase",
		"quartic": "QuarticEase",
		"quintic": "QuinticEase"
	};
	
	_this._easingModes = {
		0: "In", 
		1: "Out",
		2: "InOut"
	};
	
	_this._commandDisplayInfo = {
		effect_shockwave: {
			hasTarget: false,
			params: ["x_fraction", "y_fraction", "shockwave_intensity"],
			desc: "Play the shockwave effect at the specified screen position."
		},
		kill_active_animations: {
			hasTarget: false,
			params: [],
			desc: "Immediately stop all running animations."
		},
		teleport: {
			hasTarget: true,
			params: ["position"],
			desc: "Immediately move an object."
		},
		rotate_to: {
			hasTarget: true,
			params: ["rotation"],
			desc: "Immediately set to rotation of an object."
		},
		translate: {
			hasTarget: true,
			params: ["relative", "startPosition", "position", "duration", "easingFunction", "easingMode", "hide", "catmullRom"],
			desc: "Move an object from the start position to the end position."
		},
		rotate: {
			hasTarget: true,
			params: ["startRotation", "rotation", "duration", "easingFunction", "easingMode"],
			desc: "Rotate an object from the start rotation to the end rotation."
		},
		resize: {
			hasTarget: true,
			params: ["startSize", "endSize", "duration", "easingFunction", "easingMode"],
			desc: "Change the size of an object between the start size and end size."
		},
		flip: {
			hasTarget: true,
			params: ["x", "y"],
			desc: "Flip the texture of an object."
		},
		shake: {
			hasTarget: true,
			params: ["magnitude_x", "magnitude_y", "duration", "easingFunction", "easingMode"],
			desc: "Shake the screen on the x and y axis with the specified magnitude."
		},
		/*set_camera_target: {
			hasTarget: true,
			params: [],
			desc: "Lock the camera on an object in the scene. The camera will always look straight at the object while locked."
		},*/	
	
		set_damage_text: {
			hasTarget: false,
			params: [],
			desc: "Show damage text for the current target. This command is automatically called during the reset_position command."
		},
		
		set_evade_text: {
			hasTarget: false,
			params: [],
			desc: "Show evade text for the current target. This command is automatically called during the reset_position command."
		},
		
		set_destroyed_text: {
			hasTarget: false,
			params: [],
			desc: "Show destroyed text for the current target. This command is automatically called during the destroy command."
		},
		
		set_attack_text: {
			hasTarget: false,
			params: ["id"],
			desc: "Show attack text for the current target."
		},
		clear_attack_text: {
			hasTarget: false,
			params: [],
			desc: "Clear the text box."
		},
		show_support_defender_text: {
			hasTarget: false,
			params: [],
			desc: "Show text for the incoming support defender. This command is automatically called during the next_phase command if applicable."
		},
		enable_support_defender: {
			hasTarget: false,
			params: [],
			desc: "Switch out the defender for the support defender. This command is automatically called during the next_phase command if applicable."
		},
		
		disable_support_defender: {
			hasTarget: false,
			params: [],
			desc: "Switch out the support defender for the defender. This command is automatically called after an attack if applicable."
		},		
		fade_in_bg: {
			hasTarget: true,
			params: ["startFade", "endFade", "duration", "easingFunction", "easingMode"],
			desc: "Fade in the target background."
		},		
		fade_swipe: {
			hasTarget: false,
			params: ["time"],
			desc: "Swipe the screen to black. This command is automatically called during the next_phase command."
		},
		fade_white: {
			hasTarget: false,
			params: ["time", "speed", "speedOut"],
			desc: "Fade the screen to white and from white."
		},		
		updateBgMode: {
			hasTarget: true,
			params: [],
			desc: "Update the current default backgrounds to match the target. This command is automatically called during the next_phase command."
		},	
		next_phase: {
			hasTarget: false,
			params: ["cleanUpCommands", "commands"],
			desc: "Fade the screen to black and set the scene up for the second phase of the attack. This command automatically brings the support defender if available and sets up the default background to match the target."
		},
		dodge_pattern: {
			hasTarget: false,
			params: ["commands"],
			desc: "Show the target's doging action. The commands provided as parameters define the evade movement of the target. If the target has a special dodge action, like Double Image, the matching animation will be played instead."
		},
		spawn_sprite: {
			hasTarget: true,
			params: ["path", "position", "size", "frameSize", "animationFrames", "animationLoop", "animationDelay"],
			desc: "Create a new sprite."
		},
		remove_sprite: {
			hasTarget: true,
			params: [],
			desc: "Remove a sprite."
		},
		create_bg: {
			hasTarget: true,
			params: ["path", "parent", "position", "size", "alpha", "billboardMode", "rotation", "animationFrames", "frameSize", "lineCount", "columnCount", "animationLoop", "animationDelay"],
			desc: "Create a new background."
		},
		remove_bg: {
			hasTarget: true,
			params: [],
			desc: "Remove a background."
		},
		create_dragonbones_bg: {
			hasTarget: true,
			params: ["path", "armatureName", "animName", "parent", "position", "size", "canvasWidth", "canvasHeight"],
			desc: "Create a new background with a Dragonbones animation running on it."
		},		
		remove_dragonbones_bg: {
			hasTarget: true,
			params: [],
			desc: "Remove dragonbones background."
		},	
		set_dragonbones_bg_anim: {
			hasTarget: true,
			params: ["animName"],
			desc: "Set dragonbones background animation."
		},
		create_spriter_bg: {
			hasTarget: true,
			params: ["path",  "animName", "parent", "position"],
			desc: "Create a new background with a Spriter animation running on it."
		},		
		remove_spriter_bg: {
			hasTarget: true,
			params: [],
			desc: "Remove Spriter background."
		},	
		set_spriter_bg_anim: {
			hasTarget: true,
			params: ["animName"],
			desc: "Set Spriter background animation."
		},		
		create_layer: {
			hasTarget: true,
			params: ["path", "isBackground", "frameSize", "lineCount", "columnCount", "animationFrames", "animationLoop", "animationDelay"],
			desc: "Create a new layer."
		},
		remove_layer: {
			hasTarget: true,
			params: [],
			desc: "Remove a layer."
		},	
		create_sky_box: {
			hasTarget: true,
			params: ["path", "color"],
			desc: "Create a new sky box."
		},
		remove_sky_box: {
			hasTarget: true,
			params: [],
			desc: "Remove a sky box."
		},	
		play_effekseer: {
			hasTarget: true,
			params: ["path", "position", "scale", "speed", "rotation"],
			desc: "Play a predefined effekseer effect."
		},		
		hide_effekseer: {
			hasTarget: true,
			params: [],
			desc: "Hide a running effekseer effect."
		},
		play_rmmv_anim: {
			hasTarget: true,
			params: ["animId", "position", "scaleX", "scaleY", "loop", "noFlash", "noSfx"],
			desc: "Play RMMV animation."
		},		
		remove_rmmv_anim: {
			hasTarget: true,
			params: [],
			desc: "Remove a running RMMV animation."
		},
		stop_rmmv_anim: {
			hasTarget: true,
			params: [],
			desc: "Stop a running RMMV animation after the next loop."
		},
		play_rmmv_screen_anim: {
			hasTarget: true,
			params: ["animId", "position", "scaleX", "scaleY", "loop", "noFlash", "noSfx"],
			desc: "Play RMMV screen animation."
		},		
		remove_rmmv_screen_anim: {
			hasTarget: true,
			params: [],
			desc: "Remove a running RMMV screen animation."
		},
		stop_rmmv_screen_anim: {
			hasTarget: true,
			params: [],
			desc: "Stop a running RMMV screen animation after the next loop."
		},
		set_sprite_index: {
			hasTarget: true,
			params: ["index"],
			desc: "Set the frame of a sprite."
		},
			set_sprite_animation: {
			hasTarget: true,
			params: ["name", "animationFrames", "holdFrame", "frameSize", "lineCount", "columnCount", "animationLoop", "animationDelay"],
			desc: "Set the source of a sprite and specify animation details."
		},
		set_sprite_frame: {
			hasTarget: true,
			params: ["name"],
			desc: "Set the source frame of a sprite(in, out, dodge, hurt, main)."
		},
		hide_sprite: {
			hasTarget: true,
			params: [],
			desc: "Hide a sprite."
		},
		show_sprite: {
			hasTarget: true,
			params: [],
			desc: "Show a sprite."
		},
		hide_bgs: {
			hasTarget: false,
			params: [],
			desc: "Hide the default background elements."
		},
		show_bgs: {
			hasTarget: false,
			params: [],
			desc: "Show the default background elements."
		},
		reset_position: {
			hasTarget: false,
			params: ["duration"],
			desc: "Reset the position of the target to the default position."
		},
		destroy: {
			hasTarget: false,
			params: [],
			desc: "Play the destruction animation of the target."
		},
		show_damage: {
			hasTarget: false,
			params: [],
			desc: "Show the damage the target has taken for the current attack."
		},
		drain_hp_bar: {
			hasTarget: false,
			params: ["percent","duration"],
			desc: "Show damage on the HP bar."
		},
		drain_en_bar: {
			hasTarget: false,
			params: ["percent","duration"],
			desc: "Show EN spent."
		},
		play_se: {
			hasTarget: false,
			params: ["seId","pitch","volume"],
			desc: "Play a sound effect."
		},
		kill_se:  {
			hasTarget: false,
			params: [],
			desc: "Mute all playing sound effects."
		},
		show_portrait_noise: {
			hasTarget: false,
			params: [],
			desc: "Fade in static on character portrait."
		},
		hide_portrait_noise: {
			hasTarget: false,
			params: [],
			desc: "Remove static on character portrait."
		},
		set_bg_scroll_ratio: {
			hasTarget: false,
			params: ["ratio"],
			desc: "Set the speed at which the backgrounds scroll."
		},
		toggle_bg_scroll: {
			hasTarget: false,
			params: [],
			desc: "Invert the current background scroll direction."
		}
	};
	
	
	_this._paramTooltips = {
		x_fraction: "A screen space position defined by a percentage of the width of the screen.",
		y_fraction: "A screen space position defined by a percentage of the height of the screen.",
		shockwave_intensity: "The intensity of the shockwave effect.",
		position: "A position defined by an x, y and z coordinate.",
		armatureName: "The name of Armature that will be shown", 
		animName: "The name of the animation that will be shown",
		canvasWidth: "The width of the rendering surface for the external renderer", 
		canvasHeight: "The height of the rendering surface for the external renderer",
		parent: "The id of the object that will be the parent of this object.",
		rotation: "A rotation defined by an x, y and z component. The rotations are described with radian values.",
		relative: "If 1 the animation positions will be relative to the target's current position. The specified start position will be ignored!",
		startPosition: "A position defined by an x, y and z coordinate.",
		duration: "The duration of the command in animation ticks.",
		easingFunction: "Describes how an object moves from point a to point b. If not specified the object will move linearly.",
		easingMode: "In, out or inout. Parameterizes the easingFunction.",
		hide: "Hide the target object after the command has finished.",
		catmullRom: "Describes two addtional points for a Catmull-Rom spline.",
		startRotation: "A rotation defined by an x, y and z component. The rotations are described with radian values.",
		startSize: "The initial size of the target object.",
		endSize: "The final size of the target object.",
		x: "If 1 the object will be flipped along its x-axis.",
		y: "If 1 the object will be flipped along its y-axis.",
		magnitude_x: "The severity of the shaking effect along the x-axis.",
		magnitude_y: "The severity of the shaking effect along the y-axis.",
		startFade: "The initial opacity of the object, between 0-1.",
		endFade: "The final opacity of the object, between 0-1.",
		time: "The duration of the command in ticks.",
		speed: "The speed of the effect.",
		speedIn: "The speed of the fadein: 'fast' or 'slow'.",
		speedOut: "The speed of the fadeout: 'fast' or 'slow'.",
		cleanUpCommands: "A list of commands to be run to clean up objects before the next phase.",
		commands: "A list of commands to be run to during the phase transition to set up the next phase.",
		animationFrames: "The number of animation frames in the spritesheet.",
		holdFrame: "If 1 the sprite will hold the final frame of the animation, ignored if animation looping is enabled.",
		animationLoop: "If 1 the animation will loop.",
		animationDelay: "The time between animation frames in ticks.",
		path: "The file path of the asset.",
		size: "The size of the asset.",
		alpha: "The alpha of the object.",
		billboardMode: "Set the billboarding mode for the object: 'none' or 'full'",
		frameSize: "The size of the frames in the spritesheet.",
		lineCount: "The number of lines in the spritesheet.",
		columnCount: "The number of columns in the spritesheet.",
		isBackground: "If 1 the layer will be a background layer.",
		color: "The blend color for the skybox.",
		scale: "A scaling factor for the effect.",
		scaleX: "A scaling factor for the width of the effect.",
		scaleY: "A scaling factor for the height of the effect.",
		index: "The new sprite index",
		percent: "How much of the change to the value that should be shown. If the total change is 5000, specifying 50 will show 2500.",
		seId: "The name of the sound effect to play.",
		pitch: "The pitch to play the sound effect at.",
		volume: "The volume to play the sound effect at.",
		ratio: "The factor by which the scroll speed is multiplied.",
		animId: "The id of the RMMV animation.",
		loop: "If set to 1 the RMMV animation will continue looping.",
		noFlash: "If set to 1 the flashing effects of the RMMV animation are not shown.",
		noSfx: "If set to 1 the built in sound effects of the animation will not play."
	}
	
	_this._paramDisplayHandlers = {
		x_fraction: function(value){
			
		},
		y_fraction: function(value){
			
		},
		shockwave_intensity: function(value){
			
		},
		armatureName: function(value){
			
		}, 
		animName: function(value){
			
		},
		canvasWidth: function(value){
			
		}, 
		canvasHeight: function(value){
			
		},
		position: function(value){
			if(!value){
				value = {};
			}
			var result = "";
			result+="<div class='param_values'>";
			result+="x: <input data-dataid='x' class='param_value param_coord' value='"+(value.x || 0)+"'></input>";
			result+="y: <input data-dataid='y' class='param_value param_coord' value='"+(value.y || 0)+"'></input>";
			result+="z: <input data-dataid='z' class='param_value param_coord' value='"+(value.z || 0)+"'></input>";

			result+="<select class='position_select'>";
			result+="<option  value=''></option>";
			var defaultPositions = $battleSceneManager.getDefaultPositions();
			Object.keys(defaultPositions).sort().forEach(function(type){
				result+="<option "+(value == type ? "selected" : "")+" value='"+type+"'>"+type+"</option>";
			});
			result+="</select>";	
			result+="</div>";
			return result;
		},
		rotation: function(value){
			if(!value){
				value = {};
			}
			var result = "";
			result+="<div class='param_values'>";
			result+="x: <input data-dataid='x' class='param_value param_coord' value='"+(value.x || 0)+"'></input>";
			result+="y: <input data-dataid='y' class='param_value param_coord' value='"+(value.y || 0)+"'></input>";
			result+="z: <input data-dataid='z' class='param_value param_coord' value='"+(value.z || 0)+"'></input>";	

			result+="<select class='rotation_select'>";
			result+="<option  value=''></option>";
			var defaultRotations = $battleSceneManager.getDefaultRotations();
			Object.keys(defaultRotations).sort().forEach(function(type){
				result+="<option "+(value == type ? "selected" : "")+" value='"+type+"'>"+type+"</option>";
			});
			result+="</select>";	
			result+="</div>";
			return result;
		},
		parent: function(value){
			
		}, 
		startPosition: function(value){
			return _this._paramDisplayHandlers.position(value);
		},
		duration: function(value){
			
		},
		relative: function(value){
			
		},
		easingFunction: function(value){
			var result = "";			
			result+="<select class='easing_select param_select'>";
			result+="<option  value=''></option>";
			Object.keys(_this._easingFunctions).sort().forEach(function(type){
				result+="<option "+(value == type ? "selected" : "")+" value='"+type+"'>"+type+"</option>";
			});
			result+="</select>";
			return result;
		},
		easingMode: function(value){
			var result = "";			
			result+="<select class='easing_mode_select param_select'>";
			result+="<option value=''></option>";
			Object.keys(_this._easingModes).sort().forEach(function(type){
				result+="<option "+(value == type ? "selected" : "")+" value='"+type+"'>"+_this._easingModes[type]+"</option>";
			});
			result+="</select>";
			return result;
		},
		hide: function(value){
			var result = "";			
			result+="<select class='hide_select param_select'>";
			result+="<option value='0' "+(!value ? "selected" : "")+">0</option>";
			result+="<option value='1' "+(value ? "selected" : "")+">1</option>";			
			result+="</select>";
			return result;
		},
		catmullRom: function(value){		
			if(!value){
				value = {
					pos1: {},
					pos4: {}
				};
			}
			var result = "";
			result+="<div class='catmullrom_block' style=''>";
			result+="<div data-catmullpos='pos1' class='param_values pos1'>";
			result+="x1: <input data-dataid='x' class='param_value param_coord' value='"+(value.pos1.x || "")+"'></input>";
			result+="y1: <input data-dataid='y' class='param_value param_coord' value='"+(value.pos1.y || "")+"'></input>";
			result+="z1: <input data-dataid='z' class='param_value param_coord' value='"+(value.pos1.z || "")+"'></input>";	

			
			result+="</div>";
			
			result+="<div data-catmullpos='pos4' class='param_values pos4'>";
			result+="x2: <input data-dataid='x' class='param_value param_coord' value='"+(value.pos4.x || "")+"'></input>";
			result+="y2: <input data-dataid='y' class='param_value param_coord' value='"+(value.pos4.y || "")+"'></input>";
			result+="z2: <input data-dataid='z' class='param_value param_coord' value='"+(value.pos4.z || "")+"'></input>";	

			result+="</div>";
			result+="</div>";
			return result;
		},
		startRotation: function(value){
			return _this._paramDisplayHandlers.rotation(value);
		},
		startSize: function(value){
		
		},
		endSize: function(value){
		
		},
		x: function(value){
		
		},
		y: function(value){
		
		},
		id: function(value){
		
		},
		magnitude_x: function(value){
		
		},
		magnitude_y: function(value){
		
		},
		startFade: function(value){
		
		},
		endFade: function(value){
		
		},
		time: function(value){
		
		},
		speed: function(value){
		
		},
		speedOut: function(value){
		
		},
		cleanUpCommands: function(value){
			return _this._paramDisplayHandlers.commands(value);
		},
		commands: function(value){
			var content = "<div class='inner_commands'>";
			content+="<button class='tick_add_command'>New</button>";
			if(_this._clipboardCommand){
				content+="<button class='tick_paste_command'>Paste</button>";
			}			
			if(value){			
				var ctr = 0;
				value.forEach(function(command){
					content+="<div data-cmdid='"+command.type+"' data-cmdidx='"+(ctr++)+"' class='cmd_block_inner'>";
					content+=_this.getCommandContent(command, true);
					content+="</div>";
				});
			}
			content+="</div>";
			return content;
		},
		animationFrames: function(value){
		
		},
		animationLoop: function(value){
		
		},
		holdFrame: function(value){
		
		}, 
		animationDelay: function(value){
		
		},
		path: function(value){
		
		},
		name: function(value){
		
		},
		size: function(value){
		
		},
		alpha: function(value){
		
		},
		billboardMode: function(value){
		
		},
		frameSize: function(value){
		
		},
		lineCount: function(value){
		
		},
		columnCount: function(value){
		
		},
		isBackground: function(value){
		
		},
		color: function(value){
		
		},
		scale: function(value){
		
		},
		index: function(value){
		
		},
		percent: function(value){
		
		},
		seId: function(value){
		
		},
		pitch: function(value){
		
		},
		volume: function(value){
		
		},
		ratio: function(value){
			
		},
		animId: function(value){
			
		},
		loop: function(value){
			
		},
		noFlash: function(value){
			
		},
		scaleX: function(value){
			
		},
		scaleY: function(value){
			
		},
		noSfx: function(value){
			
		}
	}
	
	_this._currentSequenceType = "mainAnimation";
	_this._paramHandlers = {};
	_this._editorScrollTop = 0;
	
	_this._currentActor = 1;
	_this._currentActorMech = 1;
	_this._currentEnemy = 1;
	_this._currentEnemyMech = 1;
	
	//battle text
	_this._currentBattleTextType = "default";
	_this._currentBattleTextActorType = "actor";
	_this._currentBattleTextStage = -1;
	_this._currentBattleTextEvent = -1;
	_this._currentTextUnit = 0;
	_this._currentTextHook = "battle_intro";
	
	_this.show();
}


SRWEditor.prototype.savePreferences = function(id){
	if(!this._preferences){
		this._preferences = {};
	}
	var fs = require('fs');
	var dirPath = 'js/plugins/config/active';
	if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
	fs.writeFileSync('js/plugins/config/active/EditorPreferences.json', JSON.stringify(this._preferences));
}

SRWEditor.prototype.show = function(){
	var _this = this;
	var content = "";
	
	AudioManager.stopBgm();
	
	var xhr = new XMLHttpRequest();
    var url = 'js/plugins/config/active/EditorPreferences.json';
    xhr.open('GET', url);
    xhr.overrideMimeType('application/json');
    xhr.onload = function() {
        if (xhr.status < 400) {
            _this._preferences = (JSON.parse(xhr.responseText));  
			finalize();	
        }
    };
    xhr.onerror = finalize;
    window[name] = null;
    xhr.send();
	
	
	function finalize(){	
		if(!_this._preferences){
			_this._preferences = {};
		}
		var currentEditorInfo = _this._editorData[_this._currentEditor];
		content+="<div class='header'>";
		content+=_this._title + " - " + currentEditorInfo.title;
		
		content+="<select id='editor_selector'>";
		content+="<option value='attack_editor' "+(_this._currentEditor == "attack_editor" ? "selected" : "")+">Attack Editor</option>";
		content+="<option value='environment_editor' "+(_this._currentEditor == "environment_editor" ? "selected" : "")+">Environment Editor</option>";
		content+="<option value='battle_text_editor' "+(_this._currentEditor == "battle_text_editor" ? "selected" : "")+">Battle Text Editor</option>";
		
		content+="</select>";
		content+="</div>";
		
		content+="<div class='content'>";
		content+="</div>";
		
		_this._contentDiv.innerHTML = content;
		
		//Graphics.updatePreviewWindowWidth();
		
		_this._contentDiv.querySelector("#editor_selector").addEventListener("change", function(){
			$battleSceneManager.endScene();
			_this._currentDefinition = 0;
			_this._currentEnvironmentDefinition = 0;
			_this._currentEditor = this.value;
			_this.show();
		});
		
		currentEditorInfo.func.call(_this);
		Graphics.updatePreviewWindowWidth()
	}
}

SRWEditor.prototype.getBattleEnvironmentId = function(){
	return this._currentEnvironmentDefinition;
}

SRWEditor.prototype.prepareBattleScenePreview = function(){
	var _this = this;
	document.onkeydown = null;
	
	/*if(_this._battleSceneLayer){
		document.querySelector("#attack_editor .preview_window").appendChild(_this._battleSceneLayer);
	} else {
		document.querySelector("#attack_editor .preview_window").appendChild(document.querySelector("#battle_scene_layer"));
	}	
	_this._battleSceneLayer = document.querySelector("#attack_editor #battle_scene_layer");
	_this._battleSceneLayer.style.width = "";
	_this._battleSceneLayer.style.height = "";
	
	if(_this._battleSceneUILayer){
		document.querySelector("#attack_editor .preview_window").appendChild(_this._battleSceneUILayer);
	} else {
		document.querySelector("#attack_editor .preview_window").appendChild(document.querySelector("#battle_scene_ui_layer"));
	}	
	_this._battleSceneUILayer = document.querySelector("#attack_editor #battle_scene_ui_layer");
	_this._battleSceneUILayer.style.width = "";
	_this._battleSceneUILayer.style.height = "";
	
	if(_this._battleSceneFadeLayer){
		document.querySelector("#attack_editor .preview_window").appendChild(_this._battleSceneFadeLayer);
	} else {
		document.querySelector("#attack_editor .preview_window").appendChild(document.querySelector("#fade_container"));
	}
	_this._battleSceneFadeLayer = document.querySelector("#attack_editor #fade_container");
	_this._battleSceneFadeLayer.style.width = "";
	_this._battleSceneFadeLayer.style.height = "";
	
	if(_this._battleSceneSystemFadeLayer){
		document.querySelector("#attack_editor .preview_window").appendChild(_this._battleSceneSystemFadeLayer);
	} else {
		document.querySelector("#attack_editor .preview_window").appendChild(document.querySelector("#system_fade_container"));
	}
	_this._battleSceneSystemFadeLayer = document.querySelector("#attack_editor #system_fade_container");
	_this._battleSceneSystemFadeLayer.style.width = "";
	_this._battleSceneSystemFadeLayer.style.height = "";
	
	if(_this._battleSceneSwipeLayer){
		document.querySelector("#attack_editor .preview_window").appendChild(_this._battleSceneSwipeLayer);
	} else {
		document.querySelector("#attack_editor .preview_window").appendChild(document.querySelector("#swipe_container"));
	}
	_this._battleSceneSwipeLayer = document.querySelector("#attack_editor #swipe_container");
	_this._battleSceneSwipeLayer.style.width = "";
	_this._battleSceneSwipeLayer.style.height = "";*/
	
	
	
	
	
	document.querySelector("#attack_editor .preview_window").appendChild($battleSceneManager._container);
	$battleSceneManager._container.style.width = "";
	$battleSceneManager._container.style.height = "";
	
	document.querySelector("#attack_editor .preview_window").appendChild($battleSceneManager._UIcontainer);	
	$battleSceneManager._UIcontainer.style.width = "";
	$battleSceneManager._UIcontainer.style.height = "";
	
	document.querySelector("#attack_editor .preview_window").appendChild($battleSceneManager._PIXIContainer);	
	$battleSceneManager._PIXIContainer.style.width = "";
	$battleSceneManager._PIXIContainer.style.height = "";
	
	document.querySelector("#attack_editor .preview_window").appendChild($battleSceneManager._fadeContainer);
	$battleSceneManager._fadeContainer.style.width = "";
	$battleSceneManager._fadeContainer.style.height = "";
	
	document.querySelector("#attack_editor .preview_window").appendChild($battleSceneManager._systemFadeContainer);
	$battleSceneManager._systemFadeContainer.style.width = "";
	$battleSceneManager._systemFadeContainer.style.height = "";
	
	document.querySelector("#attack_editor .preview_window").appendChild($battleSceneManager._swipeContainer);
	$battleSceneManager._swipeContainer.style.width = "";
	$battleSceneManager._swipeContainer.style.height = "";
	
	$battleSceneManager.init(true);	
	
	//$battleSceneManager._fadeContainer = _this._battleSceneFadeLayer;
}

SRWEditor.prototype.showBattleTextEditor = function(){
	var _this = this;
	var containerNode = _this._contentDiv.querySelector(".content");
	var content = "";
	
	content+="<div id='attack_editor' class='text_editor'>";
	content+="<div class='edit_controls'>";
	
	content+="</div>";
	content+="<div class='preview'>";
	content+="<div class='preview_window_container'>";
	
	
	
	content+="<div class='preview_window'>";
	content+="</div>";
	
	
	
	content+="</div>";	
	
	content+="<div class='preview_extra_controls'>";
	
	content+="</div>";
	
	content+="</div>";
	
	content+="</div>";
	
	content+="</div>";
	content+="</div>";
	
	containerNode.innerHTML = content;
	this.prepareBattleScenePreview();
	
	
	this.showBattleTextEditorControls();
}

SRWEditor.prototype.showBattleTextEditorControls = function(){
	var _this = this;
	_this._battleTextBuilder.isLoaded().then(function(){
		$battleSceneManager.showEnvironmentScene();	
		var containerNode = _this._contentDiv.querySelector(".content");
		var content = "";
		
		content+="<div id='info_section' class='section'>";
		content+="<button id='save_def'>Save</button>";
		content+="<div class='section_label'>Info</div>";
		content+="<div class='section_content' id='text_editor_section_tools'>";
		
		var currentTextInfo;

		var currentTypeInfo = _this._battleTextBuilder.getDefinitions()[_this._currentBattleTextType];
		
		content+="<div class='row'>";
		content+="<div class='select_label'>";
		content+="Text type";
		content+="</div>";
		content+="<select id='battle_text_type_select'>";
		content+="<option value='default' "+(_this._currentBattleTextType == "default" ? "selected" : "")+">Default</option>";
		//content+="<option value='stage' "+(_this._currentBattleTextType == "stage" ? "selected" : "")+">Stage</option>";
		content+="<option value='event' "+(_this._currentBattleTextType == "event" ? "selected" : "")+">Special</option>";
		content+="</select>";
		
		if(_this._currentBattleTextType == "event"){
			content+="<div class='select_label'>";
			content+="Event";
			content+="</div>";
			content+="<select id='battle_text_event_select'>";
			content+="<option value='-1'></option>";
			if(currentTypeInfo){
				var definedEvents = Object.keys(currentTypeInfo);
				//if(_this._currentBattleTextEvent == -1){
				//	_this._currentBattleTextEvent = definedEvents[0];
			//	}
				Object.keys(definedEvents).forEach(function(eventId){
					var refId = _this._battleTextBuilder.getDefinitions()[_this._currentBattleTextType][eventId].refId;
					content+="<option value='"+eventId+"' "+(_this._currentBattleTextEvent == eventId ? "selected" : "")+">"+eventId+". "+refId+"</option>";
				});
				
				var currentStageTextInfo = currentTypeInfo[_this._currentBattleTextEvent];	
				if(currentStageTextInfo){
					currentTextInfo = currentStageTextInfo[_this._currentBattleTextActorType];
				}
			}
			content+="</select>";
			
		} else {
			if(currentTypeInfo){
				currentTextInfo = currentTypeInfo[_this._currentBattleTextActorType];
			}
		}
		content+="</div>";
		content+="<div class='row'>";
		content+="<div class='select_label'>";
		content+="Unit type";
		content+="</div>";
		content+="<select id='battle_text_actor_type_select'>";
		content+="<option value='actor' "+(_this._currentBattleTextActorType == "actor" ? "selected" : "")+">Actor</option>";
		content+="<option value='enemy' "+(_this._currentBattleTextActorType == "enemy" ? "selected" : "")+">Enemy</option>";

		content+="</select>";
		
		content+="<div class='select_label'>";
		content+="Unit";
		content+="</div>";
		content+=_this.createUnitSelect(_this._currentTextUnit, null, false, "main_unit_select");
		
		
		var textHooks = _this._battleTextBuilder.getAvailableTextHooks();
		content+="<div class='select_label'>";
		content+="Text Type";
		content+="</div>";
		content+="<select id='text_type_select'>";
		
		textHooks.forEach(function(textHook){
			content+="<option "+(_this._currentTextHook == textHook ? "selected" : "")+" value='"+textHook+"'>"+textHook+"</option>";
		});
		content+="</select>";
		content+="</div>";
		
		content+="</div>";
		content+="</div>";
		
		if(_this._currentBattleTextType == "event"){
			content+="<div class='event_controls'>";
			if(_this._currentBattleTextEvent != -1){
				content+="<div class='command_label reference_id_label'>Reference id:</div>";
				content+="<input class='event_id' value='"+_this._battleTextBuilder.getDefinitions()[_this._currentBattleTextType][_this._currentBattleTextEvent].refId+"'></input>";
			}
			content+="<button class='event_new'>New</button>";
			if(_this._currentBattleTextEvent != -1){
				content+="<button class='event_copy'>Copy</button>";
				content+="<button class='event_delete'>Delete</button>";
			}		
			content+="</div>";
		}
		
		content+="<div class='commands_scroll text_scroll_"+_this._currentBattleTextType+"'>";
		
		/*Object.keys(currentTextInfo).forEach(function(unitId){
			var currentData = currentTextInfo[unitId];
			content+="<div data-unitbg='"+unitId+"' class='bg_block tick_block'>";
			content+=_this.createUnitSelect(unitId);
			content+="</div>";
		});*/
		
		var unitSet;
		if(_this._currentBattleTextActorType == "actor"){
			unitSet = $dataActors;
		} else {
			unitSet = $dataEnemies;
		}
		var result = "";
		
		
		function createUnitText(textInfo){
			var content = "";
			content+="<div class='unit_text'>";
			content+="<div data-subtype='default' class='text_category_controls'>";
			content+="<div class='text_label'>Default</div>";
			content+="<button class='add_category_quote'>New</button>";
			content+="</div>"
			
			var ctr = 0;
			textInfo.default.forEach(function(quote){
				content+=_this.createQuoteContent("default", ctr++, quote);
			});	
			
			content+="</div>";
			
			content+="<div class='unit_text'>";
			content+="<div data-subtype='target_mech' class='text_category_controls'>";
			content+="<div class='text_label'>Target Mech</div>";
			content+="<button class='add_category_quote'>New</button>";
			content+="</div>"
			
			var ctr = 0;
			textInfo.target_mech.forEach(function(quote){
				content+=_this.createQuoteContent("target_mech", ctr++, quote, null, null, {id: quote.mechId});
			});	
			
			content+="</div>";
			
			content+="<div class='unit_text'>";
			content+="<div data-subtype='mech' class='text_category_controls'>";
			content+="<div class='text_label'>Mech</div>";
			content+="<button class='add_category_quote'>New</button>";
			content+="</div>"
			
			var ctr = 0;
			textInfo.mech.forEach(function(quote){
				content+=_this.createQuoteContent("mech", ctr++, quote, null, {id: quote.mechId});
			});	
			
			content+="</div>";
			
			content+="<div class='unit_text'>";
			content+="<div data-subtype='actor' class='text_category_controls'>";
			content+="<div class='text_label'>Actors</div>";
			content+="<button class='add_category_quote'>New</button>";
			content+="</div>"	
			
			var ctr = 0;
			textInfo.actor.forEach(function(unitInfo){								
				content+=_this.createQuoteContent("actor", ctr++, unitInfo, {type: "actor", id: unitInfo.unitId});							
			});

			content+="</div>";
			
			content+="<div class='unit_text'>";
			content+="<div data-subtype='enemy' class='text_category_controls'>";
			content+="<div class='text_label'>Enemies</div>";
			content+="<button class='add_category_quote'>New</button>";
			content+="</div>"
								
			var ctr = 0;
			textInfo.enemy.forEach(function(unitInfo){								
				content+=_this.createQuoteContent("enemy", ctr++, unitInfo, {type: "enemy", id: unitInfo.unitId});							
			});

			content+="</div>";
			return content;
		}
		
		var i = _this._currentTextUnit;
		var def = unitSet[_this._currentTextUnit];
		if(def && def.name){
			content+="<div data-unitid='"+i+"' class='unit_text_block tick_block'>";
			content+=i+". "+def.name;				
			textHook = _this._currentTextHook;	
			//textHooks.sort().forEach(function(textHook){
				content+="<div data-hook='"+textHook+"' data-unitid='"+i+"' class='cmd_block cmd_block_outer text_block'>";
				content+="<div class='hook_label'>";
				content+=textHook;
				content+="</div>";
				
				content+="<div class='text_types'>";
				var textInfo = _this.getUnitDef(i, textHook);
				if(textInfo){
					if(textHook == "attacks"){		
						content+="<div data-subtype='default' class='attacks_controls'>";
						
						var availableAttacks = [];
						content+="<select class='attack_select'>";
						content+="<option value='-1'></option>"
						$dataWeapons.forEach(function(weapon){
							if(weapon && weapon.name && !textInfo[weapon.id]){
								content+="<option value='"+weapon.id+"'>"+weapon.name+"</option>"
							}
						});
						content+="</select>"
						content+="<button class='add_attack'>Add</button>";
						content+="</div>"
						Object.keys(textInfo).forEach(function(weaponId){
							content+="<div data-weaponid='"+weaponId+"' class='attack_text'>";
							content+="<div class='delete_weapon_entry'><img src='js/plugins/editor/svg/close-line.svg'></div>";
							content+="<div class='title_label'>"+weaponId+". "+$dataWeapons[weaponId].name+"</div>";
							
							var options = textInfo[weaponId];
							if(!options.default){
								options.default = [];
							}
							if(!options.mech){
								options.mech = [];
							}
							if(!options.actor){
								options.actor = [];
							}
							if(!options.enemy){
								options.enemy = [];
							}
							if(!options.target_mech){
								options.target_mech = [];
							}
							content+=createUnitText(options);
							content+="</div>"
						});						
					} else {							
						content+=createUnitText(textInfo);
					}
				}
				content+="</div>";
				content+="</div>";
			//});
			content+="</div>";

		}
		
				
		content+="</div>";
		
		containerNode.querySelector(".edit_controls").innerHTML = content;
		
		containerNode.querySelector(".commands_scroll").scrollTop = _this._editorScrollTop;		
		
		containerNode.querySelector("#battle_text_type_select").addEventListener("change", function(){
			$gameTemp.scriptedBattleDemoId = null;
			_this._currentBattleTextType = this.value;
			_this._currentTextUnit = 0;
			//_this._currentBattleTextActorType = "actor";
			//_this._currentTextUnit = 0;
			_this.showBattleTextEditorControls();
		});
		
		if(_this._currentBattleTextType == "stage"){
			containerNode.querySelector("#battle_text_stage_select").addEventListener("change", function(){
				_this._currentBattleTextStage = this.value;
				_this.showBattleTextEditorControls();
			});
		}
		
		if(_this._currentBattleTextType == "event"){
			containerNode.querySelector("#battle_text_event_select").addEventListener("change", function(){
				_this._currentBattleTextEvent = this.value;
				$gameTemp.scriptedBattleDemoId =_this._battleTextBuilder.getDefinitions()[_this._currentBattleTextType][_this._currentBattleTextEvent].refId;
				_this.showBattleTextEditorControls();
			});
		}
		
		containerNode.querySelector("#battle_text_actor_type_select").addEventListener("change", function(){
			_this._currentBattleTextActorType = this.value;
			_this.showBattleTextEditorControls();
		});		
		
		containerNode.querySelector(".main_unit_select").addEventListener("change", function(){
			_this._currentTextUnit = this.value;
			_this.showBattleTextEditorControls();
		});
		
		containerNode.querySelector("#text_type_select").addEventListener("change", function(){
			_this._currentTextHook = this.value;
			_this.showBattleTextEditorControls();
		});		
		
		var viewButtons = containerNode.querySelectorAll(".view_text_btn");
		viewButtons.forEach(function(button){
			button.addEventListener("click", function(){
				var entityType = _this._currentBattleTextActorType;
				var entityId = this.closest(".unit_text_block").getAttribute("data-unitid");
				var unitSet;
				if(_this._currentBattleTextActorType == "actor"){
					unitSet = $dataActors;
				} else {
					unitSet = $dataEnemies;
				}
				var name = unitSet[entityId].name;
				var type = this.closest(".text_block").getAttribute("data-hook");
				var subType = this.closest(".quote").getAttribute("data-subtype");
				
				var targetIdx =  this.closest(".quote").getAttribute("data-idx");
				var attackId;
				var attackText = this.closest(".attack_text");
				if(attackText){
					attackId = attackText.getAttribute("data-weaponid");
					targetIdx = this.closest(".quote").querySelector(".quote_id").value;
				}
				var actor = new Game_Actor(entityId, 0, 0);
				$statCalc.initSRWStats(actor);
				var mechId;
								
				if(subType == "mech"){
					mechId = this.closest(".quote").querySelector(".mech_select").value;
				}
				if(mechId){
					actor._mechClass = mechId;	
					$statCalc.initSRWStats(actor);
				}
				
				var targetId = this.closest(".quote").getAttribute("data-targetunit");
				var targetMechId;
				if(subType == "target_mech"){
					targetMechId = this.closest(".quote").querySelector(".target_mech_select").value;
				}				
				
				$battleSceneManager.showText(entityType, actor, name, type, subType, {id: targetId, mechId: targetMechId}, targetIdx, attackId, {id: targetId, mechId: targetMechId});
			});
		});	

		function getLocatorInfo(elem){
			var params = {};
			params.sceneType = _this._currentBattleTextType;
			params.entityType = _this._currentBattleTextActorType;
			params.eventId = _this._currentBattleTextEvent;
			params.stageId = _this._currentBattleTextStage;
			params.entityId = elem.closest(".unit_text_block").getAttribute("data-unitid");
			
			params.type = elem.closest(".text_block").getAttribute("data-hook");
			var quote = elem.closest(".quote");
			if(quote){
				params.subType = quote.getAttribute("data-subtype");
				params.targetId = quote.getAttribute("data-targetunit");
				params.targetIdx = quote.getAttribute("data-idx");
			}			
			var attackText = elem.closest(".attack_text");
			if(attackText){
				params.weaponId = attackText.getAttribute("data-weaponid");
			}		
			var quoteLine = elem.closest(".quote_line");
			if(quoteLine){
				params.lineIdx = quoteLine.getAttribute("data-lineidx");
			}
			
			
			return params;
		}	
		
		var buttons = containerNode.querySelectorAll(".delete_text_btn");
		buttons.forEach(function(button){
			button.addEventListener("click", function(){
				if(confirm("Delete this line?")){
					var params = getLocatorInfo(this);				
					_this._battleTextBuilder.deleteText(params);
					_this._modified = true;
					_this.showBattleTextEditorControls();
				}				
			});
		});	
		
		var buttons = containerNode.querySelectorAll(".delete_weapon_entry");
		buttons.forEach(function(button){
			button.addEventListener("click", function(){
				if(confirm("Delete this weapon entry and all its quotes?")){
					var params = getLocatorInfo(this);				
					_this._battleTextBuilder.deleteWeaponEntry(params);
					_this._modified = true;
					_this.showBattleTextEditorControls();
				}				
			});
		});			
		
		var buttons = containerNode.querySelectorAll(".add_attack");
		buttons.forEach(function(button){
			button.addEventListener("click", function(){			
				var weaponId = this.parentNode.querySelector(".attack_select").value;
				if(weaponId != -1){
					var params = getLocatorInfo(this);				
					_this._battleTextBuilder.addWeaponEntry(params, weaponId);
					_this._modified = true;
					_this.showBattleTextEditorControls();
				}													
			});
		});		
		
		function updateQuote(){
			var newVal  = {
				text: this.closest(".quote_line").querySelector(".quote_text").value,
				faceName: this.closest(".quote_line").querySelector(".quote_face_name").value,
				faceIndex: this.closest(".quote_line").querySelector(".quote_face_index").value,
				displayName: this.closest(".quote_line").querySelector(".quote_display_name").value
			}
			var params = getLocatorInfo(this);
			if(params.type == "attacks"){
				newVal.quoteId = this.closest(".quote_line").querySelector(".quote_id").value;
			}
			_this._battleTextBuilder.updateText(params, newVal);
			_this._modified = true;
		}
		
		var inputs = containerNode.querySelectorAll(".quote_text");
		inputs.forEach(function(input){
			input.addEventListener("change", updateQuote);
		});	
		
		var inputs = containerNode.querySelectorAll(".quote_face_name");
		inputs.forEach(function(input){
			input.addEventListener("change", updateQuote);
		});	
		
		var inputs = containerNode.querySelectorAll(".quote_face_index");
		inputs.forEach(function(input){
			input.addEventListener("change", updateQuote);
		});
		
		var inputs = containerNode.querySelectorAll(".quote_display_name");
		inputs.forEach(function(input){
			input.addEventListener("change", updateQuote);
		});		
		
		var inputs = containerNode.querySelectorAll(".quote_id");
		inputs.forEach(function(input){
			input.addEventListener("change", function(){				
				var params = getLocatorInfo(this);
				_this._battleTextBuilder.setQuoteId(params, this.value);
				_this._modified = true;
			});
		});			
		
		var inputs = containerNode.querySelectorAll(".add_category_quote");
		inputs.forEach(function(input){
			input.addEventListener("click", function(){
				var params = getLocatorInfo(this);
				var categoryControls = this.closest(".text_category_controls");
				params.subType = categoryControls.getAttribute("data-subtype");
				_this._battleTextBuilder.addText(params);
				_this._modified = true;
				_this.showBattleTextEditorControls();
			});
		});		
		
		var inputs = containerNode.querySelectorAll(".add_line");
		inputs.forEach(function(input){
			input.addEventListener("click", function(){
				var params = getLocatorInfo(this);
				_this._battleTextBuilder.addTextLine(params);
				_this._modified = true;
				_this.showBattleTextEditorControls();
			});
		});	
		
		var inputs = containerNode.querySelectorAll(".unit_select");
		inputs.forEach(function(input){
			input.addEventListener("change", function(){
				var params = getLocatorInfo(this);
				_this._battleTextBuilder.setUnitId(params, this.value);
				_this._modified = true;
			});
		});	
		
		var inputs = containerNode.querySelectorAll(".mech_select");
		inputs.forEach(function(input){
			input.addEventListener("change", function(){
				var params = getLocatorInfo(this);
				_this._battleTextBuilder.setMechId(params, this.value);
				_this._modified = true;
			});
		});
		
		var inputs = containerNode.querySelectorAll(".target_mech_select");
		inputs.forEach(function(input){
			input.addEventListener("change", function(){
				var params = getLocatorInfo(this);
				_this._battleTextBuilder.setMechId(params, this.value);
				_this._modified = true;
			});
		});	
		
		containerNode.querySelector(".commands_scroll").addEventListener("scroll", function(){
			_this._editorScrollTop = this.scrollTop;
		});
		
		containerNode.querySelector("#save_def").addEventListener("click", function(){
			_this._battleTextBuilder.save();
			_this._modified = false;
			_this.showBattleTextEditorControls();
		});
		
		var eventIdInput = containerNode.querySelector(".event_id");
		if(eventIdInput){
			eventIdInput.addEventListener("change", function(){
				_this._battleTextBuilder.changeEventId(_this._currentBattleTextEvent, this.value);
				$gameTemp.scriptedBattleDemoId = this.value;
				_this._modified = true;
				_this.showBattleTextEditorControls();
			});
		}
		
		var eventNewBtn = containerNode.querySelector(".event_new");
		if(eventNewBtn){
			eventNewBtn.addEventListener("click", function(){
				_this._battleTextBuilder.addEvent();
				_this._modified = true;
				_this.showBattleTextEditorControls();
			});
		}
		
		var eventNewBtn = containerNode.querySelector(".event_copy");
		if(eventNewBtn){
			eventNewBtn.addEventListener("click", function(){
				_this._battleTextBuilder.copyEvent(_this._currentBattleTextEvent);
				_this._modified = true;
				_this.showBattleTextEditorControls();
			});
		}

		var eventDeleteBtn = containerNode.querySelector(".event_delete");
		if(eventDeleteBtn){
			eventDeleteBtn.addEventListener("click", function(){
				if(confirm("Delete this event entry and all its quotes?")){
					_this._battleTextBuilder.deleteEvent(_this._currentBattleTextEvent);
					_this._currentBattleTextEvent = -1;
					_this._modified = true;
					_this.showBattleTextEditorControls();
				}				
			});
		}		
	});
}

SRWEditor.prototype.createQuoteContent = function(type, idx, quote, unitBaseInfo, mechBaseInfo, targetMechBaseInfo){
	var _this = this;
	var content = "";
	var targetUnitId;

	var lines = [];
	if(!Array.isArray(quote)){
		lines = [quote];
	} else {
		lines = quote;
	}
	
	var lineCounter = 0;
	content+="<div data-subtype='"+type+"' data-idx='"+idx+"'class='quote'>";
	lines.forEach(function(quote){			
		var mechInfo;
		if(mechBaseInfo){
			mechInfo = {
				id: quote.mechId
			};
		}	
		
		var unitInfo;
		if(unitBaseInfo){
			unitInfo = {
				id: quote.unitId,
				type: unitBaseInfo.type	
			};
		}
		var targetMechInfo;
		if(targetMechBaseInfo){
			targetMechInfo = {
				id: quote.mechId
			};
		}
		
		//hack to pretend that the quote id is stored for an entire quote instead of for each line of the quote		
		if(quote.quoteId != null && lineCounter == 0){		
			content+="<div class='command_label quote_id_label'>Quote ID:</div>";
			content+="<input class='quote_id' value='"+quote.quoteId+"'></input>";		
		}	
		
		
		content+="<div data-lineidx='"+(lineCounter++)+"'  data-targetunit='"+(quote.unitId)+"'  class='quote_line'>";
		 
		content+="<div class='quote_config'>";
		
		content+="<div class='command_label '>Face name:</div>";
		content+="<input class='quote_face_name' value='"+quote.faceName+"'></input>";
		content+="<div class='command_label '>Face index:</div>";
		content+="<input class='quote_face_index' value='"+quote.faceIndex+"'></input>";
		
		content+="<div class='command_label '>Disp. Name:</div>";
		content+="<input class='quote_display_name' value='"+(quote.displayName || "")+"'></input>";
				
		content+="<div title='View this quote' class='view_text_btn'><img src='js/plugins/editor/svg/eye-line.svg'></div>"
		content+="<div title='Delete this quote' class='delete_text_btn'><img src='js/plugins/editor/svg/close-line.svg'></div>"
		content+="</div>";
		
		content+="<div class='quote_id_container'>";
		
		
		if(unitInfo){
			content+="<div class='command_label '>Other unit:</div>";
			content+=_this.createUnitSelect(unitInfo.id, unitInfo.type);
		}
		
		if(mechInfo){
			content+="<div class='command_label '>Mech:</div>";
			content+="<select class='mech_select'>";
			content+="<option value='-1'></option>";
			$dataClasses.forEach(function(classInfo){
				if(classInfo && classInfo.name){
					content+="<option "+(classInfo.id == mechInfo.id ? "selected" : "")+" value='"+classInfo.id+"'>"+classInfo.name+"</option>";
				}
			});	
			content+="</select>";		
		}
		
		if(targetMechInfo){
			content+="<div class='command_label '>Target Mech:</div>";
			content+="<select class='target_mech_select'>";
			content+="<option value='-1'></option>";
			$dataClasses.forEach(function(classInfo){
				if(classInfo && classInfo.name){
					content+="<option "+(classInfo.id == targetMechInfo.id ? "selected" : "")+" value='"+classInfo.id+"'>"+classInfo.name+"</option>";
				}
			});	
			content+="</select>";		
		}
		
		content+="</div>";
		content+="<input class='param_value quote_text' value=\""+(quote.text.replace(/\"/g, '&quot;') || "")+"\"></input>";
		content+="</div>";
	});
	
	
	content+="<div class='line_controls'>";
	
	content+="<img class='add_line' src='js/plugins/editor/svg/add-line.svg'>";
	
	content+="</div>";
	content+="</div>";
	
	return content;
}

SRWEditor.prototype.getUnitDef = function(unitId, hook){
	var _this = this;
	var currentTextInfo;
	var currentTypeInfo = _this._battleTextBuilder.getDefinitions()[_this._currentBattleTextType];

	if(currentTypeInfo){	
		if(_this._currentBattleTextType == "stage"){						
			var currentStageTextInfo = currentTypeInfo[_this._currentBattleTextStage].data;	
			if(currentStageTextInfo){
				if(!currentStageTextInfo[_this._currentBattleTextActorType]){
					currentStageTextInfo[_this._currentBattleTextActorType] = {};
				}
				currentTextInfo = currentStageTextInfo[_this._currentBattleTextActorType];
			}
			
			
		} else if(_this._currentBattleTextType == "event"){				
			var currentStageTextInfo = currentTypeInfo[_this._currentBattleTextEvent].data;	
			if(currentStageTextInfo){
				if(!currentStageTextInfo[_this._currentBattleTextActorType]){
					currentStageTextInfo[_this._currentBattleTextActorType] = {};
				}
				currentTextInfo = currentStageTextInfo[_this._currentBattleTextActorType];
			}			
		} else {			
			currentTextInfo = currentTypeInfo[_this._currentBattleTextActorType];			
		}
	}
	
	if(!currentTextInfo[unitId]){
		currentTextInfo[unitId] = {};
	}
	
	if(!currentTextInfo[unitId][hook]){
		currentTextInfo[unitId][hook] = {};
	}	
	
	currentTextInfo = currentTextInfo[unitId][hook];	
	
	if(hook != "attacks"){
		if(!currentTextInfo){
			currentTextInfo = {
				default: [],
				actor: [],
				enemy: [],
				mech: [],
				target_mech: []
			}
		}
		
		if(!currentTextInfo.default){
			currentTextInfo.default = [];
		}
		if(!currentTextInfo.mech){
			currentTextInfo.mech = [];
		}
		if(!currentTextInfo.target_mech){
			currentTextInfo.target_mech = [];
		}
		if(!currentTextInfo.actor){
			currentTextInfo.actor = [];
		}
		if(!currentTextInfo.enemy){
			currentTextInfo.enemy = [];
		}
	}
	return currentTextInfo;
}

SRWEditor.prototype.createUnitSelect = function(selected, type, noEmpty, cssClass){
	var unitSet;
	if(type == "actor" || (!type && this._currentBattleTextActorType == "actor")){
		unitSet = $dataActors;
	} else {
		unitSet = $dataEnemies;
	}
	var result = "";
	var cssClass = cssClass || "unit_select";
	result+="<select class='"+cssClass+"'>";
	if(!noEmpty){
		result+="<option value='-1'></option>";
	}
	
	for(var i = 0; i < unitSet.length; i++){
		var def = unitSet[i];
		if(def && def.name){
			result+="<option value='"+i+"'  "+(i == selected ? "selected" : "")+">"+def.name+"</option>";
		}		
	}
	result+="</select>";
	return result;
}

SRWEditor.prototype.showEnvironmentEditor = function(){
	var _this = this;
	var containerNode = _this._contentDiv.querySelector(".content");
	var content = "";
	content+="<div id='attack_editor'>";
	content+="<div class='edit_controls'>";
	
	content+="</div>";
	content+="<div class='preview'>";
	content+="<div class='preview_window_container'>";
	
	
	
	content+="<div class='preview_window'>";
	content+="</div>";
	
	
	
	content+="</div>";	
	
	content+="<div class='preview_extra_controls'>";
	
	content+="<div class='extra_control'>";
	content+="<button id='reset_view' >Reset</button>";	
	content+="</div>";
	
	
	content+="</div>";
	
	content+="</div>";
	
	content+="</div>";
	
	content+="</div>";
	content+="</div>";
	
	containerNode.innerHTML = content;
	
	containerNode.querySelector("#reset_view").addEventListener("click", function(){
		_this.showEnvironmentEditorControls();
	});
	
	this.prepareBattleScenePreview();
	this._environmentBuilder = $battleSceneManager.getEnvironmentBuilder();
	//$battleSceneManager.showEnvironmentScene();
		
	this.showEnvironmentEditorControls();
}


SRWEditor.prototype.showEnvironmentEditorControls = function(){
	var _this = this;
	_this._environmentBuilder.isLoaded().then(function(){
		var containerNode = _this._contentDiv.querySelector(".content");
		var content = "";
		$battleSceneManager.showEnvironmentScene();	
		
		content+="<div class='selection_controls'>";
		content+="<select class='definition_select'>";
		var definitions = _this._environmentBuilder.getDefinitions();
		Object.keys(definitions).forEach(function(id){
			content+="<option "+(_this._currentEnvironmentDefinition == id ? "selected" : "")+" value='"+id+"'>"+id+" - "+definitions[id].name+"</option>";
		});
		if(!definitions[_this._currentEnvironmentDefinition]){
			_this._currentEnvironmentDefinition = _this._environmentBuilder.newDef("Environment");
		}
		content+="</select>";
		content+="<div class='selection_control_buttons'>";
		content+="<button id='new_def'>New</button>";
		content+="<button id='copy_def'>Copy</button>";
		content+="<button id='delete_def'>Delete</button>";

		content+="</div>";
		content+="</div>";
		
		content+="<div id='info_section' class='section'>";
		content+="<button id='save_def'>Save</button>";
		content+="<div class='section_label'>Info</div>";
		content+="<div class='section_content'>";
		content+="Name<input id='def_name' value='"+definitions[_this._currentEnvironmentDefinition].name+"'></input>";
		content+="</div>";
		content+="</div>";
		
		content+="<div class='section'>";
		content+="<div class='section_label'>Layers</div>";
		content+="<div id='timeline_section' class='section_content'>";
		
		content+="<button id='new_bg'>New</button>";
		
		
		content+="<div class='commands_scroll'>";
		
		var bgs = definitions[_this._currentEnvironmentDefinition].data.bgs;
		bgs = bgs.sort(function(a, b){return a.zoffset - b.zoffset});
		bgs.forEach(function(bg){
			content+="<div data-bgid='"+bg.id+"' class='bg_block tick_block'>";
			content+="<div class='bg_controls' data-bgid='"+bg.id+"'>";
			content+="<button class='bg_delete_button'>Delete</button>";	
			
			content+="<div class='bg_label label_visible'>Visible:</div> <input type='checkbox' data-dataid='hidden' class='param_value' "+(!bg.hidden ? "checked" : "")+"></input>";
			content+="</div>";
			content+="<div data-bgid='"+bg.id+"' class='cmd_block cmd_block_outer'>";
			content+="<div class='param_values'>";	
			content+="<div class='bg_label'>Path:</div> <input data-dataid='path' class='param_value' value='"+(bg.path || "")+"'></input>";
			content+="<div class='bg_label'>Fixed:</div> <input type='checkbox' data-dataid='isfixed' class='param_value' "+(bg.isfixed ? "checked" : "")+"></input>";
			content+="</div>";
			content+="<div class='param_values'>";			
			content+="<div class='bg_label'>Width:</div> <input data-dataid='width' class='param_value' value='"+(bg.width || 0)+"'></input>";
			content+="<div class='bg_label'>Height: </div><input data-dataid='height' class='param_value' value='"+(bg.height || 0)+"'></input>";
			content+="</div>";
			content+="<div class='param_values'>";
			content+="<div class='bg_label'>Y Offset: </div><input data-dataid='yoffset' class='param_value' value='"+(bg.yoffset || 0)+"'></input>";
			content+="<div class='bg_label'>Z Offset: </div><input data-dataid='zoffset' class='param_value' value='"+(bg.zoffset || 0)+"'></input>";
			content+="</div>";
			content+="</div>";
			content+="</div>";
		});
		
		content+="</div>";
		content+="</div>";
		
		content+="</div>";
		
		containerNode.querySelector(".edit_controls").innerHTML = content;
		
		containerNode.querySelector(".commands_scroll").scrollTop = _this._editorScrollTop;		
		
		containerNode.querySelector(".commands_scroll").addEventListener("scroll", function(){
			_this._editorScrollTop = this.scrollTop;
		});
		
		containerNode.querySelector(".definition_select").addEventListener("change", function(){
			_this._currentEnvironmentDefinition = this.value;
			_this.showEnvironmentEditorControls();
		});
		
		containerNode.querySelector("#save_def").addEventListener("click", function(){
			_this._environmentBuilder.save();
			_this._modified = false;
			_this.showEnvironmentEditorControls();
		});
		
		containerNode.querySelector("#new_def").addEventListener("click", function(){
			var name = prompt("Please enter a name") || "New Animation";
			var newId = _this._environmentBuilder.newDef(name);
			_this._currentEnvironmentDefinition = newId;
			_this._modified = true;
			_this.showEnvironmentEditorControls();
		});
		containerNode.querySelector("#copy_def").addEventListener("click", function(){
			var newId = _this._environmentBuilder.copyDef(_this._currentEnvironmentDefinition);
			_this._currentEnvironmentDefinition = newId;
			_this._modified = true;
			_this.showEnvironmentEditorControls();
		});
		containerNode.querySelector("#delete_def").addEventListener("click", function(){
			if(confirm("Delete the current definition?")){
				_this._environmentBuilder.deleteDef(_this._currentEnvironmentDefinition);
				_this._currentEnvironmentDefinition = 0;
				_this._modified = true;
				_this.showEnvironmentEditorControls();
			}			
		});
		
		containerNode.querySelector("#def_name").addEventListener("blur", function(){
			_this._environmentBuilder.updateName(_this._currentEnvironmentDefinition, this.value);
			_this._modified = true;
			_this.showEnvironmentEditorControls();
		});
		
		containerNode.querySelector("#new_bg").addEventListener("click", function(){			
			_this._environmentBuilder.newBg(_this._currentEnvironmentDefinition);
			_this._modified = true;
			_this.showEnvironmentEditorControls();					
		});
		
		var inputs = containerNode.querySelectorAll(".bg_delete_button");
		inputs.forEach(function(tickInput){
			tickInput.addEventListener("click", function(){
				var bg = this.parentNode.getAttribute("data-bgid");
				var c = confirm("Delete this layer?");
				if(c){
					_this._environmentBuilder.deleteBg(_this._currentEnvironmentDefinition, bg);
					_this._modified = true;
					_this.showEnvironmentEditorControls();
				}			
			});
		});
		
		var inputs = containerNode.querySelectorAll(".param_value");
		inputs.forEach(function(tickInput){
			tickInput.addEventListener("change", function(){
				var bg = this.closest(".bg_block").getAttribute("data-bgid");
				var dataId = this.getAttribute("data-dataid");
				var value;
				if(dataId == "isfixed"){
					value = this.checked;
				} else if(dataId == "hidden"){
					value = !this.checked;
				} else {
					value = this.value;
				}
				_this._environmentBuilder.updateBg(_this._currentEnvironmentDefinition, bg, dataId, value);
				_this._modified = true;
				_this.showEnvironmentEditorControls();	
				
			});
		});
			
		
		
		window.addEventListener("beforeunload", function(event){
			if(_this._modified){
				event.returnValue = "You have unsaved changes, exit anyway?";
			}
		});		
	});	
}

SRWEditor.prototype.applyPreferences = function(){
	var _this = this;
	if(_this._preferences){
		Object.keys(_this._preferences).forEach(function(id){
			var elem = document.getElementById(id);
			if(elem){
				elem.value = _this._preferences[id];
			}		
		});
		if(_this._preferences.actor_select != null){
			_this._currentActor = _this._preferences.actor_select;
		}
		
		if(_this._preferences.quote_set != null){
			_this._currentQuoteSet = _this._preferences.quote_set;
		}
	
		if(_this._preferences.environment_select != null){
			_this._currentEnvironmentDefinition = _this._preferences.environment_select;
		}
	
		if(_this._preferences.actor_mech_select != null){
			_this._currentActorMech = _this._preferences.actor_mech_select;
		}

		if(_this._preferences.enemy_select != null){
			_this._currentEnemy = _this._preferences.enemy_select;
		}
	
		if(_this._preferences.enemy_mech_select != null){
			_this._currentEnemyMech = _this._preferences.enemy_mech_select;
		}
	}
}

SRWEditor.prototype.showAttackEditor = function(){
	var _this = this;
	var containerNode = _this._contentDiv.querySelector(".content");
	var content = "";
	content+="<div id='attack_editor'>";
	content+="<div class='edit_controls'>";
	content+="<div class='timeline'>";
	content+="</div>";
	content+="<div class='edit_panel'>";
	content+="</div>";
	content+="</div>";
	content+="<div class='preview'>";
	content+="<div class='preview_window_container'>";
	content+="<div class='preview_window'>";
	content+="</div>";
	content+="</div>";
	content+="<div class='preview_controls'>";
	content+="<img id='play_button' src='js/plugins/editor/svg/play-button.svg'>";
	
	content+="<img id='stop_button' src='js/plugins/editor/svg/pause-button.svg'>";
	content+="</div>";
	
	content+="<div class='preview_extra_controls'>";
	
	content+="<div class='extra_control'>";
	content+="<div class='editor_label'>Enemy Side</div>";
	content+="<input id='chk_enemy_side' type='checkbox'></input>";	
	content+="</div>";
	
	content+="<div class='extra_control'>";
	content+="<div class='editor_label'>Attack hits</div>";
	content+="<input id='chk_hits' checked type='checkbox'></input>";	
	content+="</div>";
	
	content+="<div class='extra_control'>";
	content+="<div class='editor_label'>Attack destroys</div>";
	content+="<input id='chk_destroys' type='checkbox'></input>";	
	content+="</div>";	
	
	content+="</div>";
	
	content+="<div class='preview_extra_controls'>";
	
	content+="<div title='The attack for which to show quotes.' class='extra_control'>";
	content+="<div class='editor_label'>Attack</div>";
	content+="<select class='has_preference' id='quote_set'>";
	$dataWeapons.forEach(function(weapon){
		if(weapon && weapon.name){
			content+="<option value='"+weapon.id+"'>"+weapon.name+"</option>"
		}
	});
	content+="</select>"

	content+="</div>";
	
	
	
	content+="<div title='The environment that will be used for the preview.' class='extra_control'>";
	content+="<div class='editor_label'>Environment</div>";
	content+="<select class='has_preference' id='environment_select'>";
	
	content+="</select>"

	content+="</div>";
	
	content+="<div class='extra_control'>";
	content+="<div class='editor_label'>Actor</div>";
	content+="<select class='has_preference' id='actor_select'>";
	for(var i = 1; i < $dataActors.length; i++){
		if($dataActors[i].name){
			var id = $dataActors[i].id;
			content+="<option "+(id == _this._currentActor ? "selected" : "")+" value='"+id+"'>"+$dataActors[i].name+"</option>";
		}
	}
	content+="</select>";
	content+="</div>";
	
	content+="<div class='extra_control'>";
	content+="<div class='editor_label'>Actor Mech</div>";
	content+="<select class='has_preference' id='actor_mech_select'>";
	for(var i = 1; i < $dataClasses.length; i++){
		if($dataClasses[i].name){
			var id = $dataClasses[i].id;
			content+="<option "+(id == _this._currentActorMech ? "selected" : "")+" value='"+id+"'>"+$dataClasses[i].name+"</option>";
		}
	}
	content+="</select>";
	content+="</div>";
	
	content+="<div class='extra_control'>";
	content+="<div class='editor_label'>Enemy</div>";
	content+="<select class='has_preference' id='enemy_select'>";
	for(var i = 1; i < $dataEnemies.length; i++){
		if($dataEnemies[i].name){
			var id = $dataEnemies[i].id;
			content+="<option "+(id == _this._currentEnemy ? "selected" : "")+" value='"+id+"'>"+$dataEnemies[i].name+"</option>";
		}
	}
	content+="</select>";
	content+="</div>";
	
	content+="<div class='extra_control'>";
	content+="<div class='editor_label'>Enemy Mech</div>";
	content+="<select class='has_preference' id='enemy_mech_select'>";
	for(var i = 1; i < $dataClasses.length; i++){
		if($dataClasses[i].name){
			var id = $dataClasses[i].id;
			content+="<option "+(id == _this._currentEnemyMech ? "selected" : "")+" value='"+id+"'>"+$dataClasses[i].name+"</option>";
		}
	}
	content+="</select>";
	content+="</div>";
	
	content+="</div>";
	
	content+="</div>";
	
	content+="</div>";
	content+="</div>";
	
	containerNode.innerHTML = content;
	
	_this.applyPreferences();
	
	
	this.prepareBattleScenePreview();
	
	this._animationBuilder = $battleSceneManager.getAnimationBuilder();
	this._environmentBuilder = $battleSceneManager.getEnvironmentBuilder()
	
	if(_this._currentEnvironmentDefinition == null){
		_this._currentEnvironmentDefinition = id;
	}
	
	_this._environmentBuilder.isLoaded().then(function(){
		var content = "";
		var defs = _this._environmentBuilder.getDefinitions();	
		Object.keys(defs).forEach(function(id){					
			content+="<option value='"+id+"'>"+defs[id].name+"</option>";		
		});		
		containerNode.querySelector("#environment_select").innerHTML = content;
		_this.applyPreferences();
	});
	
	_this._animationBuilder.isLoaded().then(function(){
		_this._animationBuilder.saveBackup();	
	});
	
	this.showAttackEditorControls();
	
	document.querySelector("#actor_select").addEventListener("change", function(){
		_this._currentActor = this.value;
	});
	
	document.querySelector("#quote_set").addEventListener("change", function(){
		_this._currentQuoteSet = this.value;
	});	
	
	document.querySelector("#environment_select").addEventListener("change", function(){
		_this._currentEnvironmentDefinition = this.value;
	});	
	
	
	document.querySelector("#actor_mech_select").addEventListener("change", function(){
		_this._currentActorMech = this.value;
	});
	
	document.querySelector("#enemy_select").addEventListener("change", function(){
		_this._currentEnemy = this.value;
	});
	
	document.querySelector("#enemy_mech_select").addEventListener("change", function(){
		_this._currentEnemyMech = this.value;
	});

	document.querySelector("#play_button").addEventListener("click", function(){
		$battleSceneManager.resetMaxAnimationTick();
		_this.playBattleScene();
	});
	
	
	
	document.querySelector("#stop_button").addEventListener("click", function(){
		$battleSceneManager.endScene(true);
	});
	
	document.querySelector("#chk_hits").addEventListener("change", function(){
		_this._previewAttackHits = this.checked;
	});
	
	document.querySelector("#chk_destroys").addEventListener("change", function(){
		_this._previewAttackDestroys = this.checked;
	});
	
	document.querySelector("#chk_enemy_side").addEventListener("change", function(){
		_this._enemySideAttack = this.checked;
	});
	
	var preferenceEntries = document.querySelectorAll(".has_preference")
	preferenceEntries.forEach(function(entry){
		entry.addEventListener("change", function(){
			_this._preferences[this.id] = this.value;
			_this.savePreferences();
		});
	});	
}

SRWEditor.prototype.showAttackEditorControls = function(){
	var _this = this;
	_this._animationBuilder.isLoaded().then(function(){
		var containerNode = _this._contentDiv.querySelector(".content");
		var content = "";
		
		
		content+="<div class='selection_controls'>";
		content+="<select class='definition_select'>";
		var definitions = _this._animationBuilder.getDefinitions();
		Object.keys(definitions).forEach(function(id){
			content+="<option "+(_this._currentDefinition == id ? "selected" : "")+" value='"+id+"'>"+id+" - "+definitions[id].name+"</option>";
		});
		content+="</select>";
		content+="<div class='selection_control_buttons'>";
		content+="<button id='new_def'>New</button>";
		content+="<button id='copy_def'>Copy</button>";
		content+="<button id='delete_def'>Delete</button>";

		content+="</div>";
		content+="</div>";
		
		content+="<div id='info_section' class='section'>";
		content+="<button id='save_def'>Save</button>";
		content+="<div class='section_label'>Info</div>";
		content+="<div class='section_content'>";
		content+="Name<input id='def_name' value='"+definitions[_this._currentDefinition].name+"'></input>";
		content+="</div>";
		content+="</div>";
		
		content+="<div class='section'>";
		content+="<div class='section_label'>Commands</div>";
		content+="<div id='timeline_section' class='section_content'>";
		
		content+="<div class='command_tools'>";
		content+="Sequence<select id='sequence_select'>";
		_this._sequenceTypes.forEach(function(sequenceInfo){
			content+="<option "+(_this._currentSequenceType == sequenceInfo.id ? "selected" : "")+" value='"+sequenceInfo.id+"'>"+sequenceInfo.name+"</option>";
		});
		content+="</select>";
		
		content+="<button id='new_tick'>New Tick</button>";
		
		content+="</div>";
		
		content+="<div class='commands_scroll'>";
	
		var commands = definitions[_this._currentDefinition].data;
		var sequence = commands[_this._currentSequenceType];
		if(!sequence){
			sequence = {};
		}
		
		Object.keys(sequence).forEach(function(tick){
			var tickCommands = sequence[tick];
			content+="<div data-tick='"+tick+"' class='tick_block'>";
			content+="<input class='tick_input' value='"+tick+"'></input>";
			//content+="<button class='tick_button'>Update</button>";	
			content+="<button class='tick_delete_button'>Delete</button>";	
			//content+="<button class='tick_play_button'>Play</button>";				
			content+="<div>"
			content+="<button class='tick_add_command'>New</button>";		
			if(_this._clipboardCommand){
				content+="<button class='tick_paste_command'>Paste</button>";
			}		
						
			content+="</div>"	
			var ctr = 0;
			Object.keys(tickCommands).forEach(function(tick){
				var command = tickCommands[tick];
				content+="<div data-cmdid='"+command.type+"' data-cmdidx='"+(ctr++)+"' class='cmd_block cmd_block_outer'>";
				content+=_this.getCommandContent(command);
				content+="</div>";
			});
			content+="</div>";
		});
		
		content+="</div>";
		content+="</div>";
		
		content+="</div>";
		
		containerNode.querySelector(".edit_controls").innerHTML = content;
		
		containerNode.querySelector(".commands_scroll").scrollTop = _this._editorScrollTop;		
		
		containerNode.querySelector(".commands_scroll").addEventListener("scroll", function(){
			_this._editorScrollTop = this.scrollTop;
		});
		
		containerNode.querySelector(".definition_select").addEventListener("change", function(){
			_this._currentDefinition = this.value;
			_this.showAttackEditorControls();
		});
		
		containerNode.querySelector("#sequence_select").addEventListener("change", function(){
			_this._currentSequenceType = this.value;
			_this.showAttackEditorControls();
		});
		
		containerNode.querySelector("#save_def").addEventListener("click", function(){
			_this._animationBuilder.save();
			_this._modified = false;
			_this.showAttackEditorControls();
		});
		
		containerNode.querySelector("#new_def").addEventListener("click", function(){
			var name = prompt("Please enter a name") || "New Animation";
			var newId = _this._animationBuilder.newDef(name);
			_this._currentDefinition = newId;
			_this._modified = true;
			_this.showAttackEditorControls();
		});
		containerNode.querySelector("#copy_def").addEventListener("click", function(){
			var newId = _this._animationBuilder.copyDef(_this._currentDefinition);
			_this._currentDefinition = newId;
			_this._modified = true;
			_this.showAttackEditorControls();
		});
		containerNode.querySelector("#delete_def").addEventListener("click", function(){
			if(confirm("Delete the current definition?")){
				_this._animationBuilder.deleteDef(_this._currentDefinition);
				_this._currentDefinition = 0;
				_this._modified = true;
				_this.showAttackEditorControls();
			}			
		});
		
		containerNode.querySelector("#def_name").addEventListener("blur", function(){
			_this._animationBuilder.updateName(_this._currentDefinition, this.value);
			_this._modified = true;
			_this.showAttackEditorControls();
		});
		
		containerNode.querySelector("#new_tick").addEventListener("click", function(){
			var newTick = prompt("Please enter the new tick value") * 1;
			var isUsed = _this._animationBuilder.isUsedTick(_this._currentDefinition, _this._currentSequenceType, newTick);
			if(!isUsed){
				_this._animationBuilder.newTick(_this._currentDefinition, _this._currentSequenceType, newTick);
				_this._modified = true;
				_this.showAttackEditorControls();
			}			
		});		
		
		var tickInputs = containerNode.querySelectorAll(".tick_input");
		tickInputs.forEach(function(tickInput){
			var isProcessing = false;
			tickInput.addEventListener("change", function(){
				var originalTick = this.parentNode.getAttribute("data-tick");
				var newTick = this.value;
				if(!isProcessing && originalTick != newTick){
					isProcessing = true;
					var isUsed = _this._animationBuilder.isUsedTick(_this._currentDefinition, _this._currentSequenceType, newTick);
					var c = true;
					if(isUsed){
						var c = confirm("The new tick is already in use, merge the command lists?");
					}
					if(c){
						_this._animationBuilder.updateTick(_this._currentDefinition, _this._currentSequenceType, originalTick, newTick);
						_this._modified = true;
						_this.showAttackEditorControls();
					}					
					isProcessing = false;
				}				
			});
		});		
		
		var tickInputs = containerNode.querySelectorAll(".tick_delete_button");
		tickInputs.forEach(function(tickInput){
			tickInput.addEventListener("click", function(){
				var tick = this.parentNode.querySelector(".tick_input").value;
				var c = confirm("Delete this entire tick?");
				if(c){
					_this._animationBuilder.deleteTick(_this._currentDefinition, _this._currentSequenceType, tick);
					_this._modified = true;
					_this.showAttackEditorControls();
				}			
			});
		});	
		
		var tickInputs = containerNode.querySelectorAll(".tick_add_command");
		tickInputs.forEach(function(tickInput){
			tickInput.addEventListener("click", function(){		
				var tick = this.parentNode.closest(".tick_block").querySelector(".tick_input").value;	
				var isCmdParam = this.closest(".inner_commands") != null;
				if(isCmdParam){
					var cmdIdx = this.closest(".cmd_block").getAttribute("data-cmdidx");
					var type = this.closest(".command_param").getAttribute("data-param");
					_this._animationBuilder.addInnerCommand(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, type);
				} else {
					_this._animationBuilder.addCommand(_this._currentDefinition, _this._currentSequenceType, tick);					
				}				
				_this._modified = true;
				_this.showAttackEditorControls();	
			});
		});	

		var tickInputs = containerNode.querySelectorAll(".tick_paste_command");
		tickInputs.forEach(function(tickInput){
			tickInput.addEventListener("click", function(){		
				if(_this._clipboardCommand){
					var tick = this.parentNode.closest(".tick_block").querySelector(".tick_input").value;	
					var isCmdParam = this.closest(".inner_commands") != null;
					if(isCmdParam){
						var cmdIdx = this.closest(".cmd_block").getAttribute("data-cmdidx");
						var type = this.closest(".command_param").getAttribute("data-param");
						_this._animationBuilder.addInnerCommand(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, type, _this._clipboardCommand);
					} else {
						_this._animationBuilder.addCommand(_this._currentDefinition, _this._currentSequenceType, tick, _this._clipboardCommand);					
					}				
					_this._modified = true;
					_this.showAttackEditorControls();	
				}				
			});
		});			

		var inputs = containerNode.querySelectorAll(".delete_command");
		inputs.forEach(function(input){
			input.addEventListener("click", function(){		
				var tick = this.closest(".tick_block").querySelector(".tick_input").value;	
				var cmdIdx = this.closest(".cmd_block").getAttribute("data-cmdidx");
				var isCmdParam = this.closest(".inner_commands") != null;
				if(isCmdParam){
					var cmdInnerIdx = this.closest(".cmd_block_inner").getAttribute("data-cmdidx");
					var type = this.closest(".command_param").getAttribute("data-param");
					_this._animationBuilder.deleteInnerCommand(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, type, cmdInnerIdx);
				} else {
					_this._animationBuilder.deleteCommand(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx);
				}
				_this._modified = true;
				_this.showAttackEditorControls();							
			});
		});

		var inputs = containerNode.querySelectorAll(".copy_command");
		inputs.forEach(function(input){
			input.addEventListener("click", function(){		
				var tick = this.closest(".tick_block").querySelector(".tick_input").value;	
				var cmdIdx = this.closest(".cmd_block").getAttribute("data-cmdidx");
				var isCmdParam = this.closest(".inner_commands") != null;
				if(isCmdParam){
					var cmdInnerIdx = this.closest(".cmd_block_inner").getAttribute("data-cmdidx");
					var type = this.closest(".command_param").getAttribute("data-param");
					_this._clipboardCommand = _this._animationBuilder.getInnerCommandCopy(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, type, cmdInnerIdx);
				} else {
					_this._clipboardCommand = _this._animationBuilder.getCommandCopy(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx);
				}
				
				_this.showAttackEditorControls();							
			});
		});		
		
		var inputs = containerNode.querySelectorAll(".command_select");
		inputs.forEach(function(input){
			input.addEventListener("change", function(){		
				var tick = this.closest(".tick_block").querySelector(".tick_input").value;	
				var cmdIdx = this.closest(".cmd_block").getAttribute("data-cmdidx");
				var isCmdParam = this.closest(".inner_commands") != null;
				if(isCmdParam){
					var cmdInnerIdx = this.closest(".cmd_block_inner").getAttribute("data-cmdidx");
					var type = this.closest(".command_param").getAttribute("data-param");
					_this._animationBuilder.changeInnerCommand(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, type, cmdInnerIdx, this.value);
				} else {
					_this._animationBuilder.changeCommand(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, this.value);
				}
				_this._modified = true;
				_this.showAttackEditorControls();							
			});
		});		
		
		var inputs = containerNode.querySelectorAll(".target_input");
		inputs.forEach(function(input){
			input.addEventListener("change", function(){		
				var tick = this.closest(".tick_block").querySelector(".tick_input").value;	
				var cmdIdx = this.closest(".cmd_block").getAttribute("data-cmdidx");
				var isCmdParam = this.closest(".inner_commands") != null;
				if(isCmdParam){
					var cmdInnerIdx = this.closest(".cmd_block_inner").getAttribute("data-cmdidx");
					var type = this.closest(".command_param").getAttribute("data-param");
					_this._animationBuilder.changeInnerCommandTarget(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, type, cmdInnerIdx, this.value);
				} else {
					_this._animationBuilder.changeCommandTarget(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, this.value);
				}
				_this._modified = true;
				_this.showAttackEditorControls();							
			});
		});
		
		var inputs = containerNode.querySelectorAll(".command_param input");
		inputs.forEach(function(input){
			input.addEventListener("change", function(){		
				var tick = this.closest(".tick_block").querySelector(".tick_input").value;	
				var cmdIdx = this.closest(".cmd_block_outer").getAttribute("data-cmdidx");
				var isCmdParam = this.closest(".inner_commands") != null;
				var param = this.closest(".command_param").getAttribute("data-param");
				if(isCmdParam){
					var value = _this.processParamInput(this);
					var cmdInnerIdx = this.closest(".cmd_block_inner").getAttribute("data-cmdidx");
					var type = this.closest(".command_param_outer").getAttribute("data-param");
					_this._animationBuilder.changeInnerParamValue(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, type, cmdInnerIdx, param, value);
				} else {
					var value = _this.processParamInput(this);
					_this._animationBuilder.changeParamValue(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, param, value);
				}
				_this._modified = true;
				_this.showAttackEditorControls();			
			});
		});
		
		var inputs = containerNode.querySelectorAll(".command_param .param_select");
		inputs.forEach(function(input){
			input.addEventListener("change", function(){		
				var tick = this.closest(".tick_block").querySelector(".tick_input").value;	
				var cmdIdx = this.closest(".cmd_block_outer").getAttribute("data-cmdidx");
				var isCmdParam = this.closest(".inner_commands") != null;
				var param = this.closest(".command_param").getAttribute("data-param");
				if(isCmdParam){
					var value = _this.processParamInput(this);
					var cmdInnerIdx = this.closest(".cmd_block_inner").getAttribute("data-cmdidx");
					var type = this.closest(".command_param_outer").getAttribute("data-param");
					_this._animationBuilder.changeInnerParamValue(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, type, cmdInnerIdx, param, value);
				} else {
					var value = _this.processParamInput(this);
					_this._animationBuilder.changeParamValue(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, param, value);
				}
				_this._modified = true;
				_this.showAttackEditorControls();			
			});
		});
		
		var inputs = containerNode.querySelectorAll(".target_select");
		inputs.forEach(function(input){
			input.addEventListener("change", function(){		
				var targetInput = this.closest(".command_target").querySelector(".target_input");
				targetInput.value = this.value;
				var event = new Event('change');
				targetInput.dispatchEvent(event);	
			});
		});
		
		var inputs = containerNode.querySelectorAll(".command_param .position_select")
		inputs.forEach(function(input){
			input.addEventListener("change", function(){	
				var container = input.parentNode;
				var defaultPositions = $battleSceneManager.getDefaultPositions();
				var pos = defaultPositions[this.value];
				
				var xInput = container.querySelector("input[data-dataid='x']");				
				xInput.value = pos.x;
				container.querySelector("input[data-dataid='y']").value = pos.y;
				container.querySelector("input[data-dataid='z']").value = pos.z;				
				
				var event = new Event('change');
				xInput.dispatchEvent(event);	
			});
		});	
	
		var inputs = containerNode.querySelectorAll(".tick_play_button")
		inputs.forEach(function(input){
			input.addEventListener("click", function(){	
				var tick = this.parentNode.querySelector(".tick_input").value;
				$battleSceneManager.setMaxAnimationTick(tick);
				_this.playBattleScene();
			});
		});
		
		window.addEventListener("beforeunload", function(event){
			if(_this._modified){
				event.returnValue = "You have unsaved changes, exit anyway?";
			}
		});		
		
		
		var inputs = containerNode.querySelectorAll(".move_command_button");
		inputs.forEach(function(input){
			input.addEventListener("click", function(){
				var direction = this.getAttribute("data-direction");
				var tick = this.closest(".tick_block").querySelector(".tick_input").value;	
				var cmdIdx = this.closest(".cmd_block").getAttribute("data-cmdidx");
				var isCmdParam = this.closest(".inner_commands") != null;
				if(isCmdParam){
					var cmdInnerIdx = this.closest(".cmd_block_inner").getAttribute("data-cmdidx");
					var type = this.closest(".command_param").getAttribute("data-param");
					_this._animationBuilder.moveInnerCommand(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, type, cmdInnerIdx, direction);
				} else {
					_this._animationBuilder.moveCommand(_this._currentDefinition, _this._currentSequenceType, tick, cmdIdx, direction);
				}
				_this._modified = true;
				_this.showAttackEditorControls();							
			});
		});
	});	
}

SRWEditor.prototype.processParamInput = function(input){
	var param = input.closest(".command_param").getAttribute("data-param");
	var paramHandlers = {
		position: function(input){
			var container = input.parentNode;
			var x = container.querySelector("input[data-dataid='x']").value*1;
			var y = container.querySelector("input[data-dataid='y']").value*1;
			var z = container.querySelector("input[data-dataid='z']").value*1;
			return {x: x, y: y, z: z};
		},
		startPosition: function(input){
			return this.position(input);
		},
		rotation: function(input){
			var container = input.parentNode;
			var x = container.querySelector("input[data-dataid='x']").value*1;
			var y = container.querySelector("input[data-dataid='y']").value*1;
			var z = container.querySelector("input[data-dataid='z']").value*1;
			return {x: x, y: y, z: z};
		},
		startRotation: function(input){
			return this.position(input);
		},
		duration: function(input){
			return input.value*1;
		},
		catmullRom: function(input){
			var container = input.closest(".command_param ");
			var pos1 = {};
			pos1.x = container.querySelector("div[data-catmullpos='pos1'] input[data-dataid='x']").value*1;
			pos1.y = container.querySelector("div[data-catmullpos='pos1'] input[data-dataid='y']").value*1;
			pos1.z = container.querySelector("div[data-catmullpos='pos1'] input[data-dataid='z']").value*1;
			
			var pos4 = {};
			pos4.x = container.querySelector("div[data-catmullpos='pos4'] input[data-dataid='x']").value*1;
			pos4.y = container.querySelector("div[data-catmullpos='pos4'] input[data-dataid='y']").value*1;
			pos4.z = container.querySelector("div[data-catmullpos='pos4'] input[data-dataid='z']").value*1;
			return {pos1: pos1, pos4: pos4};
		}
	};
	if(paramHandlers[param]){
		return paramHandlers[param](input);
	} else {
		return input.value;
	}
}

SRWEditor.prototype.getCommandDisplayInfo = function(command){
	var _this = this;
	
	if(_this._commandDisplayInfo[command]){
		return _this._commandDisplayInfo[command]
	} else {
		return {
			hasTarget: true,
			params: [],
			desc: ""
		};
	}
}

SRWEditor.prototype.getCommandContent = function(command, isInner){
	var _this = this;
	var result = "";
	var displayInfo = _this.getCommandDisplayInfo(command.type);
	
	result+="<div class='command_type command_row'>";
	result+="<div class='command_label' title='"+displayInfo.desc+"'>Command:</div>";
	result+=_this.getCommandSelect(command.type, isInner);
	result+="<button class='copy_command'>Copy</button>";
	result+="<button class='delete_command'>Delete</button>";	
	
	result+="<div class='move_command_buttons'>";
	result+="<div data-direction='up' class='move_command_button up'>";
	result+="<img src='js/plugins/editor/svg/arrow-up-line.svg'>";
	result+="</div>";
	result+="<div data-direction='down' class='move_command_button down'>";
	result+="<img src='js/plugins/editor/svg/arrow-down-line.svg'>";
	result+="</div>";
	result+="</div>";
	
	result+="</div>";
	
	if(displayInfo.hasTarget){
		result+="<div class='command_target command_row'><div class='command_label'>Target: </div><input class='target_input' value='"+command.target+"'></input>"+_this.getTargetSelect(command.target)+"</div>";
	}
	if(displayInfo.params.length){
		result+="<div class='command_row'>";
		result+="<div class='params_label'>Parameters</div>";
		var params = command.params;
		displayInfo.params.forEach(function(param){
			var value = params[param];
			result+="<div data-param='"+param+"' class='command_param "+(isInner ? "" : "command_param_outer")+"'>";
			result+="<div title='"+(_this._paramTooltips[param] || "")+"' class='param_label'>"+param+": </div>";
			result+=_this.getParamContent(param, value);
			result+="</div>";
		});
		result+="</div>";
	}
	return result;
}

SRWEditor.prototype.getCommandSelect = function(command, isInner){
	var _this = this;
	var result = "";
	result+="<select class='command_select'>";
	Object.keys(_this._commandDisplayInfo).sort().forEach(function(type){
		if(!isInner || (type != "next_phase" && type != "dodge_pattern")){
			result+="<option "+(command == type ? "selected" : "")+" value='"+type+"'>"+type+"</option>";
		}		
	});
	result+="</select>";
	return result;
}

SRWEditor.prototype.getTargetSelect = function(target){
	var _this = this;
	var result = "";
	result+="<select class='target_select'>";
	result+="<option value=''></option>";
	_this._specialTargets.forEach(function(type){
		result+="<option "+(target == type.id ? "selected" : "")+" value='"+type.id+"'>"+type.name+"</option>";
	});
	result+="</select>";
	return result;
}

SRWEditor.prototype.getParamContent = function(param, value){
	var _this = this;
	var result = "";
	if(_this._paramDisplayHandlers[param]){
		result = _this._paramDisplayHandlers[param](value);
		if(!result){
			result = "<input value='"+(value || "")+"'></input>";
		}
	} else {
		result+="???";
	}
	return result;
}

SRWEditor.prototype.killAudioAfterScene = function(){
	var _this = this;
	if($gameSystem.isSubBattlePhase() == "after_battle"){
		AudioManager.stopBgm();
	} else {		
		setTimeout(function(){_this.killAudioAfterScene()}, 100);
	}	
}

SRWEditor.prototype.playBattleScene = function(){
	var _this = this;
	if($gameSystem.isSubBattlePhase() == "after_battle"){
		$gameSystem.setSubBattlePhase("halt");
		
		var weapon = {
			id: _this._currentQuoteSet || 1,
			name: "Test",
			type: "M",
			postMoveEnabled: 0,
			power: 0,
			minRange: 0,
			range:0,
			hitMod: 0,
			critMod: 0,
			totalAmmo: 0,
			currentAmmo: 0,
			ENCost: 50,
			willRequired: 0,
			terrain: {air: "C", land: "C", water: "C", space: "C"},
			effects: [],
			particleType: "", //missile, funnel, beam, gravity, physical or "".
			animId:_this._currentDefinition,
			isMap: 0, 
			mapId: -1,
			isCombination: 0,
			combinationWeapons: null,
			combinationType: null
		}			
		
		$gameMap._interpreter.playBattleScene({
			enemyFirst: _this._enemySideAttack, // if 0 the actor will move first, if 1 the enemy will move first. This also affects the supports. If 0, the actor support will be attacking otherwise defending. If 1, the enemy support will be attacking otherwise defending.
			songId: "Battle1", // the id of the song that should be played during the battle scene
			actor: {
				id: _this._currentActor, // the id of the actor pilot
				mechId: _this._currentActorMech, // the id of the actor mech
				action: _this._enemySideAttack ? "defend" : "attack", // the action the actor will take: "attack", "defend", "evade". 
				weapon: weapon, // the id of the attack the actor will use. Only used if the action is "attack".
				hits: _this._previewAttackHits, // if 0 the attack performed by this unit will miss, if 1 the attack will hit 
				startHP: 100, // the start HP of the actor in percent
				targetEndHP: _this._previewAttackDestroys ? 0 : 50, // the end HP of the target in percent
			},
			/*actorSupport: { // ommit this section if there is no actor supporter
				id: 3, // the id of the actor pilot
				action: "attack", // the action the actor will take: "attack", "defend", "evade". 
				weapon: 5, // the id of the attack the actor will use. Only used if the action is "attack".
				hits: 1, // if 0 the attack performed by this unit will miss, if 1 the attack will hit 
				startHP: 100, // the start HP of the actor in percent
				targetEndHP: 0, // the end HP of the target in percent
			},*/
			enemy: {
				id: _this._currentEnemy, // the id of the enemy pilot
				mechId: _this._currentEnemyMech, // the id of the enemy mech
				weapon: weapon, // the id of the attack the actor will use. Only used if the action is "attack".
				action: _this._enemySideAttack ? "attack" : "defend", // the action the enemy will take: "attack", "defend", "evade". 
				hits: _this._previewAttackHits, // if 0 the attack performed by this unit will miss, if 1 the attack will hit 
				startHP: 100, // the start HP of the enemy in percent
				targetEndHP: _this._previewAttackDestroys ? 0 : 50, // the end HP of the target in percent
			},
			/*enemySupport: { // ommit this section if there is no enemy supporter
				id: 3, // the id of the enemy pilot
				action: "defend", // the action the enemy will take: "attack", "defend", "evade". 
				hits: 1, // if 0 the attack performed by this unit will miss, if 1 the attack will hit 
				weapon: -1, // the id of the attack the actor will use. Only used if the action is "attack".
				startHP: 100, // the start HP of the enemy in percent
				targetEndHP: 0, // the end HP of the target in percent
			}	*/		
		});
		this.killAudioAfterScene();
	}
}
