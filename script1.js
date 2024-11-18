d3.csv("Airbnb_Open_Data.csv").then(
    function(dataset) {

        var dimensions = {
            height: 800,
            width: 1600,
            margin:{
                top: 50,
                bottom: 50,
                right: 10,
                left: 55
            }
        }

        dataset.forEach(d => {
            d.price = +d.price.replace(/[$,]/g, "")
            d['Construction year'] = +d['Construction year']
        });

        dataset = dataset.filter(d => !isNaN(d.price) && !isNaN(d['Construction year']))

        var svg = d3.select("#ScatterPlot")
                    .style("width", dimensions.width)
                    .style("height", dimensions.height)

        var xScale = d3.scaleLinear()
                       .domain(d3.extent(dataset, d => d['Construction year']))
                       .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])

        var yScale = d3.scaleLinear()
                       .domain(d3.extent(dataset, d => d.price))
                       .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top])

        var xAxisGen = d3.axisBottom().scale(xScale)
                         .tickFormat(d3.format("d"))

        var xAxis = svg.append("g")
                       .attr("transform", `translate(0, ${dimensions.height - dimensions.margin.bottom})`)
                       .call(xAxisGen)

        var xAxisText = svg.append("text")
                           .attr("x", dimensions.width / 2)
                           .attr("y", dimensions.height - 10)
                           .attr("fill", "black")
                           .style("font-size", "16px")
                           .text("Construction Year");

        var yAxisGen = d3.axisLeft().scale(yScale)
                         .tickFormat(d3.format("$d"))

        var yAxis = svg.append("g")
                       .attr("transform", `translate(${dimensions.margin.left}, 0)`)
                       .call(yAxisGen)
        
        var yAxisText = svg.append("text")
                           .attr("transform", "rotate(-90)")
                           .attr("x", -dimensions.height / 2)
                           .attr("y", 15)
                           .attr("fill", "black")
                           .style("font-size", "16px")
                           .text("Price");        

        var PlotPoints = svg.append("g")
                            .selectAll(".dot")
                            .data(dataset)
                            .enter()
                            .append("circle")
                            .attr("cx", d => xScale(d['Construction year']))
                            .attr("cy", d => yScale(d.price))
                            .attr("r", 5)
                            .attr("fill", "black")
                            .attr("opacity", 0.7);

        var title = svg.append("text")
                       .attr("x", dimensions.width / 2)
                       .attr("y", dimensions.margin.top / 2)
                       .attr("text-anchor", "middle")
                       .style("font-size", "24px")
                       .text("Price vs Construction Year Scatterplot");
    }
)