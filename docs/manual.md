# SRW Engine MV User Manual V1.0

## Stage control events

This engine introduces a couple of specific event types that will run when the engine is in a specific state.<br/>
Ex.: Start of a stage, after a unit made an action, etc.<br/>
They can be found at the top left of the demo stages.

![](img/main_events.png)

These events have a metadata tag indicating their type.<br/>
Ex.: \<type:battleStart\><br/>

It is recommended to create all new stages by creating a copy of a demo stage so that all the basics for these events are in place.

### battleStart

The battleStart event runs when the stage first starts. This event is used to set up the stage as well as to show any story events that should occur before the stage starts.<br/>
It will normally have the following responsibilities:

* Set the normal and sky battle background and parallax for the battle scene by using the setSRWBattleBg, setSRWBattleParallax1, setSRWSkyBattleBg and setSRWSkyBattleParallax1 plugin commands

* Set the stage theme song using the setStageSong plugin command

* Set the enemy upgrade level using the setEnemyUpgradeLevel plugin command

* Set the stage victory, loss and mastery conditions

* Spawn initial enemies using the this.addEnemy script command

* Play the stage BGM using the Play BGM command

* Fade in the screen from black using the FadeIn Screen command

* Showing the stage name using either a text command or by displaying an image

* Showing the stage conditions by using the this.showStageConditions script command

### actorTurn

The actorTurn event runs at the start of each actor turn. It can be used to have certain events occur at the start of a specific turn by using the Turns Passed(Stage) control variable.<br/>
This command is also responsible for showing the next turn text using a formatted Text command.

### enemyTurn

The enemyTurn event runs at the start of each enemy turn. It can be used to have certain events occur at the start of a specific turn by using the Turns Passed(Stage) control variable.<br/>
This command is also responsible for showing the next turn text using a formatted Text command.

### turnEnd

The turnEnd event runs at the end of a full turn (actor phase + enemy phase).

### beforeBattle

The beforeBattle event runs before each battle. The Actor Event ID, Enemy Event ID, Actor ID and Enemy ID control variables can be used to check which units are going to involved in the upcoming battle. This event can be used for before battle interactions between characters.

### beforeDestruction

The beforeDesctruction event will run after battle occurred but before any rewards are given and before any destroyed units play their destruction animations. The pending destruction of a unit can be canceled in this event. This event can be used to have bosses run away instead of being destroyed or to trigger defeat conditions if an ally unit will be destroyed.

### afterAction

The afterAction event runs every time a unit completes its turn. This is the event where checks for stage completion/loss requirements will usually will be done. It will then also contain scripting for the after stage story section, setting up deploys for the next stage and sending the player to the Intermission map. 

## Control Variables

The first two pages of Control Variables are reserved for specific functions in the engine:

* 0001 - Remaining Actors: The number of remaining actors on the stage. This variable is updated by the engine when allies are added or removed.
* 0002 - Remaining Enemies: The number of remaining enemies on the stage. This variable is updated by the engine when enemies are added or removed.
* 0003 - Turns Passed(Stage): The number of turns(one actor phase + one enemy phase) that has passed on the current stage.
* 0004 - Actor Event ID: The event ID of the current active actor
* 0005 - Enemy Event ID: The event ID of the current active enemy
* 0006 - Next Map: The id of the next map that will be loaded after the next intermission
* 0007 - Next Map X: The starting x coordinate for the cursor on the next map
* 0008 - Next Map Y: The starting y coordinate for the cursor on the next map
* 0009 - Next Deploy Info: Information for the deployment on the next map. Should be treated as read only!
* 0010 - SR Count: The total SR points earned by the player. This needs to be updated manually by the stage script when the player completes a mastery condition
* 0011 - Last stage ID: The ID of the previous stage.
* 0012 - Turn Count(Global): The total number of turns the player has taken across all stages
* 0013 - Actor ID: The actor ID of the current active actor
* 0014 - Enemy ID: The enemy ID of the current active enemy
* 0015 - Actors Destroyed: The number of allies that were destroyed on the current stage
* 0016 - Enemies Destroyed: The number of  
* 0017 - Mastery Condition Text
* 0018 - Victory Condition Text
* 0019 - Defeat Condition Text
* 0020 - Ship Count: The current number of active ships on the stage

Variables 0021-0040 are stageTemp variables that can be used to keep track of things over the course of a single stage.<br/>
<b>The engine will automatically clear these when a new stage starts!</b>

