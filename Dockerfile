FROM python:3.11-slim

RUN apt-get update \
    && apt-get -y install curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY app/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r ./requirements.txt

RUN mkdir data logs 

COPY app/entrypoint-enviromment.sh /app/entrypoint-enviromment.sh
RUN chmod +x /app/entrypoint-enviromment.sh

WORKDIR /app/src

COPY app/src .

#Changing /app/data/test_data.db value will read-write to differnt sqlite3
ENV DATABASE_STREAMLIT_PATH="/app/data/data.db"

ENTRYPOINT ["/app/entrypoint-enviromment.sh" ]
