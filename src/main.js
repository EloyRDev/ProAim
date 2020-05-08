const version = 0;

/** 
 *! DISCLAIMER

 ** THIS GAME WAS DEVELOPED FULLY BY ELOY RODRÍGUEZ (@EloyRDev). 
 ** YOU ARE FREE TO USE IT AND MODIFY IT BUT NEVER GIVE CREDIT TO YOURSELF FOR MY WORK. 
 ** OF COURSE YOU CAN DELETE THIS COMMENT SECTION, BUT LET'S KEEP SOME MORALITY HERE.

 *! DISCLAIMER
**/

/**
 * * VARIABLES AND MAIN FUNCTIONS
 * **/

var player = document.getElementById("player");
var playerRef = document.getElementById("player-ref");
var playerLife, playerPoints, difficult, speed, firstMove;

var ms = 3;
var gameWindow = document.getElementById("game-window");
var gameOver = document.getElementById("gameover");
var gameStart = document.getElementById("gamestart");
var map = document.getElementById("map");
var mapOver = document.getElementById("map-over");
var windowOver = document.getElementById("over");
var bonusSlots = document.querySelectorAll(".bonus-slot");

var uiAmmo = document.getElementById("ammo");
var uiGun = document.getElementById("gun");
var uiHealth = document.getElementById("health");
var uiPoints = document.getElementById("points");

var repeatMouse, update, spawnEnemy, spawnBonus;

var mouseX, mouseY;
var playerY = player.offsetTop + player.offsetHeight/2;
var playerX = player.offsetLeft + player.offsetWidth/2;
var rayTracing = Math.floor(Math.hypot(mouseY - playerY, mouseX - playerX)*2);
var bonusActive = [];

var gunTypes = [
    {//Gun
        id : "Pistol",
        damage : 1,
        dps : 500,
        reload : 12,
        ammo : 12,
        distance : 300,
        reloadTime : 1000
    },
    {//MP5
        id : "Sub-rifle",
        damage : 2,
        dps : 100,
        reload : 24,
        ammo : 24,
        distance : 400,
        reloadTime : 2000
    },
    {//Rifle
        id : "Rifle",
        damage : 4,
        dps : 150,
        reload : 30,
        ammo : 30,
        distance : 800,
        reloadTime : 2500
    },
    {//Sniper
        id : "Sniper",
        damage : 25,
        dps : 1000,
        reload : 6,
        ammo : 6,
        distance : 2000,
        reloadTime : 3000
    },
    {//Machine Gun
        id : "Family Destroyer",
        damage : 2,
        dps : 100,
        reload : 256,
        ammo : 256,
        distance : 1000,
        reloadTime : 5000
    }
]
var activeGun,reloading;

mapOver.addEventListener("mousedown", shoot);
document.addEventListener("mouseup", function() { clearInterval(repeatMouse)});

mapOver.addEventListener("mousemove", function(e) {
    if(e.target.id == "map-over"){
        mouseX = e.offsetX - 5;
        mouseY = e.offsetY - 5; 
    }
});

function updateF(){
    update = setInterval(function(){
        playerY = player.offsetTop + player.offsetHeight/2;
        playerX = player.offsetLeft + player.offsetWidth/2;
        player.style.transform = "rotate(" + Math.atan2(mouseX - playerX, - (mouseY - playerY)) * (180/Math.PI) + "deg)"

        uiAmmo.innerHTML = activeGun.ammo > 0 ? activeGun.ammo : "↻";
        uiGun.innerHTML = activeGun.id;
        uiHealth.innerHTML = playerLife;
        uiPoints.innerHTML = Math.floor(playerPoints);

        if(!firstMove) {
            map.style.top = (((map.offsetHeight - gameWindow.offsetHeight)/2)*-1) + "px";
            map.style.left = (((map.offsetWidth - gameWindow.offsetWidth)/2)*-1) + "px";
        }
    }, 25)
}

