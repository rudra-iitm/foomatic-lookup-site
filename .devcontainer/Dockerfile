FROM mcr.microsoft.com/devcontainers/typescript-node:20

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    foomatic-db-engine \
    cups-filters \
    ghostscript \
    bsdmainutils \
    libxml2-utils \
    xsltproc
