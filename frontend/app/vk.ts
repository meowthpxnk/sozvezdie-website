"use client";

import { Config, Messenger, CommonSDKEvents, MessengerParams, Connect } from "@vkontakte/superappkit";
import { useEffect } from "react";

let messenger: Messenger | null = null;

// --- VK INIT (ТОЛЬКО В БРАУЗЕРЕ) ---
Config.init({
    appId: 54600824,

});

// // --- AUTH HANDLER ---
// Config.onAuth(() => {
//     console.log("ON AUTH");

//     Connect.userVisibleAuth()
//         .then((data) => {
//             console.log("AUTH DATA:", data);

//             // ❗ тут должен быть запрос на backend
//             // await fetch("/api/superapp-token", { method: "POST", body: JSON.stringify(data) })

//             console.log("send data to backend for token generation");
//         })
//         .catch((err) => {
//             console.error("AUTH ERROR:", err);
//         });
// });

// // --- TOKEN REQUEST ---
// Config.onRequestSuperAppToken((params, options) => {
//     console.log("REQUEST SUPER APP TOKEN", params, options);

//     // ❗ ВРЕМЕННО: просто заглушка, иначе SDK не стартанёт
//     return {
//         superAppToken: "TEMP_TOKEN_FROM_BACKEND",
//         options,
//     };
// });

// --- OPEN MESSENGER ---
export const openMessengerHandler = () => {
    console.log("OPEN MESSENGER");

    if (!messenger) {
        messenger = new Messenger({
            styles: {
                right: "10px",
                bottom: "10px",
                zIndex: 100,
            },
        });

        messenger.on(CommonSDKEvents.ERROR, (e) => {
            console.error("Messenger error:", e);
            messenger?.close();
            messenger = null;
        });

        messenger.on(CommonSDKEvents.CLOSE, () => {
            console.log("Messenger closed");
            messenger = null;
        });
    }

    const messengerParams: MessengerParams = {
        expanded: true,
        messageSound: true,
        openSound: true,
        mode: "extended",
        expandTimeout: 0,
        peer_id: -2645768,
        scheme: "bright_light",
    };

    messenger
        .open(messengerParams)
        .then(() => console.log("Messenger opened"))
        .catch((err) => {
            console.error("OPEN ERROR:", err);
            messenger?.close();
            messenger = null;
        });
};
