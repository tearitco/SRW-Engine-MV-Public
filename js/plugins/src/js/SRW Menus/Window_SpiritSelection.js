import Window_CSS from "./Window_CSS.js";
import "./style/Window_SpiritSelection.css";

export default function Window_SpiritSelection() {
	this.initialize.apply(this, arguments);	
}

Window_SpiritSelection.prototype = Object.create(Window_CSS.prototype);
Window_SpiritSelection.prototype.constructor = Window_SpiritSelection;

Window_SpiritSelection.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "spirit_selection";	
	this._currentSelection = 0;
	this._maxSelection = 6;
	this._selectionRowSize = 3;
	this._currentActor = 0;
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
}

Window_SpiritSelection.prototype.getMaxActor = function(){
	return this.getAvailableActors().length;
}

Window_SpiritSelection.prototype.resetSelection = function(){
	this._currentSelection = 0;
	this._currentPage = 0;
	this._currentActor = 0;
	this._currentBatchInfo = {};
	this._currentBatchedSpirits = {};
}

Window_SpiritSelection.prototype.incrementSelection = function(){	
	if(this._currentSelection == this._maxSelection) {
		return;
	}
	if((this._currentSelection + 1) % this._selectionRowSize == 0) {
		return;
	}
	this._currentSelection++;
	SoundManager.playCursor();
	if(this._currentSelection >= this._maxSelection){
		this._currentSelection = 0;
	}	
}

Window_SpiritSelection.prototype.decrementSelection = function(){	
	if(this._currentSelection == 0) {
		return;
	}
	if((this._currentSelection) % this._selectionRowSize == 0) {
		return;
	}
	this._currentSelection--;
	SoundManager.playCursor();
	if(this._currentSelection < 0){
		this._currentSelection = this._maxSelection - 1;
	}	 
}

Window_SpiritSelection.prototype.incrementPage = function(){		
	if(this._currentSelection+this._selectionRowSize < this._maxSelection){
		this._currentSelection+=this._selectionRowSize;
		SoundManager.playCursor();
	} else if(this._currentActor + 1 < this.getMaxActor()){
		this._currentSelection-=this._selectionRowSize;
		this._currentActor++;
		SoundManager.playCursor();
	}
}

Window_SpiritSelection.prototype.decrementPage = function(){		
	if(this._currentSelection-this._selectionRowSize >= 0){
		this._currentSelection-=this._selectionRowSize;
		SoundManager.playCursor();
	} else if(this._currentActor > 0){
		this._currentSelection+=this._selectionRowSize;
		this._currentActor--;
		SoundManager.playCursor();
	}	 
}

Window_SpiritSelection.prototype.getCurrentSelection = function(){
	return this._currentSelection;	
}

Window_SpiritSelection.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	var windowNode = this.getWindowNode();
	
	
	this._bgFadeContainer.innerHTML = "";	
}	




