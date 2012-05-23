function update() {
    if (Game.settings.debug.debugEnabled) { Game.settings.debug.updateFrame++; } // Increase the update cycle counter

    if (shouldANewLevelBeStarted()) {
        if (!Game.settings.levelOn) {
            startLevel();
        }
    } else {
        Game.counters.wallsOn = false; // Don't create any walls when in-between levels
    }

    if (Game.settings.gameOn) {
        updateLevelDelayCounterIfWallsAreOff();

        updateLevelCounterIfPlayerIsAlive();

        updateCoinCounter();

        increaseScoreIfPlayerIsAlive();
    }

    Game.objects.player.update();

    if (isEndOfLevel()) {
        endLevel();
    }

    if (shouldNewWallBeCreated()) {
        createNewWall();
    }

    if (shouldNewCoinBeCreated()) {
        createNewCoin();
    }

    updateWalls();

    updateCoins();

    updateSmoke();

    updateBorders();

    ifGameOffAndUpPressedStartGame();

    ifSpaceBarPressedAndPlayerDeadRestartGame();

    ifDKeyPressedSwitchOnDebugInfoIfDebugEnabled();
}

function updateBorders() {
    if (Game.settings.text.bordersLowered && Game.counters.borderCounter < Game.settings.borderIncrease) {
        Game.counters.borderCounter++;
        Game.settings.floor++;
        Game.settings.ceiling++;
    }
}

function ifGameOffAndUpPressedStartGame() {
    if(Key.isDown(Key.UP) && !Game.settings.gameOn && Game.objects.player.alive) {
        Game.settings.gameOn = true;
    }
}

function updateCoinCounter() {
    Game.counters.coinCounter++;
}

function shouldNewCoinBeCreated() {
    if (Game.counters.coinCounter > Game.settings.coinFrequency) {
        return true;
    }
    return false;
}

function createNewCoin() {
    Game.objects.coins[Game.objects.coins.length] = new Coin();
    Game.counters.coinCounter = 0;
}

function updateLevelDelayCounterIfWallsAreOff() {
    if (!Game.counters.wallsOn ) {
        Game.counters.levelDelay++;
    }
}

function updateLevelCounterIfPlayerIsAlive() {
    if(Game.objects.player.alive) {
        if(Game.counters.wallsOn) {
            Game.counters.levelCounter++;
        }
    }
}

function shouldANewLevelBeStarted() {
    if(Game.counters.levelDelay < Game.settings.levelMaxDelay) {
        return false;
    } else {
        return true;
    }
}

function startLevel() {
    Game.settings.text.getReady = false;
    Game.settings.text.levelClear = false;
    Game.settings.text.speedIncrease = false;
    Game.settings.text.wallFrequency = false;
    Game.settings.text.bordersLowered = false;
    Game.settings.text.wallSizeIncreased = false;
    Game.settings.text.coinsCollected = false;

    Game.counters.levelCoins = 0;
    Game.counters.wallsOn = true;
    Game.settings.levelOn = true;
}

function isEndOfLevel() {
    if(Game.objects.player.alive) {
        if(Game.counters.levelCounter > Game.settings.levelFrequency) {
            Game.counters.levelDelay = 0;
            Game.counters.wallsOn = false;
            if (Game.objects.walls.length == 0) {
                return true;
            }
        }
    }
    return false;
}

function endLevel() {
    Game.counters.levelDelay = 0;
    Game.settings.text.levelClear = true;
    Game.counters.levelCounter = 0;
    Game.counters.level++;
    Game.settings.text.coinsCollected = true;
    Game.settings.levelOn = false;

    pickRandomModifier();
}

