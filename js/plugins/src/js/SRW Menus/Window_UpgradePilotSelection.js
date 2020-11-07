import Window_CSS from "./Window_CSS.js";
import MechList from "./MechList.js"
import DetailBarPilotDetail from "./DetailBarPilotDetail.js";
import "./style/PilotUpgradeSelection.css"

export default function Window_UpgradePilotSelection() {
	this.initialize.apply(this, arguments);	
}

Window_UpgradePilotSelection.prototype = Object.create(Window_CSS.prototype);
Window_UpgradePilotSelection.prototype.constructor = Window_UpgradePilotSelection;

Window_UpgradePilotSelection.prototype.initialize = function() {
	
	this._layoutId = "pilot_upgrade_list";	
	this._pageSize = 1;
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
}

Window_UpgradePilotSelection.prototype.getCurrentSelection = function(){
	return this._mechList.getCurrentSelection();
	
}

Window_UpgradePilotSelection.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.PILOTUPGRADES.select_title;	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	this._listContainer = document.createElement("div");
	this._listContainer.classList.add("list_container");
	windowNode.appendChild(this._listContainer);	
	
	this._detailContainer = document.createElement("div");
	this._detailContainer.classList.add("list_detail");
	windowNode.appendChild(this._detailContainer);	
	
	this._mechList = new MechList(this._listContainer, [9]); //
	this._mechList.setUnitModeActor();
	this._mechList.createComponents();
	this._mechList.setMaxPageSize(4);
	this._detailBarPilotDetail = new DetailBarPilotDetail(this._detailContainer, this);
	this._detailBarPilotDetail.createComponents();
}	

Window_UpgradePilotSelection.prototype.update = function() {
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			SoundManager.playCursor();
			this.requestRedraw();
			this._mechList.incrementSelection();
		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			SoundManager.playCursor();
			this.requestRedraw();
		    this._mechList.decrementSelection();
		}			

		if(Input.isTriggered('left') || Input.isRepeated('left')){
			this.requestRedraw();
			this._mechList.decrementPage();
		} else if (Input.isTriggered('right') || Input.isRepeated('right')) {
			this.requestRedraw();
		    this._mechList.incrementPage();
		}
		
		if(Input.isTriggered('left_trigger') || Input.isRepeated('left_trigger')){
			this.requestRedraw();
			this._mechList.decrementInfoPage();
		} else if (Input.isTriggered('right_trigger') || Input.isRepeated('right_trigger')) {
			this.requestRedraw();
			this._mechList.incrementInfoPage();
		}
		
		if(Input.isTriggered('pageup') || Input.isRepeated('pageup')){
			this.requestRedraw();
			this._mechList.decrementSortIdx();
		} else if (Input.isTriggered('pagedown') || Input.isRepeated('pagedown')) {
			this.requestRedraw();
			this._mechList.incrementSortIdx();
		}
		
		if(Input.isTriggered('L3')){
			this.requestRedraw();
			this._mechList.toggleSortOrder();			
		} 	
		
		if(Input.isTriggered('ok')){
			/*if(this._internalHandlers[this._currentKey]){
				this._handlingInput = true;
				this._internalHandlers[this._currentKey].call(this);
			}*/
			SoundManager.playOk();
			$gameTemp.currentMenuUnit = this.getCurrentSelection();
			$gameTemp.pushMenu = "upgrade_pilot";
		}
		if(Input.isTriggered('cancel')){	
			SoundManager.playCancel();
			$gameTemp.popMenu = true;	
		}		
		
		this.refresh();
	}		
};

Window_UpgradePilotSelection.prototype.redraw = function() {
	this._mechList.redraw();
	this._detailBarPilotDetail.redraw();		

	Graphics._updateCanvas();
}