import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const MiniMap = ({
                     items,
                     width,
                     height,
                     transformScale,
                     transformX,
                     transformY,
                     onMiniMapMove,
                 }) => {
    const miniMapSvg = useRef(null);
    const visibleRectRef = useRef(null); // Reference to the visible rectangle

    // Mini map initialization
    useEffect(() => {
        const xScale = d3.scaleLinear()
            .domain([d3.min(items, (d) => d.x), d3.max(items, (d) => d.x)])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([d3.min(items, (d) => d.y), d3.max(items, (d) => d.y)])
            .range([height, 0]);

        const miniMap = d3.select(miniMapSvg.current)
            .attr("id", "mini-map")
            .attr("width", width)
            .attr("height", height)
            .style("background-color", "white");

        // Draw circles on mini-map
        const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

        miniMap
            .selectAll("circle")
            .data(items)
            .enter()
            .append("circle")
            .attr("cx", (d) => xScale(d.x))
            .attr("cy", (d) => yScale(d.y))
            .attr("r", 1)
            .attr('fill', (d) => colorScale(d.category));

        // Add a rectangle representing the visible area of the main map
        if (!visibleRectRef.current) { // Check if the visible rectangle already exists
            visibleRectRef.current = miniMap.append("rect")
                .attr("width", width / transformScale)
                .attr("height", height / transformScale)
                .attr("fill", "gray")
                .attr("stroke", "white")
                .attr("opacity", 0.2)
                .attr("stroke-width", 2);
        }

        // Update visible rectangle position on main map move (zoom or drag)
        const updateVisibleRect = () => {
            const minimap = d3.select(miniMapSvg.current)
            const transform = d3.zoomTransform(miniMap.node());
            const scaleX = transform.k / transformScale;
            const scaleY = transform.k / transformScale;

            const mainMapElement = document.getElementById("map");
            const miniMapElement = document.getElementById("mini-map");

            if (!mainMapElement || !miniMapElement) {
                // 아직 렌더링 전
                return;
            }

            const viewportBoundaries = mainMapElement.getBoundingClientRect();
            const minimapBoundaries = miniMapElement.getBoundingClientRect();

            const translateWidthRatio = minimapBoundaries.width / viewportBoundaries.width;
            const translateHeightRatio = minimapBoundaries.height / viewportBoundaries.height;

            const translateWidth = -transformX * translateWidthRatio;
            const translateHeight = -transformY * translateHeightRatio;

            minimap
                .selectAll("rect")
                .attr("width", width / transformScale)
                .attr("height", height / transformScale)
                .attr("transform", `translate(${translateWidth},${translateHeight}) scale(${scaleX},${scaleY})`);
        };

        // Set up mini-map drag behavior
        /*
        const miniMapDrag = d3.drag()
            .on("start", (event) => {
                event.sourceEvent.stopPropagation(); // Prevent zooming during drag
            })
            .on("drag", (event) => {
                const x = event.x;
                const y = event.y;
                updateVisibleRect(); // Update visible rectangle position on drag
                onMiniMapMove(x, y);
            });

        miniMap.call(miniMapDrag);*/
        const drag = d3.drag()
            .on("drag", function (event) {
                const dx = event.dx;
                const dy = event.dy;
                const transform = d3.zoomTransform(miniMapSvg.current);
                const scale = transform.k;
                const newX = transformX + dx / scale;
                const newY = transformY + dy / scale;

                onMiniMapMove(newX, newY, scale);

                // Update the position of the visible rectangle
                const rect = miniMap.selectAll("rect");
                rect.attr("transform", `translate(${newX},${newY})`);

                // Make sure the rectangle does not exceed the boundaries of the mini-map
                const rectWidth = width / scale;
                const rectHeight = height / scale;
                const maxX = width - rectWidth;
                const maxY = height - rectHeight;
                const clampedX = Math.max(0, Math.min(newX, maxX));
                const clampedY = Math.max(0, Math.min(newY, maxY));
                rect.attr("transform", `translate(${clampedX},${clampedY})`);
            });

        miniMap.selectAll("rect").call(drag);

        updateVisibleRect();

    }, [items, width, height, transformScale, transformX, transformY, onMiniMapMove]);

    return <svg ref={miniMapSvg} className={"minimap-container"}></svg>;
};

export default MiniMap;