function bonusSpawnF() {
    spawnBonus = setInterval(function(){
        let bonusElement = document.createElement("div");
        bonusElement.classList.add("bonus");

        let whichBonus = Math.floor(Math.random() * 10);
        
        if(whichBonus < 4) {
            bonusElement.type = "life";
            bonusElement.value = 0;
        } else if(whichBonus < 8){
            bonusElement.type = "gun";
            if(difficult > 1) bonusElement.value = difficult - Math.floor(Math.random() * 3);
            else bonusElement.value = difficult;
        } else {
            bonusElement.type = "speed";
            bonusElement.value = Math.floor(Math.random() * (10 - speed) + speed);
        }

        bonusElement.innerHTML = bonusElement.type;
        bonusElement.type == "gun" ? bonusElement.innerHTML = gunTypes[bonusElement.value].id : 0;     

        while(true){
            if (bonusActive.length >= bonusSlots.length) {bonusElement.remove(); break;}
            
            let whichSlot = Math.floor(Math.random() * bonusSlots.length);
            if(bonusSlots[whichSlot].ocuped) continue;

            bonusElement.parent = whichSlot;
            bonusSlots[whichSlot].appendChild(bonusElement);
            bonusSlots[whichSlot].ocuped = true;
            bonusActive.push(bonusElement);
            break;
        }
    }, 40000)
}

function start(){
    playerLife = 1000;
    difficult = 0;
    playerPoints = 0;
    speed = 5;
    firstMove = false;

    activeGun = gunTypes[0];
    activeGun.ammo = activeGun.reload;
    reloading = false;
    for(let bSlot of bonusSlots) bSlot.ocuped = false;
    for(let bonus of bonusActive) { bonus.remove(); }
    bonusActive = [];

    respawnTime = 2000;
    aliveCounter = 0;
    regularEnemy = enemyTypes[difficult];
    topEnemy = enemyTypes[difficult+1];
    bossEnemy = enemyTypes[difficult+2];

    let trashBullet = document.querySelectorAll(".bullet");
    let trashMis = document.querySelectorAll(".bullet-miss");
    
    for(let b of trashBullet) b.remove();
    for(let b of trashMis) b.remove();
    for(let e of enemies) e.remove();

    gameWindow.style.display = "block";
    gameWindow.style.opacity = 1;
    gameOver.style.display = "none";
    gameStart.style.display = "none";
    map.style.top = (((map.offsetHeight - gameWindow.offsetHeight)/2)*-1) + "px";
    map.style.left = (((map.offsetWidth - gameWindow.offsetWidth)/2)*-1) + "px";

    player.style.top = "975px";
    player.style.left = "975px";
    playerRef.style.top = (gameWindow.offsetHeight/2) + "px";
    playerRef.style.left = (gameWindow.offsetWidth/2) + "px";

    enemyRespawnF();
    bonusSpawnF();
    updateF();
}

/**
 * * COLLISIONS
 * **/


var walls = document.getElementsByClassName("wall");

var rangeWidth = Math.floor(map.offsetWidth/ms);
var rangeHeight = Math.floor(map.offsetHeight/ms);

if(localStorage.getItem("hasMap-" + version) != "true") {
    localStorage.clear();
    localStorage.setItem("hasMap-" + version, "true");

    var tempCollisionMap = new Array(rangeHeight);

    for(let y = 0; y < rangeHeight; y++) {
        tempCollisionMap[y] = new Array(rangeWidth);
        for(let x = 0; x < rangeWidth; x++){
            y < 2 || y > rangeHeight - 3 ? tempCollisionMap[y][x] = 1 : "";
            x < 2 || x > rangeWidth - 3 ? tempCollisionMap[y][x] = 1 : "";
            for(let wall of walls){
                x*ms >= wall.offsetLeft && x*ms <= wall.offsetLeft + wall.offsetWidth && y*ms >= wall.offsetTop && y*ms <= wall.offsetTop + wall.offsetHeight ? tempCollisionMap[y][x] = 1 : "";
            }
            tempCollisionMap[y][x] != 1 ? tempCollisionMap[y][x] = 0 : "";
        }
    }

    localStorage.setItem("map-" + version, JSON.stringify(tempCollisionMap));
}
const wallCollisionBox = JSON.parse(localStorage.getItem("map-" + version));
gameWindow.style.display = "none";

