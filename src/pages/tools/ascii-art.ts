import { icon } from '../../core/icons';

// ============================================================
// Font Data
// ============================================================

type FontMap = Record<string, string[]>;

const FONT_BLOCK: FontMap = {
  'A': ['  ██  ', ' ████ ', '██  ██', '██████', '██  ██', '██  ██'],
  'B': ['█████ ', '██  ██', '█████ ', '██  ██', '██  ██', '█████ '],
  'C': [' ████ ', '██    ', '██    ', '██    ', '██    ', ' ████ '],
  'D': ['████  ', '██ ██ ', '██  ██', '██  ██', '██ ██ ', '████  '],
  'E': ['██████', '██    ', '████  ', '██    ', '██    ', '██████'],
  'F': ['██████', '██    ', '████  ', '██    ', '██    ', '██    '],
  'G': [' ████ ', '██    ', '██ ███', '██  ██', '██  ██', ' ████ '],
  'H': ['██  ██', '██  ██', '██████', '██  ██', '██  ██', '██  ██'],
  'I': ['██████', '  ██  ', '  ██  ', '  ██  ', '  ██  ', '██████'],
  'J': ['██████', '    ██', '    ██', '    ██', '██  ██', ' ████ '],
  'K': ['██  ██', '██ ██ ', '████  ', '██ ██ ', '██  ██', '██  ██'],
  'L': ['██    ', '██    ', '██    ', '██    ', '██    ', '██████'],
  'M': ['██   ██', '███ ███', '██ █ ██', '██   ██', '██   ██', '██   ██'],
  'N': ['██  ██', '███ ██', '██████', '██ ███', '██  ██', '██  ██'],
  'O': [' ████ ', '██  ██', '██  ██', '██  ██', '██  ██', ' ████ '],
  'P': ['█████ ', '██  ██', '█████ ', '██    ', '██    ', '██    '],
  'Q': [' ████ ', '██  ██', '██  ██', '██  ██', '██ ██ ', ' ███ ██'],
  'R': ['█████ ', '██  ██', '█████ ', '██ ██ ', '██  ██', '██  ██'],
  'S': [' ████ ', '██    ', ' ███  ', '    ██', '    ██', ' ████ '],
  'T': ['██████', '  ██  ', '  ██  ', '  ██  ', '  ██  ', '  ██  '],
  'U': ['██  ██', '██  ██', '██  ██', '██  ██', '██  ██', ' ████ '],
  'V': ['██  ██', '██  ██', '██  ██', ' ████ ', ' ████ ', '  ██  '],
  'W': ['██   ██', '██   ██', '██   ██', '██ █ ██', '███ ███', '██   ██'],
  'X': ['██  ██', ' ████ ', '  ██  ', ' ████ ', '██  ██', '██  ██'],
  'Y': ['██  ██', ' ████ ', '  ██  ', '  ██  ', '  ██  ', '  ██  '],
  'Z': ['██████', '    ██', '  ██  ', ' ██   ', '██    ', '██████'],
  '0': [' ████ ', '██  ██', '██  ██', '██  ██', '██  ██', ' ████ '],
  '1': ['  ██  ', ' ███  ', '  ██  ', '  ██  ', '  ██  ', '██████'],
  '2': [' ████ ', '██  ██', '    ██', '  ██  ', ' ██   ', '██████'],
  '3': [' ████ ', '██  ██', '  ███ ', '    ██', '██  ██', ' ████ '],
  '4': ['   ██ ', '  ███ ', ' █ ██ ', '██  ██', '██████', '    ██'],
  '5': ['██████', '██    ', '█████ ', '    ██', '██  ██', ' ████ '],
  '6': [' ████ ', '██    ', '█████ ', '██  ██', '██  ██', ' ████ '],
  '7': ['██████', '    ██', '   ██ ', '  ██  ', '  ██  ', '  ██  '],
  '8': [' ████ ', '██  ██', ' ████ ', '██  ██', '██  ██', ' ████ '],
  '9': [' ████ ', '██  ██', ' ████ ', '    ██', '██  ██', ' ████ '],
  ' ': ['      ', '      ', '      ', '      ', '      ', '      '],
  '!': ['  ██  ', '  ██  ', '  ██  ', '  ██  ', '      ', '  ██  '],
  '.': ['      ', '      ', '      ', '      ', '      ', '  ██  '],
  ',': ['      ', '      ', '      ', '      ', '  ██  ', ' ██   '],
  '?': [' ████ ', '██  ██', '    ██', '  ██  ', '      ', '  ██  '],
  '-': ['      ', '      ', '      ', '██████', '      ', '      '],
  '+': ['      ', '  ██  ', '  ██  ', '██████', '  ██  ', '  ██  '],
  ':': ['      ', '  ██  ', '      ', '      ', '  ██  ', '      '],
  '(': ['   ██ ', '  ██  ', ' ██   ', ' ██   ', '  ██  ', '   ██ '],
  ')': [' ██   ', '  ██  ', '   ██ ', '   ██ ', '  ██  ', ' ██   '],
  '/': ['    ██', '   ██ ', '  ██  ', '  ██  ', ' ██   ', '██    '],
};

