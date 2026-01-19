import { config } from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { TavilySearch } from '@langchain/tavily';

config();

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
}

const results: TestResult[] = [];

async function testOpenAI(): Promise<TestResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.startsWith('your-')) {
    return { name: 'OpenAI', status: 'skip', message: 'No API key set' };
  }

  try {
    const llm = new ChatOpenAI({ model: 'gpt-4o-mini', apiKey: key, maxRetries: 1 });
    await llm.invoke('Say "test"');
    return { name: 'OpenAI', status: 'pass', message: 'API key is valid' };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { name: 'OpenAI', status: 'fail', message: `Error: ${msg}` };
  }
}

async function testAnthropic(): Promise<TestResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key.startsWith('your-')) {
    return { name: 'Anthropic', status: 'skip', message: 'No API key set' };
  }

  try {
    const llm = new ChatAnthropic({ model: 'claude-3-haiku-20240307', apiKey: key, maxRetries: 1 });
    await llm.invoke('Say "test"');
    return { name: 'Anthropic', status: 'pass', message: 'API key is valid' };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { name: 'Anthropic', status: 'fail', message: `Error: ${msg}` };
  }
}

async function testGoogle(): Promise<TestResult> {
  const key = process.env.GOOGLE_API_KEY;
  if (!key || key.startsWith('your-')) {
    return { name: 'Google', status: 'skip', message: 'No API key set' };
  }

  try {
    const llm = new ChatGoogleGenerativeAI({ model: 'gemini-3-flash-preview', apiKey: key });
    await llm.invoke('Say "test"');
    return { name: 'Google', status: 'pass', message: 'API key is valid' };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { name: 'Google', status: 'fail', message: `Error: ${msg}` };
  }
}

async function testXAI(): Promise<TestResult> {
  const key = process.env.XAI_API_KEY;
  if (!key || key.startsWith('your-')) {
    return { name: 'xAI', status: 'skip', message: 'No API key set' };
  }

  try {
    const llm = new ChatOpenAI({
      model: 'grok-3',
      apiKey: key,
      configuration: { baseURL: 'https://api.x.ai/v1' },
      maxRetries: 1,
    });
    await llm.invoke('Say "test"');
    return { name: 'xAI', status: 'pass', message: 'API key is valid' };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { name: 'xAI', status: 'fail', message: `Error: ${msg}` };
  }
}

async function testFinancialDatasets(): Promise<TestResult> {
  const key = process.env.FINANCIAL_DATASETS_API_KEY;
  if (!key || key.startsWith('your-')) {
    return { name: 'Financial Datasets', status: 'skip', message: 'No API key set' };
  }

  try {
    const url = new URL('https://api.financialdatasets.ai/prices/snapshot/');
    url.searchParams.append('ticker', 'AAPL');
    const response = await fetch(url.toString(), {
      headers: { 'x-api-key': key },
    });
    if (response.ok) {
      return { name: 'Financial Datasets', status: 'pass', message: 'API key is valid' };
    } else {
      return {
        name: 'Financial Datasets',
        status: 'fail',
        message: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { name: 'Financial Datasets', status: 'fail', message: `Error: ${msg}` };
  }
}

async function testTavily(): Promise<TestResult> {
  const key = process.env.TAVILY_API_KEY;
  if (!key || key.startsWith('your-')) {
    return { name: 'Tavily', status: 'skip', message: 'No API key set' };
  }

  try {
    const search = new TavilySearch({ apiKey: key, maxResults: 1 });
    await search.invoke({ query: 'test' });
    return { name: 'Tavily', status: 'pass', message: 'API key is valid' };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return { name: 'Tavily', status: 'fail', message: `Error: ${msg}` };
  }
}

async function main() {
  console.log('Verifying API keys...\n');

  results.push(await testOpenAI());
  results.push(await testAnthropic());
  results.push(await testGoogle());
  results.push(await testXAI());
  results.push(await testFinancialDatasets());
  results.push(await testTavily());

  console.log('Results:\n');
  for (const result of results) {
    const icon = result.status === 'pass' ? '✓' : result.status === 'fail' ? '✗' : '○';
    const color = result.status === 'pass' ? '\x1b[32m' : result.status === 'fail' ? '\x1b[31m' : '\x1b[33m';
    const reset = '\x1b[0m';
    console.log(`${color}${icon}${reset} ${result.name.padEnd(20)} ${result.message}`);
  }

  const failed = results.filter((r) => r.status === 'fail');
  const passed = results.filter((r) => r.status === 'pass');
  const skipped = results.filter((r) => r.status === 'skip');

  console.log(`\nSummary: ${passed.length} passed, ${failed.length} failed, ${skipped.length} skipped`);

  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
