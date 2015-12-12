/**
*	@author Mücahid Dayan
* 	@description 
				Dieses Programm wurde im Rahmen des Kurses Master Projekt an der Beuth Hochschule für Technik Berlin
* 			    von Mücahid Dayan programmiert. Es dient dazu, dass man die Benutzerverhalten auf den Internetseiten
				loggen kann. Die abgefangene Daten(Events) werden als JSON-Object per AJAX an auf dem Server befindene Datei geschickt <settings.file>: 

				@exceptions : Die Events die nicht verfolgt werden sollen. 	Default = ['mousemove','mouseup','click']
				@observable : Die zu beobachtende Element. 					Default = 'html *',
				@excAttributes: Die nicht zu beobachtende attribute 		Default = null,
				@addEvents : Die zu hinzufügende Elemente 					Default = null,
				@addAttributes: Die zu hinzufügende Attribute 				Default = null,
				@clearAfterSent:true,
				@send : {
					file : 'file.php', Die Datei an die die Daten geschickt werden, Default = 'file.php'
					as:'json' , Das Format, in dem die Daten geschickt werden, Default = JSON
				},
				@frequency : 10000, Häufigkeit des Sendens an den Server
				@timef:true, Wenn true , wird timesStamp formattiert  		Default = true
				@seperator:'!', Trennzeichen,die elemente des Arrays trennt.
				@navigator:false wenn true, werden navigator attribute auch mitgeloggt. Default = false
*
*
**/
jQueryAvailable = (typeof $ != 'undefined' || typeof jQuery != 'undefined');
jQuerySrc = "http://jquery.com/download/#jquery-39-s-cdn-provided-by-maxcdn";
javaEnabled = navigator.javaEnabled();

console.API = null;
if (typeof console._commandLineAPI !== 'undefined') {
    console.API = console._commandLineAPI;
} else if (typeof console._inspectorCommandLineAPI !== 'undefined') {
    console.API = console._inspectorCommandLineAPI;
} else if (typeof console.clear !== 'undefined') {
    console.API = console;
}
 
//debugging


