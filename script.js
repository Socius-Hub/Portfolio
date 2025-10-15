const ropeLength = 400;
const joints = 8;
const segmentLength = ropeLength / (joints - 1);
const gravity = 1.6;
const damping = 0.99;
const cardMass = 4.2;
const constraintIterations = 64;
let origin = { x: 0, y: 80 };
function updateOriginPosition() {
const breakpoint = 995;

if (window.innerWidth <= breakpoint) {
    origin.x = window.innerWidth / 2;
    origin.y = -80; 
} else {
    origin.x = window.innerWidth * 0.25;
    origin.y = -104; 
}
}
updateOriginPosition();

let ropePoints = [];
let isDragging = false, kinematic = false;
let dragOffset = { x: 0, y: 0 };
let mouseVX = 0, mouseVY = 0, lastMouseX = 0, lastMouseY = 0;

function resetRope() {
  ropePoints = Array.from({ length: joints }, (_, i) => ({
    x: origin.x,
    y: origin.y + i * segmentLength,
    oldX: origin.x,
    oldY: origin.y + i * segmentLength
  }));
}
resetRope();

function applyVerletIntegration() {
  for (let i = 1; i < ropePoints.length; i++) {
    const p = ropePoints[i];
    if (kinematic && i === ropePoints.length - 1) continue;
    const vx = (p.x - p.oldX) * damping;
    const vy = (p.y - p.oldY) * damping + gravity * (i === ropePoints.length - 1 ? cardMass : 1);
    p.oldX = p.x;
    p.oldY = p.y;
    p.x += vx;
    p.y += vy;
  }
}

function applyConstraints() {
  ropePoints[0].x = origin.x;
  ropePoints[0].y = origin.y;

  for (let k = 0; k < constraintIterations; k++) {
    for (let i = 0; i < ropePoints.length - 1; i++) {
      const p1 = ropePoints[i], p2 = ropePoints[i + 1];
      const dx = p2.x - p1.x, dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy);
      const diff = segmentLength - dist;
      const percent = diff / dist / 2;
      const offsetX = dx * percent, offsetY = dy * percent;

      if (i !== 0) {
        p1.x -= offsetX;
        p1.y -= offsetY;
      }

      if (i + 1 === ropePoints.length - 1 && !kinematic) {
        p2.x += offsetX * (1 / cardMass);
        p2.y += offsetY * (1 / cardMass);
      } else if (i + 1 !== ropePoints.length - 1) {
        p2.x += offsetX;
        p2.y += offsetY;
      }
    }
  }
}

function drawRope() {
  const canvas = document.getElementById('ropeCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(ropePoints[0].x, ropePoints[0].y);
  for (let i = 1; i < ropePoints.length; i++) {
    ctx.lineTo(ropePoints[i].x, ropePoints[i].y);
  }
  ctx.strokeStyle = "#b74b4b";
  ctx.lineWidth = 40;
  ctx.stroke();
}

function updatePositions() {
  drawRope();
  const last = ropePoints[ropePoints.length - 1];
  const prev = ropePoints[ropePoints.length - 2];
  const angle = Math.atan2(last.y - prev.y, last.x - prev.x) - Math.PI / 2;
  card.style.left = `${last.x}px`;
  card.style.top = `${last.y}px`;
  card.style.transform = `translate(-50%, -50%) rotate(${angle * 180 / Math.PI}deg)`;
}

function animate() {
  if (!isDragging) applyVerletIntegration();
  applyConstraints();
  updatePositions();
  requestAnimationFrame(animate);
}

const card = document.getElementById('card');
card.addEventListener("pointerdown", e => {
  isDragging = true;
  kinematic = true;
  card.setPointerCapture(e.pointerId);
  const last = ropePoints[ropePoints.length - 1];
  dragOffset.x = e.clientX - last.x;
  dragOffset.y = e.clientY - last.y;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
  mouseVX = mouseVY = 0;
});

card.addEventListener("pointermove", e => {
  if (isDragging && kinematic) {
    const last = ropePoints[ropePoints.length - 1];
    let tx = e.clientX - dragOffset.x;
    let ty = e.clientY - dragOffset.y;
    const dx = tx - origin.x, dy = ty - origin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxLength = ropeLength;

    if (dist > maxLength) {
      const ratio = maxLength / dist;
      tx = origin.x + dx * ratio;
      ty = origin.y + ratio * dy;
    }

    last.oldX = last.x = tx;
    last.oldY = last.y = ty;

    mouseVX = e.clientX - lastMouseX;
    mouseVY = e.clientY - lastMouseY;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  }
});

card.addEventListener("pointerup", e => {
  isDragging = false;
  kinematic = false;
  card.releasePointerCapture(e.pointerId);
  const last = ropePoints[ropePoints.length - 1];
  last.oldX = last.x - mouseVX * 0.8;
  last.oldY = last.y - mouseVY * 0.8;
});

window.addEventListener("resize", () => {
  updateOriginPosition();
  resetRope();
  updatePositions();
});

animate();

const menuIcon = document.querySelector('#menu-icon');
const navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
  menuIcon.classList.toggle('bx-x');
  navbar.classList.toggle('active');
};

document.querySelectorAll('.navbar a').forEach(link => {
  link.addEventListener('click', () => {
    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');
  });
});

const typingElement = document.getElementById('typing');
const words = [
    "Front-End",
    "Web Design",        
    "UI/UX Design"
];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 150;

function type() {
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
        typingElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
    } else {
        typingElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 150;
    }

    if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        typingSpeed = 1000;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typingSpeed = 500;
    }

    setTimeout(type, typingSpeed);
}

type();