function submitDish(restaurant,dishes){
	console.log(dishes[0][0].price);
	var lastSelectedClassfyIndex=0;
	var currentSelectedClassfyIndex=0;
	var classfies=restaurant.classifies.split("|");
	console.log(classfies);
	for(var i=0;i<classfies.length;i++){
		(function(i){
		if(i==0){
			$("#classfy"+i).css("background-color","#ff8c00");
		}else{
			$("#dishes_list"+i).css("display","none")
		}
		var index=i;

		$("#classfy"+i).click(function(){
			lastSelectedClassfyIndex=currentSelectedClassfyIndex;
			currentSelectedClassfyIndex=i;
			console.log(index);
			$("#classfy"+lastSelectedClassfyIndex).css("background-color","transparent");
			$("#classfy"+currentSelectedClassfyIndex).css("background-color","#ff8c00");
			$("#dishes_list"+lastSelectedClassfyIndex).hide();
			$("#dishes_list"+currentSelectedClassfyIndex).show();
		});
		for(var j=0;j<dishes[i].length;j++){
			(function(j){

			dishes[i][j]["count"]=0;
			$("#descrease_"+i+"_"+j).click(function(){
				if(dishes[i][j]["count"]>0){
					dishes[i][j]["count"]-=1;
					$("#count_"+i+"_"+j).html(dishes[i][j]["count"]);
					var totalPrice=getTotalPrice();
					$("#totalPrice").html(totalPrice);
				}
			});
			$("#increase_"+i+"_"+j).click(function(){

				var totalPrice=getTotalPrice();
				console.log(i);
				var newTotalPrice=totalPrice+dishes[i][j].price;
				if(newTotalPrice>28){
					layer.alert("总金额不能超过28元",{
						skin:"layui-layer-molv",
						closeBtn:0,
						shift:2
					})
				}else{
					dishes[i][j]["count"]+=1;
					$("#count_"+i+"_"+j).html(dishes[i][j]["count"]);
					$("#totalPrice").html(newTotalPrice);
				}
			})
		})(j)
	}
	})(i)
	}
	function getTotalPrice(){
		var totalPrice=0;
		for(var i=0;i<dishes.length;i++){
			for(var j=0;j<dishes[i].length;j++){
				if(dishes[i][j].price){
					totalPrice +=dishes[i][j].price*dishes[i][j].count
				}
			}
		}
		return totalPrice;
	}

	$("#commitBtn").click(function(){
		var orders=[];

		for(var i=0;i<dishes.length;i++){
			for(var j=0;j<dishes[i].length;j++){
				if(dishes[i][j]["count"]>0){
					var obj={dishes_id:dishes[i][j].id,dishes_count:dishes[i][j].count};
					orders.push(obj);
				}
			}
		}
		console.log(orders.length);
		if(orders.length===0){
			layer.alert("请至少选择一个菜",{
				skin:"layui-layer-molv",
				closeBtn:0,
				shift:2
			});
			return;
		}
		$.ajax({
			url:"/order",
			dataType:"json",
			async:true,
			data:{orders:JSON.stringify(orders)},
			type:"POST",
			beforeSend:function(){

			},
			success:function(response){
				var errMsg="创建订单失败";
				if(response){
					if(response.code==0){
						console.log("ddddd");
						location.href="/order/success";
						return;
					}
					if(response.message){
						errMsg=response.message;
					}
				}
				layer.alert(errMsg,{
					skin:"layui-layer-molv",
					closeBtn:0,
					shift:2
				});
			},
			error:function(){
				layer.alert("请求失败，请重试！",{
					skin:"layui-layer-molv",
					closeBtn:0,
					shift:2
				})
			},
			complete:function(){}
		})
	})
}
