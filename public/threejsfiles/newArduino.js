import * as THREE from 'three'

let scene, camera, renderer;
let monitorGroup, faceGroup;

let eyes = { 
    left: null,
    right: null, 
    leftPupil: null, 
    rightPupil: null, 
    mouth: null 
};

let mouse = { 
    x: 0,   
    y: 0 
};

let animationState = {
    nextBlink: 3000,
    nextExpression: 10000,
    currentExpression: 'happy',
    blinking: false
};

function init() {
    const container = document.getElementById('container');

    scene = new THREE.Scene();
    scene.background = null;
    
    camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(5, 5, 5);
    pointLight.castShadow = true;
    scene.add(pointLight);

    const fillLight = new THREE.PointLight(0x4a90e2, 0.3);
    fillLight.position.set(-5, 0, 3);
    scene.add(fillLight);

    createMonitor();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);

    animate();
}

function createMonitor() {
    monitorGroup = new THREE.Group();
    monitorGroup.scale.set(1.5, 1.5, 1.5)

    const bodyGeometry = new THREE.BoxGeometry(2.5, 2, 1.5);

    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xe8dcc0,
        shininess: 30
    });

    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    monitorGroup.add(body);

    const screenGeometry = new THREE.BoxGeometry(2.2, 1.6, 0.1);

    const screenMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x1a3a3a,
        emissive: 0x0a4a4a,
        emissiveIntensity: 0.3,
        shininess: 100
    });

    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.z = 0.76;
    monitorGroup.add(screen);

    const glowGeometry = new THREE.PlaneGeometry(2.3, 1.7);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffaa,
        transparent: true,
        opacity: 0.1
    });

    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.z = 0.82;
    monitorGroup.add(glow);

    faceGroup = new THREE.Group();
    faceGroup.position.z = 0.85;
    monitorGroup.add(faceGroup);

    const eyeGeometry = new THREE.CircleGeometry(0.15, 32);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
    
    eyes.left = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eyes.left.position.set(-0.4, 0.3, 0);
    faceGroup.add(eyes.left);

    eyes.right = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eyes.right.position.set(0.4, 0.3, 0);
    faceGroup.add(eyes.right);

    const pupilGeometry = new THREE.CircleGeometry(0.08, 32);
    const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x003322 });
    
    eyes.leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    eyes.leftPupil.position.z = 0.01;
    eyes.left.add(eyes.leftPupil);

    eyes.rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    eyes.rightPupil.position.z = 0.01;
    eyes.right.add(eyes.rightPupil);

    createMouth('happy');
    
    scene.add(monitorGroup);
}

function createMouth(expression) {
    if (eyes.mouth) {
        faceGroup.remove(eyes.mouth);
    }

    let curve;
    switch(expression) {
        case 'happy':
            curve = new THREE.QuadraticBezierCurve(
                new THREE.Vector2(-0.3, -0.2),
                new THREE.Vector2(0, -0.4),
                new THREE.Vector2(0.3, -0.2)
            );
            break;
        case 'surprised':
            curve = new THREE.EllipseCurve(
                0, -0.3,
                0.2, 0.25,
                0, 2 * Math.PI,
                false,
                0
            );
            break;
        case 'thinking':
            curve = new THREE.LineCurve(
                new THREE.Vector2(-0.3, -0.3),
                new THREE.Vector2(0.3, -0.3)
            );
            break;
        case 'excited':
            curve = new THREE.QuadraticBezierCurve(
                new THREE.Vector2(-0.4, -0.1),
                new THREE.Vector2(0, -0.5),
                new THREE.Vector2(0.4, -0.1)
            );
            break;
    }
    
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
        color: 0x00ff88,
        linewidth: 3
    });
    eyes.mouth = new THREE.Line(geometry, material);
    faceGroup.add(eyes.mouth);
    
    animationState.currentExpression = expression;
}

function blink() {
    if (animationState.blinking) return;
    animationState.blinking = true;
    
    const originalScaleY = eyes.left.scale.y;
    const closeSpeed = 0.3;
    
    const closeInterval = setInterval(() => {
        if (eyes.left.scale.y > 0.1) {
            eyes.left.scale.y -= closeSpeed;
            eyes.right.scale.y -= closeSpeed;
        } else {
            clearInterval(closeInterval);
            
            setTimeout(() => {
                const openInterval = setInterval(() => {
                    if (eyes.left.scale.y < originalScaleY) {
                        eyes.left.scale.y += closeSpeed;
                        eyes.right.scale.y += closeSpeed;
                    } else {
                        eyes.left.scale.y = originalScaleY;
                        eyes.right.scale.y = originalScaleY;
                        clearInterval(openInterval);
                        animationState.blinking = false;
                    }
                }, 16);
            }, 100);
        }
    }, 16);
}

function onMouseMove(event) {
    const container = document.getElementById('container');
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
}

function onWindowResize() {
    const container = document.getElementById('container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

let lastTime = Date.now();  

function animate() {
    requestAnimationFrame(animate);
    
    const currentTime = Date.now();

    monitorGroup.position.y = Math.sin(currentTime * 0.001) * 0.1;
    monitorGroup.rotation.z = Math.sin(currentTime * 0.0015) * 0.05;

    const targetRotationY = mouse.x * 0.3;
    const targetRotationX = mouse.y * 0.2;
    
    monitorGroup.rotation.y += (targetRotationY - monitorGroup.rotation.y) * 0.05;
    monitorGroup.rotation.x += (targetRotationX - monitorGroup.rotation.x) * 0.05;

    const pupilMoveX = mouse.x * 0.03;
    const pupilMoveY = mouse.y * 0.03;
    
    eyes.leftPupil.position.x += (pupilMoveX - eyes.leftPupil.position.x) * 0.1;
    eyes.leftPupil.position.y += (pupilMoveY - eyes.leftPupil.position.y) * 0.1;
    eyes.rightPupil.position.x += (pupilMoveX - eyes.rightPupil.position.x) * 0.1;
    eyes.rightPupil.position.y += (pupilMoveY - eyes.rightPupil.position.y) * 0.1;

    if (currentTime > animationState.nextBlink) {
        blink();
        animationState.nextBlink = currentTime + 2000 + Math.random() * 3000;
    }
    
    if (currentTime > animationState.nextExpression) {
        const expressions = ['happy', 'surprised', 'thinking', 'excited'];
        const currentIndex = expressions.indexOf(animationState.currentExpression);
        const nextExpression = expressions[(currentIndex + 1) % expressions.length];
        createMouth(nextExpression);
        animationState.nextExpression = currentTime + 10000;
    }
    
    lastTime = currentTime;
    renderer.render(scene, camera);
}

init()