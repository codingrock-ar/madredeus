FROM php:8.2-apache

# Habilitar mod_rewrite para Slim
RUN a2enmod rewrite

# Instalar extensiones necesarias para MySQL
RUN docker-php-ext-install pdo pdo_mysql

# Configurar el DocumentRoot a public/
ENV APACHE_DOCUMENT_ROOT /var/www/html/public

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Set working directory
WORKDIR /var/www/html

EXPOSE 80
