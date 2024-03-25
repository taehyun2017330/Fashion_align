import React, {useEffect, useRef, useState} from "react";
import * as d3 from "d3";
import MiniMap from "./MiniMap";
import ColorLegend from "./ColorLegend";
const ItemMap = ({
                     items,
                     setBrushedItems,
                     filteredItems,
                     similarities,
                     setFilteredItems,
                     selectedMinValue,
                     selectedMaxValue,
                     category
}) => {

    const splotSvg = useRef(null);

    // related to zoom & drag
    const [transformScale, setTransformScale] = useState(1);
    const [transformX, setTransformX] = useState(0);
    const [transformY, setTransformY] = useState(0);

    const [isBrushChecked, setIsBrushChecked] = useState(false);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    const zoomThreshold = 3;
    const [categories, setCategories] = useState([]);

    const createLasso = () => {
        let coords = [];
        const lineGenerator = d3.line();
        function drawPath() {
            d3.select("#lasso")
                .style("stroke", "#474646")
                .style("stroke-width", 2)
                .style("stroke-dasharray", "5,5") // Define the dash pattern
                .style("fill", "#00000054")
                .attr("d", lineGenerator(coords) || "");
        }

        function dragStart() {
            coords = [];
            d3.select("#lasso").remove();
            d3.select("#map")
                .append("path")
                .attr("id", "lasso");
        }

        function dragMove(event) {
            const mouseX = event.sourceEvent.offsetX;
            const mouseY = event.sourceEvent.offsetY;
            coords.push([mouseX, mouseY]);
            drawPath();
        }

        const dragEnd = () => {
            const lassoPath = d3.select("#lasso");
            if (!lassoPath.empty()) {
                //console.log("Lasso Ended");
                const lassoPolygon = lassoPath.node();
                const lassoCoords = lassoPolygon.getAttribute("d");
                const brushedItems = filteredItems.filter((item) => {
                    const [x, y] = [item.x, item.y];
                    return pointInPolygon([x, y], parseLassoPath(lassoCoords));
                });
                //console.log(brushedItems);
                setBrushedItems(brushedItems);
            }
        };

        // Helper function to parse the lasso path data
        const parseLassoPath = (lassoPath) => {
            if (!lassoPath) return [];
            const pathArray = lassoPath.split(/[A-Z]/).filter((coord) => coord.trim() !== "");
            return pathArray.map((coord) => {
                const [x, y] = coord.split(",").map(Number);
                return [x, y];
            });
        };

        // Helper function to check if a point is inside a polygon
        const pointInPolygon = (point, vs) => {
            const splot = d3.select(splotSvg.current);
            const [x, y] = point;
            const xScale = d3.scaleLinear()
                .domain([d3.min(items, d => d.x), d3.max(items, d => d.x)])
                .range([0, width]);

            const yScale = d3.scaleLinear()
                .domain([d3.min(items, d => d.y), d3.max(items, d => d.y)])
                .range([height, 0]);

            const zoomTransform = d3.zoomTransform(splot.node());
            const scaledPoint = [xScale(x) * zoomTransform.k + zoomTransform.x, yScale(y) *  zoomTransform.k + zoomTransform.y];

            let inside = false;
            for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                const [xi, yi] = vs[i];
                const [xj, yj] = vs[j];
                const scaledXi = xi;
                const scaledYi = yi;
                const scaledXj = xj;
                const scaledYj = yj;

                const intersect =
                    (scaledYi > scaledPoint[1]) !== (scaledYj > scaledPoint[1]) &&
                    scaledPoint[0] < ((scaledXj - scaledXi) * (scaledPoint[1] - scaledYi)) / (scaledYj - scaledYi) + scaledXi;

                if (intersect) inside = !inside;
            }
            return inside;
        };

        return d3
            .drag()
            .on("start", dragStart)
            .on("drag", dragMove)
            .on("end", dragEnd);
    };

    // 검색 결과, 카테고리 변경, 유사도 변경에 따라 아이템 보여주기
    useEffect(() => {
        const splot = d3.select(splotSvg.current);
        const newItems = items.filter(d => {
            const similarity = similarities[d.id];
            return similarity > selectedMinValue && similarity < selectedMaxValue;
        });

        setFilteredItems(newItems);

        if (newItems.length > 0) {
            splot.selectAll('circle')
                .data(items, d => d.id)
                .transition()
                .attr('opacity', d => (newItems.includes(d) ? 1 : 0));

            splot.selectAll('image')
                .data(items, d => d.id)
                .transition()
                .attr('opacity', d => (newItems.includes(d) ? 1 : 0));
        }
    }, [selectedMinValue, selectedMaxValue, similarities]);

    // 크기 조정
    useEffect(() => {
        if (splotSvg.current) {
            const container = splotSvg.current.parentNode;
            if (container instanceof HTMLElement) {
                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;
                setWidth(containerWidth);
                setHeight(containerHeight);
            }
        }
    }, []);

    const handleZoom = (event) => {
        const splot = d3.select(splotSvg.current)
        const maxCircleSize = 10;

        const { transform } = event;
        setTransformScale(transform.k);
        setTransformX(transform.x);
        setTransformY(transform.y);

        splot
            .selectAll("circle")
            .attr("transform", transform)
            .attr("width", (d) => Math.min(maxCircleSize, 30 / transform.k))
            .attr("height", (d) => Math.min(maxCircleSize, 30 / transform.k))
            .style('display', d => transform.k < zoomThreshold ? 'block' : 'none');

        const images = splot.selectAll('image')
            .attr('transform', transform)
            .style('display', d => transform.k > zoomThreshold ? 'block' : 'none');
    };

    // Initialize the map
    useEffect(() => {
        // Determine the domain dynamically from the items data
        const categories = new Set(items.map(d => d.category));
        const domain = Array.from(categories);
        setCategories(domain);
    }, [items]);

    useEffect(() => {
        const xScale = d3.scaleLinear()
            .domain([d3.min(items, (d) => d.x), d3.max(items, (d) => d.x)])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([d3.min(items, (d) => d.y), d3.max(items, (d) => d.y)])
            .range([height, 0]);

        const splot = d3.select(splotSvg.current)
            .attr("id", "map")
            .attr('width', width)
            .attr('height', height);

        if (!isBrushChecked) {
            splot.call(
                d3.zoom()
                    .scaleExtent([1, 15])
                    .on('end', handleZoom)
            );
        }

        const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

        splot.selectAll('circle')
            .data(items)
            .join('circle')
            .attr('cx', (d,i) => xScale(d.x))
            .attr('cy', (d,i) => yScale(d.y))
            .attr('r', 3)
            .attr('fill', d => colorScale(d.category))
            .on('mouseover', (event, d) => {
                //console.log(d.id);
            });

        // Render images
        const images = splot
            .selectAll('image')
            .data(items)
            .join('image')
            .attr('x', (d, i) => xScale(d.x))
            .attr('y', (d, i) => yScale(d.y))
            .attr('width', 8)
            .attr('height', 16)
            .attr('opacity', 1)
            .style('border', (d) => `2px solid ${colorScale(d.category)}`) // Border color based on category
            .style('border-radius', '5px')
            .attr('xlink:href', (d) => `https://fashionalign.s3.ap-northeast-2.amazonaws.com/${d.id}.jpg`)
            .style('display', 'none');


    }, [items, width, height]);

    const handleBrushChange = (event) => {
        setBrushedItems([]);
        const splot = d3.select(splotSvg.current);
        const lasso = createLasso();
        setIsBrushChecked(event.target.checked);
        if (event.target.checked) {
            splot.call(lasso);
            splot.on('.zoom', null);
        } else {
            // Reset the lasso if it exists and disable
            d3.select("#lasso").remove();
            splot.on('.drag', null);
            splot.call(
                d3.zoom()
                    .scaleExtent([1, 10])
                    .on('end', handleZoom)
            );
        }
    };

    // Function to update the main map based on mini-map movement
    const updateMainMap = (x, y, scale) => {
        setTransformX(x);
        setTransformY(y);
        setTransformScale(scale);
        // Update the visibility of the main map based on the new coordinates and scale
    };

    return (
        <div className={"map-container"}>
            <div className={"map-inner"}>
                <svg id="map" ref={splotSvg}></svg>
            </div>
            <div className={"lasso-container"}>
                <input
                    type="checkbox"
                    checked={isBrushChecked}
                    onChange={handleBrushChange}
                    style={{ margin: 0, width: '15px', height: '15px'}}
                />
                <label className={"component-header"}>
                    Brush
                </label>
            </div>
            <MiniMap
                items={filteredItems}
                width={200}  // Adjust width and height based on your needs
                height={150}
                transformX={transformX}
                transformY={transformY}
                transformScale={transformScale}
                onMiniMapMove={updateMainMap}
            />
            <ColorLegend categories={categories}/>
        </div>
    );
};

export default ItemMap;
