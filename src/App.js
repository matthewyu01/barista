import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';

const DEFAULT_PROGRAM =
`func main
 assign v1 20
 funccall print v1
endfunc`;

const ENDPOINT = process.env.NODE_ENV === 'development' ? 'http://localhost:8000/f22' : '/f22'

function App() {
  const [program, setProgram] = useState(DEFAULT_PROGRAM);
  const [version, setVersion] = useState('1');
  const [output, setOutput] = useState('');
  const [responses, setResponses] = useState([]);

  const lastResponse = responses.length === 0 ? {iteration: 0} : responses[responses.length - 1];

  function addResponse(code, output, version, iteration) {
    let n = [...responses];
    n.push({
      program: code,
      version,
      output,
      iteration,
    })
    if (n.length > 5) {
      n = n.slice(1)
    }
    setResponses(n);
    setOutput(output);
  }

  function loadProgram(code, output, version) {
    setProgram(code);
    setOutput(output);
    setVersion(version);
  }

  function runProgram() {
    fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        program,
        version,
      }),
    }).then(res => res.json()).then(data => {
      addResponse(program, data.res, version, lastResponse.iteration + 1);
    });
  }

  function PastBrews({responses, loadProgram}) {
    if (responses.length === 0) {
      return <div>no brews yet!</div>
    }
    return (
      <ul className='p-0 list-none'>
        {responses.map((resp, i) => <li className='single-run border-t py-2 text-ellipsis overflow-hidden whitespace-nowrap' key={resp.program + i}>
          brew #{resp.iteration} | <button onClick={() => loadProgram(resp.program, resp.output, resp.version)}>load</button>
          <br />
          in: {resp.program}
          <br />
          out: {resp.output}
        </li>).reverse()}
      </ul>
    )
  }

  return (
    <div className="App">
      <main className='main-container'>
        <div></div> {/* empty div for grid */}
        <div>
          <header>
            <h1 className='text-2xl'><span className='font-bold'>☕ barista</span> | brewin as a service</h1>
          </header>
          <hr className='my-2' />
          <select className="btn btn-blue-outline mr-1 pl-1">
            <option value="1">fall 2022</option>
          </select>
          <select className="btn btn-blue-outline mr-1 pl-1" value={version} onChange={(e) => setVersion(e.target.value)}>
            <option value="1">1: brewin</option>
            <option value="2">2: brewin++</option>
            <option value="3">3: brewin#</option>
          </select>
          <button className="btn btn-blue" onClick={runProgram}>brew!</button>
        </div>
        <div>
          <h2 className='text-xl mb-1'>past brews</h2>
          <PastBrews responses={responses} loadProgram={loadProgram} />
        </div>
        <div>
          <h2 className='text-xl'>your recipe</h2>
          <Editor
            className='editor border'
            value={program}
            onValueChange={program => setProgram(program)}
            highlight={code => code /* this is an identity -- no highlighting */}
            padding={10}
          />

          <h2 className='text-xl'>your brew</h2>
          <Editor
            className='editor border'
            value={output}
            highlight={code => code /* this is an identity -- no highlighting */}
            padding={10}
            readOnly={true}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
