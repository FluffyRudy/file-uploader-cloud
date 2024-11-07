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
    container.innerHTML = "";
    const { fileObjects } = await folderData.json();
    const { files, folders } = fileObjects;

    container.innerHTML += listFiles(files);
    container.innerHTML += listFolder(folders);
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
 *
 * @param {Array<FileObject>} files
 * @returns {string}
 */
function listFiles(files) {
  if (files.length === 0) return "";
  let res = "<ul>\n";
  for (let file of files) {
    res += `<li class="file-item" data-filename="${file.name}">
      <button class="files">${file.name}</button>
    </li>\n`;
  }
  res += "\n</ul>";
  return res;
}

/**
 *
 * @param {Array<string>} folders
 */
function listFolder(folders) {
  if (folders.length === 0) return "";
  let res = "<ul>\n";
  for (let folder of folders) {
    res += `<li><button class='folders'>${folder}</button></li>\n`;
  }
  res += "\n</ul>";
  return res;
}

document.addEventListener("DOMContentLoaded", () => {
  getFolderData("", "");
});
