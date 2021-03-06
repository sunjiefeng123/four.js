define(function(){

    

    var util = {
        'toHumpCase':(function(){
            var cache = {};
            return function(str){
                if(cache[str]){
                    return cache[str]; 
                } 
                var newName = str.length === 2 ? str.toLowerCase() : str.substr(0,1).toLowerCase() + str.substr(1);
                cache[str] = newName;
                return newName;
            }
        })(),
        'isArray':function(a){
            return Array.isArray(a); 
        },
        'isObject':function(a){
            var tp = typeof a;
            return tp === 'function' || tp === 'object' && a !== null;
        },
        'jsonp': (function(){
            var body = document.body;
            var n = 0;
            var callbacks = window.CB = {};
            return function(src, callback){
                var script = document.createElement('script');
                var cbid = '$cb_' + (++n);
                callbacks[cbid] = function(result){
                    body.removeChild(script);
                    delete callbacks[cbid];
                    cbid = null;
                    callback(result);
                };
                src += '&fn=window.CB.' + cbid;
                body.appendChild(script);
                script.src = src;
            }
        })(),
        'copy':function(obj, toHumpCase){
            if(util.isArray(obj)){
                return obj.map(function(v){
                    return util.copy(v, toHumpCase);
                }, true)
            }else if(util.isObject(obj)){
                var r = {};
                var nk;
                for(var k in obj){
                    nk = toHumpCase ? util.toHumpCase(k) : k;
                    r[nk] = util.copy(obj[k], toHumpCase);
                } 
                return r;
            }else{
                return obj;
            }
        }
    }

    return util;
});
