import Window_CSS from "./Window_CSS.js";
import MechList from "./MechList.js"
import DetailBarMechDetail from "./DetailBarMechDetail.js";
import DetailBarMechUpgrades from "./DetailBarMechUpgrades.js";
import AttackList from "./AttackList.js";
import DetailBarAttackSummary from "./DetailBarAttackSummary.js";
import DescriptionOverlay from "./DescriptionOverlay.js";
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
	this._uiState = "normal";
	this._selectedTab = 0;
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
	this._subPilotIdx = 0;
}


Window_DetailPages.prototype.resetSelection = function(){
	$statCalc.invalidateAbilityCache(); //ensure most up to date stats of unit are shown
	this._currentSelection = 0;
	this._currentPage = 0;
	this._selectedTab = 0;
	this._uiState = "normal";
	this._subPilotIdx = 0;
	this.validateTab();
}

Window_DetailPages.prototype.getCurrentSelection = function(){
	var unit = $gameTemp.currentMenuUnit;	
	if(this._subPilotIdx != 0){
		var subPilots = $statCalc.getSubPilots(unit.actor);
		var subPilotId = subPilots[this._subPilotIdx - 1];
		if(subPilotId != null){
			unit = {actor: $gameActors.actor(subPilotId), mech: unit.actor.SRWStats.mech};
		}
	}
	return unit;
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
	
	this._descriptionContainer = document.createElement("div");
	this._descriptionContainer.classList.add("description_container");
	windowNode.appendChild(this._descriptionContainer);
	
	this._descriptionOverlay = new DescriptionOverlay(this._descriptionContainer);
	this._descriptionOverlay.createComponents();
}	

Window_DetailPages.prototype.update = function() {
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){
		if(this._uiState == "normal"){
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
		}
		
					

		if(Input.isTriggered('left') || Input.isRepeated('left')){
			this.requestRedraw();
			SoundManager.playCursor();
			if(this._uiState == "normal"){
				if(this._selectedTab == 2 && this._attackList.getCurrentPage() != 0){
					this._attackList.decrementPage();
				} else {
					this._selectedTab--;
					if(this._selectedTab < 0){
						this._selectedTab = this._tabInfo.length - 1;
					}
					
					if(this.getCurrentSelection().actor.SRWStats.pilot.id == -1){
						if(this._selectedTab == 0){
							this._selectedTab = this._tabInfo.length - 1;
						}
					}				
				}
			} else {
				this._descriptionOverlay.decrementSelection();
			}			
		} else if (Input.isTriggered('right') || Input.isRepeated('right')) {
			this.requestRedraw();
			SoundManager.playCursor();
			if(this._uiState == "normal"){
				if(this._selectedTab == 2 && this._attackList.getCurrentPage() != this._attackList.getMaxPage()){
					this._attackList.incrementPage();
				} else {
					this._selectedTab++;
					if(this._selectedTab >= this._tabInfo.length){
						this._selectedTab = 0;
					}
				}
				
				if(this.getCurrentSelection().actor.SRWStats.pilot.id == -1){
					if(this._selectedTab == 0){
						this._selectedTab = 1;
					}
				}
			} else {
				this._descriptionOverlay.incrementSelection();
			}		
		}
		
		if(Input.isTriggered('left_trigger') || Input.isRepeated('left_trigger')){
			this.requestRedraw();
			//if($gameTemp.detailPageMode == "map"){
				this._subPilotIdx--;
				if(this._subPilotIdx < 0){
					var subPilots = $statCalc.getSubPilots($gameTemp.currentMenuUnit.actor);
					if(subPilots.length){
						this._subPilotIdx = subPilots.length;// main pilot is idx 0
					}					
				}
			//}
			
		} else if (Input.isTriggered('right_trigger') || Input.isRepeated('right_trigger')) {
			this.requestRedraw();
			//if($gameTemp.detailPageMode == "map"){
				this._subPilotIdx++;
				var subPilots = $statCalc.getSubPilots($gameTemp.currentMenuUnit.actor);
				if(this._subPilotIdx > subPilots.length){// main pilot is idx 0
					this._subPilotIdx = 0;
				}
			//}
		}
		
		if(this._uiState == "normal"){
			if(Input.isTriggered('pageup') || Input.isRepeated('pageup')){
				this.requestRedraw();
				if($gameTemp.detailPageMode == "map"){
					if($gameTemp.currentMenuUnit.actor.isSubTwin){
						var actor = $statCalc.getMainTwin($gameTemp.currentMenuUnit.actor);
						$gameTemp.currentMenuUnit = {mech: actor.SRWStats.mech, actor: actor}
					} else if($gameTemp.currentMenuUnit.actor.subTwin){
						var actor = $gameTemp.currentMenuUnit.actor.subTwin;
						$gameTemp.currentMenuUnit = {mech: actor.SRWStats.mech, actor: actor}
					}
				} else {
					if($gameSystem.isSubBattlePhase() !== 'enemy_unit_summary'){
						if($gameTemp.listContext == "actor"){
							$gameTemp.currentMenuUnit = this.getPreviousAvailablePilotGlobal(this.getCurrentSelection().actor.SRWStats.pilot.id);
						} else {
							$gameTemp.currentMenuUnit = this.getPreviousAvailableUnitGlobal(this.getCurrentSelection().mech.id);
						}
						
						this._attackList.resetSelection();
					}
				}
				this._subPilotIdx = 0;
				
			} else if (Input.isTriggered('pagedown') || Input.isRepeated('pagedown')) {
				this.requestRedraw();
				if($gameTemp.detailPageMode == "map"){
					if($gameTemp.currentMenuUnit.actor.isSubTwin){
						var actor = $statCalc.getMainTwin($gameTemp.currentMenuUnit.actor);
						$gameTemp.currentMenuUnit = {mech: actor.SRWStats.mech, actor: actor}
					} else if($gameTemp.currentMenuUnit.actor.subTwin){
						var actor = $gameTemp.currentMenuUnit.actor.subTwin;
						$gameTemp.currentMenuUnit = {mech: actor.SRWStats.mech, actor: actor}
					}
				} else {
					if($gameSystem.isSubBattlePhase() !== 'enemy_unit_summary'){
						if($gameTemp.listContext == "actor"){
							$gameTemp.currentMenuUnit = this.getNextAvailablePilotGlobal(this.getCurrentSelection().actor.SRWStats.pilot.id);
						} else {
							$gameTemp.currentMenuUnit = this.getNextAvailableUnitGlobal(this.getCurrentSelection().mech.id);
						}
						
						this._attackList.resetSelection();
					}
				}
				this._subPilotIdx = 0;
			}
		}
		if(Input.isTriggered('L3')){
			this.requestRedraw();
			
		} 	
		
		if(Input.isTriggered('ok')){
			
		}
		
		if(Input.isTriggered('menu')){
			if(this._uiState == "normal"){
				if(this._selectedTab == 0){
					this._descriptionOverlay.show(this._pilotStats2);
					this._uiState = "description";
				} else if(this._selectedTab == 1){
					this._descriptionOverlay.show(this._detailContainer);
					this._uiState = "description";
				}				
			}
		}	
		
		if(Input.isTriggered('cancel')){	
			SoundManager.playCancel();
			if(this._uiState == "normal"){
				$gameTemp.popMenu = true;	
			
				if(this._callbacks["closed"]){
					this._callbacks["closed"]();
				}					
			} else {
				this._descriptionOverlay.hide();
				this._uiState = "normal";
			}			
		}				
		
		this.validateTab();		
		this.refresh();
	}		
};

