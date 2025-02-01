const app = require("photoshop").app;
const { executeAsModal } = require('photoshop').core;
const { batchPlay } = require("photoshop").action;
const { selectNoLays, selectByLayerID, getLayerInfo, clearLayerEffect, reorderEffect } = require("./lib/lib_layer");

async function clearHiddenEffects() {
    try {
        const doc = app.activeDocument;
        const actLays = doc.activeLayers;
        
        // 선택한 레이어를 하나씬 순회하면서 "clearEffectPorLayer" 처리
        for (const layer of actLays) {
            console.log(layer.name);
            if (layer.locked === false) {
                await executeAsModal(async() => {
                    await selectNoLays();
                    await selectByLayerID(layer.id);
                },{})
                await clearEffectsPerLayer(doc, layer);
            }
        }
    } catch (e) {
        console.log(e.message);
    }
}

async function clearEffectsPerLayer(doc, layer) {
    const layerInfo = await executeAsModal(() => getLayerInfo(layer.id, doc.id), {});
    const layer_effects = layerInfo[0].layerEffects;
    const layer_effects_keys = Object.keys(layer_effects);

    // present = true && enabled = false 인 이펙트들을 제거
    // multi 타입의 이펙트들은 따로 체크해서 제거 
    for (const key of layer_effects_keys) {
        if (key === 'dropShadowMulti') {
            await checkMultiEffects(layer_effects[key], layer.id);
        } 
        else if (key === 'innerShadowMulti') {
            await checkMultiEffects(layer_effects[key], layer.id);
        } 
        else if (key === 'solidFillMulti') {
            await checkMultiEffects(layer_effects[key], layer.id);
        } 
        else if (key === 'gradientFillMulti') {
            await checkMultiEffects(layer_effects[key], layer.id);
        } 
        else if (key === 'frameFXMulti') {
            await checkMultiEffects(layer_effects[key], layer.id);
        } 
        else {
            if (layer_effects[key].enabled === false && layer_effects[key].present === true) {
                console.log(`${key} : false`);
                await executeAsModal(async() => {
                    await reorderEffect(key, 1, 0);
                    await clearLayerEffect(key, 1, layer.id)
                }, {});
            }
        }
    }
}

// multi 타입인 이펙트을에 대한 처리
async function checkMultiEffects(layer_effects_key, layerID) {
    for (let idx = 0; idx < layer_effects_key.length; idx++) {
        if (layer_effects_key[idx].enabled === false && layer_effects_key[idx].present === true) {
            console.log(`인덱스(${idx}) ${layer_effects_key[idx]._obj} : false`);
            await executeAsModal(async () => {
                await reorderEffect(layer_effects_key[idx]._obj, idx, 0);
                await clearLayerEffect(layer_effects_key[idx]['_obj'], 1, layerID);
            }, {});
        }
    }
}


module.exports = {
    clearHiddenEffects
}
