# Attack Editor
To access the Battle Environment Editor hit F11 on the main title screen and select "Attack Editor" from the top right drop down menu.

## Attack Animations

An Attack Animation defines the graphical effects that will be shown in the Main Battle Scene when an attack is used. The main tasks of an Attack Animation are to spawn in assets and to manipulate them(move them around, rotate them, scale them, etc.) to create the desired graphical representation of an attack. 

Attack Animations are defined as a list of Animation Commands that manipulate elements of the Battle Scene.

Attack animations are assigned to weapons using the weaponAnimId tag. If no animation is assigned to an attack the animation with id 0 will play be default.

### Timing

To time the Animation Commands in an Attack Animation each command is assigned to a certain animation Tick. Each animation Tick is 1/60th of a second. 

### Sequences

An Attack Animation can be different depending on the game state. Whether an attack hits, misses or destroys its target will affect how the attack animation plays out. To account for this an attack animation is split into different sequences:

* Main: This sequence will always play and should have the animation commands for the start of the animation.
* Hit: This sequence only plays when the attack hits.
* Hit Overwrite: This sequence only plays when the attack hits. If any of the animation Ticks of this sequence match a Tick from the Main sequence the Animation Commands from the Main Sequence for that Tick will not be executed.
* Miss: This sequence only plays when the attack misses.
* Miss Overwrite: This sequence only plays when the attack misses. If any of the animation Ticks of this sequence match a Tick from the Main sequence the Animation Commands from the Main Sequence for that Tick will not be executed.
* Destroy: This sequence only plays when the attack destroys its target.
* Destroy Overwrite: This sequence only plays when the attack destroys its target. If any of the animation Ticks of this sequence match a Tick from the Main/Hit sequence the Animation Commands from the Main/Hit Sequence for that Tick will not be executed.

Ticks for each Sequence start from 0, so if you define a command for the same Tick in the Main and Hit Sequence for example, those commands will be executed at the same time for normal Sequences. For Overwrite sequences the commands of the Overwrite sequence will be the only ones that are executed for the matching Ticks.

Depending on the game state the Battle Scene will combine the necessary sequences to create the final animation:

* The attack misses: Main + Miss + Miss Overwrite
* The attack hits: Main + Hit + Hit Overwrite
* The attack destroys: Main + Hit + Hit Overwrite + Destroy + Destroy Overwrite

### Flow control commands

There a couple of special Animation Commands that help to manage the flow of an Attack Animation:

* next\_phase: this commands is intended for transitioning between the initial part of the Attack Animation, where the attacker gets things started by firing a projectile for example and the second part of the Animation where the target is hit. This command first swipes the screen to black and in this time some additional commands can be executed to set the scene for the second part of the animation(more details on that in the command list). Then if the target has a support defender this command will automatically show an animation where the target and support defender switch places. In this case the command will also delay the rest of the animation so that the designer doesn't need to worry about the time the defender switching takes up. Finally the command swipes the screen back from black and the animation can resume. This command should always be used at the end of the Main Animation sequence!

* reset_position: this command is used to reset the target of the attack animation back to its starting position relative to the current camera position. It will automatically set the target back to its idle stance and display the damage the target has taken. Importantly it will relocate the camera and the target back to the origin of the scene so that the target can start its counterattack without issues. During this transition the background positions are updated so that the transition is not visible to the player. This command should always be used at the end of the Hit sequence to ensure any counterattacks can happen seamlessly! 

## Commands

An Attack Animation is constructed as a list of Animation Commands divided into sequences(see above).

[A full reference list for commands is available here.](battle_animation_commands.md)

## Editor

### Usage




