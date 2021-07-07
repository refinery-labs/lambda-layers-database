docker rm $(docker ps -a | grep lambda-layers-database_front-end | cut -c1-12); docker-compose build front-end
