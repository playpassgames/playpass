//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { replicantClient } from "./login";

export const isSubscribed = () => {
    return replicantClient!.chatbotSubscriptions.isSubscribed();
    //return false;
};

export const subscribeToSms = (consentText: string) => {
    return replicantClient!.chatbotSubscriptions.subscribeToSms(consentText);
};

export const scheduleNotificationAfter = (opts: {
  millis: number,
  message: string,
  notificationId: string,
}) => {
    return replicantClient!.chatbotSubscriptions.createNotification(opts);
};
