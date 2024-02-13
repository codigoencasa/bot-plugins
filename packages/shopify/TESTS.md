## Uses cases chat between a customer and sales agent

Cabe destacar que las siguientes pruebas se hicieron en base a preguntas y respuestas generadas por chatGPT la siguiente es:

```plaintext
Cliente (C): ¡Hola! Estaba revisando su tienda en línea y me preguntaba sobre los últimos modelos de teléfonos inteligentes que tienen disponibles. ¿Puede ayudarme?

Vendedor (V): ¡Hola! Claro, estoy encantado de ayudarte. Tenemos los últimos modelos de iPhone y Samsung disponibles. ¿Hay alguna marca en particular que te interese más?

C: Estoy considerando un iPhone. ¿Cuáles son las opciones y precios disponibles?

V: Tenemos el iPhone 13 y el iPhone 13 Pro en stock. El iPhone 13 comienza en $799, mientras que el iPhone 13 Pro está a partir de $999. Ambos son excelentes opciones, ¿alguna característica específica que estés buscando?

C: Estoy interesado, pero también me gustaría saber sobre la garantía y el tiempo de entrega.

V: ¡Entendido! Ofrecemos una garantía de un año en todos nuestros productos. Además, el tiempo de entrega es de 2 a 5 días hábiles. ¿Te gustaría proceder con la compra o hay algo más en lo que pueda ayudarte?

C: Excelente. ¿Puedo tener más detalles sobre la garantía?

V: Claro, la garantía cubre cualquier defecto de fabricación. Si surge algún problema, simplemente contáctanos y lo resolveremos lo antes posible. ¿Hay algo más que te gustaría saber sobre la garantía?

C: ¡Eso suena genial! Estoy listo para comprar el iPhone 13 Pro. ¿Cómo procedemos?

V: ¡Perfecto! Puedo ayudarte con el proceso de compra y el financiamiento. Necesitaré algunos detalles. ¿Podemos continuar?

C: Sí, adelante.
```

Procedamos con algunos screens:

![test#1](https://imgur.com/Nf557bu.jpg)

![test#2](https://imgur.com/YCTaLVH.jpg)

![test#3](https://imgur.com/MFBUtVD.jpg)

## test#1

:memo: Cabe destacar que el asitente se maneja muy comodo en esta primera fase

## test#2

:memo: Ya en esta fase se maneja el seguimiento de interacción, el asistente logra dar con precisión las respuestas pertinentes

## test#3

:memo: En esta fase se pretende hacer uso del cierre de venta, corroboraremos un flujo algo mas anomalo en el siguiente screenshot para definir un rango de precisión.

![flow](https://imgur.com/u86too7.jpg)

Como se observa en la imagen de arriba el asistente se maneja con aproximado del 80% de precisión en base a 7 preguntas 2 no lograron sastifacerse del todo.

:memo:

podemos medir la métrica de respuesta en base a los escenarios que podamos abarcar en una conversacion

pudiendo agregar ademas de los productos la metadata sobre el negocio yendo desde

[ ] tiempo de entregas.
[ ] horarios de atencion.
[ ] planes de compra.
[ ] etc...