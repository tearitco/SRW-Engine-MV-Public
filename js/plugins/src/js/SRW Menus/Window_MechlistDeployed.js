import Window_CSS from "./Window_CSS.js";
import MechList from "./MechList.js"
import DetailBarMech from "./DetailBarMech.js";
import DetailBarPilot from "./DetailBarPilot.js";

export default function Window_MechListDeployed() {
	this.initialize.apply(this, arguments);	
}

Window_MechListDeployed.prototype = Object.create(Window_CSS.prototype);
Window_MechListDeployed.prototype.constructor = Window_MechListDeployed;

Window_MechListDeployed.prototype.initialize = function() {
	
	this._layoutId = "mech_list_deployed";	
	this._pageSize = 1;
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
}

Window_MechListDeployed.prototype.getAvailableUnits = function(){
	var _this = this;
	var deployInfo = $gameSystem.getDeployInfo()
	this._availableUnits = [];
	Object.keys(deployInfo.assigned).forEach(function(slot){
		_this._availableUnits.push($gameActors.actor(deployInfo.assigned[slot]));
	});
	return this._availableUnits;
}

Window_MechListDeployed.prototype.rowEnabled = function(actor){
	return true;
}

Window_MechListDeployed.prototype.getCurrentSelection = function(){
	return this._mechList.getCurrentSelection();
	
}

Window_MechListDeployed.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML =  APPSTRINGS.MECHLIST.title;	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	this._listContainer = document.createElement("div");
	this._listContainer.classList.add("list_container");
	windowNode.appendChild(this._listContainer);	
	
	this._detailContainer = document.createElement("div");
	this._detailContainer.classList.add("list_detail");
	windowNode.appendChild(this._detailContainer);	
	
	this._detailPilotContainer = document.createElement("div");
	this._detailPilotContainer.classList.add("list_detail");
	windowNode.appendChild(this._detailPilotContainer);	
	
	this._mechList = new MechList(this._listContainer, [0, 1, 2, 3], this);
	this._mechList.createComponents();
	this._detailBarMech = new DetailBarMech(this._detailContainer, this);
	this._detailBarMech.createComponents();
	this._detailBarPilot = new DetailBarPilot(this._detailPilotContainer, this);	
}	

Window_MechListDeployed.prototype.update = function() {
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
			$gameTemp.pushMenu = "detail_pages";	
		}
		if(Input.isTriggered('cancel')){		
			SoundManager.playCancel();		
			$gameTemp.popMenu = true;

			if(this._callbacks["closed"]){
				this._callbacks["closed"]();
			}	
		}		
		
		this.refresh();
	}		
};

Window_MechListDeployed.prototype.redraw = function() {
	this._mechList.redraw();
	this._detailBarMech.redraw();		
	this._detailBarPilot.redraw();
	
	if(this._mechList.getCurrentInfoPage() == 0){
		this._detailBarPilot.hide();
		this._detailBarMech.show();
	} else {
		this._detailBarPilot.show();
		this._detailBarMech.hide();
	}

	Graphics._updateCanvas();
}