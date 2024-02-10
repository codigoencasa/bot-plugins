import { EVENTS, addKeyword } from '@bot-whatsapp/bot'
import { ClassManager } from '../../ioc'
import { Runnable } from '../../rag/runnable'
import { generateTimer } from '../../utils/generateTimer'
import { load_history, save_history } from '../../rag/history'

export default addKeyword(EVENTS.ACTION)
  .addAction(async (ctx, { state, flowDynamic }) => {
    const runnable = ClassManager.hub().get<Runnable>('runnable')
    /** El historial se carga de una base de datos vectorizada alcenada en disco */
    /** La busqueda se genera mediante el chat_id y de alli se obtienen los datos del chat */
    const history = await load_history(ctx.from)
    
    const textLarge = await runnable.toAsk(ctx.name, ctx.body, history)
    /** se guarda el hsitoria en [user, bot] */
    await save_history(ctx.from, [ctx.body, textLarge])

    const chunks = textLarge.split(/(?<!\d)\.\s+/g);
    for (const chunk of chunks) {
      await flowDynamic([{ body: chunk.trim(), delay: generateTimer(150, 250) }]);
    }

  })
