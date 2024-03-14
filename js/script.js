let score = 0;
let health = 3;
let level = 1;
let color = "green";
let music = document.getElementById("music");
let lasersound = document.getElementById("lasersound");
let explosionsound = document.getElementById("explosionsound");
let aiesound = document.getElementById("aiesound");
let volumeSlider = document.getElementById("volumeSlider");
let laserIntervalId;
let enemyIntervalId;
let enemyLaserIntervalId;
let timeIntervalId;
let bossLaserIntervalId
let startTime;
let isInvulnerable = false;
let isPaused = false;
let ifPauseTime = 0;
let timePlayed = 0;
let currentGameSpeed;
let transitionScreen = document.createElement('div');
transitionScreen.id = 'transitionScreen';
let colorShip = "green";
const gameAreaWidth = window.innerWidth;
const gameAreaHeight = window.innerHeight;
const starshipWidth = 112;
const starshipHeight = 75;
const centeredAreaWidth = 600;
const centeredAreaHeight = 800;
const centeredAreaTop = (window.innerHeight - centeredAreaHeight) / 2;
const centeredAreaLeft = (window.innerWidth - centeredAreaWidth) / 2;
let bossHealth = 25;
let fpsDisplay = document.getElementById('fps-display');
let frameCount = 0;
let startTimeFPS;
let leftArrowPressed = false;
let rightArrowPressed = false;
let upArrowPressed = false;
let downArrowPressed = false;
let forbiddenPause = true;
let animationFrameId;

// MENU //

function startGame(gameSpeed, color) {
    resetFPS();
    forbiddenPause = false;
    colorShip = color;

    let background = document.getElementById('background');
    background.style.backgroundImage = `url('/img/background0.jpg')`;

    startTime = new Date();
    timeIntervalId = setInterval(updateClock, 1000);
    currentGameSpeed = gameSpeed;

    music.play();
    updateFPS();

    document.getElementById("menu").style.opacity = "0"; 

    const centeredSquare = document.querySelector(".centeredSquare");
    centeredSquare.style.opacity = 1;

    const gradient = document.querySelector(".gradient");
    gradient.style.opacity = 1;

    showTransitionScreen('');

    const elementIds = ["score", "level", "health", "clock"];

    elementIds.forEach((id) => {
        let element = createAndDisplayElement(id);
        if (id === "health") {
            updateHealth(0, color);
        }
    });

    document.querySelectorAll(".enemy").forEach((enemy) => enemy.remove());

    const starship = document.getElementById("starship");
    starship.style.backgroundImage = `url('/img/player_${colorShip}.png')`;
    starship.style.left = centeredAreaLeft + "px";

    function createEnemyInterval() {
        return setInterval(() => {
            createRandomEnemy(color);
        }, currentGameSpeed);
    }
    enemyIntervalId = createEnemyInterval();

    if (laserIntervalId) {
        clearInterval(laserIntervalId);
    }
    laserIntervalId = setInterval(() => {
        launchLaser(colorShip);
        lasersound.play();
    }, 300);
    enemyLaserIntervalId = setInterval(() => {
        createEnemyLaser(color);
    }, 1000);
}

function createAndDisplayElement(id, textContent = "") {
    let element = document.getElementById(id);
    if (!element) {
        element = document.createElement("div");
        element.id = id;
        document.body.appendChild(element);
    }
    element.style.opacity = 1; // Set opacity to 1
    element.textContent = textContent;
    return element;
}

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        ifPauseTime = timePlayed;
        clearInterval(laserIntervalId);
        clearInterval(enemyIntervalId);
        clearInterval(enemyLaserIntervalId);
        clearInterval(bossLaserIntervalId)
        showPauseScreen();
    } else {
        document.getElementById("pauseScreen").style.opacity = "0"; // Set opacity to 0        
        startTime = new Date();
        if (level < 6) {
            function createEnemyInterval() {
                return setInterval(() => {
                    createRandomEnemy(color);
                }, currentGameSpeed);
            }
            laserIntervalId = setInterval(() => {
                launchLaser(colorShip);
                lasersound.play();
            }, 300);
            enemyIntervalId = createEnemyInterval();
            enemyLaserIntervalId = setInterval(() => {
                createEnemyLaser(color);
            }, 1000);
        } else {
            bossLaserIntervalId = setInterval(() => {
                launchBossLaser();
            }, 1800);
        }
        pauseScreen.remove();
    }
}

