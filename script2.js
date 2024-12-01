d3.csv("Airbnb_Open_Data.csv").then(function(dataset) {

    var dimensions = {
        height: 425,
        width: 1600,
        margin: {
            top: 50,
            bottom: 70,
            right: 10,
            left: 55
        }
    }

    dataset = dataset.filter(d => d["neighbourhood group"] && d.neighbourhood && !isNaN(+d['review rate number']) && +d['review rate number'] > 0)

    dataset.forEach(d => {
        if (d["neighbourhood group"]) {
            if (d["neighbourhood group"] === "brookln") d["neighbourhood group"] = "Brooklyn"
            if (d["neighbourhood group"] === "manhatan") d["neighbourhood group"] = "Manhattan"
        }
    })

    var avgReviewByNeighborhood = d3.rollup(dataset, 
        v => d3.mean(v, d => +d["review rate number"]),
        d => d["neighbourhood group"],
        d => d["neighbourhood"]
    )

    var data = Array.from(avgReviewByNeighborhood, ([borough, neighbourhoods]) => 
        Array.from(neighbourhoods, ([neighbourhood, avgReview]) => ({ borough, neighbourhood, avgReview }))
    ).flat()

    data.sort((a, b) => d3.ascending(a.borough, b.borough) || d3.descending(a.avgReview, b.avgReview))

    var svg = d3.select("#BarChart")
                .style("width", dimensions.width)
                .style("height", dimensions.height)

    var xScale = d3.scaleBand()
                   .domain(data.map(d => d.neighbourhood))
                   .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])
                   .padding(0.2);

    var yScale = d3.scaleLinear()
                   .domain([Math.floor((d3.min(data, d => d.avgReview) - .1) * 10) / 10, Math.ceil((d3.max(data, d => d.avgReview) + .1) * 10) / 10])
                   .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top])

    const customColors = ["#170083", "#EB0086", "#6D1788", "#F77F00", "#BEAF0C"]

    var colorScale = d3.scaleOrdinal(customColors)

    var tooltip = d3.select("body")
                    .append("div")
                    .style("position", "absolute")
                    .style("background-color", "white")
                    .style("border", "1px solid black")
                    .style("border-radius", "5px")
                    .style("padding", "5px")
                    .style("pointer-events", "none")
                    .style("opacity", 0)

    var bars = svg.append("g")
                  .selectAll("rect")
                  .data(data)
                  .enter()
                  .append("rect")
                  .attr("x", d => xScale(d.neighbourhood))
                  .attr("y", d => yScale(d.avgReview))
                  .attr("height", d => dimensions.height - yScale(d.avgReview) - dimensions.margin.bottom)
                  .attr("width", d => xScale.bandwidth())
                  .attr("fill", d => colorScale(d.borough))
                  .on("mouseover", function(d, i){
                        d3.select(this).style("stroke", "black")
                        tooltip.style("opacity", 1)
                               .html(`
                                    <strong>Borough:</strong> ${i.borough}<br>
                                    <strong>Neighborhood:</strong> ${i.neighbourhood}<br>
                                    <strong>Avg Review Rating:</strong> ${i.avgReview.toFixed(3)}
                                `)
                               .style("left", (d.pageX + 10) + "px")
                               .style("top", (d.pageY + 10) + "px")
                  })
                  .on("mouseout", function(d, i){
                        d3.select(this).style("stroke", "none")
                        tooltip.style("opacity", 0)
                  })

    var xAxisGen = d3.axisBottom().scale(xScale)
    var xAxis = svg.append("g")
                   .call(xAxisGen)
                   .style("transform", `translateY(${dimensions.height - dimensions.margin.bottom}px)`)

    xAxis.selectAll("text").remove()

    var boroughs = d3.group(data, d => d.borough)

    boroughs.forEach((neighborhoods, borough) => {
        var firstNeighborhood = neighborhoods[0]
        var lastNeighborhood = neighborhoods[neighborhoods.length - 1]
        var xPosition = (xScale(firstNeighborhood.neighbourhood) + xScale(lastNeighborhood.neighbourhood)) / 2 + xScale.bandwidth() / 2

        svg.append("text")
           .attr("x", xPosition)
           .attr("y", dimensions.height - dimensions.margin.bottom + 30)
           .attr("text-anchor", "middle")
           .style("font-size", "14px")
           .text(borough)
    })

    var xAxisText = svg.append("text")
                       .attr("x", dimensions.width / 2)
                       .attr("y", dimensions.height - 10)
                       .attr("fill", "black")
                       .style("font-size", "16px")
                       .text("Borough/Neighborhood")

    var yAxisGen = d3.axisLeft().scale(yScale)
    var yAxis = svg.append("g")
                   .call(yAxisGen)
                   .style("transform", `translateX(${dimensions.margin.left}px)`)

    yAxis.selectAll("text")
         .style("font-size", "12px")

    var yAxisText = svg.append("text")
                       .attr("transform", "rotate(-90)")
                       .attr("x", -dimensions.height / 2 - 50)
                       .attr("y", 17)
                       .attr("fill", "black")
                       .style("font-size", "16px")
                       .text("Avg Review Rating")

    var title = svg.append("text")
                   .attr("x", dimensions.width / 2)
                   .attr("y", dimensions.margin.top / 2)
                   .attr("text-anchor", "middle")
                   .style("font-size", "24px")
                   .text("Avg Review Rating per Neighborhood")
})