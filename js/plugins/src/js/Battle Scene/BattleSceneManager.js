import * as BABYLON from "babylonjs";
import * as Materials from 'babylonjs-materials';
import * as Loaders from 'babylonjs-loaders';

import BattleSceneUILayer from "./BattleSceneUILayer.js";
import SpriterManager from "./SpriterManager.js";
//import BattleAnimationBuilder from "./BattleAnimationBuilder.js";


export default function BattleSceneManager(){
	this._initialized = false;
	this._frameAccumulator = 0;
	this._bgWidth = 50;	
	this._defaultSpriteSize = 128;
	this._defaultShadowSize = 1;

	this._defaultPositions = {
		// "camera_root": new BABYLON.Vector3(0, 0, -5),
		"ally_main_idle": new BABYLON.Vector3(2, 0, 1),
		"enemy_main_idle": new BABYLON.Vector3(-2, 0, 1),
		"camera_main_idle": new BABYLON.Vector3(0, 1.15, -6.5), //1.15
		"camera_main_intro": new BABYLON.Vector3(-6, 0.75, -7),
		"ally_support_idle": new BABYLON.Vector3(10, 1, 1),
		"enemy_support_idle": new BABYLON.Vector3(-10, 1, 1),
	}
	this._defaultRotations = {
		// "camera_root": new BABYLON.Vector3(0, 0, -5),
		"ally_main_idle": new BABYLON.Vector3(0, 0, 0),
		"enemy_main_idle": new BABYLON.Vector3(0, 0, 0),
		"camera_main_idle": new BABYLON.Vector3(0, 0, 0),
		"camera_main_intro": new BABYLON.Vector3(0, 0, 0),
		"ally_support_idle": new BABYLON.Vector3(0, 0, 0),
		"enemy_support_idle": new BABYLON.Vector3(0, 0, 0),
	}
	this._runningAnimation = false;
	this._currentAnimationTick = 0;
	this._currentAnimationTickTime;
	this._lastAnimationTick = -1;
	this._lastAnimationTickTime = -1;
	this._animationTickDuration = 1000/60;
	this._animationList = [];

	this._matrixAnimations = {};
	this._translateAnimationCtr = 0;
	this._sizeAnimations = {};
	this._sizeAnimationCtr = 0;
	this._shakeAnimations = {};
	this._shakeAnimationCtr = 0;
	this._bgAnimations = {};
	this._bgAnimationCounter = 0;
	this._fadeAnimations = {};
	this._fadeAnimationCtr = 0;

	this._animationDirection = 1;

	this.setBgScrollDirection(1, true);
	this._bgScrollCooldown = 60;
	this._bgScrollRatio = 1;

	this._spriteManagers = {};
	this._animationSpritesInfo = [];
	this._animationBackgroundsInfo = [];
	this._spritersBackgroundsInfo = [];
	this._spriterMainSpritesInfo = [];
	this._effekseerInfo = [];

	this._participantInfo = {
		"actor": {
			participating: false
		},
		"actor_supporter": {
			participating: false
		},
		"enemy": {
			participating: false
		},
		"enemy_supporter": {
			participating: false
		}
	};
	
	this._battleTextManager = new SRWBattleTextManager();
	
	//editor control
	this._maxAnimationTick = -1;
	
 
}

BattleSceneManager.prototype.initContainer = function(){
	this._container = document.createElement("div");
	this._container.id = "battle_scene_layer";		
	
	document.body.appendChild(this._container);
	
	this._canvas = document.createElement("canvas");
	this._canvas.id = "render_canvas";
	this._container.appendChild(this._canvas);
	
	this._fpsCounter = document.createElement("div");
	this._fpsCounter.id = "fps_counter";
	document.body.appendChild(this._fpsCounter);
	
	this._fadeContainer = document.createElement("div");
	this._fadeContainer.id = "fade_container";
	this._fadeContainer.classList.add("fade_container");
	document.body.appendChild(this._fadeContainer);
	
	this._systemFadeContainer = document.createElement("div");
	this._systemFadeContainer.id = "system_fade_container";
	this._systemFadeContainer.classList.add("fade_container");
	document.body.appendChild(this._systemFadeContainer);
	
	this._swipeContainer = document.createElement("div");
	this._swipeContainer.id = "swipe_container";
	this._swipeContainer.classList.add("fade_container");
	
	this._swipeBox = document.createElement("div");
	this._swipeBox.id = "swipe_box";
	//this._swipeBox.classList.add("");
	this._swipeContainer.appendChild(this._swipeBox);
	
	this._swipeImage = document.createElement("img");
	this._swipeImage.setAttribute("src", "img/SRWBattleScene/battleFade.png");
	this._swipeImage.id = "swipe_image";
	this._swipeBox.appendChild(this._swipeImage);
	document.body.appendChild(this._swipeContainer);
	
	this._UIcontainer = document.createElement("div");
	this._UIcontainer.id = "battle_scene_ui_layer";	
	document.body.appendChild(this._UIcontainer);		
}

BattleSceneManager.prototype.init = function(attachControl){	
	if(!this._initialized){
		this._initialized = true;
		this._UILayerManager = new BattleSceneUILayer("battle_scene_ui_layer");	
		this._animationBuilder = new BattleAnimationBuilder();
		this._environmentBuilder = new BattleEnvironmentBuilder();
		this._glContext = this._canvas.getContext("webgl");
		this._engine = new BABYLON.Engine(this._canvas, true, {preserveDrawingBuffer: true, stencil: true}); // Generate the BABYLON 3D engine	
		this._effksContext = effekseer.createContext();
		this._effksContext.init(this._glContext);
		this.initScene(attachControl);
		this._UILayerManager.redraw();
	}
}

BattleSceneManager.prototype.getContainer = function(tick){
	return this._container;
}

BattleSceneManager.prototype.setMaxAnimationTick = function(tick){
	this._maxAnimationTick = tick;
}

BattleSceneManager.prototype.resetMaxAnimationTick = function(tick){
	this._maxAnimationTick = -1;
}

BattleSceneManager.prototype.getBattleTextBuilder = function(){
	return this._battleTextManager.getTextBuilder();
}

BattleSceneManager.prototype.getAnimationBuilder = function(){
	return this._animationBuilder;
}	

BattleSceneManager.prototype.getEnvironmentBuilder = function(){
	return this._environmentBuilder;
}	

BattleSceneManager.prototype.getDefaultPositions = function(){
	return this._defaultPositions;
}	

BattleSceneManager.prototype.getDefaultRotations = function(){
	return this._defaultRotations;
}	

BattleSceneManager.prototype.initScene = function(attachControl){
	var _this = this;
	 // Create the scene space
	var scene = new BABYLON.Scene(this._engine);
	this._scene = scene;
	this._scene.clearColor = new BABYLON.Color3(0, 0, 0);
	this._scene.ambientColor = new BABYLON.Color3(0, 0, 0);

	// Add a camera to the scene and attach it to the canvas
	//var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(0,0,5), scene);
	this._camera = new BABYLON.FreeCamera("FreeCamera", this._defaultPositions.camera_main_idle, scene);
	if(attachControl){
		this._camera.attachControl(this._canvas, true);
		//hack to add up down controls to the camera
		document.addEventListener("keydown", function(e){
			if(e.key == "PageUp"){
				_this._camera.position.y+=1;
			}
			if(e.key == "PageDown"){
				_this._camera.position.y-=1;
			}
		});
	}
	

	// Add lights to the scene
	var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
	var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), scene);
	
	/*var pipeline = new BABYLON.DefaultRenderingPipeline(
		"defaultPipeline", // The name of the pipeline
		false, // Do you want the pipeline to use HDR texture?
		this._scene, // The scene instance
		[this._camera] // The list of cameras to be attached to
	);
	pipeline.samples = 4;*/

	// Add and manipulate meshes in the scene
	//var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter:2}, scene);
	
	
	//_this._ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6, subdivisions: 4}, scene); //default ground
	
	this._bgs = [];
	this._fixedBgs = [];
	this._skyBgs = [];
	this._floors = [];
	
	this._bgMode = "land";
	
	this.hookBeforeRender();
	
	//this.startScene();	
	this._engine.resize();
	
	// Watch for browser/canvas resize events
	window.addEventListener("resize", function () {
		_this._engine.resize();
	});
}

BattleSceneManager.prototype.createBg = function(name, img, position, size, alpha, rotation, useDiffuseAlpha, billboardMode){
	var width;
	var height;
	if(typeof size != "undefined"){
		if(typeof size == "object"){
			width = size.width;
			height = size.height;
		} else {
			width = size;
			height = size;
		}
	} else {
		width = this._bgWidth;
		height = 25;
	}
	
	
	var bg = BABYLON.MeshBuilder.CreatePlane(name, {width: width, height: height, updatable: true}, this._scene);
	bg.billboardMode = billboardMode || 0;
	bg.sizeInfo = {
		width: width, 
		height: height
	};
	var material = new BABYLON.StandardMaterial(name, this._scene);
		
	material.diffuseTexture = new BABYLON.Texture("img/SRWBattlebacks/"+img+".png", this._scene, false, true, BABYLON.Texture.NEAREST_NEAREST);
	material.diffuseTexture.hasAlpha = true;
	if(useDiffuseAlpha){
		material.useAlphaFromDiffuseTexture  = true;
	}	
	
	//material.transparencyMode = BABYLON.Material.MATERIAL_ALPHATESTANDBLEND;
	
	material.diffuseTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
    material.diffuseTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
	
	/*material.needDepthPrePass = true;
	material.backFaceCulling = false;*/
	
	//material.opacityTexture = material.diffuseTexture;
	
	material.specularColor = new BABYLON.Color3(0, 0, 0);
	material.emissiveColor = new BABYLON.Color3(1, 1, 1);
	material.ambientColor = new BABYLON.Color3(0, 0, 0);
	if(typeof alpha != "undefined" && alpha != -1){
		material.alpha = alpha;
	}	

    bg.material = material;
	
	bg.setPositionWithLocalVector(position);
	bg.originPosition = new BABYLON.Vector3(position.x, position.y, position.z);
	if(rotation){
		bg.rotation = rotation;
	}
	
	return bg;
}

BattleSceneManager.prototype.createSceneBg = function(name, path, position, size, alpha, billboardMode){
	var width;
	var height;
	if(typeof size != "undefined"){
		if(typeof size == "object"){
			width = size.width;
			height = size.height;
		} else {
			width = size;
			height = size;
		}
	} else {
		width = this._bgWidth;
		height = 25;
	}
	var bg = BABYLON.MeshBuilder.CreatePlane(name, {width: width, height: height, updatable: true}, this._scene);
	bg.billboardMode = billboardMode || 0;
	
	var material = new BABYLON.StandardMaterial(name, this._scene);
		
	material.diffuseTexture = new BABYLON.Texture("img/SRWBattleScene/"+path+".png", this._scene, false, true, BABYLON.Texture.NEAREST_NEAREST);
	material.diffuseTexture.hasAlpha = true;
	//material.useAlphaFromDiffuseTexture  = true;
	
	material.specularColor = new BABYLON.Color3(0, 0, 0);
	material.emissiveColor = new BABYLON.Color3(1, 1, 1);
	material.ambientColor = new BABYLON.Color3(0, 0, 0);
	if(typeof alpha != "undefined"){
		material.alpha = alpha;
	}	

    bg.material = material;
	
	bg.setPositionWithLocalVector(position);
	bg.originPosition = new BABYLON.Vector3(position.x, position.y, position.z);
	return bg;
}

BattleSceneManager.prototype.createSpriterBg = function(name, position, size, alpha, billboardMode, flipX){
	var width;
	var height;
	if(typeof size != "undefined"){
		if(typeof size == "object"){
			width = size.width;
			height = size.height;
		} else {
			width = size;
			height = size;
		}
	} else {
		width = this._bgWidth;
		height = 25;
	}
	var bg = BABYLON.MeshBuilder.CreatePlane(name, {width: width, height: height, updatable: true}, this._scene);
	bg.billboardMode = billboardMode || 0;
	//bg.renderingGroupId = 1;
	var material = new BABYLON.StandardMaterial(name, this._scene);
		
	var texture = new BABYLON.DynamicTexture("dyn_texture_"+name, {width: 1000, height: 1000}, this._scene, false);//, BABYLON.Texture.NEAREST_NEAREST
	material.diffuseTexture = texture;
	material.diffuseTexture.hasAlpha = true;
	//material.useAlphaFromDiffuseTexture  = true;
	
	material.diffuseTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
    material.diffuseTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
	
	if(flipX){
		material.diffuseTexture.uScale = -1;
		material.diffuseTexture.uOffset = 1;
	}
	
	material.specularColor = new BABYLON.Color3(0, 0, 0);
	material.emissiveColor = new BABYLON.Color3(1, 1, 1);
	material.ambientColor = new BABYLON.Color3(0, 0, 0);
	if(typeof alpha != "undefined"){
		material.alpha = alpha;
	}	

    bg.material = material;
	
	bg.setPositionWithLocalVector(position);
	bg.originPosition = new BABYLON.Vector3(position.x, position.y, position.z);
	return {sprite: bg, texture: texture, size: {width: width, height: height}};
}
		
BattleSceneManager.prototype.configureSprite = function(parent, id, shadowInfo, type){	
	parent.sprite.sizeInfo = parent.size;
	var shadow = this.createBg(id+"_shadow", "shadow", new BABYLON.Vector3(0, 0, 0), {width: 2.25 * shadowInfo.size, height: 0.5 * shadowInfo.size}, 1, new BABYLON.Vector3(0, 0, 0), true);
	shadow.shadowInfo = shadowInfo;
	parent.sprite.shadowSprite = shadow;
	
	var referenceSize = 0;
	if(parent.sprite.spriteConfig){
		referenceSize =  parent.sprite.spriteConfig.referenceSize;
	}
	
	var barrier = this.createBg(id+"_barrier", "barrier", new BABYLON.Vector3(0, 0, 0), referenceSize* 1.1, 1, null, true);
	if(type == "enemy"){
		barrier.material.diffuseTexture.uScale = -1;
		barrier.material.diffuseTexture.uOffset = 1;
	}
	//barrier.renderingGroupId = 1;
	barrier.setEnabled(false);
	barrier.parent = parent.sprite.pivothelper;
	parent.sprite.barrierSprite = barrier;
	return shadow;
}

