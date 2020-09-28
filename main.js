const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const GFORCE = 1;

let score;
let highScore;
let player;
let gravity;
let isRunning;
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
        this._x = x;
        this._y = y;
        this._w = w;
        this._h = h;
        this._c = c;

        this._dy = 0;
        this._jumpForce = 10;
        this._originalHeight = h;
        this._isGrounded = false;
        this._onBlackBar = false;
    }

    draw() 
    {
        ctx.beginPath();
        ctx.fillStyle = this._c;
        ctx.lineWidth = 2;
        ctx.strokeRect(this._x, this._y, this._w, this._h);
        ctx.fillRect(this._x, this._y, this._w, this._h);
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
            if (this._isGrounded)
            {
                this._h = this._originalHeight / 2;
                //this.y += this.originalHeight / 2;
                this._isGrounded = false;
            }
            else
            {
                gravity = GFORCE * gameSpeed;
            }
        }
        else
        {
            this._h = this._originalHeight;
            this._jumpTimer = 0;
        }

        // change position
        this._y += this._dy;

        // Fall
        if (player._isGrounded == false) 
        {
            this._dy += gravity;
        }
        else
        {
            gravity = GFORCE;
            this._dy = 0;
        }

        this.draw();
    }

    jump(type)
    {
        if (this._isGrounded && this._jumpTimer == 0) 
        {
            this._jumpTimer = 1;
            this._dy -= this._jumpForce * type;    
        } 
        else if (this._jumpTimer > 0 && this._jumpTimer < 15) 
        {
            this._jumpTimer++;
            this._dy = -this._jumpForce * type - (this._jumpTimer / 50);
        }
    }
}

class Ground
{
    constructor(x, y, w, h, spd)
    {
        this._x = x;
        this._y = y;
        this._w = w;
        this._h = h;
        this._c = 'black';
        this._spd = spd;

        this._dx = 0 - gameSpeed;
    }

    update()
    {
        this._x += this._dx * this._spd;
        this.draw();
        this._dx = 0 - gameSpeed;
    }

    draw()
    {
        ctx.beginPath();
        ctx.fillStyle = this._c;
        ctx.fillRect(this._x, this._y, this._w, this._h);
        ctx.closePath();
    }
}

class Obstacle 
{
    constructor(x, y, w, h, c, spd) 
    {
        this._x = x;
        this._y = y;
        this._w = w;
        this._h = h;
        this._c = c;
        this._spd = spd;

        this._dx = 0 - gameSpeed;
    }

    update()
    {
        this._x += this._dx * this._spd;
        this.draw();
        this._dx = 0 - gameSpeed;
    }

    draw()
    {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeRect(this._x, this._y, this._w, this._h);
        ctx.fillStyle = this._c;
        ctx.fillRect(this._x, this._y, this._w, this._h);
        ctx.closePath();
    }
}

class Text
{
    constructor(t, x, y, a, c, s)
    {
        this._t = t;
        this._x = x;
        this._y = y;
        this._a = a;
        this._c = c;
        this._s = s;
    }

    draw()
    {
        ctx.beginPath();
        ctx.fillStyle = this._c;
        ctx.font = this._s + 'px Allerta Stencil';
        ctx.textAlign = this._a;
        ctx.fillText(this._t, this._x, this._y);
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
        obstacle._y -= player._originalHeight - randomIntInRange(10, 20);
        obstacle._h += randomIntInRange(0, 100);
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

    isRunning = true;
    gameSpeed = 12;
    gravity = GFORCE;
    score = 0;
    highScore = 0;

    player = new Player(canvas.width / 3, canvas.height - 150, 50, 50, 'red ');
    
    scoreText = new Text("Score: " + score, 125, 50, "center", "#101010", "20");
    highScoreText = new Text("Highscore: " + highScore, 600, 50, "center", 'yellow', "30");
    replayText = new Text("Press R to replay", canvas.width / 2, canvas.height / 3, "center", "violet", "80")

    requestAnimationFrame(update);
}

let initialSpawnTimer = 60;
let spawnTimer = 60;
function update()
{
    requestAnimationFrame(update);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    spawnTimer--;
    if (spawnTimer <= 0 && isRunning)
    {
        spawnObs();
        spawnGround();
        spawnGround();
        spawnTimer = randomIntInRange(120, 200);
    }

    for (let i = 0; i < grounds.length; i++) {
        let g = grounds[i];
        if (g._x + g._w < 0) 
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
        player._isGrounded = false;
        player._onBlackBar = false;
        if (
            player._x <= g._x + g._w &&
            player._x + player._w >= g._x &&
            player._y <= g._y + g._h &&
            player._y + player._h >= g._y
        )
        {
            player._isGrounded = true;
            player._onBlackBar = true;
            player._y = g._y - player._h + 1;
            break;
        }

        if (player._y >= canvas.height - player._h)
        {
            player._isGrounded = true;
            player._onBlackBar = false;
            player._y = canvas.height - player._h;
            break;
        }
    }

    for (let i = 0; i < obstacles.length; i++) {
        let o = obstacles[i];
        if (o._x + o._w < 0)
        {
            obstacles.splice(i, 1);
        }
        else
        {
            o.update();
        }

        if (
            player._x < o._x + o._w &&
            player._x + player._w > o._x &&
            player._y < o._y + o._h &&
            player._y + player._h > o._y
        )
        {
            grounds = [];
            obstacles = [];
            score = 0;
            spawnTimer = initialSpawnTimer;
            gameSpeed = 3;

            isRunning = false;
        }
    }

    if (keys['KeyR'])
    {
        isRunning = true;
    }

    if (!isRunning)
    {
        replayText.draw();
        highScoreText.draw();
    }
    else
    {
        player.animate();

        if (player._onBlackBar) {
            score++;
        }
        scoreText._t = "Score: " + score;
        scoreText.draw();

        highScore = Math.max(highScore, score);
        highScoreText._t = "Highscore: " + highScore;
        highScoreText.draw();
    }
}

init();