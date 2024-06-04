#!/bin/bash

manage_logs() {
  echo "----------------------LOGS-------------------------"
  echo "Checking if 'logs' directory exists and necessary files..."
  if [ ! -d "$HOME/myapp/logs" ]; then
    mkdir -p "$HOME/myapp/logs" && touch "$HOME/myapp/logs/database_errors.log"
    echo "Directory 'logs' created."
    echo "File database_errors.log created."
    echo -e "---------------------------------------------------\n"
  else
    echo "Directory 'logs' already exists."
    echo -e "---------------------------------------------------\n"
  fi
}


# Function to create secrets directory if it doesn't exist and secrets files related to AWS and streamlit
manage_secrets() {
  echo "------------------SECRETS-------------------------"
  echo "Checking if 'secrets' directory exists..."
  if [ ! -d "$HOME/secrets" ]; then
    mkdir -p "$HOME/secrets"
    echo "Directory 'secrets' created."
  else
    echo "Directory 'secrets' already exists."
  fi
   mv "$HOME/myapp/app/src/.streamlit/secrets.toml.example" "$HOME/secrets/secrets.toml"
   mv "$HOME/myapp/env/aws.env.example" "$HOME/myapp/env/aws.env"
   echo "Renamed secrets.toml.example to secrets.toml and moved to $HOME/secrets/secrets.toml."
   echo "Renamed aws.env.example to aws.env"
   echo -e "---------------------------------------------------\n"
}


manage_sqlite_data() {
  echo "---------------------DATA-------------------------"
  mv "$HOME/myapp/data/data.db.example" "$HOME/myapp/data/data.db"
  echo "Renamed data.db.example to data.db"
  echo -e "--------------------------------------------------\n"
}


add_cron_job() {
  echo "--------------DATABASE S3 BACKUPS------------------"
  SCRIPT_BACKUP_SERVICE_PATH="$HOME/myapp/scripts/backup.sh"

  # Prompt the user for the cron expression
  read -p "Enter a valid cron expression to backup data to AWS S3 (e.g., 0 11 * * *): " CRON_EXPRESSION
  
  # Append the cron job
  (crontab -l ; echo "$CRON_EXPRESSION bash $SCRIPT_BACKUP_SERVICE_PATH") | crontab -
}


streamlit_start() {
  docker compose -f docker-compose-production.yml up streamlit -d --build
}


main() {
  manage_logs
  manage_secrets
  manage_sqlite_data
  add_cron_job

  echo -e "Setup process completed.\n"
  echo "Starting streamlit application on port 8501..."

  sleep 2
  streamlit_start
}

# Main script starts here
main