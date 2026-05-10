import * as THREE from "three";
import "./style.css";

const worldSize = 170;
const clock = new THREE.Clock();
const tempVec = new THREE.Vector3();
const tempVec2 = new THREE.Vector3();
const tempVec3 = new THREE.Vector3();
const playerVelocity = new THREE.Vector3();
const shipVelocity = new THREE.Vector3();
const yAxis = new THREE.Vector3(0, 1, 0);
const rocketHome = new THREE.Vector3(-24, 0, -9);
const destinationPlanetPosition = new THREE.Vector3(0, 62, -250);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050813);
scene.fog = new THREE.FogExp2(0x14121a, 0.012);

const camera = new THREE.PerspectiveCamera(
  62,
  window.innerWidth / window.innerHeight,
  0.1,
  450,
);
camera.position.set(0, 8, 14);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
document.querySelector("#app").appendChild(renderer.domElement);

const ui = {
  healthFill: document.querySelector("#healthFill"),
  healthText: document.querySelector("#healthText"),
  captureFill: document.querySelector("#captureFill"),
  captureText: document.querySelector("#captureText"),
  piglinScore: document.querySelector("#piglinScore"),
  status: document.querySelector("#status"),
  capturePrompt: document.querySelector("#capturePrompt"),
  rocketPrompt: document.querySelector("#rocketPrompt"),
  goshaIndicator: document.querySelector("#goshaIndicator"),
  goshaArrow: document.querySelector("#goshaArrow"),
  targetLabel: document.querySelector("#targetLabel"),
  goshaDistance: document.querySelector("#goshaDistance"),
  missionEyebrow: document.querySelector("#missionEyebrow"),
  missionTitle: document.querySelector("#missionTitle"),
  restartButton: document.querySelector("#restartButton"),
};

const keys = new Map();
const game = {
  health: 100,
  capture: 0,
  piglinsDefeated: 0,
  won: false,
  lost: false,
  escaped: false,
  phase: "desert",
  attackCooldown: 0,
  attackTimer: 0,
  cameraShake: 0,
  statusTimer: 0,
  launchTimer: 0,
  danceTimer: 0,
  rocketFlame: 0,
};

const materials = {
  sand: new THREE.MeshStandardMaterial({
    color: 0xc99754,
    roughness: 0.95,
    metalness: 0.02,
  }),
  sandDark: new THREE.MeshStandardMaterial({
    color: 0x9b6938,
    roughness: 1,
  }),
  rock: new THREE.MeshStandardMaterial({
    color: 0x8b7465,
    roughness: 0.98,
  }),
  growlitheFur: new THREE.MeshStandardMaterial({
    color: 0xc76535,
    roughness: 0.86,
  }),
  growlitheCream: new THREE.MeshStandardMaterial({
    color: 0xf2dfbb,
    roughness: 0.92,
  }),
  growlitheStripe: new THREE.MeshStandardMaterial({
    color: 0x1c2934,
    roughness: 0.74,
  }),
  growlitheNose: new THREE.MeshStandardMaterial({
    color: 0x1d242c,
    roughness: 0.45,
    metalness: 0.08,
  }),
  rider: new THREE.MeshStandardMaterial({
    color: 0x2f7cff,
    roughness: 0.55,
  }),
  riderSkin: new THREE.MeshStandardMaterial({
    color: 0xc89162,
    roughness: 0.72,
  }),
  sword: new THREE.MeshStandardMaterial({
    color: 0x60f7ff,
    emissive: 0x1aa9b4,
    emissiveIntensity: 0.5,
    roughness: 0.18,
    metalness: 0.18,
  }),
  swordCore: new THREE.MeshStandardMaterial({
    color: 0xe9ffff,
    emissive: 0x87ffff,
    emissiveIntensity: 0.7,
    roughness: 0.22,
  }),
  swordTrail: new THREE.MeshBasicMaterial({
    color: 0x94ffff,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  }),
  impact: new THREE.MeshBasicMaterial({
    color: 0xb6ffff,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
  }),
  rocketWhite: new THREE.MeshStandardMaterial({
    color: 0xf4f0df,
    roughness: 0.36,
    metalness: 0.16,
  }),
  rocketRed: new THREE.MeshStandardMaterial({
    color: 0xbd2d3a,
    roughness: 0.5,
    metalness: 0.1,
  }),
  rocketGlass: new THREE.MeshStandardMaterial({
    color: 0x7de7ff,
    emissive: 0x1f8fb0,
    emissiveIntensity: 0.45,
    roughness: 0.18,
    metalness: 0.2,
  }),
  rocketFlame: new THREE.MeshBasicMaterial({
    color: 0xffc547,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  }),
  shield: new THREE.MeshStandardMaterial({
    color: 0x1d425c,
    roughness: 0.48,
    metalness: 0.42,
  }),
  shieldSpike: new THREE.MeshStandardMaterial({
    color: 0xd8f7ff,
    emissive: 0x4ab9d2,
    emissiveIntensity: 0.28,
    roughness: 0.24,
    metalness: 0.55,
  }),
  planetGround: new THREE.MeshStandardMaterial({
    color: 0x3aa879,
    roughness: 0.88,
    metalness: 0.02,
  }),
  planetGroundDark: new THREE.MeshStandardMaterial({
    color: 0x28655f,
    roughness: 0.9,
  }),
  planetGlow: new THREE.MeshStandardMaterial({
    color: 0x65d8b9,
    emissive: 0x1d766a,
    emissiveIntensity: 0.55,
    roughness: 0.42,
  }),
  gold: new THREE.MeshStandardMaterial({
    color: 0xe5b84f,
    roughness: 0.42,
    metalness: 0.25,
  }),
  piglin: new THREE.MeshStandardMaterial({
    color: 0xd17c77,
    roughness: 0.76,
  }),
  piglinCloth: new THREE.MeshStandardMaterial({
    color: 0x402b35,
    roughness: 0.84,
  }),
  gosha: new THREE.MeshStandardMaterial({
    color: 0x191224,
    roughness: 0.72,
    metalness: 0.08,
  }),
  goshaGlow: new THREE.MeshStandardMaterial({
    color: 0xa85bff,
    emissive: 0x6a22e4,
    emissiveIntensity: 0.9,
    roughness: 0.3,
  }),
};

let player;
let swordAnchor;
let swordTrail;
let mountGosha;
let captureRing;
let captureParticles;
let rocket;
let rocketFlame;
let destinationPlanet;
let planetSurface;
const piglins = [];
const rocks = [];
const desertObjects = [];
const planetObjects = [];
const impactBursts = [];
let playerVerticalVelocity = 0;

