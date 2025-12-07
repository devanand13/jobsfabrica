export function resumeTemplate(user: any, tailored: any) {
    return `
    <html>
      <head>
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            padding: 30px;
            line-height: 1.4;
            color: #333;
          }
  
          h1 {
            font-size: 32px;
            margin-bottom: 5px;
          }
  
          h2 {
            font-size: 20px;
            margin-top: 30px;
            border-bottom: 2px solid #4a90e2;
            padding-bottom: 5px;
            color: #4a90e2;
          }
  
          h3 {
            font-size: 16px;
            margin: 5px 0;
          }
  
          .section {
            margin-top: 20px;
          }
  
          .item {
            margin-bottom: 15px;
          }
  
          .title {
            font-weight: bold;
            font-size: 16px;
          }
  
          .company {
            color: #555;
            font-style: italic;
            font-size: 14px;
          }
  
          ul {
            margin-top: 5px;
            padding-left: 20px;
          }
  
          .skills span {
            display: inline-block;
            background: #e1ecf4;
            color: #0366d6;
            padding: 3px 8px;
            margin: 2px;
            border-radius: 4px;
            font-size: 12px;
          }
  
          .ats {
            margin-top: 10px;
          }
  
          .ats span.matched {
            color: green;
          }
  
          .ats span.missing {
            color: red;
          }
  
          a {
            color: #0366d6;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <h1>${user.name || ""}</h1>
        <p><strong>Email:</strong> ${user.email || ""}</p>
        <p><strong>Location:</strong> ${user.location || ""}</p>
  
        <div class="section">
          <h2>Summary</h2>
          <p>${tailored.summary || ""}</p>
        </div>
  
        <div class="section">
          <h2>Skills</h2>
          <div class="skills">
            ${(tailored.skills || []).map((skill: string) => `<span>${skill}</span>`).join("")}
          </div>
        </div>
  
        <div class="section">
          <h2>Experience</h2>
          ${(tailored.experience || [])
            .map(
              (exp: any) => `
              <div class="item">
                <div class="title">${exp.title}</div>
                <div class="company">${exp.company} – ${exp.startDate} to ${exp.endDate}</div>
                <ul>
                  ${(exp.description || []).map((d: string) => `<li>${d}</li>`).join("")}
                </ul>
              </div>
            `
            )
            .join("")}
        </div>
  
        <div class="section">
          <h2>Projects</h2>
          ${(tailored.projects || [])
            .map(
              (proj: any) => `
              <div class="item">
                <div class="title">${proj.name}</div>
                ${
                  proj.link ? `<div><a href="${proj.link}" target="_blank">${proj.link}</a></div>` : ""
                }
                <ul>
                  ${(proj.description || []).map((d: string) => `<li>${d}</li>`).join("")}
                </ul>
              </div>
            `
            )
            .join("")}
        </div>
  
        <div class="section">
          <h2>ATS Analysis</h2>
          <div class="ats">
            <div><strong>Matched Keywords:</strong> ${(tailored.atsAnalysis?.matchedKeywords || [])
              .map((kw: string) => `<span class="matched">${kw}</span>`)
              .join(" ")}</div>
            <div><strong>Missing Keywords:</strong> ${(tailored.atsAnalysis?.missingKeywords || [])
              .map((kw: string) => `<span class="missing">${kw}</span>`)
              .join(" ")}</div>
            <div><strong>ATS Score:</strong> ${tailored.atsAnalysis?.score || 0}%</div>
          </div>
        </div>
      </body>
    </html>
    `;
  }
  