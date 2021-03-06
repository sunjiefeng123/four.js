define(function(require){
    var FEATURE_STYLE = require('./feature_style');
    /*
     *  * 点、线、面、3d面、文本样式
     *   */
    var STYLE_TYPE_POINT = 1,
        STYLE_TYPE_POLYLINE = 2,
        STYLE_TYPE_POLYGON = 3,
        STYLE_TYPE_3DPOLYGON = 4,
        STYLE_TYPE_TEXT = 5;

    var jsonp = (function(){
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
    })();
    var STATUS = {
        'unload':'unload',
        'loading':'loading',
        'loaded':'loaded'
    };
    var TileCache = {
        tiles:new Array(19),
        get:function(x, y, z){
            var d = this.tiles;
            var tileID = 'p_' + x + '_' + y;
            if(d && d[z] && d[z][tileID]){
                return d[z][tileID];
            }
            return null;
        },
        set:function(x, y, z, tile){
            var d = this.tiles;
            var tileID = 'p_' + x + '_' + y;
            if(!d[z]){
                d[z] = {};
            }
            d[z][tileID] = tile;
        }
    }

    var Parser = {
        'parsePolygon':function(data, col, row, style){
            var x = 0;
            var y = 0;
            var z = 0;
            var pts = data[1];
            var style0 = FEATURE_STYLE[data[3]];
            var style1 = FEATURE_STYLE[data[4]];
            var color = style0[1];
            var borderLineStyle = style0[2];
            var drawOutline = true;
            var linePoints = [];
            
            x = pts[0] / 10;
            y = pts[0] / 10;

            if(borderLineStyle.length > 0){
                //需要描边
                drawOutline = true;
                linePoints.push(x + col * 256, 256 - y + row * 256);
            
            }

        
        }, 
        'parse':function(vtd, x, y, zoom, callback){
            //only draw bg
            vtd = vtd.bg;
            var style0, style1;
            vtd.forEach(function(data, index){
                style0 = FEATURE_STYLE[data[3]];
                style1 = FEATURE_STYLE[data[4]];
                if(style0[0] === STYLE_TYPE_POLYGON){
                    //面数据
                    Parser.parsePolygon(data, x, y);
                
                }
           
            });
        }
    };



    var IMG_DOMAIN = "http://online{port}.map.bdimg.com/gvd/?qt=lgvd&layers={layers}&x={x}&y={y}&z={z}&styles={styles}&udt=30130712";
    //var IMG_DOMAIN = "http://pcsv0.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=pl&udt=30130712";
    var Tile = function(x, y, z){
        var t = TileCache.get(x, y, z);
        if(t){
            return t;
        }
        this.status = STATUS.unload; 
        var port = (0.5 + Math.random() * 9) | 0;
        var url = IMG_DOMAIN.replace('{port}', port)
                    .replace('{x}', x)
                    .replace('{y}', y)
                    .replace('{z}', z)
                    .replace('{layers}', 'bg,df')
                    .replace('{styles}', 'pl');
        this.url = url;
        this.x = x;
        this.y = y;
        this.z = z;
        if(x && y && z){
            TileCache.set(x, y, z, this);
        }
        this.fetch();
    };
    var tp = Tile.prototype;
    tp.fetch = function(){
        if(this.status !== STATUS.unload){
            return; 
        }
        var url = this.url;
        this.status = STATUS.loading;
        var self = this;
        jsonp(url, function(result){
            Parser.parse(result.content, self.x, self.y, self.z, function(data){
                console.log(data); 
            });
        })
        return this;
    }
    return Tile;
});
