const app = require("photoshop").app;
const { executeAsModal } = require('photoshop').core;
const { batchPlay } = require('photoshop').action;
const { selectionForLayer, selectNoLays, selectByLayerID } = require("./lib/lib_layer");
const { makeWorkPath } = require("./lib/lib_shape");

async function convertImageToPath() {
    try {
        console.log("Convert Image To Path!!");
        const doc = app.activeDocument;
        const selectedLayers = doc.activeLayers;

        if (selectedLayers.length === 0) {
            throw new Error("선택한 레이어가 없습니다.");
        }

        await executeAsModal(async () => {
            for (const layer of selectedLayers) {
                // 현재 레이어 선택
                await selectNoLays();
                await selectByLayerID(layer.id);

                // 레이어의 투명도 기반 선택 영역 생성
                await selectionForLayer();

                // 선택 영역을 Work Path로 변환
                await makeWorkPath(1.0);
            }
        });

    } catch (e) {
        console.log(e.message);
    }
}

module.exports = {
    convertImageToPath
};