function showMenu() {
    
    forbiddenPause = true;
    getScoreboard();
    clearAll();
    document.getElementById("menu").style.opacity = 1; // Set opacity to 1
    hideDataGame();
    document.querySelector(".gradient").style.opacity = 0;

}

document.addEventListener("keyup", function (event) {
    if ((event.key === "Escape" || event.key === "p" || event.key === "P")&& !forbiddenPause) {
        togglePause();
    }
});

function showTransitionScreen(message) {
    clearEnemies();
    clearLasers();

    let levelTransitionScreen = document.createElement('p')
    let messageTransitionScreen = document.createElement('p')
    levelTransitionScreen.textContent = `LEVEL ${level}`
    messageTransitionScreen.textContent = message;

    transitionScreen.appendChild(levelTransitionScreen)
    transitionScreen.appendChild(messageTransitionScreen)
    document.body.appendChild(transitionScreen);

    transitionScreen.style.backgroundColor = 'black';
    transitionScreen.style.color = 'white';
    transitionScreen.style.fontSize = '36px';
    transitionScreen.style.position = 'absolute';
    transitionScreen.style.top = '50%';
    transitionScreen.style.left = '50%';
    transitionScreen.style.transform = 'translate(-50%, -50%)';

    document.getElementById('background').style.backgroundImage = 'none';
    document.getElementById('background').style.backgroundColor = 'black';

    setTimeout(() => {
        transitionScreen.remove();
        levelTransitionScreen.remove()
        messageTransitionScreen.remove()
        document.getElementById('background').style.backgroundImage = `url('/img/background${level - 1}.jpg')`;
        document.getElementById('background').style.backgroundColor = 'initial';
    }, 2000);
}

function showGameOverScreen() {
    forbiddenPause = true;
    const endTime = new Date();
    const timePlayed = Math.floor((endTime - startTime) / 1000);
    clearAll();
    hideDataGame();
    document.querySelector(".centeredSquare").style.opacity = 0;

    
    const gameOverScreen = document.createElement('div');
    gameOverScreen.id = 'gameOverScreen';
    
    const gameOverText = document.createElement('h2');
    const storyText = document.createElement('p');
    if (bossHealth > 0) {
        gameOverText.textContent = 'GAME OVER';
        storyText.textContent = 'Unfortunately, the Zorgons have overwhelmed your defenses. The galaxy mourns your valiant effort, Captain Neo.'
    } else {
        gameOverText.textContent = 'CONGRATULATIONS';
        storyText.textContent = 'Congratulations, Captain Neo! You have successfully defeated the final boss and saved the galaxy! Your valor and skill in combat will be remembered for generations to come. Thank you for playing Space Saver!'
    }
    
    const scoreText = document.createElement('p');
    scoreText.textContent = 'Your final score is: ' + score;
    
    const levelText = document.createElement('p');
    levelText.textContent = 'You were at level: ' + level;
    
    const timePlayedElement = document.createElement('p');
    timePlayedElement.textContent = `Time Played: ${timePlayed} seconds`;

    const form = document.createElement('form');
    const label = document.createElement('label');
    label.textContent = 'Enter your name for the scoreboard:';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'playerName';
    input.name = 'playerName';
    input.required = true; 

    const errorMessage = document.createElement('p');
    errorMessage.style.color = 'red';

    const submitButton = document.createElement('button');
    submitButton.type = 'button'; // Prevents the form from being submitted
    submitButton.textContent = 'Submit';
    submitButton.addEventListener('click', function () {
        const playerName = input.value;
        if (playerName.trim() !== '') {
            updateScoreboard(playerName, score, formatTime(timePlayed));
            resetValues();
            showMenu();
            gameOverScreen.remove();
        } else {
            errorMessage.textContent = 'Please enter a valid name.';
        }
    });
    gameOverScreen.appendChild(gameOverText);
    gameOverScreen.appendChild(storyText)
    gameOverScreen.appendChild(scoreText);
    gameOverScreen.appendChild(levelText);
    gameOverScreen.appendChild(timePlayedElement);
    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(errorMessage);
    form.appendChild(submitButton);
    gameOverScreen.appendChild(form);
    document.body.appendChild(gameOverScreen);
}

