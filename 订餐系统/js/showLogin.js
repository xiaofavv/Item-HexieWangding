// yc.addEvent("btn","click",function(){
// 	//给后台发送登录的数据
// 	yc.ajaxRequest("http://218.196.14.220:8080/res/resuser.action",{
// 		'method':'POST',
// 		'send':'op=login&username='+yc.$("username").value+"&pwd="+yc.$("pwd").value+"&valcode="+yc.$("valcode").value,
// 		'jsonResponseListener':showLogin
// 	});
 	
 	
// 	登录
function login(){
	var options={
		"completeListener":function (){ //判断后台回数据时的操作
			if(this.responseJSON.code==1){
				// window.opener.location.reload(); //子窗口刷新父窗口
				window.opener.document.getElementById("in").innerHTML="欢迎您，"+yc.$("username").value;
				window.close();
			}else if(this.responseJSON.code==0){
				alert("亲，登录失败了呢，╮(╯3╰)╭");
				
			}else{
				alert("系统正忙呢，亲，稍候登录吧，╮(╯3╰)╭");
			}
		}
	}
	yc.xssRequest("http://218.196.14.220:8080/res/resuser.action?op=login&username="+yc.$("username").value+"&pwd="+yc.$("pwd").value+"&valcode="+yc.$("valcode").value,options);
	
}
yc.addEvent("btn","click",login);

