const fs = require('uxp').storage.localFileSystem;
const app = require('photoshop').app;
const { executeAsModal } = require('photoshop').core;
const { selectNoLays } = require('./lib/lib_layer');
const { saveAsPSD } = require('./lib/lib_export');
const { actionCommands, selectAllLayersByID, collectAllLayerIDsInOrder } = require("./lib/lib_layer");
const { createDocCopyLayers, docCloseWithoutSaving } = require('./lib/lib_doc');


async function cleanPSD() {
    try {
        console.log("Clean PSD 시작");
        
        // 현재 문서 참조 저장 (ID로 안전하게 참조)
        const originalDoc = app.activeDocument;
        const originalDocID = originalDoc.id;
        const originalPath = originalDoc.path;
        const originalName = originalDoc.name;
        
        console.log(`처리할 문서: ${originalName} (ID: ${originalDocID})`);

        // 파일 토큰 생성
        const file_entry = await fs.createEntryWithUrl(`file:${originalPath}`, { overwrite: true });
        const file_token = await fs.createSessionToken(file_entry);

        await executeAsModal(async () => {
            let newDoc = null;
            try {
                // 1. 원본 문서로 다시 전환 (여러 문서 환경에서 안전성 확보)
                app.activeDocument = originalDoc;
                
                // 2. 모든 레이어 선택 후 새 문서로 복사
                await selectAllLayers(originalDoc.layers);
                await createDocCopyLayers(originalName);
                newDoc = app.activeDocument;
                const newDocID = newDoc.id;
                
                console.log(`새 문서 생성됨: ${newDoc.name} (ID: ${newDocID})`);
                
                // 3. 원본 문서로 다시 전환하여 닫기
                app.activeDocument = originalDoc;
                console.log(`원본 문서로 전환하여 닫기: ${originalDoc.name}`);
                await docCloseWithoutSaving(originalDoc);
                
                // 4. 새 문서로 전환하여 원본 경로에 저장
                app.activeDocument = newDoc;
                console.log(`새 문서로 전환하여 저장: ${newDoc.name}`);
                await saveAsPSD(file_token);
                
                // 5. 새 문서 닫기
                await docCloseWithoutSaving(newDoc);
                
                console.log("Clean PSD 완료");
            } catch (err) {
                console.error("문서 처리 중 오류:", err);
                
                // 오류 발생 시 정리 작업
                try {
                    if (newDoc && newDoc.id) {
                        app.activeDocument = newDoc;
                        await docCloseWithoutSaving(newDoc);
                        console.log("오류 발생으로 인한 새 문서 정리 완료");
                    }
                } catch (cleanupErr) {
                    console.error("정리 작업 중 오류:", cleanupErr);
                }
                
                throw err;
            }
        }, {
            commandName: "Clean PSD"
        });
        
    } catch (e) {
        console.error("Clean PSD 실행 중 오류:", e.message);
    }
}

async function selectAllLayers(layers) {
    const { batchPlay } = require('photoshop').action;
    
    try {
        console.log("레이어 선택 시작 - layerID 배열 배치 방식");
        
        // 먼저 모든 레이어 선택 해제
        await selectNoLays();
        
        // 모든 레이어 ID를 순서대로 수집 (재귀적으로, 모든 레이어 포함)
        const allLayerIDs = [];
        collectAllLayerIDsInOrder(layers, allLayerIDs);
        
        console.log(`총 ${allLayerIDs.length}개 레이어 발견 (모든 레이어 포함, 순서 보존)`);
        
        // layerID 배열을 사용한 배치 선택
        if (allLayerIDs.length > 0) {
            await executeAsModal(async () => {

                await selectAllLayersByID(layers, allLayerIDs);

            }, { commandName: "Select All Layers with layerID Array" });
        }
        
        console.log("모든 레이어 선택 완료");
    } catch (err) {
        console.error("레이어 선택 중 오류:", err);
        throw err;
    }
}

module.exports = {
    cleanPSD
}