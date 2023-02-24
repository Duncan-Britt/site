'use strict';

// const pages = [ { path: "/blog/path-finding/path-finding.html", tags: ["algorithms", "ai", "robotics"], title: "Path Finding", date: "02-15-2023" },
//                 { path: "/blog/splice/splice.html", tags: ["projects"], title: "Splice: An HTML templating language", date: "01-19-2022" },
//                 { path: "/blog/software-generated-word-ladder-puzzles-and-web-app/software-generated-word-ladder-puzzles-and-web-app.html", tags: ["projects", "web dev"], title: "Software Generated Word Ladder Puzzles - Web App", date: "01-12-2022" }];

// Object.keys(tags).forEach(tag => {
  
// });

// console.log(tags);
let pages;
let tags;



document.addEventListener("DOMContentLoaded", () => {
  pages = Array.from(document.querySelectorAll('span.archive-item')).map(item => {
    let date = item.querySelector('.archive-date').textContent.trim().replace(':', '');
    let tags = item.dataset.tags.split(',').filter(s => s != '');
    let html_a_tag = item.querySelector('a')
    let path = html_a_tag.pathname;
    let title = html_a_tag.textContent;
    return { path, tags, title, date };
  });
  
  tags = {};
  pages.forEach(page => {
    page.tags.forEach(tag => {
      if (tags.hasOwnProperty(tag)) {
        tags[tag].pages.push(page.path);
      } else {
        tags[tag] = {};
        tags[tag].pages = [page.path];
        tags[tag].toggled = false;
      }
    })
  });
  
  let ul_tags = elt("ul", {class: "tag"}, "",
                    elt('li', {}, "",
                        elt('span', {class: 'tag-title'}, "Tags: ")),
                    ...Object.keys(tags).sort().map(tag => {
                      return elt("li", {}, "",
                                 elt('span', {class: 'tag'}, "",
                                     elt('span', {}, tag + " (" + String(tags[tag].pages.length) + ")")));
                    }));
  
  document.querySelector(".title")
    .insertAdjacentElement('afterend', ul_tags);

  document.querySelectorAll('span.tag').forEach(span => {
    span.addEventListener('pointerup', toggle_tag);
    // span.addEventListener('mouseup', toggle_tag);
  });
});

function toggle_tag(event) {
  event.preventDefault();
  event.stopPropagation();
  
  let span = event.currentTarget;
  
  let tag = event.target.textContent.replace(/ \(\d+\)/g, '');
  tags[tag].toggled = !tags[tag].toggled;

  if (tags[tag].toggled) {
    span.classList.add('selected');
  } else {
    span.classList.remove('selected');
  }
  
  let lis;
  // grap toggled tags, sort
  let tags_selected = Object.keys(tags).filter(tag => tags[tag].toggled).sort();
  let posts_selected = (Object.keys(tags).some(tag => tags[tag].toggled == true)) ?
      pages.filter(page => page.tags.some(tag => tags_selected.includes(tag))) : pages;

  // select posts containing a toggled tag, make elements of
  lis = posts_selected.map(post => {
    return elt("li", {}, "",
               elt("span", {class: "archive-item"}, "",
                   elt("span", {class: "archive-date"}, " " + post.date + ": "),
                   elt("a", {href: post.path}, post.title)))
  });
    
  // render post links
  let ul = document.querySelector("div.archive");
  ul.innerHTML = "";
  ul.appendChild(elt("p", {}, ""));
  lis.forEach(li => {
    ul.appendChild(li);
  });
  ul.appendChild(elt("p", {}, ""));
}

function elt(name, attrs, text, ...children) {
  let dom = document.createElement(name);
  for (let attr of Object.keys(attrs)) {
    dom.setAttribute(attr, attrs[attr]);
  }
  if (text) {
    dom.textContent = text;
  }
  for (let child of children) {
    dom.appendChild(child);
  }
  return dom;
}
