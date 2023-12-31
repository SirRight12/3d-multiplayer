const express = require('express')
const app = express()
const port = 3000
const http = require("http")
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server, {pingInterval: 2000,pingTimeout: 1000})
const floorHeight = 0
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
    constructor ({position={x:0,y:0,z:0},geometry={x:1,y:1,z:1},movementSpeed=.3}) {
        this.transform = {
            position: position,
            dir: "forward",
            geometry: geometry,
        }
        this.originSpeed = movementSpeed
        this.invOpen = false
        this.movementSpeed = movementSpeed
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
        this.keys = {
            w: {
                pressed: false,
            },
            a: {
                pressed: false,
            },
            s: {
                pressed: false,
            },
            d: {
                pressed: false,
            },
        }
        this.strafing = false
        this.velocity = {
            x: 0,
            y: 0,
            z: 0,
        }
        this.unequip = function (item) {
            if (item.type == "armor") {
                switch (item.slot) {
                    case "armor-head": 
                        this.inventory.holding[this.inventory.equipped.head.name] = item
                        delete this.inventory.equipped.head 
                        break;
                    case "armor-chest":
                        this.inventory.holding[this.inventory.equipped.chest.name] = item
                        delete this.inventory.equipped.chest
                        break;
                    case "armor-legs": 
                        this.inventory.holding[this.inventory.equipped.legs.name] = item
                        delete this.inventory.equipped.legs
                        break;
                }
            } else {
                this.inventory.holding[this.inventory.equipped.rightWeapon.name] = item
                delete this.inventory.equipped.rightWeapon
            }
        }
        this.equip = function (item) {
         
            let foundmatch = false
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
function animLoop() {
    for (let x in players) {
        move(players[x])
    }
    io.emit("playerUpdate",players)
}
function move(player) {
    if (player.transform.position.y > floorHeight) {
        player.velocity.y -= .05
    } else if (player.velocity.y < 0) {
        player.transform.position.y = floorHeight
        player.velocity.y = 0
    }
    if (player.strafing) {
        player.movementSpeed = player.originSpeed * .75
    } else if (player.movementSpeed != player.originSpeed) {
        player.movementSpeed = player.originSpeed
    }
    player.velocity.z = 0
    player.velocity.x = 0
    if (player.keys.w.pressed) {
        player.velocity.z = -player.movementSpeed
    }
    if (player.keys.s.pressed) {
        player.velocity.z = player.movementSpeed
    }
    if (player.keys.a.pressed) {
        player.velocity.x = -player.movementSpeed
    }
    if (player.keys.d.pressed) {
        player.velocity.x = player.movementSpeed
    }

    if (!player.velocity.x && !player.velocity.z && !player.velocity.y) return
        player.transform.position.x += player.velocity.x
        player.transform.position.y += player.velocity.y
        player.transform.position.z += player.velocity.z
}
const players = {

}
app.get('/game', (request, result) => {
    result.sendFile( __dirname + '/index.html')
})
//to animate use 16.66666667 ms setInterval, ok?
setInterval(animLoop,16.66666667)
io.on("connection", (socket) => {
    if (players[socket.id]) delete players[socket.id]
    players[socket.id] = new Player({
        position: {
            x: 0,
            y: 0,
            z: 0,
        },
        geometry: {
            x: 1,
            y: 2,
            z: 1,
        },
        movementSpeed: .1,
    })
    io.emit("playersInit",(players))
    socket.on("keydown",(key) => {
        const player = players[socket.id]
        if (players[socket.id].invOpen && key != "I") {
            return
        }
        switch(key) {
            case "S":
                player.keys.s.pressed = true
                players[socket.id].transform.dir = "backward"
                players[socket.id].transform.dir = "backward"
                break;
            case "W":
                player.keys.w.pressed = true
                players[socket.id].transform.dir = "forward"
                players[socket.id].transform.dir = "forward"
                break;
            case "A": 
                player.keys.a.pressed = true
                players[socket.id].transform.dir = "left"
                players[socket.id].transform.dir = "left"
                break;
            case "D":
                player.keys.d.pressed = true
                players[socket.id].transform.dir = "right"
                players[socket.id].transform.dir = "right"
                break;
            case " ": 
                players[socket.id].velocity.y += 0.9
                break;
            case "I": 
                if (!players[socket.id].invOpen) {
                    socket.emit("updateInv")
                    players[socket.id].invOpen = true
                    for (let keything in player.keys) {
                        player.keys[keything].pressed = false
                    }
                } else {
                    players[socket.id].invOpen = false
                    socket.emit("closeInv")
                }
                players[socket.id].velocity.x = 0
                players[socket.id].velocity.z = 0
                break;
        }
        let forward = player.keys.w.pressed || player.keys.s.pressed;
        let side = player.keys.a.pressed || player.keys.d.pressed;
        if (forward && side) {
            if (!player.strafing) player.strafing = true
            
        } else if (player.strafing) {
            player.strafing = false
        }
    })
    socket.on("keyup", (key) => {
        const player = players[socket.id]
        switch(key) {
            case "W":
            case "S":
                player.velocity.z = 0
                break;
            case "A":
            case "D":
                player.velocity.x = 0
                break;
        }
        switch (key) {
            case "W":
                player.keys.w.pressed = false
                break;
            case "A": 
                player.keys.a.pressed = false
                break;
            case "S": 
                player.keys.s.pressed = false
                break;
            case "D": 
                player.keys.d.pressed = false
        }
        let forward = player.keys.w.pressed || player.keys.s.pressed;
        let side = player.keys.a.pressed || player.keys.d.pressed;
        if (forward && side) {
            if (!player.strafing) player.strafing = true
            
        } else if (player.strafing) {
            player.strafing = false
        }
    })
    function determineItem(iswep,itemName) {
        if (iswep) return weapons[itemName]
        return armors[itemName]
    }
    socket.on("equipItem", (itemName) => {
        let iswep = isWeapon(weapons[itemName])
        let item = determineItem(iswep,itemName)
        if (!item) {
            console.log("item does not exist?")
            return
        }
        players[socket.id].equip(item)
        io.emit("playerUpdate",players)
        socket.emit("updateInv")
    })
    socket.on("disconnect", () => {
        console.log("player leave :'(")
        io.emit("playerDisconnect",(socket.id))
        delete players[socket.id]
    })
    socket.on("unequipItem", (itemName) => {
        let item;
        let iswep = isWeapon(weapons[itemName])
        if (iswep){
            item = weapons[itemName]
        } else if (iswep == false) {
            item = armors[itemName]
        }
        if (!item) {
            console.log("Item does not exist?")
            return
        }
        players[socket.id].unequip(item)
        io.emit("playerUpdate",players)
        socket.emit("updateInv")
    })
})
server.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
})
function isWeapon(item) {
    if (!item) return false
    switch(item.type) {
        case "weapon":
            return true
    }
}