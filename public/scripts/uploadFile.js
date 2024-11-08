const folderInput = document.getElementById("folderinput");
const uploadBtn = document.getElementById("fileupload");
const fileInput = document.getElementById("fileinput");
const errorContainer = document.createElement("div");
const successContainer = document.createElement("div");
const filePreview = document.getElementById("file-preview");

errorContainer.id = "error-container";
successContainer.id = "success-container";
document.body.prepend(errorContainer);
document.body.prepend(successContainer);

window.addEventListener("DOMContentLoaded", () => {
  dragAndDrop();
  if (!uploadBtn) return;
  uploadBtn.addEventListener("click", () => {
    handleUpload(fileInput, folderInput);
  });

  fileInput.addEventListener("change", () => {
    const filePreviewContainer = document.getElementById("file-preview");
    filePreviewContainer.innerHTML = "";
    clearMessages();

    const files = Array.from(fileInput.files);
    files.forEach((file) => {
      const fileBox = document.createElement("div");
      fileBox.className = "file-box";
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

/**
 *
 * @param {HTMLInputElement} fileInput
 * @param {HTMLInputElement} folderInput
 */
async function handleUpload(fileInput, folderInput) {
  const folder = folderInput.value || "default_folder";

  const formData = new FormData();
  const files = Array.from(fileInput.files);

  if (files.length === 0) {
    displayError("Please select at least one file");
    return;
  }

  files.forEach((file) => {
    formData.append("files", file);
  });
  formData.append("folder", folder);

  const filePreviewContainer = document.getElementById("file-preview");
  filePreviewContainer.innerHTML = "";
  clearMessages();

  files.forEach((file) => {
    const fileBox = document.createElement("div");
    fileBox.className = "file-box";
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
      if (res.ok) {
        displaySuccess("Files uploaded successfully");
        console.log("data: ", data);
      } else {
        displayError(data.error || "An error occurred during upload");
      }
    })
    .catch((err) => displayError("Upload failed: " + err.message))
    .finally(() => {
      fileInput.value = "";
      folderInput.value = "";
      filePreviewContainer.innerHTML = "";
    });
}

function displayError(message) {
  errorContainer.innerText = message;
  errorContainer.style.display = "block";
}

function displaySuccess(message) {
  successContainer.innerText = message;
  successContainer.style.display = "block";
}

function clearMessages() {
  errorContainer.style.display = "none";
  errorContainer.innerText = "";
  successContainer.style.display = "none";
  successContainer.innerText = "";
}

function dragAndDrop() {
  const dragBox = document.getElementById("drag-box");
  const fileInput = document.getElementById("fileinput");

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dragBox.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ["dragenter", "dragover"].forEach((eventName) => {
    dragBox.addEventListener(
      eventName,
      () => dragBox.classList.add("highlight"),
      false
    );
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dragBox.addEventListener(
      eventName,
      () => dragBox.classList.remove("highlight"),
      false
    );
  });

  dragBox.addEventListener("drop", (e) => {
    const files = e.dataTransfer.files;
    fileInput.files = files;
    displayFiles(files);
  });

  function displayFiles(files) {
    filePreview.innerHTML = "";
    Array.from(files).forEach((file) => {
      const fileElement = document.createElement("div");
      fileElement.textContent = `File: ${file.name} (${Math.round(
        file.size / 1024
      )} KB)`;
      filePreview.appendChild(fileElement);
    });
  }
}
