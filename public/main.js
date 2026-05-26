// Socket.io connection
const socket = io();

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 50, 200);

// Camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(50, 100, 50);
dirLight.castShadow = true;
scene.add(dirLight);

// Ground
const groundGeometry = new THREE.PlaneGeometry(200, 200);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x4a7c59 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Road
const roadGeometry = new THREE.PlaneGeometry(10, 200);
const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.rotation.x = -Math.PI / 2;
road.position.y = 0.01;
scene.add(road);

// Car (BoxGeometry)
const carGroup = new THREE.Group();

const bodyGeometry = new THREE.BoxGeometry(2, 0.8, 4);
const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xff3333 });
const carBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
carBody.position.y = 0.4;
carBody.castShadow = true;
carGroup.add(carBody);

const roofGeometry = new THREE.BoxGeometry(1.6, 0.6, 2);
const roofMaterial = new THREE.MeshLambertMaterial({ color: 0xcc2222 });
const carRoof = new THREE.Mesh(roofGeometry, roofMaterial);
carRoof.position.y = 1.1;
carRoof.castShadow = true;
carGroup.add(carRoof);

const wheelGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.6);
const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
const wheelPositions = [
  [-1.1, 0.3, 1.3],
  [1.1, 0.3, 1.3],
  [-1.1, 0.3, -1.3],
  [1.1, 0.3, -1.3],
];
wheelPositions.forEach((pos) => {
  const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
  wheel.position.set(...pos);
  carGroup.add(wheel);
});

carGroup.position.set(0, 0, 0);
scene.add(carGroup);

// Input state
const keys = {};
document.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
document.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

// Car state
const carSpeed = 0.15;
const carTurnSpeed = 0.03;
let carAngle = 0;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // WASD movement
  if (keys['w'] || keys['arrowup']) {
    carGroup.position.x -= Math.sin(carAngle) * carSpeed;
    carGroup.position.z -= Math.cos(carAngle) * carSpeed;
  }
  if (keys['s'] || keys['arrowdown']) {
    carGroup.position.x += Math.sin(carAngle) * carSpeed;
    carGroup.position.z += Math.cos(carAngle) * carSpeed;
  }
  if (keys['a'] || keys['arrowleft']) {
    carAngle += carTurnSpeed;
  }
  if (keys['d'] || keys['arrowright']) {
    carAngle -= carTurnSpeed;
  }

  carGroup.rotation.y = carAngle;

  // Camera follow
  const camOffset = new THREE.Vector3(
    -Math.sin(carAngle) * -10,
    5,
    -Math.cos(carAngle) * -10
  );
  camera.position.lerp(carGroup.position.clone().add(camOffset), 0.1);
  camera.lookAt(carGroup.position);

  renderer.render(scene, camera);
}

animate();

// Handle resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
