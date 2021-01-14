export default function Window_CSS() {
	this.initialize.apply(this, arguments);	
}

Window_CSS.prototype = Object.create(Window_Base.prototype);
Window_CSS.prototype.constructor = Window_CSS;

Window_CSS.prototype.initialize = function() {
	Window_Base.prototype.initialize.call(this, arguments);	
	this._container = document.querySelector("#"+this._layoutId);
	this._redrawRequested = false;
	this._callbacks = {};
	this.createComponents();
}

Window_CSS.prototype.destroy = function() {
	this._callbacks = {};
}

Window_CSS.prototype.registerCallback = function(handle, func) {
	this._callbacks[handle] = func;
};

Window_CSS.prototype.getWindowNode = function() {
	return this._container;
};

Window_CSS.prototype.createId = function(id) {
	return this._layoutId+"_"+id;
};

Window_CSS.prototype.hide = function() {
    this.visible = false;
	this._visibility = "none";
	this.refresh();
};

Window_CSS.prototype.show = function() {
	this.resetSelection();
	this._handlingInput = false;
    this.visible = true;
	this._redrawRequested = true;
	this._visibility = "";
	this.refresh();	
	Graphics._updateCanvas();
};

Window_CSS.prototype.requestRedraw = function() {	
	this._redrawRequested = true;
};

Window_CSS.prototype.validateCurrentSelection = function() {	
	if(this._currentSelection >= this.getCurrentPageAmount()){
		this._currentSelection = this.getCurrentPageAmount() - 1;
	}
};

Window_CSS.prototype.refresh = function() {
	if(this._redrawRequested){
		this._redrawRequested = false;
		this.redraw();		
	}
	this.getWindowNode().style.display = this._visibility;
}
	
Window_CSS.prototype.createComponents = function() {
	var windowNode = this.getWindowNode();
	windowNode.innerHTML = "";	
	windowNode.classList.add("menu_bg");
	this._bgFadeContainer = document.createElement("div");
	this._bgFadeContainer.classList.add("bg_fade_container");
	this._bgTextureContainer = document.createElement("div");
	this._bgTextureContainer.classList.add("bg_container");
	this._bgFadeContainer.appendChild(this._bgTextureContainer);
	windowNode.appendChild(this._bgFadeContainer);
}

Window_CSS.prototype.createEntryList = function(node, listInfo, id) {	
	node.id = this.createId(id);
	node.classList.add("menu_section");
	
	for(var i = 0; i < listInfo.length; i++){
		var div = document.createElement("div");
		div.classList.add("scaled_text");
		div.classList.add("menu_entry");
		if(this._currentKey == listInfo[i].key){
			div.classList.add("selected");
		}
		div.setAttribute("data-key", listInfo[i].key);
		div.innerHTML = listInfo[i].name;
		node.appendChild(div);
	}
}

Window_CSS.prototype.loadEnemyFace = function(actorId, elem) {
	this.loadFace($dataEnemies[actorId], elem);
}

Window_CSS.prototype.loadActorFace = function(actorId, elem) {
	this.loadFace($dataActors[actorId], elem);
}

Window_CSS.prototype.loadFace = function(actorData, elem) {		
	var faceName;
	if(typeof actorData.faceName != "undefined"){
		faceName = actorData.faceName;		
	} else {
		faceName = actorData.meta.faceName;
	}
	var faceIndex;
	if(typeof actorData.faceIndex != "undefined"){
		faceIndex = actorData.faceIndex;		
	} else {
		faceIndex = actorData.meta.faceIndex - 1;
	}
	this.loadFaceByParams(faceName, faceIndex, elem);
}

Window_CSS.prototype.loadFaceByParams = function(faceName, faceIndex, elem) {
	var width = Window_Base._faceWidth;
    var height = Window_Base._faceHeight;
	
	elem.innerHTML = "";
	
	var targetBitmap = new Bitmap(width, height);
	
	var bitmap = ImageManager.loadFace(faceName);	
	bitmap.addLoadListener(function(){
		var pw = Window_Base._faceWidth;
		var ph = Window_Base._faceHeight;
		var sw = Math.min(width, pw);
		var sh = Math.min(height, ph);
		var dx = Math.floor(0 + Math.max(width - pw, 0) / 2);
		var dy = Math.floor(0 + Math.max(height - ph, 0) / 2);
		var sx = faceIndex % 4 * pw + (pw - sw) / 2;
		var sy = Math.floor(faceIndex / 4) * ph + (ph - sh) / 2;   
		
		targetBitmap.blt(bitmap, sx, sy, sw, sh, dx, dy);
		var facePicContainer = document.createElement("div");
		facePicContainer.classList.add("face_pic_container");
		var facePic = document.createElement("img");
		facePic.style.width = "100%";
		facePic.setAttribute("src", targetBitmap.canvas.toDataURL());
		facePicContainer.appendChild(facePic);	
		elem.appendChild(facePicContainer);	
	});
}

