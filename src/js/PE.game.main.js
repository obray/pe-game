(function() {
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

    var run = (function() {
        var loops = 0, skipTicks = 1000 / fps,
            maxFrameSkip = 10,
            nextGameTick = (new Date).getTime();

        return function() {
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
    (function() {
        var onEachFrame;
        if (window.webkitRequestAnimationFrame) {
            onEachFrame = function(cb) {
                var _cb = function() { cb(); webkitRequestAnimationFrame(_cb); }
                _cb();
            };
        } else if (window.mozRequestAnimationFrame) {
            onEachFrame = function(cb) {
                var _cb = function() { cb(); mozRequestAnimationFrame(_cb); }
                _cb();
            };
        } else {
            onEachFrame = function(cb) {
                setInterval(cb, 1000 / 60);
            }
        }

        window.onEachFrame = onEachFrame;
    })();

    // Start the game
    window.onEachFrame(run);

    // Main game functions ***************************************************************************************************************

    function update() {
        if (debugEnabled) { updateFrame++; } // Increase the update cycle counter

        if (shouldANewLevelBeStarted()) {
            startLevel();
        } else {
            wallsOn = false; // Don't create any walls when in-between levels
        }

        updateLevelDelayCounterIfWallsAreOff();

        updateLevelCounterIfPlayerIsAlive();

        player.update();

        increaseScoreIfPlayerIsAlive();

        if (isEndOfLevel()) {
            endLevel();
        }

        if (shouldNewWallBeCreated()) {
            createNewWall();
        }

        updateWalls();

        updateSmoke();

        ifSpaceBarPressedAndPlayerDeadRestartGame();

        ifDKeyPressedSwitchOnDebugInfoIfDebugEnabled();
    }

    function draw() {
        if (debugEnabled) { drawFrame++; } // Increase the draw cycle counter

        canvas.width = canvas.width; // Clear the canvas

        drawBackground();

        drawBorder();

        drawWalls();

        drawAllText();

        drawImage(player);

        drawSmoke();

        if (debug) {
            drawDebugInfo();
        }

        context.stroke(); // Update the canvas
    }

    // Update functions ***************************************************************************************************************

    function updateLevelDelayCounterIfWallsAreOff() {
        if (!wallsOn ) {
            levelDelay++;
        }
    }

    function updateLevelCounterIfPlayerIsAlive() {
        if(player.alive) {
            if(wallsOn) {
                levelCounter++;
            }
        }
    }

    function shouldANewLevelBeStarted() {
        if(levelDelay < levelMaxDelay) {
            return false;
        } else {
            return true;
        }
    }

    function startLevel() {
        wallsOn = true;
        textGetReady = false;
        textLevelClear = false;
        textSpeedIncrease = false;
        textWallFrequency = false;
        textBordersLowered = false;
        textWallSizeIncreased = false;
    }

    function isEndOfLevel() {
        if(player.alive) {
            if(levelCounter > levelFrequency) {
                levelDelay = 0;
                wallsOn = false;
                if (walls.length == 0) {
                    return true;
                }
            }
        }
        return false;
    }

    function endLevel() {
        levelDelay = 0;
        textLevelClear = true;
        levelCounter = 0;
        level++;

        pickRandomModifier();
    }

    function pickRandomModifier() {
        var random = Math.round(Math.random() * 4);
        switch (random) {
            case 1:
                increaseWallFrequency(1.5);
                break;
            case 2:
                increaseBorders(30);
                break;
            case 3:
                increaseWallSize(30);
                break;
            default:
                increaseSpeed(1);
                break;
        }
    }

    function increaseSpeed(arg) {
        speed += arg;
        textSpeedIncrease = true;
    }

    function increaseWallFrequency(arg) {
        frequency /= arg;
        textWallFrequency = true;
    }

    function increaseBorders(arg) {
        floor += arg;
        ceiling += arg;
        textBordersLowered = true;
    }

    function increaseWallSize(arg) {
        wallMin += arg;
        wallMax += arg;
        textWallSizeIncreased = true;
    }

    function restart() {
        player = new Player(canvas)
        walls = new Array();
        setDefaultGameSettings();
        textGetReady = true;
        textLevelClear = false;
        textSpeedIncrease = false;
        textWallFrequency = false;
        textBordersLowered = false;
        textWallSizeIncreased = false;
        level = 1;
        score = 0;
        levelDelay = 0;
        levelCounter = 0;
    }

    function setDefaultGameSettings() {
        gravity = gravityDef;
        resistance = resistanceDef;
        speed = speedDef;
        frequency = frequencyDef;
        floor = floorDef;
        ceiling = ceilingDef;
        wallMin = wallMinDef;
        wallMax = wallMaxDef;
    }

    function updateWalls() {
        for(var wall in walls) {
            walls[wall].update();
        }
    }

    function shouldNewWallBeCreated() {
        if(wallsOn) {
            frequencyCounter++;
            if(frequencyCounter >= frequency) {
                return true;
            }
        }
        return false;
    }

    function createNewWall() {
        walls[walls.length] = new Wall(wallMin, wallMax);
        frequencyCounter = 0;
    }

    function updateSmoke() {
        for(var exhaust in smoke) {
            smoke[exhaust].update();
        }

        if (shouldNewSmokeParticleBeCreated()) {
            createNewSmokeParticle();
        }
    }

    function shouldNewSmokeParticleBeCreated() {
        if(player.alive) {
            smokeCounter++;
            if(smokeCounter > smokeFrequency) {
                return true;
            }
        }
        return false;
    }

    function createNewSmokeParticle() {
        smokeCounter = 0;
        smoke[smoke.length] = new SmokeParticle();
    }

    function isPlayerCollidingWithAnything() {
        if (isObjectCollidingWithBorder(player) || isObjectCollidingWithWalls(player)) {
            return true
        }
        return false;
    }

    function isObjectCollidingWithWalls(arg) {
        for(var wall in walls) {
            if(rectIntersect(arg, walls[wall])) {
                return true;
            }
        }
        return false;
    }

    function isObjectCollidingWithBorder(arg) {
        if(arg.currentPositionY < ceiling) {
            return true;
        }
        if(arg.currentPositionY + arg.sizeY > canvas.height - floor) {
            return true;
        }
        return false;
    }

    function rectIntersect(arg1, arg2) {
        if(arg1.currentPositionX + arg1.sizeX > arg2.currentPositionX) {
            if(arg1.currentPositionX < arg2.currentPositionX + arg2.sizeX) {
                if(arg1.currentPositionY + arg1.sizeY > arg2.currentPositionY) {
                    if(arg1.currentPositionY < arg2.currentPositionY + arg2.sizeY) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function checkCap(pos, arg, cap) {
        if(pos) {
            if(arg > cap) {
                arg = cap;
            }
        } else {
            if(arg < -cap) {
                arg = -cap;
            }
        }
        return arg;
    }

    function increaseScoreIfPlayerIsAlive() {
        if(player.alive) {
            score++;
        }
    }

    // Drawing functions ***************************************************************************************************************

    function loadAssets() {
        // Load images
        logo.src = "img/policyexpert-logo.png";

        // Load gradient
        wallGradient.addColorStop(0.0, '#CD007A');
        wallGradient.addColorStop(1.0, '#403592');
    }

    function drawBackground() {
        // Colour background in grey
        context.fillStyle = '#E6E6E6';
        context.fillRect(0, 0, canvas.width, canvas.height - floor);

        // Draw policy expert logo
        context.drawImage(logo, 1, canvas.height - 50);
    }

    function drawImage(arg) {
        if(arg.alive) {
            context.drawImage(arg.image, arg.currentPositionX, arg.currentPositionY, arg.sizeX, arg.sizeY);
        } else {
            context.drawImage(arg.deathImage, arg.currentPositionX, arg.currentPositionY, arg.sizeX, arg.sizeY);
        }
    }

    function drawWalls() {
        context.fillStyle = wallGradient;
        context.strokeStyle = '#000000';
        for(var wall in walls) {
            drawRectangle(walls[wall]);
        }
    }

    function drawBorder() {
        context.fillStyle = wallGradient;
        context.fillRect(0, ceiling, canvas.width, -10);
        context.fillRect(0, canvas.height - floor, canvas.width, 10);
    };

    function drawSmoke() {
        for(var exhaust in smoke) {
            context.fillStyle = smoke[exhaust].smokeColour;
            drawCircle(smoke[exhaust]);
        }
    }

    function drawRectangle(arg) {
        context.fillRect(arg.currentPositionX, arg.currentPositionY, arg.sizeX, arg.sizeY);
        context.strokeRect(arg.currentPositionX, arg.currentPositionY, arg.sizeX, arg.sizeY);
    }

    function drawCircle(arg) {
        context.fillStyle = arg.smokeColour;
        context.strokeStyle = arg.smokeColour;
        context.beginPath();
        context.arc(arg.currentPositionX, arg.currentPositionY, arg.size, 0, Math.PI * 2, false);
        context.closePath();
        context.fill();
    }

    function drawAllText() {
        useTextDefaults();

        drawScore();

        drawHint();

        if(textGetReady) {
            drawCenterText("Get Ready!");
        }
        if(textLevelClear) {
            drawText("Level Clear", 0, 20);
        }
        if(textSpeedIncrease) {
            drawCenterText("Speed +");
        }
        if(textWallFrequency) {
            drawCenterText("Wall frequency +");
        }
        if(textBordersLowered) {
            drawCenterText("Borders +");
        }
        if(textWallSizeIncreased) {
            drawCenterText("Wall Size +");
        }
    }

    function drawText(arg, argX, argY) {
        context.fillText(arg, canvas.width / 2 + argX, canvas.height / 2 + argY);
    }

    function drawCenterText(arg) {
        context.fillText(arg, canvas.width / 2, canvas.height / 2);
    }

    function drawScore() {
        context.fillStyle = textDefaultColor;
        context.fillText("Score: " + score + "  Level: " + level, canvas.width / 2, ceiling + 20);
    }

    function drawHint() {
        if(!player.alive) {
            context.fillText("Press SPACE to restart", canvas.width / 2, canvas.height / 2 + 20);
        } else {
            context.fillText("Press the 'up' arrow key to stay in the air", canvas.width / 1.5, canvas.height - floor / 2);
            context.fillText("and move side to side with 'left' and 'right' arrow keys", canvas.width / 1.5, canvas.height - floor / 2 + 20);
        }
    }

    function useTextDefaults() {
        context.font = textDefaultFont;
        context.textAlign = textDefaultAlign;
        context.fillStyle = textDefaultColor;
    }

    function drawDebugInfo() {
        context.font = 'bold 10px calibri';
        context.textAlign = "left";
        context.fillStyle = '#000000';
        context.fillText("u: " + updateFrame, 10, 20);
        context.fillText("d: " + drawFrame, 10, 30);
        context.fillText("x: " + player.currentPositionX + "  Vx: " + player.currentVelocityX, 10, 40);
        context.fillText("y: " + player.currentPositionY + "  Vy: " + player.currentVelocityY, 10, 50);
        context.fillText("a: " + player.alive, 10, 70);
        context.fillText("w: " + walls.length, 10, 80);
        context.fillText("fq: " + frequency + " / " + frequencyCounter, 400, 20);
        context.fillText("s: " + speed, 400, 30);
        context.fillText("g: " + gravity + "  r: " + resistance, 400, 40);
        context.fillText("c: " + ceiling + "  f: " + floor, 400, 50);
        context.fillText("m: " + wallMin + "  M: " + wallMax, 400, 60);
        context.fillText("sm: " + smoke.length, 400, 70);
    }

    // Keyboard control ******************************************************************************************************

    var Key = {
        _pressed : {},

        LEFT : 37,
        UP : 38,
        RIGHT : 39,
        DOWN : 40,
        CONTROL : 17,
        SPACE : 32,
        D : 68,

        isUp : function(keyCode) {
            return this._pressed[keyCode];
        },
        isDown : function(keyCode) {
            return this._pressed[keyCode];
        },
        onKeydown : function(event) {
            this._pressed[event.keyCode] = true;
        },
        onKeyup : function(event) {
            delete this._pressed[event.keyCode];
        }
    };

    window.addEventListener('keyup', function(event) {
        Key.onKeyup(event);
    }, false);
    window.addEventListener('keydown', function(event) {
        Key.onKeydown(event);
    }, false);

    function ifSpaceBarPressedAndPlayerDeadRestartGame() {
        if(!player.alive) {
            if(Key.isDown(Key.SPACE)) {
                restart();
            }
        }
    }

    function ifDKeyPressedSwitchOnDebugInfoIfDebugEnabled() {
        if (debugEnabled) {
            if(Key.isDown(Key.D)) {
                debug = !debug;
           }
        }
    }

    // Classes ****************************************************************************************************************

    // Wall Class ****************************************************************************************************************

    function Wall(m, M) {
        this.currentPositionX = canvas.width;
        this.currentPositionY;
        this.minSize = m;
        this.maxSize = M;
        this.sizeX = wallWidth;
        this.sizeY;

        this.generateWall();
    }

    Wall.prototype.generateWall = function() {
        this.sizeY = this.generateSize();

        this.currentPositionY = this.generatePosition();
    }

    Wall.prototype.generatePosition = function() {
        var derp = Math.random() * (canvas.height - floor - this.sizeY - ceiling);
        return derp + ceiling;

    }

    Wall.prototype.generateSize = function() {
        return this.minSize + Math.random() * this.maxSize;
    }

    Wall.prototype.update = function() {
        this.updatePosition();

        if(this.isWallOffLeftSideOfScreen()) {
            this.destroyWall();
        }
    }

    Wall.prototype.updatePosition = function() {
        this.currentPositionX -= speed;
    }

    Wall.prototype.isWallOffLeftSideOfScreen = function() {
        if(this.currentPositionX + this.sizeX < 0) {
            return true;
        }
        return false;
    }

    Wall.prototype.destroyWall = function() {
        walls.splice(0, 1);
    }

    // Player Class ****************************************************************************************************************

    function Player(canvas) {
        this.sizeX = 40;
        this.sizeY = 80;
        this.thrustStrengthX = 0.1;
        this.thrustStrengthY = 0.5;
        this.maxThrustX = 1;
        this.maxThrustY = 6;
        this.maxVelocityX = 5;
        this.maxVelocityY = 10;

        this.currentPositionX = canvas.width / 3;
        this.currentPositionY = this.sizeY * 2;
        this.currentVelocityX = 0;
        this.currentVelocityY = 0;
        this.alive = true;

        this.image = new Image();
        this.image.src = "img/bungalow.png";
        this.deathImage = new Image();
        this.deathImage.src = "img/bungalow-death.png";
    }

    Player.prototype.update = function() {

        this.checkThrustLimits();

        this.applyGravity();

        this.applyAirResistance();

        this.updateVelocityAndSmoke();

        this.checkVelocityLimits();

        this.updatePosition();

        if (isPlayerCollidingWithAnything()) {
            this.destroy();
        }
    }

    Player.prototype.updateVelocityAndSmoke = function() {
        if (this.alive) {
            // If UP key is pressed use vertical thruster
            if(Key.isDown(Key.UP)) {
                this.currentVelocityY += this.thrustStrengthY;
                smokeSize = 1, smokeGrowth = 0.2;
                smokeFrequency = 2, smokeMaxSize = 20;
                smokeColour = '#D9D9D9';
            }

            if(Key.isDown(Key.LEFT)) {
                this.currentVelocityX += this.thrustStrengthX;
                smokeSize = 1, smokeGrowth = 0.1;
                smokeFrequency = 10, smokeMaxSize = 10;
                smokeColour = '#FFFFFF';
            }

            if(Key.isDown(Key.RIGHT)) {
                this.currentVelocityX -= this.thrustStrengthX;
                smokeSize = 1, smokeGrowth = 0.2;
                smokeFrequency = 2, smokeMaxSize = 20;
                smokeColour = '#D9D9D9';
            }

            if (!Key.isDown(Key.UP) && !Key.isDown(Key.LEFT) && !Key.isDown(Key.RIGHT)) {
                smokeSize = 1, smokeGrowth = 0.1;
                smokeFrequency = 5, smokeMaxSize = 10;
                smokeColour = '#FFFFFF';
            }
        }
    }

    Player.prototype.updatePosition = function() {
        this.currentPositionX -= this.currentVelocityX;
        this.currentPositionY -= this.currentVelocityY;
    }

    Player.prototype.checkThrustLimits = function() {
        this.thrustStrengthY = checkCap(true, this.thrustStrengthY, this.maxThrustY);
        this.thrustStrengthY = checkCap(false, this.thrustStrengthY, this.maxThrustY);

        this.thrustStrengthX = checkCap(true, this.thrustStrengthX, this.maxThrustX);
        this.thrustStrengthX = checkCap(false, this.thrustStrengthX, this.maxThrustX);
    }

    Player.prototype.checkVelocityLimits = function() {
        this.currentVelocityY = checkCap(true, this.currentVelocityY, this.maxVelocityY);
        this.currentVelocityY = checkCap(false, this.currentVelocityY, this.maxVelocityY);

        this.currentVelocityX = checkCap(true, this.currentVelocityX, this.maxVelocityX);
        this.currentVelocityX = checkCap(false, this.currentVelocityX, this.maxVelocityX);
    }

    Player.prototype.applyGravity = function() {
        this.currentVelocityY -= gravity;
    }

    Player.prototype.applyAirResistance = function() {
        if (this.currentVelocityX < 0) {
            this.currentVelocityX += resistance;
        }
        if (this.currentVelocityX > 0) {
            this.currentVelocityX -= resistance;
        }
    }

    Player.prototype.destroy = function() {
        this.alive = false;
    }

    // Smoke Class ****************************************************************************************************************

    function SmokeParticle() {
        this.size = smokeSize;
        this.smokeGrowth = smokeGrowth;
        this.smokeMaxSize = smokeMaxSize;
        this.smokeColour = smokeColour;
        this.currentPositionX = player.currentPositionX;
        this.currentPositionY = player.currentPositionY + player.sizeY - this.size;
    }

    SmokeParticle.prototype.update = function() {
        this.moveAndGrowSmokeParticle();

        if (this.isMaxSizeReached()) {
           this.stopSmokeGrowing();
        }

        if(this.isSmokeParticleOffLeftSideOfScreen()) {
            this.destroySmokeParticle();
        }
    }

    SmokeParticle.prototype.moveAndGrowSmokeParticle = function() {
        this.currentPositionX -= speed;
        this.size += this.smokeGrowth;
    }

    SmokeParticle.prototype.isSmokeParticleOffLeftSideOfScreen = function() {
        if(this.currentPositionX + this.size < 0) {
            return true;
        }
        return false;
    }

    SmokeParticle.prototype.destroySmokeParticle = function() {
        smoke.splice(0, 1);
    }

    SmokeParticle.prototype.isMaxSizeReached = function() {
        if (this.size > this.smokeMaxSize) {
            return true;
        }
        return false;
    }

    SmokeParticle.prototype.stopSmokeGrowing = function() {
        this.size = this.smokeMaxSize;
        this.smokeGrowth = 0;
    }

})();