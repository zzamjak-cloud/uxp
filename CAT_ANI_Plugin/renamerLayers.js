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
                let numString = (maxNum - num).toString().padStart(1, '0');
                let set_name = `${layer.name}_${numString}`;
                await setName(layer.id, set_name);
                num += 1;
            }
        }

        /* 해당 텍스트 제거하기 (포토샵에서 레이어 이름을 제거할 수 없게 업데이트 되었음)
        if (actType === 'remove') {
            for (const layer of actLays) {
                let set_name = layer.name.replace(layer.name, "");
                await setName(layer.id, set_name);
            }
        }
        */

        // 텍스트 대체하기
        if (actType === 'replace') {
            for (const layer of actLays) {
                let set_name = layer.name.replace(textField.value, replaceTextField.value);
                await setName(layer.id, set_name);
            }
        }

        // 앞에 [ignore] 붙이기
        if (actType === 'ignore') {
            for (const layer of actLays) {
                let set_name = `[ignore]${layer.name}`
                await setName(layer.id, set_name)
            }
        }

        // 앞에 [folder]붙이기
        if (actType === 'folder') {
            for (const layer of actLays) {
                let set_name = `[folder]${layer.name}`
                await setName(layer.id, set_name)
            }
        }

        // 앞에 [origin]붙이기
        if (actType === 'origin') {
            for (const layer of actLays) {
                let set_name = `[origin]${layer.name}`
                await setName(layer.id, set_name)
            }
        }

        // 앞에 [merge]붙이기
        if (actType === 'merge') {
            for (const layer of actLays) {
                let set_name = `[merge]${layer.name}`
                await setName(layer.id, set_name)
            }
        }

        // body붙이기
        if (actType === 'body') {
            for (const layer of actLays) {
                let set_name = `body`
                await setName(layer.id, set_name)
            }
        }

        // arm붙이기
        if (actType === 'arm') {
            for (const layer of actLays) {
                let set_name = `arm`
                await setName(layer.id, set_name)
            }
        }

        // leg붙이기
        if (actType === 'leg') {
            for (const layer of actLays) {
                let set_name = `leg`
                await setName(layer.id, set_name)
            }
        }

        // foot 붙이기
        if (actType === 'foot') {
            for (const layer of actLays) {
                let set_name = `foot`
                await setName(layer.id, set_name)
            }
        }

        // hair 붙이기
        if (actType === 'hair') {
            for (const layer of actLays) {
                let set_name = `hair`
                await setName(layer.id, set_name)
            }
        }

        // _F_ 붙이기
        if (actType === '_F_') {
            for (const layer of actLays) {
                let set_name = `${layer.name}_F_`
                await setName(layer.id, set_name)
            }
        }

        // _B_ 붙이기
        if (actType === '_B_') {
            for (const layer of actLays) {
                let set_name = `${layer.name}_B_`
                await setName(layer.id, set_name)
            }
        }

        // _R_ 붙이기
        if (actType === '_R_') {
            for (const layer of actLays) {
                let set_name = `${layer.name}_R_`
                await setName(layer.id, set_name)
            }
        }

        // _L_ 붙이기
        if (actType === '_L_') {
            for (const layer of actLays) {
                let set_name = `${layer.name}_L_`
                await setName(layer.id, set_name)
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