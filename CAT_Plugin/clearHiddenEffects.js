const app = require("photoshop").app;
const { executeAsModal } = require('photoshop').core;
const { batchPlay } = require("photoshop").action;
const { selectNoLays, selectByLayerID, getLayerInfo } = require("./lib/lib_layer");
const { handleError } = require("./lib/errorHandler");
const { Logger } = require("./lib/logger");

const logger = new Logger('ClearHiddenEffects');

/**
 * 모든 이펙트를 제거한 후 활성화된 이펙트들만 다시 적용하는 함수
 * @param {Object} layerEffects - 레이어 이펙트 객체
 * @param {Array} effectKeys - 이펙트 키 배열
 * @param {number} layerId - 레이어 ID
 */
async function clearLayerStyleAndReapplyEnabled(layerEffects, effectKeys, layerId) {
    try {
        logger.info(`Clearing disabled effects and keeping only enabled ones`);
        
        // 1. 활성화된 이펙트들만으로 새로운 layerEffects 객체 생성
        const newLayerEffects = {
            _obj: "layerEffects"
        };
        
        // scale은 항상 포함 (기본값)
        if (layerEffects.scale) {
            newLayerEffects.scale = layerEffects.scale;
        }
        
        for (const key of effectKeys) {
            const effectData = layerEffects[key];
            
            if (key.endsWith('Multi')) {
                // Multi 이펙트 처리 - 활성화된 것들만 필터링
                if (Array.isArray(effectData)) {
                    const enabledMultiEffects = effectData.filter(effect => 
                        effect && effect.enabled === true && effect.present === true
                    );
                    
                    if (enabledMultiEffects.length > 0) {
                        newLayerEffects[key] = enabledMultiEffects;
                        logger.info(`Preserved ${enabledMultiEffects.length} enabled ${key.replace('Multi', '')} effects`);
                    }
                }
            } else {
                // 단일 이펙트 처리 - 활성화된 것만 포함
                if (effectData && effectData.enabled === true && effectData.present === true) {
                    newLayerEffects[key] = effectData;
                    logger.info(`Preserved enabled ${key} effect`);
                }
            }
        }
        
        // 2. 새로운 layerEffects로 설정
        await setLayerEffects(newLayerEffects, layerId);
        logger.info(`Successfully updated layer effects`);
        
    } catch (error) {
        logger.error(`Error in clearLayerStyleAndReapplyEnabled:`, error);
        throw error;
    }
}

/**
 * layerEffects를 설정하는 함수 (포토샵 리스너 방식)
 * @param {Object} layerEffects - 설정할 layerEffects 객체
 * @param {number} layerId - 레이어 ID
 */
async function setLayerEffects(layerEffects, layerId) {
    try {
        await batchPlay(
            [{
                _obj: "set",
                _target: [{
                    _ref: "property",
                    _property: "layerEffects"
                }, {
                    _ref: "layer",
                    _id: layerId
                }],
                to: layerEffects,
                _options: {
                    dialogOptions: "dontDisplay"
                }
            }],
            { synchronousExecution: true }
        );
    } catch (error) {
        logger.error(`Failed to set layer effects:`, error);
        throw error;
    }
}


/**
 * 레이어의 숨겨진 이펙트들을 제거하는 함수
 * @param {Object} layer - 포토샵 레이어 객체
 */
async function clearEffectsPerLayer(layer) {
    try {
        // 레이어 선택
        await selectByLayerID(layer.id);
        
        // 레이어 정보 가져오기
        const layerInfo = await getLayerInfo(layer.id, app.activeDocument.id);
        
        if (!layerInfo || !layerInfo[0] || !layerInfo[0].layerEffects) {
            return;
        }

        const layerEffects = layerInfo[0].layerEffects;
        const effectKeys = Object.keys(layerEffects);

        // 비활성화된 이펙트가 있는지 확인
        const hasDisabledEffects = hasDisabledEffectsInLayer(layerEffects, effectKeys);
        
        if (!hasDisabledEffects) {
            logger.info(`No disabled effects found on layer: ${layer.name}`);
            return;
        }
        
        // 활성화된 이펙트들만 유지하여 새로운 layerEffects 설정
        await clearLayerStyleAndReapplyEnabled(layerEffects, effectKeys, layer.id);
        
    } catch (error) {
        logger.error(`Error processing layer ${layer.name}:`, error);
        throw error;
    }
}

/**
 * 레이어에 비활성화된 이펙트가 있는지 확인하는 함수
 * @param {Object} layerEffects - 레이어 이펙트 객체
 * @param {Array} effectKeys - 이펙트 키 배열
 * @returns {boolean} 비활성화된 이펙트 존재 여부
 */
function hasDisabledEffectsInLayer(layerEffects, effectKeys) {
    for (const key of effectKeys) {
        const effectData = layerEffects[key];
        
        if (key.endsWith('Multi')) {
            // Multi 이펙트 처리
            if (Array.isArray(effectData)) {
                for (const effect of effectData) {
                    if (effect && effect.enabled === false && effect.present === true) {
                        return true;
                    }
                }
            }
        } else {
            // 단일 이펙트 처리
            if (effectData && effectData.enabled === false && effectData.present === true) {
                return true;
            }
        }
    }
    
    return false;
}


/**
 * 메인 함수: 선택된 레이어들의 숨겨진 이펙트들을 제거
 */
async function clearHiddenEffects() {
    try {
        const doc = app.activeDocument;
        const selectedLayers = doc.activeLayers;

        if (selectedLayers.length === 0) {
            logger.warn('No layers selected');
            await app.showAlert('선택된 레이어가 없습니다.');
            return;
        }

        await executeAsModal(async () => {
            let processedCount = 0;
            let errorCount = 0;

            for (const layer of selectedLayers) {
                try {
                    // 잠긴 레이어는 건너뛰기
                    if (layer.locked) {
                        continue;
                    }

                    await clearEffectsPerLayer(layer);
                    processedCount++;
                    
                } catch (layerError) {
                    logger.error(`Error processing layer ${layer.name}:`, layerError);
                    errorCount++;
                    // 개별 레이어 오류는 무시하고 계속 진행
                    continue;
                }
            }

            // 선택 해제
            await selectNoLays();

        }, { commandName: "Clear Hidden Effects" });
    } catch (error) {
        await handleError(error, 'clear_hidden_effects');
    }
}

module.exports = {
    clearHiddenEffects,
};