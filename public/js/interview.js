let totalTime = 300; // 5 minutes
let timeLeft = totalTime;

const timerBox = document.getElementById("timerBox");
const progressBar = document.getElementById("progressBar");

const countdown = setInterval(() => {
  timeLeft--;

  //  TIMER FORMAT
  let min = Math.floor(timeLeft / 60);
  let sec = timeLeft % 60;

  timerBox.textContent =
    String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");

  //  PROGRESS BAR
  let progressPercent = (timeLeft / totalTime) * 100;
  progressBar.style.width = progressPercent + "%";

  //  COLOR CHANGE
  if (timeLeft <= totalTime * 0.3) {
    progressBar.style.background = "linear-gradient(90deg, #f59e0b, #ef4444)";
  }

  if (timeLeft <= totalTime * 0.1) {
    progressBar.style.background = "linear-gradient(90deg, #ef4444, #dc2626)";
  }

  // TIME UP
  if (timeLeft <= 0) {
    clearInterval(countdown);
    progressBar.style.width = "0%";

    alert("⏱ Time's up! Submitting...");
    document.querySelector("form").submit();
  }
}, 1000);

// CHAR COUNT
const charCount = document.getElementById("count");
const input = document.getElementById("answer-input");
input.addEventListener("input", function () {
  charCount.textContent = input.value.length;
});
