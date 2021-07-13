function importGlobal(exports){
	Object.keys(exports).forEach(function(className){
		window[className] = exports[className];
	});
}

import Windows from './Windows.js';

importGlobal(Windows);
Windows.patches.apply();

import PluginCommands from './PluginCommands.js';
PluginCommands.patches.apply();

import GameTemp from './GameTemp.js';
GameTemp.patches.apply();

import GameSystem from './GameSystem.js';
GameSystem.patches.apply();

import DataManagement from './DataManagement.js';
DataManagement.patches.apply();

import GameInterpreter from './GameInterpreter.js';
GameInterpreter.patches.apply();