var enemyCollisionBugHandler = [];

function enemyCollision(b){
    let collision = false;

    for(enem of enemies) { 
        if(!enem.classList.contains("enemy-dead")){
            if(Math.abs(b.offsetLeft - (enem.offsetLeft + 23)) < 23 && Math.abs(b.offsetTop - (enem.offsetTop + 23)) < 23) { 
                if(!enem.hitCounter) {
                    collision = true; 
                    enem.life -= activeGun.damage;
                    enem.life <= 0 ? enemyDamage(enem, true) : enemyDamage(enem, false);
                    enem.life <= 0 ? playerPoints += enem.points : playerPoints += enem.points/4;

                    enem.hitCounter = true;
                    enemyCollisionBugHandler.push(enem);
                }
            }   
        }
    }

    return collision;
}

function playerCollision(top, left){
    let collision = false;
    let lcPlWidth = player.offsetWidth;
    let lcPlHeight = player.offsetHeight;
    let lcPlLeft = left != 0 ? left : player.offsetLeft;
    let lcPlTop = top != 0 ? top : player.offsetTop;

    if (wallCollisionBox[Math.floor(lcPlTop/ms)][Math.floor(lcPlLeft/ms)] == 1 ||//LEFT-TOP
    wallCollisionBox[Math.floor(lcPlTop/ms)][Math.floor((lcPlLeft + lcPlWidth)/ms)] == 1 ||//RIGHT-TOP
    wallCollisionBox[Math.floor((lcPlTop + lcPlHeight)/ms)][Math.floor(lcPlLeft/ms)] == 1 ||//LEFT-BOTTOM
    wallCollisionBox[Math.floor((lcPlTop + lcPlHeight)/ms)][Math.floor((lcPlLeft + lcPlWidth)/ms)] == 1 ||//LEFT-BOTTOM
    wallCollisionBox[Math.floor(lcPlTop/ms)][Math.floor((lcPlLeft + (lcPlWidth/2))/ms)] == 1 ||//TOP
    wallCollisionBox[Math.floor((lcPlTop + (lcPlHeight/2))/ms)][Math.floor(lcPlLeft/ms)] == 1 ||//LEFT
    wallCollisionBox[Math.floor((lcPlTop + lcPlHeight)/ms)][Math.floor((lcPlLeft + (lcPlWidth/2))/ms)] == 1 ||//BOTTOM
    wallCollisionBox[Math.floor((lcPlTop + (lcPlHeight/2))/ms)][Math.floor((lcPlLeft + lcPlWidth)/ms)] == 1//RIGHT
    ) collision = true;

    for(let bonus of bonusActive){
        if(Math.floor(Math.hypot((bonusSlots[bonus.parent].offsetTop + 25) - playerY, (bonusSlots[bonus.parent].offsetLeft + 25) - playerX)) < 40){
            if(bonus.type == "gun") activeGun = gunTypes[bonus.value];
            else if(bonus.type == "life") playerLife = 1000;
            else if(bonus.type == "speed") speed = bonus.value;

            bonusActive.splice(bonusActive.indexOf(bonus), 1)
            bonusSlots[bonus.parent].ocuped = false;
            bonus.remove();
            break;
        }            
    }

    return collision;
}


/**
 * * BULLET
 * **/

function shoot(e){
    e.preventDefault();

    if(!reloading && e.which == 1 && playerLife > 0){
        shootPriv();
        repeatMouse = setInterval(shootPriv, activeGun.dps);
    }
}

function shootPriv(){
    if(reloading) return;

    if(activeGun.ammo > 0){
        let shoot = document.createElement("audio");
        shoot.src = "audio/"+activeGun.id+".mp3";
        document.body.appendChild(shoot);
        shoot.volume = 0.2;
        
        shoot.play();
        setTimeout(function(){
            shoot.remove();
        }, 1000)

        activeGun.ammo--;
    }

    if(activeGun.ammo <= 0){
        reloading = true;
        gameWindow.style.cursor = "wait";
        let reload = document.createElement("audio");
        reload.src = "audio/reload.mp3";
        reload.play();
        setTimeout(function(){
            activeGun.ammo = activeGun.reload;
            reloading = false;
            gameWindow.style.cursor = "crosshair";
            reload.remove();
        }, activeGun.reloadTime)

        return;
    }

    rayTracing = Math.floor(Math.hypot(mouseY - playerY, mouseX - playerX));

    var bullet = document.createElement("div");
    bullet.classList.add("bullet");
    bullet.style.top = playerY + "px";
    bullet.style.left = playerX + "px";
    bullet.style.opacity = 1;

    map.appendChild(bullet);

    bulletRay(bullet);
}

