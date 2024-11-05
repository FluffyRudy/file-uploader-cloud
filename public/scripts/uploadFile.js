/**
 *
 * @param {HTMLInputElement} fileInput
 * @param {HTMLInputElement} folderInput
 */
async function handleUpload(fileInput, folderInput) {
  const folder = folderInput.value || "default_folder";

  const formData = new FormData();
  Array.from(fileInput.files).map((file) => {
    formData.append("files", file);
  });
  formData.append("folder", folder);
  fetch("/file/upload", {
    method: "POST",
    body: formData,
  })
    .then(async (res) => console.log("data: ", await res.json()))
    .catch((err) => console.log(err.message))
    .finally(() => {
      fileInput.value = "";
      folderInput.value = "";
    });
}

const folderInput = document.getElementById("folderinput");
const uploadBtn = document.getElementById("fileupload");
const fileInput = document.getElementById("fileinput");

window.addEventListener("DOMContentLoaded", () => {
  if (!uploadBtn) alert("No button found");
  uploadBtn.addEventListener("click", () => {
    handleUpload(fileInput, folderInput);
  });
});
