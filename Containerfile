FROM  registry.redhat.io/rhel8/httpd-24:1-335.1724231549
COPY . /var/www
USER root
workdir /var/www
RUN dnf install -y python2 npm && npm install && npm run build && npm cache clean --force && dnf clean -y all
RUN dnf install -y python2-pip.noarch && pip2 install -r requirements.txt
RUN mkdir /data
COPY pipes.conf $HTTPD_MAIN_CONF_D_PATH
WORKDIR $HTTPD_APP_ROOT
EXPOSE 8081
USER 1001
