import Window_CSS from "./Window_CSS.js";
import Window_DeploymentTwin from "./Window_DeploymentTwin.js";


import "./style/Window_Deployment.css"

export default function Window_DeploymentInStage() {
	this.initialize.apply(this, arguments);	
}

Window_DeploymentInStage.prototype = Object.create(Window_DeploymentTwin.prototype);
Window_DeploymentInStage.prototype.constructor = Window_DeploymentInStage;

Window_DeploymentInStage.prototype.initialize = function() {
	var _this = this;
	this._layoutId = "deployment_in_stage";	
	
	Window_CSS.prototype.initialize.call(this, 0, 0, 0, 0);	
	
	window.addEventListener("resize", function(){
		_this.requestRedraw();
	});	
	this._UIState = "select_deploy_slot";
	this._rearrageRowSize = 5;
	
	this._availableRowSize = 4;
	
	this._deployedRowOffset = 0;
	this._deployedSelection = 0;
	
	this._maxAvailableSlots = 6 * this._availableRowSize;
	this._availableRowOffset = 0;
	this._rearrageSelection = 0;
	
	this._swapSource = -1;
	this._twinSwapSource = -1;
	this._maxSlots = 40;
	if(!this.isTwinMode()){
		this._rearrageRowSize = 9;
		this._maxSlots = 36;
	}
}
var Window_Deployment_createComponents = Window_DeploymentTwin.prototype.createComponents;
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
	var deployInfo = $gameSystem.getDeployInfo();
	var deployList = $gameSystem.getDeployList();
	//$gameTemp.originalDeployInfo = JSON.parse(JSON.stringify($gameSystem.getDeployList()))
	var hasDeployments = false;
	var activeDeployList = [];
	for(var i = 0; i < deployInfo.count; i++){
		activeDeployList.push(deployList[i]);
		if(deployList[i] && deployList[i].main != null){
			hasDeployments = true;
		}
	}
	if(hasDeployments){
		$gameSystem.setActiveDeployList(activeDeployList);
		$gameSystem.setSubBattlePhase("rearrange_deploys_init");
		$gameSystem.highlightDeployTiles();
		$gameSystem.redeployActors(false);
	}	
}
