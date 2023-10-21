const black = "#1e1e1e";

const svg = d3.select("#graph-container").append("svg")
    .attr("width", document.getElementById("graph-container").offsetWidth)
    .attr("height", document.getElementById("graph-container").offsetHeight)
    .style("background-color", black);

const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(edges).id(d => d.id))
    .force("charge", d3.forceManyBody().strength(-20))
    .force("center", d3.forceCenter(document.getElementById("graph-container").offsetWidth / 2, document.getElementById("graph-container").offsetHeight / 2));

const link = svg.selectAll("line")
    .data(edges)
    .enter().append("line")
    .style("stroke", "white");

const node = svg.selectAll(".node")
    .data(nodes)
    .enter().append("g")
    .attr("class", "node")
    .call(d3.drag()
        .on("start", dragStarted)
        .on("drag", dragged)
        .on("end", dragEnded)
    )
    .on("click", nodeClick);

node.append("circle")
    .attr("r", 5)
    .style("fill", "white");

const text = node.append("text")
    .attr("dy", -15)
    .attr("text-anchor", "middle")
    .text(d => d.name)
    .style("fill","white");

simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("transform", d => `translate(${d.x},${d.y})`);
});

function dragStarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragEnded(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
}

function nodeClick(d) {
    location.href = d.id;
}

const toggleButton = document.getElementById("toggle-button");
function GraphTheme(){
    ThemeFn();
    const currentBackgroundColor = svg.style("background-color");
    if (currentBackgroundColor === "white") {
        svg.style("background-color", black);
        node.selectAll("circle").style("fill", "white");
        link.style("stroke", "white");
        text.style("fill", "white");
    } else {
        svg.style("background-color", "white");
        node.selectAll("circle").style("fill", black);
        link.style("stroke", black);
        text.style("fill", black);
    }
};
