export interface SectionColor {
  color: string   // e.g. 'text-fuchsia-300'
  bg: string      // e.g. 'bg-fuchsia-500/10'
  border: string  // e.g. 'border-fuchsia-500/20'
  dot: string     // e.g. 'bg-fuchsia-400'
}

const SECTION_PALETTE: SectionColor[] = [
  { color: 'text-fuchsia-300', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', dot: 'bg-fuchsia-400' },
  { color: 'text-indigo-300',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',  dot: 'bg-indigo-400'  },
  { color: 'text-teal-300',    bg: 'bg-teal-500/10',    border: 'border-teal-500/20',    dot: 'bg-teal-400'    },
  { color: 'text-violet-300',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  dot: 'bg-violet-400'  },
  { color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  { color: 'text-sky-300',     bg: 'bg-sky-500/10',     border: 'border-sky-500/20',     dot: 'bg-sky-400'     },
  { color: 'text-amber-300',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   dot: 'bg-amber-400'   },
  { color: 'text-rose-300',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    dot: 'bg-rose-400'    },
  { color: 'text-cyan-300',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    dot: 'bg-cyan-400'    },
  { color: 'text-orange-300',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  dot: 'bg-orange-400'  },
]

function strHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function getSectionColor(section: string): SectionColor {
  return SECTION_PALETTE[strHash(section) % SECTION_PALETTE.length]!
}
