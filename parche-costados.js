/* =====================================================================
   PARCHE v12.1 · el despiece muestra los COSTADOS y el resto de tipos de pieza
   - Resumen: bajo cada grupo de tablero, una fila «contiene» con el nº de piezas por tipo (Costados ×4, Laterales ×2…)
   - Planos de corte: los costados salen en naranja, con su etiqueta «COSTADO»; el resto lleva su tipo bajo la medida
   - Lista de piezas de cada tablero: «C-05 · Costado ×1»
   Redefine solo funciones de presentación (cutSummaryHTML, sheetSVG, cutSheetsHTML). No cambia ningún cálculo.
   ===================================================================== */
(function () {
  var FAM = [
    [/^Costado/, 'Costado', 'COSTADO'],
    [/^Lateral/, 'Lateral', 'lateral'],
    [/^Tabique/, 'Tabique', 'tabique'],
    [/^Tapa superior/, 'Tapa', 'tapa'],
    [/^Base/, 'Base', 'base'],
    [/^Frente de zócalo/, 'Zócalo', 'zócalo'],
    [/^Balda de cierre|^Balda sobre cajonera/, 'Balda cierre', 'balda cierre'],
    [/^Balda trasera de nicho/, 'Balda nicho', 'balda nicho'],
    [/^Balda/, 'Balda', 'balda'],
    [/^Remate/, 'Remate', 'remate'],
    [/^Trasera/, 'Trasera', 'trasera'],
    [/^Fondo de caja/, 'Fondo caja', 'fondo caja'],
    [/^Caja de cajón/, 'Caja cajón', 'caja cajón'],
    [/^Puerta/, 'Puerta', 'puerta'],
    [/^Frente de cajón/, 'Frente cajón', 'frente']
  ];
  function fam(name) {
    for (var i = 0; i < FAM.length; i++) if (FAM[i][0].test(name)) return { key: FAM[i][1], tag: FAM[i][2], cost: i === 0 };
    var s = String(name).split(/[ (·]/)[0]; return { key: s, tag: s.toLowerCase(), cost: false };
  }
  var PL = { 'Costado': 'Costados', 'Lateral': 'Laterales', 'Tabique': 'Tabiques', 'Tapa': 'Tapas', 'Base': 'Bases', 'Zócalo': 'Zócalos', 'Balda cierre': 'Baldas de cierre', 'Balda nicho': 'Baldas de nicho', 'Balda': 'Baldas', 'Remate': 'Remates', 'Trasera': 'Traseras', 'Fondo caja': 'Fondos de caja', 'Caja cajón': 'Piezas de caja de cajón', 'Puerta': 'Puertas', 'Frente cajón': 'Frentes de cajón' };
  var plural = function (k) { return PL[k] || k; };
  var COST_FILL = '#f6c28b', COST_STROKE = '#7a3f08';

  // ---------- resumen con desglose por tipo de pieza ----------
  window.cutSummaryHTML = function (plan, ph) {
    var h = '<div class="cutsum"><table class="cl"><tr><th>Fase / material</th><th>Tablero</th><th>Piezas</th><th>Tableros</th><th>Mín. teórico</th><th>Aprovechamiento</th><th>Canto (m)</th></tr>';
    planPhases(plan, ph).forEach(function (p) {
      h += '<tr class="phrow"><td><b>' + escH(p.label) + '</b></td><td></td><td><b>' + p.pieces + '</b></td><td><b>' + p.nSheets + '</b></td><td></td><td><b>' + fmt(p.eff * 100, 1) + ' %</b></td><td><b>' + fmt(p.edgeM, 1) + '</b></td></tr>';
      p.groups.forEach(function (g) {
        h += '<tr><td>&nbsp;&nbsp;' + escH(g.label) + '</td><td>' + sheetName(g.sheet) + '</td><td>' + g.pieces + '</td><td>' + g.nSheets + '</td><td>' + g.lowerBound + '</td><td>' + fmt(g.eff * 100, 1) + ' %</td><td>' + (g.edgeM ? fmt(g.edgeM, 1) : '—') + '</td></tr>';
        var cnt = {}, order = [];
        g.rows.forEach(function (r) { var f = fam(r.name); if (!(f.key in cnt)) { cnt[f.key] = { n: 0, cost: f.cost }; order.push(f.key); } cnt[f.key].n += r.qty; });
        h += '<tr><td colspan="7" style="padding:1px 8px 5px 26px;font-size:11px;color:#58627b;border-bottom:1px solid #e6e8ee">contiene: ' +
          order.map(function (k) { return cnt[k].cost ? '<b style="color:#b45f06">' + plural(k) + ' ×' + cnt[k].n + '</b>' : plural(k) + ' ×' + cnt[k].n; }).join(' · ') + '</td></tr>';
      });
    });
    h += '</table><div class="hint2">Cinta de canto estimada (canto frontal de laterales, tabiques, costados, tapas, baldas y zócalo + perímetro de puertas y frentes). Añade ≈10 % de merma. <span style="color:#b45f06"><b>Naranja</b> = costados de mocheta.</span></div></div>';
    return h;
  };

  // ---------- plano de cada tablero: costados en naranja + tipo de pieza ----------
  window.sheetSVG = function (g, sh, showCuts, uid) {
    var SW = g.sheet[0], SH = g.sheet[1], m = 5, vb = (-m) + ' ' + (-m) + ' ' + (SW + 2 * m + 4) + ' ' + (SH + 2 * m + 2);
    var s = '<svg class="sheet" viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif">';
    s += '<defs><pattern id="hz' + uid + '" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="3" stroke="#d3d6dd" stroke-width="0.5"/></pattern></defs>';
    s += '<rect x="0" y="0" width="' + SW + '" height="' + SH + '" fill="url(#hz' + uid + ')" stroke="#222" stroke-width="0.5"/>';
    s += '<rect x="' + (g.sheet[0] - g.usable[0]) / 2 + '" y="' + (g.sheet[1] - g.usable[1]) / 2 + '" width="' + g.usable[0] + '" height="' + g.usable[1] + '" fill="none" stroke="#9aa" stroke-width="0.25" stroke-dasharray="1.2 1"/>';
    sh.free.forEach(function (f) {
      var x = f.x + (g.sheet[0] - g.usable[0]) / 2, y = f.y + (g.sheet[1] - g.usable[1]) / 2;
      s += '<rect x="' + x + '" y="' + y + '" width="' + f.w + '" height="' + f.h + '" fill="rgba(255,255,255,0.65)" stroke="#6a7fa8" stroke-width="0.3" stroke-dasharray="1.5 1"/>';
      if (f.w > 24 && f.h > 7) s += '<text x="' + (x + f.w / 2) + '" y="' + (y + f.h / 2 + 1) + '" text-anchor="middle" font-size="3" fill="#44608f">retal ' + fmt(f.w * 10, 0) + '×' + fmt(f.h * 10, 0) + '</text>';
    });
    sh.placed.forEach(function (p) {
      var r = p.it.row, f = fam(r.name), fill = f.cost ? COST_FILL : 'hsl(' + hueOf(r.id) + ',55%,82%)';
      s += '<rect x="' + p.x + '" y="' + p.y + '" width="' + p.w + '" height="' + p.h + '" fill="' + fill + '" stroke="' + (f.cost ? COST_STROKE : '#333') + '" stroke-width="' + (f.cost ? 0.7 : 0.35) + '"/>';
      var cx = p.x + p.w / 2, cy = p.y + p.h / 2;
      if (p.w >= 15 && p.h >= 8) {
        s += '<text x="' + cx + '" y="' + (cy - 0.3) + '" text-anchor="middle" font-size="4" font-weight="700" fill="#111">' + r.lab + '</text>';
        s += '<text x="' + cx + '" y="' + (cy + 3.6) + '" text-anchor="middle" font-size="2.9" fill="#222">' + fmt(p.w * 10, 0) + ' × ' + fmt(p.h * 10, 0) + (p.rot ? ' ↻' : '') + '</text>';
        if (p.h >= 14 && p.w >= 22) s += '<text x="' + cx + '" y="' + (cy + 7.2) + '" text-anchor="middle" font-size="2.6" font-weight="' + (f.cost ? 700 : 400) + '" fill="' + (f.cost ? COST_STROKE : '#555') + '">' + escH(f.tag) + '</text>';
        else if (f.cost && p.h >= 11) s += '<text x="' + cx + '" y="' + (cy + 7) + '" text-anchor="middle" font-size="2.4" font-weight="700" fill="' + COST_STROKE + '">COSTADO</text>';
      } else if (p.w >= 7 && p.h >= 4.5) s += '<text x="' + cx + '" y="' + (cy + 1.2) + '" text-anchor="middle" font-size="3" font-weight="700" fill="#111">' + r.lab + '</text>';
      else if (p.h > p.w && p.h >= 8 && p.w >= 3.2) s += '<text transform="translate(' + (cx + 1) + ' ' + cy + ') rotate(-90)" text-anchor="middle" font-size="2.6" font-weight="700" fill="#111">' + r.lab + ' · ' + fmt(p.h * 10, 0) + '×' + fmt(p.w * 10, 0) + (f.cost ? ' · COSTADO' : '') + '</text>';
    });
    if (showCuts) sh.cuts.forEach(function (c) {
      s += '<line x1="' + c.x1 + '" y1="' + c.y1 + '" x2="' + c.x2 + '" y2="' + c.y2 + '" stroke="#d62828" stroke-width="0.35" stroke-dasharray="2 1.2"/>';
      s += '<circle cx="' + c.x1 + '" cy="' + c.y1 + '" r="1.9" fill="#d62828"/><text x="' + c.x1 + '" y="' + (c.y1 + 0.95) + '" text-anchor="middle" font-size="2.5" font-weight="700" fill="#fff">' + c.n + '</text>';
    });
    s += '<text x="' + SW / 2 + '" y="-1.6" text-anchor="middle" font-size="3" fill="#444">' + fmt(SW * 10, 0) + ' mm</text>';
    s += '<text transform="translate(-2 ' + SH / 2 + ') rotate(-90)" text-anchor="middle" font-size="3" fill="#444">' + fmt(SH * 10, 0) + ' mm</text>';
    return s + '</svg>';
  };

  // ---------- lista de piezas bajo cada tablero: «C-05 · Costado ×1» ----------
  window.cutSheetsHTML = function (plan, showCuts, uidBase, ph) {
    var h = '', u = 0;
    planGroups(plan, ph).forEach(function (g) {
      g.sheetsOut.forEach(function (sh) {
        u++; var eff = sh.used / (g.sheet[0] * g.sheet[1]), list = {}, ord = [];
        sh.placed.forEach(function (p) { var l = p.it.row.lab; if (!(l in list)) { list[l] = { n: 0, f: fam(p.it.row.name) }; ord.push(l); } list[l].n++; });
        h += '<div class="sheetbox"><div class="sheethead"><b>' + escH(g.full) + '</b> — tablero ' + sh.n + ' de ' + g.nSheets + ' · ' + sheetName(g.sheet) + ' · ' + sh.placed.length + ' pieza' + (sh.placed.length === 1 ? '' : 's') + ' · uso ' + fmt(eff * 100, 1) + ' % · ' + sh.cuts.length + ' corte' + (sh.cuts.length === 1 ? '' : 's') + '</div>' +
          sheetSVG(g, sh, showCuts, uidBase + u) +
          '<div class="sheetlist">' + ord.map(function (l) { var f = list[l].f; return '<span class="tag"' + (f.cost ? ' style="color:#b45f06;font-weight:700"' : '') + '>' + l + ' · ' + f.key + ' ×' + list[l].n + '</span>'; }).join(' ') + '</div></div>';
      });
    });
    return h;
  };
})();
