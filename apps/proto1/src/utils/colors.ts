import pc from 'picocolors'

export const colors = {
  // Primary colors
  primary: pc.cyan,
  secondary: pc.gray,
  accent: pc.magenta,

  // Status colors
  success: pc.green,
  warning: pc.yellow,
  error: pc.red,
  info: pc.blue,

  // Text colors
  muted: pc.dim,
  bold: pc.bold,

  // Semantic colors
  user: pc.green,
  assistant: pc.cyan,
  tool: pc.yellow,
  system: pc.gray,
}

export const symbols = {
  user: '❯',
  assistant: '●',
  thinking: '◐',
  tool: '⚡',
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ',
  arrow: '→',
  bullet: '•',
}

export function formatRole(role: 'user' | 'assistant' | 'system' | 'tool'): string {
  switch (role) {
    case 'user':
      return colors.user(`${symbols.user} You`)
    case 'assistant':
      return colors.assistant(`${symbols.assistant} Claude`)
    case 'tool':
      return colors.tool(`${symbols.tool} Tool`)
    case 'system':
      return colors.system(`${symbols.info} System`)
  }
}
