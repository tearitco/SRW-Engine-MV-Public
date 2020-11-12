# SRW Engine MV User Manual V1.0

# Set-up

Extract the archive containing the sample project.<br>
In the project directory navigate to js/plugins/config and copy all files from the "default" directory to the "active" directory.

# Pilots

## General Notes

When making pilots it is important to remember that enemy and ally pilots should always be completely separate.<br>

If you have a character that appears as both throughout your game you must give them an entry as both an Ally and Enemy pilot.

## Ally Pilots
Ally Pilots are Actors in vanilla RPG Maker terms. Of the default RPG Maker properties only the Name, Face image and Class are used, with the class being the starting Mech for that particular pilot.<br>

The rest of the pilot properties are set using metadata tags in the note field. It is recommended to create a new character by copying an existing, fully defined, character and changing the properties as needed. The following is an annotated example:

#### Base stats
\<pilotSpecies:human\> Currently unused<br>

\<pilotBaseSP:45\> <br>
\<pilotBaseMelee:120\><br>
\<pilotBaseRanged:165\><br>
\<pilotBaseSkill:110\><br>
\<pilotBaseDefense:150\><br>
\<pilotBaseEvade: 90\><br>
\<pilotBaseHit:220\><br>
\<pilotTerrain:AABA\><br>
\<pilotExpYield:50\>The exp yield listed here is the exp gained if the enemy defeated and the actor were at the same level. When the level is different the exp gain gets scaled accordingly.<br>
\<pilotPPYield:10\><br>

#### Stat growth rates

The stats for a pilot at any given level is calculated as: base\_stat + floor(level * growth\_rate)

\<pilotSPGrowth:2\><br>
\<pilotMeleeGrowth:0.8\><br>
\<pilotRangedGrowth:1.2\><br>
\<pilotSkillGrowth:0.9\><br>
\<pilotDefenseGrowth:1.4\><br>
\<pilotEvadeGrowth: 0.8\><br>
\<pilotHitGrowth:1.2\><br>

#### Spirits

A pilot can have up to 6 spirits.<br>
The format is: spirit\_id, level\_learned, cost

\<pilotSpirit1: 25,1,10\><br>
\<pilotSpirit2: 22,1,25\><br>
\<pilotSpirit3: 27,10,15\><br>
\<pilotSpirit4: 24,15,35\><br>
\<pilotSpirit5: 6,20,35\><br>
\<pilotSpirit6: 30,25,50\><br>

#### Abilities

Up to 30 entries can be listed.<br>
The format is: ability\_id, ability\_level, level\_learned<br>
The list can contain the same ability\_id twice but with a different ability level and learned level, this allows ability levels to go up as the character levels up.


\<pilotAbility1: 4,2,1\><br>
\<pilotAbility2: 31,1,1\><br>
\<pilotAbility3: 12,1,1\><br>

\<pilotAbility4: 4,3,5\><br>
\<pilotAbility5: 4,4,10\><br>
\<pilotAbility6: 4,5,15\><br>
\<pilotAbility7: 4,6,20\><br>


\<pilotAbilityAce: 36\>The ace ability for the pilot is a separate entry and only takes the ability\_id as a parameter.<br>

## Enemy Pilots
Enemy Pilots are Enemies in vanilla RPG Maker terms. Of the default RPG Maker properties only the Name is used.<br>
The rest of the pilot properties are set using metadata tags in the note field. It is recommended to create a new character by copying an existing, fully defined, character and changing the properties as needed.<br>

The metadata properties for enemies are mostly the same as for allies, so please refer to the previous section for more info. Enemy pilots have two additional properties:

\<faceName:Monster\>The name of the Face image file in the img/faces folder <br>
\<faceIndex:1\> The index of the Face that should be used, starting from at 1 for the top left most face and 8 for the bottom right most face

# Mechs

## General Notes

Unlike in vanilla RPG Maker, the Class/Mech of the unit is what determines what their sprite will be on the map.

When working with Mechs a couple of important things must be kept in mind:

* Enemy and Ally Mechs must be kept separate at all times. If a Mech appears as both an Ally and Enemy unit in the game a separate entry must be made for when it used as an Ally and when it is used as an Enemy. 
* Never assign multiple Allied Pilots to the same Mech entry. If multiple copies of the same Mech need to be used by allied pilots, each copy must have its own entry. This restriction does not apply to Enemy mechs.

## Definition

Mech are Classes in vanilla RPG Maker Terms. Of the default RPG Maker properties only the Name is used.<br>
The rest of the Mech properties are set using metadata tags in the note field. It is recommended to create a new Mech by copying an existing, fully defined, one and changing the properties as needed. The following is an annotated example:<br>

