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
function updateRemainingTime() {
    // Get the current time in milliseconds since epoch
    const now = new Date().getTime();

    // Find the next prayer time after the current time
    let nextPrayerTime = null
    let prayerTimes = {
        "Fajr": "04:55",
        "Sunrise": "06:22",
        "Dhuhr": "12:06",
        "Asr": "15:22",
        "Sunset": "17:50",
        "Maghrib": "17:50",
        "Isha": "19:20",
        "Imsak": "04:45",
        "Midnight": "00:06",
        "Firstthird": "22:01",
        "Lastthird": "02:11"
    };
    for (let prayer in prayerTimes) {
        const prayerTime = new Date();
        const [hours, minutes] = prayerTimes[prayer].split(":");
        prayerTime.setHours(hours, minutes);
        if (prayerTime.getTime() > now) {
            nextPrayerTime = prayerTime;
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

    // Update the HTML page with the remaining minutes
    const remainingTimeElement = document.getElementById("remaining-time");
    remainingTimeElement.innerText = `${remainingMinutes} minutes`;
    document.getElementById('next-prayer-time').innerText = `(${nextPrayerTime.toLocaleTimeString()})`
}

function fillTheCitySelector() {
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

function handleCitySelectorChange(e) {
    console.log("hamda", e.target.value)
    chrome.storage.local.set({selectedValue: e.target.value}, function() {
        console.log('Value stored in local storage');
    });
    getTheTimes(e.value)


}

window.onload = function () {
    updateRemainingTime();
    setInterval(updateRemainingTime, 60 * 1000);

    fillTheCitySelector();
    chrome.storage.local.get(['selectedValue'], function(result) {
        console.log('Value retrieved from local storage:', result.selectedValue);
        document.getElementById("temp-holder").innerText = result.selectedValue
    });
    document.getElementById('cities-selector').onchange = (event)=>{
        console.log("yoooooooooooooooo",event, event.target.value)
        handleCitySelectorChange(event)
    }

}

function getTheTimes(location) {
    let [city, country] = location.split(", ")
    let url = `https://api.aladhan.com/v1/timingsByCity/${getTimingsByCity()}?city=${city}&country=${location}&method=8`
    console.log(url)
    fetch(url).then((response) => response.json())
        .then((result) => {
            console.log("Success:", result);
            console.log(JSON.stringify(result.data.timings))
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