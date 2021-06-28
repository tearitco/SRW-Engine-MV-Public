import Window_CSS from "./Window_CSS.js";
import "./style/Window_Options.css"

export default function Window_Options() {
	this.initialize.apply(this, arguments);	
}

Window_Options.prototype = Object.create(Window_CSS.prototype);
Window_Options.prototype.constructor = Window_Options;

Window_Options.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "options";	
	this._pageSize = 1;
	this._optionInfo = [];
	/*this._optionInfo.push({
		name: APPSTRINGS.OPTIONS.label_display,
		display: function(){
			
		},
		update: function(){
			
		}
	});*/
	
	this._optionInfo.push({
		name: APPSTRINGS.OPTIONS.label_grid,
		display: function(){
			return $gameSystem.optionDisableGrid ? "OFF" : "ON";
		},
		update: function(){
			$gameSystem.optionDisableGrid = !$gameSystem.optionDisableGrid;
		}
	});
	
	this._optionInfo.push({
		name: APPSTRINGS.OPTIONS.label_will,
		display: function(){
			return $gameSystem.showWillIndicator ? "ON" : "OFF";
		},
		update: function(){
			$gameSystem.showWillIndicator = !$gameSystem.showWillIndicator;
		}
	});
	
	this._optionInfo.push({
		name: APPSTRINGS.OPTIONS.label_default_support,
		display: function(){
			return $gameSystem.optionDefaultSupport ? APPSTRINGS.OPTIONS.label_default_support_on : APPSTRINGS.OPTIONS.label_default_support_off;
		},
		update: function(){
			$gameSystem.optionDefaultSupport = !$gameSystem.optionDefaultSupport;
		}
	});
	
	this._optionInfo.push({
		name: APPSTRINGS.OPTIONS.label_skip_move,
		display: function(){
			return $gameSystem.optionSkipUnitMoving ? "ON" : "OFF";
		},
		update: function(){
			$gameSystem.optionSkipUnitMoving = !$gameSystem.optionSkipUnitMoving;
		}
	});
	
	this._optionInfo.push({
		name: APPSTRINGS.OPTIONS.label_battle_bgm,
		display: function(){
			return $gameSystem.optionBattleBGM ? APPSTRINGS.OPTIONS.label_bgm_unit : APPSTRINGS.OPTIONS.label_bgm_map;
		},
		update: function(){
			$gameSystem.optionBattleBGM = !$gameSystem.optionBattleBGM;
		}
	});
	
	this._optionInfo.push({
		name: APPSTRINGS.OPTIONS.label_after_battle_bgm,
		display: function(){
			return $gameSystem.optionAfterBattleBGM ? APPSTRINGS.OPTIONS.label_bgm_unit : APPSTRINGS.OPTIONS.label_bgm_map;
		},
		update: function(){
			$gameSystem.optionAfterBattleBGM = !$gameSystem.optionAfterBattleBGM;
		}
	});
	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
}


Window_Options.prototype.resetSelection = function(){	
	this._currentSelection = 0;
		
}

Window_Options.prototype.getCurrentSelection = function(){
	var unit = $gameTemp.currentMenuUnit;	
	if(this._subPilotIdx != 0){
		var subPilots = $statCalc.getSubPilots(unit.actor);
		var subPilotId = subPilots[this._subPilotIdx - 1];
		if(subPilotId != null){
			unit = {actor: $gameActors.actor(subPilotId), mech: unit.actor.SRWStats.mech};
		}
	}
	return unit;
}

Window_Options.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.SEARCH.title;	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	this._listContainer = document.createElement("div");
	this._listContainer.classList.add("list_container");
	windowNode.appendChild(this._listContainer);	
	
}	

