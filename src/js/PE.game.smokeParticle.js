function SmokeParticle() {
    this.size = Game.settings.smoke.smokeSize;
    this.smokeGrowth = Game.settings.smoke.smokeGrowth;
    this.smokeMaxSize = Game.settings.smoke.smokeMaxSize;
    this.smokeColour = this.setColour();
    this.currentPositionX = Game.objects.player.currentPositionX;
    this.currentPositionY = Game.objects.player.currentPositionY + Game.objects.player.sizeY - this.size;
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

SmokeParticle.prototype.setColour = function() {
    var colourY = 0;
    var colourX = 0;

    if (Game.objects.player.currentVelocityY > 0) {
        colourY = Math.round(Game.objects.player.currentVelocityY * 10)
    }
    if (Game.objects.player.currentVelocityX > 0) {
        colourX = Math.round(Game.objects.player.currentVelocityX * 10)
    }
    var colour = 255 - colourX - colourY;
    colour = colour.toString(16);
    return '#' + colour + colour + colour;
}

SmokeParticle.prototype.moveAndGrowSmokeParticle = function() {
    this.currentPositionX -= Game.settings.speed;
    this.size += this.smokeGrowth;
}

SmokeParticle.prototype.isSmokeParticleOffLeftSideOfScreen = function() {
    if(this.currentPositionX + this.size < 0) {
        return true;
    }
    return false;
}

SmokeParticle.prototype.destroySmokeParticle = function() {
    Game.objects.smoke.splice(0, 1);
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