FROM node:18-alpine
RUN npm install -g create-react-app

ENV REACT_APP_ENV='PROD'
ENV REACT_APP_FE_BASE_URL='/v1'
ENV APP_NAME="app"
ENV ENV="PROD"

# Build Arg defaults
ARG unsplash_api_key="FNyywR9UaPgMSVaGo_oSdT0EaWXRSfIhEGQh12_nqPM"
ARG redis_host='localhost'
ARG redis_port=6379
ARG redis_password='password'
ARG db_host='localhost'
ARG db_user='postgres'
ARG db_password='mypassword'
ARG db_port='5432'
ARG db_client='pg'
ARG db_database='thullo'
ARG firebase_api_key='AIzaSyAvQve5Gve8p8nvxoRF0vIyxIJphytpWPU'
ARG firebase_domain='thullo-d8d98.firebaseapp.com'
ARG firebase_project_id='thullo-d8d98'
ARG firebase_storage_bucket='thullo-d8d98.appspot.com'
ARG firebase_message_sender_id='169922888993'
ARG firebase_config_api_id='1:169922888993:web:96608c54da8769eb90ea60'

# Necessary environment variables
ENV LOG_SETTINGS__PATH ='/app/backend/logs'
ENV DATABASE_CLIENT=${db_client}
ENV REACT_APP_UNSPLASH_API_KEY=${unsplash_api_key}
ENV REDIS_SETTINGS__HOST=${redis_host}
ENV REDIS_SETTINGS__PORT=${redis_port}
ENV REDIS_SETTINGS__PASSWORD=${redis_password}
ENV DB__CONNECTIONS__MASTER__HOST=${db_host}
ENV DB__CONNECTIONS__MASTER__PORT=${db_port}
ENV DB__CONNECTIONS__MASTER__DATABASE=${db_database}
ENV DB__CONNECTIONS__MASTER__USERNAME=${db_user}
ENV DB__CONNECTIONS__MASTER__PASSWORD=${db_password}
ENV DB__CONNECTIONS__SLAVE__HOST=${db_host}
ENV DB__CONNECTIONS__SLAVE__PORT=${db_port}
ENV DB__CONNECTIONS__SLAVE__DATABASE=${db_database}
ENV DB__CONNECTIONS__SLAVE__USERNAME=${db_user}
ENV DB__CONNECTIONS__SLAVE__PASSWORD=${db_password}
ENV FIREBASE_CONFIG__API_KEY=${firebase_api_key}
ENV FIREBASE_CONFIG__AUTH_DOMAIN=${firebase_domain}
ENV FIREBASE_CONFIG__PROJECT_ID=${firebase_project_id}
ENV FIREBASE_CONFIG__STORAGE_BUCKET=${firebase_storage_bucket}
ENV FIREBASE_CONFIG__MESSAGE_SENDER_ID=${firebase_message_sender_id}
ENV FIREBASE_CONFIG__API_ID=${firebase_config_api_id}

RUN mkdir /app
RUN mkdir /app/backend
RUN mkdir /app/frontend
COPY ./backend /app/backend
COPY ./frontend /app/frontend
WORKDIR /app/backend
RUN mkdir logs
RUN mkdir logs/thullo
RUN mkdir logs/thullo/appLogs
RUN npm install
WORKDIR /app/frontend
RUN npm install

RUN npm run build
RUN cp -r -f /app/frontend/build/ /app/backend/public
EXPOSE 5500
CMD [ "node", "/app/backend/bin/server.js" ]