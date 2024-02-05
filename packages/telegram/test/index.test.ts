import 'dotenv/config'

import { describe, it } from 'node:test'
import { expect, test } from "@jest/globals"

import { TelegramProvider } from '../src/index'

describe('basics', () => {
  let provider = new TelegramProvider({
    token: process.env.TOKEN_TELEGRAM as string,
  })

  test('init provider', async () => {
    it('should pass', () => {
      expect(provider).toBeInstanceOf(TelegramProvider)
    })
  })
})
