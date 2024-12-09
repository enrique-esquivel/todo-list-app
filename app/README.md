# Example to-do List Application

This repository is a simple to-do list manager that runs on Node.js.

## Getting started

### Install Podman

First, you need to install Podman on your system. 

- **For macOS**: 
  ```
  brew install podman
  podman machine init
  podman machine start
  ```

- **For Other OS**:
For detailed instructions, visit the [official Podman installation guide](https://podman.io/docs/installation).

## Clone the repository

Open a terminal and clone this sample application.

```
git clone https://github.com/enrique-esquivel/todo-list-app
cd todo-list-app
```

## Run the app

In the project directory, start the application using Podman Compose:

```
podman compose up -d --build
```

When you run this command, you should see an output similar to this:

```
[+] Running 4/0
 ✔ Network app_default           Created                                                   0.0s 
 ✔ Volume "app_todo-mysql-data"  Created                                                   0.0s 
 ✔ Container app-mysql-1         Created                                                   0.1s 
 ✔ Container app-app-1           Created                                                   0.1s 
Attaching to app-1, mysql-1
```

## List the containers

To see the running containers:

```
podman ps
```

You should see output similar to this:

```
NAME                    IMAGE            COMMAND                  SERVICE   CREATED          STATUS          PORTS
todo-list-app-app-1     node:18-alpine   "docker-entrypoint.s…"   app       24 seconds ago   Up 7 seconds    *********:3000->3000/tcp
todo-list-app-mysql-1   mysql:8.0        "docker-entrypoint.s…"   mysql     24 seconds ago   Up 23 seconds   3306/tcp, 33060/tcp
```

## Access the app

The to-do list app will be running at [http://localhost:3000](http://localhost:3000).

## Stopping the app

To stop the application, run:

```
podman compose down
```

This will stop and remove the containers, networks, and volumes created by `podman-compose up`.
```
