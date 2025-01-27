const { addKeyword } = require("@bot-whatsapp/bot");

/**
 * Esto se ejeuta cunado la persona escruibe "AGENTE"
 */
const flowAgente = addKeyword("AGENTE", { sensitive: true })
  .addAnswer(
    "Estamos desviando tu conversacion con Estafany Rayón quién te brindara un soporte mas detallado"
  )
  .addAction(async (ctx, { provider }) => {
    const nanoid = await import("nanoid");
    const ID_GROUP = nanoid.nanoid(5);
    const refProvider = await provider.getInstance();

    const agenteTelefono = "5215579993623";

    await refProvider.groupCreate(`ROMIDA Support (${ID_GROUP})`, [
      `${ctx.from}@s.whatsapp.net`,
      `${agenteTelefono}@s.whatsapp.net`,
    ]);
  })
  .addAnswer("Te hemos agregado a un grupo con un asesor! Gracias");

module.exports = flowAgente;
