#!/bin/bash
cd /home/ariel/www/madredeus/backend
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php -r "unlink('composer-setup.php');"
php composer.phar require phpoffice/phpspreadsheet
