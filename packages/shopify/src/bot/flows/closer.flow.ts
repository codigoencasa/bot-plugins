import { EVENTS, addKeyword } from '@bot-whatsapp/bot'


export default addKeyword(EVENTS.ACTION)
  .addAction(async (_, { flowDynamic }) => {
    await flowDynamic('Ok, te dejo el link para que puedas completar tu compra...')
  
    await flowDynamic('link')
  })
