import 'dotenv/config'

import { describe } from 'node:test'

import TelegramProvider from '../src/index'

describe('basics', () => {
  it('should pass', () => {
    const provider = new TelegramProvider({
      token: process.env.TOKEN_TELEGRAM as string,
    })

    expect(provider).toBeInstanceOf(TelegramProvider)
  })
})
