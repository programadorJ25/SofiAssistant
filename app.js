require("dotenv").config();
const { createBot, createProvider, createFlow } = require("@bot-whatsapp/bot");
const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MySQLAdapter = require("@bot-whatsapp/database/mysql");
// const path = require("path");
// const fs = require("fs");

//importar CHATGPT
const ChatGPTClass = require(".//chatgpt.class");
const chatGPT = new ChatGPTClass();
/**
 * Declaramos las conexiones de MySQL
 */
const MYSQL_DB_HOST = "localhost";
const MYSQL_DB_USER = "root";
const MYSQL_DB_PASSWORD = "";
const MYSQL_DB_NAME = "bot";
const MYSQL_DB_PORT = "3306";
/**
 * Flows
 */
const flowPrincipal = require("./flows/flowPrincipal");
const flowAgente = require("./flows/flowAgente");
const { flowInformacion } = require("./flows/flowInformacion");
const { flowEnergia } = require("./flows/flowEnergia");
const { flowOfertas } = require("./flows/flowOfertas");
const { flowContacto } = require("./src/flowContacto");
const  flowVoiceNote  = require("./flows/flowVoiceNote");

const main = async () => {
  const adapterDB = new MySQLAdapter({
    host: MYSQL_DB_HOST,
    user: MYSQL_DB_USER,
    database: MYSQL_DB_NAME,
    password: MYSQL_DB_PASSWORD,
    port: MYSQL_DB_PORT,
  });
  const adapterFlow = createFlow([
    flowPrincipal,
    flowAgente,
    flowInformacion(chatGPT),
    flowEnergia(chatGPT),
    flowOfertas(chatGPT),
    flowContacto(chatGPT),
    flowVoiceNote,
  ]);

  const adapterProvider = createProvider(BaileysProvider);
  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });
  QRPortalWeb();
};

main();