function hideDataGame(){
    const healthElement = document.getElementById('health');
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const clockElement = document.getElementById('clock');
    if (healthElement) {
        healthElement.style.opacity = '0';
    }
    if (scoreElement) {
        scoreElement.style.opacity = '0';
    }
    if (levelElement) {
        levelElement.style.opacity = '0';
    }
    if (clockElement) {
        clockElement.style.opacity = '0';
    }
}

function showPauseScreen() {
    const pauseScreen = document.createElement('div');
    pauseScreen.id = 'pauseScreen';
    const pauseScreenText = document.createElement('h2');
    pauseScreenText.textContent = 'Pause';

    const pauseButton = document.createElement('button');
    pauseButton.textContent = 'Continue';
    pauseButton.addEventListener('click', function () {
        togglePause();
    });
    const pauseButton2 = document.createElement('button');
    pauseButton2.textContent = 'Restart';
    pauseButton2.addEventListener('click', function () {
        isPaused = !isPaused;
        clearAll();
        resetValues();
        startGame(1500, colorShip);
        pauseScreen.remove();
    });
    const pauseButton3 = document.createElement('button');
    pauseButton3.textContent = 'Back to Menu';
    pauseButton3.addEventListener('click', function () {
        isPaused = !isPaused;
        clearAll();
        resetValues();
        showMenu();
        document.querySelector(".centeredSquare").style.opacity = 0;
        pauseScreen.remove();
    });
    pauseScreen.appendChild(pauseScreenText);
    pauseScreen.appendChild(pauseButton);
    pauseScreen.appendChild(pauseButton2);
    pauseScreen.appendChild(pauseButton3);
    document.body.appendChild(pauseScreen);
}

// ENEMY //

function getRandomClass() {
    const classes = ["green", "red", "yellow", "blue"];
    const randomIndex = Math.floor(Math.random() * classes.length);
    return classes[randomIndex];
}

function createRandomEnemy(color) {
    if (isPaused) {
        return;
    }

    let enemy = document.createElement("div");
    let laserColor = getRandomClass();
    enemy.className = "enemy " + laserColor;
    enemy.dataset.color = laserColor;
    let randomHorizontalPosition = Math.floor(Math.random() * (centeredAreaWidth - starshipWidth));
    enemy.style.left = centeredAreaLeft + randomHorizontalPosition + "px";
    document.body.append(enemy);

    function moveEnemy() {
        if (isPaused) {
            requestAnimationFrame(moveEnemy);
            return;
        }

        const enemyPosition = enemy.getBoundingClientRect();
        enemy.style.top = enemy.offsetTop + 3 + "px";

        const starship = document.getElementById("starship");
        const starshipPosition = starship.getBoundingClientRect();

        if (
            enemyPosition.bottom >= starshipPosition.top &&
            enemyPosition.top <= starshipPosition.bottom &&
            enemyPosition.right >= starshipPosition.left &&
            enemyPosition.left <= starshipPosition.right
        ) {
            explosionsound.play();
            aiesound.play();
            updateHealth(-1, color);
            enemy.remove();
            return;
        }

        if (enemyPosition.top > window.innerHeight) {
            enemy.remove();
        } else {
            requestAnimationFrame(moveEnemy);
        }
    }

    moveEnemy();
}

function createEnemyLaser(color) {
    const enemies = document.querySelectorAll(".enemy");
    enemies.forEach((enemy) => {
        if (Math.random() < 0.5) {
            launchEnemyLaser(enemy, color);
        } 
    });
}

