const random_hash = () => {
  const chars = "0123456789abcdef";
  let result = '0x';
  for (let i = 64; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

const tokenData = { hash: random_hash() }
const seed = tokenData.hash

const params = [0.01];
for (let j = 0; j < 8; j++) {
  params.push(parseInt(seed.slice(2 + (j * 8), 10 + (j * 8)), 16) / 4294967295);
}

const [p1, p2, p3, p4, p5, p6, p7, p8] = params

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const targetWidth = canvas.offsetWidth * 5
canvas.width = targetWidth;
canvas.height = targetWidth;

const yMultiplier = p3 < 0.5 ? ((p3 / 0.5) * 0.4) + 0.6 : (((p3 - 0.5) / 0.5) * 0.3) + 1.05;
const xExponent = (p4 * 0.004) + 0.999;

const width = 3000;
const height = 3000;
const scale = targetWidth / width;

// ctx.fillStyle = `rgb(${parseInt(p6 * 80)},0,${parseInt(p8 * 80)})`;
const fill1 = ctx.createLinearGradient(p4 * width, p1 * width, p3 * width, p2 * width);
const fill2 = ctx.createLinearGradient(p4 * width, 0, p3 * width, width);
// fill1.addColorStop(0, '#000');
// fill1.addColorStop(1, `rgb(${parseInt(p5 * 255)},${parseInt(p5 * 255)},0)`);
// fill2.addColorStop(0, 'rgba(0,0,0,0)');
// fill2.addColorStop(1, `rgba(${parseInt(p7 * 100)},0,${parseInt(p8 * 100)}, 0.5)`);

// #1
fill1.addColorStop(0, '#222');
fill1.addColorStop(1, `rgb(${parseInt(p5 * 255)},${parseInt(p5 * 100)},0)`);
fill2.addColorStop(0, 'rgba(0,0,0,0)');
fill2.addColorStop(1, `rgba(${parseInt(p7 * 100)},0,${parseInt(p8 * 100)}, 0.5)`);

// fill1.addColorStop(0, '#333');
// fill1.addColorStop(1, `rgb(${parseInt(p5 * 100)},${parseInt(p5 * 100)},${parseInt(p5 * 100)})`);
// fill2.addColorStop(0, 'rgba(0,0,0,0)');
// fill2.addColorStop(1, `rgba(${parseInt(p7 * 100)},0,${parseInt(p8 * 100)}, 0.5)`);

ctx.fillStyle = fill1;
ctx.fillRect(0, 0, targetWidth, targetWidth);
ctx.fillStyle = fill2;
ctx.fillRect(0, 0, targetWidth, targetWidth);

const baseLineWidth = scale * 1;
const yAdjusts = [-1055, -834, -509, -40, 650];

for (let i = 0; i < 40; i++) {
  const opacity = (i / 40) * 0.04;
  const widthAdjust = 0.001 * i;
  const heightAdjust = ((p5 * 0.45) + 0.05) * i;

  yAdjusts.forEach(yAdjust => {
    const pts = [
      {
        x: width / 2 + widthAdjust * 0,
        y: 1500 + yAdjust
      },
      { 
        x: width / 2 + widthAdjust,
        y: 1500 + yAdjust + heightAdjust
      }
    ].map(pt => ({ ...pt, lineWidth: baseLineWidth, opacity }));
    fUpTheLines({ pts, rgb: '255,255,255', startSegs: 4, segs: 6 });
  });
}

function fUpTheLines({ pts, rgb, startSegs, segs }) {
  const polys = [new Polyline(pts, ctx, { isClosed: true, tension: 0.01, numSegments: startSegs })];

  for (let i = 1; i < 5; i++) {
    const nextPolyPoints = nextPointsFromPreviousPoly(polys[i - 1]);
    polys.push(new Polyline(nextPolyPoints, ctx, { isClosed: true, tension: p1, numSegments: segs }));
  }

  polys.forEach((poly, i) => i && poly.draw({ rgb, scale }))
}

function nextPointsFromPreviousPoly(poly) {
  const lineWidth = poly.curvePoints[0].lineWidth / (0.5 + (p2 / 2))
  return poly.curvePoints.reduce((pts, pt, ptIdx) => {
    const newPt = rotatePoint({ x: Math.pow(pt.x, xExponent) * 1, y: pt.y * yMultiplier }, pt.normal, pt);
    // const newPt = rotatePoint(pt, pt.normal, { x: Math.pow(pt.x, xExponent) * 1, y: pt.y * yMultiplier });
    return pts.concat({ ...newPt, lineWidth, opacity: pt.opacity });
  }, []);
}

function rotatePoint(point, angle, center) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const deltaX = point.x - center.x;
  const deltaY = point.y - center.y;
  const x = (cos * deltaX) - (sin * deltaY) + center.x;
  const y = (cos * deltaY) + (sin * deltaX) + center.y;
  return { x, y };
}
