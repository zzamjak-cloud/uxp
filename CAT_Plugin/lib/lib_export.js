const { batchPlay } = require("photoshop").action;

// 범용 Save for Web 함수
async function saveForWeb(file_name, folder_token, file_token, export_format, options = {}) {
   // 기본 옵션 설정
   const defaultOptions = {
      quality: 60,           // JPG 품질 (0-100)
      transparency: true,    // 투명도 유지 여부
      colorCount: 256,       // GIF 색상 수
      dither: "diffusion",   // 디더링 방식
      ditherAmount: 100,     // 디더링 강도
      optimized: true,       // 최적화 여부
      blur: 0,              // 블러 효과
      matteColor: { r: 255, g: 255, b: 255 } // 매트 색상
   };
   
   // 옵션 병합
   const settings = { ...defaultOptions, ...options };
   
   // 포맷별 특별 설정
   const formatSettings = getFormatSettings(export_format, settings);
   
   const action = {
      _obj: "export",
      using: {
         _obj: "SaveForWeb",
         $Op: { _enum: "$SWOp", _value: "$OpSa" },
         $DIDr: true,
         in: {
            _path: folder_token,  // 저장경로
            _kind: "local"
         },
         pathName: file_token,   // 파일경로
         $ovFN: file_name,       // 파일이름
         format: {
            _enum: "$IRFm",
            _value: export_format  // $PN24, $JP24, $GIFf, $WEBP, $TIFF, $PDF, $EPS, $AI, $PSD, $PSB
         },
         interfaceIconFrameDimmed: false,
         transparency: settings.transparency,
         $Mtt: false,
         $EICC: false,
         $MttR: settings.matteColor.r,
         $MttG: settings.matteColor.g,
         $MttB: settings.matteColor.b,
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
         $ovSN: "images",
         ...formatSettings  // 포맷별 특별 설정 추가
      },
      _options: {
         dialogOptions: "dontDisplay"
      }
   }
   await batchPlay ([action], {})
}

// 포맷별 특별 설정을 반환하는 헬퍼 함수
function getFormatSettings(format, settings) {
   const formatSettings = {};
   
   switch (format) {
      case "$GIFf": // GIF
         formatSettings.$RedA = { _enum: "$IRRd", _value: "$Sltv" };
         formatSettings.$RChT = false;
         formatSettings.$RChV = false;
         formatSettings.$AuRd = false;
         formatSettings.$NCol = settings.colorCount;
         formatSettings.$DChS = 0;
         formatSettings.$DCUI = 0;
         formatSettings.$DChT = false;
         formatSettings.$DChV = false;
         formatSettings.$WebS = 0;
         formatSettings.$TDth = { _enum: "$IRDt", _value: "none" };
         formatSettings.$TDtA = 100;
         formatSettings.$Loss = 0;
         formatSettings.$LChS = 0;
         formatSettings.$LCUI = 100;
         formatSettings.$LChT = false;
         formatSettings.$LChV = false;
         formatSettings.dither = { _enum: "$IRDt", _value: settings.dither };
         formatSettings.ditherAmount = settings.ditherAmount;
         break;
         
      case "JPEG": // JPG
         formatSettings.quality = settings.quality;
         formatSettings.$QChS = 0;
         formatSettings.$QCUI = 0;
         formatSettings.$QChT = false;
         formatSettings.$QChV = false;
         formatSettings.optimized = settings.optimized;
         formatSettings.$Pass = 1;
         formatSettings.blur = settings.blur;
         break;
         
      case "$PN24": // PNG
      case "$WEBP": // WebP
      default:
         // 기본 설정 (추가 특별 설정 없음)
         break;
   }
   
   return formatSettings;
}

// GIF 저장 (범용 함수 사용)
async function saveForWebGIF(file_name, folder_token, file_token, color_count = 256) {
   return await saveForWeb(file_name, folder_token, file_token, "$GIFf", {
      colorCount: color_count,
      transparency: true,
      dither: "diffusion",
      ditherAmount: 100
   });
}

// PNG 저장 (범용 함수 사용, 기존 호환성 보장)
async function saveForWebPNG(file_name, folder_token, file_token, options = {}) {
   return await saveForWeb(file_name, folder_token, file_token, "$PN24", {
      transparency: true,
      ...options
   });
}

// JPG 저장 (범용 함수 사용, 기존 호환성 보장)
async function saveForWebJPG(file_name, folder_token, file_token, quality = 60) {
   return await saveForWeb(file_name, folder_token, file_token, "JPEG", {
      quality: quality,
      transparency: false,
      optimized: true,
      blur: 0
   });
}

// WebP 저장 (범용 함수 사용)
async function saveForWebWebP(file_name, folder_token, file_token, options = {}) {
   return await saveForWeb(file_name, folder_token, file_token, "$WEBP", {
      transparency: true,
      ...options
   });
}

// PSD 저장
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
   saveForWeb,        // 범용 Save for Web 함수
   saveForWebPNG,     // PNG 전용 함수
   saveForWebJPG,     // JPG 전용 함수
   saveForWebGIF,     // GIF 전용 함수
   saveForWebWebP,    // WebP 전용 함수
   saveAsPSD          // PSD 저장 함수
};