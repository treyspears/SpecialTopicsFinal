require( [ "vector2" ], function( vector2 ) 
{
    var icetr3yOS = icetr3yOS || {};
   
   
    icetr3yOS.Class_Entity = function( x, y )
    {
       this.position = new Class_Vector2( x, y );
    }   
} );