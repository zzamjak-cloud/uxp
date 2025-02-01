const app = require("photoshop").app;
const { executeAsModal } = require("photoshop").core;
const { showAlert } = require("./lib/lib");
const { setLayerName, selectByLayerID } = require("./lib/lib_layer");

// "prefix", "sufix", "rename", "replace", "remove"
async function renamerLayers(actType) {

    try {
        const actLays = app.activeDocument.activeLayers;
        const textField = document.getElementById('renameText');
        const replaceTextField = document.getElementById('replaceText');
        
        // 앞에 붙이기
        if (actType === 'prefix') {
            for (const layer of actLays) {
                let set_name = `${textField.value}${layer.name}`
                await setName(layer.id, set_name)
            }
        }
    
        // 이름 바꾸기
        if (actType === 'rename') {
            for (const layer of actLays) {
                let set_name = `${textField.value}`
                await setName(layer.id, set_name)
            }
        }
    
        // 뒤에 붙이기
        if (actType === 'sufix') {
            for (const layer of actLays) {
                let set_name = `${layer.name}${textField.value}`
                await setName(layer.id, set_name)
            }
        }
        // 뒤에 숫자 붙이기
        if (actType === 'number') {
            let num = 0;
            const maxNum = actLays.length
            for (const layer of actLays) {
                let numString = (maxNum - num).toString().padStart(2, '0');
                let set_name = `${layer.name}_${numString}`;
                await setName(layer.id, set_name)
                num += 1;
            }
        }
        // 뒤에 숫자 붙이기 (역순)
        if (actType === 'reversenumber') {
            let num = 0;
            const maxNum = actLays.length;
            const reversedLays = [...actLays].reverse(); // 배열 복사 후 역순으로
            for (const layer of reversedLays) {
                let numString = (maxNum - num).toString().padStart(2, '0');
                let set_name = `${layer.name}_${numString}`;
                await setName(layer.id, set_name);
                num += 1;
            }
        }

        // 해당 텍스트 제거하기
        if (actType === 'remove') {
            for (const layer of actLays) {
                let set_name = layer.name.replace(textField.value, "");
                await setName(layer.id, set_name);
            }
        }

        // 텍스트 대체하기
        if (actType === 'replace') {
            for (const layer of actLays) {
                let set_name = layer.name.replace(textField.value, replaceTextField.value);
                await setName(layer.id, set_name);
            }
        }
        
    } catch (e) {
        console.log(e.message);
    }
}

async function setName(layerID, setName) {
    await executeAsModal( async() => {
        selectByLayerID(layerID)
        setLayerName(setName);
    },{});
}

module.exports = {
    renamerLayers
}