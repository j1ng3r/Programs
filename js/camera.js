window.camera={
		x:0,
		y:0,
		r:0,
		c:null,
		ctx:null,
		center:{
			type:"Percent",
			x:0.5,
			y:0.5,
		},
		flipped:{
			x:0,
			y:0,
		},
		flipAxis(name){
			if(name.match(/[x1X]/))this.flipped.x=!this.flipped.x;
			else this.flipped.y=!this.flipped.y;
		},
		draw(){
			this.ctx.translate(this.flipped.x?this.x:this.c.width-this.x,this.flipped.y?this.c.height-this.y:this.y);'
			this.ctx.rotate(this.r);
			this.draw_untranslated.apply(this,arguments);
			this.ctx.resetTransform();
		},
		draw_untranslated(name,x,y,r){
			this.ctx.translate(x,y);
			this.ctx.rotate(r);
			a=image(a);
			ctx.drawImage(a,-a.center.x,-a.center.y);
			ctx.resetTransform();
		},
		createCanvas(){
			this.setCanvas(window.document.createElement("canvas"));
			window.addEventListener("load",function(){
				window.document.body.appendChild(this.c);
			});
		},
		setCanvas(c){
			this.c=c;
			this.ctx=c.getContext("2d");
		},
		setContext(ctx){
			this.ctx=ctx;
			this.c=ctx.canvas;
		},
		setCamera(x,y,r){
			if(typeof r!="undefined")this.r=r;
			this.x=x;
			this.y=y;
		},
		setCenterXY(name,obj){
			if(typeof name=="object"){
				this.center={
					type:"XY",
					x:obj.x,
					y:obj.y,
				}
				for(var i in this.sprites)this.setCenterXY(i,name);
			} else this.getSprite(name).center={
				x:+obj.x||0,
				y:+obj.y||0
			};
		},
		setCenterPercent(name,obj){
			if(typeof name=="object"){
				this.center={
					type:"Percent",
					x:obj.x,
					y:obj.y
				};
				for(var i in this.sprites)this.setCenterPercent(i,name);
			} else {
				var a=this.getSprite(name);
				a.center={
					x:obj.x*a.width||0,
					y:obj.y*a.height||0
				};
			}
		},
		sprites:{},
		createSprite(name,url){
			this.sprites[name]=this.image(url);
		},
		getSprite(name){
			if(this.sprites.hasOwnProperty(name)){
				return this.sprites[name];
			} else {
				throw new Error(`Camera object does not recognize the name ${name}. Try creating it first with camera.createSprite`);
			}
		},
		image(url){try{
			if(typeof url=="object")return url;
			else {
				var a=Object.assign(new Image,{src:url});
				if(this.center.type=="XY")a.center={
					x:this.center.x,
					y:this.center.y
				}; else a.center={
					x:a.width*this.center.x,
					y:a.height*this.center.y
				};
			}
		}catch(e){throw new Error(`The URL ${url} doesn't work.`);}},
};