import { query } from '@anthropic-ai/claude-agent-sdk'
import { type Config } from '../config/index.js'

export type MessageRole = 'user' | 'assistant' | 'tool' | 'system'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  toolName?: string
  toolInput?: unknown
  toolOutput?: unknown
  isStreaming?: boolean
}

export interface AgentEvent {
  type: 'text' | 'tool_start' | 'tool_end' | 'thinking' | 'error' | 'done'
  content?: string
  toolName?: string
  toolInput?: unknown
  toolOutput?: unknown
  error?: Error
}

// SDK message type (loosely typed to handle API variations)
interface SDKMessage {
  type: string
  content?: string
  name?: string
  input?: unknown
  output?: unknown
  message?: string
  session_id?: string
  [key: string]: unknown
}

export class AgentSession {
  private config: Config
  private sessionId?: string
  private abortController?: AbortController

  constructor(config: Config) {
    this.config = config
  }

  async *runQuery(prompt: string): AsyncGenerator<AgentEvent> {
    this.abortController = new AbortController()

    try {
      const options = {
        cwd: this.config.cwd,
        tools: { type: 'preset' as const, preset: 'claude_code' as const },
        permissionMode: 'default' as const,
        model: this.config.model,
        apiKey: this.config.apiKey,
        ...(this.sessionId && { resume: this.sessionId }),
      }

      let currentText = ''

      for await (const message of query({ prompt, options })) {
        if (this.abortController.signal.aborted) {
          break
        }

        const msg = message as SDKMessage

        // Capture session ID for resume capability
        if (msg.session_id) {
          this.sessionId = msg.session_id
        }

        // Process different message types from the SDK
        const event = this.processSDKMessage(msg, currentText)
        if (event) {
          if (event.type === 'text' && event.content) {
            currentText = event.content
          }
          yield event
        }
      }

      yield { type: 'done' }
    } catch (error) {
      yield { type: 'error', error: error as Error }
    }
  }

  private processSDKMessage(message: SDKMessage, currentText: string): AgentEvent | null {
    // Debug: log message types to understand SDK output
    console.error('SDK Message:', message.type, JSON.stringify(message).slice(0, 300))

    switch (message.type) {
      case 'assistant': {
        // Handle assistant messages - content may be string or array of content blocks
        const content = message.content
        if (typeof content === 'string') {
          return { type: 'text', content }
        }
        // Content blocks array (e.g., [{type: 'text', text: '...'}])
        if (Array.isArray(content)) {
          const textParts = content
            .filter((block: unknown) => {
              const b = block as { type?: string; text?: string }
              return b.type === 'text' && typeof b.text === 'string'
            })
            .map((block: unknown) => (block as { text: string }).text)
            .join('')
          if (textParts) {
            return { type: 'text', content: textParts }
          }
        }
        return null
      }

      case 'result': {
        // Result messages may contain the final assistant response
        const content = message.content
        if (typeof content === 'string') {
          return { type: 'text', content }
        }
        if (Array.isArray(content)) {
          const textParts = content
            .filter((block: unknown) => {
              const b = block as { type?: string; text?: string }
              return b.type === 'text' && typeof b.text === 'string'
            })
            .map((block: unknown) => (block as { text: string }).text)
            .join('')
          if (textParts) {
            return { type: 'text', content: textParts }
          }
        }
        return null
      }

      case 'user':
      case 'system':
      case 'auth_status':
        // These are informational, skip
        return null

      case 'stream_event': {
        // Handle streaming text delta
        const content = message.content
        const delta = message.delta as { text?: string } | undefined
        if (delta?.text) {
          return { type: 'text', content: currentText + delta.text }
        }
        if (typeof content === 'string') {
          return { type: 'text', content: currentText + content }
        }
        return null
      }

      case 'tool_progress':
        return {
          type: 'tool_start',
          toolName: String(message.name || 'tool'),
          toolInput: message.input,
        }

      default:
        return null
    }
  }

  abort(): void {
    this.abortController?.abort()
  }

  getSessionId(): string | undefined {
    return this.sessionId
  }

  setSessionId(id: string): void {
    this.sessionId = id
  }
}
