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

        dataset.forEach(d => {
            d['service fee'] = +d['service fee'].replace(/[$,]/g, "")
            d['minimum nights'] = +d['minimum nights']
        });

        const groupedData = d3.flatRollup(

            dataset,
            v => ({
                avgServiceFee: d3.mean(v, d => d['service fee']),



            }),
            d => d['minimum nights'],
            d => d['room type']

        );

        dataset.forEach(d => {
            if (d.roomType === "") { 
                d.roomType = "Unknown"; 
            }
        });
        const processedData = groupedData.map(([minNights, roomType, values]) => ({
            minNights,
            roomType,
            avgServiceFee: values.avgServiceFee
        }));

       
        const colorScale = d3.scaleOrdinal()
                        .domain([...new Set(dataset.map(d => d['room type']))])
                        .range(d3.schemeCategory10);

        const roomTypes = colorScale.domain();
        console.log([...new Set(dataset.map(d => d['room type']))]);
        var svg = d3.select("#ScatterPlot")
                    .style("width", dimensions.width)
                    .style("height", dimensions.height)

        var xScale = d3.scaleLinear()
                       .domain(d3.extent(processedData, d => d.avgServiceFee))
                       .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])

        console.log("xScale domain:", xScale.domain());
        console.log("xScale range:", [dimensions.margin.left, dimensions.width - dimensions.margin.right]);

        var yScale = d3.scaleLinear()
                       .domain(d3.extent(processedData, d => d.minNights))
                       .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top])

        var xAxisGen = d3.axisBottom().scale(xScale)
                         .tickFormat(d3.format("$d"))

        var xAxis = svg.append("g")
                       .attr("transform", `translate(0, ${dimensions.height - dimensions.margin.bottom})`)
                       .call(xAxisGen)

        var xAxisText = svg.append("text")
                           .attr("x", dimensions.width / 2)
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
                           .attr("x", -dimensions.height / 2)
                           .attr("y", 15)
                           .attr("fill", "black")
                           .style("font-size", "16px")
                           .text("Minimum Nights")

        var PlotPoints = svg.append("g")
                            .selectAll("dot")
                            .data(processedData)
                            .enter()
                            .append("circle")
                            .attr("cx", d => xScale(d.avgServiceFee))
                            .attr("cy", d => yScale(d.minNights))
                            .attr("r", 1.5)
                            .attr("fill", d => colorScale(d.roomType)); // Apply color based on room type

        const legend = svg.append("g")
                        .attr("transform", `translate(${dimensions.width - dimensions.margin.left - dimensions.margin.right-80}, 40)`)
                        .attr("class", "legend");

      
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
        .attr("fill", d => colorScale(d));
    

    legend.selectAll("text")
        .data(roomTypes)
        .enter()
        .append("text")
        .attr("x", legendRectSize + 5) 
        .attr("y", (d, i) => i * (legendRectSize + legendSpacing) + legendRectSize / 2)
        .attr("dy", "0.35em")
        .style("font-size", "10px") 
        .text(d => d);
                        
        var title = svg.append("text")
                       .attr("x", dimensions.width / 2)
                       .attr("y", dimensions.margin.top / 2)
                       .attr("text-anchor", "middle")
                       .style("font-size", "24px")
                       .text("Average Service Fee vs Minimum Nights Scatterplot")
    }
)