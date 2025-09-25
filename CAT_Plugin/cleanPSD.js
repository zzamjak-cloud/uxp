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
                console.log(`원본 문서 활성화: ${originalDoc.name}`);
                
                // 2. 새 문서 생성 및 레이어 복사
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
    try {
        console.log("레이어 선택 시작 - 순서 보존 및 유실 방지");
        
        // 먼저 모든 레이어 선택 해제
        await selectNoLays();
        
        // 모든 레이어 ID를 순서대로 수집 (재귀적으로)
        const allLayerIDs = [];
        collectAllLayerIDsInOrder(layers, allLayerIDs);
        
        console.log(`총 ${allLayerIDs.length}개 레이어 발견 (순서 보존)`);
        
        // 모든 레이어를 순서대로 선택
        if (allLayerIDs.length > 0) {
            await executeAsModal(async () => {
                for (let i = 0; i < allLayerIDs.length; i++) {
                    const layerID = allLayerIDs[i];
                    try {
                        await addSelectLayer(layerID, allLayerIDs);
                    } catch (err) {
                        console.warn(`레이어 ${layerID} 선택 실패:`, err.message);
                        // 개별 레이어 선택 실패는 무시하고 계속 진행
                    }
                }
            }, { commandName: "Select All Layers" });
        }
        
        console.log("모든 레이어 선택 완료");
    } catch (err) {
        console.error("레이어 선택 중 오류:", err);
        throw err;
    }
}

// 모든 레이어 ID를 순서대로 수집하는 함수 (재귀적)
function collectAllLayerIDsInOrder(layers, layerIDs) {
    for (const layer of layers) {
        layerIDs.push(layer.id);
        console.log(`레이어 추가: ${layer.name} (ID: ${layer.id}, 타입: ${layer.kind})`);
        
        // 그룹인 경우 내부 레이어들도 재귀적으로 수집 (순서 보존)
        if (layer.kind === 'group' && layer.layers) {
            collectAllLayerIDsInOrder(layer.layers, layerIDs);
        }
    }
}

module.exports = {
    cleanPSD
}