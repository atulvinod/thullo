FROM node:18-alpine
RUN npm install -g create-react-app

ENV REACT_APP_FE_BASE_URL='/v1'
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