import React from 'react'
import { Box, Text } from 'ink'
import { MessageList } from './MessageList.js'
import { StreamingText } from './StreamingText.js'
import { ToolOutput } from './ToolOutput.js'
import { InputPrompt } from './InputPrompt.js'
import { type Message } from '../agent/AgentSession.js'
import { type UseAgentState } from '../hooks/useAgent.js'

interface ChatViewProps {
  state: UseAgentState
  onSubmit: (prompt: string) => void
}

export function ChatView({ state, onSubmit }: ChatViewProps) {
  const { messages, currentResponse, currentThinking, isProcessing, error, currentTool } = state

  return (
    <Box flexDirection="column" flexGrow={1}>
      {/* Message history */}
      <MessageList messages={messages} />

      {/* Current thinking (if any) */}
      {currentThinking && (
        <StreamingText
          content={currentThinking}
          isStreaming={isProcessing}
          role="thinking"
        />
      )}

      {/* Current tool execution (if any) */}
      {currentTool && (
        <ToolOutput
          toolName={currentTool.name}
          input={currentTool.input}
          output={currentTool.output}
          isRunning={currentTool.isRunning}
        />
      )}

      {/* Current streaming response */}
      {(currentResponse || isProcessing) && !currentThinking && (
        <StreamingText
          content={currentResponse}
          isStreaming={isProcessing}
        />
      )}

      {/* Error display */}
      {error && (
        <Box marginTop={1}>
          <Text color="red">Error: {error.message}</Text>
        </Box>
      )}

      {/* Input prompt */}
      <InputPrompt
        onSubmit={onSubmit}
        disabled={isProcessing}
        placeholder={isProcessing ? 'Processing...' : 'Type a message... (Ctrl+C to exit)'}
      />
    </Box>
  )
}
