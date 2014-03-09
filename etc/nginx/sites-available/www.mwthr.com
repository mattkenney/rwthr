server
{
    listen 80;
    server_name mwthr.com *.mwthr.com;

    error_page 400 401 402 403 404 405 406 407 408 409 410 411 412 413 414 415 416 417 /error/4xx.html;
    error_page 500 501 502 503 504 505 /error/5xx.html;

    access_log /var/log/nginx/mwthr.access.log;

    location ~* ^/(24|120|atl|cwa|icao|now|pac|station)
    {
        rewrite . / redirect;
    }

    gzip_types application/json;
    gzip_min_length 128;

    location /data/
    {
        expires modified +3h15m;
        root /home/ubuntu/rwthr/public;
    }
    location /ico/
    {
        expires 24h;
        root /home/ubuntu/rwthr/public;
    }
    location /images/
    {
        expires 24h;
        root /home/ubuntu/rwthr/public;
    }
    location /js/
    {
        expires 24h;
        root /home/ubuntu/rwthr/public;
    }
    location /partials/
    {
        expires 24h;
        root /home/ubuntu/rwthr/public;
    }
    location = /favicon.ico
    {
        expires 24h;
        root /home/ubuntu/rwthr/public;
    }
    location = /robots.txt
    {
        expires 24h;
        root /home/ubuntu/rwthr/public;
    }

    location /
    {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $http_host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
