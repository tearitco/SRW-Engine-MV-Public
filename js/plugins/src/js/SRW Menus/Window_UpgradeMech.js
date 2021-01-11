import Window_CSS from "./Window_CSS.js";
import AttackList from "./AttackList.js";
import "./style/Window_UpgradeMech.css";

export default function Window_UpgradeMech() {
	this.initialize.apply(this, arguments);	
}

Window_UpgradeMech.prototype = Object.create(Window_CSS.prototype);
Window_UpgradeMech.prototype.constructor = Window_UpgradeMech;

Window_UpgradeMech.prototype.initialize = function() {	
	this._layoutId = "upgrade_mech";	
	this.resetDeltas();
	this._upgradeTypes = {
		0: {title: APPSTRINGS.MECHSTATS.weapon, id: "weapons"},
		1: {title: "HP", id: "maxHP"},	
		2: {title: "EN", id: "maxEN"},	
		3: {title: APPSTRINGS.MECHSTATS.armor, id: "armor"},	
		4: {title: APPSTRINGS.MECHSTATS.mobility, id: "mobility"},	
		5: {title: APPSTRINGS.MECHSTATS.accuracy, id: "accuracy"},	
	};
	
	this._maxSelection = 6;
	this._currentSelection = 1;
	this._currentCost = 0;
	
	this._currentGenericFUBSelection = 0;
	this._UIState = "upgrades"; //fub_selection
	
	this._genericFUBInfo = [
		{name: APPSTRINGS.MECHUPGRADES.label_generic_fub_HP, id: 30},
		{name: APPSTRINGS.MECHUPGRADES.label_generic_fub_EN, id: 31},
		{name: APPSTRINGS.MECHUPGRADES.label_generic_fub_armor, id: 32},
		{name: APPSTRINGS.MECHUPGRADES.label_generic_fub_mobility, id: 33},
		{name: APPSTRINGS.MECHUPGRADES.label_generic_fub_accuracy, id: 34},
		{name: APPSTRINGS.MECHUPGRADES.label_generic_fub_movement, id: 29},
		{name: APPSTRINGS.MECHUPGRADES.label_generic_fub_item_slot, id: 35, req: function(refData){return $statCalc.getRealItemSlots(refData) < 4}},
	];
	
	this._maxFUBSelection = this._genericFUBInfo.length;
	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
}

Window_UpgradeMech.prototype.resetSelection = function(){
	this._currentSelection = 1;
	this._currentCost = 0;
	this._currentGenericFUBSelection = 0;
}

Window_UpgradeMech.prototype.resetDeltas = function() {
	this._currentUpgradeDeltas = {
		maxHP: 0,
		maxEN: 0,
		armor: 0,
		mobility: 0,
		accuracy: 0, 
		weapons: 0
	};
}

Window_UpgradeMech.prototype.getCurrentSelection = function(){
	return $gameTemp.currentMenuUnit.mech;	
}

Window_UpgradeMech.prototype.incrementSelection = function(){
	if(this._UIState == "upgrades"){
		this._currentSelection++;
		if(this._currentSelection >= this._maxSelection){
			this._currentSelection = 0;
		}
	} else {
		this._currentGenericFUBSelection++;
		if(this._currentGenericFUBSelection >= this._maxFUBSelection){
			this._currentGenericFUBSelection = 0;
		}
	}
}

Window_UpgradeMech.prototype.decrementSelection = function(){
	if(this._UIState == "upgrades"){
		this._currentSelection--;
		if(this._currentSelection < 0){
			this._currentSelection = this._maxSelection - 1;
		}
	} else {
		this._currentGenericFUBSelection--;
		if(this._currentGenericFUBSelection < 0){
			this._currentGenericFUBSelection = this._maxFUBSelection - 1;
		}
	}
}

Window_UpgradeMech.prototype.incrementUpgradeLevel = function(){
	if(this._UIState == "upgrades"){
		var mechData = this.getCurrentSelection();
		var calculatedStats = mechData.stats.calculated;
		var upgradeLevels = mechData.stats.upgradeLevels;
		var upgradeId = this._upgradeTypes[this._currentSelection].id;
		
		if(upgradeLevels[upgradeId] + this._currentUpgradeDeltas[upgradeId] < $statCalc.getMaxUpgradeLevel()){
			this._currentUpgradeDeltas[upgradeId]++;
			SoundManager.playCursor();
		}
	}
}

