'use strict'

import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.149.0/three.module.js';

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("#test-graphic-container");
  container
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, container.offsetWidth / window.innerHeight, 0.1, 1000 );

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( container.offsetWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  // const geometry = new THREE.BoxGeometry( 1, 1, 1 );
  // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  // const cube = new THREE.Mesh( geometry, material );
  // scene.add( cube );

  camera.position.z = 12;
  camera.position.y = -2;
  
  const geometry2 = new THREE.ConeGeometry( 5, 14, 20 );
  const material1 = new THREE.MeshLambertMaterial( {color: 0xffff00} );
  const material2 = new THREE.MeshBasicMaterial( {color: 0xffffee} );
  const materials = [material1, material2];
  const cone = new THREE.Mesh( geometry2, materials );
  
  scene.add( cone );

  const light = new THREE.PointLight( 0xff0000, 1, 100 );
  light.position.set( -5, 5, 10 );
  scene.add( light );

  scene.background = new THREE.Color(0x262626)
  cone.rotation.x -= 0.1;
  function animate() {
    // cone.rotation.x += 0.01;
    cone.rotation.y += 0.01;
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
  }
  animate();

  const volumes = [
    100,
    83.15098468271334,
    48.14004376367615,
    32.822757111597376,
    11.838074398249452,
    10.284463894967178,
    6.892778993435448,
    5.032822757111598,
    1.400437636761488,
    0.04157549234135668,
    0.000437636761487965,
    0.0000033479212253829326,
  ];

  const info = document.querySelector('#info');
  info.style.top = String(container.offsetHeight - info.offsetHeight) + 'px';

  
});
