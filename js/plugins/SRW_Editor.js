function SRWEditor(){
	
}

SRWEditor.prototype.init = function(){
	var _this = this;
	var head  = document.getElementsByTagName('head')[0];
	var link  = document.createElement('link');
	link.rel  = 'stylesheet';
	link.type = 'text/css';
	link.href = 'editor/editor.css';
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
	content+="<img id='play_button' src='editor/svg/play-button.svg'>";
	
	content+="<img id='stop_button' src='editor/svg/pause-button.svg'>";
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
