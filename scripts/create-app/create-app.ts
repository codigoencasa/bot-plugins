import { copy } from 'fs-extra'
import { join } from 'path'
import { exec } from 'child_process'

const BASE_FILES = join(process.cwd(), 'scripts', 'create-app', 'app')

const createApp = async (): Promise<void> => {
    const FROM = BASE_FILES
    const TO = `${process.cwd()}/base`
    await copy(FROM, TO, { overwrite: true })

    const runner = exec('cd base && npm install')

    runner.stdout?.on('data', (data) => {
        console.info(`[INFO]: ${data}`)
    })

    runner.on('exit', (code) => {
        if (code !== 0) {
            console.error(`[ERROR]: Exit code: ${code}`)
        }else {
            console.info('[INFO]: App created successfully')
            console.log('[INFO]: edit .env file and run with npm run dev')
        }
    })

}

createApp()