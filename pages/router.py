from fastapi import APIRouter, Request, Depends
from fastapi.templating import Jinja2Templates

from users.crud import get_current_active_user

router = APIRouter(prefix='/pages', tags=['Фронтенд'])
templates = Jinja2Templates(directory='templates')


@router.get('/search')
async def get_search_html(request: Request):
    return templates.TemplateResponse(name='search.html', context={'request': request})


@router.get('/auth')
async def get_auth_html(request: Request):
    return templates.TemplateResponse(name='auth.html', context={'request': request})


@router.get('/add')
async def get_add_html(request: Request):
    return templates.TemplateResponse(name='add.html', context={'request': request})


@router.get('/users')
async def get_users_html(request: Request):
    return templates.TemplateResponse(name='users.html', context={'request': request})