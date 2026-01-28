#!/usr/bin/env node
import React from 'react'
import { render } from 'ink'
import { program } from 'commander'
import { App } from './app.js'
import { loadConfig, type Config } from './config/index.js'

// CLI setup
program
  .name('proto1')
  .description('Nexus AI Terminal - Claude Code-like interactive terminal')
  .version('0.1.0')
  .option('-m, --model <model>', 'Claude model to use')
  .option('-c, --cwd <directory>', 'Working directory')
  .option('-r, --resume <sessionId>', 'Resume a previous session')
  .argument('[prompt...]', 'Initial prompt to send')
  .action(async (promptParts: string[], options: { model?: string; cwd?: string; resume?: string }) => {
    try {
      // Load and merge config
      const baseConfig = loadConfig()
      const config: Config = {
        ...baseConfig,
        model: options.model || baseConfig.model,
        cwd: options.cwd || baseConfig.cwd,
      }

      // Join prompt parts if provided
      const initialPrompt = promptParts.length > 0 ? promptParts.join(' ') : undefined

      // Render the app
      const { waitUntilExit } = render(
        <App config={config} initialPrompt={initialPrompt} />
      )

      await waitUntilExit()
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`)
        if (error.message.includes('ANTHROPIC_API_KEY')) {
          console.error('\nPlease set your ANTHROPIC_API_KEY environment variable.')
          console.error('You can create a .env file with:')
          console.error('  ANTHROPIC_API_KEY=sk-ant-...')
        }
      } else {
        console.error('An unexpected error occurred')
      }
      process.exit(1)
    }
  })

program.parse()
