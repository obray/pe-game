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