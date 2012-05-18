
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