const { batchPlay } = require("photoshop").action;

const RESAMPLE_METHOD = {
   AUTOMATIC: 'automaticInterpolation',
   PRESERVE_DETAILS: 'preserveDetailsUpscale',  // 확대 시 디테일 유지
   BICUBIC_SHARPER: 'bicubicSharper',          // 축소 시 선명하게
   BICUBIC_SMOOTHER: 'bicubicSmoother',        // 확대 시 부드럽게
   BICUBIC: 'bicubic',                         // 일반적인 용도
   NEAREST_NEIGHBOR: 'nearestNeighbor',        // 픽셀아트 등에 적합
   BILINEAR: 'bilinear'                        // 기본 보간법
};

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

async function docResizeImage(doc, size, sampleMethodName) {
   await batchPlay(
       [{
           _obj: "imageSize",
           constrainProportions: true,
           width: {
               _unit: "pixelsUnit",
               _value: size
           },
           height: {
               _unit: "pixelsUnit",
               _value: size
           },
           interfaceIconFrameDimmed: false,
           scaleStyles: true,
           useHistogram: false,
           interpolation: {
               _enum: "interpolationType",
               _value: sampleMethodName
           }
       }],
       { synchronousExecution: true }
   );
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
    createDoc,                // 문서 생성
    selectPrevDoc,            // 이전 문서 선택
    docDuplicate,             // 문서 복사
    docResizeCanvas,          // 문서 크기 조정
    docResizeImage,           // 문서 이미지 크기 조정
    docCloseWithoutSaving,   // 문서 닫기 (저장하지 않음)
    createDocCopyLayers,     // 문서 복사 (레이어 복사)
    layerVisible             // 레이어 보이기/숨기기
};