const FONT_SHADOW: FontMap = {
  'A': ['  ▄█▄  ', ' █▀▀█ ', '█▀▀▀▀█', '█▀▀▀▀█', '▀███▀ ', '  ▀▀  '],
  'B': ['█████ ', '█▀▀▀█ ', '█████ ', '█▀▀▀█ ', '█▀▀▀█ ', '█████ '],
  'C': [' ▄▄▄  ', '█   ▀ ', '█     ', '█     ', '█   ▄ ', ' ▀▀▀  '],
  'D': ['████  ', '█  █▄ ', '█   █ ', '█   █ ', '█  █▀ ', '████  '],
  'E': ['██████', '█     ', '████  ', '█     ', '█     ', '██████'],
  'F': ['██████', '█     ', '████  ', '█     ', '█     ', '█     '],
  'G': [' ▄▄▄  ', '█   ▀ ', '█ ▄▄█ ', '█  ▀█ ', '█   █ ', ' ▀▀▀  '],
  'H': ['█   █', '█   █', '█████', '█   █', '█   █', '█   █'],
  'I': ['██████', '  ▄█  ', '  █   ', '  █   ', '  █▄  ', '██████'],
  'J': ['██████', '    █ ', '    █ ', '    █ ', '▄█  █ ', ' ▀▀▀  '],
  'K': ['█  █ ', '█ █  ', '██   ', '█ █  ', '█  █ ', '█  █ '],
  'L': ['█    ', '█    ', '█    ', '█    ', '█    ', '█████'],
  'M': ['█   █', '█▀█ █', '█ █ █', '█   █', '█   █', '█   █'],
  'N': ['█  █ ', '█▀ █ ', '█ ▀█ ', '█  █ ', '█  █ ', '█  █ '],
  'O': [' ▄▄▄ ', '█   █', '█   █', '█   █', '█   █', ' ▀▀▀ '],
  'P': ['████ ', '█  █ ', '████ ', '█    ', '█    ', '█    '],
  'Q': [' ▄▄▄ ', '█   █', '█   █', '█ ▄ █', '█  █▀', ' ▀▀█▄'],
  'R': ['████ ', '█  █ ', '████ ', '█ █  ', '█  █ ', '█  █ '],
  'S': [' ▄▄▄ ', '█   ▀', ' ▄▄  ', '   █ ', '▀▄  █', ' ▀▀▀ '],
  'T': ['██████', '  █   ', '  █   ', '  █   ', '  █   ', '  █   '],
  'U': ['█   █', '█   █', '█   █', '█   █', '█   █', ' ▀▀▀ '],
  'V': ['█   █', '█   █', ' █ █ ', ' █ █ ', '  █  ', '  █  '],
  'W': ['█   █', '█   █', '█   █', '█ █ █', '█▀█ █', '█   █'],
  'X': ['█   █', ' █ █ ', '  █  ', ' █ █ ', '█   █', '█   █'],
  'Y': ['█   █', ' █ █ ', '  █  ', '  █  ', '  █  ', '  █  '],
  'Z': ['█████', '   █ ', '  █  ', ' █   ', '█    ', '█████'],
  '0': [' ▄▄▄ ', '█ ▄ █', '█ █ █', '█ ▀ █', '█   █', ' ▀▀▀ '],
  '1': ['  █  ', ' ██  ', '  █  ', '  █  ', '  █  ', '█████'],
  '2': [' ▄▄▄ ', '█   █', '   █ ', '  █  ', ' █   ', '█████'],
  '3': [' ▄▄▄ ', '█   █', '  ▄▄ ', '    █', '█   █', ' ▀▀▀ '],
  '4': ['   █ ', '  ██ ', ' █ █ ', '█  █ ', '█████', '   █ '],
  '5': ['█████', '█    ', '████ ', '    █', '█   █', ' ▀▀▀ '],
  '6': [' ▄▄▄ ', '█    ', '████ ', '█   █', '█   █', ' ▀▀▀ '],
  '7': ['█████', '    █', '   █ ', '  █  ', '  █  ', '  █  '],
  '8': [' ▄▄▄ ', '█   █', ' ▀▀▀ ', '█   █', '█   █', ' ▀▀▀ '],
  '9': [' ▄▄▄ ', '█   █', ' ▀▀█ ', '    █', '█   █', ' ▀▀▀ '],
  ' ': ['      ', '      ', '      ', '      ', '      ', '      '],
  '!': ['  █  ', '  █  ', '  █  ', '  █  ', '     ', '  █  '],
  '.': ['     ', '     ', '     ', '     ', '     ', '  █  '],
  ',': ['     ', '     ', '     ', '     ', '  █  ', ' █   '],
  '?': [' ▄▄▄ ', '█   █', '   █ ', '  █  ', '     ', '  █  '],
  '-': ['     ', '     ', '     ', '█████', '     ', '     '],
  '+': ['     ', '  █  ', '  █  ', '█████', '  █  ', '  █  '],
  ':': ['     ', '  █  ', '     ', '     ', '  █  ', '     '],
  '(': ['   █ ', '  █  ', ' █   ', ' █   ', '  █  ', '   █ '],
  ')': [' █   ', '  █  ', '   █ ', '   █ ', '  █  ', ' █   '],
  '/': ['    █', '   █ ', '  █  ', '  █  ', ' █   ', '█    '],
};

