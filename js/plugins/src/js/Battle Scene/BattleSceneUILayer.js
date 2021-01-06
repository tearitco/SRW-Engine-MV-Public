import Window_CSS from "../SRW Menus/Window_CSS.js";
import "./style/BattleSceneUILayer.css";

export default function BattleSceneUILayer() {
	this.initialize.apply(this, arguments);	
	this._currentName = "";
	this._currentText = ""; 
	this._currentIconClassId = -1; //debug
	this._currentEntityType = "";
	this._allyStatData = {HP:{max: 50000, current: 23000}, EN: {max: 200, current: 173}};
	this._enemyStatData = {HP:{max: 50000, current: 23000}, EN: {max: 200, current: 173}};
	
	this._currentActor;
	this._currentEnemy;
}

BattleSceneUILayer.prototype = Object.create(Window_CSS.prototype);
BattleSceneUILayer.prototype.constructor = BattleSceneUILayer;

BattleSceneUILayer.prototype.initialize = function() {	
	var _this = this;
	this._layoutId = "battle_scene_ui_layer";	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	
	window.addEventListener("resize", function () {
		_this.redraw();
	});
}

BattleSceneUILayer.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	this._textDisplay = document.createElement("div");
	this._textDisplay.id = this.createId("text_display");		
	windowNode.appendChild(this._textDisplay);
	
	this._damageDisplay = document.createElement("div");
	this._damageDisplay.id = this.createId("damage_display");	
	this._damageDisplay.classList.add("scaled_text");
	windowNode.appendChild(this._damageDisplay);
	
	this._allyStats = document.createElement("div");
	this._allyStats.id = this.createId("ally_stats");
	this._allyStats.classList.add("stats_container");
	windowNode.appendChild(this._allyStats);
	
	this._enemyStats = document.createElement("div");
	this._enemyStats.id = this.createId("enemy_stats");
	this._enemyStats.classList.add("stats_container");
	windowNode.appendChild(this._enemyStats);	
	
	this._allyNotification = document.createElement("div");
	this._allyNotification.id = this.createId("ally_notification");
	this._allyNotification.classList.add("notification");
	this._allyNotification.classList.add("scaled_text");
	windowNode.appendChild(this._allyNotification);
	
	this._enemyNotification = document.createElement("div");
	this._enemyNotification.id = this.createId("enemy_notification");
	this._enemyNotification.classList.add("notification");
	this._enemyNotification.classList.add("scaled_text");
	windowNode.appendChild(this._enemyNotification);
}	

BattleSceneUILayer.prototype.createStatsRowContent = function(label, labelFirst) {
	var content = "";
	if(labelFirst){
		content+="<div class='label scaled_text'>"
		content+=label
		content+="</div>"
	}
	
	content+="<div class='values scaled_text'>"
	content+="<div class='current value'>"
	//content+=stats.current+"/";
	content+="</div>"
	content+="<div class='max value'>"
	//content+=stats.max;
	content+="</div>"
	content+="</div>"
	
	content+="<div class='bar scaled_text'>"
	content+="<div style='width: ' class='fill'>";//"+((stats.current /stats.max) * 100)+"%
	
	content+="</div>"
		
	content+="</div>"
	if(!labelFirst){
		content+="<div class='label scaled_text'>"
		content+=label
		content+="</div>"	
	}
	
	return content;
}

BattleSceneUILayer.prototype.animateHP = function(target, oldPercent, newPercent, duration) {
	var _this = this;
	var maxValue;
	var isHidden;
	if(target == "actor"){
		maxValue = $statCalc.getCalculatedMechStats(_this._currentActor.ref).maxHP;
		isHidden = !$statCalc.isRevealed(_this._currentActor.ref);
		_this._allyStatData.HP.max = maxValue;
		_this._allyStatData.HP.current = Math.floor(maxValue / 100 * newPercent);
	}
	if(target == "enemy"){
		maxValue = $statCalc.getCalculatedMechStats(_this._currentEnemy.ref).maxHP;
		isHidden = !$statCalc.isRevealed(_this._currentEnemy.ref);
		_this._enemyStatData.HP.max = maxValue;
		_this._enemyStatData.HP.current = Math.floor(maxValue / 100 * newPercent);
	}
	var elems = _this.getStatElements(target, "HP");
	_this.animateStat(elems, maxValue, oldPercent, newPercent, duration, target, "HP", isHidden);
}