Window_UpgradeMech.prototype.decrementUpgradeLevel = function(){	
	if(this._UIState == "upgrades"){
		var upgradeId = this._upgradeTypes[this._currentSelection].id;	
		if(this._currentUpgradeDeltas[upgradeId] > 0){
			this._currentUpgradeDeltas[upgradeId]--;
			SoundManager.playCursor();
		}
	}
}

Window_UpgradeMech.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = "Upgrade Unit";	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	this._upgradeControls = document.createElement("div");	
	this._upgradeControls.classList.add("upgrade_controls");	
	windowNode.appendChild(this._upgradeControls);
	
	this._fundsDisplay = document.createElement("div");	
	this._fundsDisplay.classList.add("fund_display");	
	windowNode.appendChild(this._fundsDisplay);
	
	this._upgradeLevelDisplay = document.createElement("div");	
	this._upgradeLevelDisplay.classList.add("upgrade_level_display");	
	windowNode.appendChild(this._upgradeLevelDisplay);
	
	this._mechNameDisplay = document.createElement("div");	
	this._mechNameDisplay.classList.add("upgrade_mech_name");	
	windowNode.appendChild(this._mechNameDisplay);
	
	this._attackListDisplay = document.createElement("div");	
	this._attackListDisplay.classList.add("attack_list_container");	
	this._attackList = new AttackList(this._attackListDisplay, this);
	this._attackList.createComponents();
	windowNode.appendChild(this._attackListDisplay);
	
	this._genericFUBDisplay = document.createElement("div");	
	this._genericFUBDisplay.classList.add("generic_fub_display");	
	windowNode.appendChild(this._genericFUBDisplay);
}	


Window_UpgradeMech.prototype.update = function() {
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			SoundManager.playCursor();
			this.requestRedraw();
			this.incrementSelection();

		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			SoundManager.playCursor();
			this.requestRedraw();			
			this.decrementSelection();
		}			

		if(Input.isTriggered('left') || Input.isRepeated('left')){
			
			this.requestRedraw();
			this.decrementUpgradeLevel();
		} else if (Input.isTriggered('right') || Input.isRepeated('right')) {
			
			this.requestRedraw();
			this.incrementUpgradeLevel();
		}
		
		if(Input.isTriggered('left_trigger') || Input.isRepeated('left_trigger')){
			this.requestRedraw();
		
		} else if (Input.isTriggered('right_trigger') || Input.isRepeated('right_trigger')) {
			this.requestRedraw();
		
		}
		
		if(Input.isTriggered('pageup') || Input.isRepeated('pageup')){
			this.resetDeltas();
			this.requestRedraw();			
			$gameTemp.currentMenuUnit = this.getPreviousAvailableUnitGlobal(this.getCurrentSelection().classData.id);			
		} else if (Input.isTriggered('pagedown') || Input.isRepeated('pagedown')) {
			this.resetDeltas();
			this.requestRedraw();			
			$gameTemp.currentMenuUnit = this.getNextAvailableUnitGlobal(this.getCurrentSelection().classData.id);
		}
		
		if(Input.isTriggered('L3')){
			this.requestRedraw();
			this._attackList.incrementPage();			
		} 	
		
		if(Input.isTriggered('ok')){
			this.requestRedraw();
			if(this._UIState == "upgrades"){
				var cost = this.currentCost();					
				if(cost <= $gameParty.gold()){
					SoundManager.playOk();
					$gameParty.loseGold(cost);
					var mechData = this.getCurrentSelection();
					var refData = this.createReferenceData(mechData);
					$statCalc.applyMechUpgradeDeltas(refData, this._currentUpgradeDeltas);
					$statCalc.storeMechData(mechData);
					if($statCalc.getOverallModificationLevel(this.createReferenceData(mechData)) >= 100){
						if($statCalc.getGenericFUB(refData) == -1 || $statCalc.getGenericFUB(refData) == null){
							this._UIState = "fub_selection";
							this._genericFUBDisplay.classList.add("active");
						}						
					}
				} else {
					SoundManager.playCancel();
				}
				this.resetDeltas();
			} else {
				SoundManager.playOk();
				var mechData = this.getCurrentSelection();
				var refData = this.createReferenceData(mechData);
				var disabled = false;
				if(this._genericFUBInfo[this._currentGenericFUBSelection].req){
					disabled = !this._genericFUBInfo[this._currentGenericFUBSelection].req(refData);
				}
				if(!disabled){				
					$statCalc.applyGenericFUB(refData, this._genericFUBInfo[this._currentGenericFUBSelection].id);
					$statCalc.storeMechData(mechData);
					this.refreshAllUnits();
					$gameTemp.currentMenuUnit.mech = $statCalc.getMechData($dataClasses[$gameTemp.currentMenuUnit.mech.id], true);
					$statCalc.calculateSRWMechStats($gameTemp.currentMenuUnit.mech);
					
					this._genericFUBDisplay.classList.remove("active");
					this._UIState = "upgrades";		
				}	
			}			
		}
		if(Input.isTriggered('cancel')){
			if(this._UIState == "upgrades"){
				this.resetDeltas();
				SoundManager.playCancel();
				$gameTemp.popMenu = true;	
			}			
		}		
		
		this.refresh();
	}		
};

