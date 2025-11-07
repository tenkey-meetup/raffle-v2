#!/bin/bash

# Multiarchが安定しないので一旦削除
# https://github.com/golang/go/issues/69255#issuecomment-3382727613
# GODEBUG=cpu.bmi2=off podman build --platform linux/amd64,linux/arm64  -f Dockerfile -t tenkey-raffle-v2-frontend:latest
podman build -f Dockerfile -t tenkey-raffle-v2-frontend:latest