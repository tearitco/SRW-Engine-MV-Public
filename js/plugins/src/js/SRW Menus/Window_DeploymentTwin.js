import Window_CSS from "./Window_CSS.js";
import DetailBarMechDetail from "./DetailBarMechDetail.js";
import "./style/Window_Deployment.css"

export default function Window_DeploymentTwin() {
	this.initialize.apply(this, arguments);	
}

Window_DeploymentTwin.prototype = Object.create(Window_CSS.prototype);
Window_DeploymentTwin.prototype.constructor = Window_DeploymentTwin;

Window_DeploymentTwin.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "deployment";	
	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
	this._UIState = "select_deploy_slot";
	this._rearrageRowSize = 5;
	
	this._availableRowSize = 4;
	
	this._deployedRowOffset = 0;
	this._deployedSelection = 0;
	
	this._maxAvailableSlots = 6 * this._availableRowSize;
	this._availableRowOffset = 0;
	this._rearrageSelection = 0;
	
	this._swapSource = -1;
}

Window_DeploymentTwin.prototype.resetSelection = function(){
	this._currentSelection = 0;
	this._currentPage = 0;
	this._swapSource = -1;
	this._rearrageSelection = 0;
}

Window_DeploymentTwin.prototype.getMaxDeploySlots = function(){
	return 40 * 2;
}

Window_DeploymentTwin.prototype.getCurrentSelection = function(){
	return $gameTemp.currentMenuUnit;
	
}

Window_DeploymentTwin.prototype.createComponents = function() {
	var _this = this;
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	windowNode.classList.add("twin");
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.DEPLOYMENT.title;	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	this._deployedList = document.createElement("div");
	this._deployedList.classList.add("scrolled_list");
	this._deployedList.classList.add("deployed_list");
	windowNode.appendChild(this._deployedList);	
	
	this._detailBarMechDetail = new DetailBarMechDetail(this._deployedList, {
		getCurrentSelection: function(){
			var actorId;
			var activeElem = _this._availableList.querySelector(".active");
			if(activeElem){
				actorId = activeElem.getAttribute("data-actorid");
			}
			
			var pilotData;
			if(actorId)	{
				pilotData = $gameActors.actor(actorId);
			}
			return {actor: pilotData, mech: pilotData.SRWStats.mech};
		}
	});
	this._detailBarMechDetail.createComponents();
	
	/*this._deployedListLabel = document.createElement("div");
	this._deployedListLabel.classList.add("deployed_list_label");
	this._deployedListLabel.classList.add("list_label");
	this._deployedListLabel.classList.add("scaled_text");
	this._deployedListLabel.innerHTML = APPSTRINGS.DEPLOYMENT.order;
	windowNode.appendChild(this._deployedListLabel);	*/
	
	this._availableList = document.createElement("div");
	this._availableList.classList.add("scrolled_list");
	this._availableList.classList.add("available_list");
	windowNode.appendChild(this._availableList);	
	
	this._availableListLabel = document.createElement("div");
	this._availableListLabel.classList.add("available_list_label");
	this._availableListLabel.classList.add("list_label");
	this._availableListLabel.classList.add("scaled_text");
	//this._availableListLabel.innerHTML = APPSTRINGS.DEPLOYMENT.available;
	windowNode.appendChild(this._availableListLabel);
	
	this._pilotInfoDisplay = document.createElement("div");	
	this._pilotInfoDisplay.classList.add("pilot_info");	
	windowNode.appendChild(this._pilotInfoDisplay);
	
}	

Window_DeploymentTwin.prototype.getCurrentSelection = function() {	
	return this._rearrageSelection;	
}

Window_DeploymentTwin.prototype.setCurrentSelection = function(value) {	
	this._rearrageSelection = value;	
}

Window_DeploymentTwin.prototype.getMaxRowSize = function() {
	return this._rearrageRowSize*2;
}

Window_DeploymentTwin.prototype.getCurrentRowSize = function() {
	return this._rearrageRowSize*2;
}

Window_DeploymentTwin.prototype.getCurrentRowIndex = function() {
	var row = Math.floor(this.getCurrentSelection() / this.getMaxRowSize()) + 1;
	return this.getMaxRowSize() - ((row * this.getMaxRowSize()) - this.getCurrentSelection());
}

