import * as THREE from 'three';
import fragmentShader from './shaders/fragment.glsl';

// extract "variation" parameter from the url
const urlParams = new URLSearchParams(window.location.search);
const variation = urlParams.get('var') || 0;

// add selected class to link based on variation parameter
document.querySelector(`[data-var="${variation}"]`).classList.add('selected');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Add black background
    console.log('Scene created');
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    console.log('Renderer created');
    
    // Get container dimensions
    const container = document.getElementById('three-container');
    console.log('Container found:', container);
    const width = container.clientWidth;
    const height = container.clientHeight;
    console.log('Container dimensions:', width, height);
    
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    console.log('Renderer added to container');

    // Create a sphere
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xff0000,
        wireframe: true 
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    console.log('Sphere added to scene');

    // Position camera
    camera.position.z = 5;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotate the sphere
        sphere.rotation.x += 0.01;
        sphere.rotation.y += 0.01;
        
        renderer.render(scene, camera);
    }

    // Handle window resize
    function onWindowResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    window.addEventListener('resize', onWindowResize);

    // Start animation
    animate();
    console.log('Animation started');
});