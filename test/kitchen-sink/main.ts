//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import * as playpass from "../../src";

(async () => {
    await playpass.init({
        projectId: "kitchen-sink",
        stripeAccount: "acct_1KmOYpRSkLu3gu7q",
    });

    async function updateUI () {
        // document.querySelector("#getPlayerId").textContent = playpass.getPlayerId();
        document.querySelector("#isLoggedIn").textContent = playpass.account.isLoggedIn();
        document.querySelector("#getLinkData").textContent = JSON.stringify(playpass.getLinkData());
        document.querySelector("#getCounter").textContent = await playpass.storage.get("counter") || "unset";
        document.querySelector("#currentSub").textContent = playpass.account.isLoggedIn() ? await playpass.payments.getSubscription() || "null" : "null";
    }
    updateUI();

    document.querySelector("#incrementCounter").onclick = async () => {
        const counter = await playpass.storage.get("counter") || 0;
        await playpass.storage.set("counter", counter+1);
        updateUI();
    };

    document.querySelector("#removeCounter").onclick = async () => {
        await playpass.storage.remove("counter");
        updateUI();
    };

    document.querySelector("#login").onclick = async () => {
        console.log("playpass.account.login", await playpass.account.login());
        updateUI();
    };

    document.querySelector("#logout").onclick = () => {
        playpass.account.logout();
        updateUI();
    };

    document.querySelector("#share").onclick = () => {
        const link = playpass.createLink({ data: 1234 });
        playpass.share({ text: `This is a test share: ${link}` });
    };

    document.querySelector("#subscribe").onclick = async () => {
        try {
            await playpass.payments.purchase(document.getElementById("productId").value);
        } catch (error) {
            alert(error.message);
        }
        updateUI();
    };

    document.querySelector("#cancelSub").onclick = async () => {
        try {
            await playpass.payments.cancelSubscription(await playpass.payments.getSubscription());
        } catch (error) {
            alert(error.message);
        }
        updateUI();
    };
})();

