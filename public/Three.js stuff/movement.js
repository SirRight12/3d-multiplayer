/* This REQUIRES Clock.js from mr. doob, get it. */


let canmove = true
let cangravity = false
let clockthing = new Clock(true)
let clockthing2 = new Clock(true)
let clockthing3 = new Clock(true)
let clockthing4 = new Clock(true)
let clockthing5 = new Clock(true)
function touchingsomething(obj1 /*touching*/,obj2,xsquare = 1,ysquare = 1,zsquare = 1) {
  let touching = obj1.position.x >= obj2.position.x - xsquare&&obj1.position.x <= obj2.position.x + xsquare&&obj1.position.z >= obj2.position.z - zsquare&&obj1.position.z <= obj2.position.z + zsquare&&obj1.position.y >= obj2.position.y - ysquare&&obj1.position.y <= obj2.position.y + ysquare
  return touching
}
function nearanything(obj1,scene) {
  for (var p of scene.children) {
      if (touchingsomething(obj1,p,.6,.6,1)) {
          return touchingsomething(obj1,p)
      }
  }
}

function startMovement(camera,scene) {
  function nearanythinggrav(obj1,scene) {
    for (var p of scene.children) {
        if (touchingsomething(obj1,p,0,.5,0)) {
            return touchingsomething(obj1,p)
        } else {
          //camera.position.y = p.position.y + 1
        }
    }
  }
  clockthing4.getDelta()
  function gravity() {
    if (cangravity) {
    let delta = clockthing4.getDelta()
    camera.position.y -= 8 * delta
    if (nearanythinggrav(camera,scene)) {
      camera.position.y += 8 * delta
    }
  }
  }
  setInterval(gravity,10)
let arrowright = false 
let rightfunc;
let arrowleft = false
let leftfunc;
document.addEventListener("keydown", function(event) {
    if (canmove) {
    if (event.key == "ArrowDown") {
      camera.rotation.x -= .5 * camera.rotation.y / 100
    } else if (event.key == "ArrowUp") {
      camera.rotation.x += .1
    } else if (event.key == "ArrowRight"&&arrowright == false) {
      arrowright = true
      clockthing3.getDelta()
      rightfunc = setInterval(rightthing,5)
    } else if (event.key == "ArrowLeft"&&arrowleft == false) {
      clockthing3.getDelta()
      arrowleft = true
      leftfunc = setInterval(leftthing,5)
    } else if (event.key == " ") {
      camera.position.y += 10
     } else if (event.key == "q") {
      camera.position.y -= .5
     }
    }
  })
  function rightthing() {
    let result = 3 * clockthing3.getDelta()
    camera.rotation.y -= result
  }
  function leftthing() {
    let result = 3 * clockthing3.getDelta()
    camera.rotation.y += result
  }
  document.addEventListener("keyup",function(event) {
    let keyism = event.key
    if (keyism == "ArrowLeft") {
      clearInterval(leftfunc)
      arrowleft = false
    }
  })
  document.addEventListener("keyup",function(event) {
    let keyism = event.key
    if (keyism == "ArrowRight") {
      clearInterval(rightfunc)
      arrowright = false
    }
  })
   var wdown = false
              var sdown = false 
              var adown = false
              var ddown = false
              var front;
              var back;
              var goright;
              var goleft;
              document.addEventListener("keydown", function(event) {
                  keyism = event.key
                  if (canmove) {
                  if (keyism == "w"&&wdown == false||keyism == "W"&&wdown == false) {
                      wdown = true
                      clockthing.getDelta()
                      clearInterval(front)
                      clearInterval(back)
                      forwards()
                      sdown = false
                      front = setInterval(forwards,10)
                  } else if (keyism == "s"&&sdown == false||keyism == "S"&&sdown == false) {
                      clearInterval(back)
                      clockthing.getDelta()
                      backwards()
                      clearInterval(front)
                      sdown = true
                      back = setInterval(backwards,10)
                  } else  if (keyism == "a"&&adown == false||keyism == "A"&&adown == false) {
                      clockthing2.getDelta()
                      left()
                      adown = true
                      clearInterval(goleft)
                      goleft = setInterval(left,5)
                  } else if (keyism == "d"&&ddown == false||keyism == "D"&&ddown == false) { 
                      clockthing2.getDelta()
                      right()
                      ddown = true
                      clearInterval(goright)
                      goright = setInterval(right,5)
                  }}})
                  let moveby = 2
                  let movesideby = 2
              function backwards() {
                if (canmove) {
                  clearInterval(front)
                    let delta = clockthing.getDelta()
                    let movex = moveby * (2 * Math.sin(camera.rotation.y)) * delta
                    let movez = moveby * (2 * Math.cos(camera.rotation.y)) * delta
                  camera.position.x += movex
                  if (nearanything(camera,scene)) {
                    camera.position.x -= movex
                  }
                  camera.position.z += movez
                  if (nearanything(camera,scene)) {
                    camera.position.z -= movez
                  }         
              }}
              function forwards() {
                if (canmove) {
                    let delta = clockthing.getDelta()
                  clearInterval(back)
                  let movex = moveby * (2 * Math.sin(camera.rotation.y)) * delta
                  let movez = moveby * (2 * Math.cos(camera.rotation.y)) * delta
                camera.position.x -= movex
                if (nearanything(camera,scene)) {
                  camera.position.x += movex
                 }
                camera.position.z -= movez
                if (nearanything(camera,scene)) {
                  camera.position.z += movez
                }
}}
              function side() {
                let delta = clockthing2.getDelta()
                let movex = moveby * (2 * Math.sin(camera.rotation.y)) * delta
                let movez = moveby * (2 * Math.cos(camera.rotation.y)) * delta
              camera.position.x -= movex
              if (nearanything(camera,scene)) {
                camera.position.x += movex
              }
              camera.position.z -= movez
              if (nearanything(camera,scene)) {
                camera.position.z += movez
              }
                  }
              function right() {
                if (canmove) {
                let prevrot = camera.rotation.y
                let thing = 6.3 / 4
                camera.rotation.y = prevrot - thing
                side()
                camera.rotation.y = prevrot
              }}
              function left() {
                if (canmove) {
                let prevrot = camera.rotation.y
                let thing = 6.3 / 4
                camera.rotation.y = prevrot + thing
                side()
                camera.rotation.y = prevrot
                }}
              document.addEventListener("keyup",wup)
              document.addEventListener("keyup",sup)
              document.addEventListener("keyup",aup)
              document.addEventListener("keyup",dup)
              function wup(event) {
                  var keyism = event.key
                  if (keyism == "w"&&wdown||keyism == "W"&&wdown) {
                      clearInterval(front)
                      wdown = false
                      if (sdown) {
                          clearInterval(back)
                          back = setInterval(backwards, 10)
                      }
                  }
              }
              
              function sup(event) {
                  var keyism = event.key
                  if (keyism == "s"&&sdown||keyism == "S"&&sdown) {
                      clearInterval(back)
                      sdown = false
                      if (wdown) {
                          clearInterval(front)
                          front = setInterval(forwards, 10)
                      }
                  }
              }
              function aup(event) {
                  var keyism = event.key
                  if (keyism == "a"&&adown||keyism == "A"&&adown) {
                      clearInterval(goleft)
                      adown = false
                  } 
              }
              function dup(event) {
                  var keyism = event.key
                  if (keyism == "d"&&ddown||keyism == "D"&&ddown) {
                      clearInterval(goright)
                      ddown = false
                  }
              }
            }