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

        var tooltip = d3.select("body")
                        .append("div")
                        .style("position", "absolute")
                        .style("background-color", "white")
                        .style("border", "1px solid black")
                        .style("border-radius", "5px")
                        .style("padding", "5px")
                        .style("pointer-events", "none")
                        .style("opacity", 0)

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
                                tooltip.style("opacity", 1)
                                .html(`<strong>Borough:</strong> ${i.properties['boro_name']}<br>`)
                                       .style("left", (d.pageX + 10) + "px")
                                       .style("top", (d.pageY + 10) + "px")
                           })
                           .on("mouseout", function(d, i){
                                d3.select(this).style("stroke-width", "1")
                                tooltip.style("opacity", 0)
                           })
                           .on("click", function(d, i){
                                        //update scatter plot code here
                                        updateScatterPlot(`${i.properties['boro_name']}`);
                            
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
                        .on("mouseover", function(d, i){
                            d3.select(this).style("stroke", "black")
                            let borough = mapdata.features.find(borough => 
                                d3.geoContains(borough, [+d.long, +d.lat])
                            )
                            d3.selectAll(".boroughs")
                              .filter(function(b) {
                                  return b.properties['boro_name'] === i["neighbourhood group"]
                              })
                              .style("stroke-width", "3")
                            tooltip.style("opacity", 1)
                                   .html(`
                                        <strong>Borough:</strong> ${i["neighbourhood group"]}<br>
                                        <strong>Neighborhood:</strong> ${i.neighbourhood}<br>
                                        <strong>Price:</strong> $${i.price}<br>
                                        <strong>Room Type:</strong> ${i["room type"]}<br>
                                        <strong>Review Rate Number:</strong> ${i["review rate number"]}<br>
                                        <strong>Construction Year:</strong> ${i["Construction year"]}<br>
                                    `)
                                   .style("left", (d.pageX + 10) + "px")
                                   .style("top", (d.pageY + 10) + "px")
                       })
                       .on("mouseout", function(d, i){
                            d3.select(this).style("stroke", "none")
                            tooltip.style("opacity", 0)
                            d3.selectAll(".boroughs").style("stroke-width", "1")
                       })
                       .on("click", function(d,i){
                            //update scatterplot code here
                            updateScatterPlot(i["neighbourhood group"]);
                       })

        var title = svg.append("text")
                       .attr("x", 260)
                       .attr("y", dimensions.margin.top / 2)
                       .attr("text-anchor", "middle")
                       .style("font-size", "24px")
                       .text("Map of AirBNBs in NYC")
    })
})