## Plugin commands

* SRPGBattle start|end

	This command starts or ends the SRPG mode of the engine.<br/>
	Generally only called by the init or intermission map to start a new stage.
	
* Intermission start|end

* UnlockUnit class_id

* SetLevel actor_id level

* addKills actor_id amount

* addPP actor_id amount
		
* setStageSong song_id

	Sets the default song for the current stage.<br/>
	When switching between actor and enemy phases this song will start playing.

* setSpecialTheme song_id
	
	If set this song will override actor or enemy songs.
	
* clearSpecialTheme

* addItem item_id

	Adds one of the specified item to the inventory.
	
* addAllItems

	Adds one of each existing item to the inventory.
			
* removeItem

	Removes one of the specified item from the inventory.	

* addItemToHolder item_id mech_id slot

	Assigns an item to be held to a mech in a specific slot.<br/>
	Will unequip any item previously held for that mech and slot.<br/>
	Will fail if no free items of the type are available in the inventory!

* removeItemFromHolder mech_id slot 	
	
* focusActor actor_id

	If an actor with the specified id exists on the map the cursor will be set to its position.<br/>	
	If the matching actor does not exist or the actor was erased, nothing happens. 
	
* focusEvent event_id

	If an event with the specified id exists on the map the cursor will be set to its position.<br/>
	If the matching actor does not exist or the actor was erased, nothing happens.<br/>
	This command should be used to focus enemies, as those enemy ids will usually not be unique on the map!
	
* clearDeployInfo

	Clears all previous deploy info, should be used before setting up all the deploys for a map.

* setDeployCount amount

	Set the total number of particpants for the next deployment, ships not included.
	
* assignSlot slot actor_id
	
	Assign an actor to a slot for the next deployment.

* assignShipSlot slot actor_id
	
	Assign an actor to a ship slot for the next deployment.	<br/>
	This actor should logically be a ship captain, but this is not strictly enforced.
	
* lockDeploySlot slot

	Prevent the player from changing a deploy slot in the intermission menu.<br/>
	Units required for events after the next deploy should be assigned to a slot and then have that slot be locked.	
	
* unlockDeploySlot slot

* setSRWBattleBg name	
	
	Set the battle background for grounded units.<br/>
	The name is the name of the image found in img\SRWBattlebacks\

* setSRWBattleParallax1 name	
	
	Set the first parallax background for grounded units.<br/>
	The name is the name of the image found in img\SRWBattlebacks\	
		
* setSRWSkyBattleBg name		

	Set the battle background for flying units.<br/>
	The name is the name of the image found in img\SRWBattlebacks\

* setSRWSkyBattleParallax1 name
		
	Set the first parallax background for flying units.<br/>
	The name is the name of the image found in img\SRWBattlebacks\				
	
* addMapHighlight x y color

	Highlight the tile on the map with the specified coordinates and color.<br/>
	Color can be a string name, ex.: "white"	
	
* removeMapHighlight x y 

* addMapRegionHighlight region_id color

	Highlight all tiles on the map that are within the specified region.<br/>
	Color can be a string name, ex.: "white"	
	
* removeMapRegionHighlight

* setEnemyUpgradeLevel level
	Sets the upgrade level for all enemies that will appear on the current stage.

## Script commands

These added commands can be used in Script commands while making event scripts.<br/>
They can also be used as conditionals in IF statements.

* this.setMasteryText(text)

	The text for "Win condition", "Defeat condition" and "Mastery condition" will be automatically printed and should not be included.
	
* this.setVictoryText(text) 

	The text for "Win condition", "Defeat condition" and "Mastery condition" will be automatically printed and should not be included.

* this.setDefeatText(text)  

	The text for "Win condition", "Defeat condition" and "Mastery condition" will be automatically printed and should not be included.
	
* this.showStageConditions()

	Shows a text box using the values set with the previous commands.
	
* this.isActorDestructionQueued(actor_id)

	To be used as a conditional in the before_destruction event.<br/>
	Will be TRUE if the actor with the specified id was defeated and is about to be destroyed.
	
* this.isEnemyDestructionQueued(enemy_id)

	To be used as a conditional in the before_destruction event.<br/>
	Will be TRUE if the enemy with the specified id was defeated and is about to be destroyed.
	
* this.isEventDestructionQueued(event_id)

	To be used as a conditional in the before_destruction event.<br/>
	Will be TRUE if the event with the specified id was defeated and is about to be destroyed.	
	
