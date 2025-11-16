from flask import Flask, render_template, request, jsonify
from PricePrediction.price_prediction import predict_rent_price, get_property_types, get_districts, get_cities

# Create flask application
app = Flask("Qatar Rental Price Prediction")

# Fetch Property Types
@app.route("/property_types")
def fetch_property_types():
    property_types = get_property_types()
    return jsonify({"property_types": property_types})

# Fetch Districts by City
@app.route("/districts/<city>", methods=['GET'])
def fetch_districts(city):
    districts = get_districts(city)
    # if no districts are found, return a 404 error
    if districts is None:
        return jsonify({"error": f"{city} does not exist in the database!"}), 404
    # Default: return districts as JSON
    return jsonify({f"{city}_districts": districts})

# Fetch Cities
@app.route("/cities")
def fetch_cities():
    cities = get_cities()
    return jsonify({"cities": cities})

# Predict rent price
@app.route("/pricePrediction", methods=['GET'])
def predict_price():
    # extract numeric parameters from query string
    area_str = request.args.get('area')
    bedrooms_str = request.args.get('bedrooms')
    bathrooms_str = request.args.get('bathrooms')

    # Validate numeric parameters
    if not area_str or not bedrooms_str or not bathrooms_str:
        return jsonify({"error": "Missing required numeric parameters: area, bedrooms, bathrooms"}), 400

    try:
        area = float(area_str)
        bedrooms = int(bedrooms_str)
        bathrooms = int(bathrooms_str)
    except ValueError:
        return jsonify({"error": "Invalid number format for area, bedrooms, bathrooms"}), 400

    # Extract Categorical parameters and assign default values if they are not provided
    property_type = request.args.get('property_type', 'Unknown')
    district = request.args.get('district', 'Unknown')
    city = request.args.get('city', 'Unknown')

    # Estimate rent price using the prediction model
    predicted_price = predict_rent_price(
        area=area,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
        property_type=property_type,
        district=district,
        city=city
    )

    # Return predicted price as JSON
    return jsonify({"predicted_price": predicted_price})

# Render home page
@app.route("/")
def render_index_page():
    return render_template('index.html')

# App entry point
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)