setupLighting();
createSky();
createTerrain();
createOutposts();
rocket = createRocket();
scene.add(rocket);
destinationPlanet = createDestinationPlanet();
scene.add(destinationPlanet);
planetSurface = createPlanetSurface();
scene.add(planetSurface);
player = createGrowlitheJockey();
scene.add(player);
mountGosha = createMountGosha();
scene.add(mountGosha);
captureRing = createCaptureRing();
scene.add(captureRing);
captureParticles = createCaptureParticles();
scene.add(captureParticles);
spawnPiglins();
resetGame();
window.__GOSHA_GAME_DEBUG__ = {
  state: () => ({
    player: {
      x: player.position.x,
      y: player.position.y,
      z: player.position.z,
    },
    playerYaw: player.rotation.y,
    playerVisible: player.visible,
    mount: {
      x: mountGosha.position.x,
      y: mountGosha.position.y,
      z: mountGosha.position.z,
    },
    rocket: {
      x: rocket.position.x,
      y: rocket.position.y,
      z: rocket.position.z,
      visible: rocket.visible,
    },
    phase: game.phase,
    escaped: game.escaped,
    health: game.health,
    capture: game.capture,
    won: game.won,
    danceTimer: game.danceTimer,
    piglinsDefeated: game.piglinsDefeated,
    piglinsVisible: piglins.filter((piglin) => piglin.visible).length,
    firstPiglin: {
      visible: piglins[0].visible,
      isDown: Boolean(piglins[0].userData.isDown),
      respawn: piglins[0].userData.respawn,
    },
  }),
  placePiglinInSwordRange: () => {
    const piglin = piglins[0];
    const forward = getPlayerForward(new THREE.Vector3());
    const position = player.position.clone().addScaledVector(forward, 2.85);
    position.y = groundY(position.x, position.z);
    piglin.position.copy(position);
    piglin.rotation.set(0, yawForDirection(player.position.clone().sub(piglin.position)), 0);
    piglin.visible = true;
    piglin.userData.health = 1;
    piglin.userData.isDown = false;
    piglin.userData.downTimer = 0;
    piglin.userData.respawn = 0;
    piglin.userData.stun = 0;
    piglin.userData.velocity.set(0, 0, 0);
    game.attackCooldown = 0;
    return window.__GOSHA_GAME_DEBUG__.state();
  },
  placePlayerAtRocket: () => {
    player.position.set(rocketHome.x + 1.8, getCurrentGroundY(rocketHome.x + 1.8, rocketHome.z), rocketHome.z);
    player.rotation.y = yawForDirection(rocket.position.clone().sub(player.position));
    playerVerticalVelocity = 0;
    player.userData.grounded = true;
    return window.__GOSHA_GAME_DEBUG__.state();
  },
  placePlayerOnRock: () => {
    const rock = rocks[0];
    player.position.set(rock.position.x, rock.userData.platformTop + 0.02, rock.position.z);
    playerVerticalVelocity = -1;
    player.userData.grounded = false;
    return window.__GOSHA_GAME_DEBUG__.state();
  },
  placePlayerOverGosha: () => {
    player.position.set(mountGosha.position.x, mountGosha.position.y + 6.2, mountGosha.position.z);
    playerVerticalVelocity = -2;
    player.userData.grounded = false;
    game.capture = 0;
    game.won = false;
    return window.__GOSHA_GAME_DEBUG__.state();
  },
  placeRocketNearPlanet: () => {
    game.phase = "space";
    player.visible = false;
    setWorldMode("space");
    rocket.position.copy(destinationPlanet.position).add(new THREE.Vector3(0, 0, 24));
    shipVelocity.set(0, 0, -18);
    return window.__GOSHA_GAME_DEBUG__.state();
  },
};

window.addEventListener("resize", onResize);
window.addEventListener("keydown", (event) => {
  keys.set(event.code, true);
  if (event.code === "Space") {
    event.preventDefault();
    requestJumpOrBoard();
  }
  if (event.code === "KeyF") {
    swingSword();
  }
  if (event.code === "KeyR") {
    resetGame();
  }
});
window.addEventListener("keyup", (event) => keys.set(event.code, false));
window.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) return;
  swingSword();
});
ui.restartButton.addEventListener("click", resetGame);

animate();

function setupLighting() {
  const hemi = new THREE.HemisphereLight(0x8aa8ff, 0xd8a058, 1.55);
  scene.add(hemi);

  const sunA = new THREE.DirectionalLight(0xffd28c, 2.2);
  sunA.position.set(-38, 42, -22);
  sunA.castShadow = true;
  sunA.shadow.mapSize.set(2048, 2048);
  sunA.shadow.camera.left = -80;
  sunA.shadow.camera.right = 80;
  sunA.shadow.camera.top = 80;
  sunA.shadow.camera.bottom = -80;
  scene.add(sunA);

  const sunB = new THREE.PointLight(0xfff0bd, 2.8, 210);
  sunB.position.set(42, 28, -90);
  scene.add(sunB);
}

function createSky() {
  const starPositions = [];
  const starColors = [];
  const color = new THREE.Color();
  for (let i = 0; i < 1700; i += 1) {
    const radius = THREE.MathUtils.randFloat(120, 240);
    const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
    const y = THREE.MathUtils.randFloat(16, 160);
    starPositions.push(Math.cos(theta) * radius, y, Math.sin(theta) * radius);
    color.setHSL(THREE.MathUtils.randFloat(0.52, 0.68), 0.75, THREE.MathUtils.randFloat(0.74, 1));
    starColors.push(color.r, color.g, color.b);
  }

  const stars = new THREE.BufferGeometry();
  stars.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
  stars.setAttribute("color", new THREE.Float32BufferAttribute(starColors, 3));
  const starField = new THREE.Points(
    stars,
    new THREE.PointsMaterial({
      size: 0.78,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
    }),
  );
  scene.add(starField);

  const sunMaterialA = new THREE.MeshBasicMaterial({ color: 0xffdd8d });
  const sunMaterialB = new THREE.MeshBasicMaterial({ color: 0xfff6c8 });
  const sunOne = new THREE.Mesh(new THREE.SphereGeometry(5.8, 32, 16), sunMaterialA);
  sunOne.position.set(-55, 20, -125);
  scene.add(sunOne);

  const sunTwo = new THREE.Mesh(new THREE.SphereGeometry(3.8, 32, 16), sunMaterialB);
  sunTwo.position.set(-42, 26, -132);
  scene.add(sunTwo);

  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(12, 48, 24),
    new THREE.MeshStandardMaterial({
      color: 0x7c9ccb,
      emissive: 0x1b2450,
      emissiveIntensity: 0.35,
      roughness: 0.7,
    }),
  );
  planet.position.set(72, 74, -142);
  scene.add(planet);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(15, 20, 64),
    new THREE.MeshBasicMaterial({
      color: 0xb7d1ff,
      transparent: true,
      opacity: 0.46,
      side: THREE.DoubleSide,
    }),
  );
  ring.position.copy(planet.position);
  ring.rotation.set(1.1, 0.22, 0.32);
  scene.add(ring);
}

function createTerrain() {
  const geometry = new THREE.PlaneGeometry(worldSize * 2.2, worldSize * 2.2, 150, 150);
  const position = geometry.attributes.position;

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const z = position.getY(i);
    position.setZ(i, duneHeight(x, z));
  }

  geometry.computeVertexNormals();
  const ground = new THREE.Mesh(geometry, materials.sand);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  desertObjects.push(ground);

  for (let i = 0; i < 42; i += 1) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(THREE.MathUtils.randFloat(0.55, 2.3), 0),
      materials.rock,
    );
    const x = THREE.MathUtils.randFloatSpread(worldSize * 1.6);
    const z = THREE.MathUtils.randFloatSpread(worldSize * 1.6);
    if (Math.abs(x) < 12 && Math.abs(z) < 14) {
      i -= 1;
      continue;
    }
    rock.position.set(x, groundY(x, z) + 0.4, z);
    rock.scale.set(
      THREE.MathUtils.randFloat(0.7, 1.8),
      THREE.MathUtils.randFloat(0.35, 1.1),
      THREE.MathUtils.randFloat(0.7, 1.8),
    );
    rock.rotation.set(
      THREE.MathUtils.randFloat(0, Math.PI),
      THREE.MathUtils.randFloat(0, Math.PI),
      THREE.MathUtils.randFloat(0, Math.PI),
    );
    rock.castShadow = true;
    rock.receiveShadow = true;
    rock.userData.platformRadius = Math.max(1.1, rock.scale.x * 1.65);
    rock.userData.platformTop = rock.position.y + rock.scale.y * 1.45;
    rocks.push(rock);
    scene.add(rock);
    desertObjects.push(rock);
  }
}

function createOutposts() {
  const towerMaterial = new THREE.MeshStandardMaterial({
    color: 0xb9b0a3,
    roughness: 0.86,
    metalness: 0.08,
  });
  const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x27313d,
    roughness: 0.65,
    metalness: 0.35,
  });

  const points = [
    [-32, -28],
    [37, -48],
    [-61, 24],
    [58, 32],
  ];

  points.forEach(([x, z], index) => {
    const baseY = groundY(x, z);
    const group = new THREE.Group();
    group.position.set(x, baseY, z);
    group.rotation.y = index * 0.8;

    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 7.5, 10), towerMaterial);
    mast.position.y = 3.75;
    mast.castShadow = true;
    group.add(mast);

    const dish = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 0.42, 0.38, 24), darkMetal);
    dish.position.set(0.95, 6.1, 0);
    dish.rotation.z = Math.PI / 2.65;
    dish.castShadow = true;
    group.add(dish);

    const legs = [
      [-0.8, 0, -0.8],
      [0.8, 0, -0.8],
      [-0.8, 0, 0.8],
      [0.8, 0, 0.8],
    ];
    legs.forEach((start) => {
      const leg = cylinderBetween(
        new THREE.Vector3(0, 2.2, 0),
        new THREE.Vector3(start[0], 0.2, start[2]),
        0.07,
        darkMetal,
      );
      group.add(leg);
    });

    scene.add(group);
    desertObjects.push(group);
  });
}

