const app = require("photoshop").app;
const lfs = require('uxp').storage.localFileSystem;
const { executeAsModal } = require('photoshop').core;
const { showAlert } = require("./lib/lib");
const { setLayerName, selectLayerByName } = require("./lib/lib_layer");


async function test() {
    app.activeDocument.suspendHistory( async () => {
        const lays = app.activeDocument.layers;
        for (const layer  of lays) {
            const setName = "test"
            await executeAsModal( async() => {
                selectLayerByName(layer.name);
                setLayerName(setName);
            },{});
        }
        showAlert("히스토리 저장!!!");
    }, "Layer Rename");
}


module.exports.test = test;

