/**
 * Oscar Alejandro Rosique Vera
 * 27/09/2023
 * 
 * Servidor de maquetación de notificaciones en firebase con Aut0
 */

//Imports
const appAdmin = require('firebase-admin/app');
const express = require('express');

const requestRoutes = require("./routes/notifications");


const corpo8 = require('./keys/corpo-8-firebase-adminsdk-3idy4-67e87f7f17.json');

//Inicializamos la aplicación de firebase
var defaultApp = appAdmin.initializeApp({
    credential: appAdmin.cert(corpo8),
    projectId: 'corpo-8'
});
/* var otherApp = appAdmin.initializeApp(pushDemo,'PushDemo');

console.log(otherApp.name); */

//Declaración del uso de express (Para iniciar el servidor web)
const app = express();

//!Middlewares
//Configuación del uso de json en express
app.use(express.json());
//esqueleto de la ruta
app.use('/notificationServer/api/v1',requestRoutes);

//default
app.get("/", (_, res) => {
    res.send("Bienvenido al servidor creado con NodeJS");
  });
app.get("/notificationServer/api/v1", (_, res) => {
    res.send("REST Api dedicada al manejo de notificaciones con el uso de firebase y la nueva API de Cloud Messaging");
  });
//Configuración del puerto del servidor
app.listen(3000,function(){
    console.log("Server stated on port 3000");
});


