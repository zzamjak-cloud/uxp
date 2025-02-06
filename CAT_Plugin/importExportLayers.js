const app = require('photoshop').app;
const fs = require('uxp').storage.localFileSystem;
const { executeAsModal } = require('photoshop').core;
const { createDoc, layerVisible } = require("./lib/lib_doc");
const { saveForWebPNG } = require("./lib/lib_export");
const { createLay, relinkToFile, actionCommands, layTransform, deleteLayer, selectLayerByName } = require("./lib/lib_layer");
const { handleError } = require("./lib/errorHandler");
const { Logger } = require("./lib/logger");

const logger = new Logger('ImportExport');

// 도큐먼트 생성 및 PSD 파일 임포트
async function makeDocImportEntry(docSize) {
    try {
        // 폴더 선택
        const folder = await fs.getFolder();
        if (!folder) {
            throw new Error('폴더가 선택되지 않았습니다.');
        }

        // PSD 파일 검색
        const entries = await folder.getEntries();
        const psdFiles = entries.filter(entry => 
            !entry.isFolder && entry.name.toLowerCase().endsWith('.psd')
        );

        if (psdFiles.length === 0) {
            throw new Error('선택한 폴더에 PSD 파일이 없습니다.');
        }

        logger.info(`Found ${psdFiles.length} PSD files`);
        
        // 새 도큐먼트 생성
        await executeAsModal(async () => {
            await createDoc("Imported_Assets", docSize, docSize, 72, "RGBColorMode", "transparent");
            const doc = app.activeDocument;

            // 첫 번째 레이어 제거용
            let firstLayer = true;

            // PSD 파일 임포트
            for (const file of psdFiles) {
                const token = await fs.createSessionToken(file);
                
                await createLay(doc);
                await actionCommands("newPlacedLayer");
                await relinkToFile(token);
                await layTransform(100, 100);

                // 첫 번째 빈 레이어 제거
                if (firstLayer) {
                    await selectLayerByName("Layer 1");
                    await deleteLayer();
                    firstLayer = false;
                }

                logger.info(`Imported: ${file.name}`);
            }
        });

        logger.info('Import completed successfully');

    } catch (error) {
        await handleError(error, 'import_psd');
    }
}

// 모든 레이어를 PNG로 추출
async function exportLayersAsDocSize() {
    try {
        const folder = await fs.getFolder();
        if (!folder) {
            throw new Error('폴더가 선택되지 않았습니다.');
        }

        const doc = app.activeDocument;
        const layers = doc.layers;
        const folderToken = await fs.createSessionToken(folder);

        await executeAsModal(async () => {
            // 모든 레이어 숨기기
            for (const layer of layers) {
                await layerVisible("hide", layer.name);
            }

            // 각 레이어별로 PNG 추출
            for (const layer of layers) {
                const fileName = `${layer.name}.png`;
                const filePath = `${folder.nativePath}/${fileName}`;
                const fileEntry = await fs.createEntryWithUrl(`file:${filePath}`, { overwrite: true });
                const fileToken = await fs.createSessionToken(fileEntry);

                await layerVisible("show", layer.name);
                await saveForWebPNG(fileEntry.name, folderToken, fileToken);
                await layerVisible("hide", layer.name);

                logger.info(`Exported: ${fileName}`);
            }
        });

        logger.info('Export completed successfully');

    } catch (error) {
        await handleError(error, 'export_png');
    }
}

// PSD 파일을 열고 각 레이어를 PNG로 추출
async function exportLayersFromImportPSD() {
    try {
        // 폴더 선택
        const folder = await fs.getFolder();
        if (!folder) {
            throw new Error('폴더가 선택되지 않았습니다.');
        }

        // Resource 폴더 생성
        const resourceFolder = await folder.createFolder("Resource").catch(async () => {
            return await folder.getEntry("Resource");
        });

        // PSD 파일 검색
        const entries = await folder.getEntries();
        const psdFiles = entries.filter(entry => 
            !entry.isFolder && entry.name.toLowerCase().endsWith('.psd')
        );

        if (psdFiles.length === 0) {
            throw new Error('선택한 폴더에 PSD 파일이 없습니다.');
        }

        logger.info(`Found ${psdFiles.length} PSD files`);
        const folderToken = await fs.createSessionToken(resourceFolder);

        // 각 PSD 파일 처리
        for (const psdFile of psdFiles) {
            await executeAsModal(async () => {
                logger.info(`Processing: ${psdFile.name}`);

                // PSD 파일 열기
                const doc = await app.open(psdFile);
                const layers = doc.layers;

                // 모든 레이어 숨기기
                for (const layer of layers) {
                    await layerVisible("hide", layer.name);
                }

                // 각 레이어 PNG 추출
                for (const layer of layers) {
                    const fileName = `${layer.name}.png`;
                    const filePath = `${resourceFolder.nativePath}/${fileName}`;
                    const fileEntry = await fs.createEntryWithUrl(`file:${filePath}`, { overwrite: true });
                    const fileToken = await fs.createSessionToken(fileEntry);

                    await layerVisible("show", layer.name);
                    await saveForWebPNG(fileEntry.name, folderToken, fileToken);
                    await layerVisible("hide", layer.name);

                    logger.info(`Exported: ${fileName}`);
                }

                // 문서 닫기
                await doc.close();
            });
        }

        logger.info('All PSD files processed successfully');

    } catch (error) {
        await handleError(error, 'export_from_psd');
    }
}

module.exports = {
    makeDocImportEntry,
    exportLayersAsDocSize,
    exportLayersFromImportPSD
};