FROM nginx:alpine

RUN apk add --no-cache openssl

RUN mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/localhost.key \
    -out /etc/nginx/ssl/localhost.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/OU=OrgUnit/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1"

RUN rm /etc/nginx/conf.d/default.conf

RUN mkdir -p /var/log/nginx

RUN mkdir -p /etc/nginx/templates

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]