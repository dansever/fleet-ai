from pydantic import BaseModel, Field
from typing import Optional

class Vendor(BaseModel):
    name: str | None = Field(
        description="Company name (header, footer, signature section)",
        example="Lufthansa Technik")
    
    address: str | None = Field(
        description="Company address (office/headquarters location)",
        example="Lufthansa Technik GmbH, Flughafenstr. 1, 80992 München, Germany")
    
    contact_name: str | None = Field(
        description="Contact person name (footer, contact section, email signature like 'Regards, John Smith')",
        example="John Doe")
    
    contact_email: str | None = Field(
        description="Contact email (footer, contact block). Extract email only - exclude 'Email:' labels",
        example="john.doe@lufthansa-technik.com")
    
    contact_phone: str | None = Field(
        description="Contact phone (footer, contact block). May include country/area codes (+1 305-555-1234, +44 (0)20 7946 0000)",
        example="+49 89 9797-0")
