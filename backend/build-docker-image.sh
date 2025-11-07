#!/bin/bash
#podman build --platform linux/amd64,linux/arm64  -f Dockerfile -t tenkey-raffle-v2-backend:latest
podman build -f Dockerfile -t tenkey-raffle-v2-backend:latest