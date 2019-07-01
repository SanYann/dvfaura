psql --host=127.0.0.1 --port=5432 --dbname=laure --username=postgre --password=Merlin27Postgres

CREATE TABLE epci (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    CODGEO VARCHAR(100) NOT NULL,
    LIBGEO VARCHAR(100) NOT NULL,
    EPCI VARCHAR(100) NOT NULL,
    LIBEPCI VARCHAR(100) NOT NULL
);