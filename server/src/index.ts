import { app } from './app.js';
import { config } from './config.js';

app.listen(config.PORT, () => console.log(`InnerRoom API listening on :${config.PORT}`));