BattleSceneManager.prototype.updateMainSprite = function(type, name, spriteConfig, position, frameSize, flipX, shadowInfo){
	var _this = this;
	var basePath = spriteConfig.path;
	var spriteId = spriteConfig.id;
	var path;
	if(spriteConfig.type == "default"){
		path = basePath+"/"+spriteId;
	} else {
		path = basePath;
	}
	
	function getSprite(){	
		var spriteInfo;
		var pivothelper = _this.createBg(name+"_pivot", "", new BABYLON.Vector3(0, 0, 0), 0, 1, null, true);
		pivothelper.isVisible = false;
		if(!spriteConfig || spriteConfig.type == "default"){
			spriteInfo = _this.createPlanarSprite(name, path, position, frameSize, flipX);		
			spriteInfo.sprite.setPivotMatrix(BABYLON.Matrix.Translation(-0, spriteInfo.size.height/2, -0), false);
		} else {
			spriteInfo = _this.createSpriterSprite(name, path, position, flipX);
			pivothelper.position.y+=spriteConfig.referenceSize / 2;			
		}				
		pivothelper.parent = spriteInfo.sprite;
		spriteInfo.sprite.pivothelper = pivothelper;
		spriteInfo.sprite.spriteInfo = spriteInfo;
		spriteInfo.sprite.spriteConfig = spriteConfig;
		return spriteInfo;	
	}
	
	var spriteInfo;
	if(type == "actor"){
		shadowInfo.type = "actor";
		spriteInfo = this._actorSprite;
			if(spriteInfo && spriteInfo.sprite){
			spriteInfo.sprite.dispose();
			spriteInfo.sprite.shadowSprite.dispose();
		}	
		this._actorSprite = getSprite();				
		this._actorShadow = this.configureSprite(this._actorSprite, "actorShadow", shadowInfo, type);		
	} 
	if(type == "enemy"){
		shadowInfo.type = "enemy";
		spriteInfo = this._enemySprite;
			if(spriteInfo && spriteInfo.sprite){
			spriteInfo.sprite.dispose();
			spriteInfo.sprite.shadowSprite.dispose();
		}	
		this._enemySprite = getSprite();
		this._enemyShadow = this.configureSprite(this._enemySprite, "enemyShadow", shadowInfo, type);
	}	
	if(type == "actor_supporter"){
		shadowInfo.type = "actor";
		spriteInfo = this._actorSupporterSprite;
			if(spriteInfo && spriteInfo.sprite){
			spriteInfo.sprite.dispose();
			spriteInfo.sprite.shadowSprite.dispose();
		}
		this._actorSupporterSprite = getSprite();
		this._actorSupporterShadow = this.configureSprite(this._actorSupporterSprite, "actorSupporterShadow", shadowInfo, type);
	} 
	if(type == "enemy_supporter"){
		shadowInfo.type = "enemy";
		spriteInfo = this._enemySupporterSprite;
			if(spriteInfo && spriteInfo.sprite){
			spriteInfo.sprite.dispose();
			spriteInfo.sprite.shadowSprite.dispose();
		}
		this._enemySupporterSprite = getSprite();
		this._enemySupporterShadow = this.configureSprite(this._enemySupporterSprite, "enemySupporterShadow", shadowInfo, type);
	}
}

BattleSceneManager.prototype.createSpriterSprite = function(name, path, position, flipX){
	var dynamicBgInfo = this.createSpriterBg(name+"_spriter", position, 10, 1, 0, flipX);
	dynamicBgInfo.renderer = new SpriterManager();
	dynamicBgInfo.renderer.startAnimation(dynamicBgInfo, "img/SRWBattleScene/"+path, "main");
	this._spriterMainSpritesInfo.push(dynamicBgInfo);
	return dynamicBgInfo;
}

BattleSceneManager.prototype.createSceneSprite = function(name, path, position, frameSize, flipX, size){
	var _this = this;
	if(!_this._spriteManagers[path]){
		_this._spriteManagers[path] = new BABYLON.SpriteManager(path+"_Manager", "img/SRWBattleScene/"+path+".png", 2000, frameSize, _this._scene, 0.01, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);//, BABYLON.Texture.NEAREST_SAMPLINGMODE
	}
	
	var sprite = new BABYLON.Sprite(name, _this._spriteManagers[path]);
	sprite.position = position;
	
	if(typeof size != "undefined"){
		if(typeof size == "object"){
			sprite.width = size.width;
			sprite.height = size.height;
		} else {
			sprite.size = size;
		}
	} else {
		sprite.size = 3;
	}
	sprite.invertU = flipX;
	
	return {manager: _this._spriteManagers[path], sprite: sprite};	
}

BattleSceneManager.prototype.createPlanarSprite = function(name, path, position, frameSize, flipX, size){
	var width;
	var height;
	if(typeof size != "undefined"){
		if(typeof size == "object"){
			width = size.width;
			height = size.height;
		} else {
			width = size;
			height = size;
		}
	} else {
		width = 3;
		height = 3;
	}
	var bg = BABYLON.MeshBuilder.CreatePlane(name, {width: width, height: height, updatable: true}, this._scene);
	//bg.billboardMode = 7;
	
	var material = new BABYLON.StandardMaterial(name, this._scene);
	var sampleMode;
	if(ENGINE_SETTINGS.BATTLE_SCENE.SPRITES_FILTER_MODE == "TRILINEAR"){
		sampleMode = BABYLON.Texture.TRILINEAR_SAMPLINGMODE;
	} else if(ENGINE_SETTINGS.BATTLE_SCENE.SPRITES_FILTER_MODE == "NEAREST"){
		sampleMode = BABYLON.Texture.NEAREST_NEAREST;
	}
	material.diffuseTexture = new BABYLON.Texture("img/SRWBattleScene/"+path+".png", this._scene, false, true, sampleMode);
	material.diffuseTexture.hasAlpha = true;
	//material.useAlphaFromDiffuseTexture  = true;	
	
	/*material.needDepthPrePass = true;
	material.backFaceCulling = false;*/
	
	//material.opacityTexture = material.diffuseTexture;
	if(flipX){
		material.diffuseTexture.uScale = -1;
		material.diffuseTexture.uOffset = 1;
	}	
	
	material.diffuseTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
	material.diffuseTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
	
	material.specularColor = new BABYLON.Color3(0, 0, 0);
	material.emissiveColor = new BABYLON.Color3(1, 1, 1);
	material.ambientColor = new BABYLON.Color3(0, 0, 0);
	if(typeof alpha != "undefined"){
		material.alpha = alpha;
	}	

    bg.material = material;
	
	bg.setPositionWithLocalVector(position);
	bg.originPosition = new BABYLON.Vector3(position.x, position.y, position.z);
	return {sprite: bg, size: {width: width, height: height}};
}

BattleSceneManager.prototype.applyAnimationDirection = function(position){
	var result = new BABYLON.Vector3(position.x * this._animationDirection, position.y, position.z);
	return result;
}

BattleSceneManager.prototype.getBattleTextId = function(action){
	if(action.ref.isActor()){
		return {id: action.ref.actorId(), mechId: action.ref.SRWStats.mech.id};
	} else {
		return {id: action.ref.enemyId(), mechId: action.ref.SRWStats.mech.id};
	}
}

BattleSceneManager.prototype.setBgScrollDirection = function(direction, immediate){
	var _this = this;
	if(!_this._changingScroll){		
		_this._previousBgScrollDirection = _this._bgScrollDirection;
		_this._bgScrollDirection = direction;
		if(immediate){
			_this._bgScrollTimer = 0;
		} else {
			_this._changingScroll = true;
			_this._bgScrollTimer = _this._bgScrollCooldown;
		}
	}	
}

BattleSceneManager.prototype.setBgScrollRatio = function(ratio, immediate){
	var _this = this;
	_this._bgScrollRatio = ratio;
}

