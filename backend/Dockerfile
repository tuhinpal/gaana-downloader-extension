FROM ubuntu:latest

run apt update
RUN apt install software-properties-common -y
RUN add-apt-repository ppa:savoury1/ffmpeg4
RUN apt update
RUN apt install ffmpeg -y
RUN apt install npm -y

WORKDIR /app
COPY . /app
RUN npm install
CMD ["npm", "start"]
EXPOSE 8080