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

Laravel with Sail

When you install Laravel with Sail, it pulls in a package called laravel/sail via Composer.
Composer installs packages under the vendor/ directory:

vendor/ → all PHP dependencies.
vendor/bin/ → executables (binaries) provided by those dependencies.

So:

./vendor/bin/sail is just a small wrapper script that knows how to run Docker Compose for your project.
When you type ./vendor/bin/sail artisan ..., you’re really saying:

“Use Docker (via Sail) to execute this Artisan command inside the Laravel container with the correct PHP/MySQL/etc.”
Without it, if you just run php artisan on your host machine, it might use:

A different PHP version than Laravel expects.
Missing extensions.
Wrong environment variables.

That’s why we stick with ./vendor/bin/sail — it guarantees the command runs in the Dockerized environment where everything matches Laravel’s requirements.

And to start it, you only need to have the containers up.

The backend itself isn't a container currently. In the sense that this project got curled up, it's more of a monolith.
So when you want to run the backend, you just run `./vendor/bin/sail up -d`
In the `docker-compose.yml` file, you can see that the laravel project is missing so the structure is like this:

`docker-compose.yml` inside ycsb folder is the bridge for YCSB benchmark. This creates the necessary environment for the YCSB benchmark to run. 

- The YCSB Benchmark itself lives through the scripts inside /scripts
- the frontend lives in the frontend folder
- the backend lives in the backend folder

In the future, the whole system will be dockerized so it will be one single source of truth.