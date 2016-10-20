//检查登录
function login_checked(){
	var options={
		"completeListener":function (){
			if(this.responseJSON.code==1){
				yc.$("login").innerHTML="欢迎您，"+this.responseJSON.obj.username;
			}
		}
	}
	yc.xssRequest("http://218.196.14.220:8080/res/resuser.action?op=checkLogin",options);
}
yc.addLoadEvent(login_checked());

//显示所有菜
function showAllFoods(){
	var options={
		"completeListener":function (){
			if(this.responseJSON.code==1){
				var divtable=document.createElement("div");
				divtable.setAttribute('id','mytable');
				var table=document.createElement("table");
				divtable.appendChild(table);

				var photoSrcs=new Array();
				var alts=new Array();
				for(var i=0;i<this.responseJSON.obj.length;i++){
					photoSrcs.push("http://218.196.14.220:8080/res/images/"+this.responseJSON.obj[i].fphoto);
					alts.push(this.responseJSON.obj[i].fname);
				}
				for(var i=0;i<photoSrcs.length/3;i++){
					var tr=document.createElement("tr");
					for(var j=0;j<3;j++){
						var td=document.createElement("td");
						tr.appendChild(td);
					}
					table.appendChild(tr);
				}
				
				yc.$("conRight").appendChild(divtable);

				var tds=document.getElementsByTagName("td");
				for(var k=0;k<photoSrcs.length;k++){
					var name=document.createElement("p");
					name.innerHTML=this.responseJSON.obj[k].fname;
					name.className="foodname";

					var img=document.createElement("img");
					img.src=photoSrcs[k];
					img.id=this.responseJSON.obj[k].fid;
					img.alt=alts[k];
					img.title="点击查看详情";

					var span1=document.createElement("span");
					span1.innerHTML="原价："+this.responseJSON.obj[k].normprice+"元";
					span1.className="normprice";

					var span2=document.createElement("span");
					span2.innerHTML="现价："+this.responseJSON.obj[k].realprice+"元";
					span2.className="realprice";

					tds[k].appendChild(name);
					tds[k].appendChild(img);
					tds[k].appendChild(span1);
					tds[k].appendChild(span2);
				}	
			}
		}
	}
	yc.xssRequest("http://218.196.14.220:8080/res/resfood.action?op=findAllFoods",options);
}
yc.addLoadEvent(showAllFoods());

//显示已有历史浏览
yc.addLoadEvent(function(){
	if(Cookies.get("foodtitle")){
		var history=yc.$("history");
		var ul=document.createElement("ul");
		var str="<li ><a class='imgtitle' href="+Cookies.get(decodeURIComponent("foodurl"))+">"+Cookies.get(decodeURIComponent("foodtitle"))+"</a></li>";
		ul.innerHTML=str;
		history.appendChild(ul);
	}
})

var str='';
str+="<form id='myform'>";
str+="送货地址：<input type='text' placeholder='送货地址' id='address'/><br/>";
str+="电话：<input type='text' placeholder='电话' id='phone'/><br/>";
str+="送货时间：<input type='text' placeholder='送货时间' id='time'/><br/>";
str+="附言：<textarea rows='3' cols='20' id='ps'></textarea><br/>";
str+="<input type='button' value='确认购买' id='submit'/>";
str+="</form>";
yc.$("conRight").innerHTML=str;
yc.$("myform").style.display='none';


