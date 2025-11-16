// DOM Elements
const startScreen = document.getElementById("start-screen");
const predictionScreen = document.getElementById("predict-screen"); 
const predictPriceButton = document.getElementById("predict-btn");
const predictAnother = document.getElementById("predict-another-btn");
const cityDropdown = document.querySelector("#city");
const districtDropdown = document.querySelector("#district");
const propertyTypeDropdown = document.querySelector("#property-type");
const areaTextarea = document.querySelector("#size");
const result = document.querySelector("#result");
const resultSummary = document.querySelector("#property-summary");
const predictedPriceDiv = document.querySelector("#prediction-result");

const baseUrl = `${window.location.protocol}//${window.location.host}`;

// Event Listeners
window.addEventListener("DOMContentLoaded", () => {
    onPageLoad();
    predictPriceButton.addEventListener("click", onClickedPredictPrice);
    predictAnother.addEventListener("click", restartApp);
})

// Get selected radio button value by name
function getSelectedValue(name) {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    return selected ? parseInt(selected.value, 10) : -1;
}

// Clear selections on radio buttons
function clearRadioButtons(name) {
    document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
        radio.checked = false;
    });
}

// Delay execution by ms
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function onClickedPredictPrice() {
    // Gather input values
    const area = parseFloat(areaTextarea.value);
    const bathrooms = getSelectedValue("bathrooms-select");
    const bedrooms = getSelectedValue("bedrooms-select");
    const property_type = propertyTypeDropdown.value;
    const district = districtDropdown.value;
    const city = cityDropdown.value;

    // prevent double clicking
    predictPriceButton.disabled = true;
    predictPriceButton.classList.add("btn-loading");
    // simple loading message
    result.innerHTML = `<p>Predicting...</p>`;
    // Artifical delay
    await delay(500);

    // Manual Validation
    if (!area || area <= 0 || bedrooms === -1 || bathrooms === -1 || !property_type || !district || !city) {
        result.innerHTML = `<p style="color:red;">Please fill in all required fields</p>`;
        predictPriceButton.disabled = false;
        predictPriceButton.classList.remove("btn-loading");
        return;
    }
    
    // Prepare request parameters
    const params = new URLSearchParams({
        area: area,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        property_type: property_type,
        district: district,
        city: city
    });
    
    const url = `${baseUrl}/pricePrediction?${params.toString()}`

    try {
        // send request to backend
        const response = await fetch(url);
        const data = await response.json();

        // switch from start to prediction screen
        startScreen.classList.remove("active");
        predictionScreen.classList.add("active");

        // format the prediction
        let predicted_price = Math.round(data.predicted_price);
        let formatted_result = predicted_price.toLocaleString();

        // Display property summary for which prediction is made
        resultSummary.innerHTML = `
            <p>Property Summary</p>
            <div class="row">
               <span class="label">City:</span>
               <span class="value">${city}</span>
            </div>

            <div class="row">
               <span class="label">District:</span>
               <span class="value">${district}</span>
            </div>

            <div class="row">
               <span class="label">Property Type:</span>
               <span class="value">${property_type}</span>
            </div>

            <div class="row">
               <span class="label">Bedrooms:</span>
               <span class="value">${bedrooms}</span>
            </div>

            <div class="row">
               <span class="label">Bathrooms:</span>
               <span class="value">${bathrooms}</span>
            </div>

             <div class="row">
               <span class="label">Area:</span>
               <span class="value">${area}</span>
            </div>
        `;

        // Display predicted rent
        predictedPriceDiv.innerHTML = `
            <div class="row">
               <span class="label-predicted">Estimated Rent (QAR):</span>
               <span class="predicted-price"> ${formatted_result}</span>
            </div>
        `;

    } catch (error) {
        result.innerHTML = `<h2>Error: ${error}<h2/>`;
    }
    predictPriceButton.disabled = false;
    predictPriceButton.classList.remove("btn-loading");
}

async function onPageLoad() {
    const citiesUrl = `${baseUrl}/cities`;
    const propertyTypesUrl = `${baseUrl}/property_types`;
    const propertyTypeSelect = document.querySelector("#property-type");
    const citySelect = document.querySelector("#city");
    const districtSelect = document.querySelector("#district");

    // Load Property Types
    try {
        const response = await fetch(propertyTypesUrl);
        const data = await response.json();

        if (Array.isArray(data.property_types)) {
            // clear any options if any
            propertyTypeSelect.innerHTML = "";

            // Add Default Option
            const defaultOption = new Option("-- Select Property Type --", "", true, true);
            defaultOption.disabled = true;
            propertyTypeSelect.appendChild(defaultOption);

            // Add returned property types
            data.property_types.forEach(propertyType => {
                const option = new Option(propertyType, propertyType);
                propertyTypeSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error Loading Property Types:", error)
    }

    // Load Cities
    try {
        const response = await fetch(citiesUrl);
        const data = await response.json();

        if (data?.cities) {
            citySelect.innerHTML = "";

            // Default Option
            const defaultOption = document.createElement("option");
            defaultOption.textContent = "-- Select City --";
            defaultOption.value = "";
            defaultOption.selected = true;
            defaultOption.disabled = true;
            citySelect.appendChild(defaultOption);

            // Populate cities
            data.cities.forEach(city => {
                 const option = document.createElement("option");
                 option.textContent = city;
                 option.value = city;
                 citySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error Loading Cities:", error)
    }

    // clear any districts if any and add default option
    districtSelect.innerHTML = "";
    const defaultOption = new Option("-- Select District --", "", true, true);
    defaultOption.disabled = true;
    districtSelect.appendChild(defaultOption);

    // Load districts based on selected city
    citySelect.addEventListener("change", async () => {
        const selectedCity = citySelect.value;
        if (!selectedCity) return;
         try {
            districtSelect.innerHTML = `<option>Loading....</option>`;
            const districtsUrl = `${baseUrl}/districts/${selectedCity}`;
            const response = await fetch(districtsUrl);
            const data = await response.json();
            const key = `${selectedCity}_districts`;
            const districts = data[key];
            districtSelect.innerHTML = "";            
            

            if(Array.isArray(districts)) {
                // add default option
                const defaultOption = document.createElement("option");
                defaultOption.textContent = "-- Select District --";
                defaultOption.value = "";
                defaultOption.disabled = true;
                defaultOption.selected = true;
                districtSelect.append(defaultOption);

                // populate districts
                districts.forEach(district => {
                    const option = document.createElement("option");
                    option.textContent = district;
                    option.value = district;
                    districtSelect.append(option);
                })
            }
        }
        catch (error) {
            console.error("Error Loading Districts:", error)
        }
    })
}

// reset app to restart screen
function restartApp() {
    // clear text area and dropdowns and any other display tags
    areaTextarea.value = "";
    propertyTypeDropdown.selectedIndex = 0;
    districtDropdown.selectedIndex = 0;
    cityDropdown.selectedIndex = 0;
    result.innerHTML = "";
    
    // reset the predict price button
    predictPriceButton.classList.remove("btn-loading");

    //clear radio buttons
    clearRadioButtons("bathrooms-select");
    clearRadioButtons("bedrooms-select");

    // switch screen
    predictionScreen.classList.remove("active");
    startScreen.classList.add("active");
}