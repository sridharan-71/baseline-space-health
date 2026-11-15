import { evaluateAll } from '../adversarialEval';
const out = process.env.ADV_DUMP;
(out ? it : it.skip)('dump adversarial results', () => {
  require('fs').writeFileSync(out!, JSON.stringify(evaluateAll(), null, 1));
}, 600000);
