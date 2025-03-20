const fs = require('uxp').storage.localFileSystem;
const app = require('photoshop').app;
const { executeAsModal } = require('photoshop').core;
const { createFolderToken, showAlert } = require("./lib/lib");
const { createDoc, layerVisible, docDuplicate, docResizeCanvas, docResizeImage, docCloseWithoutSaving } = require("./lib/lib_doc");
const { saveForWebPNG } = require("./lib/lib_export");
const { createLay, setLayerName, layOpacity, makeGroup, moveLayer, setLocking } = require("./lib/lib_layer");
const { setForegroundColor, fillColor, makeShape, setPathFinderType } = require("./lib/lib_tool");


async function appIconMaker() {

    // 각 OS별 앱아이콘 사이즈 리스트
       const aos_name = "android";
       const aos_size = [512, 432, 324, 216, 192, 162, 108, 144, 96, 81, 72, 48, 36];
       const ios_name = "iOS";
       const ios_size = [1024, 180, 167, 152, 144, 120, 114, 87, 80, 76, 72, 60, 58, 57, 40, 29, 20];
       const aos_adaptive_name = "android(Adaptive)"
       const aos_adaptive_size = [432, 324, 216, 162, 108, 81];
    
    // 사용자로부터 저장폴더 권한획득
       const save_folder_entry = await fs.getFolder();
       const save_folder_path = save_folder_entry.nativePath;
       
    // 폴더생성 및 세션토큰 발행
       const aos_folder_token = await createFolderToken(aos_name, save_folder_entry);
       const ios_folder_token = await createFolderToken(ios_name, save_folder_entry);
       const aos_adaptive_folder_token = await createFolderToken(aos_adaptive_name, save_folder_entry);
    
       // aos,ios 앱아이콘 추출
       await iconMake(aos_name, aos_size, save_folder_path, aos_folder_token);
       await iconMake(ios_name, ios_size, save_folder_path, ios_folder_token);
       await adaptiveIconMake(aos_adaptive_name, "f", aos_adaptive_size, save_folder_path, aos_adaptive_folder_token);
       await adaptiveIconMake(aos_adaptive_name, "b", aos_adaptive_size, save_folder_path, aos_adaptive_folder_token);
       
       showAlert("앱아이콘 제작 완료!");
       console.log("앱아이콘 제작 완료!");
}
    
async function iconMake(os_name, os_size, save_folder_path, folder_token) {
    try {
        for (let i = 0; i < os_size.length; i++) {
            const file_path = `${save_folder_path}/${os_name}/${os_name}_${os_size[i]}.png`;
            const file_entry = await fs.createEntryWithUrl(`file:${file_path}`);
            const file_token = await fs.createSessionToken(file_entry);
            
            const doc = app.activeDocument;
            const doc_name = file_entry.name
            // const doc_name = file_entry.name.replace(".png", "")
    
            await executeAsModal(() => {docDuplicate(doc, doc_name)}, {"commandName": "Duplicate document"});
            const cur_doc = app.activeDocument;
            await executeAsModal(() => {docResizeCanvas(cur_doc, 1332)}, {"commandName": "Resize Canvas"});
            await executeAsModal(() => {docResizeImage(cur_doc, os_size[i])}, {"commandName": "Resize Image"});
            await executeAsModal(() => {saveForWebPNG(doc_name, folder_token, file_token)}, {"commandName": "SaveForWeb PNG"});
            await executeAsModal(() => {docCloseWithoutSaving(cur_doc)}, {"commandName": "Close"});
        }

    } catch (error) {
        console.log(error);
    }
}

async function adaptiveIconMake(os_name, layer_name, os_size, save_folder_path, folder_token) {
    for(let i = 0; i < os_size.length; i++) {
        const file_path = `${save_folder_path}/${os_name}/android_${os_size[i]}_${layer_name}.png`;
        const file_entry = await fs.createEntryWithUrl(`file:${file_path}`);
        const file_token = await fs.createSessionToken(file_entry);

        // Document 복제
        const doc = app.activeDocument;
        const doc_name = file_entry.name
        await executeAsModal(() => {docDuplicate(doc, doc_name)}, {"commandName": "Duplicate document"});
        
        // 지정된 레이어만 활성화
        const cur_doc = app.activeDocument;
        const lays = cur_doc.layers;

        for (let i = 0; i < lays.length; i++){
            if (lays[i].name == layer_name) {
            await executeAsModal(() => {layerVisible("show", lays[i].name)}, {"commandName": "Visible Layer"});
            } else {
            await executeAsModal(() => {layerVisible("hide", lays[i].name)}, {"commandName": "Visible Layer"});
            }
        }

        await executeAsModal(() => {docResizeImage(cur_doc, os_size[i])}, {"commandName": "Resize Image"});
        await executeAsModal(() => {saveForWebPNG(doc_name, folder_token, file_token)}, {"commandName": "SaveForWeb PNG"});
        await executeAsModal(() => {docCloseWithoutSaving(cur_doc)}, {"commandName": "Close"});
    }
}

async function appIconPSDGenerate() {
    const docSize = 2048;
    const frameSize = 1338;

    // TL좌표 : (355, 355) BR좌표 : (1693, 1693)
    await executeAsModal(() => createDoc("Origin", docSize, docSize, 72, 'RGBColorMode', 'transparent')); // document 생성
    const doc = app.activeDocument;
    const layer = doc.layers[0];
    console.log(layer.name);

    // "b" 그룹 생성
    await executeAsModal(async() => {
        await makeGroup("b");
        await createLay(doc);
        await moveLayer('next');
        await makeGroup("f");
        await makeShape(0,0,0,'rectangle',355,355,1693,1693,0,0,0,0,false,0,0,0,0);
        await moveLayer('next');
        await setLayerName("Frame");
        await setPathFinderType(1);
        await layOpacity(50);
        await setLocking(true);
        
    });
}

module.exports = {
    appIconMaker,
    appIconPSDGenerate
};