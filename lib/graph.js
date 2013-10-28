module.exports = function (data, callback)
{
    var hourCount = 120;

    var names = [ "temperature", "probability_of_precipitation" ];
    var startTime;
    for (var k = 0; k < names.length; k++)
    {
        var xValues = data.time_layout[data.parameters[names[k]].$.time_layout].start_valid_time;
        var when = new Date(xValues[0]).getTime();
        if (k == 0 || startTime > when)
        {
            startTime = when;
        }
    }

    var buffer = [];
    buffer.push("http://chart.apis.google.com/chart");
    buffer.push("?cht=lxy"); // Chart Type
    buffer.push("&chco=FF0000,0000CC"); // Series colors
    buffer.push("&chdl=Temperature|Probability+of+Precipitation"); // Chart legend text
    buffer.push("&chdls=737373,24"); // Chart legend text style
    buffer.push("&chdlp=t"); // Chart legend position
    buffer.push("&chg=0,8,4,1,0,4"); // Grid
    buffer.push("&chls=2"); // Line width
    buffer.push("&chtt=+"); // Chart margin
    buffer.push("&chxt=x,y,y,r,r"); // Visible Axes
    buffer.push("&chxs=0,737373,24|1,FF0000,24|2,FF0000,24|3,0000CC,24|4,0000CC,24"); // Axis Label Style

    // Chart size
    buffer.push("&chs=592x500");

    // Custom Axis Labels
    buffer.push("&chxl=0:");
    var cal = new Date(startTime);
    cal.setMinutes(0, 0, 0);
    var positions = [];
    for (var i = 1; i < hourCount; i++)
    {
        cal.setTime(cal.getTime() + (60 * 60 * 1000));
        if ((hourCount > 24) ? (cal.getHours() === 12) : ((cal.getHours() % 4) == 0))
        {
            var pos = (cal.getTime() - startTime)/3600000;
            positions.push(",");
            positions.push(pos);
            buffer.push("|");
            buffer.push(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][cal.getDay()]);
        }
    }
    buffer.push("|2:|%C2%B0F|4:|%25");

    // Axis Label Positions
    buffer.push("&chxp=0");
    buffer.push(positions.join(''));
    buffer.push("|1,0,20,40,60,80,100|2,50|3,0,20,40,60,80,100|4,50");

    // Axis Range
    buffer.push("&chxr=0,0,");
    buffer.push(hourCount);
    buffer.push("|1,-15,110|2,-15,110|3,-15,110|4,-15,110");

    // Data Scale
    buffer.push("&chds=0,");
    buffer.push(hourCount);
    buffer.push(",-15,110,0,");
    buffer.push(hourCount);
    buffer.push(",-15,110");

    // Data
    buffer.push("&chd=t");

    for (var k = 0; k < names.length; k++)
    {
        var xValues = data.time_layout[data.parameters[names[k]].$.time_layout].start_valid_time;
        var yValues = data.parameters[names[k]].value;
        var count = 0;
        for (var i = 0; i < xValues.length; i++)
        {
            var x = (new Date(xValues[i]).getTime() - startTime)/3600000;
            if (x < 0)
            {
                // interpolate at start of graph, if possible
                if (i + 1 < xValues.length && i < yValues.length)
                {
                    var x2 = (new Date(xValues[i + 1]).getTime() - startTime)/3600000;
                    var xc = Math.min(x2, 0.0);
                    var y1 = Number(yValues[i]);
                    var y2 = Number(yValues[i + 1]);
                    var yc = y1 + (xc - x)/(x2 - x)*(y2 - y1);
                    xValues[i] = xc.toFixed(2);
                    yValues[i] = yc.toFixed(2);
                }
            }
            else if (x > hourCount)
            {
                // interpolate at end of graph, if possible
                if (i < 1 || yValues.length <= i)
                {
                    break;
                }
                var x1 = (new Date(xValues[i - 1]).getTime() - startTime)/3600000;
                var xc = hourCount;
                var y1 = Number(yValues[i - 1]);
                var y2 = Number(yValues[i]);
                var yc = y1 + (xc - x1)/(x - x1)*(y2 - y1);
                xValues[i] = xc.toFixed(2);
                yValues[i] = yc.toFixed(2);
            }
            buffer.push(i > 0 ? "," : (k > 0 ? "|" : ":"));
            buffer.push(x);
            count++;
            if (x > hourCount)
            {
                break;
            }
        }
        for (var i = 0; i < count && i < yValues.length; i++)
        {
            buffer.push(i > 0 ? "," : "|");
            buffer.push(yValues[i]);
        }
    }

    callback(null,
    {
        url: buffer.join('')
    });
};
