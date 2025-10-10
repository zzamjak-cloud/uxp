const app = require('photoshop').app;
const fs = require('uxp').storage.localFileSystem;
const { executeAsModal } = require('photoshop').core;
const { createDoc} = require("./lib/lib_doc");
const { 
    actionCommands, 
    createLay, 
    deleteLayer, 
    layTransform, 
    relinkToFile, 
    selectLayerByName} = require("./lib/lib_layer");

// 도큐먼트 생성 및 PSD 파일 임포트 extension_value '.psd' or '.png'
async function makeDocImportEntry(extension_value) {
    try {
        const docSize_width = parseInt(document.getElementById('docWidth').value) || 128;
        const docSize_height = parseInt(document.getElementById('docHeight').value) || 128;

        // 폴더 선택
        const folder = await fs.getFolder();
        if (!folder) {
            throw new Error('폴더가 선택되지 않았습니다.');
        }

        // PSD 파일 검색
        const entries = await folder.getEntries();
        const psdFiles = entries.filter(entry => 
            !entry.isFolder && entry.name.toLowerCase().endsWith(extension_value)
        );

        if (psdFiles.length === 0) {
            throw new Error('선택한 폴더에 PSD 파일이 없습니다.');
        }
        
        await executeAsModal(async () => {
            // 새 도큐먼트 생성
            await createDoc("Imported_Assets", docSize_width, docSize_height, 72, 'RGBColorMode', 'transparent');
            const doc = app.activeDocument;

            // 첫 번째 레이어 제거용
            let firstLayer = true;

            // PSD 파일 임포트
            for (const file of psdFiles) {
                const token = await fs.createSessionToken(file);
                
                await createLay();
                await actionCommands('newPlacedLayer');  // 스마트 오브젝트 만들기
                await relinkToFile(token);
                await layTransform(100, 100);

                // 첫 번째 빈 레이어 제거
                if (firstLayer) {
                    await selectLayerByName("Layer 1");
                    await deleteLayer();
                    firstLayer = false;
                }
            }
        });

        console.log('Import completed successfully');

    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    makeDocImportEntry
};