function launchEnemyLaser(enemy, color) {
    let enemyLaser = document.createElement("div");
    enemyLaser.className = "enemylaser " + enemy.dataset.color;
    const enemyPosition = enemy.getBoundingClientRect();

    enemyLaser.style.left = enemyPosition.left + "px";
    enemyLaser.style.top = enemyPosition.bottom + "px";

    document.body.append(enemyLaser);

    function moveEnemyLaser() {
        if (isPaused) {
            requestAnimationFrame(moveEnemyLaser);
            return;
        }

        const enemyLaserPosition = enemyLaser.getBoundingClientRect();
        if (enemy.dataset.color == "green") {
            enemyLaser.style.top = enemyLaser.offsetTop + 10 + "px";
        } else if (enemy.dataset.color == "blue") {
            enemyLaser.style.top = enemyLaser.offsetTop + 5 + "px";
            enemyLaser.style.left = enemyLaser.offsetLeft - 2 + "px";
        } else if (enemy.dataset.color == "red") {
            enemyLaser.style.top = enemyLaser.offsetTop + 5 + "px";
            enemyLaser.style.left = enemyLaser.offsetLeft + 2 + "px";
        } else {
            enemyLaser.style.top = enemyLaser.offsetTop + 5 + "px";
        }
        const starship = document.getElementById("starship");
        const starshipPosition = starship.getBoundingClientRect();

        if (
            enemyLaserPosition.bottom >= starshipPosition.top &&
            enemyLaserPosition.top <= starshipPosition.bottom &&
            enemyLaserPosition.right >= starshipPosition.left &&
            enemyLaserPosition.left <= starshipPosition.right
        ) {
            explosionsound.play();
            aiesound.play();
            updateHealth(-1, color);
            enemyLaser.remove();
        }

        if (enemyLaserPosition.top > window.innerHeight) {
            enemyLaser.remove();
        } else {
            requestAnimationFrame(moveEnemyLaser);
        }
    }
    moveEnemyLaser();
}

function removeEnemy(enemy) {
    enemy.style.backgroundImage = "url('/img/damage1.png')";
    setTimeout(() => {
        enemy.style.backgroundImage = "url('/img/damage2.png')";
        setTimeout(() => {
            enemy.style.backgroundImage = "url('/img/damage3.png')";
            setTimeout(() => {
                enemy.remove();
            }, 100);
        }, 100);
    }, 100);
}

// PLAYER //

function launchLaser(color) {
    if (isPaused) {
        return;
    }

    let laser = document.createElement("div");
    laser.className = "laser";
    const starship = document.getElementById("starship");
    const starshipPosition = starship.getBoundingClientRect();
    laser.style.left = starshipPosition.left - 3 + "px";
    laser.style.top = starshipPosition.top + "px";

    laser.style.backgroundImage = `url('/img/laser_${color}.png')`;

    document.body.append(laser);

    function moveLaser() {
        if (isPaused) {
            requestAnimationFrame(moveLaser);
            return;
        }

        const laserPosition = laser.getBoundingClientRect();
        laser.style.top = laser.offsetTop - 10 + "px";
        if (level === 6) {
            const reacteurGauche = document.querySelector(".reacteur.gauche");
            const reacteurGauchePosition = reacteurGauche.getBoundingClientRect();
            const reacteurDroit = document.querySelector(".reacteur.droit");
            const reacteurDroitPosition = reacteurDroit.getBoundingClientRect();

            if (
                (laserPosition.bottom >= reacteurGauchePosition.top &&
                    laserPosition.top <= reacteurGauchePosition.bottom &&
                    laserPosition.right >= reacteurGauchePosition.left &&
                    laserPosition.left <= reacteurGauchePosition.right)
            ) {
                explosionsound.play();
                laser.remove();
                if (bossHealth >= 1) {
                    bossHealth -= 1;
                    console.log(bossHealth);
                    updateBossHealth();
                }
            }

            if (
                (laserPosition.bottom >= reacteurDroitPosition.top &&
                    laserPosition.top <= reacteurDroitPosition.bottom &&
                    laserPosition.right >= reacteurDroitPosition.left &&
                    laserPosition.left <= reacteurDroitPosition.right)
            ) {
                explosionsound.play();
                laser.remove();
                if (bossHealth >= 1) {
                    bossHealth -= 1;
                    updateBossHealth();
                }
            }

            if (bossHealth <= 0) {
                updateScore(100);
                showGameOverScreen();
                document.querySelectorAll('.laser').forEach((laser) => laser.remove());
            }
        }

        
        const enemies = document.querySelectorAll(".enemy");
        enemies.forEach((enemy) => {
            if (enemy.dataset.hit !== "true") {
                const enemyPosition = enemy.getBoundingClientRect();

                if (
                    enemyPosition.bottom >= laserPosition.top &&
                    enemyPosition.top <= laserPosition.bottom &&
                    enemyPosition.right >= laserPosition.left &&
                    enemyPosition.left <= laserPosition.right
                ) {
                    enemy.dataset.hit = "true";
                    explosionsound.play();
                    updateScore(level*1);
                    laser.remove();
                    removeEnemy(enemy);
                }
            }
        });

        if (laserPosition.bottom < 0) {
            laser.remove();
        } else {
            requestAnimationFrame(moveLaser);
        }
    }
    moveLaser();
}

