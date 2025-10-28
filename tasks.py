from celery_app import celery_app
# from airbus_data.crud import AirbusFileCRUD
from service import collect_from_mpd, parse_IPC, parse_tool_material_from_AMM, merge_AMM_MPD
# from airbus_data.crud import  FILES_PATH
# from all_fleet.models import AircraftType
# from sqlalchemy.future import select
# from database import async_session_maker
# import asyncio
import uuid

from utils import zip_files
# from all_fleet.crud import AirlineCRUD
from generate_taskcards import generate_taskcards_new


@celery_app.task(bind=True, name="remake_files_task")
def remake_files_task(self, atype: int, mpd_file: str, ipc_file: str, amm_file: str):

        # === Прогресс по шагам ===
        self.update_state(state="PROGRESS", meta={"step": "collect_from_mpd", "percent": 25})
        collect_from_mpd(mpd_file, atype)

        self.update_state(state="PROGRESS", meta={"step": "parse_IPC", "percent": 50})
        parse_IPC(ipc_file, atype)

        self.update_state(state="PROGRESS", meta={"step": "parse_tool_material_from_AMM", "percent": 75})
        parse_tool_material_from_AMM(amm_file, atype)

        self.update_state(state="PROGRESS", meta={"step": "merge_AMM_MPD", "percent": 90})
        merge_AMM_MPD(atype)

        # Завершено
        return {"status": "completed", "percent": 100}

from celery.exceptions import Ignore
from celery import states


@celery_app.task(bind=True, name="generate_taskcards_task")
def generate_taskcards_task(self, atype: int, aircraft:str, mpd_tasks_list: list, template_id: int, full_name: str):
    """
    Фоновая асинхронная генерация taskcards.
    """
    try:
        self.update_state(state="PROGRESS", meta={"percent": 40, "step": "Generating taskcards"})
        lost, create, files = generate_taskcards_new(atype, aircraft, mpd_tasks_list, template_id, full_name)

        self.update_state(state="PROGRESS", meta={"percent": 80, "step": "Zipping results"})
        zip_name = f"taskcards_{uuid.uuid4().hex}.zip"
        zip_path = zip_files(files, zip_name)

        return {
            "created taskcards": create,
            "no taskcard found": lost,
            "download_url": f"/download/{zip_name}"
        }
    except FileNotFoundError as e:
    # Обновляем состояние задачи в Redis, чтобы фронтенд мог показать сообщение
        self.update_state(
            state="PROGRESS",
            meta={"error": str(e), "step": "File not found", "percent": 0}
        )
        # Возбуждаем снова — Celery отметит задачу как failed
        raise Ignore()
    #
    # except Exception as e:
    #     # Логируем и обновляем статус
    #     self.update_state(
    #         state="FAILURE",
    #         meta={"error": str(e), "step": "Unexpected error", "percent": 0}
    #     )
    #     raise Ignore()

