var icetr3yOS = icetr3yOS || {};

icetr3yOS.Class_PerformanceObj = function()
{
    this.elapsedTime = 0.0;
    this.numCalculations = 0;
    
    this.t0 = 0.0;
    this.t1 = 0.0;
    
    var self = this;
    
    this.StartPerformanceBlock = function()
    {
        t0 = performance.now();
    }
    
    this.StopPerformanceBlock = function()
    {
        t1 = performance.now();
        
        var deltaMilliseconds = t1 - t0;
        
        self.elapsedTime += deltaMilliseconds;
        
        return deltaMilliseconds;
    }
    
    this.GetMostRecentStartTime = function()
    {
        return t0;
    }
    
    this.GetMostRecentEndTime = function()
    {
        return t1;
    }
    
    this.GetMostRecentPerformanceMilliseconds = function()
    {
        var deltaMilliseconds = t1 - t0;
        
        return deltaMilliseconds;
    }
    
    this.GetAveragePerformanceTime = function()
    {
        if ( numCalculations > 0 )
        {
            return elapsedTime / numCalculations;
        }
        
        return 0.0;
    }
}