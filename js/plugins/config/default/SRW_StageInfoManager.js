function SRWStageInfoManager(){
	this._stageInfo = {
		1: {
			name: "Escape",
			displayId: 1
		},
		2: {
			name: "Reunion",
			displayId: 2
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