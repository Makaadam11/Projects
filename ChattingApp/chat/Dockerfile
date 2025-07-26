# FROM python:3.9-slim
FROM --platform=linux/amd64 python:3.10-slim-bullseye

# WORKDIR /python-api

# copy everything in this folder
COPY . .
# COPY templates/ /templates/

# install required libraries
RUN pip install emoji Flask Flask_SocketIO nltk numpy spacy tensorflow tensorflow_intel transformers

# command
CMD ["python", "server.py"]