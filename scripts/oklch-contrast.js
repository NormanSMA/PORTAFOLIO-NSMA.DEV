const fs = require('fs');
const path = require('path');

const cssPath = path.resolve(__dirname, '../src/index.css');
const css = fs.readFileSync(cssPath, 'utf8');

function parseOklch(token) {
  // token like: oklch(0.145 0 0) or oklch(1 0 0 / 10%)
  const m = token.match(/oklch\(([^)]+)\)/i);
  if (!m) return null;
  const inside = m[1].trim();
  const parts = inside.split('/').map(s => s.trim());
  const vals = parts[0].split(/\s+/).map(s => parseFloat(s));
  const L = vals[0];
  const C = vals[1] || 0;
  const h = vals[2] || 0;
  let a = 1;
  if (parts[1]) {
    const p = parts[1].trim();
    if (p.endsWith('%')) a = parseFloat(p)/100;
    else a = parseFloat(p);
  }
  return {L,C,h,a};
}

function oklchToLinearSRGB(L,C,h) {
  // Convert OKLCH -> OKLab -> linear sRGB
  const hr = h * Math.PI/180;
  const a_ = Math.cos(hr)*C;
  const b_ = Math.sin(hr)*C;
  const L_ = L;
  // OKLab to LMS
  const l_ = L_ + 0.3963377774*a_ + 0.2158037573*b_;
  const m_ = L_ - 0.1055613458*a_ - 0.0638541728*b_;
  const s_ = L_ - 0.0894841775*a_ - 1.2914855480*b_;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  const r = +4.0767416621*l -3.3077115913*m +0.2309699292*s;
  const g = -1.2684380046*l +2.6097574011*m -0.3413193965*s;
  const b = -0.0041960863*l -0.7034186147*m +1.7076147010*s;
  return [r,g,b];
}

function linearToSrgbChannel(c) {
  if (c <= 0) return 0;
  if (c >= 1) return 1;
  if (c <= 0.0031308) return 12.92 * c;
  return 1.055 * Math.pow(c, 1/2.4) - 0.055;
}

function linearLuminance(r,g,b) {
  // r,g,b are linear sRGB
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function toHex(r,g,b) {
  const R = Math.round(Math.max(0,Math.min(1,r))*255);
  const G = Math.round(Math.max(0,Math.min(1,g))*255);
  const B = Math.round(Math.max(0,Math.min(1,b))*255);
  return '#'+[R,G,B].map(x=>x.toString(16).padStart(2,'0')).join('');
}

function contrastRatio(Y1,Y2){
  const L1 = Math.max(Y1,Y2);
  const L2 = Math.min(Y1,Y2);
  return (L1 + 0.05) / (L2 + 0.05);
}

function resolveVar(name){
  const re = new RegExp(name+"\s*:\s*([^;]+);","i");
  const m = css.match(re);
  if (!m) return null;
  return m[1].trim();
}

const keys = [
  '--background','--foreground','--card','--card-foreground','--primary','--primary-foreground','--muted','--muted-foreground','--border','--input','--ring'
];

const values = {};
for(const k of keys){
  const raw = resolveVar(k);
  values[k]=raw||null;
}

function compute(key){
  const raw = values[key];
  if (!raw) return null;
  const o = parseOklch(raw);
  if (!o) return {raw};
  const [lr,lg,lb] = oklchToLinearSRGB(o.L,o.C,o.h);
  const lum = linearLuminance(lr,lg,lb);
  const sr = linearToSrgbChannel(lr);
  const sg = linearToSrgbChannel(lg);
  const sb = linearToSrgbChannel(lb);
  const hex = toHex(sr,sg,sb);
  return {raw,oklch:o,linear:[lr,lg,lb],srgb:[sr,sg,sb],hex,lum};
}

const computed = {};
for(const k of keys){
  computed[k]=compute(k);
}

function printPair(a,b,label){
  const A = computed[a];
  const B = computed[b];
  if (!A || !B || !A.lum || !B.lum) return null;
  const ratio = contrastRatio(A.lum,B.lum);
  return {pair:label||`${a} / ${b}`, aHex:A.hex, bHex:B.hex, ratio};
}

const pairs = [
  ['--background','--foreground','BG / FG'],
  ['--card','--card-foreground','Card / Card-FG'],
  ['--background','--muted-foreground','BG / Muted-FG'],
  ['--primary','--primary-foreground','Primary / Primary-FG'],
  ['--background','--primary-foreground','BG / Primary-FG (on primary)'],
  ['--card','--primary-foreground','Card / Primary-FG']
];

console.log('Tokens extracted from', cssPath);
for(const k of Object.keys(computed)){
  const v = computed[k];
  if (!v) continue;
  if (v.hex)
    console.log(k, '->', v.hex, 'lum=', v.lum.toFixed(6));
  else
    console.log(k, '->', v.raw);
}

console.log('\nContrast pairs:');
for(const p of pairs){
  const r = printPair(p[0],p[1],p[2]);
  if (!r) continue;
  console.log(r.pair, r.aHex, 'vs', r.bHex, 'ratio=', r.ratio.toFixed(2), (r.ratio>=4.5? 'AA':'FAIL'));
}

// Also output full JSON for potential further analysis
fs.writeFileSync(path.resolve(__dirname,'oklch-contrast-output.json'), JSON.stringify({computed,pairs: pairs.map(p=>printPair(p[0],p[1],p[2]))},null,2));

console.log('\nWrote detailed results to scripts/oklch-contrast-output.json');
