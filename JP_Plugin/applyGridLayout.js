const app = require('photoshop').app;
const { executeAsModal } = require('photoshop').core;
const { batchPlay } = require('photoshop').action;
const { getCurrentLayerPosition, moveLayerOffset, selectByLayerID, selectNoLays } = require('./lib/lib_layer');

const STARTING_POINT = 0;   // 전역변수 : 레이어정렬 시작포인트 (0,0)

// 레이어를 셀의 중심으로 이동
async function moveLayerToPosition(layer, targetCenterX, targetCenterY) {
    try {
        // 현재 레이어의 bounds 정보 가져오기
        const currentBounds = await getCurrentLayerPosition(layer);
        
        // 레이어의 크기 계산
        const layerWidth = currentBounds.right._value - currentBounds.left._value;
        const layerHeight = currentBounds.bottom._value - currentBounds.top._value;

        // 레이어의 중심을 그리드 셀의 중심에 맞추기 위한 위치 계산
        const targetLeft = targetCenterX - (layerWidth / 2);
        const targetTop = targetCenterY - (layerHeight / 2);

        // 이동해야 할 거리 계산
        const moveX = targetLeft - currentBounds.left._value;
        const moveY = targetTop - currentBounds.top._value;

        // 레이어 이동
        await executeAsModal(() => moveLayerOffset(layer, moveX, moveY));

    } catch(e) {
        console.error(`Error moving layer ${layer.name}:`, e);
    }
}

async function applyGridLayout() {
    try {
        await executeAsModal(async () => {
            const doc = app.activeDocument;
            const selectedLayers = doc.activeLayers;

            if (selectedLayers.length === 0) {
                await app.showAlert('Please select layers to arrange in grid layout.');
                return;
            }

            const gridWidth = parseInt(document.getElementById('gridWidth').value) || 100;
            const gridHeight = parseInt(document.getElementById('gridHeight').value) || 100;
            const columnsPerRow = parseInt(document.getElementById('gridColumn').value) || 10;
            
            // 그리드 셀의 중심점 계산을 위한 오프셋
            const cellCenterOffsetX = gridWidth / 2;
            const cellCenterOffsetY = gridHeight / 2;

            console.log(`Grid settings - Width: ${gridWidth}, Height: ${gridHeight}, Columns: ${columnsPerRow}`);

            // 레이어를 알파벳 순서로 정렬
            const sortedLayers = [...selectedLayers].sort((a, b) => a.name.localeCompare(b.name));
            
            console.log("Layers will be arranged alphabetically:");
            sortedLayers.forEach((layer, index) => {
                console.log(`${index + 1}. ${layer.name}`);
            });

            await selectNoLays();

            for (let i = 0; i < sortedLayers.length; i++) {
                const layer = sortedLayers[i];
                const row = Math.floor(i / columnsPerRow);
                const col = i % columnsPerRow;

                // 그리드 셀의 중심점 계산
                const centerX = STARTING_POINT + (col * gridWidth) + cellCenterOffsetX;
                const centerY = STARTING_POINT + (row * gridHeight) + cellCenterOffsetY;

                await selectByLayerID(layer.id);
                await moveLayerToPosition(layer, centerX, centerY);
            }

        }, { commandName: 'Apply Grid Layout' });

    } catch (error) {
        console.error('Grid Layout Error:', error);
        await app.showAlert(`Error: ${error.message}`);
    }
}

module.exports = {
    applyGridLayout
};