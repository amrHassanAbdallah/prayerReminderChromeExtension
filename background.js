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
    chrome.browserAction.setBadgeText({text: '' + remainingMinutes});
}

updateBackground()
setInterval(updateBackground, 60 * 1000)