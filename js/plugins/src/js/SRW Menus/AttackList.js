import Window_CSS from "./Window_CSS.js";
import "./style/AttackList.css";

export default function AttackList(container, weaponModProvider){
	this._container = container;	
	this._currentPage = 0;
	this._currentSelection = 0;
	this._maxPageSize = 5;
	this._weaponModProvider = weaponModProvider;
	this._view = "upgrades";
	this._selectionEnabled = false;
	this._attackValidator;
}


AttackList.prototype = Object.create(Window_CSS.prototype);
AttackList.prototype.constructor = AttackList;

AttackList.prototype.getAvailableUnits = function(){
	return $statCalc.getCurrentWeapons(this.createReferenceData($gameTemp.currentMenuUnit.mech));
}

AttackList.prototype.setView = function(view){
	this._view = view;
}

AttackList.prototype.setAttackValidator = function(validator){
	this._attackValidator = validator;
}

AttackList.prototype.enableSelection = function(){
	this._selectionEnabled = true;
}

AttackList.prototype.getCurrentPage = function(){
	return this._currentPage;
}

AttackList.prototype.getMaxPage = function(){
	this._availableUnits = this.getAvailableUnits();
	return Math.ceil(this._availableUnits.length / this._maxPageSize) - 1;
}

AttackList.prototype.getCurrentSelection = function(){
	var availableUnits = this.getAvailableUnits();
	var idx = this._currentSelection + this._currentPage * this._maxPageSize;
	if(idx >= availableUnits.length){
		this._currentSelection = 0;
		this._currentPage = 0;
		idx = 0;
		this.requestRedraw();
	}
	return availableUnits[idx];
}

AttackList.prototype.getCurrentPageAmount = function(){
	var refData = this.createReferenceData($gameTemp.currentMenuUnit.mech);
	var totalAttacks = $statCalc.getCurrentWeapons(refData).length;
	var start = this._currentPage * this._maxPageSize;
	if(start + this._maxPageSize >= totalAttacks){
		return totalAttacks - start;
	} else {
		return this._maxPageSize;
	}
}

AttackList.prototype.incrementSelection = function(){
	this._currentSelection++;
	if(this._currentSelection >= this.getCurrentPageAmount()){
		this._currentSelection = 0;
	}
}

AttackList.prototype.decrementSelection = function(){
	this._currentSelection--;
	if(this._currentSelection < 0){
		this._currentSelection = this.getCurrentPageAmount() - 1;
	}
}

AttackList.prototype.incrementPage = function(){
	this._availableUnits = this.getAvailableUnits();
	this._currentPage++;
	if(this._currentPage * this._maxPageSize >= this._availableUnits.length){
		this._currentPage = 0;
	}
	this.validateCurrentSelection();
}

AttackList.prototype.decrementPage = function(){
	this._availableUnits = this.getAvailableUnits();
	this._currentPage--;
	if(this._currentPage < 0){
		if(this._availableUnits.length  == 0){
			this._currentPage = 0;
		} else {
			this._currentPage = Math.ceil(this._availableUnits.length / this._maxPageSize) - 1;
		}		
		if(this._currentPage < 0){
			this._currentPage = 0;
		}
	}
	this.validateCurrentSelection();
}

AttackList.prototype.createComponents = function(){
	this._listDiv = document.createElement("div");
	this._listDiv.id = "attack_list_control";
	this._pageDiv = document.createElement("div");
	this._pageDiv.id = "attack_list_control_page";
	this._pageDiv.classList.add("scaled_text");
	this._topBorder = document.createElement("div");
	this._topBorder.id = "mech_list_control_top_border";
	this._container.appendChild(this._listDiv);	
	this._container.appendChild(this._pageDiv);	
	this._container.appendChild(this._topBorder);	
}

AttackList.prototype.createAttributeBlock = function(attack) {
	var content = "";
	content+="<div class='attribute_block'>";
	content+="<div class='attribute_block_entry scaled_width scaled_height scaled_text'>";
	if(attack.effects.length){
		content+="S";
	} 
	content+="</div>";
	content+="<div class='attribute_block_entry scaled_width scaled_height scaled_text'>";
	if(attack.postMoveEnabled){
		content+="P";
	} 
	content+="</div>";
	content+="<div class='attribute_block_entry scaled_width scaled_height scaled_text'>";
	if(attack.particleType == "missile"){
		content+="Mi";	
	}
	if(attack.particleType == "physical"){
		content+="Ph";	
	}
	if(attack.particleType == "funnel"){
		content+="Fu";	
	}
	if(attack.particleType == "beam"){
		content+="Be";	
	}
	if(attack.particleType == "gravity"){
		content+="Gr";	
	}	
	content+="</div>";
	
	
	content+="</div>";
	return content;
}

AttackList.prototype.getUpgradeAmount = function() {
	if(this._weaponModProvider){
		return $statCalc.getWeaponDamageUpgradeAmount(this._weaponModProvider.getWeaponLevels());
	} else {
		return 0;
	}
}