function bulletRay(b){
    let calcX = playerX;
    let calcY = playerY;

    let variation = Math.floor(Math.random() * 2) == 0 ? 1 : -1;
    const fixMouseX = mouseX + (Math.random() * 20) * variation;
    const fixMouseY = mouseY + (Math.random() * 20) * variation;
    const fixCalcX = calcX;
    const fixCalcY = calcY;

    const time = rayTracing/30;

    b.style.transform = "rotate(" + Math.atan2(fixMouseX - playerX, - (fixMouseY - playerY)) * (180/Math.PI) + "deg)"

    //Create bullet trace
    let traceHeight = 0;
    let bR = document.createElement("div");
    bR.classList.add("bullet-trace");
    bR.style.left = "0px";
    bR.style.top = "0px";
    bR.style.opacity = 1;

    b.appendChild(bR);

    for(let enem of enemyCollisionBugHandler) enem.hitCounter = false;

    let intern = setInterval(function(){
        fixMouseX < fixCalcX ? calcX -= parseFloat((fixCalcX - fixMouseX)/time) : calcX += parseFloat((fixMouseX - fixCalcX)/time);
        fixMouseY < fixCalcY ? calcY -= parseFloat((fixCalcY - fixMouseY)/time) : calcY += parseFloat((fixMouseY - fixCalcY)/time);
        
        b.style.left = calcX + "px";
        b.style.top = calcY + "px";
                
        traceHeight += (rayTracing/time);
        bR.style.transform = "scaleY(" + traceHeight + ")";

        try{
            if(wallCollisionBox[Math.floor((b.offsetTop+10)/ms)][Math.floor((b.offsetLeft+10)/ms)] == 1){
                bulletEnd(b, bR, "wall");
                clearInterval(intern);
            } else if(enemyCollision(b)) {
                bulletEnd(b, bR, "enemy");
                clearInterval(intern);
            }
            else if(activeGun.distance <= Math.floor(Math.hypot(b.offsetTop - playerY, b.offsetLeft - playerX))){
                bulletEnd(b, bR, "floor");
                clearInterval(intern);
            }  
        } catch(error) { bulletEnd(b, bR, "wall"); clearInterval(intern);}
    }, 5)   
}

function bulletEnd(b, bR, reason){
    switch(reason){
        case "floor": 
            b.classList.add("bullet-miss");
            b.classList.remove("bullet");       
            break;
        case "wall":
            b.style.filter = "contrast(50%) brightness(50%)";
            b.style.boxShadow = "0px 0px 4px black";
            break;
        case "enemy":
            b.style.boxShadow = "rgb(100, 200, 200) 0 0 50px";
            break;
    }
    
    let intern = setInterval(function(){
        bR.style.opacity -= 0.1;
        if (bR.style.opacity <= 0) { bR.remove(); clearInterval(intern); }
    }, 20)

    setTimeout(function(){
        let intern2 = setInterval(function(){
            b.style.opacity -= 0.01;
            if (b.style.opacity <= 0) { b.remove(); clearInterval(intern2); }
        }, 20)
    }, 20000);
}

