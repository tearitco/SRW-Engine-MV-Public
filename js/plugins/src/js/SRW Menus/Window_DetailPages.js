import Window_CSS from "./Window_CSS.js";
import MechList from "./MechList.js"
import DetailBarMechDetail from "./DetailBarMechDetail.js";
import DetailBarMechUpgrades from "./DetailBarMechUpgrades.js";
import AttackList from "./AttackList.js";
import DetailBarAttackSummary from "./DetailBarAttackSummary.js";
import "./style/Window_DetailPages.css"

export default function Window_DetailPages() {
	this.initialize.apply(this, arguments);	
}

Window_DetailPages.prototype = Object.create(Window_CSS.prototype);
Window_DetailPages.prototype.constructor = Window_DetailPages;

Window_DetailPages.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "detail_pages";	
	this._pageSize = 1;
	this._tabInfo = [
		{id: "pilot_stats", elem: null, button: null},
		{id: "mech_stats", elem: null, button: null},
		{id: "weapon_info", elem: null, button: null}
	]
	this._selectedTab = 0;
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
}

Window_DetailPages.prototype.getCurrentSelection = function(){
	return $gameTemp.currentMenuUnit;
	
}

Window_DetailPages.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = "";	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	this._listContainer = document.createElement("div");
	this._listContainer.classList.add("list_container");
	windowNode.appendChild(this._listContainer);	
	
	this._mechStatsTab = document.createElement("div");
	this._mechStatsTab.classList.add("mech_stats");
	windowNode.appendChild(this._mechStatsTab);	
	this._tabInfo[1].elem = this._mechStatsTab;
	
	this._detailContainer = document.createElement("div");
	this._detailContainer.classList.add("list_detail");
	this._detailContainer.classList.add("mech_stats_detail");
	this._mechStatsTab.appendChild(this._detailContainer);	
	
	
	this._detailBarMechDetail = new DetailBarMechDetail(this._detailContainer, this);
	this._detailBarMechDetail.createComponents();
	
	this._upgradesContainer = document.createElement("div");
	this._upgradesContainer.classList.add("list_detail");	
	this._upgradesContainer.classList.add("upgrade_detail");
	this._mechStatsTab.appendChild(this._upgradesContainer);	
	
	this._detailBarMechUpgrades= new DetailBarMechUpgrades(this._upgradesContainer, this);
	this._detailBarMechUpgrades.createComponents();
	
	this._FUBContainer = document.createElement("div");
	this._FUBContainer.classList.add("list_detail");	
	this._FUBContainer.classList.add("fub_detail");
	this._mechStatsTab.appendChild(this._FUBContainer);
	
	this._mechNameDisplay = document.createElement("div");	
	this._mechNameDisplay.classList.add("upgrade_mech_name");	
	this._mechStatsTab.appendChild(this._mechNameDisplay);
	
	this._actorBattleImg = document.createElement("div");
	this._actorBattleImg.classList.add("actor_battle_sprite");	
	this._mechStatsTab.appendChild(this._actorBattleImg);	
	
	this._weaponInfoTab = document.createElement("div");
	this._weaponInfoTab.classList.add("weapon_info");
	windowNode.appendChild(this._weaponInfoTab);	
	this._tabInfo[2].elem = this._weaponInfoTab;		
	
	this._weaponInfoContainer = document.createElement("div");
	this._weaponInfoContainer.classList.add("list_detail");	
	this._weaponInfoContainer.classList.add("weapon_info");
	this._weaponInfoTab.appendChild(this._weaponInfoContainer);	
	
	this._attackList = new AttackList(this._weaponInfoContainer, this);
	this._attackList.setView("summary");
	this._attackList.enableSelection();
	this._attackList.createComponents();	
	
	this._weaponDetailContainer = document.createElement("div");
	this._weaponDetailContainer.classList.add("list_detail");	
	this._weaponDetailContainer.classList.add("weapon_detail");
	this._weaponInfoTab.appendChild(this._weaponDetailContainer);	
	
	this._attackSummary = new DetailBarAttackSummary(this._weaponDetailContainer, this._attackList);
	this._attackSummary.createComponents();		
	
	this._mechNameDisplayWeapons = document.createElement("div");	
	this._mechNameDisplayWeapons.classList.add("upgrade_mech_name");
	
	this._weaponInfoTab.appendChild(this._mechNameDisplayWeapons);
	
	
	this._pilotInfoTab = document.createElement("div");
	this._pilotInfoTab.classList.add("pilot_info");
	windowNode.appendChild(this._pilotInfoTab);	
	this._tabInfo[0].elem = this._pilotInfoTab;
	
	this._pilotStats1 = document.createElement("div");
	this._pilotStats1.classList.add("list_detail");	
	this._pilotStats1.classList.add("pilot_detail_1");
	this._pilotInfoTab.appendChild(this._pilotStats1);	
	
	this._pilotStats2 = document.createElement("div");
	this._pilotStats2.classList.add("list_detail");	
	this._pilotStats2.classList.add("pilot_detail_2");
	this._pilotInfoTab.appendChild(this._pilotStats2);	
	
	
	this._pilotStatsTabButton = document.createElement("div");	
	this._pilotStatsTabButton.classList.add("tab_button");	
	this._pilotStatsTabButton.classList.add("pilot_stats_button");	
	this._pilotStatsTabButton.classList.add("scaled_text");			
	this._pilotStatsTabButton.innerHTML = APPSTRINGS.DETAILPAGES.label_pilot_ability;
	windowNode.appendChild(this._pilotStatsTabButton);
	this._tabInfo[0].button = this._pilotStatsTabButton;
	
	this._mechStatsTabButton = document.createElement("div");	
	this._mechStatsTabButton.classList.add("tab_button");	
	this._mechStatsTabButton.classList.add("mech_stats_button");	
	this._mechStatsTabButton.classList.add("scaled_text");			
	this._mechStatsTabButton.innerHTML = APPSTRINGS.DETAILPAGES.label_mech_ability;
	windowNode.appendChild(this._mechStatsTabButton);
	this._tabInfo[1].button = this._mechStatsTabButton;
	
	this._weaponsTabButton = document.createElement("div");	
	this._weaponsTabButton.classList.add("tab_button");	
	this._weaponsTabButton.classList.add("weapon_info_button");	
	this._weaponsTabButton.classList.add("scaled_text");			
	this._weaponsTabButton.innerHTML = APPSTRINGS.DETAILPAGES.label_weapon_info;
	this._tabInfo[2].button = this._weaponsTabButton;
	windowNode.appendChild(this._weaponsTabButton);
}	

