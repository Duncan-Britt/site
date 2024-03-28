import { display3D } from '/javascripts/display3D.js';
import { load_wasm } from '/javascripts/load_wasm.js';

document.addEventListener("DOMContentLoaded", () => {
  display3D('./models/tube.obj', 'test-graphic-container');
  display3D('./models/hyperboloid-2-sheets.obj', 'test-graphic-container2');
  load_wasm('example.wasm').then((wasm_exports) => {
    console.log(wasm_exports.add(5, 10));
  });
});

// WebAssembly.instantiateStreaming(fetch('example.wasm'), importObject).then((obj) => console.log(obj.instance.exports));

// emcc example.c -o example.wasm
