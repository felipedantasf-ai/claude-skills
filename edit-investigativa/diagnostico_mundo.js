
// ============================================================================
//  DIAGNÓSTICO da régua (NÃO entregue; apague o arquivo depois): copie para work/<prefixo>_z.js, rode render_par.py e meça o master.
//  O fundo do palco ganha uma textura VISÍVEL dentro da câmera, para a régua
//  (fluxo óptico) enxergar a câmera nas cenas de tipografia no escuro. A letra e o resto da cena ficam como estão.
// ============================================================================
let _texDiag = null;
function texDiag() {
  if (_texDiag) return _texDiag;
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d');
  for (let i = 0; i < 32; i++) for (let j = 0; j < 32; j++) { const v = 25 + Math.floor(hrand(i * 31.7 + j * 7.3) * 110); x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(i * 8, j * 8, 8, 8); }
  return (_texDiag = c.toDataURL());
}
function palco(r, S, o = {}) {
  const f = document.createElement('div');
  r.parentNode.insertBefore(f, r);
  f.style.cssText = 'position:absolute;inset:0;background:#0c0c0c;';
  if (S) { S.grao = o.grao ?? .22; S.vig = o.vig ?? .45; S.cap = o.cap ?? { modo: 'none' }; }
  const m = el(r, 'div', `position:absolute;left:-1800px;top:-2400px;width:4680px;height:6720px;pointer-events:none;background:url(${texDiag()}) 0 0/256px 256px repeat;opacity:.55;`);
  r.insertBefore(m, r.firstChild);
  return f;
}
