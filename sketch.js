// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let bubbles = []; // 用於存放水泡的陣列
let fireParticles = []; // 用於存放火焰粒子的陣列

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background('#e7c6ff');

  // 計算影像大小：全螢幕寬高的 50%
  let vW = width * 0.5;
  let vH = height * 0.5;
  // 計算置中座標
  let vX = (width - vW) / 2;
  let vY = (height - vH) / 2;

  image(video, vX, vY, vW, vH);

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 設定顏色（左手洋紅色，右手黃色）
        if (hand.handedness == "Left") {
          stroke(255, 0, 255);
          fill(255, 0, 255);
        } else {
          stroke(255, 255, 0);
          fill(255, 255, 0);
        }

        // 定義要串接在一起的關鍵點群組
        let fingerGroups = [
          [0, 1, 2, 3, 4],     // 大拇指
          [5, 6, 7, 8],        // 食指
          [9, 10, 11, 12],     // 中指
          [13, 14, 15, 16],    // 無名指
          [17, 18, 19, 20]     // 小指
        ];

        // 畫出手指連線
        strokeWeight(4);
        for (let group of fingerGroups) {
          for (let i = 0; i < group.length - 1; i++) {
            let p1 = hand.keypoints[group[i]];
            let p2 = hand.keypoints[group[i + 1]];

            let x1 = map(p1.x, 0, video.width, vX, vX + vW);
            let y1 = map(p1.y, 0, video.height, vY, vY + vH);
            let x2 = map(p2.x, 0, video.width, vX, vX + vW);
            let y2 = map(p2.y, 0, video.height, vY, vY + vH);

            line(x1, y1, x2, y2);
          }
        }

        // 畫出關鍵點小圓圈
        noStroke();
        for (let keypoint of hand.keypoints) {
          let x = map(keypoint.x, 0, video.width, vX, vX + vW);
          let y = map(keypoint.y, 0, video.height, vY, vY + vH);
          circle(x, y, 10);

          // 在關節處產生火焰粒子
          for (let j = 0; j < 2; j++) {
            fireParticles.push({
              x: x + random(-5, 5),
              y: y + random(-5, 5),
              vx: random(-1, 1),
              vy: random(-2, -4),
              life: 255,
              size: random(10, 20),
              type: hand.handedness // 記錄是左手還是右手
            });
          }

          // 在關鍵點 4, 8, 12, 16, 20 (指尖) 產生水泡
          let tips = [4, 8, 12, 16, 20];
          if (tips.includes(hand.keypoints.indexOf(keypoint))) {
            if (frameCount % 5 === 0) { // 每 5 幀產生一個，避免過多
              bubbles.push({
                x: x,
                y: y,
                startY: y,
                size: random(10, 25),
                popLimit: random(50, 150) // 隨機上升高度後破掉
              });
            }
          }
        }
      }
    }
  }

  // 更新並繪製火焰特效
  for (let i = fireParticles.length - 1; i >= 0; i--) {
    let p = fireParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 12; // 稍微減慢消失速度
    p.size *= 0.92; // 粒子隨時間縮小，更像真實火焰
    if (p.life <= 0) {
      fireParticles.splice(i, 1);
    } else {
      noStroke();
      
      if (p.type === "Left") {
        // 左手：青色 (Cyan) 漸層
        let r = 0;
        let g = map(p.life, 255, 0, 255, 100);
        let b = 255;
        fill(r, g, b, p.life);
      } else {
        // 右手：紅橙色漸層
        let r = 255;
        let g = map(p.life, 255, 0, 200, 0);
        let b = 0;
        fill(r, g, b, p.life);
      }
      circle(p.x, p.y, p.size);
    }
  }

  // 更新並繪製水泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    b.y -= 2; // 水泡往上飄移
    noFill();
    stroke(255);
    strokeWeight(1.5);
    circle(b.x, b.y, b.size);

    // 如果水泡上升超過限定高度或超出畫面，則移除 (破掉)
    if (b.startY - b.y > b.popLimit || b.y < 0) {
      bubbles.splice(i, 1);
    }
  }

  // 在畫布上方加上置中文字
  fill(0); // 設定文字顏色為黑色
  noStroke();
  textSize(40);
  textAlign(CENTER, BOTTOM); // 以文字底部為對齊點
  text("414730027 王瑀瑄", width / 2, vY - 10); // 放置在影像 Y 座標上方 10 像素處
}
