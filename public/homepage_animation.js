var greeting = ("Hello " + username).split('').join(' ')
var index = 0;

function setup() {
  const container = document.querySelector("#canvas");
  const w = container.clientWidth;
  const h = container.clientHeight;
  console.log(w);
  var canvas = createCanvas(w, h);
  canvas.parent('canvas');
  textFont('Montserrat');
}

function draw() {
  background(0, 0);
  textSize(20);
  fill(0);
  text(greeting.substring(0, parseInt(index)), 20, 40);
  if (index < greeting.length) {
    index += 0.2;
  } else {
    noLoop();
  }
}
window.addEventListener("resize", function() {
  const container = document.querySelector("#canvas");
  const w = container.clientWidth;
  const h = container.clientHeight;
  resizeCanvas(w, h);
  index = 0;
  loop();
});
