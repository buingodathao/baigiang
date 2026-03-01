function initLesson1(){

  const container = document.getElementById("three-container");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45,
      container.clientWidth/container.clientHeight,
      0.1,1000);

  const renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff,1);
  light.position.set(5,10,7);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x404040));

  const geometry = new THREE.ParametricGeometry(function(u,v,target){
      const x = (u-0.5)*6;
      const y = (v-0.5)*6;
      const z = Math.sin(x)*Math.cos(y)/2;
      target.set(x,y,z);
  },50,50);

  const material = new THREE.MeshPhongMaterial({
    color:0x1565c0,
    side:THREE.DoubleSide,
    shininess:60
  });

  const mesh = new THREE.Mesh(geometry,material);
  scene.add(mesh);

  camera.position.set(6,6,6);
  camera.lookAt(0,0,0);

  function animate(){
    requestAnimationFrame(animate);
    mesh.rotation.y += 0.003;
    renderer.render(scene,camera);
  }
  animate();
}
