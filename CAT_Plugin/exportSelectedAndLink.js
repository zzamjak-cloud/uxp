const fs = require('uxp').storage.localFileSystem;
const app = require("photoshop").app;
const { showAlert } = require("./lib/lib");
const { actionCommands, relinkToFile, layerTrim, selectNoLays, selectByLayerID } = require("./lib/lib_layer");
const { docCloseWithoutSaving } = require("./lib/lib_doc");
const { saveForWebPNG, saveAsPSD } = require("./lib/lib_export");
const { executeAsModal } = require('photoshop').core;

async function savePngAndLinkToPSD(txt_file_name) {

    // 데이터 폴더의 엔트리들 얻은 후
    const dataFolder = await fs.getDataFolder();
    const entries = await dataFolder.getEntries();

    // 체크박스 상태 확인 (문서 크기 유지 옵션)
    const docSizeCheckbox = document.getElementById('maintainDocSize');
    const docSizeCheck = docSizeCheckbox ? docSizeCheckbox.checked : false;

    try {
        // 폴더에서 txt 파일을 탐색
        for (const entry of entries) {
            if (entry.name === `${txt_file_name}.txt`) {

                const actLays = app.activeDocument.activeLayers;
                const layers = [];

                // 스마트 오브젝트 또는 그룹만 layers 배열에 편입
                for (const layer of actLays) {
                    if (layer.kind === 'smartObject' || layer.kind === 'group') {
                        layers.push(layer);
                    }
                }
                
                for (const layer of layers) {
                    // 스마트 오브젝트일 경우
                    if (layer.kind === 'smartObject') {
                        await executeAsModal( async() => {
                            await selectByLayerID(layer.id);
                            await actionCommands("placedLayerEditContents");
                            // 문서 크기 유지 옵션에 따른 처리
                            if (!docSizeCheck) {
                                await layerTrim();
                            }
                        },{});
                        await saveAndLink(entry);
                    // 그룹일 경우
                    } else if (layer.kind === 'group') {
                        await executeAsModal( async() => {
                            await selectByLayerID(layer.id);
                            await actionCommands("newPlacedLayer");
                            await actionCommands("placedLayerEditContents");
                            // 문서 크기 유지 옵션에 따른 처리
                            if (!docSizeCheck) {
                                await layerTrim();
                            }
                        },{});
                        await saveAndLink(entry);
                    } else {
                        showAlert("스마트오브젝트 또는 그룹레이어를 선택하세요.");
                        return;
                    }
                }
                break;
            }
        }
    } catch (error) {
        console.log(error);
    }   
}


async function saveAndLink(entry) {

    const doc = app.activeDocument;

    if (doc.name.includes("psb")) {

        // 파일명
        const doc_psd_name = doc.name.replace("psb", "psd");
        const doc_png_name = doc.name.replace("psb", "png");

        // 저장 폴더 URL 얻기
        const folder_URL = await entry.read();
        const folder_entry = await fs.getEntryWithUrl(`file:${folder_URL}`);
        const folder_token = await fs.createSessionToken(folder_entry)

        // PNG 파일 저장 ---------------------------------------
        const file_png_URL = `${folder_entry.nativePath}/${doc_png_name}`;
        const file_png_entry = await fs.createEntryWithUrl(`file:${file_png_URL}`, { overwrite: true });
        const file_png_token = await fs.createSessionToken(file_png_entry);

        await executeAsModal( async() => {
            await saveForWebPNG(file_png_entry.name, folder_token, file_png_token) 
        },{});

        // PSD 파일 저장 ---------------------------------------
        const file_psd_URL = `${folder_entry.nativePath}/${doc_psd_name}`;
        const file_psd_entry = await fs.createEntryWithUrl(`file:${file_psd_URL}`, { overwrite: true });
        const file_psd_token = await fs.createSessionToken(file_psd_entry);

        await executeAsModal( async() => {
            await saveAsPSD(file_psd_token);
            await docCloseWithoutSaving(doc);
            await relinkToFile(file_psd_token);
            await selectNoLays();
        },{});
    } else {
        showAlert("Smart Object가 아닙니다.");
    }
}

module.exports = {
    savePngAndLinkToPSD
}