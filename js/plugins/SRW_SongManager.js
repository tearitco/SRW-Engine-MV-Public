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
	if(songId && songId != -1){
		var bgm = {};
		bgm.name = songId;
		bgm.pan = 0;
		bgm.pitch = 100;
		bgm.volume = 90;
		AudioManager.playBgm(bgm);
	}
}

SRWSongManager.prototype.fadeInSong = function(songId){
	var _this = this;

	_this.playSong(songId);
	//AudioManager.fadeInBgm(1);	
}

SRWSongManager.prototype.getUnitSongInfo = function(actor){
	if(!actor){
		return {
			id: -1,
			priority: -1
		}
	}
	if(actor.isActor()){
		return {
			id: this._actorSongMapping[actor.actorId()],
			priority: this._actorSongPriority[actor.actorId()] || 1
		};
	} else {
		return {
			id: this._enemySongMapping[actor.enemyId()],
			priority: this._enemySongPriority[actor.enemyId()] || 1
		};
	}
}

SRWSongManager.prototype.playBattleSong = function(actor, enemy){
	var songId;
	if($gameSystem._specialTheme != -1){
		songId = $gameSystem._specialTheme;
	} else {
		var actorSongInfo = this.getUnitSongInfo(actor);		
		var enemySongInfo = this.getUnitSongInfo(enemy);		

		if(enemySongInfo.priority > actorSongInfo.priority){
			songId = enemySongInfo.id;
		} else {
			songId = actorSongInfo.id;
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
	this.fadeInSong(songId);	
}