// TODO
// Instead of using fillRect to draw path, find a way to draw lines!

let SCALE = 18;

class PathNode {
  constructor() {
    this.grid_idx = null;
    this.parent = null;
    this.gCost = null;
    this.hCost = null;
  }

  less_than(other_node) {
    return (this.gCost + this.hCost) < (other_node.gCost + other_node.hCost);
  }

  greater_than(other_node) {
    return (this.gCost + this.hCost) > (other_node.gCost + other_node.hCost);
  }
}

function pq_parent(i) {
  return Math.floor((i - 1) / 2);
}

function pq_left_child(i) {
  return (2 * i) + 1;
}

function pq_right_child(i) {
  return (2 * i) + 2;
}

function pq_shift_down(pq, size, i) {
  let min_index = i;

  while (true) {
    let l = pq_left_child(i);

    if (l < size && pq[l].less_than(pq[min_index])) {
      min_index = l;
    }

    let r = pq_right_child(i);

    if (r < size && pq[r].less_than(pq[min_index])) {
      min_index = r;
    }

    if (i != min_index) {
      let temp = new PathNode();
      Object.assign(temp, pq[i]);
      pq[i] = pq[min_index];
      pq[min_index] = temp;
      i = min_index;
    } else {
      break;
    }
  }
}

function pq_dequeue(pq, pq_size, explored, explored_size) {
  Object.assign(explored[explored_size], pq[0]);
  pq[0] = pq[pq_size - 1];
  pq_shift_down(pq, pq_size - 1, 0);
  return pq_size - 1;
}

function pq_shift_up(pq, i) {
  while (i > 0 && pq[pq_parent(i)].greater_than(pq[i])) {
    let parent_i = pq_parent(i);
    let temp = new PathNode();
    Object.assign(temp, pq[i]);
    Object.assign(pq[i], pq[parent_i]);
    Object.assign(pq[parent_i], temp);

    i = parent_i;
  }
}

class Grid {
  constructor(grid_str) {
    const rows = grid_str.split('\n');
    this.nRows = rows.length;
    this.nCols = rows[0].length;
    this._grid = Array(this.nCols * this.nRows).fill(0);
    rows.forEach((row, y) => {
      row.split('').forEach((char, x) => {
        this._grid[y * this.nCols + x] = char == '.' ? 0 : char == '#' ? 1 : 2;
      });
    });

    this.start_idx = this.nCols * (this.nRows - 1);
    this.end_idx = this.nCols - 1;
    this._grid[this.start_idx] = 2;
    this._grid[this.end_idx] = 2;
    this.path_capacity = 100;
    this.path_size = 0;
    this.path = Array(this.path_capacity);
  }

  clear_path() {
    this.path_size = 0;
  }

  set_at(val, x, y) {
    if (x < 0 || y < 0) {
      return;
    }
    this._grid[y * this.nCols + x] = val;
  }

  at(x, y) {
    return this._grid[y * this.nCols + x];
  }

  idx_to_cartesian(idx) {
    return [idx % this.nCols, Math.floor(idx / this.nCols)];
  }

  distance(idx_a, idx_b) {
    let [ ax, ay ] = this.idx_to_cartesian(idx_a);
    let [ bx, by ] = this.idx_to_cartesian(idx_b);

    return Math.round(10 * Math.sqrt(Math.pow(Math.abs(by - ay), 2) + Math.pow(Math.abs(bx - ax), 2)));
  }
  
