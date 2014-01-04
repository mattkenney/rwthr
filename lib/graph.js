var xmlbuilder = require('xmlbuilder')
,   _ = require('underscore')
;

var parameterNames = [ 'temperature', 'probability_of_precipitation' ];

function addAbscissaLabels(svg, min, tzOffset)
{
    var start = min - tzOffset
    ,   when = new Date(start)
    ;
    if (when.getUTCMilliseconds() > 0)
    {
        when.setUTCMilliseconds(0);
        when.setTime(when.getTime() + 1000);
    }
    if (when.getUTCSeconds() > 0)
    {
        when.setUTCSeconds(0);
        when.setTime(when.getTime() + 60*1000);
    }
    if (when.getUTCMinutes() > 0)
    {
        when.setUTCMinutes(0);
        when.setTime(when.getTime() + 60*60*1000);
    }
    var startHour = when.getUTCHours()
    ,   quadrant = Math.ceil(startHour / 12) * 12
    ,   delta = 24 - startHour
    ;
    when.setTime(when.getTime() + delta * 60*60*1000);
    console.log(startHour, quadrant, delta, when.toISOString());
    var list = svg.svg['#list'][0].g['#list'];
    while (true)
    {
        var x = (when.getTime() - start) / 1000000.0 + 84;
        if (x > 516)
        {
            break;
        }
        if (quadrant == 12)
        {
            var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][when.getUTCDay()];
            list.push({ text: { '@text-anchor': 'middle', '@x': x, '@y': 520, '#text': day } });
        }
        else
        {
            list.push({ line: { '@x1': x, '@y1': 59, '@x2': x, '@y2': 491 } });
        }
        quadrant = (quadrant + 12) % 24;
        when.setTime(when.getTime() + 12*60*60*1000);
    }
}

function addParameterData(svg, data)
{
    for (var k = 0; k < parameterNames.length; k++)
    {
        var parameters = data[parameterNames[k]];

        if (!parameters.x.length)
        {
            continue;
        }

        var points = [];
        for (var i = 0; i < parameters.x.length; i++)
        {
            points.push(parameters.x[i]);
            points.push(parameters.y[i]);
        }

        var list = svg.svg.svg['#list'] = svg.svg.svg['#list'] || [];
        list.push({
            polyline: {
                '@fill': 'none',
                '@stroke': ['#f00', '#00f', '#0f0'][k % 3],
                '@stroke-width': 2,
                '@points': points.join(' ')
            }
        });
    }
}

function createBaseSVG()
{
    return {
        svg:{
            '@xmlns': 'http://www.w3.org/2000/svg',
            '@version': '1.1',
            '@height': '550px',
            '@width': '600px',
            '@viewBox': '0 0 600 550',
            rect: { '@fill': '#fff', '@height': 550, '@stroke': 'none', '@width': 600 },
            '#list': [
                {
                    g: {
                        '@fill': '#999',
                        '@font-family': 'sans-serif',
                        '@font-size': '18pt',
                        '@stroke': '#999',
                        '@stroke-width': 0.5,
                        '#list': _.range(13).map(function (n)
                        {
                            var y = 59 + n * 36;
                            return { line: { '@x1': 84, '@y1': y, '@x2': 516, '@y2': y } };
                        })
                    }
                },
                {
                    g: {
                        '@fill': '#f00',
                        '@font-family': 'sans-serif',
                        '@font-size': '18pt',
                        '@text-anchor': 'end',
                        '#list': _.union(
                            [
                                { text: { '@dy': '0.6ex', '@text-anchor': 'start', '@x': 10, '@y': 30, '#text': 'Temperature' } },
                                { text: { '@dy': '0.6ex', '@text-anchor': 'start', '@x': 10, '@y': 275, '#raw': '&#176;F' } }
                            ],
                            _.range(11).map(function (n)
                            {
                                var y = 59 + (n + 1) * 36;
                                return { text: { '@dy': '0.6ex', '@x': 80, '@y': y, '#text': (100 - n * 10) } };
                            })
                        )
                    }
                },
                {
                    g: {
                        '@fill': '#00f',
                        '@font-family': 'sans-serif',
                        '@font-size': '18pt',
                        '#list': _.union(
                            [
                                { text: { '@dy': '0.6ex', '@text-anchor': 'end', '@x': 590, '@y': 30, '#text': 'Probability of Precipitation' } },
                                { text: { '@dy': '0.6ex', '@text-anchor': 'end', '@x': 590, '@y': 275, '#text': '%' } }
                            ],
                            _.range(11).map(function (n)
                            {
                                var y = 59 + (n + 1) * 36;
                                return { text: { '@dy': '0.6ex', '@x': 520, '@y': y, '#text': (100 - n * 10) } };
                            })
                        )
                    }
                }
            ],
            svg: {
                '@x': 84,
                '@y': 59,
                '@width': 432,
                '@height': 432
            }
        }
    };
}

function extract(data)
{
    function get()
    {
        var result = data;
        for (var i = 0; i < arguments.length; i++)
        {
            if (result === null || (typeof result !== 'object') || !result.hasOwnProperty(arguments[i]))
            {
                return undefined;
            }
            result = result[arguments[i]];
        }
        return result;
    }

    var result = {};
    for (var k = 0; k < parameterNames.length; k++)
    {
        var obj = result[parameterNames[k]] = { t:[], v:[] };

        var layout = get('parameters', parameterNames[k], '$', 'time_layout');
        var xValues = get('time_layout', layout, 'start_valid_time') || [];
        var wValues = get('time_layout', layout, 'end_valid_time') || [];
        var yValues = get('parameters', parameterNames[k], 'value') || [];

        for (var i = 0; i < xValues.length; i++)
        {
            obj.t.push(xValues[i]);
            obj.v.push(yValues[i]);
            if (wValues.hasOwnProperty(i))
            {
                obj.t.push(wValues[i]);
                obj.v.push(yValues[i]);
            }
        }
    }

    return result;
};

module.exports = function (data, callback)
{
    console.log(require('util').inspect(data, {depth:null}));
    data = extract(data);

    var tzOffset = NaN
    ,   min = Number.MAX_VALUE
    ;
    for (var k = 0; k < parameterNames.length; k++)
    {
        var parameters = data[parameterNames[k]];
        parameters.x = parameters.t.map(function (value)
        {
            if (isNaN(tzOffset))
            {
                tzOffset = Date.parse('1970-01-01T00:00:00' + value.substring(19))
            }
            return Date.parse(value);
        });
        if (min > parameters.x[0])
        {
            min = parameters.x[0];
        }
    }

    for (var k = 0; k < parameterNames.length; k++)
    {
        var parameters = data[parameterNames[k]];
        parameters.x = parameters.x.map(function (value)
        {
            return ((Number(value) - min) / 1000000.0);
        });
    }

    for (var k = 0; k < parameterNames.length; k++)
    {
        var parameters = data[parameterNames[k]];
        parameters.y = parameters.v.map(function (value)
        {
            return (432 - 3.6 * (Number(value) + 10));
        });
    }


    var svg = createBaseSVG();

    addParameterData(svg, data);

    addAbscissaLabels(svg, min, tzOffset);

    var xml = String(xmlbuilder.create(svg).end());

    callback(null, xml);
};
