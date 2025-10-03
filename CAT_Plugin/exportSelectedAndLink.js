const fs = require('uxp').storage.localFileSystem;
const app = require("photoshop").app;
const { showAlert } = require("./lib/lib");
const { actionCommands, relinkToFile, layerTrim, selectNoLays, selectByLayerID } = require("./lib/lib_layer");
const { docCloseWithoutSaving } = require("./lib/lib_doc");
const { saveForWebPNG, saveAsPSD } = require("./lib/lib_export");
const { executeAsModal } = require('photoshop').core;
const { Logger } = require('./lib/logger');
const { COMMAND } = require('./lib/constants');

const logger = new Logger('ExportSelectedAndLink');

// 선택된 폴더 프리셋 로드
async function loadSelectedFolder() {
    try {
        const dataFolder = await fs.getDataFolder();
        const entries = await dataFolder.getEntries();
        
        for (const entry of entries) {
            if (entry.name === 'selectedFolder.txt') {
                const content = await entry.read();
                const preset = JSON.parse(content);
                
                logger.info(`Loaded selected folder: ${preset.name}`);
                return preset;
            }
        }
        return null;
    } catch (error) {
        logger.error(`Failed to load selected folder: ${error.message}`);
        return null;
    }
}

async function savePngAndLinkToPSD(txt_file_name) {
    try {
        // 체크박스 상태 확인 (문서 크기 유지 옵션)
        const docSizeCheckbox = document.getElementById('maintainDocSize');
        const docSizeCheck = docSizeCheckbox ? docSizeCheckbox.checked : false;

        // 동적 폴더 선택인지 확인
        let folderPreset = null;
        if (txt_file_name === 'dynamic') {
            folderPreset = await loadSelectedFolder();
            if (!folderPreset) {
                throw new Error('저장 폴더가 지정되지 않았습니다. 먼저 폴더 프리셋을 선택해주세요.');
            }
        }

        // 데이터 폴더의 엔트리들 얻은 후
        const dataFolder = await fs.getDataFolder();
        const entries = await dataFolder.getEntries();

        // 폴더에서 txt 파일을 탐색하거나 동적 폴더 사용
        let targetEntry = null;
        
        if (txt_file_name === 'dynamic') {
            // 동적 폴더 사용
            targetEntry = {
                read: async () => folderPreset.path
            };
        } else {
            // 기존 방식: txt 파일에서 폴더 경로 읽기
            for (const entry of entries) {
                if (entry.name === `${txt_file_name}.txt`) {
                    targetEntry = entry;
                    break;
                }
            }
        }

        if (!targetEntry) {
            throw new Error(`폴더 설정 파일을 찾을 수 없습니다: ${txt_file_name}.txt`);
        }

        const actLays = app.activeDocument.activeLayers;
        const layers = [];

        // 스마트 오브젝트 또는 그룹만 layers 배열에 편입
        for (const layer of actLays) {
            if (layer.kind === 'smartObject' || layer.kind === 'group') {
                layers.push(layer);
            }
        }
        
        if (layers.length === 0) {
            throw new Error('스마트 오브젝트 또는 그룹 레이어를 선택해주세요.');
        }
        
        for (const layer of layers) {
            // 스마트 오브젝트일 경우
            if (layer.kind === 'smartObject') {
                await executeAsModal( async() => {
                    await selectByLayerID(layer.id);
                    await actionCommands(COMMAND.PLACED_LAYER_EDIT_CONTENTS);
                    // 문서 크기 유지 옵션에 따른 처리
                    if (!docSizeCheck) {
                        await layerTrim();
                    }
                },{});
                await saveAndLink(targetEntry);
            // 그룹일 경우
            } else if (layer.kind === 'group') {
                await executeAsModal( async() => {
                    await selectByLayerID(layer.id);
                    await actionCommands(COMMAND.NEW_PLACED_LAYER);
                    await actionCommands(COMMAND.PLACED_LAYER_EDIT_CONTENTS);
                    // 문서 크기 유지 옵션에 따른 처리
                    if (!docSizeCheck) {
                        await layerTrim();
                    }
                },{});
                await saveAndLink(targetEntry);
            } else {
                showAlert("스마트오브젝트 또는 그룹레이어를 선택하세요.");
                return;
            }
        }
        
    } catch (error) {
        logger.error(`Error in savePngAndLinkToPSD: ${error.message}`);
        await showAlert(error.message);
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