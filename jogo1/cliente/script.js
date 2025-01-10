// Configuração básica do canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let characterX = 375;
let characterY = 475;
const characterSize = 50;

// Configuração de WebSocket
const socket = new WebSocket('ws://localhost:8080');

const players = {};
let playerId = null;

socket.addEventListener('open', () => {
    console.log('Connected to server');
});

socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    console.log('Received data from server:', data);
    if (data.players) {
        Object.assign(players, data.players);
        console.log('Updated players from server:', players);
    } else {
        if (data.id && data.players) {
            playerId = data.id;
            Object.assign(players, data.players);
            console.log('Received initial data from server:', players);
        } else if (data.id && data.x !== undefined && data.y !== undefined) {
            players[data.id] = { x: data.x, y: data.y };
            console.log(`Player ${data.id} moved to (${data.x}, ${data.y})`);
            updateCanvas(); // Atualizar o canvas após receber dados do servidor
        } else if (data.id) {
            delete players[data.id];
            console.log(`Player ${data.id} disconnected`);
            updateCanvas(); // Atualizar o canvas após receber dados do servidor
        }
    }
});

function sendPosition() {
    if (playerId !== null) {
        const position = { id: playerId, x: characterX, y: characterY };
        socket.send(JSON.stringify(position));
        console.log('Sent position to server:', position);
    }
}

// Desenhe o cenário da ilha
function drawBackground() {
    // Céu
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Terra
    ctx.fillStyle = 'green';
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
}

// Desenhe o personagem principal
function drawCharacter(x, y) {
    ctx.fillStyle = 'blue';
    ctx.fillRect(x, y, characterSize, characterSize);
}

// Função para atualizar a tela
function updateCanvas() {
    console.log('Updating canvas with players:', players);
    drawBackground();
    for (const id in players) {
        console.log(`Drawing player ${id} at (${players[id].x}, ${players[id].y})`);
        drawCharacter(players[id].x, players[id].y);
    }
}

// Função para lidar com a movimentação do personagem
function moveCharacter(event) {
    let moved = false;
    switch (event.key) {
        case 'ArrowUp':
            characterY -= 10;
            moved = true;
            break;
        case 'ArrowDown':
            characterY += 10;
            moved = true;
            break;
        case 'ArrowLeft':
            characterX -= 10;
            moved = true;
            break;
        case 'ArrowRight':
            characterX += 10;
            moved = true;
            break;
        default:
            return; // Saia da função se a tecla não for uma tecla de seta
    }
    if (moved) {
        console.log(`Moved character to (${characterX}, ${characterY})`);
        players[playerId] = { x: characterX, y: characterY }; // Atualize a posição no objeto players
        sendPosition();
        updateCanvas();
    }
}

// Adicione um listener para as teclas de seta
window.addEventListener('keydown', (event) => {
    console.log(`Key pressed: ${event.key}`);
    moveCharacter(event);
});

// Inicialize o canvas
updateCanvas();