### Base stats

\<mechHP:6500\><br>
\<mechEN:330\><br>
\<mechArmor:1650\><br>
\<mechMobility: 80\><br>
\<mechAccuracy:140\><br>
\<mechTerrain:BABA\> Air Land Sea Space<br>
\<mechMove:4\><br>
\<mechSize:M> S/M/1L/2L<br>
\<mechCanFly:0\> 0 for unable to fly, 1 for able to fly.<br>
\<mechExpYield:150\>The exp yield listed here is the exp gained if the enemy defeated and the actor were at the same level. When the level is different the exp gain gets scaled accordingly.<br>
\<mechPPYield: 15\><br>
\<mechFundYield: 500\><br>

### Weapon upgrade costs

The upgrade costs for a mech's stats can be one of multiple types. The type defines how much each level of upgrades costs.

Currently two types are supported for stats:

0: \[2000, 4000, 6000, 8000, 10000, 10000, 15000, 15000, 15000, 15000, 10000, 10000, 10000, 10000, 10000\],<br>
1: \[2000, 3000, 5000, 5000, 5000, 10000, 10000, 15000, 15000, 15000, 10000, 10000, 10000, 10000, 10000\]

And one type for weapons:


0: \[12000, 17000, 23000, 30000, 38000, 47000, 57000, 68000, 80000, 93000, 90000, 90000, 90000, 90000, 90000\]

\<mechUpgradeWeaponCost: 0\><br>
\<mechUpgradeHPCost: 0\><br>
\<mechUpgradeENCost: 1\><br>
\<mechUpgradeArmorCost: 0\><br>
\<mechUpgradeMobilityCost: 0\><br>
\<mechUpgradAccuracyCost: 1\><br>

### Attacks

The attacks available to the mech, identified by a Weapon ID.<br>
If a mech should gain weapons during the game, a new Mech entry should be made and the pilot should be switched to the new Mech.

\<mechAttack0:1\><br>
\<mechAttack1:2\><br>

### Abilities

A Mech can have up to 6 abilities, identified by a Mech Ability ID.

\<mechAbility1:4\><br>

\<mechFullUpgradeAbility:20\> The Full Upgrade Ability is assigned separately.<br>

### Items

\<mechItemSlots:2\><br>

### Sprite info

\<srpgOverworld:Mech1,0\>The map sprite for the Mech: the name of the image in the img/characters folder and the index in the image. The index starts at 0 for the top left most sprite set and ends at 7 for the bottom right most set.<br>
\<mechBasicBattleSprite:harold\> The name of the image in the img/basic_battle folder.<br>

Image files for the battle scene are stored in the img/SRWBattleScene directory with a sub directory for each character. The directory for each character contains a main.png image which is the image that is used for the Mech in the battle scene.

\<mechBattleSceneSprite:harold\> The name of the sub directory in the img/SRWBattleScene folder that houses the image files for the Mech. <br>
\<mechBattleSceneSpriteSize:64\> The height and width of the main.png image for this mech.<br>

# Attacks

## Definition

Attacks are Weapons in vanilla RPG Maker Terms. Of the default RPG Maker properties only the Name is used.<br>
The rest of the Attack properties are set using metadata tags in the note field. It is recommended to create a new Attack by copying an existing, fully defined, one and changing the properties as needed. The following is an annotated example:<br>

\<weaponType:M\>M for melee, R for ranged<br>
\<weaponPostMoveEnabled:1\>1 if the weapon can be used after moving, otherwise 0<br>
\<weaponPower:3500\><br>
\<weaponMinRange:1\><br>
\<weaponRange:3\><br>
\<weaponHitMod:15\><br>
\<weaponCritMod:10\><br>
\<weaponAmmo:-1\>Total ammo for the weapon, -1 if the weapon does not use ammo<br>
\<weaponEN:5\>EN cost for using the weapon, -1 if the weapon does not have a cost<br>
\<weaponWill:-1\>Will requirement for the weapon, -1 if there is no requirement<br>
\<weaponTerrain:AABA\><br>
\<weaponAnimId:3\>The battle scene attack animation id that will be played for this weapon. If no id is provided the default animation will play.<br>

\<weaponMapId: 0\>The id of the MAP attack definition for the weapon. If this tag is included the weapon will be treated as a MAP attack.

## MAP Attacks