function createRocket() {
  const group = new THREE.Group();
  group.name = "Growlithe Rider Escape Rocket";
  rocketHome.y = groundY(rocketHome.x, rocketHome.z);
  group.position.copy(rocketHome);

  const pad = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.4, 0.35, 40), materials.rock);
  pad.position.y = 0.18;
  pad.receiveShadow = true;
  group.add(pad);

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.92, 5.2, 28), materials.rocketWhite);
  body.position.y = 3.0;
  body.castShadow = true;
  group.add(body);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.55, 28), materials.rocketRed);
  nose.position.y = 6.35;
  nose.castShadow = true;
  group.add(nose);

  const windowMesh = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 12), materials.rocketGlass);
  windowMesh.position.set(0, 4.35, -0.72);
  windowMesh.scale.set(1, 1, 0.28);
  windowMesh.castShadow = true;
  group.add(windowMesh);

  for (let i = 0; i < 3; i += 1) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.2, 1.08), materials.rocketRed);
    const angle = (i / 3) * Math.PI * 2;
    fin.position.set(Math.sin(angle) * 0.86, 1.18, Math.cos(angle) * 0.86);
    fin.rotation.y = angle;
    fin.rotation.z = Math.sin(angle) * 0.18;
    fin.castShadow = true;
    group.add(fin);
  }

  rocketFlame = new THREE.Mesh(new THREE.ConeGeometry(0.72, 2.4, 22), materials.rocketFlame);
  rocketFlame.position.y = 0.2;
  rocketFlame.rotation.x = Math.PI;
  rocketFlame.visible = false;
  group.add(rocketFlame);

  group.userData.home = rocketHome.clone();
  group.userData.boardRadius = 5.6;
  return group;
}

function createDestinationPlanet() {
  const group = new THREE.Group();
  group.name = "Escape Planet";
  group.position.copy(destinationPlanetPosition);
  group.visible = false;

  const planet = new THREE.Mesh(new THREE.SphereGeometry(18, 48, 24), materials.planetGlow);
  planet.castShadow = false;
  group.add(planet);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(22, 29, 72),
    new THREE.MeshBasicMaterial({
      color: 0xb3ffee,
      transparent: true,
      opacity: 0.48,
      side: THREE.DoubleSide,
    }),
  );
  ring.rotation.set(1.1, 0.2, 0.45);
  group.add(ring);

  return group;
}

function createPlanetSurface() {
  const group = new THREE.Group();
  group.name = "Different Planet Surface";
  group.visible = false;

  const geometry = new THREE.PlaneGeometry(worldSize * 1.45, worldSize * 1.45, 90, 90);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const z = position.getY(i);
    position.setZ(i, planetHeight(x, z));
  }
  geometry.computeVertexNormals();

  const ground = new THREE.Mesh(geometry, materials.planetGround);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);

  for (let i = 0; i < 18; i += 1) {
    const crystal = new THREE.Mesh(
      new THREE.ConeGeometry(THREE.MathUtils.randFloat(0.28, 0.7), THREE.MathUtils.randFloat(1.4, 3.4), 5),
      materials.planetGroundDark,
    );
    const x = THREE.MathUtils.randFloatSpread(worldSize * 0.9);
    const z = THREE.MathUtils.randFloatSpread(worldSize * 0.9);
    crystal.position.set(x, planetHeight(x, z) + crystal.geometry.parameters.height / 2, z);
    crystal.rotation.z = THREE.MathUtils.randFloat(-0.18, 0.18);
    crystal.castShadow = true;
    group.add(crystal);
  }

  planetObjects.push(group);
  return group;
}

function createGrowlitheJockey() {
  const group = new THREE.Group();
  group.name = "Growlithe Rider Player";

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.96, 30, 18), materials.growlitheFur);
  body.scale.set(1.18, 0.72, 1.62);
  body.position.set(0, 1.15, 0.12);
  body.castShadow = true;
  group.add(body);

  const mane = new THREE.Mesh(new THREE.SphereGeometry(0.92, 24, 16), materials.growlitheCream);
  mane.scale.set(1.05, 0.9, 0.95);
  mane.position.set(0, 1.42, -1.02);
  mane.castShadow = true;
  group.add(mane);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.66, 24, 16), materials.growlitheFur);
  head.scale.set(0.9, 0.78, 0.96);
  head.position.set(0, 1.86, -1.76);
  head.castShadow = true;
  group.add(head);

  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.38, 18, 12), materials.growlitheCream);
  muzzle.scale.set(1.25, 0.72, 0.82);
  muzzle.position.set(0, 1.74, -2.27);
  muzzle.castShadow = true;
  group.add(muzzle);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), materials.growlitheNose);
  nose.scale.set(1.15, 0.8, 0.82);
  nose.position.set(0, 1.82, -2.6);
  nose.castShadow = true;
  group.add(nose);

  const eyeMaterial = new THREE.MeshStandardMaterial({
    color: 0xf8fbff,
    roughness: 0.28,
  });
  const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x1b2230 });
  [-0.24, 0.24].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), eyeMaterial);
    eye.position.set(x, 1.94, -2.22);
    eye.scale.set(1, 0.9, 0.35);
    group.add(eye);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), pupilMaterial);
    pupil.position.set(x * 1.02, 1.94, -2.29);
    pupil.scale.set(1, 1, 0.25);
    group.add(pupil);
  });

  [-0.48, 0.48].forEach((x) => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.74, 4), materials.growlitheFur);
    ear.position.set(x, 2.08, -1.72);
    ear.rotation.set(0.28, x > 0 ? -0.42 : 0.42, x > 0 ? -0.75 : 0.75);
    ear.scale.y = 0.82;
    ear.castShadow = true;
    group.add(ear);

    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.48, 4), materials.growlitheCream);
    inner.position.set(x * 1.02, 2.04, -1.79);
    inner.rotation.copy(ear.rotation);
    inner.scale.y = 0.72;
    group.add(inner);
  });

  const crestPositions = [
    [0, 2.34, -1.82, 0.36],
    [0, 2.55, -1.54, 0.48],
    [0, 2.7, -1.25, 0.36],
  ];
  crestPositions.forEach(([x, y, z, scale]) => {
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.34 * scale, 0.96 * scale, 5), materials.growlitheCream);
    tuft.position.set(x, y, z);
    tuft.rotation.x = -0.68;
    tuft.castShadow = true;
    group.add(tuft);
  });

  [-0.42, 0.42].forEach((x) => {
    [-0.4, 0.48].forEach((z, stripeIndex) => {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.72), materials.growlitheStripe);
      stripe.position.set(x, 1.45, z);
      stripe.rotation.set(0.36, 0.18 * Math.sign(x), x > 0 ? -0.64 : 0.64);
      stripe.castShadow = true;
      group.add(stripe);
      stripe.userData.stripeIndex = stripeIndex;
    });
  });

  [-0.62, 0.62].forEach((x) => {
    group.add(createGrowlitheLeg(x, -0.92, x > 0 ? 0 : 1));
    group.add(createGrowlitheLeg(x, 0.78, x > 0 ? 2 : 3));
  });

  const tailBase = new THREE.Group();
  tailBase.position.set(0, 1.66, 1.68);
  tailBase.rotation.set(0.35, 0, 0);
  group.add(tailBase);

  const tailCurl = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.15, 12, 34, Math.PI * 1.48), materials.growlitheCream);
  tailCurl.rotation.set(0.12, Math.PI / 2, 0);
  tailCurl.castShadow = true;
  tailBase.add(tailCurl);

  const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 10), materials.growlitheCream);
  tailTip.position.set(0.04, 0.33, 0.32);
  tailTip.castShadow = true;
  tailBase.add(tailTip);

  const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.16, 0.86), materials.gold);
  saddle.position.set(0, 1.82, -0.03);
  saddle.castShadow = true;
  group.add(saddle);

  const rider = new THREE.Group();
  rider.position.set(0, 2.02, -0.12);
  group.add(rider);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.78, 0.32), materials.rider);
  torso.position.y = 0.38;
  torso.castShadow = true;
  rider.add(torso);

  const riderHead = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.44, 0.44), materials.riderSkin);
  riderHead.position.y = 1.0;
  riderHead.castShadow = true;
  rider.add(riderHead);

  const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.2, 0.52), materials.gold);
  helmet.position.y = 1.26;
  helmet.castShadow = true;
  rider.add(helmet);

  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.68, 0.18), materials.riderSkin);
  leftArm.position.set(-0.44, 0.36, 0.02);
  leftArm.rotation.z = -0.22;
  leftArm.castShadow = true;
  rider.add(leftArm);
  rider.add(createShoulderShield());

  const rightArm = new THREE.Group();
  rightArm.position.set(0.42, 0.65, -0.03);
  rightArm.rotation.z = -0.42;
  rider.add(rightArm);

  const armMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.72, 0.18), materials.riderSkin);
  armMesh.position.y = -0.3;
  armMesh.castShadow = true;
  rightArm.add(armMesh);

  swordAnchor = new THREE.Group();
  swordAnchor.position.set(0.1, -0.58, -0.02);
  swordAnchor.rotation.set(0.35, 0.05, -1.15);
  rightArm.add(swordAnchor);
  swordAnchor.add(createDiamondSword());

  swordTrail = createSwordTrail();
  group.add(swordTrail);

  group.userData.walkCycle = 0;
  group.userData.grounded = true;
  group.userData.legs = group.children.filter((child) => child.userData.isLeg);
  return group;
}

