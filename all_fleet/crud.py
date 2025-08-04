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

from base.crud import BaseCRUD
from database import async_session_maker
from all_fleet.schemas import AirlineRead, AirlineCreate, AircraftTypeRead, AircraftTypeCreate, AircraftRead, AircraftCreate
from all_fleet.models import Airline, AircraftType, Aircraft



class AirlineCRUD(BaseCRUD):
    model = Airline


class AircraftTypeCRUD(BaseCRUD):
    model = AircraftType


class AircraftCRUD(BaseCRUD):
    model = Aircraft

    @classmethod
    async def add(cls, registration_no, airline_id, aircraft_type_id):
        airline = await AirlineCRUD.find_one_or_none_by_id(airline_id)
        aircraft_type = await AircraftTypeCRUD.find_one_or_none_by_id(aircraft_type_id)
        if not airline or aircraft_type:
            raise HTTPException(status_code=404, detail="Airline or aircraft type not found")
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