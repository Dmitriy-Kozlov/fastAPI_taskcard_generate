import uuid

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette.responses import FileResponse

from schemas import AircraftIn
import os

from generate_taskcards import generate_taskcards
from fleet import all_airlines
from utils import zip_files
from init_superuser import init_superuser
from all_fleet.crud import AirlineCRUD
from users.router import router as user_router
from all_fleet.router import router as fleet_router

app = FastAPI()

app.include_router(user_router)
app.include_router(fleet_router)


@app.on_event("startup")
async def startup_event():
    await init_superuser()


# Dependency to get DB session


@app.post("/generate-taskcards")
async def generate(data: AircraftIn):
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
def download_file(filename: str):
    zip_path = os.path.join("generated", filename)
    if not os.path.exists(zip_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path=zip_path, filename="Taskcards.zip", media_type="application/zip")