import pandas as pd
import pickle
import json
import os

def load_model_info():
    # determining the path where the model info file is located
    path = os.path.dirname(__file__)
    path = os.path.join(path, "..", "model", "model_info.json")
    path = os.path.abspath(path)

    # open model_info json file and read its contents
    with open(path) as f:
        model_info = json.load(f)

    # Returning dict containing model metadata
    return model_info

def load_model():
    # determining the path where the model file is located
    path = os.path.dirname(__file__)
    path = os.path.join(path, "..", "model", "qatar_rental_price_model.pickle")
    path = os.path.abspath(path)

    # open the model file in binary read mode "rb"
    with open(path, "rb") as m:
        model = pickle.load(m)

    # Returning the loaded model
    return model

def get_model_predictors():
    # extract features list
    features = list(load_model_info()['features'])
    # return the list of predictor variables
    return features

def get_property_types():
    # Extract and return the list of property types
    property_types = list(load_model_info()['property_types'])
    return property_types

def get_cities():
    # Define capital city manually so that it is placed first
    capital_city = "Doha"
    # extract the list of cities
    cities = list(load_model_info()['cities'].keys())
    # remove the capital city from its position and reinserted at the beginning
    cities.remove(capital_city)
    cities.insert(0, capital_city)
    # return the list of cities
    return cities

def get_districts(city):
    # get the dict of cities
    cities = load_model_info()['cities']
    # check if input city exists in the list of model cities
    if city in cities:
        # Extract and return the list of districts associated with the city
        districts = list(cities[city]['districts'])
        return districts
    else:
        # if the city is not found in the model cities, return none
        return None

def predict_rent_price(area, bedrooms, bathrooms,
                       property_type, district, city):
    # Load model and features of the model
    model = load_model()
    features = get_model_predictors()

    # Convert categorical input into their one-hot encoded cols
    property_type = f'property_type_{property_type}'
    district = f'district_{district}'
    city = f'city_{city}'

    # Create a dict of features containing only zeros
    obs_dict = {feature: [0] for feature in features}

    # Assign numerical values
    obs_dict['area'][0] = area
    obs_dict['bedrooms'][0] = bedrooms
    obs_dict['bathrooms'][0] = bathrooms

    # For input categorical variables, set its value to one if it is found
    for cat_feature in [property_type, district, city]:
        if cat_feature in obs_dict:
            obs_dict[cat_feature][0] = 1

    # Convert dict into pandas dataframe and generate prediction using the model
    df_obs = pd.DataFrame(obs_dict)
    predicted_price = model.predict(df_obs).round(2)[0]

    # Return final predicted price
    return predicted_price