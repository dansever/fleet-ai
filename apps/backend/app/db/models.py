from pydantic import Field, BaseModel
import uuid

class Organization(BaseModel):
    id: uuid.UUID = Field(default_factory=lambda: uuid.uuid4())
    clerk_org_id: str
    name: str

    def __init__(self, id: uuid.UUID, clerk_org_id: str, name: str):
        self.id = id
        self.clerk_org_id = clerk_org_id
        self.name = name

    def to_dict(self):
        return {
            "id": self.id,
            "clerk_org_id": self.clerk_org_id,
            "name": self.name
        }

class User(BaseModel):
    id: uuid.UUID = Field(default_factory=lambda: uuid.uuid4())
    clerk_user_id: str
    organization_id: uuid.UUID
    first_name: str
    last_name: str
    email: str
    phone: str
    position: str

    def __init__(self, id: uuid.UUID, clerk_user_id: str, organization_id: uuid.UUID, first_name: str, last_name: str, email: str, phone: str, position: str):
        self.id = id
        self.clerk_user_id = clerk_user_id
        self.organization_id = organization_id
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.phone = phone
        self.position = position

    def to_dict(self):
        return {
            "id": self.id,
            "clerk_user_id": self.clerk_user_id,
            "organization_id": self.organization_id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "phone": self.phone,
            "position": self.position,
        }

class Airport(BaseModel):
    id: uuid.UUID = Field(default_factory=lambda: uuid.uuid4())
    organization_id: uuid.UUID
    name: str
    iata: str
    icao: str
    city: str
    country: str
    is_hub: bool

    def __init__(self, id: uuid.UUID, organization_id: uuid.UUID, name: str, iata: str, icao: str, city: str, country: str, is_hub: bool):
        self.id = id
        self.organization_id = organization_id
        self.name = name
        self.iata = iata
        self.icao = icao
        self.city = city
        self.country = country
        self.is_hub = is_hub

    def to_dict(self):
        return {
            "id": self.id,
            "organization_id": self.organization_id,
            "name": self.name,
            "iata": self.iata,
            "icao": self.icao,
            "city": self.city,
            "country": self.country,
            "is_hub": self.is_hub
        }

