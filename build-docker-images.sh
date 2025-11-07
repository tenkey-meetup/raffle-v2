#!/bin/bash
(cd ./frontend && bash build-docker-image.sh)
(cd ./backend && bash build-docker-image.sh)
