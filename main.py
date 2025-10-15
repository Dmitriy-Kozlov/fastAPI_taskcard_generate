import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette.responses import FileResponse
from starlette.staticfiles import StaticFiles

from schemas import AircraftIn, AircraftInNew
from airbus_data.schemas import AirbusFileRead
import os

from generate_taskcards import generate_taskcards, generate_taskcards_new
from fleet import all_airlines
from users.schemas import UserCreate
from utils import zip_files
from init_superuser import init_superuser
from all_fleet.crud import AirlineCRUD
from airbus_data.crud import AirbusFileCRUD
from users.router import router as user_router
from all_fleet.router import router as fleet_router
from airbus_data.router import router as airbus_data_router
from users.crud import get_current_active_user, get_current_active_admin
from pages.router import router as pages_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("App starting...")
    await init_superuser()
    print("Superuser initialized.")
    yield
    print("App shutting down...")

app = FastAPI(lifespan=lifespan)

app.include_router(user_router)
app.include_router(fleet_router)
app.include_router(airbus_data_router)
app.include_router(pages_router)

app.mount("/static", StaticFiles(directory="static"), name="static")


# @app.on_event("startup")
# async def startup_event():
#     await init_superuser()


# Dependency to get DB session

@app.post("/generate-taskcards_new")
async def generate(data: AircraftInNew, user = Depends(get_current_active_user)):
    mpd_tasks_list = data.taskcards
    aircraft = data.registration
    current_airline_id = data.airline
    new_airline = await AirlineCRUD.find_airline_with_aircrafts_and_template(current_airline_id)
    airline_name = new_airline.airline
    if not any(ac.registration_no == aircraft for ac in (new_airline.aircrafts or [])):
        raise HTTPException(
            status_code=400,
            detail=f"Aircraft '{aircraft}' not found for airline '{airline_name}'"
        )
    atype = next((ac.aircraft_type.aircraft_type
                  for ac in (new_airline.aircrafts or [])
                  if ac.registration_no == aircraft), None)
    if not new_airline.template:
        raise HTTPException(
            status_code=400,
            detail=f"No active template for airline '{airline_name}'"
        )
    template_id = new_airline.template.id

    lost, create, files = generate_taskcards_new(atype, aircraft, mpd_tasks_list, template_id)
    zip_name = f"taskcards_{uuid.uuid4().hex}.zip"
    zip_path = zip_files(files, zip_name)
    response = {"created taskcards": create,
                "no taskcard found": lost,
                "download_url": f"/download/{zip_name}"}

    return response

@app.post("/generate-taskcards")
async def generate(data: AircraftIn,  user = Depends(get_current_active_user)):
    mpd_tasks_list = data.taskcards
    aircraft = data.registration
    current_airline = data.airline
    # Проверка: существует ли авиакомпания
    new_airlines = await AirlineCRUD.get_all_airlines_dict()
    # if current_airline not in all_airlines:
    if current_airline not in new_airlines:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown airline: '{current_airline}'"
        )
    # template_airline_file_id = TemplateFileCRUD.get_template_for_airline()
    # Проверка: существует ли ВС в списке у этой авиакомпании
    # if aircraft not in all_airlines[current_airline]:
    if aircraft not in new_airlines[current_airline]:
        raise HTTPException(
            status_code=400,
            detail=f"Aircraft '{aircraft}' not found for airline '{current_airline}'"
        )

    # aircraft_type = all_airlines[current_airline][aircraft]["type"]
    aircraft_type = new_airlines[current_airline][aircraft]["type"]
    # subtype = all_airlines[current_airline][aircraft]["subtype"]
    try:
        subtype = new_airlines[current_airline][aircraft]["subtype"]
    except KeyError:
        subtype = ""
    print(current_airline, aircraft, aircraft_type, subtype)
    lost, create, files = generate_taskcards(aircraft_type, aircraft, mpd_tasks_list, current_airline, subtype)
    zip_name = f"taskcards_{uuid.uuid4().hex}.zip"
    zip_path = zip_files(files, zip_name)
    response = {"created taskcards": create,
                "no taskcard found": lost,
                "download_url": f"/download/{zip_name}"}

    return response


@app.get("/download/{filename}")
def download_file(filename: str,  user = Depends(get_current_active_user)):
    zip_path = os.path.join("generated", filename)
    if not os.path.exists(zip_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path=zip_path, filename="Taskcards.zip", media_type="application/zip")


@app.post("/remake_files", response_model=list[AirbusFileRead])
async def remake_files_after_upload(atype: int,  user = Depends(get_current_active_admin)):
    result = await AirbusFileCRUD.get_amm_ipc_mpd_files(atype)
    return result
