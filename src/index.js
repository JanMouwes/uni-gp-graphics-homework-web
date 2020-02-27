import * as settings from "./settings.json";
import {
    Scene,
    PerspectiveCamera,
    BoxGeometry,
    ConeGeometry,
    Mesh,
    WebGLRenderer,
    AmbientLight,
    Vector3,
    DirectionalLight,
    DirectionalLightShadow,
    Color,
    MeshNormalMaterial,
    CylinderGeometry,
    SphereGeometry,
    MeshBasicMaterial,
    MeshPhysicalMaterial,
    MeshStandardMaterial,
    MeshPhongMaterial,
    MeshLambertMaterial,
    TextureLoader,
    RepeatWrapping,
    PointLight,
} from "three";
import * as THREE from "three";
import CameraControls from "./controls";
import createSkybox from "./skybox";
import SodaCan from "./objects/soda-can";
import House from "./objects/house";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import EntityBase from "./objects/entity-base";
import StreetLamp from "./objects/street-lamp";

// Create scene
const scene = new Scene();

const cameraSettings = settings.camera;
if (cameraSettings["aspect-ratio-use-window"] === true) {
    cameraSettings["aspect-ratio"] = window.innerWidth / window.innerHeight;
}

// Create camera, load from settings
const camera = new PerspectiveCamera(
    cameraSettings["field-of-view"], // fov — Camera frustum vertical field of view.
    cameraSettings["aspect-ratio"], // aspect — Camera frustum aspect ratio.
    cameraSettings["plane-near"], // near — Camera frustum near plane.
    cameraSettings["plane-far"]  // far — Camera frustum far plane.
);

// Create renderer
const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

// Create an ambient light
const ambient = new AmbientLight(0x9ce5ff, 0.4);
scene.add(ambient);

// Adding an hemispherelight to light everything up
const light = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
scene.add(light);

// Adding an directionallight which acts as an sun
const directlight = new THREE.DirectionalLight(0x99ccff, 0.1);
directlight.position.set( -60, 120, -60);
directlight.castShadow = true;
scene.add(directlight);

// Initializing skybox
const skybox = createSkybox(settings.skybox);
scene.add(skybox);

var geometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
var texture = new TextureLoader().load('./src/resources/textures/Grass.jpg');
texture.repeat.set(1000, 1000);
texture.wrapS = RepeatWrapping;
texture.wrapT = RepeatWrapping;
var material = new THREE.MeshStandardMaterial({map: texture, wireframe: false});
var floor = new THREE.Mesh(geometry, material);
floor.material.side = THREE.DoubleSide;
floor.rotation.x = Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

var geometry = new THREE.PlaneGeometry(1000, 5, 10, 10);
var texture = new TextureLoader().load('./src/resources/textures/asphalt.jpg');
texture.repeat.set(1000, 5);
texture.wrapS = RepeatWrapping;
texture.wrapT = RepeatWrapping;
var material = new THREE.MeshStandardMaterial({map: texture, wireframe: false});
var road = new THREE.Mesh(geometry, material);
road.position.set(0,0.1,-10);
road.material.side = THREE.DoubleSide;
road.rotation.x = Math.PI / 2;
road.receiveShadow = true;
scene.add(road);

camera.position.x = cameraSettings["start-position"].x;
camera.position.y = cameraSettings["start-position"].y;
camera.position.z = cameraSettings["start-position"].z;

// Instantiate a loader
const loader = new GLTFLoader();

const canscale = 0.01;
const car0scale = 0.05;
const car1scale = 0.005;
const car2scale = 0.0045;
const car3scale = 0.006;

var i;
for (i = 0; i < 4; i++) {
    var huis = new House(1);
    huis.init(scene, new Vector3(8 * i, 0, -20));
}

const streetLamp = new StreetLamp();
streetLamp.init(loader, scene, new Vector3(4, 0, -15));
const streetLamp2 = new StreetLamp();
streetLamp2.init(loader, scene, new Vector3(20, 0, -15));

const can = new SodaCan(canscale);
can.init(loader, scene, new Vector3(8, 0.1, -17));

const car1 = new EntityBase("car1.gltf", car1scale, 0);
car1.init(loader, scene, new Vector3(-5, 0.1, -20));

const car3 = new EntityBase("car3.gltf", car3scale, 1.75);
car3.init(loader, scene, new Vector3(14, 0.76, -16.5));

/*  Old cars, don't use them anymore
const car0 = new EntityBase("car0.gltf", car0scale, 4);
car0.init(loader, scene, new Vector3(10, 3, 0));

const car2 = new EntityBase("car2.gltf", car2scale, 1.55);
car2.init(loader, scene, new Vector3(30, 1.55, 0));
*/

window.addEventListener("keydown", (e) => {
    const obj = streetLamp;

    if (e.key === "ArrowDown") {
        obj.pos.y -= .05;
        obj.object3d.position.y -= .05;
        console.log(obj.pos.y);
    } else if (e.key === "ArrowUp") {
        obj.pos.y += .05;
        obj.object3d.position.y += .05;
        console.log(obj.pos.y);
    } else if (e.key === "ArrowRight") {
        obj.pos.x += .05;
        obj.object3d.position.x += .05;
        console.log(obj.pos.x);
    } else if (e.key === "ArrowLeft") {
        obj.pos.x -= .05;
        obj.object3d.position.x -= .05;
        console.log(obj.pos.x);
    }
});

renderer.render(scene, camera);

const movement = new CameraControls(window);
movement.init(camera);

/**
 * @type {SodaCan[]}
 */
const gameObjects = [];

const GRAVITY = new Vector3(0, -9.81, 0);

const shootCan = () => {
    const newCan = new SodaCan(.01);

    camera.getWorldDirection(newCan.velocity);
    newCan.velocity = newCan.velocity.normalize().multiplyScalar(4).add(GRAVITY);

    console.log(newCan.velocity);

    newCan.init(loader, scene, camera.position.clone());
    gameObjects.push(newCan);
};

const update = (deltaTime) => {
    movement.update(deltaTime);

    gameObjects.forEach(obj => obj.update(deltaTime));

    renderer.render(scene, camera);
};

let lastRender = 0;

window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    shootCan();
});

const loop = (timestamp) => {
    const progress = timestamp - lastRender;

    update(progress);

    lastRender = timestamp;
    window.requestAnimationFrame(loop)
};

window.requestAnimationFrame(loop);

document.body.appendChild(renderer.domElement);