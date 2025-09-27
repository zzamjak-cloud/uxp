const app = require("photoshop").app;
const { executeAsModal } = require('photoshop').core;
const { batchPlay } = require("photoshop").action;
const { makeGuide, clearAllGuides } = require('./lib/lib_guide');
const { layerTranslate, selectNoLays, selectByLayerID, addSelectLayer, makeGroupFromSelectLayers, deleteLayerByID} = require('./lib/lib_layer');
const { handleError } = require('./lib/errorHandler');
const { createTextLayer, setTextContent } = require('./lib/lib_text');
const { Logger } = require('./lib/logger');

const logger = new Logger('AddGuide');

// 개별 가이드 추가
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
// 모든 가이드 추가
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
                    
                    const centerX = (cellLeft + cellRight) * 0.5;
                    const centerY = (cellTop + cellBottom) * 0.5 + 6;
                    
                    const layerId = await createTextLayerReliable(number.toString(), centerX, centerY, rows, cols);
                    if (layerId) {
                        textLayerIds.push(layerId);
                    }
                    number++;
                }
            }
            
            // 'Num' 그룹 생성
            if (textLayerIds.length > 0) {
                await createGroupFromLayers(textLayerIds, 'Num');
            }
            
            logger.info(`Created ${number} grid number texts in ${rows}x${cols} grid`);
            
        }, { commandName: 'Add All Guides' });
    } catch (error) {
        console.error('Error adding all guides:', error);
    }
}
// 안정적인 텍스트 레이어 생성 함수
async function createTextLayerReliable(text, x, y, rows, cols) {
    try {
        const doc = app.activeDocument;
        
        // 1. 텍스트 레이어 생성 (rows에 따라 텍스트 사이즈 설정)
        if (rows < 10) {
            await createTextLayer(text, x, y, "Arial-BoldMT", 30, 0, 0, 0, "center");
        } else if (rows > 30) {
            await createTextLayer(text, x, y, "Arial-BoldMT", 14, 0, 0, 0, "center");
        } else {
            await createTextLayer(text, x, y, "Arial-BoldMT", 18, 0, 0, 0, "center");
        }

        // 2. 생성 직후 약간의 지연
        // await new Promise(resolve => setTimeout(resolve, 50));

        // 3. 활성 레이어가 텍스트 레이어인지 확인하고 TextContent 설정
        let createdLayer = doc.activeLayer;
        if (createdLayer && createdLayer.kind === 'text') {
            const layerId = createdLayer.id;
            
            try { await setTextContent(text); } 
            catch (nameError) { logger.warn(`Failed to set layer name: ${nameError.message}`); }
            
            return layerId;
        }

        // 5. 활성화된 레이어가 텍스트 레이어인지 확인후 layerID 추출
        if (doc.layers.length > 0 && doc.layers[0].kind === 'text') {
            const layerId = doc.layers[0].id;
            return layerId;
        }
        return null;

    } catch (error) {
        logger.error(`Failed to create text layer "${text}":`, error);
        return null;
    }
}
// 전체 그리드 번호 추가
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
// 안전한 그룹 생성 방식 - 레이어들을 선택한 후 그룹으로 만들기
async function createGroupFromLayers(layerIds, groupName) {
    try {
        const doc = app.activeDocument;
        
        // 1. 모든 선택 해제
        await selectNoLays();
        
        // 2. 유효한 레이어들만 선택
        let selectedCount = 0;
        for (const layerId of layerIds) {
            if (!layerId) continue;
            
            try {
                if (selectedCount === 0) {
                    await selectByLayerID(layerId);  // 첫 번째 레이어 선택
                } else {
                    await addSelectLayer(layerId, layerIds);  // 추가 선택
                }
                selectedCount++;

            } catch (selectError) {
                logger.warn(`Failed to select layer ${layerId}: ${selectError.message}`);
            }
        }
        
        // 3. 선택된 레이어들로 그룹 생성
        if (selectedCount > 0) {
            await makeGroupFromSelectLayers(groupName);
        } else {
            logger.warn(`No layers were selected for group "${groupName}"`);
        }
        
    } catch (error) {
        logger.error(`Failed to create group "${groupName}":`, error);
    }
}

// 모든 가이드와 Num 그룹을 제거하는 함수
async function clearGuides() {
    try {
        await executeAsModal(async () => {

            await removeGroupByName('Num'); // Num 그룹 제거
            await clearAllGuides(); // 모든 가이드 제거
            
        }, { commandName: 'Clear Guides' });
    } catch (error) {
        await handleError(error, 'clear_guides');
    }
}
// 특정 이름의 그룹을 제거하는 함수
async function removeGroupByName(groupName) {
    try {
        const doc = app.activeDocument;
        for (const layer of doc.layers) {
            if (layer.name === groupName && layer.kind === 'group') {
                await deleteLayerByID(layer.id);
                break;
            }
        }
    } catch (error) {
        logger.error(`Failed to remove group "${groupName}":`, error);
    }
}

module.exports = {
    addGuide,
    addAllGuides,
    addGridNumbers,
    clearGuides
};