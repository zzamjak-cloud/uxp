const app = require('photoshop').app;
const {executeAsModal} = require("photoshop").core;
const {selectLayerByName, setLayerName, deleteLayer, layerTranslate, layerTrim, actionCommands} = require("./lib/lib_layer");
const {showAlert} = require("./lib/lib");
const {rectangularMarqueeTool} = require("./lib/lib_tool");

async function patchMaker() {
    const doc = app.activeDocument;
    const lays = doc.layers;

    // 레이어 이름 변경 => "Source"
    const layer_name = "Source";
    await executeAsModal(() => {selectLayerByName(lays[0].name)}, {"commandName": "Select Layer"});
    await executeAsModal(() => {setLayerName(layer_name)}, {"commandName": "Rename Layer"});

    await executeAsModal(layerTrim, {"commandName": "Trim"});

    // 현재 레이어의 Bounds & Guides를 획득
    const guides = doc.guides;
    if (guides.length === 0) {
        showAlert("가이드가 없습니다.");
        return;
    }

    // 레이어 바운즈 얻기
    const boundArray = lays[0].bounds;
    const top = boundArray["_top"];
    const left = boundArray["_left"];
    const bottom = boundArray["_bottom"];
    const right = boundArray["_right"];
    const width = boundArray["width"];
    const height = boundArray["height"];
    console.log(`top:${top}, left:${left}, bottom:${bottom}, right:${right} width:${width}, height:${height}`);

    // 가이드 리스트 얻기
    const guideArray = getGuides(guides);
    
    console.log(`vertical 가이드 : ${guideArray[0].length}`);
    console.log(`horizontal 가이드 : ${guideArray[1].length}`);

    // vertical, horizontal 모두 비대칭일 경우
    if(guideArray[0].length == 2 && guideArray[1].length == 2) {

        let v1 = guideArray[0][0];
        let v2 = guideArray[0][1];
        let h1 = guideArray[1][0];
        let h2 = guideArray[1][1];

        allPatch (v1, v2, h1, h2);
    
    // Vertical 비대칭일 경우
    } else if (guideArray[0].length == 2 && guideArray[1].length == 0) {

        console.log("Vertical Patch");

        let v1 = guideArray[0][0];
        let v2 = guideArray[0][1];

        verticalPatch (v1, v2)

    // Horizontal 비대칭인 경우
    } else if (guideArray[0].length == 0 && guideArray[1].length == 2) {

        console.log("Horizontal Patch");

        let h1 = guideArray[1][0];
        let h2 = guideArray[1][1];

        horizontalPatch (h1, h2)

    // Vertical 대칭일 경우
    } else if(guideArray[0].length == 1 && guideArray[1].length == 0) {

        console.log("Vertical Symetry");

        let v1 = guideArray[0][0];
        let v2 = null;

        if (v1 < (width * 0.5)) {
            v2 = width - v1;
        } else if (v1 > (width * 0.5)) {
            v2 = v1;
            v1 = width - v1;
        }

        verticalPatch (v1, v2)

    // Horisontal 대칭인 경우
    } else if(guideArray[0].length == 0 && guideArray[1].length == 1) {

        console.log("Horizontal Symetry");

        let h1 = guideArray[1][0];
        let h2 = null;

        if (h1 < (height * 0.5)) {
            h2 = height - h1;
        } else if (h1 > (height * 0.5)) {
            h2 = h1;
            h1 = height - h1;
        }

        horizontalPatch (h1, h2);

    // Vertical, Horizontal 모두 대칭인 경우
    } else if(guideArray[0].length == 1 && guideArray[1].length == 1) {

        console.log("All Symetry");

        let v1 = guideArray[0][0];
        let v2 = null;
        let h1 = guideArray[1][0];
        let h2 = null;

        if (v1 < (width * 0.5)) {
            v2 = width - v1;
        } else if (v1 > (width * 0.5)) {
            v2 = v1;
            v1 = width - v1;
        }

        if (h1 < (height * 0.5)) {
            h2 = height - h1;
        } else if (h1 > (height * 0.5)) {
            h2 = h1;
            h1 = height - h1;
        }

        allPatch (v1, v2, h1, h2);

    // Vertical은 대칭이고 Horizontal은 비대칭인 경우
    } else if(guideArray[0].length == 1 && guideArray[1].length == 2) {

        let v1 = guideArray[0][0];
        let v2 = null;
        let h1 = guideArray[1][0];
        let h2 = guideArray[1][1];

        if (v1 < (width * 0.5)) {
            v2 = width - v1;
        } else if (v1 > (width * 0.5)) {
            v2 = v1;
            v1 = width - v1;
        }

        allPatch (v1, v2, h1, h2);

    // Vertical은 비대칭이고 Horizontal은 대칭인 경우
    } else if(guideArray[0].length == 2 && guideArray[1].length == 1) {

        let v1 = guideArray[0][0];
        let v2 = guideArray[0][1];
        let h1 = guideArray[1][0];
        let h2 = null;

        if (h1 < (height * 0.5)) {
            h2 = height - h1;
        } else if (h1 > (height * 0.5)) {
            h2 = h1;
            h1 = height - h1;
        }

        allPatch (v1, v2, h1, h2);

    // 가이드가 너무 많을 경우
    } else if(guideArray[0].length > 2 || guideArray[1].length > 2) {	
		showAlert("Guide가 너무 많습니다.");
    }

    async function allPatch (v1, v2, h1, h2) {
        // left Cut
        await executeAsModal(() => {rectangularMarqueeTool(top, left, bottom, v1)}, {"commandName": "Marquee"});
        await executeAsModal(() => {actionCommands("cutToLayer")}, {"commandName": "command"});
        await executeAsModal(() => {setLayerName("left")}, {"commandName": "Rename Layer"});
        await executeAsModal(() => {selectLayerByName(layer_name)}, {"commandName": "Select Layer"});
        // Right Cut
        await executeAsModal(() => {rectangularMarqueeTool(top, v2, bottom, right)}, {"commandName": "Marquee"});
        await executeAsModal(() => {actionCommands("cutToLayer")}, {"commandName": "command"});
        await executeAsModal(() => {setLayerName("right")}, {"commandName": "Rename Layer"});
        await executeAsModal(() => {selectLayerByName(layer_name)}, {"commandName": "Select Layer"});
        
        // Delete Layer "Source"
        await executeAsModal(deleteLayer, {"commandName": "Delete Layer"});

        // Layer Translate X
        await executeAsModal(() => {selectLayerByName("right")}, {"commandName": "Select Layer"});
        await executeAsModal(() => {layerTranslate(doc.activeLayers[0], -(v2-v1), 0)}, {"commandName": "Layer Translate"});
        await executeAsModal(() => {actionCommands("mergeVisible")}, {"commandName": "command"});
        await executeAsModal(layerTrim, {"commandName": "Trim"});
        
        // layer Name "Source"
        await executeAsModal(() => {setLayerName(layer_name)}, {"commandName": "Rename Layer"});

        // top Cut
        await executeAsModal(() => {rectangularMarqueeTool(top, left, h1, width - (v2-v1))}, {"commandName": "Marquee"});
        await executeAsModal(() => {actionCommands("cutToLayer")}, {"commandName": "command"});
        await executeAsModal(() => {setLayerName("top")}, {"commandName": "Rename Layer"});
        await executeAsModal(() => {selectLayerByName(layer_name)}, {"commandName": "Select Layer"});
        // bottom Cut
        await executeAsModal(() => {rectangularMarqueeTool(h2, left, bottom, width - (v2-v1))}, {"commandName": "Marquee"});
        await executeAsModal(() => {actionCommands("cutToLayer")}, {"commandName": "command"});
        await executeAsModal(() => {setLayerName("bottom")}, {"commandName": "Rename Layer"});
        await executeAsModal(() => {selectLayerByName(layer_name)}, {"commandName": "Select Layer"});

        // Delete Layer "Source"
        await executeAsModal(deleteLayer, {"commandName": "Delete Layer"});

        // Layer Translate Y
        await executeAsModal(() => {selectLayerByName("bottom")}, {"commandName": "Select Layer"});
        await executeAsModal(() => {layerTranslate(doc.activeLayers[0], 0, -(h2-h1))}, {"commandName": "Layer Translate"});
        await executeAsModal(() => {actionCommands("mergeVisible")}, {"commandName": "command"});
        await executeAsModal(layerTrim, {"commandName": "Trim"});

        // layer Name "Source"
        await executeAsModal(() => {setLayerName(layer_name)}, {"commandName": "Rename Layer"});

        // 모든 가이드 제거
        await executeAsModal(() => {actionCommands("clearAllGuides")}, {"commandName": "command"});
    }

    async function verticalPatch (v1, v2) {
        // left Cut
        await executeAsModal(() => {rectangularMarqueeTool(top, left, bottom, v1)}, {"commandName": "Marquee"});
        await executeAsModal(() => {actionCommands("cutToLayer")}, {"commandName": "command"});
        await executeAsModal(() => {setLayerName("left")}, {"commandName": "Rename Layer"});
        await executeAsModal(() => {selectLayerByName(layer_name)}, {"commandName": "Select Layer"});
        // Right Cut
        await executeAsModal(() => {rectangularMarqueeTool(top, v2, bottom, right)}, {"commandName": "Marquee"});
        await executeAsModal(() => {actionCommands("cutToLayer")}, {"commandName": "command"});
        await executeAsModal(() => {setLayerName("right")}, {"commandName": "Rename Layer"});
        await executeAsModal(() => {selectLayerByName(layer_name)}, {"commandName": "Select Layer"});
        
        // Delete Layer "Source"
        await executeAsModal(deleteLayer, {"commandName": "Delete Layer"});

        // Layer Translate X
        await executeAsModal(() => {selectLayerByName("right")}, {"commandName": "Select Layer"});
        await executeAsModal(() => {layerTranslate(doc.activeLayers[0], -(v2-v1), 0)}, {"commandName": "Layer Translate"});
        await executeAsModal(() => {actionCommands("mergeVisible")}, {"commandName": "command"});
        await executeAsModal(layerTrim, {"commandName": "Trim"});
        
        // layer Name "Source"
        await executeAsModal(() => {setLayerName(layer_name)}, {"commandName": "Rename Layer"});
        
        // 모든 가이드 제거
        await executeAsModal(() => {actionCommands("clearAllGuides")}, {"commandName": "command"});
    }

    async function horizontalPatch (h1, h2) {
        // top Cut
        await executeAsModal(() => {rectangularMarqueeTool(top, left, h1, width)}, {"commandName": "Marquee"});
        await executeAsModal(() => {actionCommands("cutToLayer")}, {"commandName": "command"});
        await executeAsModal(() => {setLayerName("top")}, {"commandName": "Rename Layer"});
        await executeAsModal(() => {selectLayerByName(layer_name)}, {"commandName": "Select Layer"});
        // bottom Cut
        await executeAsModal(() => {rectangularMarqueeTool(h2, left, bottom, width)}, {"commandName": "Marquee"});
        await executeAsModal(() => {actionCommands("cutToLayer")}, {"commandName": "command"});
        await executeAsModal(() => {setLayerName("bottom")}, {"commandName": "Rename Layer"});
        await executeAsModal(() => {selectLayerByName(layer_name)}, {"commandName": "Select Layer"});

        // Delete Layer "Source"
        await executeAsModal(deleteLayer, {"commandName": "Delete Layer"});

        // Layer Translate Y
        await executeAsModal(() => {selectLayerByName("bottom")}, {"commandName": "Select Layer"});
        await executeAsModal(() => {layerTranslate(doc.activeLayers[0], 0, -(h2-h1))}, {"commandName": "Layer Translate"});
        await executeAsModal(() => {actionCommands("mergeVisible")}, {"commandName": "command"});
        await executeAsModal(layerTrim, {"commandName": "Trim"});

        // layer Name "Source"
        await executeAsModal(() => {setLayerName(layer_name)}, {"commandName": "Rename Layer"});

        // 모든 가이드 제거
        await executeAsModal(() => {actionCommands("clearAllGuides")}, {"commandName": "command"});
    }
}


function getGuides(guides) {
    // 가이드 얻기
    const guideArray = [[],[]]; // [[방향, 좌표], [방향, 좌표], ...]
    for (let i = 0; i < guides.length; i++) {
        const guide = guides[i];
        const g_direction = (guide.direction === "vertical") ? 0 : 1; // vertical = 0, horizontal = 1
        const g_coordinate = guide.coordinate;
        guideArray[g_direction].push(parseInt(g_coordinate));
    }

    let v1 = Math.round(guideArray[0][0]);
    let v2 = Math.round(guideArray[0][1]);
    let h1 = Math.round(guideArray[1][0]);
    let h2 = Math.round(guideArray[1][1]);

    // 순서 재배열
    if(v1 > v2) {
        guideArray[0].shift();
        guideArray[0].push(v1);
    }
    if(h1 > h2) {
        guideArray[1].shift();
        guideArray[1].push(h1);
    }
    return guideArray
}

module.exports = {
    patchMaker
};