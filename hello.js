const Config = {
    prayerTimes: "prayerTimes",
    selectedLocation: "selectedValue",
    prayerTimesForDay: "prayerTimesForDay",
};

async function getPrayerTimes() {
    return await getValueFromStorage("prayerTimes") || []
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
            await set(Config.prayerTimes, times)
            await set(Config.prayerTimesForDay, getTodayDate())
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
    if (nextPrayerTime == null && prayerTimes.length > 0) {
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

/// Rest

let supportedLocations = {
    "Africa": ["Algiers, Algeria", "Capetown, South Africa", "Casablanca, Morocco", "Fez, Morocco", "Johannesburg, South Africa", "Lagos, Nigeria", "Marrakech, Morocco", "Rabat, Morocco", "Tunis, Tunisia"],
    "Asia": ["Astana, Kazakhstan", "Beijing, China", "Chennai, India", "Colombo, Sri Lanka", "Dhaka, Bangladesh", "Hong Kong, China", "Islamabad, Pakistan", "Jakarta, Indonesia", "Kabul, Afghanistan", "Karachi, Pakistan", "Lahore, Pakistan", "Makhachkala, Dagestan", "Mumbai, India", "New Dellhi, India", "Samarkand, Uzbekistan", "Seoul, South Korea", "Shanghai, China", "Singapore", "Taipei, Taiwan", "Tashkent, Uzbekistan", "Tokyo, Japan", "Ulaanbaatar, Mongolia"],
    "Australia": ["Adelaide, Australia", "Auckland, New Zealand", "Brisbane, Australia", "Darwin, Australia", "Perth, Australia", "Sydney, Australia", "Tasmania, Australia"],
    "Europe": ["Amsterdam, Netherlands", "Belfast, Northern Ireland", "Berlin, Germany", "Birmingham, UK", "Brussels, Belgium", "Bucharest, Romania", "Budapest, Hungary", "Cordoba, Spain", "Dublin, Ireland", "Edinburgh, UK", "Frankfurt, Germany", "Glasgow, UK", "Helsinki, Finland", "Lisbon, Portugal", "London, UK", "Madrid, Spain", "Manchester, UK", "Milan, Italy", "Moscow, Russia", "Munich, Germany", "Naples, Italy", "Oslo, Norway", "Paris, France", "Prague, Czech Republic", "Pristina, Kosovo", "Rome, Italy", "Sarajevo, Bosnia and Herzegovina", "Sofia, Bulgaria", "Stockholm, Sweden", "Tirana, Albania", "Valencia, Spain", "Vienna, Austria", "Zurich, Switzerland"],
    "Middle East": ["Makkah, Saudi Arabia", "Madinah, Saudi Arabia", "Riyadh, Saudi Arabia", "Dubai, UAE", "Abu Dhabi, UAE", "Sharjah, UAE", "Ajman, UAE", "Ras Al Khaimah, UAE", "Umm Al Quwain, UAE", "Muscat, Oman", "Damascus, Syria", "Aleppo, Syria", "Baghdad, Iraq", "Mosul, Iraq", "Tehran, Iran", "Isfahan, Iran", "Istanbul, Turkey", "Konya, Turkey", "Cairo, Egypt", "Alexandria, Egypt", "Aden, Yemen", "Sanaa, Yemen", "Jerusalem, Palestine"],
    "North America": ["Chicago, IL, USA", "Denver, CO, USA", "Edmonton, Canada", "Halifax, Canada", "Havana, Cuba", "Honolulu, Hawaii", "Houston, TX, USA", "Los Angeles, CA, USA", "Montreal, Canada", "New York, NY, USA", "Regina, Canada", "Toronto, Canada", "Vancouver, Canada"],
    "South America": ["Buenos Aires, Argentina", "Caracas, Venezuela", "Lima, Peru", "Mexico City, Mexico", "Santiago, Chile", "Sao Paulo, Brazil"]
}



//
async function updateRemainingTime() {
    // Get the current time in milliseconds since epoch
    let {nextPrayerTime, nextPrayerName, remainingMinutes} = await getTheNextPrayer();
    // Update the HTML page with the remaining minutes
    const remainingTimeElement = document.getElementById("remaining-time");
    remainingTimeElement.innerText = `${remainingMinutes} minutes`;
    document.getElementById('next-prayer-time').innerText = `(${nextPrayerTime.toLocaleTimeString()})`
    document.getElementById('next-prayer-name').innerText = `(${nextPrayerName})`
}

async function fillTheCitySelector() {
    const selector = document.getElementById("cities-selector")
    let selectorContent = `<option>Nothing selected</option>`
    for (let group in supportedLocations) {
        let options = ``
        for (let city of supportedLocations[group]) {
            options += `<option value="${city}">${city}</option>`
        }
        selectorContent += `<optgroup label="${group}">${options}</optgroup>`
    }
    selector.innerHTML = selectorContent

}

async function handleCitySelectorChange(e) {
    const value = e.target.value
    console.log("hamda", value)
    chrome.storage.local.set({selectedValue: value}, function () {
        console.log('Value stored in local storage');
    });
    await getTheTimes(value)
    await setThelocationIfSelected()
    await fillPrayersTimings()
    await updateRemainingTime()
}


async function setThelocationIfSelected() {
    const location = await getValueFromStorage(Config.selectedLocation)
    if (location){
        document.querySelector('[data-id="cities-selector"] span').innerText = location

    }
}

async function fillPrayersTimings() {
    const tbody = document.querySelector('#prayerTimingsTable tbody')
    let tempHolder = ``
    const prayerTimings = await getPrayerTimes()
    for (let prayer of prayerTimings){
        tempHolder += `<tr>
            <td>${prayer.name}</td>
            <td>${prayer.timing}</td>
        </tr>`
    }
    tbody.innerHTML = tempHolder
}

window.onload = function () {


    fillTheCitySelector();
    setThelocationIfSelected();
    fillPrayersTimings();
    updateRemainingTime();
    setInterval(updateRemainingTime, 60 * 100);
    setInterval(updateBadge, 60 * 100);
    document.getElementById('cities-selector').onchange = (event)=>{
        console.log("yoooooooooooooooo",event, event.target.value)
        handleCitySelectorChange(event)
    }

}
async function checkIfCacheNeedsToBeUpdated() {
    //get the current cache time
    let prayerTimesForDay = await getValueFromStorage(Config.prayerTimesForDay)
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
    chrome.action.setBadgeBackgroundColor({ color: color });
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
    }

}

updateBadge()
setInterval(updateBadge, 60 * 100);
