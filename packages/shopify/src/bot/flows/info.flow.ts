import { EVENTS, addKeyword } from '@bot-whatsapp/bot'

import { ClassManager } from '../../ioc'
import { generateTimer } from '../../utils/generateTimer'
import { RunnableV2 } from '../../rag/runnable.v2'

export default addKeyword(EVENTS.ACTION)
  .addAction(async (ctx, { state, flowDynamic }) => {
        const runnable = ClassManager.hub().get<RunnableV2>('runnablev2')
        const channel = ClassManager.hub().get('channel')

        const context = await channel.getStoreInfo()

        const textLarge = await runnable.toInfo(ctx.body, context, state)
        const chunks = textLarge.split(/(?<!\d)\.\s+/g)

        for (const chunk of chunks) {
        await flowDynamic([{ body: chunk.trim(), delay: generateTimer(150, 250) }]);
        }

  })