const FONT_BANNER: FontMap = {
  'A': ['  +  ', ' + + ', '+   +', '+++++', '+   +', '+   +'],
  'B': ['++++ ', '+   +', '++++ ', '+   +', '+   +', '++++ '],
  'C': [' +++', '+   ', '+   ', '+   ', '+   ', ' +++'],
  'D': ['++++ ', '+   +', '+   +', '+   +', '+   +', '++++ '],
  'E': ['+++++', '+    ', '++++ ', '+    ', '+    ', '+++++'],
  'F': ['+++++', '+    ', '++++ ', '+    ', '+    ', '+    '],
  'G': [' +++', '+   ', '+ ++', '+  +', '+  +', ' +++'],
  'H': ['+   +', '+   +', '+++++', '+   +', '+   +', '+   +'],
  'I': ['+++++', '  +  ', '  +  ', '  +  ', '  +  ', '+++++'],
  'J': ['+++++', '    +', '    +', '    +', '+   +', ' +++ '],
  'K': ['+  +', '+ + ', '++  ', '+ + ', '+  +', '+  +'],
  'L': ['+    ', '+    ', '+    ', '+    ', '+    ', '+++++'],
  'M': ['+   +', '++ ++', '+ + +', '+   +', '+   +', '+   +'],
  'N': ['+   +', '++  +', '+++++', '+  ++', '+   +', '+   +'],
  'O': [' +++ ', '+   +', '+   +', '+   +', '+   +', ' +++ '],
  'P': ['++++ ', '+   +', '++++ ', '+    ', '+    ', '+    '],
  'Q': [' +++ ', '+   +', '+   +', '+ + +', '+  + ', ' ++ +'],
  'R': ['++++ ', '+   +', '++++ ', '+ +  ', '+  + ', '+   +'],
  'S': [' +++', '+   ', ' ++ ', '   +', '   +', '+++ '],
  'T': ['+++++', '  +  ', '  +  ', '  +  ', '  +  ', '  +  '],
  'U': ['+   +', '+   +', '+   +', '+   +', '+   +', ' +++ '],
  'V': ['+   +', '+   +', '+   +', ' + + ', ' + + ', '  +  '],
  'W': ['+   +', '+   +', '+   +', '+ + +', '++ ++', '+   +'],
  'X': ['+   +', ' + + ', '  +  ', ' + + ', '+   +', '+   +'],
  'Y': ['+   +', ' + + ', '  +  ', '  +  ', '  +  ', '  +  '],
  'Z': ['+++++', '   + ', '  +  ', ' +   ', '+    ', '+++++'],
  '0': [' +++ ', '+   +', '+  ++', '+ + +', '++  +', ' +++ '],
  '1': ['  +  ', ' ++  ', '  +  ', '  +  ', '  +  ', '+++++'],
  '2': [' +++ ', '+   +', '   + ', '  +  ', ' +   ', '+++++'],
  '3': [' +++ ', '+   +', '  ++ ', '    +', '+   +', ' +++ '],
  '4': ['   + ', '  ++ ', ' + + ', '+  + ', '+++++', '   + '],
  '5': ['+++++', '+    ', '++++ ', '    +', '+   +', ' +++ '],
  '6': [' +++', '+   ', '++++', '+   +', '+   +', ' +++ '],
  '7': ['+++++', '    +', '   + ', '  +  ', '  +  ', '  +  '],
  '8': [' +++ ', '+   +', ' +++ ', '+   +', '+   +', ' +++ '],
  '9': [' +++ ', '+   +', ' ++++', '    +', '   + ', '+++  '],
  ' ': ['   ', '   ', '   ', '   ', '   ', '   '],
  '!': ['+ ', '+ ', '+ ', '+ ', '  ', '+ '],
  '.': ['   ', '   ', '   ', '   ', '   ', '+  '],
  '?': ['+++', '  +', ' + ', ' + ', '   ', ' + '],
  '-': ['    ', '    ', '++++', '    ', '    ', '    '],
  '+': ['    ', '  +  ', '+++++', '  +  ', '    ', '    '],
  ':': ['  ', '+ ', '  ', '  ', '+ ', '  '],
};

