import { EVENTS, addKeyword } from '@bot-whatsapp/bot'

import { ClassManager } from '../../ioc'
import { Runnable } from '../../rag/runnable'
import { generateTimer } from '../../utils/generateTimer'
import { History, getHistory, handleHistory } from '../utils/handleHistory'

export default addKeyword(EVENTS.ACTION)
  .addAction(async (ctx, { state, flowDynamic }) => {
    const runnable = ClassManager.hub().get<Runnable>('runnablev2')
    /** El historial se carga de una base de datos vectorizada alcenada en disco */
    /** La busqueda se genera mediante el chat_id y de alli se obtienen los datos del chat */
    // const history = await load_history(ctx.from)
    const re = /(http|https)?:\/\/\S+?\.(?:jpg|jpeg|png|gif)(\?.*)?$/gim

      const history = getHistory(state)
      const textLarge = await runnable.toAsk(ctx.name, ctx.body, history)
      const image = textLarge.match(re)
      
      const chunks = textLarge.replace(re, '').split(/(?<!\d)\.\s+/g);

      await handleHistory({ content: textLarge, role: 'seller' }, state)

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
