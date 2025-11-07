FROM python:3.13-alpine as app

WORKDIR /app
COPY ./tenkey_raffle_backend .
COPY ./requirements.txt .

RUN pip install --no-cache-dir --upgrade -r requirements.txt

CMD ["gunicorn", "--bind", "0.0.0.0:6001", "app:flask_app"]