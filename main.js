const body = document.querySelector('body');
const welcome = document.querySelector('.welcome')
const welcomePara = document.querySelector('.welcome p')
const yesBtn = document.querySelector('.Yes');
const noBtn = document.querySelector('.No');
const game = document.querySelector('.game');
const gameHead = document.createElement('h1');
const homeWelcome = document.querySelector('.homeWelcome');
const audio = document.querySelector('.audio')


const homeHeadWelcome = document.createElement('h1');
const list = document.createElement('ul');
list.classList.add('level');

for (let i = 1; i <= 5; i++) {
    const listLevel = document.createElement('li');
    const playBtn = document.createElement('button')
    playBtn.className = `${i}`
    playBtn.textContent = 'Play';
    listLevel.textContent = `Level: ${i}`
    listLevel.appendChild(playBtn);
    list.appendChild(listLevel);
    listLevel.classList.add('level-header');
    playBtn.classList.add('level-play');

    playBtn.addEventListener('click', setNStart)


}

homeHeadWelcome.textContent = 'Welcome to the Breakout game.'

homeWelcome.appendChild(homeHeadWelcome);
homeWelcome.appendChild(list);
homeWelcome.style.display = 'none';


gameHead.textContent = "Breakout"
game.appendChild(gameHead);
const para = document.createElement('p');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

let mike1;
let level = Number(localStorage.level) || 1;
let speed = 1;
let velocity = 10;
if (!localStorage.level) {
    localStorage.setItem('level', '1')
}

if (level > 5) {
    localStorage.setItem('level', '1')
    level = 1
}


if (level > 1) {
    welcomePara.innerHTML = `Do you want to Continue from level ${level}?`
}
game.appendChild(gameHead);
game.appendChild(para);
game.appendChild(canvas);
game.style.display = 'none';


yesBtn.addEventListener('click', startGame)
noBtn.addEventListener('click', gameHome)

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
let mike;
let db;
let gameAudio;
let gameOverAudio;
let buttonClick;

let gameAudioPromise;
let gameOverAudioPromise;
let buttonClickPromise;
let audios = [
    { 'name': 'gameaudio' },
    { 'name': 'gameover' },
    { 'name': 'buttonclick' }
]



function init() {
    // Loop through the audio names one by one
    for (const audio of audios) {
        // Open transaction, get object store, and get() each audio by name
        const objectStore = db.transaction('audio_os').objectStore('audio_os');
        const request = objectStore.get(audio.name);
        request.addEventListener('success', () => {
            // If the result exists in the database (is not undefined)
            if (request.result) {
                // Grab the audios from IDB and display them using displayAudio()
                console.log('taking audio from IDB');
                displayAudio(request.result.audio, request.result.name);
            } else {
                // Fetch the audios from the network
                fetchAudioFromNetwork(audio);
            }
        });
    }
}


function fetchAudioFromNetwork(audio) {
    console.log('fetching audio from network');
    // Fetch the MP4 and WebM versions of the video using the fetch() function,
    // then expose their response bodies as blobs
    const audioBlob = fetch(`${audio.name}.mp3`).then(response => response.blob());

    // Only run the next code when both promises have fulfilled
    audioBlob.then(values => {
        // display the video fetched from the network with displayVideo()
        displayAudio(values, audio.name);
        // store it in the IDB using storeVideo()
        storeAudio(values, audio.name);
    });
}


function storeAudio(audioBlob, name) {
    // Open transaction, get object store; make it a readwrite so we can write to the IDB
    const objectStore = db.transaction(['audio_os'], 'readwrite').objectStore('audio_os');
    // Create a record to add to the IDB
    const record = {
        audio: audioBlob,
        name: name
    }

    // Add the record to the IDB using add()
    const request = objectStore.add(record);

    request.addEventListener('success', () => console.log('Record addition attempt finished'));
    request.addEventListener('error', () => console.error(request.error));
}


