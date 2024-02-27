import React from "react";
import VirtualList from "react-tiny-virtual-list";

const CustomVirtualList = ({ children = [] }) => {
    return (
        <div>
            <VirtualList
                width="100%"
                height={300}
                itemCount={children.length}
                itemSize={30}
                renderItem={({ index, style }) => (
                    <div key={index} style={style}>
                        {children[index]}
                    </div>
                )}
            />
        </div>
    );
};

export default CustomVirtualList;
