// background.js
importScripts('./common.js');

chrome.runtime.onInstalled.addListener(() => {
    // Schedule the alarm to trigger every 1 minute (adjust the delay as needed)
    chrome.alarms.create("badgeUpdateAlarm", { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === "badgeUpdateAlarm") {
        // Call your function to update the badge here
        console.log("updating the badge........")
        updateBadge();
    }
});


async function checkIfCacheNeedsToBeUpdated() {
    //get the current cache time
    let prayerTimesForDay = await getValueFromStorage(Config.prayersDay)
    let selectedLocation = await getValueFromStorage(Config.selectedLocation)
    console.log(selectedLocation, prayerTimesForDay, "check the cache")
    // if it's not set or not today
    var date = getTodayDate()
    if (selectedLocation && prayerTimesForDay != date) {
        await getTheTimes(selectedLocation)
    }
}

const Colors = {
    Green: [60, 179, 113, 255],
    Yellow: [255, 165, 0, 255],
    Red: [255, 0, 0, 255],
};


function setBadge(color, time){
    chrome.action.setBadgeText({ text: '' + time });
    if (color){
        chrome.action.setBadgeBackgroundColor({ color: color });
    }
}

async function updateBadge() {
    console.log("inside the update background",chrome.browserAction)
    await checkIfCacheNeedsToBeUpdated()
    let {nextPrayerTime, nextPrayerName, remainingMinutes} = await getTheNextPrayer();
    if (remainingMinutes <= 60){
        let color;
        switch (true) {
            case remainingMinutes >= 40:
                color = Colors.Green
                break;
            case remainingMinutes >= 20:
                color = Colors.Yellow
                break;
            default:
                color = Colors.Red
        }
        setBadge(color, remainingMinutes)
    }else{
        setBadge(null,"")
    }

}

updateBadge()