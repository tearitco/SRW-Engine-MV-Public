function SRWEditor(){
	
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
	
	$gameSystem.battleBg = "Grassland";
	$gameSystem.battleParallax1 = "Empty";
	
	$gameSystem.skyBattleBg = "Sky";
	$gameSystem.skyBattleParallax1 = "Empty";
	
	$gameSystem.setSubBattlePhase('after_battle');
	
	_this._previewAttackHits = true;
	_this._previewAttackDestroys = false;
	_this._enemySideAttack = false;
	_this._currentDefinition = 0;
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
			params: ["startPosition", "position", "duration", "easingFunction", "easingMode", "hide", "catmullRom"],
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
		set_camera_target: {
			hasTarget: true,
			params: [],
			desc: "Lock the camera on an object in the scene. The camera will always look straight at the object while locked."
		},	
	
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
			params: ["path", "position", "size", "alpha", "billboardMode", "rotation", "animationFrames", "frameSize", "lineCount", "columnCount", "animationLoop", "animationDelay"],
			desc: "Create a new background."
		},
		remove_bg: {
			hasTarget: true,
			params: [],
			desc: "Remove a background."
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
			hasTarget: true,
			params: [],
			desc: "Show the default background elements."
		},
		reset_position: {
			hasTarget: true,
			params: ["duration"],
			desc: "Reset the position of the target to the default position."
		},
		destroy: {
			hasTarget: true,
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
	};
	
	
	_this._paramTooltips = {
		position: "A position defined by an x, y and z coordinate.",
		rotation: "A rotation defined by an x, y and z component. The rotations are describe with radian values.",
		startPosition: "A position defined by an x, y and z and coordinate.",
		duration: "The duration of the command in animation ticks.",
		easingFunction: "Descibes how an object moves from point a to point b. If not specified the object will move linearly.",
		easingMode: "In, out or inout. Parameterizes easingFunction.",
		hide: "Hide the target object after the command has finished.",
		catmullRom: "Describes four point for a Catmull-Rom spline.",
		startRotation: "A rotation defined by an x, y and z component. The rotations are described with radian values.",
		startSize: "The initial size of the target object.",
		endSize: "The final size of the target object.",
		x: "If 1 the object will be flipped along its x-axis.",
		y: "If 1 the object will be flipped along its y-axis.",
		magnitude_x: "The severity of the shaking effect along the x-axis.",
		magnitude_y: "The severity of the shaking effect along the y-axis.",
		startFade: "The initial opacity of the object, between 0-1.",
		endFade: "The final opacity of the object, between 0-1.",
		time: "The duration of the command in milliseconds.",
		speed: "The speed of the effect.",
		speedIn: "The speed of the fadein 'fast' or 'slow'.",
		speedOut: "The speed of the fadeout 'fast' or 'slow'.",
		cleanUpCommands: "A list of commands to be run to clean up objects before the next phase.",
		commands: "A list of commands to be run to during the phase transition to set up the next phase.",
		animationFrames: "The number of animation frames in the spritesheet.",
		holdFrame: "If 1 the sprite will hold the final frame of the animation, ignored if animation looping is enabled.",
		animationLoop: "If 1 the animation will loop.",
		animationDelay: "The time between animation frames in milliseconds.",
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
		index: "The new sprite index",
		percent: "How much of change to the value that should be shown. If the total change is 5000, specifying 50 will show 2500.",
		seId: "The name of the sound effect to play.",
		pitch: "The pitch to play the sound effect at.",
		volume: "The volume to play the sound effect at."
	}
	
	_this._paramDisplayHandlers = {
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
		startPosition: function(value){
			return _this._paramDisplayHandlers.position(value);
		},
		duration: function(value){
		
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
		
		}
	}
	
	_this._currentSequenceType = "mainAnimation";
	_this._paramHandlers = {};
	_this._editorScrollTop = 0;
	
	_this._currentActor = 1;
	_this._currentActorMech = 1;
	_this._currentEnemy = 1;
	_this._currentEnemyMech = 1;
	_this.show();
}

SRWEditor.prototype.show = function(){
	var _this = this;
	var content = "";
	
	content+="<div class='header'>";
	content+="SRW Engine MV Editor v0.1";
	content+="</div>";
	
	content+="<div class='content'>";
	content+="</div>";
	
	_this._contentDiv.innerHTML = content;
	_this.showAttackEditor();
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
	
	content+="<div class='extra_control'>";
	content+="<div class='editor_label'>Actor</div>";
	content+="<select id='actor_select'>";
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
	content+="<select id='actor_mech_select'>";
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
	content+="<select id='enemy_select'>";
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
	content+="<select id='enemy_mech_select'>";
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
	
	document.onkeydown = null;
	
	document.querySelector("#attack_editor .preview_window").appendChild(document.querySelector("#battle_scene_layer"));
	_this._battleSceneLayer = document.querySelector("#attack_editor #battle_scene_layer");
	_this._battleSceneLayer.style.width = "";
	_this._battleSceneLayer.style.height = "";
	
	document.querySelector("#attack_editor .preview_window").appendChild(document.querySelector("#battle_scene_ui_layer"));
	_this._battleSceneUILayer = document.querySelector("#attack_editor #battle_scene_ui_layer");
	_this._battleSceneUILayer.style.width = "";
	_this._battleSceneUILayer.style.height = "";
	
	document.querySelector("#attack_editor .preview_window").appendChild(document.querySelector("#fade_container"));
	_this._battleSceneFadeLayer = document.querySelector("#attack_editor #fade_container");
	_this._battleSceneFadeLayer.style.width = "";
	_this._battleSceneFadeLayer.style.height = "";
	$battleSceneManager.init();	
	
	this._animationBuilder = $battleSceneManager.getAnimationBuilder();
	_this._animationBuilder.isLoaded().then(function(){
		_this._animationBuilder.saveBackup();	
	});
	
	this.showAttackEditorControls();
	
	document.querySelector("#actor_select").addEventListener("click", function(){
		_this._currentActor = this.value;
	});
	
	document.querySelector("#actor_mech_select").addEventListener("click", function(){
		_this._currentActorMech = this.value;
	});
	
	document.querySelector("#enemy_select").addEventListener("click", function(){
		_this._currentEnemy = this.value;
	});
	
	document.querySelector("#enemy_mech_select").addEventListener("click", function(){
		_this._currentEnemyMech = this.value;
	});

	document.querySelector("#play_button").addEventListener("click", function(){
		$battleSceneManager.resetMaxAnimationTick();
		_this.playBattleScene();
	});
	
	
	
	document.querySelector("#stop_button").addEventListener("click", function(){
		$battleSceneManager.endScene();
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
			content+="<button class='tick_play_button'>Play</button>";				
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
	});	
}

SRWEditor.prototype.processParamInput = function(input){
	var param = input.closest(".command_param").getAttribute("data-param");
	var paramHandlers = {
		position: function(input){
			var container = input.parentNode;
			var x = container.querySelector("input[data-dataid='x']").value;
			var y = container.querySelector("input[data-dataid='y']").value;
			var z = container.querySelector("input[data-dataid='z']").value;
			return {x: x, y: y, z: z};
		},
		startPosition: function(input){
			return this.position(input);
		},
		rotation: function(input){
			var container = input.parentNode;
			var x = container.querySelector("input[data-dataid='x']").value;
			var y = container.querySelector("input[data-dataid='y']").value;
			var z = container.querySelector("input[data-dataid='z']").value;
			return {x: x, y: y, z: z};
		},
		startRotation: function(input){
			return this.position(input);
		},
		duration: function(input){
			return input.value*1;
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
			id: 0,
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
