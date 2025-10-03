const app = require('photoshop').app;
const { executeAsModal } = require('photoshop').core;
const { selectLayerByName, setLayerName, deleteLayer, layerTranslate, layerTrim, actionCommands } = require('./lib/lib_layer');
const { executeModalWithHistoryGrouping } = require('./lib/lib');
const { rectangularMarqueeTool } = require('./lib/lib_tool');
const { handleError } = require('./lib/errorHandler');
const { Logger } = require('./lib/logger');
const { COMMAND, GUIDE } = require('./lib/constants');

const logger = new Logger('PatchMaker');

const PATCH_TYPES = {
    VERTICAL: 'vertical',           // 수직 2개
    HORIZONTAL: 'horizontal',       // 수평 2개
    ALL: 'all',                    // 수직 2개, 수평 2개
    VERTICAL_SYMMETRY: 'v_sym',    // 수직 1개 (대칭)
    HORIZONTAL_SYMMETRY: 'h_sym',  // 수평 1개 (대칭)
    ALL_SYMMETRY: 'all_sym',       // 수직 1개, 수평 1개 (모두 대칭)
    MIXED_V2H1: 'mixed_v2h1',     // 수직 2개, 수평 1개
    MIXED_V1H2: 'mixed_v1h2'      // 수직 1개, 수평 2개
};

// 패치 타입 분석
function analyzePatchType(vCount, hCount) {
    if (vCount === 2 && hCount === 2) return PATCH_TYPES.ALL;
    if (vCount === 2 && hCount === 0) return PATCH_TYPES.VERTICAL;
    if (vCount === 0 && hCount === 2) return PATCH_TYPES.HORIZONTAL;
    if (vCount === 1 && hCount === 0) return PATCH_TYPES.VERTICAL_SYMMETRY;
    if (vCount === 0 && hCount === 1) return PATCH_TYPES.HORIZONTAL_SYMMETRY;
    if (vCount === 1 && hCount === 1) return PATCH_TYPES.ALL_SYMMETRY;
    if (vCount === 2 && hCount === 1) return PATCH_TYPES.MIXED_V2H1;
    if (vCount === 1 && hCount === 2) return PATCH_TYPES.MIXED_V1H2;
    
    throw new Error(`유효하지 않은 가이드 구성입니다. 현재 가이드: 수직 ${vCount}개, 수평 ${hCount}개`);
}

// 선택 영역 생성 및 잘라내기
async function createSelectionAndCut(top, left, bottom, right, layerName) {
    try {
        await selectLayerByName("Source");
        await rectangularMarqueeTool(top, left, bottom, right);
        await actionCommands(COMMAND.CUT_TO_LAYER);
        await setLayerName(layerName);
    } catch (error) {
        throw new Error(`Failed to process ${layerName}: ${error.message}`);
    }
}

// 수직 패치 (내부 함수 - executeAsModal 없음)
async function applyVerticalPatchInternal(v1, v2, bounds) {
    const { top, left, bottom, right } = bounds;
    
    await createSelectionAndCut(top, left, bottom, v1, "left");
    await createSelectionAndCut(top, v2, bottom, right, "right");
    
    await selectLayerByName("Source");
    await deleteLayer();
    await selectLayerByName("right");
    await layerTranslate(app.activeDocument.activeLayers[0], -(v2-v1), 0);
    await actionCommands(COMMAND.MERGE_VISIBLE);
    await layerTrim();
    await setLayerName("Source");
}

// 수평 패치 (내부 함수 - executeAsModal 없음)
async function applyHorizontalPatchInternal(h1, h2, bounds) {
    const { top, left, bottom, right } = bounds;
    
    await createSelectionAndCut(top, left, h1, right, "top");
    await createSelectionAndCut(h2, left, bottom, right, "bottom");
    
    await selectLayerByName("Source");
    await deleteLayer();
    await selectLayerByName("bottom");
    await layerTranslate(app.activeDocument.activeLayers[0], 0, -(h2-h1));
    await actionCommands(COMMAND.MERGE_VISIBLE);
    await layerTrim();
    await setLayerName("Source");
}

// 수직 + 수평 패치 (내부 함수 - executeAsModal 없음)
async function applyAllPatchInternal(v1, v2, h1, h2, bounds) {
    await applyVerticalPatchInternal(v1, v2, bounds);
    
    const currentLayer = app.activeDocument.layers[0];
    const newBounds = {
        top: currentLayer.bounds._top,
        left: currentLayer.bounds._left,
        bottom: currentLayer.bounds._bottom,
        right: currentLayer.bounds._right
    };
    
    await applyHorizontalPatchInternal(h1, h2, newBounds);
}