function createGrowlitheLeg(x, z, index) {
  const group = new THREE.Group();
  group.userData.isLeg = true;
  group.userData.index = index;
  group.position.set(x, 0.82, z);

  const upper = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.74, 0.34), materials.growlitheFur);
  upper.position.y = 0.16;
  upper.castShadow = true;
  group.add(upper);

  const cuff = new THREE.Mesh(new THREE.SphereGeometry(0.25, 14, 10), materials.growlitheCream);
  cuff.scale.set(1.15, 0.75, 1.05);
  cuff.position.y = -0.16;
  cuff.castShadow = true;
  group.add(cuff);

  const paw = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), materials.growlitheCream);
  paw.scale.set(1.22, 0.42, 1.0);
  paw.position.set(0, -0.48, -0.05);
  paw.castShadow = true;
  group.add(paw);

  for (let i = -1; i <= 1; i += 1) {
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.14, 8), materials.shieldSpike);
    claw.position.set(i * 0.09, -0.51, -0.24);
    claw.rotation.x = -Math.PI / 2;
    group.add(claw);
  }

  return group;
}

function createShoulderShield() {
  const shield = new THREE.Group();
  shield.name = "Spiked Shoulder Shield";
  shield.position.set(-0.54, 0.62, -0.02);
  shield.rotation.set(0.08, 0.2, 0.72);

  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.46, 0.16, 8), materials.shield);
  plate.scale.set(1, 0.42, 1.22);
  plate.rotation.x = Math.PI / 2;
  plate.castShadow = true;
  shield.add(plate);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.035, 8, 24), materials.gold);
  rim.rotation.x = Math.PI / 2;
  rim.scale.z = 1.22;
  rim.castShadow = true;
  shield.add(rim);

  const spikePositions = [
    [0, 0.14, -0.42],
    [-0.31, 0.12, -0.16],
    [0.31, 0.12, -0.16],
    [0, 0.12, 0.28],
  ];

  spikePositions.forEach(([x, y, z]) => {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.28, 10), materials.shieldSpike);
    spike.position.set(x, y, z);
    spike.rotation.x = Math.PI / 2;
    spike.castShadow = true;
    shield.add(spike);
  });

  return shield;
}

function createDiamondSword() {
  const sword = new THREE.Group();
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.62, 0.1), materials.gold);
  grip.position.y = 0.18;
  grip.castShadow = true;
  sword.add(grip);

  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.1, 0.16), materials.swordCore);
  guard.position.y = 0.5;
  guard.castShadow = true;
  sword.add(guard);

  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.24, 0.12), materials.sword);
  blade.position.y = 1.14;
  blade.castShadow = true;
  sword.add(blade);

  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.34, 4), materials.swordCore);
  tip.position.y = 1.91;
  tip.rotation.y = Math.PI / 4;
  tip.castShadow = true;
  sword.add(tip);

  return sword;
}

function createSwordTrail() {
  const trail = new THREE.Mesh(
    new THREE.RingGeometry(1.35, 3.45, 54, 1, Math.PI * 1.07, Math.PI * 0.86),
    materials.swordTrail,
  );
  trail.position.set(0, 2.35, -0.48);
  trail.rotation.x = -Math.PI / 2;
  trail.visible = false;
  return trail;
}

function createMountGosha() {
  const group = new THREE.Group();
  group.name = "Evil Mount Gosha";
  group.position.set(8, 0, -74);

  const body = new THREE.Mesh(new THREE.SphereGeometry(2.3, 32, 18), materials.gosha);
  body.scale.set(1.55, 0.9, 2.15);
  body.position.y = 2.05;
  body.castShadow = true;
  group.add(body);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(1.45, 28, 16), materials.gosha);
  chest.scale.set(1.05, 1.1, 1.15);
  chest.position.set(0, 2.28, -2.45);
  chest.castShadow = true;
  group.add(chest);

  const head = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.24, 1.5), materials.gosha);
  head.position.set(0, 3.04, -3.55);
  head.castShadow = true;
  group.add(head);

  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xff4bdf,
    emissive: 0xff1fbf,
    emissiveIntensity: 1.6,
  });
  [-0.38, 0.38].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8), eyeMat);
    eye.position.set(x, 3.2, -4.33);
    group.add(eye);
  });

  [-0.78, 0.78].forEach((x) => {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.35, 12), materials.goshaGlow);
    horn.position.set(x, 3.56, -3.98);
    horn.rotation.x = -0.7;
    horn.rotation.z = x > 0 ? -0.46 : 0.46;
    horn.castShadow = true;
    group.add(horn);
  });

  [-1.25, 1.25].forEach((x) => {
    [-1.3, 1.15].forEach((z) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 1.8, 12), materials.gosha);
      leg.position.set(x, 0.94, z);
      leg.castShadow = true;
      group.add(leg);
    });
  });

  for (let i = 0; i < 5; i += 1) {
    const crystal = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.9, 5), materials.goshaGlow);
    crystal.position.set(THREE.MathUtils.randFloat(-0.9, 0.9), 3.0 + i * 0.14, -0.8 + i * 0.58);
    crystal.rotation.x = THREE.MathUtils.randFloat(-0.36, 0.36);
    crystal.rotation.z = THREE.MathUtils.randFloat(-0.42, 0.42);
    crystal.castShadow = true;
    group.add(crystal);
  }

  group.userData.base = group.position.clone();
  return group;
}

function createCaptureRing() {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(5.35, 0.075, 10, 96),
    new THREE.MeshStandardMaterial({
      color: 0x6df6ff,
      emissive: 0x2cdde8,
      emissiveIntensity: 1.4,
      transparent: true,
      opacity: 0.75,
    }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.copy(mountGosha.position);
  ring.position.y = groundY(mountGosha.position.x, mountGosha.position.z) + 0.16;
  return ring;
}

function createCaptureParticles() {
  const positions = [];
  for (let i = 0; i < 84; i += 1) {
    const angle = (i / 84) * Math.PI * 2;
    const radius = THREE.MathUtils.randFloat(4.8, 5.8);
    positions.push(Math.cos(angle) * radius, THREE.MathUtils.randFloat(0.1, 2.8), Math.sin(angle) * radius);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0x79f7ff,
      size: 0.12,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    }),
  );
  particles.position.copy(mountGosha.position);
  particles.position.y = groundY(mountGosha.position.x, mountGosha.position.z);
  return particles;
}

