var scene, camera, renderer, controls;

var width, height;


var NUMPARTICLES = 8000;
var pointCloud;
var targetPos;
var modelLoaded = false;
var modelURLBase = "models/";
var modelNames = ["humanlight.obj", "handlight.obj", "earthlight.obj"];
var lastModelID;
var LoadingModels;
var render_started = false;

document.addEventListener('DOMContentLoaded', function() {

});

document.addEventListener('mousemove', function(){

});

function init() {
    scene = new THREE.Scene();

    var ambient = new THREE.AmbientLight(0x101030);
    scene.add(ambient);
    var directionalLight = new THREE.DirectionalLight(0xffeedd);
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);
    // scene.background = new THREE.Color( 0x000000 );

    width = window.innerWidth;
    height = window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    // camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);

    WEBGL_ID = "webglworld";
    webgl_div= document.getElementById(WEBGL_ID);
    var dimensions = webgl_div.getBoundingClientRect();
    HEIGHT = dimensions.height;
    WIDTH = dimensions.width;

    renderer = new THREE.WebGLRenderer({alpha: true});

    renderer.setSize(WIDTH, HEIGHT);
    webgl_div.appendChild(renderer.domElement);


    controls = new THREE.OrbitControls(camera, renderer.domElement);
    //controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = false;


    setupParticles();
    loadModels();
    LoadingModels = setInterval(loadModels, 3000);
    camera.position.z = 200;
    camera.position.y = 0;
    camera.position.x = 100;
}



function setupParticles() {
    var pMaterial = new THREE.PointsMaterial({
        color: 0xBFFE51,
        size: 1.4
    });
    var pGeometry = new THREE.Geometry();
    var targetGeometry = new THREE.Geometry();
    var x, y, z;
    var pCounter = NUMPARTICLES;


    while (pCounter--) {
        var distance = 400;
        var theta = THREE.Math.randFloatSpread(360);
        var phi = THREE.Math.randFloatSpread(360);

        x = distance * Math.sin(theta) * Math.cos(phi);
        y = distance * Math.sin(theta) * Math.sin(phi) + 100;
        z = distance * Math.cos(theta);
        pGeometry.vertices.push(new THREE.Vector3(x, y, z));
        targetGeometry.vertices.push(new THREE.Vector3(x, y, z));

    };


    targetPos = new THREE.Points(targetGeometry);
    pointCloud = new THREE.Points(pGeometry, pMaterial);
    // pointCloud.translateZ(-300);
    pointCloud.translateY(-100);
    scene.add(pointCloud);
}

function animateParticles() {
    var pCounter = targetPos.geometry.vertices.length;
    while (pCounter--) {
        var particle = pointCloud.geometry.vertices[pCounter];
        var target = targetPos.geometry.vertices[pCounter];
        particle.lerp(target, Math.random() / 10);
    }
    pointCloud.geometry.verticesNeedUpdate = true;

}

function loadModels() {
    var manager = new THREE.LoadingManager();
    manager.onProgress = function(item, loaded, total) {
        console.log(item, loaded, total);
    };
    // instantiate a loader
    var loader = new THREE.OBJLoader(manager);

    // make sure we don't get the same model twice
    var nextModelID = Math.floor(Math.random() * modelNames.length);
    while (nextModelID == lastModelID & modelNames.length > 1) {
        nextModelID = Math.floor(Math.random() * modelNames.length);
    }
    var nextModel = modelURLBase + modelNames[nextModelID]
    lastModelID = nextModelID;

    // load a resource
    loader.load(
        // resource URL
        nextModel,
        // Function when resource is loaded
        function(object) {
            var tempGeometry = new THREE.Geometry();
            object.traverse(function(child) {
                if (child.geometry != undefined) {
                    var geometry = new THREE.Geometry().fromBufferGeometry(child.geometry);
                    geometry.computeFaceNormals();
                    geometry.mergeVertices();
                    geometry.computeVertexNormals();
                    tempGeometry.merge(geometry);
                }
            });
            tempGeometry.computeBoundingSphere();
            console.log(tempGeometry.boundingSphere.radius);
            var scaleFactor = 70 / tempGeometry.boundingSphere.radius;
            tempGeometry.scale(scaleFactor, scaleFactor, scaleFactor)

            var pCounter = NUMPARTICLES - tempGeometry.vertices.length;
            while (pCounter--) {

                var distance = (Math.random() * 100) - 230;
                var theta = THREE.Math.randFloatSpread(360);
                var phi = THREE.Math.randFloatSpread(360);

                x = distance * Math.sin(theta) * Math.cos(phi);
                y = distance * Math.sin(theta) * Math.sin(phi) + 100;
                z = distance * Math.cos(theta);

                tempGeometry.vertices.push(new THREE.Vector3(x, y, z));
            }
            targetPos = new THREE.Points(tempGeometry);
        }
    );
}

var explode = function(){
var tempGeometry = new THREE.Geometry();
tempGeometry.computeBoundingSphere();
  var pCounter = NUMPARTICLES ;
  while (pCounter--) {

      var distance = 1000;
      var theta = THREE.Math.randFloatSpread(360);
      var phi = THREE.Math.randFloatSpread(360);

      x = distance * Math.sin(theta) * Math.cos(phi);
      y = distance * Math.sin(theta) * Math.sin(phi) + 100;
      z = distance * Math.cos(theta);
      tempGeometry.vertices.push(new THREE.Vector3(x, y, z));
}

targetPos = new THREE.Points(tempGeometry);
}



function render() {
    render_started=true;
    requestAnimationFrame(render);
    animateParticles();
    // camera.position.z += 1;
    controls.update();
    renderer.render(scene, camera);
}
