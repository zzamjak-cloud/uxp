const { batchPlay } = require("photoshop").action;
const { DOCUMENT } = require('./constants');

// mode : DOCUMENT.COLOR_MODE, fill : DOCUMENT.BACKGROUND.TRANSPARENT
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

// 문서 복사 (레이어 복사)
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

// 컬러 모드 변환
async function convertColorMode(targetMode = DOCUMENT.COLOR_MODE.INDEXED_COLOR, options = {}) {
    const defaultOptions = {
        colors: 256,
        forced: { _enum: "forcedColors", _value: "none" },
        dither: { _enum: "dither", _value: "none" },
        palette: { _enum: "palette", _value: "adaptive" }
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    await batchPlay([{
        _obj: "convertMode",
        to: { _class: targetMode },
        ...finalOptions
    }], {});
}

// 문서 복사
async function docDuplicate(doc, docName) {
    await doc.duplicate(docName);
}

// Canvas 크기 조정
async function docResizeCanvas(doc, size) {
    await doc.resizeCanvas(size, size);
}

// Image 크기 조정 (옵션 설정)
async function docResizeOptions(doc, width, height, unitValue = 'pixelsUnit', interpolationValue = 'nearestNeighbor') {
   await batchPlay(
       [{
           _obj: "imageSize",
           constrainProportions: true,
           width: {
               _unit: unitValue,
               _value: width
           },
           height: {
               _unit: unitValue,
               _value: height
           },
           interfaceIconFrameDimmed: false,
           scaleStyles: true,
           useHistogram: false,
           interpolation: {
               _enum: "interpolationType",
               _value: interpolationValue
           }
       }],
       { synchronousExecution: true }
   );
}

// 문서 닫기 (저장하지 않음)
async function docCloseWithoutSaving(doc) {
    await doc.closeWithoutSaving();
}

// 레이어 보이기/숨기기
// show_hide : "show", "hide"
async function layerVisible(show_hide, name) {
    await batchPlay(
       [{
          _obj: show_hide,
          null: [{_ref: "layer", _name: name}],
          _options: {dialogOptions: "dontDisplay"}
       }], {}
    );
}

// 이전 문서 선택
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

module.exports = {
    createDoc,                // 문서 생성
    createDocCopyLayers,     // 문서 복사 (레이어 복사)
    convertColorMode,         // 컬러 모드 변환
    docDuplicate,             // 문서 복사
    docResizeCanvas,          // 문서 크기 조정
    docResizeOptions,         // 문서 이미지 크기 조정 (옵션 설정)
    docCloseWithoutSaving,   // 문서 닫기 (저장하지 않음)
    layerVisible,             // 레이어 보이기/숨기기
    selectPrevDoc,            // 이전 문서 선택
};