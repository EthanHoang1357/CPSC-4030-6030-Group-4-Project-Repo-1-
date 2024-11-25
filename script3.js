d3.csv("Airbnb_Open_Data.csv").then(function(dataset) {
    d3.json("Boroughs.geojson").then(function(mapdata){

        var dimensions = {
            height: 350,
            width: 800,
            margin: {
                top: 50,
                bottom: 20,
                right: 10,
                left: 55
            }
        }

        dataset.forEach(d => {d.price = +d.price.replace(/[$,]/g, "")});
        dataset = dataset.filter(d => d.long < 0 && d.lat > 0 && +d.price > 0)

        var svg = d3.select("#Map")
                .style("width", dimensions.width)
                .style("height", dimensions.height)

        var projection = d3.geoEqualEarth()
                           .fitSize([dimensions.width, dimensions.height], mapdata)

        var pathGenerator = d3.geoPath(projection)
        
        // white = lower price -- Red = higher price
        var colorScale = d3.scaleSequential(d3.interpolateReds)
                            .domain(d3.extent(dataset, d => +d.price))

        var boroughs = svg.append("g")
                          .selectAll(".boroughs")
                          .data(mapdata.features)
                          .enter()
                          .append("path")
                          .attr("class", "boroughs")
                          .attr("d", d => pathGenerator(d))
                          .attr("stroke", "black")
                          .attr("fill", "gray")
                          .on("mouseover", function(d, i){
                                d3.select(this).style("stroke-width", "3")
                                text.text(`Borough: ${i.properties['boro_name']}`)
                           })
                           .on("mouseout", function(d, i){
                                d3.select(this).style("stroke-width", "1")
                                text.text('Borough:')
                           })
        
        var points = svg.append("g")
                        .selectAll(".points")
                        .data(dataset)
                        .enter()
                        .filter(function(d) {
                            return mapdata.features.some(function(borough) {
                                return d3.geoContains(borough, [+d.long, +d.lat]);
                            });
                        })
                        .append("circle")
                        .attr("class", "points")
                        .attr("cx", d => {
                            coords = projection([+d.long, +d.lat])
                            return coords ? coords[0] : null
                        })
                        .attr("cy", d => {
                            coords = projection([+d.long, +d.lat])
                            return coords ? coords[1] : null
                        })
                        .attr("r", 1.5)
                        .attr("fill", d => colorScale(+d.price))

        var title = svg.append("text")
                       .attr("x", 260)
                       .attr("y", dimensions.margin.top / 2)
                       .attr("text-anchor", "middle")
                       .style("font-size", "24px")
                       .text("Map of NYC Boroughs")

        var text = svg.append('text')
                      .attr("id", 'topbartext')
                      .attr("x", 75)
                      .attr("y", 75)
                      .attr("dx", "-.8em")
                      .attr("dy", ".15em")
                      .attr("font-family", "sans-serif")
                      .text("Borough:")

    })
})