document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
        leftArrowPressed = true;
    } else if (event.key === "ArrowRight") {
        rightArrowPressed = true;
    } else if (event.key === "ArrowUp") {
        upArrowPressed = true;
    } else if (event.key === "ArrowDown") {
        downArrowPressed = true;
    }
});

document.addEventListener("keyup", function (event) {
    if (event.key === "ArrowLeft") {
        leftArrowPressed = false;
    } else if (event.key === "ArrowRight") {
        rightArrowPressed = false;
    } else if (event.key === "ArrowUp") {
        upArrowPressed = false;
    } else if (event.key === "ArrowDown") {
        downArrowPressed = false;
    }
});

function moveStarship() {
    if (!isPaused) {
        const starship = document.getElementById("starship");
        const starshipPosition = starship.getBoundingClientRect();

        if (leftArrowPressed && starshipPosition.left > centeredAreaLeft + 10) {
            starship.style.left = Math.max(starship.offsetLeft - 10, centeredAreaLeft) + "px";
        }
        if (rightArrowPressed && starshipPosition.left < centeredAreaLeft + centeredAreaWidth - 10) {
            starship.style.left = Math.min(starship.offsetLeft + 10, centeredAreaLeft + centeredAreaWidth - starshipWidth) + "px";
        }
        if (upArrowPressed && starshipPosition.top > centeredAreaTop + 10) {
            starship.style.top = Math.max(starship.offsetTop - 10, centeredAreaTop) + "px";
        }
        if (downArrowPressed && starshipPosition.bottom < centeredAreaTop + centeredAreaHeight - 10) {
            starship.style.top = Math.min(starship.offsetTop + 10, centeredAreaTop + centeredAreaHeight - starshipHeight) + "px";
        }
    }
    requestAnimationFrame(moveStarship);
}

// UPDATE FUNCTIONS //

function updateHealth(amount, color) {
    if (isInvulnerable) {
        return;
    }
    if (amount < 0) {
        isInvulnerable = true;
        blink();
    }
    health += amount;
    const healthElement = document.getElementById("health");
    healthElement.textContent = ""

    for (let i = 0; i < health; i++) {
        const heartElement = document.createElement("div");
        heartElement.classList.add("health-heart");
        heartElement.style.backgroundImage = `url('/img/life_${color}.png')`;

        healthElement.appendChild(heartElement);
    }
    if (health <= 0) {
        showGameOverScreen();
    }
}

function blink() {
    const spaceship = document.getElementById("starship");
    // interval de blink
    const blinkInterval = setInterval(() => {
        spaceship.style.visibility =
            spaceship.style.visibility === "visible" ? "hidden" : "visible";
    }, 80);
    // apres 2s enleve le blink
    setTimeout(() => {
        clearInterval(blinkInterval);
        spaceship.style.visibility = "visible";
        isInvulnerable = false;
    }, 2000);
}

function updateScore(amount) {
    score += amount;
    const scoreElement = document.getElementById("score");
    scoreElement.textContent = "Score: " + score;
}

