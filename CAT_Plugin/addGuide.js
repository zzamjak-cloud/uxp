const app = require("photoshop").app;
const { executeAsModal } = require('photoshop').core;
const { batchPlay } = require("photoshop").action;
const { makeGuide } = require('./lib/lib_guide');
const { makeGroup, layerTranslate, moveLayerTarget, selectByLayerID } = require('./lib/lib_layer');
const { handleError } = require('./lib/errorHandler');
const { Logger } = require('./lib/logger');

const logger = new Logger('AddGuide');

async function addGuide(axis) {
    const doc = app.activeDocument;
    
    if (axis === 'vertical') {
        let position = doc.width * 0.5;
        await executeAsModal(() => {makeGuide(position, axis)}, {});
    } else if (axis === 'horizontal') {
        let position = doc.height * 0.5;
        await executeAsModal(() => {makeGuide(position, axis)}, {});
    }
}
async function addAllGuides() {
    try {
        await executeAsModal(async () => {
            const doc = app.activeDocument;
            const rows = parseInt(document.getElementById('guideRows').value) || 2;
            const cols = parseInt(document.getElementById('guideCols').value) || 2;
            
            // 수평 가이드 생성 (행)
            const sectionHeight = doc.height / rows;
            for (let i = 1; i < rows; i++) {
                const position = sectionHeight * i;
                await makeGuide(position, 'horizontal');
            }
            
            // 수직 가이드 생성 (열)
            const sectionWidth = doc.width / cols;
            for (let i = 1; i < cols; i++) {
                const position = sectionWidth * i;
                await makeGuide(position, 'vertical');
            }
            
            // *** 수정된 부분: 그룹을 먼저 생성하지 않고 텍스트 생성 후 그룹화 ***
            let number = 0;
            const textLayerIds = [];
            
            // 각 셀에 번호 텍스트 생성
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    // 그리드 셀의 정확한 중앙 위치 계산
                    const cellLeft = col * sectionWidth;
                    const cellTop = row * sectionHeight;
                    const cellRight = cellLeft + sectionWidth;
                    const cellBottom = cellTop + sectionHeight;
                    
                    const centerX = (cellLeft + cellRight) / 2;
                    const centerY = (cellTop + cellBottom) / 2;
                    
                    logger.info(`Creating text "${number}" at cell center (${centerX}, ${centerY}) for cell [${row}, ${col}]`);
                    
                    const layerId = await createTextLayerReliable(number.toString(), centerX, centerY);
                    if (layerId) {
                        textLayerIds.push(layerId);
                    }
                    number++;
                }
            }
            
            // *** 수정된 부분: 안전한 그룹 생성 방식 사용 ***
            if (textLayerIds.length > 0) {
                await createGroupFromLayers(textLayerIds, 'Num');
            }
            
            logger.info(`Created ${number} grid number texts in ${rows}x${cols} grid`);
            
        }, { commandName: 'Add All Guides' });
    } catch (error) {
        console.error('Error adding all guides:', error);
    }
}
/**
 * 안정적인 텍스트 레이어 생성 함수 (완전히 독립적)
 * @param {string} text - 텍스트 내용
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 * @returns {number} 생성된 레이어의 ID
 */
