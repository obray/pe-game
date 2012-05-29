function Coin() {
    this.images = new Array();
    this.images[0] = new Image();
    this.images[1] = new Image();
    this.images[2] = new Image();
    this.images[3] = new Image();
    this.images[4] = new Image();
    this.images[5] = new Image();
    this.images[6] = new Image();
    this.images[7] = new Image();
    this.images[8] = new Image();
    this.images[9] = new Image();
    this.images[10] = new Image();
    this.images[11] = new Image();
    this.images[12] = new Image();
    this.images[13] = new Image();
    this.images[14] = new Image();
    this.images[15] = new Image();
    this.images[0].src = "img/coin5.png";
    this.images[1].src = "img/coin4.png";
    this.images[2].src = "img/coin3.png";
    this.images[3].src = "img/coin2.png";
    this.images[4].src = "img/coin1.png";
    this.images[5].src = "img/coin2.png";
    this.images[6].src = "img/coin3.png";
    this.images[7].src = "img/coin4.png";
    this.images[8].src = "img/coin5.png";
    this.images[9].src = "img/coin4b.png";
    this.images[10].src = "img/coin3b.png";
    this.images[11].src = "img/coin2b.png";
    this.images[12].src = "img/coin1b.png";
    this.images[13].src = "img/coin2b.png";
    this.images[14].src = "img/coin3b.png";
    this.images[15].src = "img/coin4b.png";

    this.animationCounter = 0;
    this.animationSpeed = 4;
    this.animation = Math.floor(Math.random() * 15);

    this.image = new Image();
    this.image.src = "img/coin1.png";

    this.sizeX = 32;
    this.sizeY = 32;

    this.currentPositionX = Game.canvas.width;
    this.currentPositionY = generateYPosition(this);

    this.alive = true;
}

Coin.prototype.animate = function() {
    this.animation++;
    if (this.animation > 15) {
        this.animation = 0;
    }
    this.image = this.images[this.animation];
}

Coin.prototype.update = function() {
    this.updatePosition();

    if (this.isTimeForNextAnimation()) {
        this.animate();
    }

    if(isObjectOffLeftSideOfScreen(this)) {
        this.destroyCoin();
    }
}

Coin.prototype.isTimeForNextAnimation = function() {
    this.animationCounter++;
    if (this.animationCounter > this.animationSpeed) {
        this.animationCounter = 0;
        return true;
    }
    return false;
}

Coin.prototype.moveIfCollidingWithWall = function() {
    if (isObjectCollidingWithWalls(this)) {
        this.currentPositionY = Game.settings.ceiling + 2;
        this.currentPositionX -= 47;
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
