import './App.css';
import { gql, useQuery } from '@apollo/client';
import React, { useState } from "react";
import { useDebounce } from 'use-debounce';

const query = gql`
  query Words($query: String!, $skip: Int=0, $limit: Int=10){
    words(query: $query, skip: $skip, limit: $limit) {
      words{
        word,
        example
      },
      hasMore
    }
  }
`;
function App() {
  const [qry, setQry] = useState("");
  const [debounceUseQuery] = useDebounce(qry, 300);
  /**
   * 0ms -> qry = 'a'
   * 50ms -> qry = 'ab'
   * debounceUseQuery <= 'ab' //350ms
   * 400ms -> qry = 'abc'
   */
  const [page, setPage] = useState(0);
  const { loading, data, error } = useQuery(query, { variables: { query: debounceUseQuery, skip: page*10, limit:10 } });

  let result = data && data.words && data.words.words ? data.words.words : [];
  let hasMore = data? data.words.hasMore : false;
  console.log(data);
  const handleChange = (e) => {
    setPage(0);
    setQry(e.target.value);
  }

  const loadMore = () => {
    setPage(page+1);
  }

  return (
    <div>
      <div className="App-header">
        <label>Search: </label><input style={{marginTop:5, marginBottom:5}} value={qry} onChange={handleChange} />
      </div>
      
      <div style={{marginTop:'5rem'}}>
        {loading ? <h2>Loading</h2> : null}
        {error ? <h2>Some Error Found!</h2> : null}
        {result.map(d => <><h2 className="word-header">{d.word}</h2><p className="word-example">{d.example}</p></>)}
      </div>

      <div>
        {hasMore ? <button primary onClick={loadMore}>Next Page</button> : null}
      </div>
    </div>
  );
}

export default App;
