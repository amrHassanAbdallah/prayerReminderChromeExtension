const Config = {
    prayerTimesData: "prayerTimes",
    selectedLocation: "selectedValue",
    prayersDay: "prayerTimesForDay",
};

async function getPrayerTimes() {
    return await getValueFromStorage(Config.prayerTimesData) || []
}

function getValueFromStorage(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, function (result) {
            console.log(key + ' retrieved from local storage:', result[key], result);
            resolve(result[key]);
        });
    })
}

async function set(key, value) {
    return new Promise((resolve, reject) => {
        let result = {}
        result[key] = value;
        chrome.storage.local.set(result, function () {
            console.log(key + ' stored in local storage');
            resolve()
        });
    })
}

async function getTheTimes(location) {
    let [city, country] = location.split(", ")
    let url = `https://api.aladhan.com/v1/timingsByCity/${getTimingsByCity()}?city=${city}&country=${location}&method=8`
    console.log(url)
    fetch(url).then((response) => response.json())
        .then(async (result) => {
            console.log("Success:", result);
            console.log(JSON.stringify(result.data.timings))
            let times = [];
            for (let prayer in result.data.timings) {
                times.push({
                    name: prayer,
                    timing: result.data.timings[prayer]
                })
            }
            times.sort((a, b) => a.timing > b.timing)
            console.log(times, "yoooooo the sorted data")
            await set(Config.prayerTimesData, times)
            await set(Config.prayersDay, getTodayDate())
        })
}

function getTimingsByCity() {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    return dd + '-' + mm + '-' + yyyy;
}

async function getTheNextPrayer() {
    const now = new Date().getTime();

    // Find the next prayer time after the current time
    let nextPrayerTime = null
    let nextPrayerName = null
    let prayerTimes = await getPrayerTimes();
    for (let prayer of prayerTimes) {
        const prayerTime = new Date();
        const [hours, minutes] = prayer.timing.split(":");
        prayerTime.setHours(hours, minutes);
        if (prayerTime.getTime() > now) {
            nextPrayerTime = prayerTime;
            nextPrayerName = prayer.name
            break;
        }
    }
    if (nextPrayerTime == null) {
        const prayerTime = new Date(new Date().getTime() + (24 * 60 * 60 * 1000));
        const [hours, minutes] = prayerTimes[0].split(":");
        prayerTime.setHours(hours, minutes);
        nextPrayerTime = prayerTime;
        console.log(prayerTime, nextPrayerTime)
    }


    // Calculate the time remaining till the next prayer
    const remainingMinutes = Math.round((nextPrayerTime.getTime() - now) / (1000 * 60));
    return {nextPrayerTime, nextPrayerName, remainingMinutes};
}

function getTodayDate() {
    let nowDate = new Date()
    return nowDate.getFullYear() + '/' + (nowDate.getMonth() + 1) + '/' + nowDate.getDate()
}