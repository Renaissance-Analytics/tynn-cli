import React from 'react'
import { Box, Text } from 'ink'
import { type Message } from '../agent/AgentSession.js'
import { symbols } from '../utils/colors.js'
import { truncate } from '../utils/formatting.js'

interface MessageListProps {
  messages: Message[]
  maxMessages?: number
}

export function MessageList({ messages, maxMessages = 10 }: MessageListProps) {
  // Show only the last N messages
  const displayMessages = messages.slice(-maxMessages)

  return (
    <Box flexDirection="column">
      {displayMessages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </Box>
  )
}

interface MessageItemProps {
  message: Message
}

function MessageItem({ message }: MessageItemProps) {
  const { role, content, toolName, toolOutput } = message

  switch (role) {
    case 'user':
      return (
        <Box marginTop={1}>
          <Text color="green" bold>{symbols.user} You: </Text>
          <Text>{content}</Text>
        </Box>
      )

    case 'assistant':
      return (
        <Box flexDirection="column" marginTop={1}>
          <Text color="cyan" bold>{symbols.assistant} Claude</Text>
          <Box marginLeft={2}>
            <Text wrap="wrap">{content}</Text>
          </Box>
        </Box>
      )

    case 'tool':
      return (
        <Box marginTop={1} marginLeft={2}>
          <Text color="yellow">{symbols.tool} {toolName}</Text>
          {toolOutput != null && (
            <Text dimColor> {symbols.arrow} {truncate(String(toolOutput), 50)}</Text>
          )}
        </Box>
      )

    case 'system':
      return (
        <Box marginTop={1}>
          <Text dimColor>{symbols.info} {content}</Text>
        </Box>
      )

    default:
      return null
  }
}
