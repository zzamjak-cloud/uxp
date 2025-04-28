const app = require("photoshop").app;
const { executeAsModal } = require('photoshop').core;
const { batchPlay } = require("photoshop").action;
const { selectNoLays, selectByLayerID, getLayerInfo } = require("./lib/lib_layer");

async function clearSpecificEffect(effectType, index, layerId) {
    await executeAsModal(async () => {
        await batchPlay(
            [{
                _obj: "disableSingleFX",
                _target: [{
                    _ref: effectType,
                    _index: index
                }, {
                    _ref: "layer",
                    _id: layerId
                }],
                _options: {
                    dialogOptions: "dontDisplay"
                }
            }],
            { synchronousExecution: true }
        );
    }, { commandName: `Clear ${effectType} Effect` });
}

async function clearHiddenEffects() {
    try {
        await executeAsModal(async () => {
            const doc = app.activeDocument;
            const selectedLayers = doc.activeLayers;

            if (selectedLayers.length === 0) {
                console.log("No layers selected");
                return;
            }

            for (const layer of selectedLayers) {
                if (!layer.locked) {
                    console.log(`Processing layer: ${layer.name}`);
                    await selectNoLays();
                    await selectByLayerID(layer.id);
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
        const layerInfo = await getLayerInfo(layer.id, app.activeDocument.id);
        if (!layerInfo[0].layerEffects) return;

        const layerEffects = layerInfo[0].layerEffects;
        const effectKeys = Object.keys(layerEffects);

        for (const key of effectKeys) {
            if (key.endsWith('Multi')) {
                const multiEffects = layerEffects[key];
                if (Array.isArray(multiEffects)) {
                    const baseEffectType = key.replace('Multi', '');
                    
                    // 각 효과를 개별적으로 처리
                    for (let i = 0; i < multiEffects.length; i++) {
                        const effect = multiEffects[i];
                        if (effect.enabled === false && effect.present === true) {
                            console.log(`Removing ${baseEffectType} at index ${i}`);
                            try {
                                await clearSpecificEffect(baseEffectType, i, layer.id);
                            } catch (error) {
                                console.error(`Failed to remove ${baseEffectType} at index ${i}:`, error);
                            }
                        }
                    }
                }
            } else {
                // 단일 이펙트 처리
                const effect = layerEffects[key];
                if (effect.enabled === false && effect.present === true) {
                    console.log(`Removing single effect: ${key}`);
                    try {
                        await clearSpecificEffect(key, 0, layer.id);
                    } catch (error) {
                        console.error(`Failed to remove ${key}:`, error);
                    }
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