const FONT_ANSI: FontMap = {
  'A': [' ▄█▄ ', '█▀▀█', '█  █', '█▀▀█', '█  █', '█  █'],
  'B': ['████ ', '█  █ ', '████ ', '█  █ ', '█  █ ', '████ '],
  'C': [' ▄██ ', '█▀   ', '█    ', '█    ', '█▀   ', ' ▀██ '],
  'D': ['███▌ ', '█  █ ', '█  █ ', '█  █ ', '█  █ ', '███▌ '],
  'E': ['█████', '█    ', '███  ', '█    ', '█    ', '█████'],
  'F': ['█████', '█    ', '███  ', '█    ', '█    ', '█    '],
  'G': [' ▄██ ', '█▀   ', '█ ▄█ ', '█  █ ', '█▀ █ ', ' ▀█▀ '],
  'H': ['█  █', '█  █', '████', '█  █', '█  █', '█  █'],
  'I': ['█████', '  █  ', '  █  ', '  █  ', '  █  ', '█████'],
  'J': ['█████', '    █', '    █', '    █', '█   █', ' ▀█▀ '],
  'K': ['█  █', '█ █ ', '██  ', '█ █ ', '█  █', '█  █'],
  'L': ['█    ', '█    ', '█    ', '█    ', '█    ', '█████'],
  'M': ['█  █', '██▀█', '█▀▄█', '█  █', '█  █', '█  █'],
  'N': ['█  █', '██ █', '█▀██', '█  █', '█  █', '█  █'],
  'O': [' ▄█▄ ', '█   █', '█   █', '█   █', '█   █', ' ▀█▀ '],
  'P': ['████ ', '█  █ ', '████ ', '█    ', '█    ', '█    '],
  'Q': [' ▄█▄ ', '█   █', '█   █', '█ ▄ █', '█  █ ', ' ▀█▄ '],
  'R': ['████ ', '█  █ ', '████ ', '█ ▀  ', '█  █ ', '█  █ '],
  'S': [' ▄██ ', '█▀   ', ' ▄█  ', '   █ ', '▀▄ █ ', ' ▀▀▀ '],
  'T': ['█████', '  █  ', '  █  ', '  █  ', '  █  ', '  █  '],
  'U': ['█  █', '█  █', '█  █', '█  █', '█  █', ' ▀█▀'],
  'V': ['█  █', '█  █', '█  █', ' █ █', ' █ █', '  █  '],
  'W': ['█  █', '█  █', '█  █', '█▀▄█', '██▀█', '█  █'],
  'X': ['█  █', ' █ █', '  █ ', ' █ █', '█  █', '█  █'],
  'Y': ['█  █', ' █ █', '  █ ', '  █ ', '  █ ', '  █ '],
  'Z': ['█████', '   █ ', '  █  ', ' █   ', '█    ', '█████'],
  '0': [' ▄█▄ ', '█  ██', '█ ▄ █', '██  █', '█   █', ' ▀█▀ '],
  '1': ['  █  ', ' ██  ', '  █  ', '  █  ', '  █  ', '█████'],
  '2': [' ▄█▄ ', '█   █', '   █ ', '  █  ', ' █   ', '█████'],
  '3': [' ▄█▄ ', '█   █', '  ▄█ ', '    █', '█   █', ' ▀█▀ '],
  '4': ['   █ ', '  ██ ', ' █ █ ', '█  █ ', '█████', '   █ '],
  '5': ['█████', '█    ', '████ ', '    █', '█   █', ' ▀█▀ '],
  '6': [' ▄█▄ ', '█    ', '████ ', '█   █', '█   █', ' ▀█▀ '],
  '7': ['█████', '    █', '   █ ', '  █  ', '  █  ', '  █  '],
  '8': [' ▄█▄ ', '█   █', ' ▀█▀ ', '█   █', '█   █', ' ▀█▀ '],
  '9': [' ▄█▄ ', '█   █', ' ▀██ ', '    █', '█   █', ' ▀█▀ '],
  ' ': ['     ', '     ', '     ', '     ', '     ', '     '],
  '!': ['  █  ', '  █  ', '  █  ', '  █  ', '     ', '  █  '],
  '.': ['     ', '     ', '     ', '     ', '     ', '  █  '],
  ',': ['     ', '     ', '     ', '     ', '  █  ', ' █   '],
  '?': [' ▄█▄ ', '█   █', '   █ ', '  █  ', '     ', '  █  '],
  '-': ['     ', '     ', '     ', '█████', '     ', '     '],
  '+': ['     ', '  █  ', '  █  ', '█████', '  █  ', '  █  '],
  ':': ['     ', '  █  ', '     ', '     ', '  █  ', '     '],
};

