from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends, APIRouter, Body
from pydantic import Field

from all_fleet.crud import AirlineCRUD
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
async def delete_user_by_id(id: int):
    result = await AirlineCRUD.delete(id)
    return result
