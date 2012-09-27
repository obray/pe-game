function Wall() {
    this.currentPositionX = Game.canvas.width;
    this.currentPositionY;
    this.minSize = Game.settings.wallMin;
    this.maxSize = Game.settings.wallMax;
    this.sizeX = Game.settings.wallWidth;
    this.sizeY;

    this.generateWall();
}

Wall.prototype.generateWall = function() {
    this.sizeY = this.generateSize();

    this.currentPositionY = generateYPosition(this);
}

Wall.prototype.generateSize = function() {
    var wallSize = this.minSize + Math.random() * this.maxSize;

    // Ensure there is a gap big enough for the player to fit through
    var freeSpace = Game.canvas.height - Game.settings.ceiling - Game.settings.floor;
    if ((freeSpace - wallSize) < (Game.objects.player.sizeY * 2.5)) {
        wallSize = freeSpace - (Game.objects.player.sizeY * 2.5);
    }

    return wallSize;
}

Wall.prototype.update = function() {
    this.updatePosition();

    if(isObjectOffLeftSideOfScreen(this)) {
        this.destroyWall();
    }
}

Wall.prototype.updatePosition = function() {
    this.currentPositionX -= Game.settings.speed;
}

Wall.prototype.destroyWall = function() {
    Game.objects.walls.splice(0, 1);
}
