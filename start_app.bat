@echo off


REM docker start redis 
REM docker run -d -p 6379:6379 --name redis redis

REM Iniciar Django (backend) em uma janela separada
@REM start cmd /k "cd backend && python manage.py runserver"

REM Iniciar o Frontend (npm)
@REM start cmd /k "cd frontend && npm run dev"

REM Iniciar Celery Worker
start cmd /k "cd backend && celery -A backend worker -l info -P eventlet"

REM Iniciar Celery Beat
start cmd /k "cd backend && celery -A backend beat --loglevel=info"