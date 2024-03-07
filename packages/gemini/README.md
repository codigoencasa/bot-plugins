# geminiLayer

Layers is a concept that's adapte the use for an addAction function and return a TFlow

```ts
/* stuff code */
const main = async () => {
    const welcome = addKeyword('/.*/', { regex: true })
        .addAction(async (...bot) => await geminiLayer({
            vision: true,
            context: {
                horarios_de_atencion: 'Lunes a Viernes de 9:00 a 18:00',
                ubicacion: 'venezuela',
                'reclamos y quejas': 'dejar un correo en la seccion de reclamos y quejas',
            }
        }, bot))

    const provider = createProvider(BaileysProvider) as any

    await createBot({
        flow: createFlow([welcome]),
        provider,
        database: new MemoryDB()
    })
}

main()
```

__AUTHOR__: ![Elimleth](https://github.com/elimeleth)