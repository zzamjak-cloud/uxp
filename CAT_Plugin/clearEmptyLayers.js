const app = require("photoshop").app;
const { executeAsModal } = require('photoshop').core;
const { batchPlay } = require("photoshop").action;
const { showAlert } = require("./lib/lib");
const { deleteLayerByID } = require("./lib/lib_layer");

// 빈 레이어 삭제
async function clearEmptyLayers() {
    try {
        // 문서가 열려있는지 확인
        if (!app.documents.length) {
            await showAlert("문서가 열려있어야 합니다.");
            return;
        }

        const doc = app.activeDocument;
        
        // 히스토리 상태로 묶기
        await executeAsModal(async () => {
            await performClearEmptyLayers(doc);
        }, {
            commandName: "빈 레이어 삭제"
        });

    } catch (error) {
        await showAlert(`레이어 삭제 실패: ${error.message}`);
    }
}

// 레이어 삭제
async function performClearEmptyLayers(doc) {
    const layers = doc.layers;
    
    if (layers.length <= 1) {
        await showAlert("문서에 최소 2개 이상의 레이어가 필요합니다.");
        return;
    }

    let removedLayersCount = 0;
    let removedGroupsCount = 0;

    // 모든 레이어를 역순으로 순회 (삭제 시 인덱스 변화 방지)
    for (let i = layers.length - 1; i >= 0; i--) {
        const layer = layers[i];
        
        try {
            // 스마트 오브젝트, 텍스트 레이어는 건너뛰기
            if (layer.kind === 'smartObject' || layer.kind === 'textLayer') {
                continue;
            }

            // 일반 레이어 처리 (pixel 타입)
            if (layer.kind === 'pixel') {
                const isEmpty = isLayerEmpty(layer);
                if (isEmpty && !layer.locked && !layer.isBackgroundLayer) {
                    await deleteLayerByID(layer.id);
                    removedLayersCount++;
                }
            }
            // 그룹 레이어 처리
            else if (layer.kind === 'group') {
                const isEmpty = await processGroupRecursively(layer);
                if (isEmpty && !layer.locked) {
                    await deleteLayerByID(layer.id);
                    removedGroupsCount++;
                }
            }
            else {
                console.log(`  -> 알 수 없는 레이어 타입: ${layer.kind}`);
            }
        } catch (error) {
            console.log(`레이어 ${layer.name} 처리 실패:`, error.message);
        }
    }

    // 결과 표시
    const totalRemoved = removedLayersCount + removedGroupsCount;
    if (totalRemoved > 0) {
        const message = `${removedLayersCount}개의 레이어와 ${removedGroupsCount}개의 그룹이 제거되었습니다.`;
        console.log(message);
    } else {
        await showAlert("삭제할 빈 레이어가 없습니다.");
    }
}

// 일반 레이어가 비어있는지 확인
function isLayerEmpty(layer) {
    try {
        const bounds = layer.bounds;
        
        if (!bounds) {
            return true;
        }
        
        const width = bounds.right - bounds.left;
        const height = bounds.bottom - bounds.top;
        const isEmpty = width === 0 || height === 0;
        return isEmpty;

    } catch (error) {
        console.log(`레이어 ${layer.name} bounds 확인 실패:`, error.message);
        return false; // 에러가 발생하면 삭제하지 않음
    }
}

// 그룹 내부의 빈 레이어들을 재귀적으로 삭제하고, 그룹이 비어있는지 확인
async function processGroupRecursively(group) {
    try {
        if (!group.layers || group.layers.length === 0) {
            return true; // 빈 그룹
        }

        let hasValidContent = false;

        // 그룹 내부의 모든 레이어를 역순으로 순회 (삭제 시 인덱스 변화 방지)
        for (let i = group.layers.length - 1; i >= 0; i--) {
            const layer = group.layers[i];
            
            // 스마트 오브젝트, 텍스트 레이어는 건너뛰기 (유효한 콘텐츠로 간주)
            if (layer.kind === 'smartObject' || layer.kind === 'textLayer') {
                hasValidContent = true;
                continue;
            }

            // 일반 레이어인 경우 (pixel 타입)
            if (layer.kind === 'pixel') {
                if (isLayerEmpty(layer) && !layer.locked && !layer.isBackgroundLayer) {
                    await deleteLayerByID(layer.id);
                } else {
                    hasValidContent = true; // bounds를 가진 레이어가 있음
                }
            }
            // 그룹 레이어인 경우 재귀적으로 처리
            else if (layer.kind === 'group') {
                const isEmpty = await processGroupRecursively(layer);
                if (!isEmpty) {
                    hasValidContent = true; // 유효한 하위 그룹이 있음
                } else {
                    // 하위 그룹이 비어있으면 삭제
                    await deleteLayerByID(layer.id);
                }
            }
        }

        return !hasValidContent; // 유효한 콘텐츠가 없으면 그룹이 비어있음
    } catch (error) {
        console.log(`그룹 ${group.name} 처리 실패:`, error.message);
        return false; // 에러가 발생하면 삭제하지 않음
    }
}


module.exports = {
    clearEmptyLayers,
};