# backend/app/schemas/enums.py

from enum import Enum

CONTRACT_TYPES = Enum("ContractTypes", [
  "fuel", 
  "ground_handling", 
  "catering", 
  "technical_mro_parts", 
  "airport_and_nav_charges", 
  "security_compliance", 
  "it_data_comms", 
  "logistics_freight", 
  "training_and_crew", 
  "insurance_and_finance", 
  "other"
])