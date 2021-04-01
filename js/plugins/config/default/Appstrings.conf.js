function APPSTRINGS(){
	
}

APPSTRINGS.testAllSections = function(){
	Object.keys(APPSTRINGS).forEach(function(section){
		if(typeof APPSTRINGS[section] == "object"){
			APPSTRINGS.testSection(section);
		}
	});
}

APPSTRINGS.testSection = function(section){
	if(APPSTRINGS[section]){
		var ctr = 0;
		Object.keys(APPSTRINGS[section]).forEach(function(key){
			APPSTRINGS[section][key] = ctr++;
		});
	}
}

APPSTRINGS.GENERAL = {
	label_kills: "Score",
	label_stats: "Stats",
	label_abilities: "Abilities",
	label_spirits: "Spirits",
	label_ace_bonus: "Ace Bonus", 
	label_abilities: "Abilities",
	label_parts: "Parts",
	label_victory_condition: "Victory Condition",
	label_defeat_condition: "Defeat  Condition",
	label_mastery_condition: "Mastery Condition",
	label_mastery_locked: "Unobtainable after Game Over on this stage.",
	label_mastery_completed: "Completed!",
	label_mastery_completed_message: "Mastery Condition completed!",
	label_enemy_phase: "Enemy Phase",
	label_ally_phase: "Ally Phase",
	label_yes: "YES",
	label_no: "NO",
	label_ask_end_turn_single: "unit can still take an action, end your turn?",
	label_ask_end_turn_multi: "units can still take an action, end your turn?",
	label_hit: "Hit",
	label_default_victory_condition: "Destroy all enemy units.",
	label_default_defeat_condition: "All ally units are defeated.",
	label_default_mastery_condition: "???",
	label_dash_pref: "Default Fast Cursor"
}

APPSTRINGS.SAVEMENU = {
	label_funds: "Funds",
	label_turn_count: "Turns",
	label_SR_count: "SR Points"
}

APPSTRINGS.MAPMENU = {
	cmd_wait: "Wait",
	cmd_move: "Move", 
	cmd_item: "Item",
	cmd_ability: "Ability",
	cmd_spirit: "Spirit",
	cmd_repair: "Repair",
	cmd_resupply: "Resupply", 
	cmd_land: "Land",
	cmd_fly: "Fly",
	cmd_persuade: "Persuade",
	cmd_combine: "Combine",
	cmd_split: "Separate",
	cmd_transform: "Transform",
	cmd_attack: "Attack",
	cmd_end_turn: "End Turn",
	cmd_list: "Unit List",
	cmd_conditions: "Conditions",
	cmd_options: "Options",
	cmd_save: "Quick Save",
	cmd_game_end: "Exit",
	label_funds: "Funds",
	label_turn: "Turn",
	label_enemy: "Enemy",
	label_ally: "Ally",
	deploy: "Deploy",
	board: "Board"
}

APPSTRINGS.MECHSTATS = {
	move: "Move",
	armor: "Armor",
	mobility: "Mobility",
	accuracy: "Accuracy",
	repair: "Repair",
	resupply: "Resupply",
	shield: "Shield",
	barrier: "Barrier",
	weapon: "Weapon",
	size: "Size",
}	

APPSTRINGS.PILOTSTATS = {
	melee: "Melee",
	ranged: "Ranged",
	skill: "Skill", 
	defense: "Defense",
	evade: "Evade",
	hit: "Hit"
}

APPSTRINGS.INTERMISSION = {	
	title: "INTERMISSION",
	sr_points: "SR Points",
	funds: "Funds",
	top_ace: "Top Ace",
	mech_label: "Mech",
	list_label: "List",
	upgrade_label: "Upgrade",
	equip_parts: "Equip Parts",
	pilot_label: "Pilot",
	next_map: "Next Map",
	tool_tips: {
		"mech": "Manage Mechs",
		"mech_list": "Display detailed Mech information",
		"mech_upgrade": "Upgrade Mech performance and Weapons",
		"mech_parts": "Manage equipped Parts",
		"mech_parts_sell": "Sell Parts from inventory",
		"mech_search": "Find Mechs with specific properties",
		"pilot": "Manage Pilots",
		"pilot_list": "Display detailed Pilot information",
		"upgrade_pilot": "Upgrade Pilot stats and learn skills",
		"pilot_search": "Find Pilots with specific properties",
		"next_map": "Continue to the next Map",
		"data": "Manage Save Data",
		"data_save": "Save your current progress",
		"data_load": "Load previous save data",
		"options": "Manage Game Settings",
		"deployment": "Manage Unit Deployment for the next stage",
		"reassign": "Manage Pilot assignments to Mechs"
	},
	data_label: "Data",
	data_save_label: "Save",
	data_load_label: "Load",
	stage_label: "Stage",
	next_map_units: "Units for next map",
	cleared_label: "Cleared",
	turns_label: "Turns",
	options: "Options",
	deployment: "Deployment",
	reassign: "Swap Pilots",
};

