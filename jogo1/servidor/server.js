const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const players = {};

wss.on('connection', (ws) => {
    const id = Date.now();
    players[id] = { x: 375, y: 475 };
    ws.send(JSON.stringify({ id, players }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        const { id, x, y } = data;
        players[id] = { x, y };
        console.log(`Player ${id} moved to (${x}, ${y})`);
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ players }));
            }
        });
    });

    ws.on('close', () => {
        delete players[id];
        console.log(`Player ${id} disconnected`);
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ players }));
            }
        });
    });
});

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
