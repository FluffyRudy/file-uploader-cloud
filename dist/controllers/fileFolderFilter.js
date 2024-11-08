"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterFilesAndFolders = void 0;
const filterFilesAndFolders = (fileObjects) => {
    return fileObjects.reduce((accm, fileObj) => {
        if (!fileObj.id)
            accm.folders.push(fileObj.name);
        else
            accm.files.push(fileObj);
        return accm;
    }, { files: [], folders: [] });
};
exports.filterFilesAndFolders = filterFilesAndFolders;
