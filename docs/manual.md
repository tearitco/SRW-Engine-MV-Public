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
	