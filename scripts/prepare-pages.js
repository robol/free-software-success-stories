import { mkdir, copyFile, readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');
const distDir = resolve(root, 'dist');
const indexFile = resolve(root, 'index.html');
const outputFile = resolve(distDir, 'index.html');

async function ensureDist() {
	await mkdir(distDir, { recursive: true });
}

async function copyPresentationImages() {
	const topLevelFiles = await readdir(root, { withFileTypes: true });
	const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico'];

	for (const file of topLevelFiles) {
		if (!file.isFile()) continue;
		if (imageExtensions.some((imageExt) => file.name.toLowerCase().endsWith(imageExt))) {
			await copyFile(resolve(root, file.name), resolve(distDir, file.name));
		}
	}
}

async function rewriteIndex() {
	const html = await readFile(indexFile, 'utf8');
	const rewritten = html.replace(/(href|src)="dist\/([^\"]+)"/g, '$1="$2"');
	await writeFile(outputFile, rewritten, 'utf8');
}

async function main() {
	await ensureDist();
	await rewriteIndex();
	await copyPresentationImages();
	console.log('Prepared dist/index.html and copied top-level presentation assets.');
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
