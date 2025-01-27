const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { handlerAI } = require("../utils");
const { flowInformacion } = require("./flowInformacion");

const employeesAddon = [
  {
    name: "Sofia",
    description:
      "Soy Sofia, encargada de darte información sobre tu estación o bien lo que desees, mis respuestas serán breves y claras.",
    flow: flowInformacion,
  },
];

const flowVoiceNote = addKeyword(EVENTS.VOICE_NOTE).addAction(
  async (ctx, { flowDynamic, gotoFlow }) => {
    await flowDynamic("Dame un momento para escucharte...🙉");
    console.log("🤖 voz a texto....");
    const text = await handlerAI(ctx);
    console.log(`🤖 Fin voz a texto....[TEXT]: ${text}`);

    // Busca el empleado cuyo nombre esté en el texto
    const empleado = employeesAddon.find((e) =>
      text.toLowerCase().includes(e.name.toLowerCase())
    );
    console.log(empleado);

    if (empleado) {
      console.log(`🤖 Encontrado: ${empleado.name}`);
      return gotoFlow(empleado.flow); // Retorna la llamada a gotoFlow
    } else {
      await flowDynamic(
        "No se encontró un empleado correspondiente. Por favor, intenta de nuevo."
      );
    }
  }
);

module.exports = flowVoiceNote;
