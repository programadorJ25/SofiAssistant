const axios = require("axios");

/**
 * Obtenemos datos del usuario basado en el numero de telefono
 * @param {*} phone
 * @returns
 */
const getService = async (phone) => {
  console.log(phone);
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
const getStation = async (id) => {
  console.log(id);

  try {
    var config = {
      method: "get",
      url: `https://flowservice.romidamx.com/public/api/station/${id}`,
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_KEY}`,
      },
    };

    const response = await axios(config);
    return response.data;
  } catch (e) {
    console.log(e);
    return null;
  }
};

module.exports = { getService, getStation };