yc.addLoadEvent(function(){
	var imgs=yc.$("conRight").getElementsByTagName("img");
	for(var i=0;i<imgs.length;i++){
		(function(index){
			var foodtitle=imgs[index].parentNode.firstChild.innerHTML;
			var foodurl=imgs[index].src;
			yc.addEvent(imgs[index],'click',function(){
				Cookies.set("foodtitle",foodtitle,3);
				Cookies.set("foodurl",foodurl,3);
				// yc.ajaxRequest("http://218.196.14.220:8080/res/resfood.action",{
				// 	'method':'POST',
				// 	'send':'op=findFood&fid='+imgs[index].id,
				// 	'jsonResponseListener':showDetail
				// });
				var options1={
					"completeListener":showDetail
				}
				yc.xssRequest("http://218.196.14.220:8080/res/resfood.action?op=findFood&fid="+imgs[index].id,options1);
				var options2={
					"completeListener":showHistorys
				}
				yc.xssRequest("http://218.196.14.220:8080/res/resfood.action?op=findAllSelectedFoods",options2);
				

				//历史浏览记录
				function showHistorys(){
					var history=yc.$("history");
					var ul=document.createElement("ul");
					var str="<li><a class='imgtitle' href="+Cookies.get(decodeURIComponent("foodurl"))+">"+Cookies.get(decodeURIComponent("foodtitle"))+"</a></li>";
					ul.innerHTML=str;
					history.appendChild(ul);
				}
			});	
		})(i);
	}
	
	//查看商品详情
	function showDetail(){
		//{"code":1,"obj":{"fid":1,"fname":"素炒莴笋丝","normprice":22.0,"realprice":20.0,"detail":"营养丰富","fphoto":"500008.jpg"}}
		var makeid='';
		if(this.responseJSON.code==1){
			yc.$("mytable").innerHTML="";
			var divtable2=document.createElement("div");
			divtable2.setAttribute('id','mytable2');
			var dl=document.createElement("dl");
			var dt=document.createElement("dt");
			var dd=document.createElement("dd");
			dt.innerHTML="<img id='"+this.responseJSON.obj.fid+"' src='http://218.196.14.220:8080/res/images/"+this.responseJSON.obj.fphoto+"' title="+this.responseJSON.obj.detail+"/>";
			makeid=this.responseJSON.obj.fid;
			dd.innerHTML="<p>"+this.responseJSON.obj.fname+"</p><p><span>原价：</span><span class='normprice'>"+this.responseJSON.obj.normprice+"</span></p><p><span>现价：</span><span class='realprice'>"+this.responseJSON.obj.realprice+"</span></p><p id='add'>加入购物车</p><p id='buy'>现在就买</p><p><span>详情：</span><span>"+this.responseJSON.obj.detail+"</span></p>";
			dl.appendChild(dt);
			dl.appendChild(dd);
			divtable2.appendChild(dl);
			yc.$("conRight").appendChild(divtable2);



			//点击添加购物车，先检查登录
			yc.addEvent('add','click',function(){
				var options={
					"completeListener":function (){//登录后则请求添加
						if(this.responseJSON.code==1){
							//alert(this.responseJSON);
							var options2={
								"completeListener":addGood
							}
							yc.xssRequest("http://218.196.14.220:8080/res/resorder.action?op=orderJson&num=1&fid="+makeid,options2);
						}else if(this.responseJSON.code==0){//未登录则打开登录弹窗
							//让弹框居中显示
							var iWidth=520; //弹出窗口的宽度;
							var iHeight=630; //弹出窗口的高度;
							var iTop = (window.screen.availHeight-30-iHeight)/2; //获得窗口的垂直位置;
							var iLeft = (window.screen.availWidth-10-iWidth)/2; //获得窗口的水平位置;
							var result=window.open("loginShow.html","_blank","height="+iHeight+", width="+iWidth+", top="+iTop+", left="+iLeft);
						}else{
							alert("系统繁忙，请稍后再试");
						}
					}
				}
				yc.xssRequest("http://218.196.14.220:8080/res/resuser.action?op=checkLogin",options);
				
				function addGood(){
					if(this.responseJSON.code==1){
						alert("添加成功");
					}else if(this.responseJSON.code==0){
						alert("添加失败");
					}else{
						alert("服务器繁忙，请稍后再试");
					}
				}
			});


			//点击订购先检查登录
			yc.addEvent('buy','click',function(){
				var options={
					"completeListener":function (){//登录后切换订购页面
						if(this.responseJSON.code==1){
							yc.$("mytable").innerHTML="";
							yc.$("mytable2").innerHTML="";
							yc.$("myform").style.display='block';
							
						}else if(this.responseJSON.code==0){//未登录则打开登录弹窗
							//让弹框居中显示
							var iWidth=520; //弹出窗口的宽度;
							var iHeight=630; //弹出窗口的高度;
							var iTop = (window.screen.availHeight-30-iHeight)/2; //获得窗口的垂直位置;
							var iLeft = (window.screen.availWidth-10-iWidth)/2; //获得窗口的水平位置;
							var result=window.open("loginShow.html","_blank","height="+iHeight+", width="+iWidth+", top="+iTop+", left="+iLeft);
						}else{
							alert("系统繁忙，请稍后再试");
						}
					}
				}
				yc.xssRequest("http://218.196.14.220:8080/res/resuser.action?op=checkLogin",options);

			});
			
			//提交订购
			yc.addEvent('submit','click',function(){
				var options={
					"completeListener":function (){
						if(this.responseJSON.code==1){
							alert("订购成功！");
						}else if(this.responseJSON.code==0){
							alert("订购失败....");
						}else{
							alert("系统繁忙，请稍后再试");
						}
					}
				}
				yc.xssRequest("http://218.196.14.220:8080/res/cust/custOp.action?op=confirmOrder&address="+yc.$("address").value+"&tel="+yc.$("phone").text+"&deliverytime="+yc.$("time").value+"&ps="+yc.$("ps").value,options);
			});
		}
	}
});

