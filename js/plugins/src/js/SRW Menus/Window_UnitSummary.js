import Window_CSS from "./Window_CSS.js";
import "./style/Window_UnitSummary.css";

export default function Window_UnitSummary() {
	this.initialize.apply(this, arguments);	
}

Window_UnitSummary.prototype = Object.create(Window_CSS.prototype);
Window_UnitSummary.prototype.constructor = Window_UnitSummary;

Window_UnitSummary.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "unit_summary";	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
}

Window_UnitSummary.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	var windowNode = this.getWindowNode();	
	this._bgFadeContainer.innerHTML = "";	
}	

Window_UnitSummary.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){			
		this.refresh();
	}			
};

Window_UnitSummary.prototype.refresh = function() {
	if(this._redrawRequested){
		this._redrawRequested = false;
		this.redraw();		
	}
	this.getWindowNode().style.display = this._visibility;
}

Window_UnitSummary.prototype.redraw = function() {	
	var _this = this;
	var content = "";
	if($gameTemp.summaryUnit){
		var actor = $gameTemp.summaryUnit;
		content+="<div class='unit_summary_content'>";
		content+="<div id='unit_summary_icon'></div>";//icon 		
		if($statCalc.isShip(actor)){
			content+="<img class='ship_icon' src='svg/anchor.svg' />";//icon 		
		}	
			
		content+="</div>";		
		
		content+="<div class='pilot_name scaled_text scaled_width fitted_text'>";
		content+=actor.name();
		content+="</div>";
		
		content+="<div class='pilot_stats scaled_text'>";	
		content+="<div class='level scaled_width'>";
		content+="<div class='label'>";
		content+="Lv";
		content+="</div>";
		content+="<div class='value'>";
		content+=$statCalc.getCurrentLevel(actor);
		content+="</div>";
		content+="</div>";
		content+="<div class='will scaled_width'>";
		content+="<div class='label'>";
		content+="Will";
		content+="</div>";
		content+="<div class='value'>";
		content+=$statCalc.getCurrentWill(actor);
		content+="</div>";
		content+="</div>";
		content+="</div>";
		
		var calculatedStats = $statCalc.getCalculatedMechStats(actor);
		
		content+="<div class='mech_hp_en_container scaled_text'>";
		content+="<div class='hp_label scaled_text'>HP</div>";
		content+="<div class='en_label scaled_text'>EN</div>";

			
		content+="<div class='hp_display'>";
		content+="<div class='current_hp scaled_text'>"+$statCalc.getCurrentHPDisplay(actor)+"</div>";
		content+="<div class='divider scaled_text'>/</div>";
		content+="<div class='max_hp scaled_text'>"+$statCalc.getCurrentMaxHPDisplay(actor)+"</div>";
		
		content+="</div>";
		
		content+="<div class='en_display'>";
		content+="<div class='current_en scaled_text'>"+$statCalc.getCurrentENDisplay(actor)+"</div>";
		content+="<div class='divider scaled_text'>/</div>";
		content+="<div class='max_en scaled_text'>"+$statCalc.getCurrentMaxENDisplay(actor)+"</div>";
		
		content+="</div>";
		
		if($gameTemp.isMapTarget(actor.event.eventId())){
			var hitRate = $battleCalc.performHitCalculation(
				{actor: $gameTemp.currentBattleActor, action: $gameTemp.actorAction},
				{actor: actor, action: {type: "defend"}}
			);
			content+="<div class='hit_display scaled_text'>";
			content+=APPSTRINGS.GENERAL.label_hit+": ";
			if(hitRate == -1){
				content+="---";	
			} else {
				content+=Math.floor(hitRate * 100)+"%";	
			}
			content+="</div>";				
		}
		
		
		var hpPercent = Math.floor(calculatedStats.currentHP / calculatedStats.maxHP * 100);
		content+="<div class='hp_bar'><div style='width: "+hpPercent+"%;' class='hp_bar_fill'></div></div>";
		
		var enPercent = Math.floor(calculatedStats.currentEN / calculatedStats.maxEN * 100);
		content+="<div class='en_bar'><div style='width: "+enPercent+"%;' class='en_bar_fill'></div></div>";
		content+="</div>"
		
		_this._bgFadeContainer.innerHTML = content;
		this.updateScaledDiv(_this._bgFadeContainer);
		this.updateScaledDiv(_this._bgFadeContainer.querySelector("#unit_summary_icon"));	
		var actorIcon = this._bgFadeContainer.querySelector("#unit_summary_icon");
		//_this._bgFadeContainer.classList.remove("enemy");
		//_this._bgFadeContainer.classList.remove("actor");
		if(actor.isActor()){
			//_this._bgFadeContainer.classList.add("actor");
			this.loadActorFace(actor.actorId(), actorIcon);
		} else {
			//_this._bgFadeContainer.classList.add("enemy");
			this.loadEnemyFace(actor.enemyId(), actorIcon);
		}	
		_this.assignFactionColorClass(_this._bgFadeContainer, actor);
	}
	
	Graphics._updateCanvas();
}

