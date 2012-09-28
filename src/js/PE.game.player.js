function Player() {
    this.sizeX = 40;
    this.sizeY = 80;
    this.thrustStrengthX = 0.375;
    this.thrustStrengthY = 0.70;
    this.maxVelocityX = 10;
    this.maxVelocityY = 10;

    this.currentPositionX = Game.canvas.width / 3;
    this.currentPositionY = this.sizeY * 3;
    this.oldPositionX = this.currentPositionX;
    this.oldPositionY = this.currentPositionY;
    this.currentVelocityX = 0;
    this.currentVelocityY = 0;
    this.alive = true;

    this.image = new Image();
    this.image.src = "img/bungalow.png";
    this.deathImage = new Image();
    this.deathImage.src = "img/bungalow-death.png";
}

Player.prototype.update = function() {

    if (Game.settings.gameOn) {
       this.applyGravity();
       this.updateDistance();
    }

    this.applyAirResistance();

    this.updateVelocityAndSmoke();

    this.checkVelocityLimits();

    if (this.isPlayerCollidingWithAnythingDeadly()) {
        this.destroy();
    }
    if (this.isPlayerCollidingWithBoundaries()) {
        this.currentVelocityX = 0;
        this.currentPositionX = this.oldPositionX;
    }

    this.isPlayerCollidingWithCoins();

    this.updatePosition();
}

Player.prototype.updateDistance = function() {
    if (this.alive) {
        Game.counters.distance += Game.settings.speed;
    }
}

Player.prototype.isPlayerCollidingWithCoins = function() {
    for (var coin in Game.objects.coins) {
        if (isRectIntersect(this, Game.objects.coins[coin]) && Game.objects.coins[coin].alive) {
            Game.counters.score += 100;
            Game.counters.levelCoins++;
            Game.counters.totalCoins++;
            Game.objects.coins[coin].alive = false;
        }
    }
}

Player.prototype.isPlayerCollidingWithAnythingDeadly = function() {
    if (isObjectCollidingWithCeiling(Game.objects.player) ||
        isObjectCollidingWithFloor(Game.objects.player) ||
        isObjectCollidingWithWalls(Game.objects.player)) {
        return true
    }
    return false;
}

Player.prototype.isPlayerCollidingWithBoundaries = function() {
    if (isObjectCollidingWithLeftBoundary(Game.objects.player) ||
        isObjectCollidingWithRightBoundary(Game.objects.player)) {
        return true;
    }
    return false;
}

Player.prototype.updateVelocityAndSmoke = function() {
    if (this.alive) {
        if(Key.isDown(Key.LEFT)) {
            this.currentVelocityX -= this.thrustStrengthX;
            Game.settings.smoke.smokeSize = 1, Game.settings.smoke.smokeGrowth = 0.1;
            Game.settings.smoke.smokeFrequency = 5, Game.settings.smoke.smokeMaxSize = 10;
        }

        if(Key.isDown(Key.UP)) {
            this.currentVelocityY += this.thrustStrengthY;
            Game.settings.smoke.smokeSize = 1, Game.settings.smoke.smokeGrowth = 0.2;
            Game.settings.smoke.smokeFrequency = 2, Game.settings.smoke.smokeMaxSize = 20;
        }

        if(Key.isDown(Key.RIGHT)) {
            this.currentVelocityX += this.thrustStrengthX;
            Game.settings.smoke.smokeSize = 1, Game.settings.smoke.smokeGrowth = 0.2;
            Game.settings.smoke.smokeFrequency = 2, Game.settings.smoke.smokeMaxSize = 20;
        }

        if (!Key.isDown(Key.UP) && !Key.isDown(Key.LEFT) && !Key.isDown(Key.RIGHT)) {
            if (this.currentVelocityY > 0) {
                this.currentVelocityY -= 0.3;
            }
            Game.settings.smoke.smokeSize = 1, Game.settings.smoke.smokeGrowth = 0.1;
            Game.settings.smoke.smokeFrequency = 5, Game.settings.smoke.smokeMaxSize = 10;
        }
    }
}

Player.prototype.updatePosition = function() {
    this.oldPositionX = this.currentPositionX;
    this.oldPositionY = this.currentPositionY;

    this.currentPositionX += this.currentVelocityX;
    this.currentPositionY -= this.currentVelocityY;
}

Player.prototype.checkVelocityLimits = function() {
    this.currentVelocityY = checkCap(true, this.currentVelocityY, this.maxVelocityY);
    this.currentVelocityY = checkCap(false, this.currentVelocityY, this.maxVelocityY);

    this.currentVelocityX = checkCap(true, this.currentVelocityX, this.maxVelocityX);
    this.currentVelocityX = checkCap(false, this.currentVelocityX, this.maxVelocityX);
}

Player.prototype.applyGravity = function() {
    this.currentVelocityY -= Game.settings.gravity;
}

Player.prototype.applyAirResistance = function() {
    if (this.currentVelocityX < 0) {
        this.currentVelocityX += Game.settings.resistance;
    }
    if (this.currentVelocityX > 0) {
        this.currentVelocityX -= Game.settings.resistance;
    }

    if (this.currentVelocityX < 0 && this.currentVelocityX > -0.16) {
        this.currentVelocityX = 0;
    }
     if (this.currentVelocityX > 0 && this.currentVelocityX < 0.16) {
        this.currentVelocityX = 0;
    }
}

Player.prototype.destroy = function() {
    /*if (this.alive) {
        var nameBox = document.getElementById('playerName');
        hiScores[hiScores.length] = new hiScore(nameBox.value, Game.counters.score);

        // Sort the array here
        hiScores.sort(function(a,b){return a.score - b.score});
        hiScores.reverse();

        hiScores.splice(25, 1);
    }*/

    this.alive = false;
    Game.settings.text.getReady = false;
    Game.settings.text.levelClear = false;
    Game.settings.text.speedIncrease = false;
    Game.settings.text.wallFrequency = false;
    Game.settings.text.bordersLowered = false;
    Game.settings.text.wallSizeIncreased = false;
    Game.settings.text.coinsCollected = false;
}