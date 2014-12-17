var icetr3yOS = icetr3yOS || {};

function Run( webCLCode )
{
    //dumpCLData();
    
    var renderer = icetr3yOS.Renderer.GetRenderer();
    renderer.Initialize();
        
    var world = icetr3yOS.World.GetWorld( new icetr3yOS.Class_Vector2( 256, 256 ), webCLCode );
    
    world.Initialize();
    world.Update();
}

function dumpCLData () {
  var s = "";
  try {
    // First check if the WebCL extension is installed at all
                
    if (window.webcl == undefined) {
      alert("Unfortunately your system does not support WebCL. " +
            "Make sure that you have both the OpenCL driver " +
            "and the WebCL browser extension installed.");
      return false;
    }
    
    // List of OpenCL information parameter names.

    var infos = [ [ "DEVICE_ADDRESS_BITS", WebCL.DEVICE_ADDRESS_BITS ],
      [ "DEVICE_AVAILABLE", WebCL.DEVICE_AVAILABLE ],
      [ "DEVICE_COMPILER_AVAILABLE", WebCL.DEVICE_COMPILER_AVAILABLE ],
      [ "DEVICE_ENDIAN_LITTLE", WebCL.DEVICE_ENDIAN_LITTLE ],
      [ "DEVICE_ERROR_CORRECTION_SUPPORT", WebCL.DEVICE_ERROR_CORRECTION_SUPPORT ],
      [ "DEVICE_EXECUTION_CAPABILITIES", WebCL.DEVICE_EXECUTION_CAPABILITIES ],
      [ "DEVICE_EXTENSIONS", WebCL.DEVICE_EXTENSIONS ],
      [ "DEVICE_GLOBAL_MEM_CACHE_SIZE", WebCL.DEVICE_GLOBAL_MEM_CACHE_SIZE ],
      [ "DEVICE_GLOBAL_MEM_CACHE_TYPE", WebCL.DEVICE_GLOBAL_MEM_CACHE_TYPE ],
      [ "DEVICE_GLOBAL_MEM_CACHELINE_SIZE", WebCL.DEVICE_GLOBAL_MEM_CACHELINE_SIZE ],
      [ "DEVICE_GLOBAL_MEM_SIZE", WebCL.DEVICE_GLOBAL_MEM_SIZE ],
      [ "DEVICE_HALF_FP_CONFIG", WebCL.DEVICE_HALF_FP_CONFIG ],
      [ "DEVICE_IMAGE_SUPPORT", WebCL.DEVICE_IMAGE_SUPPORT ],
      [ "DEVICE_IMAGE2D_MAX_HEIGHT", WebCL.DEVICE_IMAGE2D_MAX_HEIGHT ],
      [ "DEVICE_IMAGE2D_MAX_WIDTH", WebCL.DEVICE_IMAGE2D_MAX_WIDTH ],
      [ "DEVICE_IMAGE3D_MAX_DEPTH", WebCL.DEVICE_IMAGE3D_MAX_DEPTH ],
      [ "DEVICE_IMAGE3D_MAX_HEIGHT", WebCL.DEVICE_IMAGE3D_MAX_HEIGHT ],
      [ "DEVICE_IMAGE3D_MAX_WIDTH", WebCL.DEVICE_IMAGE3D_MAX_WIDTH ],
      [ "DEVICE_LOCAL_MEM_SIZE", WebCL.DEVICE_LOCAL_MEM_SIZE ],
      [ "DEVICE_LOCAL_MEM_TYPE", WebCL.DEVICE_LOCAL_MEM_TYPE ],
      [ "DEVICE_MAX_CLOCK_FREQUENCY", WebCL.DEVICE_MAX_CLOCK_FREQUENCY ],
      [ "DEVICE_MAX_COMPUTE_UNITS", WebCL.DEVICE_MAX_COMPUTE_UNITS ],
      [ "DEVICE_MAX_CONSTANT_ARGS", WebCL.DEVICE_MAX_CONSTANT_ARGS ],
      [ "DEVICE_MAX_CONSTANT_BUFFER_SIZE", WebCL.DEVICE_MAX_CONSTANT_BUFFER_SIZE ],
      [ "DEVICE_MAX_MEM_ALLOC_SIZE", WebCL.DEVICE_MAX_MEM_ALLOC_SIZE ],
      [ "DEVICE_MAX_PARAMETER_SIZE", WebCL.DEVICE_MAX_PARAMETER_SIZE ],
      [ "DEVICE_MAX_READ_IMAGE_ARGS", WebCL.DEVICE_MAX_READ_IMAGE_ARGS ],
      [ "DEVICE_MAX_SAMPLERS", WebCL.DEVICE_MAX_SAMPLERS ],
      [ "DEVICE_MAX_WORK_GROUP_SIZE", WebCL.DEVICE_MAX_WORK_GROUP_SIZE ],
      [ "DEVICE_MAX_WORK_ITEM_DIMENSIONS", WebCL.DEVICE_MAX_WORK_ITEM_DIMENSIONS ],
      [ "DEVICE_MAX_WORK_ITEM_SIZES", WebCL.DEVICE_MAX_WORK_ITEM_SIZES ],
      [ "DEVICE_MAX_WRITE_IMAGE_ARGS", WebCL.DEVICE_MAX_WRITE_IMAGE_ARGS ],
      [ "DEVICE_MEM_BASE_ADDR_ALIGN", WebCL.DEVICE_MEM_BASE_ADDR_ALIGN ],
      [ "DEVICE_NAME", WebCL.DEVICE_NAME ],
      [ "DEVICE_PLATFORM", WebCL.DEVICE_PLATFORM ],
      [ "DEVICE_PREFERRED_VECTOR_WIDTH_CHAR", WebCL.DEVICE_PREFERRED_VECTOR_WIDTH_CHAR ],
      [ "DEVICE_PREFERRED_VECTOR_WIDTH_SHORT", WebCL.DEVICE_PREFERRED_VECTOR_WIDTH_SHORT ],
      [ "DEVICE_PREFERRED_VECTOR_WIDTH_INT", WebCL.DEVICE_PREFERRED_VECTOR_WIDTH_INT ],
      [ "DEVICE_PREFERRED_VECTOR_WIDTH_LONG", WebCL.DEVICE_PREFERRED_VECTOR_WIDTH_LONG ],
      [ "DEVICE_PREFERRED_VECTOR_WIDTH_FLOAT", WebCL.DEVICE_PREFERRED_VECTOR_WIDTH_FLOAT ],
      [ "DEVICE_PROFILE", WebCL.DEVICE_PROFILE ],
      [ "DEVICE_PROFILING_TIMER_RESOLUTION", WebCL.DEVICE_PROFILING_TIMER_RESOLUTION ],
      [ "DEVICE_QUEUE_PROPERTIES", WebCL.DEVICE_QUEUE_PROPERTIES ],
      [ "DEVICE_SINGLE_FP_CONFIG", WebCL.DEVICE_SINGLE_FP_CONFIG ],
      [ "DEVICE_TYPE", WebCL.DEVICE_TYPE ],
      [ "DEVICE_VENDOR", WebCL.DEVICE_VENDOR ],
      [ "DEVICE_VENDOR_ID", WebCL.DEVICE_VENDOR_ID ],
      [ "DEVICE_VERSION", WebCL.DEVICE_VERSION ],
      [ "DRIVER_VERSION", WebCL.DRIVER_VERSION ] ];
    
    
    // Get a list of available CL platforms, and another list of the
    // available devices on each platform. Platform and device information 
    // is inquired into string s.

    var platforms = webcl.getPlatforms ();
    s += "Found " + platforms.length + " platform"
        + (platforms.length == 1 ? "" : "s")
        + "." + "<br><br>";
    for (var i in platforms) {
      var plat = platforms[i];

      var name = plat.getInfo (WebCL.PLATFORM_NAME);
      s += "[" + i + "] \"<b>" + name + "</b>\"<br>";
      s += "<div style='padding-left:2em;'>";
      s += "<b>vendor:</b> " 
        + plat.getInfo (WebCL.PLATFORM_VENDOR) + "<br>";
      s += "<b>version:</b> " 
        + plat.getInfo (WebCL.PLATFORM_VERSION) + "<br>";
      s += "<b>profile:</b> " 
        + plat.getInfo (WebCL.PLATFORM_PROFILE) + "<br>";
      s += "<b>extensions:</b> " 
        + plat.getInfo (WebCL.PLATFORM_EXTENSIONS) + "<br>";

      var devices = plat.getDevices ();
      s += "<b>Devices:</b> " + devices.length + "<br>";
      for (var j in devices) {
        var dev = devices[j];
        s += "[" + j + "] \"<b>" + dev.getInfo(WebCL.DEVICE_NAME) 
          + "</b>\"<br>";
        s += "<div style='padding-left:2em;'>";

        for (var k in infos) {
          s += infos[k][0] + ":   ";
          try {
            if (infos[k][1] == WebCL.DEVICE_PLATFORM) {
              s += "<b>" 
                + dev.getInfo(infos[k][1]).getInfo(WebCL.PLATFORM_NAME) 
                + "</b>";
            } else {
              s += "<b>" + dev.getInfo(infos[k][1]) + "</b>";
            }
          } catch (e) {
            s += "<b>Info not available</b>";
          }
          s += "<br>";
        }
        s += "</div>";
      }
      s += "</div>";
    }
    
    // String s is printed out to div element output

    var output = document.getElementById ("output");
    output.innerHTML = s + "<br>";
  } catch(e) {
    var output = document.getElementById ("output");
    output.innerHTML = s + "<br>";
    output.innerHTML += "<b>Error:</b> <pre style='color:red;'>"
                     + e.toString()+"</pre>";
    throw e;
  }
}

getCode( "./scripts/webCLProgram.txt", Run );