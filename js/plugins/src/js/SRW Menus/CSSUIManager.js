export default function CSSUIManager(){
	
}

CSSUIManager.prototype.updateLayer = function(dimensions){
	if(this.customUILayer){
		this.customUILayer.style.width = dimensions.width+"px";
		this.customUILayer.style.height = dimensions.height+"px";
	}	
}

CSSUIManager.prototype.updateScaledText = function(dimensions){
	if(this.customUILayer){
		var referenceWidth = Graphics._getCurrentWidth();
		var textElements = window.document.querySelectorAll(".scaled_text");	
		textElements.forEach(function(textElement){
			var fontPercent = textElement.getAttribute("data-font-percent");
			if(!fontPercent){
				fontPercent = window.getComputedStyle(textElement, null).getPropertyValue('font-size');
				fontPercent = fontPercent.replace("px", "");
				textElement.setAttribute("data-font-percent", fontPercent);
			}
			
			textElement.style.fontSize = Math.floor(referenceWidth/100 * fontPercent) + "px";
		});
		var scaledWidthElements = window.document.querySelectorAll(".scaled_width");	
		scaledWidthElements.forEach(function(scaledElement){
			var scalePercent = scaledElement.getAttribute("data-original-width");
			if(!scalePercent){
				scalePercent = window.getComputedStyle(scaledElement, null).getPropertyValue('--widthscaling');
				if(!scalePercent){
					scalePercent = window.getComputedStyle(scaledElement, null).getPropertyValue('width');
				}				
				scalePercent = scalePercent.replace("px", "");
				scaledElement.setAttribute("data-original-width", scalePercent);
			}
			
			scaledElement.style.width = Math.floor(referenceWidth/100 * scalePercent) + "px";
		});
		
		var scaledHeightElements = window.document.querySelectorAll(".scaled_height");	
		scaledHeightElements.forEach(function(scaledElement){
			var scalePercent = scaledElement.getAttribute("data-original-height");
			if(!scalePercent){
				scalePercent = window.getComputedStyle(scaledElement, null).getPropertyValue('--heightscaling');
				if(!scalePercent){
					scalePercent = window.getComputedStyle(scaledElement, null).getPropertyValue('height');
				}
				scalePercent = scalePercent.replace("px", "");
				scaledElement.setAttribute("data-original-height", scalePercent);
			}
			
			scaledElement.style.height = Math.floor(referenceWidth/100 * scalePercent) + "px";
		});
		
		var fittedTextElements = window.document.querySelectorAll(".fitted_text");	
		fittedTextElements.forEach(function(textElement){
			var currentFontSize = textElement.style.fontSize.replace("px", "");
			
			while(currentFontSize > 0 && (textElement.scrollHeight > textElement.clientHeight || textElement.scrollWidth > textElement.clientWidth)){
				currentFontSize--;
				textElement.style.fontSize = currentFontSize + "px";
			}		
		});
	}
}

CSSUIManager.prototype.initAllWindows = function(){
	this.customUILayer = document.createElement("div");
	this.customUILayer.id = "custom_UI_layer";		
	document.body.appendChild(this.customUILayer);
	
	this.initWindow("intermission_menu");
	this.initWindow("mech_list");
	this.initWindow("upgrade_unit_selection");
	this.initWindow("upgrade_mech");
	this.initWindow("pilot_list");
	this.initWindow("pilot_upgrade_list");	
	this.initWindow("upgrade_pilot");	
	this.initWindow("equip_item_select");
	this.initWindow("equip_item");
	this.initWindow("battle_basic");
	this.initWindow("spirit_activation");
	this.initWindow("detail_pages");
	this.initWindow("attack_list");
	this.initWindow("rewards");
	this.initWindow("level_up");
	this.initWindow("spirit_selection");
	this.initWindow("before_battle");
	this.initWindow("unit_summary");
	this.initWindow("terrain_details");
	this.initWindow("deployment");
	this.initWindow("deployment_in_stage");
	this.initWindow("deploy_selection");
	this.initWindow("confirm_end_turn");
	this.initWindow("mech_list_deployed");
}

CSSUIManager.prototype.initWindow = function(id){
	var newWindow = document.createElement("div");
	newWindow.classList.add("UI_window");
	newWindow.id = id;
	this.customUILayer.appendChild(newWindow);
}