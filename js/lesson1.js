function initLesson1(){

  const container = document.getElementById("three-container");
  const slider = document.getElementById("sliceSlider");
  const label = document.getElementById("sliceValue");

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

  // ===== ánh sáng =====
  const light = new THREE.DirectionalLight(0xffffff,1);
  light.position.set(5,10,7);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x404040));

  // ===== mesh lát cắt =====
  let sliceGroup = new THREE.Group();
  scene.add(sliceGroup);

  function f(x){
    return Math.sin(x)/2 + 1.2;
  }

  function buildSlices(n){

    // xóa lát cũ
    scene.remove(sliceGroup);
    sliceGroup = new THREE.Group();

    const a = -3;
    const b = 3;
    const dx = (b-a)/n;

    for(let i=0;i<n;i++){

      const x = a + i*dx;
      const h = f(x);

      const geometry = new THREE.BoxGeometry(dx*0.9, h, dx*0.9);
      const material = new THREE.MeshPhongMaterial({
        color:0x1e88e5,
        transparent:true,
        opacity:0.8
      });

      const box = new THREE.Mesh(geometry,material);
      box.position.set(x, h/2, 0);

      sliceGroup.add(box);
    }

    scene.add(sliceGroup);
  }

  // ===== camera =====
  camera.position.set(6,6,6);
  camera.lookAt(0,0,0);

  // ===== slider realtime =====
  label.textContent = slider.value;
  buildSlices(parseInt(slider.value));

  slider.addEventListener("input",()=>{
    const n = parseInt(slider.value);
    label.textContent = n;
    buildSlices(n);
  });

  // ===== animate =====
  function animate(){
    requestAnimationFrame(animate);
    sliceGroup.rotation.y += 0.003;
    renderer.render(scene,camera);
  }
  animate();
}
