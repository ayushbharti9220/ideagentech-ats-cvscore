// Canonical skill names + aliases. Used to (a) read the job description,
// (b) normalise the candidate's own skills to the exact spelling recruiters/ATS search for.
const DICT: [string, string[]][] = [
  ['JavaScript', ['javascript', 'es6', 'ecmascript']],
  ['TypeScript', ['typescript']],
  ['React', ['react', 'reactjs', 'react.js']],
  ['Next.js', ['next.js', 'nextjs']],
  ['Vue.js', ['vue', 'vue.js', 'vuejs']],
  ['Angular', ['angular', 'angularjs']],
  ['Node.js', ['node.js', 'nodejs', 'node']],
  ['Express.js', ['express.js', 'expressjs', 'express']],
  ['Postman', ['postman']],
  ['VS Code', ['vs code', 'vscode', 'visual studio code']],
  ['Vercel', ['vercel']],
  ['Netlify', ['netlify']],
  ['Python', ['python']],
  ['Java', ['java']],
  ['C++', ['c++']],
  ['C#', ['c#']],
  ['Golang', ['golang']],
  ['Rust', ['rust']],
  ['PHP', ['php']],
  ['Ruby on Rails', ['ruby on rails', 'rails']],
  ['Ruby', ['ruby']],
  ['Kotlin', ['kotlin']],
  ['Swift', ['swift']],
  ['Scala', ['scala']],
  ['HTML', ['html', 'html5']],
  ['CSS', ['css', 'css3']],
  ['Sass', ['sass', 'scss']],
  ['Tailwind CSS', ['tailwind css', 'tailwindcss', 'tailwind']],
  ['Bootstrap', ['bootstrap']],
  ['Redux', ['redux']],
  ['GraphQL', ['graphql']],
  ['REST APIs', ['rest apis', 'rest api', 'restful', 'restful apis', 'restful api', 'rest']],
  ['SQL', ['sql']],
  ['MySQL', ['mysql']],
  ['PostgreSQL', ['postgresql', 'postgres']],
  ['MongoDB', ['mongodb', 'mongo']],
  ['Redis', ['redis']],
  ['SQLite', ['sqlite']],
  ['Firebase', ['firebase']],
  ['Supabase', ['supabase']],
  ['DynamoDB', ['dynamodb']],
  ['Elasticsearch', ['elasticsearch']],
  ['Kafka', ['kafka']],
  ['RabbitMQ', ['rabbitmq']],
  ['AWS', ['aws', 'amazon web services']],
  ['Azure', ['azure']],
  ['GCP', ['gcp', 'google cloud']],
  ['Docker', ['docker']],
  ['Kubernetes', ['kubernetes', 'k8s']],
  ['Terraform', ['terraform']],
  ['Jenkins', ['jenkins']],
  ['CI/CD', ['ci/cd', 'cicd', 'continuous integration']],
  ['Git', ['git']],
  ['GitHub', ['github']],
  ['GitLab', ['gitlab']],
  ['Linux', ['linux']],
  ['Nginx', ['nginx']],
  ['Agile', ['agile']],
  ['Scrum', ['scrum']],
  ['Jira', ['jira']],
  ['Microservices', ['microservices', 'microservice']],
  ['Unit Testing', ['unit testing', 'unit tests', 'unit test']],
  ['Jest', ['jest']],
  ['Cypress', ['cypress']],
  ['Selenium', ['selenium']],
  ['Playwright', ['playwright']],
  ['TDD', ['tdd', 'test-driven development']],
  ['Machine Learning', ['machine learning', 'ml']],
  ['Deep Learning', ['deep learning']],
  ['NLP', ['nlp', 'natural language processing']],
  ['TensorFlow', ['tensorflow']],
  ['PyTorch', ['pytorch']],
  ['Pandas', ['pandas']],
  ['NumPy', ['numpy']],
  ['Scikit-learn', ['scikit-learn', 'sklearn']],
  ['Data Analysis', ['data analysis', 'data analytics']],
  ['Power BI', ['power bi', 'powerbi']],
  ['Tableau', ['tableau']],
  ['Excel', ['excel']],
  ['Apache Spark', ['apache spark', 'spark', 'pyspark']],
  ['Hadoop', ['hadoop']],
  ['Airflow', ['airflow']],
  ['ETL', ['etl']],
  ['Django', ['django']],
  ['Flask', ['flask']],
  ['FastAPI', ['fastapi']],
  ['Spring Boot', ['spring boot', 'springboot']],
  ['.NET', ['.net', 'dotnet']],
  ['Laravel', ['laravel']],
  ['WordPress', ['wordpress']],
  ['Figma', ['figma']],
  ['Data Structures', ['data structures']],
  ['Algorithms', ['algorithms']],
  ['System Design', ['system design']],
  ['OOP', ['oop', 'object-oriented', 'object oriented']],
  ['Project Management', ['project management']],
  ['Stakeholder Management', ['stakeholder management']],
  ['Leadership', ['leadership']],
  ['Problem Solving', ['problem solving', 'problem-solving']]
];