function createPiglin(index, x, z) {
  const group = new THREE.Group();
  group.name = `Piglin Blocker ${index + 1}`;
  group.position.set(x, groundY(x, z), z);

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.78, 1.08, 0.48), materials.piglinCloth);
  body.position.y = 1.04;
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.66, 0.64), materials.piglin);
  head.position.y = 1.85;
  head.castShadow = true;
  group.add(head);

  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.22, 0.18), materials.piglin);
  snout.position.set(0, 1.78, -0.42);
  snout.castShadow = true;
  group.add(snout);

  [-0.26, 0.26].forEach((xPos) => {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.28, 0.08), materials.piglin);
    ear.position.set(xPos, 2.1, -0.14);
    ear.rotation.z = xPos > 0 ? -0.28 : 0.28;
    ear.castShadow = true;
    group.add(ear);
  });

  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.16, 0.54), materials.gold);
  belt.position.y = 0.72;
  belt.castShadow = true;
  group.add(belt);

  const weapon = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.35, 0.12), materials.gold);
  weapon.position.set(0.58, 1.12, -0.1);
  weapon.rotation.z = -0.24;
  weapon.castShadow = true;
  group.add(weapon);

  [-0.22, 0.22].forEach((xPos) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.72, 0.22), materials.piglin);
    leg.position.set(xPos, 0.34, 0);
    leg.castShadow = true;
    group.add(leg);
  });

  group.userData = {
    spawn: new THREE.Vector3(x, 0, z),
    velocity: new THREE.Vector3(),
    health: 1,
    stun: 0,
    respawn: 0,
    downTimer: 0,
    isDown: false,
    attackCooldown: THREE.MathUtils.randFloat(0.1, 1.2),
    speed: THREE.MathUtils.randFloat(3.0, 4.4),
  };
  return group;
}

function spawnPiglins() {
  const spawns = [
    [-13, -29],
    [19, -37],
    [-27, -55],
    [37, -65],
    [5, -48],
    [-44, -18],
    [42, -22],
    [-10, -75],
  ];

  spawns.forEach(([x, z], index) => {
    const piglin = createPiglin(index, x, z);
    piglins.push(piglin);
    scene.add(piglin);
  });
}

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.04);
  const elapsed = clock.elapsedTime;

  if (!game.lost && game.phase !== "launching" && game.phase !== "space") {
    updatePlayer(delta);
    if (game.phase === "desert" && !game.won) {
      updatePiglins(delta);
      updateCapture(delta);
    }
  } else {
    updateIdlePlayer(delta);
  }

  updateMount(elapsed);
  updateRocket(delta, elapsed);
  updateEffects(delta);
  updateCamera(delta, elapsed);
  updateHud(delta);
  renderer.render(scene, camera);
}

function updatePlayer(delta) {
  const move = tempVec.set(0, 0, 0);
  if (keys.get("KeyW") || keys.get("ArrowUp")) move.z -= 1;
  if (keys.get("KeyS") || keys.get("ArrowDown")) move.z += 1;
  if (keys.get("KeyA") || keys.get("ArrowLeft")) move.x -= 1;
  if (keys.get("KeyD") || keys.get("ArrowRight")) move.x += 1;

  const hasMovement = move.lengthSq() > 0;
  if (hasMovement && game.danceTimer <= 0 && !game.won) {
    move.normalize();
    const speed = keys.get("ShiftLeft") || keys.get("ShiftRight") ? 14 : 9.2;
    player.rotation.y = dampAngle(player.rotation.y, yawForDirection(move), 13, delta);
    playerVelocity.lerp(move.multiplyScalar(speed), 0.16);
    player.userData.walkCycle += delta * playerVelocity.length() * 1.4;
  } else {
    playerVelocity.lerp(tempVec.set(0, 0, 0), 0.16);
  }

  player.position.addScaledVector(playerVelocity, delta);
  player.position.x = THREE.MathUtils.clamp(player.position.x, -worldSize + 10, worldSize - 10);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -worldSize + 10, worldSize - 10);
  updatePlayerVertical(delta);
  updateJumpInteractions();

  if (game.danceTimer > 0) {
    game.danceTimer = Math.max(0, game.danceTimer - delta);
    player.rotation.y += delta * 5.2;
    player.position.y += Math.sin(clock.elapsedTime * 18) * 0.018;
  }

  const bob = Math.sin(player.userData.walkCycle * 2) * Math.min(playerVelocity.length() / 9, 1) * 0.07;
  player.children[0].position.y = 1.15 + bob;
  player.children[1].position.y = 1.25 + bob * 0.7;

  player.userData.legs.forEach((leg) => {
    const phase = player.userData.walkCycle + leg.userData.index * 0.85;
    const side = leg.position.x > 0 ? 1 : -1;
    leg.rotation.z = side * (0.06 + Math.sin(phase) * 0.13);
    leg.rotation.x = Math.cos(phase) * 0.08;
  });

  game.attackCooldown = Math.max(0, game.attackCooldown - delta);
  if (game.attackTimer > 0) {
    game.attackTimer = Math.max(0, game.attackTimer - delta);
    const t = 1 - game.attackTimer / 0.36;
    const swing = Math.sin(t * Math.PI);
    swordAnchor.rotation.z = -1.15 - swing * 1.75;
    swordAnchor.rotation.x = 0.3 + swing * 0.68;
    swordTrail.visible = true;
    swordTrail.material.opacity = swing * 0.58;
    swordTrail.rotation.z = -0.72 + t * 1.46;
    swordTrail.scale.setScalar(0.9 + swing * 0.16);
  } else {
    swordAnchor.rotation.z = THREE.MathUtils.lerp(swordAnchor.rotation.z, -1.15, 0.14);
    swordAnchor.rotation.x = THREE.MathUtils.lerp(swordAnchor.rotation.x, 0.35, 0.14);
    swordTrail.material.opacity = THREE.MathUtils.lerp(swordTrail.material.opacity, 0, 0.22);
    swordTrail.visible = swordTrail.material.opacity > 0.02;
  }
}

function updateIdlePlayer(delta) {
  player.userData.walkCycle += delta * 1.2;
  player.userData.legs.forEach((leg) => {
    const side = leg.position.x > 0 ? 1 : -1;
    leg.rotation.z = side * (0.06 + Math.sin(player.userData.walkCycle + leg.userData.index) * 0.035);
  });
}

function updatePlayerVertical(delta) {
  const surface = getLandingSurface(player.position.x, player.position.z);

  if (!player.userData.grounded || playerVerticalVelocity !== 0) {
    playerVerticalVelocity -= 24 * delta;
    player.position.y += playerVerticalVelocity * delta;

    if (player.position.y <= surface.y) {
      player.position.y = surface.y;
      playerVerticalVelocity = 0;
      player.userData.grounded = true;
      onPlayerLanded(surface);
    } else {
      player.userData.grounded = false;
    }
  } else {
    player.position.y = surface.y;
    player.userData.grounded = true;
  }
}

function updateJumpInteractions() {
  if (game.phase !== "desert" || playerVerticalVelocity >= 0 || player.userData.grounded) return;

  const flatDistanceToGosha = flatDistance(player.position, mountGosha.position);
  if (flatDistanceToGosha < 3.6 && player.position.y <= mountGosha.position.y + 5.4) {
    captureMountByJump();
  }
}

function onPlayerLanded(surface) {
  if (surface.type === "rock" && game.phase === "desert") {
    startRockDance();
  }
}

