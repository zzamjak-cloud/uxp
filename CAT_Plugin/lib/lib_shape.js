const { batchPlay } = require("photoshop").action;

/**
 * 기존 레이어의 경로를 모양 레이어로 변환
 * @param {number} layerID - 변환할 레이어의 ID
 * @returns {Promise} batchPlay 결과
 */
async function convertPathToShape(layerID) {
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
                     red: 0.0,
                     grain: 0.0,
                     blue: 0.0
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
            layerID: layerID,
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
            layerID: 9,
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

module.exports = {
    convertPathToShape,
    createCustomShape,
    makeWorkPath
}