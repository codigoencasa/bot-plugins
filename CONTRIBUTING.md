# CONTRIBUTING

### 👋 Bienvenido/a
Nos alegra que estés interesado en colaborar en nuestro proyecto. Para hacerlo, puedes contribuir de diversas maneras, la principal es aportando tu conocimiento y habilidades para mejorar el repositorio, ya sea actualizando la documentación, mejorando el código o revisando problemas pendientes en los __[issues](https://github.com/codigoencasa/bot-plugins/issues)__. 

También agradecemos los aportes económicos, que utilizaremos para diversos fines relacionados con el desarrollo y mantenimiento del proyecto. Puedes ver más detalles aquí: __[ver más](https://opencollective.com/bot-whatsapp)__

El lenguaje principal que usamos en este proyecto es __Typescript__, para mantener de forma legible nuestro código.

### 💡 Preguntas frecuentes
- ¿Qué es lerna?: [Ver Video](https://share.vidyard.com/watch/n3HLai7q4kj2yZHL35e3bo)
- ¿Cómo realizo los commits?: [Ver Video](https://share.vidyard.com/watch/KjqJ5v2dgdAMdVZeLpJZix)
- ¿Canales de comunicación?: [Discord](https://link.codigoencasa.com/DISCORD)

------

__Requisitos:__
Para poder aportar al proyecto necesitarás tener:
- Node v18 o superior. Puedes descargar Node aquí: __[descargar node](https://nodejs.org/es/download/)__
- __[pnpm](https://pnpm.io/cli/install)__ como administrador de paquetes. Puedes seguir el enlace para saber cómo instalarlo.
- __[VSCode](https://code.visualstudio.com/download)__ es el editor de código que recomendamos, ya que cuenta con plugins útiles.
- __[Conventional Commits](https://marketplace.visualstudio.com/items?itemName=vivaxy.vscode-conventional-commits&ssr=false#overview)__ es un plugin de VSCode que te ayudará a crear commits semánticos, siguiendo buenas prácticas.

### 🚀 Empezando

__Hacer Fork del Proyecto__

Antes de comenzar, es necesario que hagas un fork del proyecto en tu propia cuenta de GitHub. Esto te permitirá trabajar en tu propia copia del repositorio. Haz clic en el siguiente enlace para realizar el fork: [aquí](https://github.com/codigoencasa/bot-plugins/fork)

__Clona repositorio (desde tu fork)__
```
git clone https://github.com/TU_USERNAME/bot-plugins
```
__Instalar dependencias__
Entra a la carpeta del proyecto y ejecuta el siguiente comando para instalar las dependencias necesarias.
``` 
cd bot-plugins
pnpm install
```
-----

__Crear nueva integración__
Para crear una nueva integración debes crear dentro de la carpeta `packages` un nombre único para tu integracion quedando `packages/TU_NOMBRE_UNICO_DE_INTEGRACION`

>___OBERSACION___
Necesitas obligatoriamente seguir ciertas configuraciones que te dejo abajo:

- [ ] package.json
    ```json
        {
            "name": "@builderbot-plugins/NOMBRE_DE_TU_INCORPORACION", // NOMBRE DE TU PAQUETE
            "version": "0.0.0-alpha.0", // VERSION INICIAL
            "description": "DESCRIPCION DE TU INCORPORACION",
            "main": "dist/index.cjs", // DEJA ESTE ASI
            "types": "dist/index.d.ts", // DEJA ESTE ASI
            "type": "module", // DEJA ESTE ASI
            "scripts": {
                "test": "jest",
                "build": "rimraf dist && rollup --config",
                "local:build": "pnpm run build && npm pack",
                    // TUS OTROS SCRIPTS SI ASI LO REQUIERES, NO TOQUES LOS ANTERIORES
            },
            "files": [
                "./dist/" // DEJA ESTE ASI
            ],
            "license": "MIT", // DEJA ESTE ASI
            "publishConfig": {
                "registry": "https://registry.npmjs.org",// DEJA ESTE ASI
                "access": "public"// DEJA ESTE ASI
            },
            "dependencies": {
                // TUS OTRAS DEPENDENCIAS ACA
            },
            "peerDependencies": {
                "@bot-whatsapp/bot": ">=0.1.3-alpha.9",
                // EN CASO NECESITES DEPENDENCIAS DE PAREJA EXACTAS
            },
            "repository": {
                "type": "git", // DEJA ESTE ASI
                "url": "https://github.com/codigoencasa/bot-whatsapp/tree/main/packages/NOMBRE DE TU INCORPORACION"
            },
            "packageManager": "pnpm@8.12.1", // DEJA ESTE ASI
            "devDependencies": {
                "@jest/globals": "29.7.0", 
                "@rollup/plugin-commonjs": "25.0.7",
                "@rollup/plugin-node-resolve": "15.2.3",
                "@types/jest": "29.5.12",
                "jest": "29.7.0",
                "rollup-plugin-typescript2": "0.36.0",
                "dotenv": "16.4.1",
                "rimraf": "5.0.5",
                "typescript": "5.3.3",
                    // EN CASO NECESITES MAS DEV DEPENDENCIAS
            }
        }
    ```

- [ ] rollup.config.js
    ```typescript
        import typescript from 'rollup-plugin-typescript2'
        import commonjs from '@rollup/plugin-commonjs'
        export default {
            input: ['src/index.ts'],
            output: [
                {
                    dir: 'dist',
                    entryFileNames: '[name].cjs',
                    format: 'cjs',
                    exports: 'named',
                },
            ],
            plugins: [
                commonjs(),
                typescript(),
            ],
        }
    ```


- [ ] jest.config.js
    ```javascript
        module.exports = require('../../jest.config.js')
    ```

- [ ] tsconfig.json
    ```json
        {
            "compilerOptions": {
                "allowJs": true,
                "esModuleInterop": true,
                "allowSyntheticDefaultImports": true,
                "outDir": "./dist",
                "rootDir": "./src",
                "declaration": true,
                "declarationMap": true,
                "moduleResolution": "node",
                "importHelpers": true,
                "target": "es2021",
                "types": ["node"]
            },
            "include": ["src/**/*.js", "src/**/*.ts"],
            "exclude": ["**/*.spec.ts", "**/*.test.ts", "node_modules"]
        }
    ```


Los archivos debes colocarlo en tu directorio `packages/TU_NOMBRE_UNICO_DE_INTEGRACION`

>__A tener en cuenta__

- [ ] Usar el index unicamente para exportar objetos finales que se usaran al instalar la librería.
- [ ] Crea tu archivo type.ts donde expongas los tipos de datos que usas.
- [ ] Crea tu archivo .env.local donde indiques los nombres de las variables de entorno que requiere tu incorporación.
- [ ] crea tu README.md donde expliques el uso basico con ejemplos de tu incorporación.

-----

__Compilar (build)__
Para compilar la aplicación, debes ejecutar el siguiente comando, el cual generará un directorio `dist` dentro de los paquetes del monorepo.
```
pnpm run build
```

__Ejecutar entorno de prueba__
Una vez ejecutado el build si todo esta ok, debes correl el siguiente comando.
```
pnpm run copy.lib
```
El comando anterior ejecutara un cp dentro de la carpeta `base_app`, en ella debiste haber hecho previamente `npm install`, y luego corres `pnpm run copy.lib` desde la raiz de tu directorio.

Para correr el asistente unicamente corre `npm run dev`, deberia salir todo OK.

__Test e2e__
Todos los cambios realizados deben de pasar las pruebas end-to-end
esas pruebas corren directamente con `pnpm run test`, debes tener tu carpeta test y tus archivos con la siguiente extension `archivo.test.ts`



> __NOTA:__ Si encuentras información que podría mejorarse en este documento o algún error ortográfico que dificulte la comprensión, dejanos algún mensaje por unos de los canales listados abajo.

------
-   [Discord](https://link.codigoencasa.com/DISCORD)
-   [Twitter](https://twitter.com/leifermendez)
-   [Youtube](https://www.youtube.com/watch?v=5lEMCeWEJ8o&list=PL_WGMLcL4jzWPhdhcUyhbFU6bC0oJd2BR)
-   [Telegram](https://t.me/leifermendez)