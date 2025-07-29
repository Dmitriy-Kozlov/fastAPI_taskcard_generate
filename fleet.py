from enum import Enum


class AircraftType(Enum):
    A330 = "A330"
    A321 = "A321"


all_airlines = {
    "Air Samarkand": {
        "UK32120": {
        "type": AircraftType.A321.value,
        "subtype": "C"
    },
        "UK32121": {
        "type": AircraftType.A321.value,
        "subtype": "N"
    },
        "UK33001": {
        "type": AircraftType.A330.value,
        "subtype": ""
}
    }
}


aircrafts = {
    "UK32120": {
    "type": "A321",
    "subtype": "C"
},
    "UK32121": {
    "type": "A321",
    "subtype": "N"
},
    "UK33001": {
    "type": "A330",
    "subtype": ""
}}