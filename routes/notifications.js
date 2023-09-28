const express = require("express");
const messaging = require('firebase-admin/messaging');

const router = express.Router();

router.post("/onlyDevice", function(req, res){
    //console.info(req.body);
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

router.post("/multi_devices",function(req,res){
    //Obtenemos los tokens de los dispositivos a los que se enviará
    const tokens = req.body.tokens;
    //Obtenemos la información del paylad
    const information = req.body.information;
    //Indicador de notificaciones pendientes
    const badgecount = req.body.badgecount;
    
    //maquetación de la estructura de la notificación
    const message = {
        tokens: tokens,
        notification: {
            title: "Prueba muliple",
            body: "Notificación desde servidor de pruebas en endpoint '/multi_send'"
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
    
    messaging.getMessaging().sendEachForMulticast(message)
    .then((response) => {
        if(response.failureCount > 0){
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if(!resp.success){
                    failedTokens.push(tokens[idx]);
                }
            });
            console.log('List of tokens that caused failures: ' + failedTokens);
        }
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

module.exports = router;