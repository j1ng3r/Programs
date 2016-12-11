function readTextFile(file, callback){
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}
camera.createCanvas();
var pad=new Controller("a",{
	"Start":"Left Arrow",
	"Jump":"Up Arrow",
	"Dash":"Right Arrow",
	"Fall":"Down Arrow",
}),player={
	pos:new Point(0,0),
	vel:new Point(1,0),
	size:10,
	action:"run",
	draw(){
		camera.draw("player",this.pos.x,this.pos.y);
	}
},chunks=null,loaders=2;
camera.createSprite("player","jump/sprites/player.png");
camera.flipAxis("y");
camera.color="#"+Math.floor(Math.random()*16777216).toString(16);
function Block(t,x,y){
	this.type=t;
	this.pos=new Point(x,y);
	this.index=Block.all.push(this)-1;
}
Block=Object.assign(Block,{
	prototype:Object.assign(Block.prototype,{
		kill(){
			Block.all.splice(this.index,1);
		},
		step(){
			if(camera.x-this.x>Block.size)
				return this.kill();
			if(player.pos);
		},
		draw(){
			camera.draw(this.t,this.pos.x,this.pos.y);
		}
	}),
	all:[],
	size:10,
	kill(i){
		(typeof i=="object"?i:Block.all[i]).kill();
	},
	last_Y:0,
	last_X:0,
	chunkey:{
		"#":"floor",
	}
});
function step(){
	if(player.alive){
		switch(player.action){
			case"run":
				
				break;
		}
		for(var i of Block.all)
			Block.step();
		player.pos.addS(player.vel);
	} else {
		
	}
	camera.setCamera(player.x+c.width/8,camera.y-Math.asinh(camera.y-player.y));
}
function draw(){
	camera.ctx.fillStyle=camera.color;
	camera.ctx.fillRect(0,0,camera.c.width,camera.c.height);
	for(var i of Block.all)
		i.draw();
	player.draw();
}
function addChunk(){
	var next_chunk=chunks[Math.floor(chunks.length*Math.random())].reverse(),merge_layer=-1,i,j;
	for(i in next_chunk){
		if(next_chunk[i][0]=="#")merge_layer=i;
	}
	for(i in next_chunk){
		for(j in next_chunk[i]){
			if(next_chunk[i][j]!=" ")new Block(Block.chunkey[next_chunk[i][j]],j*Block.size,i);
		}
	}
}
readTextFile("jump/chunks.json",function(a){
	chunks=JSON.parse(a);
	init();
});
window.onload=init;
function init(){if(!--loaders){
	document.body.appendChild(c);
	interval(step,draw,60);
}}