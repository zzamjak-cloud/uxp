const fs = require('uxp').storage.localFileSystem;
const app = require('photoshop').app;
const { executeAsModal } = require('photoshop').core;
const { addSelectLayer, selectNoLays } = require('./lib/lib_layer');
const { saveAsPSD } = require('./lib/lib_export');
const { actionCommands } = require("./lib/lib_layer");
const { createDocCopyLayers, selectPrevDoc, docCloseWithoutSaving } = require('./lib/lib_doc');


async function cleanPSD() {
    try {
        console.log("Clean PSD 시작");
        
        // 현재 문서 참조 저장
        const originalDoc = app.activeDocument;
        const originalPath = originalDoc.path;
        
        console.log(`처리할 문서: ${originalDoc.name}`);

        // 파일 토큰 생성
        const file_entry = await fs.createEntryWithUrl(`file:${originalPath}`, { overwrite: true });
        const file_token = await fs.createSessionToken(file_entry);

        await executeAsModal(async () => {
            try {
                // 1. 새 문서 생성 및 레이어 복사
                await selectAllLayers(originalDoc.layers);
                await createDocCopyLayers(originalDoc.name);
                const newDoc = app.activeDocument;
                
                // 4. 원본 문서 닫기 (저장하지 않음)
                app.activeDocument = originalDoc;
                await docCloseWithoutSaving(originalDoc);
                
                // 5. 새 문서를 원본 경로에 저장
                app.activeDocument = newDoc;
                await saveAsPSD(file_token);
                
                // 6. 새 문서 닫기
                await docCloseWithoutSaving(newDoc);
                
                console.log("Clean PSD 완료");
            } catch (err) {
                console.error("문서 처리 중 오류:", err);
            }
        }, {
            commandName: "Clean PSD"
        });
        
    } catch (e) {
        console.error("Clean PSD 실행 중 오류:", e.message);
    }
}

async function selectAllLayers(layers) {
    const layerIDs = [];

    for (const layer of layers) {
        layerIDs.push(layer.id);
        await executeAsModal(() => {addSelectLayer(layer.id, layerIDs)}, {});
        if (layer.kind == 'group') {
            await selectAllLayers(layer.layers);
        }
    }
}

module.exports = {
    cleanPSD
}