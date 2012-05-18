function draw() {
    if (debugEnabled) { drawFrame++; } // Increase the draw cycle counter

    canvas.width = canvas.width; // Clear the canvas

    drawBackground();

    drawBorder();

    drawWalls();

    drawAllText();

    drawImage(player);

    drawSmoke();

    if (debug) {
        drawDebugInfo();
    }

    context.stroke(); // Update the canvas
}

function loadAssets() {
    // Load images
    logo.src = "img/policyexpert-logo.png";

    // Load gradient
    wallGradient.addColorStop(0.0, '#CD007A');
    wallGradient.addColorStop(1.0, '#403592');
}

function drawBackground() {
    // Colour background in grey
    context.fillStyle = '#E6E6E6';
    context.fillRect(0, 0, canvas.width, canvas.height - floor);

    // Draw policy expert logo
    context.drawImage(logo, 1, canvas.height - 50);
}

function drawImage(arg) {
    if(arg.alive) {
        context.drawImage(arg.image, arg.currentPositionX, arg.currentPositionY, arg.sizeX, arg.sizeY);
    } else {
        context.drawImage(arg.deathImage, arg.currentPositionX, arg.currentPositionY, arg.sizeX, arg.sizeY);
    }
}

function drawWalls() {
    context.fillStyle = wallGradient;
    context.strokeStyle = '#000000';
    for(var wall in walls) {
        drawRectangle(walls[wall]);
    }
}

function drawBorder() {
    context.fillStyle = wallGradient;
    context.fillRect(0, ceiling, canvas.width, -10);
    context.fillRect(0, canvas.height - floor, canvas.width, 10);
};

function drawSmoke() {
    for(var exhaust in smoke) {
        context.fillStyle = smoke[exhaust].smokeColour;
        drawCircle(smoke[exhaust]);
    }
}

function drawRectangle(arg) {
    context.fillRect(arg.currentPositionX, arg.currentPositionY, arg.sizeX, arg.sizeY);
    context.strokeRect(arg.currentPositionX, arg.currentPositionY, arg.sizeX, arg.sizeY);
}

function drawCircle(arg) {
    context.fillStyle = arg.smokeColour;
    context.strokeStyle = arg.smokeColour;
    context.beginPath();
    context.arc(arg.currentPositionX, arg.currentPositionY, arg.size, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();
}

function drawAllText() {
    useTextDefaults();

    drawScore();

    drawHint();

    if(textGetReady) {
        drawCenterText("Get Ready!");
    }
    if(textLevelClear) {
        drawText("Level Clear", 0, 20);
    }
    if(textSpeedIncrease) {
        drawCenterText("Speed +");
    }
    if(textWallFrequency) {
        drawCenterText("Wall frequency +");
    }
    if(textBordersLowered) {
        drawCenterText("Borders +");
    }
    if(textWallSizeIncreased) {
        drawCenterText("Wall Size +");
    }
}

function drawText(arg, argX, argY) {
    context.fillText(arg, canvas.width / 2 + argX, canvas.height / 2 + argY);
}

function drawCenterText(arg) {
    context.fillText(arg, canvas.width / 2, canvas.height / 2);
}

function drawScore() {
    context.fillStyle = textDefaultColor;
    context.fillText("Score: " + score + "  Level: " + level, canvas.width / 2, ceiling + 20);
}

function drawHint() {
    if(!player.alive) {
        context.fillText("Press SPACE to restart", canvas.width / 2, canvas.height / 2 + 20);
    } else {
        context.fillText("Press the 'up' arrow key to stay in the air", canvas.width / 1.5, canvas.height - floor / 2);
        context.fillText("and move side to side with 'left' and 'right' arrow keys", canvas.width / 1.5, canvas.height - floor / 2 + 20);
    }
}

function useTextDefaults() {
    context.font = textDefaultFont;
    context.textAlign = textDefaultAlign;
    context.fillStyle = textDefaultColor;
}

function drawDebugInfo() {
    context.font = 'bold 10px calibri';
    context.textAlign = "left";
    context.fillStyle = '#000000';
    context.fillText("u: " + updateFrame, 10, 20);
    context.fillText("d: " + drawFrame, 10, 30);
    context.fillText("x: " + player.currentPositionX + "  Vx: " + player.currentVelocityX, 10, 40);
    context.fillText("y: " + player.currentPositionY + "  Vy: " + player.currentVelocityY, 10, 50);
    context.fillText("a: " + player.alive, 10, 70);
    context.fillText("w: " + walls.length, 10, 80);
    context.fillText("fq: " + frequency + " / " + frequencyCounter, 400, 20);
    context.fillText("s: " + speed, 400, 30);
    context.fillText("g: " + gravity + "  r: " + resistance, 400, 40);
    context.fillText("c: " + ceiling + "  f: " + floor, 400, 50);
    context.fillText("m: " + wallMin + "  M: " + wallMax, 400, 60);
    context.fillText("sm: " + smoke.length, 400, 70);
}