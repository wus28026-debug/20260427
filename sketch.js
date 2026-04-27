// Face Mesh Detection with ml5.js  
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/facemesh  
// https://youtu.be/R5UZsIwPbJA  

let video;
let faceMesh;
let faces = [];

function preload() {
  // Initialize FaceMesh model with a maximum of one face and flipped video input
  faceMesh = ml5.faceMesh({ maxFaces: 1, flipped: true });
}

function mousePressed() {
  // Log detected face data tothe console
  console.log(faces);
}

function gotFaces(results) {
  faces = results;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting faces
  faceMesh.detectStart(video, gotFaces);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background('#e7c6ff');

  // Calculate dimensions: 50% of the canvas width and height
  let vW = width * 0.5;
  let vH = height * 0.5;
  let vX = (width - vW) / 2;
  let vY = (height - vH) / 2;

  image(video, vX, vY, vW, vH);

  // Ensure at least one face is detected
  if (faces.length > 0) {
    let face = faces[0];

    // Draw keypoints on the detected face
    for (let i = 0; i < face.keypoints.length; i++) {
      let keypoint = face.keypoints[i];
      // Map keypoint coordinates to the scaled video position
      let x = map(keypoint.x, 0, video.width, vX, vX + vW);
      let y = map(keypoint.y, 0, video.height, vY, vY + vH);
      stroke(255, 255, 0);
      strokeWeight(2);
      point(x, y);
    }
  }
}
