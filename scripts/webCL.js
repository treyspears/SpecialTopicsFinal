function buildProgram( program, device )
{
    try
    {
        program.build( [ device ], "" );   
    }
    catch( e )
    {
        alert( "Failed to build WebCL program. Error "
              + program.getBuildInfo( device, WebCL.PROGRAM_BUILD_STATUS )
              + ": "
              + program.getBUildInfo( device, WebCL.PROGRAM_BUILD_LOG ) );
        throw e;
    } 
}

function getCode( url, callback )
{
    var xhr = new XMLHttpRequest();
    var filepath = url;
    
    xhr.open( 'GET', filepath, true );
    
    xhr.onreadystatechange = function()
    {
        if ( xhr.readyState == 4 ) //if doing in node webkit would need to do || 0 because it's not making a real request
        {
            if ( xhr.status == 200 )
            {
                var code = xhr.responseText;
                if ( callback )
                {
                    callback( code );
                }
            }
            else
            {
                console.log( "Error getting file" );
            }
        }
    };
    
    xhr.send();
}


