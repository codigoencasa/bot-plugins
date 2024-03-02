import { copy } from 'fs-extra'
import { join } from 'path'
import { exec } from 'child_process'

const BASE_FILES = join(process.cwd(), 'scripts', 'create-app', 'app')

const createApp = async (): Promise<void> => {
    const FROM = BASE_FILES
    const TO = `${process.cwd()}/base`
    await copy(FROM, TO, { overwrite: true })

    exec('cd base && npm install && cd .. && pnpm run local', (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`)
            return
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`)
            return
        }
        console.log(`stdout: ${stdout}`)
    })
}

createApp()