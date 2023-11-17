

async function startAlarm(name, duration) {
    await chrome.alarms.create(name, { delayInMinutes: 0.100 });
}

chrome.alarms.onAlarm.addListener(() => {
    updateBackground()
});


async function updateBackground() {
    await checkIfCacheNeedsToBeUpdated()
    let {nextPrayerTime, nextPrayerName, remainingMinutes} = await getTheNextPrayer();
    if (remainingMinutes <= 60){
        chrome.browserAction.setBadgeText({text: '' + remainingMinutes});
        switch (true) {
            case remainingMinutes >= 40:
                chrome.browserAction.setBadgeBackgroundColor({ color: [60, 179, 113, 255] })
                break
            case remainingMinutes >= 20:
                chrome.browserAction.setBadgeBackgroundColor({ color: [255, 165, 0, 255] })
                break
            default:
                chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] })
                break
        }
    }else{
        chrome.browserAction.setBadgeText({text: ''})
    }
}

updateBackground()