import Window_CSS from "./Window_CSS.js";
import MechList from "./MechList.js"
import DetailBarMech from "./DetailBarMech.js";
import DetailBarPilot from "./DetailBarPilot.js";

export default function Window_SelectReassignPilot() {
	this.initialize.apply(this, arguments);	
}

Window_SelectReassignPilot.prototype = Object.create(Window_CSS.prototype);
Window_SelectReassignPilot.prototype.constructor = Window_SelectReassignPilot;

Window_SelectReassignPilot.prototype.initialize = function() {
	this._availableUnits = [];
	this._layoutId = "pilot_reassign_select";	
	this._pageSize = 1;
	this._unitMode = "actor";
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
}

Window_SelectReassignPilot.prototype.getAvailableUnits = function(){
	var _this = this;
	
	var assignablePilotLookup = {};
	
	var availablePilots = Window_CSS.prototype.getAvailableUnits.call(this);
	var tmp = [];	
	
	if($gameTemp.reassignTargetMech){
		var target = $gameTemp.reassignTargetMech;
		var mechId = target.id;

		var mechData = $statCalc.getMechData($dataClasses[mechId], true);
		mechData.allowedPilots.forEach(function(id){
			assignablePilotLookup[id] = true;
		});
		
		/*var currentPilot = $statCalc.getCurrentPilot(mechId);
		if(currentPilot){
			assignablePilotLookup[currentPilot.SRWStats.pilot.id] = false;
		}*/
	}	
	
	availablePilots.forEach(function(unit){
		if(assignablePilotLookup[unit.SRWStats.pilot.id]){
			tmp.push(unit);
		}
	});
	
	return tmp;
}

Window_SelectReassignPilot.prototype.rowEnabled = function(actor){
	var lockedPilots = {};
	var deployInfo = $gameSystem.getDeployInfo();
	
	Object.keys(deployInfo.assigned).forEach(function(slot){
		if(deployInfo.lockedSlots[slot]){
			lockedPilots[$gameActors.actor(deployInfo.assigned[slot]).SRWStats.pilot.id] = true;
		}
	});
	
	return !lockedPilots[actor.SRWStats.pilot.id];
}

Window_SelectReassignPilot.prototype.getCurrentSelection = function(){
	return this._mechList.getCurrentSelection();
	
}

Window_SelectReassignPilot.prototype.setCurrentSelection = function(value){
	this._mechList.setCurrentSelection(value);
}

Window_SelectReassignPilot.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML =  APPSTRINGS.REASSIGN.pilot_title;	
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
	
	this._mechList = new MechList(this._listContainer, [5], this);
	this._mechList.createComponents();
	this._detailBarMech = new DetailBarMech(this._detailContainer, this);
	this._detailBarMech.createComponents();
	this._detailBarPilot = new DetailBarPilot(this._detailPilotContainer, this);
}	

Window_SelectReassignPilot.prototype.update = function() {
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
			if(this.rowEnabled(this.getCurrentSelection().actor) && $gameTemp.reassignTargetMech){
				SoundManager.playOk();
				var target = $gameTemp.reassignTargetMech;
				var mechId = target.id;
				if(target.type == "main"){
					var targetPilot = this.getCurrentSelection().actor;
					var currentPilot = $statCalc.getCurrentPilot(mechId);
					if(currentPilot){
						currentPilot._classId = 0;
						$statCalc.initSRWStats(currentPilot);						
						$gameSystem.clearActorDeployInfo(currentPilot.actorId());
					}					
					targetPilot._classId = mechId;
					$statCalc.initSRWStats(targetPilot);
					$gameSystem.clearActorDeployInfo(targetPilot.actorId());
					$gameTemp.popMenu = true;	
				}
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

Window_SelectReassignPilot.prototype.redraw = function() {
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