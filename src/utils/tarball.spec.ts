import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { expect } from 'chai';
import { packSources, getSourceFilePaths, GeneratedContent } from './tarball.js';

describe('tarball utils', () => {
  let tempDir: string;

  beforeEach(async () => {
    // Create a temporary directory for each test
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tarball-test-'));
  });

  afterEach(async () => {
    // Clean up temporary directory after each test
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  async function createTempFile(relativePath: string, content: string | Buffer): Promise<string> {
    const filePath = path.join(tempDir, relativePath);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content);
    return filePath;
  }

  describe('packSources', () => {
    it('creates a tarball from workspace files', async () => {
      // Create some test files
      await createTempFile('file1.txt', 'content 1');
      await createTempFile('file2.ts', 'content 2');
      await createTempFile('nested/file3.js', 'content 3');
      const tarballData = await packSources(tempDir);

      expect(tarballData).to.be.instanceOf(Uint8Array);
      expect(tarballData.length).to.be.greaterThan(0);

      // Create a new temp dir to extract and verify contents
      const extractDir = await fs.mkdtemp(path.join(os.tmpdir(), 'extract-'));
      try {
        // Extract the tarball
        await fs.writeFile(path.join(extractDir, 'archive.tar.gz'), tarballData);
        execSync('tar xzf archive.tar.gz', { cwd: extractDir });

        // Verify contents
        const file1Content = await fs.readFile(path.join(extractDir, 'file1.txt'), 'utf8');
        const file2Content = await fs.readFile(path.join(extractDir, 'file2.ts'), 'utf8');
        const file3Content = await fs.readFile(path.join(extractDir, 'nested/file3.js'), 'utf8');

        expect(file1Content).to.equal('content 1');
        expect(file2Content).to.equal('content 2');
        expect(file3Content).to.equal('content 3');
      } finally {
        await fs.rm(extractDir, { recursive: true, force: true });
      }
    });

    it('includes additional contents in the tarball', async () => {
      await createTempFile('existing.txt', 'existing content');

      const additionalContents: GeneratedContent[] = [
        {
          relativePath: 'extra/generated.txt',
          contents: Buffer.from('generated content')
        }
      ];

      const tarballData = await packSources(tempDir, additionalContents);

      expect(tarballData).to.be.instanceOf(Uint8Array);
      expect(tarballData.length).to.be.greaterThan(0);

      // Extract and verify
      const extractDir = await fs.mkdtemp(path.join(os.tmpdir(), 'extract-'));
      try {
        await fs.writeFile(path.join(extractDir, 'archive.tar.gz'), tarballData);
        execSync('tar xzf archive.tar.gz', { cwd: extractDir });

        const existingContent = await fs.readFile(path.join(extractDir, 'existing.txt'), 'utf8');
        const generatedContent = await fs.readFile(path.join(extractDir, 'extra/generated.txt'), 'utf8');

        expect(existingContent).to.equal('existing content');
        expect(generatedContent).to.equal('generated content');
      } finally {
        await fs.rm(extractDir, { recursive: true, force: true });
      }
    });
  });

  describe('getSourceFilePaths', () => {
    it('gets all files from the directory', async () => {
      await createTempFile('file1.txt', 'content');
      await createTempFile('file2.ts', 'content');
      await createTempFile('nested/file3.js', 'content');

      const result = await getSourceFilePaths(tempDir);

      expect(result).to.have.lengthOf(3);
      expect(result).to.include(path.join(tempDir, 'file1.txt'));
      expect(result).to.include(path.join(tempDir, 'file2.ts'));
      expect(result).to.include(path.join(tempDir, 'nested/file3.js'));
    });

    it('handles nested directories', async () => {
      await createTempFile('dir1/file1.txt', 'content');
      await createTempFile('dir1/subdir/file2.txt', 'content');
      await createTempFile('file3.txt', 'content');

      const result = await getSourceFilePaths(tempDir);

      expect(result).to.have.lengthOf(3);
      expect(result).to.include(path.join(tempDir, 'dir1/file1.txt'));
      expect(result).to.include(path.join(tempDir, 'dir1/subdir/file2.txt'));
      expect(result).to.include(path.join(tempDir, 'file3.txt'));
    });
  });
});
