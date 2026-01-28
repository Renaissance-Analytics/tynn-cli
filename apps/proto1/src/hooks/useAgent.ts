import { useState, useCallback, useRef } from 'react'
import { AgentSession, type AgentEvent, type Message } from '../agent/AgentSession.js'
import { type Config } from '../config/index.js'

export interface UseAgentState {
  messages: Message[]
  currentResponse: string
  currentThinking: string
  isProcessing: boolean
  error: Error | null
  sessionId?: string
  currentTool?: {
    name: string
    input?: unknown
    output?: unknown
    isRunning: boolean
  }
}

export interface UseAgentActions {
  sendMessage: (prompt: string) => Promise<void>
  abort: () => void
  clearError: () => void
}

let messageIdCounter = 0
function generateMessageId(): string {
  return `msg_${Date.now()}_${++messageIdCounter}`
}

export function useAgent(config: Config): [UseAgentState, UseAgentActions] {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentResponse, setCurrentResponse] = useState('')
  const [currentThinking, setCurrentThinking] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [currentTool, setCurrentTool] = useState<UseAgentState['currentTool']>()

  const agentRef = useRef<AgentSession | null>(null)

  const sendMessage = useCallback(async (prompt: string) => {
    if (isProcessing) return

    // Add user message
    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setIsProcessing(true)
    setCurrentResponse('')
    setCurrentThinking('')
    setError(null)
    setCurrentTool(undefined)

    // Create or reuse agent session
    if (!agentRef.current) {
      agentRef.current = new AgentSession(config)
    }

    try {
      for await (const event of agentRef.current.runQuery(prompt)) {
        switch (event.type) {
          case 'text':
            setCurrentResponse(event.content || '')
            break

          case 'thinking':
            setCurrentThinking(event.content || '')
            break

          case 'tool_start':
            setCurrentTool({
              name: event.toolName || 'unknown',
              input: event.toolInput,
              isRunning: true,
            })
            break

          case 'tool_end':
            setCurrentTool(prev => prev ? {
              ...prev,
              output: event.toolOutput,
              isRunning: false,
            } : undefined)
            // Add tool message to history
            setMessages(prev => [...prev, {
              id: generateMessageId(),
              role: 'tool',
              content: `${event.toolName}`,
              timestamp: new Date(),
              toolName: event.toolName,
              toolOutput: event.toolOutput,
            }])
            break

          case 'error':
            setError(event.error || new Error('Unknown error'))
            break

          case 'done':
            // Add assistant message to history if we have content
            if (currentResponse || agentRef.current) {
              const finalResponse = currentResponse
              if (finalResponse) {
                setMessages(prev => [...prev, {
                  id: generateMessageId(),
                  role: 'assistant',
                  content: finalResponse,
                  timestamp: new Date(),
                }])
              }
            }
            setSessionId(agentRef.current?.getSessionId())
            break
        }
      }
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsProcessing(false)
      setCurrentTool(undefined)
    }
  }, [config, isProcessing, currentResponse])

  const abort = useCallback(() => {
    agentRef.current?.abort()
    setIsProcessing(false)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const state: UseAgentState = {
    messages,
    currentResponse,
    currentThinking,
    isProcessing,
    error,
    sessionId,
    currentTool,
  }

  const actions: UseAgentActions = {
    sendMessage,
    abort,
    clearError,
  }

  return [state, actions]
}
