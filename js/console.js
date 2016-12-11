console.container=document.createElement('pre');
console.container.innerHTML='Welcome to The Console!';
console.list=[];
console.show=function(){
	console.container.visibility='';
};
console.hide=function(){
	console.container.visibility='hidden';
};
//console.container.style.lineHeight='10px';
window.addEventListener("load",function(){document.body.appendChild(console.container);});
function parse(a){
	switch(typeof a){
		case"undefined":
			return"<span style='color:#888'>undefined</span>";
		case"number":
			return"<span style='color:#00f'>"+string(a)+"</span>";
		case"string":
			return'"<span style="color:#a44">'+string(a)+'</span>"';
		case"function":
			return string(a);
		case"object":
			if(a.constructor==RegExp)return"<span style='a44'>"+string(a)+"</span>";
			return string(JSON.stringify(a));
	}
}
function string(a){return(''+a).replace(/</g,'<span><</span>');}
console.log=function log(...a){
	console.list.push(a);
	console.container.innerHTML+="<br>";
	for(var i in a)
		console.container.innerHTML+="<br>"+parse(a[i]);
	if(a.length==1)
		return a[0];
	else return a;
};