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
			params: []
		},
		teleport: {
			hasTarget: true,
			params: ["position"]
		},
		rotate_to: {
			hasTarget: true,
			params: ["rotation"]
		},
		translate: {
			hasTarget: true,
			params: ["startPosition", "position", "duration", "easingFunction", "easingMode", "hide", "catmullRom"]
		},
		rotate: {
			hasTarget: true,
			params: ["startRotation", "rotation", "duration", "easingFunction", "easingMode"]
		},
		resize: {
			hasTarget: true,
			params: ["startSize", "endSize", "duration", "easingFunction", "easingMode"]
		},
		flip: {
			hasTarget: true,
			params: ["x", "y"]
		},
		shake: {
			hasTarget: true,
			params: ["magnitude_x", "magnitude_y", "duration", "easingFunction", "easingMode"]
		},
		set_camera_target: {
			hasTarget: true,
			params: []
		},	
	
		set_damage_text: {
			hasTarget: false,
			params: []
		},
		
		set_evade_text: {
			hasTarget: false,
			params: []
		},
		
		set_destroyed_text: {
			hasTarget: false,
			params: []
		},
		
		set_attack_text: {
			hasTarget: false,
			params: []
		},
		clear_attack_text: {
			hasTarget: false,
			params: []
		},
		show_support_defender_text: {
			hasTarget: false,
			params: []
		},
		enable_support_defender: {
			hasTarget: false,
			params: []
		},
		
		disable_support_defender: {
			hasTarget: false,
			params: []
		},		
		fade_in_bg: {
			hasTarget: true,
			params: ["startFade", "endFade", "duration", "easingFunction", "easingMode"]
		},		
		fade_swipe: {
			hasTarget: false,
			params: ["time"]
		},
		fade_white: {
			hasTarget: false,
			params: ["time", "speed", "speedOut"]
		},		
		updateBgMode: {
			hasTarget: true,
			params: []
		},	
		next_phase: {
			hasTarget: false,
			params: ["cleanUpCommands", "commands"]
		},
		dodge_pattern: {
			hasTarget: false,
			params: ["commands"]
		},
		spawn_sprite: {
			hasTarget: true,
			params: ["animationFrames", "animationLoop", "animationDelay"]
		},
		remove_sprite: {
			hasTarget: true,
			params: []
		},
		create_bg: {
			hasTarget: true,
			params: ["path", "position", "size", "alpha", "billboardMode", "rotation", "animationFrames", "frameSize", "lineCount", "columnCount", "animationLoop", "animationDelay"]
		},
		remove_bg: {
			hasTarget: true,
			params: []
		},	
		create_layer: {
			hasTarget: true,
			params: ["path", "isBackground", "frameSize", "lineCount", "columnCount", "animationFrames", "animationLoop", "animationDelay"]
		},
		remove_layer: {
			hasTarget: true,
			params: []
		},	
		create_sky_box: {
			hasTarget: true,
			params: ["path", "color"]
		},
		remove_sky_box: {
			hasTarget: true,
			params: []
		},	
		play_effekseer: {
			hasTarget: true,
			params: ["path", "position", "scale", "speed", "rotation"]
		},		
		hide_effekseer: {
			hasTarget: true,
			params: []
		},
		set_sprite_index: {
			hasTarget: true,
			params: ["index"]
		},
		hide_sprite: {
			hasTarget: true,
			params: []
		},
		show_sprite: {
			hasTarget: true,
			params: []
		},
		hide_bgs: {
			hasTarget: false,
			params: []
		},
		show_bgs: {
			hasTarget: true,
			params: []
		},
		reset_position: {
			hasTarget: true,
			params: ["duration"]
		},
		destroy: {
			hasTarget: true,
			params: []
		},
		show_damage: {
			hasTarget: false,
			params: []
		},
		drain_hp_bar: {
			hasTarget: false,
			params: ["percent","duration"]
		},
		drain_en_bar: {
			hasTarget: false,
			params: ["percent","duration"]
		},
		play_se: {
			hasTarget: false,
			params: ["seId","pitch","volume"]
		},
		kill_se:  {
			hasTarget: false,
			params: []
		},
	};
	_this._paramTooltips = {
		position: "A position defined by an x, y and coordinate.",
		rotation: "A rotation defined by an x, y and component. The rotations are describe with radian values.",
		startPosition: "A position defined by an x, y and coordinate.",
		duration: "The duration of the command in animation ticks.",
		easingFunction: "Descibes how an object moves from point a to point b. If not specified the object will move linearly.",
		easingMode: "In, out or inout. Parameterizes easingFunction.",
		hide: "Hide the target object after the command has finished.",
		catmullRom: "Describes four point for a Catmull-Rom spline.",
		startRotation: "A rotation defined by an x, y and component. The rotations are describe with radian values.",
		startSize: "The initial size of the target object.",
		endSize: "The final size of the target object.",
		x: "If 1 the object will be flipped along its x-axis.",
		y: "If 1 the object will be flipped along its y-axis.",
		magnitude_x: "The severity of the shaking effect along the x-axis.",
		magnitude_y: "The severity of the shaking effect along the y-axis.",
		startFade: "The initial opacity of the object, between 0-1.",
		endFade: "The final opacity of the object, between 0-1.",
		time: "The duration of the command in milliseconds.",
		speed: "The speed of effect.",
		speedIn: "The speed of the fadein 'fast' or 'slow'.",
		speedOut: "The speed of the fadeout 'fast' or 'slow'.",
		cleanUpCommands: "A list of commands to be run to clean up objects before the next phase.",
		commands: "A list of commands to be run to during the phase transition to set up the next phase.",
		animationFrames: "The number of animation frames in the spritesheet.",
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
			var result = "";
			result+="<div class='param_values'>";
			result+="x: <input data-dataid='x' class='param_value param_coord' value='"+(value.x || 0)+"'></input>";
			result+="y: <input data-dataid='y' class='param_value param_coord' value='"+(value.y || 0)+"'></input>";
			result+="z: <input data-dataid='z' class='param_value param_coord' value='"+(value.z || 0)+"'></input>";					
			result+="</div>";
			return result;
		},
		rotation: function(value){
			var result = "";
			result+="<div class='param_values'>";
			result+="x: <input data-dataid='x' class='param_value param_coord' value='"+(value.x || 0)+"'></input>";
			result+="y: <input data-dataid='y' class='param_value param_coord' value='"+(value.y || 0)+"'></input>";
			result+="z: <input data-dataid='z' class='param_value param_coord' value='"+(value.z || 0)+"'></input>";					
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
			result+="<select class='easing_select'>";
			result+="<option  value=''></option>";
			Object.keys(_this._easingFunctions).sort().forEach(function(type){
				result+="<option "+(value == type ? "selected" : "")+" value='"+type+"'>"+type+"</option>";
			});
			result+="</select>";
			return result;
		},
		easingMode: function(value){
			var result = "";			
			result+="<select class='easing_mode_select'>";
			result+="<option value=''></option>";
			Object.keys(_this._easingModes).sort().forEach(function(type){
				result+="<option "+(value == type ? "selected" : "")+" value='"+type+"'>"+_this._easingModes[type]+"</option>";
			});
			result+="</select>";
			return result;
		},
		hide: function(value){
			
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
		
		},
		commands: function(value){
		
		},
		animationFrames: function(value){
		
		},
		animationLoop: function(value){
		
		},
		animationDelay: function(value){
		
		},
		path: function(value){
		
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
	
	this.showAttackEditorControls();

	document.querySelector("#play_button").addEventListener("click", function(){
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
		content+="<button id='copy_def'>Copy</button>";
		content+="<button id='delete_def'>Delete</button>";

		content+="</div>";
		content+="</div>";
		
		content+="<div class='section'>";
		content+="<div class='section_label'>Info</div>";
		content+="<div class='section_content'>";
		content+="Name<input id='def_name' value='"+definitions[_this._currentDefinition].name+"'></input>";
		content+="</div>";
		content+="</div>";
		
		content+="<div class='section'>";
		content+="<div class='section_label'>Commands</div>";
		content+="<div id='timeline_section' class='section_content'>";
		
		content+="Sequence<select id='sequence_select'>";
		_this._sequenceTypes.forEach(function(sequenceInfo){
			content+="<option "+(_this._currentSequenceType == sequenceInfo.id ? "selected" : "")+" value='"+sequenceInfo.id+"'>"+sequenceInfo.name+"</option>";
		});
		content+="</select>";
		
		content+="<div class='commands_scroll'>";
	
		var commands = definitions[_this._currentDefinition].data;
		var sequence = commands[_this._currentSequenceType];
		
		Object.keys(sequence).forEach(function(tick){
			var tickCommands = sequence[tick];
			content+="<div data-tick='"+tick+"' class='tick_block'>";
			content+="<input class='tick_input' value='"+tick+"'></input>";
			var ctr = 0;
			Object.keys(tickCommands).forEach(function(tick){
				var command = tickCommands[tick];
				content+="<div data-cmdidx='"+(ctr++)+"' class='cmd_block'>";
				content+=_this.getCommandContent(command);
				content+="</div>";
			});
			content+="</div>";
		});
		
		content+="</div>";
		content+="</div>";
		
		content+="</div>";
		
		containerNode.querySelector(".edit_controls").innerHTML = content;
		
		containerNode.querySelector(".definition_select").addEventListener("change", function(){
			_this._currentDefinition = this.value;
			_this.showAttackEditorControls();
		});
		
		containerNode.querySelector("#sequence_select").addEventListener("change", function(){
			_this._currentSequenceType = this.value;
			_this.showAttackEditorControls();
		});
		
		containerNode.querySelector("#copy_def").addEventListener("click", function(){
			var newId = _this._animationBuilder.copyDef(_this._currentDefinition);
			_this._currentDefinition = newId;
			_this.showAttackEditorControls();
		});
		containerNode.querySelector("#delete_def").addEventListener("click", function(){
			if(confirm("Delete the current definition?")){
				_this._animationBuilder.deleteDef(_this._currentDefinition);
				_this._currentDefinition = 0;
				_this.showAttackEditorControls();
			}			
		});
		
		containerNode.querySelector("#def_name").addEventListener("blur", function(){
			_this._animationBuilder.updateName(_this._currentDefinition, this.value);
			_this.showAttackEditorControls();
		});
		
	});	
}

