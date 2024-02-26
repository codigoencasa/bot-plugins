# CONTRIBUTING

### 👋 !Welcome!

We're glad that you're interested in contributing to our project! Here you will find all the necessary information to start collaborating. You can contribute in various ways, whether it's updating the documentation, improving the code, reviewing pending issues in the [issues](https://github.com/codigoencasa/bot-plugins/issues), or even making financial contributions, which will be used for various purposes related to the development and maintenance of the project. You can see more details on how to make financial contributions [here](https://opencollective.com/bot-whatsapp).

The main language we use in this project is TypeScript, which allows us to maintain readable and scalable code.

### 💡 Frecuent Questions

Here are some answers to frequently asked questions that may arise when contributing to the project:

- **What is Lerna?** You can find an explanation in this [video](https://share.vidyard.com/watch/n3HLai7q4kj2yZHL35e3bo).
- **How do I make commits effectively?** Here's a [video](https://share.vidyard.com/watch/KjqJ5v2dgdAMdVZeLpJZix) that shows you how to do it.
- **What are our communication channels?** You can join our community on [Discord](https://link.codigoencasa.com/DISCORD).

------

### Requirements:

Before starting to contribute to the project, make sure you have the following tools installed:

- **Node.js**: Version 18 or higher. You can download Node from [here](https://nodejs.org/es/download/).
- **pnpm**: Package manager. You can install it by following the instructions [here](https://pnpm.io/cli/install).
- **VSCode**: Code editor that we recommend, as it has useful plugins.
- **Conventional Commits**: VSCode plugin that helps you create semantic commits, following best practices. You can install it from [here](https://marketplace.visualstudio.com/items?itemName=vivaxy.vscode-conventional-commits&ssr=false#overview).

### 🚀 Get Starter

#### Hacer Fork del Proyecto

Before starting work on the project, fork it to your own GitHub account. This will allow you to work on your own copy of the repository. Click on the following link to fork: [here](https://github.com/codigoencasa/bot-plugins/fork).

#### Clone the Repository (from your fork)

Once you have forked the project, clone your own copy of the repository using the following command in your terminal:

```bash
git clone https://github.com/TU_USERNAME/bot-plugins
```

#### Dependencies install

Go to the project folder and run the following commands to install the necessary dependencies:

```bash
cd bot-plugins
pnpm install
pnpm run build
```

------

#### Create a new integration

To create a new integration, run the following command in your terminal:

```bash
pnpm run create.package <nombre_del_paquete>
```

------

#### Compilar (build)

To compile the application, run the following command in your terminal. This will generate a dist directory within the monorepo packages.

```bash
npx lerna run build --scope=<nombre_del_paquete>
```

#### Ejecutar Entorno de Prueba

Once you have run the build and everything is correct, run the following command in your terminal:

```bash
pnpm run copy.lib
```

This command will copy the necessary files into the base_app folder. Make sure you have previously run npm install within the `base_app` folder. Then, from the root of your directory, run:

```bash
pnpm run copy.lib
```

To start the assistant, run:

```bash
npm run dev
```

It should work smoothly.

#### Test End-to-End (E2E)

All changes made must pass the `end-to-end` tests. These tests are run with the following command:

```bash
pnpm run test
```

Make sure you have a test folder and files with the `.test.ts` extension for your `tests`.

> **NOTE:** If you find information that could be improved in this document or any spelling error that hinders understanding, leave us a message in any of the channels listed below.

------

- [Discord](https://link.codigoencasa.com/DISCORD)
- [Twitter](https://twitter.com/leifermendez)
- [YouTube](https://www.youtube.com/watch?v=5lEMCeWEJ8o&list=PL_WGMLcL4jzWPhdhcUyhbFU6bC0oJd2BR)
- [Telegram](https://t.me/leifermendez)