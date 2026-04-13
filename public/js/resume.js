const fileInput = document.querySelector('input[type="file"]');
const uploadBox = document.querySelector(".upload-box p");

fileInput.addEventListener("change", function () {
  if (this.files.length > 0) {
    uploadBox.textContent = this.files[0].name;
  }
});
