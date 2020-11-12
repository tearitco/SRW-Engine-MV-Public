function SRWStageInfoManager(){
	this._stageInfo = {
		0: {
			name: "From the void they came",
			displayId: 0
		}
	}
}

SRWStageInfoManager.prototype.getStageInfo = function(id){
	if(id == -1){
		return {
			name: "",
			displayId: "---"
		}
	}
	return this._stageInfo[id] || {};
}