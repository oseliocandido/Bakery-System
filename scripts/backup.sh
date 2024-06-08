#!/bin/bash

# Get CURRENT_DATE to be used as part of key name on S3 bucket.
export DAY=$(date +"%d")
export MONTH=$(date +"%m")
export YEAR=$(date +"%Y")

# Start Backup Service
docker compose -f $HOME/myapp/docker-compose-production.yml up backup  >> $HOME/myapp/logs/aws-bck.log