Window_UpgradeMech.prototype.getWeaponLevels = function() {
	var _this = this;
	var mechData = this.getCurrentSelection();
	var upgradeLevels = mechData.stats.upgradeLevels;
	var upgradeDef = _this._upgradeTypes[0];
	var levels = [];
	for(var i = 0; i < _this._currentUpgradeDeltas[upgradeDef.id]; i++){
		levels.push(i + upgradeLevels[upgradeDef.id]);
	}
	return levels;
}

Window_UpgradeMech.prototype.currentCost = function() {
	var _this = this;
	var mechData = this.getCurrentSelection();
	var upgradeLevels = mechData.stats.upgradeLevels;
	var refData = this.createReferenceData(mechData);
	var cost = 0;
	Object.keys(_this._upgradeTypes).forEach(function(upgradeId){
		var upgradeDef = _this._upgradeTypes[upgradeId];
		var levels = [];
		for(var i = 0; i < _this._currentUpgradeDeltas[upgradeDef.id]; i++){
			levels.push(i + upgradeLevels[upgradeDef.id]);
		}
		cost+=$statCalc.getMechStatIncreaseCost(refData, upgradeDef.id, levels);
	});
	return cost;	
}

Window_UpgradeMech.prototype.redraw = function() {
	var _this = this;
	if(_this._currentSelection == 0){
		this._attackList.redraw();
		this._attackList.show();
	} else {
		this._attackList.hide();
	}
	
	var upgradeControlContent = "";
	var mechData = this.getCurrentSelection();
	var calculatedStats = mechData.stats.calculated;
	var upgradeLevels = mechData.stats.upgradeLevels;
	
	function createStatUpgradeBlock(idx){
		var displayData = _this._upgradeTypes[idx];
		var content = "";
		content+="<div class='upgrade_entry "+(idx == _this._currentSelection ? "selected" : "")+"'>";
		content+="<div class='upgrade_entry_label scaled_text'>"+displayData.title+"</div>";
		content+="<div class='upgrade_entry_current scaled_text'>"+calculatedStats[displayData.id]+"</div>";
		content+="<div class='chevron_right scaled_width'><img src='svg/chevron_right.svg'></div>";
		content+="<div class='upgrade_entry_new scaled_text'>"+(calculatedStats[displayData.id] + $statCalc.getMechStatIncrease([displayData.id], _this._currentUpgradeDeltas[displayData.id]))+"</div>";
		content+="<div class='upgrade_entry_bar'>"+_this.createUpgradeBar(upgradeLevels[displayData.id], _this._currentUpgradeDeltas[displayData.id])+"</div>";
		content+="</div>";
		return content;
	}	
	
	upgradeControlContent+="<div class='weapon_upgrade_container'>";
	upgradeControlContent+="<div class='upgrade_entry "+(_this._currentSelection == 0 ? "selected" : "")+"'>";
	upgradeControlContent+="<div class='upgrade_entry_label scaled_text'>"+APPSTRINGS.MECHUPGRADES.label_weapons+"</div>";
	upgradeControlContent+="<div class='upgrade_entry_current scaled_text'>"+upgradeLevels.weapons+"</div>";
	upgradeControlContent+="<div class='chevron_right scaled_width'><img src='svg/chevron_right.svg'></div>";
	upgradeControlContent+="<div class='upgrade_entry_new scaled_text'>"+(upgradeLevels.weapons + this._currentUpgradeDeltas.weapons)+"</div>";
	upgradeControlContent+="<div class='upgrade_entry_bar'>"+this.createUpgradeBar(upgradeLevels.weapons, this._currentUpgradeDeltas.weapons)+"</div>";
	upgradeControlContent+="</div>";
	upgradeControlContent+="</div>";
	upgradeControlContent+="<div class='stat_upgrade_container'>";	
	for(var i = 1; i < this._maxSelection; i++){
		upgradeControlContent+=createStatUpgradeBlock(i);
	}	
	upgradeControlContent+="</div>";
	this._upgradeControls.innerHTML = upgradeControlContent;
	
	var fundDisplayContent = "";
	fundDisplayContent+="<div class='fund_entries'>";
	fundDisplayContent+="<div class='fund_entry'>";
	fundDisplayContent+="<div class='fund_entry_label scaled_text'>"+APPSTRINGS.MECHUPGRADES.label_current_funds+"</div>";
	fundDisplayContent+="<div class='fund_entry_value scaled_text'>"+$gameParty.gold()+"</div>";
	fundDisplayContent+="</div>";
	
	fundDisplayContent+="<div class='fund_entry'>";
	fundDisplayContent+="<div class='fund_entry_label scaled_text'>"+APPSTRINGS.MECHUPGRADES.label_cost+"</div>";
	fundDisplayContent+="<div class='fund_entry_value scaled_text'>"+this.currentCost()+"</div>";
	fundDisplayContent+="</div>";
	
	fundDisplayContent+="<div class='fund_entry'>";
	fundDisplayContent+="<div class='fund_entry_label scaled_text'>"+APPSTRINGS.MECHUPGRADES.label_remaining_funds+"</div>";
	var remaining = $gameParty.gold() - this.currentCost();
	fundDisplayContent+="<div class='fund_entry_value scaled_text "+(remaining < 0 ? "underflow" : "")+"'>"+remaining+"</div>";
	fundDisplayContent+="</div>";
	fundDisplayContent+="</div>";
	
	this._fundsDisplay.innerHTML = fundDisplayContent;
	
	this._upgradeLevelDisplay.innerHTML = "<div class='upgrade_level_label scaled_text'>Upgrade Level</div><div class='upgrade_level_value scaled_text'>"+$statCalc.getOverallModificationLevel(this.createReferenceData(mechData))+"%</div>"
	if(_this._currentSelection == 0){
		this._upgradeLevelDisplay.style.display = "none";
	} else {
		this._upgradeLevelDisplay.style.display = "flex";
	}
	
	var mechNameContent = "";
	mechNameContent+="<div id='upgrade_name_icon'></div>";//icon 
	mechNameContent+="<div class='upgrade_mech_name_value scaled_text'>"+this.getCurrentSelection().classData.name+"</div>";//icon 	
	this._mechNameDisplay.innerHTML = mechNameContent;	
	
	var mechIcon = this._container.querySelector("#upgrade_name_icon");
	this.loadMechMiniSprite(this.getCurrentSelection().id, mechIcon);
	
	function createGenericFUBEntry(idx, title, disabled){
		var content = "";
		content+="<div class='generic_fub_entry scaled_text "+(disabled ? "disabled" : "")+" "+(idx == _this._currentGenericFUBSelection ? "selected" : "")+"'>";
		content+=title;
		content+="</div>";
		return content;
	}
	
	var genericFUBContent = "";
	genericFUBContent+="<div class='generic_fub_header'>";
	genericFUBContent+="<div class='fund_entry_label scaled_text'>"+APPSTRINGS.MECHUPGRADES.label_generic_fub+"</div>";
	genericFUBContent+="</div>";
	
	var mechData = this.getCurrentSelection();
	var refData = this.createReferenceData(mechData);
	
	for(var i = 0; i < this._genericFUBInfo.length ; i++){
		var disabled = false;
		if(this._genericFUBInfo[i].req){
			disabled = !this._genericFUBInfo[i].req(refData);
		}
		genericFUBContent+=createGenericFUBEntry(i, this._genericFUBInfo[i].name, disabled);
	}
	
	this._genericFUBDisplay.innerHTML = genericFUBContent;
	
	Graphics._updateCanvas();
}