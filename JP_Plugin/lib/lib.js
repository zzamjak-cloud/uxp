const lfs = require('uxp').storage.localFileSystem;
const app = require('photoshop').app;


// 폴더생성 및 세션토큰 발행
async function createFolderToken(create_folder_name, save_folder_entry) {

    const path = `${save_folder_entry.nativePath}/${create_folder_name}`
    const entry = await lfs.createEntryWithUrl(`file:${path}`, { type: "folder" });
    const token = await lfs.createSessionToken(entry);
    return token

}

async function showAlert(message) {
	await app.showAlert(message);
}

module.exports = {
    createFolderToken,
    showAlert
};
