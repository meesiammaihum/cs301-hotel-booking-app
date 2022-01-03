FROM python:3-slim
WORKDIR /usr/src/payments
ENV PATH="/usr/src/payments/.local/bin:${PATH}"
# set argument vars in docker-run command
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_DEFAULT_REGION
# flask form key
ARG FLASK_SECRET_KEY

ENV AWS_ACCESS_KEY_ID $AWS_ACCESS_KEY_ID
ENV AWS_SECRET_ACCESS_KEY $AWS_SECRET_ACCESS_KEY
ENV AWS_DEFAULT_REGION $AWS_DEFAULT_REGION
ENV FLASK_SECRET_KEY $FLASK_SECRET_KEY

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY services/payments/src/payments.py .
COPY services/payments/src/ocbcaccounts.py .
COPY services/payments/src/posbaccounts.py .
COPY services/payments/src/uobaccounts.py .
CMD ["python", "./payments.py"]
