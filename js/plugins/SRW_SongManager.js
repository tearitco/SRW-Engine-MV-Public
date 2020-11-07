function SRWSongManager(){
	this._actorSongMapping = {
		10: "Rushia",
		11: "Pekora",
		12: "Fubuki",
		13: "Matsuri",
		14: "Aqua"
	}
	this._enemySongMapping = {
		16: "SRW_Boss1"
	}
	
	this._actorSongPriority = {
		
	}
	this._enemySongPriority = {
		16: 2
	}
}

SRWSongManager.prototype.setSpecialTheme = function(songId){
	$gameSystem._specialTheme = songId;
}

SRWSongManager.prototype.clearSpecialTheme = function(){
	$gameSystem._specialTheme = -1;
}

SRWSongManager.prototype.playBattleSong = function(actorId, enemyId){
	var songId;
	if($gameSystem._specialTheme != -1){
		songId = $gameSystem._specialTheme;
	} else {
		var actorPriority = this._actorSongPriority[actorId] || 1;
		var enemyPriority = this._enemySongPriority[enemyId] || 0;
		if(enemyPriority > actorPriority){
			songId = this._enemySongMapping[enemyId];
		} else {
			songId = this._actorSongMapping[actorId];
		}
	}
	if(songId){
		var bgm = {};
		bgm.name = songId;
		bgm.pan = 0;
		bgm.pitch = 100;
		bgm.volume = 70;
		AudioManager.playBgm(bgm);
	}	
}

SRWSongManager.prototype.playStageSong = function(){
	var songId;
	if($gameSystem._specialTheme != -1){
		songId = $gameSystem._specialTheme;
	} else {
		songId = $gameSystem.currentStageSong;
	}	
	if(songId){
		var bgm = {};
		bgm.name = songId;
		bgm.pan = 0;
		bgm.pitch = 100;
		bgm.volume = 70;
		AudioManager.playBgm(bgm);
	}	
}