Window_CSS.prototype.loadMechMiniSprite = function(mechClass, elem) {
	var overworldSpriteData = $dataClasses[mechClass].meta.srpgOverworld.split(",");
	var characterName = overworldSpriteData[0];
	var characterIndex = overworldSpriteData[1];
	
	elem.innerHTML = "";	

    var bitmap = ImageManager.loadCharacter(characterName);   
	
	bitmap.addLoadListener(function(){
		var big = ImageManager.isBigCharacter(characterName);
		var pw = bitmap.width / (big ? 3 : 12);
		var ph = bitmap.height / (big ? 4 : 8);
		
		var targetBitmap = new Bitmap(pw, ph);
		
		var n = big ? 0: characterIndex;
		var sx = (n % 4 * 3 + 1) * pw;
		var sy = (Math.floor(n / 4) * 4) * ph;
		
		targetBitmap.blt(bitmap, sx, sy, pw, ph, 0, 0); 
		var mechPicContainer = document.createElement("div");
		mechPicContainer.classList.add("mech_pic_container");
		var mechPic = document.createElement("img");
		mechPic.style.width = "100%";
		mechPic.setAttribute("src", targetBitmap.canvas.toDataURL());
		mechPicContainer.appendChild(mechPic);	
		elem.appendChild(mechPicContainer);	
	});	
}

Window_CSS.prototype.getMechDisplayData = function(unit) {
	return unit.SRWStats.mech;
}

Window_CSS.prototype.createUpgradeBar = function(level, pending) {
	var content = "";
	var parts = $statCalc.getMaxUpgradeLevel();
	content+="<div class='upgrade_bar'>";
	for(var i = 0; i < parts; i++){
		var cssClass = "";
		if(i < level){
			cssClass = "active";
		} else if(pending && i < (level + pending)) {
			cssClass = "pending";
		}
		content+="<div class='upgrade_bar_part "+cssClass+"'>";
		content+="</div>";
	}
	content+="</div>";
	return content;
}

Window_CSS.prototype.createUpgradeBarScaled = function(level, pending) {
	var content = "";
	var parts = $statCalc.getMaxUpgradeLevel();
	content+="<div class='upgrade_bar scaled_height'>";
	for(var i = 0; i < parts; i++){
		var cssClass = "";
		if(i < level){
			cssClass = "active";
		} else if(pending && i < (level + pending)) {
			cssClass = "pending";
		}
		content+="<div class='upgrade_bar_part scaled_width "+cssClass+"'>";
		content+="</div>";
	}
	content+="</div>";
	return content;
}

Window_CSS.prototype.createReferenceData = function(mech){
	return {
		SRWStats: {
			pilot: {
				name: "",
				abilities: []
			},
			mech: mech
		},
		SRWInitialized: true,
		isEmpty: true
	}	
}

Window_CSS.prototype.getAvailableUnits = function(){
	if(this._unitMode == "actor"){
		this._availableUnits = $gameSystem._availableUnits;
	} else {
		var tmp = Object.keys($SRWSaveManager.getUnlockedUnits());			
		this._availableUnits = [];
		for(var i = 0; i < tmp.length; i++){
			var currentPilot = $statCalc.getCurrentPilot(tmp[i]);
			if(currentPilot){
				this._availableUnits.push(currentPilot);
			} else {
				var mechData = $statCalc.getMechData($dataClasses[tmp[i]]);
				$statCalc.calculateSRWMechStats(mechData);		
				this._availableUnits.push(this.createReferenceData(mechData));
			}
		}
	}		
	/*this._availableUnits.forEach(function(unit){
		$statCalc.initSRWStats(unit);
	});*/
	return this._availableUnits;
}

Window_CSS.prototype.refreshAllUnits = function(){
	var availableUnits = this.getAvailableUnits();
	availableUnits.forEach(function(unit){
		$statCalc.initSRWStats(unit);
	});
}

Window_CSS.prototype.getNextAvailableUnitGlobal = function(currentUnitId){
	var availableUnits = this.getAvailableUnits();
	var currentIdx = -1;
	var ctr = 0;
	while(ctr < availableUnits.length && currentIdx == -1){
		if(availableUnits[ctr].SRWStats.mech.id == currentUnitId){
			currentIdx = ctr;
		}
		ctr++;
	}
	currentIdx++
	if(currentIdx >= availableUnits.length){
		currentIdx = 0;
	}	
	var currentMech = availableUnits[currentIdx];
	var mechData = this.getMechDisplayData(currentMech);
	var currentPilot = $statCalc.getCurrentPilot(currentMech.SRWStats.mech.id);		
	return {mech: mechData, actor: currentPilot};
}

