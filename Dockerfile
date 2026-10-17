# CraftyPic · image unique nginx + php-fpm (remplace le docker-compose nginx/php).
# La DB (MariaDB) est désormais une ressource Coolify séparée, plus dans cette image.
FROM php:7.4-fpm

# php:7.4 = Debian 11 (bullseye), désormais EOL : les dépôts sont passés sur
# archive.debian.org (sinon apt renvoie des 404). On repointe + on désactive la
# vérif de date des Release archivés, et on retire la suite -updates (absente de l'archive).
RUN sed -i \
		-e 's|http://deb.debian.org/debian|http://archive.debian.org/debian|g' \
		-e '/bullseye-updates/d' \
		/etc/apt/sources.list \
	&& echo 'Acquire::Check-Valid-Until "false";' > /etc/apt/apt.conf.d/99no-check-valid

# Dépendances système : nginx, supervisor (lance php-fpm + nginx ensemble),
# msmtp (envoi d'emails), et les libs pour les extensions PHP (gd, zip, imagick).
RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		nginx \
		supervisor \
		msmtp \
		zlib1g-dev \
		libzip-dev \
		libpng-dev \
		libjpeg-dev \
		libfreetype6-dev \
		libmagickwand-dev \
	&& docker-php-ext-configure gd --with-freetype --with-jpeg \
	&& docker-php-ext-install gd pdo pdo_mysql zip \
	&& pecl install imagick \
	&& docker-php-ext-enable imagick \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/*

# Config PHP (sessions, mail via msmtp, limites d'upload…)
COPY php.ini /usr/local/etc/php/conf.d/custom-php.ini

# Logs nginx + php redirigés vers stdout/stderr → visibles dans Coolify
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
	&& ln -sf /dev/stderr /var/log/nginx/error.log \
	&& ln -sf /dev/stderr /var/log/php_errors.log \
	&& touch /var/log/msmtp.log \
	&& chown www-data:www-data /var/log/msmtp.log \
	&& chmod 600 /var/log/msmtp.log

# Config nginx (fastcgi_pass → 127.0.0.1:9000 en mono-conteneur)
COPY nginx.conf /etc/nginx/nginx.conf

# Code de l'app
COPY app /var/www/html
RUN mkdir -p /var/www/html/uploads \
	&& chown -R www-data:www-data /var/www/html \
	&& chmod -R 755 /var/www/html

# Supervisor : php-fpm + nginx dans le même conteneur
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# nginx écoute sur 80 (cf. nginx.conf) → Port à exposer côté Coolify
EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
