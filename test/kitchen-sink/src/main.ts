//
// Playpass (c) Playco
// https://github.com/playpassgames/playpass/blob/main/LICENSE.txt

import * as playpass from "../../../src";
import { getReferrer } from "../../../src/device"; // Private API!

(async () => {
    document.querySelector("#bestShareType").textContent = playpass.device.getBestShareType();
    document.querySelector("#userAgent").textContent = navigator.userAgent;
    document.querySelector("#referrer").textContent = getReferrer();
    document.querySelector("#iframed").textContent = (window.top == window) ? "No" : "Yes";

    await playpass.init({
        gameId: "kitchen-sink",
        stripeAccount: "acct_1KmOYpRSkLu3gu7q",
        serviceWorker: "./service-worker.js",
    });

    const linkData = playpass.getLinkData();
    const leaderboard = playpass.leaderboards.getLeaderboard("test");

    let demoGroupIds = await playpass.storage.get("demoGroupIds") || [];
    if (linkData?.groupInvites) {
        console.log("Adding groups from invite link:", linkData.groupInvites);
        demoGroupIds = [...new Set(demoGroupIds.concat(linkData.groupInvites))];
        playpass.storage.set("demoGroupIds", demoGroupIds);
    }

    async function updateLeaderboardUI () {
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

    async function updateUI () {
        updateLeaderboardUI();

        document.querySelector("#getPlayerId").textContent = playpass.account.getPlayerId();
        document.querySelector("#isLoggedIn").textContent = playpass.account.isLoggedIn();
        document.querySelector("#getLinkData").textContent = JSON.stringify(playpass.getLinkData());
        document.querySelector("#getCounter").textContent = await playpass.storage.get("counter") || "unset";
        document.querySelector("#currentSub").textContent = playpass.account.isLoggedIn() ? await playpass.payments.getSubscription() || "null" : "null";
        document.querySelector("#notificationsGetPermissionState").textContent = await playpass.notifications.getPermissionState();
        document.querySelector("#deviceGetInstallState").textContent = playpass.device.getInstallState();

        const groupsInfo = [];
        for (const groupId of demoGroupIds) {
            const group = await playpass.groups.getGroup(groupId);
            const testData = await group.storage.get("testData") || [];
            groupsInfo.push(`Group ${groupId} [players=${group.players.size}, storage=${testData.join("")}]`);
        }
        document.querySelector("#groupsInfo").textContent = groupsInfo.join("\n");
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

    const createLinkOpts: playpass.CreateLinkOptions = {
        data: 1234,
    };

    function shareWithType (type) {
        const link = playpass.createLink(createLinkOpts);
        playpass.share({ text: `This is a test share:\n${link}`, type });
    }

    function shareInReplyTo() {
        const link = playpass.createLink(createLinkOpts);
        const id = document.getElementById("twitter-reply-to").value;
        playpass.share({ text: `This is a test share: ${link}`, type: "twitter", inReplyTo: id});

    }
    document.querySelector("#share").onclick = () => shareWithType(null);
    document.querySelector("#share-facebook").onclick = () => shareWithType("facebook");
    document.querySelector("#share-twitter").onclick = () => shareWithType("twitter");
    document.querySelector("#share-twitter-reply").onclick = () => shareInReplyTo();
    document.querySelector("#share-whatsapp").onclick = () => shareWithType("whatsapp");
    document.querySelector("#share-telegram").onclick = () => shareWithType("telegram");
    document.querySelector("#share-reddit").onclick = () => shareWithType("reddit");
    document.querySelector("#share-sms").onclick = () => shareWithType("sms");
    document.querySelector("#share-clipboard").onclick = () => shareWithType("clipboard");

    document.querySelector("#upload-temporary-image").onclick = async () => {
        const link = document.querySelector("#upload-temporary-image-result") as HTMLAnchorElement;
        link.textContent = "...";

        // Create a smiley face test image with randomized colors
        const canvas = document.createElement("canvas");
        canvas.width = 300;
        canvas.height = 200;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = `rgb(${Math.floor(255*Math.random())},${Math.floor(255*Math.random())},${Math.floor(255*Math.random())})`;
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, canvas.height/2, 0, 2*Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = `rgb(${Math.floor(255*Math.random())},${Math.floor(255*Math.random())},${Math.floor(255*Math.random())})`;
        ctx.arc(0.7*canvas.width/2, 0.7*canvas.height/2, 0.1*canvas.height/2, 0, 2*Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(1.3*canvas.width/2, 0.7*canvas.height/2, 0.1*canvas.height/2, 0, 2*Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(canvas.width/2, 1.5*canvas.height/2, 0.3*canvas.height/2, 0, 2*Math.PI);
        ctx.fill();

        const url = await playpass.uploadTemporaryImage(canvas);
        link.href = url;
        link.textContent = url;

        // Use it for future share tests
        createLinkOpts.title = "This is the title";
        createLinkOpts.description = "Description goes here";
        createLinkOpts.image = url;
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
            await playpass.leaderboards.setProfileData({ name });
            updateLeaderboardUI();
        }
    };
    document.querySelector("#submitLeaderboardScore").onclick = async () => {
        const score = parseFloat(prompt("Score to submit?"));
        if (score) {
            await leaderboard.submitScore(score);
            updateLeaderboardUI();
        }
    };

    document.querySelector("#notificationsRequestPermission").onclick = async () => {
        const granted = await playpass.notifications.requestPermission();
        alert(`playpass.notifications.requestPermission() returned: ${granted}`);
        updateUI();
    };

    document.querySelector("#notificationsSchedule").onclick = async () => {
        playpass.notifications.schedule("test", {
            delay: 2*1000*60,
            title: "Hello world!",
        });
        alert("Scheduled a test notification ~2 minutes from now.");
    };

    document.querySelector("#deviceRequestInstall").onclick = async () => {
        const installed = await playpass.device.requestInstall();
        alert(`playpass.device.requestInstall() returned: ${installed}`);
        updateUI();
    };
})();

