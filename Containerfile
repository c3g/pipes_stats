FROM  quay.io/fedora/httpd-24:20240925
COPY . /var/www
USER root
workdir /var/www
RUN dnf install -y python2.7 npm perl-CGI-Session.noarch && python2.7 -m ensurepip && \
     pip2 install -r requirements.txt  && npm install --legacy-peer-deps && \
     npm run build && npm cache clean --force && dnf clean -y all 
RUN mkdir /data
COPY pipes.conf $HTTPD_MAIN_CONF_D_PATH
WORKDIR $HTTPD_APP_ROOT
EXPOSE 8081
USER 1001
