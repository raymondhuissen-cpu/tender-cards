// TenderCards A6 Card Generator
// Uses @napi-rs/canvas for pixel-perfect premium output
'use strict';

const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

// ─── FONTS ───
const FONTS = 'C:/Users/Administrator/AppData/Roaming/Claude/local-agent-mode-sessions/skills-plugin/c9eea2d7-7029-4ee7-a9ee-3179e7051736/3fb6e63a-eb48-44d8-9dda-6b66a544436f/skills/canvas-design/canvas-fonts';

GlobalFonts.registerFromPath(path.join(FONTS, 'Lora-BoldItalic.ttf'),   'Lora');
GlobalFonts.registerFromPath(path.join(FONTS, 'Lora-Italic.ttf'),       'LoraItalic');
GlobalFonts.registerFromPath(path.join(FONTS, 'Italiana-Regular.ttf'),  'Italiana');
GlobalFonts.registerFromPath(path.join(FONTS, 'WorkSans-Regular.ttf'),  'WorkSans');

// ─── DIMENSIONS: A6 @ 300dpi ───
const W = 1240;
const H = 1748;
const CX = W / 2;
const CY = H / 2;

// ─── PALETTE ───
const SAGE        = { r: 139, g: 175, b: 138 }; // #8BAF8A
const SAGE_DARK   = { r: 110, g: 145, b: 108 }; // slightly deeper
const GOLD        = '#C4963D';
const GOLD_FOIL   = '#D4A94A'; // slightly lighter for foil shimmer
const BG          = '#F0EDE8'; // warm off-white photo background

// ─── CANVAS ───
const canvas = createCanvas(W, H);
const ctx    = canvas.getContext('2d');

// ─── HELPERS ───