function Samaritan($settings){
	/*********************** private attributes ***********************/
	var events = [
				'blur','change','click',
				'contexmenu','dblclick',
				'keyup','focus','focusin','focusout',
				'hover','keydown','keypress',
				'load','mousedown','mousemove',
				'mouseout','mouseover','mouseup',
				'resize','scroll','select','submit',
				'load','error','onload','ready','hover',
				'mousewheel','paste','pause',
				 'delegate','die','error',

			 ];

	var attributes = [
				'timeStamp',
				'type',
				'target.id',
				'currentTarget.className',
				'target.tagName',
				'which',
				'keyCode',
				'charCode',
				'metaKey',
				'shiftKey',
				'altKey',
				'currentTarget.ownerDocument.dir',
				'currentTarget.offsetHeight',
				'currentTarget.offsetWidth',			 
				'currentTarget.offsetLeft',
				'currentTarget.offsetTop',
				'currentTarget.ownerDocument.baseURI',
				'currentTarget.ownerDocument.charset',
				'currentTarget.ownerDocument.dir',
				'currentTarget.ownerDocument.charset',
				'currentTarget.parentElement.nodeName',
				'currentTarget.parentNode.nodeName',
				
	];	

	nav = [
				'language','appVersion','codeName',
				'appName','cookieEnabled',
				'onLine','platform','product','userAgent',
				
		];

	
	var self = this;

	var cache = [];

	var interval = null;

	var observed = [];

	var started = false;

	var destroyed = false;

	var settings;

	var defaults = {
		exceptions : ['mousemove','mouseup','click'],
		observable : 'html *',
		excAttributes:null,
		addEvents : null,
		addAttributes:null,
		clearAfterSent:true,
		send : {
			file : 'file.php',
			as:'json'
		},
		frequency : 10000,
		timef:true,
		seperator:'!',
		navigator:false
	};

	/*
	* merging arrays <$settings,defaults>
	*/
	
	var consoleEverything = false;	

	/*********************** end of private attributes ***********************/

	/*********************** private functions ***********************/
	var send = function($file,$data){
		var sent;
		interval = setInterval(function() {			
			sent = $.post($file,{data:$data,seperator:settings.seperator}).done(function(data){
				console.debug('Data has been sent to "'+$file+'"');				
				alert(data);
				if(settings.clearAfterSent){
					try{clear();}catch(err){console.error('Observed Array couldnot be cleared!');}
					return true;			
				}
				/*
				console.log(observed);	*/
			}).fail(function(xhr){
				errMess = (xhr.status == 404)?'File "'+$file+'" not found! (404)':(xhr.status == 0 && xhr.statusText == 'error' )?'Acces denied for file "'+$file+'" (CROS Rules are violated)':'status: '+xhr.status+' Status Text: '+xhr.statusText;
				console.error(errMess);
				self.stop();				
			});			
		}, settings.frequency);	
		return sent;
	};

	var observe = function(){
		console.debug('Samaritan has started');
		$.each($.extend( true, events.removeFromArray(settings.exceptions), settings.addEvents ),function(index,element){
			$(settings.observable).on(element,function(e){
				if(started){
					switch(settings.send.as.toLowerCase()){
						case 'json':observed.push(getAttributes(e,settings.seperator)); break;
					}
					if(consoleEverything){console.log(e);}
				}
			});
		});		
	};

	var init = function(){
		if(jQueryAvailable){				
			try{
				settings = $.extend( true, defaults, $settings );
				attributes = $.extend( true, attributes, settings.addAttributes ).removeFromArray(settings.excAttributes);
				setTimeout(function() {
					started = true;
					observe();
					send(settings.send.file,observed);
					started = true;
				}, 10); 
			}
			catch(err){
				console.error(err);
			}
		}else{
			confirmed();
		}
	};

	var isDestroyed = function(){
		if(destroyed){

		}
	}

	var clear = function(){
		try{
			cache = $.extend(true,cache,observed);
			observed.length = 0;
			console.debug('Cached');
		}catch(err){
			console.error(err);
		}
	}


	var recompose = function(obj,string){
	    var parts = (typeof string != 'function')?string.split('.'):'';
	    var newObj = obj[parts[0]];
	    if(parts[1]){
	        parts.splice(0,1);
	        var newString = parts.join('.');
	        return recompose(newObj,newString);
	    }
	    return newObj;
	}

	var getAttributes = function(e,$seperator){
		//console.log(e);
		result = '';
		
		for(var i in attributes){
			result += (!isEmpty(recompose(e,attributes[i])))?attributes[i]+':'+recompose(e,attributes[i])+$seperator:'';		
		}

		if(settings.navigator){
			for(var i in nav){
				result += (!isEmpty(recompose(navigator,nav[i])))?nav[i]+':'+recompose(navigator,nav[i])+$seperator:'';		
			}


		}
		return result;		
	};
	

	/*********************** end of private functions ***********************/

	/***********************public functions ***********************/

	/*
	* after given $cycle Samaritan will be stoped
	*/
	this.stop = function($cycle){
		var cycle = (isEmpty($cycle))?0*settings.frequency:$cycle*settings.frequency;		
		if(started){
			if(cycle > 0){
				setTimeout(function() {
					clearInterval(interval);
					console.debug('Samaritan has stopped after '+cycle/settings.frequency+' cycles');
					started = false;
				}, cycle);
			}else{
				clearInterval(interval);				
				console.debug('Samaritan has stopped');
				started = false;
			}
		}else{
			console.warn('Samaritan has stopped already!');
		}
	};

	this.start = function(){
		if(!started){
			init();
		}else{
			console.warn('Samaritan runs already!');
		}
	};

	this.destroy = function(){
		console.warn('Not implemented function!');
	}

	/* just for demo */
	

	this.getCache = function(){
		try{
			return (!isEmpty(cache))?cache:'Cache is empty!';
		}catch(err){
			console.error(err);
		}
	};

	this.getData = function(){
		try{
			return (!isEmpty(observed))?observed:'There is no data to show!';
		}catch(err){
			console.error(err);
		}
	};

	this.setConsoleEverything = function(value){
		consoleEverything = value;
	};

	/*ends just for demo*/

	/*********************** end of public functions ***********************/
	// initilialize the Samaritan
	init();
}



