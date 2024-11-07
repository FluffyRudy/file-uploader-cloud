import { FileObject } from "../types/global";

export const filterFilesAndFolders = (fileObjects: FileObject[]) => {
    return fileObjects.reduce((accm: { files: FileObject[], folders: string[] }, fileObj: FileObject) => {
        if (!fileObj.id)
            accm.folders.push(fileObj.name);
        else
            accm.files.push(fileObj);
        return accm;
    }, { files: [], folders: [] });
}