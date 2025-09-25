const fs = require('uxp').storage.localFileSystem;
const app = require('photoshop').app;
const { executeAsModal } = require('photoshop').core;
const { addSelectLayer, selectNoLays, makeGroup, ungroupLayers } = require('./lib/lib_layer');
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
                
                // 2. 빠른 그룹화 방식으로 레이어 복사
                newDoc = await copyLayersUsingGroupMethod(originalDoc, originalName);
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
        
        // 모든 레이어 ID를 순서대로 수집 (재귀적으로, Background 레이어 제외)
        const allLayerIDs = [];
        collectAllLayerIDsInOrder(layers, allLayerIDs);
        
        console.log(`총 ${allLayerIDs.length}개 레이어 발견 (Background 레이어 제외, 순서 보존)`);
        
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

// 그룹화를 통한 빠른 레이어 복사 방식
async function copyLayersUsingGroupMethod(originalDoc, docName) {
    
    try {
        console.log("그룹화 방식으로 빠른 레이어 복사 시작");
        
        // 1. 모든 레이어 선택
        await selectAllLayers(originalDoc.layers);
        
        try {
            await makeGroup("group");
        } catch (groupErr) {
            console.log("그룹화 실패", groupErr.message);
        }
        
        console.log("그룹 생성 완료 후 새 문서로 복사 시작");

        await createDocCopyLayers(docName);
        const newDoc = app.activeDocument;
        
        if (!newDoc || newDoc.id === originalDoc.id) {
            throw new Error('새 문서 생성에 실패했습니다.');
        }
        
        // 4. 새 문서에서 그룹 해제 (라이브러리 함수 사용)
        console.log("새 문서에서 그룹 해제 중...");
        try {
            await ungroupLayers();
            console.log("그룹 해제 완료 - 모든 레이어가 개별 레이어로 복원됨");
        } catch (ungroupErr) {
            console.log("그룹 해제 실패, 수동으로 처리:", ungroupErr.message);
            // 그룹 해제 실패 시에도 새 문서는 정상적으로 생성됨
            // 사용자가 수동으로 그룹을 해제할 수 있음
        }
        
        return newDoc;
        
    } catch (err) {
        console.error("그룹화 방식 복사 중 오류:", err);
        
        // 오류 발생 시 기존 방식으로 폴백
        console.log("그룹화 방식 실패, 기존 방식으로 폴백...");
        await selectAllLayers(originalDoc.layers);
        await createDocCopyLayers(docName);
        return app.activeDocument;
    }
}

// 모든 레이어 ID를 순서대로 수집하는 함수 (재귀적, Background 레이어 제외)
function collectAllLayerIDsInOrder(layers, layerIDs) {
    for (const layer of layers) {

        if (layer.isBackgroundLayer) {
            console.log(`Background 레이어 제외: ${layer.name} (ID: ${layer.id})`);
            continue;
        }
        
        layerIDs.push(layer.id);
        
        // 그룹인 경우 내부 레이어들도 재귀적으로 수집 (순서 보존)
        if (layer.kind === 'group' && layer.layers) {
            collectAllLayerIDsInOrder(layer.layers, layerIDs);
        }
    }
}

module.exports = {
    cleanPSD
}