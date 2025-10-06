const app = require("photoshop").app;
const fs = require('uxp').storage.localFileSystem;
const { executeAsModal } = require("photoshop").core;
const { batchPlay } = require("photoshop").action;
const { createLay, setLayerName } = require("./lib/lib_layer");
const { selectTool } = require("./lib/lib_tool");
const constants = require("./lib/constants");

// 컬러 팔레트 추출

async function test() {
    await executeAsModal(async () => {
        try {
            const doc = app.activeDocument;
            // const selectedLayers = [...doc.activeLayers];  // 배열 복사로 안정성 확보

            await createLay();
            const layer = app.activeDocument.activeLayers[0];
            // await selectByLayerID(layer.id);
            await setLayerName("test");
            await selectTool(constants.TOOL.RECTANGLE);

            // console.log(selectedLayers[0].bounds);
            
            // PSD 파일과 동일한 위치에 .act 파일 저장
            const folder_URL = doc.path.replace(doc.name, "");
            const folder_entry = await fs.getEntryWithUrl(`file:${folder_URL}`);
            const folder_token = await fs.createSessionToken(folder_entry);

            // console.log(folder_token);
            
            
        } catch (error) {
            console.error("Error:", error);
        }
    }, { commandName: "Extract Color Palette to Swatches" });
}

module.exports = {
    test
};