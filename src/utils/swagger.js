const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0", 
    info: {
      title: "My API", 
      version: "1.0.0", 
      description: "A simple Express API", 
      contact: {
        name: "API Support",
        url: "http://www.example.com",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: `http://localhost: 8080}`,
      },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js"], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };
