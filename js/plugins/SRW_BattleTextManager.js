function SRWBattleTextManager(){
	this.initDefinitions();
}


SRWBattleTextManager.prototype.initDefinitions = function(){
	var _this = this;
	_this._definitions = {
		actors: {},
		enemies: {}
	};
	_this._definitions.actors[10] = { //Rushia
		battle_intro: {
			default: [
				"Rushia will make you part of the Fandead army.",
				"If you underestimate Rushia you'll be in a lot of trouble."
			]
		},
		retaliate: {
			default: [
				"Oi, did you just attack Rushia? OI?!"
			]
		},
		attacks: {
			0: ["Arise! Fandeads!"],
			1: ["Go forth and destroy Rushia's enemies!"],	
		},
		evade: {
			default: [
				"You won't hit Rushia that easily."
			]
		}
	};
	_this._definitions.actors[11] = { //Pekora
		battle_intro: {
			default: [
				"Let me show you how we do things down in Pekoland peko.",
				"Time to lay a beat down peko."
			]
		},
		retaliate: {
			default: [
				"W-wait, no need to beat up Pekora."
			]
		},
		attacks: {
			
		},
		evade: {
			default: [
				"You think an attack like that would hit Pekora? AH\u2798 HA\u279A HA\u279A HA\u279A",
				"Better luck next time! Peko Peko Peko Peko..."
			]
		}
	};
	_this._definitions.actors[12] = { //Fubuki
		battle_intro: {
			default: [
				"Here I gooooooooo!",
				"Can you stand up to my Hamburger powered attacks?",
				"Watch out... I'm spiderman..."
			]
		},
		retaliate: {
			default: [
				"So that's how it's going to be. Sou sou sou sou sou..."
			]
		},
		attacks: {
			0: ["Prepare to face ca- foxkinds' ultimate technique!"],
			1: ["O YAYAYAYAYAYAYAYAYAYA-"],
			2: ["DADADADADADADADADADADADA-"],
			3: ["ORA ORA ORA ORA ORA ORA ORA ORA"],
			4: ["MUDA MUDA MUDA MUDA MUDA MUDA MUDA MUDA"],
			5: ["ARI ARI ARI ARI ARI ARI ARI ARI"],
			6: ["..."],
			7: ["Arrivederci..."],
			8: ["Ah-"]
		},
		evade: {
			default: [
				"Ah, that was close...",
				"Ah, ba ba ba ba..."
			]
		},
		support_defend: {
			default: [
				"Leave it to me!"
			]
		}
	};
	
	_this._definitions.actors[13] = { //Matsuri
		battle_intro: {
			default: [
				"You will now face the full power of Hololive!",
			]
		},
		retaliate: {
			default: [
				"OI YAGOO, I'm coming for you!"
			]
		},
		attacks: {
			0: ["I AM GOD"],
			1: ["OK?"],
		},
		evade: {
			default: [
				"Hey, watch where you're going!"
			]
		},
		support_defend: {
			
		}
	};
	
	_this._definitions.actors[14] = { //Aqua
		battle_intro: {
			default: [
				"I'll show you what I learned during my time in the resistance!",
			]
		},
		retaliate: {
			default: [
				"D-don't think attacking me will earn you any favors."
			]
		},
		attacks: {
			
		},
		evade: {
			default: [
				"Ah, ha- ha- ha- ha..."
			]
		},
		support_defend: {
			
		}
	};
	
	_this._definitions.enemies[15] = { //Minor Regret
		battle_intro: {
			default: [
				"... If only... I could have..."
			]
		},
		retaliate: {
			default: [
				"... You... Begone..."
			]
		},
		support_defend: {
			default: [
				"... Will... Defend... My..."
			]
		},
		attacks: {
			
		}
	} //Rushia
}

SRWBattleTextManager.prototype.getText = function(target, id, type, subType){
	var _this = this;
	if(typeof subType == "undefined") {
		subType = "default";
	}
	var text = "...";
	var definitions;
	if(target == "actor"){
		definitions = _this._definitions.actors;
	}
	if(target == "enemy"){
		definitions = _this._definitions.enemies;
	}
	if(definitions[id] && definitions[id][type] && definitions[id][type][subType]){
		var options = definitions[id][type][subType];
		var idx = Math.floor(Math.random() * (options.length));
		text = options[idx];
	}
	return text;
}