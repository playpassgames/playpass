//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import * as playpass from "../../src";

(async () => {
    await playpass.init({
        gameId: "kitchen-sink",
        stripeAccount: "acct_1KmOYpRSkLu3gu7q",
    });

    const linkData = playpass.getLinkData();
    const leaderboard = playpass.leaderboards.getLeaderboard("test");

    let demoGroupIds = await playpass.storage.get("demoGroupIds") || [];
    if (linkData?.groupInvites) {
        console.log("Adding groups from invite link:", linkData.groupInvites);
        demoGroupIds = [...new Set(demoGroupIds.concat(linkData.groupInvites))];
        playpass.storage.set("demoGroupIds", demoGroupIds);
    }

    async function updateUI () {
        document.querySelector("#getPlayerId").textContent = playpass.account.getPlayerId();
        document.querySelector("#isLoggedIn").textContent = playpass.account.isLoggedIn();
        document.querySelector("#getLinkData").textContent = JSON.stringify(playpass.getLinkData());
        document.querySelector("#getCounter").textContent = await playpass.storage.get("counter") || "unset";
        document.querySelector("#currentSub").textContent = playpass.account.isLoggedIn() ? await playpass.payments.getSubscription() || "null" : "null";

        const groupsInfo = [];
        for (const groupId of demoGroupIds) {
            const group = await playpass.groups.getGroup(groupId);
            const testData = await group.storage.get("testData") || [];
            groupsInfo.push(`Group ${groupId} [players=${group.players.size}, storage=${testData.join("")}]`);
        }
        document.querySelector("#groupsInfo").textContent = groupsInfo.join("\n");

        const leaderboardBody = document.querySelector("#leaderboardBody");
        leaderboardBody.textContent = "";
        for (const record of await leaderboard.listRecords()) {
            const tr = document.createElement("tr");

            const rank = document.createElement("td");
            rank.textContent = ""+record.rank;
            tr.appendChild(rank);

            const name = document.createElement("td");
            name.textContent = record.profileData?.name || "Anonymous";
            tr.appendChild(name);

            const score = document.createElement("td");
            score.textContent = ""+record.score;
            tr.appendChild(score);

            leaderboardBody.appendChild(tr);
        }
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
        if (await playpass.account.login()) {
            // Update our demo groups cache
            demoGroupIds = await playpass.storage.get("demoGroupIds") || [];
        }
        updateUI();
    };

    document.querySelector("#logout").onclick = () => {
        playpass.account.logout();
        updateUI();
    };

    function shareWithType (type) {
        const link = playpass.createLink({ data: 1234 });
        playpass.share({ text: `This is a test share: ${link}`, type });
    }
    document.querySelector("#share").onclick = () => shareWithType(null);
    document.querySelector("#share-facebook").onclick = () => shareWithType("facebook");
    document.querySelector("#share-twitter").onclick = () => shareWithType("twitter");
    document.querySelector("#share-whatsapp").onclick = () => shareWithType("whatsapp");
    document.querySelector("#share-telegram").onclick = () => shareWithType("telegram");
    document.querySelector("#share-clipboard").onclick = () => shareWithType("clipboard");

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

    document.querySelector("#createGroup").onclick = async () => {
        const group = await playpass.groups.createGroup();
        demoGroupIds.push(group.groupId);
        playpass.storage.set("demoGroupIds", demoGroupIds);
        updateUI();
    };

    document.querySelector("#shareGroups").onclick = async () => {
        if (demoGroupIds.length) {
            const link = playpass.createLink({
                data: { groupInvites: demoGroupIds },
            });
            playpass.share({
                text: `Join my ${demoGroupIds.length} test groups! ${link}`,
            });
        }
    };

    document.querySelector("#forgetGroups").onclick = async () => {
        demoGroupIds.length = 0;
        playpass.storage.set("demoGroupIds", demoGroupIds);
        updateUI();
    };

    document.querySelector("#setGroupData").onclick = async () => {
        for (const groupId of await playpass.storage.get("demoGroupIds")) {
            const group = await playpass.groups.getGroup(groupId);
            const testData = await group.storage.get("testData") || [];
            testData.push(String.fromCharCode(65 + 26*Math.random() >>> 0));
            group.storage.set("testData", testData);
        }
        updateUI();
    };

    document.querySelector("#setLeaderboardProfile").onclick = async () => {
        const name = prompt("What is your name, bold kitchen sink tester?");
        if (name) {
            playpass.leaderboards.setProfileData({ name });
        }
    };
    document.querySelector("#submitLeaderboardScore").onclick = async () => {
        const score = parseFloat(prompt("Score to submit?"));
        if (score) {
            leaderboard.submitScore(score);
        }
    };
})();

