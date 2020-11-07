import Window_CSS from "./Window_CSS.js";
import "./style/Window_Rewards.css";

export default function Window_Rewards() {
	this.initialize.apply(this, arguments);	
}

Window_Rewards.prototype = Object.create(Window_CSS.prototype);
Window_Rewards.prototype.constructor = Window_Rewards;

Window_Rewards.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "rewards";	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});
		
	
}

Window_Rewards.prototype.getCurrentSelection = function(){
	return this._mechList.getCurrentSelection();	
}

Window_Rewards.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	var windowNode = this.getWindowNode();
	
	
	this._bgFadeContainer.innerHTML = "";	
}	




Window_Rewards.prototype.update = function() {
	var _this = this;
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){	
	
		
		if(Input.isTriggered('ok')){
			$gameTemp.popMenu = true;	
		}
		if(Input.isTriggered('cancel')){				
			//$gameTemp.popMenu = true;	
			$gameTemp.popMenu = true;	
		}		
		
		this.refresh();
	}		
};

Window_Rewards.prototype.redraw = function() {	
	var _this = this;
	var content = "";
	if($gameTemp.rewardsInfo){
		content+="<div class='rewards_content'>";
		content+="<div class='rewards_row funds_row'>";
		content+="<div class='funds_block scaled_text'>";
		content+="<div class='funds_gained'>";
		content+="<div class='funds_gained_label'>";
		content+=APPSTRINGS.REWARDS.label_funds_gained;
		content+="</div>";
		content+="<div class='funds_gained_value'>";
		content+=$gameTemp.rewardsInfo.fundGain
		content+="</div>";
		content+="</div>";		
		content+="<div class='current_funds'>";
		content+="<div class='current_funds_label'>";
		content+=APPSTRINGS.REWARDS.label_current_funds;
		content+="</div>";
		content+="<div class='current_funds_value'>";
		content+=$gameParty._gold;
		content+="</div>";	
		content+="</div>";	
		content+="</div>";	
		content+="</div>";	
		
		content+="<div class='rewards_row pilot_items_row'>";
		content+="<div class='pilot_block scaled_text'>";
		content+="<div class='row header'>";
		content+="<div class='column'>";
		content+=APPSTRINGS.REWARDS.label_pilot;
		content+="</div>";	
		content+="<div class='column'>";
		content+=APPSTRINGS.REWARDS.label_exp;
		content+="</div>";
		content+="<div class='column'>";
		content+="PP";
		content+="</div>";
		content+="</div>";	
		
		content+="<div class='row'>";
		
		content+="<div class='column'>";
		content+=$gameTemp.rewardsInfo.actor.name();
		content+="</div>";	
		content+="<div class='column'>";
		content+=$gameTemp.rewardsInfo.expGain;
		content+="</div>";
		content+="<div class='column'>";
		content+=$gameTemp.rewardsInfo.ppGain;
		content+="</div>";
		
		content+="</div>";	
		
		content+="</div>";	
		content+="<div class='items_block scaled_text'>";
		
		content+="<div class='row header'>";
		content+="<div class='column'>";
		content+=APPSTRINGS.REWARDS.label_items;
		content+="</div>";	
		content+="</div>";	
		
		if(typeof $gameTemp.rewardsInfo.itemDrops != "undefined"){
			$gameTemp.rewardsInfo.itemDrops.forEach(function(itemDrop){
				var itemInfo = $itemEffectManager.getAbilityDisplayInfo(itemDrop);
				content+="<div class='row'>";
				content+="<div class='column'>";
				content+=itemInfo.name;
				content+="</div>";	
				content+="</div>";
			});			
		}			
		
		content+="</div>";	
		content+="</div>";
		content+="</div>";
		_this._bgFadeContainer.innerHTML = content;
	}
	this.updateScaledDiv(_this._bgFadeContainer);
	this.updateScaledDiv(_this._bgFadeContainer.querySelector(".funds_gained_value"), false, true);
	this.updateScaledDiv(_this._bgFadeContainer.querySelector(".current_funds_value"), false, true);
	
	Graphics._updateCanvas();
}

