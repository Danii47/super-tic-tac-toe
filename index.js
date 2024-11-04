const express = require('express');
const WebSocket = require('ws');
const http = require('node:http');
const { randomUUID } = require('node:crypto'); // Instala uuid con npm install uuid

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

// Configura el servidor para servir tus archivos HTML y CSS
app.use(express.static('public'));


app.get('/local', (req, res) => {
  res.sendFile(__dirname + '/public/index-local.html');
})

app.get('/', (req, res) => {
  const gameId = randomUUID()
  res.redirect(`/${gameId}`)
})

app.get('/create-game', (req, res) => {
  const gameId = randomUUID()
  res.redirect(`/${gameId}`)
})

app.get('/:gameId', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

const games = {};

wss.on('connection', (ws, req) => {
  const gameId = req.url.split('/').pop()

  if (!games[gameId]) {
    games[gameId] = []
  }

  if (games[gameId].length < 2) {
    console.log(`Player connected to game ${gameId}`)
    games[gameId].push(ws)
    const player = games[gameId].length

    ws.send(JSON.stringify({ type: 'player', player }))

    ws.on('message', (message) => {
      games[gameId].forEach(playerSocket => {
        if (playerSocket !== ws && playerSocket.readyState === WebSocket.OPEN) {
          playerSocket.send(message)
        }
      })
    })

    ws.on('close', () => {
      games[gameId] = games[gameId].filter(playerSocket => playerSocket !== ws)
      if (games[gameId].length === 0) {
        delete games[gameId]
      }
    });
  } else {
    ws.send(JSON.stringify({ type: 'error', message: 'Game is full' }))
    ws.close()
  }
})

server.listen(3000, () => {
  console.log('Server started on http://localhost:3000')
})