import { replicantClient } from "./login";

export const chatbots = {
  isSubscribed: () => {
    return replicantClient!.chatbotSubscriptions.isSubscribed();
  },
  subscribeToSms: (consentText: string) => {
    return replicantClient!.chatbotSubscriptions.subscribeSms(consentText);
  },
};
