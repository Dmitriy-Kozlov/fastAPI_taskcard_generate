from pydantic import BaseModel
from typing import List


class AircraftIn(BaseModel):
    airline: str
    registration: str
    taskcards: List[str]


class AircraftInNew(BaseModel):
    airline: int
    registration: str
    taskcards: List[str]