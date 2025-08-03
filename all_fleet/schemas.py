from pydantic import BaseModel


class AirlineBase(BaseModel):
    airline: str


class AirlineRead(AirlineBase):
    id: int

    class Config:
        from_attributes = True


class AirlineCreate(AirlineBase):
    pass


class AircraftTypeBase(BaseModel):
    aircraft_type: str


class AircraftTypeRead(AircraftTypeBase):
    id: int

    class Config:
        from_attributes = True


class AircraftTypeCreate(AircraftTypeBase):
    pass


class AircraftBase(BaseModel):
    registration_no: str
    airline_id: int
    aircraft_type_id: int


class AircraftRead(AircraftBase):
    id: int

    class Config:
        from_attributes = True


class AircraftCreate(AircraftBase):
    pass
