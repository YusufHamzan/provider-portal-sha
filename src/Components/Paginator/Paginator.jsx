import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import Pagination from "react-bootstrap/Pagination";
import "./styles.css";

const Paginator = ({ totalPages = 1, changePage = () => {} }) => {
    const [active, setActive] = useState(1);
    const [currentSliceIndex, setCurrentSliceIndex] = useState(0);

    const items = [...Array(totalPages + 1).keys()].slice(1).map((data, i) => (
        <Pagination.Item key={i} onClick={() => setActive(i + 1)} active={i + 1 === active}>
            {data}
        </Pagination.Item>
    ));

    useEffect(() => {
        setActive(currentSliceIndex + 1);
    }, [currentSliceIndex]);

    useEffect(() => {
        //Make an api call when active changes,get a call back and pass the value
        changePage(active - 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    useEffect(() => {
        setActive(1);
        setCurrentSliceIndex(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalPages]);
    return (
        <main className="main__paginator">
            {" "}
            <Pagination size="sm">
                <Button className="slice_change" disabled={currentSliceIndex === 0} onClick={() => setCurrentSliceIndex((index) => index - 3)}>
                    &#60;&#60;
                </Button>{" "}
                {items.slice(currentSliceIndex, currentSliceIndex + 3)}
                <Button
                    className="slice_change"
                    disabled={currentSliceIndex + 3 > totalPages}
                    onClick={() => setCurrentSliceIndex((index) => index + 3)}
                >
                    &#62;&#62;
                </Button>{" "}
            </Pagination>
        </main>
    );
};

export default Paginator;
