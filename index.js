// npm install apollo-server graphql
var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');

const rawDictionary = require("./dictionary.json");

let dictionary = [];

for (let property in rawDictionary) {
    dictionary.push({
        word: property,
        example: rawDictionary[property]
    });
}

const typeDefs = `
  type Word {
    word: String
    example: String
  }
  type searchResponse {
    words: [Word],
    hasMore: Boolean
  }
  type Query {
    words(query: String, skip: Int=0, limit: Int=10): searchResponse
  },
  type Mutation {
  	addWord(word: String, example: String): String
  }
`;

const schema = buildSchema(typeDefs);

const filterData = async (query, skip, limit) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if(query == "") {
        resolve({words:[], hasMore: false});
      }
      else if (Math.random().toString().startsWith("0.5")) {
        reject();
      } else {
        const data = dictionary
        .filter(word => word.word.indexOf(query)>=0)
        .slice(skip, skip+limit);
        resolve({words: data, hasMore: data.length == limit}); 
      }
    }, 2000 * Math.random());
  });
}

const resolvers = {
    words: async ({query, skip, limit}) => {
      console.log("Resolving....");
      try{
        const data = await filterData(query, skip, limit);
        console.log(data);
        return data;
      }
    	catch(e) {
        console.error("throwing error")
        throw new Error('Error received');
      }
    },
    addWord: ({word, example}) => {
      dictionary.push({word, example});
  		return "Done";
  	}
};


const app = express();
// app.use(express.static("public"))
app.use(express.static("./react-app/build"));
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: resolvers,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');

/**

mutation {
  addWord(word: "Test", example:"Test")
}

{
  words(query: "absa") {
    word,
    example
  }
}

**/