function requestJumpOrBoard() {
  if (game.lost || game.phase === "launching" || game.phase === "space") return;

  if (game.phase === "desert" && player.position.distanceTo(rocket.position) < rocket.userData.boardRadius) {
    beginRocketBoarding();
    return;
  }

  if (player.userData.grounded) {
    playerVerticalVelocity = 10.8;
    player.userData.grounded = false;
    if (game.phase === "desert") {
      setStatus("Jump onto Mount Gosha to capture, or land on a rock to dance.", 1.8);
    }
  }
}

function startRockDance() {
  game.danceTimer = 2.35;
  setStatus("Rock dance. The piglins have to watch.", 2.35);
}

function captureMountByJump() {
  game.capture = 100;
  game.won = true;
  player.position.set(mountGosha.position.x, mountGosha.position.y + 4.2, mountGosha.position.z);
  playerVerticalVelocity = 0;
  player.userData.grounded = true;
  game.cameraShake = Math.max(game.cameraShake, 0.16);
  setStatus("You jumped onto Mount Gosha and captured it.", 20);
  mountGosha.children.forEach((child) => {
    if (child.material?.emissive) {
      child.material.emissive.setHex(0x14f7ff);
    }
  });
}

function updatePiglins(delta) {
  piglins.forEach((piglin, index) => {
    const data = piglin.userData;

    if (data.respawn > 0) {
      data.respawn -= delta;

      if (data.isDown) {
        data.downTimer -= delta;
        piglin.position.addScaledVector(data.velocity, delta);
        data.velocity.multiplyScalar(0.9);
        piglin.position.y = groundY(piglin.position.x, piglin.position.z);
        piglin.rotation.x = THREE.MathUtils.lerp(piglin.rotation.x, -Math.PI / 2, 0.16);
        piglin.rotation.z = THREE.MathUtils.lerp(piglin.rotation.z, 0.24, 0.12);

        if (data.downTimer <= 0) {
          piglin.visible = false;
          data.isDown = false;
        }

        return;
      }

      if (data.respawn <= 0) {
        resetPiglin(piglin);
      }
      return;
    }

    data.attackCooldown = Math.max(0, data.attackCooldown - delta);

    const toPlayer = player.position.clone().sub(piglin.position);
    const distance = toPlayer.length();

    if (data.stun > 0) {
      data.stun -= delta;
      piglin.position.addScaledVector(data.velocity, delta);
      data.velocity.multiplyScalar(0.91);
    } else if (distance < 78) {
      toPlayer.y = 0;
      toPlayer.normalize();
      const speed = data.speed * (distance < 18 ? 1.15 : 1);
      piglin.position.addScaledVector(toPlayer, speed * delta);
      piglin.rotation.y = yawForDirection(toPlayer);

      if (distance < 2.1 && data.attackCooldown <= 0) {
        damagePlayer(8 + Math.floor(index % 3), "A piglin blocked the charge.");
        data.attackCooldown = 1.05;
        data.velocity.copy(toPlayer).multiplyScalar(-3);
        data.stun = 0.14;
      }
    } else {
      const home = data.spawn.clone().sub(piglin.position);
      if (home.lengthSq() > 8) {
        home.y = 0;
        home.normalize();
        piglin.position.addScaledVector(home, data.speed * 0.4 * delta);
        piglin.rotation.y = yawForDirection(home);
      }
    }

    piglin.position.x = THREE.MathUtils.clamp(piglin.position.x, -worldSize + 8, worldSize - 8);
    piglin.position.z = THREE.MathUtils.clamp(piglin.position.z, -worldSize + 8, worldSize - 8);
    piglin.position.y = groundY(piglin.position.x, piglin.position.z);

    const stride = clock.elapsedTime * 6 + index;
    piglin.children.forEach((child, childIndex) => {
      if (childIndex >= piglin.children.length - 2) {
        child.rotation.x = Math.sin(stride + childIndex * Math.PI) * 0.18;
      }
    });
  });
}

function updateCapture(delta) {
  const flatPlayer = player.position.clone();
  flatPlayer.y = 0;
  const flatGosha = mountGosha.position.clone();
  flatGosha.y = 0;
  const distance = flatPlayer.distanceTo(flatGosha);
  const nearGosha = distance < 5.8;
  const blockers = piglins.filter(
    (piglin) => piglin.visible && piglin.position.distanceTo(player.position) < 4.6,
  ).length;

  ui.capturePrompt.classList.toggle("visible", nearGosha && !game.won);

  if (nearGosha && keys.get("KeyE") && blockers === 0) {
    game.capture = Math.min(100, game.capture + delta * 21);
    setStatus("Mount Gosha is weakening.");
  } else if (nearGosha && keys.get("KeyE") && blockers > 0) {
    game.capture = Math.max(0, game.capture - delta * 5);
    setStatus("Piglins are breaking the capture circle.");
  } else if (!nearGosha) {
    game.capture = Math.max(0, game.capture - delta * 2.5);
  }

  if (game.capture >= 100 && !game.won) {
    game.won = true;
    setStatus("Mount Gosha captured. The Growlithe rider owns the dune route.", 20);
    mountGosha.children.forEach((child) => {
      if (child.material?.emissive) {
        child.material.emissive.setHex(0x14f7ff);
      }
    });
  }
}

function updateMount(elapsed) {
  if (game.phase !== "desert") return;

  const base = mountGosha.userData.base;
  mountGosha.position.x = base.x + Math.sin(elapsed * 0.42) * 2.4;
  mountGosha.position.z = base.z + Math.cos(elapsed * 0.35) * 1.5;
  mountGosha.position.y = groundY(mountGosha.position.x, mountGosha.position.z);
  mountGosha.rotation.y = Math.sin(elapsed * 0.5) * 0.22;
  mountGosha.position.y += Math.sin(elapsed * 1.6) * 0.07;

  captureRing.position.set(
    mountGosha.position.x,
    groundY(mountGosha.position.x, mountGosha.position.z) + 0.16,
    mountGosha.position.z,
  );
  captureRing.rotation.z += 0.45 * clock.getDelta();
  captureRing.material.opacity = 0.52 + Math.sin(elapsed * 3) * 0.16;

  captureParticles.position.copy(captureRing.position);
  captureParticles.position.y += 0.1;
  captureParticles.rotation.y -= 0.25 * clock.getDelta();
}

function updateRocket(delta, elapsed) {
  if (!rocket) return;

  if (game.phase === "desert") {
    rocket.position.y = rocketHome.y + Math.sin(elapsed * 1.6) * 0.035;
    rocket.rotation.set(0, Math.sin(elapsed * 0.6) * 0.02, 0);
    updateRocketFlame(0);
    return;
  }

  if (game.phase === "launching") {
    game.launchTimer += delta;
    const lift = game.launchTimer * game.launchTimer * 14;
    rocket.position.set(rocketHome.x, rocketHome.y + lift, rocketHome.z);
    rocket.rotation.set(Math.sin(elapsed * 12) * 0.025, Math.sin(elapsed * 9) * 0.025, 0);
    updateRocketFlame(1);
    game.cameraShake = Math.max(game.cameraShake, 0.09);

    if (game.launchTimer >= 2.65) {
      beginSpaceFlight();
    }
    return;
  }

  if (game.phase === "space") {
    const toPlanet = destinationPlanet.position.clone().sub(rocket.position);
    const distance = toPlanet.length();
    const direction = toPlanet.normalize();
    const steer = tempVec.set(0, 0, 0);

    if (keys.get("KeyA") || keys.get("ArrowLeft")) steer.x -= 1;
    if (keys.get("KeyD") || keys.get("ArrowRight")) steer.x += 1;
    if (keys.get("KeyW") || keys.get("ArrowUp")) steer.y += 1;
    if (keys.get("KeyS") || keys.get("ArrowDown")) steer.y -= 1;

    shipVelocity.lerp(direction.multiplyScalar(35).add(steer.multiplyScalar(13)), 0.045);
    rocket.position.addScaledVector(shipVelocity, delta);

    const flyDirection = shipVelocity.lengthSq() > 1 ? shipVelocity.clone().normalize() : direction;
    rocket.quaternion.slerp(
      new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), flyDirection),
      0.14,
    );
    updateRocketFlame(0.92 + Math.sin(elapsed * 20) * 0.08);
    destinationPlanet.rotation.y += delta * 0.18;

    if (distance < 23) {
      landOnNewPlanet();
    }
  }
}

