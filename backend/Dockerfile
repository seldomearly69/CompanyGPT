FROM python:3.9-slim


WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir -r requirements.txt

# RUN python -m nltk.downloader punkt


ENV PORT 5001

CMD ["python", "app.py"]