window.interval=function(){
	function interval(logic,draw,logic_fps){
		setInterval(function(){logic();draw();},1000/logic_fps);
	}
	return interval
}();