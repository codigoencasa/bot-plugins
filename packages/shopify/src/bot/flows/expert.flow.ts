import { EVENTS, addKeyword } from '@bot-whatsapp/bot'

import { ClassManager } from '../../ioc'
import { generateTimer } from '../../utils/generateTimer'
import { RunnableV2 } from '../../rag/runnable.v2'
import { isImg } from '../../utils/isImage'

export default addKeyword(EVENTS.ACTION)
  .addAction(async (ctx, { state, flowDynamic }) => {
    const runnable = ClassManager.hub().get<RunnableV2>('runnablev2')
    /** El historial se carga de una base de datos vectorizada alcenada en disco */
    /** La busqueda se genera mediante el chat_id y de alli se obtienen los datos del chat */
    // const history = await load_history(ctx.from)
   
      const textLarge = await runnable.toAsk(ctx.name, ctx.body, state)
      const { image, content: chunks } = isImg(textLarge)

      if (image?.length) {
        const content = chunks.shift()
        await flowDynamic([{ 
          body: content.trim(),
          media: image.at(0),
          delay: generateTimer(50, 150) 
        }]);
      }
    for (const chunk of chunks) {
      await flowDynamic([{ body: chunk.trim(), delay: generateTimer(150, 250) }]);
    }

  })
