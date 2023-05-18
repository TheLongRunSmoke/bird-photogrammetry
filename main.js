/**
    Минимальный пример отображения текстурированных моделей с использованием three.js.
*/

import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

loadModelToView('robin', document.getElementById('container_1'));

function computeViewportSize(container){
    var ratio = window.innerHeight / window.innerWidth;
    var width = container.clientWidth;
    var height = width * ratio;
    return [ratio, width, height];
}

function loadModelToView(model, container){
    let camera, scene, renderer, controls, width, height, ratio, loading;
    loading = container.getElementsByClassName('loading')[0];
    // Find container size.
    let viewport = computeViewportSize(container);
    ratio = viewport[0];
    width = viewport[1];
    height = viewport[2];
    // Prepare renderer.
    renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(width, height);
	container.appendChild(renderer.domElement);
	// Setup scene using room environment.
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xbfe3dd );
	scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;
	// Prepare camera.
	camera = new THREE.PerspectiveCamera(40, width / height, 1, 100);
    camera.position.set(0,0,0);
    scene.add(camera);
    // Setup controls to orbiting camera around object.
	controls = new OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 0, 0);
	controls.update();
	controls.enablePan = false;
	controls.enableDamping = true;
    // Model not contain any lights, add some in to the scene.
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
	scene.add(ambientLight);
	const pointLight = new THREE.PointLight(0xffffff, 0.8);
	camera.add(pointLight);
	renderer.render(scene, camera);

	window.addEventListener( 'resize', function (){
	        let viewport = computeViewportSize(container);
            ratio = viewport[0];
            width = viewport[1];
            height = viewport[2];
            camera.aspect = width / height;
	        camera.updateProjectionMatrix();
	        renderer.setSize(width, height);
        }
    );

    const onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            const percentComplete = xhr.loaded / xhr.total * 100;
            loading.innerText = 'Загрузка модели ' + Math.round(percentComplete, 2 ) + '%';
        }
    };

    const animate = function () {
         requestAnimationFrame(animate);
         controls.update();
         renderer.render(scene, camera);
    };

    // Load WaveformOBJ and it's materials.
    new MTLLoader()
        .setPath( '' )
        .load( model + '.mtl', function ( materials ) {
            materials.preload();
            new OBJLoader()
                .setMaterials( materials )
                .setPath( '' )
                .load( model + '.obj', function ( object ) {
                    scene.add( object );
                    object.children[0].geometry.computeBoundingSphere();
                    let target = object.children[0].geometry.boundingSphere.center;
                    controls.target = target;
                    loading.style.display = 'none';
                    animate();
                }, onProgress );

        } );
}
