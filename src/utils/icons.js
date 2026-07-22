// Loads the committed fantasy SVGs from /assets and cleans them for use as
// avatar glyphs: strips the opaque black background rect and the fixed pixel
// sizing, and recolours the artwork to `currentColor` so CSS controls it.

import barbarian from '../../assets/barbarian.svg?raw'
import cowled from '../../assets/cowled.svg?raw'
import dragonHead from '../../assets/dragon-head.svg?raw'
import dwarfHelmet from '../../assets/dwarf-helmet.svg?raw'
import goblinHead from '../../assets/goblin-head.svg?raw'
import wizardFace from '../../assets/wizard-face.svg?raw'

function clean(raw) {
  return raw
    // drop the full-canvas black background rect
    .replace(/<path\b[^>]*d="M0 0h512v512H0z"[^>]*>\s*<\/path>/i, '')
    .replace(/<path\b[^>]*d="M0 0h512v512H0z"[^>]*\/>/i, '')
    // remove the inline "height/width: 512px" style on the root <svg>
    .replace(/(<svg\b[^>]*?)\s+style="[^"]*"/i, '$1')
    // remove any fixed width/height attributes so CSS can size it
    .replace(/(<svg\b[^>]*?)\s+width="[^"]*"/i, '$1')
    .replace(/(<svg\b[^>]*?)\s+height="[^"]*"/i, '$1')
    // recolour the artwork so the circle's text colour drives it
    .replace(/fill="#fff"/gi, 'fill="currentColor"')
    .replace(/fill="#ffffff"/gi, 'fill="currentColor"')
}

export const ICONS = {
  barbarian: clean(barbarian),
  cowled: clean(cowled),
  'dragon-head': clean(dragonHead),
  'dwarf-helmet': clean(dwarfHelmet),
  'goblin-head': clean(goblinHead),
  'wizard-face': clean(wizardFace),
}

export const ICON_NAMES = Object.keys(ICONS)
