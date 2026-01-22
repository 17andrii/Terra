const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ================= CONFIG =================
const TILE = 32;
const WORLD_WIDTH = 200;
const WORLD_HEIGHT = 100;
const GRAVITY = 0.6;

// ================= WORLD =================
const world = [];

for (let y = 0; y < WORLD_HEIGHT; y++) {
    world[y] = [];
    for (let x = 0; x < WORLD_WIDTH; x++) {
        if (y > 50) world[y][x] = "stone";
        else if (y === 50) world[y][x] = "grass";
        else if (y > 45) world[y][x] = "dirt";
        else world[y][x] = null;
    }
}

// ================= PLAYER =================
const player = {
    x: 100 * TILE,
    y: 0,
    w: 24,
    h: 32,
    vx: 0,
    vy: 0,
    speed: 4,
    jump: -12,
    onGround: false
};

// ================= INPUT =================
const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

// ================= CAMERA =================
const camera = { x: 0, y: 0 };

// ================= TILE COLORS =================
const tileColor = {
    grass: "#3CB371",
    dirt: "#8B4513",
    stone: "#808080"
};

// ================= COLLISION =================
function solid(x, y) {
    const tx = Math.floor(x / TILE);
    const ty = Math.floor(y / TILE);
    return world[ty] && world[ty][tx];
}

// ================= UPDATE =================
function update() {
    // Movement
    if (keys["a"] || keys["ArrowLeft"]) player.vx = -player.speed;
    else if (keys["d"] || keys["ArrowRight"]) player.vx = player.speed;
    else player.vx *= 0.8;

    if ((keys["w"] || keys["ArrowUp"]) && player.onGround) {
        player.vy = player.jump;
        player.onGround = false;
    }

    player.vy += GRAVITY;

    // Horizontal collision
    player.x += player.vx;
    if (solid(player.x, player.y + player.h) || solid(player.x + player.w, player.y + player.h)) {
        player.x -= player.vx;
    }

    // Vertical collision
    player.y += player.vy;
    if (solid(player.x, player.y + player.h) || solid(player.x + player.w, player.y + player.h)) {
        player.y = Math.floor((player.y + player.h) / TILE) * TILE - player.h;
        player.vy = 0;
        player.onGround = true;
    }

    // Camera follow
    camera.x = player.x - canvas.width / 2;
    camera.y = player.y - canvas.height / 2;
}

// ================= DRAW =================
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const startX = Math.floor(camera.x / TILE);
    const startY = Math.floor(camera.y / TILE);
    const endX = startX + Math.ceil(canvas.width / TILE);
    const endY = startY + Math.ceil(canvas.height / TILE);

    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            if (world[y] && world[y][x]) {
                ctx.fillStyle = tileColor[world[y][x]];
                ctx.fillRect(
                    x * TILE - camera.x,
                    y * TILE - camera.y,
                    TILE,
                    TILE
                );
            }
        }
    }

    // Player
    ctx.fillStyle = "red";
    ctx.fillRect(
        player.x - camera.x,
        player.y - camera.y,
        player.w,
        player.h
    );
}

// ================= MOUSE =================
canvas.addEventListener("mousedown", e => {
    const mx = Math.floor((e.clientX + camera.x) / TILE);
    const my = Math.floor((e.clientY + camera.y) / TILE);

    if (!world[my]) return;

    if
