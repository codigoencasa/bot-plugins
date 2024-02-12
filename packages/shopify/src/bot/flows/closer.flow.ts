import { EVENTS, addKeyword } from '@bot-whatsapp/bot'
import { ClassManager } from '../../ioc'
import { Runnable } from '../../rag/runnable'
import { generateTimer } from '../../utils/generateTimer'
<<<<<<< HEAD

export default addKeyword(EVENTS.ACTION)
  .addAction(async (ctx, { state, flowDynamic }) => {


    const runnable = ClassManager.hub().get<Runnable>('runnable')
    
    /** El historial se carga de una base de datos vectorizada alcenada en disco */
    /** La busqueda se genera mediante el chat_id y de alli se obtienen los datos del chat */
    const history = []
    
    const textLarge = await runnable.toClose(ctx.name, ctx.body, history)
    /** se guarda el hsitoria en [user, bot] */
    
    const chunks = textLarge.split(/(?<!\d)\.\s+/g);
    for (const chunk of chunks) {
      await flowDynamic([{ body: chunk.trim(), delay: generateTimer(150, 250) }]);
    }
=======
import { getHistory, handleHistory } from '../utils/handleHistory'

export default addKeyword(EVENTS.ACTION)
  .addAction(async (ctx, { state, flowDynamic }) => {
    await flowDynamic(`Entro el cerrar venta`)
    return
>>>>>>> 107ff824d565e4f002e63b755b1ccc8112f6b2ab

  })
