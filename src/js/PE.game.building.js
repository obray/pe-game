function Building() {
    this.sizeX = 50 + Math.random() * 150;
    this.sizeY = Math.random() * 300;
    this.currentPositionX = Game.canvas.width;
}

Building.prototype.update = function() {
    this.currentPositionX -= Game.settings.speed / 2;

    if(isObjectOffLeftSideOfScreen(this)) {
        this.destroyBuilding();
    }
}

Building.prototype.destroyBuilding = function() {
    Game.objects.buildings.splice(0, 1);
}