Window_Options.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){
	
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			this.requestRedraw();
			if(this._uiState == "entry_selection"){
				var referenceLength;
				if(!(this._currentEntries.length % this._rowSize)){
					referenceLength = this._currentEntries.length;
				} else {
					referenceLength = Math.floor((this._currentEntries.length + this._rowSize) / this._rowSize) * this._rowSize;
				}
				if(this._currentSelection + this._rowSize < referenceLength - 1){
					SoundManager.playCursor();
					this._currentSelection+=this._rowSize;
					if(this._currentSelection >= this._currentEntries.length){
						this._currentSelection = this._currentEntries.length - 1;
					}
				} 
			}
		
		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			this.requestRedraw();
			if(this._uiState == "entry_selection"){
				if(this._currentSelection - this._rowSize >= 0){
					SoundManager.playCursor();
					this._currentSelection-=this._rowSize;
				} 
			}
		}
		
		
					

		if(Input.isTriggered('left') || Input.isRepeated('left')){
			this.requestRedraw();
			if(this._uiState == "tab_selection"){
				this._selectedTab--;
				if(this._selectedTab < 0){
					this._selectedTab = this._tabInfo.length-1;
				}
			} else {
				if(!(this._currentSelection % this._rowSize)){
					this._currentSelection+=(this._rowSize - 1);
				} else {
					this._currentSelection--;
				}				
				if(this._currentSelection >= this._currentEntries.length){
					this._currentSelection = this._currentEntries.length - 1;
				}
			}
			SoundManager.playCursor();
					
		} else if (Input.isTriggered('right') || Input.isRepeated('right')) {
			this.requestRedraw();
			if(this._uiState == "tab_selection"){
				this._selectedTab++;
				if(this._selectedTab > this._tabInfo.length-1){
					this._selectedTab = 0;
				}
			} else {
				if(!((this._currentSelection + 1) % this._rowSize)){
					this._currentSelection-=(this._rowSize - 1);
				} else {
					this._currentSelection++;
				}				
				if(this._currentSelection >= this._currentEntries.length){
					this._currentSelection = Math.floor(this._currentEntries.length / this._rowSize) * this._rowSize;
				}
			}
			SoundManager.playCursor();
				
		}
		
		if(Input.isTriggered('left_trigger') || Input.isRepeated('left_trigger')){
			this.requestRedraw();
			
			
		} else if (Input.isTriggered('right_trigger') || Input.isRepeated('right_trigger')) {
			this.requestRedraw();
			
		}
		
		
		if(Input.isTriggered('L3')){
			this.requestRedraw();
			
		} 	
		
		if(Input.isTriggered('ok')){
			if(this._uiState == "tab_selection"){
				SoundManager.playOk();
				this.requestRedraw();
				this._uiState = "entry_selection";
			} else if(this.validateEntry(this._currentSelection)){
				SoundManager.playOk();
				$gameTemp.searchInfo = {};
				$gameTemp.searchInfo.value = this._currentEntries[this._currentSelection].id;
				if(this._selectedTab == 0){
					$gameTemp.searchInfo.type = "spirit";
				}
				if(this._selectedTab == 1){
					$gameTemp.searchInfo.type = "pilot";
				}
				if(this._selectedTab == 2){
					$gameTemp.searchInfo.type = "mech";
				}
				/*$gameTemp.mechListWindowCancelCallback = function(){
					
				}*/
				$gameTemp.mechListWindowSearchSelectionCallback = function(actor){
					$gameTemp.mechListWindowSearchSelectionCallback = null;
					_this._uiState = "tab_selection";
					$gameTemp.killMenu("search");						
					if(_this._callbacks["selected"]){
						_this._callbacks["selected"](actor);
					}	
				}
				this._uiState = "pending_selection";
				$gameTemp.pushMenu = "mech_list_deployed";
			} else {
				SoundManager.playBuzzer();
			}
		}
		
		if(Input.isTriggered('menu')){
			
		}	
		
		if(Input.isTriggered('cancel')){	
			SoundManager.playCancel();
			$gameTemp.searchInfo = null;
			if(this._uiState == "tab_selection"){
				$gameTemp.popMenu = true;				
				if(this._callbacks["closed"]){
					this._callbacks["closed"]();
				}					
			} else if(this._uiState == "pending_selection"){
				this.requestRedraw();
				this._uiState = "tab_selection";
			} else {
				this.requestRedraw();
				this._currentSelection = 0;
				this._uiState = "tab_selection";
			}			
		}				
		
		this.refresh();
	}		
};

Window_Options.prototype.redraw = function() {
	
	Graphics._updateCanvas();
}