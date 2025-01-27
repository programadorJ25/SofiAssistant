const { addKeyword } = require("@bot-whatsapp/bot");
const { getService, getStation } = require("../Api/station.service");
const { readFileSync } = require("fs");
const { join } = require("path");
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Recuperamos el prompt "TECNICO"
 */
const getPrompt = async () => {
  const pathPromp = join(process.cwd(), "prompts");
  const text = readFileSync(join(pathPromp, "Station.txt"), "utf-8");
  return text;
};

/**
 * Exportamos
 * @param {*} chatgptClass
 * @returns
 */
module.exports = {
  flowInformacion: (chatgptClass) => {
    return addKeyword("A", {
      sensitive: true,
    })
      .addAction(async (ctx, { endFlow, flowDynamic, provider }) => {
        await flowDynamic("Consultando datos de la estación...");

        const jid = ctx.key.remoteJid;
        const refProvider = await provider.getInstance();

        await refProvider.presenceSubscribe(jid);
        await delay(500);

        await refProvider.sendPresenceUpdate("composing", jid);

        const user = await getService(ctx.from); //Consultamos a strapi! ctx.from = numero

        //console.log(user);
        
        if (!user || user.length === 0) {
          await flowDynamic([
            "No tienes estación con nosotros!",
            "Presiona el número *4* para darte información",
          ]);
          return endFlow();
        }

        const infoStation = await getStation(user[0].plcId);

        //console.log(infoStation);

        if (!infoStation || infoStation.length === 0) {
          await flowDynamic("No tienes estación activa, contactanos!");
          return endFlow();
        }
        // Si necesitas convertir la cadena 'station' en un arreglo
        infoStation.forEach((station) => {
          station.values = JSON.parse(station.values);
        });

        // Formatear los datos según tus necesidades
        const listStations = infoStation
          .map((i) => `EstacionId:${i.plcId}, station:${i.values.join(", ")},`)
          .join("\n");

        console.log(listStations);

        const data = await getPrompt();

        await chatgptClass.handleMsgChatGPT(data); //Dicinedole actua!!

        const textFromAI = await chatgptClass.handleMsgChatGPT(
          `cliente=${user[0].username}, lista_de_estacion="${listStations}"`
        );

        await flowDynamic(textFromAI.text);
      })
      .addAnswer(
        `Tienes otra pregunta? o duda?`,
        { capture: true },
        async (ctx, { fallBack }) => {
          // ctx.body = es lo que la peronsa escribe!!

          if (!ctx.body.toLowerCase().includes("gracias")) {
            const textFromAI = await chatgptClass.handleMsgChatGPT(ctx.body);
            return fallBack(textFromAI.text); // Asegúrate de devolver la promesa
          } else {
            return fallBack("Parece que tienes una pregunta sobre ofertas."); // Devolver una promesa también aquí
          }
        }
      );
  },
};
// Este es el flujo que maneja la consulta de estaciones y menús
// module.exports = {
//   flowInformacion: (chatgptClass) => {
//     return addKeyword("A", { sensitive: true }) // Opción para estado de la estación
//       .addAction(async (ctx, { endFlow, flowDynamic, provider }) => {
//         await flowDynamic("Consultando datos de usuario...");

//         const jid = ctx.key.remoteJid;
//         const refProvider = await provider.getInstance();

//         await refProvider.presenceSubscribe(jid);
//         await delay(500);
//         await refProvider.sendPresenceUpdate("composing", jid);

//         // Obtener información del usuario
//         const user = await getService(ctx.from); // Consulta al API

//         console.log(user);

//         // Validar que el usuario existe y tiene la estructura esperada
//         if (!user || !user.user_type) {
//           await flowDynamic([ 
//             "No tienes acceso a estaciones!", 
//             "Presiona el número *4* para contactar soporte." 
//           ]);
//           return endFlow();
//         }

//         const userType = user.user_type;  // Acceder correctamente al tipo de usuario

//         if (userType === 1) {
//           // Usar las estaciones ya recibidas en la respuesta de la API
//           const allStations = user.stations; // Estaciones recibidas en la respuesta

//           const stationList = allStations
//             .map((station, index) => `${index + 1}. ${station.razonSocial}`) // Mostrar la razón social
//             .join("\n");

//           await flowDynamic([
//             "Eres superadministrador. Estas son las estaciones disponibles:",
//             stationList,
//             "Por favor, escribe el número de la estación que deseas consultar o elige otra opción del menú."
//           ]);

//           // Capturar la respuesta para elegir una estación
//           return addKeyword("*", { capture: true })
//             .addAnswer(
//               "Procesando tu elección...",
//               async (stationIndex, { fallBack }) => {
//                 const chosenOption = parseInt(stationIndex.body);

//                 // Verificar si el input corresponde a una estación o a un flujo diferente
//                 if (chosenOption >= 1 && chosenOption <= allStations.length) {
//                   const chosenStation = allStations[chosenOption - 1]; // Acceder a la estación seleccionada

//                   if (!chosenStation) {
//                     return fallBack("Selección inválida, por favor intenta de nuevo.");
//                   }

//                   // Obtener información de la estación seleccionada
//                   const infoStation = await getStation(chosenStation.id); // Usar el id de la estación seleccionada

//                   if (!infoStation || infoStation.length === 0) {
//                     await flowDynamic("No hay información para la estación seleccionada.");
//                     return endFlow();
//                   }

//                   const listStations = infoStation
//                     .map((i) => `EstacionId:${i.plcId}, station:${i.values.join(", ")},`)
//                     .join("\n");

//                   // Obtener el prompt para mostrar
//                   const data = await getPrompt();
//                   await chatgptClass.handleMsgChatGPT(data);

//                   // Obtener la respuesta de la AI basada en la estación seleccionada
//                   const textFromAI = await chatgptClass.handleMsgChatGPT(
//                     `estacion_seleccionada="${chosenStation.razonSocial}", lista_de_estacion="${listStations}"`
//                   );

//                   await flowDynamic(textFromAI.text);
//                 } else {
//                   // Si el número no corresponde a una estación, se interpreta como una opción del menú
//                   await flowDynamic([
//                     "¿Te gustaría consultar alguna de las siguientes opciones del menú?",
//                     "*1* - Estado de la estación",
//                     "*2* - Energía consumida",
//                     "*3* - Flujo de agua",
//                     "*4* - Soluciones disponibles"
//                   ]);
//                 }
//               }
//             );
//         }
//       })
//       .addAnswer(
//         `¿Tienes alguna otra pregunta? o duda?`,
//         { capture: true },
//         async (ctx, { fallBack }) => {
//           if (!ctx.body.toLowerCase().includes("gracias")) {
//             const textFromAI = await chatgptClass.handleMsgChatGPT(ctx.body);
//             return fallBack(textFromAI.text);
//           } else {
//             return fallBack("Parece que tienes una pregunta sobre ofertas.");
//           }
//         }
//       );
//   },
// };





