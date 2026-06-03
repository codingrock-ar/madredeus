#!/bin/sh
docker compose -f /home/ariel/www/madredeus/docker-compose.yml exec -T backend sh -c "apt-get update && apt-get install -y libpng-dev libzip-dev zip zlib1g-dev"
docker compose -f /home/ariel/www/madredeus/docker-compose.yml exec -T backend sh -c "docker-php-ext-install gd zip"
docker compose -f /home/ariel/www/madredeus/docker-compose.yml exec -T backend sh -c "php composer.phar require phpoffice/phpspreadsheet"
