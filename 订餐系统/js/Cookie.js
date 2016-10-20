// JavaScript Document
Cookies={
	set:function(key,value,minsToExpire){
		var expires="";
		if(minsToExpire){//如果传了过期时间进来
			var date=new Date();//客户端时间
			date.setTime(date.getTime()+(minsToExpire*60*1000));//设置过期时间，时间换算为毫秒
			expires=";expires="+date.toGMTString();//expires=Sat,14 Mar 2009 17:45:33 GMT
		}
		//Cookie存的时候，键和值都是要 编码 的
		//将字符串保存到cookie前必须编码，取出时，要解码
		//key:  "a b" => encodeURIComponent => "a%20b"
		//    /:  表示当前网站下所有的页面
		document.cookie=encodeURIComponent(key)+"="+encodeURIComponent(value)+expires+";path=/";//cookie存数据
		return value;
	},
	get:function(key){
		//var nameCompare=key+"=";// => name=
		var cookieArr=document.cookie.split(';');//name=a%20b;expires=xxx;path=/     以 ; 把字符串拆分为数组
		for(var i=0;i<cookieArr.length;i++){
			var a=cookieArr[i].split("=");//再根据 等于号 把数组的每个元素的键和值拆分  成为二元数组
			var currentKey=decodeURIComponent(a[0]);//a:[[key1,value1],[key2,value2]] => a[0]:[key1,value1]  这里相当于把第一个键值对 解码
			if(key==currentKey ||　" "+key==currentKey){//取值， decodeURIComponent()解码
				return decodeURIComponent(a[1]);//匹配得到，就返回键的值
			}
		}
		//匹配不到，就返回空
		return null;
	},
	//判断浏览器是否禁用了cookie
	isAvailable:function(){
		return (this.set('cookieTest','1')==this.get('cookieTest'));//相等就返回true，表示没有禁用
		//不相等就返回false，表示禁用了
	},
	//如果要删除cookie，只需要将expire设置为一个当前时间之前的过去时间即可
	del:function(key){
		this.set(key,"",-1);
	}
}