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
                                Borough.text(`Borough: ${i.properties['boro_name']}`)
                           })
                           .on("mouseout", function(d, i){
                                d3.select(this).style("stroke-width", "1")
                                Borough.text('Borough:')
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
                            Borough.text(`Borough: ${i["neighbourhood group"]}`)
                            Neighborhood.text(`Neighborhood: ${i.neighbourhood}`)
                            Price.text(`Price: $${i.price}`)
                            RoomType.text(`Room Type: ${i["room type"]}`)
                            ReviewRateNumber.text(`Review Rate Number: ${i["review rate number"]}`)
                            ConstructionYear.text(`Construction Year: ${i["Construction year"]}`)
                       })
                       .on("mouseout", function(d, i){
                            Borough.text('Borough:')
                            Neighborhood.text(`Neighborhood:`)
                            Price.text('Price:')
                            RoomType.text(`Room Type:`)
                            ReviewRateNumber.text(`Review Rate Number:`)
                            ConstructionYear.text(`Construction Year:`)
                       })

        var title = svg.append("text")
                       .attr("x", 260)
                       .attr("y", dimensions.margin.top / 2)
                       .attr("text-anchor", "middle")
                       .style("font-size", "24px")
                       .text("Map of AirBNBs in NYC")

        var Borough = svg.append('text')
                         .attr("id", 'Borough')
                         .attr("x", 50)
                         .attr("y", 50)
                         .attr("dx", "-.8em")
                         .attr("dy", ".15em")
                         .attr("font-family", "sans-serif")
                         .text("Borough:")

        var Neighborhood = svg.append('text')
                              .attr("id", 'Neighborhood')
                              .attr("x", 50)
                              .attr("y", 70)
                              .attr("dx", "-.8em")
                              .attr("dy", ".15em")
                              .attr("font-family", "sans-serif")
                              .text("Neighborhood:")
        
        var Price = svg.append('text')
                       .attr("id", 'Price')
                       .attr("x", 50)
                       .attr("y", 90)
                       .attr("dx", "-.8em")
                       .attr("dy", ".15em")
                       .attr("font-family", "sans-serif")
                       .text("Price:")

        var RoomType = svg.append('text')
                          .attr("id", 'RoomType')
                          .attr("x", 50)
                          .attr("y", 110)
                          .attr("dx", "-.8em")
                          .attr("dy", ".15em")
                          .attr("font-family", "sans-serif")
                          .text("Room Type:")

        var ReviewRateNumber = svg.append('text')
                                  .attr("id", 'ReviewRateNumber')
                                  .attr("x", 50)
                                  .attr("y", 130)
                                  .attr("dx", "-.8em")
                                  .attr("dy", ".15em")
                                  .attr("font-family", "sans-serif")
                                  .text("Review Rate Number:")

        var ConstructionYear = svg.append('text')
                                  .attr("id", 'ConstructionYear')
                                  .attr("x", 50)
                                  .attr("y", 150)
                                  .attr("dx", "-.8em")
                                  .attr("dy", ".15em")
                                  .attr("font-family", "sans-serif")
                                  .text("Construction Year:")

    })
})
