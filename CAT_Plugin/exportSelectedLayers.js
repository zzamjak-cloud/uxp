const fs = require('uxp').storage.localFileSystem;
const app = require('photoshop').app;
const { executeAsModal } = require('photoshop').core;
const { showAlert } = require('./lib/lib');
const { createDoc, docCloseWithoutSaving, layerVisible } = require('./lib/lib_doc');
const { saveForWebPNG, saveAsPSD } = require('./lib/lib_export');
const { createLay, selectByLayerID, selectNoLays, layerTrim, duplicateLayer, moveLayer } = require('./lib/lib_layer');
const { handleError } = require('./lib/errorHandler');
const { Logger } = require('./lib/logger');

const logger = new Logger('ExportSelectedToPSD');

/**
 * 선택된 그룹 또는 스마트 오브젝트를 새 문서로 내보내기
 * @param {string} pathId - 저장 경로 ID (getPath3)
 */
async function exportSelectedFile(pathId, fileType) {
    try {
        // 현재 문서 및 선택된 레이어 확인
        const originalDoc = app.activeDocument;
        const selectedLayers = [...originalDoc.activeLayers]; // 배열 복사로 안정성 확보

        // 체크박스 상태 확인 (문서 크기 유지 옵션)
        const maintainDocSizeCheckbox = document.getElementById('maintainDocSize');
        const maintainDocumentSize = maintainDocSizeCheckbox ? maintainDocSizeCheckbox.checked : false;

        if (selectedLayers.length === 0) {
            throw new Error('내보낼 레이어를 선택해주세요.');
        }

        // 선택된 레이어가 그룹 또는 스마트 오브젝트인지 확인
        const validLayers = selectedLayers.filter(layer => 
            layer.kind === 'group' || layer.kind === 'smartObject'
        );

        if (validLayers.length === 0) {
            throw new Error('그룹 레이어 또는 스마트 오브젝트를 선택해주세요.');
        }

        // 저장 폴더 경로 가져오기
        const saveFolder = await getSaveFolderPath(pathId);
        if (!saveFolder) {
            throw new Error('저장 폴더가 지정되지 않았습니다. 먼저 폴더를 선택해주세요.');
        }

        logger.info(`Export started - Layers: ${validLayers.length}, Folder: ${saveFolder.folderName}`);

        // 처리 통계
        let successCount = 0;
        let failedLayers = [];

        // 각 레이어별로 개별 처리 (순차 처리로 안정성 확보)
        for (let i = 0; i < validLayers.length; i++) {
            const layer = validLayers[i];
            try {
                logger.info(`Processing ${i + 1}/${validLayers.length}: ${layer.name}`);
                await processLayer(layer, originalDoc, saveFolder, fileType, maintainDocumentSize);
                successCount++;
                logger.info(`✅ Successfully processed: ${layer.name}`);
            } catch (error) {
                logger.error(`❌ Failed to process layer ${layer.name}: ${error.message}`);
                failedLayers.push({
                    name: layer.name,
                    error: error.message
                });
                // 개별 레이어 실패 시에도 계속 진행
                continue;
            }
        }

        // 결과 메시지
        let resultMessage = `처리 완료!\n성공: ${successCount}개`;
        
        if (failedLayers.length > 0) {
            resultMessage += `\n실패: ${failedLayers.length}개`;
            resultMessage += `\n실패한 레이어: ${failedLayers.map(f => f.name).join(', ')}`;
        }

        await showAlert(resultMessage);
        logger.info(`Export completed - Success: ${successCount}, Failed: ${failedLayers.length}`);

    } catch (error) {
        await handleError(error, 'export_selected_to_psd');
    }
}

/**
 * 개별 레이어 처리
 */
async function processLayer(layer, originalDoc, saveFolder, fileType, maintainDocumentSize) {
    try {
        logger.info(`Processing layer: ${layer.name} (ID: ${layer.id})`);

        // 원본 문서가 활성 상태인지 확인
        if (app.activeDocument.id !== originalDoc.id) {
            app.activeDocument = originalDoc;
        }

        await executeAsModal(async () => {
            await copyLayerToNewDocument(layer, originalDoc, saveFolder, fileType, maintainDocumentSize);
        }, { 
            commandName: `Export ${layer.name}`,
            historyStateInfo: {
                name: `Export Layer: ${layer.name}`,
                target: originalDoc
            }
        });

        logger.info(`✅ Completed processing: ${layer.name}`);

    } catch (error) {
        logger.error(`❌ Error processing layer ${layer.name}: ${error.message}`);
        
        // 원본 문서로 안전하게 복귀
        try {
            if (app.activeDocument && app.activeDocument.id !== originalDoc.id) {
                app.activeDocument = originalDoc;
            }
        } catch (docError) {
            logger.warn(`Failed to return to original document: ${docError.message}`);
        }
        
        throw new Error(`레이어 "${layer.name}" 처리 실패: ${error.message}`);
    }
}

/**
 * 레이어를 새 문서로 복사하고 저장
 */
