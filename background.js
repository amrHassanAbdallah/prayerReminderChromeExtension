async function checkIfCacheNeedsToBeUpdated() {
    //get the current cache time
    let prayerTimesForDay = await getValueFromStorage(Config.prayerTimesForDay)
    let selectedLocation = await getValueFromStorage(Config.selectedLocation)
    console.log(selectedLocation, prayerTimesForDay, "check the cache")
    // if it's not set or not today
    var nowDate = new Date();
    var date = nowDate.getFullYear() + '/' + (nowDate.getMonth() + 1) + '/' + nowDate.getDate();
    if (selectedLocation && prayerTimesForDay != date) {
        await getTheTimes(selectedLocation)
    }
}

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
setInterval(updateBackground, 60 * 1000)