  plot_course() {
    // 5 6 7
    // 4 X 0
    // 3 2 1
    const neighbors = [
      1, this.nCols + 1, this.nCols, this.nCols - 1, -1,
      (0 - this.nCols) - 1, (0 - this.nCols), (0 - this.nCols) + 1
    ];

    const pq_max_size = 10000;
    let pq = Array(pq_max_size);
    for (let i = 0; i < pq_max_size; i += 1) {
      pq[i] = new PathNode();
    }
    
    pq[0].grid_idx = this.end_idx;
    pq[0].parent = null;
    pq[0].gCost = 0;
    pq[0].hCost = this.distance(this.end_idx, this.start_idx);
    let pq_size = 1;
    
    const explored_max_size = pq_max_size;
    let explored = Array(explored_max_size).fill(new PathNode());
    for (let i = 0; i < pq_max_size; i += 1) {
      explored[i] = new PathNode();
    }
    
    let explored_size = 0;
    while (pq_size != 0) {
      if (explored_size >= explored_max_size) {
        return -5;
      }
      pq_size = pq_dequeue(pq, pq_size, explored, explored_size);
      explored_size += 1;
      
      for (let i = 0; i < 8; i += 1) {
        if (explored[explored_size-1].grid_idx < this.nCols && i >= 5) continue; // first row
        if (explored[explored_size-1].grid_idx % this.nCols == 0 && i >= 3 && i <= 5) continue; // first column
        if (explored[explored_size-1].grid_idx % this.nCols == this.nCols - 1 && (i <= 1 || i == 7)) continue; // last column
        if (Math.floor(explored[explored_size-1].grid_idx / this.nCols) == this.nRows - 1 && (i <= 3 && i >= 1)) continue; // last row
        
        let neighbor_idx = explored[explored_size - 1].grid_idx + neighbors[i];
        
        if (this._grid[neighbor_idx] == 1) {
          continue;
        }

        if (neighbor_idx == this.start_idx) {
          this.path[0] = neighbor_idx;
          this.path_size += 1;
          let node = explored[explored_size - 1];
          for (let i = 1; node instanceof PathNode; i += 1) {
            this.path[i] = node.grid_idx;
            node = node.parent;
            this.path_size += 1;
            if (this.path_size == this.path_capacity && node instanceof PathNode) {
              return -1; // Path capacity reached before completing path.
            }
          }

          return 0;
        }

        // ask whether the neighbor_idx exists in the pq already
        let in_pq = false;
        let pq_idx = 0;
        for (let i = 0; i < pq_size; i += 1) {
          if (pq[i].grid_idx == neighbor_idx) {
            in_pq = true;
            pq_idx = i;
            break;
          }
        }
        // If so, the gCost and parent may need to be updated to reflect a lower cost path
        if (in_pq) {
          let new_gCost = explored[explored_size - 1].gCost + this.distance(explored[explored_size - 1].grid_idx, neighbor_idx);
          if (new_gCost < pq[pq_idx].gCost) {
            pq[pq_idx].gCost = new_gCost;
            pq[pq_idx].parent = explored[explored_size - 1];
            pq_shift_up(pq, pq_idx);
          }
        } else { // otherwise, add a new PathNode to the queue
          pq[pq_size].grid_idx = neighbor_idx;
          pq[pq_size].parent = explored[explored_size - 1];
          pq[pq_size].gCost = explored[explored_size - 1].gCost + this.distance(explored[explored_size - 1].grid_idx, neighbor_idx);
          pq[pq_size].hCost = this.distance(neighbor_idx, this.start_idx);
          pq_shift_up(pq, pq_size);
          pq_size += 1;
          // console.log(`pq_size: ${pq_size}, pq_max_size: ${pq_max_size}, pq.length: ${pq.length}`);
          // console.log(pq);
          if (pq_size == pq_max_size) {
            return -4; // Reached capacity for priority queue
          }
        }       
      }
    }

    return 1; // Path not found
  }
}