function updateLevel(amount) {
    if (!isPaused) {
        level += amount;
        showTransitionScreen(`Well done, Captain Neo! A new wave is coming!`)
        let background = document.getElementById('background')
        background.style.backgroundImage = `url('/img/background${level}.jpg')`
        const levelElement = document.getElementById("level");
        levelElement.textContent = "Level: " + level;
    }
}

function updateVolume() {
    music.volume = volumeSlider.value;
}

function updateClock() {
    const clockElement = document.getElementById("clock");
    if (clockElement && !isPaused) {
        const endTime = new Date();
        timePlayed = ifPauseTime + Math.floor((endTime - startTime) / 1000);
        clockElement.textContent = `Time Played: ${timePlayed} seconds`;
        if (timePlayed % 5 == 0 && level < 5) {
            function createEnemyInterval() {
                return setInterval(() => {
                    createRandomEnemy(color);
                }, currentGameSpeed);
            }
            updateLevel(1);
            currentGameSpeed = Math.max(currentGameSpeed - (level * 100), 333);
            console.log(currentGameSpeed);
            clearInterval(enemyIntervalId);
            enemyIntervalId = createEnemyInterval();
        } else if (level == 5 && timePlayed % 5 == 0) {
            updateLevel(1);
            createBoss();
        }
    }
}

// SCOREBOARD API GO //

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

function updateScoreboard(name, score, time) {
    const scoreboardData = {
        name: name,
        rank: 0,
        score: score,
        time: time,
    };
    fetch('http://localhost:8080/addscore', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(scoreboardData),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Scoreboard updated:', data);
            getScoreboard();
        })
        .catch(error => {
            console.error('Error updating scoreboard:', error);
        });
}

function getScoreboard() {
    fetch('http://localhost:8080/getscoreboard')
        .then(response => response.json())
        .then(data => {
            console.log('Scoreboard data:', data);
            showScoreboard(data, 1, 5);;
        })
        .catch(error => {
            console.error('Error fetching scoreboard:', error);
        });
}

function showScoreboard(scoreboardData, currentPage = 1, itemsPerPage = 5) {
    const scoreboardContainer = document.querySelector('.scoreboard');
    scoreboardContainer.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    for (let i = startIndex; i < Math.min(endIndex, scoreboardData.length); i++) {
        const entry = scoreboardData[i];
        const entryDiv = document.createElement('div');
        entryDiv.classList.add('scoreboard-entry');
        entryDiv.innerHTML = `<strong>Rank ${i + 1}:</strong> ${entry.name} - Score: ${entry.score} - Time: ${entry.time}`;
        scoreboardContainer.appendChild(entryDiv);
    }

    // Display pagination information
    const totalPages = Math.ceil(scoreboardData.length / itemsPerPage);
    const paginationInfo = document.createElement('div');
    paginationInfo.classList.add('pagination-info');
    paginationInfo.innerHTML = `<br><div>Page ${currentPage}/${totalPages}</div><br>`;
    scoreboardContainer.appendChild(paginationInfo);

    const paginationContainer = document.createElement('div');
    paginationContainer.classList.add('pagination-container');

    for (let page = 1; page <= totalPages; page++) {
        const paginationButton = document.createElement('button');
        paginationButton.innerText = page;
        paginationButton.addEventListener('click', () => showScoreboard(scoreboardData, page, itemsPerPage));
        paginationContainer.appendChild(paginationButton);
    }

    scoreboardContainer.appendChild(paginationContainer);
}

// COMPTEUR FPS

function updateFPS() {
    frameCount++;

    if (!startTimeFPS) {
        startTimeFPS = performance.now();
    }

    const currentTime = performance.now();
    const elapsedTime = currentTime - startTimeFPS;

    if (elapsedTime >= 1000) {
        const fps = (frameCount / elapsedTime) * 1000;
        fpsDisplay.textContent = `FPS: ${fps.toFixed(2)}`;
        frameCount = 0;
        startTimeFPS = currentTime;
    }
    animationFrameId = requestAnimationFrame(updateFPS);
}

// BOSS //

