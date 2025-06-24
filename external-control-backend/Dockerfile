FROM python:3.13-alpine

# # Create necessary directories and set permissions
RUN mkdir -p /tmp && chmod 777 /tmp

# Install Flask
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application into the image
COPY src/ ./

# Tell Flask where to load the application from
ENV FLASK_APP simple_rest_api.py

# Expose Flask's default port
EXPOSE 5000

# Run the REST service with Flask development server
ENTRYPOINT ["python", "simple_rest_api.py"]