BattleSceneManager.prototype.hookBeforeRender = function(){
	var _this = this;
	
	function scrollBg(bg, animRatio, step){
		//var deltaStep1 = (step/(1000/60)) * deltaTime;	
		//var deltaStep2 = step * _this._scene.getAnimationRatio();
		
		
		//_this._previousBgScrollDirection = _this._bgScrollDirection;
		var direction = _this._previousBgScrollDirection;
		
		bg.translate(new BABYLON.Vector3(1 * direction, 0, 0), step * animRatio, BABYLON.Space.LOCAL);
		if(Math.abs(bg.originPosition.x - bg.position.x) >= (bg.sizeInfo.width || _this._bgWidth)){
			bg.position = bg.originPosition;
		}
	}
	
	function updateShadow(spriteInfo){
		if(spriteInfo){
			var shadowSprite = spriteInfo.sprite.shadowSprite;
			if(shadowSprite){			
				shadowSprite.position.x = spriteInfo.sprite.position.x + ((shadowSprite.shadowInfo.offsetX || 0) * (shadowSprite.shadowInfo.type == "enemy" ? -1 : 1));
				shadowSprite.position.z = spriteInfo.sprite.position.z + 0.1;//(shadowSprite.shadowInfo.offsetZ || 0);
				
				shadowSprite.setEnabled(spriteInfo.sprite.isEnabled());
			}
			/*if(spriteInfo.sprite.isEnabled()){
				console.log(spriteInfo.sprite.position.x+", "+spriteInfo.sprite.position.z);
			}*/
		}		
	}
	
	_this._scene.registerBeforeRender(function() {
		var frameTime = new Date().getTime();
		//console.log("processing animation @"+frameTime);
		var deltaTime = frameTime - _this._lastAnimationTickTime;
		var ticksSinceLastUpdate = Math.floor(deltaTime / _this._animationTickDuration);	
		
		var animRatio =  _this._scene.getAnimationRatio();
		var step = 0.04 * _this._bgScrollRatio;
		if(_this._changingScroll){
			if(_this._bgScrollTimer > 0){
				if(!_this._bgSpeedUp){//slowing down
					step-=(step / _this._bgScrollCooldown) * (_this._bgScrollCooldown - _this._bgScrollTimer);
				} else {//speeding up
					step-=(step / _this._bgScrollCooldown) * (_this._bgScrollTimer);
				}
				_this._bgScrollTimer-=ticksSinceLastUpdate;
			} else {
				if(_this._previousBgScrollDirection != _this._bgScrollDirection){
					_this._bgScrollTimer = _this._bgScrollCooldown;
					_this._bgSpeedUp = true;
					_this.setBgScrollRatio(1);
				} else {
					_this._bgSpeedUp = false;
					_this._changingScroll = false;
				}
				_this._previousBgScrollDirection = _this._bgScrollDirection;
			}
			//console.log(step);
		} 
	
		_this._bgs.forEach(function(bg){
			scrollBg(bg, animRatio, step);
		});
		_this._skyBgs.forEach(function(bg){
			scrollBg(bg, animRatio, step);
		});
		_this._floors.forEach(function(bg){
			scrollBg(bg, animRatio, step);
		});
		
		/*_this._fixedBgs.forEach(function(bg){
			bg.position.x = _this._camera.position.x;
			bg.position.y = _this._camera.position.y;
		});*/
		
		
		Input.update();
		_this.isOKHeld = Input.isPressed("ok") || Input.isLongPressed("ok");
		if(Input.isPressed("cancel") && _this._sceneCanEnd && !_this._sceneIsEnding){
			_this.endScene();
		}
		
		if(_this._animsPaused || (_this._maxAnimationTick != -1 && _this._currentAnimationTick >= _this._maxAnimationTick)){
			return;
		}	
		if(_this._runningAnimation){
			
			if(ticksSinceLastUpdate >= 1){				
				//console.log(ticksSinceLastUpdate);
				if(_this.isOKHeld){
					ticksSinceLastUpdate*=2;
				}
				_this._currentAnimationTick+=ticksSinceLastUpdate;			
				
				for(var i = _this._lastAnimationTick + 1; i <=_this._currentAnimationTick; i++){					
					if(_this._animationList[i]){
						for(var j = 0; j < _this._animationList[i].length; j++){
							_this.executeAnimation(_this._animationList[i][j], i);
						}
					}
				}
					
				_this._lastAnimationTick = _this._currentAnimationTick;
				_this._lastAnimationTickTime = frameTime;
				
				if(_this._currentAnimationTick > _this._animationList.length){
					if(_this._supportDefenderActive){
						_this._supportDefenderActive = false;
						_this._animationList[_this._currentAnimationTick  + 50] = [
							{type: "set_sprite_frame", target: "active_support_defender", params: {name: "out"}},
							{type: "translate", target: "active_support_defender", params: {startPosition: _this._defaultPositions.enemy_main_idle, position: new BABYLON.Vector3(-10, 0, 1), duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
						];	
						_this._animationList[_this._currentAnimationTick  + 60] = [
							{type: "set_sprite_frame", target: "active_target", params: {name: "in"}},
							{type: "translate", target: "active_target", params: {startPosition: new BABYLON.Vector3(-10, 0, 1), position: _this._defaultPositions.enemy_main_idle, duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
							{type: "disable_support_defender", target: "", params: {}},
						];
						
						_this._animationList[_this._currentAnimationTick  + 90] = [
							{type: "set_sprite_frame", target: "active_target", params: {name: "main"}},
							{type: "set_sprite_frame", target: "active_support_defender", params: {name: "main"}},
						];
						_this._animationList[_this._currentAnimationTick  + 100] = []; //padding
					} else if(_this._doubleImageActive){
						_this._doubleImageActive = false;
						_this._animationList[_this._currentAnimationTick  + 50] = [
							{type: "show_sprite", target: "active_target"},
							{type: "translate", target: "active_target", params: {startPosition: new BABYLON.Vector3(-10, 0, 1), position: _this._defaultPositions.enemy_main_idle, duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
						];	
						_this._animationList[_this._currentAnimationTick  + 100] = []; //padding
					} else {
						_this._runningAnimation = false;
						_this.disposeAnimationSprites();
						_this.disposeAnimationBackgrounds();
						//_this.disposeSpriterBackgrounds();
						_this._animationResolve();
					}					
				} 
			}
		}			
		
	
		Object.keys(_this._matrixAnimations).forEach(function(animationId){			
			var animation = _this._matrixAnimations[animationId];
			var targetObj = animation.targetObj;
			if(targetObj){				
				var currentTick = _this._currentAnimationTick - animation.startTick;
				var t = (1 / animation.duration) * currentTick;
				if(t < 1){
					if(animation.easingFunction){
						t = animation.easingFunction.ease(t);
					}					
					if(animation.type == "translate"){
						var hasValidSpline = false;
						if(animation.catmullRom){
							var pos1 = JSON.parse(JSON.stringify(animation.catmullRom.pos1));
							var pos4 = JSON.parse(JSON.stringify(animation.catmullRom.pos4));
							
							var pos1Valid = pos1 && pos1.x != "" && pos1.y != "" && pos1.z != "";
							var pos4Valid = pos4 && pos4.x != "" && pos4.y != "" && pos4.z != "";
							
							if(pos1Valid && pos4Valid){
								pos1.x*=_this._animationDirection;
								pos4.x*=_this._animationDirection;
								hasValidSpline = true;
								targetObj.position = BABYLON.Vector3.CatmullRom(pos1, animation.startPosition, animation.endPosition, pos4, t);
								//console.log(targetObj.position.x);
							}
						} 

						if(!hasValidSpline){
							targetObj.position = BABYLON.Vector3.Lerp(animation.startPosition, animation.endPosition, t);
						}						
						targetObj.realPosition = new BABYLON.Vector3().copyFrom(targetObj.position);
					} else {
						targetObj.rotation = BABYLON.Vector3.Lerp(animation.startPosition, animation.endPosition, t);
					}
					
				} else {
					if(animation.type == "translate"){
						targetObj.position = BABYLON.Vector3.Lerp(animation.startPosition, animation.endPosition, 1);
						targetObj.realPosition = new BABYLON.Vector3().copyFrom(targetObj.position);
					} else {
						targetObj.rotation = BABYLON.Vector3.Lerp(animation.startPosition, animation.endPosition, 1);
					}
					if(animation.hide){
						targetObj.isVisible = false;
					}
					delete _this._matrixAnimations[animationId];
				}	
				if(targetObj.handle){ //support for effekseer handles
					targetObj.handle.setLocation(targetObj.position.x, targetObj.position.y, targetObj.position.z);
				}	
			}
		});
		
		Object.keys(_this._sizeAnimations).forEach(function(animationId){			
			var animation = _this._sizeAnimations[animationId];
			var targetObj = animation.targetObj;
			if(targetObj){				
				var currentTick = _this._currentAnimationTick - animation.startTick;
				var t = (1 / animation.duration) * currentTick;
				if(t < 1){
					if(animation.easingFunction){
						t = animation.easingFunction.ease(t);
					}				
					var startSizeVector = new BABYLON.Vector3(animation.startSize, animation.startSize, animation.startSize);
					var endSizeVector = new BABYLON.Vector3(animation.endSize, animation.endSize, animation.endSize);
					var sizeVector = BABYLON.Vector3.Lerp(startSizeVector, endSizeVector, t);
					
					targetObj.scaling.x = sizeVector.x;
					targetObj.scaling.y = sizeVector.y;
					targetObj.scaling.z = sizeVector.z;
					
				} else {				
					targetObj.scaling.x = animation.endSize;
					targetObj.scaling.y = animation.endSize;
					targetObj.scaling.z = animation.endSize;
					if(animation.hide){
						targetObj.isVisible = false;
					}
					delete _this._sizeAnimations[animationId];
				}				
			}
		});
		
		Object.keys(_this._shakeAnimations).forEach(function(animationId){			
			var animation = _this._shakeAnimations[animationId];
			var targetObj = animation.targetObj;
			if(targetObj){			
				var currentTick = _this._currentAnimationTick - animation.startTick;
				var t = (1 / animation.duration) * currentTick;
				if(t <= 1){
					targetObj.position.x = targetObj.realPosition.x + (Math.random() * animation.magnitude_x * 2) - animation.magnitude_x;		
					targetObj.position.y = targetObj.realPosition.y + (Math.random() * animation.magnitude_y * 2) - animation.magnitude_y;		
				} else {
					targetObj.position = targetObj.realPosition;
					delete _this._shakeAnimations[animationId];
				}
			}
		});	
		
		Object.keys(_this._fadeAnimations).forEach(function(animationId){			
			var animation = _this._fadeAnimations[animationId];
			var targetObj = animation.targetObj;
			if(targetObj){			
				var currentTick = _this._currentAnimationTick - animation.startTick;
				var t = (1 / animation.duration) * currentTick;
				if(animation.easingFunction){
					t = animation.easingFunction.ease(t);
				}	
				if(t < 1){
					var startVector = new BABYLON.Vector3(animation.startFade, 0, 0);
					var endVector = new BABYLON.Vector3(animation.endFade, 0, 0);
					var interpVector = BABYLON.Vector3.Lerp(startVector, endVector, t);
					console.log(interpVector);
					targetObj.visibility = interpVector.x;
				} else {
					targetObj.visibility = animation.endFade;
					delete _this._fadeAnimations[animationId];
				}
			}
		});	
		
		
		Object.keys(_this._bgAnimations).forEach(function(animationId){			
			var animation = _this._bgAnimations[animationId];
			var targetObj = animation.targetObj;
			if(targetObj){
				var texture;	
				if(targetObj.material){
					texture = targetObj.material.diffuseTexture;
				} else {
					texture = targetObj.texture;
				}
				if(texture){				
					var ticksSinceLastUpdate = _this._currentAnimationTick - animation.lastTick;
					if((ticksSinceLastUpdate * _this._animationTickDuration) >= animation.delay || animation.lastTick == -1){
						animation.lastTick = _this._currentAnimationTick;
						texture.uScale = 1 / animation.columnCount;
						texture.vScale = 1 / animation.lineCount;
						if((((_this._currentAnimationTick - animation.startTick) * _this._animationTickDuration) / animation.delay) >= (animation.endFrame - animation.startFrame)){
							if(animation.loop){
								animation.currentFrame = animation.startFrame;
								animation.startTick = _this._currentAnimationTick;
							} else if(animation.holdFrame){
								delete _this._bgAnimations[animationId];
							} else {
								targetObj.dispose();
								delete _this._bgAnimations[animationId];
							}							
						}					
						
						if(_this._bgAnimations[animationId]){
							var col = animation.currentFrame % animation.columnCount;
							var row = Math.floor(animation.currentFrame / animation.columnCount);
							//console.log("col: " + col + ", " + "row:" + row);
							texture.uOffset = (col * (1 / (animation.columnCount)));
							texture.vOffset = (1 - 1 / (animation.lineCount)) - (row * (1 / (animation.lineCount)));					
							animation.currentFrame = animation.startFrame + Math.floor((((_this._currentAnimationTick - animation.startTick) * _this._animationTickDuration) / animation.delay) % (animation.endFrame - animation.startFrame));
						}					
					}	
				}	
			}
		});	
		
		updateShadow(_this._actorSprite);
		updateShadow(_this._enemySprite);	
		updateShadow(_this._actorSupporterSprite);	
		updateShadow(_this._enemySupporterSprite);
	});
}

BattleSceneManager.prototype.setBgAnimationFrame = function(animation){
	
}

BattleSceneManager.prototype.disposeAnimationSprites = function(){
	this._animationSpritesInfo.forEach(function(spriteInfo){
		spriteInfo.sprite.dispose();
	});
	this._animationSpritesInfo = [];
}

BattleSceneManager.prototype.disposeAnimationBackgrounds = function(){
	this._animationBackgroundsInfo.forEach(function(bg){
		bg.dispose();
	});
	this._animationBackgroundsInfo = [];
}

BattleSceneManager.prototype.disposeSpriterBackgrounds = function(){
	this._spritersBackgroundsInfo.forEach(function(bg){
		bg.sprite.dispose();
	});
	this._spritersBackgroundsInfo = [];
	
	this._spriterMainSpritesInfo.forEach(function(bg){
		bg.sprite.dispose();
	});
	//this._spriterMainSpritesInfo = [];	
}

BattleSceneManager.prototype.startScene = function(){
	var _this = this;
	Input.clear();
	this._container.style.display = "block";
	this._engine._deltaTime = 0;
	// Register a render loop to repeatedly render the scene
	this._scene.render();
	this._engine.runRenderLoop(function () {			
		_this._fpsCounter.innerHTML = _this._engine.getFps().toFixed() + " fps";		
		
		_this._engine.wipeCaches(true);
		_this._scene.render();
		var ratio = 1;
		if(_this.isOKHeld){
			ratio = 2;
		}
		_this._effksContext.update(_this._engine.getDeltaTime() * 60 / 1000 * ratio);		
		_this._effksContext.setProjectionMatrix(_this._camera.getProjectionMatrix().m);
		_this._effksContext.setCameraMatrix(BABYLON.Matrix.Invert(_this._camera.getWorldMatrix()).m);
		_this._effksContext.draw();
		
		var tmp = [];
		_this._spriterMainSpritesInfo.forEach(function(spriterBg){
			if(!spriterBg.sprite.isDisposed()){
				spriterBg.renderer.update(_this._engine.getDeltaTime());	
				tmp.push(spriterBg);
			}			
		});
		_this._spriterMainSpritesInfo = tmp;		
	});
	this._engine.resize()
}

BattleSceneManager.prototype.stopScene = function(){
	var _this = this;
	this._container.style.display = "";
	// Register a render loop to repeatedly render the scene
	this._engine.stopRenderLoop();
}

BattleSceneManager.prototype.registerMatrixAnimation = function(type, targetObj, startPosition, endPosition, startTick, duration, easingFunction, easingMode, hide, catmullRom){
	startPosition = this.applyAnimationDirection(startPosition);
	endPosition = this.applyAnimationDirection(endPosition);

	if(easingFunction && easingMode){
		easingFunction.setEasingMode(easingMode);
	}
	this._matrixAnimations[this._translateAnimationCtr++] = {
		type: type, 
		targetObj: targetObj,
		startPosition: startPosition,
		endPosition: endPosition,
		startTick: startTick,
		duration: duration,
		easingFunction: easingFunction,
		hide: hide,
		catmullRom: catmullRom
	};
}

BattleSceneManager.prototype.registerSizeAnimation = function(targetObj, startSize, endSize, startTick, duration, easingFunction, easingMode, hide){
	if(easingFunction && easingMode){
		easingFunction.setEasingMode(easingMode);
	}
	this._sizeAnimations[this._sizeAnimationCtr++] = {
		targetObj: targetObj,
		startSize: startSize,
		endSize: endSize,
		startTick: startTick,
		duration: duration,
		easingFunction: easingFunction,
		hide: hide,
	};
}

BattleSceneManager.prototype.registerFadeAnimation = function(targetObj, startFade, endFade, startTick, duration, easingFunction, easingMode){	
	if(easingFunction && easingMode){
		easingFunction.setEasingMode(easingMode);
	}
	this._fadeAnimations[this._fadeAnimationCtr++] = {
		targetObj: targetObj,
		startFade: startFade,
		endFade: endFade,
		startTick: startTick,
		duration: duration,
		easingFunction: easingFunction,
	};
}

	
BattleSceneManager.prototype.registerShakeAnimation = function(targetObj, magnitude_x, magnitude_y, startTick, duration){	
	this._shakeAnimations[this._shakeAnimationCtr++] = {		
		targetObj: targetObj,
		magnitude_x: magnitude_x,
		magnitude_y: magnitude_y,
		startTick: startTick,
		duration: duration
	};
}

BattleSceneManager.prototype.registerBgAnimation = function(targetObj, startTick, frameSize, lineCount, columnCount, startFrame, endFrame, loop, delay, holdFrame){	
	this._bgAnimations[this._bgAnimationCounter++] = {		
		targetObj: targetObj,
		startTick: startTick,
		lastTick: -1,
		currentFrame: startFrame,
		frameSize: frameSize,
		startFrame: startFrame,
		endFrame: endFrame,
		loop: loop,
		delay: delay,
		lineCount: lineCount,
		columnCount: columnCount,
		holdFrame: holdFrame
	};
}


BattleSceneManager.prototype.delayAnimationList = function(startTick, delay){
	var delayedList = [];
	for(var i = 0; i < this._animationList.length; i++){
		if(this._animationList[i]){
			if(i >= startTick){
				delayedList[i+delay] = this._animationList[i];
			} else {
				delayedList[i] = this._animationList[i];
			}
		}		
	}
	this._animationList = delayedList;
}

BattleSceneManager.prototype.executeAnimation = function(animation, startTick){
	var _this = this;
	function getTargetObject(name){
		if(name == "Camera"){
			return _this._camera;
		} else if(name == "active_main"){
			if(_this._supportAttackerActive){
				return _this._active_support_attacker;
			} else {
				return _this._active_main;
			}
		} else if(name == "active_target"){
			if(_this._supportDefenderActive){
				return _this._active_support_defender;
			} else {
				return _this._active_target;
			}			
		} else if(name == "active_support_defender"){
			return _this._active_support_defender;
		} else if(name == "active_support_attacker"){
			return _this._active_support_attacker;
		} else if(name == "ally_main"){
			return _this._actorSprite.sprite;
		} else if(name == "enemy_main"){
			return _this._enemySprite.sprite;
		} else {
			var obj = _this._scene.getMeshByName(name);
			if(!obj){//check sprites
				var ctr = 0;
				while(!obj && ctr < _this._animationSpritesInfo.length){
					var spriteInfo = _this._animationSpritesInfo[ctr++];
					if(spriteInfo.sprite.name == name){
						obj = spriteInfo.sprite;
					}
					ctr++;
				}
			}
			if(!obj && _this._scene.layers){//check layers
				var ctr = 0;
				while(!obj && ctr < _this._scene.layers.length){
					if(_this._scene.layers[ctr].name == name){
						obj = _this._scene.layers[ctr];
					}
					ctr++;
				}
			}
			if(!obj){//check effekseer handles
				var ctr = 0;
				while(!obj && ctr < _this._effekseerInfo.length){
					if(_this._effekseerInfo[ctr].name == name){
						obj = _this._effekseerInfo[ctr];
					}
					ctr++;
				}
			}
			return obj;
		}						
	}
	var animationHandlers = {
		kill_active_animations: function(target, params){
			_this._matrixAnimations = {};
		},
		teleport: function(target, params){
			//console.log("teleport: "+target);
			var targetObj = getTargetObject(target);
			if(targetObj){
				targetObj.position = _this.applyAnimationDirection(params.position);
			}
		},
		rotate_to: function(target, params){
			//console.log("teleport: "+target);
			var targetObj = getTargetObject(target);
			if(targetObj){
				targetObj.rotation = _this.applyAnimationDirection(params.rotation);
				if(targetObj.handle){//support for effekseer handles
					targetObj.setRotation(targetObj.rotation.x, targetObj.rotation.y, targetObj.rotation.z);
				}
			}
		},
		translate: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				targetObj.wasMoved = true;
				var startPosition;
				if(params.startPosition){
					startPosition = params.startPosition;
				} else {
					startPosition = targetObj.position;
				}
				_this.registerMatrixAnimation("translate", targetObj, startPosition, params.position, startTick, params.duration, params.easingFunction, params.easingMode, params.hide, params.catmullRom);
			}			
		},
		rotate: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				var startRotation;
				if(params.startRotation){
					startRotation = params.startRotation;
				} else {
					startRotation = targetObj.rotation;
				}
				_this.registerMatrixAnimation("rotate", targetObj, startRotation, params.rotation, startTick, params.duration, params.easingFunction, params.easingMode);
			}			
		},
		resize: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){				
				_this.registerSizeAnimation(targetObj, params.startSize, params.endSize, startTick, params.duration, params.easingFunction, params.easingMode);
			}			
		},
		flip: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){				
				targetObj.material.diffuseTexture.uScale = params.x || 1;
				targetObj.material.diffuseTexture.vScale = params.y || 1;
			}			
		},
		shake: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){				
				targetObj.realPosition = new BABYLON.Vector3().copyFrom(targetObj.position);
				_this.registerShakeAnimation(targetObj, params.magnitude_x || 0, params.magnitude_y || 0, startTick, params.duration, params.easingFunction, params.easingMode);
			}			
		},
		set_camera_target: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				//_this._camera.setTarget(targetObj.position);
				_this._camera.lockedTarget = targetObj.position;
			}			
		},	
	
		set_damage_text: function(target, params){
			var action = _this._currentAnimatedAction.attacked;
			var entityType = action.isActor ? "actor" : "enemy";
			var entityId = action.ref.SRWStats.pilot.id;
			var tempData;
			if(entityType == "actor"){
				tempData = _this._participantInfo.actor;
			} else {
				tempData = _this._participantInfo.enemy;
			}	
			var type;
			if(tempData.animatedHP / $statCalc.getCalculatedMechStats(action.ref).maxHP < 0.25){
				type = "damage_critical";
			} else {
				type = "damage";
			}
			var battleText = _this._battleTextManager.getText(entityType, action.ref, type, action.isActor ? "enemy" : "actor", _this.getBattleTextId(_this._currentAnimatedAction));
			_this._UILayerManager.setTextBox(entityType, entityId, action.ref.SRWStats.pilot.name, battleText);
		},
		
		set_evade_text: function(target, params){
			var action = _this._currentAnimatedAction.attacked;
			var entityType = action.isActor ? "actor" : "enemy";
			var entityId = action.ref.SRWStats.pilot.id;
			var battleText = _this._battleTextManager.getText(entityType, action.ref, "evade", action.isActor ? "enemy" : "actor", _this.getBattleTextId(_this._currentAnimatedAction));
			_this._UILayerManager.setTextBox(entityType, entityId, action.ref.SRWStats.pilot.name, battleText);
		},
		
		set_destroyed_text: function(target, params){
			var action = _this._currentAnimatedAction.attacked;
			var entityType = action.isActor ? "actor" : "enemy";
			var entityId = action.ref.SRWStats.pilot.id;
			var battleText = _this._battleTextManager.getText(entityType, action.ref, "destroyed", action.isActor ? "enemy" : "actor", _this.getBattleTextId(_this._currentAnimatedAction));
			_this._UILayerManager.setTextBox(entityType, entityId, action.ref.SRWStats.pilot.name, battleText);
		},
		
		set_attack_text: function(target, params){
			var action = _this._currentAnimatedAction;
			var entityType = action.isActor ? "actor" : "enemy";
			var entityId = action.ref.SRWStats.pilot.id;
			var battleText = _this._battleTextManager.getText(entityType, action.ref, "attacks", params.id, null, null, action.action.attack.id);
			_this._UILayerManager.setTextBox(entityType, entityId, action.ref.SRWStats.pilot.name, battleText);
		},
		clear_attack_text: function(target, params){
			_this._UILayerManager.resetTextBox();
		},
		show_support_defender_text: function(target, params){
			var action = _this._currentAnimatedAction.attacked;
			var entityType = action.isActor ? "actor" : "enemy";
			var entityId = action.ref.SRWStats.pilot.id;
			var battleText = _this._battleTextManager.getText(entityType, action.ref, "support_defend", entityType, _this.getBattleTextId({ref: _this._currentAnimatedAction.attacked.defended}));
			_this._UILayerManager.setTextBox(entityType, entityId, action.ref.SRWStats.pilot.name, battleText);			
			_this._UILayerManager.setNotification(entityType, "Support Defend");
		},
		enable_support_defender: function(target, params){
			_this._supportDefenderActive = true;			
			var action = _this._currentAnimatedAction.attacked;
			var ref = _this._currentAnimatedAction.attacked.ref;
			var stats = $statCalc.getCalculatedMechStats(ref);
			var currentHP;
			if(action.side == "actor"){
				currentHP = _this._participantInfo.actor_supporter.tempHP;
				_this._actorSprite.sprite.setEnabled(false);
			} else {
				currentHP = _this._participantInfo.enemy_supporter.tempHP;
				_this._enemySprite.sprite.setEnabled(false);
			}
			_this._UILayerManager.setStat(action, "HP");
			_this._UILayerManager.setStat(action, "EN");
		},
		
		disable_support_defender: function(target, params){
			_this._supportDefenderActive = false;
			var action = _this._currentAnimatedAction.attacked;
			if(action.side == "actor"){
				action = _this._participantInfo.actor.effect;
			} else {
				action = _this._participantInfo.enemy.effect;
			}			
			var ref = action.ref;
			var stats = $statCalc.getCalculatedMechStats(ref);
			var currentHP;
			if(action.side == "actor"){
				currentHP = _this._participantInfo.actor.tempHP;
				_this._actorSprite.sprite.setEnabled(true);
			} else {
				currentHP = _this._participantInfo.enemy.tempHP;
				_this._enemySprite.sprite.setEnabled(true);
			}
			_this._UILayerManager.setStat(action, "HP");
			_this._UILayerManager.setStat(action, "EN");
		},		
		fade_in_bg: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				_this.registerFadeAnimation(targetObj, params.startFade, params.endFade, startTick, params.duration, params.easingFunction, params.easingMode);
			}
		},		
		fade_swipe: function(target, params){
			var swipeTime = params.time || 700;
			var direction;
			if(params.direction){
				direction = params.direction;
			} else {
				if(_this._currentAnimatedAction.side == "actor"){
					direction = "right";
				} else {
					direction = "left";
				}
			}
			if(_this.isOKHeld){
				swipeTime/=2;
			}
			_this.swipeToBlack(direction, "in", swipeTime).then(function(){
				_this.swipeToBlack(direction, "out");
			});	
		},
		fade_white: function(target, params){
			var fadeTime = params.time || 700;
			if(_this.isOKHeld){
				fadeTime/=2;
			}
			_this.fadeToWhite(fadeTime, params.speedIn || "fast").then(function(){
				_this.fadeFromWhite(params.speedOut || "fast");
			});	
		},		
		updateBgMode: function(target){
			var action;
			if(target == "active_target"){
				action = _this._currentAnimatedAction.originalTarget;
			} else {
				action = _this._currentAnimatedAction;
			}
			_this.setBgMode($statCalc.isFlying(action.ref) || $statCalc.getTileType(action.ref) == "space" ? "sky" : "land");			
		},	
		next_phase: function(target, params){
			
			_this._animationList[startTick + 1] = [{type: "fade_swipe", target: "", params: {time: 300}}];	
			
			_this._animationList[startTick + 25] = [{type: "create_target_environment"}, {type: "updateBgMode", target: "active_target"}];
			if(params.cleanUpCommands){				
				_this._animationList[startTick + 26] = params.cleanUpCommands;						
			}				
			
			//support defend animation
			if(_this._currentAnimatedAction.attacked.type == "support defend"){
				_this.delayAnimationList(startTick + 27, 140);
				_this._animationList[startTick + 30] = [
					{type: "teleport", target: "Camera", params: {position: _this._defaultPositions.camera_main_idle}},
					{type: "rotate_to", target: "Camera", params: {rotation: _this._defaultRotations.camera_main_idle}},
					{type: "show_sprite", target: "active_target", params: {}},		
					{type: "hide_sprite", target: "active_main", params: {}},					
				];	
				
				_this._animationList[startTick + 50] = [
					{type: "set_sprite_frame", target: "active_target", params: {name: "out"}},
					{type: "translate", target: "active_target", params: {startPosition: _this._defaultPositions.enemy_main_idle, position: new BABYLON.Vector3(-10, 0, 1), duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
				];
				
				_this._animationList[startTick + 80] = [
					{type: "show_sprite", target: "active_support_defender", params: {}},
					{type: "set_sprite_frame", target: "active_support_defender", params: {name: "in"}},
					{type: "translate", target: "active_support_defender", params: {startPosition: new BABYLON.Vector3(-10, 0, 1), position: _this._defaultPositions.enemy_main_idle, duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
					{type: "show_support_defender_text"},					
				];
				
				_this._animationList[startTick + 110] = [
					{type: "set_sprite_frame", target: "active_support_defender", params: {name: "main", spriterOnly: true}},
					{type: "set_sprite_frame", target: "active_support_defender", params: {name: "main", defaultOnly: true}},
					{type: "set_sprite_frame", target: "active_target", params: {name: "main"}},
				];
				
				_this._animationList[startTick + 120] = [
					{type: "fade_swipe", target: "", params: {time: 900}},
				];
				
				_this._animationList[startTick + 130] = [
					{type: "show_sprite", target: "active_main", params: {}},	
					{type: "enable_support_defender"},
				];				
				
				if(params.commands){
					_this._animationList[startTick + 131] = params.commands;						
				}
				_this._animationList[startTick + 132] = [{type: "updateBgMode", target: "active_target"}];
			} else {
				if(params.commands){
					_this._animationList[startTick + 27] = params.commands;	
					_this._animationList[startTick + 28] = [{type: "updateBgMode", target: "active_target"}];
				}
			}
		},
		dodge_pattern: function(target, params){
			var action = _this._currentAnimatedAction.attacked;
			var entityType = action.isActor ? "actor" : "enemy";
			var entityId = action.ref.SRWStats.pilot.id;
			var battleText = _this._battleTextManager.getText(entityType, action.ref, "evade", action.isActor ? "enemy" : "actor", _this.getBattleTextId(_this._currentAnimatedAction));
			_this._UILayerManager.setTextBox(entityType, entityId, action.ref.SRWStats.pilot.name, battleText);
			
			if(action.isDoubleImage){
				_this._doubleImageActive = true;
				var additions = [];
				var position = _this._defaultPositions.enemy_main_idle;
				/*additions[startTick + 1] = [
					{type: "translate", target: "active_target", params:{startPosition: position, position: new BABYLON.Vector3(position.x + 2, position.y, position.z), duration: 2}},
				];
				additions[startTick + 4] = [
					{type: "translate", target: "active_target", params:{startPosition: position,position: new BABYLON.Vector3(position.x - 2, position.y, position.z), duration: 2}},
				];*/
				var moveCount = 15;
				var moveTicks = 30;
				var moveStep = Math.floor(moveTicks / moveCount);
				for(var i = 0; i < moveCount; i++){
					var sign = i % 2 ? 1 : -1;
					additions[startTick + (i * moveStep)] = [
						{type: "translate", target: "active_target", params:{startPosition: position,position: new BABYLON.Vector3(position.x - (0.2 * i * sign), position.y, position.z), duration: moveStep}},
					];
				}
				additions[startTick + 30] = [					
					{type: "hide_sprite", target: "active_target", params:{index: 0}},
					{type: "teleport", target: "active_target", params:{position: position}},
				];
				_this.mergeAnimList(additions);
				
				var entityType = action.side;
				_this._UILayerManager.setNotification(entityType, "DOUBLE IMAGE");
			} else {
				if(params.commands){
					_this._animationList[startTick + 1] = params.commands;	
				}
			}
				
		},
		spawn_sprite: function(target, params){
			var spriteInfo = _this.createSceneSprite(target, params.path, _this.applyAnimationDirection(params.position), params.frameSize, _this._animationDirection == 1 ? false : true, params.size);	
			if(params.animationFrames){
				spriteInfo.sprite.playAnimation(0, params.animationFrames, params.animationLoop, params.animationDelay);
			}
			//spriteInfo.manager.renderingGroupId = 1;
			_this._animationSpritesInfo.push(spriteInfo);
		},
		remove_sprite: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				targetObj.dispose();
			}
		},
		create_bg: function(target, params){
			var position;
			if(params.position){
				position = params.position;
			} else {
				position = new BABYLON.Vector3(0, 0, 0);
			}
			var bg = _this.createSceneBg(target, params.path, _this.applyAnimationDirection(position), params.size, params.alpha, params.billboardMode);
			if(params.rotation){
				bg.rotation = _this.applyAnimationDirection(params.rotation);
			}
			if(params.animationFrames){
				_this.registerBgAnimation(bg, startTick, params.frameSize, params.lineCount, params.columnCount, 0, params.animationFrames, params.animationLoop, params.animationDelay);
			}
			if(params.parent){
				var parentObj = getTargetObject(params.parent);
				if(parentObj){
					bg.parent = parentObj;
				}
			}
			_this._animationBackgroundsInfo.push(bg);
		},
		remove_bg: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				targetObj.isVisible = false;
				targetObj.dispose();
			}
		},	
		create_layer: function(target, params){
			var bg = new BABYLON.Layer(target, "img/SRWBattleScene/"+params.path+".png", _this._scene, params.isBackground);
			if(params.animationFrames){
				_this.registerBgAnimation(bg, startTick, params.frameSize, params.lineCount, params.columnCount, 0, params.animationFrames, params.animationLoop, params.animationDelay);
			}
			_this._animationBackgroundsInfo.push(bg);
		},
		remove_layer: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				targetObj.dispose();
			}
		},	
		create_sky_box: function(target, params){
			var skybox = BABYLON.MeshBuilder.CreateBox(target, {size:1000.0}, _this._scene);			
			var skyboxMaterial = new BABYLON.StandardMaterial(target+"_material", _this._scene);
			skyboxMaterial.backFaceCulling = false;
			skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("img/skyboxes/"+params.path, _this._scene);
			skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
			skyboxMaterial.diffuseColor = params.color || new BABYLON.Color3(0, 0, 0);
			skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
			skybox.material = skyboxMaterial;
			
		},
		remove_sky_box: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				targetObj.dispose();
			}
		},	
		play_effekseer: function(target, params){					
			var position = _this.applyAnimationDirection(params.position || new BABYLON.Vector3(0,0,0));		
			var scale = params.scale || 1;
			//scale*=_this._animationDirection;
			var speed = params.speed || 1;
			var rotation = params.rotation || new BABYLON.Vector3(0,0,0);
			if(_this._animationDirection == -1){
				rotation.y = rotation.y * 1 + Math.PI;
			}
			
			var info;
			var effect = _this._effksContext.loadEffect("effekseer/"+params.path+".efk", 1.0, function(){
				// Play the loaded effect
				
				var handle = _this._effksContext.play(effect, position.x, position.y, position.z);
				info.handle = handle;
				handle.setSpeed(speed);
				handle.setRotation(rotation.x, rotation.y, rotation.z);
			});
			info = {name: target, effect: effect, context: _this._effksContext}
			_this._effekseerInfo.push(info);			
			effect.scale = scale;
		},		
		hide_effekseer: function(target, params){
			var targetObj;
			var ctr = 0;
			while(!targetObj && ctr < _this._effekseerInfo.length){
				if(_this._effekseerInfo[ctr].name == target){
					targetObj = _this._effekseerInfo[ctr].handle;
				}
				ctr++;
			}
			if(targetObj){
				targetObj.setShown(false);
			}
		},
		set_sprite_index: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj && targetObj.playAnimation){
				targetObj.playAnimation(params.index, params.index, false, 100);
			}
		},
		set_sprite_animation: function(target, params){
			var targetObj = getTargetObject(target);
			var action = _this._currentAnimatedAction;
			var targetAction = _this._currentAnimatedAction.attacked;
			if(targetObj){
				var sampleMode;
				if(ENGINE_SETTINGS.BATTLE_SCENE.SPRITES_FILTER_MODE == "TRILINEAR"){
					sampleMode = BABYLON.Texture.TRILINEAR_SAMPLINGMODE
				} else if(ENGINE_SETTINGS.BATTLE_SCENE.SPRITES_FILTER_MODE == "NEAREST"){
					sampleMode = BABYLON.Texture.NEAREST_NEAREST
				}
				
				var battleEffect;
				if(target == "active_main" || target == "active_support_attacker"){
					battleEffect = action;
				} else if(target == "active_target" || target == "active_support_defender"){
					battleEffect = targetAction;
				}
				
				
				var imgPath = $statCalc.getBattleSceneImage(battleEffect.ref);
				
				targetObj.material.diffuseTexture = new BABYLON.Texture("img/SRWBattleScene/"+imgPath+"/"+params.name+".png", _this._scene, false, true, sampleMode);
				targetObj.material.diffuseTexture.hasAlpha = true;
				//targetObj.material.useAlphaFromDiffuseTexture  = true;
				
				targetObj.material.specularColor = new BABYLON.Color3(0, 0, 0);
				targetObj.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
				targetObj.material.ambientColor = new BABYLON.Color3(0, 0, 0);
				if(params.animationFrames){
					_this.registerBgAnimation(targetObj, startTick, params.frameSize, params.lineCount, params.columnCount, 0, params.animationFrames, params.animationLoop*1, params.animationDelay, params.holdFrame*1);
				}
			}
		},
		set_sprite_frame: function(target, params){
			var targetObj = getTargetObject(target);
			var action = _this._currentAnimatedAction;
			var targetAction = _this._currentAnimatedAction.attacked;
			if(targetObj){
				if(params.name == "hurt" || params.name == "hurt_end"){
					if(target == "active_main" || target == "active_support_attacker"){
						battleEffect = targetAction; 					
					} else if(target == "active_target" || target == "active_support_defender"){
						battleEffect = action;					
					}
					if(battleEffect.damageInflicted == 0){
						params.name = "main";
					}
				}
				if(targetObj.spriteConfig.type == "default"){
					if(!params.spriterOnly){					
						var sampleMode;
						if(ENGINE_SETTINGS.BATTLE_SCENE.SPRITES_FILTER_MODE == "TRILINEAR"){
							sampleMode = BABYLON.Texture.TRILINEAR_SAMPLINGMODE
						} else if(ENGINE_SETTINGS.BATTLE_SCENE.SPRITES_FILTER_MODE == "NEAREST"){
							sampleMode = BABYLON.Texture.NEAREST_NEAREST
						}
						
						var flipX;
						var battleEffect;
						if(target == "active_main" || target == "active_support_attacker"){
							battleEffect = action;					
						} else if(target == "active_target" || target == "active_support_defender"){
							battleEffect = targetAction;					
						}
						
						if(battleEffect.side == "actor"){
							flipX = false;
						} else {
							flipX = true;
						}
						
						var imgPath = targetObj.spriteConfig.path;
						
						targetObj.material.diffuseTexture = new BABYLON.Texture("img/SRWBattleScene/"+imgPath+"/"+params.name+".png", _this._scene, false, true, sampleMode);
						targetObj.material.diffuseTexture.hasAlpha = true;
						//targetObj.material.useAlphaFromDiffuseTexture  = true;
						
						targetObj.material.diffuseTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
						targetObj.material.diffuseTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
						
						targetObj.material.specularColor = new BABYLON.Color3(0, 0, 0);
						targetObj.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
						targetObj.material.ambientColor = new BABYLON.Color3(0, 0, 0);
						
						if(flipX){
							targetObj.material.diffuseTexture.uScale = -1; 
							targetObj.material.diffuseTexture.uOffset = 1; 
						}
					}
				} else {
					if(!params.defaultOnly){
						targetObj.spriteInfo.renderer.updateAnimation(params.name);
					}						
				}					
			}
		},
		hide_sprite: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				targetObj.setEnabled(false); 
			}
		},
		show_sprite: function(target, params){
			var targetObj = getTargetObject(target);
			if(targetObj){
				targetObj.setEnabled(true);				
			}
		},
		hide_bgs: function(target, params){
			_this._bgsHidden = true;
			_this._bgs.forEach(function(bg){
				bg.isVisible = false;
			});
			_this._skyBgs.forEach(function(bg){
				bg.isVisible = false;
			});
			_this._floors.forEach(function(bg){
				bg.isVisible = false;
			});
		},
		show_bgs: function(target, params){
			_this._bgsHidden = false;
			if(_this._bgMode == "sky"){
				_this._skyBgs.forEach(function(bg){
					bg.isVisible = true;
				});	
			} else {
				_this._bgs.forEach(function(bg){
					bg.isVisible = true;
				});
				_this._floors.forEach(function(bg){
					bg.isVisible = true;
				});
			}		
		},
		reset_position: function(target, params){
			var targetObj = getTargetObject("active_target");
			
			var targetOffset = _this._defaultPositions.camera_main_idle.x - _this._camera.position.x;
			if(_this._currentAnimatedAction.type == "initiator" && (!_this._currentAnimatedAction.attacked || !_this._currentAnimatedAction.attacked.isDestroyed)){
				if(_this._currentAnimatedAction.side == "actor"){
					_this.setBgScrollDirection(-1);		
				} else {
					_this.setBgScrollDirection(1);		
				}
			}			
				
			_this._camera.position.x = 0;
			
			if(_this._actorSprite && _this._actorSprite.sprite.wasMoved){
				_this._actorSprite.sprite.position.x+=targetOffset;
			}
			if(_this._enemySprite && _this._enemySprite.sprite.wasMoved){
				_this._enemySprite.sprite.position.x+=targetOffset;
			}
			if(_this._actorSupporterSprite && _this._actorSupporterSprite.sprite.wasMoved){
				_this._actorSupporterSprite.sprite.position.x+=targetOffset;
			}
			if(_this._enemySupporterSprite && _this._enemySupporterSprite.sprite.wasMoved){
				_this._enemySupporterSprite.sprite.position.x+=targetOffset;
			}
			
			_this._bgs.forEach(function(bg){
				var width = (bg.sizeInfo.width || _this._bgWidth) * 1;
				var offset = (targetOffset % width);				
				bg.position.x+=offset;
				if(Math.abs(bg.position.x - bg.originPosition.x) > width){
					bg.position.x-=width * Math.sign(offset);
				} 			
			});
			
			if(targetObj){
				//targetObj.playAnimation(1, 1, false, 100)			
				if(!params.duration){
					params.duration = 10;
				}
				
				var targetPostion = new BABYLON.Vector3().copyFrom(_this._defaultPositions.enemy_main_idle);
				
				/*if(targetObj == _this._actorSprite.sprite || targetObj == _this._actorSupporterSprite.sprite){
					_this.registerMatrixAnimation("translate", targetObj, _this.applyAnimationDirection(targetObj.position), targetPostion, startTick, params.duration);
				} else if(targetObj == _this._enemySprite.sprite || targetObj == _this._enemySupporterSprite.sprite) {
					_this.registerMatrixAnimation("translate", targetObj, targetObj.position, targetPostion, startTick, params.duration);
				}*/
				_this.registerMatrixAnimation("translate", targetObj, _this.applyAnimationDirection(targetObj.position), targetPostion, startTick, params.duration);
				
				_this._animationList[startTick + params.duration] = [				
					{type: "show_damage", target: "", params:{}},
					
				];
				
				
				var action = _this._currentAnimatedAction.attacked;			
				if(!action.isDestroyed && action.isHit){
					_this._animationList[startTick + params.duration].push({type: "set_damage_text", target: "", params:{}});
					
				}
				if(!action.isDestroyed){
					if(targetObj.spriteConfig.type == "spriter"){
						_this._animationList[startTick + params.duration + 50] = [
							{type: "set_sprite_frame", target: target, params:{name: "hurt_end"}},
						];
					} else {
						_this._animationList[startTick + params.duration + 50] = [
							{type: "set_sprite_frame", target: target, params:{name: "main"}},
						];
					}				
				}			
			}
		},
		destroy: function(target, params){
			var targetObj = getTargetObject(target);
					
			var action = _this._currentAnimatedAction.attacked;
			var entityType = action.isActor ? "actor" : "enemy";
			var entityId = action.ref.SRWStats.pilot.id;
			var battleText = _this._battleTextManager.getText(entityType, action.ref, "destroyed", action.isActor ? "enemy" : "actor", _this.getBattleTextId(_this._currentAnimatedAction));
			_this._UILayerManager.setTextBox(entityType, entityId, action.ref.SRWStats.pilot.name, battleText);
			
			var animId = $statCalc.getBattleSceneInfo(action.ref).deathAnimId;
			if(animId == null){
				animId = ENGINE_SETTINGS.BATTLE_SCENE.DEFAULT_ANIM.DESTROY;
			}
			var animData = _this._animationBuilder.buildAnimation(animId, _this).mainAnimation;
			_this.delayAnimationList(startTick + 1, animData.length);
			Object.keys(animData).forEach(function(tick){
				_this._animationList[startTick * 1 + tick * 1 + 1] = animData[tick];
			});
		},
		show_damage: function(target, params){	
			var originalAction = _this._currentAnimatedAction;
			var action = _this._currentAnimatedAction.attacked;
			var target = action.side;			
			_this._UILayerManager.showDamage(target, originalAction.damageInflicted);
			
			var HPProvider;
			if(action.side == "actor"){
				if(action.type == "support defend"){
					HPProvider = _this._participantInfo.actor_supporter;
				} else {
					HPProvider = _this._participantInfo.actor;
				}				
			} else {
				if(action.type == "support defend"){
					HPProvider = _this._participantInfo.enemy_supporter;
				} else {
					HPProvider = _this._participantInfo.enemy;
				}
			}
			HPProvider.animatedHP-=originalAction.damageInflicted;
		},
		drain_hp_bar: function(target, params){			
			var originalAction = _this._currentAnimatedAction;
			var action = _this._currentAnimatedAction.attacked;
			var target = action.side;
			var stats = $statCalc.getCalculatedMechStats(action.ref);
			if(!_this._barDrainInfo[target]) {
				_this._barDrainInfo[target] = {};
			}	
			if(typeof _this._barDrainInfo[target].HP == "undefined"){
				_this._barDrainInfo[target].HP = 0;
			}
			var HPProvider;
			if(action.side == "actor"){
				if(action.type == "support defend"){
					HPProvider = _this._participantInfo.actor_supporter;
				} else {
					HPProvider = _this._participantInfo.actor;
				}				
			} else {
				if(action.type == "support defend"){
					HPProvider = _this._participantInfo.enemy_supporter;
				} else {
					HPProvider = _this._participantInfo.enemy;
				}
			}
			var totalDamage = Math.min(originalAction.damageInflicted, HPProvider.animatedHP);
			
			var startValue = HPProvider.animatedHP - (_this._barDrainInfo[target].HP /100 * totalDamage);
			var endValue = HPProvider.animatedHP - (params.percent /100 * totalDamage);
			
			var startPercent = (startValue / stats.maxHP * 100);
			var endPercent = (endValue / stats.maxHP * 100);
			if(endPercent < 0){
				endPercent = 0;
			}
			_this._barDrainInfo[target].HP = params.percent;
			_this._UILayerManager.animateHP(target, startPercent, endPercent, params.duration || 500);
		},
		drain_en_bar: function(target, params){			
			var action = _this._currentAnimatedAction;
			if(action.ENUsed != -1){
				var target = action.side;
				var stats = $statCalc.getCalculatedMechStats(action.ref);
				if(!_this._barDrainInfo[target]) {
					_this._barDrainInfo[target] = {};
				}	
				if(typeof _this._barDrainInfo[target].EN == "undefined"){
					_this._barDrainInfo[target].EN = 0;
				}
				var startValue = stats.currentEN;
				var endValue = stats.currentEN - action.ENUsed;
				var startPercent = (startValue / stats.maxEN * 100);
				var endPercent = (endValue / stats.maxEN * 100);
				if(endPercent < 0){
					endPercent = 0;
				}
				_this._barDrainInfo[target].EN = params.percent;
				_this._UILayerManager.animateEN(target, startPercent, endPercent, params.duration || 500);
			}			
		},
		play_se: function(target, params){
			var se = {};
			se.name = params.seId;
			se.pan = 0;
			se.pitch = params.pitch || 100;
			se.volume = params.volume || 100;
			AudioManager.playSe(se);
		},
		kill_se: function(target, params){
			AudioManager.stopSe()
		},
		create_target_environment: function(target, params){
			_this.createEnvironment(_this._currentAnimatedAction.originalTarget.ref);
		},
		show_portrait_noise:  function(target, params){
			_this._UILayerManager.showNoise();
		},
		hide_portrait_noise:  function(target, params){
			_this._UILayerManager.hideNoise();
		},
		set_bg_scroll_ratio:  function(target, params){
			_this.setBgScrollRatio(params.ratio || 0);
		},
		toggle_bg_scroll:  function(target, params){
			_this.setBgScrollDirection(_this._bgScrollDirection * -1);
		}
		
	};
	if(animationHandlers[animation.type] && _this._currentAnimatedAction){
		animationHandlers[animation.type](animation.target, animation.params || {});
	}
}