async function createTextLayerReliable(text, x, y) {
    try {
        const doc = app.activeDocument;
        
        // 1. batchPlay를 사용하여 직접 텍스트 레이어 생성
        const result = await batchPlay([
            {
                _obj: "make",
                _target: [{ _ref: "textLayer" }],
                using: {
                    _obj: "textLayer",
                    textKey: text,
                    textShape: [
                        {
                            _obj: "textShape",
                            char: { _enum: "char", _value: "paint" },
                            orientation: { _enum: "orientation", _value: "horizontal" },
                            transform: {
                                _obj: "transform",
                                xx: 1, xy: 0, yx: 0, yy: 1,
                                tx: x, ty: y
                            }
                        }
                    ],
                    textStyleRange: [
                        {
                            _obj: "textStyleRange",
                            from: 0,
                            to: text.length,
                            textStyle: {
                                _obj: "textStyle",
                                fontPostScriptName: "Arial-BoldMT",
                                fontName: "Arial-BoldMT",
                                size: { _unit: "pointsUnit", _value: 20 },
                                color: { _obj: "RGBColor", red: 255, grain: 255, blue: 255 }
                            }
                        }
                    ],
                    paragraphStyleRange: [
                        {
                            _obj: "paragraphStyleRange",
                            from: 0,
                            to: text.length,
                            paragraphStyle: {
                                _obj: "paragraphStyle",
                                align: { _enum: "alignmentType", _value: "center" }
                            }
                        }
                    ]
                },
                _options: { dialogOptions: "dontDisplay" }
            }
        ], { synchronousExecution: true });

        // 2. 생성 직후 약간의 지연
        await new Promise(resolve => setTimeout(resolve, 50));

        // 3. 활성 레이어가 텍스트 레이어인지 확인 (가장 확실한 방법)
        let createdLayer = doc.activeLayer;
        
        if (createdLayer && createdLayer.kind === 'text') {
            const layerId = createdLayer.id;
            
            // 4. 텍스트 레이어 이름 설정
            try {
                await batchPlay([
                    {
                        _obj: "set",
                        _target: [{ _ref: "layer", _enum: "ordinal", _value: "targetEnum" }],
                        to: { _obj: "layer", name: `text_${text}` }, // 고유한 이름 사용
                        _options: { dialogOptions: "dontDisplay" }
                    }
                ], { synchronousExecution: true });
            } catch (nameError) {
                // 이름 설정 실패해도 무시
                logger.warn(`Failed to set layer name: ${nameError.message}`);
            }
            
            // 5. 위치 미세 조정
            try {
                const bounds = createdLayer.bounds;
                const currentCenterX = (bounds.left._value + bounds.right._value) / 2;
                const currentCenterY = (bounds.top._value + bounds.bottom._value) / 2;
                
                const offsetX = x - currentCenterX;
                const offsetY = y - currentCenterY;
                
                // 오프셋이 있다면 조정
                if (Math.abs(offsetX) > 1 || Math.abs(offsetY) > 1) {
                    await layerTranslate(createdLayer, offsetX, offsetY);
                    logger.info(`Adjusted text "${text}" position by (${offsetX}, ${offsetY})`);
                }
            } catch (adjustError) {
                logger.warn(`Position adjustment failed for "${text}": ${adjustError.message}`);
            }
            
            logger.info(`Successfully created text layer "${text}" with ID: ${layerId}`);
            return layerId;
        }

        // 6. 활성 레이어로 찾지 못한 경우 최상위 레이어 확인
        if (doc.layers.length > 0 && doc.layers[0].kind === 'text') {
            const layerId = doc.layers[0].id;
            logger.info(`Found text layer via top layer: ${layerId}`);
            return layerId;
        }

        // 7. 마지막 수단: batchPlay 결과에서 layerID 추출
        if (result && result[0] && result[0].layerID) {
            logger.info(`Found text layer via batchPlay result: ${result[0].layerID}`);
            return result[0].layerID;
        }

        logger.warn(`Could not determine layer ID for text "${text}", but layer may have been created`);
        return null;

    } catch (error) {
        logger.error(`Failed to create text layer "${text}":`, error);
        return null;
    }
}
async function addGridNumbers(rows, cols) {
    try {
        await executeAsModal(async () => {
            const doc = app.activeDocument;
            
            const sectionWidth = doc.width / cols;
            const sectionHeight = doc.height / rows;
            
            let number = 0;
            const textLayerIds = [];
            
            // 각 셀에 번호 텍스트 생성
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const cellLeft = col * sectionWidth;
                    const cellTop = row * sectionHeight;
                    const cellRight = cellLeft + sectionWidth;
                    const cellBottom = cellTop + sectionHeight;
                    
                    const centerX = (cellLeft + cellRight) / 2;
                    const centerY = (cellTop + cellBottom) / 2;
                    
                    logger.info(`Creating text "${number}" at cell center (${centerX}, ${centerY}) for cell [${row}, ${col}]`);
                    
                    const layerId = await createTextLayerReliable(number.toString(), centerX, centerY);
                    if (layerId) {
                        textLayerIds.push(layerId);
                    }
                    number++;
                }
            }
            
            // 안전한 그룹 생성
            if (textLayerIds.length > 0) {
                await createGroupFromLayers(textLayerIds, 'Num');
            }
            
            logger.info(`Created ${number} grid number texts in ${rows}x${cols} grid`);
            
        }, { commandName: 'Add Grid Numbers' });
    } catch (error) {
        await handleError(error, 'add_grid_numbers');
    }
}
/**
 * 안전한 그룹 생성 방식 - 레이어들을 선택한 후 그룹으로 만들기
 * @param {Array} layerIds - 그룹에 포함할 레이어 ID 배열
 * @param {string} groupName - 그룹 이름
 */
