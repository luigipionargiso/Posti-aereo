/* run: sqlite3 db.sqlite < ./create_database_all_data.sql */

BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	"email"	TEXT NOT NULL,
	"name"	TEXT NOT NULL,
	"salt"	TEXT NOT NULL,
	"password"	TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS "airplanes" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	"type"	TEXT NOT NULL,
	"nRows"	INTEGER NOT NULL,
	"seatsPerRow"	INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS "reservations" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	"airplaneId"	INTEGER NOT NULL,
	"userId"	INTEGER NOT NULL,
	"rowNumber"	INTEGER NOT NULL,
    "seatNumber"	INTEGER NOT NULL
);

INSERT INTO "users" VALUES (1,'user1@test.com','Bob', '123348dusd437840', 'bddfdc9b092918a7f65297b4ba534dfe306ed4d5d72708349ddadb99b1c526fb'); /* password='pwd' */
INSERT INTO "users" VALUES (2,'user2@test.com','Alice',   '7732qweydg3sd637', '498a8d846eb4efebffc56fc0de16d18905714cf12edf548b8ed7a4afca0f7c1c');
INSERT INTO "users" VALUES (3,'user3@test.com','Kamala',   'wgb32sge2sh7hse7', '09a79c91c41073e7372774fcb114b492b2b42f5e948c61d775ad4f628df0e160');
INSERT INTO "users" VALUES (4,'user4@test.com','Alex',   'safd6523tdwt82et', '330f9bd2d0472e3ca8f11d147d01ea210954425a17573d0f6b8240ed503959f8');

INSERT INTO "airplanes" VALUES (1,'local',15,4);
INSERT INTO "airplanes" VALUES (2,'regional',20,5);
INSERT INTO "airplanes" VALUES (3,'international',25,6);

/*                                 id, airplane, user, 		row, 	seat	*/
INSERT INTO "reservations" VALUES (	1,		1,		1,		3,		3	);
INSERT INTO "reservations" VALUES (	2,		1,		1,		3,		4	);
INSERT INTO "reservations" VALUES (	3,		2,		1,		13,		1	);
INSERT INTO "reservations" VALUES (	4,		2,		1,		20,		2	);
INSERT INTO "reservations" VALUES (	5,		1,		2,		5,		2	);
INSERT INTO "reservations" VALUES (	6,		1,		2,		10,		4	);
INSERT INTO "reservations" VALUES (	7,		3,		2,		9,		1	);
INSERT INTO "reservations" VALUES (	8,		3,		2,		3,		3	);

COMMIT;