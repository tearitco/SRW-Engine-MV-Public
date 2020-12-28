import Window_CSS from "./Window_CSS.js";
import "./style/AttackList.css";

export default function DetailBarAttackSummary(container, selectionProvider){
	this._container = container;
	this._selectionProvider = selectionProvider;
	this._attackValidator;
}

DetailBarAttackSummary.prototype = Object.create(Window_CSS.prototype);
DetailBarAttackSummary.prototype.constructor = DetailBarAttackSummary;

DetailBarAttackSummary.prototype.getCurrentSelection = function(){
	return this._selectionProvider.getCurrentSelection();	
}

DetailBarAttackSummary.prototype.setAttackValidator = function(validator){
	this._attackValidator = validator;
}

DetailBarAttackSummary.prototype.createComponents = function(){
		
}

DetailBarAttackSummary.prototype.redraw = function(){
	var detailContent = "";
	var attackData = this.getCurrentSelection();
	var mechData = $gameTemp.currentMenuUnit.mech;
	var calculatedStats = mechData.stats.calculated;
	var upgradeLevels = mechData.stats.upgradeLevels;

	
	detailContent+="<div class='summary_flex'>";	
	
	detailContent+="<div class='summary_column'>";
	
	detailContent+="<div class='summary_row'>";
	detailContent+="<div class='summary_row_label scaled_text'>";
	detailContent+=APPSTRINGS.ATTACKLIST.label_ammo;
	detailContent+="</div>";
	if(attackData.totalAmmo == -1){
		detailContent+="<div class='summary_row_value scaled_text disabled'>";
		detailContent+="-- / --";
		detailContent+="</div>";
	} else if(attackData.currentAmmo < 0) {
		detailContent+="<div class='summary_row_value scaled_text insufficient'>";
		detailContent+=attackData.currentAmmo + " / " + attackData.totalAmmo;
		detailContent+="</div>";
	} else {
		detailContent+="<div class='summary_row_value scaled_text'>";
		detailContent+=attackData.currentAmmo + " / " + attackData.totalAmmo;
		detailContent+="</div>";
	}		
	detailContent+="</div>";
	
	detailContent+="<div class='summary_row'>";
	detailContent+="<div class='summary_row_label scaled_text'>";
	detailContent+=APPSTRINGS.ATTACKLIST.label_EN_cost;
	detailContent+="</div>";
	
	var realEnCost = $statCalc.getRealENCost($gameTemp.currentMenuUnit.actor, attackData.ENCost);
	if(realEnCost == -1){
		detailContent+="<div class='summary_row_value scaled_text disabled'>";
		detailContent+="--- ("+calculatedStats.currentEN+")";
		detailContent+="</div>";
	} else if(calculatedStats.currentEN < realEnCost) {
		detailContent+="<div class='summary_row_value scaled_text insufficient'>";
		detailContent+=String(realEnCost).padStart(3, "0")+" ("+calculatedStats.currentEN+")";
		detailContent+="</div>";
	} else {
		detailContent+="<div class='summary_row_value scaled_text'>";
		detailContent+=String(realEnCost).padStart(3, "0")+" ("+calculatedStats.currentEN+")";
		detailContent+="</div>";
	}		
	detailContent+="</div>";
	
	detailContent+="<div class='summary_row'>";
	detailContent+="<div class='summary_row_label scaled_text required_will_label'>";
	detailContent+=APPSTRINGS.ATTACKLIST.label_required_will;
	detailContent+="</div>";
	if(attackData.willRequired == -1){
		detailContent+="<div class='summary_row_value scaled_text disabled'>";
		detailContent+="--- ("+$statCalc.getCurrentWill($gameTemp.currentMenuUnit.actor)+")";
		detailContent+="</div>";
	} else if($statCalc.getCurrentWill($gameTemp.currentMenuUnit.actor) < attackData.willRequired) {
		detailContent+="<div class='summary_row_value scaled_text insufficient'>";
		detailContent+=String(attackData.willRequired).padStart(3, "0")+" ("+$statCalc.getCurrentWill($gameTemp.currentMenuUnit.actor)+")";
		detailContent+="</div>";
	} else {
		detailContent+="<div class='summary_row_value scaled_text'>";
		detailContent+=String(attackData.willRequired).padStart(3, "0")+" ("+$statCalc.getCurrentWill($gameTemp.currentMenuUnit.actor)+")";
		detailContent+="</div>";
	}		
	detailContent+="</div>";
	
	if(this._attackValidator){
		detailContent+="<div class='summary_row usage_detail scaled_text'>";
	
		var validationResult = this._attackValidator.validateAttack(attackData);
		if(!validationResult.canUse){
			var detail = validationResult.detail;
			if(detail.ammo){
				detailContent+=APPSTRINGS.ATTACKLIST.label_no_ammo;
			} else if(detail.EN){
				detailContent+=APPSTRINGS.ATTACKLIST.label_no_EN;
			} else if(detail.will){
				detailContent+=APPSTRINGS.ATTACKLIST.label_no_will;
			} else if(detail.postMove){
				detailContent+=APPSTRINGS.ATTACKLIST.label_no_post_move;
			} else if(detail.target){
				detailContent+=APPSTRINGS.ATTACKLIST.label_no_target;
			} else if(detail.isMap){
				detailContent+=APPSTRINGS.ATTACKLIST.label_no_map_counter;
			} else if(detail.noParticipants){
				detailContent+=APPSTRINGS.ATTACKLIST.label_no_participants;
			} else if(detail.terrain){
				detailContent+=APPSTRINGS.ATTACKLIST.label_no_terrain;
			}    			
		}
	
		detailContent+="</div>";
	}
	
	detailContent+="</div>";
	
	detailContent+="<div class='summary_column'>";
	
	detailContent+="<div class='summary_row'>";
	detailContent+="<div class='summary_row_label scaled_text'>";
	detailContent+=APPSTRINGS.ATTACKLIST.label_terrain_rating;
	detailContent+="</div>";
	
	detailContent+="<div class='summary_row_value scaled_text disabled'>";
	
	detailContent+="<div class='ability_block_row terrain scaled_height'>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>AIR</div>";
	detailContent+="<div class='stat_value'>"+attackData.terrain.air+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>LND</div>";
	detailContent+="<div class='stat_value'>"+attackData.terrain.land+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>SEA</div>";
	detailContent+="<div class='stat_value'>"+attackData.terrain.water+"</div>";
	detailContent+="</div>";
	detailContent+="<div class='pilot_stat_container scaled_text scaled_width'>";
	detailContent+="<div class='stat_label'>SPC</div>";
	detailContent+="<div class='stat_value'>"+attackData.terrain.space+"</div>";
	detailContent+="</div>";
	detailContent+="</div>";	
	
	detailContent+="</div>";
	detailContent+="</div>";
	
	detailContent+="<div class='summary_row'>";
	detailContent+="<div class='summary_row_label scaled_text required_will_label'>";
	detailContent+=APPSTRINGS.ATTACKLIST.label_special_effect;
	detailContent+="</div>";
	if(typeof attackData.effects[0] == "undefined"){
		detailContent+="<div class='summary_row_value scaled_text disabled'>";
		detailContent+="------";
		detailContent+="</div>";
	} else { //TODO Add display once weapon effects are actually implemented
		detailContent+="<div class='summary_row_value scaled_text'>";
		detailContent+=$weaponEffectManager.getAbilityDisplayInfo(attackData.effects[0]).name;
		detailContent+="</div>";
	}		
	detailContent+="</div>";	
	
	detailContent+="<div class='summary_row'>";
	detailContent+="<div class='summary_row_label scaled_text required_will_label'>";
	detailContent+=APPSTRINGS.ATTACKLIST.label_special_effect;
	detailContent+="</div>";
	if(typeof attackData.effects[1] == "undefined"){
		detailContent+="<div class='summary_row_value scaled_text disabled'>";
		detailContent+="------";
		detailContent+="</div>";
	} else { //TODO Add display once weapon effects are actually implemented
		detailContent+="<div class='summary_row_value scaled_text'>";
		detailContent+=$weaponEffectManager.getAbilityDisplayInfo(attackData.effects[1]).name;
		detailContent+="</div>";
	}		
	detailContent+="</div>";

	detailContent+="<div class='summary_row'>";
	detailContent+="<div class='summary_row_label scaled_text required_will_label'>";
	detailContent+=APPSTRINGS.ATTACKLIST.label_upgrades;
	detailContent+="</div>";
	
	detailContent+="<div class='summary_row_value scaled_text disabled'>";
	detailContent+=this.createUpgradeBarScaled(upgradeLevels.weapons);
	detailContent+="</div>";
		
	detailContent+="</div>";	
		
	detailContent+="</div>";
	
	detailContent+="</div>";
	
	detailContent+="</div>";
	
	this._container.innerHTML = detailContent;
}