const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const flowPrincipal = addKeyword(EVENTS.WELCOME)
  .addAnswer([
    "¡Hola y bienvenido a *ROMIDA*!",
    "Soy *Sofía*, tu agente virtual personalizado. Estoy aquí para asistirte en todo lo que necesites.",
  ])
  .addAnswer([
    "¿En qué puedo ayudarte hoy?",
    "",
    "Por favor, selecciona una de las siguientes opciones respondiendo con la letra correspondiente:",
    "",
    "*A* - *Estado de la estación*: Obtén información actual sobre el estado de tu estación.",
    "*B* - *Energía consumida*: Consulta el consumo y gasto de energía de la estación.",
    "*C* - *Flujo de agua*: Conoce el volumen de agua utilizado por la estación en litros.",
    "*D* - *Soluciones disponibles*: Accede a las soluciones y servicios que tenemos para ti.",
  ])
  .addAnswer(
    "Estoy lista para ayudarte. ¡Espero tu respuesta para poder asistirte de la mejor manera!"
  );

module.exports = flowPrincipal;
