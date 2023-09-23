FROM mysql
COPY ./backend/commands.sql /docker-entrypoint-initdb.docker
ENV MYSQL_ROOT_PASSWORD=password 