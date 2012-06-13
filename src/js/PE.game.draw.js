function draw() {
    if (Game.settings.debug.debugEnabled) { Game.settings.debug.drawFrame++; } // Increase the draw cycle counter

    Game.canvas.width = Game.canvas.width; // Clear the canvas

    drawBackground();

    drawBuildings();

    drawBorder();

    drawWalls();

    drawCoins();

    drawSmoke();

    drawPlayer();

    drawClouds();

    drawAllText();

    if (Game.settings.debug.debugOn) {
        drawDebugInfo();
    }

    Game.context.stroke(); // Update the canvas
}

function loadAssets() {
    // Load images
    Game.assets.logo.src = "img/policyexpert-logo.png";

    // Load gradient
    Game.assets.wallGradient.addColorStop(0.0, '#CD007A');
    Game.assets.wallGradient.addColorStop(1.0, '#403592');
}

function drawBackground() {
    // Colour background in grey
    Game.context.fillStyle = Game.settings.backgroundColor;
    Game.context.fillRect(0, 0, Game.canvas.width, Game.canvas.height - Game.settings.floor);

    // Draw policy expert logo
    Game.context.drawImage(Game.assets.logo, 1, Game.canvas.height - 50);
}

function drawImage(arg) {
     Game.context.drawImage(arg.image, arg.currentPositionX, arg.currentPositionY, arg.sizeX, arg.sizeY);
}

function drawPlayer() {
    if(Game.objects.player.alive) {
        Game.context.drawImage(Game.objects.player.image, Game.objects.player.currentPositionX,
            Game.objects.player.currentPositionY, Game.objects.player.sizeX, Game.objects.player.sizeY);
    } else {
        Game.context.drawImage(Game.objects.player.deathImage, Game.objects.player.currentPositionX,
            Game.objects.player.currentPositionY, Game.objects.player.sizeX, Game.objects.player.sizeY);
    }
}

function drawBuildings() {
    for(var building in Game.objects.buildings) {
        drawBuilding(Game.objects.buildings[building]);
    }
}

function drawClouds() {
    for(var cloud in Game.objects.clouds) {
        for(var circle in Game.objects.clouds[cloud].circles) {
            Game.context.fillStyle = Game.objects.clouds[cloud].circles[circle].colour;
            Game.context.strokeStyle = Game.objects.clouds[cloud].circles[circle].colour;

            Game.context.beginPath();
            Game.context.arc(Game.objects.clouds[cloud].currentPositionX + Game.objects.clouds[cloud].circles[circle].offX,
                Game.objects.clouds[cloud].currentPositionY + Game.objects.clouds[cloud].circles[circle].offY,
                Game.objects.clouds[cloud].circles[circle].size, 0, Math.PI * 2, false);
            Game.context.closePath();
            Game.context.fill();
        }
    }
}

function drawBuilding(arg) {
    Game.context.strokeStyle = Game.settings.buildingOutlineColor;
    Game.context.strokeRect(arg.currentPositionX, Game.canvas.height - Game.settings.floor, arg.sizeX, -arg.sizeY);
    Game.context.fillStyle = Game.settings.buildingColor;
    Game.context.fillRect(arg.currentPositionX, Game.canvas.height - Game.settings.floor, arg.sizeX, -arg.sizeY);
}

function drawWalls() {
    Game.context.fillStyle = Game.assets.wallGradient;
    Game.context.strokeStyle = '#000000';
    for(var wall in Game.objects.walls) {
        drawRectangle(Game.objects.walls[wall]);
    }
}

function drawRectangle(arg) {
    Game.context.fillRect(arg.currentPositionX, arg.currentPositionY, arg.sizeX, arg.sizeY);
    Game.context.strokeRect(arg.currentPositionX, arg.currentPositionY, arg.sizeX, arg.sizeY);
}

function drawCoins() {
    Game.context.font = 'bold 12px calibri';
    Game.context.textAlign = 'left';
    Game.context.fillStyle = '#CD007A';

    for(var coin in Game.objects.coins) {
        if (Game.objects.coins[coin].alive) {
            drawImage(Game.objects.coins[coin]);
        } else {
            Game.context.fillText('100', Game.objects.coins[coin].currentPositionX,
                Game.objects.coins[coin].currentPositionY);
        }
    }
}

function drawBorder() {
    Game.context.fillStyle = Game.assets.wallGradient;
    Game.context.strokeStyle = '#000000';
    Game.context.fillRect(0, 0, Game.canvas.width, Game.settings.ceiling);
    Game.context.strokeRect(0, 0, Game.canvas.width, Game.settings.ceiling);
    Game.context.fillRect(0, Game.canvas.height - 50, Game.canvas.width, -Game.settings.floor + 50);
    Game.context.strokeRect(0, Game.canvas.height - 50, Game.canvas.width, -Game.settings.floor + 50);
};

function drawSmoke() {
    for(var particle in Game.objects.smoke) {
        Game.context.fillStyle = Game.objects.smoke[particle].smokeColour;
        Game.context.strokeStyle = Game.objects.smoke[particle].smokeColour;
        drawCircle(Game.objects.smoke[particle]);
    }
}

