const PATTERNS = [
  {
    name: "OpenAI API Key",
    pattern: /\b(sk-[a-zA-Z0-9]{32,})\b/g,
    maskGroup: 1,
  },
  {
    name: "Anthropic API Key",
    pattern: /\b(sk-ant-api[0-3]{2}-[a-zA-Z0-9_-]{32,})\b/g,
    maskGroup: 1,
  },
  {
    name: "GitHub Token (classic)",
    pattern: /\b(ghp_[a-zA-Z0-9]{36})\b/g,
    maskGroup: 1,
  },
  {
    name: "GitHub Token (fine-grained)",
    pattern: /\b(github_pat_[a-zA-Z0-9_]{36,})\b/g,
    maskGroup: 1,
  },
  {
    name: "Stripe Secret Key",
    pattern: /\b(sk_live_[a-zA-Z0-9]{24,})\b/g,
    maskGroup: 1,
  },
  {
    name: "Stripe Restricted Key",
    pattern: /\b(rk_live_[a-zA-Z0-9]{24,})\b/g,
    maskGroup: 1,
  },
  {
    name: "AWS Access Key",
    pattern: /\b(AKIA[0-9A-Z]{16})\b/g,
    maskGroup: 1,
  },
  {
    name: "AWS Secret Key",
    pattern: /\b([A-Za-z0-9+/]{40})\b/g,
    maskGroup: 1,
  },
  {
    name: "Google API Key",
    pattern: /\b(AIza[0-9A-Za-z_-]{35})\b/g,
    maskGroup: 1,
  },
  {
    name: "JWT Token",
    pattern: /\b(eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})\b/g,
    maskGroup: 1,
  },
  {
    name: "Private Key Block",
    pattern: /(-----BEGIN (RSA |EC )?PRIVATE KEY-----[a-zA-Z0-9/\n+=\s]+-----END (RSA |EC )?PRIVATE KEY-----)/g,
    maskGroup: 1,
  },
  {
    name: "Generic Bearer Token",
    pattern: /\b(Bearer\s+[a-zA-Z0-9._-]{20,})\b/gi,
    maskGroup: 1,
  },
  {
    name: "Slack Bot Token",
    pattern: /\b(xox[baprs]-[a-zA-Z0-9-]{10,})\b/g,
    maskGroup: 1,
  },
  {
    name: "Twilio Auth Token",
    pattern: /\b(SK[a-f0-9]{32})\b/g,
    maskGroup: 1,
  },
  {
    name: "Generic Secret in Assignment",
    pattern: /\b(API_?KEY|SECRET_?KEY|ACCESS_?KEY|AUTH_?TOKEN|PRIVATE_?KEY)\s*[:=]\s*['"]?([a-zA-Z0-9._-]{20,})['"]?/g,
    maskGroup: 2,
  },
  {
    name: "Database Connection String",
    pattern: /\b((?:postgres|mysql|mongodb|redis|sqlite)(?:\+[a-z]+)?:\/\/[^:]+:[^@]+@[^\s]+)\b/gi,
    maskGroup: 1,
  },
  {
    name: ".env Variable Assignment",
    pattern: /^([A-Z_]{3,})=['"]?(.+?)['"]?$/gm,
    maskGroup: 2,
    condition: (match) => {
      const key = match[1];
      const value = match[2];
      const sensitiveKeys = [
        "KEY", "SECRET", "TOKEN", "PASSWORD", "PASSWD", "PWD",
        "CREDENTIAL", "AUTH", "PRIVATE", "DATABASE_URL", "DB_URL",
      ];
      return sensitiveKeys.some((k) => key.includes(k));
    },
  },
];
