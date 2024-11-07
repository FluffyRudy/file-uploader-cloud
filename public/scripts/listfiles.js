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

    if (prevFolder) {
      prevFolderBtn.style.display = "block";
      prevFolderBtn.onclick = async () =>
        await getFolderData(
          "",
          prevFolder.slice(0, prevFolder.lastIndexOf("/"))
        );
    } else {
      prevFolderBtn.style.display = "none";
    }

    const folderList = container.querySelectorAll(".folders");
    Array.from(folderList).forEach((folderElem, i) => {
      const prevFolder = folder;
      const nextFolder = prevFolder + folders[i] + "/";
      folderElem.onclick = async () =>
        await getFolderData(prevFolder, nextFolder);
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