function displayAudio(audioBlob, name) {
    // Create object URLs out of the blobs
    const audioURL = URL.createObjectURL(audioBlob);
    if (name == 'gameaudio') {
        gameAudio = document.createElement('audio');

        gameAudio.autoplay = false;
        const source1 = document.createElement('source');
        source1.src = audioURL;
        source1.type = 'audio/mp3';
        audio.appendChild(gameAudio);
        gameAudio.appendChild(source1);
        gameAudio.load()
        gameAudio.style.display = 'none';

    }
    if (name == 'gameover') {
        gameOverAudio = document.createElement('audio');

        gameOverAudio.autoplay = false;
        const source2 = document.createElement('source');
        source2.src = audioURL;
        source2.type = 'audio/mp3';
        audio.appendChild(gameOverAudio);
        gameOverAudio.appendChild(source2);
        gameOverAudio.load()
        gameOverAudio.style.display = 'none';

    }
    if (name == 'buttonclick') {
        buttonClick = document.createElement('audio');

        buttonClick.autoplay = false;
        const source3 = document.createElement('source');
        source3.src = audioURL;
        source3.type = 'audio/mp3';
        audio.appendChild(buttonClick);
        buttonClick.appendChild(source3);
        buttonClick.load()
        buttonClick.style.display = 'none';

    }

}

const request = window.indexedDB.open('audio_db', 1);

// error handler signifies that the database didn't open successfully
request.addEventListener('error', () => console.error('Database failed to open'));

// success handler signifies that the database opened successfully
request.addEventListener('success', () => {
    console.log('Database opened succesfully');

    // Store the opened database object in the db variable. This is used a lot below
    db = request.result;
    init();
});

// Setup the database tables if this has not already been done
request.addEventListener('upgradeneeded', e => {

    // Grab a reference to the opened database
    const db = e.target.result;

    // Create an objectStore to store our videos in (basically like a single table)
    // including a auto-incrementing key
    const objectStore = db.createObjectStore('audio_os', { keyPath: 'name' });

    // Define what data items the objectStore will contain
    objectStore.createIndex('audio', 'audio', { unique: false });


    console.log('Database setup complete');
});

// Create all the Shapes    
class Shape {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}


class Ball extends Shape {

    constructor(x, y, velX, velY, color, size) {
        super(x, y)
        this.color = color;
        this.size = size;
        this.velX = velX;
        this.velY = velY;
        this.exists = true;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
    }

    update() {
        if ((this.x + this.size) >= width / 2) {
            this.velX = -(this.velX);
        }

        if ((this.x - this.size) <= 0) {
            this.velX = -(this.velX);
        }

        if ((this.y + this.size) >= height / 2) {
            this.exists = false;

        }

        if ((this.y - this.size) <= 0) {
            this.velY = -(this.velY);
        }

        this.x += this.velX;
        this.y += this.velY;
    }



}

class Rect extends Shape {
    constructor(x, y, rWidth, rHeight) {
        super(x, y);
        this.rWidth = rWidth;
        this.rHeight = rHeight;
        this.exists = true;
        this.strength = 1;



    }
    draw() {
        ctx.fillStyle = `rgba(0, 0, 255, ${this.strength})`;
        ctx.fillRect(this.x, this.y, this.rWidth, this.rHeight);
    }
    isCollding() {
        let distX = Math.abs(ball.x - this.x - this.rWidth / 2);
        let distY = Math.abs(ball.y - this.y - this.rHeight / 2);

        if (distX > (this.rWidth / 2 + ball.size)) { return false; }
        if (distY > (this.rHeight / 2 + ball.size)) { return false; }

        if (distX <= (this.rWidth / 2)) { return true; }
        if (distY <= (this.rHeight / 2)) { return true; }

        let dx = distX - this.rWidth / 2;
        let dy = distY - this.rHeight / 2;
        return ((dx * dx) + (dy * dy) <= (ball.size * ball.size));

    }



    collisionDetect() {


        if (this.exists) {
            if (this.isCollding()) {
                this.exists = false;
                ball.velY = -(ball.velY);
            }
        }
    }


}

class MyRect extends Rect {
    constructor(x, y, rWidth, rHeight) {
        super(x, y, rWidth, rHeight);
        this.velX = velocity;
        window.addEventListener('keydown', (e) => {
          
            switch (e.key) {
                case 'ArrowLeft':

                    if (!this.isCollding(ball)) {
                        this.x -= this.velX;
                    }
                    break;
                case 'ArrowRight':
                 
                    if (!this.isCollding(ball)) {
                        this.x += this.velX;
                    }
             break;
        }

        });

    }
    draw() {
        ctx.fillStyle = 'rgba(255, 0, 0, 1)';
        ctx.fillRect(this.x, this.y, this.rWidth, this.rHeight);
    }