Window_DetailPages.prototype.validateTab = function() {
	if(!this.getCurrentSelection().actor || this.getCurrentSelection().actor.SRWStats.pilot.id == -1){
		if(this._selectedTab == 0){
			this._selectedTab = 1;
			this.requestRedraw();
		}
	}		
	if(this.getCurrentSelection().mech.id == -1){
		if(this._selectedTab != 0){
			this._selectedTab = 0;
			this.requestRedraw();
		}
	}
}

Window_DetailPages.prototype.drawPilotStats1 = function() {
	var _this = this;
	var detailContent = "";
	var actor = this.getCurrentSelection().actor;
	var calculatedStats = actor.SRWStats.pilot.stats.calculated;
	var calculatedMechStats = actor.SRWStats.mech.stats.calculated;
	var abilityList = $statCalc.getPilotAbilityList(actor);
	var currentLevel = $statCalc.getCurrentLevel(actor);
	
	detailContent+="<div class='bar_pilot_stats details'>";
	detailContent+="<div class='twin_type scaled_text fitted_text type_indicator'>";
	var referenceActor = actor;
	if(actor.isSubPilot){
		referenceActor = referenceActor.mainPilot;
	}
	if(!referenceActor.isSubTwin){
		detailContent+="Main Twin";
	} else {
		detailContent+="Sub Twin";
	}
	detailContent+="</div>";
	
	detailContent+="<div data-offset=-1 data-type=twin class='left twin selection_icon'></div>";//icon 
	detailContent+="<div data-offset=1 data-type=twin class='right twin selection_icon'></div>";//icon 
	
	detailContent+="<div class='pilot_type scaled_text fitted_text type_indicator'>";
	if(!actor.isSubPilot){
		detailContent+="Main Pilot";
	} else {
		detailContent+="Sub Pilot";
	}
	detailContent+="</div>";
	
	detailContent+="<div data-offset=-1 data-type=sub class='left sub selection_icon'></div>";//icon 
	detailContent+="<div data-offset=1 data-type=sub class='right sub selection_icon'></div>";//icon 
	
	detailContent+="<div id='bar_pilot_stats_icon' class=''></div>";//icon
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
	
	detailContent+="<div class='stat_value'>"+(500 - (currentExp - (currentLevel * 500)))+"</div>";
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
	detailContent+="</div>";
	
	detailContent+="<div id='combined_terrain_card' class='ability_block details scaled_width'>";		
	
	detailContent+="<div class='ability_block_label scaled_text scaled_width'>";
	detailContent+=APPSTRINGS.GENERAL.label_combined_terrain;
	detailContent+="</div>";
	
	var mechTerrainStrings = $statCalc.getRealMechTerrainStrings(actor);
	
	detailContent+="<div class='ability_block_row terrain scaled_height'>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>AIR</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.terrain.air+"</div>";
	detailContent+="<div class='stat_value plus'>+</div>";
	detailContent+="<div class='stat_value'>"+mechTerrainStrings.air+"</div>";
	detailContent+="<div class='stat_value'>=</div>";
	detailContent+="<div class='stat_value'>"+$statCalc.getFinalTerrainString(actor, "air")+"</div>";	
	detailContent+="</div>";
	detailContent+="</div>";
	detailContent+="<div class='ability_block_row terrain scaled_height'>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>LND</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.terrain.land+"</div>";
	detailContent+="<div class='stat_value plus'>+</div>";
	detailContent+="<div class='stat_value'>"+mechTerrainStrings.land+"</div>";
	detailContent+="<div class='stat_value'>=</div>";
	detailContent+="<div class='stat_value'>"+$statCalc.getFinalTerrainString(actor, "land")+"</div>";
	detailContent+="</div>";
	detailContent+="</div>";
	detailContent+="<div class='ability_block_row terrain scaled_height'>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>SEA</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.terrain.water+"</div>";
	detailContent+="<div class='stat_value plus'>+</div>";
	detailContent+="<div class='stat_value'>"+mechTerrainStrings.water+"</div>";
	detailContent+="<div class='stat_value'>=</div>";
	detailContent+="<div class='stat_value'>"+$statCalc.getFinalTerrainString(actor, "water")+"</div>";
	detailContent+="</div>";
	detailContent+="</div>";
	detailContent+="<div class='ability_block_row terrain scaled_height'>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>SPC</div>";
	detailContent+="<div class='stat_value'>"+calculatedStats.terrain.space+"</div>";
	detailContent+="<div class='stat_value plus'>+</div>";
	detailContent+="<div class='stat_value'>"+mechTerrainStrings.space+"</div>";
	detailContent+="<div class='stat_value'>=</div>";
	detailContent+="<div class='stat_value'>"+$statCalc.getFinalTerrainString(actor, "space")+"</div>";
	detailContent+="</div>";
	detailContent+="</div>";
	
	

	
	

	
	this._pilotStats1.innerHTML = detailContent;
	
	var actorIcon = this._pilotStats1.querySelector("#bar_pilot_stats_icon");
	this.updateScaledDiv(actorIcon);
	if(actor.isActor()){
		this.loadActorFace(actor.actorId(), actorIcon);
	} else {
		this.loadEnemyFace(actor.enemyId(), actorIcon);
	}	
	var typeIndicators = this._pilotStats1.querySelectorAll(".type_indicator");
	typeIndicators.forEach(function(indicator){
		_this.updateScaledDiv(indicator);
	});
	
	var selectionIcons =  this._pilotStats1.querySelectorAll(".selection_icon")
	selectionIcons.forEach(function(selectionIcon){
		_this.updateScaledDiv(selectionIcon);
		var type = selectionIcon.getAttribute("data-type");
		var offset = selectionIcon.getAttribute("data-offset")*1;
		var actor = _this.getCurrentSelection().actor;
		if(actor.isSubPilot){
			actor = actor.mainPilot;
		}
		if(type == "twin"){
			if(offset == -1){
				if(actor.isSubTwin){
					if(actor.isActor()){
						_this.loadActorFace($statCalc.getMainTwin(actor).actorId(), selectionIcon);
					} else {
						_this.loadEnemyFace($statCalc.getMainTwin(actor).enemyId(), selectionIcon);
					}
					
				}
			} else {
				if(actor.subTwin){
					if(actor.isActor()){
						_this.loadActorFace(actor.subTwin.actorId(), selectionIcon);
					} else {
						_this.loadEnemyFace(actor.subTwin.enemyId(), selectionIcon);
					}
				}
			}
		} else {
			var subPilotIds = $statCalc.getSubPilots(actor);
			var list = JSON.parse(JSON.stringify(subPilotIds));
			if(actor.isActor()){
				list.unshift(actor.actorId());
			} else {
				list.unshift(actor.enemyId());
			}
			
			var idx = _this._subPilotIdx + offset;
			if(idx == -1){
				idx = list.length - 1;
			}
			if(idx == list.length){
				idx = 0;
			}
			if(list.length > 1 && list[idx]){
				_this.loadActorFace(list[idx], selectionIcon);
			}
			
		}
	});
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
		var displayClass = "";
		var uniqueString = "";
		var descriptionData = "";
		var descriptionClass = "";
		if(typeof abilityList[i] != "undefined" && abilityList[i].requiredLevel <= currentLevel){
			descriptionClass = "described_element";
			descriptionData = "data-type='pilot' data-idx='"+abilityList[i].idx+"'";
			var displayInfo = $pilotAbilityManager.getAbilityDisplayInfo(abilityList[i].idx);
			
			if(displayInfo.isHighlightedHandler){
				displayClass = displayInfo.isHighlightedHandler(actor, abilityList[i].level);
			}
			
			if($gameSystem.isHiddenActorAbility(actor, abilityList[i].idx)){
				displayName = "?????";
			} else {			
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
		}
		
		
		detailContent+="<div "+descriptionData+" class='pilot_stat_container "+descriptionClass+" scaled_text scaled_width fitted_text "+displayClass+"'>";
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
		var descriptionData = "";
		var descriptionClass = "";
		if(typeof spiritList[i] != "undefined" && spiritList[i].level <= currentLevel){
			descriptionClass = "described_element";
			descriptionData = "data-type='spirit' data-idx='"+spiritList[i].idx+"'";
			
			var displayInfo = $spiritManager.getSpiritDisplayInfo(spiritList[i].idx);
			displayName = "<div class='scaled_width spirit_label'>"+displayInfo.name+"</div>("+spiritList[i].cost+")" ;
		}
		
		detailContent+="<div "+descriptionData+" class='pilot_stat_container "+descriptionClass+" scaled_text scaled_width fitted_text spirit_list_entry'>";
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
		detailContent+=APPSTRINGS.DETAILPAGES.label_ace_hint.replace("{KILLS_NEEDED}", ENGINE_SETTINGS.ACE_REQUIREMENT);
		detailContent+="</div>";
	}	
	
	detailContent+="</div>";

	
	detailContent+="</div>";
	this._pilotStats2.innerHTML = detailContent;
	

}

