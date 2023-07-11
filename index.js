const express = require('express')
const app = express()
const port = 3000
const http = require("http")
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server, {pingInterval: 2000,pingTimeout: 1000})

app.use(express.static('public'))
class Weapon {
    constructor(damage=1,atkSpeed,name="None",tooltip="Added by mistake",slot="weapon") {
        this.damage = damage
        this.atkSpeed = atkSpeed
        this.name = name
        this.tooltip = tooltip
        this.slot = slot
        this.type = "weapon"
    }
}
class Armor {
    constructor(defense=1,name="None",tooltip="Added by mistake",slot="amor-head") {
        this.defense = defense
        this.name = name
        this.tooltip = tooltip
        this.slot = slot
        this.type = "armor"
    }
}
const weapons = {
    stick: new Weapon(2,300,"stick","A twig taken from a sturdy tree","weapon"),
    coppershortsword: new Weapon(5,400,"coppershortsword","A fine sword made of copper","weapon"),
    ancientgreatsword: new Weapon(50,1000,"ancientgreatsword","A massive sword taken from the corpse of a powerful king long dead","weapon"),
    grandfather: new Weapon(200,1500,"grandfather","Honed in the fires of Mordore and enchanted by Gandalf","weapon")
}
const armors = {
    woodhelmet: new Armor(1,"woodhelmet","A helmet crafted from the bark of a tree","armor-head"),
    woodchest: new Armor(1,"woodchest","A chestplate crafted from the bark of a tree","armor-chest"),
    woodlegs: new Armor(1,"woodlegs","A pair of leggings crafted from the bark of a tree","armor-legs"),
    copperhelmet: new Armor(3,"copperhelmet","A helmet forged of copper, not the strongest, but also not the weakest","armor-head"),
    copperchest: new Armor(1,"copperchest", "A chestplate forged of copper, not the strongest, but also not the weakest.","armor-chest"),
    copperlegs: new Armor(1,"copperlegs","A pair of boots forged of copper, not the strongest, but also not the weakest.","armor-legs"),
}
class Player {
    constructor ({position={x:0,y:0,z:0},geometry={x:1,y:1,z:1}}) {
        this.transform = {}
        this.transform.position = position
        this.transform.dir = "forward"
        this.transform.geometry = geometry
        this.hasSword = false
        this.inventory = {
            equipped: {
                head: "",
                chest: "",
                legs: "",
                rightWeapon: "",
            },
            holding: {
                "woodhelmet": armors.woodhelmet,
            },
        },
        this.equip = function (item) {
            let foundmatch = false
            console.log(this)
            for (let x in this.inventory.holding) {
                if (this.inventory.holding[x].name.toUpperCase() == item.name.toUpperCase()) {
                    foundmatch = true
                    break
                }
            }
            if (!foundmatch) {
                return
            }
            console.log("item found!")
            let equip = item.name
            switch(item.slot) {
                case "weapon":
                    if (!this.inventory.equipped.rightWeapon) {
                        this.inventory.equipped.rightWeapon = item
                        delete this.inventory.holding[equip]
                    } else {
                        let thing = this.inventory.equipped.rightWeapon.name
                        this.inventory.holding[thing] = this.inventory.equipped.rightWeapon
                        this.inventory.equipped.rightWeapon = item
                        delete this.inventory.holding[equip]
                    }
                    break;
                case "armor-head":
                    if (!this.inventory.equipped.head) {
                        this.inventory.equipped.head = item
                        delete this.inventory.holding[equip]
                    } else {
                        let thing = this.inventory.equipped.head.name
                        this.inventory.holding[thing] = this.inventory.equipped.head
                        this.inventory.equipped.head = item
                        delete this.inventory.holding[equip]
                    }
                    break;
                case "armor-legs":
                    if (!this.inventory.equipped.legs) {
                        this.inventory.equipped.legs = item
                        delete this.inventory.holding[equip]
                    } else {
                        let thing = this.inventory.equipped.legs.name
                        this.inventory.holding[thing] = this.inventory.equipped.legs
                        this.inventory.equipped.legs = item
                        delete this.inventory.holding[equip]
                    }
                    break;
                case "armor-chest": 
                    if (!this.inventory.equipped.chest) {
                        this.inventory.equipped.chest = item
                        delete this.inventory.holding[equip]
                    } else {
                        let thing = this.inventory.equipped.chest.name
                        this.inventory.holding[thing] = this.inventory.equipped.chest
                        this.inventory.equipped.chest = item
                        delete this.inventory.holding[equip]
                    }
                    break;
            }
            console.log(`${item.name} equipped!`)
        }
    }
}
const players = {

}
app.get('/game', (request, result) => {
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
    players[socket.id].equip(armors["woodhelmet"])
    console.log(players[socket.id].inventory)
    socket.on("keydown",(key) => {
        const player = players[socket.id].transform
        switch(key) {
            case "S": {
                players[socket.id].transform.position.z += 1 
                players[socket.id].transform.dir = "backward"
                players[socket.id].transform.dir = "backward"
                break;
            }
            case "W": {
                players[socket.id].transform.position.z -= 1
                players[socket.id].transform.dir = "forward"
                players[socket.id].transform.dir = "forward"
                break;
            }
            case "A": {
                players[socket.id].transform.position.x -= 1
                players[socket.id].transform.dir = "left"
                players[socket.id].transform.dir = "left"
                break;
            }
            case "D": {
                players[socket.id].transform.position.x += 1
                players[socket.id].transform.dir = "right"
                players[socket.id].transform.dir = "right"
                break;
            }
        }
        if (players[socket.id] != player)  {
            io.emit("playerUpdate",players)
        }
    })
    socket.on("hasSword", () => {
        players[socket.id].hasSword = true
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