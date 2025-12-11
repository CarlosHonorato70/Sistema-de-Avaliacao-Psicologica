/**
 * Environment Variable Validation
 * 
 * Validates that all required environment variables are set before
 * the application starts. This prevents runtime errors due to missing
 * configuration.
 */

interface EnvConfig {
  name: string;
  required: boolean;
  description: string;
  validator?: (value: string) => boolean;
}

const ENV_CONFIGS: EnvConfig[] = [
  // Optional database configuration
  {
    name: "DATABASE_PATH",
    required: false,
    description: "SQLite database file path (defaults to ./data/database.sqlite)",
    validator: (value) => value.length > 0,
  },
  {
    name: "SESSION_SECRET",
    required: true,
    description: "Secret key for session encryption (min 32 characters)",
    validator: (value) => value.length >= 32,
  },
  {
    name: "JWT_SECRET",
    required: true,
    description: "Secret key for JWT signing (min 32 characters)",
    validator: (value) => value.length >= 32,
  },
  {
    name: "NODE_ENV",
    required: true,
    description: "Node environment (development, staging, production)",
    validator: (value) => ["development", "staging", "production"].includes(value),
  },
  
  // Optional but recommended
  {
    name: "PORT",
    required: false,
    description: "Server port number",
    validator: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0,
  },
  {
    name: "APP_URL",
    required: false,
    description: "Application URL for email links",
  },
  
  // Optional features
  {
    name: "SENDGRID_API_KEY",
    required: false,
    description: "SendGrid API key for email sending",
  },
  {
    name: "SMTP_HOST",
    required: false,
    description: "SMTP server hostname",
  },
  {
    name: "AWS_ACCESS_KEY_ID",
    required: false,
    description: "AWS access key for S3 storage",
  },
  {
    name: "OPENAI_API_KEY",
    required: false,
    description: "OpenAI API key for AI analysis",
  },
  {
    name: "SENTRY_DSN",
    required: false,
    description: "Sentry DSN for error tracking",
  },
];

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const config of ENV_CONFIGS) {
    const value = process.env[config.name];

    // Check if required variable is missing
    if (config.required && !value) {
      errors.push(
        `❌ Missing required environment variable: ${config.name}\n   Description: ${config.description}`
      );
      continue;
    }

    // Check if optional variable is missing
    if (!config.required && !value) {
      warnings.push(
        `⚠️  Optional environment variable not set: ${config.name}\n   Description: ${config.description}`
      );
      continue;
    }

    // Validate value if validator provided
    if (value && config.validator && !config.validator(value)) {
      errors.push(
        `❌ Invalid value for ${config.name}\n   Description: ${config.description}\n   Current value: ${value.substring(0, 20)}...`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function printValidationResults(results: ValidationResult): void {
  console.log("\n🔍 Environment Variable Validation\n");
  console.log("=".repeat(60));

  if (results.errors.length > 0) {
    console.log("\n❌ ERRORS (application will not start):\n");
    results.errors.forEach((error) => console.log(error + "\n"));
  }

  if (results.warnings.length > 0) {
    console.log("\n⚠️  WARNINGS (optional features may not work):\n");
    results.warnings.forEach((warning) => console.log(warning + "\n"));
  }

  if (results.valid && results.warnings.length === 0) {
    console.log("\n✅ All environment variables validated successfully!\n");
  } else if (results.valid) {
    console.log("\n✅ Required environment variables validated successfully!\n");
  }

  console.log("=".repeat(60) + "\n");
}

export function ensureValidEnvironment(): void {
  const results = validateEnvironment();
  printValidationResults(results);

  if (!results.valid) {
    console.error("❌ Environment validation failed. Please fix the errors above.\n");
    console.error("💡 Tip: Copy .env.example to .env and fill in the required values.\n");
    process.exit(1);
  }
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig() {
  const env = process.env.NODE_ENV || "development";
  
  return {
    isDevelopment: env === "development",
    isStaging: env === "staging",
    isProduction: env === "production",
    enableDebugLogs: env === "development",
    enableSourceMaps: env !== "production",
    enableCaching: env === "production",
    logLevel: process.env.LOG_LEVEL || (env === "production" ? "info" : "debug"),
  };
}
