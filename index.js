const express = require('express')
const app = express()
const port = 3000
const http = require("http")
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server, {pingInterval: 2000,pingTimeout: 1000})

app.use(express.static('public'))

const messages = {

}
class Player {
    constructor ({position={x:0,y:0,z:0},geometry={x:1,y:1,z:1}}) {
        this.transform = {}
        this.transform.position = position
        this.transform.geometry = geometry
    }
}
const players = {

}
app.get('/', (request, result) => {
    result.sendFile( __dirname + '/index.html')
})
//to animate use 16.66666667 ms setInterval, ok?
io.on("connection", (socket) => {
    if (players[socket.id]) delete players[socket.id]
    players[socket.id] = new Player({
        position: {
            x: 0,
            y: 0,
            z: 0,
        }
    })
    socket.on("keydown",(key) => {
        const player = players[socket.id].transform
        switch(key) {
            case "S": {
                players[socket.id].transform.position.z += 1 
                break;
            }
            case "W": {
                players[socket.id].transform.position.z -= 1
                break;
            }
            case "A": {
                players[socket.id].transform.position.x -= 1
                break;
            }
            case "D": {
                players[socket.id].transform.position.x += 1
                break;
            }
        }
        if (players[socket.id] != player)  {
            io.emit("playerUpdate",players)
        }
    })
    console.log(players)
    io.emit("playerUpdate",players)
    socket.on("disconnect",() => {
        io.emit("playerDisconnect",(socket.id))
        delete players[socket.id]
    })
})
server.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
})