Window_DeploymentTwin.prototype.incrementRow = function() {	
	var maxDeploySlots = this.getMaxDeploySlots()
	if(this.getCurrentSelection() + this.getMaxRowSize() < maxDeploySlots){
		this.setCurrentSelection(this.getCurrentSelection() + this.getMaxRowSize());
	}
}

Window_DeploymentTwin.prototype.decrementRow = function() {
	if(this.getCurrentSelection() - this.getMaxRowSize() >= 0){
		this.setCurrentSelection(this.getCurrentSelection() - this.getMaxRowSize());
	}  
}

Window_DeploymentTwin.prototype.incrementColumn = function() {	
	if((this.getCurrentRowIndex() % this.getCurrentRowSize() + 1) < this.getCurrentRowSize()){
		this.setCurrentSelection(this.getCurrentSelection() + 1);
	}		
}

Window_DeploymentTwin.prototype.decrementColumn = function() {	
	if((this.getCurrentRowIndex() % this.getCurrentRowSize() - 1) >= 0){		
		this.setCurrentSelection(this.getCurrentSelection() - 1);
	}		
}

Window_DeploymentTwin.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			this.requestRedraw();
		
			SoundManager.playCursor();
			this.incrementRow();			
		
		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			this.requestRedraw();
		    
			SoundManager.playCursor();
			this.decrementRow();			
		}			

		if(Input.isTriggered('left') || Input.isRepeated('left')){
			this.requestRedraw();
			SoundManager.playCursor();
			this.decrementColumn();
			
		} else if (Input.isTriggered('right') || Input.isRepeated('right')) {
			this.requestRedraw();
			SoundManager.playCursor();
			this.incrementColumn();
		}
		
		if(Input.isTriggered('left_trigger') || Input.isRepeated('left_trigger')){
			this.requestRedraw();
			
		} else if (Input.isTriggered('right_trigger') || Input.isRepeated('right_trigger')) {
			this.requestRedraw();
			
		}
		
		if(Input.isTriggered('pageup') || Input.isRepeated('pageup')){
			this.requestRedraw();			
		} else if (Input.isTriggered('pagedown') || Input.isRepeated('pagedown')) {
			this.requestRedraw();			
		}
		
		if(Input.isTriggered('L3')){
			this.requestRedraw();
			
		} 	
		
		if(Input.isTriggered('ok')){	
			//if(this._UIState == "rearrange_slots"){
				var currentSelection = this._availableList.querySelector(".active");
				if(currentSelection){				
					var isLocked = currentSelection.getAttribute("data-islocked") * 1;
					this.requestRedraw();
					var deployInfo = $gameSystem.getDeployInfo();
					if(isLocked){
						SoundManager.playBuzzer();
					} else {
						var swapSelection = this._availableList.querySelector(".swap");
						if(!swapSelection){
							this._swapSource = this._rearrageSelection;
						} else if(this._swapSource != this._rearrageSelection){	
							var sourceActorId = swapSelection.getAttribute("data-actorid") * 1;
							var targetActorId = currentSelection.getAttribute("data-actorid") * 1;
							
							var targetSlot = Math.floor(_this._rearrageSelection / 2);
							var sourceSlot = Math.floor(_this._swapSource / 2);
						
							if(_this._rearrageSelection / 2 <= deployInfo.count || _this._swapSource / 2 <= deployInfo.count){
								var sourceInfo;
								var targetInfo;	
								
								if(!(_this._rearrageSelection % 2)){
									targetInfo = deployInfo.assigned;								
								} else {
									//if(deployInfo.assigned[targetSlot] == null){
									//	targetInfo = deployInfo.assigned;		
									//} else {
										targetInfo = deployInfo.assignedSub;		
									//}									
								}
								if(!(_this._swapSource % 2)){
									sourceInfo = deployInfo.assigned;								
								} else {
									sourceInfo = deployInfo.assignedSub;		
								}
								
								if(_this._rearrageSelection / 2 <= deployInfo.count){
									if(sourceActorId != -1){
										targetInfo[targetSlot] = sourceActorId;
									} else {
										delete targetInfo[targetSlot];
									}
								}
								
								if(_this._swapSource / 2 <= deployInfo.count){
									if(targetActorId != -1){
										sourceInfo[sourceSlot] = targetActorId;
									} else {
										delete sourceInfo[sourceSlot];
									}
								}
								
								if(!deployInfo.assigned[targetSlot] && deployInfo.assignedSub[targetSlot]){
									deployInfo.assigned[targetSlot] = deployInfo.assignedSub[targetSlot];
									delete deployInfo.assignedSub[targetSlot];
								}
								if(!deployInfo.assigned[sourceSlot] && deployInfo.assignedSub[sourceSlot]){
									deployInfo.assigned[sourceSlot] = deployInfo.assignedSub[sourceSlot];
									delete deployInfo.assignedSub[sourceSlot];
								}
								
								this.updateDeployInfo(deployInfo);
							} 
							
							//var twinInfo = $gameSystem.getTwinInfo();
							//var isTwinInfo = $gameSystem.getIsTwinInfo();
							var preferredSlotInfo = $gameSystem.getPreferredSlotInfo();
							
							/*if(sourceActorId != -1){
								if(!(_this._swapSource % 2)){
									delete isTwinInfo[sourceActorId];								
								} else {
									isTwinInfo[sourceActorId] = true;	
								}
							}
							
							if(targetActorId != -1){
								if(!(_this._rearrageSelection % 2)){
									delete isTwinInfo[targetActorId];								
								} else {
									isTwinInfo[targetActorId] = true;	
								}
							}*/
							
							Object.keys(preferredSlotInfo).forEach(function(slot){
								var info = preferredSlotInfo[slot];
								
								if(info.main == sourceActorId || info.main == targetActorId){
									info.main = -1;
								}
								if(info.sub == sourceActorId || info.sub == targetActorId){
									info.sub = -1;
								}
							});
							
							if(!preferredSlotInfo[targetSlot]){
								preferredSlotInfo[targetSlot] = {
									main: -1,
									sub: -1
								};
							}							
							if(sourceActorId != -1){
								if(!(_this._rearrageSelection % 2)){
									preferredSlotInfo[targetSlot].main = sourceActorId;								
								} else {
									preferredSlotInfo[targetSlot].sub = sourceActorId;			
								}								
							}
							
							if(!preferredSlotInfo[sourceSlot]){
								preferredSlotInfo[sourceSlot] = {
									main: -1,
									sub: -1
								};
							}
							if(targetActorId != -1){								
								if(!(_this._swapSource % 2)){
									preferredSlotInfo[sourceSlot].main = targetActorId;								
								} else {
									preferredSlotInfo[sourceSlot].sub = targetActorId;			
								}
							}							
							
							this._swapSource = -1;
						}
						SoundManager.playOk();
					}
				}				
			/*} else {
				var availableUnits = this.getAvailableUnits();
				var slotLookup = this.getSlotLookup();
				var deployInfo = $gameSystem.getDeployInfo();
				var actorId = availableUnits[this._deployedSelection].actorId()
				var slot = slotLookup[actorId];
				var ctr = 0;
				while(ctr < deployInfo.count && typeof slot == "undefined"){
					if(!deployInfo.assigned[ctr]){
						slot = ctr;
					}
					ctr++;
				}
				if(typeof slot == "undefined" || deployInfo.lockedSlots[slot] || $statCalc.isShip($gameActors.actor(actorId))){
					SoundManager.playBuzzer();
				} else {
					this.requestRedraw();
					if(typeof deployInfo.assigned[slot] == "undefined"){
						deployInfo.assigned[slot] = actorId;
					} else {
						delete deployInfo.assigned[slot];
					}
					this.updateDeployInfo(deployInfo);
				}	
			}*/
					
		}
		
		if(Input.isTriggered('shift')){
			if(this._UIState == "select_deploy_slot"){
				var availableUnits = this.getAvailableUnits();
				var deployInfo = $gameSystem.getDeployInfo();
				var actorId = availableUnits[this._deployedSelection].actorId();
				if(!$statCalc.isShip($gameActors.actor(actorId))){
					deployInfo.favorites[actorId] = !deployInfo.favorites[actorId];		
					this.requestRedraw();	
					this.updateDeployInfo(deployInfo);
				}				
			}
		}
		
		if(Input.isTriggered('cancel')){	
			this.onCancel();	
		}
		if(Input.isTriggered('menu')){	
			this.onMenu();	
		}		
		
		this.refresh();
	}		
};

