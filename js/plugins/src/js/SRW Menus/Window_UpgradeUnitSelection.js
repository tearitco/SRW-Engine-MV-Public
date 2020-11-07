import Window_CSS from "./Window_CSS.js";
import MechList from "./MechList.js";
import DetailBarMechUpgrades from "./DetailBarMechUpgrades.js";

export default function Window_UpgradeUnitSelection() {
	this.initialize.apply(this, arguments);	
}

Window_UpgradeUnitSelection.prototype = Object.create(Window_CSS.prototype);
Window_UpgradeUnitSelection.prototype.constructor = Window_UpgradeUnitSelection;

Window_UpgradeUnitSelection.prototype.initialize = function() {	
	this._layoutId = "upgrade_unit_selection";	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
}

Window_UpgradeUnitSelection.prototype.getCurrentSelection = function(){
	return this._mechList.getCurrentSelection();	
}

Window_UpgradeUnitSelection.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.MECHUPGRADES.select_title;	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	this._listContainer = document.createElement("div");
	this._listContainer.classList.add("list_container");
	windowNode.appendChild(this._listContainer);	
	
	this._detailContainer = document.createElement("div");
	this._detailContainer.classList.add("list_detail");
	windowNode.appendChild(this._detailContainer);	

	this._mechList = new MechList(this._listContainer, [0, 4]);
	this._mechList.createComponents();
	this._DetailBarMechUpgrades = new DetailBarMechUpgrades(this._detailContainer, this);
}	

Window_UpgradeUnitSelection.prototype.update = function() {
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
			SoundManager.playOk();
			$gameTemp.currentMenuUnit = this.getCurrentSelection();
			$gameTemp.pushMenu = "upgrade_mech";
		}
		if(Input.isTriggered('cancel')){	
			SoundManager.playCancel();		
			$gameTemp.popMenu = true;	
		}		
		
		this.refresh();
	}		
};

Window_UpgradeUnitSelection.prototype.redraw = function() {
	this._mechList.redraw();
	this._DetailBarMechUpgrades.redraw();		
	

	Graphics._updateCanvas();
}

