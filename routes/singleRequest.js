const express = require("express");
const messaging = require('firebase-admin/messaging');

const router = express.Router();

module.exports = router;

/**
 * @swagger
 * /notificationServer/api/v1/firebase/single/onlyDevice:
 *  post:
 *      summary: envia la notificación a un único dispositivo en la aplicación default a través del token 
 *      tags: [default, notificaciones]
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