const { addKeyword } = require("@bot-whatsapp/bot");
const { getUser, getTicket } = require("../Api/clients.service");
const { readFileSync } = require("fs");
const { join } = require("path");
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Recuperamos el prompt "TECNICO"
 */
const getPrompt = async () => {
  const pathPromp = join(process.cwd(), "prompts");
  const text = readFileSync(join(pathPromp, "Soporte.txt"), "utf-8");
  return text;
};

/**
 * Exportamos
 * @param {*} chatgptClass
 * @returns
 */
module.exports = {
  flowReparacion: (chatgptClass) => {
    return addKeyword("C", {
      sensitive: true,
    })
      .addAction(async (ctx, { endFlow, flowDynamic, provider }) => {
        await flowDynamic("Consultando en la base de datos...");

        const jid = ctx.key.remoteJid;
        const refProvider = await provider.getInstance();

        await refProvider.presenceSubscribe(jid);
        await delay(500);

        await refProvider.sendPresenceUpdate("composing", jid);

        const user = await getUser(ctx.from); //Consultamos a strapi! ctx.from = numero

        if (!user || user.length === 0) {
          await flowDynamic([
            "No tienes estación con nosotros!",
            "Presiona el número *3* para darte información",
          ]);
          return endFlow();
        }

        const listTickets = user
          .map(
            (i) =>
              `ID_REF:${i.id}, cliente:${i.razonSocial}, RFC:${i.RFC}, email: ${i.email}`
          )
          .join("\n");

        const data = await getPrompt();

        await chatgptClass.handleMsgChatGPT(data); //Dicinedole actua!!

        const textFromAI = await chatgptClass.handleMsgChatGPT(
          `cliente=${user[0].razonSocial}, lista_de_reparaciones="${listTickets}"`
        );

        console.log(textFromAI.text);

        await flowDynamic(textFromAI.text);
      })
      .addAnswer(
        `Tienes otra pregunta? o duda?`,
        { capture: true },
        async (ctx, { fallBack }) => {
          // ctx.body = es lo que la peronsa escribe!!

          if (!ctx.body.toLowerCase().includes("gracias" || "adios")) {
            const textFromAI = await chatgptClass.handleMsgChatGPT(ctx.body);
            return fallBack(textFromAI.text); // Asegúrate de devolver la promesa
          } else {
            return fallBack("Parece que tienes una pregunta sobre ofertas."); // Devolver una promesa también aquí
          }
        }
      );
  },
};
