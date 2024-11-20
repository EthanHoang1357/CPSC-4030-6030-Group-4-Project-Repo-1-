d3.csv("Airbnb_Open_Data.csv").then(function(dataset) {

    var dimensions = {
        height: 850,
        width: 1600,
        margin: {
            top: 50,
            bottom: 140,
            right: 10,
            left: 55
        }
    }

    // Only showing neighbourhoods in the Bronx for now as a reference
    //dataset = dataset.filter(d => d['neighbourhood group'] === 'Bronx' && d.neighbourhood && !isNaN(+d['review rate number']) && +d['review rate number'] > 0)

    // Showing all neighborhoods
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

    data.sort((a, b) => d3.ascending(a.borough, b.borough) || d3.ascending(a.neighbourhood, b.neighbourhood))

    var svg = d3.select("#BarChart")
                .style("width", dimensions.width)
                .style("height", dimensions.height)

    var xScale = d3.scaleBand()
                   .domain(data.map(d => d.neighbourhood))
                   .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])
                   .padding(0.2);

    var yScale = d3.scaleLinear()
                   .domain([1.5, d3.max(data, d => d.avgReview)])
                   .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top])

    var colorScale = d3.scaleOrdinal(d3.schemeSet1)

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
                        Neighborhoodtext.text(`Neighborhood: ${i.neighbourhood}`)
                        AvgRRtext.text(`Average Review Rating: ${i.avgReview.toFixed(3)}`)
                  })
                  .on("mouseout", function(d, i){
                        d3.select(this).style("stroke", "none")
                        Neighborhoodtext.text('Neighborhood:')
                        AvgRRtext.text(`Average Review Rating:`)
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
                       .attr("y", dimensions.height - 75)
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
                       .attr("x", -dimensions.height / 2)
                       .attr("y", 15)
                       .attr("fill", "black")
                       .style("font-size", "16px")
                       .text("Avg Review Rating")

    var title = svg.append("text")
                   .attr("x", dimensions.width / 2)
                   .attr("y", dimensions.margin.top / 2)
                   .attr("text-anchor", "middle")
                   .style("font-size", "24px")
                   //.text("Avg Review Rating per Neighborhood (Bronx)")
                   .text("Avg Review Rating per Neighborhood")

    var Neighborhoodtext = svg.append('text')
                              .attr("id", 'Neighborhoodtext')
                              .attr("x", dimensions.width / 2)
                              .attr("y", dimensions.margin.top / 2 + 30)
                              .attr("dx", "-.8em")
                              .attr("dy", ".15em")
                              .attr("font-family", "sans-serif")
                              .text("Neighborhood:")

    var AvgRRtext = svg.append('text')
                              .attr("id", 'AvgRRtext')
                              .attr("x", dimensions.width / 2 - 30)
                              .attr("y", dimensions.margin.top / 2 + 50)
                              .attr("dx", "-.8em")
                              .attr("dy", ".15em")
                              .attr("font-family", "sans-serif")
                              .text("Average Review Rating:")
})