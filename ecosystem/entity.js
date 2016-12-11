function Entity(type,x,y,gene,food){
	this.type=type;
	this.x=x;
	this.y=y;
	this.gene=gene;
	this.food=food;
	this.movex=0;
	this.movey=0;
}
Entity.prototype=Object.assign(Entity.prototype,{
	step(){
		var surrounds=[this.food];
		for(var i=-2,j;i<=2;i++){
			for(j=-2;j<=2;j++){
				if(i||j){//Not the current position
					surrounds.push(map.convertToNumber(map.getTile(this.x+i,this.y+j).type));
				}
			}
		}
		surrounds=Array.level(surrounds);
		var data=network.execute(this.gene,surrounds);
		var movex=data[1]-data[2];
		var movey=data[3]-data[4];
		this.willReproduce=Math.round(data[0]);
		if(this.food>rules[this.type].loss_move+rules[this.type].minFood&&(movex||movey)){
			this.food-=rules[this.type].loss_move;
			this.movex=this.x+movex;
			this.movey=this.y+movey;
		} else {
			this.food-=rules[this.type].loss_idle;
		}		
		if(this.food<rules[this.type].minFood)
			map.kill(this);
	},
	move(){
		if(rules[this.type].eat.hasOwnProperty(map.getTile(this.movex,this.movey))){
			map.kill(map.getTile(this.movex,this.movey))
		}
	},
});