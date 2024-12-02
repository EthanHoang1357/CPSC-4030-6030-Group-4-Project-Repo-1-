d3.csv("Airbnb_Open_Data.csv").then(
    function(dataset) {

        var dimensions = {
            height: 350,
            width: 785,
            margin:{
                top: 50,
                bottom: 50,
                right: 10,
                left: 55
            }
        }

        dataset = dataset.filter(d => d["minimum nights"] > 0 && d["minimum nights"] < 366)

        dataset.forEach(d => {
            d['service fee'] = +d['service fee'].replace(/[$,]/g, "")
            d['minimum nights'] = +d['minimum nights']
            if (!d['room type'] || d['room type'].trim() === "") {
                d['room type'] = "Unknown"
            }
        })

        const groupedData = d3.flatRollup(
            dataset,
            v => ({
                avgServiceFee: d3.mean(v, d => d['service fee'])
            }),
            d => d['minimum nights'],
            d => d['room type']
        )

      
        const processedData = groupedData.map(([minNights, roomType, values]) => ({
            minNights,
            roomType,
            avgServiceFee: values.avgServiceFee
        }))

        var customColors = ["#264653", "#2A9D8F", "#AD0F8F", "#0062D5"]
       
        var colorScale = d3.scaleOrdinal()
                             .domain([...new Set(dataset.map(d => d['room type']))])
                             .range(customColors)

        const roomTypes = colorScale.domain()
        var svg = d3.select("#ScatterPlot")
                    .style("width", dimensions.width)
                    .style("height", dimensions.height)

        var xScale = d3.scaleLinear()
                       .domain([d3.min(processedData, d => d.avgServiceFee) - 10, d3.max(processedData, d => d.avgServiceFee) + 10])
                       .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])

        var yScale = d3.scaleLinear()
                       .domain(d3.extent(processedData, d => d.minNights))
                       .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top])

        var xAxisGen = d3.axisBottom().scale(xScale)
                         .tickFormat(d3.format("$d"))

        var xAxis = svg.append("g")
                       .attr("transform", `translate(0, ${dimensions.height - dimensions.margin.bottom})`)
                       .call(xAxisGen)

        var xAxisText = svg.append("text")
                           .attr("x", dimensions.width / 2 - 50)
                           .attr("y", dimensions.height - 10)
                           .attr("fill", "black")
                           .style("font-size", "16px")
                           .text("Average Service Fee")

        var yAxisGen = d3.axisLeft().scale(yScale)
                         .tickFormat(d3.format("d"))

        var yAxis = svg.append("g")
                       .attr("transform", `translate(${dimensions.margin.left}, 0)`)
                       .call(yAxisGen)
        
        var yAxisText = svg.append("text")
                           .attr("transform", "rotate(-90)")
                           .attr("x", -dimensions.height / 2 - 50)
                           .attr("y", 15)
                           .attr("fill", "black")
                           .style("font-size", "16px")
                           .text("Minimum Nights")

        var tooltip = d3.select("body")
                        .append("div")
                        .style("position", "absolute")
                        .style("background-color", "white")
                        .style("border", "1px solid black")
                        .style("border-radius", "5px")
                        .style("padding", "5px")
                        .style("pointer-events", "none")
                        .style("opacity", 0)

        var PlotPoints = svg.append("g")
                            .selectAll("dot")
                            .data(processedData)
                            .enter()
                            .append("circle")
                            .attr("cx", d => xScale(d.avgServiceFee))
                            .attr("cy", d => yScale(d.minNights))
                            .attr("r", 3)
                            .attr("fill", d => colorScale(d.roomType))
                            .on("mouseover", function(d, i){
                                d3.select(this).style("stroke", "black")
                                tooltip.style("opacity", 1)
                                       .html(`
                                            <strong>Minimum Nights:</strong> ${i.minNights}<br>
                                            <strong>Avg Service Fee:</strong> ${i.avgServiceFee.toFixed(2)}<br>
                                            <strong>Room Type:</strong> ${i.roomType}
                                        `)
                                       .style("left", (d.pageX + 10) + "px")
                                       .style("top", (d.pageY + 10) + "px")
                          })
                          .on("mouseout", function(d, i){
                                d3.select(this).style("stroke", "none")
                                tooltip.style("opacity", 0)
                          })

        const legend = svg.append("g")
                          .attr("transform", `translate(${dimensions.width - 100}, 10)`)
                          .attr("class", "legend")

        const legendRectSize = 10; 
        const legendSpacing = 5;       
        
        legend.selectAll("rect")
              .data(roomTypes) 
              .enter()
              .append("rect")
              .attr("x", 0)
              .attr("y", (d, i) => i * (legendRectSize + legendSpacing)) 
              .attr("width", legendRectSize)
              .attr("height", legendRectSize)
              .attr("fill", d => colorScale(d))
        

        legend.selectAll("text")
              .data(roomTypes)
              .enter()
              .append("text")
              .attr("x", legendRectSize + 5) 
              .attr("y", (d, i) => i * (legendRectSize + legendSpacing) + legendRectSize / 2)
              .attr("dy", "0.35em")
              .style("font-size", "10px") 
              .text(d => d)
                        
        var title = svg.append("text")
                       .attr("x", dimensions.width / 2)
                       .attr("y", dimensions.margin.top / 2)
                       .attr("text-anchor", "middle")
                       .style("font-size", "24px")
                       .text("Average Service Fee vs Minimum Nights")

    //code goes here
    function updateScatterPlotByBorough(borough){
        let filteredData;
    
        if (borough === "All") {
            filteredData = dataset; 
        } else {
            filteredData = dataset.filter(d => d["neighbourhood group"] === borough);
        }

        //remove old circles
        svg.selectAll("circle").remove();
        
        //replot graph
        const groupedData = d3.flatRollup(
            filteredData,
            v => d3.mean(v, d => d['service fee']),
            d => d['minimum nights'],
            d => d['room type']
        ).map(([minNights, roomType, avgServiceFee]) => ({
            minNights, roomType, avgServiceFee
        }))
    
        // Re-draw circles
        svg.selectAll("circle")
            .data(groupedData)
            .enter().append("circle")
            .attr("r", 3)
            .attr("fill", d => colorScale(d.roomType))
            .attr("cx", d => xScale(d.avgServiceFee))
            .attr("cy", d => yScale(d.minNights))
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1)
                       .html(`<strong>Minimum Nights:</strong> ${d.minNights}<br>
                            <strong>Average Service Fee:</strong> $${d.avgServiceFee.toFixed(2)}<br>
                            <strong>Room Type:</strong> ${d.roomType} `)
                       
                       .style("left", `${event.pageX + 10}px`)
                       .style("top", `${event.pageY + 10}px`);
            })
            .on("mouseout", () => tooltip.style("opacity", 0));
    }  
    
    window.updateScatterPlotByBorough = updateScatterPlotByBorough

    }
    
)