BattleSceneManager.prototype.startAnimation = function(){
	
	var _this = this;
	_this._runningAnimation	= true;
	_this._lastAnimationTickTime = new Date().getTime();
	_this._currentAnimationTick = 0;
	_this._lastAnimationTick = -1;	
	_this._barDrainInfo = {};
	_this._animationPromise = new Promise(function(resolve, reject){
		_this._animationResolve = resolve;
	});
	return _this._animationPromise;
}

BattleSceneManager.prototype.playIntroAnimation = function(){
	this._animationList = [];
	
	this._animationList[0] = [
		{type: "translate", target: "Camera", params: {startPosition: this._defaultPositions.camera_main_intro, position: this._defaultPositions.camera_main_idle, duration: 15}}
	];
	
	this._animationList[30] = []; //padding
	return this.startAnimation();
}

BattleSceneManager.prototype.mergeAnimList = function(additions){
	var _this = this;
	for(var i = 0; i < additions.length; i++){
		if(additions[i]){
			if(!_this._animationList[i]){
				_this._animationList[i] = [];
			}
			_this._animationList[i] = _this._animationList[i].concat(additions[i]);
		}			
	}
}

BattleSceneManager.prototype.playAttackAnimation = function(cacheRef, attackDef){
	var _this = this;
	//console.log("playAttackAnimation");
	function overwriteAnimList(additions){
		for(var i = 0; i < additions.length; i++){
			if(additions[i]){
				if(!_this._animationList[i]){
					_this._animationList[i] = [];
				}
				_this._animationList[i] = additions[i];
			}			
		}
	}
	this._animationList = [];
	this._animationList = attackDef.mainAnimation;
	if(cacheRef.hits){
		_this.mergeAnimList(attackDef.onHit);
		if(attackDef.onHitOverwrite){
			overwriteAnimList(attackDef.onHitOverwrite);
		}
		if(cacheRef.attacked && cacheRef.attacked.isDestroyed){
			if(cacheRef.type != "support attack" || cacheRef.damageInflicted >= $statCalc.getCalculatedMechStats(cacheRef.attacked.ref).currentHP){			
				//this._animationList = this._animationList.concat(attackDef.onDestroy);
				_this.mergeAnimList(attackDef.onDestroy);
				if(attackDef.onDestroyOverwrite){
					overwriteAnimList(attackDef.onDestroyOverwrite);
				}
			}
		} 	
	} else {
		//this._animationList = this._animationList.concat(attackDef.onMiss);
		_this.mergeAnimList(attackDef.onMiss);
		if(attackDef.onMissOverwrite){
			overwriteAnimList(attackDef.onMissOverwrite);
		}
	}
	return this.startAnimation();
}