MAP attacks are defined in a config plugin: js/plugins/config/active/SRW_MapAttackManager.js<br>
A definition may look as follows: <br>
```javascript
this.addDefinition(
	0, //the id of the definition
	[[1,0],[1,1],[1,-1],[2,0],[2,1],[2,-1],[3,0],[3,1],[3,-1]], //the tiles for the range of the attack as seen when the attack is targeted to the right of the user
	{
		name: "Explosion",
		frameSize: 136, //the size of each frame of the sprite sheet for the attack's animation
		sheetHeight: 1, //the number of rows in the sprite sheet
		sheetWidth: 7, //the number of columns in the sprite sheet
		frames: 7, //the number of frames in the animation
		offset: {x: 96, y: 0},//the offset for the animation relative to the user, as seen when the MAP attack is targeted to the right of the user(a tile is 48x48)
		duration: 50,//the duration of the attack animation
		se: "SRWExplosion"//the sound effect to play with the animation
	}
);
```

The definition defines the MAP attack as it should look when the user is targeting it to the right. The engine will automatically translate this when the targeting direction changes.

# Event scripting

## Stage control events

This engine introduces a couple of specific event types that will run when the engine is in a specific state.<br>
Ex.: Start of a stage, after a unit made an action, etc.<br>
They can be found at the top left of the demo stages.

![](img/main_events.png)

These events have a metadata tag indicating their type.<br>
Ex.: \<type:battleStart\><br>

It is recommended to create all new stages by creating a copy of a demo stage so that all the basics for these events are in place.

### battleStart

The battleStart event runs when the stage first starts. This event is used to set up the stage as well as to show any story events that should occur before the stage starts.<br>
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

The actorTurn event runs at the start of each actor turn. It can be used to have certain events occur at the start of a specific turn by using the Turns Passed(Stage) control variable.<br>
This command is also responsible for showing the next turn text using a formatted Text command.

### enemyTurn

The enemyTurn event runs at the start of each enemy turn. It can be used to have certain events occur at the start of a specific turn by using the Turns Passed(Stage) control variable.<br>
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

Variables 0021-0040 are stageTemp variables that can be used to keep track of things over the course of a single stage.<br>
<b>The engine will automatically clear these when a new stage starts!</b>

## Plugin commands

* SRPGBattle start|end

	This command starts or ends the SRPG mode of the engine.<br>
	Generally only called by the init or intermission map to start a new stage.
	
* Intermission start|end

* UnlockUnit class_id

* SetLevel actor_id level

* addKills actor_id amount

* addPP actor_id amount
		
* setStageSong song_id

	Sets the default song for the current stage.<br>
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

	Assigns an item to be held to a mech in a specific slot.<br>
	Will unequip any item previously held for that mech and slot.<br>
	Will fail if no free items of the type are available in the inventory!

* removeItemFromHolder mech_id slot 	
	
* focusActor actor_id

	If an actor with the specified id exists on the map the cursor will be set to its position.<br>	
	If the matching actor does not exist or the actor was erased, nothing happens. 
	
* focusEvent event_id

	If an event with the specified id exists on the map the cursor will be set to its position.<br>
	If the matching actor does not exist or the actor was erased, nothing happens.<br>
	This command should be used to focus enemies, as those enemy ids will usually not be unique on the map!
	
* clearDeployInfo

	Clears all previous deploy info, should be used before setting up all the deploys for a map.

* setDeployCount amount

	Set the total number of particpants for the next deployment, ships not included.
	
* assignSlot slot actor_id
	
	Assign an actor to a slot for the next deployment.

* assignShipSlot slot actor_id
	
	Assign an actor to a ship slot for the next deployment.	<br>
	This actor should logically be a ship captain, but this is not strictly enforced.
	
* lockDeploySlot slot

	Prevent the player from changing a deploy slot in the intermission menu.<br>
	Units required for events after the next deploy should be assigned to a slot and then have that slot be locked.	
	
* unlockDeploySlot slot

* setSRWBattleBg name	
	
	Set the battle background for grounded units.<br>
	The name is the name of the image found in img\SRWBattlebacks\

* setSRWBattleParallax1 name	
	
	Set the first parallax background for grounded units.<br>
	The name is the name of the image found in img\SRWBattlebacks\	
		
* setSRWSkyBattleBg name		

	Set the battle background for flying units.<br>
	The name is the name of the image found in img\SRWBattlebacks\

* setSRWSkyBattleParallax1 name
		
	Set the first parallax background for flying units.<br>
	The name is the name of the image found in img\SRWBattlebacks\				
	
* addMapHighlight x y color

	Highlight the tile on the map with the specified coordinates and color.<br>
	Color can be a string name, ex.: "white"	
	
* removeMapHighlight x y 

* addMapRegionHighlight region_id color

	Highlight all tiles on the map that are within the specified region.<br>
	Color can be a string name, ex.: "white"	
	
