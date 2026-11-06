// Small pixel decorations drawn in code (16x16 grids), palette-matched.
const C: Record<string, string> = {
  K: '#24264f', N: '#33356f', P: '#898ac4', p: '#a2aadb', c: '#fff2e0',
  g: '#5f9e7f', G: '#3f7a5f', o: '#c9875f', O: '#9a5f45', y: '#ffd98a', r: '#d9707f',
};
function grid(rows: string[], label: string, size = 64) {
  let rects = '';
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (C[ch]) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${C[ch]}"/>`;
  }));
  return `<svg viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges" aria-hidden="true" focusable="false" data-decor="${label}">${rects}</svg>`;
}
export const PLANT = grid([
  '......g..g......',
  '...g..gg.g..g...',
  '...gg.Gg.gg.g...',
  '.g..gGgg.Gg.gg..',
  '.gg.GgGgGgGgG...',
  '..gGgGGgGGgGg.g.',
  '...gGgGGgGGg.gg.',
  '....GgGGGgGGg...',
  '.....GGgGGG.....',
  '...OOOOOOOOOO...',
  '...oooooooooo...',
  '....oooooooo....',
  '....oOoooooo....',
  '.....oooooo.....',
  '.....OOOOOO.....',
  '................',
], 'plant');
export const BOOKS = grid([
  '................',
  '................',
  '................',
  '...........rr...',
  '.pppp......rrr..',
  '.pccp.NNN...rrr.',
  '.pppp.NcN...rrr.',
  '.pppp.NNN..rrr..',
  '.pccp.NNN..rrr..',
  '.pppp.NcN.rrr...',
  '.pppp.NNN.rrr...',
  '.pccp.NNN.rcr...',
  '.pppp.NNN.rrr...',
  'KKKKKKKKKKKKKKK.',
  '................',
  '................',
], 'books');
export const CANDLE = grid([
  '.......y........',
  '......yy........',
  '......yc........',
  '.....yccy.......',
  '......yy........',
  '.......K........',
  '......ccc.......',
  '......ccc.......',
  '......cpc.......',
  '......ccc.......',
  '......cpc.......',
  '......ccc.......',
  '....PPPPPPP.....',
  '.....NNNNN......',
  '................',
  '................',
], 'candle');