BattleSceneUILayer.prototype.animateEN = function(target, oldPercent, newPercent, duration) {
	var _this = this;
	var maxValue;
	var isHidden;
	if(target == "actor"){
		maxValue = $statCalc.getCalculatedMechStats(_this._currentActor.ref).maxEN;
		isHidden = !$statCalc.isRevealed(_this._currentActor.ref);
		_this._allyStatData.EN.max = maxValue;
		_this._allyStatData.EN.current = Math.floor(maxValue / 100 * newPercent);
	}
	if(target == "enemy"){
		maxValue = $statCalc.getCalculatedMechStats(_this._currentEnemy.ref).maxEN;
		isHidden = !$statCalc.isRevealed(_this._currentEnemy.ref);
		_this._enemyStatData.EN.max = maxValue;
		_this._enemyStatData.EN.current = Math.floor(maxValue / 100 * newPercent);
	}
	var elems = _this.getStatElements(target, "EN");
	_this.animateStat(elems, maxValue, oldPercent, newPercent, duration, target, "EN", isHidden);
}

BattleSceneUILayer.prototype.animateStat = function(elems, maxValue, oldPercent, newPercent, duration, target, type, isHidden) {
	var _this = this;
	var ticks = duration / 10;
	var oldValue = maxValue / 100 * oldPercent;
	var newValue = maxValue / 100 * newPercent;
	var direction = Math.sign(newValue - oldValue);		
	var tickValue = Math.abs((oldValue - newValue) / ticks);
	var currentTick = 0;
	if(_this.animationInterval){
		clearInterval(_this.animationInterval);
	}
	_this.animationInterval = setInterval(function(){		
		var currentVal = oldValue+Math.floor(tickValue * currentTick * direction)
		if(((oldValue < newValue) && currentVal <= newValue) || ((oldValue > newValue) && currentVal >= newValue)){		
			if(type == "HP" && newValue <= 100000){ 
				isHidden = false;
				if(target == "actor"){
					$statCalc.setRevealed(_this._currentActor.ref);
					_this.setStat(_this._currentActor, "EN");
				}
				if(target == "enemy"){
					$statCalc.setRevealed(_this._currentEnemy.ref);
					_this.setStat(_this._currentEnemy, "EN");
				}		
				
			}
			_this.updateStatContent(elems, maxValue, currentVal, type, isHidden);
		} else {
			_this.updateStatContent(elems, maxValue, newValue, type, isHidden);
			clearInterval(_this.animationInterval);
		}		
		currentTick++;
	}, 10);
}

BattleSceneUILayer.prototype.getStatElements = function(target, type) {
	var rowClass;
	var label;
	var bar;
	var maxLabel;
	if(type == "HP"){
		rowClass = "hp_row";
	} 
	if(type == "EN"){
		rowClass = "en_row";
	} 
	if(target == "actor"){
		label = this._allyStats.querySelector("."+rowClass+" .current");
		maxLabel = this._allyStats.querySelector("."+rowClass+" .max");
		bar = this._allyStats.querySelector("."+rowClass+" .bar .fill");
	}
	if(target == "enemy"){
		label = this._enemyStats.querySelector("."+rowClass+" .current");
		maxLabel = this._enemyStats.querySelector("."+rowClass+" .max");
		bar = this._enemyStats.querySelector("."+rowClass+" .bar .fill");
	}
	return {
		label: label,
		bar: bar,
		maxLabel: maxLabel
	}
}

