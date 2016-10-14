var express=require("express");
var path=require("path");
var bodyParser=require("body-parser");
var crypto=require("crypto");
var mysql=require("mysql");

//连接数据库的基本设置
var DBconnect=mysql.createConnection({
	host:"localhost",
	port:3306,
	user:"huruji",
	password:"xie138108",
	database:"db_order_dishes"
});
DBconnect.connect();

var app=express();

app.set("views",path.join(__dirname,"views"));
app.set("view engine","jade");
app.use(express.static(path.join(__dirname,"public")));

app.use(bodyParser.urlencoded({extended:false}));

//首页路由
app.route("/").get(function(req,res){
	if(req.headers.cookie){
		var userId=cookieToJson(req.headers.cookie)[userId];
		DBconnect.query("SELECT * FROM t_restaurant LIMIT 0,10",function(err,results,fields){
			console.log("获取餐馆列表");
			res.render("restaurant/list",{"restaurantList":results});
		})
	}else{
		res.redirect("/login");
	}

})

//登录页路由
app.route("/login").get(function(req,res){
	res.render("login");
	console.log(req.headers);
	console.log(req.params);
}).post(function(req,res){
	var formData=req.body;
	console.log(formData);
	var sha=crypto.createHash("md5");
	sha.update(req.body.password);
	var password_md5=sha.digest("hex");
    //连接数据库
    DBconnect.query("SELECT id,name,password FROM t_user WHERE name=? AND password=?",[formData.username,password_md5],function(err,results,fields){
    	console.log(results);
    	if(results.length==0){
    		var error={
    			code:2,
    			message:"用户名或者密码错误"
    		};
    		res.send(error);
    	}else{
    		res.cookie("userId",results[0].id,{
    			maxAge:30*60*1000,
    			path:"/",
    			httpOnly:true
    		});
    		var success={
    			code:0,
    			message:"成功",
    			userId:results[0].id
    		};
    		res.send(success);
    	}
    })

})
app.route("/dishes/list/:restaurantId").get(function(req,res){
	var restaurantId=req.params.restaurantId;
	console.log(restaurantId);
	DBconnect.query("SELECT * FROM t_restaurant WHERE id=?",[restaurantId],function(err,restaurants,fields){
		if(err||restaurants.length===0){
			res.redirect("/");
		}else{
			console.log(restaurants[0].id)
			DBconnect.query("SELECT * FROM t_dishes WHERE restaurant_id=?",[restaurantId],function(err,dishes,fields){
				if(err||dishes.length===0){
					res.redirect(/dishes/list/restaurantId);
				}else{
					//按照json格式分类储存食物
					var map={};
					//储存食物的分类名
					var mapArr=[]
					//得到餐馆中的食物类名
					var classifies=restaurants[0].classifies.split("|");
					classifies.forEach(function(classfy){
						map[classfy]=[];
						mapArr.push(classfy);
					});
					dishes.forEach(function(dish){
						map[dish.classify].push(dish);
					});
					console.log(map[classifies[0]]);
					//按照数组分类储存如[[面条类的所有食物],[砂锅类的所有食物]]
					var dishesJson=[];
					for(var i=0;i<classifies.length;i++){
						dishesJson[i]=map[classifies[i]];
					}
					console.log(dishesJson);
					var sendBody={'restaurant': restaurants[0], 'dishes': dishesJson};
					res.render("dishes/list",sendBody);
				}
			})
		}
	})
})

app.route("/order").post(function(req,res){
	console.log(req.headers.cookie);
	if(req.headers.cookie){
	var userId=cookieToJson(req.headers.cookie).userId;
	console.log("aaaa");
	console.log(userId);
	if(userId){

		var today=setDateDB();
		DBconnect.query("SELECT * FROM t_order WHERE user_id = ? AND selected_date = ?",[userId,today],function(err,results,fields){
			if(results&&results.length>0){
				var error={
					code:5,
					message:"今天您已经创建过订单了，不能再创建了"
				};
				res.send(error);
			}else{
				var orderTotals=eval(req.body.orders);
				console.log(orderTotals);
				if(orderTotals&&orderTotals.length>0){
					console.log(orderTotals);
					for(var i=0;i<orderTotals.length;i++){
								console.log(typeof orderTotals);
					var orders=orderTotals[i];
					var dishes_id=orders.dishes_id;
					var dishes_count=orders.dishes_count;
					DBconnect.query("INSERT INTO t_order(selected_date, user_id, dishes_id, dishes_count) VALUES (?, ?, ?, ?)",[today, userId, dishes_id, dishes_count],function(err,results,fields){
						if(err){
							var error={
								code:1,
								message:"服务器异常"
							};
							res.send(error);
						}else{
							if(i==orderTotals.length-1){
								var success={
									code:0,
									message:"提交订单成功"
								};
								res.send(success);
							}
						}
					});
				}
				}
			}
		})
	}
}else{
	console.log("redirect");
	res.redirect("/login");
}
})
/*订单提交成功*/
app.route("/order/success").post(function(req,res){
	res.render("order/success",{totalPrice:28});
})
/*获取我的信息*/
app.route("/mine").get(function(req,res){
	res.render("mine",{totalPrice:28});
})

/*关于*/
app.route("/about2").get(function(req,res){
	res.render("about2",{});
})
/*修改密码*/
app.route("/mine/change-password").get(function(req,res){
	res.render("change-password",{});
})

app.listen(3001,function(){
	console.log("listenging 3001");
});

//resquest.headers.cookie默认的表现为cookie:"userId=1;name=huruji"
function cookieToJson(cookieValue){
	var cookieEqu=cookieValue.split(";");
	var cookieJson={};
	for (var i=0;i<cookieEqu.length;i++){
		var keyValue=cookieEqu[i].split("=");
		cookieJson[keyValue[0]]=keyValue[1];
	}
	return cookieJson
}

//数据库中CURRENT_DATE()方法中的格式是2016-09-09，故通过js同样返回一个这样的字符串
function setDateDB(){
	var today=new Date();
	var year=today.getFullYear();
	var month=today.getMonth()+1;
	var day=today.getDate();
	if(month<10){
		month="0"+month;
	}
	return year+"-"+month+"-"+day;
}
