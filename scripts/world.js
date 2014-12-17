
var icetr3yOS = icetr3yOS || {};
    
icetr3yOS.World = ( function()
{
    var world = null;
       
    var constructor = function( worldSize, code )
    { 
        //public variables
        this.worldSize = worldSize;
        this.worldGrid = new Float32Array( worldSize.x * worldSize.y );
        this.maxInfluence = 255.0;
        this.tileSize = new icetr3yOS.Class_Vector2( 0, 0 );
        this.bComputeMapsWithWebCL = true;
        
        this.webCLPerformanceObj = new icetr3yOS.Class_PerformanceObj();
        this.webCLPlusBufferPerformanceObj = new icetr3yOS.Class_PerformanceObj();
        this.sequentialPerformanceObj = new icetr3yOS.Class_PerformanceObj();
        
        var mostRecentWebCLKernelTime     = 0.0;
        var mostRecentSequentialTime      = 0.0;
        var mostRecentWebCLPlusBufferTime = 0.0;
        
        var mostRecentWebCLKernelMessage     = "";
        var mostRecentSequentialTimeMessage  = "";
        var mostRecentWebCLPlusBufferMessage = "";
        
        this.webCLObj =
        {
            code      : code,
            program   : null,
            context   : null,
            device   : null,
            queue    : null
        }
        
        var self = this;
        
        
        
        //private variables
        var factions = [];
        var blueFaction = new icetr3yOS.Class_Faction( 0x0000FF );
        var redFaction  = new icetr3yOS.Class_Faction( 0xFF0000 );
    
        var previousTime;
        
        var renderer = icetr3yOS.Renderer.GetRenderer();
        
        //public functions
        this.AddFaction = function( newFaction )
        {
            factions.push( newFaction );
        }
         
        this.Initialize = function()
        {
            var canvas        = renderer.GetCanvas( 'Main' );
            var canvasContext = canvas.getContext( "2d" );
            var canvasWidth   = canvas.width;
            var canvasHeight  = canvas.height;
            
            self.tileSize.x = canvasWidth / worldSize.x;
            self.tileSize.y = canvasHeight / worldSize.y;
            
            SetupWebCL();
                 
            factions.push( blueFaction );
            factions.push( redFaction );
            
            blueFaction.Initialize();
            redFaction.Initialize();
            
            AddEntitiesToFactions();
            
            self.previousTime = Date.now() * 0.001;      
        }
        
        this.Update = function()
        {
            requestAnimationFrame( self.Update );
            
            var currentTime = Date.now() * 0.001;
            var deltaSeconds = currentTime - self.previousTime;
            
            for( var i = 0; i < factions.length; ++ i )
            {
                factions[ i ].Update( deltaSeconds );
            }
            
            var renderer = icetr3yOS.Renderer.GetRenderer();
            var results  = renderer.GetResults();
            
            if ( self.bComputeMapsWithWebCL )
            {
                self.webCLPlusBufferPerformanceObj.StartPerformanceBlock();
                CalculateInfluenceMapOpenCL();
                var performanceMilliseconds = self.webCLPlusBufferPerformanceObj.StopPerformanceBlock();
                
                mostRecentWebCLPlusBufferTime = performanceMilliseconds;
                
                mostRecentWebCLPlusBufferMessage = "WebCL Kernel + Buffer Time: ";
                mostRecentWebCLPlusBufferMessage += mostRecentWebCLPlusBufferTime.toFixed( 3 );
                mostRecentWebCLPlusBufferMessage += "ms</br>";
            }
            else
            {
                self.sequentialPerformanceObj.StartPerformanceBlock();
                CalculateInfluenceMapSequentially();
                var performanceMilliseconds = self.sequentialPerformanceObj.StopPerformanceBlock();
                
                mostRecentSequentialTime = performanceMilliseconds;
                
                mostRecentSequentialTimeMessage = "Javascript Time: ";
                mostRecentSequentialTimeMessage += mostRecentSequentialTime.toFixed( 3 );
                mostRecentSequentialTimeMessage += "ms</br>";
            }
            
            results.innerHTML = mostRecentSequentialTimeMessage;
            results.innerHTML += mostRecentWebCLPlusBufferMessage;
            results.innerHTML += mostRecentWebCLKernelMessage;
            
            if( mostRecentSequentialTime !== 0.0 && mostRecentWebCLPlusBufferTime != 0.0 )
            {
                var timesFaster = mostRecentSequentialTime / mostRecentWebCLKernelTime;
                var percentageFaster = ( ( ( mostRecentSequentialTime - mostRecentWebCLKernelTime ) / mostRecentSequentialTime ) * 100).toFixed( 2 );
                
                results.innerHTML += "WebCL Kernel Time is ";
                results.innerHTML += timesFaster.toFixed( 0 );
                results.innerHTML += " times faster than JS"
                results.innerHTML += " and</br>"
                results.innerHTML += percentageFaster;
                results.innerHTML += "% faster than JS</br>";  
            }
            
            self.Render();
            
            self.previousTime = currentTime;
        }
        
        this.Render = function()
        {
            var canvas        = renderer.GetCanvas( 'Main' );
            var canvasContext = canvas.getContext( "2d" );
            var canvasWidth   = canvas.width;
            var canvasHeight  = canvas.height;

            var srcImage      = document.getElementById( 'image' );
            
            canvas.width = canvas.width;
            canvasContext.drawImage( srcImage, 0, 0 );
            
            var mainPixels    = canvasContext.getImageData( 0, 0, canvasWidth, canvasHeight );
            
            RenderInfluenceMap( mainPixels );
            
            for( var i = 0; i < factions.length; ++ i )
            {
                factions[ i ].Render( mainPixels );
            }
            
            canvasContext.putImageData( mainPixels, 0, 0 );
        }
        
        function AddEntitiesToFactions() 
        {
            var numEntitiesToAddPerFaction = 500;
            var randomX, randomY;
            var newEntity;
            
            for( var i = 0; i < numEntitiesToAddPerFaction; ++i )
            {
                randomX = Math.floor( Math.random() * worldSize.x );
                randomY = Math.floor( Math.random() * worldSize.y );
                newEntity = new icetr3yOS.Class_Entity( randomX, randomY );
                blueFaction.AddEntity( newEntity );
    
                randomX = Math.floor( Math.random() * worldSize.x );
                randomY = Math.floor( Math.random() * worldSize.y );           
                newEntity = new icetr3yOS.Class_Entity( randomX, randomY );
                redFaction.AddEntity( newEntity );
            }
            
            blueFaction.OnFinishedAddingEntities();
            redFaction.OnFinishedAddingEntities();
        }
        
        function CalculateInfluenceMapSequentially()
        {
            var redFactionEntityPositions  = redFaction.GetEntityPositions();
            var blueFactionEntityPositions = blueFaction.GetEntityPositions();
            
            var distance = 0.0;
            var index = 0;
            
            var t0 = "";
            var t1 = "";
            
            t0 = performance.now();
            for( var x = 0; x < worldSize.x; ++x )
            {
                for( var y = 0; y < worldSize.y; ++y )
                {
                    index = y * worldSize.x + x;
                    self.worldGrid[ index ] = 0.0;
                    
                    for( var i = 0; i < redFactionEntityPositions.length; i += 2 )
                    {
                        distance = 1.0 + Math.sqrt( Math.pow( redFactionEntityPositions[ i ] - x, 2 )
                                       +  Math.pow( redFactionEntityPositions[ i + 1 ] - y, 2 ) );
                        
                        self.worldGrid[ index ] += self.maxInfluence / distance;
                    }
                    
                    for( var i = 0; i < blueFactionEntityPositions.length; i += 2 )
                    {
                        distance = 1.0 + Math.sqrt( Math.pow( blueFactionEntityPositions[ i ] - x, 2 )
                                       +  Math.pow( blueFactionEntityPositions[ i + 1 ] - y, 2 ) );
                        
                        self.worldGrid[ index ] += -self.maxInfluence / distance;
                    }
                }
            }
            t1 = performance.now();
            
            window.console.log( t1 - t0 );
        }
        
        function CalculateInfluenceMapOpenCL()
        {
            if( self.webCLObj.context === null )
            {
                return;
            }
            
            var gridSize = worldSize.x * worldSize.y;
            
            var redEntityPositions = redFaction.GetEntityPositions();
            var blueEntityPositions = blueFaction.GetEntityPositions();
            
            self.worldGrid = new Float32Array( gridSize );
                
            var clBufferInRedEntityPositions  = self.webCLObj.context.createBuffer( WebCL.MEM_READ_ONLY, redEntityPositions.length * 4 );
            var clBufferInBlueEntityPositions = self.webCLObj.context.createBuffer( WebCL.MEM_READ_ONLY, blueEntityPositions.length * 4 );
            var clBufferOut                   = self.webCLObj.context.createBuffer( WebCL.MEM_WRITE_ONLY, gridSize * 4 );
            
            
            var kernelObject                  = self.webCLObj.program.createKernel ( "clCalcInfluenceMap" );
            
            kernelObject.setArg( 0, clBufferInRedEntityPositions );   
            kernelObject.setArg( 1, clBufferInBlueEntityPositions );
            kernelObject.setArg( 2, clBufferOut );
            kernelObject.setArg( 3, new Uint32Array( [ worldSize.x ] ) );
            kernelObject.setArg( 4, new Float32Array( [ self.maxInfluence ] ) );
            
            self.webCLObj.queue.enqueueWriteBuffer( clBufferInRedEntityPositions, false, 0, redEntityPositions.length * 4, redEntityPositions );
            self.webCLObj.queue.enqueueWriteBuffer( clBufferInBlueEntityPositions, false, 0, blueEntityPositions.length * 4, blueEntityPositions );
            self.webCLObj.queue.enqueueWriteBuffer( clBufferOut, false, 0, gridSize * 4, self.worldGrid );

            var numOfRedEntities = redFaction.GetNumEntities();
            
            var localWS  = [ 8, 8, 1 ];
        
            var globalWS = [ Math.ceil( worldSize.x / localWS[0] ) * localWS[0] ,
                             Math.ceil( worldSize.x / localWS[1] ) * localWS[1] ,
                             Math.ceil( numOfRedEntities / localWS[2] ) * localWS[2] ]; 
    
    
            self.webCLObj.queue.enqueueNDRangeKernel( kernelObject, 3, null, globalWS, localWS );

            self.webCLObj.queue.enqueueReadBuffer( clBufferOut, false, 0, gridSize * 4, self.worldGrid );
    
            self.webCLPerformanceObj.StartPerformanceBlock();
            self.webCLObj.queue.finish();
            var performanceMilliseconds = self.webCLPerformanceObj.StopPerformanceBlock();
            
            mostRecentWebCLKernelTime = performanceMilliseconds;
              
            mostRecentWebCLKernelMessage = "WebCL Kernel Time: ";
            mostRecentWebCLKernelMessage += mostRecentWebCLKernelTime.toFixed( 3 );
            mostRecentWebCLKernelMessage += "ms</br>";

        }
        
        function RenderInfluenceMap( pixels )
        {
            var canvas        = renderer.GetCanvas( 'Main' );
            var canvasContext = canvas.getContext( "2d" );
            var canvasWidth   = canvas.width;
            var canvasHeight  = canvas.height;
        
        
            var positionInPixels = 0;
            var indexInGrid = 0;
            var currentPixel = 0;
            var colorR = 0;
            var colorB = 0;
            
            var gridSize = worldSize.x * worldSize.y;
            
            for( var i = 0; i < gridSize; ++ i )
            {
                var x = i % worldSize.x;    
                var y = ( i - x ) / worldSize.x;
                
                positionInPixels = ( y * self.tileSize.y * canvasWidth + x * self.tileSize.x ) * 4;
                currentPixel = positionInPixels;

                if ( self.worldGrid[ i ] > 0.0 )
                {
                     colorR = Math.floor( self.worldGrid[ i ] );
                     colorB = 0;
                }
                else
                {
                    colorB = Math.floor( Math.abs( self.worldGrid[ i ] ) );
                    colorR = 0;
                }
                
                
                for( var y = self.tileSize.y - 1; y >= 0; --y )
                {
                    for( var x = 0; x < self.tileSize.x; ++x )
                    {
                        currentPixel = positionInPixels + ( y * canvasWidth + x ) * 4;
                
                        pixels.data[ currentPixel ]     += colorR;
                        pixels.data[ currentPixel + 1 ] = 0.0;
                        pixels.data[ currentPixel + 2 ] += colorB;
                        
                    }
                }
            }
        }
        
        function SetupWebCL()
        {
            if( window.webcl == undefined )
            {
                alert("Unfortunately your system does not support WebCL. " +
                      "Make sure that you have both the OpenCL driver " +
                      "and the WebCL browser extension installed.");
                return;
            }
            
            self.webCLObj.context = webcl.createContext();
            self.webCLObj.program = self.webCLObj.context.createProgram( self.webCLObj.code );
            self.webCLObj.device = self.webCLObj.context.getInfo( WebCL.CONTEXT_DEVICES )[ 0 ];
            
            try
            {
                self.webCLObj.program.build ( [ self.webCLObj.device ], "" );
            }
            catch(e)
            {
                alert( "Failed to build WebCL program. Error "
                       + self.webCLObj.program.getBuildInfo ( self.webCLObj.device, WebCL.PROGRAM_BUILD_STATUS)
                       + ":  " + self.webCLObj.program.getBuildInfo (self.webCLObj.device, WebCL.PROGRAM_BUILD_LOG));
                throw e;
            }
            
            self.webCLObj.queue = self.webCLObj.context.createCommandQueue( self.webCLObj.device );
        }
        

    }
    
    return {
        GetWorld : function( worldSize, code )
        {
            if ( !world )
            {
                world = new constructor( worldSize, code );
                
            }
            return world;
        }
    }  
} )();

var ToggleComputationStyle = function( eventArgs )
{
    window.console.log( "I'm here." );
    var world = icetr3yOS.World.GetWorld();
    
    var button = document.getElementById( 'toggleCompStyleButton' );
    
    if ( world.bComputeMapsWithWebCL )
    {
        button.innerHTML = "Toggle WebCL Influence Map Computation";
    }
    else
    {
        button.innerHTML = "Toggle Sequential Influence Map Computation";
    }
    
    world.bComputeMapsWithWebCL = !world.bComputeMapsWithWebCL;
}

document.getElementById( 'toggleCompStyleButton' ).addEventListener( 'click', ToggleComputationStyle );