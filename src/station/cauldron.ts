// Placeholder pixel cauldron (16x16 grid). Replaced by pack art in Stage 6.
const ROWS = [
  '................',
  '....b..b...b....',
  '...b.bb.b.b.b...',
  '..pppppppppppp..',
  '.RRRRRRRRRRRRRR.',
  '.RRRRRRRRRRRRRR.',
  '..KKKKKKKKKKKK..',
  '.KKKKKKKKKKKKKK.',
  '.KKKHKKKKKKKKKK.',
  '.KKHKKKKKKKKKKK.',
  '.KKKKKKKKKKKKKK.',
  '..KKKKKKKKKKKK..',
  '...KKKKKKKKKK...',
  '...K.KKKKKK.K...',
  '..KK........KK..',
  '................',
];
const COLORS: Record<string, string> = {
  b: '#fff2e0', p: '#a2aadb', R: '#24264f', K: '#33356f', H: '#898ac4',
};

export function cauldronSvg(size = 96): string {
  let rects = '';
  ROWS.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      const fill = COLORS[ch];
      if (fill) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${fill}"/>`;
    }),
  );
  return `<svg viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${rects}</svg>`;
}
