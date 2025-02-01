const app = require("photoshop").app;
const { executeAsModal } = require('photoshop').core;
const { moveLayerTarget } = require("./lib/lib_layer");

async function sortingLayer() {

    try {
        const doc = app.activeDocument;
        const layers = doc.layers;
        
        await sortLayers(layers);
        
    } catch (e) {
        console.log(e.message);
    }
}

async function pickSortingLayer() {
    try {
        const doc = app.activeDocument;
        const active_layers = doc.activeLayers;

        await sortLayers(active_layers);
        
    } catch (e) {
        console.log(e.message);
    }
}

async function sortLayers(layers) {
    const layerBuffer = []; // 레이어만 추출
    const groupBuffer = []; // 그룹만 추출

    for (const layer of layers) {
        if (!layer.isBackgroundLayer && layer.kind !== 'group') {
            layerBuffer.push(layer);
        } else if (layer.kind === 'group' && layer.layers.length > 0) {
            groupBuffer.push(layer);
        }
    }

    // 이름순으로 정렬하기
    layerBuffer.sort((a, b) => a.name.localeCompare(b.name));
    groupBuffer.sort((a, b) => a.name.localeCompare(b.name));

    // 레이어만 하단으로 정렬
    for (const layer of layerBuffer) {
        await executeAsModal(() => moveLayerTarget(layer, layerBuffer[layerBuffer.length-1], "placeBefore"));
    }

    // 그룹만 상단으로 정렬하고 재귀 함수 실행
    for (const group of groupBuffer) {
        await executeAsModal(() => moveLayerTarget(group, layerBuffer[0], "placeBefore"));
        await sortLayers(group.layers);
    }
}

module.exports = {
    sortingLayer,
    pickSortingLayer
};