import Window_CSS from "./Window_CSS.js";
import MechList from "./MechList.js"
import DetailBarMechDetail from "./DetailBarMechDetail.js";
import DetailBarMechUpgrades from "./DetailBarMechUpgrades.js";
import AttackList from "./AttackList.js";
import DetailBarAttackSummary from "./DetailBarAttackSummary.js";
import "./style/Window_AttackList.css"

export default function Window_AttackList() {
	this.initialize.apply(this, arguments);	
}

Window_AttackList.prototype = Object.create(Window_CSS.prototype);
Window_AttackList.prototype.constructor = Window_AttackList;

Window_AttackList.prototype.initialize = function() {
	
	this._layoutId = "attack_list";	
	this._pageSize = 1;
	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
}

Window_AttackList.prototype.getCurrentSelection = function(){
	return $gameTemp.currentMenuUnit;	
}

Window_AttackList.prototype.validateAttack = function(attack) {
	var actor = this.getCurrentSelection().actor;
	var isPostMoveOnly = $gameTemp.isPostMove && !$statCalc.getActiveSpirits(actor).charge && !$gameTemp.isEnemyAttack;	
	var rangeTarget;
	if($gameTemp.isEnemyAttack){
		rangeTarget = $gameTemp.currentBattleEnemy;
	}
	return $statCalc.canUseWeaponDetail(actor, attack, isPostMoveOnly, rangeTarget);	
}

Window_AttackList.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = "Select Attack";	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	this._weaponInfoContainer = document.createElement("div");
	this._weaponInfoContainer.classList.add("list_detail");	
	this._weaponInfoContainer.classList.add("weapon_info");
	windowNode.appendChild(this._weaponInfoContainer);	
	
	this._attackList = new AttackList(this._weaponInfoContainer, this);
	this._attackList.setView("summary");
	this._attackList.enableSelection();
	this._attackList.createComponents();	
	this._attackList.setAttackValidator(this);
	
	this._weaponDetailContainer = document.createElement("div");
	this._weaponDetailContainer.classList.add("list_detail");	
	this._weaponDetailContainer.classList.add("weapon_detail");
	windowNode.appendChild(this._weaponDetailContainer);	
	
	this._attackSummary = new DetailBarAttackSummary(this._weaponDetailContainer, this._attackList);
	this._attackSummary.createComponents();		
	this._attackSummary.setAttackValidator(this);
	
	this._mechNameDisplayWeapons = document.createElement("div");	
	this._mechNameDisplayWeapons.classList.add("upgrade_mech_name");
	
	windowNode.appendChild(this._mechNameDisplayWeapons);
	
}	

var Window_CSS_prototype_show = Window_CSS.prototype.show;
Window_AttackList.prototype.show = function() {
	this._attackList.resetSelection();
	Window_CSS_prototype_show.call(this);	
};

Window_AttackList.prototype.update = function() {
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			SoundManager.playCursor();
			this.requestRedraw();
			
			this._attackList.incrementSelection();
			
		
		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			SoundManager.playCursor();
			this.requestRedraw();
		    
			this._attackList.decrementSelection();
			
		}			

		if(Input.isTriggered('left') || Input.isRepeated('left')){
			this.requestRedraw();			
			this._attackList.decrementPage();		
			
		} else if (Input.isTriggered('right') || Input.isRepeated('right')) {
			this.requestRedraw();			
			this._attackList.incrementPage();		
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
			var attack = this._attackList.getCurrentSelection();   
			var validationResult = this.validateAttack(attack);
			if(validationResult.canUse){				  
				SoundManager.playOk();
				if(this._callbacks["selected"]){
					this._callbacks["selected"](this._attackList.getCurrentSelection());
				}
			} else {
				SoundManager.playCancel();
			}		
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



Window_AttackList.prototype.redraw = function() {
	//this._mechList.redraw();	

	this._attackList.redraw();
	this._attackSummary.redraw();
	
	var mechNameContent = "";
	mechNameContent+="<div id='detail_pages_weapons_name_icon'></div>";//icon 
	mechNameContent+="<div class='upgrade_mech_name_value scaled_text'>"+this.getCurrentSelection().mech.classData.name+"</div>";//icon 	
	this._mechNameDisplayWeapons.innerHTML = mechNameContent;	
	
	var mechIcon = this._container.querySelector("#detail_pages_weapons_name_icon");
	this.loadMechMiniSprite(this.getCurrentSelection().mech.id, mechIcon);	

	Graphics._updateCanvas();
}