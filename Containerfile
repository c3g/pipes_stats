FROM almalinux:9
COPY build/         /var/www/build/
COPY cgi-bin/       /var/www/cgi-bin/
COPY requirements.txt /var/www/requirements.txt
WORKDIR /var/www
USER root
RUN dnf install -y httpd python3 python3-pip && \
    pip3 install -r requirements.txt && \
    chmod +x /var/www/cgi-bin/*.py /var/www/cgi-bin/*.cgi && \
    dnf clean all
RUN mkdir -p /data
COPY pipes.conf /etc/httpd/conf.d/pipes.conf
EXPOSE 8081
CMD ["httpd", "-D", "FOREGROUND"]
