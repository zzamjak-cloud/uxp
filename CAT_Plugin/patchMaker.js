const app = require('photoshop').app;
const { executeAsModal } = require('photoshop').core;
const { selectLayerByName, setLayerName, deleteLayer, layerTranslate, layerTrim, actionCommands } = require('./lib/lib_layer');
const { rectangularMarqueeTool } = require('./lib/lib_tool');
const { handleError } = require('./lib/errorHandler');
const { Logger } = require('./lib/logger');

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

async function createSelectionAndCut(top, left, bottom, right, layerName) {
    try {
        await selectLayerByName("Source");
        await rectangularMarqueeTool(top, left, bottom, right);
        await actionCommands("cutToLayer");
        await setLayerName(layerName);
        logger.info(`Created layer: ${layerName}`);
    } catch (error) {
        throw new Error(`Failed to process ${layerName}: ${error.message}`);
    }
}

// 수직 패치
async function applyVerticalPatch(v1, v2, bounds) {
    const { top, left, bottom, right } = bounds;
    
    await executeAsModal(async () => {
        await createSelectionAndCut(top, left, bottom, v1, "left");
    });

    await executeAsModal(async () => {
        await createSelectionAndCut(top, v2, bottom, right, "right");
    });

    await executeAsModal(async () => {
        await selectLayerByName("Source");
        await deleteLayer();
        await selectLayerByName("right");
        await layerTranslate(app.activeDocument.activeLayers[0], -(v2-v1), 0);
        await actionCommands("mergeVisible");
        await layerTrim();
        await setLayerName("Source");
    });
}

// 수평 패치
async function applyHorizontalPatch(h1, h2, bounds) {
    const { top, left, bottom, right } = bounds;
    
    await executeAsModal(async () => {
        await createSelectionAndCut(top, left, h1, right, "top");
    });

    await executeAsModal(async () => {
        await createSelectionAndCut(h2, left, bottom, right, "bottom");
    });

    await executeAsModal(async () => {
        await selectLayerByName("Source");
        await deleteLayer();
        await selectLayerByName("bottom");
        await layerTranslate(app.activeDocument.activeLayers[0], 0, -(h2-h1));
        await actionCommands("mergeVisible");
        await layerTrim();
        await setLayerName("Source");
    });
}

// 수직 + 수평 패치
async function applyAllPatch(v1, v2, h1, h2, bounds) {
    await applyVerticalPatch(v1, v2, bounds);
    
    const currentLayer = app.activeDocument.layers[0];
    const newBounds = {
        top: currentLayer.bounds._top,
        left: currentLayer.bounds._left,
        bottom: currentLayer.bounds._bottom,
        right: currentLayer.bounds._right
    };
    
    await applyHorizontalPatch(h1, h2, newBounds);
}

// 가이드 얻기
function getGuides(guides) {
    const verticalGuides = [];
    const horizontalGuides = [];

    for (const guide of guides) {
        const coordinate = parseInt(guide.coordinate);
        guide.direction === "vertical" ? 
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

        switch (patchType) {
            case PATCH_TYPES.ALL:
                await applyAllPatch(verticalGuides[0], verticalGuides[1], horizontalGuides[0], horizontalGuides[1], bounds);
                break;
                
            case PATCH_TYPES.VERTICAL:
                await applyVerticalPatch(verticalGuides[0], verticalGuides[1], bounds);
                break;
                
            case PATCH_TYPES.HORIZONTAL:
                await applyHorizontalPatch(horizontalGuides[0], horizontalGuides[1], bounds);
                break;
                
            case PATCH_TYPES.VERTICAL_SYMMETRY: {
                const [v1, v2] = calculateSymmetricGuides(verticalGuides[0], bounds.right - bounds.left);
                await applyVerticalPatch(v1, v2, bounds);
                break;
            }
                
            case PATCH_TYPES.HORIZONTAL_SYMMETRY: {
                const [h1, h2] = calculateSymmetricGuides(horizontalGuides[0], bounds.bottom - bounds.top);
                await applyHorizontalPatch(h1, h2, bounds);
                break;
            }
                
            case PATCH_TYPES.ALL_SYMMETRY: {
                const [v1, v2] = calculateSymmetricGuides(verticalGuides[0], bounds.right - bounds.left);
                const [h1, h2] = calculateSymmetricGuides(horizontalGuides[0], bounds.bottom - bounds.top);
                await applyAllPatch(v1, v2, h1, h2, bounds);
                break;
            }
                
            case PATCH_TYPES.MIXED_V2H1: {
                const [h1, h2] = calculateSymmetricGuides(horizontalGuides[0], bounds.bottom - bounds.top);
                await applyAllPatch(verticalGuides[0], verticalGuides[1], h1, h2, bounds);
                break;
            }
                
            case PATCH_TYPES.MIXED_V1H2: {
                const [v1, v2] = calculateSymmetricGuides(verticalGuides[0], bounds.right - bounds.left);
                await applyAllPatch(v1, v2, horizontalGuides[0], horizontalGuides[1], bounds);
                break;
            }
        }

        await executeAsModal(() => actionCommands("clearAllGuides"));

    } catch (error) {
        await handleError(error, 'patch_maker');
    }
}

module.exports = {
    patchMaker
};