const production = process.argv.includes("--production");
const turnstile = process.env.TURNSTILE_SITE_KEY?.trim() || "";
const phone = process.env.MOBILE_PHONE_DISPLAY?.trim() || "";
const ga = process.env.GA_MEASUREMENT_ID?.trim() || "";
const retention = process.env.GA_DATA_RETENTION?.trim() || "";
const errors = [];

if (production && (!turnstile || turnstile === "1x00000000000000000000AA" || /replace|placeholder/i.test(turnstile))) errors.push("TURNSTILE_SITE_KEY deve contenere la site key pubblica di produzione.");
if (production && !/^\+?[\d\s().-]{6,}$/.test(phone)) errors.push("MOBILE_PHONE_DISPLAY deve contenere il recapito pubblico.");
if (ga && !/^G-[A-Z0-9]{6,}$/.test(ga)) errors.push("GA_MEASUREMENT_ID non è un identificatore GA4 valido.");
if (ga && !retention) errors.push("GA_DATA_RETENTION è obbligatorio quando Google Analytics è attivo.");
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(ga ? "Variabili pubbliche validate, inclusa la configurazione GA4." : "Variabili pubbliche validate; GA4 resterà disattivato.");
