# Use the official PHP image with Apache
FROM php:8.2-apache

# Install system dependencies and PHP extensions if needed (e.g., mysqli, pdo, pdo_mysql, mongodb, redis)
RUN apt-get update && \
    apt-get install -y libpng-dev libjpeg-dev libfreetype6-dev zip git unzip && \
    docker-php-ext-install mysqli pdo pdo_mysql && \
    pecl install mongodb redis && \
    docker-php-ext-enable mongodb redis

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Copy composer files and install dependencies
COPY composer.json composer.lock ./
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader

# Copy the rest of your application code
COPY . .

# Set proper permissions (optional, for uploads/logs)
# RUN chown -R www-data:www-data /var/www/html

# Expose port 80
EXPOSE 80

# Start Apache in the foreground
CMD ["apache2-foreground"]