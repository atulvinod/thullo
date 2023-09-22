CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name TEXT NOT NULL,
    image_url TEXT,
    password TEXT NOT NULL,
    email TEXT NOT NULL,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
);

CREATE TABLE boards (
    id INT PRIMARY KEY AUTO_INCREMENT,
created_by_user_id INT NOT NULL,
cover_url TEXT NULL,
    board_title TEXT NOT NULL,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_private BOOLEAN NOT NULL DEFAULT FALSE
);

create table board_columns (
    id int PRIMARY KEY AUTO_INCREMENT not null,
board_id INT NOT NULL,
column_order_index TINYINT DEFAULT 1 NOT NULL,
    column_title text not null,
    created datetime default CURRENT_TIMESTAMP,
    modified datetime not null default current_timestamp on UPDATE CURRENT_TIMESTAMP
);

create table card(
    id int primary key AUTO_INCREMENT not null,
    card_name text not null,
    card_description text not null,
column_id int not null,
board_id int not null,
cover_image_url text null,
    created datetime default CURRENT_TIMESTAMP not null,
    modified datetime not null default CURRENT_TIMESTAMP on update current_timestamp
);

create table card_labels (
    id int primary key not null AUTO_INCREMENT,
    card_id int not null,
    label_name text not null,
    label_color varchar(100) not null,
    created datetime not null default current_timestamp,
    modified datetime not null default CURRENT_TIMESTAMP on update current_timestamp
);

CREATE TABLE board_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    board_id INT NOT NULL,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE card_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    board_id INT NOT NULL,
    card_id INT NOT NULL,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE card_comments(
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    card_id INT NOT NULL,
    comment text not null,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE card_attachments(
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    attachment_url text not null,
    attachment_type varchar(100) not null,
    card_id INT NOT NULL,
    attachment_title text not null,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
create table card_comments(
    id int primary key AUTO_INCREMENT,
    user_id int not null,
    card_id int not null,
    created datetime not null default current_timestamp,
    modified datetime not null default current_timestamp on update CURRENT_TIMESTAMP,
    comment text not null
);

alter table card add column column_order tinyint not null default 1;
