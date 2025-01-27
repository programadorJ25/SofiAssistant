const { addKeyword } = require("@bot-whatsapp/bot");
const { getService } = require("../Api/services.service.js");
const { readFileSync } = require("fs");
const { join } = require("path");
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Recuperamos el prompt "TECNICO"
 */
const getPrompt = async () => {
  const pathPromp = join(process.cwd(), "prompts");
  const text = readFileSync(join(pathPromp, "Contacto.txt"), "utf-8");
  return text;
};

/**
 * Exportamos
 * @param {*} chatgptClass
 * @returns
 */
module.exports = {
  flowContacto: (chatgptClass) => {
    return addKeyword("4", {
      sensitive: true,
    })
      .addAction(async (ctx, { endFlow, flowDynamic, provider }) => {
        await flowDynamic("Trayendo la información para ti...");

        const jid = ctx.key.remoteJid;
        const refProvider = await provider.getInstance();

        await refProvider.presenceSubscribe(jid);
        await delay(500);

        await refProvider.sendPresenceUpdate("composing", jid);

        const userData = await getService();

        console.log(userData);

        const listaString = JSON.stringify(userData.Lista);

        // Primero, desescapa la cadena JSON
        const cleanJsonString = listaString.replace(/\\n/g, ""); // Elimina saltos de línea escapados
        const listaArray = JSON.parse(cleanJsonString);

        const data = await getPrompt();

        await chatgptClass.handleMsgChatGPT(data); //Diciéndole actúa!!

        const textFromAI = await chatgptClass.handleMsgChatGPT(
          `sericio=${userData.NameService}, lista_de_servicios="${listaArray}"`
        );

        console.log(textFromAI.text);

        await flowDynamic(textFromAI.text);
      })
      .addAnswer(
        `Tienes otra pregunta? o duda?`,
        { capture: true },
        async (ctx, { fallBack }) => {
          // ctx.body = es lo que la peronsa escribe!!

          if (!ctx.body.toLowerCase().includes("ofertas")) {
            const textFromAI = await chatgptClass.handleMsgChatGPT(ctx.body);
            return fallBack(textFromAI.text); // Asegúrate de devolver la promesa
          } else {
            return fallBack("Parece que tienes una pregunta sobre ofertas."); // Devolver una promesa también aquí
          }
        }
      );
  },
};
