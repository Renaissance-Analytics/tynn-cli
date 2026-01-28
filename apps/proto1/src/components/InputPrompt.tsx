import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import TextInput from 'ink-text-input'
import { colors, symbols } from '../utils/colors.js'

interface InputPromptProps {
  onSubmit: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export function InputPrompt({ onSubmit, disabled = false, placeholder = 'Type a message...' }: InputPromptProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (input: string) => {
    const trimmed = input.trim()
    if (trimmed && !disabled) {
      onSubmit(trimmed)
      setValue('')
    }
  }

  // Handle Ctrl+C to exit
  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      process.exit(0)
    }
  })

  return (
    <Box flexDirection="column" marginTop={1}>
      <Box>
        <Text color="green" bold>
          {symbols.user}{' '}
        </Text>
        {disabled ? (
          <Text dimColor>{placeholder}</Text>
        ) : (
          <TextInput
            value={value}
            onChange={setValue}
            onSubmit={handleSubmit}
            placeholder={placeholder}
          />
        )}
      </Box>
    </Box>
  )
}
