const axios = require("axios");
const { getService, getEnergy } = require("./Api/energy.service");
const { readFileSync } = require("fs");
const { join } = require("path");

/**
 * Obtenemos datos del usuario basado en el numero de telefono
 * @param {*} phone
 * @returns
 */
const getUser = async () => {
  try {
    var config = {
      method: "get",
      url: `http://127.0.0.1:8000/api/service/servicio`,
    };

    const response = await axios(config);
    // console.log("Response Data:", response.data.data);

    return response.data.data[0];
  } catch (e) {
    console.log("Error:", e.message);
    return null;
  }
};

const getPrompt = async () => {
  const pathPromp = join(process.cwd(), "prompts");
  const text = readFileSync(join(pathPromp, "Energia.txt"), "utf-8");
  return text;
};

// Función de prueba
const testGetUser = async (chatgptClass, flowDynamic) => {
  const phone = "5215566192885"; // Reemplaza esto con un número de teléfono válido para tu prueba
  const user = await getService(phone); //Consultamos a strapi! ctx.from = numero

  if (!user || user.length === 0) {
    await flowDynamic([
      "No tienes estación con nosotros!",
      "Presiona el número *4* para darte información",
    ]);
    return endFlow();
  }
  console.log(user[0].razonSocial);

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
};

// Supongamos que chatgptClass es una instancia de la clase ChatGPT
// Aquí se define una instancia ficticia de la clase ChatGPT para la demostración
class ChatGPT {
  async handleMsgChatGPT(message) {
    // Implementación ficticia de la función handleMsgChatGPT
    return { text: `AI response to: ${message}` };
  }
}

// Crear una instancia de la clase ChatGPT
const chatgptInstance = new ChatGPT();

// Llamar a la función testGetUser con la instancia de chatgptClass
testGetUser(chatgptInstance);
