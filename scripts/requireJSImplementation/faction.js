require( [ 'entity', 'vector2' ], function( entity, vector2 ) 
{
    var icetr3yOS = icetr3yOS || {};
    
    icetr3yOS.Class_Faction = function( renderColor )
    {
        this.factionColor = renderColor;
        this.entities = [];
    }
} );