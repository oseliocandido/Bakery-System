FROM postgres:16.6

# Install locale settings for Brazilian Portuguese
RUN localedef -i pt_BR -c -f UTF-8 -A /usr/share/locale/locale.alias pt_BR.UTF-8

# Set locale environment variable to Brazilian Portuguese
ENV LANG pt_BR.UTF-8
ENV LC_ALL pt_BR.UTF-8

COPY scripts/pg_startup.sql /docker-entrypoint-initdb.d/pg_startup.sql

