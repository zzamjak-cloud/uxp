const fs = require('uxp').storage.localFileSystem;
const app = require('photoshop').app;
const { executeAsModal } = require('photoshop').core;
const { createFolderToken, showAlert } = require("./lib/lib");
const { createDoc, layerVisible, docDuplicate, docResizeCanvas, docResizeOptions, docCloseWithoutSaving } = require("./lib/lib_doc");
const { saveForWebPNG } = require("./lib/lib_export");
const { createLay, setLayerName, layOpacity, makeGroup, moveLayer, setLocking } = require("./lib/lib_layer");
const { setForegroundColor, fillColor, makeShape, setPathFinderType } = require("./lib/lib_tool");
const { handleError } = require("./lib/errorHandler");
const { Logger } = require("./lib/logger");

const logger = new Logger('AppIconMaker');

// 앱 아이콘 설정
const APP_ICONS = {
    ANDROID: {
        name: "android",
        sizes: [512, 432, 324, 216, 192, 162, 108, 144, 96, 81, 72, 48, 36]
    },
    IOS: {
        name: "iOS",
        sizes: [1024, 180, 167, 152, 144, 120, 114, 87, 80, 76, 72, 60, 58, 57, 40, 29, 20]
    },
    ANDROID_ADAPTIVE: {
        name: "android(Adaptive)",
        sizes: [432, 324, 216, 162, 108, 81]
    }
};

// PSD 템플릿 설정
const PSD_TEMPLATE = {
    DOC_SIZE: 2048,
    FRAME_SIZE: 1338,
    FRAME_POSITION: {
        TOP: 355,
        LEFT: 355,
        BOTTOM: 1693,
        RIGHT: 1693
    }
};

// 폴더 생성 및 파일 저장 준비
async function prepareExportFolders() {
    try {
        const saveFolder = await fs.getFolder();
        if (!saveFolder) {
            throw new Error('폴더가 선택되지 않았습니다.');
        }

        const saveFolderPath = saveFolder.nativePath;
        logger.info(`Selected save folder: ${saveFolderPath}`);

        // 각 플랫폼별 폴더 생성
        const folders = {
            android: await createFolderToken(APP_ICONS.ANDROID.name, saveFolder),
            ios: await createFolderToken(APP_ICONS.IOS.name, saveFolder),
            adaptiveAndroid: await createFolderToken(APP_ICONS.ANDROID_ADAPTIVE.name, saveFolder)
        };

        return { saveFolderPath, folders };
    } catch (error) {
        throw new Error(`폴더 준비 실패: ${error.message}`);
    }
}

// 아이콘 생성 및 저장
async function generateIcon(size, folderPath, folderToken, platformName, sampleMethodName) {
    try {
        const fileName = `${platformName}_${size}.png`;
        const filePath = `${folderPath}/${platformName}/${fileName}`;
        const fileEntry = await fs.createEntryWithUrl(`file:${filePath}`);
        const fileToken = await fs.createSessionToken(fileEntry);
        const doc = app.activeDocument;

        await executeAsModal(async () => {
            await docDuplicate(doc, fileName);
            const curDoc = app.activeDocument;
            await docResizeCanvas(curDoc, 1332);
            await docResizeOptions(curDoc, size, size, 'pixelsUnit', sampleMethodName);
            await saveForWebPNG(fileName, folderToken, fileToken);
            await docCloseWithoutSaving(curDoc);
        });

        logger.info(`Generated icon: ${fileName}`);
    } catch (error) {
        throw new Error(`아이콘 생성 실패 (${size}px): ${error.message}`);
    }
}

// 적응형 아이콘 레이어 처리
async function processAdaptiveIconLayer(size, folderPath, folderToken, layer_name, sampleMethodName) {
    try {
        const fileName = `android_${size}_${layer_name}.png`;
        const filePath = `${folderPath}/${APP_ICONS.ANDROID_ADAPTIVE.name}/${fileName}`;
        const fileEntry = await fs.createEntryWithUrl(`file:${filePath}`);
        const fileToken = await fs.createSessionToken(fileEntry);
        const doc = app.activeDocument;

        await executeAsModal(async () => {
            await docDuplicate(doc, fileName);
            const curDoc = app.activeDocument;

            // 레이어 표시/숨김 처리
            for (const layer of curDoc.layers) {
                await layerVisible(
                    layer.name === layer_name ? "show" : "hide", 
                    layer.name
                );
            }

            await docResizeOptions(curDoc, size, size, 'pixelsUnit', sampleMethodName);
            await saveForWebPNG(fileName, folderToken, fileToken);
            await docCloseWithoutSaving(curDoc);
        });

        logger.info(`Generated adaptive icon layer: ${fileName}`);
    } catch (error) {
        throw new Error(`적응형 아이콘 레이어 처리 실패 (${size}px): ${error.message}`);
    }
}

// 앱 아이콘 생성 메인 함수
async function appIconMaker(sampleMethodName) {
    try {
        logger.info('Starting app icon generation');
        const { saveFolderPath, folders } = await prepareExportFolders();

        // iOS 아이콘 생성
        for (const size of APP_ICONS.IOS.sizes) {
            await generateIcon(size, saveFolderPath, folders.ios, APP_ICONS.IOS.name, sampleMethodName);
        }

        // 안드로이드 일반 아이콘 생성
        for (const size of APP_ICONS.ANDROID.sizes) {
            await generateIcon(size, saveFolderPath, folders.android, APP_ICONS.ANDROID.name, sampleMethodName);
        }

        // 안드로이드 적응형 아이콘 생성
        for (const size of APP_ICONS.ANDROID_ADAPTIVE.sizes) {
            await processAdaptiveIconLayer(size, saveFolderPath, folders.adaptiveAndroid, "f", sampleMethodName);
            await processAdaptiveIconLayer(size, saveFolderPath, folders.adaptiveAndroid, "b", sampleMethodName);
        }

        await showAlert("앱 아이콘 생성이 완료되었습니다!");
        logger.info('App icon generation completed successfully');

    } catch (error) {
        await handleError(error, 'app_icon_maker');
    }
}

// PSD 템플릿 생성
async function appIconPSDGenerate() {
    try {
        logger.info('Starting PSD template generation');

        await executeAsModal(async () => {
            // 문서 생성
            await createDoc(
                "Origin", 
                PSD_TEMPLATE.DOC_SIZE, 
                PSD_TEMPLATE.DOC_SIZE, 
                72, 
                'RGBColorMode', 
                'transparent'
            );

            const { TOP, LEFT, BOTTOM, RIGHT } = PSD_TEMPLATE.FRAME_POSITION;

            // 레이어 그룹 생성 및 구성
            await makeGroup("b");
            await createLay();
            await moveLayer('next');
            await makeGroup("f");

            // 프레임 생성
            await makeShape(0, 0, 0, 'rectangle', TOP, LEFT, BOTTOM, RIGHT, 0, 0, 0, 0, false, 0, 0, 0, 0);
            await moveLayer('next');
            await setLayerName("Frame");
            await setPathFinderType(1);
            await layOpacity(50);
            await setLocking(true);
        });

        logger.info('PSD template generated successfully');

    } catch (error) {
        await handleError(error, 'psd_template_generator');
    }
}

module.exports = {
    appIconMaker,
    appIconPSDGenerate
};