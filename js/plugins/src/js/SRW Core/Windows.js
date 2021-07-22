	export default {
		patches: patches,
		Window_CounterCommand: Window_CounterCommand,
		Window_SRWItemBattle: Window_SRWItemBattle,
		Window_SRWAbilityCommand: Window_SRWAbilityCommand,
		Window_SRWTransformSelection: Window_SRWTransformSelection,
		Window_StageInfo: Window_StageInfo,
		Window_ConditionsInfo: Window_ConditionsInfo,
	} 
	
	function patches(){};
	
	patches.apply = function(){
		Window_SavefileList.prototype.drawItem = function(index) {
			var id = index + 1;
			var valid = DataManager.isThisGameFile(id);
			var info = DataManager.loadSavefileInfo(id);
			var rect = this.itemRectForText(index);
			this.resetTextColor();
			if (this._mode === 'load') {
				this.changePaintOpacity(valid);
			}
			this.drawFileId(id, rect.x, rect.y);
			if (info) {
				this.changePaintOpacity(valid);
				this.drawContents(info, rect, valid);
				this.changePaintOpacity(true);
			}
		};
		
		Window_SavefileList.prototype.drawContents = function(info, rect, valid) {
			var bottom = rect.y + rect.height;
			if (rect.width >= 420) {
				this.drawGameTitle(info, rect.x + 192, rect.y, rect.width - 192);
				if (valid) {
					this.drawPartyCharacters(info, rect.x + 220, bottom - 4);
				}
			}
			var lineHeight = this.lineHeight();
			var y2 = bottom - lineHeight;
			if (y2 >= lineHeight) {
				this.drawPlaytime(info, rect.x, y2, rect.width);
			}
			var offSetX = 20;
			var bottomOffset = 54;
			if(info.funds != null){
				this.drawText(APPSTRINGS.SAVEMENU.label_funds+": "+info.funds, offSetX + rect.x, bottom - bottomOffset, 240);
			}
			if(info.funds != null){
				this.drawText(APPSTRINGS.SAVEMENU.label_SR_count+": "+info.SRCount, offSetX + rect.x + 240, bottom - bottomOffset, 240);
			}
			if(info.funds != null){
				this.drawText(APPSTRINGS.SAVEMENU.label_turn_count+": "+info.turnCount, offSetX + rect.x + 480, bottom - bottomOffset, 240);
			}		
		};	
		
		Window_Message.prototype.isInstantText = function() {
			return Input.isPressed('ok') && Input.isPressed('pagedown');
		}
		
		Window_Message.prototype.updateMessage = function() {
			if (this._textState) {
				while (!this.isEndOfText(this._textState)) {
					if (this.needsNewPage(this._textState)) {
						this.newPage(this._textState);
					}
									
					this.updateShowFast();
					this.processCharacter(this._textState);
					if(!this.isInstantText()){			
						if (!this._showFast && !this._lineShowFast) {
							break;
						}
						if (this.pause || this._waitCount > 0) {
							break;
						}
					} 
				}
				if (this.isEndOfText(this._textState)) {
					this.onEndOfText();
				}
				return true;
			} else {
				return false;
			}
		};
		
		Window_Message.prototype.updateInput = function() {		
			if (this.isAnySubWindowActive()) {
				return true;
			}
			if (this.pause) {
				if (this.isTriggered() || this.isInstantText()) {
					Input.update();
					this.pause = false;
					if (!this._textState) {
						this.terminateMessage();
					}
				}
				return true;
			}
			return false;
		};
		
		Window_Message.prototype.startPause = function() {
			var waitCount;
			if(this.isInstantText()){
				waitCount = 2;
			} else {
				waitCount = 10;
			}
			this.startWait(waitCount);
			this.pause = true;
		};		

	//====================================================================
	// ●Window_ActorCommand
	//====================================================================
		Window_Command.prototype.isList = function() {
			if (this._list) {
				return true;
			} else {
				return false;
			}
		};

		var _SRPG_Window_ActorCommand_numVisibleRows = Window_ActorCommand.prototype.numVisibleRows;
		Window_ActorCommand.prototype.numVisibleRows = function() {
			if ($gameSystem.isSRPGMode() == true) {
				if (this.isList()) {
					return this.maxItems();
				} else {
					return 0;
				}
			} else {
				return _SRPG_Window_ActorCommand_numVisibleRows.call(this);
			}
		};

		var _SRPG_Window_ActorCommand_makeCommandList = Window_ActorCommand.prototype.makeCommandList;
		Window_ActorCommand.prototype.makeCommandList = function() {
			var _this = this;
			if ($gameSystem.isSRPGMode() == true) {
				if (this._actor) {
					//TODO: turn different menus into subclasses
					
					var battler = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
					var type = battler.isActor() ? "enemy" : "actor";
					var pos = {
						x: $gameTemp.activeEvent().posX(),
						y: $gameTemp.activeEvent().posY()
					};
					var fullRange = $statCalc.getFullWeaponRange(battler, $gameTemp.isPostMove);
					var hasTarget = $statCalc.getAllInRange($gameSystem.getPlayerFactionInfo(), pos, fullRange.range, fullRange.minRange).length > 0;
					var hasMapWeapon = $statCalc.hasMapWeapon(battler);
					
					function boardingMenu(){
						_this.addCommand(APPSTRINGS.MAPMENU.board, 'board');
					}
					
					function regularMenu(){
						if(_this._actor.battleMode() != "fixed"){
							_this.addMoveCommand();
						}
						if(hasTarget || hasMapWeapon){
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_attack, 'attack');
						}
						if($statCalc.isShip(_this._actor) && $statCalc.hasBoardedUnits(_this._actor)){
							_this.addCommand(APPSTRINGS.MAPMENU.deploy, 'deploy');
						}
						_this.addCommand(APPSTRINGS.MAPMENU.cmd_spirit, 'spirit');
						if($statCalc.applyStatModsToValue(_this._actor, 0, ["heal"])){
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_repair, 'heal');
						}
						if($statCalc.applyStatModsToValue(_this._actor, 0, ["resupply"])){
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_resupply, 'resupply');
						}
						if($statCalc.getConsumables(_this._actor).length){
							 _this.addCommand(APPSTRINGS.MAPMENU.cmd_item, 'item');
						}
						if($statCalc.getAbilityCommands(_this._actor).length){
							 _this.addCommand(APPSTRINGS.MAPMENU.cmd_ability, 'ability');
						}
						if($statCalc.canFly(_this._actor) && $statCalc.getCurrentTerrain(_this._actor) != "space"){
							if($statCalc.isFlying(_this._actor)){
								if(($statCalc.getTileType(_this._actor) == "land" && $statCalc.canBeOnLand(_this._actor)) || ($statCalc.getTileType(_this._actor) == "water" && $statCalc.canBeOnWater(_this._actor))){
									_this.addCommand(APPSTRINGS.MAPMENU.cmd_land, 'land');
								}
							} else {
								_this.addCommand(APPSTRINGS.MAPMENU.cmd_fly, 'fly');
							}
						}		
						if($gameSystem.getPersuadeOption(_this._actor)){
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_persuade, 'persuade');
						}	
						if($statCalc.canCombine(_this._actor).isValid){
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_combine, 'combine');
						}	
						if($statCalc.isCombined(_this._actor)){
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_split, 'split');
						}
						if(ENGINE_SETTINGS.ENABLE_TWIN_SYSTEM && !ENGINE_SETTINGS.DISABLE_ALLY_TWINS){
							if(!$statCalc.isShip(_this._actor) && $statCalc.canSwap(_this._actor)){
								_this.addCommand(APPSTRINGS.MAPMENU.cmd_swap, 'swap');
							}	
							if(!$statCalc.isShip(_this._actor) && $statCalc.isMainTwin(_this._actor)){
								_this.addCommand(APPSTRINGS.MAPMENU.cmd_separate, 'separate');
							}	
							if(!$statCalc.isShip(_this._actor) && $statCalc.canTwin(_this._actor)){
								_this.addCommand(APPSTRINGS.MAPMENU.cmd_join, 'join');
							}	
						}
						
						if($statCalc.canTransform(_this._actor)){
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_transform, 'transform');
						}							
					
						_this.addCommand(APPSTRINGS.MAPMENU.cmd_status, 'status');						
						
						_this.addWaitCommand();					
					}
					
					function hitAndAwayMenu(){
						_this.addMoveCommand();
						_this.addWaitCommand();
					}
					
					function disabledMenu(){
						_this.addWaitCommand();
					}
					
					function postMoveMenu(){
						if(hasTarget || hasMapWeapon){
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_attack, 'attack');
						}
						if($gameSystem.getPersuadeOption(_this._actor)){
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_persuade, 'persuade');
						}
						if($statCalc.applyStatModsToValue(_this._actor, 0, ["heal"])){
							_this.addCommand(APPSTRINGS.MAPMENU.cmd_repair, 'heal');
						}
						
						if(ENGINE_SETTINGS.ENABLE_TWIN_SYSTEM && !ENGINE_SETTINGS.DISABLE_ALLY_TWINS){
							if($statCalc.canTwin(_this._actor)){
								_this.addCommand(APPSTRINGS.MAPMENU.cmd_join, 'join');
							}	
						}
						_this.addWaitCommand();
					}
					
					function deployMenu(){
						_this.addMoveCommand();					
						_this.addCommand(APPSTRINGS.MAPMENU.cmd_spirit, 'spirit');
						if($statCalc.canFly(_this._actor) && $statCalc.getCurrentTerrain(_this._actor) != "space"){
							if($statCalc.isFlying(_this._actor)){
								_this.addCommand(APPSTRINGS.MAPMENU.cmd_land, 'land');
							} else {
								_this.addCommand(APPSTRINGS.MAPMENU.cmd_fly, 'fly');
							}
						}
						if($statCalc.getConsumables(_this._actor).length){
							 _this.addCommand(APPSTRINGS.MAPMENU.cmd_item, 'item');
						}
					}
					
					if($gameSystem.isSubBattlePhase() == 'confirm_boarding'){
						boardingMenu();
					} else if($gameTemp.isHitAndAway){
						hitAndAwayMenu();
					} else if($gameTemp.isPostMove){
						postMoveMenu();
					} else if($gameTemp.activeShip){
						deployMenu();
					} else if(this._actor.battleMode() == "disabled"){
						disabledMenu();
					} else {	
						regularMenu();
					}				
				}
			} else {
				_SRPG_Window_ActorCommand_makeCommandList.call(this);
			}
		};

		Window_ActorCommand.prototype.addEquipCommand = function() {
			this.addCommand(_textSrpgEquip, 'equip', this._actor.canSrpgEquip());
		};

		Window_ActorCommand.prototype.addWaitCommand = function() {
			this.addCommand(APPSTRINGS.MAPMENU.cmd_wait, 'wait');
		};
		
		Window_ActorCommand.prototype.addMoveCommand = function() {
			this.addCommand(APPSTRINGS.MAPMENU.cmd_move, 'move');
		};

		var _SRPG_Window_ActorCommand_setup = Window_ActorCommand.prototype.setup;
		Window_ActorCommand.prototype.setup = function(actor) {
			if ($gameSystem.isSRPGMode() == true) {
				this._actor = actor;
				this.clearCommandList();
				this.makeCommandList();
				this.updatePlacement();
				this.refresh();
				this.selectLast();
				this.activate();
				this.open();
			} else {
				_SRPG_Window_ActorCommand_setup.call(this, actor);
			}
		};

		Window_ActorCommand.prototype.updatePlacement = function() {
			this.width = this.windowWidth();
			this.height = this.windowHeight();
			this.x = Math.max($gameTemp.activeEvent().screenX() - $gameMap.tileWidth() / 2 - this.windowWidth(), 0);
			if ($gameTemp.activeEvent().screenY() < Graphics.boxHeight - 160) {
				var eventY = $gameTemp.activeEvent().screenY();
			} else {
				var eventY = Graphics.boxHeight - 160;
			}
			this.y = Math.max(eventY - this.windowHeight(), 0);
		};
		
		//====================================================================
		// ●Window_MenuCommand
		//====================================================================
			var _SRPG_Window_MenuCommand_makeCommandList = Window_MenuCommand.prototype.makeCommandList;
			Window_MenuCommand.prototype.makeCommandList = function() {       
				  
			   // _SRPG_Window_MenuCommand_makeCommandList.call(this);
			   
			   if($gameSystem.isSRPGMode()){
				   this.addTurnEndCommand();     
				   this.addCommand(APPSTRINGS.MAPMENU.cmd_search, 'search', true);
				   this.addCommand(APPSTRINGS.MAPMENU.cmd_list, 'unitList', true);
				   this.addCommand(APPSTRINGS.MAPMENU.cmd_conditions, 'conditions', true);
			   }
			   
			   this.addCommand(APPSTRINGS.MAPMENU.cmd_options, 'options');
			   this.addCommand(APPSTRINGS.MAPMENU.cmd_save, 'save');
			   this.addCommand(APPSTRINGS.MAPMENU.cmd_game_end, 'gameEnd');
			};

			Window_MenuCommand.prototype.addTurnEndCommand = function() {
				this.addCommand(APPSTRINGS.MAPMENU.cmd_end_turn, 'turnEnd', true);
			};

			var _SRPG_Window_MenuCommand_isFormationEnabled = Window_MenuCommand.prototype.isFormationEnabled;
			Window_MenuCommand.prototype.isFormationEnabled = function() {
				/*if ($gameSystem.isSRPGMode() == true) {
					return false;
				} else {
					return _SRPG_Window_MenuCommand_isFormationEnabled.call(this);
				}*/
				return false
			};
	}
	
	//A window that lists the counter/evade/defend options for the player when counter attacking
	function Window_CounterCommand(){
		this.initialize.apply(this, arguments);
	}

	Window_CounterCommand.prototype = Object.create(Window_Command.prototype);
	Window_CounterCommand.prototype.constructor = Window_CounterCommand;

	Window_CounterCommand.prototype.initialize = function() {
		Window_Command.prototype.initialize.call(this, 0, 0);
		this._actor = null;
		this._item = null;
		this.openness = 0;
		this.setup();
		this.hide();
		this.deactivate();
	};

	Window_CounterCommand.prototype.makeCommandList = function() {  
		this.addCommand("Counter", 'counter');	
		this.addCommand("Defend", 'defend');
		this.addCommand("Evade", 'evade');
	};

	Window_CounterCommand.prototype.setup = function(actorArray) {
		this.clearCommandList();
		this.makeCommandList();
		this.refresh();
		this.activate();
		this.open();
	};

	Window_CounterCommand.prototype.maxCols = function() {
		return 1;
	};

	Window_CounterCommand.prototype.windowHeight = function() {
		return this.fittingHeight(3);
	};
	
	
	Window_Base.prototype.drawSectionRect = function(x, y, w, h, margin, color) {
		var lineWidth = 1;
		x+=margin;
		y+=margin;
		w-=2*margin;
		h-=2*margin;
		//top
		this.contents.fillRect(x ,y, w, lineWidth, color);
		//bottom
		this.contents.fillRect(x, y + h, w + lineWidth, lineWidth, color);
		//left
		this.contents.fillRect(x ,y, lineWidth, h, color);
		//right
		this.contents.fillRect(x + w, y, lineWidth, h, color);
	}
	
	Window_Base.prototype.drawRect = function(x, y, w, h, margin, color) {
		x+=margin;
		y+=margin;
		w-=2*margin;
		h-=2*margin;
		this.contents.fillRect(x ,y, w, h, color);
	}
	
	Window_Base.prototype.windowInnerWidth = function() {
        return this.windowWidth() - 38;
    };
	
	Window_Base.prototype.setFontSize = function(size) {
        this.contents.fontSize = size;
    };
	
	Window_Base.prototype.setItalic = function(state) {
        this.contents.fontItalic = state;
    };
	
	Window_Base.prototype.centerTextOffset = function(text, containerWidth) {
        return containerWidth / 2 - this.textWidth(text) / 2;
    };
	
	
	
	function Window_SRWItemBattle() {
		this._parent = Window_BattleItem.prototype;
		this.initialize.apply(this, arguments);	
    }

    Window_SRWItemBattle.prototype = Object.create(Window_BattleItem.prototype);
    Window_SRWItemBattle.prototype.constructor = Window_SRWItemBattle;
	
	Window_SRWItemBattle.prototype.maxCols = function(){
		return 1;
	}
	
	Window_SRWItemBattle.prototype.windowWidth = function() {
        return 240;
    };

    Window_SRWItemBattle.prototype.windowHeight = function() {
        return this.fittingHeight(4);
    };
	
	Window_SRWItemBattle.prototype.refresh = function(){
		this._parent.refresh.call(this);
	}
	
	Window_SRWItemBattle.prototype.drawItem = function(index) {
		var item = this._data[index];
		if (item) {
			item = $itemEffectManager.getAbilityDisplayInfo(item.itemIdx);
			var numberWidth = 0;//this.numberWidth();
			var rect = this.itemRect(index);
			//rect.width -= this.textPadding();
			this.drawItemName(item, rect.x, rect.y, rect.width - numberWidth);
		}
	};
	
	Window_SRWItemBattle.prototype.drawItemName = function(item, x, y, width) {
		width = width || 312;
		if (item) {
			this.resetTextColor();
			this.drawText(item.name, x + 10, y, width - 20);
		}
	};
	
	Window_SRWItemBattle.prototype.makeItemList = function() {
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		this._data = $statCalc.getConsumables(actor);
	};
	
	Window_SRWItemBattle.prototype.isEnabled = function(item) {
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		var itemDef = $itemEffectManager.getAbilityDef(item.itemIdx);
		return itemDef.isActiveHandler(actor);
	};	
	
	function Window_SRWAbilityCommand() {
		this._parent = Window_BattleItem.prototype;
		this.initialize.apply(this, arguments);	
    }

    Window_SRWAbilityCommand.prototype = Object.create(Window_BattleItem.prototype);
    Window_SRWAbilityCommand.prototype.constructor = Window_SRWAbilityCommand;
	
	Window_SRWAbilityCommand.prototype.maxCols = function(){
		return 1;
	}
	
	Window_SRWAbilityCommand.prototype.windowWidth = function() {
        return 240;
    };

    Window_SRWAbilityCommand.prototype.windowHeight = function() {
        return this.fittingHeight(4);
    };
	
	Window_SRWAbilityCommand.prototype.refresh = function(){
		this._parent.refresh.call(this);
	}
	
	Window_SRWAbilityCommand.prototype.drawItem = function(index) {
		var item = this._data[index];
		if (item != null) {
			item = $abilityCommandManger.getAbilityDisplayInfo(item);
			var numberWidth = 0;//this.numberWidth();
			var rect = this.itemRect(index);
			//rect.width -= this.textPadding();
			this.drawItemName(item, rect.x, rect.y, rect.width - numberWidth);
		}
	};
	
	Window_SRWAbilityCommand.prototype.drawItemName = function(item, x, y, width) {
		width = width || 312;
		if (item) {
			this.resetTextColor();
			this.drawText(item.name, x + 10, y, width - 20);
		}
	};
	
	Window_SRWAbilityCommand.prototype.makeItemList = function() {
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		this._data = $statCalc.getAbilityCommands(actor);
	};
	
	Window_SRWAbilityCommand.prototype.isEnabled = function(item) {
		return true;
	};	
	
	function Window_SRWTransformSelection() {
		this._parent = Window_BattleItem.prototype;
		this.initialize.apply(this, arguments);	
    }

    Window_SRWTransformSelection.prototype = Object.create(Window_BattleItem.prototype);
    Window_SRWTransformSelection.prototype.constructor = Window_SRWTransformSelection;
	
	Window_SRWTransformSelection.prototype.maxCols = function(){
		return 1;
	}
	
	Window_SRWTransformSelection.prototype.windowWidth = function() {
        return 240;
    };

    Window_SRWTransformSelection.prototype.windowHeight = function() {
        return this.fittingHeight(4);
    };
	
	Window_SRWTransformSelection.prototype.refresh = function(){
		this._parent.refresh.call(this);
	}
	
	Window_SRWTransformSelection.prototype.drawItem = function(index) {
		var item = this._data[index];
		if (item != null) {
			item = $dataClasses[item];
			var numberWidth = 0;//this.numberWidth();
			var rect = this.itemRect(index);
			//rect.width -= this.textPadding();
			this.drawItemName(item, rect.x, rect.y, rect.width - numberWidth);
		}
	};
	
	Window_SRWTransformSelection.prototype.drawItemName = function(item, x, y, width) {
		width = width || 312;
		if (item) {
			this.resetTextColor();
			this.drawText(item.name, x + 10, y, width - 20);
		}
	};
	
	Window_SRWTransformSelection.prototype.makeItemList = function() {
		var actor = $gameSystem.EventToUnit($gameTemp.activeEvent().eventId())[1];
		this._data = $statCalc.getTransformationList(actor);
	};
	
	Window_SRWTransformSelection.prototype.isEnabled = function(item) {
		return true;
	};	
	
	
	
	function Window_StageInfo() {
		this.initialize.apply(this, arguments);
	}

	Window_StageInfo.prototype = Object.create(Window_Base.prototype);
	Window_StageInfo.prototype.constructor = Window_StageInfo;

	Window_StageInfo.prototype.initialize = function(x, y) {
		var width = this.windowWidth();
		var height = this.windowHeight();
		Window_Base.prototype.initialize.call(this, x, y, width, height);
		this.refresh();
	};

	Window_StageInfo.prototype.windowWidth = function() {
		return 240;
	};

	Window_StageInfo.prototype.windowHeight = function() {
		if($gameSystem.isSRPGMode()){
			return this.fittingHeight(4);
		} else {
			return this.fittingHeight(1);
		}		
	};

	Window_StageInfo.prototype.refresh = function() {
		var lineheight = 35;
		var columnOffset = 95;
		var x = 5;
		var y = 0;
		var width = this.contents.width - this.textPadding() * 2;
		this.contents.clear();
		this.changeTextColor("#FFFFFF");
		//this.drawCurrencyValue(this.value(), this.currencyUnit(), x, 0, width);
		this.drawText(APPSTRINGS.MAPMENU.label_funds, x, 0, width);
		this.drawText(this.value(), x + columnOffset , 0, width);
		
		this.drawText(APPSTRINGS.MAPMENU.label_turn, x,  lineheight, width);
		/*--text-color-highlight: #f9e343;	
	 	--text-color-highlight2: #43dbf9;	*/
		this.changeTextColor("#43dbf9");
		this.drawText($gameVariables.value(_turnVarID), x + columnOffset, lineheight, width);
		this.changeTextColor("#FFFFFF");
		this.drawText(APPSTRINGS.MAPMENU.label_enemy, x,  lineheight * 2, width);
		this.changeTextColor("#AA2222");
		this.drawText($gameVariables.value(_enemiesDestroyed), x + columnOffset,  lineheight * 2, width);
		this.changeTextColor("#FFFFFF");
		this.drawText("/", x + columnOffset + 30,  lineheight * 2, width);
		this.changeTextColor("#43dbf9");
		this.drawText($gameVariables.value(_enemiesDestroyed) + $gameVariables.value(_existEnemyVarID), x + columnOffset + 45,  lineheight * 2, width);
		this.changeTextColor("#FFFFFF");
		
		this.drawText(APPSTRINGS.MAPMENU.label_ally, x,  lineheight * 3, width);
		this.changeTextColor("#AA2222");
		this.drawText($gameVariables.value(_actorsDestroyed), x + columnOffset,  lineheight * 3, width);
		this.changeTextColor("#FFFFFF");
		this.drawText("/", x + columnOffset + 30,  lineheight * 3, width);
		this.changeTextColor("#43dbf9");
		this.drawText($gameVariables.value(_actorsDestroyed) + $gameVariables.value(_existActorVarID), x + columnOffset + 45,  lineheight * 3, width);
		this.changeTextColor("#FFFFFF");
		
	};

	Window_StageInfo.prototype.value = function() {
		return $gameParty.gold();
	};

	Window_StageInfo.prototype.currencyUnit = function() {
		return TextManager.currencyUnit;
	};

	Window_StageInfo.prototype.open = function() {
		this.refresh();
		Window_Base.prototype.open.call(this);
	};
	
	
	function Window_ConditionsInfo() {
		this.initialize.apply(this, arguments);
	}

	Window_ConditionsInfo.prototype = Object.create(Window_Base.prototype);
	Window_ConditionsInfo.prototype.constructor = Window_ConditionsInfo;

	Window_ConditionsInfo.prototype.initialize = function(x, y) {
		var width = this.windowWidth();
		var height = this.windowHeight();
		Window_Base.prototype.initialize.call(this, x, y, width, height);
		this.refresh();
	};

	Window_ConditionsInfo.prototype.windowWidth = function() {
		return 760;
	};

	Window_ConditionsInfo.prototype.windowHeight = function() {
		return this.fittingHeight(6);
	};

	Window_ConditionsInfo.prototype.refresh = function() {
		var lineheight = 35;
		var columnOffset = 95;
		var x = 5;
		var y = 0;
		var width = this.contents.width - this.textPadding() * 2;
		this.contents.clear();
		this.changeTextColor("#FFFFFF");
		
		
		this.changeTextColor("#43dbf9");
		this.drawText(APPSTRINGS.GENERAL.label_victory_condition, x, 0, width);
		
		this.drawText(APPSTRINGS.GENERAL.label_defeat_condition, x, lineheight * 2, width);
		
		this.drawText(APPSTRINGS.GENERAL.label_mastery_condition, x, lineheight * 4, width);
		
		this.changeTextColor("#FFFFFF");
		
		var valueOffset = 20;
		this.drawText($gameVariables.value(_victoryConditionText) || "", x + valueOffset, lineheight, width - valueOffset);
		
		this.drawText($gameVariables.value(_defeatConditionText) || "", x + valueOffset, lineheight * 3, width - valueOffset);
		
		var masteryText = $gameVariables.value(_masteryConditionText);
		if($SRWSaveManager.isMapSRPointLocked($gameMap.mapId())){
			masteryText = APPSTRINGS.GENERAL.label_mastery_locked;
		}
		this.drawText(masteryText || "", x + valueOffset, lineheight * 5, width - valueOffset);
		
	};

	Window_ConditionsInfo.prototype.value = function() {
		return $gameParty.gold();
	};

	Window_ConditionsInfo.prototype.currencyUnit = function() {
		return TextManager.currencyUnit;
	};

	Window_ConditionsInfo.prototype.open = function() {
		this.refresh();
		Window_Base.prototype.open.call(this);
	};
	
	