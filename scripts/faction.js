var icetr3yOS = icetr3yOS || {};
    
icetr3yOS.Class_Faction = function( renderColor )
{
    this.factionColorUINT = renderColor;
    this.factionColorRGB =
    {
        r : renderColor >> 16,
        g : ( renderColor >> 8 ) & 0x0000FF,
        b : renderColor & 0x0000FF
    }
    
    var self = this;
    
    var entities = [];
    var entityPositions = new Float32Array( 0 );
    var worldSize = null;
    var renderer = null;
    var clTileSize = new Uint32Array( 1 );
    var clCanvasWidth = new Uint32Array( 1 );
    
    var debugCanvas = null;
    
    this.clBufferInEntityPositions = null;
    this.clBufferInImageData       = null;
    this.clBufferOutImageData      = null;
    
    //var bufOut = ctx.createBuffer (WebCL.MEM_WRITE_ONLY, bufSize);
    
    this.Initialize = function()
    {
        renderer          = icetr3yOS.Renderer.GetRenderer();
        var canvas        = renderer.GetCanvas( 'Main' );
        var canvasContext = canvas.getContext( "2d" );
        var canvasWidth   = canvas.width;
        var canvasHeight  = canvas.height;
        
        debugCanvas = renderer.CreateNewCanvasContextForDebugOutput( self.factionColorUINT, canvasWidth, canvasHeight );
        
        var world = icetr3yOS.World.GetWorld();
        worldSize = world.worldSize;
        
        var webCLObj = world.webCLObj;
        
        var imageSize = canvasWidth * canvasHeight * 4;
        
        if ( webCLObj.context !== null )
        {
            clBufferInImageData       = webCLObj.context.createBuffer( WebCL.MEM_READ_ONLY,  imageSize );
            clBufferOutImageData      = webCLObj.context.createBuffer( WebCL.MEM_WRITE_ONLY, imageSize );
        }
    }
    
    this.Update = function( deltaSeconds )
    {
        var indexIntoFloatArray = 0;
        
        for( var i = 0; i < entities.length; ++i )
        {
            entities[ i ].Update( deltaSeconds );
            
            indexIntoFloatArray = i * 2;
            
            entityPositions[ indexIntoFloatArray ] = entities[ i ].position.x;
            entityPositions[ indexIntoFloatArray + 1 ] = entities[ i ].position.y;
        }
    }
    
    this.Render = function( pixels )
    {
        var canvas        = renderer.GetCanvas( 'Main' );
        var canvasContext = canvas.getContext( "2d" );
        var canvasWidth   = canvas.width;
        var canvasHeight  = canvas.height;
        
        var entityPositionInPixels = 0;
        var currentPixel = 0;
        
        var t0 = "";
        var t1 = "";
        
        var debugContext  = debugCanvas.getContext( "2d" );
        var srcImage      = document.getElementById( 'image' );
            
        debugCanvas.width = srcImage.width;
        debugCanvas.height = srcImage.height;
        debugContext.drawImage( srcImage, 0, 0 );
        
        var debugPixels    = debugContext.getImageData( 0, 0, debugCanvas.width, debugCanvas.height );
        
        
        var tileSize = icetr3yOS.World.GetWorld().tileSize;
        
        for( var i = 0; i < entityPositions.length; i+=2 )
        {
            entityPositionInPixels = ( Math.floor( entityPositions[ i + 1 ] ) * tileSize.y * canvasWidth + Math.floor( entityPositions[ i ] ) * tileSize.x ) * 4;
            currentPixel = entityPositionInPixels;
            
            for( var y = tileSize.y - 1; y >= 0; --y )
            {
                for( var x = 0; x < tileSize.x; ++x )
                {
                    currentPixel = entityPositionInPixels + ( y * canvasWidth + x ) * 4;
                    
                    pixels.data[ currentPixel ]     = self.factionColorRGB.r;
                    pixels.data[ currentPixel + 1 ] = self.factionColorRGB.g;
                    pixels.data[ currentPixel + 2 ] = self.factionColorRGB.b;
                    
                    debugPixels.data[ currentPixel ]     = self.factionColorRGB.r;
                    debugPixels.data[ currentPixel + 1 ] = self.factionColorRGB.g;
                    debugPixels.data[ currentPixel + 2 ] = self.factionColorRGB.b;
                }
            }
        }     
        
        debugContext.putImageData( debugPixels, 0, 0 );
    }
    
    this.AddEntity = function( newEntity )
    {
        entities.push( newEntity );
    }
    
    this.OnFinishedAddingEntities = function()
    {
        entityPositions = new Float32Array( entities.length * 2 );
        
        var indexInPositionArray = 0;
        for( var i = 0; i < entities.length; ++ i )
        {
            indexInPositionArray = i * 2;
            
            entityPositions[ indexInPositionArray ]     = entities[ i ].position.x;
            entityPositions[ indexInPositionArray + 1 ] = entities[ i ].position.y;
            
        }
        
        var webCLObj = icetr3yOS.World.GetWorld().webCLObj;
        if ( webCLObj.context !== null )
        {
            clBufferInEntityPositions = webCLObj.context.createBuffer( WebCL.MEM_READ_ONLY,  entityPositions.length * 4 );
        }
    }
    
    this.GetEntityPositions = function()
    {
        return entityPositions;
    }
    
    this.GetNumEntities = function()
    {
        return entities.length;
    }
}
