import { EVENTS, addKeyword } from '@bot-whatsapp/bot'
import { ClassManager } from '../../ioc'
import { Runnable } from '../../rag/runnable'
import { generateTimer } from '../../utils/generateTimer'
import { getHistory, handleHistory } from '../utils/handleHistory'
import { Channel } from '../../channels/respository'

export default addKeyword(EVENTS.ACTION)
  .addAction(async (ctx, { state, flowDynamic }) => {
    await flowDynamic('Ok, te dejo el link para que puedas completar tu compra...')
    const channel = ClassManager.hub().get<Channel>('channel')
    const storeInfo = await channel.getStoreInfo()

    await flowDynamic('link')
  })
