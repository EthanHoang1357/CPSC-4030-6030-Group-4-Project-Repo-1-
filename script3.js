d3.csv("Airbnb_Open_Data.csv").then(function(dataset) {
    d3.json("Boroughs.geojson").then(function(mapdata){

        console.log(dataset)
        console.log(mapdata)

        var dimensions = {
            height: 850,
            width: 800,
            margin: {
                top: 50,
                bottom: 140,
                right: 10,
                left: 55
            }
        }

        var svg = d3.select("#Map")
                .style("width", dimensions.width)
                .style("height", dimensions.height)
                .style("border", "3px solid gray")

        var projection = d3.geoEqualEarth()
                           .fitSize([dimensions.width, dimensions.height], mapdata)

        var pathGenerator = d3.geoPath(projection)

        var colorScale = d3.scaleOrdinal(d3.schemeSet1)

        var boroughs = svg.append("g")
                          .selectAll(".boroughs")
                          .data(mapdata.features)
                          .enter()
                          .append("path")
                          .attr("class", "boroughs")
                          .attr("d", d => pathGenerator(d))
                          .attr("stroke", "white")
                          .attr("fill", d => colorScale(d.properties['boro_name']))

        var title = svg.append("text")
                       .attr("x", dimensions.width / 2)
                       .attr("y", dimensions.margin.top / 2)
                       .attr("text-anchor", "middle")
                       .style("font-size", "24px")
                       .text("Map of NYC Boroughs")

    })
})
