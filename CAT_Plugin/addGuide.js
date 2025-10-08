const app = require("photoshop").app;
const { executeAsModal } = require('photoshop').core;
const { batchPlay } = require("photoshop").action;
const { makeGuide, clearAllGuides } = require('./lib/lib_guide');
const { selectNoLays, selectByLayerID, addSelectLayer, makeGroupFromSelectLayers, deleteLayerByName, mergeLayers} = require('./lib/lib_layer');
const { handleError } = require('./lib/errorHandler');
const constants = require('./lib/constants');
const { Logger } = require('./lib/logger');

const logger = new Logger('AddGuide');

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
                await makeGuide(position, constants.GUIDE.ORIENTATIONS.HORIZONTAL);
            }
            
            // 수직 가이드 생성 (열)
            const sectionWidth = doc.width / cols;
            for (let i = 1; i < cols; i++) {
                const position = sectionWidth * i;
                await makeGuide(position, constants.GUIDE.ORIENTATIONS.VERTICAL);
            }
            
            // Num 생성 여부 확인
            const generateNumbers = document.getElementById('generateNumbers')?.checked ?? true;
            
            if (generateNumbers) {
                // *** 배치 처리로 최적화된 텍스트 레이어 생성 ***
                const textLayerIds = await createTextLayersBatch(rows, cols, sectionWidth, sectionHeight);
                
                // 'Num' 그룹 생성 후 merge하여 일반 레이어로 변경
                if (textLayerIds.length > 0) {
                    await createGroupFromLayers(textLayerIds, 'Num');
                    await mergeLayers();
                }
            }
            
            if (generateNumbers) {
                logger.info(`Created ${textLayerIds.length} grid number texts in ${rows}x${cols} grid`);
            } else {
                logger.info(`Created guides only (numbers disabled) in ${rows}x${cols} grid`);
            }
            
        }, { commandName: 'Add All Guides' });
    } catch (error) {
        console.error('Error adding all guides:', error);
    }
}
// 배치 처리로 텍스트 레이어들을 생성하는 함수 (return : textLayerIds)
async function createTextLayersBatch(rows, cols, sectionWidth, sectionHeight) {
    try {
        const doc = app.activeDocument;
        
        // 텍스트 크기 결정 (그리드 크기에 따라)
        let fontSize = 18;
        if (rows < 10) {
            fontSize = 30;
        } else if (rows > 30) {
            fontSize = 14;
        }
        
        // 배치 처리를 위한 명령 배열 생성
        const batchCommands = [];
        let number = 0;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // 그리드 셀의 정확한 중앙 위치 계산
                const cellLeft = col * sectionWidth;
                const cellTop = row * sectionHeight;
                const cellRight = cellLeft + sectionWidth;
                const cellBottom = cellTop + sectionHeight;
                
                const centerX = (cellLeft + cellRight) * 0.5;
                const centerY = (cellTop + cellBottom) * 0.5 + 6;
                
                // 텍스트 레이어 생성 명령 추가
                batchCommands.push({
                    _obj: "make",
                    _target: [
                        {
                            _ref: "textLayer"
                        }
                    ],
                    using: {
                        _obj: "textLayer",
                        textKey: number.toString(),
                        textShape: [
                            {
                                _obj: "textShape",
                                transform: {
                                    _obj: "transform",
                                    xx: 1,
                                    xy: 0,
                                    yx: 0,
                                    yy: 1,
                                    tx: centerX,
                                    ty: centerY
                                }
                            }
                        ],
                        textStyleRange: [
                            {
                                _obj: "textStyleRange",
                                from: 0,
                                to: number.toString().length,
                                textStyle: {
                                    _obj: "textStyle",
                                    fontPostScriptName: "Arial-BoldMT",
                                    fontName: "Arial-BoldMT",
                                    size: {
                                        _unit: "pointsUnit",
                                        _value: fontSize
                                    },
                                    color: {
                                        _obj: "RGBColor",
                                        red: 0,
                                        grain: 0,
                                        blue: 0
                                    }
                                }
                            }
                        ],
                        paragraphStyleRange: [
                            {
                                _obj: "paragraphStyleRange",
                                from: 0,
                                to: number.toString().length,
                                paragraphStyle: {
                                    _obj: "paragraphStyle",
                                    align: {
                                        _enum: "alignmentType",
                                        _value: "center"
                                    }
                                }
                            }
                        ]
                    },
                    layerID: 1,
                    _options: {
                        dialogOptions: "dontDisplay"
                    }
                });
                
                number++;
            }
        }
        
        // 배치로 모든 텍스트 레이어 생성
        await batchPlay(batchCommands, {});
        
        // 생성된 텍스트 레이어들의 ID 수집
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const textLayerIds = [];
        for (const layer of doc.layers) {
            if (layer.kind === 'text') {
                textLayerIds.push(layer.id);
            }
        }
        return textLayerIds;
        
    } catch (error) {
        logger.error('Failed to create text layers in batch:', error);
        return [];
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

// 모든 가이드와 Num 레이어를 제거하는 함수
async function clearGuides() {
    try {
        await executeAsModal(async () => {

            await deleteLayerByName('Num'); // Num 레이어 제거
            await clearAllGuides(); // 모든 가이드 제거
            
        }, { commandName: 'Clear Guides' });
    } catch (error) {
        await handleError(error, 'clear_guides');
    }
}

module.exports = {
    addAllGuides,
    clearGuides
};