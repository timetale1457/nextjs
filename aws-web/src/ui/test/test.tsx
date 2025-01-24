import React, { useState } from 'react';

const Test: React.FC = () => {
    let intervalId: NodeJS.Timeout;
    
    const [boxCount, setBoxCount] = useState(0);

    const addBox = () => setBoxCount(boxCount + 1);
    const removeBox = () => setBoxCount(boxCount > 0 ? boxCount - 1 : 0);
    const handleMouseDownAdd = () => handleMouseDown(addBox);
    const handleMouseDownRemove = () => handleMouseDown(removeBox);
    const handleMouseDown = (action: () => void) => {
        action();
        intervalId = setInterval(action, 300);
    };
    const handleMouseUp = () => {
        clearInterval(intervalId);
    };
    React.useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);
    return (
        <div>
            <button onMouseDown={handleMouseDownAdd} onMouseUp={handleMouseUp}>+</button>
            <button onMouseDown={handleMouseDownRemove} onMouseUp={handleMouseUp} disabled={boxCount === 0}>-</button>
            <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
                {Array.from({ length: boxCount }).map((_, index) => (
                    <div key={index} style={{ width: '50px', height: '50px', backgroundColor: 'black', margin: '5px' }}></div>
                ))}
            </div>
        </div>
    );
};

export default Test;