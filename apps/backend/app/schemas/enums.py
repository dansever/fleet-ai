# backend/app/schemas/enums.py

from enum import Enum

class ContractTypes(str, Enum):
    fuel = "fuel"
    ground_handling = "ground_handling"
    catering = "catering"
    technical_mro_parts = "technical_mro_parts"
    airport_and_nav_charges = "airport_and_nav_charges"
    security_compliance = "security_compliance"
    it_data_comms = "it_data_comms"
    logistics_freight = "logistics_freight"
    training_and_crew = "training_and_crew"
    insurance_and_finance = "insurance_and_finance"
    other = "other"