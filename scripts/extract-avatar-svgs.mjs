import fs from 'node:fs';
import path from 'node:path';

const downloads = 'c:/Users/Julián/Downloads';
const outDir = path.resolve('assets/avatars');
const outTs = path.resolve('src/utils/playerAvatarPaths.ts');

const map = {
  meeple: 'meeple.svg',
  pepper: 'chili-pepper.svg',
  skull: 'skull-crossed-bones.svg',
  pawn: 'chess-pawn.svg',
  knight: 'chess-knight.svg',
  rook: 'chess-rook.svg',
  crown: 'chess-queen.svg',
  joker: 'card-joker.svg',
  spades: 'spades.svg',
  d10: 'd10.svg',
  d12: 'd12.svg',
  puzzle: 'puzzle-piece.svg',
};

function collapse(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function extractWhitePath(svg) {
  const matches = [...svg.matchAll(/<path d="([^"]+)" fill="#([^"]+)"/g)];
  const white = matches.find((m) => m[2].toLowerCase() === 'fff');
  if (!white) throw new Error('No white path found');
  return white[1];
}

function extractPuzzlePath(svg) {
  const match = svg.match(/\sd="([^"]+)"/);
  if (!match) throw new Error('No puzzle path found');
  const compact = collapse(match[1]);
  const hole = compact.indexOf('z M');
  return hole === -1 ? compact : compact.slice(0, hole + 1);
}

function extractViewBox(svg, fallback = '0 0 512 512') {
  return svg.match(/viewBox="([^"]+)"/)?.[1] ?? fallback;
}

function toPathSvg(d, viewBox = '0 0 512 512') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
  <path fill="currentColor" fill-rule="evenodd" d="${d}"/>
</svg>
`;
}

function jsString(value) {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

fs.mkdirSync(outDir, { recursive: true });

const pathEntries = [];
const viewBoxEntries = [];

for (const [id, file] of Object.entries(map)) {
  const svg = fs.readFileSync(path.join(downloads, file), 'utf8');
  const outFile = path.join(outDir, `${id}.svg`);

  if (id === 'puzzle') {
    const d = extractPuzzlePath(svg);
    const viewBox = extractViewBox(svg);
    fs.writeFileSync(outFile, toPathSvg(d, viewBox));
    pathEntries.push(`  ${id}: ${jsString(d)},`);
    viewBoxEntries.push(`  ${id}: ${jsString(viewBox)},`);
  } else {
    const d = extractWhitePath(svg);
    fs.writeFileSync(outFile, toPathSvg(d));
    pathEntries.push(`  ${id}: ${jsString(d)},`);
  }

  console.log('Wrote', outFile);
}

const contents = `import type { PlayerAvatarId } from './playerAvatars';

export const PLAYER_AVATAR_SVG_PATHS: Partial<Record<PlayerAvatarId, string>> = {
${pathEntries.join('\n')}
};

export const PLAYER_AVATAR_SVG_VIEWBOX: Partial<Record<PlayerAvatarId, string>> = {
${viewBoxEntries.join('\n')}
};
`;

fs.writeFileSync(outTs, contents);
console.log('Wrote', outTs);
