let currentLesson = 0;

function openLesson(num){
  document.getElementById("landing-page").classList.remove("active");

  document.querySelectorAll(".page").forEach(p=>{
    if(p.id.startsWith("lesson")) p.classList.remove("active");
  });

  const lesson = document.getElementById("lesson"+num);
  lesson.classList.add("active");

  currentLesson = num;

  if(num===1 && !window.lesson1Initialized){
    initLesson1();
    window.lesson1Initialized = true;
  }

  if(num===2 && !window.lesson2Initialized){
    initLesson2();
    window.lesson2Initialized = true;
  }
}

function goHome(){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById("landing-page").classList.add("active");
}
