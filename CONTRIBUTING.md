# CONTRIBUTING

### 👋 ¡Bienvenido/a!

¡Nos alegra que estés interesado/a en contribuir a nuestro proyecto! Aquí encontrarás toda la información necesaria para empezar a colaborar. Puedes contribuir de diversas maneras, ya sea actualizando la documentación, mejorando el código, revisando problemas pendientes en los [issues](https://github.com/codigoencasa/bot-plugins/issues) o incluso realizando aportes económicos, los cuales serán utilizados para diversos fines relacionados con el desarrollo y mantenimiento del proyecto. Puedes ver más detalles sobre cómo realizar aportes económicos [aquí](https://opencollective.com/bot-whatsapp).

El lenguaje principal que utilizamos en este proyecto es TypeScript, lo que nos permite mantener un código legible y escalable.

### 💡 Preguntas frecuentes

Aquí tienes algunas respuestas a preguntas frecuentes que pueden surgir al contribuir al proyecto:

- ¿Qué es Lerna? Puedes encontrar una explicación en este [video](https://share.vidyard.com/watch/n3HLai7q4kj2yZHL35e3bo).
- ¿Cómo realizo los commits de manera efectiva? Aquí tienes un [video](https://share.vidyard.com/watch/KjqJ5v2dgdAMdVZeLpJZix) que te muestra cómo hacerlo.
- ¿Cuáles son nuestros canales de comunicación? Puedes unirte a nuestra comunidad en [Discord](https://link.codigoencasa.com/DISCORD).

------

### Requisitos:

Antes de empezar a contribuir al proyecto, asegúrate de tener instaladas las siguientes herramientas:

- **Node.js**: Versión 18 o superior. Puedes descargar Node desde [aquí](https://nodejs.org/es/download/).
- **pnpm**: Administrador de paquetes. Puedes instalarlo siguiendo las instrucciones [aquí](https://pnpm.io/cli/install).
- **VSCode**: Editor de código que recomendamos, ya que cuenta con plugins útiles.
- **Conventional Commits**: Plugin de VSCode que te ayuda a crear commits semánticos, siguiendo buenas prácticas. Puedes instalarlo desde [aquí](https://marketplace.visualstudio.com/items?itemName=vivaxy.vscode-conventional-commits&ssr=false#overview).

### 🚀 Empezando

#### Hacer Fork del Proyecto

Antes de comenzar a trabajar en el proyecto, realiza un fork del mismo en tu propia cuenta de GitHub. Esto te permitirá trabajar en tu propia copia del repositorio. Haz clic en el siguiente enlace para realizar el fork: [aquí](https://github.com/codigoencasa/bot-plugins/fork).

#### Clonar el Repositorio (desde tu fork)

Una vez hayas realizado el fork del proyecto, clona tu propia copia del repositorio utilizando el siguiente comando en tu terminal:

```bash
git clone https://github.com/TU_USERNAME/bot-plugins
```

#### Instalar Dependencias

Entra a la carpeta del proyecto y ejecuta los siguientes comandos para instalar las dependencias necesarias:

```bash
cd bot-plugins
pnpm install
pnpm run build
```

------

#### Crear una Nueva Integración

Para crear una nueva integración, ejecuta el siguiente comando en tu terminal:

```bash
pnpm run create.package <nombre_del_paquete>
```

------

#### Compilar (build)

Para compilar la aplicación, ejecuta el siguiente comando en tu terminal. Esto generará un directorio `dist` dentro de los paquetes del monorepo.

```bash
npx lerna run build --scope=<nombre_del_paquete>
```

#### Ejecutar Entorno de Prueba

Una vez que hayas ejecutado el build y todo esté correcto, ejecuta el siguiente comando en tu terminal:

```bash
pnpm run copy.lib
```

Este comando copiará los archivos necesarios dentro de la carpeta `base_app`. Asegúrate de haber ejecutado previamente `npm install` dentro de la carpeta `base_app`. Luego, desde la raíz de tu directorio, ejecuta:

```bash
pnpm run copy.lib
```

Para iniciar el asistente, ejecuta:

```bash
npm run dev
```

Debería funcionar sin problemas.

#### Pruebas End-to-End (E2E)

Todos los cambios realizados deben pasar las pruebas end-to-end. Estas pruebas se ejecutan con el siguiente comando:

```bash
pnpm run test
```

Asegúrate de tener una carpeta `test` y archivos con la extensión `.test.ts` para tus pruebas.

> **NOTA:** Si encuentras información que podría mejorarse en este documento o algún error ortográfico que dificulte la comprensión, déjanos un mensaje en alguno de los canales listados a continuación.

------

- [Discord](https://link.codigoencasa.com/DISCORD)
- [Twitter](https://twitter.com/leifermendez)
- [YouTube](https://www.youtube.com/watch?v=5lEMCeWEJ8o&list=PL_WGMLcL4jzWPhdhcUyhbFU6bC0oJd2BR)
- [Telegram](https://t.me/leifermendez)