* removeMapRegionHighlight

* setEnemyUpgradeLevel level
	Sets the upgrade level for all enemies that will appear on the current stage.

## Script commands

These added commands can be used in Script commands while making event scripts.<br>
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

	To be used as a conditional in the before_destruction event.<br>
	Will be TRUE if the actor with the specified id was defeated and is about to be destroyed.
	
* this.isEnemyDestructionQueued(enemy_id)

	To be used as a conditional in the before_destruction event.<br>
	Will be TRUE if the enemy with the specified id was defeated and is about to be destroyed.
	
* this.isEventDestructionQueued(event_id)

	To be used as a conditional in the before_destruction event.<br>
	Will be TRUE if the event with the specified id was defeated and is about to be destroyed.	
	
* this.isActorBelowHP(actor_id)

	To be used as a conditional in the before_destruction or after_action event.<br>
	Will be TRUE if the HP of the actor with the specified id is below the specified value.
	
* this.isEnemyBelowHP(enemy_id)

	To be used as a conditional in the before_destruction or after_action event.<br>
	Will be TRUE if the HP of the enemy with the specified id is below the specified value.

* this.isEventBelowHP(event_id)

	To be used as a conditional in the before_destruction or after_action event.<br>
	Will be TRUE if the HP of the event with the specified id is below the specified value.	

* this.cancelActorDestruction(actor_id) 

	Cancel the destruction animation and erasure of an actor that is about to be destroyed.<br>
	To be used in the before_destruction event.
	
* this.cancelEnemyDestruction(enemy_id) 

	Cancel the destruction animation and erasure of an enemy that is about to be destroyed.<br>
	To be used in the before_destruction event.<br>
	This can be used for bosses that run away when destroyed etc.

* this.addEnemy(toAnimQueue, eventId, enemyId, mechClass, level, mode, targetId, items, squadId, targetRegion)

	Spawn an enemy on the map, the event that will be used must already exist.<br>
	The following can be set:<br>
		* toAnimQueue: if 1 the enemy will not be spawned right away, but stored until the processEnemyAppearQueue command is called. If 0 the enemy appears instantly.
		<br>	
		* eventId: the id number of the event
		<br>
		* enemyId: the id number of the enemy pilot 
		<br>
		* mechClass: the id number of the mech/class for the enemy
		<br>
		* level
		<br>
		* mode: "stand" for stationary enemies, otherwise ""
		<br>
		* targetId: the actor id of the actor this enemy should prioritize
		<br>
		* items: an array with the id numbers of the items the enemy will hold. Ex.: [10] or [10,11]. The first item in the list will drop from the enemy when it is defeated.
		<br>
		* squadId: all enemies that are assigned the same squad id will be activated if any member of the squad is activated
		<br>
		* targetRegion: the id of the region that the enemy should move towards<br>
	A setting can be left blank by entering "" as its value.		
	
* this.addEnemies(toAnimQueue, startId, endId, enemyId, mechClass, level, mode, targetId, items, squadId, targetRegion)
	
	The parameters for this command are the same as for addEnemy, with the exception of:<br>
		* startId: the starting event id 
		<br>
		* endId: the final event id 
		<br>
	This command will turn all the event ids between startId and endId into enemies with the same properties.

* this.processEnemyAppearQueue()

	Spawns all enemies that are currently in the queue with their spawn animation.<br>
	Event processing will automatically wait for all enemies to be spawned before continuing execution.
	
* this.destroyEvent(event_id)

	Destroy the specified event and play its death animation.
	
* this.destroyEvents(startId, endId)

	Destroy the event between startId and endId and play their death animations.<br>
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

	Can be used as a conditional to detect if the actor with the specified actor id is currently on a tile from the region with the specified id.<br>
	If actor_id is -1 this function will detect if any actor is in the region.
	
* this.isEnemyInRegion(enemy_id, region_id)

	Can be used as conditional to detect if the enemy with the specified enemy id is currently on a tile from the region with the specified id.<br>
	If enemy_id is -1 this function will detect if any enemy is in the region.
	
* this.setBattleMode(event_id, mode)

	Set the battle mode for the enemy with the specified event id: "stand" or "".<br>
	If the enemy is part of a squad their squad mates will also be updated!
	
* this.setBattleModes(start_id, end_id, mode)

	Set the battle mode for the enemies tied to the events with and id between start id and id.


* this.setSquadMode(squad_id, mode)

	Set the battle mode for all enimes that are part of the specified squad.<br>

* this.turnEnd()

	End the turn of the unit currently taking its turn.


	