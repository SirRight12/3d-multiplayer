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
  function makePlayer(player,Name) {
    if (players[Name]) {
        if (player.transform.position.x == players[Name].transform.position.x && player.transform.position.y == players[Name].transform.position.y && player.transform.position.z == players[Name].transform.position.z) {
            return;
        }
    }
    removePlayer(Name)
    const geometry = new THREE.BoxGeometry( player.transform.geometry.x, player.transform.geometry.y, player.transform.geometry.z );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } ); 
    const cube = new THREE.Mesh( geometry, material );
    cube.position.x = player.transform.position.x
    cube.position.y = player.transform.position.y
    cube.position.z = player.transform.position.z
    objs[Name] = cube
        if (!objs[Name + "_sword"]) {
            makeSword().then((sword) => {
                scene.add(sword)
                objs[Name + "_sword"] = sword
                setPosTo3(sword,cube,determineSwordOffset(player.transform.dir))
                changeSwordDir(sword,player.transform.dir)
            }).catch((error) => {
                console.error(error);
            });
        } else {
            setPosTo3(objs[Name + "_sword"],cube,determineSwordOffset(player.transform.dir))
            changeSwordDir(objs[Name + "_sword"],player.transform.dir)
        }
        scene.add( cube );
  }
  function determineSwordOffset(dir) {
    let offset;
    switch (dir) {
        case "forward": 
            offset = {
                x: -.25,
                y: 0,
                z: -.75,
            }
            break;
        case "backward": 
            offset = {
                x: .25,
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
  socket.on("playerDisconnect", (plrName) => {
    removePlayer(plrName)
    removePlayer(plrName + "_sword")
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
init();
