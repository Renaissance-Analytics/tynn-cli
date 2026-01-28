import React from 'react'
import { Box, Text, useApp } from 'ink'
import { ChatView } from './components/ChatView.js'
import { StatusBar } from './components/StatusBar.js'
import { useAgent } from './hooks/useAgent.js'
import { type Config } from './config/index.js'

interface AppProps {
  config: Config
  initialPrompt?: string
}

export function App({ config, initialPrompt }: AppProps) {
  const { exit } = useApp()
  const [state, actions] = useAgent(config)

  // Handle initial prompt if provided
  React.useEffect(() => {
    if (initialPrompt) {
      actions.sendMessage(initialPrompt)
    }
  }, []) // Only run once on mount

  const handleSubmit = React.useCallback((prompt: string) => {
    // Handle slash commands
    if (prompt.startsWith('/')) {
      const command = prompt.slice(1).toLowerCase().trim()

      switch (command) {
        case 'exit':
        case 'quit':
        case 'q':
          exit()
          return
        case 'clear':
          // Would need to add clear messages action
          return
        case 'help':
          // Display help message
          return
      }
    }

    actions.sendMessage(prompt)
  }, [actions, exit])

  return (
    <Box flexDirection="column" minHeight={10}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text bold color="cyan">Proto1</Text>
        <Text dimColor> - Nexus AI Terminal</Text>
      </Box>

      {/* Status bar */}
      <StatusBar
        model={config.model}
        sessionId={state.sessionId}
        cwd={config.cwd}
        isProcessing={state.isProcessing}
      />

      {/* Main chat view */}
      <ChatView
        state={state}
        onSubmit={handleSubmit}
      />

      {/* Footer with keyboard shortcuts */}
      <Box marginTop={1}>
        <Text dimColor>
          Ctrl+C to exit | /help for commands
        </Text>
      </Box>
    </Box>
  )
}
