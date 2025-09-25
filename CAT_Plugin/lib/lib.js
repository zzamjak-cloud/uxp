const fs = require('uxp').storage.localFileSystem;
const app = require('photoshop').app;

// 폴더생성 및 세션토큰 발행
async function createFolderToken(create_folder_name, save_folder_entry) {

    const path = `${save_folder_entry.nativePath}/${create_folder_name}`
    const entry = await fs.createEntryWithUrl(`file:${path}`, { type: "folder" });
    const token = await fs.createSessionToken(entry);
    return token

}

// {폴더명}.txt 파일 생성 : 지정된 폴더 경로를 저장할 데이터 폴더
async function getDataFolder(folder_name) {

    const saveFolder = await fs.getFolder();
    const dataFolder = await fs.getDataFolder();
    // console.log(dataFolder.nativePath);
    
    const file = await dataFolder.createFile(`${folder_name}.txt`, {overwrite: true});
    await file.write(saveFolder.nativePath);
    // console.log(`${folder_name}.txt 파일 저장 완료`);
    showAlert(`이제부터 "${saveFolder.name}" 폴더에 파일을 저장합니다.`);
    document.getElementById(`${folder_name}`).innerText = saveFolder.name;
}

// 지정된 저장 폴더 경로 가져오기
async function getSaveFolderPath(pathId) {
    try {
        const dataFolder = await fs.getDataFolder();
        const entries = await dataFolder.getEntries();

        for (const entry of entries) {
            if (entry.name === `${pathId}.txt`) {
                const folderURL = await entry.read();
                const folderEntry = await fs.getEntryWithUrl(`file:${folderURL}`);
                const folderToken = await fs.createSessionToken(folderEntry);
                
                const folderNameArray = folderURL.split(/[\\\/]/);
                const folderName = folderNameArray[folderNameArray.length - 1];

                return {
                    folderPath: folderURL,
                    folderToken: folderToken,
                    folderName: folderName
                };
            }
        }
        return null;
    } catch (error) {
        throw new Error(`저장 폴더 경로 가져오기 실패: ${error.message}`);
    }
}

// 경고창 표시
async function showAlert(message) {
	await app.showAlert(message);
}

// 파일명에서 잘못된 문자 제거
function sanitizeFileName(fileName) {
    return fileName.replace(/[<>:"/\\|?*]/g, '_').trim();
}

module.exports = {
    createFolderToken,
    getDataFolder,
    getSaveFolderPath,
    showAlert,
    sanitizeFileName
};