* this.isActorBelowHP(actor_id)

	To be used as a conditional in the before_destruction or after_action event.<br/>
	Will be TRUE if the HP of the actor with the specified id is below the specified value.
	
* this.isEnemyBelowHP(enemy_id)

	To be used as a conditional in the before_destruction or after_action event.<br/>
	Will be TRUE if the HP of the enemy with the specified id is below the specified value.

* this.isEventBelowHP(event_id)

	To be used as a conditional in the before_destruction or after_action event.<br/>
	Will be TRUE if the HP of the event with the specified id is below the specified value.	

* this.cancelActorDestruction(actor_id) 

	Cancel the destruction animation and erasure of an actor that is about to be destroyed.<br/>
	To be used in the before_destruction event.
	
* this.cancelEnemyDestruction(enemy_id) 

	Cancel the destruction animation and erasure of an enemy that is about to be destroyed.<br/>
	To be used in the before_destruction event.<br/>
	This can be used for bosses that run away when destroyed etc.

* this.addEnemy(toAnimQueue, eventId, enemyId, mechClass, level, mode, targetId, items, squadId, targetRegion)

	Spawn an enemy on the map, the event that will be used must already exist.<br/>
	The following can be set:<br/>
		* toAnimQueue: if 1 the enemy will not be spawned right away, but stored until the processEnemyAppearQueue command is called. If 0 the enemy appears instantly.
		<br/>	
		* eventId: the id number of the event
		<br/>
		* enemyId: the id number of the enemy pilot 
		<br/>
		* mechClass: the id number of the mech/class for the enemy
		<br/>
		* level
		<br/>
		* mode: "stand" for stationary enemies, otherwise ""
		<br/>
		* targetId: the actor id of the actor this enemy should prioritize
		<br/>
		* items: an array with the id numbers of the items the enemy will hold. Ex.: [10] or [10,11]. The first item in the list will drop from the enemy when it is defeated.
		<br/>
		* squadId: all enemies that are assigned the same squad id will be activated if any member of the squad is activated
		<br/>
		* targetRegion: the id of the region that the enemy should move towards<br/>
	A setting can be left blank by entering "" as its value.		
	
* this.addEnemies(toAnimQueue, startId, endId, enemyId, mechClass, level, mode, targetId, items, squadId, targetRegion)
	
	The parameters for this command are the same as for addEnemy, with the exception of:<br/>
		* startId: the starting event id 
		<br/>
		* endId: the final event id 
		<br/>
	This command will turn all the event ids between startId and endId into enemies with the same properties.

* this.processEnemyAppearQueue()

	Spawns all enemies that are currently in the queue with their spawn animation.<br/>
	Event processing will automatically wait for all enemies to be spawned before continuing execution.
	
* this.destroyEvent(event_id)

	Destroy the specified event and play its death animation.
	
* this.destroyEvents(startId, endId)

	Destroy the event between startId and endId and play their death animations.<br/>
	The death animations will all play at the same time!

* this.eraseEvent(event_id)

	Remove the specified event without an animation.
	
* this.eraseEvents(startId, endId)

	Remove the events between startId and endId.
	
* this.playerMoveTo(x, y)

	Move the cursor to the specified coordinates, the cursor will move from its start position to its end position with visible motion.
	
* this.cursorMoveTo(x, y)

	Instantly move the cursor to the specified coordinates.

* this.isActorInRegion(actor_id, region_id)

	Can be used as a conditional to detect if the actor with the specified actor id is currently on a tile from the region with the specified id.<br/>
	If actor_id is -1 this function will detect if any actor is in the region.
	
* this.isEnemyInRegion(enemy_id, region_id)

	Can be used as conditional to detect if the enemy with the specified enemy id is currently on a tile from the region with the specified id.<br/>
	If enemy_id is -1 this function will detect if any enemy is in the region.
	
* this.setBattleMode(event_id, mode)

	Set the battle mode for the enemy with the specified event id: "stand" or "".<br/>
	If the enemy is part of a squad their squad mates will also be updated!
	
* this.setBattleModes(start_id, end_id, mode)

	Set the battle mode for the enemies tied to the events with and id between start id and id.


* this.setSquadMode(squad_id, mode)

	Set the battle mode for all enimes that are part of the specified squad.<br/>

* this.turnEnd()

	End the turn of the unit currently taking its turn.


	