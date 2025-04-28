const app = require("photoshop").app;
const { executeAsModal } = require('photoshop').core;
const { SaveOptions } = require("photoshop").constants;
const fs = require('uxp').storage.localFileSystem;
const { showAlert } = require("./lib/lib");
const { createDoc, layerVisible } = require("./lib/lib_doc");
const { saveForWebPNG } = require("./lib/lib_export");
const { createLay, relinkToFile, actionCommands, layTransform, deleteLayer, selectLayerByName } = require("./lib/lib_layer");

//: 지정된 폴더 내에서 모든 PSD파일만 Import
async function makeDocImportEntry(doc_size) {
    try {
        // 폴더 얻어오기
        const saveFolder = await fs.getFolder();
        const entries = await saveFolder.getEntries();
        const folder_entries = [];
        const file_png_token = [];
        
        // 링크로 불러올 파일 토큰 생성
        for (const entry of entries) {
            if (entry.isFolder) {
                folder_entries.push(entry);
                console.log("폴더명 : " + entry.name);
            } else if (entry.name.includes('psd')) {
                let token = fs.createSessionToken(entry);
                file_png_token.push(token);
                console.log("파일 토큰 : " + token);
            }
        }

        // 신규 도큐먼트 생성
        await executeAsModal(() => createDoc("Conversation", doc_size, doc_size, 72, "RGBColorMode", "transparent"));
        const doc = app.activeDocument;

        for (const token of file_png_token) {
            await executeAsModal(async() => {
                await createLay(doc);
                await actionCommands("newPlacedLayer");
                await relinkToFile(token);
                await layTransform(100, 100);
                // await layerTranslate(actLay, 0, -40);
            },{});
        }

        await executeAsModal(async() => {
            await selectLayerByName("Layer 1");
            await deleteLayer();
        }, {});

    } catch (e) {
        console.log(e.message);
    }
}

//: 모든 레이어를 Document 크기대로 export PNG
async function exportLayersAsDocSize() {
    const doc = app.activeDocument;
    const layers = doc.layers;
    const saveFolder = await fs.getFolder();
    const folder_token = await fs.createSessionToken(saveFolder);

    for (const layer of layers) {
        await executeAsModal(() => {layerVisible("hide", layer.name)}, {});
    }

    for (const layer of layers) {
        let file_URL = `${saveFolder.nativePath}/${layer.name}.png`;
        let file_entry = await fs.createEntryWithUrl(`file:${file_URL}`, { overwrite: true });
        let file_token = await fs.createSessionToken(file_entry);
        await executeAsModal(async() => {
            await layerVisible("show", layer.name);
            await saveForWebPNG(file_entry.name, folder_token, file_token);
            await layerVisible("hide", layer.name);
        },{});
        // console.log(file_name);
    }
}

//: 지정된 폴더의 모든 PSD파일을 열어서 각 레이어를 PNG로 추출 (폴더생성)
async function exportLayersFromImportPSD() {
    try {
        // 1. 폴더 선택 대화상자 표시
        const folder = await fs.getFolder();
        if (!folder) {
            console.log("폴더가 선택되지 않았습니다.");
            return;
        }

        // 2. Resource 폴더 생성
        let resourceFolder;
        try {
            resourceFolder = await folder.createFolder("Resource");
        } catch (e) {
            // 이미 폴더가 존재하는 경우 해당 폴더 사용
            resourceFolder = await folder.getEntry("Resource");
        }

        // 3. 모든 PSD 파일 찾고 엔트리 생성하기
        const entries = await folder.getEntries();
        const folder_entries = [];
        const psd_entries = [];
        for (const entry of entries) {
            if (entry.isFolder) {
                folder_entries.push(entry);
                console.log("폴더명 : " + entry.name);
            } else if (entry.name.toLowerCase().endsWith('.psd')) {
                psd_entries.push(entry);
                console.log("psd명 : " + entry.name);
            }
        }
        
        if (psd_entries.length === 0) {
            console.log("PSD 파일을 찾을 수 없습니다.");
            return;
        }

        console.log(`총 ${psd_entries.length}개의 PSD 파일을 찾았습니다.`);

        // 각 PSD 파일을 모달 스코프 내에서 처리
        for (const psd_entry of psd_entries) {
            await executeAsModal(async () => {
                try {
                    console.log(`\n"${psd_entry.name}" 처리 시작...`);

                    // PSD 파일 열기
                    const doc = await app.open(psd_entry);
                    
                    if (!doc) {
                        throw new Error("문서를 열 수 없습니다.");
                    }

                    console.log(`"${psd_entry.name}" 파일이 성공적으로 열렸습니다.`);
                    
                    // 테스트를 위해 문서 정보 출력
                    console.log("문서 정보:", {
                        width: doc.width,
                        height: doc.height,
                        layerCount: doc.layers.length
                    });

                    // 4. 모든 레이어 내보내기
                    const layers = doc.layers;
                    const saveFolder = resourceFolder
                    const folder_token = await fs.createSessionToken(saveFolder);

                    for (const layer of layers) {
                        await executeAsModal(() => {layerVisible("hide", layer.name)}, {});
                    }

                    for (const layer of layers) {
                        let file_URL = `${saveFolder.nativePath}/${layer.name}.png`;
                        let file_entry = await fs.createEntryWithUrl(`file:${file_URL}`, { overwrite: true });
                        let file_token = await fs.createSessionToken(file_entry);
                        await executeAsModal(async() => {
                            await layerVisible("show", layer.name);
                            await saveForWebPNG(file_entry.name, folder_token, file_token);
                            await layerVisible("hide", layer.name);
                        },{});
                        // console.log(file_name);
                    }

                    // 테스트가 끝났으면 문서 닫기
                    await doc.close(SaveOptions.DONOTSAVECHANGES);

                } catch (error) {
                    console.error(`"${psd_entry.name}" 처리 중 오류 발생:`, error);
                }
            }, {
                commandName: "Open PSD File"
            });
        }

        console.log("\n모든 PSD 파일 처리가 완료되었습니다.");

    } catch (e) {
        console.error("전체 프로세스 오류:", e.message);
    }
}


module.exports = {
    makeDocImportEntry,
    exportLayersAsDocSize,
    exportLayersFromImportPSD
}
