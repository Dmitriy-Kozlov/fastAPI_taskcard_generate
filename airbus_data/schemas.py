from enum import Enum

from pydantic import BaseModel, Field


class DocumentType(str, Enum):
    AMM = "AMM"
    IPC = "IPC"
    MPD = "MPD"


class AirbusFileBase(BaseModel):
    document_type: DocumentType
    aircraft_type_id: int
    revision_no: int


class AirbusFileRead(AirbusFileBase):
    id: int
    active: bool

    class Config:
        from_attributes = True


class AirbusFileCreate(AirbusFileBase):
    pass


class TemplateFileBase(BaseModel):
    airline_id: int
    title: str


class TemplateFileRead(TemplateFileBase):
    id: int
    active: bool

    class Config:
        from_attributes = True


class TemplateFileCreate(TemplateFileBase):
    pass
