const { batchPlay } = require("photoshop").action;
const { executeAsModal } = require('photoshop').core;
const { COMMAND } = require('./constants');

// 모든 레이어 ID를 순서대로 수집하는 함수 (재귀적, Background 레이어 포함)
function collectAllLayerIDsInOrder(layers, layerIDs) {
   for (const layer of layers) {
       layerIDs.push(layer.id);
       
       // 그룹인 경우 내부 레이어들도 재귀적으로 수집 (순서 보존)
       if (layer.kind === 'group' && layer.layers) {
           collectAllLayerIDsInOrder(layer.layers, layerIDs);
       }
   }
}

// 신규 레이어 생성
async function createLay() {
   await batchPlay
   ([{
      _obj: "make",
      _target: [
         {
            _ref: "layer"
         }
      ],
      _options: {
         dialogOptions: "dontDisplay"
      }}],{}
   );
}

// 레이어 이름 변경
async function setLayerName(layer_name) {
   await batchPlay(
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
               name: layer_name
            },
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
}

// (배치) 레이어 이름 한번에 변경하기
function createLayerRenameCommands(layerNamePairs) {
   const batchCommands = [];
   
   for (const { layerID, newName } of layerNamePairs) {
      batchCommands.push({
         _obj: "set",
         _target: [
            {
               _ref: "layer",
               _id: layerID
            }
         ],
         to: {
            _obj: "layer",
            name: newName
         },
         _options: {
            dialogOptions: "dontDisplay"
         }
      });
   }
   
   return batchCommands;
}

// (배치) 여러 레이어 이름을 한 번에 변경하기
async function setMultipleLayerNames(layerNamePairs) {
   const batchCommands = createLayerRenameCommands(layerNamePairs);
   
   // 히스토리를 하나의 단위로 묶기 위한 옵션들
   await batchPlay(batchCommands, { 
      synchronousExecution: true,
      modalBehavior: "execute"
   });
}


// suspendHistory/resumeHistory를 사용한 히스토리 그룹핑 (레이어 이름 변경 전용)
async function setMultipleLayerNamesWithHistoryGrouping(layerNamePairs, context) {
   const batchCommands = createLayerRenameCommands(layerNamePairs);
   
   // context가 제공되면 이미 히스토리가 일시 중단된 상태이므로 직접 batchPlay 실행
   if (context) {
      await batchPlay(batchCommands, {});
      return null; // historyID는 상위에서 관리
   } else {
      // context가 없으면 독립적으로 히스토리 그룹핑 실행
      const { executeWithHistoryGrouping } = require('./lib');
      return await executeWithHistoryGrouping(batchCommands, "레이어 일괄 이름 변경", context);
   }
}



// 이름으로 레이어 선택
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