function createBoss() {
    console.log(level)
    console.log(bossHealth)
    console.log(health)
    var mainDiv = document.createElement("div");
    mainDiv.className = "boss";
    var bossGifDiv = document.createElement("div");
    bossGifDiv.className = "boss-gif";

    var reacteurGaucheDiv = document.createElement("div");
    reacteurGaucheDiv.className = "reacteur gauche";

    var reacteurDroitDiv = document.createElement("div");
    reacteurDroitDiv.className = "reacteur droit";

    var tripleLaserGextDiv = createTripleLaserDiv("gext");
    var tripleLaserGintDiv = createTripleLaserDiv("gint");
    var tripleLaserRintDiv = createTripleLaserDiv("rint");
    var tripleLaserRextDiv = createTripleLaserDiv("rext");
    mainDiv.appendChild(bossGifDiv);
    mainDiv.appendChild(reacteurGaucheDiv);
    mainDiv.appendChild(reacteurDroitDiv);
    mainDiv.appendChild(tripleLaserGextDiv);
    mainDiv.appendChild(tripleLaserGintDiv);
    mainDiv.appendChild(tripleLaserRintDiv);
    mainDiv.appendChild(tripleLaserRextDiv);
    document.body.appendChild(mainDiv);
    function createTripleLaserDiv(className) {
        var tripleLaserDiv = document.createElement("div");
        tripleLaserDiv.className = "triple-laser " + className;
        for (var i = 0; i < 3; i++) {
            var miniLaserDiv = document.createElement("div");
            miniLaserDiv.className = "mini-laser";
            tripleLaserDiv.appendChild(miniLaserDiv);
        }

        return tripleLaserDiv;
    }
    let bossHealthBar = document.createElement("div")
    bossHealthBar.className = "boss-health-bar"
    document.body.appendChild(bossHealthBar)
    clearInterval(enemyLaserIntervalId);
    clearInterval(enemyIntervalId);
    document.querySelectorAll('.enemylaser').forEach(enemyLaser => enemyLaser.remove());
    document.querySelectorAll('.enemy').forEach(enemy => enemy.remove());
    bossLaserIntervalId = setInterval(() => {
        launchBossLaser();
    }, 1800);
}

function updateBossHealth() {
    const bossHealthBar = document.querySelector(".boss-health-bar");
    const percentage = (bossHealth / 25) * 100;
    bossHealthBar.style.width = percentage + "%";
}

function launchBossLaser() {
    const bossLasers = [];
    document.querySelectorAll('.mini-laser').forEach((miniLaserGext) => {
        let miniLasersGextPosition = miniLaserGext.getBoundingClientRect();
        let bossLaser = document.createElement("div");
        bossLaser.className = "bosslaser";
        bossLaser.style.left = miniLasersGextPosition.left + "px";
        bossLaser.style.top = miniLasersGextPosition.bottom + "px";

        document.body.append(bossLaser);
        bossLasers.push(bossLaser);
    });

    function moveBossLasers() {
        if (isPaused) {
            requestAnimationFrame(moveBossLasers);
            return;
        }

        bossLasers.forEach((bossLaser) => {
            const bossLaserPosition = bossLaser.getBoundingClientRect();
            bossLaser.style.top = bossLaser.offsetTop + 3 + "px";
            const starship = document.getElementById("starship");
            const starshipPosition = starship.getBoundingClientRect();

            if (
                bossLaserPosition.bottom >= starshipPosition.top &&
                bossLaserPosition.top <= starshipPosition.bottom &&
                bossLaserPosition.right >= starshipPosition.left &&
                bossLaserPosition.left <= starshipPosition.right
            ) {
                explosionsound.play();
                aiesound.play();
                updateHealth(-1, color);
                bossLaser.remove();
            }
            if (bossLaserPosition.top > window.innerHeight) {
                bossLaser.remove();
            }
        });

        requestAnimationFrame(moveBossLasers);
    }

    moveBossLasers();
}

// CLEAR OR RESET FUNCTIONS

