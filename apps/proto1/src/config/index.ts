import { config as dotenvConfig } from 'dotenv'
import { z } from 'zod'
import { resolve } from 'path'

// Load .env file
dotenvConfig()

const ConfigSchema = z.object({
  apiKey: z.string().min(1, 'ANTHROPIC_API_KEY is required'),
  model: z.string().default('claude-sonnet-4-20250514'),
  cwd: z.string().default(process.cwd()),
})

export type Config = z.infer<typeof ConfigSchema>

export function loadConfig(): Config {
  const rawConfig = {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.CLAUDE_MODEL,
    cwd: process.env.PROTO1_CWD || process.cwd(),
  }

  const result = ConfigSchema.safeParse(rawConfig)

  if (!result.success) {
    const issues = result.error.issues as Array<{ path: (string | number)[]; message: string }>
    const errors = issues.map(e => `  - ${e.path.join('.')}: ${e.message}`).join('\n')
    throw new Error(`Configuration error:\n${errors}`)
  }

  return result.data
}

export function getConfig(): Config {
  return loadConfig()
}