Window_DetailPages.prototype.redraw = function() {
	//this._mechList.redraw();
	
	if(this.getCurrentSelection().mech.id != -1){
		this._detailBarMechDetail.redraw();		
		this._detailBarMechUpgrades.redraw();	
		this._attackList.redraw();
		this._attackSummary.redraw();
	}	
	
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
	
	if(this.getCurrentSelection().mech.id != -1){
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
	}	
	
	var FUBContent = "";
	FUBContent+="<div class='FUB_label scaled_text'>"+APPSTRINGS.DETAILPAGES.label_FUB+"</div>"
	FUBContent+="<div class='FUB_content scaled_text'>";
	var mech = this.createReferenceData(this.getCurrentSelection().mech);
	var FUB = $statCalc.getMechFUB(mech);
	if(FUB && $statCalc.isFUB(mech)){
		var displayInfo = $mechAbilityManager.getAbilityDisplayInfo(FUB.idx);
		FUBContent+=displayInfo.desc;
	} else {
		FUBContent+=APPSTRINGS.DETAILPAGES.label_FUB_hint.replace("{LEVEL_NEEDED}", $gameSystem.requiredFUBLevel || $statCalc.getMaxUpgradeLevel());
	}
	FUBContent+="</div>";
	this._FUBContainer.innerHTML = FUBContent;
	
	if(this.getCurrentSelection().actor.SRWStats.pilot.id != -1){
		this.drawPilotStats1();
		this.drawPilotStats2();	
	}
	
	
	this.updateScaledDiv(this._actorBattleImg);
	
	if(this.getCurrentSelection().mech.id != -1){	
		var menuImagePath = $statCalc.getMenuImagePath(this.getCurrentSelection().actor);
		this._actorBattleImg.innerHTML = "<img src='img/"+menuImagePath+"'>";	
	}
	
	
	this._descriptionOverlay.redraw();
	Graphics._updateCanvas();
}