function updateRocketFlame(power) {
  if (!rocketFlame) return;
  rocketFlame.visible = power > 0.03;
  rocketFlame.material.opacity = THREE.MathUtils.clamp(power, 0, 1) * 0.82;
  const scale = 0.65 + power * (0.5 + Math.sin(clock.elapsedTime * 28) * 0.08);
  rocketFlame.scale.set(scale, scale, scale);
}

function beginRocketBoarding() {
  game.phase = "launching";
  game.launchTimer = 0;
  game.won = false;
  player.visible = false;
  playerVelocity.set(0, 0, 0);
  playerVerticalVelocity = 0;
  setWorldMode("launching");
  setStatus("Growlithe rider jumped into the rocket. Launching.", 3.2);
}

function beginSpaceFlight() {
  game.phase = "space";
  shipVelocity.set(0, 8, -32);
  rocket.position.set(0, 72, 36);
  rocket.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0.1, -1).normalize());
  setWorldMode("space");
  setStatus("Outer space. Fly to the green planet to escape the piglins.", 4);
}

function landOnNewPlanet() {
  game.phase = "planet";
  game.escaped = true;
  game.won = false;
  setWorldMode("planet");
  player.visible = true;
  player.position.set(0, planetHeight(0, 12), 12);
  player.rotation.y = 0;
  player.userData.grounded = true;
  playerVerticalVelocity = 0;
  rocket.position.set(8, planetHeight(8, 20), 20);
  rocket.rotation.set(0, 0.32, 0);
  shipVelocity.set(0, 0, 0);
  setStatus("You landed on a different planet. The piglins are far away.", 8);
}

function setWorldMode(mode) {
  const showDesert = mode === "desert" || mode === "launching";
  const showPlanet = mode === "planet";
  const showSpacePlanet = mode === "space";

  desertObjects.forEach((object) => {
    object.visible = showDesert;
  });
  planetObjects.forEach((object) => {
    object.visible = showPlanet;
  });

  destinationPlanet.visible = showSpacePlanet;
  mountGosha.visible = showDesert;
  captureRing.visible = showDesert;
  captureParticles.visible = showDesert;
  piglins.forEach((piglin) => {
    piglin.visible = showDesert && !piglin.userData.isDown;
  });
  rocket.visible = true;
}

function updateCamera(delta, elapsed) {
  if (game.phase === "launching") {
    const desired = rocket.position.clone().add(new THREE.Vector3(8, 5, 17));
    camera.position.lerp(desired, 1 - Math.pow(0.001, delta));
    camera.lookAt(rocket.position.clone().add(new THREE.Vector3(0, 3, 0)));
    return;
  }

  if (game.phase === "space") {
    const desired = rocket.position.clone().add(new THREE.Vector3(0, 7, 24));
    camera.position.lerp(desired, 1 - Math.pow(0.001, delta));
    camera.lookAt(rocket.position.clone().add(shipVelocity.clone().normalize().multiplyScalar(8)));
    return;
  }

  const cameraOffset = new THREE.Vector3(0, 5.8, 10.8).applyAxisAngle(yAxis, player.rotation.y);
  const desired = player.position.clone().add(cameraOffset);
  desired.y = Math.max(desired.y, getCurrentGroundY(desired.x, desired.z) + 3.2);

  if (game.cameraShake > 0) {
    game.cameraShake = Math.max(0, game.cameraShake - delta);
    const shake = game.cameraShake * 0.4;
    desired.x += Math.sin(elapsed * 62) * shake;
    desired.y += Math.cos(elapsed * 71) * shake;
  }

  camera.position.lerp(desired, 1 - Math.pow(0.001, delta));
  const lookAt = player.position.clone().add(new THREE.Vector3(0, 1.8, 0));
  camera.lookAt(lookAt);
}

function updateHud(delta) {
  game.statusTimer = Math.max(0, game.statusTimer - delta);
  if (game.statusTimer <= 0 && !game.won && !game.lost) {
    if (game.phase === "space") {
      ui.status.textContent = "Steer the rocket to the green planet.";
    } else if (game.phase === "planet") {
      ui.status.textContent = "New planet reached. Piglins cannot follow.";
    } else if (game.phase === "launching") {
      ui.status.textContent = "Rocket climbing out of the desert.";
    } else {
      const distance = player.position.distanceTo(mountGosha.position);
      const rocketDistance = player.position.distanceTo(rocket.position);
      if (rocketDistance < rocket.userData.boardRadius) {
        ui.status.textContent = "Press Space to jump into the rocket.";
      } else if (distance < 9) {
        ui.status.textContent = "Jump onto Mount Gosha or hold E inside the capture circle.";
      } else if (distance < 28) {
        ui.status.textContent = "The evil mount is close.";
      } else {
        ui.status.textContent = "Find Mount Gosha, rocks to dance on, or the escape rocket.";
      }
    }
  }

  ui.missionEyebrow.textContent = game.phase === "planet" ? "Escaped" : "Growlithe Rider";
  ui.missionTitle.textContent =
    game.phase === "space"
      ? "Fly To The Planet"
      : game.phase === "planet"
        ? "Safe On A New Planet"
        : "Capture Mount Gosha";
  ui.healthFill.style.width = `${game.health}%`;
  ui.healthText.textContent = `${Math.round(game.health)}`;
  ui.captureFill.style.width = `${game.capture}%`;
  ui.captureText.textContent = `${Math.round(game.capture)}%`;
  ui.piglinScore.textContent = `${game.piglinsDefeated}`;
  const nearRocket = game.phase === "desert" && player.position.distanceTo(rocket.position) < rocket.userData.boardRadius;
  ui.rocketPrompt.classList.toggle("visible", nearRocket);
  updateTargetIndicator();
}

function swingSword() {
  if (game.lost || game.won || game.attackCooldown > 0) return;

  game.attackCooldown = 0.54;
  game.attackTimer = 0.36;
  const hits = getSwordHits();

  hits.forEach(({ piglin, hitDir }) => takeDownPiglin(piglin, hitDir));

  if (hits.length > 0) {
    game.cameraShake = Math.max(game.cameraShake, 0.08);
  } else {
    setStatus("Face a piglin and swing close to land the diamond sword.", 1.2);
  }
}

function getSwordHits() {
  const forward = getPlayerForward(tempVec2);
  const right = getPlayerRight(tempVec3);
  const hits = [];

  piglins.forEach((piglin) => {
    const data = piglin.userData;
    if (!piglin.visible || data.respawn > 0 || data.isDown) return;

    const offset = piglin.position.clone().sub(player.position);
    offset.y = 0;
    const distance = offset.length();
    if (distance > 4.85 || distance < 0.25) return;

    const lateral = Math.abs(offset.dot(right));
    const direction = offset.clone().normalize();
    const inFrontArc = direction.dot(forward) > 0.28 && lateral < 3.15;

    if (inFrontArc) {
      hits.push({ piglin, hitDir: direction, distance });
    }
  });

  return hits.sort((a, b) => a.distance - b.distance).slice(0, 2);
}

function takeDownPiglin(piglin, hitDir) {
  const data = piglin.userData;
  data.health = 0;
  data.stun = 0;
  data.isDown = true;
  data.downTimer = 1.1;
  data.respawn = 5.8;
  data.velocity.copy(hitDir).multiplyScalar(10.5);
  data.attackCooldown = 1.2;
  game.piglinsDefeated += 1;

  createHitBurst(piglin.position.clone().add(new THREE.Vector3(0, 1.35, 0)), hitDir);
  setStatus("Diamond sword hit. Piglin down.");
}

