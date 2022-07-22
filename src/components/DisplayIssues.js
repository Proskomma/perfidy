import React from 'react';

function DisplayIssues({issues}) {

    return <div className="display-issues">
        <div className="display-issues-title">
            {`${issues.length} Issue${issues.length !== 1 ? "s" : ""} found - abandoning!`}
        </div>
        {issues.map((ri, n) => <p key={n} className="display-issue">{ri}</p>)}
     </div>
}

export default DisplayIssues;
