const app = require("photoshop").app;
const fs = require('uxp').storage.localFileSystem;
const { showAlert } = require("./lib/lib");

// {폴더명}.txt 파일 생성
async function getPath(folder_name) {

    const saveFolder = await fs.getFolder();
    const dataFolder = await fs.getDataFolder();
    // console.log(dataFolder.nativePath);
    
    const file = await dataFolder.createFile(`${folder_name}.txt`, {overwrite: true});
    await file.write(saveFolder.nativePath);
    // console.log(`${folder_name}.txt 파일 저장 완료`);
    showAlert(`이제부터 "${saveFolder.name}" 폴더에 파일을 저장합니다.`);
    document.getElementById(`${folder_name}`).innerText = saveFolder.name;
}

module.exports = {
    getPath
};