const FONT_SMALL: FontMap = {
  'A': [' o ', 'o o', 'ooo', 'o o', 'o o'],
  'B': ['oo ', 'o o', 'oo ', 'o o', 'oo '],
  'C': [' oo', 'o  ', 'o  ', 'o  ', ' oo'],
  'D': ['oo ', 'o o', 'o o', 'o o', 'oo '],
  'E': ['ooo', 'o  ', 'oo ', 'o  ', 'ooo'],
  'F': ['ooo', 'o  ', 'oo ', 'o  ', 'o  '],
  'G': [' oo', 'o  ', 'o o', 'o o', ' oo'],
  'H': ['o o', 'o o', 'ooo', 'o o', 'o o'],
  'I': ['ooo', ' o ', ' o ', ' o ', 'ooo'],
  'J': ['ooo', '  o', '  o', 'o o', ' o '],
  'K': ['o o', 'o o', 'oo ', 'o o', 'o o'],
  'L': ['o  ', 'o  ', 'o  ', 'o  ', 'ooo'],
  'M': ['o o', 'ooo', 'o o', 'o o', 'o o'],
  'N': ['o o', 'oo ', 'o o', 'o o', 'o o'],
  'O': [' o ', 'o o', 'o o', 'o o', ' o '],
  'P': ['oo ', 'o o', 'oo ', 'o  ', 'o  '],
  'Q': [' o ', 'o o', 'o o', 'oo ', ' oO'],
  'R': ['oo ', 'o o', 'oo ', 'o o', 'o o'],
  'S': [' oo', 'o  ', ' o ', '  o', 'oo '],
  'T': ['ooo', ' o ', ' o ', ' o ', ' o '],
  'U': ['o o', 'o o', 'o o', 'o o', ' o '],
  'V': ['o o', 'o o', 'o o', ' o ', ' o '],
  'W': ['o o', 'o o', 'o o', 'ooo', 'o o'],
  'X': ['o o', 'o o', ' o ', 'o o', 'o o'],
  'Y': ['o o', ' o ', ' o ', ' o ', ' o '],
  'Z': ['ooo', '  o', ' o ', 'o  ', 'ooo'],
  '0': [' o ', 'o o', 'o o', 'o o', ' o '],
  '1': [' o ', 'oo ', ' o ', ' o ', 'ooo'],
  '2': [' o ', 'o  ', ' o ', '  o', 'ooo'],
  '3': ['oo ', '  o', ' o ', '  o', 'oo '],
  '4': ['  o', '  o', 'ooo', '  o', '  o'],
  '5': ['ooo', 'o  ', 'oo ', '  o', 'oo '],
  '6': [' oo', 'o  ', 'ooo', 'o o', ' o '],
  '7': ['ooo', '  o', '  o', '  o', '  o'],
  '8': [' o ', 'o o', ' o ', 'o o', ' o '],
  '9': [' o ', 'o o', ' oo', '  o', 'oo '],
  ' ': ['   ', '   ', '   ', '   ', '   '],
  '!': ['o ', 'o ', 'o ', '  ', 'o '],
  '.': ['   ', '   ', '   ', '   ', 'o  '],
  '?': ['oo ', '  o', ' o ', '   ', ' o '],
  '-': ['   ', '   ', 'ooo', '   ', '   '],
  '+': ['   ', ' o ', 'ooo', ' o ', '   '],
  ':': ['   ', ' o ', '   ', ' o ', '   '],
};

