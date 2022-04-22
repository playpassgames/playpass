# (**Coming Soon**) Purchases

Enable premium game content for your users and make some money while you're at it.

## Stripe Connect (prerequisite, under construction!)

You must have a Stripe Connected account set up through PlayPass.  From there, you will be able to set up products for purchase and give bank info so you can receive payments.  

## Initializing for purchases

Once you have a Stripe Connected account set up, you will have an identifier for that account that looks like `acct_1234ABcdEFgh56IJk`.  Use the `stripeAccount` param in the `playpass.init()` method to enable purchases.

```javascript
// Initialize the Playpass SDK with a Stripe Connected account...
await playpass.init({ stripeAccount: 'acct_1234ABcdEFgh56IJk' });

// Continue with the rest of your game's initialization...
```

Note that `playpass.init()` returns a Promise. We use the `await` JS keyword to wait until the Promise
resolves before continuing.

In order to enable your users to subscribe to a premium offering, you must first set up a subscription product in Stripe.  Your subscription product should have an identifier which looks like `prod_1234ABcdEF5678`.

## Checking for active subscription

```javascript
const isSubscribed = playpass.payments.hasSubscription('prod_1234ABcdEF5678');
```

Alternatively, you can use the `playpass.payments.getSubscription()` method to retrieve the subscriptionId for which a user is currently subscribed to.

```javascript
const subscription = await playpass.payments.getSubscription();
```

## Purchasing a subscription

```javascript
const purchaseResult = await playpass.payments.purchase('prod_1234ABcdEF5678');
```

Your game will display a Stripe payment popup and the user will proceed to enter payment information.  If payment is successful, this method will return true and their subscription status will become active.

## Putting it all together

Ideally, you should first check if a user has an active subscription.  If they do not, give them an option to purchase a subscription.  Once the subscription is active, allow the user to access the premium content tied to the subscription.

```javascript
if (playpass.payments.hasSubscription("premiumPassId")) {
    // Player already bought a subscription, show them the good stuff
    accessToPremiumContent();    
} else {
    // Prompt for a $10.99/month subscription
    const success = await playpass.payments.purchase("premiumPassId");
    
    if (success) {
        // They bought it! hasSubscription("premiumPassId") will return true for the next month
        accessToPremiumContent();
    }
}
```