Window_CSS.prototype.getPreviousAvailableUnitGlobal = function(currentUnitId){
	var availableUnits = this.getAvailableUnits();
	var currentIdx = -1;
	var ctr = 0;
	while(ctr < availableUnits.length && currentIdx == -1){
		if(availableUnits[ctr].SRWStats.mech.id == currentUnitId){
			currentIdx = ctr;
		}
		ctr++;
	}
	currentIdx--;
	if(currentIdx < 0){
		currentIdx = availableUnits.length - 1;
	}
	var currentMech = availableUnits[currentIdx];
	var mechData = this.getMechDisplayData(currentMech);
	var currentPilot = $statCalc.getCurrentPilot(currentMech.SRWStats.mech.id);	
	return {mech: mechData, actor: currentPilot};
}

Window_CSS.prototype.getNextAvailablePilotGlobal = function(currentUnitId){
	var availableUnits = this.getAvailableUnits();
	var currentIdx = -1;
	var ctr = 0;
	while(ctr < availableUnits.length && currentIdx == -1){
		if(availableUnits[ctr].SRWStats.pilot.id == currentUnitId){
			currentIdx = ctr;
		}
		ctr++;
	}
	currentIdx++;
	if(currentIdx >= availableUnits.length){
		currentIdx = 0;
	}
	var actor = availableUnits[currentIdx];
	return {mech: actor.SRWStats.mech, actor: actor};
}

Window_CSS.prototype.getPreviousAvailablePilotGlobal = function(currentUnitId){
	var availableUnits = this.getAvailableUnits();
	var currentIdx = -1;
	var ctr = 0;
	while(ctr < availableUnits.length && currentIdx == -1){
		if(availableUnits[ctr].SRWStats.pilot.id == currentUnitId){
			currentIdx = ctr;
		}
		ctr++;
	}
	currentIdx--;
	if(currentIdx < 0){
		currentIdx = availableUnits.length - 1;
	}
	var actor = availableUnits[currentIdx];
	return {mech: actor.SRWStats.mech, actor: actor};
}

Window_CSS.prototype.resetSelection = function(){
	this._currentSelection = 0;
	this._currentPage = 0;
}

Window_CSS.prototype.updateScaledImage = function(img) {
	img.style.width = (img.naturalWidth * Graphics.getScale()) + "px";
}

Window_CSS.prototype.updateScaledDiv = function(div, noWidth, noHeight) {
	var computedStyle = getComputedStyle(div);
	var originalWidth = div.getAttribute("original-width");
	if(!originalWidth){
		originalWidth = computedStyle.getPropertyValue('--widthpixels');
		if(!originalWidth){
			originalWidth = computedStyle.width.replace("px", "");
		}		
		div.setAttribute("original-width", originalWidth);
	}
	var originalHeight = div.getAttribute("original-height");
	if(!originalHeight){
		originalHeight = computedStyle.getPropertyValue('--heightpixels');
		if(!originalHeight){
			originalHeight = computedStyle.height.replace("px", "");
		}
		div.setAttribute("original-height", originalHeight);
	}
	if(!noWidth){
		div.style.width = (originalWidth * Graphics.getScale()) + "px";
	}
	if(!noHeight){
		div.style.height = (originalHeight * Graphics.getScale()) + "px";
	}	
}


Window_CSS.prototype.assignFactionColorClass = function(elem, ref) {
	elem.classList.add("faction_color");
	elem.classList.remove("ally");
	elem.classList.remove("enemy");
	elem.classList.remove("faction_1");
	elem.classList.remove("faction_2");
	if(ref.isActor()){
		elem.classList.add("ally");
	} else {
		if(ref.factionId == 0){
			elem.classList.add("enemy");
		}
		if(ref.factionId == 1){
			elem.classList.add("faction_1");
		}
		if(ref.factionId == 2){
			elem.classList.add("faction_2");
		}
	}
}

Window_CSS.prototype.applyDoubleTime = function(el) {	
	if(this._doubleSpeedEnabled){
		var compStyle = window.getComputedStyle(el, null);
		var duration = compStyle.getPropertyValue("animation-duration").replace(/s/g, "").replace(/\s/g, "");
		var parts = duration.split(",");
		for(var i = 0; i < parts.length; i++){
			parts[i] = parts[i] / 2 + "s";
		}
		el.style["animation-duration"] = parts.join(",");
	} else {
		el.style["animation-duration"] = "";
	}
}

Window_CSS.prototype.getAnimTimeRatio = function() {	
	if(this._doubleSpeedEnabled){
		return 0.5;
	}
	return 1;
}