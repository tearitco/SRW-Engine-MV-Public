function BattleEnvironmentBuilder(){	
	var _this = this;
	this._dataFileName = "BattleEnvironments.json";
	_this._isLoaded = new Promise(function(resolve, reject){
		_this._resolveLoad = resolve;
	});
	this.loadDefinitions(
		"active", 
		function(data){
			_this.processDefinitions(data)
		}, function(){
			_this.loadDefinitions(
				"default",
				function(data){
					_this.processDefinitions(data)
				}
			)	
		}
	);
}

BattleEnvironmentBuilder.prototype.loadDefinitions = function(type, onload, onerror){
	var xhr = new XMLHttpRequest();
    var url = 'js/plugins/config/'+type+this._dataFileName;
    xhr.open('GET', url);
    xhr.overrideMimeType('application/json');
    xhr.onload = function() {
        if (xhr.status < 400) {
            onload(JSON.parse(xhr.responseText));            
        }
    };
    xhr.onerror = onerror;
    window[name] = null;
    xhr.send();
}

BattleEnvironmentBuilder.prototype.isLoaded = function(){
	return this._isLoaded;
}

BattleEnvironmentBuilder.prototype.processDefinitions = function(data){
	var _this = this;	
	_this._data = data;
	_this._resolveLoad();
}