// 가이드 얻기
function getGuides(guides) {
    const verticalGuides = [];
    const horizontalGuides = [];

    for (const guide of guides) {
        const coordinate = parseInt(guide.coordinate);
        guide.direction === GUIDE.ORIENTATIONS.VERTICAL ? 
            verticalGuides.push(coordinate) : 
            horizontalGuides.push(coordinate);
    }

    return [
        verticalGuides.sort((a, b) => a - b),
        horizontalGuides.sort((a, b) => a - b)
    ];
}

// Symmetry 가이드 계산
function calculateSymmetricGuides(guide, size) {
    const center = size / 2;
    return guide < center ? 
        [guide, size - guide] : 
        [size - guide, guide];
}

// 패치 함수
async function patchMaker() {
    try {
        const doc = app.activeDocument;
        const guides = doc.guides;

        if (guides.length === 0) {
            throw new Error('가이드가 없습니다. 패치 메이커를 실행하기 전에 가이드를 추가해주세요.');
        }

        // 초기 설정은 별도로 처리 (히스토리 그룹핑 외부)
        await executeAsModal(async () => {
            await selectLayerByName(doc.layers[0].name);
            await setLayerName("Source");
            await layerTrim();
        });

        const layer = doc.layers[0];
        const bounds = {
            top: layer.bounds._top,
            left: layer.bounds._left,
            bottom: layer.bounds._bottom,
            right: layer.bounds._right
        };

        const [verticalGuides, horizontalGuides] = getGuides(guides);
        const patchType = analyzePatchType(verticalGuides.length, horizontalGuides.length);
        logger.info(`Applying patch type: ${patchType}`);

        // 모든 패치 작업을 하나의 히스토리로 그룹핑
        await executeModalWithHistoryGrouping(
            async (context) => {
                switch (patchType) {
                    case PATCH_TYPES.ALL:
                        await applyAllPatchInternal(verticalGuides[0], verticalGuides[1], horizontalGuides[0], horizontalGuides[1], bounds);
                        break;
                        
                    case PATCH_TYPES.VERTICAL:
                        await applyVerticalPatchInternal(verticalGuides[0], verticalGuides[1], bounds);
                        break;
                        
                    case PATCH_TYPES.HORIZONTAL:
                        await applyHorizontalPatchInternal(horizontalGuides[0], horizontalGuides[1], bounds);
                        break;
                        
                    case PATCH_TYPES.VERTICAL_SYMMETRY: {
                        const [v1, v2] = calculateSymmetricGuides(verticalGuides[0], bounds.right - bounds.left);
                        await applyVerticalPatchInternal(v1, v2, bounds);
                        break;
                    }
                        
                    case PATCH_TYPES.HORIZONTAL_SYMMETRY: {
                        const [h1, h2] = calculateSymmetricGuides(horizontalGuides[0], bounds.bottom - bounds.top);
                        await applyHorizontalPatchInternal(h1, h2, bounds);
                        break;
                    }
                        
                    case PATCH_TYPES.ALL_SYMMETRY: {
                        const [v1, v2] = calculateSymmetricGuides(verticalGuides[0], bounds.right - bounds.left);
                        const [h1, h2] = calculateSymmetricGuides(horizontalGuides[0], bounds.bottom - bounds.top);
                        await applyAllPatchInternal(v1, v2, h1, h2, bounds);
                        break;
                    }
                        
                    case PATCH_TYPES.MIXED_V2H1: {
                        const [h1, h2] = calculateSymmetricGuides(horizontalGuides[0], bounds.bottom - bounds.top);
                        await applyAllPatchInternal(verticalGuides[0], verticalGuides[1], h1, h2, bounds);
                        break;
                    }
                        
                    case PATCH_TYPES.MIXED_V1H2: {
                        const [v1, v2] = calculateSymmetricGuides(verticalGuides[0], bounds.right - bounds.left);
                        await applyAllPatchInternal(v1, v2, horizontalGuides[0], horizontalGuides[1], bounds);
                        break;
                    }
                }

                // 가이드 제거
                await actionCommands(COMMAND.CLEAR_ALL_GUIDES);
            },
            "패치 메이커",  // 히스토리 이름
            "Patch Maker"  // 명령 이름
        );

    } catch (error) {
        await handleError(error, 'patch_maker');
    }
}

module.exports = {
    patchMaker
};