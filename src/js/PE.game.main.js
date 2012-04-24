(function() {
    'use strict';

    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");

    // Debug counters
    var drawFrame = 0;
    var updateFrame = 0;
    var debug = false;

    // Frame control
    var timeCount;
    var lastFrameTime = 0.0;
    var cyclesLeftOver = 0.0;
    var MAXIMUM_FRAME_RATE = 60;
    var MINIMUM_FRAME_RATE = 30;
    var UPDATE_INTERVAL = 1.0 / MAXIMUM_FRAME_RATE;
    var MAX_CYCLES_PER_FRAME = MAXIMUM_FRAME_RATE / MINIMUM_FRAME_RATE;

    var player = new Player(canvas);
    var walls = new Array();
    var smoke = new Array();
    var smokeCounter = 0;
    var smokeFrequency = 1;
    var score = 0;
    var level = 1;
    var levelCounter = 0;
    var levelFrequency = 1000;
    var levelDelay = 0;
    var levelMaxDelay = 200;

    // Game settings
    var gravityDef = 0.20;
    var resistanceDef = 0.02;
    var speedDef = 4;
    var frequencyDef = 60;
    var frequencyCounter = 0;
    var floorDef = 60, ceilingDef = 50;
    var wallMinDef = 50, wallMaxDef = 100;
    var wallsOn = true;
    var gameOn = true;

    var gravity = gravityDef;
    var resistance = resistanceDef;
    var speed = speedDef;
    var frequency = frequencyDef;
    var floor = floorDef;
    var ceiling = ceilingDef;
    var wallMin = wallMinDef;
    var wallMax = wallMaxDef;

    var textGetReady = true;
    var textLevelClear = false;
    var textSpeedIncrease = false;
    var textWallFrequency = false;
    var textBordersLowered = false;
    var textWallSizeIncreased = false;

    // Load images
    var logo = new Image();
    logo.src = "img/policyexpert-logo.png";
    var bg = new Image();
    bg.src = "img/bg.png";

    var wallGradient = context.createLinearGradient(0, 0, canvas.width, 0);
    wallGradient.addColorStop(0.0, '#CD007A');
    wallGradient.addColorStop(1.0, '#403592');

    // Fixed time step control
    function run() {
        var currentTime;
        var updateIterations;
        currentTime = (new Date).getTime();
        updateIterations = ((currentTime - lastFrameTime) + cyclesLeftOver);

        if(updateIterations > 0.0333) //(MAX_CYCLES_PER_FRAME * UPDATE_INTERVAL))
            updateIterations = 0.0333; //(MAX_CYCLES_PER_FRAME * UPDATE_INTERVAL);

        while(updateIterations > UPDATE_INTERVAL) {
            updateIterations -= UPDATE_INTERVAL;

            update();
        }
        cyclesLeftOver = updateIterations;
        lastFrameTime = currentTime;

        draw();
    }

    timeCount = setInterval(run, 1000 / MAXIMUM_FRAME_RATE);

    function update() {
        if (!wallsOn ) {
            levelDelay++;
        }
        if(levelDelay < levelMaxDelay) {
            wallsOn = false;
        } else {
            wallsOn = true;
            textGetReady = false;
            textLevelClear = false;
            textSpeedIncrease = false;
            textWallFrequency = false;
            textBordersLowered = false;
            textWallSizeIncreased = false;

        }
        updateFrame++;
        if(player.alive) {
            score++;
            if(wallsOn) {
                levelCounter++;
            }
            if(levelCounter > levelFrequency) {
                levelDelay = 0;
                wallsOn = false;
                if (walls.length == 0) {
                    nextLevel();
                }
            }
        }

        // Update smoke
        if(player.alive) {
            smokeCounter++;
            if(smokeCounter > smokeFrequency) {
                smokeCounter = 0;
                smoke[smoke.length] = new Exhaust();
            }
        }

        // Check if new wall should be created
        if(wallsOn) {
            frequencyCounter++;
            if(frequencyCounter >= frequency) {
                walls[walls.length] = new Wall(wallMin, wallMax);
                frequencyCounter = 0;
            }
        }

        // Update walls
        for(var wall in walls) {
            walls[wall].update();
        }

        // Update player
        player.update();
        for(var exhaust in smoke) {
            smoke[exhaust].update();
        }

        // Collision
        checkBorderCollision();

        for(var wall in walls) {
            if(rectIntersect(player, walls[wall])) {
                player.destory();
            }
        }

        // Check for interruptions
        if(!player.alive) {
            if(Key.isDown(Key.SPACE)) {
                restart();
            }
        }
        if(Key.isDown(Key.D)) {
            debug = !debug;
        }
    }

    function nextLevel() {
        //setDefaults();
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

    function checkBorderCollision() {
        if(player.currentPositionY < ceiling) {
            player.destroy();
        }
        if(player.currentPositionY + player.sizeY > canvas.height - floor) {
            player.destroy();
        }
    }

    function rectIntersect(arg1, arg2) {
        if(arg1.currentPositionX + arg1.sizeX > arg2.currentPositionX) {
            if(arg1.currentPositionX < arg2.currentPositionX + arg2.sizeX) {
                if(arg1.currentPositionY + arg1.sizeY > arg2.currentPositionY) {
                    if(arg1.currentPositionY < arg2.currentPositionY + arg2.sizeY) {
                        player.destroy();
                    }
                }
            }
        }
    }

    // Utiliy function
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

    // Drawing ***************************************************************************************************************

    function draw() {
        drawFrame++;

        // Clear canvas
        canvas.width = canvas.width;

        // Draw border, background and UI
        context.font = 'bold 20px calibri';
        context.textAlign = "center";
        context.fillStyle = '#E6E6E6';
        context.fillRect(0, 0, canvas.width, canvas.height - floor);
        context.drawImage(logo, 1, canvas.height - 50);
        //context.drawImage(bg, 0, 0);
        //context.fillStyle = '#AA0092';
        context.fillStyle = wallGradient;
        drawBorder();
        context.fillText("Score: " + score + "  Level: " + level, canvas.width / 2, ceiling + 20);
        if(!player.alive) {
            context.fillText("Press SPACE to restart", canvas.width / 2, canvas.height / 2 + 20);
        } else {
            context.fillText("Press the 'up' key to stay in the air", canvas.width / 1.5, canvas.height - floor / 2);
        }

        // Draw walls
        for(var wall in walls) {
            drawRectangle(walls[wall]);
        }

        // Draw text
        drawText();

        // Draw player
        drawImage(player);

        context.fillStyle = '#FFFFFF';
        for(var exhaust in smoke) {
            drawRectangle(smoke[exhaust]);
        }

        if(debug) {
            context.font = 'bold 10px calibri';
            context.textAlign = "left";
            context.fillStyle = '#000000';
            drawDebug();
        }

        context.stroke();
    }

    function drawText() {
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

    function drawTriangle(arg) {
        context.moveTo(arg.currentPositionX, arg.currentPositionY);
        context.lineTo(arg.currentPositionX - (arg.sizeX / 2), arg.currentPositionY + arg.sizeY);
        context.lineTo(arg.currentPositionX + (arg.sizeX / 2), arg.currentPositionY + arg.sizeY);
        context.lineTo(arg.currentPositionX, arg.currentPositionY);
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
    // Classes ****************************************************************************************************************

    function Wall(m, M) {
        this.currentPositionX = canvas.width;
        this.currentPositionY = ceiling + (Math.random() * (canvas.height - floor * 2));
        this.minSize = m;
        this.maxSize = M;
        this.sizeX = 15;
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
        // If UP key is pressed use vertical thruster
        if(Key.isDown(Key.UP) && this.alive) {
            this.currentVelocityY += this.thrustStrengthY;
        }

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
    }

    Player.prototype.destroy = function() {
        this.alive = false;
    }

    function Exhaust() {
        this.sizeX = 2;
        this.sizeY = 2;
        this.currentPositionX = player.currentPositionX;
        this.currentPositionY = player.currentPositionY + player.sizeY - this.sizeY;
    }

    Exhaust.prototype.update = function() {
        this.currentPositionX -= speed;
        this.sizeX += 0.2;
        this.sizeY += 0.2;
        if(this.currentPositionX + this.sizeX < 0) {
            smoke.splice(0, 1);
        }
    }

})();