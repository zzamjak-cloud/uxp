const { batchPlay } = require("photoshop").action;

/**
 * 기존 레이어의 경로를 모양 레이어로 변환
 * @param {number} pathID - 변환할 레이어의 ID
 * @returns {Promise} batchPlay 결과
 */
async function convertPathToShape(layer_id, r, g, b) {
   const result = await batchPlay(
      [
         {
            _obj: "make",
            _target: [
               {
                  _ref: "contentLayer"
               }
            ],
            using: {
               _obj: "contentLayer",
               type: {
                  _obj: "solidColorLayer",
                  color: {
                     _obj: "RGBColor",
                     red: r,
                     grain: g,
                     blue: b
                  }
               },
               shape: {
                  _obj: "pathClass",
                  targetPath: {
                     _enum: "pathKind",
                     _value: "targetPath"
                  }
               },
               strokeStyle: {
                  _obj: "strokeStyle",
                  strokeStyleVersion: 2,
                  strokeEnabled: false,
                  fillEnabled: true,
                  strokeStyleLineWidth: {
                     _unit: "pixelsUnit",
                     _value: 1
                  },
                  strokeStyleLineDashOffset: {
                     _unit: "pointsUnit",
                     _value: 0
                  },
                  strokeStyleMiterLimit: 100,
                  strokeStyleLineCapType: {
                     _enum: "strokeStyleLineCapType",
                     _value: "strokeStyleButtCap"
                  },
                  strokeStyleLineJoinType: {
                     _enum: "strokeStyleLineJoinType",
                     _value: "strokeStyleMiterJoin"
                  },
                  strokeStyleLineAlignment: {
                     _enum: "strokeStyleLineAlignment",
                     _value: "strokeStyleAlignCenter"
                  },
                  strokeStyleScaleLock: false,
                  strokeStyleStrokeAdjust: false,
                  strokeStyleLineDashSet: [],
                  strokeStyleBlendMode: {
                     _enum: "blendMode",
                     _value: "normal"
                  },
                  strokeStyleOpacity: {
                     _unit: "percentUnit",
                     _value: 100
                  },
                  strokeStyleContent: {
                     _obj: "solidColorLayer",
                     color: {
                        _obj: "RGBColor",
                        red: 0,
                        grain: 0,
                        blue: 0
                     }
                  },
                  strokeStyleResolution: 72
               }
            },
            layerID: layer_id,
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
   return result;
}

/**
 * 커스텀 모양을 생성
 * @param {number} r - 빨간색 값 (0-1)
 * @param {number} g - 초록색 값 (0-1)
 * @param {number} b - 파란색 값 (0-1)
 * @param {string} shape - 모양 타입 (예: 'rectangle', 'ellipse')
 * @param {number} top - 상단 위치
 * @param {number} left - 좌측 위치
 * @param {number} bottom - 하단 위치
 * @param {number} right - 우측 위치
 * @param {number} topRight - 우상단 모서리
 * @param {number} topLeft - 좌상단 모서리
 * @param {number} bottomLeft - 좌하단 모서리
 * @param {number} bottomRight - 우하단 모서리
 * @param {boolean} strokeEnabled - 스트로크 활성화 여부
 * @param {number} strokeWith - 스트로크 두께
 * @param {number} stroke_R - 스트로크 빨간색 값
 * @param {number} stroke_G - 스트로크 초록색 값
 * @param {number} stroke_B - 스트로크 파란색 값
 * @returns {Promise} batchPlay 결과
 */
async function createCustomShape(r, g, b, shape, top, left, bottom, right, topRight, topLeft, bottomLeft, bottomRight, strokeEnabled, strokeWith, stroke_R, stroke_G, stroke_B) {
   const result = await batchPlay(
      [
         {
            _obj: "make",
            _target: [
               {
                  _ref: "contentLayer"
               }
            ],
            using: {
               _obj: "contentLayer",
               type: {
                  _obj: "solidColorLayer",
                  color: {
                     _obj: "RGBColor",
                     red: r,
                     grain: g,
                     blue: b
                  }
               },
               shape: {
                  _obj: shape,
                  unitValueQuadVersion: 1,
                  top: {
                     _unit: "pixelsUnit",
                     _value: top
                  },
                  left: {
                     _unit: "pixelsUnit",
                     _value: left
                  },
                  bottom: {
                     _unit: "pixelsUnit",
                     _value: bottom
                  },
                  right: {
                     _unit: "pixelsUnit",
                     _value: right
                  },
                  topRight: {
                     _unit: "pixelsUnit",
                     _value: topRight
                  },
                  topLeft: {
                     _unit: "pixelsUnit",
                     _value: topLeft
                  },
                  bottomLeft: {
                     _unit: "pixelsUnit",
                     _value: bottomLeft
                  },
                  bottomRight: {
                     _unit: "pixelsUnit",
                     _value: bottomRight
                  }
               },
               strokeStyle: {
                  _obj: "strokeStyle",
                  strokeStyleVersion: 2,
                  strokeEnabled: strokeEnabled,
                  fillEnabled: true,
                  strokeStyleLineWidth: {
                     _unit: "pixelsUnit",
                     _value: strokeWith
                  },
                  strokeStyleLineDashOffset: {
                     _unit: "pointsUnit",
                     _value: 0
                  },
                  strokeStyleMiterLimit: 100,
                  strokeStyleLineCapType: {
                     _enum: "strokeStyleLineCapType",
                     _value: "strokeStyleButtCap"
                  },
                  strokeStyleLineJoinType: {
                     _enum: "strokeStyleLineJoinType",
                     _value: "strokeStyleMiterJoin"
                  },
                  strokeStyleLineAlignment: {
                     _enum: "strokeStyleLineAlignment",
                     _value: "strokeStyleAlignCenter"
                  },
                  strokeStyleScaleLock: false,
                  strokeStyleStrokeAdjust: false,
                  strokeStyleLineDashSet: [],
                  strokeStyleBlendMode: {
                     _enum: "blendMode",
                     _value: "normal"
                  },
                  strokeStyleOpacity: {
                     _unit: "percentUnit",
                     _value: 100
                  },
                  strokeStyleContent: {
                     _obj: "solidColorLayer",
                     color: {
                        _obj: "RGBColor",
                        red: stroke_R,
                        grain: stroke_G,
                        blue: stroke_B
                     }
                  },
                  strokeStyleResolution: 72
               }
            },
            pathID: 9,
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
   return result;
}

// pathContents를 사용하여 Shape Layer 생성
async function createShapeFromPathContents(pathContents, red = 0, green = 0, blue = 0) {
    const result = await batchPlay([
        {
            "_obj": "make",
            "_target": [
                {
                    "_ref": "contentLayer"
                }
            ],
            "using": {
                "_obj": "contentLayer",
                "type": {
                    "_obj": "solidColorLayer",
                    "color": {
                        "_obj": "RGBColor",
                        "red": red,
                        "grain": green,
                        "blue": blue
                    }
                },
                "shape": pathContents,  // ⭐ pathContents를 직접 shape으로 사용
                "strokeStyle": {
                    "_obj": "strokeStyle",
                    "strokeStyleVersion": 2,
                    "strokeEnabled": false,
                    "fillEnabled": true,
                    "strokeStyleLineWidth": {
                        "_unit": "pixelsUnit",
                        "_value": 1
                    },
                    "strokeStyleLineDashOffset": {
                        "_unit": "pointsUnit",
                        "_value": 0
                    },
                    "strokeStyleMiterLimit": 100,
                    "strokeStyleLineCapType": {
                        "_enum": "strokeStyleLineCapType",
                        "_value": "strokeStyleButtCap"
                    },
                    "strokeStyleLineJoinType": {
                        "_enum": "strokeStyleLineJoinType",
                        "_value": "strokeStyleMiterJoin"
                    },
                    "strokeStyleLineAlignment": {
                        "_enum": "strokeStyleLineAlignment",
                        "_value": "strokeStyleAlignCenter"
                    },
                    "strokeStyleScaleLock": false,
                    "strokeStyleStrokeAdjust": false,
                    "strokeStyleLineDashSet": [],
                    "strokeStyleBlendMode": {
                        "_enum": "blendMode",
                        "_value": "normal"
                    },
                    "strokeStyleOpacity": {
                        "_unit": "percentUnit",
                        "_value": 100
                    },
                    "strokeStyleContent": {
                        "_obj": "solidColorLayer",
                        "color": {
                            "_obj": "RGBColor",
                            "red": 0,
                            "grain": 0,
                            "blue": 0
                        }
                    },
                    "strokeStyleResolution": 72
                }
            },
            "_isCommand": true
        }
    ], {
        synchronousExecution: false,
        modalBehavior: "execute"
    });

    // console.log("Shape creation result:", result);
    return result;
}

// WorkPath 정보 얻기
async function getWorkPath() {
    const result = await batchPlay([
       {
           _obj: "get",
           _target: [{
               _ref: "path",
               _property: "workPath"
           }]
       }
    ], {});
    return result;
 }

// Work Path의 pathContents 데이터 가져오기
async function getWorkPathContents(name) {
    try {
        // Work Path의 전체 정보 가져오기 (방법 3이 성공적으로 작동함)
        const result = await batchPlay([
            {
                "_obj": "get",
                "_target": [
                    {
                        "_ref": "path",
                        "_name": name
                    }
                ],
                "_isCommand": false
            }
        ], {
            synchronousExecution: true
        });

        console.log("getWorkPathContents result:", result);
        
        if (result && result.length > 0) {
            const pathData = result[0];
            
            // pathContents 속성 확인
            if (pathData.pathContents) {
                console.log("Found pathContents:", pathData.pathContents);
                return pathData.pathContents;
            }
            
            console.log("pathContents not found in path data");
            return null;
        }

        console.log("No path data found");
        return null;
    } catch (error) {
        console.error("Error getting Work Path contents:", error);
        return null;
    }
}

// Work Path를 선택
async function selectWorkPath() {
   await batchPlay(
      [
        {
            "_obj": "select",
            "_target": [
               {
                  "_ref": "path",
                  "_property": "workPath"
               }
            ],
            "_isCommand": false
         }
      ],
      {}
   );
}

// 이름으로 Path 선택
async function selectPathByName(name) {
   const result = await batchPlay(
      [
        {
            "_obj": "select",
            "_target": [
               {
                  "_ref": "path",
                  "_name": name
               }
            ],
            "_isCommand": false
         }
      ],
      {}
   );
   return result;
}


/**
 * 선택 영역을 WorkPath로 변환
 * @param {number} value - 허용 오차 값 (0-100)
 * @returns {Promise} batchPlay 결과
 */
async function makeWorkPath(value) {
   const result = await batchPlay(
      [
         {
            _obj: "make",
            _target: [
               {
                  _ref: "path"
               }
            ],
            from: {
               _ref: "selectionClass",
               _property: "selection"
            },
            tolerance: {
               _unit: "pixelsUnit",
               _value: value
            },
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
   return result;
}

//  Path를 레이어로 변환
async function makeLayerFromPath(r, g, b) {
   const result = await batchPlay(
      [
        {
            "_obj": "make",
            "_target": [
               {
                  "_ref": "contentLayer"
               }
            ],
            "using": {
               "_obj": "contentLayer",
               "type": {
                  "_obj": "solidColorLayer",
                  "color": {
                     "_obj": "RGBColor",
                     "red": r,
                     "grain": g,
                     "blue": b
                  }
               },
               "shape": {
                  "_obj": "pathClass",
                  "targetPath": {
                     "_enum": "pathKind",
                     "_value": "targetPath"
                  }
               },
               "strokeStyle": {
                  "_obj": "strokeStyle",
                  "strokeStyleVersion": 2,
                  "strokeEnabled": false,
                  "fillEnabled": true,
                  "strokeStyleLineWidth": {
                     "_unit": "pixelsUnit",
                     "_value": 1
                  },
                  "strokeStyleLineDashOffset": {
                     "_unit": "pointsUnit",
                     "_value": 0
                  },
                  "strokeStyleMiterLimit": 100,
                  "strokeStyleLineCapType": {
                     "_enum": "strokeStyleLineCapType",
                     "_value": "strokeStyleButtCap"
                  },
                  "strokeStyleLineJoinType": {
                     "_enum": "strokeStyleLineJoinType",
                     "_value": "strokeStyleMiterJoin"
                  },
                  "strokeStyleLineAlignment": {
                     "_enum": "strokeStyleLineAlignment",
                     "_value": "strokeStyleAlignCenter"
                  },
                  "strokeStyleScaleLock": false,
                  "strokeStyleStrokeAdjust": false,
                  "strokeStyleLineDashSet": [],
                  "strokeStyleBlendMode": {
                     "_enum": "blendMode",
                     "_value": "normal"
                  },
                  "strokeStyleOpacity": {
                     "_unit": "percentUnit",
                     "_value": 100
                  },
                  "strokeStyleContent": {
                     "_obj": "solidColorLayer",
                     "color": {
                        "_obj": "RGBColor",
                        "red": 0,
                        "grain": 0,
                        "blue": 0
                     }
                  },
                  "strokeStyleResolution": 72
               }
            },
            "_isCommand": false
         }
      ],
      {}
   );
   return result;
}

module.exports = {
    convertPathToShape,
    createCustomShape,
    createShapeFromPathContents,
    getWorkPath,
    getWorkPathContents,
    makeWorkPath,
    selectWorkPath,
    selectPathByName,
    makeLayerFromPath
}