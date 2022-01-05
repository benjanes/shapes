class Polyline {
  constructor(points = [], ctx, opts = {}) {
    this.points = points;
    this.ctx = ctx;
    this.curvePoints = this.points.length ? this.getCurvePoints(opts.isClosed, opts.tension || 0.5, opts.numSegments || 16) : [];
  }

  setCtx(ctx) {
    this.ctx = ctx;
  }

  draw(opts = {}) {
    this.drawLines(this.getCurvePoints(opts.isClosed, opts.tension || 0.5, opts.numSegments || 16), opts.rgb || '0,0,0', opts.scale);
  }

  getCurvePoints(isClosed, tension, numSegments) {
    let points = [...this.points];
    const newPoints = [];
    points.unshift(this.points[0]);
    points.push(this.points[this.points.length - 1]);

    for (let i = 1; i < points.length - 2; i++) {
      if (this.curvePoints) return this.curvePoints;

      for (let t = 0; t <= numSegments; t++) {
        const t1x = (points[i + 1].x - points[i - 1].x) * tension;
        const t2x = (points[i + 2].x - points[i].x) * tension;
        const t1y = (points[i + 1].y - points[i - 1].y) * tension;
        const t2y = (points[i + 2].y - points[i].y) * tension;
        const st = t / numSegments;
        const c1 = 2 * Math.pow(st, 3) - 3 * Math.pow(st, 2) + 1;
        const c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2);
        const c3 = Math.pow(st, 3) - 2 * Math.pow(st, 2) + st;
        const c4 = Math.pow(st, 3) - Math.pow(st, 2);
        const x = c1 * points[i].x + c2 * points[i + 1].x + c3 * t1x + c4 * t2x;
        const y = c1 * points[i].y + c2 * points[i + 1].y + c3 * t1y + c4 * t2y;

        newPoints.push({
          ...points[i],
          x,
          y,
        });
      }
    }

    return newPoints.map((pt, ptIdx, pts) => {
      const lastIdx = pts.length - 1;
      const prevPt = ptIdx ? pts[ptIdx - 1] : pts[lastIdx];
      const nextPt = ptIdx !== lastIdx ? pts[ptIdx + 1] : pts[0];

      const deltaX = nextPt.x - prevPt.x;
      const deltaY = nextPt.y - prevPt.y;

      return { ...pt, normal: Math.atan2(deltaY, deltaX) + (Math.PI / 2) };
    });
  }

  drawLines(pts, rgb, scale) {
    this.ctx.strokeStyle = `rgb(${rgb},${pts[0].opacity.toFixed(3)})`;
    this.ctx.lineWidth = pts[0].lineWidth;

    this.ctx.beginPath();
    this.ctx.moveTo(pts[0].x * scale, pts[0].y * scale)
    pts.slice(1).forEach(({ x, y }) => this.ctx.lineTo(x * scale, y * scale))
    this.ctx.stroke();
    this.ctx.closePath();
  }
}