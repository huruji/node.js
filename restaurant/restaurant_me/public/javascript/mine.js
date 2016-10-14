(function(groble,$){
	$.ajax({
		url:"/mine/api",
		dataType:"json",
		async:true,
		data:{},
		type:"GET",
		beforeSend:function(){

		}
		success:function(res){
			var errMsg="登录失败";
			if(res){
				if(res.code==0 && res.data){
					if(res.data.icon){
						$("#icon").attr("src",res.data.icon);
					}
					$("#name").html(res.data.name);
					$("#telephone").html(res.data.phoneNumber);
					return;
				}
				if(res.code==4){
					location.href="/login";
					return;
				}
				if(res.message){
					errMsg=res.message;
				}
			}
			layer.alert(errMsg,{
				skin:"layui-layer-molv",
				closeBtn:0,
				shift:2
			})
		}
		error:function(){
			layer.alert("请求失败，请重试！",{
				skin:"layui-layer-molv",
				closeBtn:0,
				shift:2
			})
		}
		complete:function(){
			
		}

	})
})(window,jQuery)