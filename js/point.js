function Point(x,y){
	"use strict";
	if(!this)return new Point(x,y);
	if(typeof x=='object')
		this.set(x[0]||x.x,x[1]||x.y);
	else this.set(+x||this.x||0,+y||this.y||0);
}
Point.prototype=Object.assign(Point.prototype,{
	set(x,y){
		this.x=x;
		this.y=y;
	},
	addS(a,b){
		a=new Point(a,b);
		this.x+=a.x;
		this.y+=a.y;
		return this;
	},
	add(a,b){
		return new Point(this).addS(a,b);
	},
	subS(a,b){
		a=new Point(a,b);
		this.x-=a.x;
		this.y-=a.y;
		return this;
	},
	sub(a,b){
		return new Point(this).subS(a,b);
	},
	scaleS(a){
		this.x*=a||0;
		this.y*=a||0;
		return this;
	},
	scale(a){
		return new Point(this).scaleS(a);
	},
	divS(a){
		return this.scaleS(1/a);
	},
	div(a){
		return this.scale(1/a);
	},
	rotateS(r){
		var x=Math.cos(r),y=Math.sin(r);
		this.set(
			this.x*x-this.y*y,
			this.y*x+this.x*y
		);
	},
	rotate(r){
		return new Point(this).rotateS(r);
	},
	dist(a,b){
		a=this.sub(a,b);
		return Math.sqrt(a.x*a.x+a.y*a.y);
	},
});