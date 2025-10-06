import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

let model;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;
camera.position.y = 10;
camera.rotation.x = 6;

const container = document.querySelector('.vemAqui');
const { width, height } = container.getBoundingClientRect();

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

const controls = new OrbitControls(camera, renderer.domElement);
renderer.setSize(width, height);
camera.aspect = width / height;
camera.updateProjectionMatrix();

renderer.setAnimationLoop(animate);
container.appendChild(renderer.domElement);

const dirLight2 = new THREE.PointLight(0xffff00, 5);
dirLight2.position.set(5, 4, -5);
scene.add(dirLight2);

const lightHelper2 = new THREE.PointLightHelper(dirLight2);
const gridHelper = new THREE.GridHelper(200, 50)
scene.add(gridHelper, lightHelper2);

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/examples/jsm/libs/draco/');
loader.setDRACOLoader(dracoLoader);

loader.load(
    './threejsfiles/models/Base2.glb',
    function (gltf) {
        model = gltf.scene;
        model.position.set(0, 0, 0);
        model.rotation.y = 1;
        model.scale.set(0.2, 0.2, 0.2);
        scene.add(model);
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.log('ERROOOOO:', error);
    }
);

function animate() {
    if (model) {
        model.rotation.y += 0.01;
        controls.update();
    }
    
    renderer.render(scene, camera);
}
