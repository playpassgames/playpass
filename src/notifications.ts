//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { replicantClient } from "./login";

export const isSubscribed = () => {
    return replicantClient!.chatbotSubscriptions.isSubscribed();
    //return false;
};

export const subscribeSms = (consentText: string) => {
    return replicantClient!.chatbotSubscriptions.subscribeSms(consentText);
};

export const unsubscribeSms = () => {
    return replicantClient!.chatbotSubscriptions.unsubscribeSms();
};

export const scheduleNotificationAfter = (opts: {
  millis: number,
  message: string,
  notificationId: string,
}) => {
    return replicantClient!.chatbotSubscriptions.createNotification(opts);
};
