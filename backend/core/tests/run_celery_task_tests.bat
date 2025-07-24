@echo off
REM (opcional) ativar venv:
REM call venv\Scripts\activate

echo Rodando testes de celery tasks...
python test_celery_tasks.py

pause