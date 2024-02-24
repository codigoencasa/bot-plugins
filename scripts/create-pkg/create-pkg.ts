import { copy } from 'fs-extra'
import { join } from 'path'
import { readFileSync, writeFileSync } from 'fs'

const PACKAGES_PATH: string = join(process.cwd(), 'packages')

const NAME_PREFIX: string = '@builderbot-plugins'

const BASE_FILES = join(process.cwd(), 'scripts', 'create-pkg', 'base')

const [, , pkgName]: string[] = process.argv

/**
 * copiar dist
 * @param pkgName
 * @param to
 */
const copyLibPkg = async (pkgName: string): Promise<void> => {
    const FROM = BASE_FILES
    const TO = join(PACKAGES_PATH, pkgName)
    const options = { overwrite: true }
    await copy(FROM, TO, options)
}

/**
 * upadte package.json	
 * @param pkgName 
 */
const updataPkg = async (pkgName: string) => {
    const TO = join(PACKAGES_PATH, pkgName)
    const pathLerna = join(TO, 'package.json')
    const parseJson = JSON.parse(readFileSync(pathLerna, 'utf8'))
    parseJson.name = `${NAME_PREFIX}/${pkgName}`
    writeFileSync(pathLerna, JSON.stringify(parseJson, null, 2))
}

/**
 * update lerna.json
 * @param pkgName 
 */
const updateLerna = async (pkgName: string) => {
    const pathLerna = join(process.cwd(), 'lerna.json')
    const parseJson = JSON.parse(readFileSync(pathLerna, 'utf8'))
    const checkIf = parseJson.packages.find((pkg: string) => pkg === `packages/${pkgName}`)
    if (!checkIf) {
        parseJson.packages.push(`packages/${pkgName}`)
        writeFileSync(pathLerna, JSON.stringify(parseJson, null, 2))
    }
}

const main = async (): Promise<void> => {
    try {
        console.log(pkgName)
        if (!pkgName) {
            throw new Error('pkgName is not specified in the arguments.')
        }

        await copyLibPkg(pkgName)
        await updataPkg(pkgName)
        await updateLerna(pkgName)

        console.log(`Package ${pkgName} created successfully`)

    } catch (err) {
        console.log(`Ups ocurrio un error creando tu packages`)
    }

}


main().catch((error: Error) => {
    console.error('An error occurred:', error.message)
})
