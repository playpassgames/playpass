//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import { replicantClient } from "./login";
import { getStripeAccount, requireInit } from "./init";

import "./ui/payment-popup";

let cachedSubscription: string | null;

// Keep track of the promise in order to support multiple simultaneous requests to login()
let pendingPayment: Promise<boolean> | undefined;

const stripeAPIKeyTest = "pk_test_51Kgx88IODOcOCMETY5iw5NRriwKv0BihFqKZ8Atq8BQnAjLDoNakwSUHUjywoifuqbNYdycwVGnqEY3lmSg9ZLz700mAmQlXWS";
// const stripeAPIKeyProd = "pk_live_51Kgx88IODOcOCMETe3MPWhuJWetIdA4dHAYFqCB0vic4EfrxqlTYiwtQNK20lxOQBeaXZ2Z7muRHaBD8NR4KbsT500xZNpdob3";

let stripeScriptLoad: Promise<void> | undefined;

/**
 * Called after login, fetches and caches the subscription data
 */
export async function initSubscriptionCache() {
    cachedSubscription = await replicantClient!.subscriptions.getSubscription();
}

/**
 * Called after logout
 */
export function clearSubscriptionCache() {
    cachedSubscription = null;
}

/**
 * Kicks off the puchase flow for a subscription or in-app purchase item.
 * @param purchaseId - identifies a subscription or an in-app purchase item (i.e. coins)
 * @returns - boolean indicating whether or not the purchase flow was successfully completed
 * @throws Error if player has an existing subscription
 */
export async function purchase(purchaseId: string): Promise<boolean> {
    requireInit("playpass.payments.purchase");
    if (cachedSubscription == purchaseId) {
        throw new Error("Player has an existing subscription!");
    }

    // Set your publishable key: remember to change this to your live publishable key in production
    // See your keys here: https://dashboard.stripe.com/apikeys
    const stripeAccount = getStripeAccount();

    // Lazy load stripe.js
    if (!stripeScriptLoad) {
        stripeScriptLoad = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.setAttribute("src", "https://js.stripe.com/v3/");
            script.setAttribute("crossorigin", "anonymous");
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Unable to load Stripe"));
            document.head.appendChild(script);
        });
    }
    await stripeScriptLoad;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stripe = (window as any).Stripe(
        stripeAPIKeyTest,
        stripeAccount ? { stripeAccount } : {},
    );

    const { clientSecret, completeSubscription } = await replicantClient!.subscriptions.initiateSubscription(purchaseId);

    // Set up Stripe.js and Elements to use in checkout form, passing the client secret obtained in step 5
    const elements = stripe.elements({ clientSecret });

    // Create an HTML element containing the stripe UI
    const stripeDiv = document.createElement("div");
    elements.create("payment").mount(stripeDiv);

    const paymentPopup = document.createElement("playpass-pay");
    paymentPopup.appendChild(stripeDiv);
    document.body.appendChild(paymentPopup);

    // Kick off payment flow, reuse a previous request to purchase() if still pending
    pendingPayment = pendingPayment ?? new Promise(resolve => {
        paymentPopup.setAbortOnClose(true);

        paymentPopup.onAbort = () => {
            resolve(false);
        };

        // This block confirms payment and updates UI accordingly
        paymentPopup.onPaymentSubmitted = async () => {
            try {
                const { error } = await stripe.confirmPayment({
                    elements,
                    redirect: "if_required",
                });
            
                if (error) {
                    paymentPopup.setLoading(false);
                } else {
                    await completeSubscription();
                    paymentPopup.setSubscribed();
                    paymentPopup.setAbortOnClose(false);
                    resolve(true);
                }
            } catch (error) {
                paymentPopup.setErrorMessage("Sorry, something went wrong during payment. Please try again.");
                paymentPopup.setLoading(false);
            }
        };
    });

    const result = await pendingPayment;
    pendingPayment = undefined;
    if (result) {
        cachedSubscription = purchaseId;
    }        
    
    return result;
}

/**
 * Cancel a user's existing subscription
 * @param productId - productId of desired subscription
 * @throws Error on player not having an existing subscription 
 */
export async function cancelSubscription(productId: string): Promise<void> {
    requireInit("playpass.payments.cancelSubscription");

    if (!productId || cachedSubscription != productId) {
        throw new Error("Player does not have an existing subscription!");
    }
    
    await replicantClient!.subscriptions.cancelSubscription();
    clearSubscriptionCache();
}

export async function getSubscription(): Promise<string | null> {
    return await replicantClient!.subscriptions.getSubscription();
}

/**
 *  
 * @param purchaseId - identifies a subscription
 * @returns - boolean indicating whether or not the user has purchased the subscription
 */
export function hasSubscription(purchaseId: string): boolean {
    return cachedSubscription === purchaseId;
}
