image="machloop/bi-server:v0.0.29"

# docker build -f Dockerfile.dev -t ${image} .
docker save ${image} | gzip | ssh root@10.0.4.153 'cat | docker load'

# Machloop@123