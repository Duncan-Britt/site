Promise.config({
  // Enable warnings
  // warnings: true,
  // Enable long stack traces
  // longStackTraces: true,
  // Enable cancellation
  cancellation: true,
  // Enable monitoring
  // monitoring: true,
  // Enable async hooks
  // asyncHooks: true,
});

document.addEventListener("DOMContentLoaded", () => {  
  CanvasRRT({
    canvas_container: document.querySelector('#grid-container'),
    width: 400,
    height: 400,
    objects: [
      new Circle({ center: { x: 10, y: 391 }, radius: 10, border_color: "#d63230", border_width: 0}),
      new Circle({ center: { x: 389, y: 10 }, radius: 10, border_color: "#d63230", border_width: 0}),
      new Circle({ center: { x: 294, y: 150 }, radius: 40, border_color: "black", fill_color: "#79a5a5"}),
      new Circle({ center: { x: 164, y: 269 }, radius: 40, border_color: "black", fill_color: "#79a5a5"}),
      new Circle({ center: { x: 179, y: 152 }, radius: 30, border_color: "black", fill_color: "#79a5a5", }),
      new Circle({ center: { x: 69, y: 80 }, radius: 30, border_color: "black", fill_color: "#79a5a5", }),
      new Circle({ center: { x: 138, y: 67 }, radius: 30, border_color: "black", fill_color: "#79a5a5", }),
      new Circle({ center: { x: 217, y: 92 }, radius: 30, border_color: "black", fill_color: "#79a5a5", }),
      new Circle({ center: { x: 306, y: 64 }, radius: 30, border_color: "black", fill_color: "#79a5a5", }),
      new Circle({ center: { x: 261, y: 231 }, radius: 30, border_color: "black", fill_color: "#79a5a5", }),
      new Circle({ center: { x: 346, y: 241 }, radius: 30, border_color: "black", fill_color: "#79a5a5", }),
      new Circle({ center: { x: 310, y: 365 }, radius: 30, border_color: "black", fill_color: "#79a5a5", }),
      new Circle({ center: { x: 248, y: 310 }, radius: 30, border_color: "black", fill_color: "#79a5a5", }),
      new Circle({ center: { x: 66, y: 160 }, radius: 30, border_color: "black", fill_color: "#79a5a5", }),
      new Circle({ center: { x: 65, y: 249 }, radius: 30, border_color: "black", fill_color: "#79a5a5", }),
      new Circle({ center: { x: 97, y: 323 }, radius: 30, border_color: "black", fill_color: "#79a5a5", }),
      new Circle({ center: { x: 183, y: 343 }, radius: 30, border_color: "black", fill_color: "#79a5a5", }),
      new Circle({ center: { x: 125, y: 195 }, radius: 30, border_color: "black", fill_color: "#79a5a5", }),
      new Circle({ center: { x: 375, y: 322 }, radius: 30, border_color: "black", fill_color: "#79a5a5", }),
    ],
    speed_slider: document.querySelector('input#speed'),
    instant_checkbox: document.getElementById('instant'),
  });
});

const BACKGROUND_COLOR = "#008b8b";
const NODE_COLOR = "#5fcbcb"; // #E7E438
const TREE_COLOR = "#5fcbcb"; // #fac50e

class Circle {
  constructor({ center, radius, border_color, border_width=4, fill_color=border_color }) {
    this.center = center;
    this.radius = radius;
    this.border_color = border_color;
    this.fill_color = fill_color;
    this.border_width = border_width;
  }

  within(x, y) {
    return distance({ x, y }, this.center) <= this.radius;
  }
}

function distance(a, b) {
  return Math.sqrt(Math.pow(b.y - a.y, 2) + Math.pow(b.x - a.x, 2));
}

class PathNode {
  constructor(x, y, parent = null) {
    this.x = x;
    this.y = y;
    this.parent = parent;
  } 
}

function calc_waypoints(a, b, n) {
  let waypoints = [];
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  
  for (let j = 0; j < n; j++) {
    let x = a.x + dx * j / n;
    let y = a.y + dy * j / n;
    waypoints.push({ x, y });
  }
  return waypoints;
}

const sleep = async ms => new Promise(r => setTimeout(r, ms));