const FONTS: Record<string, { name: string; data: FontMap }> = {
  block: { name: '方块字体 (Block)', data: FONT_BLOCK },
  shadow: { name: '阴影字体 (Shadow)', data: FONT_SHADOW },
  banner: { name: '横幅字体 (Banner)', data: FONT_BANNER },
  ansi: { name: 'ANSI 字体', data: FONT_ANSI },
  small: { name: '迷你字体 (Small)', data: FONT_SMALL },
};

// ============================================================
// Text → ASCII
// ============================================================

function generateTextAscii(text: string, fontName: string): string {
  const font = FONTS[fontName]?.data || FONT_BLOCK;
  const chars = text.toUpperCase().split('');
  const rows = 6;
  const lines: string[] = new Array(rows).fill('');

  for (const ch of chars) {
    const glyph = font[ch] || font[' '] || [];
    const maxWidth = Math.max(...glyph.map(r => r.length), 4);
    for (let i = 0; i < rows; i++) {
      lines[i] += (glyph[i] || '').padEnd(maxWidth) + ' ';
    }
  }
  return lines.join('\n');
}

// ============================================================
// Image → ASCII
// ============================================================

function imageToAscii(img: HTMLImageElement, density: string, width: number, invert: boolean): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const aspectRatio = img.naturalHeight / img.naturalWidth;
  const charAspect = 0.5;
  const height = Math.round(width * aspectRatio * charAspect);

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const lines: string[] = [];

  for (let y = 0; y < height; y++) {
    let row = '';
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      let brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      if (invert) brightness = 255 - brightness;
      const charIdx = Math.min(Math.floor((brightness / 256) * density.length), density.length - 1);
      row += density[charIdx];
    }
    lines.push(row);
  }
  return lines.join('\n');
}

// ============================================================
// BAT Export
// ============================================================

function toBatContent(ascii: string): string {
  const lines = ascii.split('\n');
  const batLines = ['@echo off', 'chcp 65001 >nul', 'echo.'];
  for (const line of lines) {
    batLines.push('echo ' + line);
  }
  batLines.push('echo.', 'pause');
  return batLines.join('\r\n');
}

