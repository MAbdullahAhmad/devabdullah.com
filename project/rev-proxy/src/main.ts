import { load_config } from "./config/load_config.js";
import { create_app } from "./create_app.js";

const config = await load_config();
const app = create_app(config);

app.listen(config.head.port, config.head.host, () => {
  console.info(
    `rev-proxy listening on http://${config.head.host}:${config.head.port}`,
  );
});
