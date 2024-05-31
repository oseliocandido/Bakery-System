#!/bin/bash

if [[ "$DATABASE_STREAMLIT_PATH" == "/app/data/data.db" ]]; then
    exec streamlit run app.py --server.headless true --server.port 8501
else
    exec streamlit run app.py --server.headless true --server.port 8502 
fi
