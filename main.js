import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';

const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0d0ff);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 50);
camera.lookAt(0, 0, 0);


// Lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// Movement and control state
let move = { forward: false, backward: false, left: false, right: false };
let inCar = false;
let carSpeed = 0;

// Player
const player = new THREE.Mesh(
  new THREE.BoxGeometry(1, 2, 1),
  new THREE.MeshStandardMaterial({ color: 0xff4444 })
);
player.position.set(0, 1, 0);
scene.add(player);

//Building definition
function addRoad(x, z, width = 10, length = 100, horizontal = true) {
  const geometry = horizontal
    ? new THREE.BoxGeometry(length, 0.1, width)
    : new THREE.BoxGeometry(width, 0.1, length);
  const material = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const road = new THREE.Mesh(geometry, material);
  road.position.set(x, 0.01, z);
  scene.add(road);
}

function addBuilding(x, z, w = 10, h = 10, d = 10) {
  const geometry = new THREE.BoxGeometry(w, h, d);
  const material = new THREE.MeshStandardMaterial({ color: 0xbbbbbb });
  const building = new THREE.Mesh(geometry, material);
  building.position.set(x, h / 2, z);
  scene.add(building);
}

// Drivable cars (including original)
const cars = [];
function addCar(x, z, color = 0x4444ff) {
  const car = new THREE.Mesh(
    new THREE.BoxGeometry(2, 1, 4),
    new THREE.MeshStandardMaterial({ color })
  );
  car.position.set(x, 0.5, z);
  scene.add(car);
  cars.push(car);
}
addCar(5, 0); // Original car
addCar(10, 5, 0xff9900); // Parked car
addCar(-5, -10, 0x00aaff); // Another parked car

let currentCar = cars[0];

// Try to enter nearest car
function tryEnterCar() {
  if (!inCar) {
    for (let car of cars) {
      const dist = player.position.distanceTo(car.position);
      if (dist < 3) {
        currentCar = car;
        inCar = true;
        player.visible = false;
        return;
      }
    }
  } else {
    inCar = false;
    player.position.copy(currentCar.position).add(new THREE.Vector3(2, 0, 0));
    player.visible = true;
    carSpeed = 0;
  }
}

// Controls — Keyboard
window.addEventListener('keydown', (e) => {
  switch (e.key.toLowerCase()) {
    case 'w': move.forward = true; break;
    case 's': move.backward = true; break;
    case 'a': move.left = true; break;
    case 'd': move.right = true; break;
    case 'e': tryEnterCar(); break;
  }
});
window.addEventListener('keyup', (e) => {
  switch (e.key.toLowerCase()) {
    case 'w': move.forward = false; break;
    case 's': move.backward = false; break;
    case 'a': move.left = false; break;
    case 'd': move.right = false; break;
  }
});

// Controls — Mobile
['up', 'down', 'left', 'right'].forEach(id => {
  document.getElementById(id).addEventListener('touchstart', () => move[idMap[id]] = true);
  document.getElementById(id).addEventListener('touchend', () => move[idMap[id]] = false);
});
const idMap = { up: 'forward', down: 'backward', left: 'left', right: 'right' };
document.getElementById('enterCar').addEventListener('click', tryEnterCar);

// Make a grid of roads and buildings
const roadSpacing = 20;
const roadLength = 200;
const roadWidth = 10;

// Horizontal roads
for (let z = -60; z <= 60; z += roadSpacing) {
  addRoad(0, z, roadWidth, roadLength, true);
  addLaneMarkings(0, z, roadLength, true);
}

// Vertical roads
for (let x = -60; x <= 60; x += roadSpacing) {
  addRoad(x, 0, roadWidth, roadLength, false);
  addLaneMarkings(x, 0, roadLength, false);
}

// Add buildings between roads
for (let x = -50; x <= 50; x += 20) {
  for (let z = -50; z <= 50; z += 20) {
    // Skip where roads are
    if (x % roadSpacing === 0 || z % roadSpacing === 0) continue;
    addBuilding(x, z, 10, 10, 10);
  }
}

function addLaneMarkings(x, z, length = 100, horizontal = true) {
  const dashCount = 25;
  for (let i = 0; i < dashCount; i++) {
    const dash = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 0.3),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    dash.rotation.x = -Math.PI / 2;
    
    if (horizontal) {
      dash.position.set(x - length/2 + i * (length / dashCount), 0.02, z);
    } else {
      dash.position.set(x, 0.02, z - length/2 + i * (length / dashCount));
    }

    scene.add(dash);
  }
}


addRoad(0, 0, 10);         addLaneMarkings(0, 0);
addRoad(0, -20, 10);       addLaneMarkings(0, -20);
addRoad(0, 20, 10);        addLaneMarkings(0, 20);
addRoad(-20, 0, 10, 100, false);  addLaneMarkings(-20, 0, 100, false);
addRoad(20, 0, 10, 100, false);   addLaneMarkings(20, 0, 100, false);


// Grass
const grass = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: 0x229933 })
);
grass.rotation.x = -Math.PI / 2;
scene.add(grass);

// Animate
function animate() {
  requestAnimationFrame(animate);

  const target = inCar ? currentCar : player;

  if (inCar) {
    if (move.left) currentCar.rotation.y += 0.03;
    if (move.right) currentCar.rotation.y -= 0.03;

    if (move.forward) carSpeed = Math.min(carSpeed + 0.01, 0.2);
    else if (move.backward) carSpeed = Math.max(carSpeed - 0.01, -0.1);
    else {
      carSpeed *= 0.95;
      if (Math.abs(carSpeed) < 0.001) carSpeed = 0;
    }

    const dx = Math.sin(currentCar.rotation.y) * carSpeed;
    const dz = Math.cos(currentCar.rotation.y) * carSpeed;
    currentCar.position.x += dx;
    currentCar.position.z += dz;
  } else {
    const speed = 0.1;
    if (move.forward) player.position.z -= speed;
    if (move.backward) player.position.z += speed;
    if (move.left) player.position.x -= speed;
    if (move.right) player.position.x += speed;
  }

  camera.position.set(target.position.x - Math.sin(target.rotation?.y || 0) * 10, 5, target.position.z - Math.cos(target.rotation?.y || 0) * 10);
  camera.lookAt(target.position);

  renderer.render(scene, camera);
}

animate();
