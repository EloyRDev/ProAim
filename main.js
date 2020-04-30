var player = document.getElementById("player");
var gameWindow = document.getElementById("game-window");
var windowOver = document.getElementById("over");
var repeatMouse;

var mouseX, mouseY;
var playerY = player.offsetTop + player.offsetHeight/2;
var playerX = player.offsetLeft + player.offsetWidth/2;
var rayTracing = Math.floor(Math.hypot(mouseY - playerY, mouseX - playerX)*2);

var dps = 400;
var speed = 7;

gameWindow.addEventListener("mousedown", shoot);
document.addEventListener("mouseup", function() { clearInterval(repeatMouse)});

windowOver.addEventListener("mousemove", function(e) {
    if(e.target.id == ("over")){
        mouseX = e.offsetX - 5;
        mouseY = e.offsetY - 5; 
    } 
});

setInterval(function(){
    player.style.transform = "rotate(" + Math.atan2(mouseX - playerX, - (mouseY - playerY)) * (180/Math.PI) + "deg)";
}, 25)

//PLAYER SHOOTING

function shoot(){
    shootPriv();
    repeatMouse = setInterval(shootPriv, dps);
}

function shootPriv(){
    playerY = player.offsetTop + player.offsetHeight/2;
    playerX = player.offsetLeft + player.offsetWidth/2;

    rayTracing = Math.floor(Math.hypot(mouseY - playerY, mouseX - playerX)*2);

    /*console.log("Mouse: " + mouseX + ", " + mouseY);
    console.log("Player: " + playerX + ", " + playerY);
    console.log("Bullet Ray: " + rayTracing);
    console.log("==================================");
    */

    var bullet = document.createElement("div");
    bullet.classList.add("bullet");
    bullet.style.top = playerY + "px";
    bullet.style.left = playerX + "px";
    bullet.style.opacity = 1;
    bullet.style.transform = "rotate(" + Math.atan2(mouseX - playerX, - (mouseY - playerY)) * (180/Math.PI) + "deg)"

    gameWindow.appendChild(bullet);

    bulletRay(bullet);
}

function bulletRay(b){
    let calcX = playerX;
    let calcY = playerY;

    const fixMouseX = mouseX;
    const fixMouseY = mouseY;
    const fixCalcX = calcX;
    const fixCalcY = calcY;

    const time = rayTracing/30;

    //Create bullet trace
    let traceHeight = 0;
    let bR = document.createElement("div");
    bR.classList.add("bullet-trace");
    bR.style.left = "0px";
    bR.style.top = "0px";
    bR.style.opacity = 1;

    b.appendChild(bR);

    let intern = setInterval(function(){
        fixMouseX < fixCalcX ? calcX -= parseFloat((fixCalcX - fixMouseX)/time) : calcX += parseFloat((fixMouseX - fixCalcX)/time);
        fixMouseY < fixCalcY ? calcY -= parseFloat((fixCalcY - fixMouseY)/time) : calcY += parseFloat((fixMouseY - fixCalcY)/time);
        
        b.style.left = calcX + "px";
        b.style.top = calcY + "px";

        traceHeight += (rayTracing/time)/3;
        bR.style.transform = "scaleY(" + traceHeight + ")";

        if(rayTracing <= traceHeight*3) { 
            b.style.left = fixMouseX + "px";
            b.style.top = fixMouseY + "px";
            bulletRayEnd(bR);
            bulletEnd(b);
            clearInterval(intern);
        }
    }, 5)   
}

function bulletEnd(b){
    setTimeout(function(){
        let intern = setInterval(function(){
            b.style.opacity -= 0.01;
            if (b.style.opacity < 0) { b.remove(); clearInterval(intern); }
        }, 5)
    }, 1000);
}

function bulletRayEnd(bR){
    let intern = setInterval(function(){
        bR.style.opacity -= 0.02;
        if (bR.style.opacity < 0) { bR.remove(); clearInterval(intern); }
    }, 1)
}

//PLAYER MOVEMENT

document.addEventListener("keydown", keyPressed);
document.addEventListener("keyup", keyReleased);

var regKeys = [false, false, false, false];
var playerMoving = false;

function keyPressed(e){  
    switch(e.code){
        case "KeyW": regKeys[0] = true; break;
        case "KeyA": regKeys[1] = true; break;
        case "KeyS": regKeys[2] = true; break;
        case "KeyD": regKeys[3] = true; break;
    }    

    playerMov();
}

function keyReleased(e){  
    switch(e.code){
        case "KeyW": regKeys[0] = false; break;
        case "KeyA": regKeys[1] = false; break;
        case "KeyS": regKeys[2] = false; break;
        case "KeyD": regKeys[3] = false; break;  
    }    

    playerMov();
}

function playerMov(){

    if(!playerMoving) {
        playerMoving = true;

        var intern = setInterval(function(){
            if (regKeys[0] && regKeys[1]) { player.style.top = (player.offsetTop - speed) + "px"; player.style.left = (player.offsetLeft - speed) + "px";} 
            else if (regKeys[0] && regKeys[3]) { player.style.top = (player.offsetTop - speed) + "px"; player.style.left = (player.offsetLeft + speed) + "px";}
            else if (regKeys[2] && regKeys[1]) { player.style.top = (player.offsetTop + speed) + "px"; player.style.left = (player.offsetLeft - speed) + "px";}
            else if (regKeys[2] && regKeys[3]) { player.style.top = (player.offsetTop + speed) + "px"; player.style.left = (player.offsetLeft + speed) + "px";}
            else if (regKeys[0]) player.style.top = (player.offsetTop - speed) + "px";
            else if (regKeys[1]) player.style.left = (player.offsetLeft - speed) + "px";
            else if (regKeys[2]) player.style.top = (player.offsetTop + speed) + "px";
            else if (regKeys[3]) player.style.left = (player.offsetLeft + speed) + "px";

            if(!regKeys.includes(true)) { playerMoving = false; clearInterval(intern); }
        }, 20)
    }
}
