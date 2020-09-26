const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const GFORCE = 1;

let score;
let highScore;
let player;
let gravity;
let obstacles = [];
let grounds = [];
let gameSpeed;
let keys = {};

// event catcher
document.addEventListener('keydown', function(evt) {
    keys[evt.code] = true;
});

document.addEventListener('keyup', function(evt) {
    keys[evt.code] = false;
});

class Player 
{
    constructor(x, y, w, h, c)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = c;

        this.dy = 0;
        this.jumpForce = 10;
        this.originalHeight = h;
        this.isGrounded = false;
    }

    draw() 
    {
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.w, this.h);
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.closePath();
    }

    animate() 
    {
        console.log(this.isGrounded);
        // Jump
        if (keys['Space'])
        {
            this.jump(2);
        }
        else if (keys['KeyW'])
        {
            this.jump(1);
        }
        else if (keys['KeyS'])
        {
            if (this.isGrounded)
            {
                this.h = this.originalHeight / 2;
                //this.y += this.originalHeight / 2;
                this.isGrounded = false;
            }
            else
            {
                gravity = GFORCE * gameSpeed;
            }
        }
        else
        {
            this.h = this.originalHeight;
            this.jumpTimer = 0;
        }

        // change position
        this.y += this.dy;

        // Fall
        if (player.isGrounded == false) 
        {
            this.dy += gravity;
        }
        else
        {
            gravity = GFORCE;
            this.dy = 0;
        }

        this.draw();
    }

    jump(type)
    {
        if (this.isGrounded && this.jumpTimer == 0) 
        {
            this.jumpTimer = 1;
            this.dy -= this.jumpForce * type;    
        } 
        else if (this.jumpTimer > 0 && this.jumpTimer < 15) 
        {
            this.jumpTimer++;
            this.dy = -this.jumpForce * type - (this.jumpTimer / 50);
        }
    }
}

class Ground
{
    constructor(x, y, w, h, spd)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = 'black';
        this.spd = spd;

        this.dx = 0 - gameSpeed;
    }

    update()
    {
        this.x += this.dx * this.spd;
        this.draw();
        this.dx = 0 - gameSpeed;
    }

    draw()
    {
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.closePath();
    }
}

class Obstacle 
{
    constructor(x, y, w, h, c, spd) 
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = c;
        this.spd = spd;

        this.dx = 0 - gameSpeed;
    }

    update()
    {
        this.x += this.dx * this.spd;
        this.draw();
        this.dx = 0 - gameSpeed;
    }

    draw()
    {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = this.c;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.closePath();
    }
}

class Text
{
    constructor(t, x, y, a, c, s)
    {
        this.t = t;
        this.x = x;
        this.y = y;
        this.a = a;
        this.c = c;
        this.s = s;
    }

    draw()
    {
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.font = this.s + 'px sans-serif';
        ctx.textAlign = this.a;
        ctx.fillText(this.t, this.x, this.y);
        ctx.closePath();
    }
}

function spawnObs()
{
    let posY = randomIntInRange(1, 6);
    let sizeX = 10;
    let sizeY = randomIntInRange(1, 3);
    let type = randomIntInRange(0, 1);
    let spd = randomIntInRange(10, 15) / 10;

    let obstacle = new Obstacle(canvas.width + sizeX, 
        100 * posY + 10, sizeX, sizeY * 80, '#2484E4', spd);

    if (type == 1)
    {
        obstacle.y -= player.originalHeight - randomIntInRange(10, 20);
        obstacle.h += randomIntInRange(0, 100);
    }

    obstacles.push(obstacle);
}

function spawnGround()
{
    let posY = randomIntInRange(1, 6);
    let sizeX = randomIntInRange(300, 800);
    let spd = randomIntInRange(5, 20) / 10;

    let grd = new Ground(canvas.width, posY * 100, sizeX, 20, spd);

    grounds.push(grd);
}

function randomIntInRange(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function init()
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.font = "20px sans-serif";

    gameSpeed = 12;
    gravity = GFORCE;
    score = 0;
    highScore = 0;

    player = new Player(canvas.width / 3, canvas.height - 150, 50, 50, 'red ');
    
    scoreText = new Text("Score: " + score, 125, 50, "center", "#101010", "20");
    highScoreText = new Text("Highscore: " + highScore, 600, 50, "right", 'yellow', "30");
    replayText = new Text("Replay", canvas.width / 2, canvas.height / 3, "center", "linear-gradient(#c6ffd, #fbd786, #f7797d)", "80")

    requestAnimationFrame(update);
}

function end()
{
    grounds = [];
    obstacles = [];
    score = 0;
    spawnTimer = initialSpawnTimer;
    gameSpeed = 3;

    replayText.draw();
}

let initialSpawnTimer = 60;
let spawnTimer = 60;
function update()
{
    requestAnimationFrame(update);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    spawnTimer--;
    if (spawnTimer <= 0)
    {
        spawnObs();
        spawnGround();
        spawnGround();
        spawnTimer = randomIntInRange(120, 200);
    }

    for (let i = 0; i < grounds.length; i++) {
        let g = grounds[i];
        if (g.x + g.width < 0) 
        {
            grounds.splice(i, 1);
        }
        else 
        {
            g.update();
        }
    }

    for (let i = 0; i < grounds.length; i++) 
    {
        let g = grounds[i];
        player.isGrounded = false;
        if (
            player.x <= g.x + g.w &&
            player.x + player.w >= g.x &&
            player.y <= g.y + g.h &&
            player.y + player.h >= g.y
        )
        {
            console.log('collide');
            player.isGrounded = true;
            player.y = g.y - player.h + 1;
            break;
        }

        if (player.y >= canvas.height - player.h)
        {
            player.isGrounded = true;
            player.y = canvas.height - player.h;
            break;
        }
    }

    for (let i = 0; i < obstacles.length; i++) {
        let o = obstacles[i];
        if (o.x + o.width < 0)
        {
            obstacles.splice(i, 1);
        }
        else
        {
            o.update();
        }

        if (
            player.x < o.x + o.w &&
            player.x + player.w > o.x &&
            player.y < o.y + o.h &&
            player.y + player.h > o.y
        )
        {
            end();
        }
    }

    player.animate();

    score++;
    scoreText.t = "Score: " + score;
    scoreText.draw();

    highScore = Math.max(highScore, score);
    highScoreText.t = "Highscore: " + highScore;
    highScoreText.draw();
}

init();