const { batchPlay } = require("photoshop").action;

async function createLay(doc) {
   await doc.createLayer();
}

async function setLayerName(layer_name) {
   const action = {
      _obj: "set",
      _target: [
         {
            _ref: "layer",
            _enum: "ordinal",
            _value: "targetEnum"
         }
      ],
      to: {
         _obj: "layer",
         name: layer_name
      },
      _options: {
         dialogOptions: "dontDisplay"
      }
   }
   await batchPlay([action], {});
}

async function selectLayerByName(layer_name) {
   await batchPlay(
      [
         {
            _obj: "select",
            _target: [
               {
                  _ref: "layer",
                  _name: layer_name
               }
            ],
            makeVisible: false,
            layerID: [
               5
            ],
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
}

async function selectByLayerID(layerID) {
   //  console.log("-------------------------");
    try{
        const action = {
            _obj: "select",
            _target: [
               {
                  _ref: "layer",
                  _id: layerID
               }
            ],
            makeVisible: false,
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
        await batchPlay([action],{});
        
        // await batchPlay([actionDescriptor], {});
        
    } catch(e) {
        console.log(e.message);
    }
}

async function addSelectLayer(layerID, layerID_array) {
   const result = await batchPlay(
      [
         {
            _obj: "select",
            _target: [
               {
                  _ref: "layer",
                  _id: layerID
               }
            ],
            selectionModifier: {
               _enum: "selectionModifierType",
               _value: "addToSelectionContinuous"
            },
            makeVisible: false,
            layerID: layerID_array,
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
}


// "selectNoLayers"
async function selectNoLays() {
    await batchPlay(
       [
          {
             _obj: "selectNoLayers",
             _target: [
                {
                   _ref: "layer",
                   _enum: "ordinal",
                   _value: "targetEnum"
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


async function deleteLayer() {
    await batchPlay(
       [
          {
             _obj: "delete",
             _target: [
                {
                   _ref: "layer",
                   _enum: "ordinal",
                   _value: "targetEnum"
                }
             ],
             layerID: [
                2
             ],
             _options: {
                dialogOptions: "dontDisplay"
             }
          }
       ],
       {}
    );
}

async function layerTranslate(layer, x, y) {
    await layer.translate(x, y);
}

async function layerTrim() {
    const action = {
        _obj: "trim",
        trimBasedOn: {
            _enum: "trimBasedOn",
            _value: "transparency"
        },
        top: true, bottom: true, left: true, right: true,
        _options: {
            dialogOptions: "dontDisplay"
        }
    }
    await batchPlay([action], {});
}

// "mergeVisible" : 레이어 머지
// "cutToLayer" : 이미지 잘라내기
// "clearAllGuides" : 모든 가이드 제거
// "placedLayerEditContents" : 스마트 오브젝트 편집 모드 진입하기
// "newPlacedLayer" : 스마트 오브젝트 만들기
async function actionCommands(command) {
    const action = {
        _obj: command,
        _options: {
            dialogOptions: "dontDisplay"
        }
    }

    await batchPlay([action], {});
}

async function relinkToFile(file_token) {
    const action = {
        _obj: "placedLayerRelinkToFile",
        null: {
        _path: file_token,
        _kind: "local"
        },
        _options: {
        dialogOptions: "dontDisplay"
        }
    }
    await batchPlay([action], {});
 }

// move_action : "previous", "next", "front", "back"
async function moveLayer(move_action) {

   const action = {
      _obj: "move",
      _target: [{
         _ref: "layer",
         _enum: "ordinal",
      }],
      to: {
         _ref: "layer",
         _enum: "ordinal",
         _value: move_action
      },
      _options: {
      dialogOptions: "dontDisplay"
      }
   }
   await batchPlay([action], {});

}

// "placeBefore", "playceAfter", "placeInside"
async function moveLayerTarget(layer, target_layer, element_place) {
   layer.move(target_layer, "placeBefore");
}

async function layTransform(percent_value_width, percent_value_height) {
   const action = {
      _obj: "transform",
      freeTransformCenterState: {
         _enum: "quadCenterState",
         _value: "QCSAverage"
      },
      offset: {
         _obj: "offset",
         horizontal: {
            _unit: "pixelsUnit",
            _value: 0
         },
         vertical: {
            _unit: "pixelsUnit",
            _value: 0
         }
      },
      width: {
         _unit: "percentUnit",
         _value: percent_value_width
      },
      height: {
         _unit: "percentUnit",
         _value: percent_value_height
      },
      replaceLayer: {
         _obj: "transform",
         from: {
            _ref: "layer",
            _id: 24
         },
         to: {
            _ref: "layer",
            _id: 24
         }
      },
      _options: {
         dialogOptions: "dontDisplay"
      }
   }
   await batchPlay([action], {})
}

async function getLayerInfo(layerID, docID) {
   const result = await batchPlay(
      [
         {
            _obj: "get",
            _target: [
               {
                  _ref: "layer",
                  _id: layerID
               },
               {
                  _ref: "document",
                  _id: docID
               }
            ],
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
   return result;
}

// 레이어 이펙트 제거
// "bevelEmboss", stroke : "frameFX", "innerShadow", "innerGlow", satin : "chromeFX", 
// color overlay : "solidFill", gradient overlay : "gradientFill", pattern overlay : "patternFill",
// "outerGlow", "dropShadow"
async function clearLayerEffect(layFX_key, idx, layerID) {
   const result = await batchPlay(
      [
         {
            _obj: "disableSingleFX",
            _target: [
               {
                  _ref: layFX_key,
                  _index: idx
               },
               {
                  _ref: "layer",
                  _enum: "ordinal",
                  _value: "targetEnum",
                  _id : layerID
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

async function reorderEffect(keyName, from_idx, to_idx) {
   const result = await batchPlay(
      [
         {
            _obj: "reorderFX",
            _target: [
               {
                  _ref: "layer",
                  _enum: "ordinal",
                  _value: "targetEnum"
               }
            ],
            layerEffects: {
               _class: keyName
            },
            from: from_idx,
            to: to_idx,
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
}

async function makeGroup(groupName) {
   const result = await batchPlay(
      [
         {
            _obj: "make",
            _target: [
               {
                  _ref: "layerSection"
               }
            ],
            using: {
               _obj: "layerSection",
               name: groupName
            },
            from: {
               _ref: "layer",
               _enum: "ordinal",
               _value: "targetEnum"
            },
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
}

// value : 0 ~ 100
async function layOpacity(value) {
   const result = await batchPlay(
      [
         {
            _obj: "set",
            _target: [
               {
                  _ref: "layer",
                  _enum: "ordinal",
                  _value: "targetEnum"
               }
            ],
            to: {
               _obj: "layer",
               opacity: {
                  _unit: "percentUnit",
                  _value: value
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

// value : true / false
async function setLocking(value) {
   const result = await batchPlay(
      [
         {
            _obj: "applyLocking",
            _target: [
               {
                  _ref: "layer",
                  _enum: "ordinal",
                  _value: "targetEnum"
               }
            ],
            layerLocking: {
               _obj: "layerLocking",
               protectAll: value
            },
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
}

async function selectionForLayer() {
   const result = await batchPlay(
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
               _ref: "channel",
               _enum: "channel",
               _value: "transparencyEnum"
            },
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
}

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
}

async function makeShape(layerID) {
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
}



module.exports = {
   actionCommands,
   addSelectLayer,
   clearLayerEffect,
   createLay,
   deleteLayer,
   getLayerInfo,
   layerTranslate,
   layerTrim,
   layTransform,
   layOpacity,
   makeGroup,
   makeShape,
   makeWorkPath,
   moveLayer,
   moveLayerTarget,
   relinkToFile,
   reorderEffect,
   selectNoLays,
   selectLayerByName,
   selectByLayerID,
   setLayerName,
   setLocking,
   selectionForLayer
};