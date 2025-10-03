
const { actionCommands } = require("./lib/lib_layer");
const { COMMAND } = require('./lib/constants');

// 향상된 선택 레이어 PNG 내보내기 (미사용)
async function exportOnlySelectedLayers() {
    try {
        const folder = await fs.getFolder();
        if (!folder) {
            throw new Error('폴더가 선택되지 않았습니다.');
        }

        const folderToken = await fs.createSessionToken(folder);
        const originalDoc = app.activeDocument;
        const selectedLayers = originalDoc.activeLayers;
        
        if (selectedLayers.length === 0) {
            throw new Error('선택된 레이어가 없습니다.');
        }

        // 체크박스 상태 확인 (문서 크기 유지 옵션)
        const maintainDocSizeCheckbox = document.getElementById('maintainDocSize');
        const maintainDocumentSize = maintainDocSizeCheckbox ? maintainDocSizeCheckbox.checked : false;

        logger.info(`Processing ${selectedLayers.length} selected layers`);
        logger.info(`Maintain document size: ${maintainDocumentSize}`);

        let successCount = 0;
        let failCount = 0;

        await executeAsModal(async () => {
            // 각 선택된 레이어별로 개별 처리
            for (const layer of selectedLayers) {
                try {
                    // 1. 원본 문서로 돌아가기
                    app.activeDocument = originalDoc;
                    
                    // 2. 현재 레이어만 선택
                    await selectNoLays();
                    await selectByLayerID(layer.id);
                    
                    // 3. 새 문서에 레이어 복사
                    await createDocCopyLayers(`${layer.name}_export`);
                    const newDoc = app.activeDocument;
                    
                    // 4. 문서 크기 유지 옵션에 따른 처리
                    if (!maintainDocumentSize) {
                        // 트림 모드: 레이어 경계에 맞춰 자르기
                        await layerTrim();
                    }
                    // maintainDocumentSize가 true면 트림하지 않음 (원본 문서 크기와 위치 유지)
                    
                    // 5. PNG 파일로 저장
                    const fileName = `${layer.name}.png`;
                    const filePath = `${folder.nativePath}/${fileName}`;
                    const fileEntry = await fs.createEntryWithUrl(`file:${filePath}`, { overwrite: true });
                    const fileToken = await fs.createSessionToken(fileEntry);
                    
                    await saveForWebPNG(fileEntry.name, folderToken, fileToken);
                    
                    // 6. 새 문서 닫기 (저장하지 않음)
                    await docCloseWithoutSaving(newDoc);
                    
                    successCount++;
                    logger.info(`Exported: ${fileName} ${maintainDocumentSize ? '(document size)' : '(trimmed)'}`);
                    
                } catch (layerError) {
                    failCount++;
                    console.error(`Error exporting layer ${layer.name}:`, layerError);
                    
                    // 오류 발생 시 열려있는 임시 문서가 있다면 닫기
                    try {
                        if (app.activeDocument && app.activeDocument.name !== originalDoc.name) {
                            await docCloseWithoutSaving(app.activeDocument);
                        }
                    } catch (cleanupError) {
                        console.error('Cleanup error:', cleanupError);
                    }
                }
            }
            
            // 7. 원본 문서로 최종 복귀
            app.activeDocument = originalDoc;
            
        }, { commandName: "Export Selected Layers to PNG" });

        // 결과 메시지
        const totalLayers = selectedLayers.length;
        const sizeMode = maintainDocumentSize ? "문서 크기 유지" : "레이어 크기 맞춤";
        
        if (failCount > 0) {
            logger.warn(`Export completed with errors: ${successCount}/${totalLayers} successful`);
            await showAlert(`PNG 내보내기 완료! (${sizeMode})\n성공: ${successCount}개\n실패: ${failCount}개`);
        } else {
            logger.info(`Export completed successfully: ${successCount}/${totalLayers}`);
            await showAlert(`모든 레이어 PNG 내보내기 완료! (${sizeMode})\n총 ${successCount}개 파일 생성`);
        }

    } catch (error) {
        await handleError(error, 'export_selected_layers');
    }
}

// 그룹 레이어 전용 처리 함수 (미사용)
async function exportGroupLayerToPNG(groupLayer, folder, folderToken, maintainDocumentSize = false) {
    try {
        const originalDoc = app.activeDocument;
        
        // 그룹 선택
        await selectNoLays();
        await selectByLayerID(groupLayer.id);
        
        // 새 문서 생성
        await createDocCopyLayers(`${groupLayer.name}_export`);
        const newDoc = app.activeDocument;
        
        // 모든 레이어를 하나로 합치기 (그룹의 모든 내용을 하나의 이미지로)
        if (newDoc.layers.length > 1) {
            await actionCommands(COMMAND.MERGE_VISIBLE);
        }
        
        // 문서 크기 유지 옵션에 따른 처리
        if (!maintainDocumentSize) {
            await layerTrim();
        }
        
        // PNG 저장
        const fileName = `${groupLayer.name}.png`;
        const filePath = `${folder.nativePath}/${fileName}`;
        const fileEntry = await fs.createEntryWithUrl(`file:${filePath}`, { overwrite: true });
        const fileToken = await fs.createSessionToken(fileEntry);
        
        await saveForWebPNG(fileEntry.name, folderToken, fileToken);
        
        // 새 문서 닫기
        await docCloseWithoutSaving(newDoc);
        
        // 원본 문서로 복귀
        app.activeDocument = originalDoc;
        
        return true;
        
    } catch (error) {
        console.error(`Error exporting group ${groupLayer.name}:`, error);
        return false;
    }
}

// 단일 레이어 전용 처리 함수 (미사용)
async function exportSingleLayerToPNG(layer, folder, folderToken, maintainDocumentSize = false) {
    try {
        const originalDoc = app.activeDocument;
        
        // 레이어 선택
        await selectNoLays();
        await selectByLayerID(layer.id);
        
        // 새 문서 생성
        await createDocCopyLayers(`${layer.name}_export`);
        const newDoc = app.activeDocument;
        
        // 문서 크기 유지 옵션에 따른 처리
        if (!maintainDocumentSize) {
            await layerTrim();
        }
        
        // PNG 저장
        const fileName = `${layer.name}.png`;
        const filePath = `${folder.nativePath}/${fileName}`;
        const fileEntry = await fs.createEntryWithUrl(`file:${filePath}`, { overwrite: true });
        const fileToken = await fs.createSessionToken(fileEntry);
        
        await saveForWebPNG(fileEntry.name, folderToken, fileToken);
        
        // 새 문서 닫기
        await docCloseWithoutSaving(newDoc);
        
        // 원본 문서로 복귀
        app.activeDocument = originalDoc;
        
        return true;
        
    } catch (error) {
        console.error(`Error exporting layer ${layer.name}:`, error);
        return false;
    }
}

// 모든 레이어를 PNG로 추출 (미사용)
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

// PSD 파일을 열고 각 레이어를 PNG로 추출 (미사용)
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
                await docCloseWithoutSaving(doc);
            });
        }

        logger.info('All PSD files processed successfully');

    } catch (error) {
        await handleError(error, 'export_from_psd');
    }
}