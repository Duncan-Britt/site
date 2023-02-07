'use strict';

// import { Dom } from "./dom.js";
// import { keydown_handler, keyup_handler } from "./keypress.js";
// import { Assignments } from "./assignments.js";

document.addEventListener("DOMContentLoaded", () => {
  // const COLUMNS = 1000;
  // const ROWS = 1000;
  // const canvas = elt("canvas", { width: String(COLUMNS) + "px", height: String(ROWS) + "px" });
  // canvas.style.position = 'absolute';
  // canvas.style.left = '0';
  // canvas.style.top = '0';
  // canvas.style.zIndex = '-1';
  // document.body.appendChild(canvas);  
  // const context = canvas.getContext("2d");
  
  // context.fillStyle = "white";
  // context.fillRect(0,0,500,500);
  // let image = context.getImageData(0, 0, 500, 500);
  // let pix = image.data;
  // for (let i = 0; i < pix.length; i += 4) {
  //   const pix_index = Math.floor(i / 4);
  //   const row = Math.floor(pix_index / COLUMNS);
  //   const column = pix_index % COLUMNS;
  //   if (i < 64) {
  //     console.log(opacity_by_distance(row, column));
  //   }
  //   pix[i + 3] = opacity_by_distance(row, column);
  // }

  // context.putImageData(image, 0, 0);

  var body = document.body,
      html = document.documentElement;

  var height = Math.max( body.scrollHeight, body.offsetHeight, 
                         html.clientHeight, html.scrollHeight, html.offsetHeight );

  const title = document.querySelector(".title");  
  
  const overlayX = elt("div", { id: "overlay-x" });
  overlayX.style.position = "absolute";
  overlayX.style.left = "0";
  overlayX.style.top = "0";
  overlayX.style.right = "0";
  overlayX.style.height = String(height) + "px";
  overlayX.style.zIndex = "-1";
  overlayX.style.backgroundColor = "white";
  overlayX.style.background = `linear-gradient(90deg, rgba(255,255,255,0.563484768907563) 0%, rgba(255, 255, 255,1) ${title.offsetLeft - 50}px, rgba(255, 255, 255,1) ${title.offsetLeft + 250}px, rgba(255,255,255,0) 100%)`;  
  document.body.appendChild(overlayX);

  const overlayY = elt("div", { id: "overlay-y" });
  overlayY.style.position = "absolute";
  overlayY.style.left = "0";
  overlayY.style.top = "0";
  overlayY.style.right = "0";
  overlayY.style.height = String(height) + "px";
  overlayY.style.zIndex = "-1";
  overlayY.style.backgroundColor = "white";
  overlayY.style.background = "linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255, 255, 255,1) 8%, rgba(255, 255, 255,1) 16%, rgba(255,255,255,0) 100%)"
  document.body.appendChild(overlayY);

  window.addEventListener("resize", debounce((event) => {
    overlayX.style.background = `linear-gradient(90deg, rgba(255,255,255,0.563484768907563) 0%, rgba(255, 255, 255,1) ${title.offsetLeft - 50}px, rgba(255, 255, 255,1) ${title.offsetLeft + 250}px, rgba(255,255,255,0) 100%)`;
  }));
});

/**
 * Debounce function for better performance
 * (c) 2018 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {Function} fn The function to debounce
 */
var debounce = function (fn) {
	// Setup a timer
	var timeout;

	// Return a function to run debounced
	return function () {

		// Setup the arguments
		var context = this;
		var args = arguments;

		// If there's a timer, cancel it
		if (timeout) {
			window.cancelAnimationFrame(timeout);
		}

		// Setup the new requestAnimationFrame()
		timeout = window.requestAnimationFrame(function () {
			fn.apply(context, args);
		});

	}
};

function opacity_by_distance(row, col) {
  // get all text nodes
  let text_nodes = [];
  let walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  let node;
  while (node = walk.nextNode()) {
    text_nodes.push(node);
  }

  const min_distance = text_nodes.reduce((min_acc, node) => {
    let range = document.createRange();
    range.selectNodeContents(node);
    let rect = range.getBoundingClientRect();
    let y = window.pageYOffset + rect.y;
    let x = window.pageXOffset + rect.x;
    let dist = Math.sqrt(Math.abs(y - row)**2 + Math.abs(x - col)**2);
    return Math.min(min_acc, dist);;
  }, Infinity);

  const width  = window.innerWidth || document.documentElement.clientWidth || 
        document.body.clientWidth;
  const height = window.innerHeight|| document.documentElement.clientHeight|| 
        document.body.clientHeight;
  const diagonal = Math.floor(Math.sqrt(width**2 + height**2) / 10);

  return Math.abs(255 - Math.floor((min_distance * 255) / (diagonal)));
}

function elt(name, attrs, ...children) {
  let dom = document.createElement(name);
  for (let attr of Object.keys(attrs)) {
    dom.setAttribute(attr, attrs[attr]);
  }
  for (let child of children) {
    dom.appendChild(child);
  }
  return dom;
}
