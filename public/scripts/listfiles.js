/**
 *
 * @param {string} filename
 */
async function downloadFile(filename) {
  const downloadResponse = await fetch("/file/download", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filename }),
  });
  const blob = await downloadResponse.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.split("/").pop();

  document.body.appendChild(a);
  a.click();

  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 *
 * @param {string} prevFolder
 * @param {string} folder
 */
async function getFolderData(prevFolder = "", folder) {
  const container = document.getElementById("container");
  const prevFolderBtn = document.getElementById("prevFolderBtn");

  if (typeof folder !== "string") throw TypeError("Expected string parameter");

  const folderData = await fetch(`/file/folder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ currentFolder: folder }),
  });

  if (folderData.ok) {
    while (container.firstChild) {
      container.firstChild.remove();
    }
    const { fileObjects } = await folderData.json();
    const { files, folders } = fileObjects;

    container.appendChild(listFiles(files));
    container.appendChild(listFolder(folders));
    document.body.appendChild(container);

    if (folder) {
      const lastIndex = folder.slice(0, -1).lastIndexOf("/");
      const prevFolderText =
        lastIndex >= 0 ? folder.slice(0, lastIndex + 1) : "";

      prevFolderBtn.style.display = "block";
      prevFolderBtn.onclick = async () => {
        await getFolderData(prevFolderText, prevFolderText);
      };
    } else {
      prevFolderBtn.style.display = "none";
    }

    const folderList = container.querySelectorAll(".folders");
    Array.from(folderList).forEach((folderElem, i) => {
      const nextFolder = `${folder}${folders[i]}/`;
      folderElem.onclick = async () => await getFolderData(folder, nextFolder);
    });

    const fileList = container.querySelectorAll(".file-item");
    fileList.forEach((file, i) => {
      file.onclick = async () => {
        await downloadFile(folder + files[i].name);
      };
    });
  } else {
    console.log(await folderData.json());
  }
}

/**
 * @param {Array<FileObject>} files
 * @returns {HTMLElement}
 */
function listFiles(files) {
  if (files.length === 0) return document.createElement("ul");

  const ul = document.createElement("ul");
  for (let file of files) {
    const li = document.createElement("li");
    li.classList.add("file-item");
    li.setAttribute("data-filename", file.name);

    const button = document.createElement("button");
    button.classList.add("files");
    button.textContent = file.name;

    li.appendChild(button);
    ul.appendChild(li);
  }

  return ul;
}

/**
 * @param {Array<string>} folders
 * @returns {HTMLElement}
 */
function listFolder(folders) {
  if (folders.length === 0) return document.createElement("ul");

  const ul = document.createElement("ul");
  for (let folder of folders) {
    const li = document.createElement("li");

    const button = document.createElement("button");
    button.classList.add("folders");
    button.textContent = folder;

    li.appendChild(button);
    ul.appendChild(li);
  }

  return ul;
}

document.addEventListener("DOMContentLoaded", () => {
  getFolderData("", "");
});
