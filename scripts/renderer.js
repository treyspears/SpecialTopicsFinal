var icetr3yOS = icetr3yOS || {};

icetr3yOS.Renderer = ( function ()
{
    var renderer = null;
    
    var constructor = function()
    {    
        var self = this;
        
        this.CreateNewCanvasContextForMainOutput = function( name, width, height )
        { 
            var newCanvas = document.createElement( 'canvas' );
            
            newCanvas.id     = 'canvas' + name;
            newCanvas.width  = typeof width  !== 'undefined' ? width  : 0;
            newCanvas.height = typeof height !== 'undefined' ? height : 0;
            
            var output = document.getElementById( "mainOutput" );
   
            var results = document.createElement( 'div' );
            results.style="width: 400px; height: 508px; overflow-y: scroll; border: 2px solid black; background-color: white; display: inline-block; ";
            results.id = 'results';
            
            output.appendChild( newCanvas );
            output.appendChild( results );
            
            return newCanvas;
        }
        
        this.CreateNewCanvasContextForDebugOutput = function( name, width, height )
        { 
            var newCanvas = document.createElement( 'canvas' );
            
            newCanvas.id     = 'canvas' + name;
            newCanvas.width  = typeof width  !== 'undefined' ? width  : 0;
            newCanvas.height = typeof height !== 'undefined' ? height : 0;
            
            newCanvas.style.padding ="10px 10px 10px 10px";
            
            var output = document.getElementById( "debugOutput" );
            
            output.appendChild( newCanvas );
            
            return newCanvas;
        }
        
        this.GetCanvas = function( name )
        {
            var canvas = document.getElementById( 'canvas' + name );
            return canvas;
        }
        
        this.GetResults = function( name )
        {
            var canvas = document.getElementById( 'results' );
            return canvas;
        }
        
        this.Initialize = function()
        {
            try
            {
                var canvas          = self.CreateNewCanvasContextForMainOutput( 'Main', 512, 512 );
                var canvasContext   = canvas.getContext("2d");
                var srcImg          = new Image();
                
                srcImg.id       = 'image';
                srcImg.src      = './baseImage.png';
                canvas.width    = srcImg.width;
                canvas.height   = srcImg.height;
                
                canvasContext.drawImage( srcImg, 0, 0, srcImg.width, srcImg.height );
            }
            catch( error )
            {
                document.getElementById("mainOutput").innerHTML += 
                "<h3>ERROR:</h3><pre style=\"color:red;\">" + error.message + "</pre>";
                throw error;
            }
        }
    }
    
    return {
        GetRenderer : function()
        {
            if ( !renderer )
            {
                renderer = new constructor();
            }
            return renderer;
        }
    }
    
} )();