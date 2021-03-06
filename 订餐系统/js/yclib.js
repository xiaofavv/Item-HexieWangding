//库：放一些内置函数的扩展（String,Array,Object）
//	  放一些自定义的函数，这些函数为了不与别的库冲突，定义到一个命名空间（对象）中
(function(){
	if(!window.yc){ 
		//window.yc={};//在window下声明了一个yc的库	
		window['yc']={};	
	}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//============================================浏览器能力检测=============================================//
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//---------------------判断当前浏览器是否兼容这个库：浏览器能力检测--------------------------------------
	function isCompatible(other){//===严格等于：值和类型都要相等   isCompatible：是否兼容
		//other===false  值相同，值也要为false
		if(other===false || !Array.prototype.push || !Object.hasOwnProperty || !document.createElement ||
			!document.getElementsByTagName){
			return false;
		}
		return true;
	};
	window['yc']['isCompatible']=isCompatible;



///////////////////////////////////////////////////////////////////////////////////////////////////////////
//=========================================获取页面元素的操作============================================//
///////////////////////////////////////////////////////////////////////////////////////////////////////////
/*1
	window.yc.prototype={
		$:function(){

		}
	}
*/
//2 window.ys.$=$;
//<div id="a">   <div id="b">
//$("dddd"); var array=$("a","b") =>1个参数返回一个对象 array=>2  array=>0
//如果参数是一个字符串，则返回一个对象
//如果参数是多个字符串，则返回一个数组
//---------------------------------------------------$取值-------------------------------------------------
	function $(){	//既可以传字符串，数组也可以，也可以传节点
		var elements=new Array();
		//查找作为参数提供的所有元素
		for(var i=0;i<arguments.length;i++){
			var element=arguments[i];
			//如果这个元素是一个string，则表明这是一个id
			if(typeof element=='string'){
				element=document.getElementById(element);
			}
			if(arguments.length==1){
				return element;
			}
			elements.push(element);
		}
		return elements;
	}
	window['yc']['$']=$;//3



///////////////////////////////////////////////////////////////////////////////////////////////////////////
//===============================================替换操作================================================//
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//----------------------------------------------替换模版文字---------- -----------------------------------
//str:模版文字中包含{属性名}，o:是对象，格式{属性名：值}
//方法一
 function supplant(str,o){
 	return str.replace(/{([a-z]*)}/g),
	 	function (a,b){
	 		alert(a+"\t"+b);//a:{border}  b:{border}
	  		var r=o[b];
	 		//return typeof r==='string'?r:a;
	 		return r;
	 	};
 };

 //方法二
var supplant=function(template,data){
 	for(var i in data){
 		//i:first,  last,   border
 		template=template.replace("{"+i+"}",  data[i]);
 		//template.replace("{border}",  data["border"]);
 	}
 	return template
 };
window['yc']['supplant']=supplant;


//----------------------------------------------eval增强带过滤--------------------------------------------
//要过滤的字符串  ，用来过滤的代码块又是一个函数  "age":-20
	function parseJson(str,filter){
		var obj=eval( "("+str+")" );
		var objfilter=function(obj){
			for(var i in obj){
				if(obj!=null && typeof obj[i]=="object"){
					objfilter(obj[i]);
				}else if(filter!=null && typeof filter=="function"){
					obj[i]=filter(i,obj[i]);
				}
			}
		}
		objfilter(obj);
		return obj;
	};
	window['yc']['parseJson']=parseJson;


//------------------------------------------将数据过滤为JSON格式-----------------------------------------
// parseJSON(string,filter)
// s:string,要转换的字符串     filter：用于过滤和转换结果的可选参数
// 案例：如果键名中有date，则将值转为date对象
// myData=parseJSON(string,function(key,value){
// 	return key.indexOf('date')>=0? new Data(value):value;
// });

	function parseJSON(s,filter){  
		var j;
		//递归函数
		function walk(k,v){  //键，值
			var i;
			if(v && typeof v==='object'){ 
				for(i in v){
					if(v.hasOwnProperty(i)){
						v[i]=walk(i,v[i]);
					}
				}
			}
			return filter(k,v); //回调过滤函数，完成过滤操作
		}
	
		if(/^(["'](\\.|[^"\\\n\r])*?["']|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?$/.test(s)){
		//第二阶段，将json字符串转为js结构
			try{
				j= eval('('+ s +')');
			}catch(e){
				throw new SyntaxError("eval parseJSON");
			}
		}else{
			throw new SyntaxError("parseJSON");
		}
		//第三个阶段： 递归遍历了新生成的结构，将每个名/值对传递给一个过滤函数
		if(typeof filter ==='function'){
			j=walk('', j);
		}
		return j;
	};
	window['yc']['parseJSON']=parseJSON;



///////////////////////////////////////////////////////////////////////////////////////////////////////////
//==============================================事件操作=================================================//
///////////////////////////////////////////////////////////////////////////////////////////////////////////		
//----------------------------------------------增加事件--------------------------------------------------
	//  node：节点（id）   type：事件类型(事件名)    listener：监听器函数
	function addEvent(node,type,listener){	//绑定事件
		if(!isCompatible()){return false;}
		if(!(node=$(node))){return false;}
		//w3c加事件的方法
		if(node.addEventListener){
			node.addEventListener(type,listener,false);//事件名，事件触发的回调函数，冒泡
			return true;
		}else if(node.attachEvent){
		//MSIE的事件
		//node节点会有重复，e此处是为了避免重复
		    node['e'+type+listener]=listener;//将listener赋值给 node['e'+type+listener]
		    node[type+listener]=function(){// node[type+listener]:只是一个函数名
				node['e'+type+listener]( window.event);//attachEvent(事件类型, 处理函数);
				//listener.( window.event)
			}
			node.attachEvent('on'+type,node[type+listener] );//attachEvent(事件类型, 处理函数);
			return true;
        }
	};
	window['yc']['addEvent']=addEvent;

	
	//----------------------------------------------显示与隐藏事件-------------------------------------------------
	function toggleDisplay(node,value){//node:id,value:显示或者隐藏
		//yc.toggleDisplay(id名,你想要他目前显示的样子，隐藏或者显示)
		//通常该函数与添加事件一起用
		if( !(node=$(node) )  ){return false;}
		if(node.style.display!='none'){
			node.style.display='none'
		}else{
			node.style.display=value||'';
		}
		return true;
	};
	window['yc']['toggleDisplay']=toggleDisplay;

	
//----------------------------------------------移除事件-------------------------------------------------
	function removeEvent(node,type,listener){
		if(  !(node=$(node) )  ){return false;}
		if(node.removeEventListener){//ff
			node.removeEventListener(type,listener,false);
			return true;
		}else if(node.detachEvent){//ie
			node.detachEvent('on'+type,node[type+listener] );
			node[type+listener]=null;
			return true;
		}
		return false;
	};
	window['yc']['removeEvent']=removeEvent;

	//小结：
	//1.添加事件时用的函数必须与删除时用的函数要是同一个函数
	/*var show=function(){
			alert("Hello");
		};
		yc.addEvent("show","click",show);//添加事件时用了一个函数
		yc.removeEvent("show","click",show);//删除事件时用了另一个函数	
		以上对
		yc.addEvent("show","click",function(){alert("Hello"); });
		yc.removeEvent("show","click",function(){alert("Hello"); });
		以上错，无法移除，因为匿名函数是两个函数

	*/


//---------------------------------------页面加载事件------------------------------------------------------
	function addLoadEvent(func){
		//将现有的window.onload事件处理函数的值存入变量oldOnLoad
		var oldOnload=window.onload;
		//如果在这个处理函数上还没有绑定任何函数，就像平时那样把函数添加给它
		if(typeof window.onload!='function'){
			window.onload=func;
		}else{
		//如果在这个处理函数上已经绑定了一些函数，则将新函数追加到先有指令的尾部
			window.onload=function(){
				oldOnload();//如果以案前这个页面有函数，则调用 以前的函数
				func();//再调用当前的函数
			}
		}
	}
	window['yc']['addLoadEvent']=addLoadEvent;

////////////////////////////////////////////////////////////////////////////////////////////////////////////
//===============================================统计操作=================================================//
////////////////////////////////////////////////////////////////////////////////////////////////////////////
//------------------------------------------根据类名统计节点------------------------------------------------
//className:要找的类名  tag：要查找的标签  parent:父节点   tag可写成*代表所有，父节点便可不写
	function getElementsByClassName( className,tag,parent){
		parent=parent||document;//判断父节点是否传入，如果没传入则是代表整个文档，再传值给parent
		if( !(parent=$(parent) )  ){return false;}
		//查找所有匹配的标签
		var allTags=(tag=="*"&&parent.all)?parent.all:parent.getElementsByTagName(tag);
		var matchingElements=new Array();
		//创建一个正则表达式，来判断className是否正确
		var regex=new RegExp( "(^|\\s)"+className+"(\\s|$)");//(^|\\s) 以className开头或者空格开头
		var element;
		//检查每个元素
		for(var i=0;i<allTags.length;i++){
			element=allTags[i];
			if(regex.test(element.className)){
				matchingElements.push(element);
			}
		}
		return matchingElements;
	};
window['yc']['getElementsByClassName']=getElementsByClassName;








////////////////////////////////////////////////////////////////////////////////////////////////////////////
//===========================================DOM中的节点操作补充==========================================//
////////////////////////////////////////////////////////////////////////////////////////////////////////////
//a.appendChild(b);在a的子节点的最后加入b
//a.insertBefore(b);在a的前面加入一个b
//----------------------------新增的第一个函数：给 referenceNode的后面加入一个node-------------------------
	function insertAfter(node,referenceNode){
		if(! (node=$(node) )  ){ return false;}
		if(!(referenceNode=$(referenceNode) )  ){ return false;}
		var parent=referenceNode.parentNode;
		if(parent.lastChild==referenceNode){//当前节点referenceNode是最后一个节点，则直接添加
			parent.appendChild(node);
		}else{//当前节点后面还有兄弟节点
			parent.insertBefore(node,referenceNode.nextSibling);
		}
	};
	window['yc']['insertAfter']=insertAfter;


//-------------------------------新增第二个人函数：一次删除所有的子节点------------------------------------
//标准（删除节点）：node.removeChild(childNode) =>一次只能删除一个子节点

	function removeChildren(parent){
		if(!(parent=$(parent) )  ){return false;}
		while( parent.firstChild){
			parent.removeChild(parent.firstChild);
		}
		//返回父元素，以实现方法连缀
		return parent;
	};
	window['yc']['removeChildren']=removeChildren;


//-------------新增第三个人函数：在一个父节点的第一个子节点的前面添加一个新节点---------------------------
	function prependChild(parent,newChild){
		if(!(parent=$(parent) )  ){return false;}
		if(!(newChild=$(newChild) )  ){return false;}
		if(parent.firstChild){//查看parent节点下是否有子节点
			//如果有一个子节点，就在这个子节点前面添加
			parent.insertBefore(newChild,parent.firstChild);
		}else{
			//如果没有子节点则直接添加
			parent.appendChild(newChild);
		}
		return parent;
	};
	window['yc']['prependChild']=prependChild;



////////////////////////////////////////////////////////////////////////////////////////////////////////////
//================================样式表操作第一弹：设置样式规则==========================================//
////////////////////////////////////////////////////////////////////////////////////////////////////////////
//------------------------------------------将word-word 转为wordWord----------------------------------------
	function camelize(s){//"font-size".replace(  /-(\w)/g,)  =>  ["-s","s"]  正则表达式匹配完，返回的都是数组
		return s.replace(/-(\w)/g, function(strMatch,p1){//strMatch:-s  p1:s
			return p1.toUpperCase();
		});
	}
	window['yc']['camelize']=camelize;


//-------------------------------------------将wordWord 转为word-word---------------------------------------
	function uncamelize(s,sep){
		sep=sep||'-';
		return s.replace(/([a-z])([A-Z])/g,function(match,p1,p2){
			return p1+sep+p2.toLowerCase();
		});
	}
	window['yc']['uncamelize']=uncamelize;


//---------------------------------------通过id修改单个元素的样式------------------------------------------
	function setStyleById( element,styles){
		//取得对象的引用
		if(!(element=$(element) )  ){return false;}
		//遍历styles对象的属性，并应用每个属性
		for(property in styles){
			if(!styles.hasOwnProperty(property) ){
				continue;//下一个
			}
			if( element.style.setProperty){
				//setProperty("background-color")
				//DOM2样式规范 setProperty(propertyName,value,priority);
				element.style.setProperty( uncamelize(property,'-'), styles[property], null);
			}else{
				//备用方法：elements.style["backgroundColor"]="red";
				elements.style[  camelize(property)]=styles[property];
			}
		}
		return true;
	}
	window['yc']['setStyle']=setStyleById;
	window['yc']['setStyleById']=setStyleById;


//--------------------------------------通过标签名修改多个样式------------------------------------------------
//通过标签名修改多个元素的样式
//tagname：标签名
//styles：样式对象
//parent:父元素的id
	function setStylesByTagName(tagname,styles,parent){
		parent=$(parent)|| document;
		var elements=parent.getElementsByTagName(tagname);
		for( var e=0;e<elements.length;e++){
			setStyleById(elements[e],styles);
		}

	}
	window['yc']['setStylesByTagName']=setStylesByTagName;

//------------------------------------通过类名修改多个元素的样式---------------------------------------------
//通过类名修改多个元素的样式
//tagname：标签名
//styles：样式对象
//parent:父元素的id
	function setStyleByClassName(parent,tag,className,styles){
		if(!(parent=$(parent) )  ) {return false;}
		var elements=getElementsByClassName(className,tag,parent);
		for( var e=0;e<elements.length;e++){
			setStyleById(elements[e],styles);
		}
		return true;
	}
	window['yc']['setStyleByClassName']=setStyleByClassName;



////////////////////////////////////////////////////////////////////////////////////////////////////////////
//=======================样式表操作第二弹：基于className切换样式==========================================//
////////////////////////////////////////////////////////////////////////////////////////////////////////////	
//----------------------------------------取得元素中类名的数组----------------------------------------------
//element:要查找类名的id
	function getClassNames(element){
		if(!(element=$(element) )  ) {return false;}
		//用一个空格替换多个空格，再基于空格分隔类名
		return element.className.replace(/\s+/,' ').split(' ');
	}
	window['yc']['getClassNames']=getClassNames;


//--------------------------------------检查元素中是否存在某个类-------------------------------------------
//element:要检查类名的id
//className:要检查的类名
	function hasClassName (element,className){
		if( !(element=$(element) )  ){return false;}
		var classes=getClassNames(element);//得到所有的类名
		for( var i=0;i<classes.length;i++){
			if(classes[i]===className){
				return true;
			}
		}
		return false;
	}
	window['yc']['hasClassName']=hasClassName;


//----------------------------------------------为元素添加类--------------------------------------------
//element:要添加类名的id
//className:要添加的类名
	function addClassName(element,className){
		if( !(element=$(element) )  ){return false;}
		//将类名添加到当前classsName的末尾，如果没有类名，则不包含空格
		var space=element.className?' ':'';
		//如果有类名a，再添b，则是 a空格b，如果没有类名，则直接添加b
		element.className+= space+className;
		return true;
	}
	window['yc']['addClassName']=addClassName;


//--------------------------------------------删除元素中的类--------------------------------------------
	function removeClassName(element,className){
		if( !(element=$(element) )  ){return false;}
		//先获取元素中的类
		var classes=getClassNames(element);
		//循环遍历数组删除匹配的项
		//因为从数组中删除项会使数组变短，所以要反相删除
		var length=classes.length;
		var a=0;
		for(var i=length-1;i>=0;i--){//从数组的最后一个开始取，每取一个逐步-1
			if(classes[i]===className){
				delete(classes[i]);//delete只将数组中下标为i的元素改为 undefined
				a++;
			}
		}
		element.className=classes.join(' ');
		//判断删除是否成功
		return (a>0?true:false);
	}
	window['yc']['removeClassName']=removeClassName;



////////////////////////////////////////////////////////////////////////////////////////////////////////////
//===================样式表操作第三弹：更大范围的改变,切换样式表==========================================//
////////////////////////////////////////////////////////////////////////////////////////////////////////////
//---------------------------------通过url取得包含所有样式表的数组------------------------------------------
	function getStyleSheets(url,media){
		var sheets=[];
		for( var i=0;i<document.styleSheets.length;i++){
			if(!document.styleSheets[i].href){
				continue;
			}
			if(url&&document.styleSheets[i].href.indexOf(url)==-1){
				continue;
			}
			if(media){
				//规范化media字符串
				media=media.replace(/,\s*/,',');
				var sheetMedia;
				if(document.styleSheets[i].media.mediaText){
					//DOM方法
					sheetMedia=document.styleSheets[i].media.mediaText.replace(/,\s*/,',');
					//Safari会添加额外的逗号和空格
					sheetMedia=sheetMedia.replace(/,\s*$/,'');
				}else{
					//IE
					sheetMedia=document.styleSheets[i].meidia.replace(/,\s*/,',');
				}
				//如果media不匹配，则跳过
				if(media!=sheetMedia){
					continue;
				}
			}
			sheets.push(document.styleSheets[i]);
		}
		return sheets;
	}
	window['yc']['getStyleSheets']=getStyleSheets;


//------------------------------------------添加样式表--------------------------------------------------
// addStyleSheet
	function addStyleSheet(url,media){
		media=media||'screen';
		var link=document.createElement("LINK");//节点名最好用大写
		link.setAttribute('rel','stylesheet');
		link.setAttribute('type','text/css');
		link.setAttribute('href',url);
		link.setAttribute('media',media);
		document.getElementsByTagName('head')[0].appendChild(link);
	}
	window['yc']['addStyleSheet']=addStyleSheet;


//-------------------------------------------删除样式表-----------------------------------------------
	function removeStyleSheet(url,media){
		var styles=getStyleSheets(url,media);
		for(var i=0;i<styles.length;i++){
			//style[i]表示样式表  ->   .ownerNode表示这个样式表所属的节点<link>
			var node=styles[i].ownerNode||styles[i].owningElement;
			//禁用样式表
			styles[i].disabled=true;
			//移除节点
			node.parentNode.removeChild(node);
		}
	}
	window['yc']['removeStyleSheet']=removeStyleSheet;



////////////////////////////////////////////////////////////////////////////////////////////////////////////
//================================样式表操作第四弹：修改样式规则==========================================//
////////////////////////////////////////////////////////////////////////////////////////////////////////////
//-------------------------------------------添加样式规则--------------------------------------------------
/*
	添加一条css规则：yc.addCSSRule( '.test',{'font-size':'40%','color':'red'});
	如果存在多个样式表，可使用url和media: yc.addCSSRule( '.test',{'test-decoration':'underline','style.css'});
*/
	function addCSSRule(selector,styles,index,url,media){
		var declaration='';
		//根据styles参数(样式对象) 构建声明字符串
		for(property in styles){
			if(!styles.hasOwnProperty(property)){
				continue;
			}
			declaration+=property+":"+styles[property]+";";
		}
		//根据url和media获取样式表
		var styleSheets=getStyleSheets(url,media);
		var newIndex;
		//循环所有满足条件的样式表，添加样式表
		for(var i=0;i<styleSheets.length;i++){
			//添加规则
			if(styleSheets[i].insertRule){
				//计算规则添加到索引位置 cssRules->w3c
				newIndex=(index>=0?index:styleSheets[i].cssRules.length);
				//DOM2样式规则添加的方法  insertRule(rule,index);
				styleSheets[i].insertRule(selector+'{'+declaration+'}',newIndex);
			}else if(styleSheets[i].addRule){
				//计算规则添加的索引位置
				newIndex=(index>=0?index:-1);//IE中认为规则列表最后一项用-1代表
				//IE样式规则添加的方法  addRule(selector,style[,index]);
				styleSheets[i].addRule(selector,declaration,newIndex);
			}
		}
	}
	window['yc']['addCSSRule']=addCSSRule;


//----------------------------------------------编辑样式规则-----------------------------------------------
//编辑样式规则：yc.editCSSRule( '.test',{'font-size':'40%','color':'red'});
	function editCSSRule(selector,styles,url,media){
		//取出所有的样式表
		var styleSheets=getStyleSheets(url,media);
		//循环每个样式表中的每条规则
		for(i=0;i<styleSheets.length;i++){
			//取得规则列表 DOM2样式规范方法是styleSheets[i].cssRules   IE是styleSheets[i].rules
			var rules=styleSheets[i].cssRules||styleSheets[i].rules;
			if(!rules){continue;}
			//IE默认选择器使用大写所以转换为大写形式，如果使用的是区分大小写的id，则可能会导致冲突
			selector=selector.toUpperCase();
			for(var j=0;j<rules.length;j++){
				//检查规则中的选择器名是否匹配
				if(rules[j].selectorText.toUpperCase()==selector){//找到要修改的选择器
					for(property in styles){
						if(!styles.hasOwnProperty(property) ){continue;}
						//将这条规则设置为新样式
						rules[j].style[camelize(property)]=styles[property];
					}
				}
			}
		}	
	}
	window['yc']['editCSSRule']=editCSSRule;


//-----------------------------------------取得一个元素的计算样式------------------------------------------	
	function getStyle(element,property){
		if(!(element=$(element) ) ||!property ){return false;}
		//检查元素style属性中的值
		var value=element.style[camelize(property)];
		if(!value){
			//取得计算值
			if(document.defaultView&&document.defaultView.getComputedStyle){
				//DOM方法
				var css=document.defaultView.getComputedStyle(element,null);//取出了element这个元素所有的计算样式
				value=css?css.getPropertyValue(property):null;
			}else if(element.currentStyle){
				//IE方法
				value=element.currentStyle[ camelize(property)];
			}
		}
		//返回空字符串而不是auto，这样就不必检查auto值了
		return value=='auto'?'':value;
	}
	window['yc']['getStyle']=getStyle;
	window['yc']['getStyleById']=getStyle;



////////////////////////////////////////////////////////////////////////////////////////////////////////////
//==============================================动画效果==================================================//
////////////////////////////////////////////////////////////////////////////////////////////////////////////
//---------------------------------------------定时移动元素------------------------------------------------
//						元素id,x最终位置,y最终位置,间隔时间
	function moveElement(elementId,final_x,final_y,interval){
		//浏览器检测及元素事都存在检测
		if(!isCompatible()){return false;}
		if(!(elementId )){return false;}
		//取出元素
		var elem=$(elementId);
		if(elem.movement){	 //清除图片的颤动效果，阻止它产生过多事件
			clearTimeout(elem.movement);
		}
		//取出当前元素的位置，x-> left  y->top
		var xpos=parseInt(elem.style.left);//left:"10px" ->parseInt("10px");
		var ypos=parseInt(elem.style.top);
		//计算移动后的位置是否越界，并设置新位置
		if(xpos==final_x && ypos==final_y){
			return true;
		}
		var dist=0;
		if(xpos<final_x ){
			//100-0  100/10   10     100-50    50/10  5
			dist=(final_x-xpos)/10;
			xpos=xpos+dist;
		}
		if(xpos>final_x ){
			dist=(xpos-final_x)/10;
			xpos=xpos-dist;
		}
		if(ypos<final_y ){
			dist=(final_y-ypos)/10;
			ypos=ypos+dist;
		}
		if(ypos>final_y ){
			dist=(ypos-final_y)/10;
			ypos=ypos-dist;
		}
		elem.style.left=xpos+"px";
		elem.style.top=ypos+"px";
		//定时器重复执行当前的移动操作  setTimeout(函数声明 ,间隔时间);
		var repeat="yc.moveElement('"+elementId+"',"+final_x+","+final_y+","+interval+")";
		elem.movement=setTimeout(repeat,interval);	
	}
	window['yc']['moveElement']=moveElement;



////////////////////////////////////////////////////////////////////////////////////////////////////////////
//=================================================xml操作================================================//
////////////////////////////////////////////////////////////////////////////////////////////////////////////
//-------------------------------------------------xpath---------------------------------------------------
//从xml文档对象中按  xpath规则提取出要求的节点  /students/student
	function selectXMLNodes(xmlDoc,xpath){
			if('\v'=='v'){
				//IE
				xmlDoc.setProperty("SelectionLanguage","XPath");//将当前xml文档的查找方式改为 path
				return xmlDoc.documentElement.selectNodes(xpath);
			}else{
				//w3c
				var evaluator=new XPathEvaluator();
				var resultSet= evaluator.evaluate(xpath,xmlDoc,null,XPathResult.ORDERED_NODE_ITERATOR_TYPE,null);
				//通过xpath解析的结果是一个集合
				var finalArray=[];
				if(resultSet){
					var el =resultSet.iterateNext();//循环解到的结果
					while(el){
						finalArray.push(el);
						el=resultSet.iterateNext();
					}
					return finalArray;
				}
			}
		}
		window['yc']['selectXMLNodes']=selectXMLNodes;


//------------------------------------------getElementByIdXML---------------------------------------------
	//在xml dom中不能使用getElementById方法，所以这里自己实现一个相似功能的函数
	function getElementByIdXML(rootnode,id){
		//现获取所有的元素
		nodeTags=rootnode.getElementsByTagName('*');// * 所有元素
		for(i=0;i<nodeTags.length;i++){
			if(nodeTags[i].hasAttribute('id') ){
				if(nodeTags[i].getAttribute('id')==id)
					return nodeTags[i];
			}
		}
	}
	window['yc']['getElementByIdXML']=getElementByIdXML;


//------------------------------将xml字符串序列化转为xml Dom节点对象--------------------------------------
//将xml字符串反序列化转为xml Dom节点对象，以便于使用getElementsByTagName()等函数来操作
	function parseTextToXmlDomObject(str) {
		if ('\v' == 'v') {
			//Internet Explorer
			var xmlNames = ["Msxml2.DOMDocument.6.0", "Msxml2.DOMDocument.4.0", "Msxml2.DOMDocument.3.0", "Msxml2.DOMDocument", "Microsoft.XMLDOM", "Microsoft.XmlDom"];
			for (var i = 0; i < xmlNames.length; i++) {
				try {
					var xmlDoc = new ActiveXObject(xmlNames[i]);
					break;
				} catch(e) {
					
				}
			}
			xmlDoc.async = false;
			xmlDoc.loadXML(str);
		} else {
			try  {
				//Firefox, Mozilla, Opera, Webkit.
				var parser = new DOMParser();
				var xmlDoc = parser.parseFromString(str,"text/xml");
			} catch(x) {
				alert(x.message);
				return;
			}
		}
		return xmlDoc;
	}
	window['yc']['parseTextToXmlDomObject']=parseTextToXmlDomObject;


//---------------------------将  xml Dom对象反序列化转为  xml 字符串-------------------------------------
	function parseXmlDomObjetToText( xmlDom ){
		if (xmlDOM.xml) {
			return xmlDOM.xml;    //  xml文件内容
		} else {
			var serializer  = new XMLSerializer();
			return serializer.serializeToString(xmlDOM, "text/xml");
		}
	}
	window['yc']['parseXmlDomObjetToText']=parseXmlDomObjetToText;




////////////////////////////////////////////////////////////////////////////////////////////////////////////
//==================================================Ajax封装==============================================//
////////////////////////////////////////////////////////////////////////////////////////////////////////////
//对参数字符串的编码   针对get请求 person.action?name=&xxx&xxx&age=20   name  张三  age
	function addUrlparam(url,name,value){
		url+=(url.indexOf("?")==-1?"?":"&");
		url+=encodeURIComponent(name)+"="+encodeURIComponent(value);
		return url;
	}
	//序列化表单  name=hly&password=a
	function serialize(form){//   send:yc.serialize(document.loginForm)
		var parts=new Array();
		var field=null;
		//form.elements  表单中所有的元素
		for(var i=0,len=form.elements.length;i<len;i++){
			field=form.elements[i];//取出每一个元素
			switch(field.type){
				case "select-one":
				case "select-multiple":
					for(var j=0,optLen=field.options.length;j<optLen;j++){
						var option=field.options[j];
						if(option.selected){
							var optValue="";
							if(option.hasAttribute){
								optValue=(option.hasAttribute("value")?option.value:option.text);
							}else{
								optValue=(option.attribute["value"].specified?option.value:option.text);
							}
							parts.push(encodeURIComponent(field.name)+ "=" +encodeURIComponent(optValue));
						}
					}
					break;
				case undefined:
				case "field":
				case "submit":
				case "reset":
				case "button":
				break;
				case "radio":
				case "checkbox":
					if(!field.checked){
						break
					}
					//falls through
				default:
					parts.push(encodeURIComponent(field.name)+ "=" +encodeURIComponent(field.value));
			}
		}
		return parts.join("&");
	}
	window['yc']['serialize']=serialize;

	
	//-------------------------------  getRequestObject-----------------------------------------------
	function getRequestObject(url,options){
		//初始化请求对象
		var req=false;
		if(window.XMLHttpRequest){
			var req=new window.XMLHttpRequest();//ie7+  ff  chrome...
		}else if(window.ActiveXObject){
			var req= new window.ActiveXObject('Microsoft.XMLHTTP');//ie7以下浏览器
		}
		if(!req) return false;//如果无法创建  request对象，则返回
		//定义默认选项
		options= options || {};
		options.method= options.method|| 'POST';
		options.send=options.send || null;//req.open("POST",url,true); req.send(null);


		//定义请求的不同状态时回调的函数
		req.onreadystatechange =function(){
			
			switch(req.readyState){
				case 1:
				//请求初始化时
				if(options.loadListener){
					options.loadListener.apply(req,arguments);//apply/call  ->  this 作用域
				}
				break;
				case 2:
				//加载完成时
				if(options.loadedListener){
					options.loadedListener.apply(req,arguments);
				}
				break;
				case 3:
				//交互
				if(options.ineractiveListener){
					options.ineractiveListener.apply(req,arguments);
				}
				break;
				case 4:
				//完成交互时的回调操作
				try{
					if(req.status && req.status == 200){
						// 注意：
						// Content-Type:text/html;charset=ISO-8859-4
						// 这个数据存在响应头中，表示响应的数据类型，那么要用  responseText/responseXML来获取
						// 获取响应头的文件类型部分
						var contentType= req.getResponseHeader('Content-Type');
						//截取出   ; 前面的部分，这一些表示的是内容类型
						var mimeType = contentType.match(/\s*([^;]+)\s*(;|$)/i)[1];
						switch(mimeType){
							case 'text/javascript':
							case 'application/javascript':
							//表示回送的数据是一个javascript代码
								if(options.jsResponseListener){
									options.jsResponseListener.call(req,req.responseText);
									//req.onreadystatechange(json);
								}
								break;
							case 'text/plain':
							case 'application/json':
								//结果是json数据，先parseJSON,转成json格式，再调用  处理函数处理
								if(options.jsonResponseListener){
									try{
										var json =parseJSON (req.responseText);
									}catch(e){
										var json=false;
									}
									options.jsonResponseListener.call(req,json);
								}
								break;
							case 'text/xml':
							case 'application/xml':
							case 'application/xhtml+xml':
								//响应的结果是一个xml字符串
								if(options.xmlResponseListener){
									options.xmlResponseListener.call(req,req.responseXML);
								}
								break;
							case 'text/html':
								//响应结果为html
								if(options.htmlResponseListener){
									options.htmlResponseListener.call(req,rq.responseText);
								}
								break;
						}	
						//完成后的监听器	
						if(options.completeListener){
							options.completeListener.call(req,arguments);
							//req.onreadystatechange(arguments);
						}
						
					} else{
						//响应码不为  200
						if(options.errorListener){
							options.errorListener.apply(req,arguments);
						}
					}
				}catch(e){
					//内部处理有错误时
					alert(e);
				}
				break;			
			}
		};
		//打开请求
		req.open(options.method,url,true);
		//在这里，可以加入自己请求头信息(可以随便加)
		//req.setRequestHeader('x-yc-Ajax-Request','AjaxRequest');
		return req;
	}
	window['yc']['getRequestObject']=getRequestObject;

//------------------------------------------ajaxRequest---------------------------------------------------
//发送ajax请求 XMLHttpRequest
// options对象的结构:{
// 					'method':'GET/POST',
// 					'send':发送的参数,
// 					'loadListener':初始化回调   readyState=1
// 					'loadedListener':加载完成回调   readyState=1
// 					'ineractiveListener':交互时回调   readyState=3

// 					以下是  readyState=4的处理
// 					'jsResponseListener':结果是一个javascript代码时的回调处理函数
// 					'jsonResponseListener':结果是一个json时的回调处理
// 					'xmlResponseListener':结果是一个xml时的回调函数
// 					'htmlResponseListener':结果是一个html时的回调函数
// 					'completeListener':处理完成后的回调(当不确定拿到什么数据时)
// 					statu==500
// 					'errorListener':响应码不为200时
// 					}
//异步明文获取格式  ajaxRequest  
	function ajaxRequest(url,options){  //地址    对象(method,监听器)
		var req=getRequestObject(url,options);   //获取req对象
		req.setRequestHeader("Content-Type","application/x-www-form-urlencoded");  //设置req头部
		return req.send(options.send);//send(null) |  send("name=hly");       //发送
	}
	window['yc']['ajaxRequest']=ajaxRequest;

	
//---------------------------------------------跨站------------------------------------------------
	/**
 * 跨站对象计数器
 */
	var XssHttpRequestCount=0;

/**
 *request对象的一个跨站点<script>标签生成器
 */
	var XssHttpRequest = function(){
		this.requestID = 'XSS_HTTP_REQUEST_' + (++XssHttpRequestCount);   //请求的编号，保证唯一. 
	}
//扩展   httpRequest对象。添加了一些属性
	XssHttpRequest.prototype = {
		url:null,
		scriptObject:null,
		responseJSON:null,    //  包含响应的结果，这个结果已经是json对象，所以不要 eval了. 
		status:0,        //1表示成功，   2表示错误
		readyState:0,      
		timeout:30000,
		onreadystatechange:function() { },
		
		setReadyState: function(newReadyState) {
			// 如果比当前状态更新，，则更新就绪状态
			if(this.readyState < newReadyState || newReadyState==0) {
				this.readyState = newReadyState;
				this.onreadystatechange();
			}
		},
		
		open: function(url,timeout){
			this.timeout = timeout || 30000;
			// 将一个名字为  XSS_HTTP_REQUEST_CALLBACK的键加到   请求的url地址后面， 值为要回调的函数的名字.这个函数名叫   XSS_HTTP_REQUEST_数字_CALLBACK
			this.url = url + ((url.indexOf('?')!=-1) ? '&' : '?' ) + 'XSS_HTTP_REQUEST_CALLBACK=' + this.requestID + '_CALLBACK';    
			this.setReadyState(0);        
		},
		
		send: function(){
			var requestObject = this;
			//创建一个用于载入外部数据的  script 标签对象
			this.scriptObject = document.createElement('script');
			this.scriptObject.setAttribute('id',this.requestID);
			this.scriptObject.setAttribute('type','text/javascript');
			// 先不设置src属性，也先不将其添加到文档.

			// 异常情况： 创建一个在给定的时间 timeout 毫秒后触发的  setTimeout(), 如果在给定的时间内脚本没有载入完成，则取消载入.
			var timeoutWatcher = setTimeout(function() {
				// 如果脚本晚于我们指定的时间载入， 则将window中的rquestObject对象中的方法设置为空方法
				window[requestObject.requestID + '_CALLBACK'] = function() { };
				// 移除脚本以防止这个脚本的进一步载入。 
				requestObject.scriptObject.parentNode.removeChild(requestObject.scriptObject);
				// 因为以上加载的脚本的操作已经超时，并且 脚本标签已经移除，所以将当前  request对象的状态设置为  2,表示错误, 并设置错误文本 
				requestObject.status = 2;
				requestObject.statusText = 'Timeout after ' + requestObject.timeout + ' milliseconds.'            
				
				// 重新更新  request请求的就绪状态，但请注意，这时，  status 是2 ,而不是200,表示失败了.
				requestObject.setReadyState(2);
				requestObject.setReadyState(3);
				requestObject.setReadyState(4);
						
			},this.timeout);
			
			
			// 在window对象中创建一个与请求中的回调方法名相同的方法，在回调时负责处理请求的其它部分. 
			window[this.requestID + '_CALLBACK'] = function(JSON) {
				// 当脚本载入时将执行这个方法同时传入预期的JSON对象. 
			
				// 当请求载入成功后，清除timeoutWatcher定时器. 
				clearTimeout(timeoutWatcher);

				//更新状态
				requestObject.setReadyState(2);
				requestObject.setReadyState(3);
				
				// 将状态设置为成功. 
				requestObject.responseJSON = JSON; 
				requestObject.status=1;
				requestObject.statusText = 'Loaded.' 
			
				// 最后更新状态为  4. 
				requestObject.setReadyState(4);
			}

			// 设置初始就绪状态
			this.setReadyState(1);
			
			// 现在再设置src属性并将其添加到文档头部，这样就会访问服务器下载脚本. 
			this.scriptObject.setAttribute('src',this.url);                    
			var head = document.getElementsByTagName('head')[0];
			head.appendChild(this.scriptObject);
			
		}
	}
	window['yc']['XssHttpRequest'] = XssHttpRequest;


//-----------------------------------------------------Xssrequest---------------------------------------
/**
 * 设置Xssrequest对象的各个参数.
 */
	function getXssRequestObject(url,options) {
		var req = new  XssHttpRequest();
		options = options || {};
		//默认超时时间
		options.timeout = options.timeout || 30000;
		req.onreadystatechange = function() {
			switch (req.readyState) {
				case 1:
					if(options.loadListener) {
						options.loadListener.apply(req,arguments);
					}
					break;
				case 2:
					if(options.loadedListener) {
						options.loadedListener.apply(req,arguments);
					}
					break;
				case 3:
					if(options.ineractiveListener) {
						options.ineractiveListener.apply(req,arguments);
					}
					break;
				case 4:
					if (req.status == 1) {
						// The request was successful
						if(options.completeListener) {
							options.completeListener.apply(req,arguments);
						}
					} else {
						if(options.errorListener) {
							options.errorListener.apply(req,arguments);
						}
					}
					break;
			}
		};
		req.open(url,options.timeout);
		return req;
	}
	window['yc']['getXssRequestObject'] = getXssRequestObject;


//--------------------------------------------------发送跨站请求  get----------------------------------
/**
 * 发送跨站请求:   JSONP的跨站请求只支持  get方式.
 */
 /*
	options对象结构：{
		timeout: 超时时间
		'loadListener':readyState=1时的回调函数
		'loadedLIstener':readyState=2时的回调函数
		'ineractiveListener':readyState=3时的回调函数

		以下是readyState=4 时的处理回调函数
		'completeListener':处理完成后的回调
		'errorListener':响应码不为200时的回调函数
	}
	*/
	function xssRequest(url,options) {
		var req = getXssRequestObject(url,options);
		return req.send(null);
	}
	window['yc']['xssRequest'] = xssRequest;
	
	
})();



////////////////////////////////////////////////////////////////////////////////////////////////////////////
//==================================================JSON==================================================//
////////////////////////////////////////////////////////////////////////////////////////////////////////////
//扩展全局的window.Object.prototype=xxx
//Object,array  ->js中原生对象
//需求：给object类的prototype添加一个功能  toJSONString，将属性的值以json格式输出
	//{"name":"zy",age:"30","sex":"男"}
	//for(var i in person) person[i]取出值
	//返回json字符串
//-----------------------------------------------对象转JSON格式--------------------------------------------
	Object.prototype.toJSONString=function(){   
		var jsonarr=[];
			for(var i in this ){ //object -> 所有的属性
				if(this.hasOwnProperty(i)){
					jsonarr.push( "\""+i+"\""+":\""+this[i]+"\"");//转义字符，用于计算机识别
				}
			}

		var r=jsonarr.join(",\n");
		r="{"+r+"}";
		return r;//返回json字符串
}


 //---------------------------------------------数组转JSON格式---------------------------------------------
	Array.prototype.toJSONString=function(){    
		var json=[];
		for(var i=0;i<this.length;i++)
			json[i]=(this[i]!=null)?this[i].toJSONString():"null";
			return "["+json.join(",")+"]"
}


//--------------------------------------------字符串转JSON格式---------------------------------------------
	String.prototype.toJSONString=function(){
	//此处这样写是因为
		return '"'+this.replace(/(\\|\")/g,"\\$1").replace(/\n|\r|\t/g,function(){
			var a=argumnets[0];
			return (a=='\n')?'\\n':(a=='\r')?'\\r':(a=='\t')?'\\t':""})+'"'
}	




Boolean.prototype.toJSONString=function(){return this}
Function.prototype.toJSONString=function(){return this}
Number.prototype.toJSONString=function(){return this}
RegExp.prototype.toJSONString=function(){return this}

Function.prototype.method=function(name,func){
	if(!this.prototype[name]){
		this.prototype[name]=func;
	}
	return this;
};


