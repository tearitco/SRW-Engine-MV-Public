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