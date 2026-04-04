FROM python:3.10

WORKDIR /app

COPY . .

RUN pip install --upgrade pip

RUN pip install -r requirements.txt

# install shap separately (important)
RUN pip install shap

CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8080"]