import asyncio

from sqlalchemy import select

from users.crud import UserCRUD  # Импортируем CRUD для пользователей
from users.models import User
from users.schemas import UserCreate  # Pydantic-схема для создания пользователя
from database import async_session_maker  # Асинхронная сессия из базы данных


async def init_superuser():
    # Проверьте, существует ли суперпользователь
    async with async_session_maker() as session:
        superuser = await session.execute(
            select(User).filter_by(username="admin")
        )
        superuser = superuser.scalar_one_or_none()

        if superuser:
            print("Суперпользователь уже существует.")
            return

        # Данные суперпользователя
        superuser_data = UserCreate(
            username="admin",
            full_name="Admin User",
            password="admin",
            password2="admin",
            email="admin@example.com"
        )

        # Создайте суперпользователя
        await UserCRUD.create_superuser(superuser_data)
        print("Суперпользователь успешно создан.")


# Запускаем асинхронный код
if __name__ == "__main__":
    asyncio.run(init_superuser())
