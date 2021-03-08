import Window_CSS from "./Window_CSS.js";
import MechList from "./MechList.js"
import DetailBarMech from "./DetailBarMech.js";
import DetailBarPilot from "./DetailBarPilot.js";

export default function Window_SelectReassignMech() {
	this.initialize.apply(this, arguments);	
}

Window_SelectReassignMech.prototype = Object.create(Window_CSS.prototype);
Window_SelectReassignMech.prototype.constructor = Window_SelectReassignMech;

Window_SelectReassignMech.prototype.initialize = function() {
	this._availableUnits = [];
	this._layoutId = "mech_reassign_select";	
	this._pageSize = 1;
	this._unitMode = "mech";
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
}

Window_SelectReassignMech.prototype.getAvailableUnits = function(){
	var _this = this;
	
	var availableMechs = Window_CSS.prototype.getAvailableUnits.call(this);
	var tmp = [];	
	
	availableMechs.forEach(function(unit){
		if(unit.SRWStats.mech.allowedPilots.length){
			tmp.push(unit);
		}
	});
	
	return tmp;
}

Window_SelectReassignMech.prototype.rowEnabled = function(actor){
	var lockedMechs = {};
	var deployInfo = $gameSystem.getDeployInfo();
	
	Object.keys(deployInfo.assigned).forEach(function(slot){
		if(deployInfo.lockedSlots[slot]){
			lockedMechs[$gameActors.actor(deployInfo.assigned[slot]).SRWStats.mech.id] = true;
		}
	});
	
	return !lockedMechs[actor.SRWStats.mech.id];
}

Window_SelectReassignMech.prototype.getCurrentSelection = function(){
	return this._mechList.getCurrentSelection();
	
}

Window_SelectReassignMech.prototype.setCurrentSelection = function(value){
	this._mechList.setCurrentSelection(value);
}

Window_SelectReassignMech.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML =  APPSTRINGS.REASSIGN.mech_title;	
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
	
	this._mechList = new MechList(this._listContainer, [0], this);
	this._mechList.createComponents();
	this._detailBarMech = new DetailBarMech(this._detailContainer, this);
	this._detailBarMech.createComponents();
	this._detailBarPilot = new DetailBarPilot(this._detailPilotContainer, this);
}	

Window_SelectReassignMech.prototype.update = function() {
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
			if(this.rowEnabled(this.getCurrentSelection().actor)){
				SoundManager.playOk();
				$gameTemp.reassignTargetMech = {type: "main", id: this.getCurrentSelection().mech.id};
				$gameTemp.pushMenu = "pilot_reassign_select";
			} else {
				SoundManager.playBuzzer();
			}			
		}
		if(Input.isTriggered('cancel')){		
			SoundManager.playCancel();		
			$gameTemp.popMenu = true;	
			$gameTemp.reassignTargetMech = null;
		}		
		
		this.refresh();
	}		
};

Window_SelectReassignMech.prototype.redraw = function() {
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