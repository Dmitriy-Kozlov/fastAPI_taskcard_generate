import jwt
from typing import Annotated
from fastapi import Depends, HTTPException, status
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
# from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.future import select
from airbus_data.models import TaskTemplate
from base.crud import BaseCRUD
from database import async_session_maker
# from all_fleet.schemas import AirlineRead, AirlineCreate, AircraftTypeRead, AircraftTypeCreate, AircraftRead, AircraftCreate
from all_fleet.models import Airline, AircraftType, Aircraft
from sqlalchemy.orm import joinedload, with_loader_criteria


class AirlineCRUD(BaseCRUD):
    model = Airline

    @classmethod
    async def find_airline_with_aircrafts_and_template(cls, airline_id: int):
        async with async_session_maker() as session:
            query = select(cls.model).options(
                joinedload(cls.model.template),
            joinedload(cls.model.aircrafts).joinedload(Aircraft.aircraft_type),
                with_loader_criteria(TaskTemplate, TaskTemplate.active.is_(True), include_aliases=True)

            ).filter_by(id=airline_id)

            result = await session.execute(query)
            result = result.unique()
            airline = result.scalar_one_or_none()

            if not airline:
                raise HTTPException(status_code=404, detail="Airline not found")

            return airline

    @classmethod
    async def get_all_airlines_dict(cls) -> dict:
        async with async_session_maker() as session:
            query = (
                select(cls.model)
                    .options(
                    joinedload(Airline.aircrafts).joinedload(Aircraft.aircraft_type)
                )
            )
            result = await session.execute(query)
            result = result.unique()
            airlines = result.scalars().all()

            all_airlines = {}

            for airline in airlines:
                airline_name = airline.airline
                all_airlines[airline_name] = {}

                for aircraft in airline.aircrafts:
                    reg_no = aircraft.registration_no
                    ac_type = aircraft.aircraft_type.aircraft_type
                    all_airlines[airline_name][reg_no] = {"type": ac_type}

            return all_airlines




class AircraftTypeCRUD(BaseCRUD):
    model = AircraftType


class AircraftCRUD(BaseCRUD):
    model = Aircraft

    @classmethod
    async def add(cls, registration_no, airline_id, aircraft_type_id):
        airline = await AirlineCRUD.find_one_or_none_by_id(airline_id)
        if not airline:
            raise HTTPException(status_code=404, detail="Airline not found")
        aircraft_type = await AircraftTypeCRUD.find_one_or_none_by_id(aircraft_type_id)
        if not aircraft_type:
            raise HTTPException(status_code=404, detail="Aircraft type not found")
        async with async_session_maker() as session:
            async with session.begin():
                new_instance = cls.model(registration_no=registration_no, airline_id=airline_id, aircraft_type_id=aircraft_type_id)
                session.add(new_instance)
                try:
                    await session.commit()
                except SQLAlchemyError as e:
                    await session.rollback()
                    raise e
                return new_instance