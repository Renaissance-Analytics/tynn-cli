import React from 'react'
import { Box, Text } from 'ink'
import { colors } from '../utils/colors.js'

interface StatusBarProps {
  model: string
  sessionId?: string
  cwd: string
  isProcessing?: boolean
}

export function StatusBar({ model, sessionId, cwd, isProcessing = false }: StatusBarProps) {
  return (
    <Box
      borderStyle="single"
      borderColor="gray"
      paddingX={1}
      justifyContent="space-between"
    >
      <Box>
        <Text dimColor>Model: </Text>
        <Text color="cyan">{model}</Text>
      </Box>
      <Box>
        <Text dimColor>CWD: </Text>
        <Text color="blue">{cwd}</Text>
      </Box>
      {sessionId && (
        <Box>
          <Text dimColor>Session: </Text>
          <Text color="magenta">{sessionId.slice(0, 8)}...</Text>
        </Box>
      )}
      {isProcessing && (
        <Box>
          <Text color="yellow">● Processing</Text>
        </Box>
      )}
    </Box>
  )
}
