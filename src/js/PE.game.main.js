'use strict';

// Variables ***************************************************************************************************************

// Canvas variables
var canvas = document.getElementById("canvas"), context = canvas.getContext("2d");

// Debug
var drawFrame = 0, updateFrame = 0, debug = false, debugEnabled = true;

// Objects
var player = new Player(canvas), walls = new Array(), smoke = new Array();

// Player smoke settings
var smokeFrequency = 1, smokeSize = 2, smokeGrowth = 0.2, smokeMaxSize = 5, smokeColour = '#FFFFFF';

// Game settings
var levelFrequency = 1000, levelMaxDelay = 200, gravityDef = 0.20, resistanceDef = 0.04, speedDef = 4, frequencyDef = 60;
var floorDef = 60, ceilingDef = 50, wallMinDef = 50, wallMaxDef = 100, wallWidth = 15;

// In-game variables
var score = 0, smokeCounter = 0, level = 1, levelCounter = 0, levelDelay = 0, wallsOn = true, frequencyCounter = 0;
var textGetReady = true, textLevelClear = false, textSpeedIncrease = false, textWallFrequency = false;
var textBordersLowered = false, textWallSizeIncreased = false;
var textDefaultColor = '#CD007A', textDefaultFont = 'bold 20px calibri', textDefaultAlign = 'center';

// Initialise game settings
var gravity, resistance, speed, frequency, floor, ceiling, wallMin, wallMax;
setDefaultGameSettings();

// Load image assets and gradients
var logo = new Image(), wallGradient = context.createLinearGradient(0, 0, canvas.width, 0);
loadAssets();

var fps = 60;

// Time step control ***************************************************************************************************************

var run = (function () {
    var loops = 0, skipTicks = 1000 / fps,
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
            setInterval(cb, 1000 / 60);
        }
    }

    window.onEachFrame = onEachFrame;
})();

// Start the game
window.onEachFrame(run);