/**
 * * PLAYER MOVEMENT 
 * **/

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
        case "KeyR": activeGun.ammo = 0; shootPriv(); break;
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
    firstMove = true;
    if(!playerMoving && playerLife > 0) {
        playerMoving = true;

        var intern = setInterval(function(){

            if (regKeys[0] && !playerCollision(player.offsetTop - speed, 0)) { 
                player.style.top = (player.offsetTop - speed) + "px";
                if((playerRef.offsetTop + 25) <= gameWindow.offsetHeight/2.3 && map.offsetTop < 0) map.style.top = (map.offsetTop + speed) + "px";
                else playerRef.style.top = (playerRef.offsetTop - speed) + "px";
            }
            if (regKeys[1] && !playerCollision(0, player.offsetLeft - speed)) {
                 player.style.left = (player.offsetLeft - speed) + "px";
                 if((playerRef.offsetLeft + 25) <= gameWindow.offsetWidth/2.3 && map.offsetLeft < 0) map.style.left = (map.offsetLeft + speed) + "px";
                else playerRef.style.left = (playerRef.offsetLeft - speed) + "px";
            }
            if (regKeys[2] && !playerCollision(player.offsetTop + speed, 0)) {
                player.style.top = (player.offsetTop + speed) + "px";
                if((playerRef.offsetTop + 25) >= gameWindow.offsetHeight - gameWindow.offsetHeight/2.3 && map.offsetTop < map.offsetHeight - gameWindow.offsetHeight) map.style.top = (map.offsetTop - speed) + "px";
                else playerRef.style.top = (playerRef.offsetTop + speed) + "px";
            }
            if (regKeys[3] && !playerCollision(0, player.offsetLeft + speed)) {
                player.style.left = (player.offsetLeft + speed) + "px";
                if((playerRef.offsetLeft + 25) >= gameWindow.offsetWidth - gameWindow.offsetWidth/2.3 && map.offsetLeft < map.offsetWidth - gameWindow.offsetWidth) map.style.left = (map.offsetLeft - speed) + "px";
                else playerRef.style.left = (playerRef.offsetLeft + speed) + "px";
            }

            if(!regKeys.includes(true)) { playerMoving = false; clearInterval(intern); }
        }, 20)
    }
}

function playerDead(){
    clearInterval(update);
    clearInterval(spawnEnemy);

    regKeys = [false, false, false, false];
    gameWindow.style.opacity = 1;
    gameOver.style.opacity = 1;

    let intern = setInterval(function(){
        gameWindow.style.opacity -= 0.003;
        if(gameWindow.style.opacity <= 0){
            clearInterval(intern); gameWindow.style.display = "none"; gameOver.style.display = "flex";
        }
    }, 20)

    document.getElementById("finalPoints").innerHTML = "You died with " + Math.floor(playerPoints) + " points :c" 
}

/**
 * * ENEMIES
 * **/

var respawnTime = 2000;

var enemyTypes = [
    {//BASIC
        id : 0,
        damage : 3,
        life : 2,
        points : 100,
        speed : 2,
        gradient : "linear-gradient(135deg, rgba(248, 252, 237, 0.5), rgba(146, 146, 146, 0.5))"
    },
    {//Cool
        id : 1,
        damage : 6,
        life : 3,
        points: 150,
        speed : 2,
        gradient : "linear-gradient(135deg, rgba(206, 255, 71, 0.5), rgba(146, 144, 27, 0.5))"
    },
    {//Cooler
        id : 2,
        damage : 10,
        life : 4,
        points: 200,
        speed : 3,
        gradient : "linear-gradient(135deg, rgba(74, 255, 74, 0.5), rgba(37, 138, 28, 0.5))"
    },
    {//Insanely Cool
        id : 3,
        damage : 20,
        life : 6,
        points: 400,
        speed : 3,
        gradient : "linear-gradient(135deg, rgba(53, 250, 234, 0.5), rgba(26, 146, 150, 0.5))"
    },
    {//Far away from cool
        id : 4,
        damage : 30,
        life : 12,
        points: 600,
        speed : 4,
        gradient : "linear-gradient(135deg, rgba(53, 115, 250, 0.5), rgba(26, 49, 150, 0.5))"
    },
    {//idk, like, hipercooler? Cooler? Freezer Brother?
        id : 5,
        damage : 60,
        life : 20,
        points: 1500,
        speed : 4,
        gradient : "linear-gradient(135deg, rgba(192, 0, 0, 0.5), rgba(141, 0, 0, 0.5))"
    },
    {//This is wrong
        id : 6,
        damage : 100,
        life : 100,
        points: 5000,
        speed : 6,
        gradient : "linear-gradient(135deg, rgb(27, 27, 27), rgb(10, 10, 10))"
    }
]

