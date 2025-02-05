//declaro variables e instancias
const express = require('express')
const http = require('http')
const path = require('path')
const socketIO = require('socket.io')
const port = 3000;
const app = express()
var server = http.Server(app)
var io = socketIO(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://proyecto.sysmemories.com",
  }
})


//rutas
app.use('/static', express.static(__dirname + '/static'))

app.get('/', function (request, response) {
  response.sendFile(path.join(__dirname, 'index.html'))
})

server.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

//variables jugador
var players = {}



// configuracion del socket

//mustra en el log al jugador
io.on('connection', function (socket) {
  console.log('player [' + socket.id + '] connected')

  players[socket.id] = {
    rotation: 0,
    x: 30,
    y: 30,
    playerId: socket.id,
    color: getRandomColor()
  }
  socket.emit('currentPlayers', players)
  socket.broadcast.emit('newPlayer', players[socket.id])
 
  socket.on('disconnect', function () {
    console.log('player [' + socket.id + '] disconnected')
    delete players[socket.id]
    io.emit('playerDisconnected', socket.id)
  })

  socket.on('playerMovement', function (movementData) {
    players[socket.id].x = movementData.x
    players[socket.id].y = movementData.y
    players[socket.id].rotation = movementData.rotation

    socket.broadcast.emit('playerMoved', players[socket.id])
  })
})


//ver que hace
function getRandomColor() {
  return '0x' + Math.floor(Math.random() * 16777215).toString(16)
}