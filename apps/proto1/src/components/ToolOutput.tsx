import React from 'react'
import { Box, Text } from 'ink'
import { symbols } from '../utils/colors.js'
import { truncate } from '../utils/formatting.js'

interface ToolOutputProps {
  toolName: string
  input?: unknown
  output?: unknown
  isRunning?: boolean
}

export function ToolOutput({ toolName, input, output, isRunning = false }: ToolOutputProps) {
  const formatValue = (value: unknown): string => {
    if (value === undefined || value === null) return ''
    if (typeof value === 'string') return truncate(value, 200)
    try {
      return truncate(JSON.stringify(value, null, 2), 200)
    } catch {
      return String(value)
    }
  }

  return (
    <Box flexDirection="column" marginTop={1} marginLeft={2}>
      <Box>
        <Text color="yellow" bold>
          {symbols.tool} {toolName}
        </Text>
        {isRunning && (
          <Text dimColor> running...</Text>
        )}
      </Box>
      {input != null && (
        <Box marginLeft={2}>
          <Text dimColor>Input: </Text>
          <Text>{formatValue(input)}</Text>
        </Box>
      )}
      {output != null && (
        <Box marginLeft={2}>
          <Text dimColor>Output: </Text>
          <Text color="green">{formatValue(output)}</Text>
        </Box>
      )}
    </Box>
  )
}
