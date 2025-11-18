from enum import Enum

from pydantic import BaseModel, Field
from all_fleet.schemas import AircraftTypeBase, AirlineBase

class DocumentType(str, Enum):
    AMM = "AMM"
    IPC = "IPC"
    MPD = "MPD"


class AirbusFileBase(BaseModel):
    document_type: DocumentType
    aircraft_type_id: int
    revision_no: int


class AirbusFileEdit(AirbusFileBase):
    id: int
    active: bool


class AirbusFileRead(AirbusFileBase):
    id: int
    active: bool
    aircraft_type: AircraftTypeBase

    class Config:
        from_attributes = True


class AirbusFileCreate(AirbusFileBase):
    pass


class TemplateFileBase(BaseModel):
    airline_id: int
    title: str


class TemplateFileEdit(TemplateFileBase):
    id: int
    active: bool
    reference:bool


class TemplateFileRead(TemplateFileBase):
    id: int
    active: bool
    reference:bool
    airline: AirlineBase

    class Config:
        from_attributes = True


class TemplateFileCreate(TemplateFileBase):
    pass
