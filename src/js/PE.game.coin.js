function Coin() {
    this.image = new Image();
    this.image.src = "img/coin.png";

    this.sizeX = 32;
    this.sizeY = 32;

    this.currentPositionX = Game.canvas.width;
    this.currentPositionY = generateYPosition(this);


    this.alive = true;
}

Coin.prototype.update = function() {
    this.updatePosition();

    if(isObjectOffLeftSideOfScreen(this)) {
        this.destroyCoin();
    }
}

Coin.prototype.moveIfCollidingWithWall = function() {
    if (isObjectCollidingWithWalls(this)) {
        this.currentPositionY = Game.settings.ceiling + 2;
    }
}

Coin.prototype.moveIfCollidingWithBorder = function() {
    if (isObjectCollidingWithCeiling(this)) {
        this.currentPositionY = Game.settings.ceiling + 2;
    }
    if (isObjectCollidingWithFloor(this)) {
        this.currentPositionY = Game.settings.floor - this.sizeY + 1;
    }
}

Coin.prototype.updatePosition = function() {
    this.currentPositionX -= Game.settings.speed;
    this.moveIfCollidingWithWall();
    this.moveIfCollidingWithBorder();
}

Coin.prototype.destroyCoin = function() {
    Game.objects.coins.splice(0, 1);
}
