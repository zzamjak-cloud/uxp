const { batchPlay } = require("photoshop").action;

async function rectangularMarqueeTool(top_value, left_value, bottom_value, right_value) {
    console.log("Marquee Selection");
    await batchPlay(
       [
          {
             _obj: "set",
             _target: [
                {
                   _ref: "channel",
                   _property: "selection"
                }
             ],
             to: {
                _obj: "rectangle",
                top: {
                   _unit: "pixelsUnit",
                   _value: top_value
                },
                left: {
                   _unit: "pixelsUnit",
                   _value: left_value
                },
                bottom: {
                   _unit: "pixelsUnit",
                   _value: bottom_value
                },
                right: {
                   _unit: "pixelsUnit",
                   _value: right_value
                }
             },
             _options: {
                dialogOptions: "dontDisplay"
             }
          }
       ],
       {}
    );
}

async function setForegroundColor(r, g, b) {
   const result = await batchPlay(
      [
         {
            _obj: "set",
            _target: [
               {
                  _ref: "color",
                  _property: "foregroundColor"
               }
            ],
            to: {
               _obj: "RGBColor",
               red: r,
               grain: g,
               blue: b
            },
            source: "photoshopPicker",
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
}

// value : "forgroundColor", "backgroundColor"
async function fillColor(value) {
   const result = await batchPlay(
      [
         {
            _obj: "fill",
            using: {
               _enum: "fillContents",
               _value: value
            },
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
}

// shape : 'rectangle', 'ellipse'
async function makeShape(r, g, b, shape, top, left, bottom, right, topRight, topLeft, bottomLeft, bottomRight, strokeEnabled, strokeWith, stroke_R, stroke_G, stroke_B) {
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
}

// 0:Combine 1:Subtract 2:Intersect 3:Exclude Overraping
async function setPathFinderType(value) {
   const result = await batchPlay(
      [
         {
            _obj: "changePathDetails",
            keyOriginType: 3,
            keyOriginResolution: 72,
            keyActionMode: value,
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
}

module.exports = {
   fillColor,
   makeShape,
   rectangularMarqueeTool,
   setForegroundColor,
   setPathFinderType
};