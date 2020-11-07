import Window_CSS from "./Window_CSS.js";
import MechList from "./MechList.js"
import DetailBarPilotStats from "./DetailBarPilotStats.js";
import DetailBarPilotSpirits from "./DetailBarPilotSpirits.js";

export default function Window_PilotList() {
	this.initialize.apply(this, arguments);	
}

Window_PilotList.prototype = Object.create(Window_CSS.prototype);
Window_PilotList.prototype.constructor = Window_PilotList;

Window_PilotList.prototype.initialize = function() {
	
	this._layoutId = "pilot_list";	
	this._pageSize = 1;
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
}

Window_PilotList.prototype.getCurrentSelection = function(){
	return this._mechList.getCurrentSelection();
	
}

Window_PilotList.prototype.createComponents = function() {
	Window_CSS.prototype.createComponents.call(this);
	
	var windowNode = this.getWindowNode();
	
	
	this._header = document.createElement("div");
	this._header.id = this.createId("header");
	this._header.classList.add("menu_header");	
	this._header.classList.add("scaled_text");
	this._headerText = document.createElement("div");
	this._headerText.innerHTML = APPSTRINGS.PILOTLIST.title;	
	this._header.appendChild(this._headerText);
	windowNode.appendChild(this._header);
	
	this._listContainer = document.createElement("div");
	this._listContainer.classList.add("list_container");
	windowNode.appendChild(this._listContainer);	
	
	this._detailContainer = document.createElement("div");
	this._detailContainer.classList.add("list_detail");
	windowNode.appendChild(this._detailContainer);	
	
	this._detailPilotContainer = document.createElement("div");
	this._detailPilotContainer.classList.add("list_detail");
	windowNode.appendChild(this._detailPilotContainer);	
	
	this._mechList = new MechList(this._listContainer, [5, 6, 7, 8]); //
	this._mechList.setUnitModeActor();
	this._mechList.createComponents();
	this._detailBarPilotStats = new DetailBarPilotStats(this._detailContainer, this);
	this._detailBarPilotStats.createComponents();
	this._detailBarPilotSpirits = new DetailBarPilotSpirits(this._detailPilotContainer, this);	
}	

Window_PilotList.prototype.update = function() {
	Window_Base.prototype.update.call(this);
	
	if(this.isOpen() && !this._handlingInput){
		if(Input.isTriggered('down') || Input.isRepeated('down')){
			SoundManager.playCursor();
			this.requestRedraw();
			this._mechList.incrementSelection();
		} else if (Input.isTriggered('up') || Input.isRepeated('up')) {
			SoundManager.playCursor();
			this.requestRedraw();
		    this._mechList.decrementSelection();
		}			

		if(Input.isTriggered('left') || Input.isRepeated('left')){
			this.requestRedraw();
			this._mechList.decrementPage();
		} else if (Input.isTriggered('right') || Input.isRepeated('right')) {
			this.requestRedraw();
		    this._mechList.incrementPage();
		}
		
		if(Input.isTriggered('left_trigger') || Input.isRepeated('left_trigger')){
			this.requestRedraw();
			this._mechList.decrementInfoPage();
		} else if (Input.isTriggered('right_trigger') || Input.isRepeated('right_trigger')) {
			this.requestRedraw();
			this._mechList.incrementInfoPage();
		}
		
		if(Input.isTriggered('pageup') || Input.isRepeated('pageup')){
			this.requestRedraw();
			this._mechList.decrementSortIdx();
		} else if (Input.isTriggered('pagedown') || Input.isRepeated('pagedown')) {
			this.requestRedraw();
			this._mechList.incrementSortIdx();
		}
		
		if(Input.isTriggered('L3')){
			this.requestRedraw();
			this._mechList.toggleSortOrder();			
		} 	
		
		if(Input.isTriggered('ok')){
			/*if(this._internalHandlers[this._currentKey]){
				this._handlingInput = true;
				this._internalHandlers[this._currentKey].call(this);
			}*/
			SoundManager.playOk();
			$gameTemp.currentMenuUnit = this.getCurrentSelection();
			$gameTemp.pushMenu = "detail_pages";	
		}
		if(Input.isTriggered('cancel')){	
			SoundManager.playCancel();
			$gameTemp.popMenu = true;	
		}		
		
		this.refresh();
	}		
};

Window_PilotList.prototype.redraw = function() {
	this._mechList.redraw();
	this._detailBarPilotStats.redraw();		
	this._detailBarPilotSpirits.redraw();
	
	var infoPage = this._mechList.getCurrentInfoPage();
	if(infoPage == 5 || infoPage == 8){
		this._detailBarPilotSpirits.hide();
		this._detailBarPilotStats.show();
	} else {
		this._detailBarPilotSpirits.show();
		this._detailBarPilotStats.hide();
	}

	Graphics._updateCanvas();
}