//Imports .csv file 
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

    // Clean and process data
    dataset = dataset.filter(d => d["neighbourhood group"] && d.neighbourhood && !isNaN(+d['review rate number']) && +d['review rate number'] > 0)
    
    //Corrects misspellings in attributes
    dataset.forEach(d => {
        if (d["neighbourhood group"] === "brookln") d["neighbourhood group"] = "Brooklyn"
        if (d["neighbourhood group"] === "manhatan") d["neighbourhood group"] = "Manhattan"
    })

    //Updates chart for interaction
    function updateChart(filteredData) {
        //Group data by borough and neighborhood and calculate average review rating
        var avgReviewByNeighborhood = d3.rollup(filteredData, 
            v => d3.mean(v, d => +d["review rate number"]),
            d => d["neighbourhood group"],
            d => d["neighbourhood"]
        )

        //Organize data into array of objects
        var data = Array.from(avgReviewByNeighborhood, ([borough, neighbourhoods]) => 
            Array.from(neighbourhoods, ([neighbourhood, avgReview]) => ({ borough, neighbourhood, avgReview }))
        ).flat()

        //Sort data into descending order
        data.sort((a, b) => d3.ascending(a.borough, b.borough) || d3.descending(a.avgReview, b.avgReview));

        //Update x and y scales 
        xScale.domain(data.map(d => d.neighbourhood))
        yScale.domain([
            Math.floor((d3.min(data, d => d.avgReview) - 0.1) * 10) / 10, 
            Math.ceil((d3.max(data, d => d.avgReview) + 0.1) * 10) / 10
        ])

        // Remove old bars before adding new ones
        barsGroup.selectAll("rect").remove()

        //Create grouped bars for the data
        barsGroup.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.neighbourhood))
            .attr("y", d => yScale(d.avgReview))
            .attr("height", d => dimensions.height - yScale(d.avgReview) - dimensions.margin.bottom)
            .attr("width", xScale.bandwidth())
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
            .on("mouseout", function() {
                d3.select(this).style("stroke", "none")
                tooltip.style("opacity", 0)
            })

        //Update x and y axis labels
        svg.select(".x-axis").call(d3.axisBottom(xScale).tickFormat(''))
        svg.select(".y-axis").call(d3.axisLeft(yScale))
    }

    //Initialize svg elements, main canvas, x and y scale
    var svg = d3.select("#BarChart")
                .style("width", dimensions.width)
                .style("height", dimensions.height)

    var xScale = d3.scaleBand()
                   .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])
                   .padding(0.2)

    var yScale = d3.scaleLinear()
                   .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top])

    //Color scale
    var colorScale = d3.scaleOrdinal(["#170083", "#EB0086", "#6D1788", "#F77F00", "#BEAF0C"])

    var barsGroup = svg.append("g")

    svg.append("g").attr("class", "x-axis").style("transform", `translateY(${dimensions.height - dimensions.margin.bottom}px)`)
    svg.append("g").attr("class", "y-axis").style("transform", `translateX(${dimensions.margin.left}px)`)

    var tooltip = d3.select("body")
                    .append("div")
                    .style("position", "absolute")
                    .style("background-color", "white")
                    .style("border", "1px solid black")
                    .style("border-radius", "5px")
                    .style("padding", "5px")
                    .style("pointer-events", "none")
                    .style("opacity", 0)

    updateChart(dataset)

    //Interaction to click on different buttons
    d3.selectAll("#buttonContainer button").on("click", function() {
        var selectedBorough = d3.select(this).attr("data-borough")

        d3.selectAll("#buttonContainer button").classed("active", false)
        d3.select(this).classed("active", true)

        var filteredData = selectedBorough === "All" ? dataset : dataset.filter(d => d["neighbourhood group"] === selectedBorough)
        updateChart(filteredData)
    })
})
