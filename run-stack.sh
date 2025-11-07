#!/bin/bash
if [ ! -d "./production-data" ]; then
  mkdir ./production-data
fi
podman compose up
