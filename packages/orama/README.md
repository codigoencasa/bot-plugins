# Orama plugin

Is an Open source tool for Vector Database using for RAG and Retrieval Genration


__INIT BD__

```ts
const store = new Store({
    schema: {
        'name': "string",
        'lastname': "string",
        'age': "number"
    },
    recreate: true
})

await store.init([
    {
        age: 25,
        lastname: 'sola',
        name: 'juan'
    }
])

```

__SEARCH__

```ts
const hits = await store.search('juan', 1)
console.log(hits)

```

__INSERT MORE DATA__

```ts
/* stuff code */

const store = new Store({
    schema: {
        'name': "string",
        'lastname': "string",
        'age': "number"
    }
})

await store.init()

await store.upsert([{
    'name': "jose",
    'lastname': "foo",
    'age': 23
}])
```

__AUTHOR__: ![Elimleth](https://github.com/elimeleth)