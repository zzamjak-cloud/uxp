const app = require('photoshop').app;
const { executeAsModal } = require('photoshop').core;
const { batchPlay } = require('photoshop').action;
const { selectNoLays, selectByLayerID } = require('./lib/lib_layer');

async function getCurrentLayerPosition(layer) {
    const result = await batchPlay(
        [{
            _obj: "get",
            _target: [
                {
                    _ref: "layer",
                    _id: layer.id
                }
            ],
            _options: { dialogOptions: "dontDisplay" }
        }],
        { synchronousExecution: true }
    );
    
    return result[0].bounds;
}

async function moveLayerToPosition(layer, cellCenterX, cellCenterY) {
    try {
        // 현재 레이어의 bounds 정보 가져오기
        const currentBounds = await getCurrentLayerPosition(layer);
        
        // 현재 레이어의 중심점 계산
        const currentCenterX = (currentBounds.left._value + currentBounds.right._value) / 2;
        const currentCenterY = (currentBounds.top._value + currentBounds.bottom._value) / 2;

        // 이동해야 할 거리 계산
        const moveX = cellCenterX - currentCenterX;
        const moveY = cellCenterY - currentCenterY;

        console.log(`Layer ${layer.name} (ID: ${layer.id})`);
        console.log(`Current Center - X: ${currentCenterX}, Y: ${currentCenterY}`);
        console.log(`Target Cell Center - X: ${cellCenterX}, Y: ${cellCenterY}`);
        console.log(`Moving by - X: ${moveX}, Y: ${moveY}`);

        await batchPlay(
            [{
                _obj: "move",
                _target: [{
                    _ref: "layer",
                    _id: layer.id
                }],
                to: {
                    _obj: "offset",
                    horizontal: { _unit: "pixelsUnit", _value: moveX },
                    vertical: { _unit: "pixelsUnit", _value: moveY }
                },
                _options: {
                    dialogOptions: "dontDisplay"
                }
            }],
            { synchronousExecution: true }
        );

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
            
            // 그리드 셀의 중심점은 셀 크기의 절반
            const halfCellWidth = gridWidth / 2;
            const halfCellHeight = gridHeight / 2;

            // 레이어를 알파벳 순서로 정렬
            const sortedLayers = [...selectedLayers].sort((a, b) => {
                return a.name.localeCompare(b.name, undefined, {
                    numeric: true,
                    sensitivity: 'base'
                });
            });

            await selectNoLays();

            for (let i = 0; i < sortedLayers.length; i++) {
                const layer = sortedLayers[i];
                const row = Math.floor(i / columnsPerRow);
                const col = i % columnsPerRow;

                // 그리드 셀의 중심점 계산
                const cellCenterX = halfCellWidth + (col * gridWidth);
                const cellCenterY = halfCellHeight + (row * gridHeight);

                console.log(`Processing layer ${i + 1}/${sortedLayers.length}: ${layer.name}`);
                console.log(`Row: ${row}, Column: ${col}`);
                console.log(`Cell center - X: ${cellCenterX}, Y: ${cellCenterY}`);

                await selectByLayerID(layer.id);
                await moveLayerToPosition(layer, cellCenterX, cellCenterY);
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