AttackList.prototype.createUpgradeViewRow = function(refData, attack) {
	var listContent = "";
	listContent+="<div class='attack_list_block scaled_text'>";
	if(attack.type == "M"){
		listContent+="<img class='attack_list_type scaled_width' src='svg/punch_blast.svg'>";
	} else {
		listContent+="<img class='attack_list_type scaled_width' src='svg/crosshair.svg'>";
	}
	
	listContent+="</div>";
	listContent+="<div class='attack_list_block scaled_text'>"+attack.name+"</div>";
	listContent+="<div class='attack_list_block scaled_text'>"+this.createAttributeBlock(attack)+"</div>";
	var currentPower = $statCalc.getWeaponPower(refData, attack)*1;
	listContent+="<div class='attack_list_block scaled_text'>"+currentPower+"</div>";
	listContent+="<div class='attack_list_block scaled_text'><div class='chevron_right scaled_width'><img src='svg/chevron_right.svg'></div></div>";
	var upgradeAmount = this.getUpgradeAmount();
	listContent+="<div class='attack_list_block scaled_text'>"+(currentPower + upgradeAmount)+"</div>";
	return listContent;
}

AttackList.prototype.createSummaryViewRow = function(refData, attack) {
	var listContent = "";
	listContent+="<div class='attack_list_block scaled_text'>";
	if(attack.type == "M"){
		listContent+="<img class='attack_list_type scaled_width' src='svg/punch_blast.svg'>";
	} else {
		listContent+="<img class='attack_list_type scaled_width' src='svg/crosshair.svg'>";
	}
	
	listContent+="</div>";
	listContent+="<div class='attack_list_block scaled_text'>"+attack.name+"</div>";
	listContent+="<div class='attack_list_block scaled_text'>"+this.createAttributeBlock(attack)+"</div>";
	var currentPower = $statCalc.getWeaponPower(refData, attack)*1;
	listContent+="<div class='attack_list_block scaled_text'>"+currentPower+"</div>";
	if(attack.isMap){
		listContent+="<div class='attack_list_block scaled_text'>---</div>";
	} else {
		listContent+="<div class='attack_list_block scaled_text'>"+(attack.minRange ? attack.minRange : "1")+"-"+$statCalc.getRealWeaponRange($gameTemp.currentMenuUnit.actor, attack)+"</div>";
	}
	
	var hitMod = attack.hitMod;
	if(attack.hitMod >= 0){
		hitMod = "+"+attack.hitMod;
	}
	listContent+="<div class='attack_list_block scaled_text'>"+hitMod+"</div>";
	var critMod = attack.critMod;
	if(attack.critMod >= 0){
		critMod = "+"+attack.critMod;
	}
	listContent+="<div class='attack_list_block scaled_text'>"+critMod+"</div>";
	return listContent;
}


AttackList.prototype.redraw = function() {
	var _this = this;	
	var refData = this.createReferenceData($gameTemp.currentMenuUnit.mech);
	var attacks = $statCalc.getCurrentWeapons(refData);	
	
	var listContent = "";
	
	listContent+="<div class='attack_list_row header "+this._view+"'>";
	if(this._view == "upgrades"){
		listContent+="<div class='attack_list_block header scaled_text'></div>";
		listContent+="<div class='attack_list_block header scaled_text'>"+APPSTRINGS.ATTACKLIST.label_attack_name+"</div>";
		listContent+="<div class='attack_list_block header scaled_text'>"+APPSTRINGS.ATTACKLIST.label_attributes+"</div>";
		listContent+="<div class='attack_list_block header scaled_text'>"+APPSTRINGS.ATTACKLIST.label_power+"</div>";
		listContent+="<div class='attack_list_block header scaled_text'></div>";
		listContent+="<div class='attack_list_block header scaled_text'>"+APPSTRINGS.ATTACKLIST.label_upgraded+"</div>";
	} else if(this._view == "summary"){
		listContent+="<div class='attack_list_block header scaled_text'></div>";
		listContent+="<div class='attack_list_block header scaled_text'>"+APPSTRINGS.ATTACKLIST.label_attack_name+"</div>";
		listContent+="<div class='attack_list_block header scaled_text'>"+APPSTRINGS.ATTACKLIST.label_attributes+"</div>";
		listContent+="<div class='attack_list_block header scaled_text'>"+APPSTRINGS.ATTACKLIST.label_power+"</div>";
		listContent+="<div class='attack_list_block header scaled_text'>"+APPSTRINGS.ATTACKLIST.label_range+"</div>";
		listContent+="<div class='attack_list_block header scaled_text'>"+APPSTRINGS.ATTACKLIST.label_hit+"</div>";
		listContent+="<div class='attack_list_block header scaled_text'>"+APPSTRINGS.ATTACKLIST.label_crit+"</div>";
	}
	listContent+="</div>";

	var start = this._currentPage * this._maxPageSize;
	var end = Math.min(attacks.length, (start + this._maxPageSize));
		
	for(var i = start; i < end; i++){
		var rowClasses = [];
		var validationResult;
		if(this._attackValidator) {
			validationResult = this._attackValidator.validateAttack(attacks[i]);
			if(!validationResult.canUse){
				rowClasses.push("disabled");
			}
		}
		if(_this._selectionEnabled && i-start == this._currentSelection){
			rowClasses.push("selected");
		}
		listContent+="<div class='attack_list_row "+this._view+" "+rowClasses.join(" ")+"'>";
		if(this._view == "upgrades"){
			listContent+=this.createUpgradeViewRow(refData, attacks[i]);
		} else if(this._view == "summary"){
			listContent+=this.createSummaryViewRow(refData, attacks[i]);			
		}
		
		
		listContent+="</div>";
	}
	
	this._listDiv.innerHTML = listContent;
	
	var maxPage = Math.ceil(attacks.length / this._maxPageSize);
	if(maxPage < 1){
		maxPage = 1;
	}
	this._pageDiv.innerHTML = (this._currentPage + 1)+"/"+maxPage;

}