Window_DeploymentTwin.prototype.onCancel = function() {
	SoundManager.playCancel();
	if(this._UIState == "rearrange_slots" && this._swapSource != -1){
		this._swapSource = -1;
		this.requestRedraw();
	} else {
		$gameTemp.popMenu = true;
		this._slotLookup = null;
		this._availableUnits = null;
	}
}

Window_DeploymentTwin.prototype.onMenu = function(){
	
}

Window_DeploymentTwin.prototype.updateDeployInfo = function(deployInfo) {
	$gameSystem.setDeployInfo(deployInfo);
	this._slotLookup = null;
}

Window_DeploymentTwin.prototype.getAvailableUnits = function() {
	var candidates = $gameSystem.getAvailableUnits();	
	var tmp = [];
	candidates.forEach(function(candidate){
		if($statCalc.isValidForDeploy(candidate)){
			tmp.push(candidate);
		}
	});
	return tmp;
}

Window_DeploymentTwin.prototype.getSlotLookup = function() {
	if(!this._slotLookup) {
		var deployInfo = $gameSystem.getDeployInfo();
		var slotLookup = {};
		Object.keys(deployInfo.assigned).forEach(function(slot){
			slotLookup[deployInfo.assigned[slot]] = slot;
		});
		this._slotLookup = slotLookup;
	}
	return this._slotLookup;
}