async function copyLayerToNewDocument(layer, originalDoc, saveFolder, fileType, maintainDocumentSize) {
    const { batchPlay } = require('photoshop').action;
    let newDoc = null;
    
    try {
        logger.info(`Starting copy process for layer: ${layer.name}`);

        // 1. 원본 문서에서 레이어 선택
        app.activeDocument = originalDoc;
        await selectNoLays();
        await selectByLayerID(layer.id);
        
        logger.info(`Selected layer: ${layer.name}`);

        // 2. 선택된 레이어를 새 문서로 복사
        const result = await batchPlay([{
            _obj: "make",
            _target: [{
                _ref: "document"
            }],
            name: `${sanitizeFileName(layer.name)}_export`,
            using: {
                _ref: "layer",
                _enum: "ordinal",
                _value: "targetEnum"
            },
            version: 5,
            _options: {
                dialogOptions: "dontDisplay"
            }
        }], { synchronousExecution: true });

        // 3. 새 문서 참조 가져오기
        newDoc = app.activeDocument;
        
        if (!newDoc || newDoc.id === originalDoc.id) {
            throw new Error('새 문서 생성에 실패했습니다.');
        }

        logger.info(`Created new document: ${newDoc.name} (ID: ${newDoc.id})`);

        // 4. 문서 크기 유지 옵션에 따른 처리
        if (!maintainDocumentSize) {
            // 트림 모드: 레이어 경계에 맞춰 자르기
            await layerTrim();
        }

        // 5. 파일 저장
        await saveFiles(newDoc, layer.name, saveFolder, fileType);

        // 6. 새 문서 닫기
        logger.info(`Closing new document: ${newDoc.name}`);
        await docCloseWithoutSaving(newDoc);

        // 7. 원본 문서로 안전하게 복귀
        app.activeDocument = originalDoc;
        logger.info(`Returned to original document: ${originalDoc.name}`);

    } catch (error) {
        logger.error(`Error in copyLayerToNewDocument: ${error.message}`);
        
        // 에러 발생 시 정리 작업
        try {
            if (newDoc && newDoc.id !== originalDoc.id) {
                logger.info(`Cleaning up: closing document ${newDoc.name}`);
                await docCloseWithoutSaving(newDoc);
            }
        } catch (cleanupError) {
            logger.warn(`Cleanup failed: ${cleanupError.message}`);
        }
        
        // 원본 문서로 복귀
        try {
            app.activeDocument = originalDoc;
        } catch (docError) {
            logger.warn(`Failed to return to original document: ${docError.message}`);
        }
        
        throw error;
    }
}

/**
 * PSD 및 PNG 파일 저장
 */
async function saveFiles(doc, layerName, saveFolder, fileType) {
    try {
        const sanitizedName = sanitizeFileName(layerName);
        
        if (fileType === 'psd') {
            // PSD 저장
            const psdFileName = `${sanitizedName}.psd`;
            const psdFilePath = `${saveFolder.folderPath}/${psdFileName}`;
            const psdFileEntry = await fs.createEntryWithUrl(`file:${psdFilePath}`, { overwrite: true });
            const psdFileToken = await fs.createSessionToken(psdFileEntry);
            
            await saveAsPSD(psdFileToken);
            logger.info(`Saved PSD: ${psdFileName}`);

            // PNG 저장
            const pngFileName = `${sanitizedName}.png`;
            const pngFilePath = `${saveFolder.folderPath}/${pngFileName}`;
            const pngFileEntry = await fs.createEntryWithUrl(`file:${pngFilePath}`, { overwrite: true });
            const pngFileToken = await fs.createSessionToken(pngFileEntry);
            
            await saveForWebPNG(pngFileName, saveFolder.folderToken, pngFileToken);
            logger.info(`Saved PNG: ${pngFileName}`);
        } else if (fileType === 'png') {
            // PNG 저장
            const pngFileName = `${sanitizedName}.png`;
            const pngFilePath = `${saveFolder.folderPath}/${pngFileName}`;
            const pngFileEntry = await fs.createEntryWithUrl(`file:${pngFilePath}`, { overwrite: true });
            const pngFileToken = await fs.createSessionToken(pngFileEntry);
            
            await saveForWebPNG(pngFileName, saveFolder.folderToken, pngFileToken);
            logger.info(`Saved PNG: ${pngFileName}`);
        }

    } catch (error) {
        throw new Error(`파일 저장 실패: ${error.message}`);
    }
}

/**
 * 저장 폴더 경로 가져오기
 */
async function getSaveFolderPath(pathId) {
    try {
        const dataFolder = await fs.getDataFolder();
        const entries = await dataFolder.getEntries();

        for (const entry of entries) {
            if (entry.name === `${pathId}.txt`) {
                const folderURL = await entry.read();
                const folderEntry = await fs.getEntryWithUrl(`file:${folderURL}`);
                const folderToken = await fs.createSessionToken(folderEntry);
                
                const folderNameArray = folderURL.split(/[\\\/]/);
                const folderName = folderNameArray[folderNameArray.length - 1];

                return {
                    folderPath: folderURL,
                    folderToken: folderToken,
                    folderName: folderName
                };
            }
        }
        return null;
    } catch (error) {
        throw new Error(`저장 폴더 경로 가져오기 실패: ${error.message}`);
    }
}

/**
 * 파일명에서 잘못된 문자 제거
 */
function sanitizeFileName(fileName) {
    return fileName.replace(/[<>:"/\\|?*]/g, '_').trim();
}

module.exports = {
    exportSelectedFile
};