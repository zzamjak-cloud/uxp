const app = require("photoshop").app;
const { executeAsModal } = require('photoshop').core;
const { selectNoLays, selectByLayerID, getLayerInfo } = require("./lib/lib_layer");
const { showAlert } = require("./lib/lib");
const { setLayerEffects } = require("./lib/lib_effects");

/**
 * 모든 이펙트를 제거한 후 활성화된 이펙트들만 다시 적용하는 함수
 * @param {Object} layerEffects - 레이어 이펙트 객체
 * @param {Array} effectKeys - 이펙트 키 배열
 * @param {number} layerId - 레이어 ID
 */
async function clearLayerStyleAndReapplyEnabled(layerEffects, effectKeys, layerId) {
    try {
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
                    }
                }
            } else {
                // 단일 이펙트 처리 - 활성화된 것만 포함
                if (effectData && effectData.enabled === true && effectData.present === true) {
                    newLayerEffects[key] = effectData;
                }
            }
        }
        
        // 2. 새로운 layerEffects로 설정
        const success = await setLayerEffects(newLayerEffects, layerId);
        if (!success) {
            throw new Error("layerEffects 설정에 실패했습니다.");
        }
        
    } catch (error) {
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
            console.log(`${layer.name}: 비활성화된 이펙트가 없습니다.`);
            return;
        }
        
        // 활성화된 이펙트들만 유지하여 새로운 layerEffects 설정
        await clearLayerStyleAndReapplyEnabled(layerEffects, effectKeys, layer.id);
        
    } catch (error) {
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
            await showAlert('선택된 레이어가 없습니다.');
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
                    console.log(`${layer.name}:`, layerError);
                    errorCount++;
                    // 개별 레이어 오류는 무시하고 계속 진행
                    continue;
                }
            }

            // 선택 해제
            await selectNoLays();

        }, { commandName: "Clear Hidden Effects" });
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    clearHiddenEffects,
};