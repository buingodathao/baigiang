function initLesson2(){
  const canvas = document.getElementById("riemannCanvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 800;
  canvas.height = 500;

  function f(x){ return Math.sin(x)+2; }

  function draw(){
    ctx.clearRect(0,0,800,500);

    const n = 12;
    const a = 0;
    const b = Math.PI*2;
    const dx = (b-a)/n;

    for(let i=0;i<n;i++){
      const x = a + i*dx;
      const h = f(x);

      const px = i*(800/n);
      const ph = h*80;

      ctx.fillStyle="rgba(52,152,219,0.5)";
      ctx.fillRect(px,400-ph,800/n-2,ph);
    }
  }

  draw();
}