var regularEnemy, topEnemy, bossEnemy;
var enemies = [];
let aliveCounter = 0;


function enemyRespawnF(){
    setTimeout(function(){
        let idCounter = 1;
        spawnEnemy = setInterval(function(){
            if(aliveCounter < 100) {//Trying to improve performance
                if(idCounter % 50 == 0 && difficult < 4) {
                    difficult++;
                    regularEnemy = enemyTypes[difficult];
                    topEnemy = enemyTypes[difficult+1];
                    bossEnemy = enemyTypes[difficult+2];
                }

                let chosenEnemy = regularEnemy;
                if(idCounter % 5 == 0) chosenEnemy = topEnemy;
                if(idCounter % 20 == 0) chosenEnemy = bossEnemy;

                let enemy = document.createElement("div");
                enemy.classList.add("enemy");
                enemy.style.left = Math.floor(Math.random() * 2) == 0 ? "0px" : map.offsetWidth + "px";
                enemy.style.top = Math.floor(Math.random() * 2) == 0 ? "0px" : map.offsetHeight + "px";
                enemy.style.backgroundImage = chosenEnemy.gradient;

                enemy.damage = chosenEnemy.damage;
                enemy.life = chosenEnemy.life;
                enemy.points = chosenEnemy.points;
                enemy.speed = chosenEnemy.speed;
                enemy.hitCounter = false;
                
                map.appendChild(enemy);
                enemies.push(enemy);

                idCounter++;
                enemyAI(enemy);

                aliveCounter++;

                respawnTime > 150 ? respawnTime -= 250 : 0;
            }
        }, respawnTime)
    }, 100000000)
}


/**
 * * ARTIFICIAL INTELIGENCE
 * **/

function enemyAI(enem) {
    let speed = enem.speed;
    
    let AIProcess = setInterval(function(){
        if (enem.classList.contains("enemy-dead")) clearInterval(AIProcess);
        enem.style.boxShadow = "white 0 0 5px";

        if(Math.hypot(Math.abs((enem.offsetTop+25) - playerY), Math.abs((enem.offsetLeft+20) - playerX)) > 5) {    
            if (Math.abs((enem.offsetLeft + 20) - playerX) > 5)
                enem.offsetLeft + 20 < playerX ? enem.style.left = (enem.offsetLeft + speed) + "px" : enem.style.left = (enem.offsetLeft - speed) + "px";
            if (Math.abs((enem.offsetTop + 25) - playerY) > 5)
                enem.offsetTop + 20 < playerY ? enem.style.top = (enem.offsetTop + speed) + "px" : enem.style.top = (enem.offsetTop - speed) + "px";
        }

        if(Math.hypot(Math.abs((enem.offsetTop+25) - playerY), Math.abs((enem.offsetLeft+20) - playerX)) < 50){
            enem.style.boxShadow = "rgb(200, 20, 20) 0 0 20px";
            if (playerLife > 0) {
                playerLife -= enem.damage;
                if(playerLife <= 0){
                    uiHealth.innerHTML = 0;
                    playerDead();
                }
            }
        }
    }, 20)
    
}

function enemyDamage(enem, dead){
    if(dead){
        enem.style.boxShadow = "rgb(200, 20, 20) 0 0 20px";
        enem.classList.add("enemy-dead");
        enem.style.filter = "grayscale(100%) invert(100%)";
        enem.style.zIndex = "7";
        enem.style.opacity = 1;

        aliveCounter--;
        enemies.splice(enemies.indexOf(enem), 1)

        setTimeout(function(){
            let intern = setInterval(function(){
                enem.style.opacity -= 0.01;
                if(enem.style.opacity <= 0) { enem.remove(); clearInterval(intern); }
            }, 20)
        }, 10000)
    } else {
        enem.style.boxShadow = "rgb(100, 200, 200) 0 0 50px";
        
        
        setTimeout(function(){
            !enem.classList.contains("enemy-dead") ? enem.style.filter = "initial" : 0;
        }, 300)
    }
}