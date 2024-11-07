/**
 *
 * @param {string} prevFolder
 * @param {string} folder
 */
async function getFolderData(prevFolder = "", folder) {
  const container = document.getElementById("container");
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
    res += `<li><button class='folders'>${folder}</button></li>` + "\n";
  }
  res += "\n</ul>";
  return res;
}

/**
 * @typedef {Object} FileObject
 * @property {string} name - The name of the bucket.
 * @property {string} bucket_id - The unique identifier for the bucket.
 * @property {string} owner - The owner of the bucket.
 * @property {string} id - The unique identifier for the object.
 * @property {string} updated_at - The timestamp when the object was last updated.
 * @property {string} created_at - The timestamp when the object was created.
 * @property {string} last_accessed_at - The timestamp when the object was last accessed.
 * @property {Record<string, any>} metadata - Additional metadata associated with the object.
 */

document.addEventListener("DOMContentLoaded", () => {
  getFolderData("", "");
});
