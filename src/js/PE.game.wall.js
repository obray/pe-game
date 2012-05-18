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
