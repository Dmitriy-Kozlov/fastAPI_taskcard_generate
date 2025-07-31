from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.future import select
from sqlalchemy import delete
from database import async_session_maker
from fastapi import HTTPException


class BaseCRUD:
    model = None

    @classmethod
    async def find_one_or_none_by_id(cls, id: int):
        async with async_session_maker() as session:
            query = select(cls.model).filter_by(id=id)
            result = await session.execute(query)
            plain_result = result.scalar_one_or_none()
            return plain_result

    @classmethod
    async def find_all(cls):
        async with async_session_maker() as session:
            query = select(cls.model)
            result = await session.execute(query)
            plain_result = result.scalars().all()
            return plain_result

    @classmethod
    async def add(cls, **values):
        async with async_session_maker() as session:
            async with session.begin():
                new_instance = cls.model(**values)
                session.add(new_instance)
                try:
                    await session.commit()
                except SQLAlchemyError as e:
                    await session.rollback()
                    raise e
                return new_instance

    @classmethod
    async def delete(cls, id: int):
        async with async_session_maker() as session:
            async with session.begin():
                query = delete(cls.model).filter(cls.model.id == id)
                await session.execute(query)
                await session.commit()
                return {"message": "obj deleted"}

    @classmethod
    async def edit(cls, **values):
        async with async_session_maker() as session:
            async with session.begin():
                id = values.get("id", None)
                if not id:
                    raise HTTPException(status_code=404, detail="Id not found")
                query = select(cls.model).filter_by(id=id)
                result = await session.execute(query)
                plain_result = result.scalar_one_or_none()
                if not plain_result:
                    raise HTTPException(status_code=404, detail="Object not found")
                for key, value in values.items():
                    if hasattr(plain_result, key):
                        setattr(plain_result, key, value)
                try:
                    await session.commit()
                except SQLAlchemyError as e:
                    await session.rollback()
                    raise e
                return plain_result

