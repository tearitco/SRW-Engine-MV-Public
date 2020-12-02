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
		content+="<div class='section_content'>";
		
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
	var displayInfo = {
		
	};
	if(displayInfo[command]){
		return displayInfo[command]
	} else {
		return {
			hasTarget: true,
			hasParams: true
		};
	}
}

SRWEditor.prototype.getCommandContent = function(command){
	var _this = this;
	var result = "";
	var displayInfo = _this.getCommandDisplayInfo(command);
	
	result+="<div class='command_type command_row'><div class='command_label'>Command:</div><input class='type_input' value='"+command.type+"'></input></div>";
	if(displayInfo.hasTarget){
		result+="<div class='command_target command_row'><div class='command_label'>Target: </div><input class='target_input' value='"+command.target+"'></input></div>";
	}
	if(displayInfo.hasParams){
		result+="<div class='command_row'>";
		result+="<div class='params_label'>Parameters</div>";
		var params = command.params;
		Object.keys(params).forEach(function(param){
			result+="<div data-param='"+param+"' class='command_param'>";		
			if(_this._paramHandlers[param]){
				result = _this._commandHandlers[command.type]
			} else {
				result+="???";
			}
			result+="</div>";
		});
		result+="</div>";
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
