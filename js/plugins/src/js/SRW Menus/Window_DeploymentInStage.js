import Window_CSS from "./Window_CSS.js";
import Window_Deployment from "./Window_Deployment.js";


import "./style/Window_Deployment.css"

export default function Window_DeploymentInStage() {
	this.initialize.apply(this, arguments);	
}

Window_DeploymentInStage.prototype = Object.create(Window_Deployment.prototype);
Window_DeploymentInStage.prototype.constructor = Window_DeploymentInStage;

Window_DeploymentInStage.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "deployment_in_stage";
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);		
	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
	this._UIState = "select_deploy_slot";
	this._rearrageRowSize = 14;
	
	this._availableRowSize = 10
	
	this._deployedRowOffset = 0;
	this._deployedSelection = 0;
	
	this._maxAvailableSlots = 6 * this._availableRowSize;
	this._availableRowOffset = 0;
	this._rearrageSelection = 0;
	
	this._swapSource = -1;
}
var Window_Deployment_createComponents = Window_Deployment.prototype.createComponents;
Window_DeploymentInStage.prototype.createComponents = function() {
	Window_Deployment_createComponents.call(this);
	var windowNode = this.getWindowNode();
	this._toolTip = document.createElement("div");
	this._toolTip.classList.add("scaled_text");
	this._toolTip.classList.add("tool_tip");
	this._toolTip.innerHTML = APPSTRINGS.DEPLOYMENT.label_in_stage;	
	windowNode.appendChild(this._toolTip);	
}

Window_DeploymentInStage.prototype.onCancel = function() {

}

Window_DeploymentInStage.prototype.onMenu = function(){
	Input.clear();
	$gameSystem.setSubBattlePhase("rearrange_deploys_init");
	//$gameTemp.doingManualDeploy = false;
	$gameSystem.highlightDeployTiles();
	$gameSystem.redeployActors(false);
	//$gameTemp.popMenu = true;
}
