/**
 *
 * @param {HTMLInputElement} fileInput
 * @param {HTMLInputElement} folderInput
 */
async function handleUpload(fileInput, folderInput) {
  const folder = folderInput.value || "default_folder";

  const formData = new FormData();
  const files = Array.from(fileInput.files);
  files.forEach((file) => {
    formData.append("files", file);
  });
  formData.append("folder", folder);

  const filePreviewContainer = document.getElementById("file-preview");
  filePreviewContainer.innerHTML = "";

  files.forEach((file) => {
    const fileBox = document.createElement("div");
    fileBox.className = "file-box"; // Apply class for styling
    fileBox.innerHTML = `
      <div class="file-info">
        <span class="file-name">${file.name}</span>
        <span class="file-size">${(file.size / 1024).toFixed(2)} KB</span>
      </div>
    `;
    filePreviewContainer.appendChild(fileBox);
  });

  fetch("/file/upload", {
    method: "POST",
    body: formData,
  })
    .then(async (res) => {
      const data = await res.json();
      console.log("data: ", data);
    })
    .catch((err) => console.log(err.message))
    .finally(() => {
      fileInput.value = "";
      folderInput.value = "";
      filePreviewContainer.innerHTML = "";
    });
}

const folderInput = document.getElementById("folderinput");
const uploadBtn = document.getElementById("fileupload");
const fileInput = document.getElementById("fileinput");

window.addEventListener("DOMContentLoaded", () => {
  if (!uploadBtn) return;
  uploadBtn.addEventListener("click", () => {
    handleUpload(fileInput, folderInput);
  });

  fileInput.addEventListener("change", () => {
    const filePreviewContainer = document.getElementById("file-preview");
    filePreviewContainer.innerHTML = "";

    const files = Array.from(fileInput.files);
    files.forEach((file) => {
      const fileBox = document.createElement("div");
      fileBox.className = "file-box"; // Apply class for styling
      fileBox.innerHTML = `
        <div class="file-info">
          <span class="file-name">${file.name}</span>
          <span class="file-size">${(file.size / 1024).toFixed(2)} KB</span>
        </div>
      `;
      filePreviewContainer.appendChild(fileBox);
    });
  });
});
