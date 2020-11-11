# SRW Engine MV User Manual V1.0

## Plugin commands

* SRPGBattle <start|end> 

	This command starts or ends the SRPG mode of the engine.<br/>
	Generally only called by the init or intermission map to start a new stage.
	
* Intermission <start|end>

* UnlockUnit <class_id>

* SetLevel <actor_id> <level>

* addKills <actor_id> <amount>

* addPP <actor_id> <amount>
		
* setStageSong <song_id>

	Sets the default song for the current stage.<br/>
	When switching between actor and enemy phases this song will start playing.

* setSpecialTheme <song_id>
	
	If set this song will override actor or enemy songs.
	
* clearSpecialTheme

* addItem <item_id>

	Adds one of the specified item to the inventory.
	
* addAllItems

	Adds one of each existing item to the inventory.
			
* removeItem

	Removes one of the specified item from the inventory.	

* addItemToHolder <item_id> <mech_id> <slot>

	Assigns an item to be held to a mech in a specific slot.<br/>
	Will unequip any item previously held for that mech and slot.<br/>
	Will fail if no free items of the type are available in the inventory!

* removeItemFromHolder <mech_id> <slot> 	
	
* focusActor <actor_id>

	If an actor with the specified id exists on the map the cursor will be set to its position.<br/>	
	If the matching actor does not exist or the actor was erased, nothing happens. 
	
* focusEvent <event_id>

	If an event with the specified id exists on the map the cursor will be set to its position.<br/>
	If the matching actor does not exist or the actor was erased, nothing happens.<br/>
	This command should be used to focus enemies, as those enemy ids will usually not be unique on the map!
	
* clearDeployInfo

	Clears all previous deploy info, should be used before setting up all the deploys for a map.

* setDeployCount <amount>

	Set the total number of particpants for the next deployment, ships not included.
	
* assignSlot <slot> <actor_id>
	
	Assign an actor to a slot for the next deployment.

* assignShipSlot <slot> <actor_id>
	
	Assign an actor to a ship slot for the next deployment.	<br/>
	This actor should logically be a ship captain, but this is not strictly enforced.
	
* lockDeploySlot <slot>

	Prevent the player from changing a deploy slot in the intermission menu.<br/>
	Units required for events after the next deploy should be assigned to a slot and then have that slot be locked.	
	
* unlockDeploySlot <slot>

* setSRWBattleBg <name>	
	
	Set the battle background for grounded units.<br/>
	The name is the name of the image found in img\SRWBattlebacks\

* setSRWBattleParallax1 <name>	
	
	Set the first parallax background for grounded units.<br/>
	The name is the name of the image found in img\SRWBattlebacks\	
		
* setSRWSkyBattleBg <name>		

	Set the battle background for flying units.<br/>
	The name is the name of the image found in img\SRWBattlebacks\

* setSRWSkyBattleParallax1 <name>
		
	Set the first parallax background for flying units.<br/>
	The name is the name of the image found in img\SRWBattlebacks\				
	
* addMapHighlight <x> <y> <color>

	Highlight the tile on the map with the specified coordinates and color.<br/>
	Color can be a string name, ex.: "white"	
	
* removeMapHighlight <x> <y> 

* addMapRegionHighlight <region_id> <color>

	Highlight all tiles on the map that are within the specified region.<br/>
	Color can be a string name, ex.: "white"	
	
* removeMapRegionHighlight

## Script commands

These added commands can be used in Script commands while making event scripts.<br/>
They can also be used as conditionals in IF statements.

* this.setMasteryText(<text>)

	The text for "Win condition", "Defeat condition" and "Mastery condition" will be automatically printed and should not be included.
	
* this.setVictoryText(<text>) 

	The text for "Win condition", "Defeat condition" and "Mastery condition" will be automatically printed and should not be included.

* this.setDefeatText(<text>)  

	The text for "Win condition", "Defeat condition" and "Mastery condition" will be automatically printed and should not be included.
	
* this.showStageConditions()

	Shows a text box using the values set with the previous commands.
	
* this.isActorDestructionQueued(<actor_id>)

	To be used as a conditional in the before_destruction event.<br/>
	Will be TRUE if the actor with the specified id was defeated and is about to be destroyed.
	
* this.isEnemyDestructionQueued(<enemy_id>)

	To be used as a conditional in the before_destruction event.<br/>
	Will be TRUE if the enemy with the specified id was defeated and is about to be destroyed.

* this.cancelActorDestruction(<actor_id>) 

	Cancel the destruction animation and erasure of an actor that is about to be destroyed.<br/>
	To be used in the before_destruction event.
	
* this.cancelEnemyDestruction(<enemy_id>) 

	Cancel the destruction animation and erasure of an enemy that is about to be destroyed.<br/>
	To be used in the before_destruction event.<br/>
	This can be used for bosses that run away when destroyed etc.

* this.addEnemy(toAnimQueue, eventId, enemyId, mechClass, level, mode, targetId, items, squadId, targetRegion)

	Spawn an enemy on the map, the event that will be used must already exist.<br/>
	The following can be set:<br/>
		*toAnimQueue: if 1 the enemy will not be spawned right away, but stored until the processEnemyAppearQueue command is called. If 0 the enemy appears instantly.
		<br/>	
		*eventId: the id number of the event
		<br/>
		*enemyId: the id number of the enemy pilot 
		<br/>
		*mechClass: the id number of the mech/class for the enemy
		<br/>
		*level
		<br/>
		*mode: "stand" for stationary enemies, otherwise ""
		<br/>
		*targetId: the actor id of the actor this enemy should prioritize
		<br/>
		*items: an array with the id numbers of the items the enemy will hold. Ex.: [10] or [10,11]. The first item in the list will drop from the enemy when it is defeated.
		<br/>
		*squadId: all enemies that are assigned the same squad id will be activated if any member of the squad is activated
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
	
* this.destroyEvent(<event_id>)

	Destroy the specified event and play its death animation.
	
* this.destroyEvents(<startId>, <endId>)

	Destroy the event between startId and endId and play their death animations.<br/>
	The death animations will all play at the same time!

* this.eraseEvent(<event_id>)

	Remove the specified event with an animation.
	
* this.eraseEvents(<startId>, <endId>)

	Remove the event between startId and endId.
	
* this.playerMoveTo(<x>, <y>)

	Move the cursor to the specified coordinates, the cursor will move from its start position to its end position with visible motion.
	
* this.cursorMoveTo(<x>, <y>)

	Instantly move the cursor to the specified coordinates.

* this.isActorInRegion(<actor_id>, <region_id>)

	Can be used as conditional to detect if the actor with the specified actor id is currently on a tile from the region with the specified id.<br/>
	If actor_id is -1 this function will detect if any actor is in the region.
	
* this.isEnemyInRegion(<enemy_id>, <region_id>)

	Can be used as conditional to detect if the enemy with the specified enemy id is currently on a tile from the region with the specified id.<br/>
	If enemy_id is -1 this function will detect if any enemy is in the region.
	
* this.setBattleMode(<event_id>, <mode>)

	Set the battle mode for the enemy with the specified event id: "stand" or "".<br/>
	If the enemy is part of a squad their squad mates will also be updated!
	
* this.setBattleModes(<start_id>, <end_id>, <mode>)

	Set the battle mode for the enemies tied to the events with and id between start id and id.


* this.setSquadMode(<squad_id>, <mode>)

	Set the battle mode for all enimes that are part of the specified squad.<br/>

* this.turnEnd()

	End the turn of the unit currently taking its turn.


	