SRWEditor.prototype.getCommandDisplayInfo = function(command){
	var _this = this;
	
	if(_this._commandDisplayInfo[command]){
		return _this._commandDisplayInfo[command]
	} else {
		return {
			hasTarget: true,
			params: []
		};
	}
}

SRWEditor.prototype.getCommandContent = function(command){
	var _this = this;
	var result = "";
	var displayInfo = _this.getCommandDisplayInfo(command.type);
	
	result+="<div class='command_type command_row'><div class='command_label'>Command:</div>"+_this.getCommandSelect(command.type)+"</div>";
	if(displayInfo.hasTarget){
		result+="<div class='command_target command_row'><div class='command_label'>Target: </div><input class='target_input' value='"+command.target+"'></input>"+_this.getTargetSelect(command.target)+"</div>";
	}
	if(displayInfo.params.length){
		result+="<div class='command_row'>";
		result+="<div class='params_label'>Parameters</div>";
		var params = command.params;
		displayInfo.params.forEach(function(param){
			var value = params[param];
			result+="<div data-param='"+param+"' class='command_param'>";
			result+="<div title='"+(_this._paramTooltips[param] || "")+"' class='param_label'>"+param+": </div>";
			result+=_this.getParamContent(param, value);
			result+="</div>";
		});
		result+="</div>";
	}
	return result;
}

SRWEditor.prototype.getCommandSelect = function(command){
	var _this = this;
	var result = "";
	result+="<select class='command_select'>";
	Object.keys(_this._commandDisplayInfo).sort().forEach(function(type){
		result+="<option "+(command == type ? "selected" : "")+" value='"+type+"'>"+type+"</option>";
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
		
		$gameMap._interpreter.playBattleScene({
			enemyFirst: _this._enemySideAttack, // if 0 the actor will move first, if 1 the enemy will move first. This also affects the supports. If 0, the actor support will be attacking otherwise defending. If 1, the enemy support will be attacking otherwise defending.
			songId: "Battle1", // the id of the song that should be played during the battle scene
			actor: {
				id: 1, // the id of the actor pilot
				action: _this._enemySideAttack ? "defend" : "attack", // the action the actor will take: "attack", "defend", "evade". 
				weapon: 1, // the id of the attack the actor will use. Only used if the action is "attack".
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
				id: 1, // the id of the enemy pilot
				mechId: 10, // the id of the enemy mech
				weapon: 6, // the id of the attack the actor will use. Only used if the action is "attack".
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
