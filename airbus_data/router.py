from fastapi import APIRouter, UploadFile, File, Form, Depends
from airbus_data.schemas import AirbusFileRead, TemplateFileEdit, DocumentType, TemplateFileRead, TemplateFileCreate, AirbusFileEdit
from airbus_data.crud import AirbusFileCRUD, TemplateFileCRUD
from users.router import get_current_active_user, get_current_active_admin

router = APIRouter(
    prefix="/airbus_files",
    tags=["airbus_files"],
    dependencies=[Depends(get_current_active_user)],
)


@router.post("/add", response_model=AirbusFileRead)
async def add_airbus_file(
        user=Depends(get_current_active_admin),
        document_type: DocumentType = Form(...),
        aircraft_type_id: int = Form(...),
        revision_no: int = Form(...),
        file: UploadFile = File(...)
                            ):
    airbus_file = await AirbusFileCRUD.add(document_type=document_type, aircraft_type_id=aircraft_type_id, revision_no=revision_no, file=file)
    return airbus_file


@router.get("/all", response_model=list[AirbusFileRead])
async def get_all_airbus_files():
    # airbus_files = await AirbusFileCRUD.find_all()
    airbus_files = await AirbusFileCRUD.get_all_files_with_aircraft_types()
    return airbus_files

#
# @router.post("/filter", response_model=list[PresentationRead] | None)
# async def get_presentation_by_filter(filter_data: PresentationFilter):
#     presentation = await PresentationCRUD.find_presentation_by_filter(
#         owner=filter_data.owner,
#         title=filter_data.title,
#         month=filter_data.month,
#         year=filter_data.year
#     )
#     return presentation


# @router.get("/download")
# async def download_presentation(id: int,):
#     file = await PresentationCRUD.download(id)
#     return file

#
# @router.get("/{id}", response_model=PresentationRead | None)
# async def get_presentation_by_id(id: int):
#     presentation = await PresentationCRUD.find_one_or_none_by_id(id)
#     return presentation


@router.put("/edit", response_model=AirbusFileEdit)
async def edit_airbus_file_by_id(airbus_file: AirbusFileEdit,
# async def edit_airbus_file_by_id(id: int,
                                   user=Depends(get_current_active_admin)
                                   ):
    result = await AirbusFileCRUD.edit(**airbus_file.dict())
    return result


@router.delete("/{id}/delete")
async def delete_airbus_file_by_id(id: int,
                                   user=Depends(get_current_active_admin)
                                   ):
    result = await AirbusFileCRUD.delete(id)
    return result



@router.post("/templates/add", response_model=TemplateFileEdit)
async def add_template(
        user=Depends(get_current_active_admin),
        airline_id: int = Form(...),
        title: str = Form(...),
        file: UploadFile = File(...)
                            ):
    template_file_file = await TemplateFileCRUD.add(airline_id=airline_id, title=title, file=file)
    return template_file_file


@router.get("/templates/all",
            response_model=list[TemplateFileRead]
            )
async def get_all_templates():
    template_files = await TemplateFileCRUD.get_all_templates_with_airlines()
    return template_files


@router.put("/templates/edit", response_model=TemplateFileEdit)
async def edit_template_file_by_id(template_file: TemplateFileEdit,
                                   user=Depends(get_current_active_admin)
                                   ):
    result = await TemplateFileCRUD.edit(**template_file.dict())
    return result


@router.delete("/templates/{id}/delete")
async def delete_template_by_id(id: int,
                                   user=Depends(get_current_active_admin)
                                   ):
    result = await TemplateFileCRUD.delete(id)
    return result


@router.post("/remake_files", response_model=list[AirbusFileRead])
async def remake_files_after_upload(atype: int,  user = Depends(get_current_active_admin)):
    result = await AirbusFileCRUD.get_amm_ipc_mpd_files(atype)
    return result