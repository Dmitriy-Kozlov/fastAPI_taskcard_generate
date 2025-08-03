# from sqlalchemy import String, Integer, Boolean, Column, ForeignKey
# from sqlalchemy.orm import Mapped, mapped_column, relationship
# from database import Base
#
#
# class Airline(Base):
#     __tablename__ = 'airlines'
#
#     id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
#     airline: Mapped[str] = mapped_column(String, nullable=False)
#     aircrafts: relationship("Aircraft", back_populates="airline")
#
#
# class AircraftType(Base):
#     __tablename__ = 'aircraft_types'
#
#     id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
#     aircraft_type: Mapped[str] = mapped_column(String, nullable=False)
#     aircrafts: relationship("Aircraft", back_populates="aircraft_types")
#
#
# class Aircraft(Base):
#     __tablename__ = 'aircraft'
#
#     id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
#     airline_id = Column(Integer, ForeignKey("airlines.id", ondelete="CASCADE"), nullable=False)
#     aircraft_type_id = Column(Integer, ForeignKey("aircraft_types.id", ondelete="CASCADE"), nullable=False)
#     registration_no: Mapped[str] = mapped_column(String, nullable=False)
#     airline: relationship("Airline", back_populates="aircrafts")
#     aircraft_type: relationship("AircraftType", back_populates="aircrafts")
#


from typing import List
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import DeclarativeBase
from database import Base


class Airline(Base):
    __tablename__ = 'airlines'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    airline: Mapped[str] = mapped_column(nullable=False)
    aircrafts: Mapped[List["Aircraft"]] = relationship(back_populates="airline")


class AircraftType(Base):
    __tablename__ = 'aircraft_types'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    aircraft_type: Mapped[str] = mapped_column(nullable=False)
    aircrafts: Mapped[List["Aircraft"]] = relationship(back_populates="aircraft_type")


class Aircraft(Base):
    __tablename__ = 'aircraft'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    airline_id: Mapped[int] = mapped_column(ForeignKey("airlines.id", ondelete="CASCADE"), nullable=False)
    aircraft_type_id: Mapped[int] = mapped_column(ForeignKey("aircraft_types.id", ondelete="CASCADE"), nullable=False)
    registration_no: Mapped[str] = mapped_column(nullable=False)

    airline: Mapped["Airline"] = relationship(back_populates="aircrafts")
    aircraft_type: Mapped["AircraftType"] = relationship(back_populates="aircrafts")
