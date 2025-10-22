from typing import List
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, ForeignKey
from database import Base


class Airline(Base):
    __tablename__ = 'airlines'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    airline: Mapped[str] = mapped_column(nullable=False)
    aircrafts: Mapped[List["Aircraft"]] = relationship(back_populates="airline")
    template: Mapped["TaskTemplate"] = relationship(back_populates="airline", uselist=False)


class AircraftType(Base):
    __tablename__ = 'aircraft_types'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    aircraft_type: Mapped[str] = mapped_column(nullable=False)
    aircrafts: Mapped[List["Aircraft"]] = relationship(back_populates="aircraft_type")
    airbus_files: Mapped[list["AirbusFile"]] = relationship("AirbusFile", back_populates="aircraft_type")



class Aircraft(Base):
    __tablename__ = 'aircraft'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    airline_id: Mapped[int] = mapped_column(ForeignKey("airlines.id", ondelete="CASCADE"), nullable=False)
    aircraft_type_id: Mapped[int] = mapped_column(ForeignKey("aircraft_types.id", ondelete="CASCADE"), nullable=False)
    registration_no: Mapped[str] = mapped_column(nullable=False)

    airline: Mapped["Airline"] = relationship(back_populates="aircrafts")
    aircraft_type: Mapped["AircraftType"] = relationship(back_populates="aircrafts")
