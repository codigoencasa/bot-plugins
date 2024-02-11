import { EVENTS, addKeyword } from '@bot-whatsapp/bot'
import { ClassManager } from '../../ioc'
import { Runnable } from '../../rag/runnable'
import { generateTimer } from '../../utils/generateTimer'
import { getHistory, handleHistory } from '../utils/handleHistory'

export default addKeyword(EVENTS.ACTION)
  .addAction(async (ctx, { state, flowDynamic }) => {
    const runnable = ClassManager.hub().get<Runnable>('runnable')

    const history = getHistory(state)
    const textLarge = await runnable.toClose(ctx.name, ctx.body, history)

    const chunks = textLarge.split(/(?<!\d)\.\s+/g);
    await handleHistory({ content: textLarge, role: 'seller' }, state)

    for (const chunk of chunks) {
      await flowDynamic([{ body: chunk.trim(), delay: generateTimer(150, 250) }]);
    }

  })
