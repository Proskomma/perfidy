import {useRef, useState, useEffect} from 'react';
import ReactDOM from "react-dom";

// Based on functional example at https://stackoverflow.com/questions/47574490/open-a-component-in-new-window-on-a-click-in-react
function TextWindow({children, title}) {

    const [container, setContainer] = useState(null);
    const newWindow = useRef(null);

    useEffect(() => {
        // Create container element on client-side
        setContainer(document.createElement("div"));
    }, []);

    useEffect(() => {
        // When container is ready
        if (container) {
            // Create window
            newWindow.current = window.open(
                "",
                "",
                "width=600,height=400,left=200,top=200"
            );
            // Save reference to window for cleanup
            const curWindow = newWindow.current;
            // Append container
            curWindow.document.body.appendChild(container);
            curWindow.document.title = `${title}: Perfidy`;


            // Return cleanup function
            return () => {
                curWindow.close();
            }
        }
    }, [container, title]);

    return container && ReactDOM.createPortal(children, container);
}

export default TextWindow;
