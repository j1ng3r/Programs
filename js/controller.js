window.Controller=function(){
	function print(a){console.log(a);return a;}
	function Controller(name,scheme){
		if(/[[\]:,|]/.test(name))throw"Cannot have [],:| in a Controller name.";
		this.name=name;
		if(Controller.getSchemeByName(this.name))this._getScheme();else this.scheme=Controller.parseScheme(scheme);
		Controller.window.addEventListener("keydown",this._event.bind(this));
		Controller.window.addEventListener("keyup",this._event.bind(this));
	}
	Controller=Object.assign(Controller,{
		prototype:Object.assign(Controller.prototype,{
			input:{},
			getInput(n){
				var _=this.scheme[n].split("|"),a=Controller.window.navigator.getGamepads(),b,validGamepads=[],i;
				for(i in a)
					if(a[i]&&a[i].buttons&&a[i].buttons.length)
						validGamepads.push(a[i]);
				for(i of _){
					i=i.trim();
					b=(i.match(/\d+/g)||[])[1]
					if(i.slice(0,3)=="Pad"){
						if(a=validGamepads[i[3]])
							this.input[n]=(i.slice(4,8)!="Axis"
								?a.buttons[b].value
								:i.match(/[+-]$/)
									?Math.max(0,(i.slice(-1)+"1")*a.axes[b])
									:a.axes[b]
							);
					}
					if(this.input[n]){
						return this.input[n];
					}
				}
				return 0;
			},
			scheme:{},
			_activate(a,v){
				for(var i in this.scheme)
					if(this.scheme[i].match(RegExp(`(\\||^)\\s*${a}\\s*(\\||$)`,"i")))
						return this.input[i]=v;
			},
			_getScheme(){
				return this.scheme=Controller.parseScheme(Controller.getSchemeByName(this.name).data);
			},
			saveScheme(){
				var a=this.name+"[",i,b=Controller.get(),c=Controller.getSchemeByName(this.name);
				for(i in this.scheme)
					a+=(a?',':'')+i+":"+this.scheme[i];
				Controller.set(b.slice(0,c.start)+a+"]"+b.slice(c.end));
			},
			changeControl(name,key){
				if(key)for(var i in this.scheme)
					if(this.scheme[i]==key)
						this.scheme[i]==this.scheme[name];
				this.scheme[name]=key;
			},
			resetAllInputs(i){
				for(i of Controller._buttonNames)
					this.input[i]=!0;
			},
			_event(e){
				if(e.type.slice(0,3)=="key")
					this._activate(Controller.parseEvent(e),e.type=="keydown"?1:0);
			},
			addControl(c){
				Controller.buttonNames.push(""+c);
			}
		}),
		window:window,
		parseEvent(e){
			if(e.type.slice(0,3)=="key"){
				if((e.key.length==1&&e.key!=' ')||e.key.match(/^f\d$/i))return e.key;
				if(e.key.match(/^Arrow/))return e.key.slice(5)+" Arrow";
				if(e.code.match(/Left$/))return"L"+e.code.slice(0,-4);
				if(e.code.match(/Right$/))return"R"+e.code.slice(0,-5);
				return e.code;
			}
		},
		buttonNames:[],
		getSchemeByName(name){
			var o,d=Controller.get().split(']'),a;
			for(a in d)
				if(d[a]!=(o=d[a].replace(RegExp("^"+name+"\\["),"")))
					return {
						data:o,
						start:+a,
						end:+a+o.length
					};
			return null;
		},
		setWindow(w){
			Controller.window=w;
		},
		get(){return Controller.window.localStorage.getItem('controls');},
		set(a){Controller.window.localStorage.setItem('controls',a);},
		parseScheme(scheme){
			if(typeof scheme=="object")return scheme;
			if(typeof scheme!="string")return {};
			var b={},a;
			scheme=scheme.trim().replace(/,$/,'').split(',');
			for(a of scheme)
				b[a.split(':')[0].trim()]=a.split(':')[1].trim();
			return b;
		}
	});
	Controller.set(Controller.get()||"");
	return Controller;
}();