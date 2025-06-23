let cols = 50;
let rows = 100;
let gridX;
let gridY;
let pixelSize;
let bottomX;
let bottomY;
let wideScreen = false;
let arr = [];
let hue = 0;
let tempHeight;

//liquids = maxheight 0
function enableLiquids() {
  const liquid = document.getElementById("liquidInput").checked;
  if (liquid) {
    tempHeight = document.getElementById("heightInput").value;
    document.getElementById("heightInput").value = 0;
    document.getElementById("heightInput").style.pointerEvents = "none";
  } else {
    document.getElementById("heightInput").value = tempHeight;
    document.getElementById("heightInput").style.pointerEvents = "";
  }
}

//reset
function reset() {
  particleArr = [];
  arr = createMatrix(bottomX, bottomY);
  let minScreenWidth = document.getElementById("screenXsize").value;
  let minScreenHeight = document.getElementById("screenYsize").value;
  if (minScreenWidth === "") {
    minScreenWidth = 50;
  }
  if (minScreenHeight === "") {
    minScreenHeight = 100;
  }
  cols = minScreenWidth;
  rows = minScreenHeight;
  setup();
}

//check if inbounds
function inBounds(x, y) {
  return x >= 0 && x < bottomX && y >= 0 && y < bottomY;
}

//make a matrix
function createMatrix(cols, rows) {
  let matrix = [];
  for (let i = 0; i < cols; i++) {
    matrix[i] = [];
    for (let j = 0; j < rows; j++) {
      matrix[i][j] = 0;
    }
  }
  return matrix;
}

//particle creation
let particleArr = [];
class particle {
  constructor(_color, _x, _y, _hasGravity, _maxHeight, _rainbow) {
    this.color = _color;
    this.x = _x;
    this.y = _y;
    this.hasGravity = _hasGravity;
    this.maxHeight = _maxHeight;
    this.rainbow = _rainbow;
  }

  get _color() {
    return this.color;
  }
  get _x() {
    return this.x;
  }
  get _y() {
    return this.y;
  }
  get _hasGravity() {
    return this.hasGravity;
  }
  get _maxHeight() {
    return this.maxHeight;
  }
  get _rainbow() {
    return this.rainbow;
  }
}

//falling function!!!
function physicsTick() {
  let tempArr = arr.map((col) => col.slice());
  //loop through particles
  for (let i = 0; i < particleArr.length; i++) {
    let p = particleArr[i];
    if (
      !inBounds(p.x, p.y, arr) ||
      p === undefined ||
      tempArr[p.x]?.[p.y] === undefined
    ) {
      continue;
    }
    //if particle has gravity
    if (p.hasGravity) {
      //if can fall, fall and continue
      if (inBounds(p.x, p.y + 1, tempArr) && tempArr[p.x][p.y + 1] === 0) {
        tempArr[p.x][p.y] = 0;
        p.y++;
        tempArr[p.x][p.y] = p;
        continue;
      }

      //if exceeds height, fall
      if (p.maxHeight < checkHeight(p.x, p.y, tempArr)) {
        randInt = Math.random() < 0.5 ? -1 : 1;
        let newX = p.x + randInt;
        let newY = p.y;
        if (tempArr[newX]?.[newY] !== 0) {
          continue;
        }
        if (inBounds(newX, newY, tempArr)) {
          tempArr[p.x][p.y] = 0;
          p.x = newX;
          p.y = newY;
          tempArr[p.x][p.y] = p;
        } else {
          tempArr[p.x][p.y] = p;
        }
        continue;
      }

      //if ya can't fall, stay
      tempArr[p.x][p.y] = p;
    } //end falling behavior
  } //end loop
  arr = tempArr;
}

function checkHeight(x, y, array) {
  let p = array[x][y];
  let height = 0;
  for (let i = p.y; i <= bottomY; i++) {
    let cell = array[x][y + height];
    let leftcell = typeof array[x - 1]?.[y + height] === "object";
    let rightcell = typeof array[x + 1]?.[y + height] === "object";
    //const leftcell = array[x-1]?.[y+height];
    if (cell === 0 || cell === undefined || (leftcell && rightcell)) {
      return height;
    }
    height++;
  }
}

//initiate physics loop
let delay = 20;
let loop = window.setInterval(() => {
  physicsTick();
}, delay);

//reset loop w new refresh rate
function changeRefresh() {
  delay = document.getElementById("refreshInput").value;
  window.clearInterval(loop);
  loop = window.setInterval(() => {
    physicsTick();
  }, delay);
}

