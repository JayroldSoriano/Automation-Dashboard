# 1️⃣ Use an official Nginx base image
FROM nginx:alpine

# 2️⃣ Remove default web files
RUN rm -rf /usr/share/nginx/html/*

# 3️⃣ Copy your Expo web build
COPY dist/ /usr/share/nginx/html/

# 4️⃣ Optional: set custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
