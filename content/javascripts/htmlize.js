function CodeHighlightOn(link, id) {
  const line = document.getElementById(id);
  line.classList.remove('coderef-off');
  line.classList.add('coderef-on');
}

function CodeHighlightOff(link, id) {
  const line = document.getElementById(id);
  line.classList.remove('coderef-on');
  line.classList.add('coderef-off');
}
