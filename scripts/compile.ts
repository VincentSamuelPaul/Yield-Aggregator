import * as fs from 'fs';
import * as path from 'path';
import solc from 'solc';

const contractsPath = path.resolve(__dirname, '../contracts');
const buildPath = path.resolve(__dirname, '../artifacts');

function compileContracts() {
  const sources: Record<string, { content: string }> = {};

  const files = fs.readdirSync(contractsPath);
  files.forEach(file => {
    if (file.endsWith('.sol')) {
      const filePath = path.join(contractsPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      sources[file] = { content };
    }
  });

  const input = {
    language: 'Solidity',
    sources: sources,
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      }
    }
  };

  console.log('Compiling contracts...');
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors) {
    output.errors.forEach((err: any) => {
      console.error(err.formattedMessage);
    });
    if (output.errors.some((err: any) => err.severity === 'error')) {
      process.exit(1);
    }
  }

  if (!fs.existsSync(buildPath)) {
    fs.mkdirSync(buildPath);
  }

  for (const contractFile in output.contracts) {
    for (const contractName in output.contracts[contractFile]) {
      const artifact = output.contracts[contractFile][contractName];
      fs.writeFileSync(
        path.join(buildPath, `${contractName}.json`),
        JSON.stringify(artifact, null, 2)
      );
      console.log(`Compiled ${contractName}`);
    }
  }
}

compileContracts();
