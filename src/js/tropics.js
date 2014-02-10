var projection = d3.geo.mercator()
        .center([-55, 30])
        .scale(300)
        .translate([300, 150])
,   path = d3.geo.path().projection(projection)
,   svg = d3.select("#svg")
,   center = [-55, 30]
,   image = svg.append('image')
        .attr('width', '600')
        .attr('height', '300')
,   basin = 'al'
,   message = 'No active tropical cyclones in the Atlantic.'
;

if (location.hash === '#pacific')
{
    image.attr('xlink:href', '/images/pacific.png')
    projection.center([-130, 30]);
    basin = 'ep';
    message = 'No active tropical cyclones in the Eastern Pacific.';
}
else
{
    image.attr('xlink:href', '/images/atlantic.png')
}

d3.json('/data/tropics.json', function(error, topo)
{
    var activity = false;
    if (topo && topo.objects)
    {
        for (var key in topo.objects)
        {
            if (!topo.objects.hasOwnProperty(key)) continue;
            var feature = topojson.feature(topo, topo.objects[key])
            ,   classname = key.split('_').pop()
            ;
            if (!(/^(lin|pgn|pts|wwlin)$/).test(classname))
            {
                continue;
            }
            svg.append('path')
                .datum(feature)
                .attr('id', key)
                .attr('class', classname)
                .attr('d', path)
                ;
            if (classname === 'pts')
            {
                svg.append('text')
                    .datum(feature.features[0])
                    .attr('class', classname)
                    .attr('transform', function(d) { return 'translate(' + path.centroid(d) + ')'; })
                    .attr('dx', '0.5ex')
                    .attr('dy', '0.5ex')
                    .text(function(d) { return d.properties.STORMNAME; })
                    ;
            }
            activity = activity || (key.substring(0, 2) === basin);
        }
    }
    if (!activity)
    {
        svg.append('text')
            .attr('class', 'pts')
            .attr('text-anchor', 'middle')
            .attr('x', 300)
            .attr('y', 280)
            .text(message)
            ;
    }
});
