function SRWSongManager(){
	this._actorSongMapping = $SRWConfig.battleSongs.actorSongMapping;
	this._enemySongMapping = $SRWConfig.battleSongs.enemySongMapping;
	
	this._actorSongPriority = $SRWConfig.battleSongs.actorSongPriority;
	this._enemySongPriority = $SRWConfig.battleSongs.enemySongPriority;
}

SRWSongManager.prototype.setSpecialTheme = function(songId){
	$gameSystem._specialTheme = songId;
}

SRWSongManager.prototype.clearSpecialTheme = function(){
	$gameSystem._specialTheme = -1;
}

SRWSongManager.prototype.playSong = function(songId){
	if(songId){
		var bgm = {};
		bgm.name = songId;
		bgm.pan = 0;
		bgm.pitch = 100;
		bgm.volume = 90;
		AudioManager.playBgm(bgm);
	}
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
	this.playSong(songId);	
}

SRWSongManager.prototype.playStageSong = function(){
	var songId;
	if($gameSystem._specialTheme != -1){
		songId = $gameSystem._specialTheme;
	} else {
		songId = $gameSystem.currentStageSong;
	}	
	this.playSong(songId);	
}