var names=["dirt","weed","flower","caterpillar","bird","cat","mouse","mushroom"],editor = {
	textarea:null,
	setData(data){
		editor.textarea.value = JSON.stringify(data,null,"\t").replace(/null/gm,"Infinity");
	},
	getData(){
		return new Function("return "+editor.textarea.value.replace(/"/mg,""))();
	}
},size=30,
input_length=24*Math.ceil(Math.log2(names.length)),network = null;
function mn(){
network=new NeuralNetwork(`>0-${input_length}(.0-${input_length}(.${input_length+1}-${Math.ceil(input_length*2.5)}(.${Math.ceil(input_length*2.5)+1}-${Math.ceil(input_length*3.5)}(<0-4)))) #0(.0-${Math.ceil(input_length*2.5)} <0-4)`,{
	numberOfCreatures:size*size,
	minGene:-15,
	maxGene:15,
	reset:0.08,
	mut:0.3,
	geneVar:2
});
}
console.log(network);
var tiles=new grid(size,size,10,10),entities=[],rules={
	dirt:{
		isSoil:true,
		reproduce:Infinity,
		loss_idle:0,
		necessary:0,
		loss_move:Infinity,
		eat:{},
	},
	weed:{
		loss_move:Infinity,
		loss_idle:-10,
		reproduce:55,
		necessary:1.5,
		eat:{
			grass:0.05,
		},
	},
	grass:{
		loss_move:Infinity,
		loss_idle:-20,
		reproduce:64,
		necessary:1,
		eat:{},
		turn_to_dirt:true,
	},
	caterpillar:{
		loss_move:2,
		loss_idle:1,
		reproduce:30,
		necessary:3,
		eat:{
			grass:0.5,
			weed:0.1,
			mushroom:0.35,
		},
	},
	bird:{
		loss_move:5,
		loss_idle:2,
		reproduce:43,
		necessary:12,
		eat:{
			caterpillar:0.23,
			weed:0.05,
			grass:0.14,
		}
	},
	cat:{
		loss_move:6,
		loss_idle:3,
		reproduce:52,
		necessary:27,
		eat:{
			mouse:0.4,
			bird:0.35,
			grass:0.04,
			weeds:0.01,
		},
	},
	mouse:{
		loss_move:7,
		loss_idle:2,
		reproduce:38,
		necessary:9,
		eat:{
			weeds:0.11,
			grass:0.08,
			mushroom:0.25,
		},
	},
	mushroom:{
		loss_move:Infinity,
		loss_idle:0,
		reproduce:22,
		necessary:1,
		eat:{
			corpse:1,
		},
		turn_to_dirt:true,
	},
	corpse:{
		isSoil:true,
		loss_move:Infinity,
		loss_idle:0,
		necessary:0,
		reproduce:Infinity,
		eat:{}
	}
};
window.addEventListener("load",function(){
	editor.textarea=document.querySelector("textarea");
	editor.setData(rules);
	tiles.setCanvas(document.querySelector("canvas"));
	//setInterval(function(){
		
		tiles.draw(0,0);
	//},17);
});
function interval(func){
	func();
	window.requestAnimationFrame(interval(func));
}
tiles.createFromStringArray([
	"##########",
	"#........#",
	"#........#",
	"#........#",
	"#...AAAAA#",
	"#........#",
	"#........#",
	"#........#",
	"#........#",
	"##########"
],{
	"#":{
		type:"color",
		color:"black"
	},
	".":{
		type:"color",
		color:"white"
	},
	"A":{
		type:"color",
		color:"red"
	}
});
function Entity(type,x,y,gene,food){
	this.x=x;
	this.y=y;
	this.t=type;
	this.gene=gene;
	this.food=food;
	this.movex=0;
	this.movey=0;
}
Entity.prototype=Object.assign(Entity.prototype,{
	step(){
		var surroundings=[];
		
		network.execute(this.gene)
	},
	act(){
		
	}
});

function getEntityAtTile(x,y){
	x=x%tiles.size.x;
	y=y%tiles.size.y;
	
}
function getTile(x,y){
	return tiles[x%tiles.size.x][y%tiles.size.y];
}
function generateTerrain(){
	for(var i=0,j;i<size;i++){
		tiles.push([]);
		for(j=0;j<size;j++)entities.push(new Entity(tiles[i]=Math.floor(Math.random()*5),i,j,new Gene()));
	}
}
function setRules(){
	rules = editor.getData();
}


/*
for all entities
	data = neural network (current entity . gene, surrounding square values)
	current entity.setMove(data.movex, data.movey)
for all entities
	current entity.move()
*/