class CanvasDisplay {
  constructor(parent, grid) {
    this.canvas = document.createElement("canvas");
    this.canvas.style.border = "6px solid black";   
    this.canvas.width = Math.min(600, grid.nCols * SCALE);
    this.canvas.height = Math.min(450, grid.nRows * SCALE);
    parent.appendChild(this.canvas);
    this.cx = this.canvas.getContext("2d");

    this.flipPlayer = false;

    this.viewport = {
      left: 0,
      top: 0,
      width: this.canvas.width / SCALE,
      height: this.canvas.height / SCALE,
    };

    this.grid = grid;
    let rerender_grid = ((e) => {
      let x = Math.floor(e.offsetX / SCALE);
      let y = Math.floor(e.offsetY / SCALE);
      
      if (is_drawing) {
        let new_value = is_erasing ? 0 : 1;
        this.grid.set_at(new_value, x, y);
        this.draw();
      } else if (is_dragging) {
        let idx = y * this.grid.nCols + x;
        if (dragging_start) {
          this.grid._grid[this.grid.start_idx] = 0;
          this.grid.set_at(2, x, y);
          this.grid.start_idx = idx;
        } else {
          this.grid._grid[this.grid.end_idx] = 0;
          this.grid.set_at(2, x, y);
          this.grid.end_idx = idx;
        }
        this.draw();
      }
    }).bind(this);
    
    let press_handler = ((e) => {
      e.stopPropagation();
      e.preventDefault();
      let x = Math.floor(e.offsetX / SCALE);
      let y = Math.floor(e.offsetY / SCALE);
      let target_cell_type = this.grid.at(x, y);

      is_dragging = target_cell_type == 2 ? true : false;
      if (is_dragging) {
        let idx = y * this.grid.nCols + x;
        dragging_start = idx == this.grid.start_idx;
        return;
      }
      
      is_drawing = target_cell_type == 2 ? false : true;      
      is_erasing = target_cell_type == 1 ? true : false;
      
      let new_value = is_erasing ? 0 : 1;
      this.grid.set_at(new_value, x, y);
      this.draw();
    }).bind(this);
    
    this.canvas.addEventListener('mousedown', press_handler);
    this.canvas.addEventListener('pointerdown', press_handler);
    window.addEventListener('mouseup', (e) => {
      is_drawing = false;
      is_erasing = false;
      is_dragging = false;
      this.grid.clear_path();
      if (this.grid.plot_course() == 0) {
        this.draw_path(this.grid.path);
      }
    });
    window.addEventListener('pointerup', (e) => {
      is_drawing = false;
      is_erasing = false;
      is_dragging = false;
      this.grid.clear_path();
      let err = this.grid.plot_course();
      if (err == 0) {
        this.draw_path(this.grid);
      } else {
        // console.log(err);
      }
    });
    
    this.canvas.addEventListener('mousemove', rerender_grid);
    this.canvas.addEventListener('pointermove', rerender_grid);

    this.draw();
    let err = this.grid.plot_course();
    if (err == 0) {
      this.draw_path(this.grid);
    } else {
      // console.log(err);
    }
  }

  clear() {
    this.canvas.remove();
  }
}

CanvasDisplay.prototype.draw = function() {
  let {left, top, width, height} = this.viewport;
  let xStart = Math.floor(left);
  let xEnd = Math.ceil(left + width);
  let yStart = Math.floor(top);
  let yEnd = Math.ceil(top + height);
  
  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      let tile = this.grid.at(x,y)
      let screenX = (x - left) * SCALE;
      let screenY = (y - top) * SCALE;      
      this.cx.fillStyle = tile == 0 ? "#2980B9" : tile == 1 ? "black" : "red";
      this.cx.fillRect(screenX, screenY, SCALE, SCALE);
    }
  }
}

CanvasDisplay.prototype.draw_path = function({ path, path_size }) {
  let {left, top, width, height} = this.viewport;

  for (let i = 0; i < path_size; i += 1) {
    let [ x, y ] = this.grid.idx_to_cartesian(path[i]);
    let screenX = (x - left) * SCALE;
    let screenY = (y - top) * SCALE;      
    this.cx.fillStyle = "red";
    this.cx.fillRect(screenX, screenY, SCALE, SCALE);
  }
}

// let init_grid_str = `
// ...
// ...
// ...
// `.trim();

let init_grid_str = `
................
................
...##......##...
....#.......#...
....#.......#...
....######..###.
.........#......
.........#......
.........#......
...##....####...
....#.......#...
....#.......#...
....####....###.
................
...............#
`.trim();

let grid = new Grid(init_grid_str);
var is_drawing = false;
var is_erasing = false; // independent of whether drawing or not. erasing is a kind of drawing.
var is_dragging = false;
var dragging_start = false;

document.addEventListener("DOMContentLoaded", () => {  
  let canvas = new CanvasDisplay(document.querySelector('#grid-container'), grid);  
});