// 레이어 ID로 선택
async function selectByLayerID(layerID) {
   await batchPlay(
      [
         {
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
      ],
      {}
   );
}

// 레이어 선택 추가
async function addSelectLayer(layerID, layerID_array) {
   await batchPlay(
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

// 개별 레이어 선택 추가 (연속 선택이 아닌 개별 선택)
async function addSelectLayerIndividual(layerID) {
   await batchPlay(
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
               _value: "addToSelection"
            },
            makeVisible: false,
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
}

// 레이어 선택 해제
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

// 레이어 삭제
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

// 레이어 ID로 삭제
async function deleteLayerByID(layerID) {
   await batchPlay([{
      _obj: "delete",
      _target: [{ _ref: "layer", _id: layerID }],
      _options: { dialogOptions: "dontDisplay" }
   }], { synchronousExecution: true });
}

// 특정 이름의 레이어를 제거하는 함수
async function deleteLayerByName(layerName) {
   try {
       const doc = app.activeDocument;
       for (const layer of doc.layers) {
           if (layer.name === layerName) {
               await deleteLayerByID(layer.id);
               break;
           }
       }
   } catch (error) {
       logger.error(`Failed to remove layer "${layerName}":`, error);
   }
}

// 레이어 이동
async function layerTranslate(layer, x, y) {
    await layer.translate(x, y);
}

// 레이어 트림
async function layerTrim() {
   await batchPlay(
      [
         {
            _obj: "trim",
            trimBasedOn: {
               _enum: "trimBasedOn",
               _value: "transparency"
            },
            top: true,
            bottom: true,
            left: true,
            right: true,
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
}

// "mergeVisible" : 레이어 머지
// "cutToLayer" : 이미지 잘라내기
// "clearAllGuides" : 모든 가이드 제거
// "placedLayerEditContents" : 스마트 오브젝트 편집 모드 진입하기
// "newPlacedLayer" : 스마트 오브젝트 만들기
async function actionCommands(command) {
   const result = await batchPlay(
      [
         {
            _obj: command,
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
   return result;
}

// 파일 재연결
async function relinkToFile(file_token) {
   await batchPlay(
      [
         {
            _obj: "placedLayerRelinkToFile",
            null: {
               _path: file_token,
               _kind: "local"
            },
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
}

// move_action : "previous", "next", "front", "back"
async function moveLayer(move_action) {
   await batchPlay(
      [
         {
            _obj: "move",
            _target: [
               {
                  _ref: "layer",
                  _enum: "ordinal",
               }
            ],
            to: {
               _ref: "layer",
               _enum: "ordinal",
               _value: move_action
            },
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
}

// element_place : "placeBefore", "playceAfter", "placeInside"
// target_layer : 이동할 레이어 ID
async function moveLayerTarget(layer, target_layer, element_place) {
   layer.move(target_layer, element_place);
}

// 레이어 크기 조정
// percent_value_width, percent_value_height : 0 ~ 100
async function layTransform(percent_value_width, percent_value_height) {
   await batchPlay(
      [
         {
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
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
}

// 레이어 복제
async function duplicateLayer(){
   await batchPlay(
      [
         {
            _obj: "duplicate",
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

// 레이어 정보 얻기
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
   await batchPlay(
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

// 이펙트 재정렬
// keyName : "bevelEmboss", stroke : "frameFX", "innerShadow", "innerGlow", satin : "chromeFX",
// color overlay : "solidFill", gradient overlay : "gradientFill", pattern overlay : "patternFill",
// "outerGlow", "dropShadow"
async function reorderEffect(keyName, from_idx, to_idx) {
   await batchPlay(
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

// 그룹 생성
async function makeGroup(groupName) {
   await batchPlay(
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

// 선택된 레이어들로 그룹 생성
async function makeGroupFromSelectLayers(groupName) {
   await batchPlay([
      {
          _obj: "make",
          _target: [{ _ref: "layerSection" }],
          using: {
              _obj: "layerSection",
              name: groupName
          },
          from: {
              _ref: "layer",
              _enum: "ordinal",
              _value: "targetEnum"
          },
          _options: { dialogOptions: "dontDisplay" }
      }
  ], { synchronousExecution: true });
}

// 그룹 해제
async function ungroupLayers() {
   await batchPlay(
      [
         {
            _obj: "ungroupLayersEvent",
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

// 투명도 설정
// value : 0 ~ 100
async function layOpacity(value) {
   await batchPlay(
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

// 레이어 잠금 설정
// value : true / false
async function setLocking(value) {
   await batchPlay(
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

// 투명도 기반 레이어 영역 선택
async function selectionForLayer() {
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

// 레이어 ID 배열을 사용한 배치 선택
async function selectAllFastLayersByID(layerIDs) {
   for (const layerId of layerIds) {
      if (!layerId) continue;
      
      try {
         if (selectedCount === 0) {
            // 첫 번째 레이어 선택
            await selectByLayerID(layerId);
         } else {
            // 추가 선택
            await batchPlay([
               {
                  _obj: "select",
                  _target: [{ _ref: "layer", _id: layerId }],
                  selectionModifier: {
                     _enum: "selectionModifierType",
                     _value: "addToSelectionContinuous"
                  },
                  makeVisible: false,
                  _options: { dialogOptions: "dontDisplay" }
               }
            ], { synchronousExecution: true });
         }
            
      } catch (selectError) {
         logger.warn(`Failed to select layer ${layerId}: ${selectError.message}`);
      }
   }
}

// 레이어 ID 배열을 사용한 배치 선택
async function selectAllLayersByID(layers, layerIDs) {
   // 첫 번째 레이어 선택
   await batchPlay([{
      _obj: "select",
      _target: [{
          _ref: "layer",
          _name: layers[0].name  // 첫 번째 레이어 이름
      }],
      makeVisible: false,
      layerID: [layerIDs[0]],  // 첫 번째 레이어 ID
      _options: {
          dialogOptions: "dontDisplay"
      }
  }], {});
  
  console.log(`첫 번째 레이어 선택 완료: ${layers[0].name}`);
  
  // 나머지 모든 레이어를 연속 선택으로 추가
  if (layerIDs.length > 1) {
      await batchPlay([{
          _obj: "select",
          _target: [{
              _ref: "layer",
              _name: layers[layers.length - 1].name  // 마지막 레이어 이름
          }],
          selectionModifier: {
              _enum: "selectionModifierType",
              _value: "addToSelectionContinuous"
          },
          makeVisible: false,
          layerID: layerIDs,  // 모든 레이어 ID 배열
          _options: {
              dialogOptions: "dontDisplay"
          }
      }], {});
      
      console.log(`모든 레이어 배치 선택 완료: ${layerIDs.length}개 레이어`);
  }
}



// 레이어의 현재 위치값을 리턴
async function getCurrentLayerPosition(layer) {
   const result = await batchPlay(
       [{
           _obj: "get",
           _target: [
               {
                   _ref: "layer",
                   _id: layer.id
               }
           ],
           _options: { dialogOptions: "dontDisplay" }
       }],
       { synchronousExecution: true }
   );
   
   return result[0].bounds;
}

// 레이어 이동
async function moveLayerOffset(layer, x, y) {
   await batchPlay(
      [
         {
            _obj: "move",
            _target: [
               {
                  _ref: "layer",
                  _id: layer.id
               }
            ],
            to: {
               _obj: "offset",
               horizontal: {
                  _unit: "pixelsUnit",
                  _value: x
               },
               vertical: {
                  _unit: "pixelsUnit",
                  _value: y
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

// 머지 레이어
async function mergeLayers() {
   await batchPlay(
      [
         {
            "_obj": COMMAND.MERGE_LAYERS_NEW,
            "apply": true,
            "_isCommand": false
         }
      ],
      {}
   );
}

/**
 * 레이어 래스터화
 */
async function rasterizeLayer() {
   try {
       await batchPlay([
           {
               _obj: "rasterizeLayer",
               _target: [{
                   _ref: "layer",
                   _enum: "ordinal",
                   _value: "targetEnum"
               }],
               what: {
                   _enum: "rasterizeItem",
                   _value: "entireLayer"
               }
           }
       ], {});
   } catch (error) {
       // 이미 래스터화된 레이어인 경우 무시
       console.log('Layer already rasterized or rasterization not needed');
   }
}

// 마스크 제거
async function removeMask() {
   await batchPlay([
      {
         _obj: "delete",
         _target: [{
               _ref: "channel",
               _enum: "channel",
               _value: "mask"
         }],
         apply: true
      }
   ], {});
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

module.exports = {
   actionCommands,
   collectAllLayerIDsInOrder, // 모든 레이어 ID를 순서대로 수집하는 함수 (재귀적, Background 레이어 포함)
   addSelectLayer,      // 레이어 선택 추가
   addSelectLayerIndividual, // 개별 레이어 선택 추가 (연속 선택이 아닌 개별 선택)
   clearLayerEffect,    // 레이어 이펙트 제거
   createLay,           // 신규 레이어 생성
   deleteLayer,         // 레이어 삭제 
   deleteLayerByName,   // 특정 이름의 레이어를 제거하는 함수
   deleteLayerByID,     // 레이어 ID로 삭제
   duplicateLayer,      // 레이어 복제
   getLayerInfo,        // 레이어 정보 얻기
   getCurrentLayerPosition, // 레이어의 현재 위치값을 리턴
   getWorkPath,         // WorkPath 정보 얻기
   layerTranslate,      // 레이어 이동
   layerTrim,           // 레이어 트림
   layTransform,        // 레이어 크기 조정
   layOpacity,          // 투명도 설정
   makeGroup,           // 그룹 생성
   makeGroupFromSelectLayers, // 선택된 레이어들로 그룹 생성
   mergeLayers,         // 머지 레이어
   moveLayer,           // 레이어 인덱스 이동
   moveLayerOffset,     // 레이어 오프셋 이동
   moveLayerTarget,     // 레이어 타겟기준 인덱스 이동
   rasterizeLayer,      // 레이어 래스터화
   removeMask,          // 마스크 제거
   relinkToFile,        // 파일 재연결
   reorderEffect,       // 이펙트 재정렬
   selectNoLays,        // 레이어 선택 해제
   selectLayerByName,   // 이름으로 레이어 선택
   selectByLayerID,     // 레이어 ID로 선택
   selectAllFastLayersByID, // 레이어 ID 배열을 사용한 배치 선택
   selectAllLayersByID, // 레이어 ID 배열을 사용한 배치 선택
   setLayerName,        // 레이어 이름 변경
   setMultipleLayerNames, // 여러 레이어 이름을 한 번에 변경 (배치 처리)
   setMultipleLayerNamesWithHistoryGrouping, // suspendHistory/resumeHistory를 사용한 히스토리 그룹핑
   setLocking,          // 레이어 잠금 설정
   // 헬퍼 함수들
   createLayerRenameCommands, // 레이어 이름 변경을 위한 배치 명령 생성 헬퍼 함수
   selectionForLayer,   // 투명도 기반 레이어 영역 선택
   ungroupLayers        // 그룹 해제
};