import React from 'react'
import { Box, Text } from 'ink'
import { colors, symbols } from '../utils/colors.js'

interface StreamingTextProps {
  content: string
  isStreaming?: boolean
  role?: 'assistant' | 'thinking'
}

export function StreamingText({ content, isStreaming = false, role = 'assistant' }: StreamingTextProps) {
  const symbol = role === 'thinking' ? symbols.thinking : symbols.assistant
  const color = role === 'thinking' ? 'gray' : 'cyan'
  const label = role === 'thinking' ? 'Thinking' : 'Claude'

  return (
    <Box flexDirection="column" marginTop={1}>
      <Box>
        <Text color={color} bold>
          {symbol} {label}
        </Text>
        {isStreaming && (
          <Text dimColor> ...</Text>
        )}
      </Box>
      <Box marginLeft={2} marginTop={0}>
        <Text wrap="wrap">{content || (isStreaming ? 'Thinking...' : '')}</Text>
      </Box>
    </Box>
  )
}
