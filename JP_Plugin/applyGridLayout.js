const app = require('photoshop').app;
const { executeAsModal } = require('photoshop').core;
const { batchPlay } = require('photoshop').action;
const { selectByLayerID, selectNoLays } = require('./lib/lib_layer');
const { handleError } = require('./lib/errorHandler');
const { Logger } = require('./lib/logger');
const constants = require('./lib/constants');

const logger = new Logger('GridLayout');
const STARTING_POINT = 0;

// 입력 유효성 검증
function validateGridInputs(width, height, columns, selectedLayers) {
    // 선택된 레이어가 없을 경우, 에러 메시지 출력
    if (!selectedLayers || selectedLayers.length === 0) {
        throw new Error(constants.ERROR_MESSAGES.NO_SELECTION);
    }
    // width, height, columns 값이 0보다 작거나 같을 경우, 에러 메시지 출력
    if (!width || width <= 0 || !height || height <= 0 || !columns || columns <= 0) {
        throw new Error('음수값은 사용할 수 없습니다.');
    }
    // columns 값이 선택된 레이어 개수보다 클 경우, 에러 메시지 출력
    if (columns > selectedLayers.length) {
        throw new Error(`선택한 레이어 수가 Column수보다 적어야 합니다.`);
    }
}

// 레이어의 현재 위치값 얻기
async function getCurrentLayerPosition(layer) {
    try {
        const result = await batchPlay(
            [{
                _obj: "get",
                _target: [{ _ref: "layer", _id: layer.id }],
                _options: { dialogOptions: "dontDisplay" }
            }],
            { synchronousExecution: true }
        );
        return result[0].bounds;
    } catch (error) {
        throw new Error(`레이어 위치 확인 실패 : ${error.message}`);
    }
}

// 레이어 이동
async function moveLayerToPosition(layer, targetCenterX, targetCenterY) {
    try {
        const currentBounds = await getCurrentLayerPosition(layer);
        
        const layerWidth = currentBounds.right._value - currentBounds.left._value;
        const layerHeight = currentBounds.bottom._value - currentBounds.top._value;

        const targetLeft = targetCenterX - (layerWidth / 2);
        const targetTop = targetCenterY - (layerHeight / 2);

        const moveX = targetLeft - currentBounds.left._value;
        const moveY = targetTop - currentBounds.top._value;

        await batchPlay(
            [{
                _obj: "move",
                _target: [{ _ref: "layer", _id: layer.id }],
                to: {
                    _obj: "offset",
                    horizontal: { _unit: "pixelsUnit", _value: moveX },
                    vertical: { _unit: "pixelsUnit", _value: moveY }
                },
                _options: { dialogOptions: "dontDisplay" }
            }],
            { synchronousExecution: true }
        );

    } catch (error) {
        throw new Error(`${layer.name} 이동 실패 : ${error.message}`);
    }
}

// 레이어 정렬하기
async function applyGridLayout() {
    try {
        await executeAsModal(async () => {
            const doc = app.activeDocument;
            const selectedLayers = doc.activeLayers;

            // 입력된 width, height, columns 값 가져오기
            const gridWidth = parseInt(document.getElementById('gridWidth').value) || 100;
            const gridHeight = parseInt(document.getElementById('gridHeight').value) || 100;
            const columnsPerRow = parseInt(document.getElementById('gridColumn').value) || 10;

            // 입력된 값 검증하기
            validateGridInputs(gridWidth, gridHeight, columnsPerRow, selectedLayers);
            
            logger.info(`Applying grid layout - Width: ${gridWidth}, Height: ${gridHeight}, Columns: ${columnsPerRow}`);

            const cellCenterOffsetX = gridWidth / 2;
            const cellCenterOffsetY = gridHeight / 2;

            await selectNoLays();

            // 선택된 레이어 정렬하기
            for (let i = 0; i < selectedLayers.length; i++) {
                const layer = selectedLayers[i];
                const row = Math.floor(i / columnsPerRow);
                const col = i % columnsPerRow;

                const centerX = STARTING_POINT + (col * gridWidth) + cellCenterOffsetX;
                const centerY = STARTING_POINT + (row * gridHeight) + cellCenterOffsetY;

                logger.debug(`Moving layer "${layer.name}" to position (${centerX}, ${centerY})`);
                
                await selectByLayerID(layer.id);
                await moveLayerToPosition(layer, centerX, centerY);
            }

            logger.info('Grid layout applied successfully');

        }, { commandName: 'Apply Grid Layout' });

    } catch (error) {
        await handleError(error, 'grid_layout');
    }
}

module.exports = {
    applyGridLayout,
    // Export for testing
    validateGridInputs,
    getCurrentLayerPosition,
    moveLayerToPosition
};