function resetFPS() {
    frameCount = 0;
    startTimeFPS = null;
    fpsDisplay.textContent = 'FPS: 0.00';
    cancelAnimationFrame(animationFrameId);
}

function resetValues() {
    level = 1;
    score = 0;
    health = 3;
    bossHealth = 25;
    timePlayed = 0;
    ifPauseTime = 0;
    frameCount = 0;
}

function clearEnemies() {
    document.querySelectorAll('.enemy').forEach((enemy) => enemy.remove());
}

function clearLasers() {
    document.querySelectorAll('.laser').forEach((laser) => laser.remove());
    document.querySelectorAll('.enemylaser').forEach((enemyLaser) => enemyLaser.remove());
}

function clearAll() {
    clearInterval(enemyIntervalId);
    clearInterval(laserIntervalId);
    clearInterval(enemyLaserIntervalId);
    clearInterval(timeIntervalId);
    clearInterval(bossLaserIntervalId)
    document.querySelectorAll('.enemy').forEach(enemy => enemy.remove());
    document.querySelectorAll('.laser').forEach(laser => laser.remove());
    document.querySelectorAll('.enemylaser').forEach(enemyLaser => enemyLaser.remove());
    document.querySelectorAll('.boss').forEach(boss => boss.remove());
    document.querySelectorAll('.boss-health-bar').forEach(bar => bar.remove());
    document.querySelectorAll('.bosslaser').forEach((enemyLaser) => enemyLaser.remove());

}

// START GAME //

showMenu();

moveStarship();


// TILEMAP
/* const canvas = document.getElementById('tilemap')
const canvasCtx = canvas.getContext('2d')

const squareSize = 100, columns = centeredAreaWidth / squareSize, lines = centeredAreaHeight / squareSize

const tileset = new Image()
tileset.onload = () => {
    canvas.width = centeredAreaWidth
    canvas.height = centeredAreaHeight
    drawTileMap(menuTileMap,0)
}

tileset.src = 'img/tileset.png'

function drawTileMap(tileMap, tilePalet) {
    canvasCtx.clearRect(0,0,centeredAreaWidth, centeredAreaHeight)
    for (let i = 0; i < lines; i ++) {
        for (let j = 0; j < columns; j++) {
            const tileId = 10 * tileMap[i * columns + j] + tilePalet, tileX = Math.floor(tileId % 10), tileY = Math.floor(tileId/10)
            canvasCtx.drawImage(tileset, tileX * 32,tileY * 32,32,32, j*squareSize, i*squareSize, squareSize, squareSize)
        }
    }
    tilePalet = (tilePalet+1)%10
}
const levelTileMap = 
[
    6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
    6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,
    6,7,6,6,6,6,6,6,6,6,6,6,6,6,7,6,
    6,7,6,7,7,7,7,7,7,7,7,7,7,6,7,6,
    6,7,6,7,6,6,6,6,6,6,6,6,7,6,7,6,
    6,7,6,7,6,6,6,6,6,6,6,6,7,6,7,6,
    6,7,6,7,7,7,7,7,7,7,7,7,7,6,7,6,
    6,7,6,6,6,6,6,6,6,6,6,6,6,6,7,6,
    6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,
    6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
    7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
    7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
]

const menuTileMap = 
[
    6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
    6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,
    6,7,6,6,6,6,6,6,6,6,6,6,6,6,7,6,
    6,7,6,7,7,7,7,7,7,7,7,7,7,6,7,6,
    6,7,6,7,6,6,6,6,6,6,6,6,7,6,7,6,
    6,7,6,7,6,7,7,7,7,7,7,6,7,6,7,6,
    6,7,6,7,6,7,7,7,7,7,7,6,7,6,7,6,
    6,7,6,7,6,6,6,6,6,6,6,6,7,6,7,6,
    6,7,6,7,7,7,7,7,7,7,7,7,7,6,7,6,
    6,7,6,6,6,6,6,6,6,6,6,6,6,6,7,6,
    6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,
    6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
]

const storyTileMap = 
[
    8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,
    8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,
    6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
    6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,
    6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,
    6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,
    6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,
    6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,
    6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,
    6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,
    6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,6,
    6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
] */