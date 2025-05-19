import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';

const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0d0ff);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

// Ground
const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x007700 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Player
const playerGeo = new THREE.BoxGeometry(1, 2, 1);
const playerMat = new THREE.MeshStandardMaterial({ color: 0xff4444 });
const player = new THREE.Mesh(playerGeo, playerMat);
player.position.y = 1;
scene.add(player);

// Car
const carGeo = new THREE.BoxGeometry(2, 1, 4);
const carMat = new THREE.MeshStandardMaterial({ color: 0x4444ff });
const car = new THREE.Mesh(carGeo, carMat);
car.position.set(5, 0.5, 0);
scene.add(car);

// Movement flags
let move = { forward: false, backward: false, left: false, right: false };
let inCar = false;

// Controls — Keyboard
window.addEventListener('keydown', (e) => {
  switch (e.key.toLowerCase()) {
    case 'w': move.forward = true; break;
    case 's': move.backward = true; break;
    case 'a': move.left = true; break;
    case 'd': move.right = true; break;
    case 'e': tryEnterCar(); break; // Press 'E' to enter/exit
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
document.getElementById('up').addEventListener('touchstart', () => move.forward = true);
document.getElementById('up').addEventListener('touchend', () => move.forward = false);

document.getElementById('down').addEventListener('touchstart', () => move.backward = true);
document.getElementById('down').addEventListener('touchend', () => move.backward = false);

document.getElementById('left').addEventListener('touchstart', () => move.left = true);
document.getElementById('left').addEventListener('touchend', () => move.left = false);

document.getElementById('right').addEventListener('touchstart', () => move.right = true);
document.getElementById('right').addEventListener('touchend', () => move.right = false);

document.getElementById('enterCar').addEventListener('click', tryEnterCar);

// Switch between player and car
function tryEnterCar() {
  const dist = player.position.distanceTo(car.position);
  if (!inCar && dist < 3) {
    inCar = true;
    player.visible = false;
  } else if (inCar) {
    inCar = false;
    player.position.copy(car.position).add(new THREE.Vector3(2, 0, 0));
    player.visible = true;
  }
}

// Animate
function animate() {
  requestAnimationFrame(animate);

  const speed = inCar ? 0.2 : 0.1;
  const object = inCar ? car : player;

  if (move.forward) object.position.z -= speed;
  if (move.backward) object.position.z += speed;
  if (move.left) object.position.x -= speed;
  if (move.right) object.position.x += speed;

  // Camera follow
  camera.position.x = object.position.x;
  camera.position.z = object.position.z + 10;
  camera.lookAt(object.position);

  renderer.render(scene, camera);
}

animate();