Window_DetailPages.prototype.update = function() {
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			this.requestRedraw();
			if(this._selectedTab == 2){
				SoundManager.playCursor();
				this._attackList.incrementSelection();
			}
		
		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			this.requestRedraw();
		    if(this._selectedTab == 2){
				SoundManager.playCursor();
				this._attackList.decrementSelection();
			}
		}			

		if(Input.isTriggered('left') || Input.isRepeated('left')){
			this.requestRedraw();
			SoundManager.playCursor();
			if(this._selectedTab == 2 && this._attackList.getCurrentPage() != 0){
				this._attackList.decrementPage();
			} else {
				this._selectedTab--;
				if(this._selectedTab < 0){
					this._selectedTab = this._tabInfo.length - 1;
				}
			}
			
		} else if (Input.isTriggered('right') || Input.isRepeated('right')) {
			this.requestRedraw();
			SoundManager.playCursor();
			if(this._selectedTab == 2 && this._attackList.getCurrentPage() != this._attackList.getMaxPage()){
				this._attackList.incrementPage();
			} else {
				this._selectedTab++;
				if(this._selectedTab >= this._tabInfo.length){
					this._selectedTab = 0;
				}
			}
		}
		
		if(Input.isTriggered('left_trigger') || Input.isRepeated('left_trigger')){
			this.requestRedraw();
			
		} else if (Input.isTriggered('right_trigger') || Input.isRepeated('right_trigger')) {
			this.requestRedraw();
			
		}
		
		if(Input.isTriggered('pageup') || Input.isRepeated('pageup')){
			this.requestRedraw();
			if($gameSystem.isSubBattlePhase() !== 'enemy_unit_summary'){
				$gameTemp.currentMenuUnit = this.getPreviousAvailableUnitGlobal(this.getCurrentSelection().mech.id);
				this._attackList.resetSelection();
			}
			
		} else if (Input.isTriggered('pagedown') || Input.isRepeated('pagedown')) {
			this.requestRedraw();
			if($gameSystem.isSubBattlePhase() !== 'enemy_unit_summary'){
				$gameTemp.currentMenuUnit = this.getNextAvailableUnitGlobal(this.getCurrentSelection().mech.id);
				this._attackList.resetSelection();
			}
		}
		
		if(Input.isTriggered('L3')){
			this.requestRedraw();
			
		} 	
		
		if(Input.isTriggered('ok')){
			
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


Window_DetailPages.prototype.drawPilotStats1 = function() {
	var detailContent = "";
	var actor = this.getCurrentSelection().actor;
	var calculatedStats = actor.SRWStats.pilot.stats.calculated;
	var abilityList = $statCalc.getPilotAbilityList(actor);
	var currentLevel = $statCalc.getCurrentLevel(actor);
	
	detailContent+="<div class='bar_pilot_stats details'>";
	detailContent+="<div id='bar_pilot_stats_icon' class='scaled_width'></div>";//icon
	detailContent+="</div>";
	
	detailContent+="<div id='pilot_summary_name' class='upgrade_mech_name'>";
	detailContent+="<div class='upgrade_mech_name_value scaled_text'>"+actor.name()+"</div>";
	detailContent+="</div>";
	
	
	var currentLevel = $statCalc.getCurrentLevel(actor);
	
	detailContent+="<div id='pilot_summary_card' class='ability_block details scaled_width'>";		
	
	detailContent+="<div class='ability_block_row scaled_height'>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>Lv</div>";
	detailContent+="<div class='stat_value'>"+currentLevel+"</div>";
	detailContent+="</div>";
	detailContent+="</div>";
	
	detailContent+="<div class='ability_block_row scaled_height'>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>Will</div>";
	detailContent+="<div class='stat_value'>"+$statCalc.getCurrentWill(actor)+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>Next-Lv</div>";
	var currentExp = $statCalc.getExp(actor);
	
	detailContent+="<div class='stat_value'>"+(currentExp - (currentLevel * 500))+"</div>";
	detailContent+="</div>";
	detailContent+="</div>";
	
	detailContent+="<div class='ability_block_row scaled_height'>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>PP</div>";
	detailContent+="<div class='stat_value'>"+$statCalc.getCurrentPP(actor)+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>Exp</div>";
	var currentExp = $statCalc.getExp(actor);
	
	detailContent+="<div class='stat_value'>"+currentExp+"</div>";

	detailContent+="</div>";
	detailContent+="</div>";
	
	detailContent+="<div class='ability_block_row scaled_height'>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>SP</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.currentSP+"/"+calculatedStats.SP+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.GENERAL.label_kills+"</div>";
	
	detailContent+="<div class='stat_value'>"+$statCalc.getKills(actor)+"</div>";

	detailContent+="</div>";

	detailContent+="</div>";
	

	
	this._pilotStats1.innerHTML = detailContent;
	
	var actorIcon = this._pilotStats1.querySelector("#bar_pilot_stats_icon");
	if(actor.isActor()){
		this.loadActorFace(actor.actorId(), actorIcon);
	} else {
		this.loadEnemyFace(actor.enemyId(), actorIcon);
	}	
}

Window_DetailPages.prototype.drawPilotStats2 = function() {
	var detailContent = "";
	var actor = this.getCurrentSelection().actor;
	var calculatedStats = actor.SRWStats.pilot.stats.calculated;
	var abilityList = $statCalc.getPilotAbilityList(actor);
	var spiritList = $statCalc.getSpiritList(actor);
	var currentLevel = $statCalc.getCurrentLevel(actor);
	
	 

	detailContent+="<div class='ability_block details scaled_width'>";	
	detailContent+="<div class='ability_block_label scaled_text scaled_width'>";
	detailContent+=APPSTRINGS.GENERAL.label_stats;
	detailContent+="</div>";
	
	detailContent+="<div class='ability_block_row scaled_height'>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.PILOTSTATS.melee+"</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.melee+"</div>";
	detailContent+="</div>";
	
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.PILOTSTATS.skill+"</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.skill+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.PILOTSTATS.evade+"</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.evade+"</div>";
	detailContent+="</div>";
	detailContent+="</div>";
	
	detailContent+="<div class='ability_block_row scaled_height'>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.PILOTSTATS.ranged+"</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.ranged+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.PILOTSTATS.defense+"</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.defense+"</div>";
	detailContent+="</div>";
	
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>"+APPSTRINGS.PILOTSTATS.hit+"</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.hit+"</div>";
	detailContent+="</div>";
	detailContent+="</div>";
	
	detailContent+="<div class='ability_block_row terrain scaled_height'>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>AIR</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.terrain.air+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>LND</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.terrain.land+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>SEA</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.terrain.water+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>SPC</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.terrain.space+"</div>";
	detailContent+="</div>";
	detailContent+="</div>";
	
	detailContent+="</div>";
	
	detailContent+="<div class='ability_block skills scaled_width'>";	
	detailContent+="<div class='ability_block_label scaled_text scaled_width'>";
	detailContent+=APPSTRINGS.GENERAL.label_abilities;
	detailContent+="</div>";
	
	detailContent+="<div class='ability_block_row scaled_height'>";
	var rowCounter = 0;
	for(var i = 0; i < 6; i++){
		if(rowCounter >= 2){
			rowCounter = 0;
			detailContent+="</div>";
			detailContent+="<div class='ability_block_row scaled_height'>";
		}		
		
		var displayName = "---";
		var uniqueString = "";
		if(typeof abilityList[i] != "undefined" && abilityList[i].requiredLevel <= currentLevel){
			var displayInfo = $pilotAbilityManager.getAbilityDisplayInfo(abilityList[i].idx);
			displayName = displayInfo.name;
			if(displayInfo.hasLevel){
				displayName+="L"+abilityList[i].level;
			}
			if(displayInfo.isUnique){
				uniqueString = "*";
			} else {
				uniqueString = "&nbsp;";
			}
		}
		
		detailContent+="<div class='pilot_stat_container scaled_text scaled_width fitted_text'>";
		detailContent+="<div class='unique_skill_mark scaled_width'>"+uniqueString+"</div>";
		detailContent+="<div class='stat_value'>"+displayName+"</div>";
		detailContent+="</div>";		
		
		rowCounter++;
	}
	detailContent+="</div>";
	
	detailContent+="</div>";
	
	detailContent+="<div class='ability_block skills scaled_width'>";	
	detailContent+="<div class='ability_block_label scaled_text scaled_width'>";
	detailContent+=APPSTRINGS.GENERAL.label_spirits;
	detailContent+="</div>";
	
	detailContent+="<div class='ability_block_row scaled_height'>";
	var rowCounter = 0;
	for(var i = 0; i < 6; i++){
		if(rowCounter >= 2){
			rowCounter = 0;
			detailContent+="</div>";
			detailContent+="<div class='ability_block_row scaled_height'>";
		}		
		
		var displayName = "---";
		var uniqueString = "";
		if(typeof spiritList[i] != "undefined" && spiritList[i].level <= currentLevel){
			var displayInfo = $spiritManager.getSpiritDisplayInfo(spiritList[i].idx);
			displayName = "<div class='scaled_width spirit_label'>"+displayInfo.name+"</div>("+spiritList[i].cost+")" ;
		}
		
		detailContent+="<div class='pilot_stat_container scaled_text scaled_width fitted_text spirit_list_entry'>";
		detailContent+="<div class='stat_value'>"+displayName+"</div>";
		detailContent+="</div>";		
		
		rowCounter++;
	}
	detailContent+="</div>";
	
	
	detailContent+="<div class='ability_block skills ace_bonus'>";	
	detailContent+="<div class='ability_block_label scaled_text scaled_width'>";
	detailContent+=APPSTRINGS.GENERAL.label_ace_bonus;
	detailContent+="</div>";
	
	var aceAbility = $statCalc.getAceAbility(actor);		
	if(aceAbility && $statCalc.isAce(actor)){		
		detailContent+="<div class='ace_desc scaled_text'>";
		detailContent+=$pilotAbilityManager.getAbilityDisplayInfo(aceAbility.idx).desc;
		detailContent+="</div>";
	} else {
		detailContent+="<div class='ace_desc scaled_text'>";
		detailContent+=APPSTRINGS.DETAILPAGES.label_ace_hint;
		detailContent+="</div>";
	}	
	
	detailContent+="</div>";

	
	detailContent+="</div>";
	this._pilotStats2.innerHTML = detailContent;
	

}

Window_DetailPages.prototype.redraw = function() {
	//this._mechList.redraw();
	
	this._detailBarMechDetail.redraw();		
	this._detailBarMechUpgrades.redraw();	
	this._attackList.redraw();
	this._attackSummary.redraw();
	
	for(var i = 0; i < this._tabInfo.length; i++){
		var tab = this._tabInfo[i].elem;
		if(tab){
			tab.style.display = "none";
		}		
		var button =  this._tabInfo[i].button;
		if(button){
			button.classList.remove("selected");
		}
	}
	
	var activeTab = this._tabInfo[this._selectedTab].elem;
	if(activeTab){
		activeTab.style.display = "";
	}
	
	var activeTabButton = this._tabInfo[this._selectedTab].button;
	if(activeTabButton){
		activeTabButton.classList.add("selected");
	}	
	
	var mechNameContent = "";
	mechNameContent+="<div id='detail_pages_upgrade_name_icon'></div>";//icon 
	mechNameContent+="<div class='upgrade_mech_name_value scaled_text'>"+this.getCurrentSelection().mech.classData.name+"</div>";//icon 	
	this._mechNameDisplay.innerHTML = mechNameContent;	
	
	var mechIcon = this._container.querySelector("#detail_pages_upgrade_name_icon");
	this.loadMechMiniSprite(this.getCurrentSelection().mech.id, mechIcon);
	
	var mechNameContent = "";
	mechNameContent+="<div id='detail_pages_weapons_name_icon'></div>";//icon 
	mechNameContent+="<div class='upgrade_mech_name_value scaled_text'>"+this.getCurrentSelection().mech.classData.name+"</div>";//icon 	
	this._mechNameDisplayWeapons.innerHTML = mechNameContent;	
	
	var mechIcon = this._container.querySelector("#detail_pages_weapons_name_icon");
	this.loadMechMiniSprite(this.getCurrentSelection().mech.id, mechIcon);
	
	
	
	var FUBContent = "";
	FUBContent+="<div class='FUB_label scaled_text'>"+APPSTRINGS.DETAILPAGES.label_FUB+"</div>"
	FUBContent+="<div class='FUB_content scaled_text'>";
	var mech = this.createReferenceData(this.getCurrentSelection().mech);
	var FUB = $statCalc.getMechFUB(mech);
	if(FUB && $statCalc.isFUB(mech)){
		var displayInfo = $mechAbilityManager.getAbilityDisplayInfo(FUB.idx);
		FUBContent+=displayInfo.desc;
	} else {
		FUBContent+=APPSTRINGS.DETAILPAGES.label_FUB_hint;
	}
	FUBContent+="</div>";
	this._FUBContainer.innerHTML = FUBContent;
	
	this.drawPilotStats1();
	this.drawPilotStats2();
	
	
	
	this.updateScaledDiv(this._actorBattleImg);
	
	var battleSpriteFolder = $statCalc.getBattleSceneImage(this.getCurrentSelection().actor);
	this._actorBattleImg.innerHTML = "<img src='img/SRWBattleScene/"+battleSpriteFolder+"/main.png'>";

	Graphics._updateCanvas();
}