BattleSceneUILayer.prototype.setStat = function(effect, type) {
	var _this = this;
	var stats = $statCalc.getCalculatedMechStats(effect.ref);
	var maxValue;
	var value;
	var target;
	var isHidden;
	if(effect.side == "actor"){
		target = "actor";
		_this._currentActor = effect;		
	} else {
		target = "enemy";
		_this._currentEnemy = effect;
	}
	if(type == "HP"){
		maxValue = stats.maxHP;
		value = stats.currentHP;
	} else {
		maxValue = stats.maxEN;
		value = stats.currentEN;
	}
	isHidden = !$statCalc.isRevealed(effect.ref);
	var elems = _this.getStatElements(target, type);	
	this.updateStatContent(elems, maxValue, value, type, isHidden);
}

BattleSceneUILayer.prototype.updateStatContent = function(elems, maxValue, value, type, isHidden) {
	var _this = this;
	var currentVal;
	var maxVal;
	if(isHidden){
		if(type == "EN"){
			currentVal = "???";
			maxVal = "???";
		} else {
			currentVal = "?????";
			maxVal = "?????";
		}
	} else {
		currentVal = Math.round(value);
		maxVal = Math.round(maxValue);
	}
	elems.label.innerHTML = currentVal+"/";
	elems.maxLabel.innerHTML = maxVal;
	elems.bar.style.width = Math.round(value / maxValue * 100) + "%";
}

BattleSceneUILayer.prototype.resetTextBox = function(){
	this._currentEntityType = -1;
	this._currentIconClassId = -1;
	this._currentName = "";
	this._currentText = {}; 	
	this.showTextBox();
}

BattleSceneUILayer.prototype.setTextBox = function(entityType, entityId, displayName, textInfo){
	this._currentEntityType = entityType;
	this._currentIconClassId = entityId;
	this._currentName = displayName;
	this._currentText = textInfo; 	
	this.showTextBox();
}

BattleSceneUILayer.prototype.showAllyNotification = function(text){
	this.setNotification("actor", text);
}

BattleSceneUILayer.prototype.showEnemyNotification = function(text){
	this.setNotification("enemy", text);
}

BattleSceneUILayer.prototype.setNotification = function(side, text){
	var _this = this;
	if(side == "actor"){
		this._allyNotification.innerHTML = text;
		setTimeout(function(){_this._allyNotification.innerHTML = "";}, 1000);
	} else {
		this._enemyNotification.innerHTML = text;
		setTimeout(function(){_this._enemyNotification.innerHTML = "";}, 1000);
	}
}

BattleSceneUILayer.prototype.showDamage = function(entityType, amount){
	var _this = this;
	this._damageDisplay.innerHTML = amount;
	this._damageDisplay.className = "scaled_text";
	this._damageDisplay.style.display = "block";
	if(entityType == "actor"){		
		this._damageDisplay.classList.add("forActor");
	} 
	if(entityType == "enemy"){		
		this._damageDisplay.classList.add("forEnemy");
	}
	this._damageDisplay.classList.add("shake");
	setTimeout(function(){_this._damageDisplay.style.display = "none";}, 700);
}

BattleSceneUILayer.prototype.showTextBox = function() {
	var textDisplayContent = "";
	textDisplayContent+="<div id='icon_and_noise_container'>";
	textDisplayContent+="<div id='icon_container'></div>";
	
	textDisplayContent+="<canvas width=144 height=144 id='noise'></canvas>";
	textDisplayContent+="</div>";
	
	textDisplayContent+="<div id='name_container' class='text_container scaled_text'>";	
	textDisplayContent+=this._currentName;
	textDisplayContent+="</div>";
	textDisplayContent+="<div id='text_container' class='text_container scaled_text'>";	
	textDisplayContent+="\u300C "+(this._currentText.text || "")+" \u300D";
	textDisplayContent+="</div>";
	
	this._textDisplay.innerHTML = textDisplayContent;
	this.updateScaledDiv(this._textDisplay, true, false);
	
	var iconContainer = this._textDisplay.querySelector("#icon_and_noise_container");
	this.updateScaledDiv(iconContainer);

	
	this._noiseCanvas = this._textDisplay.querySelector("#noise");
	this._noiseCtx = this._noiseCanvas.getContext("2d");
	
	if(this._currentIconClassId != -1 && this._currentEntityType != -1){
		var actorIcon = this._container.querySelector("#icon_container");
		/*if(this._currentEntityType == "actor"){
			this.loadActorFace(this._currentIconClassId, actorIcon);
		} else {
			this.loadEnemyFace(this._currentIconClassId, actorIcon);
		}*/	
		this.loadFaceByParams(this._currentText.faceName, this._currentText.faceIndex, actorIcon);	
	}	
	
	Graphics._updateCanvas();
	
	//this.showNoise();//debug
}

