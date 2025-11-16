from PricePrediction.price_prediction import predict_rent_price
import unittest

class TestPricePrediction(unittest.TestCase):
    # Defining a list of test cases
    test_cases = [
        {'test_case': {
        'area': 200,
        'bedrooms': 4,
        'bathrooms': 2,
        'property_type': 'Apartment',
        'district': 'Najma',
        'city': 'Doha',
        'predicted_price': 10366.75
    }},
        {'test_case': {
            'area': 125,
            'bedrooms': 2,
            'bathrooms': 2,
            'property_type': 'Apartment',
            'district': 'The Pearl Island',
            'city': 'Doha',
            'predicted_price': 10444.80
        }},
        {'test_case': {
            'area': 500,
            'bedrooms': 5,
            'bathrooms': 3,
            'property_type': 'Townhouse',
            'district': 'New Doha',
            'city': 'Al Shamal',
            'predicted_price': 15833.87
        }}
    ]

    def test_price_prediction(self):
        """
        * Loop over test cases and call the prediction function
        * Assert that prediction outcome is equal to expected outcome
        """
        for test_case in self.test_cases:
            # extract args for the current test case
            test = test_case['test_case']
            # make prediction using the model given the current args
            predicted_price = predict_rent_price(
                area=test['area'],
                bedrooms=test['bedrooms'],
                bathrooms=test['bathrooms'],
                property_type=test['property_type'],
                district=test['district'],
                city=test['city']
            )
            # Assert predicted price is equal to expected outcome
            self.assertEqual(predicted_price, test['predicted_price'])

# Run the tests when the script is executed directly
if __name__ == "__main__":
    unittest.main()