function createHitBurst(position, hitDir) {
  const burst = new THREE.Group();
  burst.position.copy(position);

  for (let i = 0; i < 8; i += 1) {
    const shard = new THREE.Mesh(new THREE.TetrahedronGeometry(0.12, 0), materials.impact);
    const spread = new THREE.Vector3(
      THREE.MathUtils.randFloatSpread(1.3),
      THREE.MathUtils.randFloat(0.15, 1),
      THREE.MathUtils.randFloatSpread(1.3),
    ).addScaledVector(hitDir, 1.4);

    shard.userData.velocity = spread.multiplyScalar(THREE.MathUtils.randFloat(2.8, 5.8));
    shard.rotation.set(
      THREE.MathUtils.randFloat(0, Math.PI),
      THREE.MathUtils.randFloat(0, Math.PI),
      THREE.MathUtils.randFloat(0, Math.PI),
    );
    burst.add(shard);
  }

  burst.userData.life = 0.46;
  impactBursts.push(burst);
  scene.add(burst);
}

function updateEffects(delta) {
  for (let i = impactBursts.length - 1; i >= 0; i -= 1) {
    const burst = impactBursts[i];
    burst.userData.life -= delta;

    burst.children.forEach((shard) => {
      shard.position.addScaledVector(shard.userData.velocity, delta);
      shard.userData.velocity.y -= 7.5 * delta;
      shard.rotation.x += delta * 7;
      shard.rotation.y += delta * 9;
    });

    const opacity = Math.max(0, burst.userData.life / 0.46);
    burst.children.forEach((shard) => {
      shard.material.opacity = opacity;
    });

    if (burst.userData.life <= 0) {
      scene.remove(burst);
      impactBursts.splice(i, 1);
    }
  }
}

function damagePlayer(amount, message) {
  if (game.lost || game.won) return;
  game.health = Math.max(0, game.health - amount);
  game.cameraShake = Math.max(game.cameraShake, 0.22);
  setStatus(message);

  if (game.health <= 0) {
    game.lost = true;
    setStatus("Growlithe rider down. Remount to try again.", 30);
  }
}

function setStatus(message, duration = 2.3) {
  ui.status.textContent = message;
  game.statusTimer = duration;
}

function resetGame() {
  game.health = 100;
  game.capture = 0;
  game.piglinsDefeated = 0;
  game.won = false;
  game.lost = false;
  game.escaped = false;
  game.phase = "desert";
  game.attackCooldown = 0;
  game.attackTimer = 0;
  game.cameraShake = 0;
  game.launchTimer = 0;
  game.danceTimer = 0;
  player.position.set(0, groundY(0, 8), 8);
  player.rotation.y = 0;
  player.visible = true;
  player.userData.grounded = true;
  playerVelocity.set(0, 0, 0);
  playerVerticalVelocity = 0;
  shipVelocity.set(0, 0, 0);
  rocketHome.y = groundY(rocketHome.x, rocketHome.z);
  rocket.position.copy(rocketHome);
  rocket.rotation.set(0, 0, 0);
  updateRocketFlame(0);
  mountGosha.userData.base.set(8, 0, -74);
  materials.gosha.emissive.setHex(0x000000);
  materials.goshaGlow.emissive.setHex(0x6a22e4);

  piglins.forEach((piglin) => {
    resetPiglin(piglin);
  });

  setWorldMode("desert");
  setStatus("Find Mount Gosha, rocks to dance on, or the escape rocket.", 3);
  updateHud(0);
}

function resetPiglin(piglin) {
  const spawn = piglin.userData.spawn;
  piglin.position.set(spawn.x, groundY(spawn.x, spawn.z), spawn.z);
  piglin.rotation.set(0, 0, 0);
  piglin.visible = true;
  piglin.userData.health = 1;
  piglin.userData.stun = 0;
  piglin.userData.respawn = 0;
  piglin.userData.downTimer = 0;
  piglin.userData.isDown = false;
  piglin.userData.velocity.set(0, 0, 0);
}

function updateTargetIndicator() {
  if (game.phase === "planet" || game.phase === "launching") {
    ui.goshaIndicator.style.opacity = "0";
    return;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const margin = width < 760 ? 58 : 72;
  const targetObject = game.phase === "space" ? destinationPlanet : mountGosha;
  const label = game.phase === "space" ? "Planet" : "Gosha";
  const target = targetObject.position.clone();
  target.y += game.phase === "space" ? 0 : 3.2;
  target.project(camera);

  let ndcX = target.x;
  let ndcY = target.y;
  const behindCamera = target.z > 1;

  if (behindCamera) {
    ndcX *= -1;
    ndcY *= -1;
  }

  const onScreen =
    !behindCamera && ndcX > -0.82 && ndcX < 0.82 && ndcY > -0.76 && ndcY < 0.76;

  const unclampedX = (ndcX * 0.5 + 0.5) * width;
  const unclampedY = (-ndcY * 0.5 + 0.5) * height;
  const x = onScreen ? unclampedX : THREE.MathUtils.clamp(unclampedX, margin, width - margin);
  const y = onScreen ? unclampedY : THREE.MathUtils.clamp(unclampedY, margin, height - margin);
  const angle = Math.atan2(y - height / 2, x - width / 2) + Math.PI / 2;
  const distance =
    game.phase === "space"
      ? rocket.position.distanceTo(destinationPlanet.position)
      : player.position.distanceTo(mountGosha.position);

  ui.goshaIndicator.style.left = `${x}px`;
  ui.goshaIndicator.style.top = `${y}px`;
  ui.goshaIndicator.style.opacity = "1";
  ui.goshaIndicator.classList.toggle("on-target", onScreen);
  ui.goshaArrow.style.transform = `rotate(${angle}rad)`;
  ui.targetLabel.textContent = label;
  ui.goshaDistance.textContent = `${Math.max(1, Math.round(distance))}m`;
}

function getPlayerForward(target = new THREE.Vector3()) {
  return target.set(-Math.sin(player.rotation.y), 0, -Math.cos(player.rotation.y)).normalize();
}

function getPlayerRight(target = new THREE.Vector3()) {
  return target.set(Math.cos(player.rotation.y), 0, -Math.sin(player.rotation.y)).normalize();
}

function yawForDirection(direction) {
  const flat = direction.clone();
  flat.y = 0;
  if (flat.lengthSq() < 0.0001) return player.rotation.y;
  flat.normalize();
  return Math.atan2(-flat.x, -flat.z);
}

function dampAngle(current, target, lambda, delta) {
  const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + difference * (1 - Math.exp(-lambda * delta));
}

function cylinderBetween(start, end, radius, material) {
  const direction = end.clone().sub(start);
  const length = direction.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 10), material);
  mesh.position.copy(start).addScaledVector(direction, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = true;
  return mesh;
}

function duneHeight(x, z) {
  const longWave = Math.sin(x * 0.035 + z * 0.018) * 1.4;
  const crossWave = Math.cos(z * 0.044 - x * 0.02) * 0.9;
  const ripples = Math.sin((x + z) * 0.16) * 0.14;
  const ridge = Math.max(0, 1 - Math.abs(z + 68) / 42) * Math.sin(x * 0.08) * 1.4;
  return longWave + crossWave + ripples + ridge - 1.2;
}

function groundY(x, z) {
  return duneHeight(x, z);
}

function planetHeight(x, z) {
  const roll = Math.sin(x * 0.055) * 0.65 + Math.cos(z * 0.047) * 0.7;
  const small = Math.sin((x - z) * 0.13) * 0.12;
  return roll + small - 0.7;
}

function getCurrentGroundY(x, z) {
  return game.phase === "planet" ? planetHeight(x, z) : groundY(x, z);
}

function getLandingSurface(x, z) {
  let surface = {
    type: game.phase === "planet" ? "planet" : "ground",
    y: getCurrentGroundY(x, z),
  };

  if (game.phase !== "desert") {
    return surface;
  }

  rocks.forEach((rock) => {
    const distance = Math.hypot(x - rock.position.x, z - rock.position.z);
    if (distance < rock.userData.platformRadius && rock.userData.platformTop > surface.y) {
      surface = { type: "rock", y: rock.userData.platformTop, rock };
    }
  });

  return surface;
}

function flatDistance(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
