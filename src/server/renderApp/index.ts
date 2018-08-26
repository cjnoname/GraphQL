import * as express from 'express';
import { renderPage } from './controller';
import { InitialState } from 'models/initial';
import { fetchTheme } from './middleware';
import { themes } from '../initial';
import * as express_graphql from 'express-graphql';
import { buildSchema } from 'graphql';

const render = express.Router();

let initialState: InitialState;
render.use(async (req, res, next) => {
  if (req.originalUrl.includes('/api/theme') || !req.originalUrl.includes('/api/')) {
    initialState = (await fetchTheme(req, themes))!;
  }
  next();
});

render.get('/api/theme', (req, res) => res.send(initialState));

const getCourse = (args: any) => {
  return coursesData.filter((course: any) => course.id === args.id)[0];
};

const getCourses = (args: any) => args.topic ? coursesData.filter(course => course.topic === args.topic) : coursesData;

const updateCourseTopic = ({ id, topic }: { id: number, topic: string }) => {
  coursesData.map(course => {
    if (course.id === id) {
      course.topic = topic;
      return course;
    }
  });
  const res =  coursesData.filter(course => course.id === id)[0];
  return res;
};

const root = {
  course: getCourse,
  courses: getCourses,
  updateCourseTopic
};

const root1 = {
  message: () => 'Hello World!',
  appearsIn: [
    'NEWHOPE',
    'EMPIRE',
    'JEDI'
  ]
};

const schema = buildSchema(`
    type Query {
        course(id: Int!): Course
        courses(topic:String): [Course]
    }
    type Mutation {
      updateCourseTopic(id: Int!, topic: String): Course
    }
    type Course{
      id: Int
      title: String
      author: String
      description: String
      topic: String
      url: String
    }
`);

const coursesData = [
  {
    id: 1,
    title: 'title1',
    author: 'author1',
    description: 'description1',
    topic: 'Node.js',
    url: 'https://aa.com'
  },
  {
    id: 2,
    title: 'title2',
    author: 'author2',
    description: 'description2',
    topic: 'Nodeaaa.js',
    url: 'https://bb.com'
  },
  {
    id: 3,
    title: 'title3',
    author: 'author3',
    description: 'description3',
    topic: 'Node.js',
    url: 'https://cc.com'
  }
];

render.use('/graphql', express_graphql(async (request, response, graphQLParams) => {
  console.log(graphQLParams);
  return {
    schema,
    rootValue: root,
    graphiql: true
  };
}));

render.get('*', (req, res) => renderPage(req, res, initialState));

export { render };