/***************************** Helper Functions ****************************************/

/* controls if given value is empty */
function isEmpty($var){
	var result;
	result = (Array.isArray($var))?($var.length < 1?true:false):($var == 'undefined' || typeof $var == 'undefined' || $var == null || $var == '')?true:false;
	return result;
}

/* removes given array from array */
Array.prototype.removeFromArray = function(remove){
	for(var i in remove){
		if(this.indexOf(remove[i]) > -1){			
			this.splice(this.indexOf(remove[i]),1);
		}
	}
	return this;
}

function confirmed(){
	var con = prompt("jQuery is required. Please visit the page below and downlaod the latest version of jQuery",jQuerySrc);
	if(!con){
		confirmed();
	}
	else{
		window.open(jQuerySrc);
	}
}

/*****************************************************************************************************/

/*returns a formatted date = H:m:s d.m.Y */
function datef(){
	var d = new Date();
	var milisecond = (d.getMilliseconds() < 9 )?'0'+d.getMilliseconds():d.getMilliseconds();
	var second = (d.getSeconds() < 9 )?'0'+d.getSeconds():d.getSeconds();
	var minute = (d.getMinutes() < 9 )?'0'+d.getMinutes():d.getMinutes();
	var hour = (d.getHours() < 9 )?'0'+d.getHours():d.getHours();
	var day = (d.getDate() < 9)?'0' + d.getDate():d.getDate();
	var month = (d.getMonth() < 9 )?'0'+d.getMonth()+1:d.getMonth()+1;
	var year  = (d.getFullYear() < 9 )?'0'+d.getFullYear():d.getFullYear();

	var date =  hour+':'+minute+':'+second+' '+day+'.'+month+'.'+year;
	console.log('Formatted date : '+date);
	this.get = function(){
		return date;
	}
}

function toJSON($value,$seperator){
	var JSON = '{';
	var seperator = (!isEmpty($seperator))?$seperator:[',',':'];

	for (var i = 0; i < $value.length-1; i++) {
		var ii = $value[i].split(seperator[0]);
		JSON += '{';
		for (var q = 0; q < ii.length-1; q++) {
			var iii = ii[q].split(seperator[1]);
			
			for (var y = 0; y < iii.length-1; y++) {
				zero = "'"+iii[0]+"'";
				one = "'"+iii[1]+"'";
				JSON += zero+':'+one+',';
				//JSON.push({zero:one});
			}

		}
		JSON += '},';
	}
	JSON +='}';
	return JSON;
}


function toStringRecursiv($array,$seperator,$replace){
	var toString="";
	var depth=0;
	var replace = (!isEmpty($replace))?$replace:'';
	var seperator = (!isEmpty($seperator))?$seperator:'_';
	var self = this;

	var recursiv = function($array,$seperator,$replace){
		for (var i = $array.length - 1; i >= 0; i--) {
			if(typeof $array[i] == 'object'){
				recursiv($array[i],seperator);
				toString += depth;
				depth++;
			}
			else{
				try{toString += (isEmpty(replace))?$array[i]:$array[i].replace(replace.from,replace.to);}
				catch(err){
					console.error(err);
				}
				while(depth>0){
					toString += seperator;
				}
			}
		}
	}

	if(Array.isArray($array)){
		recursiv($array,$seperator,$replace);
		return toString;
	}else{
		return (isEmpty(replace))?$array:$array.replace(replace.from,replace.to);
	}	
}


