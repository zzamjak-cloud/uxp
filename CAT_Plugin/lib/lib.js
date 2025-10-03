const fs = require('uxp').storage.localFileSystem;
const app = require('photoshop').app;
const { batchPlay } = require("photoshop").action;
const { executeAsModal } = require('photoshop').core;

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

// ===== 히스토리 그룹핑 관련 함수들 =====

// 범용적인 히스토리 그룹핑 함수
async function executeWithHistoryGrouping(batchCommands, historyName, context) {
   try {
      // History 기록 일시 중단
      const historyID = await context.hostControl.suspendHistory({
         documentID: app.activeDocument.id,
         name: historyName  // History에 표시될 이름
      });
      
      // 배치 실행
      await batchPlay(batchCommands, {});
      
      return historyID;
      
   } catch (error) {
      throw new Error(`Failed to execute batch commands with history grouping: ${error.message}`);
   }
}

// 편의 함수: executeAsModal과 함께 사용하는 히스토리 그룹핑
async function executeModalWithHistoryGrouping(operation, historyName, commandName = "Custom Operation") {
   return await executeAsModal(async (context) => {
      let historyID;
      try {
         // History 기록 일시 중단
         historyID = await context.hostControl.suspendHistory({
            documentID: app.activeDocument.id,
            name: historyName
         });
         
         // 사용자 정의 작업 실행
         const result = await operation(context);
         
         return result;
         
      } finally {
         // History 기록 재개 (반드시 finally에서 실행)
         if (historyID) {
            await context.hostControl.resumeHistory(historyID);
         }
      }
   }, { commandName });
}

// 편의 함수: 단일 batchPlay 명령을 히스토리 그룹핑과 함께 실행
async function executeSingleCommandWithHistoryGrouping(command, historyName, context) {
   return await executeWithHistoryGrouping([command], historyName, context);
}

module.exports = {
    createFolderToken,   // 폴더생성 및 세션토큰 발행
    getDataFolder,       // {폴더명}.txt 파일 생성 : 지정된 폴더 경로를 저장할 데이터 폴더
    getSaveFolderPath,   // 지정된 저장 폴더 경로 가져오기
    showAlert,           // 경고창 표시
    sanitizeFileName,    // 파일명에서 잘못된 문자 제거
    // 히스토리 그룹핑 관련 함수들
    executeWithHistoryGrouping, // 범용적인 히스토리 그룹핑 함수
    executeModalWithHistoryGrouping, // executeAsModal과 함께 사용하는 히스토리 그룹핑
    executeSingleCommandWithHistoryGrouping // 단일 batchPlay 명령을 히스토리 그룹핑과 함께 실행
};