async function createGroupFromLayers(layerIds, groupName) {
    try {
        const doc = app.activeDocument;
        
        // 1. 모든 선택 해제
        await batchPlay([
            {
                _obj: "selectNoLayers",
                _target: [{ _ref: "layer", _enum: "ordinal", _value: "targetEnum" }],
                _options: { dialogOptions: "dontDisplay" }
            }
        ], { synchronousExecution: true });
        
        // 2. 유효한 레이어들만 선택
        let selectedCount = 0;
        for (const layerId of layerIds) {
            if (!layerId) continue;
            
            try {
                if (selectedCount === 0) {
                    // 첫 번째 레이어 선택
                    await batchPlay([
                        {
                            _obj: "select",
                            _target: [{ _ref: "layer", _id: layerId }],
                            makeVisible: false,
                            _options: { dialogOptions: "dontDisplay" }
                        }
                    ], { synchronousExecution: true });
                } else {
                    // 추가 선택
                    await batchPlay([
                        {
                            _obj: "select",
                            _target: [{ _ref: "layer", _id: layerId }],
                            selectionModifier: {
                                _enum: "selectionModifierType",
                                _value: "addToSelectionContinuous"
                            },
                            makeVisible: false,
                            _options: { dialogOptions: "dontDisplay" }
                        }
                    ], { synchronousExecution: true });
                }
                selectedCount++;
                logger.info(`Selected layer ${layerId} for grouping`);
                
            } catch (selectError) {
                logger.warn(`Failed to select layer ${layerId}: ${selectError.message}`);
            }
        }
        
        // 3. 선택된 레이어들로 그룹 생성
        if (selectedCount > 0) {
            await batchPlay([
                {
                    _obj: "make",
                    _target: [{ _ref: "layerSection" }],
                    using: {
                        _obj: "layerSection",
                        name: groupName
                    },
                    from: {
                        _ref: "layer",
                        _enum: "ordinal",
                        _value: "targetEnum"
                    },
                    _options: { dialogOptions: "dontDisplay" }
                }
            ], { synchronousExecution: true });
            
            logger.info(`Successfully created group "${groupName}" with ${selectedCount} layers`);
        } else {
            logger.warn(`No layers were selected for group "${groupName}"`);
        }
        
    } catch (error) {
        logger.error(`Failed to create group "${groupName}":`, error);
    }
}
/**
 * 모든 가이드와 Num 그룹을 제거하는 함수
 */
async function clearGuides() {
    try {
        await executeAsModal(async () => {
            // Num 그룹 제거
            await removeGroupByName('Num');
            
            // 모든 가이드 제거
            await clearAllGuides();
            
            logger.info('Cleared all guides and Num group');
            
        }, { commandName: 'Clear Guides' });
    } catch (error) {
        await handleError(error, 'clear_guides');
    }
}

/**
 * 특정 이름의 그룹을 제거하는 함수
 * @param {string} groupName - 제거할 그룹 이름
 */
async function removeGroupByName(groupName) {
    try {
        const doc = app.activeDocument;
        for (const layer of doc.layers) {
            if (layer.name === groupName && layer.kind === 'group') {
                await batchPlay([
                    {
                        _obj: "delete",
                        _target: [{ _ref: "layer", _id: layer.id }],
                        _options: { dialogOptions: "dontDisplay" }
                    }
                ], { synchronousExecution: true });
                logger.info(`Removed group: ${groupName}`);
                break;
            }
        }
    } catch (error) {
        logger.error(`Failed to remove group "${groupName}":`, error);
    }
}

/**
 * 모든 가이드를 제거하는 함수
 */
async function clearAllGuides() {
    try {
        await batchPlay([
            {
                _obj: "clearCanvasGuides",
                _isCommand: false
            }
        ], { synchronousExecution: true });
        
        logger.info('Cleared all guides');
    } catch (error) {
        logger.error('Failed to clear guides:', error);
        throw error;
    }
}

module.exports = {
    addGuide,
    addAllGuides,
    addGridNumbers,
    clearGuides
};