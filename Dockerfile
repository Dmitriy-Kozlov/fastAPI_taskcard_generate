FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    libreoffice \
    fonts-dejavu \
    fonts-freefont-ttf \
    fonts-liberation \
    fontconfig \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

#RUN apk add libreoffice

