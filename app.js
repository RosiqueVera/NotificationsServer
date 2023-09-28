/**
 * Oscar Alejandro Rosique Vera
 * 27/09/2023
 * 
 * Servidor de maquetación de notificaciones en firebase con Aut0
 */

//Imports referentes a express
const express = require('express');
const requestRoutes = require("./routes/notifications");
const path = require("path");

//Swagger
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerSpec = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "Servidor de notificaciones con NodeJS",
            version: "1.0"
        },
        servers: [
            {
                url: "http://localhost:3000"
            }
        ],

    },
    apis: [`${path.join(__dirname, "./routes/*.js")}`]
}


//Declaración del uso de express (Para iniciar el servidor web)
const app = express();

//!Middlewares
//Configuación del uso de json en express
app.use(express.json());
//esqueleto de la ruta
app.use('/notificationServer/api/v1/firebase', requestRoutes);
//para visualización de la documentación
app.use(
    '/api-doc', 
    swaggerUI.serve,
    swaggerUI.setup(swaggerJsDoc(swaggerSpec))
);

//default
app.get("/", (_, res) => {
    res.send("Bienvenido al servidor creado con NodeJS");
});
app.get("/notificationServer/api/v1", (_, res) => {
    res.send("REST Api dedicada al manejo de notificaciones con el uso de firebase y la nueva API de Cloud Messaging");
});
//Configuración del puerto del servidor
app.listen(3000, function () {
    console.log("Server stated on port 3000");
});