// let wasmExports = null;
// let wasmMemory = new WebAssembly.Memory({initial: 256, maximum: 256});

// let wasmTable = new WebAssembly.Table({
//   'initial': 1,
//   'maximum': 1,
//   'element': 'anyfunc'
// });

// let asmLibraryArg = {
//   "__handle_stack_overflow": () => {},
//   "emscripten_resize_heap": () => {},
//   "__lock": () => {},
//   "__unlock": () => {},
//   "memory": wasmMemory,
//   "table": wasmTable
// };

// var wasmImports = {};

// var info = {
//   'env': asmLibraryArg,
//   'wasi_snapshot_preview1': asmLibraryArg,
// };

// export async function load_wasm(file_path) {
//   let response = await fetch(file_path);
//   let bytes = await response.arrayBuffer();
//   let wasmObj = await WebAssembly.instantiate(bytes, info);
//   return wasmObj.instance.exports;
// }

export async function load_wasm(file_path) {
  const response = await fetch('grid.wasm');
  const bytes = await response.arrayBuffer();
  const { instance } = await WebAssembly.instantiate(bytes);

  return instance;
}
