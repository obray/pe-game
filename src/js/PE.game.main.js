'use strict';

var Game = { };

Game.canvas = document.getElementById("canvas");
Game.context = Game.canvas.getContext("2d");

Game.settings = {
    currentMileage: 0,
    mileageX: -100,
    levelOn: false,
    gameOn: false,
    gravity: 0.2,
    resistance: 0.2,
    speed: 4,
    frequency: 100,
    floor: 100,
    ceiling: 50,
    wallMin: 50,
    wallMax: 100,
    wallWidth: 15,
    levelFrequency: 1000,
    levelMaxDelay: 200,
    coinFrequency: 50,
    borderIncrease: 30,
    buildingFrequency: 1,
    cloudFrequency: 750,
    backgroundColor: '#E6E6E6',
    buildingColor: '#DDDDDD',
    buildingOutlineColor: '#CCCCCC',
    night: false,
    fps: 60,
    debug: {
        drawFrame: 0,
        updateFrame: 0,
        debugOn: false,
        debugEnabled: false
    },
    smoke: {
        smokeFrequency: 1,
        smokeSize: 2,
        smokeGrowth: 0.2,
        smokeMaxSize: 5,
        smokeColour: '#FFFFFF'
    },
    defaults: {
        levelFrequency: 1000,
        coinFrequency: 50,
        levelMaxDelay: 200,
        gravityDef: 0.2,
        resistanceDef: 0.2,
        speedDef: 4,
        frequencyDef: 100,
        floorDef: 100,
        ceilingDef: 50,
        wallMinDef: 50,
        wallMaxDef: 100,
        wallWidthDef: 15,
        borderIncrease: 20,
        buildingFrequency: 1,
        cloudFrequency: 750,
        backgroundColor: '#E6E6E6',
        buildingColor: '#DDDDDD',
        buildingOutlineColor: '#CCCCCC',
        night: false
    },
    textDefaults: {
        colour: '#CD007A',
        font: 'bold 20px sans-serif',
        align: 'center'
    },
    text: {
        getReady: true,
        levelClear: false,
        speedIncrease: false,
        wallFrequency: false,
        bordersLowered: false,
        wallSizeIncreased: false,
        coinsCollected: false
    }
};

Game.objects = {
    player: new Player(),
    walls: new Array(),
    smoke: new Array(),
    coins: new Array(),
    buildings: new Array(),
    clouds: new Array(),
    birds: new Array()
};

Game.counters = {
    score: 0,
    levelCoins: 0,
    totalCoins: 0,
    distance: 0,
    smokeCounter: 0,
    level: 1,
    levelCounter: 0,
    levelDelay: 0,
    wallsOn: true,
    frequencyCounter: 0,
    coinCounter: 0,
    borderCounter: 0,
    mileage: 540,
    building: 0,
    cloud: 0,
    night: 255
};

Game.assets = {
    logo: new Image(),
    wallGradient: Game.context.createLinearGradient(0, 0, Game.canvas.width, 0)
};

loadAssets();

// Time step control ***************************************************************************************************************

var run = (function () {
    var loops = 0, skipTicks = 1000 / Game.settings.fps,
        maxFrameSkip = 10,
        nextGameTick = (new Date).getTime();

    return function () {
        loops = 0;

        while ((new Date).getTime() > nextGameTick && loops < maxFrameSkip) {
            update();
            nextGameTick += skipTicks;
            loops++;
        }

        draw();
    };
})();

// Only draw when there is something to draw
(function () {
    var onEachFrame;
    if (window.webkitRequestAnimationFrame) {
        onEachFrame = function (cb) {
            var _cb = function () {
                cb();
                webkitRequestAnimationFrame(_cb);
            }
            _cb();
        };
    } else if (window.mozRequestAnimationFrame) {
        onEachFrame = function (cb) {
            var _cb = function () {
                cb();
                mozRequestAnimationFrame(_cb);
            }
            _cb();
        };
    } else {
        onEachFrame = function (cb) {
            setInterval(cb, 1000 / Game.settings.fps);
        }
    }

    window.onEachFrame = onEachFrame;
})();

// Start the game
window.onEachFrame(run);