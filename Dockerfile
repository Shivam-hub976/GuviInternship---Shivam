FROM php:8.2-apache

# Copy your code into the container
COPY . /var/www/html/

# Enable Apache mod_rewrite if needed
RUN a2enmod rewrite

# Expose port 80
EXPOSE 80