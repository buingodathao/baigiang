function initLesson2(){

  const container = document.getElementById("three-container");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth/container.clientHeight,
      0.1,
      1000
  );

  const renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff,1);
  light.position.set(5,10,7);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x404040));

  function f(x){
    return Math.sin(x)/2 + 1.2;
  }

  const group = new THREE.Group();
  scene.add(group);

  const n = 30;
  const a = 0;
  const b = Math.PI*2;
  const dx = (b-a)/n;

  for(let i=0;i<n;i++){

    const x = a + i*dx;
    const r = f(x);

    const geometry = new THREE.CylinderGeometry(r,r,dx,24,true);
    const material = new THREE.MeshPhongMaterial({
      color:0x43a047,
      transparent:true,
      opacity:0.85
    });

    const cyl = new THREE.Mesh(geometry,material);
    cyl.rotation.z = Math.PI/2;
    cyl.position.x = (x-a)-3;

    group.add(cyl);
  }

  camera.position.set(6,6,6);
  camera.lookAt(0,0,0);

  function animate(){
    requestAnimationFrame(animate);
    group.rotation.y += 0.003;
    renderer.render(scene,camera);
  }
  animate();
}