    isCollding(ball) {

        let distX = Math.abs(ball.x - this.x - this.rWidth / 2);
        let distY = Math.abs(ball.y - this.y - this.rHeight / 2);

        if (distX > (this.rWidth / 2 + ball.size)) { return false; }
        if (distY > (this.rHeight / 2 + ball.size)) { return false; }

        if (distX <= (this.rWidth / 2)) { return true; }
        if (distY <= (this.rHeight / 2)) { return true; }

        let dx = distX - this.rWidth / 2;
        let dy = distY - this.rHeight / 2;
        return ((dx * dx) + dy * dy <= (ball.size * ball.size));

    }
    checkBounds() {
        if ((this.x + this.rWidth) >= width / 2) {
            this.x = width / 2 - this.rWidth
        }
        if ((this.x) < 0) {
            this.x = 1
        }
    }

    collisionDetect() {
        if (this.isCollding(ball)) {
            mike = new Ball((ball.x + ball.velX), (ball.y - ball.velY), -speed, -speed, 'red', 10)
            if (this.isCollding(mike)) {
                if (ball.x >= this.x + this.rWidth) {
                    this.x -= (this.velX);
                    ball.x += 10 * Math.abs(ball.velX);
                    ball.y -= 10 * Math.abs(ball.velY);
                    ball.velX = Math.abs(ball.velX);
                    ball.velY = Math.abs(ball.velY) * -1;
                    return;
                }
                if (ball.x <= this.x) {
                    this.x += (this.velX);
                    ball.x -= 10 * Math.abs(ball.velX);
                    ball.y -= 10 * Math.abs(ball.velY);
                    ball.velX = Math.abs(ball.velX) * -1;
                    ball.velY = Math.abs(ball.velY) * -1;
                    return;
                }
            }



            ball.velY = -(ball.velY);
        }
    }



}
const rects = [];
let ex = 3;
let wy = 3;

while (rects.length < 9) {

    if (ex + width / 6 - 6 > width / 2) {
        ex = 3;
        wy += 22;

    }
    const rect = new Rect(ex, wy, (width / 6 - 6), 20);
    ex += width / 6;


    rects.push(rect);
}

let ball;
let myRect;
let myReq;

function gameHome(e) {
    e.preventDefault();
    buttonClick.currentTime = 0.10919199999;
    buttonClick.play();
    body.style.backgroundColor = 'white';

    welcome.style.display = 'none';
    homeWelcome.style.display = '';
}

function setNStart(e) {
    body.style.backgroundColor = 'rgb(11, 11, 65)';
    level = Number(e.target.classList[0]);
    localStorage.level = Number(e.target.classList[0]);
    startGame(e);

}
function startGame(e) {

    e.preventDefault();
    buttonClick.currentTime = 0.10919199999;
    buttonClick.play();
    welcome.style.display = 'none';
    homeWelcome.style.display = 'none';
    game.style.display = '';


    checkLevel();
    para.textContent = `Level ${level}`;
    myRect = new MyRect(5, height / 2 - 22, 150, 20);
    ball = new Ball(random(0 + 10, width / 2 - 10), random(70 + 10, height / 2 - 50), -speed, -speed, 'red', 10)
    start();
    gameAudio.currentTime = 0;

}
function start() {

    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'white'
    ctx.strokeRect(0, 0, width / 2, height / 2)
    let blocks = 0;
    gameAudio.play();

    myReq = requestAnimationFrame(start);

    if (ball.exists) {
        ball.draw()
        ball.update()

    }
    else {

        cancelIt(myReq);
        gameFail();
    }


    myRect.draw();
    myRect.checkBounds();
    myRect.collisionDetect();


    for (const rect of rects) {
        if (rect.exists) {
            blocks++
            rect.draw();
            rect.collisionDetect();
        }
    }



    if (!blocks) {
        cancelIt(myReq)
        nextLevel();



    }



}


