String.reverse=function reverse(s){
	return s.split('').reverse().join('');
};
Object.deepCopy=function deepCopy(o){
	if(typeof o=='object'){
		var i,r=Array.isArray(o)?[]:{};
		for(i in o)r[i]=Object.deepCopy(o[i]);
		return r;
	} else return o;
};
Array.level=function(a){
	if(typeof a!='object')
		return a;
	var _=[],i;
	for(i in a)
		_.concat(Array.level(a[i]));
	return _;
};
Array.repeat=function(e,n){
	var a=[],i;
	for(i=0;i<n;i++)a.push(e);
	return a;
};
Math.rand=function(a,b){return arguments.length?+a+(+b-a)*Math.random():Math.random();};
Math.sq=function(a){return a*a;};
console.print=function print(a){
	try{
		console.log(JSON.stringify(a));
	} catch(e){
		console.log(a);
	}
	return a;
};
/*
Properties:
  * minGene : minimum value for each gene
  * maxGene : maximum value for each gene
  * geneVar : maximum variance from the original gene value
  * mut : Likelihood of mutation
  * reset : Likelihood of total reset of gene
*/
//Object.defineProperty(window,"hello",{get:a=>{return "log"}});
function Gene(n,o){
	this.length=+n;
	this.gene=[];
	for(var i in o)this[i]=o[i];
	for(i=0;i<this.length;i++)
		this.gene[i]=this.getNewNumber();
	this.fit=null;
	this.sim=null;
}
Gene.prototype=Object.assign(Gene.prototype,{
	getNewNumber(){
		return Math.rand(this.minGene,this.maxGene);
	},
	mutateNumber(num){
		if(this.mut<Math.rand())
			return num;
		if(Math.rand()<this.reset)
			return this.getNewNumber();
		return num+Math.rand(-this.geneVar,this.geneVar);
	},
	clone(){
		var _=Object.assign(new Gene(),Object.deepCopy(this)),i;
		for(i in _.gene)
			_.gene[i]=_.mutateNumber(_.gene[i]);
		return _;
	},
	assignFitness(f){
		this.fit=f;
	}
});
function Node(t,i,n,y){
	this.network=y;
	this.type=t;
	this.indexS=+i;
	this.indexG=+n;
	this.go=[];
	this.con=[];
	this.from=[];
	this.weight=0;
	this.activity=0;
	this.calc=false;
}
Node.prototype=Object.assign(Node.prototype,{
	connectP(t){
		for(var i in t)
			this.connectTo(this.network.getNode(t[i].n)).connectP(t[i].d);
		console.log("connection made!");
	},
	connectTo(_){
		this.go.push(_);
		_.con.push(this.network.connections++);
		_.from.push(this);
		return _;
	}
});
//.n is the name of the node
//.d is the data of the node
function NeuralNetwork(s,g){
	this.connections=0;
	this.genes=[];
	this.nodes=[];
	this.iNodes=[];
	this.oNodes=[];
	this.bNodes=[];
	this.nNodes=[];
	this.squash=l=>(l/Math.sqrt(1+4*l*l)+.5);
	this.geneMap=Object.deepCopy(g);
	s=NeuralNetwork.parse(s);
	for(var i in s)
		this.getNode(s[i].n).connectP(s[i].d);
	this.reset();
}
NeuralNetwork=Object.assign(NeuralNetwork,{
	Node:Node,
	parse(s){
		function e(s){
			var i,j,k;
			for(i of s){
				if(i.n.match(/\D/))
					t=i.n[0];
				else if(t)
					i.n=t+i.n;
				else throw 'Unknown node identifier';
				i.d=e(i.d);
			}
			for(i of s){
				if(i.n.includes('-')){
					k=i.n.match(/\d+/g);
					if(!(k&&k.length==2)) throw 'Unknown node identifier';
					for(j=k[0],k=k[1];j<k;j++)
						s.push({n:i.n[0]+j,d:Object.deepCopy(i.d)});
					i.n=i.n[0]+k;
				}
			}
			return s;
		}
		function t(s){
			if(!s.trim())return[];
			var r=[],p=0,i,a=0;
			for(i in s){
				if(s[i]=='(')p++;
				if(s[i]==')')p--;
				if(s[i]==' '&&!p)r.push(s.slice(a,i,a=+i+1));
			}
			if(p)throw 'unmatched paren: '+p;
			else r.push(s.slice(a));
			
			for(i in r)
				r[i]={
					n:r[i].split('(')[0],
					d:t(r[i].replace(/[^(]+(\(|$)/,'').slice(0,-1))
				};
			return r;
		}
		return e(t(String.reverse(String.reverse(s
			.replace(/[bc#]/ig,'b')
			.replace(/[i>]/ig,'i')
			.replace(/[o<]/ig,'o')
			.replace(/[^- (bino)0-9]/g,'n')
			.replace(/\([\n\t ]*\)|[\n\t ]+(?=\(|\))/g,''))
				.replace(/[\n\t ]+(?=\(|\))/g,''))
			.replace(/(?=[bino])/g,' ')
			.replace(/\)(?=\d)/g,') ')
			.replace(/\([\n\t ]+/g,'(')
			.trim().replace(/[\n\t ]+/g,' ')));
	},
	prototype:Object.assign(NeuralNetwork.prototype,{
		reset(){
			this.createGenes(this.geneMap.numberOfCreatures,this.geneMap);
		},
		createGenes(n,o){
			this.geneMap=o;
			this.geneMap.numberOfCreatures=+n;
			for(var i=0;i<+n;i++)
				this.genes.push(new Gene(this.iNodes.length,o));
		},
		sortGenesByFit(){
			return this.genes.sort(function(a,b){return b.fit-a.fit;});
		},
		killWeakGenes(p){
			this.genes=this.sortGenesByFit().slice(0,Math.ceil(p*this.genes.length));
		},
		createNewPop(p){
			this.killWeakGenes(p);
			var g = [],i=0,j=0,k=0;
			while(k<this.geneMap.numberOfCreatures){
				if(j>i){
					g.push(this.genes[i].clone());
					i++;
					k++;
				} else {
					i=0;
					j++;
				}
			}
			this.genes=g;
		},
		getNode(a){
			var t = a[0];a=a.slice(1);
			if(this[t+'Nodes'][a])
				return this[t+'Nodes'][a];
			else
				return this.createNode(t,a);
		},
		createNode(t,i){
			var _ = new Node(t,i,this.nodes.length,this);
			this.nodes.push(_);
			return this[t+'Nodes'][i]=_;
		},
		execute(g,a){
			var i,j,k;
			for(i of this.nodes)
				if(i.type=='b')i.calc=!!(i.weight=1);
			    else i.calc=!!(i.weight=i.activity=0);
			for(i in this.inputNodes){
				this.inputNodes[i].weight=a;
				this.inputNodes[i].calc=true;
			}
			for(i in this.nodes){
				if(!this.nodes[i].calc)
					k=true;
					for(j in this.nodes[i].from)
						if(!this.nodes[i].from[j].calc)k=false;
					if(k){
						for(j in this.nodes[i].from)
							this.nodes[i].activity+=g[this.nodes[i].con[j]]*this.nodes[i].from[j];
						this.weight=this.squash(this.activity);
						this.calc=true;
					}
			}
			j=[];
			for(i in this.oNodes)j[i]=this.oNodes[i].weight;
			return j;
		}
	})
});

//>0(.0-3(<0-1) <0) #0(.0-2) 1(.3 <0 1)
//Input 0 connects to 

//Use num,maxGene,minGene,reset (prob: 0==impossible),mut (prob: 0==impossible),and geneVar to define gene properties.

/*

var sim = new NeuralNetwork('>0-4(.0-7(.8-18(<0-6)) 8-18) #0(.0-7) 1(<0-6)',{
	num:2,
	minGene:-10,
	maxGene:10,
	reset:0.08,
	mut:0.4,
	geneVar:1
}),b=[],pr=10,ph=15,br=2,bs=1.5,past=[];
function lineIntersects(w,z,x,y,r){return!r<Math.abs(z*x-w*y)&&(w*x+z*y>=0||w*w+z*z<=r*r);}
function dist(o1,o2){return Math.sqrt(Math.sq(o1.x-o2.x)+Math.sq(o1.y-o2,y));}
function Player(x,y,a){
	this.a=a;
	this.x=x;
	this.y=y;
	this.h=ph;
	this.p=[];
	this.f=0;
	p.push(this);
}
Player.prototype=Object.assign(Player.prototype,{
	move(a,d){
		d+=this.a;
		this.x+=Math.cos(d)*a;
		this.y+=Math.sin(d)*a;
	},
	turn(a){this.a+=a;},
	shoot(){new Bullet(this);this.f=10;},
});
function Bullet(o){
	this.i=b.length;
	this.vx=Math.cos(o.a);
	this.vy=Math.sin(o.a);
	this.x=o.x+this.vx*pr;
	this.y=o.y+this.vy*pr;
	this.p=o;
	b.push(this);
}
Bullet.prototype.move=function(){
	this.x+=this.vx*bs;
	this.y+=this.vy*bs;
	var d=0,i;
	for(i in p)if(p[i])
		if(Math.sq(br+pr)<=Math.sq(this.x-p.x)+Math.sq(this.y-p.y)){
			d=1;
			p.h--;
			p.score--;
			this.p.score++;
		}
	if(d)b.splice(this.i,1);
};

function simulate(){
	p=[];
	b=[];
	new Player(0,0,Math.PI/2);
	new Player(0,100,Math.PI);
	new Player(100,100,Math.PI*3/2);
	new Player(100,0,0);
	for(var i in p)
		p[i].p=Array.repeat([0,0,0,0,0]);
}
function iter(){
	var i,j,k,l;
	for(i in p)if(p[i]){
		p[i].f?p[i].f--:0;
		p[i].p.pop();
		k=[];
		k[0]=0;
		for(l in p)if(p[l]&&p[i]!=p[l]&&lineIntersects(p[l].x-p[i].x,p[l].y-p[i].y,Math.cos(p[i].a),Math.sin(p[i].a),pr+br-1))
			k[0]=Math.min(k[0],dist(p[l],p[i]);
		k=[Math.pow(2,-k[0]),!p[i].f,0,p[i].h/ph,ph];
		for(l in p)k[4]=Math.min(k[4],p[l].h||0);
		for(l in b)
			if(dist(b[l],p[i])<pr+br+5)
				k[2]=1;
		
		p[i].p.unshift(k);
		j=sim.execute(sim.genes[i],Array.level(p[i].p));
		if(j[2]>0.5){
			k[1]?p[i].shoot():0;
		} else {
			p[i].turn(j[0]-j[1]);
			for(k=3;k<7;k++)
				p[i].move(j[k],Math.PI*k/2);
		}
	}
	for(i in p)if(p[i])sim.genes[i].fit=p[i].score;
	j=0;
	for(i in p)if(p[i].h<1){
		p[i]=null;
	} else j++;
	if(j==1){
		sim.createNewPop();
	}
}

German Bank collasping
*/
/*Inputs: (2^-|dist|, canShoot, bulletCloseBy (1 or 0), thisHealth/thisMaxHealth, enemHealth/enemMaxHealth)x12
Outputs: turnR,turnL,shoot,moveF,moveR,moveB,moveL

Todo: test!
*/