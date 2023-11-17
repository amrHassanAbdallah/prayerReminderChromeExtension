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

function handleCitySelectorChange(e) {
    const value = e.target.value
    console.log("hamda", value)
    chrome.storage.local.set({selectedValue: value}, function() {
        console.log('Value stored in local storage');
    });
    getTheTimes(value)
    updateRemainingTime()
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
    updateRemainingTime();
    setInterval(updateRemainingTime, 60 * 1000);

    fillTheCitySelector();
    setThelocationIfSelected();
    fillPrayersTimings();

    document.getElementById('cities-selector').onchange = (event)=>{
        console.log("yoooooooooooooooo",event, event.target.value)
        handleCitySelectorChange(event)
    }

}