Window_SpiritSelection.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){	
		
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			this.requestRedraw();
			this.incrementSelection();

		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			this.requestRedraw();			
			this.decrementSelection();
		}			

		if(Input.isTriggered('left') || Input.isRepeated('left')){
			this.requestRedraw();
			this.decrementPage();
		} else if (Input.isTriggered('right') || Input.isRepeated('right')) {
			this.requestRedraw();
			this.incrementPage();
		}
		
		if(Input.isTriggered('ok')){			
			var actor = this.getAvailableActors()[this._currentActor];
			var currentLevel = $statCalc.getCurrentLevel(actor);
			var spiritList = $statCalc.getSpiritList(actor);
			var selectedIdx = this.getCurrentSelection();
		
			if(spiritList[selectedIdx] && spiritList[selectedIdx].level <= currentLevel && this.getSpiritEnabledState(selectedIdx) > 0){
				var spirits = [];				
				var type = $spiritManager.getSpiritDef(spiritList[selectedIdx].idx).targetType;
				
				if(type == "self"){
					this._currentBatchedSpirits[spiritList[selectedIdx].idx] = {actor: actor, spiritInfo: spiritList[selectedIdx]};
					Object.keys(this._currentBatchedSpirits).forEach(function(spiritIdx){
						var info = _this._currentBatchedSpirits[spiritIdx];
						var spiritInfo = JSON.parse(JSON.stringify(info.spiritInfo));
						spiritInfo.caster = info.actor;
						spiritInfo.target = $gameTemp.currentMenuUnit.actor;
						spirits.push(spiritInfo);						
					});
					if(_this._callbacks["selectedMultiple"]){
						_this._callbacks["selectedMultiple"](spirits);
					}
				} else {
					var spiritInfo = JSON.parse(JSON.stringify(spiritList[selectedIdx]));
					spiritInfo.caster = actor;
					spiritInfo.target = $gameTemp.currentMenuUnit.actor;
					if(this._callbacks["selected"]){
						this._callbacks["selected"](spiritInfo);
					}
				}	
				
				$gameTemp.popMenu = true;	
				
				
			}
		}
		
		if(Input.isTriggered('shift')){				
			//$gameTemp.popMenu = true;	
			var actor = this.getAvailableActors()[this._currentActor];
			var currentLevel = $statCalc.getCurrentLevel(actor);
			var spiritList = $statCalc.getSpiritList(actor);
			var selectedIdx = this.getCurrentSelection();
			var type = $spiritManager.getSpiritDef(spiritList[selectedIdx].idx).targetType;
			
			if(spiritList[selectedIdx] && spiritList[selectedIdx].level <= currentLevel && type == "self"){
				if(!this._currentBatchInfo[_this._currentActor]){
					this._currentBatchInfo[_this._currentActor] = {};
				}
				if(this._currentBatchInfo[_this._currentActor][selectedIdx]){
					delete this._currentBatchInfo[_this._currentActor][selectedIdx];
					delete this._currentBatchedSpirits[spiritList[selectedIdx].idx];
				} else if(this.getSpiritEnabledState(selectedIdx) > 0){
					this._currentBatchInfo[_this._currentActor][selectedIdx] = true;
					this._currentBatchedSpirits[spiritList[selectedIdx].idx] = {actor: actor, spiritInfo: spiritList[selectedIdx]};
				}				
				if(!Object.keys(this._currentBatchInfo[_this._currentActor]).length){
					delete this._currentBatchInfo[_this._currentActor];
				}				
				this.requestRedraw();
			}
		}
		
		if(Input.isTriggered('cancel')){				
			//$gameTemp.popMenu = true;	
			$gameTemp.popMenu = true;	
			
			if(this._callbacks["closed"]){
				this._callbacks["closed"]();
			}
		}		
		
		this.refresh();
	}		
};

Window_SpiritSelection.prototype.getSpiritEnabledState = function(listIdx){
	var result = 1;
	var caster = this.getAvailableActors()[this._currentActor];
	var target = $gameTemp.currentMenuUnit.actor;
	var list = $statCalc.getSpiritList(caster);
	
	var pendingBatchCost = 0;
	
	if(this._currentBatchInfo[this._currentActor]){
		Object.keys(this._currentBatchInfo[this._currentActor]).forEach(function(listIdx){
			if(listIdx < list.length){
				var selectedSpirit = list[listIdx];
				pendingBatchCost+=selectedSpirit.cost;
			}			
		});
	}
	
	if(listIdx < list.length){	
		var selectedSpirit = list[listIdx];
		var spiritDisplayInfo = $spiritManager.getSpiritDisplayInfo(selectedSpirit.idx);
		if(!spiritDisplayInfo.enabledHandler(target)){
			result = -1;
		} else if(selectedSpirit.cost > $statCalc.getCalculatedPilotStats(caster).currentSP - pendingBatchCost && (this._currentBatchedSpirits[selectedSpirit.idx] == null || this._currentBatchedSpirits[selectedSpirit.idx].actor.actorId() != caster.actorId())){
			result = -2;
		} else if(this._currentBatchedSpirits[selectedSpirit.idx] != null && this._currentBatchedSpirits[selectedSpirit.idx].actor.actorId() != caster.actorId()){
			result = -1;
		} else if(Object.keys(this._currentBatchedSpirits).length && $spiritManager.getSpiritDef(selectedSpirit.idx).targetType != "self"){
			result = -1;
		}
	} else {
		result = -1;
	}
	return result;
}

Window_SpiritSelection.prototype.getAvailableActors = function() {
	var actor = $gameTemp.currentMenuUnit.actor;
	var subPilotIds = $statCalc.getSubPilots(actor);
	var subPilots = [];
	for(var i = 0; i < subPilotIds.length; i++){
		subPilots.push($gameActors.actor(subPilotIds[i]));
	}
	return [actor].concat(subPilots);
}	

