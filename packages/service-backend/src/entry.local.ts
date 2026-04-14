import { bootstrap } from './bootstrap';

const port = Number(process.env.PORT) || 3001;

bootstrap().then(({ app }) => {
  app.listen(port).then(() => console.log(`\nhttp://localhost:${port}`));
});
