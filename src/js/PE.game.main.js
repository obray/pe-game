(function() {
    'use strict';

    // Initialise canvas variables
    var canvas = document.getElementById("canvas"), context = canvas.getContext("2d");

    // Debug
    var drawFrame = 0, updateFrame = 0, debug = false, debugEnabled = true;

    // Objects
    var player = new Player(canvas), walls = new Array(), smoke = new Array();

    // Player smoke settings
    var smokeFrequency = 1, smokeSizeX = 2, smokeSizeY = 2, smokeGrowthX = 0.2, smokeGrowthY = 0.2, smokeColour = '#FFFFFF';

    // Game settings
    var levelFrequency = 1000, levelMaxDelay = 200, gravityDef = 0.20, resistanceDef = 0.02, speedDef = 4, frequencyDef = 60;
    var frequencyCounter = 0, floorDef = 60, ceilingDef = 50, wallMinDef = 50, wallMaxDef = 100, wallWidth = 15;

    // In-game variables
    var score = 0, smokeCounter = 0, level = 1, levelCounter = 0, levelDelay = 0, wallsOn = true, textGetReady = true;
    var textLevelClear = false, textSpeedIncrease = false, textWallFrequency = false, textBordersLowered = false, textWallSizeIncreased = false;

    // Initialise game settings
    var gravity, resistance, speed, frequency, floor, ceiling, wallMin, wallMax;
    setDefaults();

    // Load image assets and gradients
    var logo = new Image(), wallGradient = context.createLinearGradient(0, 0, canvas.width, 0);
    loadAssets();

    var fps = 60;

    // Variable time step loop
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

    function update() {
        if (debugEnabled) { updateFrame++; }// Increase the update cycle counter

        if (shouldANewLevelBeStarted()) {
            startLevel();
        } else {
            wallsOn = false; // Don't create any walls when in-between levels
        }

        updateLevelDelayCounterIfWallsAreOff();

        updateLevelCounterIfPlayerIsAlive();

        if (isEndOfLevel()) {
            endLevel();
        }

        if (shouldNewWallBeCreated()) {
            createNewWall();
        }

        updateWalls();

        player.update();

        updateSmoke();

        increaseScoreIfPlayerIsAlive();

        ifSpaceBarPressedAndPlayerDeadRestartGame();

        ifDKeyPressedSwitchOnDebugInfoIfDebugEnabled();
    }

    function draw() {
        if (debugEnabled) { drawFrame++;} // Increase the draw cycle counter

        canvas.width = canvas.width; // Clear the canvas

        drawBackground();

        drawBorder();

        drawWalls();

        drawText();

        drawImage(player);

        drawSmoke();

        drawDebugInfo();

        context.stroke(); // Update the canvas
    }

    // Update functions ***************************************************************************************************************

    function updateLevelDelayCounterIfWallsAreOff() {
        if (!wallsOn ) {
            levelDelay++;
        }
    }

    function shouldANewLevelBeStarted() {
        if(levelDelay < levelMaxDelay) {
            return false;
        } else {
            return true;
        }
    }

    function updateLevelCounterIfPlayerIsAlive() {
        if(player.alive) {
            if(wallsOn) {
                levelCounter++;
            }
        }
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

    function startLevel() {
        wallsOn = true;
        textGetReady = false;
        textLevelClear = false;
        textSpeedIncrease = false;
        textWallFrequency = false;
        textBordersLowered = false;
        textWallSizeIncreased = false;
    }

    function endLevel() {
        levelDelay = 0;
        textLevelClear = true;
        levelCounter = 0;
        level++;

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

    function setDefaults() {
        gravity = gravityDef;
        resistance = resistanceDef;
        speed = speedDef;
        frequency = frequencyDef;
        floor = floorDef;
        ceiling = ceilingDef;
        wallMin = wallMinDef;
        wallMax = wallMaxDef;
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
        setDefaults();
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

    function isPlayerCollidingWithAnything() {
        if (isPlayerCollidingWithBorder() || isPlayerCollidingWithWalls()) {
            return true
        }
        return false;
    }

    function isPlayerCollidingWithWalls() {
        for(var wall in walls) {
            if(rectIntersect(player, walls[wall])) {
                return true;
            }
        }
        return false;
    }

    function isPlayerCollidingWithBorder() {
        if(player.currentPositionY < ceiling) {
            return true;
        }
        if(player.currentPositionY + player.sizeY > canvas.height - floor) {
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

    function drawDebugInfo() {
        if(debug) {
            context.font = 'bold 10px calibri';
            context.textAlign = "left";
            context.fillStyle = '#000000';
            drawDebug();
        }
    }

    function drawWalls() {
        context.fillStyle = wallGradient;
        for(var wall in walls) {
            drawRectangle(walls[wall]);
        }
    }

    function drawSmoke() {
        context.fillStyle = smokeColour;
        for(var exhaust in smoke) {
            drawRectangle(smoke[exhaust]);
        }
    }

    function drawBackground() {
        // Colour background in grey
        context.fillStyle = '#E6E6E6';
        context.fillRect(0, 0, canvas.width, canvas.height - floor);

        // Draw policy expert logo
        context.drawImage(logo, 1, canvas.height - 50);
    }

    function drawText() {
        context.font = 'bold 20px calibri';
        context.textAlign = "center";
        context.fillStyle = '#CD007A';

        context.fillText("Score: " + score + "  Level: " + level, canvas.width / 2, ceiling + 20);

        if(!player.alive) {
            context.fillText("Press SPACE to restart", canvas.width / 2, canvas.height / 2 + 20);
        } else {
            context.fillText("Press the 'up' key to stay in the air", canvas.width / 1.5, canvas.height - floor / 2);
        }

        if(textGetReady) {
            context.fillText("Get Ready!", canvas.width / 2, canvas.height / 2);
        }
        if(textLevelClear) {
            context.fillText("Level Clear", canvas.width / 2, canvas.height / 2 - 20);
        }
        if(textSpeedIncrease) {
            context.fillText("Speed +", canvas.width / 2, canvas.height / 2);
        }
        if(textWallFrequency) {
            context.fillText("Wall frequency +", canvas.width / 2, canvas.height / 2);
        }
        if(textBordersLowered) {
            context.fillText("Borders +", canvas.width / 2, canvas.height / 2);
        }
        if(textWallSizeIncreased) {
            context.fillText("Wall Size +", canvas.width / 2, canvas.height / 2);
        }
    }

    function drawImage(arg) {
        if(arg.alive) {
            context.drawImage(arg.image, arg.currentPositionX, arg.currentPositionY, arg.sizeX, arg.sizeY);
        } else {
            context.drawImage(arg.deathImage, arg.currentPositionX, arg.currentPositionY, arg.sizeX, arg.sizeY);
        }
    }

    function drawRectangle(arg) {
        context.fillRect(arg.currentPositionX, arg.currentPositionY, arg.sizeX, arg.sizeY);
    }

    function drawDebug() {
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
    };

    function drawBorder() {
        context.fillStyle = wallGradient;
        context.fillRect(0, ceiling, canvas.width, -10);
        context.fillRect(0, canvas.height - floor, canvas.width, 10);
    };

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

    function Wall(m, M) {
        this.currentPositionX = canvas.width;
        this.currentPositionY = ceiling + (Math.random() * (canvas.height - floor * 2));
        this.minSize = m;
        this.maxSize = M;
        this.sizeX = wallWidth;
        this.sizeY = this.minSize + Math.random() * this.maxSize;

        if(this.currentPositionY < ceiling) {
            this.currentPositionY = ceiling;
        }
        if(this.currentPositionY + this.sizeY > canvas.height - floor) {
            this.currentPositionY = canvas.height - floor - this.sizeY;
        }
    }

    Wall.prototype.update = function() {
        this.currentPositionX -= speed;
        if(this.currentPositionX + this.sizeX < 0) {
            walls.splice(0, 1);
        }
    }

    function Player(canvas) {
        this.sizeX = 40;
        this.sizeY = 80;
        this.thrustStrengthY = 0.6;
        this.maxThrustY = 6;
        this.maxVelocityX = 10;
        this.maxVelocityY = 10;

        this.currentPositionX = canvas.width / 3;
        this.currentPositionY = this.sizeY * 2;
        this.currentVelocityX = 0;
        this.currentVelocityY = 0;
        this.currentYThrust = 0;
        this.alive = true;

        this.image = new Image();
        this.image.src = "img/bungalow.png";
        this.deathImage = new Image();
        this.deathImage.src = "img/bungalow-death.png";
    }

    Player.prototype.update = function() {

        // Check if maximum thrust level has been reached and cap
        this.thrustStrength = checkCap(true, this.thrustStrengthY, this.maxThrustY);
        this.thrustStrength = checkCap(false, this.thrustStrengthY, this.maxThrustY);

        // Apply gravity
        this.currentVelocityY -= gravity;

        // Check if maximum vertical velocity has been reached and cap
        this.currentVelocityY = checkCap(true, this.currentVelocityY, this.maxVelocityY);
        this.currentVelocityY = checkCap(false, this.currentVelocityY, this.maxVelocityY);

        this.currentPositionX -= this.currentVelocityX;
        this.currentPositionY -= this.currentVelocityY;

        if (player.alive) {
            // If UP key is pressed use vertical thruster
            if(Key.isDown(Key.UP) && player.alive) {
                player.currentVelocityY += player.thrustStrengthY;
            }

            if (isPlayerCollidingWithAnything()) {
                player.destroy();
            }
        }
    }

    Player.prototype.destroy = function() {
        this.alive = false;
    }

    function SmokeParticle() {
        this.sizeX = smokeSizeX;
        this.sizeY = smokeSizeY;
        this.currentPositionX = player.currentPositionX;
        this.currentPositionY = player.currentPositionY + player.sizeY - this.sizeY;
    }

    SmokeParticle.prototype.update = function() {
        this.currentPositionX -= speed;
        this.sizeX += smokeGrowthX;
        this.sizeY += smokeGrowthY;
        if(this.currentPositionX + this.sizeX < 0) {
            smoke.splice(0, 1);
        }
    }

})();