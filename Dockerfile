# Wir nutzen Nginx als extrem schnellen Webserver
FROM nginx:alpine

# Kopiere alle deine Dateien (views, styles, controller etc.) in den Web-Ordner
COPY . /usr/share/nginx/html

# Nginx läuft intern auf Port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]