async function CanvasRRT ({ canvas_container, width, height, objects, speed_slider, instant_checkbox }) {
  let canvas = document.createElement('canvas');
  canvas.style.border = "6px solid black";
  canvas.style.touchAction = 'none'; // Prevent scroll on touch screen devices.
  canvas.width = width;
  canvas.height = height;
  canvas.style.position = "absolute";
  canvas.style.left = 0;
  canvas.style.top = 0;
  canvas.style.zIndex = 0;

  let layer2 = document.createElement('canvas');
  layer2.style.border = "6px solid black";
  layer2.style.touchAction = 'none'; // Prevent scroll on touch screen devices.
  layer2.width = width;
  layer2.height = height;
  layer2.style.position = "absolute";
  layer2.style.left = 0;
  layer2.style.top = 0;
  layer2.style.zIndex = 1;

  canvas_container.appendChild(canvas);
  canvas_container.appendChild(layer2);
  let cx = canvas.getContext("2d");
  let cx2 = layer2.getContext("2d");

  const render_grid = () => {  
    // draw canvas background
    cx.fillStyle = BACKGROUND_COLOR; // blue green
    cx.fillRect(0, 0, width, height);

    // draw objects
    objects.forEach(object => {
      cx.beginPath();
      // center=(x,y) radius=r angle=0 to 7
      cx.arc(object.center.x, object.center.y, object.radius - object.border_width / 2, 0, 7);
      cx.fillStyle = object.fill_color;
      cx.fill();
      
      cx.lineWidth = object.border_width;
      cx.strokeStyle = object.border_color;
      cx.stroke();
      
      cx.closePath();
    });
  };

  let object_grabbed_idx = -1;
  let object_hovered_idx = -1;
  let clicked_on = false;
  
  const press_handler = e => {
    e.stopPropagation();
    e.preventDefault();
    clicked_on = true;
    object_grabbed_idx = objects.reduce((res, object, current_idx) => {
      return object.within(e.offsetX, e.offsetY) ?  current_idx : res;
    }, -1); // -1 indicates no object grabbed

    object_hovered_idx = object_grabbed_idx;
    if (object_grabbed_idx != -1) {
      layer2.style.cursor = "grabbing";
    }
  };

  const move_handler = e => {
    e.stopPropagation();
    e.preventDefault();

    if (object_grabbed_idx == -1) {
      object_hovered_idx = objects.reduce((res, object, current_idx) => {
        return object.within(e.offsetX, e.offsetY) ?  current_idx : res;
      }, -1); // -1 indicates no object hovered over
      if (object_hovered_idx == -1) {
        layer2.style.cursor = "crosshair";
      } else {
        layer2.style.cursor = "grab";
      }

      return;
    }

    let x = e.offsetX;
    let y = e.offsetY;
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
      return;
    }

    objects[object_grabbed_idx].center = { x, y };
    render_grid();
  };

  const timestep = () => 1000 - speed_slider.value;
  let path;
  const RRT = () => {
    return new Promise(async (resolve, reject, onCancel) => {
      const MAX_BRANCH_LENGTH = 20;
      const PROXIMITY_THRESHOLD = 10;
      const MAX_ITERATIONS = 5000;

      let path_nodes = [new PathNode(objects[0].center.x, objects[0].center.y)];

      let iterations = 0;
      let unfulfilled_promise = true;
      onCancel(function() {
        unfulfilled_promise = false;
      });
      while (iterations <= MAX_ITERATIONS && unfulfilled_promise) {
        // randomly sample a point, (xs, ys) 
        let [xs, ys] = [Math.random() * canvas.width, Math.random() * canvas.height];
        
        if (timestep() != 0 && unfulfilled_promise) {
          // display sample spot
          let sample_circle = new Circle({ center: {x: xs, y: ys}, radius: 3, fill: true, border_color: "red"});
          cx2.beginPath();
          // center=(x,y) radius=r angle=0 to 7        
          cx2.arc(sample_circle.center.x, sample_circle.center.y, sample_circle.radius, 0, 7);
          cx2.fillStyle = sample_circle.fill_color;
          cx2.fill();
          cx2.closePath();
          // await sleep(timestep());
          // if (iterations % speed_slider.value == 0) {            
            // await sleep(1);
          // }
        }
        
        // Find the nearest node in the tree
        let nearest_node = path_nodes.reduce((nearest, node) => {
          return distance(node, { x: xs, y: ys }) < distance(nearest, { x: xs, y: ys }) ? node : nearest;
        });
        const dx = xs - nearest_node.x;
        const dy = ys - nearest_node.y;
        const magnitude = Math.sqrt(dx**2 + dy**2);
        const ux = dx / magnitude;
        const uy = dy / magnitude;
        // r(t) is the vector equation of a line through the nearest node and the sampled point
        //        ⎛x ⎞     ⎛u ⎞
        //        ⎜ 0⎟     ⎜ x⎟
        // r(t) = ⎜  ⎟ + t ⎜  ⎟
        //        ⎜y ⎟     ⎜u ⎟
        //        ⎝ 0⎠     ⎝ y⎠

        const r = t => {          
          return [ ux * t + nearest_node.x, uy * t + nearest_node.y ];
        };            

        let ts = []; // t values at intersections between r(t) and the circles
        if (unfulfilled_promise) {
          // Does the line r(t) through the nearest node and the sample point intersect with any of the circles?
          //   If not, make a new node in the direction of r(t)
          //   If so, does it intersect the circle in the range 0 <= t <= MAX_t ?
          //     if so, put a point at the intersection
          //     Otherwise, the path is clear, make a new node in the direction of r(t)
          objects.slice(2).forEach(circle => {
            const cx = circle.center.x;
            const cy = circle.center.y;
            const x0 = nearest_node.x;
            const y0 = nearest_node.y;
            const rc = circle.radius;
            const under_root = -(cx**2) * uy**2 + 2 * cx * cy * ux * uy - 2 * cx * ux * uy * y0 + 2 * cx * uy**2 * x0 - cy**2 * ux**2 + 2 * cy * ux**2 * y0 - 2 * cy * ux * uy * x0 + ux**2 * rc**2 + rc**2 * uy**2 - ux**2 * y0**2 + 2 * ux * uy * x0 * y0 - uy**2 * x0**2;
            if (under_root < 0) {           
              return; // no intersection
            }
            
            // now we need to know if it has a solution on a range of t
            let a = cx * ux + cy * uy - ux * x0 - uy * y0;
            let denom = ux**2 + uy**2;
            let t1 = (a - Math.sqrt(under_root)) / denom;
            let t2 = (a + Math.sqrt(under_root)) / denom;
            let tsi = [t1, t2];
            tsi.forEach(t => {
              if (t > 0 && t < MAX_BRANCH_LENGTH) {
                ts.push(t);
              }         
            });
          });  
        }    

        let tn = Math.min(...ts, MAX_BRANCH_LENGTH, distance(nearest_node, { x: xs, y: ys })) - 0.2;

        if (objects.slice(2).every(circle => !circle.within(...r(tn)))) {       
          const new_node = new PathNode(...r(tn), nearest_node);
          path_nodes.push(new_node);

          // if (timestep() != 0) {
          if (!instant_checkbox.checked) {
            const n_waypoints = 2**(10-speed_slider.value);
            const waypoints = calc_waypoints(nearest_node, new_node, n_waypoints);
            for (let t = 1; t < waypoints.length; t++) {
              const a = waypoints[t-1];
              const b = waypoints[t];

              // await sleep(timestep() / 100);
              await sleep(0);
              requestAnimationFrame(_ => {
                if (unfulfilled_promise) {
                  cx.strokeStyle = TREE_COLOR;
                  cx.lineWidth = 1.2;
                  cx.beginPath();
                  cx.moveTo(a.x, a.y);
                  cx.lineTo(b.x, b.y);
                  cx.stroke();
                  cx.closePath();
                }
              });
            }
          } else {
            if (unfulfilled_promise) {
              cx.strokeStyle = TREE_COLOR;
              cx.lineWidth = 1.2;
              cx.beginPath();
              cx.moveTo(nearest_node.x, nearest_node.y);
              cx.lineTo(new_node.x, new_node.y);
              cx.stroke();
              cx.closePath();
            }
          }
          let node_circle = new Circle({ center: new_node, radius: 1.2, fill: true, border_color: NODE_COLOR}); 
          if (unfulfilled_promise) {
            cx.beginPath();
            // center=(x,y) radius=r angle=0 to 7        
            cx.arc(node_circle.center.x, node_circle.center.y, node_circle.radius, 0, 7);
            cx.fillStyle = node_circle.fill_color;
            cx.fill();
            cx.closePath();
          }

          if (distance(new_node, objects[1].center) < PROXIMITY_THRESHOLD && unfulfilled_promise) {
            let node = new_node;
            path = [];
            while (node instanceof PathNode) {
              path.push(node);
              node = node.parent;
            }
            resolve(0);
            unfulfilled_promise = false;
          }
        }
        
        // delete sample circle
        cx2.clearRect(0, 0, layer2.width, layer2.height);        

        iterations += 1;        
      } 
      reject(new Error("Iteration limit reached"));
      unfulfilled_promise = false;
    });
  };

  let RRT_promise;

  const unclick_handler = async e => {
    if (!clicked_on) {
      return;
    }

    if (RRT_promise) {
      RRT_promise.cancel();
    }

    render_grid();
    object_grabbed_idx = -1;
    layer2.style.cursor = object_hovered_idx == -1 ? "crosshair" : "grab";
    // should return an error code and mutate the path

    RRT_promise = RRT();
    RRT_promise.then(err => {
      if (err == 0) {
        cx.strokeStyle = "#d63230";
        cx.lineWidth = 3;
        cx.lineJoin = "round";
        cx.beginPath();
        cx.moveTo(path[0].x, path[0].y);
        path.forEach(node => {
          cx.lineTo(node.x, node.y);          
        });
        cx.stroke();
      }
    });

    clicked_on = false;
  };

  layer2.addEventListener('mousedown', press_handler, true);
  layer2.addEventListener('pointerdown', press_handler, true);
  layer2.addEventListener('mousemove', move_handler, true);
  layer2.addEventListener('pointermove', move_handler, true);
  window.addEventListener('mouseup', unclick_handler, true);      
  window.addEventListener('pointerup', unclick_handler, true);

  clicked_on = true;
  await unclick_handler();
}
