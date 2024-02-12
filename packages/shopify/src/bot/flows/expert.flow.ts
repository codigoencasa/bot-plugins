import { EVENTS, addKeyword } from '@bot-whatsapp/bot'
import { ClassManager } from '../../ioc'
import { Runnable } from '../../rag/runnable'
import { generateTimer } from '../../utils/generateTimer'
<<<<<<< HEAD
=======
import { load_history, save_history } from '../../rag/history'
import { History, getHistory, handleHistory } from '../utils/handleHistory'
>>>>>>> 107ff824d565e4f002e63b755b1ccc8112f6b2ab

export default addKeyword(EVENTS.ACTION)
  .addAction(async (ctx, { state, flowDynamic }) => {
    const runnable = ClassManager.hub().get<Runnable>('runnable')
    /** El historial se carga de una base de datos vectorizada alcenada en disco */
    /** La busqueda se genera mediante el chat_id y de alli se obtienen los datos del chat */
<<<<<<< HEAD
    const history = []
    
    const textLarge = await runnable.toAsk(ctx.name, ctx.body, history)
    /** se guarda el hsitoria en [user, bot] */
=======
    // const history = await load_history(ctx.from)
    const history = getHistory(state)
    const textLarge = await runnable.toAsk(ctx.name, ctx.body, history)
>>>>>>> 107ff824d565e4f002e63b755b1ccc8112f6b2ab

    const chunks = textLarge.split(/(?<!\d)\.\s+/g);
    await handleHistory({ content: textLarge, role: 'seller' }, state)
    for (const chunk of chunks) {
      await flowDynamic([{ body: chunk.trim(), delay: generateTimer(150, 250) }]);
    }

  })
