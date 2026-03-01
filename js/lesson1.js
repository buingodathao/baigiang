function initLesson1(){

  const canvas = document.getElementById("areaCanvas");
  const ctx = canvas.getContext("2d");
  const slider = document.getElementById("sliceSlider");
  const label = document.getElementById("sliceValue");

  canvas.width = 900;
  canvas.height = 500;

  function f(x){
    return Math.sin(x) + 2;
  }

  function draw(n){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    const a = 0;
    const b = Math.PI * 2;
    const dx = (b-a)/n;

    // vẽ trục
    ctx.strokeStyle="#000";
    ctx.beginPath();
    ctx.moveTo(40,400);
    ctx.lineTo(860,400);
    ctx.stroke();

    // vẽ hình chữ nhật Riemann
    for(let i=0;i<n;i++){
      const x = a + i*dx;
      const h = f(x);

      const px = 40 + i*(820/n);
      const ph = h*80;

      ctx.fillStyle="rgba(30,136,229,0.5)";
      ctx.fillRect(px,400-ph,820/n-2,ph);
    }

    // vẽ đồ thị
    ctx.strokeStyle="#e53935";
    ctx.beginPath();
    for(let i=0;i<=300;i++){
      const x = a + (b-a)*i/300;
      const y = f(x);

      const px = 40 + (x-a)/(b-a)*820;
      const py = 400 - y*80;

      if(i===0) ctx.moveTo(px,py);
      else ctx.lineTo(px,py);
    }
    ctx.stroke();
  }

  // realtime slider
  label.textContent = slider.value;
  draw(parseInt(slider.value));

  slider.addEventListener("input",()=>{
    const n = parseInt(slider.value);
    label.textContent = n;
    draw(n);
  });
}
