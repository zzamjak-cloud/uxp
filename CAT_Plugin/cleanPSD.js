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
                // 첫 번째 레이어 선택
                await batchPlay([{
                    _obj: "select",
                    _target: [{
                        _ref: "layer",
                        _name: layers[0].name  // 첫 번째 레이어 이름
                    }],
                    makeVisible: false,
                    layerID: [allLayerIDs[0]],  // 첫 번째 레이어 ID
                    _options: {
                        dialogOptions: "dontDisplay"
                    }
                }], {});
                
                console.log(`첫 번째 레이어 선택 완료: ${layers[0].name}`);
                
                // 나머지 모든 레이어를 연속 선택으로 추가
                if (allLayerIDs.length > 1) {
                    await batchPlay([{
                        _obj: "select",
                        _target: [{
                            _ref: "layer",
                            _name: layers[layers.length - 1].name  // 마지막 레이어 이름
                        }],
                        selectionModifier: {
                            _enum: "selectionModifierType",
                            _value: "addToSelectionContinuous"
                        },
                        makeVisible: false,
                        layerID: allLayerIDs,  // 모든 레이어 ID 배열
                        _options: {
                            dialogOptions: "dontDisplay"
                        }
                    }], {});
                    
                    console.log(`모든 레이어 배치 선택 완료: ${allLayerIDs.length}개 레이어`);
                }
                
            }, { commandName: "Select All Layers with layerID Array" });
        }
        
        console.log("모든 레이어 선택 완료");
    } catch (err) {
        console.error("레이어 선택 중 오류:", err);
        throw err;
    }
}


// 모든 레이어 ID를 순서대로 수집하는 함수 (재귀적, Background 레이어 포함)
function collectAllLayerIDsInOrder(layers, layerIDs) {
    for (const layer of layers) {
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