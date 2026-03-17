// 3D Earth Background Setup
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    // Standard Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 400; // Closer than before to show more detail

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x020205, 1); // Very dark, almost black background for deep space
    container.appendChild(renderer.domElement);

    // --- Texture Loader with Progress Manager ---
    const manager = new THREE.LoadingManager();
    const progressBar = document.querySelector('.loader-progress');
    const loaderElement = document.getElementById('loader');

    manager.onProgress = function (url, itemsLoaded, itemsTotal) {
        if (progressBar) {
            const progress = (itemsLoaded / itemsTotal) * 100;
            progressBar.style.width = progress + '%';
        }
    };

    manager.onLoad = function () {
        if (loaderElement) {
            setTimeout(() => {
                loaderElement.classList.add('loader-hidden');
            }, 800); // Small delay to let user see 100% and text
        }
    };

    const textureLoader = new THREE.TextureLoader(manager);
    textureLoader.crossOrigin = 'Anonymous';
    
    // High-res realistic earth textures from CDN
    const earthMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
    const earthSpec = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg');
    const earthNormal = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg');
    
    // Cloud layer texture
    const cloudMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png');

    // --- Create Realistic Globe ---
    
    // Base Earth object
    const earthGeometry = new THREE.SphereGeometry(100, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthMap,
        specularMap: earthSpec,
        normalMap: earthNormal,
        specular: new THREE.Color(0x333333),
        shininess: 15
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    
    // Tilt the earth roughly 23.5 degrees
    earth.rotation.z = 23.5 * Math.PI / 180;
    scene.add(earth);

    // Cloud layer
    const cloudGeometry = new THREE.SphereGeometry(101.5, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
        map: cloudMap,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    earth.add(clouds);

    // Subtle atmospheric glow (Fresnel effect approximation)
    const atmosphereGeometry = new THREE.SphereGeometry(105, 64, 64);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x0066ff,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // --- Starfield Background ---
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPosArray = new Float32Array(starCount * 3);

    for(let i = 0; i < starCount * 3; i+=3) {
        // Random spherical distribution far away
        const r = 800 + Math.random() * 400; // Distant stars
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        
        starPosArray[i] = r * Math.sin(phi) * Math.cos(theta);
        starPosArray[i+1] = r * Math.sin(phi) * Math.sin(theta);
        starPosArray[i+2] = r * Math.cos(phi);
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPosArray, 3));
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.0,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // --- Lighting Setup ---
    
    // Ambient light - very low so unlit side is dark
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
    scene.add(ambientLight);

    // Directional light representing the sun
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(500, 100, 200); 
    scene.add(sunLight);
    
    // Soft blue rim light to keep the dark side slightly visible for aesthetic
    const rimLight = new THREE.DirectionalLight(0x0044ff, 0.3);
    rimLight.position.set(-500, 0, -200);
    scene.add(rimLight);

    // --- Mouse Interaction Setup ---
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // --- Animation Loop ---
    function animate() {
        requestAnimationFrame(animate);

        targetX = mouseX * 0.0005;
        targetY = mouseY * 0.0005;

        // Smoothly rotate the earth on its axis
        earth.rotation.y += 0.001;
        
        // Rotate clouds slightly faster to create parallax
        clouds.rotation.y += 0.0005;

        // Very subtle parallax effect on the whole group
        scene.rotation.x += 0.05 * (targetY - scene.rotation.x);
        scene.rotation.y += 0.05 * (targetX - scene.rotation.y);
        
        // Starfield slowly rotates
        starField.rotation.y += 0.0002;

        renderer.render(scene, camera);
    }
    animate();

    // --- Handle Window Resize ---
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
