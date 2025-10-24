import shutil
import os
import glob
from sqlalchemy import delete
from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError, NoResultFound
from sqlalchemy.future import select
from starlette.responses import FileResponse

from service import collect_from_mpd, parse_IPC, parse_tool_material_from_AMM, merge_AMM_MPD
from database import async_session_maker
from airbus_data.models import AirbusFile, TaskTemplate
from all_fleet.models import AircraftType
from base.crud import BaseCRUD
from airbus_data.schemas import AirbusFileCreate, TemplateFileCreate
from sqlalchemy.orm import joinedload, selectinload

FILES_PATH = "files/airbus_files"

class AirbusFileCRUD(BaseCRUD):
    model = AirbusFile

    # @classmethod
    # async def find_presentation_by_filter(cls, **filter):
    #     async with async_session_maker() as session:
    #         filters = dict(**{k:v for k, v in filter.items() if v is not None})
    #         title = filters.pop("title", None)
    #         query = select(cls.model).filter_by(**filters)
    #         if title is not None:
    #             query = query.filter(Presentation.title.ilike(f"%{title}%"))
    #         result = await session.execute(query)
    #         plain_result = result.scalars().all()
    #         return plain_result
    @classmethod
    async def get_all_files_with_aircraft_types(cls):
        async with async_session_maker() as session:
            query = (
                select(cls.model)
                .options(joinedload(cls.model.aircraft_type))
            )
            result = await session.execute(query)
            files = result.scalars().all()
            return files

    @classmethod
    async def add(cls, document_type, aircraft_type_id, revision_no, file):
        async with async_session_maker() as session:
            async with session.begin():
                try:
                    airbus_file_data = AirbusFileCreate(document_type=document_type, aircraft_type_id=aircraft_type_id, revision_no=revision_no)
                except ValidationError as e:
                    raise HTTPException(status_code=400, detail=e.errors())
                file_extension = file.filename.split(".")[-1]
                new_instance = cls.model(document_type=document_type, aircraft_type_id=aircraft_type_id, revision_no=revision_no, extension=file_extension)
                session.add(new_instance)
                await session.flush()
                os.makedirs(FILES_PATH, exist_ok=True)
                with open(f"{FILES_PATH}/{new_instance.id}.{file_extension}", "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                # try:
                #     await session.commit()
                # except SQLAlchemyError as e:
                #     await session.rollback()
                #     raise e
                # return new_instance
            async with async_session_maker() as session:
                query = (
                    select(cls.model)
                    .options(selectinload(cls.model.aircraft_type))
                    .where(cls.model.id == new_instance.id)
                )
                result = await session.execute(query)
                instance_with_rel = result.scalar_one()

            return instance_with_rel

    # @classmethod
    # async def download(cls, presentation_id: int):
    #     async with async_session_maker() as session:
    #         async with session.begin():
    #             try:
    #                 query = select(Presentation).filter_by(id=presentation_id)
    #                 result = await session.execute(query)
    #                 presentation = result.scalars().one()
    #                 filename = f"{presentation.id}.{presentation.extension}"
    #                 path = f"media/presentations/{filename}"
    #                 return FileResponse(path, media_type='application/octet-stream',
    #                                     filename=f"{presentation.owner}-{presentation.year}-{presentation.month}.{presentation.extension}")
    #             except NoResultFound:
    #                 raise HTTPException(status_code=404, detail="Presentation not found")

    @classmethod
    async def delete(cls, airbus_file_id: int):
        async with async_session_maker() as session:
            async with session.begin():
                query = delete(cls.model).filter(cls.model.id == airbus_file_id)
                await session.execute(query)
                await session.commit()
                file_pattern = f"files/airbus_files/{airbus_file_id}.*"
                files_to_delete = glob.glob(file_pattern)
                if not files_to_delete:
                    raise FileNotFoundError(f"No files found for Airbus file ID {airbus_file_id}")
                for file_path in files_to_delete:
                    os.remove(file_path)
                return {"message": "obj deleted"}


    @classmethod
    async def get_amm_ipc_mpd_files(cls, atype_id: int):
        async with async_session_maker() as session:
            async with session.begin():
                query = select(cls.model).filter_by(aircraft_type_id=atype_id, active=True).limit(4)
                result = await session.execute(query)
                plain_result = result.scalars().all()
                query = select(AircraftType).filter_by(id=atype_id)
                result = await session.execute(query)
                type_result = result.scalar_one_or_none()
                if len(plain_result) > 3:
                    raise HTTPException(status_code=400, detail="Active files more than 3")

            # Разбор полученных файлов
        mpd_id = next((obj.id for obj in plain_result if obj.document_type == "MPD"), None)
        amm_id = next((obj.id for obj in plain_result if obj.document_type == "AMM"), None)
        ipc_id = next((obj.id for obj in plain_result if obj.document_type == "IPC"), None)
        mpd_file = f"{FILES_PATH}/{mpd_id}.xlsx"
        ipc_file = f"{FILES_PATH}/{ipc_id}.json"
        amm_file = f"{FILES_PATH}/{amm_id}.json"
        atype = type_result.aircraft_type
        if not mpd_id or not ipc_id or not amm_id:
            raise HTTPException(status_code=400, detail=f"Not found. {mpd_id=}, {ipc_id=}, {amm_id=}")
        collect_from_mpd(mpd_file, atype)
        parse_IPC(ipc_file, atype)
        parse_tool_material_from_AMM(amm_file, atype)
        merge_AMM_MPD(atype)
        return plain_result


class TemplateFileCRUD(BaseCRUD):
    model = TaskTemplate

    @classmethod
    async def add(cls, airline_id, title, file):
        async with async_session_maker() as session:
            async with session.begin():
                try:
                    template_file_data = TemplateFileCreate(airline_id=airline_id, title=title)
                except ValidationError as e:
                    raise HTTPException(status_code=400, detail=e.errors())
                file_extension = file.filename.split(".")[-1]
                new_instance = cls.model(airline_id=airline_id, title=title, extension=file_extension)
                session.add(new_instance)
                await session.flush()
                os.makedirs(f"files/templates/", exist_ok=True)
                with open(f"files/templates/{new_instance.id}.{file_extension}", "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                try:
                    await session.commit()
                except SQLAlchemyError as e:
                    await session.rollback()
                    raise e
                return new_instance

    @classmethod
    async def delete(cls, template_file_id: int):
        async with async_session_maker() as session:
            async with session.begin():
                query = delete(cls.model).filter(cls.model.id == template_file_id)
                await session.execute(query)
                await session.commit()
                file_pattern = f"files/templates/{template_file_id}.*"
                files_to_delete = glob.glob(file_pattern)
                if not files_to_delete:
                    raise FileNotFoundError(f"No files found for Template file ID {template_file_id}")
                for file_path in files_to_delete:
                    os.remove(file_path)
                return {"message": "obj deleted"}

    @classmethod
    async def get_template_for_airline(cls, airline_id: int):
        async with async_session_maker() as session:
            async with session.begin():
                query = select(cls.model).filter_by(airline_id=airline_id, active=True)
                result = await session.execute(query)
                plain_result = result.scalar_one_or_none()
                return plain_result

    @classmethod
    async def get_all_templates_with_airlines(cls):
        async with async_session_maker() as session:
            query = (
                select(cls.model)
                .options(joinedload(cls.model.airline))
            )
            result = await session.execute(query)
            airlines = result.scalars().all()
            return airlines