BattleSceneManager.prototype.playDefaultAttackAnimation = function(cacheRef){
	var _this = this;
	
	var mainAnimation = {};
	
	mainAnimation[0] = [
		{type: "set_sprite_index", target: "active_main", params: {index: 1}},
		{type: "set_sprite_index", target: "active_target", params: {index: 0}},
		{type: "translate", target: "active_main", params: {startPosition: _this._defaultPositions.ally_main_idle, position: new BABYLON.Vector3(-6, 0, 1), duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
		{type: "translate", target: "Camera", params: {startPosition: _this._defaultPositions.camera_main_idle, position: new BABYLON.Vector3(-4, -0.35, -5), duration: 30, easingFunction: new BABYLON.SineEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEIN}},
		{type: "drain_en_bar", target: "", params: {percent: 100}} //percent of damage inflicted
	];
	mainAnimation[31] = [
		{type: "translate", target: "active_main", params: {startPosition: new BABYLON.Vector3(-6, 0, 1), position: new BABYLON.Vector3(-12, 0, 1), duration: 20}},
	];
	mainAnimation[70] = [
		{type: "next_phase", target: "", params: {commands: [
			{target: "active_main", type: "show_sprite", params: {}},
			{target: "active_target", type: "show_sprite", params: {}},
			{type: "teleport", target: "Camera", params: {position: _this._defaultPositions.camera_main_idle}},			
			{type: "teleport", target: "active_target", params: {position: _this._defaultPositions.enemy_main_idle}},		
		]}},
		//{type: "teleport", target: "active_main", params: {position: new BABYLON.Vector3(6, 0, 0.99)}}, 
		
	];//padding
	
	mainAnimation[130] = [
		{type: "translate", target: "active_main", params: {startPosition: new BABYLON.Vector3(6, 0, 0.99), position: new BABYLON.Vector3(-6, 0, 0.99), duration: 30}}
	];
	
	var onHit = {};
	
	onHit[150] = [
		{type: "set_sprite_index", target: "active_target", params: {index: 3}},
		{type: "translate", target: "active_target", params: {startPosition: _this._defaultPositions.enemy_main_idle, position: new BABYLON.Vector3(-2.7, 0, 1), duration: 4, easingFunction: new BABYLON.QuarticEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
		{type: "spawn_sprite", target: "hit", params: {position: new BABYLON.Vector3(-2, 0, 0.8), path: "effects/Hit1", frameSize: 192, animationFrames: 4, animationDelay: 100, animationLoop: false}},
		{type: "drain_hp_bar", target: "", params: {percent: 100}} //percent of damage inflicted
	];
	onHit[160] = [
		{type: "remove_sprite", target: "hit", params: {}}
	];
	onHit[200] = [
		{type: "reset_position", target: "active_target", params: {duration: 10}}
	];
	
	onHit[300] = [];//padding
	var onMiss = {};
	
	
	onMiss[150] = [
		{type: "dodge_pattern", target: "", params: {commands: [
			{type: "translate", target: "active_target", params: {startPosition: _this._defaultPositions.enemy_main_idle, position: new BABYLON.Vector3(-2.5, 0.5, 1), duration: 4, easingFunction: new BABYLON.QuarticEase(), easingMode: BABYLON.EasingFunction.EASINGMODE_EASEOUT}},
		]}},
	];

	onMiss[200] = [
		{type: "reset_position", target: "active_target", params: {duration: 10}}
	];
	onMiss[300] = [];//padding
	
	var onDestroy = {};
	
	onDestroy[280] = [
		{type: "destroy", target: "active_target", params: {}}
	];
	
	onDestroy[330] = [];//padding*/
	var defaultAttack = {
		mainAnimation: mainAnimation,
		onHit: onHit,
		onMiss: onMiss,
		onDestroy: onDestroy, 
		onDestroyOverwrite: {}
	};
	return this.playAttackAnimation(cacheRef, defaultAttack);
}

BattleSceneManager.prototype.readBattleCache = function() {
	var _this = this;
	_this._noCounter = false;
	_this._actionQueue = [];
	//_this._requiredImages.push("img/basic_battle/test.png");
	_this._participantInfo.actor.participating = false;
	_this._participantInfo.actor_supporter.participating = false;
	_this._participantInfo.enemy.participating = false;
	_this._participantInfo.enemy_supporter.participating = false;
	Object.keys($gameTemp.battleEffectCache).forEach(function(cacheRef){
		var battleEffect = $gameTemp.battleEffectCache[cacheRef];
		
		if(battleEffect.type == "defender" && battleEffect.action.type == "none" && !battleEffect.isDestroyed){
			_this._noCounter = true;
			_this._defenderCache = battleEffect;
		}
		
		_this._actionQueue[battleEffect.actionOrder] = battleEffect;
		battleEffect.currentAnimHP = $statCalc.getCalculatedMechStats(battleEffect.ref).currentHP;
		var imgPath = $statCalc.getBattleSceneImage(battleEffect.ref);
		var imgSize = $statCalc.getBattleSceneImageSize(battleEffect.ref) || _this._defaultSpriteSize;
		var shadowInfo = $statCalc.getBattleSceneShadowInfo(battleEffect.ref);
		var mechStats = $statCalc.getCalculatedMechStats(battleEffect.ref);
		var spriteType = $statCalc.getBattleSceneSpriteType(battleEffect.ref);
		var spriteInfo = {};
		spriteInfo.type = spriteType;
		if(spriteType == "default"){
			spriteInfo.path = imgPath;
			spriteInfo.id = "main";
		} else {			
			spriteInfo.path = imgPath+"/spriter/";
			spriteInfo.id = "idle";
		}
		spriteInfo.referenceSize = $statCalc.getBattleReferenceSize(battleEffect.ref);
		if(battleEffect.side == "actor"){
			if(battleEffect.type == "initiator" || battleEffect.type == "defender"){
				_this._participantInfo.actor.participating = true;
				_this._participantInfo.actor.effect = battleEffect;				
				_this._participantInfo.actor.img = imgPath;
				_this.updateMainSprite("actor", "ally_main", spriteInfo, _this._defaultPositions.ally_main_idle, imgSize, false, shadowInfo);
				_this._participantInfo.actor.tempHP = mechStats.currentHP;
				_this._participantInfo.actor.animatedHP = mechStats.currentHP;
			}
			if(battleEffect.type == "support defend" || battleEffect.type == "support attack"){
				_this._participantInfo.actor_supporter.participating = true;
				_this._participantInfo.actor_supporter.effect = battleEffect;
				_this._participantInfo.actor_supporter.img = imgPath;
				_this.updateMainSprite("actor_supporter", "ally_support", spriteInfo, _this._defaultPositions.ally_support_idle, imgSize, false, shadowInfo);	
				_this._participantInfo.actor_supporter.tempHP = mechStats.currentHP;
				_this._participantInfo.actor_supporter.animatedHP = mechStats.currentHP;
			}
		} else {
			if(battleEffect.type == "initiator" || battleEffect.type == "defender"){
				_this._participantInfo.enemy.participating = true;
				_this._participantInfo.enemy.effect = battleEffect;
				_this._participantInfo.enemy.img = imgPath;
				_this.updateMainSprite("enemy", "enemy_main", spriteInfo, _this._defaultPositions.enemy_main_idle, imgSize, true, shadowInfo);	
				_this._participantInfo.enemy.tempHP = mechStats.currentHP;
				_this._participantInfo.enemy.animatedHP = mechStats.currentHP;
			}
			if(battleEffect.type == "support defend" || battleEffect.type == "support attack"){
				_this._participantInfo.enemy_supporter.participating = true;
				_this._participantInfo.enemy_supporter.effect = battleEffect;
				_this._participantInfo.enemy_supporter.img = imgPath;
				_this.updateMainSprite("enemy_supporter", "enemy_support", spriteInfo, _this._defaultPositions.enemy_support_idle, imgSize, true, shadowInfo);	
				_this._participantInfo.enemy_supporter.tempHP = mechStats.currentHP;
				_this._participantInfo.enemy_supporter.animatedHP = mechStats.currentHP;
			}
		}
			
	});
	if(!_this._actorSupporterSprite){
		_this.updateMainSprite("actor_supporter", "ally_support", "", _this._defaultPositions.ally_support_idle, _this._defaultSpriteSize, false, {});	
	}
	if(!_this._enemySupporterSprite){
		_this.updateMainSprite("enemy_supporter", "enemy_support", "", _this._defaultPositions.enemy_support_idle, _this._defaultSpriteSize, false, {});	
	}
}

BattleSceneManager.prototype.resetSprite = function(mainSprite){
	var _this = this;
	if(mainSprite.sprite.spriteConfig.type == "spriter"){
		mainSprite.renderer.updateAnimation("main");
	}
}

BattleSceneManager.prototype.resetSprites = function() {
	var _this = this;	
	_this.resetSprite(_this._actorSprite);
	_this.resetSprite(_this._enemySprite);
	_this.resetSprite(_this._actorSupporterSprite);
	_this.resetSprite(_this._enemySupporterSprite);	
}

BattleSceneManager.prototype.resetFadeState = function() {
	var newDiv = document.createElement("div");
	newDiv.id = "fade_container";
	newDiv.classList.add("fade_container");
	
	this._fadeContainer.replaceWith(newDiv);
	this._fadeContainer = newDiv;
}

BattleSceneManager.prototype.resetSystemFadeState = function() {
	var newDiv = document.createElement("div");
	newDiv.id = "system_fade_container";
	newDiv.classList.add("fade_container");
	
	this._systemFadeContainer.replaceWith(newDiv);
	this._systemFadeContainer = newDiv;
}

BattleSceneManager.prototype.swipeToBlack = function(direction, inOrOut, holdDuration) {
	var _this = this;
	return new Promise(function(resolve, reject){
		//_this.resetFadeState();
		var swipeClass;
		if(direction == "left"){
			swipeClass = "swipe_left";
		} else {
			swipeClass = "swipe_right";
		}
		_this._swipeBox.className = "";
		_this._swipeBox.classList.add(swipeClass);		
		_this._swipeBox.classList.add(inOrOut);
		_this._swipeBox.addEventListener("animationend", function(){
			setTimeout(resolve, (holdDuration || 0));
		});
	});
}

BattleSceneManager.prototype.fadeToBlack = function(holdDuration) {
	var _this = this;
	return new Promise(function(resolve, reject){
		_this.resetFadeState();
		_this._fadeContainer.classList.add("fade_to_black");
		_this._fadeContainer.style.display = "block";
		_this._fadeContainer.addEventListener("animationend", function(){
			setTimeout(resolve, (holdDuration || 0));
		});
	});	
}

BattleSceneManager.prototype.fadeFromBlack = function() {
	var _this = this;
	return new Promise(function(resolve, reject){
		_this.resetFadeState();
		_this._fadeContainer.classList.add("fade_from_black");
		_this._fadeContainer.style.display = "";
		_this._fadeContainer.addEventListener("animationend", function(){
			resolve();
		});
	});	
}

BattleSceneManager.prototype.systemFadeToBlack = function(duration, holdDuration) {
	var _this = this;
	return new Promise(function(resolve, reject){
		_this.resetSystemFadeState();
		_this._systemFadeContainer.classList.add("fade_to_black");
		_this._systemFadeContainer.style["animation-duration"] = duration;
		_this._systemFadeContainer.addEventListener("animationend", function(){
			setTimeout(resolve, (holdDuration || 0));
		});
	});	
}

BattleSceneManager.prototype.systemFadeFromBlack = function(duration) {
	var _this = this;
	return new Promise(function(resolve, reject){
		_this.resetSystemFadeState();
		_this._systemFadeContainer.classList.add("fade_from_black");
		_this._systemFadeContainer.style["animation-duration"] = duration;
		_this._systemFadeContainer.addEventListener("animationend", function(){
			resolve();
		});
	});	
}

BattleSceneManager.prototype.fadeToWhite = function(holdDuration, fadeSpeed) {
	var _this = this;
	return new Promise(function(resolve, reject){
		_this.resetFadeState();
		
		if(fadeSpeed == "slow"){
			_this._fadeContainer.classList.add("fade_to_white_slow");
		} else {
			_this._fadeContainer.classList.add("fade_to_white");
		}
		
		_this._fadeContainer.addEventListener("animationend", function(){
			setTimeout(resolve, (holdDuration || 0));
		});
	});	
}

BattleSceneManager.prototype.fadeFromWhite = function(fadeSpeed) {
	var _this = this;
	return new Promise(function(resolve, reject){
		_this.resetFadeState();
		if(fadeSpeed == "slow"){
			_this._fadeContainer.classList.add("fade_from_white_slow");
		} else {
			_this._fadeContainer.classList.add("fade_from_white");		
		}
		
		_this._fadeContainer.addEventListener("animationend", function(){
			resolve();
		});
	});	
}

BattleSceneManager.prototype.setBgMode = function(mode) {
	var _this = this;
	_this._bgMode = mode;
	if(!_this._bgsHidden){		
		_this._skyBgs.forEach(function(bg){
			if(_this._bgMode == "sky"){
				bg.isVisible = true;
			} else {
				bg.isVisible = false;
			}
			
		});		
		_this._bgs.forEach(function(bg){
			if(_this._bgMode == "land"){
				//bg.isVisible = true;
				if(bg.originalPos){
					bg.position.y = bg.originalPos.y;
				}
			} else {
				//bg.isVisible = false;
				bg.position.originalPos = new BABYLON.Vector3().copyFrom(bg.position);
				bg.position.y-=($gameSystem.skyBattleOffset || 0);
			} 
		});	

		_this._floors.forEach(function(bg){
			if(_this._bgMode == "land"){
				//bg.isVisible = true;
				if(bg.originalPos){
					bg.position.y = bg.originalPos.y;
				}
			} else {
				//bg.isVisible = false;
				bg.position.originalPos = new BABYLON.Vector3().copyFrom(bg.position);
				bg.position.y-=($gameSystem.skyBattleOffset || 0);
			} 
		});			
	}

	if(_this._bgMode == "sky"){
		_this._actorShadow.isVisible = false;
		_this._enemyShadow.isVisible = false;
		_this._actorSupporterShadow.isVisible = false;
		_this._enemySupporterShadow.isVisible = false;
	} else {
		_this._actorShadow.isVisible = true;
		_this._enemyShadow.isVisible = true;
		_this._actorSupporterShadow.isVisible = true;
		_this._enemySupporterShadow.isVisible = true;
	}	
}

BattleSceneManager.prototype.resetScene = function() {
	var _this = this;
	_this.setBgScrollRatio(1);
	_this._UILayerManager.hideNoise();
	_this._animationList = [];
	_this._matrixAnimations = {};
	_this._sizeAnimations = {};
	_this._shakeAnimations = {};
	_this._bgAnimations = {};	
	_this._fadeAnimations = {};	
	
	
	_this._camera.position = _this._defaultPositions.camera_main_intro;
	_this._camera.rotation = _this._defaultRotations.camera_main_intro;
	if(_this._actorSprite){
		_this._actorSprite.sprite.position.copyFrom(_this._defaultPositions.ally_main_idle);
		_this._actorSprite.wasMoved = false;
		delete _this._actorSprite.sprite.realPosition;
	}
	if(_this._enemySprite){
		_this._enemySprite.sprite.position.copyFrom(_this._defaultPositions.enemy_main_idle);	
		_this._enemySprite.wasMoved = false;
		delete _this._enemySprite.sprite.realPosition;
	}
	if(_this._actorSupporterSprite){
		_this._actorSupporterSprite.sprite.position.copyFrom(_this._defaultPositions.ally_support_idle);
		_this._actorSupporterSprite.wasMoved = false;
		delete _this._actorSupporterSprite.sprite.realPosition;
	}
	if(_this._enemySupporterSprite){
		_this._enemySupporterSprite.sprite.position.copyFrom(_this._defaultPositions.enemy_support_idle);
		_this._enemySupporterSprite.wasMoved = false;
		delete _this._enemySupporterSprite.sprite.realPosition;
	}	
}

BattleSceneManager.prototype.createEnvironment = function(ref){
	var _this = this;
	
	_this._bgs.forEach(function(bg){
		bg.dispose();
	});	
	_this._bgs = [];
	
	_this._fixedBgs.forEach(function(bg){
		bg.dispose();
	});	
	_this._fixedBgs = [];
	
	var bgId = $gameSystem.getUnitSceneBgId(ref);
	
	var environmentDef = _this._environmentBuilder.getDefinition(bgId);
	if(environmentDef){
		var bgs = JSON.parse(JSON.stringify(environmentDef.data.bgs));
		
		var ctr = 0;
		
		bgs.forEach(function(bg){
			if(!bg.hidden){		
				if(bg.isfixed){			
					//_this._fixedBgs.push(_this.createBg("bg"+ctr, bg.path, new BABYLON.Vector3(0, bg.yoffset, bg.zoffset), {width: bg.width, height: bg.height}))
					_this._fixedBgs.push(new BABYLON.Layer("bg"+ctr, "img/SRWBattlebacks/"+bg.path+".png", _this._scene, true));
				} else {
					_this.createScrollingBg("bg"+ctr, bg.path, {width: bg.width, height: bg.height}, bg.yoffset, bg.zoffset);
				}	
			}	
			ctr++;
		});
	}
}	
	


BattleSceneManager.prototype.createScrollingBg = function(id, path, size, yOffset, zOffset){
	var _this = this;
	if(!size){
		size = {
			width: 50,
			height: 25
		};
	}
	
	var amount = Math.floor(400 / (size.width || 400));
	
	var startX = (size.width / 2) * (amount - 1) * -1;
	for(var i = 0; i < amount; i++){
		_this._bgs.push(this.createBg(id + "_" + i, path, new BABYLON.Vector3(startX + (i * size.width), yOffset, zOffset), size));
	}
}

BattleSceneManager.prototype.fadeAndShowScene = function(){
	var _this = this;
	_this.systemFadeToBlack(1, 1000).then(function(){
		_this.showScene();
	});	
}

BattleSceneManager.prototype.getBgPromise = function(bg){	
	return this.getTexturePromise(bg.material.diffuseTexture);
}	

BattleSceneManager.prototype.getTexturePromise = function(texture){
	return new Promise((resolve) => {
		texture.onLoadObservable.add(() => {
			resolve();
		});
	});
}		

BattleSceneManager.prototype.preloadSceneAssets = function(){
	var _this = this;
	
	return new Promise(function(resolve, reject){
		var promises = [];
		
		for(var i = 0; i < _this._actionQueue.length; i++){
			var nextAction = _this._actionQueue[i];
			var attack = nextAction.action.attack;
			
			var animId;
			if(attack && typeof attack.animId != "undefined" && attack.animId != -1){
				animId = attack.animId;
			} else {
				animId = 0;//default
			}
			var preloadCtr = 0;
			function preloadDefaultFrames(ref){
				var defaultFrames = ["main", "in", "out", "hurt", "dodge"];
				if(ref){
					var imgPath = $statCalc.getBattleSceneImage(ref);
					defaultFrames.forEach(function(frame){
						//var bg = _this.createSceneBg((preloadCtr++)+"_preload", imgPath+"/"+frame, new BABYLON.Vector3(0,0,-1000), 1, 1, 0);
						 
						//(bg.material.diffuseTexture.onLoadObservable);
						
						//promises.push(_this.getBgPromise(bg));
						//_this._animationBackgroundsInfo.push(bg);
						var sampleMode;
						if(ENGINE_SETTINGS.BATTLE_SCENE.SPRITES_FILTER_MODE == "TRILINEAR"){
							sampleMode = BABYLON.Texture.TRILINEAR_SAMPLINGMODE
						} else if(ENGINE_SETTINGS.BATTLE_SCENE.SPRITES_FILTER_MODE == "NEAREST"){
							sampleMode = BABYLON.Texture.NEAREST_NEAREST
						}
												
						var texture = new BABYLON.Texture("img/SRWBattleScene/"+imgPath+"/"+frame+".png", _this._scene, false, true, sampleMode);
						promises.push(_this.getTexturePromise(texture));
					});
				}
			}
			
			preloadDefaultFrames(nextAction.ref);
			preloadDefaultFrames(nextAction.originalTarget.ref);
			preloadDefaultFrames(nextAction.attacked.ref);
			
			promises.push(_this.preloadEnvironment(nextAction.ref));
			promises.push(_this.preloadEnvironment(nextAction.originalTarget.ref));
			promises.push(_this.preloadEnvironment(nextAction.attacked.ref));
			
			var animationList = _this._animationBuilder.buildAnimation(animId, _this);
			Object.keys(animationList).forEach(function(animType){
				animationList[animType].forEach(function(batch){
					batch.forEach(function(animCommand){
						var target = animCommand.target;
						var params = animCommand.params;
						if(animCommand.type == "create_bg"){
							var bg = _this.createSceneBg(animCommand.target+"_preload", params.path, new BABYLON.Vector3(0,0,-1000), 1, 1, 0);
							promises.push(_this.getBgPromise(bg));
							_this._animationBackgroundsInfo.push(bg);
						}	
						if(animCommand.type == "set_sprite_animation" || animCommand.type == "set_sprite_frame"){
							var action = nextAction;
							var targetAction = nextAction.attacked;
							
							var battleEffect;
							if(target == "active_main" || target == "active_support_attacker"){
								battleEffect = action;
							} else if(target == "active_target" || target == "active_support_defender"){
								battleEffect = targetAction;
							}								
							
							var imgPath = $statCalc.getBattleSceneImage(battleEffect.ref);
							var bg = _this.createSceneBg(animCommand.target+"_preload", imgPath+"/"+params.name, new BABYLON.Vector3(0,0,-1000), 1, 1, 0);
							promises.push(_this.getBgPromise(bg));
							_this._animationBackgroundsInfo.push(bg);
							
						}
						if(animCommand.type == "create_sky_box"){
							var skybox = BABYLON.MeshBuilder.CreateBox(animCommand.target+"_preload", {size:1000.0}, _this._scene);			
							var skyboxMaterial = new BABYLON.StandardMaterial(animCommand.target+"_material", _this._scene);
							skyboxMaterial.backFaceCulling = false;
							skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("img/skyboxes/"+params.path, _this._scene);
							skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
							skyboxMaterial.diffuseColor = params.color || new BABYLON.Color3(0, 0, 0);
							skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
							skybox.material = skyboxMaterial;
							skybox.isVisible = false;
						}	
						if(animCommand.type == "create_layer"){
							var bg = new BABYLON.Layer(animCommand.target+"_preload", "img/SRWBattleScene/"+params.path+".png", _this._scene, params.isBackground);							
							//promises.push(getPromise(bg));
							//_this._animationBackgroundsInfo.push(bg);
							bg.dispose();														
						}					
					});
				});				
			});		
		}	
		
		Promise.all(promises).then(() => {
			resolve();
		});	
	});
}

BattleSceneManager.prototype.preloadEnvironment = function(ref){
	var _this = this;	
	return new Promise(function(resolve, reject){	
		var bgId = $gameSystem.getUnitSceneBgId(ref);
		var promises = [];
		var environmentDef = _this._environmentBuilder.getDefinition(bgId);
		if(environmentDef){
			var bgs = JSON.parse(JSON.stringify(environmentDef.data.bgs));			
			var ctr = 0;			
			bgs.forEach(function(bg){
				if(!bg.hidden){		
					if(bg.isfixed){			
						//_this._fixedBgs.push(_this.createBg("bg"+ctr, bg.path, new BABYLON.Vector3(0, bg.yoffset, bg.zoffset), {width: bg.width, height: bg.height}))
						var fixedBg = (new BABYLON.Layer("bg"+ctr, "img/SRWBattlebacks/"+bg.path+".png", _this._scene, true));
						fixedBg.dispose();
					} else {
						var bg = _this.createBg("bg"+ctr+"_preload", bg.path, new BABYLON.Vector3(0, 0, -1000), 1, 1);	
						promises.push(_this.getBgPromise(bg));	
					}	
				}	
				ctr++;
			});
		}
		Promise.all(promises).then(resolve);
	});
}

BattleSceneManager.prototype.showScene = function() {
	var _this = this;		
	_this._sceneCanEnd = false;
	_this._sceneIsEnding = false;
	_this._UIcontainer.style.display = "block";	
	_this.readBattleCache();
	_this.resetScene();
	_this.preloadSceneAssets().then(function(){
		setTimeout(finalize, 1000);
	});
		
	function finalize(){
		_this._UILayerManager.resetTextBox();
		if(_this._participantInfo.actor.participating){
			var ref = _this._participantInfo.actor.effect.ref;
			var stats = $statCalc.getCalculatedMechStats(ref);
			_this._UILayerManager.setStat(_this._participantInfo.actor.effect, "HP");
			_this._UILayerManager.setStat(_this._participantInfo.actor.effect, "EN");
		}
		if(_this._participantInfo.enemy.participating){
			var ref = _this._participantInfo.enemy.effect.ref;
			var stats = $statCalc.getCalculatedMechStats(ref);
			_this._UILayerManager.setStat(_this._participantInfo.enemy.effect, "HP");
			_this._UILayerManager.setStat(_this._participantInfo.enemy.effect, "EN");
		}
		
		var firstAction = _this._actionQueue[0];
		var ctr = 1;
		while((!firstAction || !firstAction.hasActed || firstAction.action.type == "defend" || firstAction.action.type == "evade") && ctr < _this._actionQueue.length){
			firstAction = _this._actionQueue[ctr++];
		}
		
		_this.setUpActionSceneState(firstAction);
		_this.createEnvironment(firstAction.ref);
		_this._lastActionWasSupportAttack = false;
		_this._lastActionWasSupportDefend = false;
		_this.systemFadeFromBlack();
		_this._currentAnimatedAction = firstAction;
		
		_this.playIntroAnimation().then(function(){
			_this._sceneCanEnd = true;
			_this.processActionQueue();
		});	
	}
}

BattleSceneManager.prototype.setUpActionSceneState = function(action) {
	var _this = this;
	if(action){	
		_this.resetSprites();
		
		
		_this._bgsHidden = false;
		_this.setBgMode($statCalc.isFlying(action.ref) || $statCalc.getTileType(action.ref) == "space" ? "sky" : "land");
		_this._actorSprite.sprite.material.diffuseTexture.uScale = 1;
		_this._actorSprite.sprite.material.diffuseTexture.vScale = 1;
		_this._enemySprite.sprite.material.diffuseTexture.uScale = -1;
		_this._enemySprite.sprite.material.diffuseTexture.vScale = 1;
		
		_this._actorSupporterSprite.sprite.material.diffuseTexture.uScale = 1;
		_this._actorSupporterSprite.sprite.material.diffuseTexture.vScale = 1;
		_this._enemySupporterSprite.sprite.material.diffuseTexture.uScale = -1;
		_this._enemySupporterSprite.sprite.material.diffuseTexture.vScale = 1;
		
		_this._supportDefenderActive = false;
		_this._supportAttackerActive = false;
		_this._doubleImageActive = false;
		_this._actorSupporterSprite.sprite.setEnabled(false);
		_this._enemySupporterSprite.sprite.setEnabled(false);
		if(action.side == "actor"){
			_this._animationDirection = 1;
			_this.setBgScrollDirection(1, false);
			_this._enemySprite.sprite.setEnabled(false);
			if(action.type == "support attack"){
				_this._lastActionWasSupportAttack = true;
				_this._supportAttackerActive = true;
				_this._actorSprite.sprite.setEnabled(false);
				_this._actorSupporterSprite.sprite.setEnabled(true);
				_this._actorSupporterSprite.sprite.position = _this._defaultPositions.ally_main_idle;
			} else {		
				_this._lastActionWasSupportAttack = false;
				_this._actorSprite.sprite.setEnabled(true);		
				_this._actorSupporterSprite.sprite.position = _this._defaultPositions.ally_support_idle;
			}			
		} else {
			_this._animationDirection = -1;
			_this.setBgScrollDirection(-1, false);	
			_this._actorSprite.sprite.setEnabled(false);
			if(action.type == "support attack"){
				_this._lastActionWasSupportAttack = true;
				_this._supportAttackerActive = true;
				_this._enemySprite.sprite.setEnabled(false);
				_this._enemySupporterSprite.sprite.setEnabled(true);
				_this._enemySupporterSprite.sprite.position = _this._defaultPositions.enemy_main_idle;
			} else {			
				_this._lastActionWasSupportAttack = false;
				_this._enemySprite.sprite.setEnabled(true);	
				_this._enemySupporterSprite.sprite.position = _this._defaultPositions.enemy_support_idle;
			}
		}
		if(action.attacked){
			if(action.attacked.type == "support defend"){
				_this._lastActionWasSupportDefend = true;
			} else {
				_this._lastActionWasSupportDefend = false;
			}
		}
	}
}

BattleSceneManager.prototype.endScene = function() {
	var _this = this;
	if(!_this._sceneIsEnding){
		_this._sceneIsEnding = true;	
		_this.systemFadeToBlack(400, 400).then(function(){			
			_this.stopScene();
			_this._runningAnimation = false;
			_this.disposeAnimationSprites();
			_this.disposeAnimationBackgrounds();
			_this.disposeSpriterBackgrounds();
			_this._animationList = [];
			_this._UIcontainer.style.display = "";
			_this.systemFadeFromBlack(400, 1000).then(function(){
				$gameSystem.setSubBattlePhase('after_battle');
				if(!$gameTemp.editMode){
					SceneManager.resume();
				}			
			});			
		});
	}	
}

BattleSceneManager.prototype.processActionQueue = function() {
	var _this = this;
	if(!_this._actionQueue.length){
		if($gameTemp.debugSceneManager){
			return;
		}
		if(!_this._sceneIsEnding){
			_this._sceneIsEnding = true;
			var endTimer = 1000;
			if(_this._noCounter){
				endTimer = 2000;
				
				var nextAction = _this._defenderCache;
				var entityType = nextAction.isActor ? "actor" : "enemy";
				var entityId = nextAction.ref.SRWStats.pilot.id;				
				
				var battleText = _this._battleTextManager.getText(entityType, nextAction.ref, "no_counter", nextAction.isActor ? "actor" : "enemy", _this.getBattleTextId(nextAction.attacked), null, null);
				
				_this._UILayerManager.setTextBox(entityType, entityId, nextAction.ref.SRWStats.pilot.name, battleText);
			}
			setTimeout(function(){
				_this.systemFadeToBlack(100, 1000).then(function(){					
					_this.stopScene();
					_this._UIcontainer.style.display = "";
					_this.systemFadeFromBlack(1000).then(function(){
						$gameSystem.setSubBattlePhase('after_battle');
						if(!$gameTemp.editMode){
							SceneManager.resume();
						}
					});			
				});		
			}, endTimer);
		}
		
		return;
	} else {	
		var nextAction = _this._actionQueue.shift();		
		while((!nextAction || !nextAction.hasActed || nextAction.action.type == "defend" || nextAction.action.type == "evade" || nextAction.action.type == "none") && _this._actionQueue.length){
			nextAction = _this._actionQueue.shift();
		}
		
		if(nextAction && nextAction.action.type != "defend" && nextAction.action.type != "evade" && nextAction.action.type != "none"){
			if(_this._lastActionWasSupportAttack){// || _this._lastActionWasSupportDefend
				_this.fadeToBlack(700).then(function(){
					continueScene();
					_this.fadeFromBlack();
				});
			} else {
				continueScene();
			}
			
			function continueScene(){			
				_this.setUpActionSceneState(nextAction);			
				var textType = "";
				
				var entityType = nextAction.isActor ? "actor" : "enemy";
				var entityId = nextAction.ref.SRWStats.pilot.id;
				
				var battleText;
				if(nextAction.type == "support attack"){
					battleText = _this._battleTextManager.getText(entityType, nextAction.ref, "support_attack", nextAction.isActor ? "actor" : "enemy", _this.getBattleTextId(nextAction.attacked), null, null, _this.getBattleTextId(nextAction.mainAttacker));
				}
				
				if(!battleText || battleText.text == "..."){
					if(nextAction.type == "initiator"){
						textType = "battle_intro";
					}
					if(nextAction.type == "defender"){
						textType = "retaliate";
					}
					
					battleText = _this._battleTextManager.getText(entityType, nextAction.ref, textType, nextAction.isActor ? "enemy" : "actor", _this.getBattleTextId(nextAction.attacked));
				}
				
				_this._UILayerManager.setTextBox(entityType, entityId, nextAction.ref.SRWStats.pilot.name, battleText);
				if(nextAction.type == "support attack"){
					_this._UILayerManager.setNotification(nextAction.side, "Support Attack");
				}				
				_this._currentAnimatedAction = nextAction;
				if(nextAction.side == "actor"){
					_this._animationDirection = 1;
					//_this.setBgScrollDirection(1, false);
					_this._active_main = _this._actorSprite.sprite;	
					_this._active_support_attacker = _this._actorSupporterSprite.sprite;
					_this._active_support_defender = _this._enemySupporterSprite.sprite;
					_this._active_target = _this._enemySprite.sprite;		
				} else {
					_this._animationDirection = -1;
					//_this.setBgScrollDirection(-1, false);
					_this._active_main = _this._enemySprite.sprite;
					_this._active_support_attacker = _this._enemySupporterSprite.sprite;
					_this._active_support_defender = _this._actorSupporterSprite.sprite;
					_this._active_target = _this._actorSprite.sprite; 
				}
				_this._active_main.barrierSprite.setEnabled(false);
				_this._active_support_attacker.barrierSprite.setEnabled(false);
				_this._active_target.barrierSprite.setEnabled(false);
				_this._active_support_defender.barrierSprite.setEnabled(false);
				if(nextAction.attacked.hasBarrier){
					if(nextAction.attacked.type == "defender" || nextAction.attacked.type == "initiator"){
						_this._active_target.barrierSprite.setEnabled(true);
					} else {
						_this._active_support_defender.barrierSprite.setEnabled(true);
					}
				}
				var attack = nextAction.action.attack;
				setTimeout(function(){
					if(typeof attack.animId != "undefined" && attack.animId != -1){
						_this.playAttackAnimation(nextAction, _this._animationBuilder.buildAnimation(attack.animId, _this)).then(function(){
							_this.processActionQueue();
						});
					} else {
						/*_this.playDefaultAttackAnimation(nextAction).then(function(){
							_this.processActionQueue();
						});*/
						_this.playAttackAnimation(nextAction, _this._animationBuilder.buildAnimation(0, _this)).then(function(){
							_this.processActionQueue();
						});
					}
				}, 1000);		
			}	
		} else {
			_this.processActionQueue();
		}
	}
}

BattleSceneManager.prototype.playBattleScene = function(){
	var _this = this;
	_this.stopScene();
	_this.systemFadeToBlack(200, 1000).then(function(){
		$gameTemp.popMenu = true;//remove before battle menu
		_this.startScene();
		_this.showScene();
	});
}


BattleSceneManager.prototype.pauseAnimations = function() {
	this._animsPaused = true;
}

BattleSceneManager.prototype.startAnimations = function() {
	this._animsPaused = false;
}

BattleSceneManager.prototype.showEnvironmentScene = function() {
	var _this = this;		
	_this._sceneCanEnd = false;
	_this._sceneIsEnding = false;
	_this._UIcontainer.style.display = "block";	
	
	_this.resetScene();		
	_this.setBgScrollDirection(1, true);
	
	if(_this._actorSprite){
		_this._actorSprite.sprite.setEnabled(false);
	}
	if(_this._enemySprite){
		_this._enemySprite.sprite.setEnabled(false);
	}
	if(_this._actorSupporterSprite){
		_this._actorSupporterSprite.sprite.setEnabled(false);
	}
	if(_this._enemySupporterSprite){
		_this._enemySupporterSprite.sprite.setEnabled(false);
	}
	_this._UILayerManager.resetTextBox();
	_this._camera.position.copyFrom(_this._defaultPositions.camera_main_idle);
	_this._camera.rotation.copyFrom(_this._defaultRotations.camera_main_idle);
	_this.stopScene();
	_this.startScene();		
	_this.createEnvironment();
	_this.systemFadeFromBlack();
}

BattleSceneManager.prototype.showText = function(entityType, ref, name, type, subType, target, targetIdx, attackId, supported) {
	var _this = this;
	var battleText = _this._battleTextManager.getText(entityType, ref, type, subType, target, targetIdx, attackId, supported);
	_this._UILayerManager.setTextBox(entityType, ref.actorId, name, battleText);
}