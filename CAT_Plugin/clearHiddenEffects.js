const app = require("photoshop").app;
const { executeAsModal } = require('photoshop').core;
const { batchPlay } = require("photoshop").action;
const { selectNoLays, selectByLayerID, getLayerInfo, clearLayerEffect } = require("./lib/lib_layer");

async function clearHiddenEffects() {
    try {
        await executeAsModal(async () => {
            const doc = app.activeDocument;
            const selectedLayers = doc.activeLayers;

            if (selectedLayers.length === 0) {
                console.log("No layers selected");
                return;
            }

            // 선택한 레이어들을 순회하면서 처리
            for (const layer of selectedLayers) {
                if (!layer.locked) {
                    console.log(`Processing layer: ${layer.name}`);
                    
                    // 현재 레이어 선택
                    await selectNoLays();
                    await selectByLayerID(layer.id);
                    
                    // 이펙트 처리
                    await clearEffectsPerLayer(layer);
                }
            }
        }, { commandName: "Clear Hidden Effects" });
    } catch (e) {
        console.error("Error in clearHiddenEffects:", e);
    }
}

async function clearEffectsPerLayer(layer) {
    try {
        // 레이어 정보 가져오기
        const layerInfo = await getLayerInfo(layer.id, app.activeDocument.id);
        if (!layerInfo[0].layerEffects) return;

        const layerEffects = layerInfo[0].layerEffects;
        const effectKeys = Object.keys(layerEffects);

        for (const key of effectKeys) {
            if (key.endsWith('Multi')) {
                // 멀티 이펙트 처리
                const multiEffects = layerEffects[key];
                if (Array.isArray(multiEffects)) {
                    // 배열을 역순으로 순회 (인덱스 문제 방지)
                    for (let i = multiEffects.length - 1; i >= 0; i--) {
                        const effect = multiEffects[i];
                        if (effect.enabled === false && effect.present === true) {
                            console.log(`Layer ${layer.name}: Removing disabled multi effect: ${effect._obj} at index ${i}`);
                            await clearLayerEffect(effect._obj, i, layer.id);
                        }
                    }
                }
            } else {
                // 단일 이펙트 처리
                const effect = layerEffects[key];
                if (effect.enabled === false && effect.present === true) {
                    console.log(`Layer ${layer.name}: Removing disabled effect: ${key}`);
                    await clearLayerEffect(key, 0, layer.id);
                }
            }
        }
    } catch (e) {
        console.error(`Error processing layer ${layer.name}:`, e);
    }
}

module.exports = {
    clearHiddenEffects
};