//p5.js functions
function setup() {
  createCanvas(windowWidth, windowHeight);

  //size shenanigains
  if (windowWidth > windowHeight) {
    wideScreen = true;
  }
  pixelSize = Math.min(windowWidth / cols, windowHeight / rows);
  bottomX = Math.floor(windowWidth / pixelSize);
  bottomY = Math.floor(windowHeight / pixelSize);
  bottomPixel = Math.floor(bottomX * wideScreen + bottomY * !wideScreen);
  if (wideScreen) {
    cols = bottomPixel;
  } else {
    rows = bottomPixel;
  }

  //matrix startup
  arr = createMatrix(bottomX, bottomY);
}

function draw() {
  //set background
  background("black");
  //cover up rest of screen
  fill("white");
  if (wideScreen) {
    rect(
      pixelSize * bottomPixel,
      0,
      windowWidth - pixelSize * bottomPixel,
      windowHeight
    );
  } else {
    rect(
      0,
      pixelSize * bottomPixel,
      windowWidth,
      windowHeight - pixelSize * bottomPixel
    );
  }
  //create particle on click
  if (
    mouseIsPressed &&
    inBounds(gridX, gridY, arr) &&
    document.querySelector("#configContainer:hover") === null
  ) {
    //get parameters
    hue++;
    if (hue == 360) {
      hue = 0;
    }
    const rainbowInput = document.getElementById("rainbowInput").checked;
    let colorInput = document.getElementById("colorInput").value;
    if (rainbowInput) {
      colorInput = hue;
    }
    const brushSize = document.getElementById("brushSizeInput").value;
    const gravity = document.getElementById("gravityInput").checked;
    const maxH = document.getElementById("heightInput").value / 10;
    //for loop for the drawing
    let extent = Math.floor(Math.abs(brushSize) / 2);
    for (let i = -extent; i <= extent; i++) {
      for (let j = -extent; j <= extent; j++) {
        if (Math.random() < 0.75) {
          let X = gridX + i;
          let Y = gridY + j;
          if (inBounds(X, Y, arr)) {
            //delete selection
            arr[X][Y] = 0;
            particleArr = particleArr.filter((p) => !(p.x === X && p.y === Y));
            if (brushSize > 0) {
              //create the new particle if it's not a duplicate
              let newParticle = new particle(
                colorInput,
                X,
                Y,
                gravity,
                maxH,
                rainbowInput
              );
              if (JSON.stringify(arr[X][Y]) !== JSON.stringify(newParticle)) {
                particleArr.push(newParticle);
                arr[X][Y] = newParticle;
              }
            }
          }
        }
      }
    }
  }

  //display particles
  for (let i = 0; i < particleArr.length; i++) {
    let p = particleArr[i];
    if (p.rainbow === true) {
      colorMode(HSB, 360, 100, 100);
      fill(Number(p.color), 50, 100);
    } else {
      colorMode(RGB);
      fill(p.color);
    }
    //add after testing
    noStroke();
    rect(pixelSize * p.x, pixelSize * p.y, pixelSize, pixelSize);
  }

  //display mouse position
  gridX = Math.floor(mouseX / pixelSize);
  gridY = Math.floor(mouseY / pixelSize);
  fill("white");
  text(
    `screenX: ${Math.floor(mouseX)} screenY: ${Math.floor(
      mouseY
    )}\ngridX: ${gridX} gridY: ${gridY}`,
    0,
    10
  );
}

//check
function validateParticles() {
  for (let i = 0; i < particleArr.length; i++) {
    let p = particleArr[i];

    // Check if particle is undefined or null
    if (!p) {
      console.warn(`Particle ${i} is null or undefined.`);
      particleArr.splice(i, i);
      continue;
    }

    // Check if particle is out of bounds
    if (!inBounds(p.x, p.y, arr)) {
      console.warn(`Particle ${i} is out of bounds at (${p.x}, ${p.y}).`);
      particleArr.splice(i, i);
      continue;
    }

    // Check if the particle is not where it says it is in arr
    if (arr[p.x][p.y] !== p) {
      console.warn(
        `Particle ${i} not matched in arr at (${p.x}, ${p.y}). Found:`,
        arr[p.x][p.y]
      );
      particleArr.splice(i, i);
      continue;
    }

    // Optional: check for duplicate particles at same (x, y)
    for (let j = i + 1; j < particleArr.length; j++) {
      let p2 = particleArr[j];
      if (p2 && p.x === p2.x && p.y === p2.y) {
        console.warn(
          `Particles ${i} and ${j} are duplicates at (${p.x}, ${p.y}).`
        );
      }
    }
  }
}