//登录的弹框
yc.addEvent("login","click",function(){
	//让弹框居中显示
	var iWidth=520; //弹出窗口的宽度;
	var iHeight=630; //弹出窗口的高度;
	var iTop = (window.screen.availHeight-30-iHeight)/2; //获得窗口的垂直位置;
	var iLeft = (window.screen.availWidth-10-iWidth)/2; //获得窗口的水平位置;
	var result=window.open("loginShow.html","_blank","height="+iHeight+", width="+iWidth+", top="+iTop+", left="+iLeft);
	//alert(result.document.yc.$('username').text);
});


//退出
function exit(){
	var _options={
		"completeListener":function(){
			if(this.responseJSON.code==1){
				alert("亲，谢谢惠顾哦，╭(ㄒoㄒ)//");
				document.getElementById("in").innerHTML="<a  href='javascript:void(0)' id='login' onclick='login()' >"+"登录"+"</a>";
			}else{
				alert("亲，系统开小差去了，稍后再试试吧，╮(╯3╰)╭");
			}
		}
	}
	yc.xssRequest("http://218.196.14.220:8080/res/resuser.action?op=logout",_options);
}
yc.addEvent("logout","click",exit);
function login(){
	//让弹框居中显示
	var iWidth=520; //弹出窗口的宽度;
	var iHeight=630; //弹出窗口的高度;
	var iTop = (window.screen.availHeight-30-iHeight)/2; //获得窗口的垂直位置;
	var iLeft = (window.screen.availWidth-10-iWidth)/2; //获得窗口的水平位置;
	var result=window.open("loginShow.html","_blank","height="+iHeight+", width="+iWidth+", top="+iTop+", left="+iLeft);
	//alert(result.document.yc.$('username').text);
}

// 随机生成字体颜色
// function getRandomColor(){   
//  	return  '#' +   
//     (function(color){   
//     return (color +=  '0123456789abcdef'[Math.floor(Math.random()*16)])   
//       && (color.length == 6) ?  color : arguments.callee(color);   
//   })('');   
// } 

	setInterval(function getRandomColor(){
		var func=(function(color){   
		    return (color +=  '0123456789abcdef'[Math.floor(Math.random()*16)])   
		      && (color.length == 6) ?  color : arguments.callee(color);   
		  })('');   
		var color='#' + func;
		yc.$("changecolor").style.color=color;
	} , 100);


