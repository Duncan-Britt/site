document.addEventListener("DOMContentLoaded", () => {
  canvasRRT({
    canvas_container: document.querySelector('#grid-container'),
    width: 400,
    height: 400,
    objects: [
      new Circle({ center: { x: 10, y: 391 }, radius: 10, color: "red", }),
      new Circle({ center: { x: 389, y: 10 }, radius: 10, color: "red", }),
      new Circle({ center: { x: 294, y: 150 }, radius: 40, color: "black", }),
      new Circle({ center: { x: 164, y: 269 }, radius: 40, color: "black", }),
      new Circle({ center: { x: 179, y: 152 }, radius: 30, color: "black", }),
    ],
  });
});

class Circle {
  constructor({ center, radius, color }) {
    this.center = center;
    this.radius = radius;
    this.color = color;
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

function canvasRRT({ canvas_container, width, height, objects }) {
  let canvas = document.createElement('canvas');
  canvas.style.border = "6px solid black";
  canvas.style.touchAction = 'none'; // Prevent scroll on touch screen devices.
  canvas.width = width
  canvas.height = height
  canvas_container.appendChild(canvas);
  let cx = canvas.getContext("2d");
  let path;

  const draw_objects = () => {
    objects.forEach(object => {
      cx.beginPath();
      // center=(x,y) radius=r angle=0 to 7
      cx.arc(object.center.x, object.center.y, object.radius, 0, 7);
      cx.fillStyle = object.color;
      cx.fill();
      cx.closePath();
    });
  };

  const render_grid = () => {
    // Give the canvas a blue background:
    cx.fillStyle = "#2980B9";
    cx.fillRect(0, 0, width, height);
    draw_objects();
  }
  render_grid();

  let object_grabbed_idx = -1;
  let object_hovered_idx = -1;

  const press_handler = e => {
    e.stopPropagation();
    e.preventDefault();
    object_grabbed_idx = objects.reduce((res, object, current_idx) => {
      return object.within(e.offsetX, e.offsetY) ?  current_idx : res;
    }, -1); // -1 indicates no object grabbed

    object_hovered_idx = object_grabbed_idx;
    if (object_grabbed_idx != -1) {
      canvas.style.cursor = "grabbing";
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
        canvas.style.cursor = "crosshair"
      } else {
        canvas.style.cursor = "grab"
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

  const RRT = () => {
    const MAX_BRANCH_LENGTH = 50;
    const PROXIMITY_THRESHOLD = 10;
    const MAX_ITERATIONS = 10000;

    let path_nodes = [new PathNode(objects[0].center.x, objects[0].center.y)];

    let iterations = 0;
    while (iterations <= MAX_ITERATIONS) {
      // randomly sample a point, (xs, ys) 
      let [xs, ys] = [Math.random() * canvas.width, Math.random() * canvas.height];
      // Find the nearest node in the tree
      let nearest_node = path_nodes.reduce((nearest, node) => {
        return distance(node, { x: xs, y: ys }) < distance(nearest, { x: xs, y: ys }) ? node : nearest;
      });
      const dx = xs - nearest_node.x;
      const dy = ys - nearest_node.y;
      const magnitude = Math.sqrt(dx**2 + dy**2);
      const ux = dx / magnitude;
      const uy = dy / magnitude;
      const r = t => {          
        return [ ux * t + nearest_node.x, uy * t + nearest_node.y ];
      };

      // Does the line r(t) through the nearest node and the sample point intersect with any of the circles?
      //   If not, make a new node in the direction of r(t)
      //   If so, does it intersect the circle in the range 0 <= t <= MAX_t ?
      //     if both are true, then resample.
      //     Otherwise, the path is clear, make a new node in the direction of r(t)
      let t1;
      let t2;
      if (objects.slice(2).some(circle => {
        const cx = circle.center.x;
        const cy = circle.center.y;
        const x0 = nearest_node.x;
        const y0 = nearest_node.y;
        const rc = circle.radius;
        const under_root = -(cx**2) * uy**2 + 2 * cx * cy * ux * uy - 2 * cx * ux * uy * y0 + 2 * cx * uy**2 * x0 - cy**2 * ux**2 + 2 * cy * ux**2 * y0 - 2 * cy * ux * uy * x0 + ux**2 * rc**2 + rc**2 * uy**2 - ux**2 * y0**2 + 2 * ux * uy * x0 * y0 - uy**2 * x0**2;
        if (under_root < 0) {
          return false;
        }
        // now we need to know if it has a solution on a range of t
        let a = cx * ux + cy * uy - ux * x0 - uy * y0;
        let denom = ux**2 + uy**2;
        t1 = (a - Math.sqrt(under_root)) / denom;
        t2 = (a + Math.sqrt(under_root)) / denom;
        if (Math.min(t1, t2) < MAX_BRANCH_LENGTH) {
          return true;
        }
        return false;
      })) {
        continue;
      }

      const new_node = new PathNode(
        ...r(Math.min(MAX_BRANCH_LENGTH, distance(nearest_node, { x: xs, y: ys }))),
        nearest_node
      );
      path_nodes.push(new_node);

      // let node_circle = new Circle({ center: new_node, radius: 2, color: "yellow"});
      // cx.beginPath();
      // // center=(x,y) radius=r angle=0 to 7        
      // cx.arc(node_circle.center.x, node_circle.center.y, node_circle.radius, 0, 7);
      // cx.fillStyle = node_circle.color;
      // cx.fill();
      // cx.closePath();

      if (distance(new_node, objects[1].center) < PROXIMITY_THRESHOLD) {
        let node = new_node;
        path = [];
        while (node instanceof PathNode) {
          path.push(node);
          node = node.parent;
        }
        return 0;
      }

      iterations += 1;        
    }
    return -5;
  };

  const unclick_handler = e => {
    object_grabbed_idx = -1;
    canvas.style.cursor = object_hovered_idx == -1 ? "crosshair" : "grab";
    // should return an error code and mutate the path
    let err = RRT();
    if (err == 0) {
      cx.strokeStyle = "red";
      cx.lineWidth = 1;
      cx.lineJoin = "round";
      cx.beginPath();
      cx.moveTo(path[0].x, path[0].y);
      path.forEach(node => {
        let node_circle = new Circle({ center: node, radius: 2, color: "yellow"});
        cx.lineTo(node.x, node.y);          
      });
      cx.stroke();
    } else {
      console.error(err);
    }
  };

  canvas.addEventListener('mousedown', press_handler, true);
  canvas.addEventListener('pointerdown', press_handler, true);
  canvas.addEventListener('mousemove', move_handler, true);
  canvas.addEventListener('pointermove', move_handler, true);
  window.addEventListener('mouseup', unclick_handler, true);      
  window.addEventListener('pointerup', unclick_handler, true);    
}
