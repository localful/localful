# Docker
Docker is used to distribute the project for self-hosting.

## Using the Docker image

The docker image is published to the [Github Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry#about-the-container-registry)
and can be pulled like so:

```
docker pull ghcr.io/localful/localful-server
```

You can then run that image, however remember:
- You must supply all environment variables for the server as defined in `projects/server/.env.example`.
- You will need to expose the port which matches the `PORT` environment variable you define, for example `-p 8080:8080`.

## Development

The `localful/localful-server` docker image is automatically created and published via GitHub actions when a tag is created or pushed.

### Manually creating the image
To manually create a docker image locally for testing you can do:

```
docker build . --tag localful-server
```

### Run the image
```
docker run localful-server -p 8080:8080
```