function pickRandomModifier() {
    var random = Math.round(Math.random() * 4);
    switch (random) {
        case 1:
            increaseWallFrequency(1.5);
            break;
        case 2:
            increaseBorders();
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
    Game.settings.speed += arg;
    Game.settings.text.speedIncrease = true;
}

function increaseWallFrequency(arg) {
    Game.settings.frequency /= arg;
    Game.settings.text.wallFrequency = true;
}

function increaseBorders() {
    Game.settings.text.bordersLowered = true;
    Game.counters.borderCounter = 0;
}

function increaseWallSize(arg) {
    Game.settings.wallMin += arg;
    Game.settings.wallMax += arg;
    Game.settings.text.wallSizeIncreased = true;
}

function restart() {
    Game.objects.player = new Player(Game.canvas)
    Game.objects.walls = new Array();
    Game.objects.coins = new Array();

    setDefaultGameSettings();

    Game.settings.text.getReady = true;
    Game.settings.text.levelClear = false;
    Game.settings.text.speedIncrease = false;
    Game.settings.text.wallFrequency = false;
    Game.settings.text.bordersLowered = false;
    Game.settings.text.wallSizeIncreased = false;
    Game.counters.level = 1;
    Game.counters.score = 0;
    Game.counters.levelCoins = 0;
    Game.counters.totalCoins = 0;
    Game.counters.distance = 0;
    Game.counters.levelDelay = 0;
    Game.counters.levelCounter = 0;
    Game.counters.mileage = 540;
    Game.settings.mileageX = -100;
    Game.settings.currentMileage = 0;
    Game.settings.gameOn = false;
    Game.settings.levelOn = false;
}

function setDefaultGameSettings() {
    Game.settings.gravity = Game.settings.defaults.gravityDef;
    Game.settings.resistance = Game.settings.defaults.resistanceDef;
    Game.settings.speed = Game.settings.defaults.speedDef;
    Game.settings.frequency = Game.settings.defaults.frequencyDef;
    Game.settings.floor = Game.settings.defaults.floorDef;
    Game.settings.ceiling = Game.settings.defaults.ceilingDef;
    Game.settings.wallMin = Game.settings.defaults.wallMinDef;
    Game.settings.wallMax = Game.settings.defaults.wallMaxDef;
}

function updateWalls() {
    for(var wall in Game.objects.walls) {
        Game.objects.walls[wall].update();
    }
}

function shouldNewWallBeCreated() {
    if(Game.counters.wallsOn) {
        Game.counters.frequencyCounter++;
        if(Game.counters.frequencyCounter >= Game.settings.frequency) {
            return true;
        }
    }
    return false;
}

function createNewWall() {
    Game.objects.walls[Game.objects.walls.length] = new Wall();
    Game.counters.frequencyCounter = 0;
}

function updateSmoke() {
    for(var particle in Game.objects.smoke) {
        Game.objects.smoke[particle].update();
    }

    if (shouldNewSmokeParticleBeCreated()) {
        createNewSmokeParticle();
    }
}

function shouldNewSmokeParticleBeCreated() {
    if(Game.objects.player.alive) {
        Game.counters.smokeCounter++;
        if(Game.counters.smokeCounter > Game.settings.smoke.smokeFrequency) {
            return true;
        }
    }
    return false;
}

function createNewSmokeParticle() {
    Game.counters.smokeCounter = 0;
    Game.objects.smoke[Game.objects.smoke.length] = new SmokeParticle();
}

function isObjectCollidingWithWalls(arg) {
    for(var wall in Game.objects.walls) {
        if(isRectIntersect(arg, Game.objects.walls[wall])) {
            return true;
        }
    }
    return false;
}

function isObjectCollidingWithCeiling(arg) {
    if(arg.currentPositionY < Game.settings.ceiling) {
        return true;
    }
    return false;
}

function isObjectCollidingWithFloor(arg) {
    if(arg.currentPositionY + arg.sizeY > Game.canvas.height - Game.settings.floor) {
        return true;
    }
    return false;
}

function isObjectCollidingWithLeftBoundary(arg) {
    if (arg.currentPositionX < 0) {
        return true;
    }
    return false;
}

function isObjectCollidingWithRightBoundary(arg) {
    if (arg.currentPositionX + arg.sizeX > Game.canvas.width) {
        return true;
    }
    return false;
}

function isRectIntersect(arg1, arg2) {
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
    if(Game.objects.player.alive) {
        Game.counters.score++;
    }
}

function generateYPosition(arg) {
    var derp = Math.random() * (Game.canvas.height - Game.settings.floor - arg.sizeY - Game.settings.ceiling);
    return derp + Game.settings.ceiling;
}

function updateCoins() {
    for(var coin in Game.objects.coins) {
        Game.objects.coins[coin].update();
    }
}

function isObjectOffLeftSideOfScreen(arg) {
    if(arg.currentPositionX + arg.sizeX < 0) {
        return true;
    }
    return false;
}