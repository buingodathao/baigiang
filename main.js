// load landing khi mở trang
window.addEventListener("DOMContentLoaded", () => {
  loadLanding();
});

function loadLanding() {
  document.getElementById("lesson-container").innerHTML = "";

  document.getElementById("landing-page").innerHTML = `
    <div class="hero-title">📐 Toán Học Trực Quan</div>
    <div class="hero-sub">Chọn bài học để bắt đầu</div>

    <div class="lesson-cards">
      <div class="lesson-card" onclick="openLesson(1)">
        <div class="card-title">Bài 1: Thể tích tròn xoay</div>
      </div>

      <div class="lesson-card" onclick="openLesson(2)">
        <div class="card-title">Bài 2: Tổng Riemann</div>
      </div>
    </div>
  `;
}

async function openLesson(id) {
  document.getElementById("landing-page").innerHTML = "";

  // load html bài học
  const res = await fetch(`lessons/lesson${id}.html`);
  const html = await res.text();
  document.getElementById("lesson-container").innerHTML = html;

  // load js bài học
  const script = document.createElement("script");
  script.src = `js/lesson${id}.js`;
  document.body.appendChild(script);

  document.querySelector(".back-btn").style.display = "block";
}

function goHome() {
  location.reload();
}
