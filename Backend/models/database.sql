CREATE DATABASE realms;

CREATE TABLE test(
    email SERIAL PRIMARY KEY,
    messageText VARCHAR(65535),
    messageTime INT(255)

);