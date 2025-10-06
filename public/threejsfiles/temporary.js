import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

let model;

// const texture1 = new THREE.TextureLoader().load('./threejsfiles/textures/woodTexture.jpg');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(0, 2.5, 2);
camera.rotation.set(0, 0, 0);

const container = document.querySelector('.threeJs3D');
// const container = document.body;
const { width, height } = container.getBoundingClientRect();

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

// const controls = new OrbitControls(camera, renderer.domElement);
renderer.setSize(width, height);
camera.aspect = width / height;
camera.updateProjectionMatrix();

renderer.setAnimationLoop(animate);
container.appendChild(renderer.domElement);

const dirLight2 = new THREE.SpotLight(0x555555, 3);
dirLight2.position.set(5, 4, -5);
scene.add(dirLight2);
dirLight2.position.set(10, 20, 10);
dirLight2.castShadow = true

const lightHelper2 = new THREE.SpotLightHelper(dirLight2);
const gridHelper = new THREE.GridHelper(100, 50)
// scene.add(gridHelper, lightHelper2);

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/examples/jsm/libs/draco/');
loader.setDRACOLoader(dracoLoader);

loader.load(
    './threejsfiles/models/Base2.glb',
    function (gltf) {
        model = gltf.scene;
        model.position.set(0, -3, 0);
        model.rotation.y = 1;
        model.scale.set(1, 1, 1);

        model.traverse((child) => {
            if (child.isMesh) {
                // child.material.map = texture1;
                child.material = new THREE.MeshStandardMaterial({
                    color: 0xaaaaaa,
                    metalness: 1,
                    roughness: 0.7
                });
                child.material.needsUpdate = true;
            }
        });

        scene.add(model);
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.log('ERROOOOO:', error);
    }
);

async function animate() {
    if (model) {
        // model.rotation.y += 0.01;
        // controls.update();
        if (model.position.y < 0) {
            model.position.y += 0.03;
        }
    }

    
    renderer.render(scene, camera);
}
