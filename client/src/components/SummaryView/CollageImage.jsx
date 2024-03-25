import React, { useRef, useEffect } from 'react';

//TODO: CORS issue
const CollageImage = ({ brushedItems }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Define canvas width and height based on number of items
        const numItems = brushedItems.length;
        const width = 20; // Define width of each image
        const height = 20; // Define height of each image
        const spacing = 5; // Define spacing between images
        const cols = 2; // Number of columns in the collage
        const rows = Math.ceil(numItems / cols); // Number of rows in the collage

        canvas.width = width * cols + spacing * (cols - 1);
        canvas.height = height * rows + spacing * (rows - 1);

        // Load images and draw them on canvas
        brushedItems.slice(0, cols * rows).forEach((item, index) => {
            const img = new Image();
            img.crossOrigin = 'anonymous'; 
            img.src = `https://fashionalign.s3.ap-northeast-2.amazonaws.com/${item.id}.jpg`

            const x = (index % cols) * (width + spacing);
            const y = Math.floor(index / cols) * (height + spacing);

            img.onload = () => {
                ctx.drawImage(img, x, y, width, height);
                if (index === numItems - 1) {
                    // Convert canvas to file format
                    canvas.toBlob(blob => {
                        // Create a new FormData object and append the blob
                        const formData = new FormData();
                        formData.append('image', blob, 'collage.jpg');
                        
                        // Pass formData to addKeywordGroup

                    }, 'image/jpeg');
                }
            };
        });
    }, [brushedItems]);

    return <canvas ref={canvasRef} style={{ display: 'none' }} />;
};

export default CollageImage;
