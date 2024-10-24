if [ "$(docker ps -a | grep bot)" ]; then
    docker cp bot:/app/files/contracts files;
fi