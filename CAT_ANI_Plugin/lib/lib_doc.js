const { batchPlay } = require("photoshop").action;

// mode : "RGBColorMode", fill : "transparent"
async function createDoc(name, width, height, resolution, mode, fill) {
    await app.createDocument({
        name: name,
        width: width,
        height: height,
        resolution: resolution,
        mode: mode,
        fill: fill
    })
}

async function selectPrevDoc() {
    const result = await batchPlay(
       [
          {
             _obj: "select",
             _target: [
                {
                   _ref: "document",
                   _offset: -1
                }
             ],
             _options: {
                dialogOptions: "dontDisplay"
             }
          }
       ],
       {}
    );
 }

async function docDuplicate(doc, docName) {
    await doc.duplicate(docName);
}

async function docResizeCanvas(doc, size) {
    await doc.resizeCanvas(size, size);
}

async function docResizeImage(doc, size) {
    await doc.resizeImage(size, size);
}

async function docCloseWithoutSaving(doc) {
    await doc.closeWithoutSaving();
}

async function createDocCopyLayers(doc_name) {
    const result = await batchPlay(
       [
          {
             _obj: "make",
             _target: [
                {
                   _ref: "document"
                }
             ],
             name: doc_name,
             using: {
                _ref: "layer",
                _enum: "ordinal",
                _value: "targetEnum"
             },
             version: 5,
             _options: {
                dialogOptions: "dontDisplay"
             }
          }
       ],
       {}
    );
}

async function layerVisible(show_hide, name) {
    await batchPlay(
       [{
          _obj: show_hide,
          null: [{_ref: "layer", _name: name}],
          _options: {dialogOptions: "dontDisplay"}
       }], {}
    );
}

module.exports = {
    createDoc,
    selectPrevDoc,
    docDuplicate,
    docResizeCanvas,
    docResizeImage,
    docCloseWithoutSaving,
    createDocCopyLayers,
    layerVisible
};