Window_SpiritSelection.prototype.redraw = function() {	
	var _this = this;
	var content = "";	
	var availableActors = this.getAvailableActors();
	var actor = availableActors[this._currentActor];
	
	var calculatedStats = actor.SRWStats.pilot.stats.calculated;
	var spiritList = $statCalc.getSpiritList(actor);
	var currentLevel = $statCalc.getCurrentLevel(actor);
	content+="<div class='spirit_selection_content'>";
	content+="<div class='spirit_selection_row spirit_selection'>";
	//content+="<div id='spirit_selection_icons_container'>";//icons container
	content+="<div id='previous_selection_icon'></div>";//icon 	
	content+="<div id='spirit_selection_icon'></div>";//icon 	
	content+="<div id='next_selection_icon'></div>";//icon 	
	//content+="</div>";
	content+="<div class='scaled_text' id='spirit_selection_SP_display'>SP "+(calculatedStats.currentSP + "/" + calculatedStats.SP)+"</div>";//icon 
	content+="<div class='spirit_selection_block scaled_text fitted_text'>";	
	var selectedIdx = this.getCurrentSelection();
	if(spiritList[selectedIdx]){
		if(spiritList[selectedIdx].level <= currentLevel){
			var displayInfo = $spiritManager.getSpiritDisplayInfo(spiritList[selectedIdx].idx);
			content+=displayInfo.desc;	
		}
	}	
	
	content+="</div>";
	content+="</div>";
	
	content+="<div class='spirit_selection_row details'>";
	
	
	content+="<div class='spirit_list_container'>";
	content+="<div class='spirit_list'>";
	content+="<div class='section_column'>";
	
	
	for(var i = 0; i < this._maxSelection; i++){
		var displayName = "---";
		var isDisplayed = false;
		if(i != 0 && i % this._selectionRowSize == 0){
			content+="</div>"
			content+="<div class='section_column'>";
		}
		if(typeof spiritList[i] != "undefined" && spiritList[i].level <= currentLevel){
			var displayInfo = $spiritManager.getSpiritDisplayInfo(spiritList[i].idx);
			displayName = "<div class='scaled_width spirit_label fitted_text'>"+displayInfo.name+"</div>("+spiritList[i].cost+")" ;
			isDisplayed = true;
		}
		
		var displayClass = "";
		var enabledState = this.getSpiritEnabledState(i);
		if(enabledState == -1 || !isDisplayed){
			displayClass = "disabled";
		} else if(enabledState == -2){
			displayClass = "insufficient";
		}		
		
		var targetType = $spiritManager.getSpiritDef(spiritList[i].idx).targetType;
		
		var isBatched = false;
		if(this._currentBatchInfo[_this._currentActor]){ 
			if(this._currentBatchInfo[_this._currentActor][i]){
				isBatched = true;
				displayClass = "batched";
			}			
		}
		
		
		
		content+="<div class='row scaled_text "+displayClass+"'>";
		
		content+="<div class='multi_select_check "+(isBatched ? "enabled" : "")+" "+(targetType == "self" && isDisplayed ? "available" : "")+"'>";
		content+="</div>";
		
		content+="<div class='column "+(i == _this._currentSelection ? "selected" : "")+"'>";
		content+=displayName;
		content+="</div>";
		content+="</div>";
	}
	content+="</div>";
	content+="</div>";
	content+="</div>";
	
	content+="</div>";
	content+="</div>";
	_this._bgFadeContainer.innerHTML = content;
	
	this.updateScaledDiv(_this._bgFadeContainer);
	this.updateScaledDiv(_this._bgFadeContainer.querySelector("#spirit_selection_icon"));
	this.updateScaledDiv(_this._bgFadeContainer.querySelector("#previous_selection_icon"));
	this.updateScaledDiv(_this._bgFadeContainer.querySelector("#next_selection_icon"));
	
	var actorIcon = this._bgFadeContainer.querySelector("#spirit_selection_icon");
	this.loadActorFace(actor.actorId(), actorIcon);
	
	if(availableActors[this._currentActor-1]){
		actorIcon = this._bgFadeContainer.querySelector("#previous_selection_icon");
		this.loadActorFace(availableActors[this._currentActor-1].actorId(), actorIcon);
	}
	
	if(availableActors[this._currentActor+1]){
		actorIcon = this._bgFadeContainer.querySelector("#next_selection_icon");
		this.loadActorFace(availableActors[this._currentActor+1].actorId(), actorIcon);
	}
	
	var multiChecks = _this._bgFadeContainer.querySelectorAll(".multi_select_check");
	multiChecks.forEach(function(multiCheck){
		_this.updateScaledDiv(multiCheck);
	});
	Graphics._updateCanvas();
}

