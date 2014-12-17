var icetr3yOS = icetr3yOS || {};
   

icetr3yOS.Class_Entity = function( x, y )
{
    this.position = new icetr3yOS.Class_Vector2( x, y );
    var self = this;
    
    var targetLocation = new icetr3yOS.Class_Vector2( -1, -1 );
    var startingLocation = new icetr3yOS.Class_Vector2( -1, -1 );
    var travelTime = 0.0;
    var currentTime = 0.0;
    var worldSize = null;
    
    var speed = 7.5; //tiles per second
    
    this.Update = function( deltaSeconds )
    {
        if ( targetLocation.x !== -1 )
        {
            var normalizedTime = currentTime / travelTime;
        
            if ( normalizedTime >= 1.0 )
            {
                self.position.x  = targetLocation.x;
                self.position.y  = targetLocation.y;
                targetLocation.x = -1;
                
            }
            else
            {
                self.position.x = ( ( 1.0 - normalizedTime ) * startingLocation.x ) + ( normalizedTime * targetLocation.x );
                self.position.y = ( ( 1.0 - normalizedTime ) * startingLocation.y ) + ( normalizedTime * targetLocation.y );
            }
            
            currentTime += deltaSeconds;
        } 
        else
        {
            
            worldSize = icetr3yOS.World.GetWorld().worldSize;

            startingLocation.x = self.position.x;
            startingLocation.y = self.position.y;
            
            targetLocation.x = Math.random() * worldSize.x;
            targetLocation.y = Math.random() * worldSize.y;
            
            
            var distance = Math.sqrt( ( Math.pow( ( startingLocation.x - targetLocation.x ), 2 ) ) + ( Math.pow( ( startingLocation.y - targetLocation.y ), 2 ) ) );
            travelTime = distance / speed;
            currentTime = 0.0;
        }
    }
}   


