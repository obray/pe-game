var Key = {
    _pressed : {},

    LEFT : 37,
    UP : 38,
    RIGHT : 39,
    DOWN : 40,
    CONTROL : 17,
    SPACE : 32,
    D : 68,

    isUp : function(keyCode) {
        return this._pressed[keyCode];
    },
    isDown : function(keyCode) {
        return this._pressed[keyCode];
    },
    onKeydown : function(event) {
        this._pressed[event.keyCode] = true;
    },
    onKeyup : function(event) {
        delete this._pressed[event.keyCode];
    }
};

window.addEventListener('keyup', function(event) {
    Key.onKeyup(event);
}, false);
window.addEventListener('keydown', function(event) {
        if (event.keyCode == 38 || event.keyCode == 40 || event.keyCode == 32) {
            event.preventDefault();    
        }
    Key.onKeydown(event);
}, false);

function ifSpaceBarPressedAndPlayerDeadRestartGame() {
    if(!Game.objects.player.alive) {
        if(Key.isDown(Key.SPACE)) {
            restart();
        }
    }
}

function ifDKeyPressedSwitchOnDebugInfoIfDebugEnabled() {
    if (Game.settings.debug.debugEnabled) {
        if(Key.isDown(Key.D)) {
            Game.settings.debug.debugOn = !Game.settings.debug.debugOn;
        }
    }
}