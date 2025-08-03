import jwt
from typing import Annotated
from fastapi import Depends, HTTPException, status
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
# from jwt.exceptions import InvalidTokenError
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