BattleSceneUILayer.prototype.showNoise = function() {
	var _this = this;
	_this._runNoise = true;
	var iconContainer = this._container.querySelector("#icon_container");
	iconContainer.className = "";
	iconContainer.classList.add("shake");
	
	this._noiseCanvas.className = "";
	this._noiseCanvas.classList.add("fade_in");
	this._noiseCanvas.classList.add("active");
	function noise(){	
		if(_this._noiseCtx){
			var imgd = _this._noiseCtx.createImageData(_this._noiseCanvas.width, _this._noiseCanvas.height);
			var pix = imgd.data;

			for (var i = 0, n = pix.length; i < n; i += 4) {
			// var c = 7 + Math.sin(i/50000 + time/7); // A sine wave of the form sin(ax + bt)
				pix[i] = pix[i+1] = pix[i+2] = 255 * Math.random() + 50; // Set a random gray
				pix[i+3] = 255; // 100% opaque
			}

			_this._noiseCtx.putImageData(imgd, 0, 0);
			//time = (time + 1) % canvas.height;
		
		}
		if(_this._runNoise){
			requestAnimationFrame(noise);
		}		
	}
	requestAnimationFrame(noise);
}

BattleSceneUILayer.prototype.hideNoise = function() {
	this._runNoise = false;
	this._noiseCanvas.className = "";
}	

BattleSceneUILayer.prototype.redraw = function() {	
	var _this = this;
	_this.showTextBox();	
	
	
	//_this.updateScaledImage(_this._spiritAnimImage);
	//_this.updateScaledDiv(_this._spiritAnim);
	
	
	
	var allyStatsContent = "";
	allyStatsContent+="<div class='hp_row'>"
	
	allyStatsContent+=this.createStatsRowContent("HP");
	
	allyStatsContent+="</div>"
	
	allyStatsContent+="<div class='en_row'>"
	
	allyStatsContent+=this.createStatsRowContent("EN");
	
	allyStatsContent+="</div>"
	this._allyStats.innerHTML = allyStatsContent;
	_this.updateScaledDiv(this._allyStats);
	
	var enemyStatsContent = "";
	enemyStatsContent+="<div class='hp_row'>"
	
	enemyStatsContent+=this.createStatsRowContent("HP", true);
	
	enemyStatsContent+="</div>"
	
	enemyStatsContent+="<div class='en_row'>"
	
	enemyStatsContent+=this.createStatsRowContent("EN", true);
	
	enemyStatsContent+="</div>"
	this._enemyStats.innerHTML = enemyStatsContent;
	_this.updateScaledDiv(this._enemyStats);
	
	
	var bars = this._container.querySelectorAll(".bar");
	bars.forEach(function(bar){
		_this.updateScaledDiv(bar, true, false);
	});
	
	var valueLabels = this._container.querySelectorAll(".values .value");
	valueLabels.forEach(function(valueLabel){
		_this.updateScaledDiv(valueLabel, false, true);
	});
	
	/*this.setStat("actor", "HP", _this._allyStatData.HP.max, _this._allyStatData.HP.current, isHidden);
	this.setStat("actor", "EN", _this._allyStatData.EN.max, _this._allyStatData.EN.current, isHidden);
	
	this.setStat("enemy", "HP", _this._enemyStatData.HP.max, _this._enemyStatData.HP.current, isHidden);
	this.setStat("enemy", "EN", _this._enemyStatData.EN.max, _this._enemyStatData.EN.current, isHidden);*/
	
	_this.updateScaledDiv(this._damageDisplay);
	Graphics._updateCanvas();
}
