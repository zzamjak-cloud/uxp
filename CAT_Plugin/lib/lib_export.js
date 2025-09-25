const { batchPlay } = require("photoshop").action;

async function saveForWebPNG(file_name, folder_token, file_token) {
   const action = {
      _obj: "export",
      using: {
         _obj: "SaveForWeb",
         $Op: {
            _enum: "$SWOp",
            _value: "$OpSa"
         },
         $DIDr: true,
         in: {
            _path: folder_token,
            _kind: "local"
         },
         pathName: file_token,
         $ovFN: file_name,
         format: {
            _enum: "$IRFm",
            _value: "$PN24"
         },
         interfaceIconFrameDimmed: false,
         transparency: true,
         $Mtt: false,
         $EICC: false,
         $MttR: 255,
         $MttG: 255,
         $MttB: 255,
         $SHTM: false,
         $SImg: true,
         $SWsl: {
            _enum: "$STsl",
            _value: "$SLAl"
         },
         $SWch: {
            _enum: "$STch",
            _value: "$CHsR"
         },
         $SWmd: {
            _enum: "$STmd",
            _value: "$MDCC"
         },
         $ohXH: false,
         $ohIC: true,
         $ohAA: true,
         $ohQA: true,
         $ohCA: false,
         $ohIZ: true,
         $ohTC: {
            _enum: "$SToc",
            _value: "$OC03"
         },
         $ohAC: {
            _enum: "$SToc",
            _value: "$OC03"
         },
         $ohIn: -1,
         $ohLE: {
            _enum: "$STle",
            _value: "$LE03"
         },
         $ohEn: {
            _enum: "$STen",
            _value: "$EN00"
         },
         $olCS: false,
         $olEC: {
            _enum: "$STst",
            _value: "$ST00"
         },
         $olWH: {
            _enum: "$STwh",
            _value: "$WH01"
         },
         $olSV: {
            _enum: "$STsp",
            _value: "$SP04"
         },
         $olSH: {
            _enum: "$STsp",
            _value: "$SP04"
         },
         $olNC: [
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC00"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC19"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC28"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC24"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC24"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC24"
               }
            }
         ],
         $obIA: false,
         $obIP: "",
         $obCS: {
            _enum: "$STcs",
            _value: "$CS01"
         },
         $ovNC: [
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC01"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC20"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC02"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC19"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC06"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC24"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC24"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC24"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC22"
               }
            }
         ],
         $ovCM: false,
         $ovCW: false,
         $ovCU: true,
         $ovSF: true,
         $ovCB: true,
         $ovSN: "images"
      },
      _options: {
         dialogOptions: "dontDisplay"
      }
   }
   await batchPlay ([action], {})
}
 
async function saveForWebJPG(file_name, folder_token, file_token) {
   const action = {
      _obj: "export",
      using: {
         _obj: "SaveForWeb",
         $Op: {
            _enum: "$SWOp",
            _value: "$OpSa"
         },
         $DIDr: true,
         in: {
            _path: folder_token, // 저장경로
            _kind: "local"
         },
         pathName: file_token,   // 파일경로
         $ovFN: file_name,       // 파일이름
         format: {
            _enum: "$IRFm",
            _value: "JPEG"
         },
         interfaceIconFrameDimmed: false,
         quality: 60,
         $QChS: 0,
         $QCUI: 0,
         $QChT: false,
         $QChV: false,
         optimized: true,
         $Pass: 1,
         blur: 0,
         $Mtt: false,
         $EICC: false,
         $MttR: 255,
         $MttG: 255,
         $MttB: 255,
         $SHTM: false,
         $SImg: true,
         $SWsl: {
            _enum: "$STsl",
            _value: "$SLAl"
         },
         $SWch: {
            _enum: "$STch",
            _value: "$CHsR"
         },
         $SWmd: {
            _enum: "$STmd",
            _value: "$MDCC"
         },
         $ohXH: false,
         $ohIC: true,
         $ohAA: true,
         $ohQA: true,
         $ohCA: false,
         $ohIZ: true,
         $ohTC: {
            _enum: "$SToc",
            _value: "$OC03"
         },
         $ohAC: {
            _enum: "$SToc",
            _value: "$OC03"
         },
         $ohIn: -1,
         $ohLE: {
            _enum: "$STle",
            _value: "$LE03"
         },
         $ohEn: {
            _enum: "$STen",
            _value: "$EN00"
         },
         $olCS: false,
         $olEC: {
            _enum: "$STst",
            _value: "$ST00"
         },
         $olWH: {
            _enum: "$STwh",
            _value: "$WH01"
         },
         $olSV: {
            _enum: "$STsp",
            _value: "$SP04"
         },
         $olSH: {
            _enum: "$STsp",
            _value: "$SP04"
         },
         $olNC: [
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC00"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC19"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC28"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC24"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC24"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC24"
               }
            }
         ],
         $obIA: false,
         $obIP: "",
         $obCS: {
            _enum: "$STcs",
            _value: "$CS01"
         },
         $ovNC: [
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC01"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC20"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC02"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC19"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC06"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC24"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC24"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC24"
               }
            },
            {
               _obj: "$SCnc",
               $ncTp: {
                  _enum: "$STnc",
                  _value: "$NC22"
               }
            }
         ],
         $ovCM: false,
         $ovCW: false,
         $ovCU: true,
         $ovSF: true,
         $ovCB: true,
         $ovSN: "images"
      },
      _options: {
         dialogOptions: "dontDisplay"
      }
   }
   await batchPlay ([action], {})
}

async function saveAsPSD(file_psd_token) {
   const action = {
      _obj: "save",
      as: {
         _obj: "photoshop35Format",
         maximizeCompatibility: true
      },
      in: {
         _path: file_psd_token,
         _kind: "local"
      },
      lowerCase: true,
      saveStage: {
         _enum: "saveStageType",
         _value: "saveSucceeded"
      },
      _options: {
         dialogOptions: "dontDisplay"
      }
   }
   await batchPlay ([action], {})
}

module.exports = {
   saveForWebPNG,
   saveForWebJPG,
   saveAsPSD
};