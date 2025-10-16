from pydantic import BaseModel
from airbus_data.schemas import TemplateFileRead


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


class AircraftRead(AircraftBase):
    id: int
    airline_id: int
    aircraft_type_id: int

    class Config:
        from_attributes = True


class AircraftCreate(AircraftBase):
    airline_id: int
    aircraft_type_id: int


# class AircraftWithType(AircraftBase):
class AircraftWithType(AircraftRead):
    aircraft_type: AircraftTypeBase


# class AirlineWithAircrafts(AirlineBase):
#     aircrafts: list[AircraftWithType]


class AirlineWithAircraftsAndTemplate(AirlineBase):
    aircrafts: list[AircraftWithType]
    template: TemplateFileRead | None
