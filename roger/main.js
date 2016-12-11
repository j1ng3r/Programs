Controller.setWindow(window);
function image(URL){
	return typeof URL=="object"?URL:Object.assign(new Image,{src:URL});
}
var c=document.createElement("canvas"),ctx=c.getContext("2d"),p={
	x:0,
	y:0,
	rb:0,
	rx:0,
	ry:0,
	rt:-Math.PI/2,
	tx:-24,
	ty:-30,
	tl:25,
	el:10,
	es:1,
	eby:2,
	ebx:4,
	ex:0,
	ey:0,
	mx:0,
	my:0,
	bx:-26,
	by:-29,
	bl:60,
	items:[],
	attack:{attack:""},
	heavy_attack:"energy",
	light_attack:"small",
	properties:{
		move_speed:4,
		turret_maxturn:0.3,
		turn_speed:0.03,
		sensitivity:0.1
	},
	draw(){
		draw_noTrans(p.sprite.body,c.width/2,c.height/2,0);
		var x=Math.cos(p.rt),y=Math.sin(p.rt);
		draw_noTrans(p.sprite.turret,c.width/2+p.tx+p.tl*x,c.height/2+p.ty+p.tl*y,p.rt);
		draw_noTrans(p.sprite.eye,c.width/2+p.ex,c.height/2+p.ey,0);
	},
	move(x,y){
		var vx=x*p.rx-y*p.ry,
		vy=y*p.rx+x*p.ry;
		p.x+=p.properties.move_speed*vx;
		p.y+=p.properties.move_speed*vy;
	},
	sprite:{
		body:image("sprites/roger.png"),
		turret:image("sprites/turret.png"),
		eye:image("sprites/eye.png")
	},
	sense(a){
		return Math.abs(a)>p.properties.sensitivity?a:0;
	},
},pad=new Controller("Player 1",{
	"turrut turnL":"Pad0Button6|Q",
	"turrut turnR":"Pad0Button7|E",
	"attack light":"Pad0Button0 | Up Arrow",
	"attack heavy":"Pad0Button1|Down Arrow",
	"body turnL":"Pad0Button4 | Left Arrow",
	"body turnR":"Pad0Button5 |Right Arrow",
	"move B":"Pad0Axis1+|S",
	"move F":"Pad0Axis1-|W",
	"move R":"Pad0Axis0+|D",
	"move L":"Pad0Axis0-|A"
}),camera={
	x:400,
	y:300,
	r:0
},
attacks={
	"energy":{
		type:"heavy",
		charge:false,
		lag_start:26,
		lag_end:4,
		damage:4,
		speed:6
	},
	"small":{
		type:"light",
		charge:false,
		lag_start:2,
		lag_end:12,
		damage:1,
		speed:10
	}
},
blocks={
	images:[
		image("sprites/block_stone.png"),
		image("sprites/block_stone2.png"),
		image("sprites/block_stone3.png"),
		image("sprites/block_stone4.png")
	],
},bullets=[],
map=[];
for(var i=0,j;i<100;i++){
	map.push("");
	for(j=0;j<100;j++){
		map[i]+=Math.floor(Math.random()*4);
	}
}
function bullet(obj){
	obj=obj||{};
	this.x=+obj.x||0;
	this.y=+obj.y||0;
	this.v=+obj.v||0;
	this.a=+obj.a||0;
	this.vx=this.v*Math.cos(this.a);
	this.vy=this.v*Math.sin(this.a);
	this.charge=obj.charge;
	this.img=image(obj.img);
	bullets.push(this);
}
bullet.prototype=Object.assign(bullet.prototype,{
	move(){
		this.x+=this.vx;
		this.y+=this.vy;
	},
	draw(){
		draw(this.img,this.x,this.y,this.a);
	}
});
function draw_noTrans(a,x,y,r){
	ctx.translate(+x||0,+y||0);
	ctx.rotate(r);
	a=image(a);
	ctx.drawImage(a,-a.width/2,-a.height/2);
	ctx.resetTransform();
}
function draw(a,x,y,r){
	ctx.translate(camera.x,camera.y);
	ctx.rotate(camera.r);
	draw_noTrans(a,x,y,r);
}
function background(a){
	if(a[0]=='#'){
		ctx.fillStyle=a;
		ctx.fillRect(0,0,c.width,c.height);
	} else draw(a);
}
function update(){
	c.width=document.body.clientWidth;
	c.height=document.body.clientHeight-4;
	ctx.fillStyle="#fff";
	ctx.fillRect(-100,-100,c.width+100,c.height+100);
	bullets.forEach(function(i){i.move();});
	p.mx=p.sense(pad.getInput("move R")-pad.getInput("move L"));
	p.my=p.sense(pad.getInput("move B")-pad.getInput("move F"));
	p.rt=p.properties.turret_maxturn*(pad.getInput("turrut turnR")-pad.getInput("turrut turnL"))-Math.PI/2;
	p.move(p.mx,p.my);
	p.ex=p.mx*p.ebx+p.es;
	p.ey=p.my*p.eby-p.el;
	p.rb+=p.properties.turn_speed*(pad.getInput("body turnR")-pad.getInput("body turnL"));
	p.rx=Math.cos(p.rb);
	p.ry=Math.sin(p.rb);
	if(p.attack.attack){
		if(p.attack.buttonHeld&&!pad.getInput(p.attack.buttonName)&&!attacks[p.attack.attack].canHoldButton)p.attack.buttonHeld="";
		if(!--p.attack.frames){
			switch(p.attack.stage){
				case"charge":
					p.attack.frames=attacks[p.attack.attack].lag_start;
					break;
				case"load":
					p.attack.stage="attack";
					p.attack.frames=1;
					break;
				case"attack":
					((x,y)=>new bullet({
						x:p.x+x*p.rx-y*p.ry,
						y:p.y+y*p.rx+x*p.ry,
						v:attacks[p.attack.attack].speed,
						a:p.rb+p.rt,
						img:`sprites/blt_${p.attack.attack}.png`,
						charge:p.attack.charge
					}))(
						p.bx+p.bl*Math.cos(p.rt),
						p.by+p.bl*Math.sin(p.rt)
					);
					p.attack.stage="cool";
					p.attack.frames=attacks[p.attack.attack].lag_end;
					break;
				
				case"cool":
					p.attack.stage="done";
				case"done":
					p.attack.attack="";
					break;
			}
		} else if(p.attack.stage=="charge"){
			p.attack.charge++;
			if(!pad.getInput(p.attack.buttonPressed))p.attack.frames=1;
		}
	} else {
		if(pad.getInput("attack heavy")||pad.getInput("attack light")){
			if(pad.getInput("attack light")){
				p.attack.buttonName="attack light";
				p.attack.attack=p.light_attack;
			} else {
				p.attack.buttonName="attack heavy";
				p.attack.attack=p.heavy_attack;
			}
			if(attacks[p.attack.attack].charge){
				p.attack.stage="charge";
				p.attack.frames=0;
			} else {
				p.attack.stage="load";
				p.attack.frames=attacks[p.attack.attack].lag_start;
			}
			p.attack.buttonHeld=true;
			p.attack.charge=1;
		}
	}
	
	camera.x=c.width/2-p.x*p.rx-p.y*p.ry;
	camera.y=c.height/2-p.y*p.rx+p.x*p.ry;
	camera.r=-p.rb;
	
	+function(){
	for(var i in map){
		for(var j in map[i]){
			draw(blocks.images[map[i][j]],i*32-map.length*16,j*32-map[i].length*16);
		}
	}}
	//()
	bullets.forEach(function(i){i.draw();});
	p.draw();
}
window.onload=function(){
	c.width=800;
	c.height=600;
	document.body.appendChild(c);
	setInterval(update,17);
};