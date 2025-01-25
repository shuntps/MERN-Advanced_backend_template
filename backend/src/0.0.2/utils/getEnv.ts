import 'dotenv/config';

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;

  if (value === undefined) {
    throw Error(
      `The environment variable '${key}' is not defined. Please add it to your .env file.`
    );
  }

  return value;
};

export default getEnv;