function drawCircle(arg) {
    Game.context.beginPath();
    Game.context.arc(arg.currentPositionX, arg.currentPositionY, arg.size, 0, Math.PI * 2, false);
    Game.context.closePath();
    Game.context.fill();
}

function drawAllText() {
    useTextDefaults();

    drawScore();

    drawHint();

    if (Game.settings.text.coinsCollected) {
        drawText("Coins collected this level: " + Game.counters.levelCoins, 0, -20);
    }

    if(Game.settings.text.getReady) {
        drawCenterText("GET READY!");
        if (!Game.settings.gameOn) {
            drawText("Press 'UP' to start", 0, 20);
        }
    }
    if(Game.settings.text.levelClear) {
        drawText("LEVEL CLEAR", 0, -40);
    }
    if(Game.settings.text.speedIncrease) {
        drawText("Speed increased!", 0, 20);
    }
    if(Game.settings.text.wallFrequency) {
        drawText("Wall rate increased!", 0, 20);
    }
    if(Game.settings.text.bordersLowered) {
        drawText("Borders increased!", 0, 20);
    }
    if(Game.settings.text.wallSizeIncreased) {
        drawText("Wall size increased!", 0, 20);
    }

    Game.context.font = Game.settings.textDefaults.font;
    Game.context.textAlign = 'left';
    Game.context.fillStyle = '#FFFFFF';
    Game.context.fillText(Game.settings.currentMileage +'m', Game.settings.mileageX, Game.canvas.height - Game.settings.floor + 20);
}

function drawText(arg, argX, argY) {
    Game.context.fillText(arg, Game.canvas.width / 2 + argX, Game.canvas.height / 2 + argY);
}

function drawCenterText(arg) {
    Game.context.fillText(arg, Game.canvas.width / 2, Game.canvas.height / 2);
}

function drawScore() {
    Game.context.fillStyle = Game.settings.textDefaults.color;
    Game.context.fillText("Score: " + Game.counters.score + "  Level: " + Game.counters.level, Game.canvas.width / 2, Game.settings.ceiling + 20);
}

function drawHint() {
    if(!Game.objects.player.alive) {
        Game.context.fillText('GAME OVER', Game.canvas.width / 2, Game.canvas.height / 2 - 40);
        Game.context.fillText("Total distance travelled: " + Math.round(Game.counters.distance / 10) + 'm', Game.canvas.width / 2, Game.canvas.height / 2);
        Game.context.fillText("Total coins collected: " + Game.counters.totalCoins, Game.canvas.width / 2, Game.canvas.height / 2 + 20);
        Game.context.fillText("Press SPACE to restart", Game.canvas.width / 2, Game.canvas.height / 2 + 60);
         } else {
        Game.context.fillText("Press the 'UP' arrow key to stay in the air", Game.canvas.width / 1.5 - 10, Game.canvas.height - 25);
        Game.context.fillText("Move side to side with the 'LEFT' and 'RIGHT' arrow keys", Game.canvas.width / 1.5 - 10, Game.canvas.height - 5);
    }
}

function useTextDefaults() {
    Game.context.font = Game.settings.textDefaults.font;
    Game.context.textAlign = Game.settings.textDefaults.align;
    Game.context.fillStyle = Game.settings.textDefaults.colour;
}

function drawDebugInfo() {
    Game.context.font = 'bold 10px calibri';
    Game.context.textAlign = "left";
    Game.context.fillStyle = '#000000';
    Game.context.fillText("u: " + Game.settings.debug.updateFrame, 10, 20);
    Game.context.fillText("d: " + Game.settings.debug.drawFrame, 10, 30);
    Game.context.fillText("x: " + Game.objects.player.currentPositionX + "  Vx: " + Game.objects.player.currentVelocityX, 10, 40);
    Game.context.fillText("y: " + Game.objects.player.currentPositionY + "  Vy: " + Game.objects.player.currentVelocityY, 10, 50);
    Game.context.fillText("a: " + Game.objects.player.alive, 10, 70);
    Game.context.fillText("w: " + Game.objects.walls.length, 10, 80);
    Game.context.fillText("fq: " + Game.settings.frequency + " / " + Game.counters.frequencyCounter, 400, 20);
    Game.context.fillText("s: " + Game.settings.speed, 400, 30);
    Game.context.fillText("g: " + Game.settings.gravity + "  r: " + Game.settings.resistance, 400, 40);
    Game.context.fillText("c: " + Game.settings.ceiling + "  f: " + Game.settings.floor, 400, 50);
    Game.context.fillText("m: " + Game.settings.wallMin + "  M: " + Game.settings.wallMax, 400, 60);
    Game.context.fillText("sm: " + Game.objects.smoke.length, 400, 70);
    Game.context.fillText("sc: " + Game.settings.smoke.smokeColour, 400, 80);
    Game.context.fillText("c: " + Game.objects.coins.length, 400, 90);
    Game.context.fillText("mi: " + Game.settings.currentMileage, 400, 100);
    Game.context.fillText("di: " + Game.counters.distance, 400, 110);
}