const ALIAS_TO_CANON = new Map<string, string>();
for (const [canon, aliases] of DICT) {
  ALIAS_TO_CANON.set(canon.toLowerCase(), canon);
  for (const a of aliases) if (!ALIAS_TO_CANON.has(a)) ALIAS_TO_CANON.set(a, canon);
}
// "rest" / "node" etc. are only safe as whole skill-list items, not as free-text matches
const SKILL_ITEM_ONLY = new Set(['rest', 'node', 'express']);

const regexCache = new Map<string, RegExp>();
function termRegex(term: string, flags: string): RegExp {
  const key = term + '|' + flags;
  let r = regexCache.get(key);
  if (!r) {
    const esc = term.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
    r = new RegExp(`(^|[^a-z0-9+#])${esc}(?![a-z0-9+#])`, flags);
    regexCache.set(key, r);
  }
  return r;
}

function variantsOf(canon: string): string[] {
  const entry = DICT.find(d => d[0] === canon);
  const v = new Set<string>([canon.toLowerCase()]);
  if (entry) for (const a of entry[1]) if (!SKILL_ITEM_ONLY.has(a)) v.add(a);
  return Array.from(v);
}

export function canonicalizeSkill(item: string): string {
  const t = item.trim().replace(/\.$/, '');
  const hit = ALIAS_TO_CANON.get(t.toLowerCase());
  if (hit) return hit;
  const letters = t.replace(/[^A-Za-z]/g, '');
  if (letters.length > 1 && t === t.toLowerCase() && /^[a-z0-9 .+#/&-]+$/.test(t)) {
    return t.replace(/(^|[\s/-])([a-z])/g, (_m, a: string, b: string) => a + b.toUpperCase());
  }
  if (letters.length > 4 && letters === letters.toUpperCase()) {
    return t.toLowerCase().replace(/(^|\s)([a-z])/g, (_m, a: string, b: string) => a + b.toUpperCase());
  }
  return t;
}

export function termInText(textLower: string, canon: string): boolean {
  return variantsOf(canon).some(v => termRegex(v, 'i').test(textLower));
}

export function extractJdKeywords(jd: string): string[] {
  const text = jd.toLowerCase();
  if (!text.trim()) return [];
  const scored: { canon: string; count: number }[] = [];
  for (const [canon] of DICT) {
    let count = 0;
    for (const v of variantsOf(canon)) {
      const re = new RegExp(termRegex(v, 'gi').source, 'gi');
      const m = text.match(re);
      if (m) count += m.length;
    }
    if (count > 0) scored.push({ canon, count });
  }
  scored.sort((a, b) => b.count - a.count);
  return scored.map(s => s.canon);
}