function downloadBat(ascii: string, filename: string) {
  const content = toBatContent(ascii);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'ascii-art.bat';
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================
// Module
// ============================================================

let aaDebounceTimer: ReturnType<typeof setTimeout>;

export default {
  id: 'ascii-art',
  name: 'ASCII文字图片生成器',
  icon: 'font',
  render(container: HTMLElement) {
    container.innerHTML = `
      <div class="content">
        <div class="tool-page-header">
          <a href="#/generator" class="tool-page-back">${icon('settings_suggest')} 生成器</a>
          <h1 style="font: var(--text-headline-md);">ASCII文字图片生成器</h1>
          <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">将文本或图片转换为 ASCII 字符艺术图案，支持 BAT/CMD 导出</p>
        </div>
        <div class="tool-page-body">
          <!-- Tabs -->
          <div style="display: flex; gap: 0; border-bottom: 2px solid var(--color-outline-variant); margin-bottom: 20px;">
            <button class="aa-tab active" data-tab="text">${icon('font')} 文字模式</button>
            <button class="aa-tab" data-tab="image">${icon('image')} 图片模式</button>
            <button class="aa-tab" data-tab="bat">${icon('download')} BAT/CMD 导出</button>
          </div>

          <!-- Text Mode -->
          <div id="aa-panel-text" class="aa-panel">
            <div class="tool-field">
              <label class="tool-label">输入文字</label>
              <input type="text" id="aa-text-input" class="tool-input" placeholder="输入要转换的文字..." value="HELLO" />
            </div>
            <div class="tool-field">
              <label class="tool-label">字体样式</label>
              <select id="aa-font-select" class="tool-select">
                ${Object.entries(FONTS).map(([k, v]) => `<option value="${k}">${v.name}</option>`).join('')}
              </select>
            </div>
            <div class="tool-actions">
              <button class="btn btn-primary" id="aa-gen-text">${icon('font')} 生成</button>
              <button class="btn btn-secondary" id="aa-clear-text">清空</button>
            </div>
          </div>

          <!-- Image Mode -->
          <div id="aa-panel-image" class="aa-panel" style="display:none;">
            <div class="tool-field">
              <label class="tool-label">上传图片</label>
              <div id="aa-img-dropzone" style="border: 2px dashed var(--color-outline-variant); border-radius: var(--radius-lg); padding: 36px; text-align: center; cursor: pointer; transition: border-color 0.2s;">
                <div style="color: var(--color-on-surface-variant); margin-bottom: 8px;">${icon('upload', 32)}</div>
                <p style="font: var(--text-body-md); color: var(--color-on-surface-variant);">拖拽图片到这里，或点击选择</p>
                <input type="file" id="aa-img-file" accept="image/*" style="display: none;" />
              </div>
            </div>
            <div id="aa-img-preview-wrap" style="display:none; text-align:center; padding:12px;">
              <img id="aa-img-preview" style="max-width:100%; max-height:200px; border-radius:var(--radius-md); border:1px solid var(--color-outline-variant);" />
            </div>
            <div class="tool-field">
              <label class="tool-label">密度字符 <span style="font-weight:400;color:var(--color-on-surface-variant);">(从亮到暗)</span></label>
              <input type="text" id="aa-density" class="tool-input" value=" .:-=+*#%@" style="font-family:var(--font-mono);" />
            </div>
            <div class="tool-field">
              <label class="tool-label">输出宽度: <span id="aa-width-val">80</span> 字符</label>
              <input type="range" id="aa-width" min="20" max="200" value="80" style="width:100%;" />
            </div>
            <div class="tool-field">
              <label class="tool-checkbox">
                <input type="checkbox" id="aa-invert" /> 反色 (适用于深色背景)
              </label>
            </div>
            <div class="tool-actions">
              <button class="btn btn-primary" id="aa-gen-img">${icon('image')} 生成</button>
              <button class="btn btn-secondary" id="aa-clear-img">清空</button>
            </div>
          </div>

          <!-- Shared Output -->
          <div class="tool-field" style="margin-top:16px;">
            <label class="tool-label">ASCII 艺术输出</label>
            <div id="aa-output" style="font-family:var(--font-mono); white-space:pre; min-height:120px; padding:16px; background:var(--color-surface); border:1px solid var(--color-outline-variant); border-radius:var(--radius-md); overflow-x:auto; line-height:1.15; font-size:13px;">
              <span style="color:var(--color-on-surface-variant); opacity:0.5;">结果将显示在这里</span>
            </div>
          </div>
          <div class="tool-actions">
            <button class="btn btn-ghost" id="aa-copy">${icon('clipboard')} 复制到剪贴板</button>
          </div>

          <!-- BAT Export Panel -->
          <div id="aa-panel-bat" class="aa-panel" style="display:none; margin-top:20px;">
            <div class="tool-field">
              <label class="tool-label">BAT/CMD 预览</label>
              <div id="aa-bat-preview" style="font-family:var(--font-mono); white-space:pre; min-height:120px; padding:16px; background:#0c0c0c; color:#cccccc; border:1px solid var(--color-outline-variant); border-radius:var(--radius-md); overflow-x:auto; line-height:1.15; font-size:13px;">
                <span style="color:#888;">先在文字模式或图片模式生成 ASCII 艺术，然后在此预览 BAT/CMD 效果</span>
              </div>
            </div>
            <div class="tool-actions">
              <button class="btn btn-primary" id="aa-copy-bat">${icon('clipboard')} 复制 BAT 内容</button>
              <button class="btn btn-primary" id="aa-download-bat">${icon('download')} 下载 .bat 文件</button>
              <button class="btn btn-ghost" id="aa-copy-plain">${icon('clipboard')} 复制纯文本</button>
            </div>
          </div>
        </div>
      </div>
      <style>
        .aa-tab { background:none; border:none; padding:10px 20px; font:var(--text-label-md); color:var(--color-on-surface-variant); cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; transition:all 0.2s; }
        .aa-tab:hover { color:var(--color-primary); }
        .aa-tab.active { color:var(--color-primary); border-bottom-color:var(--color-primary); font-weight:600; }
      </style>
    `;

    // Elements
    const output = container.querySelector('#aa-output') as HTMLElement;
    const batPreview = container.querySelector('#aa-bat-preview') as HTMLElement;
    const tabs = container.querySelectorAll('.aa-tab');
    const panels = container.querySelectorAll('.aa-panel');

    let currentAscii = '';
    let uploadedImg: HTMLImageElement | null = null;

    // Tab switching
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = (tab as HTMLElement).dataset.tab!;
        panels.forEach(p => (p as HTMLElement).style.display = 'none');
        const panel = container.querySelector(`#aa-panel-${target}`) as HTMLElement;
        if (panel) panel.style.display = '';
        if (target === 'bat') updateBatPreview();
      });
    });

    // --- Text Mode ---
    const textInput = container.querySelector('#aa-text-input') as HTMLInputElement;
    const fontSelect = container.querySelector('#aa-font-select') as HTMLSelectElement;

    function generateText() {
      const text = textInput.value.trim();
      if (!text) { output.textContent = ''; currentAscii = ''; return; }
      currentAscii = generateTextAscii(text, fontSelect.value);
      output.textContent = currentAscii;
    }

    container.querySelector('#aa-gen-text')!.addEventListener('click', generateText);
    textInput.addEventListener('input', () => {
      clearTimeout(aaDebounceTimer);
      aaDebounceTimer = setTimeout(generateText, 300);
    });
    fontSelect.addEventListener('change', generateText);
    container.querySelector('#aa-clear-text')!.addEventListener('click', () => {
      textInput.value = '';
      output.textContent = '';
      currentAscii = '';
    });

    // --- Image Mode ---
    const imgDropzone = container.querySelector('#aa-img-dropzone') as HTMLElement;
    const imgFileInput = container.querySelector('#aa-img-file') as HTMLInputElement;
    const imgPreviewWrap = container.querySelector('#aa-img-preview-wrap') as HTMLElement;
    const imgPreview = container.querySelector('#aa-img-preview') as HTMLImageElement;
    const densityInput = container.querySelector('#aa-density') as HTMLInputElement;
    const widthSlider = container.querySelector('#aa-width') as HTMLInputElement;
    const widthVal = container.querySelector('#aa-width-val') as HTMLElement;
    const invertCheck = container.querySelector('#aa-invert') as HTMLInputElement;

    widthSlider.addEventListener('input', () => { widthVal.textContent = widthSlider.value; });

    imgDropzone.addEventListener('click', () => imgFileInput.click());
    imgDropzone.addEventListener('dragover', (e) => { e.preventDefault(); imgDropzone.style.borderColor = 'var(--color-primary)'; });
    imgDropzone.addEventListener('dragleave', () => { imgDropzone.style.borderColor = 'var(--color-outline-variant)'; });
    imgDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      imgDropzone.style.borderColor = 'var(--color-outline-variant)';
      if (e.dataTransfer?.files[0]) loadImage(e.dataTransfer.files[0]);
    });
    imgFileInput.addEventListener('change', () => { if (imgFileInput.files?.[0]) loadImage(imgFileInput.files[0]); });

    function loadImage(file: File) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          uploadedImg = img;
          imgPreview.src = reader.result as string;
          imgPreviewWrap.style.display = 'block';
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }

    function generateImage() {
      if (!uploadedImg) return;
      const density = densityInput.value || ' .:-=+*#%@';
      const width = parseInt(widthSlider.value) || 80;
      const invert = invertCheck.checked;
      currentAscii = imageToAscii(uploadedImg, density, width, invert);
      output.textContent = currentAscii;
    }

    container.querySelector('#aa-gen-img')!.addEventListener('click', generateImage);
    container.querySelector('#aa-clear-img')!.addEventListener('click', () => {
      uploadedImg = null;
      imgPreviewWrap.style.display = 'none';
      densityInput.value = ' .:-=+*#%@';
      widthSlider.value = '80';
      widthVal.textContent = '80';
      invertCheck.checked = false;
      output.textContent = '';
      currentAscii = '';
    });

    // --- BAT Export ---
    function updateBatPreview() {
      if (!currentAscii) {
        batPreview.innerHTML = '<span style="color:#888;">先在文字模式或图片模式生成 ASCII 艺术，然后在此预览 BAT/CMD 效果</span>';
        return;
      }
      // Render with cmd-like styling
      const lines = currentAscii.split('\n');
      batPreview.textContent = [
        'C:\\Users\\User> ascii-art.bat',
        '',
        ...lines,
        '',
        'Press any key to continue . . .',
      ].join('\n');
    }

    container.querySelector('#aa-copy-bat')!.addEventListener('click', () => {
      if (!currentAscii) return;
      navigator.clipboard.writeText(toBatContent(currentAscii));
    });

    container.querySelector('#aa-download-bat')!.addEventListener('click', () => {
      if (!currentAscii) return;
      downloadBat(currentAscii, 'ascii-art.bat');
    });

    container.querySelector('#aa-copy-plain')!.addEventListener('click', () => {
      if (currentAscii) navigator.clipboard.writeText(currentAscii);
    });

    // --- Shared ---
    container.querySelector('#aa-copy')!.addEventListener('click', () => {
      if (currentAscii) navigator.clipboard.writeText(currentAscii);
    });

    // Initial generation
    generateText();
  },
  destroy() { clearTimeout(aaDebounceTimer); },
};