Window_DeploymentTwin.prototype.redraw = function() {
	var _this = this;
	var windowNode = this.getWindowNode();
	var deployInfo = $gameSystem.getDeployInfo();
	var slotLookup = _this.getSlotLookup();
	var deployedContent = "";
	
	function createTwinEntry(actorId, subActorId, slot, idx){
		var content = "";
		var displayClass = "";
		
		if(2 * idx == _this._swapSource){
			displayClass = "swap";
		} else if(2 * idx == _this._rearrageSelection){
			displayClass = "active";
		}
		
		content+="<div  class='twin "+(slot != null ? "deployable" : "")+" "+(deployInfo.lockedSlots[slot] ? "locked" : "")+"'>"
		if(listedUnits[actorId]){
			actorId = null;
		}
		content+="<div data-islocked='"+(deployInfo.lockedSlots[slot] ? 1 : 0)+"' data-actorid='"+(actorId || -1)+"'  class='entry "+displayClass+"'>"
		//var actorId = deployInfo.assigned[i];
		if(actorId != null && !listedUnits[actorId] && $statCalc.isValidForDeploy($gameActors.actor(actorId))){
			listedUnits[actorId] = true;
			var menuImagePath = $statCalc.getMenuImagePath($gameActors.actor(actorId));
			content+="<img class='actor_img' src='img/"+menuImagePath+"'>";
			

				
		}
		content+="</div>";
		
		displayClass = "";
		if(2 * idx + 1 == _this._swapSource){
			displayClass = "swap";
		} else if(2 * idx + 1 == _this._rearrageSelection){
			displayClass = "active";
		}
		
		if(listedUnits[subActorId]){
			subActorId = null;
		}
		content+="<div data-islocked='"+(deployInfo.lockedSlots[slot] ? 1 : 0)+"' data-actorid='"+(subActorId || -1)+"' class='entry "+displayClass+"'>"
		//var actorId = deployInfo.assignedSub[i];
		if(subActorId != null && !listedUnits[subActorId] && $statCalc.isValidForDeploy($gameActors.actor(subActorId))){
			listedUnits[subActorId] = true;
			var menuImagePath = $statCalc.getMenuImagePath($gameActors.actor(subActorId));
			content+="<img class='actor_img sub' src='img/"+menuImagePath+"'>";
		}
		content+="</div>";	 
		
		if(slot != null && deployInfo.lockedSlots[slot]){				
			content+="<img class='locked_icon' src='svg/padlock.svg'/>";
		}	
		
		content+="<div class='order_icon scaled_text'>"+(idx + 1)+"</div>";
		content+="</div>";
		return content;
	}
	
	deployedContent+="<div class='list_row'>";
	
	
	
	deployedContent+="</div>";
	_this._deployedList.innerHTML = deployedContent;
	
	var listedUnits = {};
	var availableContent = "";
	var availableUnits = _this.getAvailableUnits();
	var twinInfo = $gameSystem.getTwinInfo();
	var isTwinInfo = $gameSystem.getIsTwinInfo();
	var preferredSlotInfo = $gameSystem.getPreferredSlotInfo();
	var skippedIds = [];
	var rowCtr = 0;

	availableContent+="<div class='list_row'>";
	
	var unitsWithPreferredSlots = {};
	Object.keys(preferredSlotInfo).forEach(function(slot){
		var info = preferredSlotInfo[slot];
		unitsWithPreferredSlots[info.main] = true;
		unitsWithPreferredSlots[info.sub] = true;
	});
	
	function getUnassignedActorId(){
		var result;
		var ctr = 0;
		while(!result && ctr < availableUnits.length){
			var actor = availableUnits[ctr++];
			var actorId = actor.actorId();
			if(!listedUnits[actorId] && !unitsWithPreferredSlots[actorId] && !$statCalc.isShip(actor)){
				result = actorId;
			}
		}
		return result;
	}
	
	for(var i = 0; i < 40; i++) {
		if(rowCtr != 0 && !(rowCtr % _this._rearrageRowSize)){
			availableContent+="</div>";
			availableContent+="<div class='list_row'>";
			//usedSlots[i] = true;
		}
		if(i < deployInfo.count){
			availableContent+=createTwinEntry(deployInfo.assigned[i], deployInfo.assignedSub[i], i, rowCtr);
			rowCtr++;
		} else {
			/*var availableUnitIdx = i - deployInfo.count;
			if(availableUnitIdx < availableUnits.length){
				var actorId = availableUnits[availableUnitIdx].actorId();
				if(preferredSlotInfo[i] != null && preferredSlotInfo[i] != actorId){
					skippedIds.push(actorId);
					actorId = preferredSlotInfo[i];
				}
				if(!isTwinInfo[actorId] && !$statCalc.isShip($gameActors.actor(actorId))){
					availableContent+=createTwinEntry(actorId, twinInfo[actorId], null, rowCtr);
					rowCtr++;
				} else {
					availableContent+=createTwinEntry(null, null, null, rowCtr);
					rowCtr++;
				}
			} else if(skippedIds.length){
				var actorId = skippedIds.shift();
				if(!isTwinInfo[actorId] && !$statCalc.isShip($gameActors.actor(actorId))){
					availableContent+=createTwinEntry(actorId, twinInfo[actorId], null, rowCtr);
					rowCtr++;
				} else {
					availableContent+=createTwinEntry(null, null, null, rowCtr);
					rowCtr++;
				}
			} else {
				availableContent+=createTwinEntry(null, null, null, rowCtr);
				rowCtr++;
			}*/
			if(preferredSlotInfo[i]){
				availableContent+=createTwinEntry(preferredSlotInfo[i].main, preferredSlotInfo[i].sub, null, rowCtr);
				rowCtr++;
			} else {
				var actorId = getUnassignedActorId();
				if(actorId){
					availableContent+=createTwinEntry(actorId, null, null, rowCtr);
					rowCtr++;
				} else {
					availableContent+=createTwinEntry(null, null, null, rowCtr);
					rowCtr++;
				}				
			}
		}		
	}
	
	/*for(var i = 0; i < deployInfo.count; i++) { //
		if(rowCtr != 0 && !(rowCtr % _this._rearrageRowSize)){
			availableContent+="</div>";
			availableContent+="<div class='list_row'>"
		}
		
		var displayClass = "";
		if(this._UIState == "rearrange_slots"){
			if(i == _this._swapSource){
				displayClass = "swap";
			} else if(i == _this._rearrageSelection){
				displayClass = "active";
			}
		}		
		availableContent+=createTwinEntry(deployInfo.assigned[i], deployInfo.assignedSub[i], i, rowCtr);
		rowCtr++;	
		
	}
	
	for(var i = 0; i < availableUnits.length; i++) { //
		if(rowCtr != 0 && !(rowCtr % _this._availableRowSize)){
			availableContent+="</div>";
			availableContent+="<div class='list_row'>"
		}
		if(!$statCalc.isShip($gameActors.actor(availableUnits[i].actorId()))){
			availableContent+=createTwinEntry(availableUnits[i].actorId(), null, null, rowCtr);
			rowCtr++;
		}		
	}
	availableContent+="</div>";
	/*for(var i = 0; i < availableUnits.length; i++) { //
		if(rowCtr != 0 && !(rowCtr % _this._availableRowSize)){
			availableContent+="</div>";
			availableContent+="<div class='list_row'>"
		}
		rowCtr++;
		if(availableUnits[i] && $statCalc.isValidForDeploy(availableUnits[i])) {
			availableContent+="<div class='entry "+(this._UIState == "select_deploy_slot" && _this._deployedSelection == i ? "active" : "")+"'>"
		
			var menuImagePath = $statCalc.getMenuImagePath(availableUnits[i]);
			availableContent+="<img class='actor_img' src='img/"+menuImagePath+"'>";
			
			var actorId = availableUnits[i].actorId()
			var slot = slotLookup[actorId];
			if(deployInfo.lockedSlots[slot]){				
				availableContent+="<img class='locked_icon' src='svg/padlock.svg'/>";
			} else if(deployInfo.assigned[slot] != null){				
				availableContent+="<img class='deployed_icon' src='svg/check_mark.svg'/>";
			}
			if(deployInfo.assigned[slot] != null){				
				availableContent+="<div class='order_icon scaled_text'>"+(slot * 1 + 1)+"</div>";
			}
			
			if(deployInfo.favorites[actorId]){
				availableContent+="<img class='fav_icon' src='svg/round_star.svg'/>";
			}
			
			if($statCalc.isShip($gameActors.actor(actorId))){
				availableContent+="<img class='ship_icon' src='svg/anchor.svg'/>";
			}
		
		
			availableContent+="</div>";
		}
	}*/
	availableContent+="</div>";
	_this._availableList.innerHTML = availableContent;
	
	
	_this._availableListLabel.innerHTML = deployInfo.count + " " + APPSTRINGS.DEPLOYMENT.label_will_deploy;
	
	var actorId;
	var activeElem = _this._availableList.querySelector(".active");
	if(activeElem){
		actorId = activeElem.getAttribute("data-actorid");
	}
	
	var pilotData;
	if(actorId)	{
		pilotData = $gameActors.actor(actorId);
	}
	var pilotInfoContent = "";
	pilotInfoContent+="<div id='deploy_pilot_icon'></div>";
	
	pilotInfoContent+="<div class='pilot_basic_info'>";
	pilotInfoContent+="<div class='pilot_name scaled_text'>";
	if(pilotData){
		pilotInfoContent+=pilotData.name();
	} else {
		pilotInfoContent+="---";
	}
	
	pilotInfoContent+="</div>";
	pilotInfoContent+="<div class='pilot_lv_sp scaled_text'>";
	
	pilotInfoContent+="<div class='pilot_lv '>";
	pilotInfoContent+="<div class='label'>";
	pilotInfoContent+="Lv";
	pilotInfoContent+="</div>";	
	pilotInfoContent+="<div class='value'>";
	if(pilotData){
		pilotInfoContent+=$statCalc.getCurrentLevel(pilotData);
	} else {
		pilotInfoContent+="---";
	}
	pilotInfoContent+="</div>";	
	pilotInfoContent+="</div>";
	
	pilotInfoContent+="<div class='pilot_sp'>";
	pilotInfoContent+="<div class='label'>";
	pilotInfoContent+="SP";
	pilotInfoContent+="</div>";	
	pilotInfoContent+="<div class='value'>";
	if(pilotData){
		pilotInfoContent+=$statCalc.getCurrentSP(pilotData);
	} else {
		pilotInfoContent+="---";
	}
	pilotInfoContent+="</div>";	
	pilotInfoContent+="</div>";
	
	pilotInfoContent+="</div>";
	pilotInfoContent+="</div>";
	
	_this._pilotInfoDisplay.innerHTML = pilotInfoContent;
	
	if(pilotData && $statCalc.isValidForDeploy(pilotData)){
		var actorIcon = this._container.querySelector("#deploy_pilot_icon");
		this.loadActorFace(pilotData.actorId(), actorIcon);
	}
	
	
	var entries = windowNode.querySelectorAll(".entry");
	entries.forEach(function(entry){
		_this.updateScaledDiv(entry);
	});
	
	var twins = windowNode.querySelectorAll(".twin");
	twins.forEach(function(twin){
		_this.updateScaledDiv(twin, false, true);
	});
	
	_this.updateScaledDiv(windowNode.querySelector("#deploy_pilot_icon"));
	
	if(pilotData && pilotData.SRWStats.mech.id != -1){
		this._detailBarMechDetail.redraw();		
	}
	
	Graphics._updateCanvas();
	
	if(activeElem){
		var listRect = _this._availableList.getBoundingClientRect();
	
		var currentActiveRow = activeElem.parentNode.parentNode;
		var rowRect = currentActiveRow.getBoundingClientRect();
		if(rowRect.bottom > listRect.bottom){
			_this._availableList.scrollTop+=rowRect.bottom - listRect.bottom;
		}
		if(rowRect.top < listRect.top){
			_this._availableList.scrollTop-=listRect.top - rowRect.top;
		}
	}	
}