function Cloud() {
    this.currentPositionX = Game.canvas.width + 50;
    this.currentPositionY = Game.settings.ceiling + 50 + Math.random() * 200;
    this.circles = new Array();
    this.speed = 3 + Math.random() * 4;

    this.circles[0] = new Circle(0, 0);
    var noOfCircles = 8 + Math.random() * 16;
    for (var i = 1; i < noOfCircles; i++) {
        this.circles[i] = new Circle(this.circles[i - 1].size, this.circles[i - 1].size);
    }
}

Cloud.prototype.update = function() {
    this.currentPositionX -= this.speed;
    if(isObjectOffLeftSideOfScreen(this)) {
        this.destroyCloud();
    }
}

Cloud.prototype.destroyCloud = function() {
    Game.objects.clouds.splice(0, 1);
}

function Circle(argX1, argY1) {
    this.offX = Math.random() * argX1 * 6;
    this.offY = Math.random() * argY1;
    this.size = 8 + Math.random() * 16;
    this.colour = '#FFFFFF';
}

