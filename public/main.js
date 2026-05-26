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
const maxSpeed = 0.3;
const acceleration = 0.006;
const braking = 0.025;
const friction = 0.004;
const maxSteering = Math.PI / 6; // 30 degrees
const steeringSpeed = 0.01;
const steeringReturn = 0.008;

let currentSpeed = 0;
let steeringAngle = 0;
let carAngle = 0;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Acceleration / braking
  if (keys['w'] || keys['arrowup']) {
    currentSpeed = Math.min(currentSpeed + acceleration, maxSpeed);
  } else if (keys['s'] || keys['arrowdown']) {
    currentSpeed = Math.max(currentSpeed - braking, 0);
  } else {
    currentSpeed = Math.max(currentSpeed - friction, 0);
  }

  // Steering
  if (keys['a'] || keys['arrowleft']) {
    steeringAngle = Math.min(steeringAngle + steeringSpeed, maxSteering);
  } else if (keys['d'] || keys['arrowright']) {
    steeringAngle = Math.max(steeringAngle - steeringSpeed, -maxSteering);
  } else {
    // Return to center
    if (steeringAngle > 0) {
      steeringAngle = Math.max(steeringAngle - steeringReturn, 0);
    } else {
      steeringAngle = Math.min(steeringAngle + steeringReturn, 0);
    }
  }

  // Turn only when moving (proportional to speed)
  carAngle += steeringAngle * (currentSpeed / maxSpeed);

  // Move in the direction the car is facing
  carGroup.position.x -= Math.sin(carAngle) * currentSpeed;
  carGroup.position.z -= Math.cos(carAngle) * currentSpeed;

  carGroup.rotation.y = carAngle;

  // Camera follow (directly behind car, smooth lerp)
  const offset = new THREE.Vector3(0, 5, 10);
  offset.applyQuaternion(carGroup.quaternion);
  const targetPosition = carGroup.position.clone().add(offset);
  camera.position.lerp(targetPosition, 0.05);
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
