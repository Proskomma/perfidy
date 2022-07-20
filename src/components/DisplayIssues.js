import React from 'react';

function DisplayIssues({issues}) {

    return <div className="display-issues">
        <div className="display-issues-title">Issues</div>
        {issues.map((ri, n) => <p key={n} className="display-issue">{ri}</p>)}
     </div>
}

export default DisplayIssues;
