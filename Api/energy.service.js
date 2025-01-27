const axios = require("axios");

/**
 * Obtenemos datos del usuario basado en el numero de telefono
 * @param {*} phone
 * @returns
 */
const getService = async (phone) => {
  try {
    var config = {
      method: "get",
      url: `https://flowservice.romidamx.com/public/api/users/${phone}`,
    };

    const response = await axios(config);
    // console.log(response);

    return response.data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

/**
 * Consultamos el ticket de soporte
 * @param {*} id
 * @returns
 */
const getEnergy = async (id) => {
  try {
    var config = {
      method: "get",
      url: `https://flowservice.romidamx.com/public/api/energy/${id}`,
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_KEY}`,
      },
    };

    const response = await axios(config);
    console.log(response.data);

    return response.data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

module.exports = { getService, getEnergy };