// Seeded PRNG (Mulberry32)
function makePRNG(seed) {
  let s = seed;
  return function() {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Draw deckled edge path around card area
function deckledCardPath(ctx, x1, y1, x2, y2, rnd) {
  const STEPS   = 80;  // points per side
  const JITTER  = 14;  // max px deviation

  ctx.beginPath();

  // Top edge: left → right
  for (let i = 0; i <= STEPS; i++) {
    const t  = i / STEPS;
    const px = x1 + t * (x2 - x1) + (rnd() - 0.5) * JITTER * 0.6;
    const py = y1 + (rnd() - 0.5) * JITTER;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  // Right edge: top → bottom
  for (let i = 1; i <= STEPS; i++) {
    const t  = i / STEPS;
    const px = x2 + (rnd() - 0.5) * JITTER;
    const py = y1 + t * (y2 - y1) + (rnd() - 0.5) * JITTER * 0.6;
    ctx.lineTo(px, py);
  }
  // Bottom edge: right → left
  for (let i = 1; i <= STEPS; i++) {
    const t  = i / STEPS;
    const px = x2 - t * (x2 - x1) + (rnd() - 0.5) * JITTER * 0.6;
    const py = y2 + (rnd() - 0.5) * JITTER;
    ctx.lineTo(px, py);
  }
  // Left edge: bottom → top
  for (let i = 1; i <= STEPS; i++) {
    const t  = i / STEPS;
    const px = x1 + (rnd() - 0.5) * JITTER;
    const py = y2 - t * (y2 - y1) + (rnd() - 0.5) * JITTER * 0.6;
    ctx.lineTo(px, py);
  }
  ctx.closePath();
}

// Draw a botanical leaf shape (elongated, pointed) — wide enough to read clearly
function drawLeaf(ctx, lengthA, lengthB, width) {
  const w = width * 1.15; // slightly broader than original but still elongated
  // Draws upward from origin
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo( w * 0.85, -lengthA * 0.3,  w * 0.95, -lengthA * 0.72,  0, -lengthA);
  ctx.bezierCurveTo(-w * 0.95, -lengthA * 0.72, -w * 0.85, -lengthA * 0.3,  0, 0);
  ctx.fill();

  // Central vein — lighter than fill so it's visible on the gold leaf
  const savedStyle = ctx.strokeStyle;
  ctx.strokeStyle = 'rgba(180,120,30,0.7)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, -lengthA * 0.05);
  ctx.lineTo(0, -lengthA * 0.9);
  ctx.stroke();
  ctx.strokeStyle = savedStyle;
  ctx.lineWidth = 1.8;
}

// Draw a small open heart outline — classic shape, point down
function drawHeart(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.85); // bottom tip
  // left arc up
  ctx.bezierCurveTo(cx - r * 0.9, cy + r * 0.3, cx - r * 1.35, cy - r * 0.25, cx - r * 0.95, cy - r * 0.65);
  ctx.bezierCurveTo(cx - r * 0.55, cy - r * 1.05, cx, cy - r * 0.52, cx, cy - r * 0.52);
  // right arc down
  ctx.bezierCurveTo(cx, cy - r * 0.52, cx + r * 0.55, cy - r * 1.05, cx + r * 0.95, cy - r * 0.65);
  ctx.bezierCurveTo(cx + r * 1.35, cy - r * 0.25, cx + r * 0.9, cy + r * 0.3, cx, cy + r * 0.85);
  ctx.closePath();
  ctx.stroke();
}

// ─── STEP 1: WARM LINEN BACKGROUND ───
ctx.fillStyle = BG;
ctx.fillRect(0, 0, W, H);

// Subtle vignette on background
const bgVig = ctx.createRadialGradient(CX, CY, H * 0.2, CX, CY, H * 0.85);
bgVig.addColorStop(0, 'rgba(255,255,255,0)');
bgVig.addColorStop(1, 'rgba(80,60,40,0.18)');
ctx.fillStyle = bgVig;
ctx.fillRect(0, 0, W, H);

// ─── STEP 2: CARD SHADOW ───
const MARGIN = 64;
const rnd = makePRNG(7391);

ctx.save();
ctx.shadowBlur   = 70;
ctx.shadowColor  = 'rgba(40,28,10,0.32)';
ctx.shadowOffsetX = 10;
ctx.shadowOffsetY = 18;
deckledCardPath(ctx, MARGIN, MARGIN, W - MARGIN, H - MARGIN, makePRNG(7391));
ctx.fillStyle = `rgb(${SAGE.r},${SAGE.g},${SAGE.b})`;
ctx.fill();
ctx.restore();

// ─── STEP 3: CLIP TO CARD SHAPE ───
deckledCardPath(ctx, MARGIN, MARGIN, W - MARGIN, H - MARGIN, makePRNG(7391));
ctx.clip();

// ─── STEP 4: SAGE BASE ───
ctx.fillStyle = `rgb(${SAGE.r},${SAGE.g},${SAGE.b})`;
ctx.fillRect(0, 0, W, H);

// Subtle warm glow from center
const glow = ctx.createRadialGradient(CX, H * 0.42, 0, CX, H * 0.42, W * 0.9);
glow.addColorStop(0, 'rgba(220,200,160,0.10)');
glow.addColorStop(1, 'rgba(80,110,78,0.14)');
ctx.fillStyle = glow;
ctx.fillRect(0, 0, W, H);

// ─── STEP 5: PAPER GRAIN TEXTURE ───
// Overlay irregular noise for organic paper feel
const offscreen = createCanvas(W, H);
const octx = offscreen.getContext('2d');
const imgData = octx.createImageData(W, H);
const d = imgData.data;
for (let i = 0; i < d.length; i += 4) {
  const noise = (Math.random() - 0.5) * 28;
  d[i]   = Math.max(0, Math.min(255, SAGE.r + noise));
  d[i+1] = Math.max(0, Math.min(255, SAGE.g + noise));
  d[i+2] = Math.max(0, Math.min(255, SAGE.b + noise));
  d[i+3] = 55; // subtle overlay
}
octx.putImageData(imgData, 0, 0);
ctx.drawImage(offscreen, 0, 0);

// ─── STEP 6: BOTANICAL ILLUSTRATION ───
// Positioned in upper third, centered — enlarged and more refined
const BOT_CX = CX;
const BOT_CY = 440;
const SC = 1.9; // scale factor — larger, more commanding presence

ctx.save();
ctx.translate(BOT_CX, BOT_CY);
ctx.scale(SC, SC);

// Gold foil fill + stroke settings
ctx.strokeStyle = GOLD;
ctx.fillStyle   = GOLD;
ctx.lineWidth   = 3.2;  // heavier main stem — must read over the leaves
ctx.lineCap     = 'round';
ctx.lineJoin    = 'round';

// Draw leaves FIRST so branches and stem paint on top (proper layer order)

// Leaves — distributed along branches for a full botanical sprig
// Far left main branch — 3 leaves staggered along branch
ctx.save(); ctx.translate(-40, 18);  ctx.rotate(-0.38); drawLeaf(ctx, 26, 26, 10); ctx.restore();
ctx.save(); ctx.translate(-72, 4);   ctx.rotate(-0.55); drawLeaf(ctx, 32, 32, 13); ctx.restore();
ctx.save(); ctx.translate(-98, -14); ctx.rotate(-0.72); drawLeaf(ctx, 22, 22, 9);  ctx.restore();
// Far left secondary branch
ctx.save(); ctx.translate(-62, -14); ctx.rotate(-0.90); drawLeaf(ctx, 18, 18, 7); ctx.restore();
ctx.save(); ctx.translate(-80, -36); ctx.rotate(-1.10); drawLeaf(ctx, 15, 15, 6); ctx.restore();
// Right main branch — 3 leaves
ctx.save(); ctx.translate(38, -2);   ctx.rotate(0.40);  drawLeaf(ctx, 24, 24, 10); ctx.restore();
ctx.save(); ctx.translate(68, -20);  ctx.rotate(0.58);  drawLeaf(ctx, 30, 30, 12); ctx.restore();
ctx.save(); ctx.translate(94, -40);  ctx.rotate(0.76);  drawLeaf(ctx, 20, 20, 8);  ctx.restore();
// Right secondary branch
ctx.save(); ctx.translate(60, -26);  ctx.rotate(0.92);  drawLeaf(ctx, 16, 16, 7); ctx.restore();
ctx.save(); ctx.translate(76, -52);  ctx.rotate(1.12);  drawLeaf(ctx, 14, 14, 6); ctx.restore();
// Upper branches
ctx.save(); ctx.translate(-32, -58); ctx.rotate(-0.60); drawLeaf(ctx, 16, 16, 7); ctx.restore();
ctx.save(); ctx.translate(-42, -82); ctx.rotate(-0.80); drawLeaf(ctx, 13, 13, 5); ctx.restore();
ctx.save(); ctx.translate(26, -76);  ctx.rotate(0.52);  drawLeaf(ctx, 14, 14, 6); ctx.restore();
ctx.save(); ctx.translate(32, -92);  ctx.rotate(0.68);  drawLeaf(ctx, 12, 12, 5); ctx.restore();

// — Berries cluster at apex — three tiers
const berries = [
  { x: -11, y: -90,  r: 5.5 },
  { x:   2, y: -102, r: 6.5 },
  { x:  12, y: -93,  r: 5.0 },
  { x:  -2, y: -115, r: 4.5 },
  { x: -14, y: -108, r: 4.0 },
  { x:   8, y: -110, r: 4.0 },
];
berries.forEach(b => {
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(b.x, b.y + b.r);
  ctx.lineTo(b.x, b.y + b.r + 8);
  ctx.stroke();
  ctx.lineWidth = 2.0;
});

// — Branches OVER leaves (painted after so they show through) —
ctx.strokeStyle = GOLD;
ctx.fillStyle   = GOLD;
ctx.lineWidth   = 1.6;

// Far left branch
ctx.beginPath(); ctx.moveTo(-6, 30); ctx.bezierCurveTo(-28, 18, -62, 0, -100, -18); ctx.stroke();
// Far left secondary
ctx.beginPath(); ctx.moveTo(-50, 12); ctx.bezierCurveTo(-60, -4, -74, -20, -82, -42); ctx.stroke();
// Right branch
ctx.beginPath(); ctx.moveTo(6, 6); ctx.bezierCurveTo(30, -6, 66, -24, 96, -44); ctx.stroke();
// Right secondary
ctx.beginPath(); ctx.moveTo(48, -8); ctx.bezierCurveTo(58, -22, 72, -36, 78, -58); ctx.stroke();
// Upper left sub-branch
ctx.beginPath(); ctx.moveTo(-4, -36); ctx.bezierCurveTo(-20, -50, -38, -64, -44, -88); ctx.stroke();
// Upper right sub-branch
ctx.beginPath(); ctx.moveTo(4, -52); ctx.bezierCurveTo(18, -64, 32, -76, 34, -96); ctx.stroke();

// — Main central stem LAST so it's always visible on top —
ctx.lineWidth = 3.0;
ctx.beginPath();
ctx.moveTo(0, 80);
ctx.bezierCurveTo(-8, 40, -4, -10, 0, -90);
ctx.stroke();

// — Small dots as decorative buds along branches —
[{x:-30, y:20}, {x:-55, y:6}, {x:30, y:-2}, {x:55, y:-20}].forEach(p => {
  ctx.beginPath();
  ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
  ctx.fill();
});

// — Heart below stem — slightly larger, more prominent
ctx.lineWidth = 2.2;
ctx.fillStyle = 'rgba(0,0,0,0)';
ctx.strokeStyle = GOLD;
drawHeart(ctx, 0, 108, 28);

ctx.restore(); // end botanical (unscale)

// ─── STEP 7: GOLD HAIRLINE BORDER ───
ctx.save();
ctx.strokeStyle = 'rgba(196,150,61,0.55)';
ctx.lineWidth = 2.8;
const BW = 38; // border inset from margin
deckledCardPath(ctx, MARGIN + BW, MARGIN + BW, W - MARGIN - BW, H - MARGIN - BW, makePRNG(8823));
ctx.stroke();
ctx.restore();

// ─── STEP 8: QUOTE TEXT (GOLD FOIL ITALIC SERIF) ───
ctx.save();
ctx.fillStyle = GOLD_FOIL;
ctx.textAlign = 'center';
ctx.textBaseline = 'alphabetic';

// Subtle text shadow to simulate foil emboss depth
ctx.shadowBlur    = 3;
ctx.shadowColor   = 'rgba(90,55,10,0.45)';
ctx.shadowOffsetX = 2;
ctx.shadowOffsetY = 4;

const LINES      = ['Je kracht is', 'groter dan', 'je vermoedt'];
const FONT_SIZE  = 106;
const LINE_H     = FONT_SIZE * 1.32;
const TEXT_TOP   = 980;

ctx.font = `bold italic ${FONT_SIZE}px Lora`;

LINES.forEach((line, i) => {
  ctx.fillText(line, CX, TEXT_TOP + i * LINE_H);
});

ctx.restore();

// ─── STEP 9: THIN GOLD RULE BELOW TEXT ───
ctx.save();
ctx.strokeStyle = 'rgba(196,150,61,0.5)';
ctx.lineWidth = 1.8;
const ruleY = TEXT_TOP + LINES.length * LINE_H + 30;
ctx.beginPath();
ctx.moveTo(CX - 160, ruleY);
ctx.lineTo(CX + 160, ruleY);
ctx.stroke();
ctx.restore();

// ─── STEP 10: TENDERCARDS BRANDING ───
ctx.save();
ctx.fillStyle = GOLD_FOIL;
ctx.textAlign = 'center';
ctx.textBaseline = 'alphabetic';
ctx.shadowBlur    = 3;
ctx.shadowColor   = 'rgba(90,55,10,0.50)';
ctx.shadowOffsetX = 1;
ctx.shadowOffsetY = 2;

const brandY = H - MARGIN - 68;

// Thin decorative rule above branding
ctx.save();
ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
ctx.strokeStyle = 'rgba(196,150,61,0.5)';
ctx.lineWidth = 1.2;
ctx.beginPath(); ctx.moveTo(CX - 80, brandY - 32); ctx.lineTo(CX + 80, brandY - 32); ctx.stroke();
ctx.restore();

// Brand name
ctx.font = 'italic 48px LoraItalic';
// Measure text to center brand + heart together
const textW = ctx.measureText('TenderCards').width;
const heartR = 10;
const totalW = textW + heartR * 3.2;
const startX = CX - totalW / 2;

ctx.textAlign = 'left';
ctx.fillText('TenderCards', startX, brandY);

// Draw filled heart after text
ctx.save();
ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
ctx.fillStyle = GOLD_FOIL;
ctx.strokeStyle = GOLD_FOIL;
ctx.lineWidth = 1;
const hx = startX + textW + heartR * 1.8;
const hy = brandY - heartR * 0.3;
const hr = heartR;
ctx.beginPath();
ctx.moveTo(hx, hy + hr * 0.85);
ctx.bezierCurveTo(hx - hr*0.9, hy+hr*0.3, hx-hr*1.35, hy-hr*0.25, hx-hr*0.95, hy-hr*0.65);
ctx.bezierCurveTo(hx-hr*0.55, hy-hr*1.05, hx, hy-hr*0.52, hx, hy-hr*0.52);
ctx.bezierCurveTo(hx, hy-hr*0.52, hx+hr*0.55, hy-hr*1.05, hx+hr*0.95, hy-hr*0.65);
ctx.bezierCurveTo(hx+hr*1.35, hy-hr*0.25, hx+hr*0.9, hy+hr*0.3, hx, hy+hr*0.85);
ctx.closePath();
ctx.fill();
ctx.restore();
ctx.restore();

// ─── EXPORT ───
const outPath = 'C:/Users/Administrator/Desktop/tender-cards/tendercards-A6-front.png';
const buffer  = canvas.toBuffer('image/png');
fs.writeFileSync(outPath, buffer);
console.log(`✓ Card saved to ${outPath}`);
