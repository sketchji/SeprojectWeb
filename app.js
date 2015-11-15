var express = require('express');
var mysql = require('mysql');
// var bodyParser = require("body-parser");
// var jwt = require("jsonwebtoken");
// var base64url = require('base64url');
// var secret = "sketchji";
var app = express();
app.use(express.static('cpenews'));

// login.js extended

var pool = mysql.createPool({
    //connectionLimit : 100, //important
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'seproject'
});

function handle_database(request,response){
	var path = request.route.path;
	pool.getConnection(function(error,conn){
		var queryString ={};
		if(path == '/news'){
			queryString = "SELECT E.eid,E.title,E.detail,T.time_post,Ca.ca_name FROM event E,category Ca,time T WHERE E.eid = T.eid AND Ca.ca_id = E.ca_id ORDER BY T.time_post DESC";
		}
		else if(path == '/news/:eid'){
			var id = request.params.eid;
			queryString = "SELECT E.eid,E.title,E.detail,T.time_post,Ca.ca_name,TIME_FORMAT(T.start_time, '%H:%i') start_time,TIME_FORMAT(T.end_time, '%H:%i') end_time,T.start_date,T.end_date FROM event E,category Ca,time T WHERE E.eid = T.eid AND Ca.ca_id = E.ca_id AND E.eid ="+id;
        }
        else if(path == '/category'){
            queryString = 'SELECT ca_name FROM `category`';
        }
        else if(path == '/time-table'){
            queryString = "SELECT C.cid,C.cnum,C.title,C.teacher,C.type,Ca.ca_name,Ca.color, TIME_FORMAT(T.start_time, '%H:%i') start_time,TIME_FORMAT(T.end_time, '%H:%i') end_time,T.room,Cd.day FROM time T,course C,category Ca,courseday Cd WHERE C.cid = T.cid and Ca.ca_id = C.ca_id and Cd.cid = C.cid";
            //event query-> SELECT E.eid,E.title,Ca.ca_name,Ca.color,TIME_FORMAT(T.start_time, '%H:%i') start_time,TIME_FORMAT(T.end_time, '%H:%i') end_time,T.room FROM time T,event E,category Ca WHERE E.eid = T.eid and Ca.ca_id = E.ca_id
        }
		conn.query(queryString,function(error,results){
			if(error){
				throw error;
			}
			else{
				//console.log(results);
				response.json(results);
			}
		});
		conn.release();
	});

}
app.get('/category',function(request,response){
    pool.getConnection(function(errorCon,conn) {
      conn.query('SELECT ca_name FROM `category`', function(errorQ, results) {
        response.json(results);
        conn.release();
      });
    });
});
app.get('/time-table',function(request,response){
  pool.getConnection(function(errorCon,conn) {
    conn.query("SELECT C.cid,C.cnum,C.title,C.teacher,C.type,Ca.ca_name,Ca.color, TIME_FORMAT(T.start_time, '%H:%i') start_time,TIME_FORMAT(T.end_time, '%H:%i') end_time,T.room,Cd.day FROM time T,course C,category Ca,courseday Cd WHERE C.cid = T.cid and Ca.ca_id = C.ca_id and Cd.cid = C.cid", function(errorQ, courseList) {
      conn.query("SELECT E.eid,E.title,Ca.ca_name,Ca.color,TIME_FORMAT(T.start_time, '%H:%i') start_time,TIME_FORMAT(T.end_time, '%H:%i') end_time,T.room FROM time T,event E,category Ca WHERE E.eid = T.eid and Ca.ca_id = E.ca_id", function(errorQ2, eventList) {
        response.json(courseList.concat(eventList));
        conn.release();
      });
    });
  });
});
app.get('/news',function(request,response){
	handle_database(request,response);
});
app.get('/news/:eid',function(request,response){
	handle_database(request,response);
});
app.listen(3000,function(){
	console.log('listening on 3000 \n')
});
