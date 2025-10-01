# YCSB Benchmark

## Run YCSB benchmark

Make sure the container is running
Test the connection

## For frontend

frontend runs on 3000

use `npm run dev`

## For backend

for python -- soon deprecated

backend runs on 8000
use `uvicorn main:app --reload`

for laravel 

`./vendor/bin/sail up -d` to start the containers
`./vendor/bin/sail down` to stop them 

`./vendor/bin/sail artisan migrate`
`./vendor/bin/sail artisan serve`  # optional, but Sail handles Nginx so usually not needed

`./vendor/bin/sail composer require package/name`

