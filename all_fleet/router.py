from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends, APIRouter, Body
from pydantic import Field

from all_fleet.crud import AirlineCRUD, AircraftTypeCRUD, AircraftCRUD
from all_fleet.schemas import AirlineRead, AirlineCreate, AircraftTypeRead, AircraftTypeCreate, AircraftRead, AircraftCreate


router = APIRouter(
    prefix="/fleet",
    tags=["fleet"]
)


@router.get("/airlines/all", response_model=list[AirlineRead])
# async def get_all_users(user=Depends(get_current_active_user)):
async def get_all_airlines():
    airlines = await AirlineCRUD.find_all()
    return [AirlineRead.from_orm(airline) for airline in airlines]


@router.get("/airlines/{id}", response_model=AirlineRead)
# async def get_airline_by_id(id: int, user=Depends(get_current_active_user)):
async def get_airline_by_id(id: int):
    result = await AirlineCRUD.find_one_or_none_by_id(id)
    return result


@router.post("/airlines/create", response_model=AirlineRead)
async def create_airline(airline: AirlineCreate):
    airline_db = await AirlineCRUD.add(**airline.dict())
    return airline_db


@router.delete("/airlines/{id}/delete")
# async def delete_user_by_id(id: int, user=Depends(get_current_active_user)):
async def delete_airline_by_id(id: int):
    result = await AirlineCRUD.delete(id)
    return result


@router.get("/aircraft_type/all", response_model=list[AircraftTypeRead])
# async def get_all_users(user=Depends(get_current_active_user)):
async def get_all_aircraft_types():
    aircraft_types = await AircraftTypeCRUD.find_all()
    return [AircraftTypeRead.from_orm(aircraft_type) for aircraft_type in aircraft_types]


@router.get("/aircraft_type/{id}", response_model=AircraftTypeRead)
# async def get_airline_by_id(id: int, user=Depends(get_current_active_user)):
async def get_aircraft_type_by_id(id: int):
    result = await AircraftTypeCRUD.find_one_or_none_by_id(id)
    return result


@router.post("/aircraft_type/create", response_model=AircraftTypeRead)
async def create_aircraft_type(aircraft_type: AircraftTypeCreate):
    aircraft_type_db = await AircraftTypeCRUD.add(**aircraft_type.dict())
    return aircraft_type_db


@router.delete("/aircraft_type/{id}/delete")
# async def delete_user_by_id(id: int, user=Depends(get_current_active_user)):
async def delete_aircraft_type_by_id(id: int):
    result = await AircraftTypeCRUD.delete(id)
    return result


@router.get("/aircraft/all", response_model=list[AircraftRead])
# async def get_all_users(user=Depends(get_current_active_user)):
async def get_all_aircrafts():
    aircrafts = await AircraftCRUD.find_all()
    return [AircraftRead.from_orm(aircraft) for aircraft in aircrafts]


@router.get("/aircraft/{id}", response_model=AircraftRead)
# async def get_airline_by_id(id: int, user=Depends(get_current_active_user)):
async def get_aircraft_by_id(id: int):
    result = await AircraftCRUD.find_one_or_none_by_id(id)
    return result


@router.post("/aircraft/create", response_model=AircraftRead)
async def create_aircraft(aircraft: AircraftCreate):
    aircraft_db = await AircraftCRUD.add(**aircraft.dict())
    return aircraft_db


@router.delete("/aircraft/{id}/delete")
# async def delete_user_by_id(id: int, user=Depends(get_current_active_user)):
async def delete_aircraft_by_id(id: int):
    result = await AircraftCRUD.delete(id)
    return result
