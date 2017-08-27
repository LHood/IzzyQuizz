drop table if exists questions
create table questions(
	id integer primary key autoincrement,
	title text not null,
	answerId integer not null
);
