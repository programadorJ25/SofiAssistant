const { addKeyword } = require("@bot-whatsapp/bot");
const { getService, getEnergy } = require("../Api/energy.service");
const { readFileSync } = require("fs");
const { join } = require("path");
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Recuperamos el prompt "TECNICO"
 */
const getPrompt = async () => {
  const pathPromp = join(process.cwd(), "prompts");
  const text = readFileSync(join(pathPromp, "Energia.txt"), "utf-8");
  return text;
};

/**
 * Exportamos
 * @param {*} chatgptClass
 * @returns
 */
module.exports = {
  flowEnergia: (chatgptClass) => {
    return addKeyword("B", {
      sensitive: true,
    })
      .addAction(async (ctx, { endFlow, flowDynamic, provider }) => {
        await flowDynamic("Revisando los consumos energeticos...");

        const jid = ctx.key.remoteJid;
        const refProvider = await provider.getInstance();

        await refProvider.presenceSubscribe(jid);
        await delay(500);

        await refProvider.sendPresenceUpdate("composing", jid);

        const user = await getService(ctx.from); //Consultamos a strapi! ctx.from = numero

        if (!user || user.length === 0) {
          await flowDynamic([
            "No tienes estación con nosotros!",
            "Presiona el número *4* para darte información",
          ]);
          return endFlow();
        }

        const infoStation = await getEnergy(user[0].plcId);

        if (!infoStation || infoStation.length === 0) {
          await flowDynamic("No tienes estación activa, contactanos!");
          return endFlow();
        }

        // Formatear los datos según tus necesidades
        const listStations = infoStation
          .map((i) => `EstacionId:${i.plcId}, station:${i.dataEnergy},`)
          .join("\n");

        const data = await getPrompt();

        await chatgptClass.handleMsgChatGPT(data); //Dicinedole actua!!

        const textFromAI = await chatgptClass.handleMsgChatGPT(
          `cliente=${user[0].razonSocial}, lista_de_estacion="${listStations}"`
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
