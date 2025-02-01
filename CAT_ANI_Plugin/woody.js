
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