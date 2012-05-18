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