function cancelIt(myReq) {

    cancelAnimationFrame(myReq);

    gameAudio.pause();

    gameAudio.currentTime = 0;
    game.style.display = 'none';

    welcome.style.display = '';


    for (const rect of rects) {
        rect.exists = true;
        rect.strength = 1;
    }
}
function nextLevel() {
    level += 1;
    let next = level;
    localStorage.level = `${next}`;
    if (level > 1) {
        welcomePara.innerHTML = 'Do you want to proceed to the next level?';
    }
    if (level > 5) {
        welcomePara.innerHTML = 'Do you want to start a new game?';
    }
}
function checkLevel() {
    level = Number(localStorage.level)
    speed = 1;
    velocity = 10;

    if (level > 5) {
        localStorage.setItem('level', '1')
        level = 1
    }


    if (level >= 1) {

        for (const rect of rects) {
            rect.collisionDetect = function () {

                if (this.exists) {
                    if (this.isCollding()) {
                        this.strength -= 1
                        if (this.strength <= 0) {
                            this.exists = false;
                        }


                        if (ball.velX > 0 && ball.velX > 0) {
                            ball.velY = -(ball.velY)
                            return
                        }

                        if (ball.velX < 0 && ball.velX > 0) {
                            ball.velX = -(ball.velX)
                            return
                        }

                        if (ball.velX < 0 && ball.velX < 0) {
                            ball.velY = -(ball.velY)
                            return
                        }

                        if (ball.velX < 0 && ball.velX > 0) {
                            ball.velX = -(ball.velX)
                            return
                        }

                    }
                }

            }
            welcomePara.innerHTML = `Do you want to Continue from level ${level}?`
        }
    }
    if (level >= 2) {
        for (const rect of rects) {
            rect.collisionDetect = function () {

                if (this.exists) {
                    if (this.isCollding()) {
                        this.strength -= 0.5
                        if (this.strength <= 0) {
                            this.exists = false;
                        }


                        if (ball.velX > 0 && ball.velX > 0) {
                            ball.velY = -(ball.velY)
                            return
                        }

                        if (ball.velX < 0 && ball.velX > 0) {
                            ball.velX = -(ball.velX)
                            return
                        }

                        if (ball.velX < 0 && ball.velX < 0) {
                            ball.velY = -(ball.velY)
                            return
                        }

                        if (ball.velX < 0 && ball.velX > 0) {
                            ball.velX = -(ball.velX)
                            return
                        }

                    }
                }

            }
        }

    }
    if (level >= 3) {
        speed++
    }
    if (level >= 4) {

        for (const rect of rects) {
            rect.collisionDetect = function () {

                if (this.exists) {
                    if (this.isCollding()) {
                        this.strength -= 0.34
                        if (this.strength <= 0) {
                            this.exists = false;
                        }


                        if (ball.velX > 0 && ball.velX > 0) {
                            ball.velY = -(ball.velY)
                            return
                        }

                        if (ball.velX < 0 && ball.velX > 0) {
                            ball.velX = -(ball.velX)
                            return
                        }

                        if (ball.velX < 0 && ball.velX < 0) {
                            ball.velY = -(ball.velY)
                            return
                        }

                        if (ball.velX < 0 && ball.velX > 0) {
                            ball.velX = -(ball.velX)
                            return
                        }

                    }
                }
            }
        }
    }
    if (level >= 5) {

        for (const rect of rects) {
            rect.collisionDetect = function () {

                if (this.exists) {
                    if (this.isCollding()) {
                        this.strength -= 0.25
                        if (this.strength <= 0) {
                            this.exists = false;
                        }


                        if (ball.velX > 0 && ball.velX > 0) {
                            ball.velY = -(ball.velY)
                            return
                        }

                        if (ball.velX < 0 && ball.velX > 0) {
                            ball.velX = -(ball.velX)
                            return
                        }

                        if (ball.velX < 0 && ball.velX < 0) {
                            ball.velY = -(ball.velY)
                            return
                        }

                        if (ball.velX < 0 && ball.velX > 0) {
                            ball.velX = -(ball.velX)
                            return
                        }

                    }
                }
            }
        }
    }


}
function gameFail() {
    gameOverAudio.play();
    welcomePara.textContent = 'Do you want to try again?'
}
