import 'dotenv/config'

import { expect, test } from "@jest/globals"
import { describe, it } from 'node:test'

import { TelegramProvider } from '../src/index'

describe('basics', () => {
  const provider = new TelegramProvider({
    token: process.env.TOKEN_TELEGRAM as string,
  })

  test('init provider', async () => {
    it('should pass', () => {
      expect(provider).toBeInstanceOf(TelegramProvider)
    })
  })
})
