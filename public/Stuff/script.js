let socket = io()
let scene, camera, renderer;
const loader = new THREE.GLTFLoader()
const bodyDepth = 100;
const depthMargin = 10;


const players = {

}
const objs = {

}
function init() {
    scene = new THREE.Scene();
  let duckObj = loader.load("static/threejs/media/duck.glb", (gltf) => {
    duckObj = gltf.scene
    scene.add(duckObj)
    duckObj.position.y = 1
    
  })
  /* let sword;
  async function makeSword() {
    let loaded = false
      sword = await loader.load("static/threejs/media/Assets/Other_Yoinks/sword_teamRed.glb", (gltf) => {
            loaded = true
            console.log("done")
            sword = gltf.scene
            return gltf.scene
        })
        console.log(await sword)
        return await sword
    } */
    async function makeSword() {
        return new Promise((resolve, reject) => {
          loader.load("static/threejs/media/Assets/Other_Yoinks/sword_teamRed.glb", (gltf) => {
            const sword = gltf.scene;
            resolve(sword);
          }, undefined, (error) => {
            reject(error);
          });
        });
      }
      
  const duckLight = new THREE.PointLight(0xfffffff);
    scene.add(duckLight);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    bodyDepth - depthMargin
  );

  camera.position.z = 1;
  //camera.rotation.x = Math.PI / 2;

  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  function makeAnything(src,onload) {
    return new Promise((resolve, reject) => {
        loader.load("static/threejs/media/Assets/" + src, (gltf) => {
          const thing = gltf.scene;
          if (onload) {
              onload(thing)
          }
          resolve(thing);
        }, undefined, (error) => {
          reject(error);
        });
      });
  }
  socket.on("playersInit", (backendPlayers) => {
        for (let x in backendPlayers) {
            const playerName = x + "_player"
            if (objs[playerName]) {
                removePlayer(playerName)
                removePlayer(x + "_sword")
            }
            const player = backendPlayers[x]
            const geometry = new THREE.BoxGeometry( player.transform.geometry.x, player.transform.geometry.y, player.transform.geometry.z );
            const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } ); 
            const cube = new THREE.Mesh( geometry, material );
            cube.position.x = player.transform.position.x
            cube.position.y = player.transform.position.y
            cube.position.z = player.transform.position.z
            objs[x] = cube
            const plrPos = backendPlayers[x].transform.position     
            makeAnything("Other_Yoinks/fox.glb").then((player) => {
                console.log("player")
                player.position.x = plrPos.x
                player.position.y = plrPos.y
                player.position.z = plrPos.z
                let foxDir = setFoxDir(backendPlayers[x].transform.dir)
                console.log(foxDir)
                player.rotation.y = foxDir
                scene.add(player)
                objs[playerName] = player
            }).catch((error) => {
                console.error(error)
            })
            makeSword().then((sword) => {
                scene.add(sword)
                objs[x + "_sword"] = sword
                setPosTo3(sword,cube,determineSwordOffset(player.transform.dir))
                changeSwordDir(sword,player.transform.dir)
            }).catch((error) => {
                console.error(error);
            });
        }
        console.log("init player")
  })
  function setFoxDir(dir) {
    let toReturn;
    switch (dir) {
        case "forward": 
            toReturn = 3
            break;
        case "backward": 
            toReturn = 0
            break;
        case "right": 
            toReturn = 1.5
            break;
        case "left": 
            toReturn = 4.5
            break; 
    }
    return toReturn
  }
  function makePlayer(player,Name) {
    if (players[Name]) {
        if (player.transform.position.x == players[Name].transform.position.x && player.transform.position.y == players[Name].transform.position.y && player.transform.position.z == players[Name].transform.position.z) {
            return;
        }
    }
        const cube = objs[Name]
        const fox = objs[Name + "_player"]
        if (cube) {
            setPosTo(cube,player)
        }
        if (fox) {
            setPosTo(fox,player) 
            fox.rotation.y = setFoxDir(players[Name].transform.dir)
        }
        if (objs[Name + "_sword"]) {  
            setPosTo3(objs[Name + "_sword"],cube,determineSwordOffset(player.transform.dir))
            changeSwordDir(objs[Name + "_sword"],player.transform.dir)
        } 
  }
  function determineSwordOffset(dir) {
    let offset;
    switch (dir) {
        case "forward": 
            offset = {
                x: .25,
                y: 0,
                z: -.75,
            }
            break;
        case "backward": 
            offset = {
                x: -.25,
                y: 0,
                z: .75,
            }
            break;
        case "left": 
            offset = {
                x: -.75,
                y: 0,
                z: -.25,
            }
            break;
        case "right": 
            offset = {
                x: .75,
                y: 0,
                z: .25,
            }
            break;
    }
    return offset;
  }
  function changeSwordDir(sword,dir) {
    
    if (dir == "left" || dir == "right") 
    {
        sword.rotation.y = 0
        return
    }
    sword.rotation.y = 1.5
  }
  const floorGeometry = new THREE.BoxGeometry(10,1,10)
  const floorMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff} )
  const floor = new THREE.Mesh(floorGeometry,floorMaterial)
  floor.position.y = -2
  scene.add( floor )
  camera.rotation.x = -.5
  //this is where the initial objects are made
  socket.on("playerUpdate", (backendPlayers) => {
    for (let i in backendPlayers) {
        const player = backendPlayers[i] 
        makePlayer(player,i)
        player.openInventory = openInventory
        players[i] = player
    } 
    const camOffset = {
        x: 0,
        y: 3,
        z: 5,
    }
    setPosTo(camera,players[socket.id],camOffset)
  })
  function setPosTo(thing,backendPlayer, offset={x:0,y:0,z:0,}) {
    thing.position.x = backendPlayer.transform.position.x + offset.x
    thing.position.z = backendPlayer.transform.position.z + offset.z
    thing.position.y = backendPlayer.transform.position.y + offset.y 
  }
  function setPosTo3(thing,backendPlayer, offset={x:0,y:0,z:0,}) {
    thing.position.x = backendPlayer.position.x + offset.x
    thing.position.z = backendPlayer.position.z + offset.z
    thing.position.y = backendPlayer.position.y + offset.y 
  }
  document.addEventListener("keydown", (event) => {
    let keyism = event.key.toUpperCase()
    socket.emit("keydown",(keyism))
  })
  document.addEventListener("keyup", (event) => {
    let keyism = event.key.toUpperCase()
    socket.emit("keyup",(keyism))
  })
  socket.on("playerDisconnect", (plrName) => {
    removePlayer(plrName)
    removePlayer(plrName + "_sword")
    removePlayer(plrName + "_player")
    delete players[plrName]
  })
  function removePlayer(name) {
    scene.remove( objs[name] )
    delete objs[name]
  }
   camera.position.z = 5
  window.addEventListener("resize", onWindowResize, false);
  animate();
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
function animate() {
  //this is where animations happen
  checkIfLoad()
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
function checkIfLoad() {
    if (!duckLight || !duckObj) return
        const lightOffset = {
            x: 0,
            y: .5,
            z: 0,
        }
        if (duckLight.position.y - lightOffset.y == duckObj.position.y) return
        setPosTo3(duckLight,duckObj,lightOffset)
    }
    
    
    
}
socket.on("updateInv", () => {
    openInventory()
})
let inv;
function replaceAll(thing) {
    let returnval = thing.replace("short"," Short")
    returnval = returnval.replace("great"," Great")
    returnval = returnval.replace("sword"," Sword")
    returnval = returnval.replace("copper","Copper")
    returnval = returnval.replace("stick","Stick")
    returnval = returnval.replace("legs"," Leggings")
    returnval = returnval.replace("chest"," Chestplate")
    returnval = returnval.replace("helmet"," Helmet")
    returnval = returnval.replace("ancient","Ancient")
    returnval = returnval.replace("wood", "Wooden")
    returnval = returnval.replace("grand", "Grand")
    returnval = returnval.replace("father", " Father")
    return returnval
}
socket.on("closeInv", () => {
    inv.remove()
    inv = ""
})
function openInventory() {
    if (inv) inv.remove() 
    const player = players[socket.id]
    inv = document.createElement("div")
    inv.id = "inv"
    inv.style.width = "70%"
    inv.style.height =  "85%"
    inv.innerHTML = "<strong> Inventory: </strong> <br> <br>"
    let i = 0
    let list = {}
    document.body.appendChild(inv)
    for (let item in player.inventory.holding) {
        let itemthing = player.inventory.holding[item]
    let truename = replaceAll(itemthing.name)
    let fullName;
    if (itemthing.type == "weapon") {
        fullName = truename + ": " + itemthing.damage + " damage " + '"' + itemthing.tooltip + '"' + " <br>"
    } else if (itemthing.type == "armor") {
        fullName = truename + ": " + itemthing.defense + " defense " + '"' + itemthing.tooltip + '"' + " <br>"
    }
    list[i] = {}
    list[i].name = fullName
    list[i].item = itemthing
    i ++
    }
    if (i <= 0) {
        list[i] = {}
        list[i].name = "Nothing"
        list[i].item = "non-existant"
    }
for (let x in list) {
    let name = list[x].name
    let thing = document.createElement("p")
    thing.id = list[x].item.name
    thing.className = "delete"
    thing.innerHTML = name
    inv.appendChild(thing)
    delete list[x]
}
list = {}
i = 0
inv.innerHTML += "<br> <strong> Equipped: </strong> <br> <br>"
let itemsadded = 0
    for (let item in player.inventory.equipped) {
        let itemthing = player.inventory.equipped[item]
        if (itemthing) {
            itemsadded ++
            let fullName
            let truename = replaceAll(itemthing.name)
            if (itemthing.type == "weapon") {
                fullName = truename + ": " + itemthing.damage + " damage " + '"' + itemthing.tooltip + '"' + " <br>"
            } else if (itemthing.type == "armor") {
                fullName = truename + ": " + itemthing.defense + " defense " + '"' + itemthing.tooltip + '"' + " <br>"
            }
            list[i] = {}
            list[i].name = fullName
            list[i].item = itemthing
            i ++
        }
    }
    if (itemsadded < 1) {
        inv.innerHTML += "Nothing"
    } else {
        for (let x in list) {
            let name = list[x].name
            let thing = document.createElement("p")
            thing.id = list[x].item.name
            thing.className = "delete2"
            thing.innerHTML = name
            inv.appendChild(thing)
            delete list[x]
        }
    }
    let allp = document.getElementsByClassName("delete")
    for (let i = 0; i < allp.length; i++) {
        let thing = allp[i]
        thing.addEventListener("click",test)
    }
    let all = document.getElementsByClassName("delete2")
    for (let i = 0; i < all.length; i++) {
        let thing = all[i]
        thing.addEventListener("click",test2)
    }
    function test() {
        socket.emit("equipItem", (this.id))
    }
    function test2() {
        socket.emit("unequipItem", (this.id))
    }
}
init();
