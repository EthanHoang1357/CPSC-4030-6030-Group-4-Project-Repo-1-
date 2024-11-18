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
    dataset = dataset.filter(d => d['neighbourhood group'] === 'Bronx' && d.neighbourhood && !isNaN(+d['review rate number']) && +d['review rate number'] > 0)

    // Showing all neighborhoods
    //dataset = dataset.filter(d => d.neighbourhood && !isNaN(+d['review rate number']) && +d['review rate number'] > 0)

    var avgReviewByNeighborhood = d3.rollup(dataset, 
        v => d3.mean(v, d => +d["review rate number"]), 
        d => d["neighbourhood"]
    )

    var data = Array.from(avgReviewByNeighborhood, ([key, value]) => ({ neighbourhood: key, avgReview: value }))
    data.sort((a, b) => d3.ascending(a.neighbourhood, b.neighbourhood))

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

    var bars = svg.append("g")
                  .selectAll("rect")
                  .data(data)
                  .enter()
                  .append("rect")
                  .attr("x", d => xScale(d.neighbourhood))
                  .attr("y", d => yScale(d.avgReview))
                  .attr("height", d => dimensions.height - yScale(d.avgReview) - dimensions.margin.bottom)
                  .attr("width", d => xScale.bandwidth())
                  .attr("fill", "black")

    var textLabels = svg.append("g")
                        .selectAll("text")
                        .data(data)
                        .enter()
                        .append("text")
                        .attr("x", d => xScale(d.neighbourhood) + xScale.bandwidth() / 2)  // Center the text over each bar
                        .attr("y", d => yScale(d.avgReview) - 5)  // Position the text just above the bar
                        .attr("text-anchor", "middle")
                        .style("font-size", "12px")
                        .text(d => d.avgReview.toFixed(2))
                        .attr("transform", d => "rotate(270," + (xScale(d.neighbourhood) + xScale.bandwidth() / 2 - 3) + "," + (yScale(d.avgReview) - 12) + ")")


    var xAxisGen = d3.axisBottom().scale(xScale)
    var xAxis = svg.append("g")
                   .call(xAxisGen)
                   .style("transform", `translateY(${dimensions.height - dimensions.margin.bottom}px)`)

    xAxis.selectAll("text")
         .style("text-anchor", "end")
         .attr("dx", "-0.8em")
         .attr("dy", ".15em")
         .attr("transform", "rotate(-65)")
         .style("font-size", "12px")

    var xAxisText = svg.append("text")
                       .attr("x", dimensions.width / 2)
                       .attr("y", dimensions.height - 10)
                       .attr("fill", "black")
                       .style("font-size", "16px")
                       .text("Neighbourhood")

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
                   .text("Avg Review Rating per Neighborhood (Bronx)")
                   //.text("Avg Review Rating per Neighborhood")
})