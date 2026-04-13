function openMenu() {
  document.getElementById("mobileMenu").classList.add("active");
}

function closeMenu() {
  document.getElementById("mobileMenu").classList.remove("active");
}

window.onclick = function (e) {
  const menu = document.getElementById("mobileMenu");
  if (e.target === menu) closeMenu();
};
