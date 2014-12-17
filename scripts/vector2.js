var icetr3yOS = icetr3yOS || {};

icetr3yOS.Class_Vector2 = function( x, y )
{
    this.x = typeof x !== 'undefined' ? x : 0.0;
    this.y = typeof y !== 'undefined' ? y : 0.0;
}