APPSTRINGS.MECHLIST = {	
	title: "Mech List",
	tab_pilot_level: "Pilot Level",
	tab_mech_stats: "Mech Stats",
	tab_mech_ability: "Mech Ability",
	tab_upgrade_level: "Upgrade Level",
	tab_mech: "Mech",
	tab_ability: "Ability",
	tab_special_skills: "Special Skill",
	
	column_mech: "Mech",
	column_team: "Team",
	column_pilot: "Pilot",
	column_upgrade_percent: "Upgrade Percent",
	column_weapon_level: "Weapon Level",
	column_kills: "Score",
	column_support_attack: "Support ATK",
	column_support_defend: "Support DEF",
	column_slots: "Slots"
}

APPSTRINGS.PILOTLIST = {
	title: "Pilot List",
	
}	

APPSTRINGS.DETAILPAGES = {
	label_pilot_ability: "Pilot Ability",
	label_mech_ability: "Mech Ability",
	label_weapon_info: "Weapon Info",
	label_FUB: "Full Upgrade Bonus",
	label_FUB_hint: "Upgrade all of this mech's stats to at least Level {LEVEL_NEEDED} to unlock this ability.",
	label_ace_hint: "Get at least {KILLS_NEEDED} kills with this unit to unlock this bonus.",
	label_pilot_spirits: "Pilot Spirits",
	label_pilot_stats: "Pilot Stats",
	label_ability: "Ability",
	label_cost: "Ability",
}	

APPSTRINGS.MECHUPGRADES = {
	title: "Mod Level",
	select_title: "Select Unit",
	label_weapons: "Weapons",
	label_current_funds: "Current Funds",
	label_cost: "Cost",
	label_remaining_funds: "Remaining Funds",
	label_generic_fub: "Full Upgrade Bonus",
	label_generic_fub_HP: "HP +10%",
	label_generic_fub_EN: "EN +10%",
	label_generic_fub_armor: "Armor +10%",
	label_generic_fub_mobility: "Mobility +10%",
	label_generic_fub_accuracy: "Accuracy +10%",
	label_generic_fub_movement: "Movement +1",
	label_generic_fub_item_slot: "Item Slot +1",
}

APPSTRINGS.PILOTUPGRADES = {
	title: "Mod Level", 
	select_title: "Select Pilot",
	stats_title: "Upgrade Pilot",
	label_available_PP: "Available PP",
	label_required_PP: "Required PP",
	label_remaining_PP: "Remaining PP",
	label_ability: "Ability",
	label_points_added: "Points Added",
	tool_tip_start: "Select either Stats or Abilities to begin",
	tool_tip_melee: "Factors into damage output for Melee attacks",
	tool_tip_ranged: "Factors into damage output for Ranged attacks",
	tool_tip_skill: "Factors into how often Critical hits occur",
	tool_tip_defense: "Factors into damage taken from enemy attacks",
	tool_tip_evade: "Factors into how often the enemy's attacks will hit",
	tool_tip_hit: "Factors into how often the unit's attacks will hit",
	tool_tip_AIR: "Affects performance while in the Air",
	tool_tip_LND: "Affects performance while on Land",
	tool_tip_SEA: "Affects performance while in Water",
	tool_tip_SPC: "Affects performance while in Space",
	
}

APPSTRINGS.MECHEQUIPS = {
	select_title: "Select Unit",
	title: "Equip Items",
	label_balance: "Balance",
	label_total: "Total",
	label_transfer_hint: "Select a unit to take the item from.",
}

APPSTRINGS.ATTACKLIST = {
	label_attack_name: "Attack Name",
	label_attributes: "Attributes",
	label_power: "Power",
	label_upgraded: "Upgraded",
	label_range: "Range",
	label_hit: "Hit",
	label_crit: "Crit",
	
	label_ammo: "Ammo",
	label_EN_cost: "EN Cost",
	label_required_will: "Required Will",
	label_terrain_rating: "Terrain Rating",
	label_special_effect: "Special Effect",
	label_upgrades: "Upgrades",
	
	label_no_ammo: "Out of Ammo!",
	label_no_EN: "Out of EN!",
	label_no_will: "Not enough Will!",
	label_no_post_move: "Can't be used after moving!",
	label_no_target: "No target!",
	label_no_map_counter: "Can't counter with map attack!",
	label_no_participants: "No valid partner in range!",
	label_no_terrain: "Can't hit the target terrain!"
}

APPSTRINGS.REWARDS = {
	label_funds_gained: "Funds gained",
	label_current_funds: "Current Funds",
	label_pilot: "Pilot",
	label_exp: "Exp",
	label_items: "Items"
}

APPSTRINGS.LEVELUP = {
	label_level_up: "LEVEL UP!",
	label_skills: "Skills",
	label_spirits: "Spirits"
}

APPSTRINGS.DEPLOYMENT = {
	title: "Deployment",
	order: "Order",
	available: "Available",
	label_selected: "selected",
	title_selection: "Deploy a unit",
	label_in_stage: "Press start to deploy"
}

APPSTRINGS.REASSIGN = {
	mech_title: "Select Mech",
	pilot_title: "Select Pilot",
	label_main: "Main",
	label_slot: "Sub"
}