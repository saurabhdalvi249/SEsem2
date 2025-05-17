# Use the official Nginx image from Docker Hub
FROM nginx:latest

# Copy your application files into the Nginx container
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/

# Expose port 80 (default for Nginx)
EXPOSE 80

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
