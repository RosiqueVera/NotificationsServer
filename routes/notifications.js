const appAdmin = require('firebase-admin/app');
const messaging = require('firebase-admin/messaging');
const express = require("express");

const router = express.Router();

const corpo8 = require('../keys/corpo-8-firebase-adminsdk-3idy4-67e87f7f17.json');
const pushDemo = require('../keys/flutterpushnotifications-bfb3e-firebase-adminsdk-3txzv-2231a3d56d.json');
/**
 * @swagger
 * components:
 *  schemas:
 *      firebase:
 *          type: object
 *          properties:
 *              token:
 *                  type: string
 *                  description: token del dispositivo
 *              information:
 *                  type: string
 *                  description: JSON de información que llevará el payload de la notificación
 *              badgecount:
 *                  type: integer
 *                  descripction: Número de notificaciones pendientes
 *          required:
 *              -token
 *              -badgecount
 *          example:
 *              token: eZRypq5KRh-IgoOOjjd8ow:APA91bEl_InBad4orc4WbjlqwacxEQUxAVsXvK7FP-LsDh0kRaIiw0ou5f6vTs6k-oWWJCJJpv0LhxljoLHzTrv6bJjJ9Rllvmj1I40zQe80K7kzx1d4hVAGi1w7k3ulK_TCLuWeUWSv
 *              information: { "dato1": "1", "dato2":"dos" }
 *              badgecount: 10
 *      firebaseMultiple:
 *          type: object
 *          properties:
 *              tokens:
 *                  type: array
 *                  description: Array que contiene los tokens de los dispositivos a los cuales tiene que llegar la notificación
 *              information:
 *                  type: string
 *                  description: JSON de información que llevará el payload de la notificación
 *              badgecount:
 *                  type: integer
 *                  descripction: Número de notificaciones pendientes
 *          required:
 *              -tokens
 *              -badgecount
 *          example:
 *              tokens: ["fwgDdA7RTmuQY8aNVZHKA8:APA91bHD6x3XQM-fmp73fuSNIsNbvYc7bYsjVwyhjx1Px_ZQHDWULx5FntapuZlpzvjxn4-YSIdRELS9Auj0pJ-HYwftZWa3AhsMAaIljLXHPXJywhhKw1MzBdF_T8QUfeMHoXd0VJxt","eZRypq5KRh-IgoOOjjd8ow:APA91bEl_InBad4orc4WbjlqwacxEQUxAVsXvK7FP-LsDh0kRaIiw0ou5f6vTs6k-oWWJCJJpv0LhxljoLHzTrv6bJjJ9Rllvmj1I40zQe80K7kzx1d4hVAGi1w7k3ulK_TCLuWeUWSv"]
 *              information: { "dato1": "1", "dato2":"dos" }
 *              badgecount: 10
 */


//Inicializamos la aplicación de firebase
var defaultApp = appAdmin.initializeApp(
    {
    credential: appAdmin.cert(corpo8),
    }
);
var otherApp = appAdmin.initializeApp(
    {
        credential: appAdmin.cert(pushDemo)
    },
    'PushDemo'
);



/**
 * @swagger
 * /notificationServer/api/v1/firebase/onlyDevice:
 *  post:
 *      summary: envia la notificación a un único dispositivo en la aplicación default a través del token 
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      $ref: '#/components/schemas/firebase'
 *      responses:
 *          200:
 *              description: La notificación se envió correctamente
 *              content:
 *                  applicattion/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/successfull'
 *          400:
 *              description: No se envió la notificación
 *              content:
 *                  applicattion/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/failure'
 *          500:
 *              description: Ocurrió un error en el servidor
 */
router.post("/onlyDevice", function(req, res){
    //console.info(req.body);
    //Esta variable obtiene de la petición el token al cual se le mandará la información
    const message = buildNotificationMessage(req);
    sendRequestToFCM(message, res);

});

router.post("/project/:project", function(req, res){
    
    //Esta variable obtiene de la petición el token al cual se le mandará la información
    const receivedToken = req.body.token;
    const information = req.body.information;
    const badgecount = req.body.badgecount;

    const project = req.params.project;
    var application = defaultApp.name;
    if (project ==='pushDemo') {
        application = otherApp.name;
       
    }

    
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
    messaging.getMessaging(appAdmin.getApp(application)).send(message)
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

});
/**
 * @swagger
 * /notificationServer/api/v1/firebase/multi_devices:
 *  post:
 *      summary: envia la notificación a los dispositivos especificados 
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      $ref: '#/components/schemas/firebaseMultiple'
 *      responses:
 *          200:
 *              description: La notificación se envió correctamente
 *              content:
 *                  applicattion/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/successfull'
 *          400:
 *              description: No se envió la notificación
 *              content:
 *                  applicattion/json:
 *                      schema:
 *                          type: object
 *                          $ref: '#/components/schemas/failure'
 *          500:
 *              description: Ocurrió un error en el servidor
 */
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


function buildNotificationMessage(req) {
    const receivedToken = req.body.token;
    const information = req.body.information;
    const title = req.body.title ?? 'Notificación.';
    const body = req.body.body ?? 'Notificación desde el servidor de notificaciones en NodeJS.';
    const badgecount = req.body.badgecount;
    const message = {
        token: receivedToken,
        notification: {
            title: title,
            body: body
        },
        data: information,
        android: {
            notification: {
                notification_count: badgecount ?? 1,
                sound: "default"
            }
        },
        apns: {
            payload: {
                aps: {
                    notification_count: badgecount ?? 1,
                    sound: "default"
                }
            }
        }
    };
    return message;
}

/**
 * @swagger
 * components:
 *  schemas:
 *      successfull:
 *          type: object
 *          properties:
 *              message:
 *                  type: string
 *                  description: Mensaje de envio exitoso
 *              messageId:
 *                  type: string
 *                  description: Aplicación/Id del mensaje en firebase
 *          example:
 *              message: Successfully send message
 *              messageId: projects/corpo-8/messages/0:1695934698497806%73f1ea1973f1ea19
 *      failure:
 *          type: object
 *          properties:
 *              code:
 *                  type: string
 *                  description: tipo de error cometido
 *              message:
 *                  type: string
 *                  descripcion: descripción del error
 *          example:
 *              code: "app/invalid-credential"
 *              message: "Credential implementation provided to initializeApp() via the \"credential\" property failed to fetch a valid Google OAuth2 access token with the following error: \"Error fetching access token: Error while making request: getaddrinfo ENOTFOUND metadata.google.internal. Error code: ENOTFOUND\"."
 * 
 */
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