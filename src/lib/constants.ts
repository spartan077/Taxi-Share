export const LOCATIONS = ['VIT Vellore', 'Bangalore Airport', 'Chennai Airport'] as const;

export const TAXI_PRICING = {
  "routes": {
    "vit_vellore_to_bangalore_airport": {
      "4-seater": [
        {
          "car": "Wagon R or equivalent",
          "base_price": 6006,
          "discount": 1266,
          "final_price": 4740,
          "toll_included": true,
          "distance_km": 213,
          "max_passengers": 4
        },
        {
          "car": "Toyota Etios or equivalent",
          "base_price": 6108,
          "discount": 1287,
          "final_price": 4821,
          "toll_included": true,
          "distance_km": 213,
          "max_passengers": 4
        }
      ],
      "6-seater": [
        {
          "car": "Ertiga or equivalent",
          "base_price": 9395,
          "discount": 2361,
          "final_price": 7034,
          "toll_included": true,
          "distance_km": 213,
          "max_passengers": 6
        },
        {
          "car": "Toyota Innova",
          "base_price": 14129,
          "discount": 3665,
          "final_price": 10464,
          "toll_included": true,
          "distance_km": 213,
          "max_passengers": 6
        }
      ]
    },
    "bangalore_airport_to_vit_vellore": {
      "4-seater": [
        {
          "car": "Wagon R or equivalent",
          "base_price": 6006,
          "discount": 1266,
          "final_price": 4740,
          "toll_included": true,
          "distance_km": 213,
          "max_passengers": 4
        },
        {
          "car": "Toyota Etios or equivalent",
          "base_price": 6108,
          "discount": 1287,
          "final_price": 4821,
          "toll_included": true,
          "distance_km": 213,
          "max_passengers": 4
        }
      ],
      "6-seater": [
        {
          "car": "Ertiga or equivalent",
          "base_price": 9395,
          "discount": 2361,
          "final_price": 7034,
          "toll_included": true,
          "distance_km": 213,
          "max_passengers": 6
        },
        {
          "car": "Toyota Innova",
          "base_price": 14129,
          "discount": 3665,
          "final_price": 10464,
          "toll_included": true,
          "distance_km": 213,
          "max_passengers": 6
        }
      ]
    },
    "vit_vellore_to_chennai_airport": {
      "4-seater": [
        {
          "car": "Wagon R or equivalent",
          "base_price": 3111,
          "discount": 442,
          "final_price": 2669,
          "toll_included": true,
          "distance_km": 135,
          "max_passengers": 4
        },
        {
          "car": "Toyota Etios or equivalent",
          "base_price": 3154,
          "discount": 446,
          "final_price": 2708,
          "toll_included": true,
          "distance_km": 135,
          "max_passengers": 4
        }
      ],
      "6-seater": [
        {
          "car": "Ertiga or equivalent",
          "base_price": 5975,
          "discount": 1116,
          "final_price": 4859,
          "toll_included": true,
          "distance_km": 135,
          "max_passengers": 6
        },
        {
          "car": "Toyota Innova",
          "base_price": 8730,
          "discount": 685,
          "final_price": 8045,
          "toll_included": true,
          "distance_km": 135,
          "max_passengers": 6
        }
      ]
    },
    "chennai_airport_to_vit_vellore": {
      "4-seater": [
        {
          "car": "Wagon R or equivalent",
          "base_price": 3429,
          "discount": 470,
          "final_price": 2959,
          "toll_included": true,
          "distance_km": 138,
          "max_passengers": 4
        },
        {
          "car": "Toyota Etios or equivalent",
          "base_price": 3479,
          "discount": 475,
          "final_price": 3004,
          "toll_included": true,
          "distance_km": 138,
          "max_passengers": 4
        }
      ],
      "6-seater": [
        {
          "car": "Ertiga or equivalent",
          "base_price": 6695,
          "discount": 839,
          "final_price": 5856,
          "toll_included": true,
          "distance_km": 138,
          "max_passengers": 6
        },
        {
          "car": "Toyota Innova",
          "base_price": 8368,
          "discount": 742,
          "final_price": 7626,
          "toll_included": true,
          "distance_km": 138,
          "max_passengers": 6
        }
      ]
    }
  }
};