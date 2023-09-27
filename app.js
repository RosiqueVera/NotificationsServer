const appAdmin = require('firebase-admin/app');
const messaging = require('firebase-admin/messaging');
const express = require('express');


const app = express();

app.use(express.json())

//Inicializamos la aplicación de firebase
appAdmin.initializeApp({
    credential: appAdmin.applicationDefault(),
    projectId: 'corpo-8'
});
app.listen(3000,function(){
    console.log("Server stated on port 3000");
});


app.post("/send", function(req, res){
    console.info(req.body);
    //Esta variable obtiene de la petición el token al cual se le mandará la información
    const receivedToken = req.body.token;
    const information = req.body.information;
    const badgecount = req.body.badgecount;
    const message = {
        token: receivedToken,
        notification: {
            title: "Prueba",
            body: "Notificación desde servidor de pruebas"
        },
        data:information,
        android:{
            notification:{
                notification_count: badgecount ?? 1,
                sound : "default"
            }
        },
        apns:{
            payload:{
                aps:{
                    notification_count: badgecount ?? 1,
                    sound : "default"
                }
            }
        }
    };
    sendRequestToFCM(message, res);

});

app.post("/multi_send",function(req,res){
    //Obtenemos los tokens de los dispositivos a los que se enviará
    const tokens = req.body.tokens;
    //Obtenemos la información del paylad
    const information = req.body.information;
    //Indicador de notificaciones pendientes
    const badgecount = req.body.badgecount;

    //maquetación de la estructura de la notificación
    const message = {
        registration_ids: tokens,
        notification: {
            title: "Prueba",
            body: "Notificación desde servidor de pruebas"
        },
        data:information,
        android:{
            notification:{
                notification_count: badgecount ?? 1,
                sound : "default"
            }
        },
        apns:{
            payload:{
                aps:{
                    notification_count: badgecount ?? 1,
                    sound : "default"
                }
            }
        }
    };

    sendRequestToFCM(message, res);

},);



function sendRequestToFCM(message, res) {
    messaging.getMessaging().send(message)
        .then((response) => {
            res.status(200).json({
                message: "Successfully send message",
                messageId: response,
            });
            console.log("Successfully sent message: ", response);
        })
        .catch((error) => {
            res.status(400);
            res.send(error);
            console.log("Error sending message", error);
        });
}

