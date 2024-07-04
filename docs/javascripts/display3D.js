import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.149.0/three.module.js';
import { OBJLoader } from '/javascripts/OBJLoader.js';
import { OrbitControls } from "https://unpkg.com/three@0.112/examples/jsm/controls/OrbitControls.js";
// import * as THREE from '/javascripts/node_modules/three/build/three.module.js';
// import { STLLoader } from '/javascripts/STLLoader.js';

export function display3D(file_path, container_ID) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  const renderer = new THREE.WebGLRenderer();
  const graphic_container = document.querySelector('#' + container_ID);
  if (graphic_container.offsetWidth > 350) {
    renderer.setSize( 350, 350 ); // window.innerWidth, window.innerHeight
  } else {
    renderer.setSize( graphic_container.offsetWidth, graphic_container.offsetWidth );
  }
  
  graphic_container.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry( 1, 1, 1 );
  const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

  camera.position.z = 4;

  var controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.campingFactor = 0.25;
  controls.enableZoom = true;

  var keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
  keyLight.position.set(-100, 0, 100);

  var fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
  fillLight.position.set(100, 0, 100);

  var backLight = new THREE.DirectionalLight(0xffffff, 1.0);
  backLight.position.set(100, 0, -100).normalize();

  scene.add(keyLight);
  scene.add(fillLight);
  scene.add(backLight);

  var objLoader = new OBJLoader();
  // objLoader.setPath('./models/');
  objLoader.load(file_path, function(object) {
    // object.position.y -= 60;
    scene.add(object);
  }, undefined, function(error) {
    console.error(error);
  });

  const animate = function () {
    requestAnimationFrame( animate );

    controls.update();
    
    renderer.render(scene, camera);
  };

  animate();  
}
