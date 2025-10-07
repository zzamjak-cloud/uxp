const app = require("photoshop").app;
const { executeAsModal } = require('photoshop').core;
const { batchPlay } = require('photoshop').action;
const { selectionForLayer, selectNoLays, selectByLayerID } = require("./lib/lib_layer");
const { deleteWorkPath, getWorkPath, makeWorkPath, selectPathByName, createShapeFromPathContents } = require("./lib/lib_shape");
const { fillColor, getForegroundRGBColor } = require("./lib/lib_tool");
const { FILL_COLOR } = require("./lib/constants");

async function convertImageToPath() {
    try {
        const doc = app.activeDocument;
        const selectedLayer = doc.activeLayers[0];

        if (selectedLayer === undefined) {
            throw new Error("선택한 레이어가 없습니다.");
        }

        await executeAsModal(async () => {

            // 현재 레이어 선택
            await selectNoLays();
            await selectByLayerID(selectedLayer.id);

            // 레이어의 투명도 기반 선택 영역 생성
            await selectionForLayer();

            // 선택 영역을 Work Path로 변환
            await makeWorkPath(1.0);

            // ⭐ Work Path의 실제 경로 데이터 가져오기
            const workPath = await getWorkPath();
            const pathContents = workPath[0].pathContents;

            if (!pathContents) {
                throw new Error("Work Path의 pathContents를 가져올 수 없습니다.");
            }

            // 선택된 Work Path를 기반으로 Shape Layer 생성
            await createShapeFromPathContents(pathContents);
            await fillColor(FILL_COLOR.FOREGROUND);
            await selectPathByName("Work Path");
            await deleteWorkPath();

        });

    } catch (e) {
        console.log(e.message);
    }
}

module.exports = {
    convertImageToPath
};